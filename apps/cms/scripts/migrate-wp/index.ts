/**
 * WordPress → Payload import.
 *
 *   pnpm migrate:wp                         # everything, into local D1 (.wrangler)
 *   pnpm migrate:wp --steps=posts --limit=50
 *   pnpm migrate:wp --since=2026-11-01      # delta: posts changed since a date (upsert)
 *   pnpm migrate:wp --steps=files           # check every media file in R2, upload missing ones
 *   PAYLOAD_REMOTE=1 pnpm migrate:wp …      # write straight to the Cloudflare D1/R2
 *
 * Steps run in dependency order: users → categories → tags → media → posts →
 * pages → counts (→ files, only when asked). Re-running is safe: existing ids
 * are skipped (or updated with --update / --since), and paging progress is
 * saved in .migrate/state.json.
 *
 * WordPress ids are kept as Payload ids, so /{category}/{id} URLs, tag pages
 * and media references survive unchanged.
 */
import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { randomBytes } from 'node:crypto'
import { getPayload, type Payload } from 'payload'
import { editorConfigFactory } from '@payloadcms/richtext-lexical'
import { sql } from '@payloadcms/db-d1-sqlite'
import { WordPress, type WPMedia, type WPPost, type WPTerm, type WPUser } from './wp'
import { htmlToLexical, type MediaIndex } from './html-to-lexical'
import { cleanExcerpt, decodeEntities, decodeSlug, gmt, looksLikeRealName, stripHtml } from './text'
import { copyFiles } from './files'
import { lexicalToHTML, type MediaLite } from '../../src/lib/lexical-html'
import { articleEditor } from '../../src/lib/editor'
import { CATEGORY_COPY, NOINDEX_CATEGORY_SLUGS } from '../../../web/src/lib/categories'

process.env.PAYLOAD_SCRIPT = '1'

// ---------- options ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=')
    return [k, v ?? 'true']
  }),
)
const ALL_STEPS = ['users', 'categories', 'tags', 'media', 'posts', 'pages', 'counts'] as const
const steps = new Set((args.steps ?? ALL_STEPS.join(',')).split(','))
const LIMIT = args.limit ? Number(args.limit) : Infinity
const SINCE = args.since ? new Date(args.since).toISOString() : undefined
const UPDATE = args.update === 'true' || Boolean(SINCE)
const CONCURRENCY = Number(args.concurrency ?? 6)
const RANKMATH = args.rankmath !== 'false'
const KEEP_VERSIONS = args['keep-versions'] === 'true'
const WP_URL = args.wp ?? process.env.WP_URL ?? 'https://www.agrinewsthai.com'

const WORK_DIR = path.resolve(import.meta.dirname, '../../.migrate')
const STATE_FILE = path.join(WORK_DIR, 'state.json')
fs.mkdirSync(WORK_DIR, { recursive: true })

type State = Record<string, { page?: number; done?: boolean }>
const state: State = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {}
const saveState = () => fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2))
// A filtered or partial run must not move the saved page cursor.
const trackPages = !SINCE && LIMIT === Infinity && args.restart !== 'true'
if (args.restart === 'true') for (const k of Object.keys(state)) delete state[k]

const ctx = { disableRevalidate: true, disableTagCounts: true, skipContentHtml: true }
const log = (...m: unknown[]) => console.log(new Date().toISOString().slice(11, 19), ...m)

async function pool<T>(items: T[], n: number, fn: (item: T) => Promise<void>) {
  let i = 0
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) await fn(items[i++])
    }),
  )
}

async function existingIds(payload: Payload, collection: 'users' | 'categories' | 'tags' | 'media' | 'posts' | 'pages') {
  const ids = new Set<number>()
  let page = 1
  for (;;) {
    const res = await payload.find({ collection, limit: 2000, page, depth: 0, select: {}, pagination: true, overrideAccess: true, draft: false })
    res.docs.forEach((d) => ids.add(d.id as number))
    if (!res.hasNextPage) return ids
    page++
  }
}

// ---------- steps ----------
async function migrateUsers(payload: Payload, wp: WordPress) {
  const have = await existingIds(payload, 'users')
  const credentials: string[] = []
  const params = wp.authenticated ? { context: 'edit' } : {}
  for await (const { items } of wp.pages<WPUser>('/users', params)) {
    for (const u of items) {
      if (have.has(u.id) && !UPDATE) continue
      const role = u.roles?.includes('administrator') || (!u.roles && u.id === 1) ? 'admin' : u.roles?.includes('editor') || !u.roles ? 'editor' : 'author'
      const data = {
        name: decodeEntities(u.name),
        slug: decodeSlug(u.slug),
        bio: u.description || undefined,
        role,
        showByline: looksLikeRealName(u.name),
        wpId: u.id,
      }
      if (have.has(u.id)) {
        await payload.update({ collection: 'users', id: u.id, data: data as never, overrideAccess: true, context: ctx })
        continue
      }
      const password = randomBytes(12).toString('base64url')
      const email = u.email || `${decodeSlug(u.slug)}@users.agrinewsthai.invalid`
      await payload.create({ collection: 'users', data: { id: u.id, email, password, ...data } as never, overrideAccess: true, context: ctx })
      credentials.push(`${email}\t${password}\t${role}`)
      log(`user ${u.id} ${u.name} (${role})`)
    }
  }
  if (credentials.length) {
    const file = path.join(WORK_DIR, 'credentials.tsv')
    fs.appendFileSync(file, credentials.join('\n') + '\n')
    log(`temporary passwords → ${file} (change them after first login)`)
  }
}

const MENU_ORDER = ['news', 'domestic-animal', 'soil-and-water', 'large-farm', 'economic-crops', 'agriculture-special', 'did-you-know', 'agricultural-technology', 'folk-wisdom', 'column']

async function migrateCategories(payload: Payload, wp: WordPress) {
  const have = await existingIds(payload, 'categories')
  const all: WPTerm[] = []
  for await (const { items } of wp.pages<WPTerm>('/categories', { hide_empty: 'false' })) all.push(...items)
  // Parents first so the relation exists.
  all.sort((a, b) => (a.parent ? 1 : 0) - (b.parent ? 1 : 0))
  for (const c of all) {
    const slug = decodeSlug(c.slug)
    const copy = CATEGORY_COPY[slug]
    const order = MENU_ORDER.indexOf(slug)
    const hidden = NOINDEX_CATEGORY_SLUGS.has(slug)
    const data = {
      name: decodeEntities(c.name),
      slug,
      description: copy?.description ?? (c.description || undefined),
      parent: c.parent || undefined,
      order: order === -1 ? 100 : order + 1,
      showInMenu: order !== -1,
      noindex: hidden,
      wpId: c.id,
      meta: copy ? { title: copy.title, description: copy.description } : undefined,
    }
    if (have.has(c.id)) {
      if (UPDATE) await payload.update({ collection: 'categories', id: c.id, data: data as never, overrideAccess: true, context: ctx })
      continue
    }
    await payload.create({ collection: 'categories', data: { id: c.id, ...data } as never, overrideAccess: true, context: ctx })
    log(`category ${c.id} ${slug}`)
  }
}

async function migrateTags(payload: Payload, wp: WordPress) {
  const have = await existingIds(payload, 'tags')
  const key = 'tags'
  let n = 0
  for await (const { items, page, totalPages, total } of wp.pages<WPTerm>('/tags', { hide_empty: 'false' }, trackPages ? (state[key]?.page ?? 0) + 1 : 1)) {
    for (const t of items) {
      if (have.has(t.id)) continue
      await payload.db.create({
        collection: 'tags',
        data: {
          id: t.id,
          name: decodeEntities(t.name),
          slug: decodeSlug(t.slug),
          description: t.description || null,
          postCount: t.count,
          wpId: t.id,
        },
      })
      n++
    }
    if (trackPages) {
      state[key] = { page }
      saveState()
    }
    if (page % 20 === 0 || page === totalPages) log(`tags page ${page}/${totalPages} (+${n}, ${total} in WordPress)`)
  }
}

function mediaData(m: WPMedia) {
  let rel = m.media_details?.file
  if (!rel) {
    try {
      rel = decodeURIComponent(new URL(m.source_url).pathname).split('/wp-content/uploads/')[1]
    } catch {
      rel = undefined
    }
  }
  rel = rel || `${new Date(gmt(m.date_gmt)!).getUTCFullYear()}/${path.basename(m.source_url)}`
  const dir = path.posix.dirname(rel)
  return {
    id: m.id,
    filename: path.posix.basename(rel),
    prefix: dir && dir !== '.' ? dir : null,
    mimeType: m.mime_type,
    filesize: m.media_details?.filesize ?? null,
    width: m.media_details?.width ?? null,
    height: m.media_details?.height ?? null,
    alt: m.alt_text || null,
    caption: stripHtml(m.caption?.rendered ?? '') || null,
    wpId: m.id,
    createdAt: gmt(m.date_gmt),
    updatedAt: gmt(m.modified_gmt),
  }
}

async function migrateMedia(payload: Payload, wp: WordPress) {
  const have = await existingIds(payload, 'media')
  const key = 'media'
  let n = 0
  const params = {
    _fields: 'id,date_gmt,modified_gmt,caption,alt_text,mime_type,source_url,media_details,author',
    ...(SINCE ? { modified_after: SINCE } : {}),
  }
  for await (const { items, page, totalPages, total } of wp.pages<WPMedia>('/media', params, trackPages ? (state[key]?.page ?? 0) + 1 : 1)) {
    for (const m of items) {
      if (have.has(m.id)) continue
      try {
        await payload.db.create({ collection: 'media', data: mediaData(m) })
        n++
      } catch (err) {
        log(`media ${m.id} skipped: ${(err as Error).message.split('\n')[0]}`)
      }
    }
    if (trackPages) {
      state[key] = { page }
      saveState()
    }
    if (page % 20 === 0 || page === totalPages) log(`media page ${page}/${totalPages} (+${n}, ${total} in WordPress)`)
  }
}

async function loadMediaIndex(payload: Payload): Promise<MediaIndex> {
  const byId = new Map<number, MediaLite>()
  const byPath = new Map<string, number>()
  let page = 1
  for (;;) {
    const res = await payload.find({
      collection: 'media',
      limit: 5000,
      page,
      depth: 0,
      overrideAccess: true,
      select: { filename: true, prefix: true, alt: true, width: true, height: true },
    })
    for (const m of res.docs as unknown as MediaLite[]) {
      byId.set(m.id, m)
      if (m.filename) byPath.set([m.prefix, m.filename].filter(Boolean).join('/'), m.id)
    }
    if (!res.hasNextPage) break
    page++
  }
  log(`media index: ${byId.size} items`)
  return { byId, byPath }
}

/** Rank Math values from its headless endpoint; only what differs from the defaults. */
async function rankMath(wp: WordPress, link: string, title: string) {
  if (!RANKMATH) return {}
  try {
    const res = await wp.fetch(`${wp.base}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(link)}`, 3)
    if (!res.ok) return {}
    const { head } = (await res.json()) as { head?: string }
    if (!head) return {}
    const pick = (re: RegExp) => {
      const m = head.match(re)
      return m ? decodeEntities(m[1]).trim() : undefined
    }
    const metaTitle = pick(/<title>([\s\S]*?)<\/title>/)
    const description = pick(/<meta name="description" content="([^"]*)"/)
    const robots = pick(/<meta name="robots" content="([^"]*)"/) ?? ''
    const canonical = pick(/<link rel="canonical" href="([^"]*)"/)
    const ogImage = pick(/<meta property="og:image" content="([^"]*)"/)
    return {
      title: metaTitle && !metaTitle.startsWith(title) ? metaTitle : undefined,
      description,
      noindex: /noindex/.test(robots),
      nofollow: /nofollow/.test(robots),
      canonical: canonical && canonical.replace(/\/$/, '') !== link.replace(/\/$/, '') ? canonical : undefined,
      ogImage,
    }
  } catch {
    return {}
  }
}

const WP_STATUS: Record<string, 'published' | 'draft'> = { publish: 'published', future: 'published', draft: 'draft', pending: 'draft', private: 'draft' }

async function migrateContent(
  payload: Payload,
  wp: WordPress,
  kind: 'posts' | 'pages',
  media: MediaIndex,
  editorConfig: Awaited<ReturnType<typeof editorConfigFactory.fromEditor>>,
) {
  const have = await existingIds(payload, kind)
  const tags = kind === 'posts' ? await existingIds(payload, 'tags') : new Set<number>()
  const cats = kind === 'posts' ? await existingIds(payload, 'categories') : new Set<number>()
  const users = await existingIds(payload, 'users')
  const key = kind
  const report = fs.createWriteStream(path.join(WORK_DIR, `${kind}-warnings.log`), { flags: 'a' })
  let created = 0
  let updated = 0
  let failed = 0
  let seen = 0

  const params: Record<string, string> = {
    _fields: 'id,date_gmt,modified_gmt,slug,status,link,title,content,excerpt,author,featured_media,categories,tags,sticky,format',
    ...(wp.authenticated ? { status: 'publish,future,draft,pending,private', context: 'edit' } : {}),
    ...(SINCE ? { modified_after: SINCE } : {}),
  }

  const one = async (p: WPPost) => {
    const exists = have.has(p.id)
    if (exists && !UPDATE) return
    try {
      const title = decodeEntities(p.title.rendered).trim() || `(ไม่มีชื่อ ${p.id})`
      const { state: content, mediaIds, warnings } = htmlToLexical(p.content.rendered ?? '', { editorConfig, media })
      warnings.forEach((w) => report.write(`${p.id}\t${w}\n`))
      const lookup = new Map<number, MediaLite>(mediaIds.map((id) => [id, media.byId.get(id)!]))
      const seo = await rankMath(wp, p.link, title)
      const featured = p.featured_media && media.byId.has(p.featured_media) ? p.featured_media : undefined
      const categories = (p.categories ?? []).filter((c) => cats.has(c))
      const primary = categories.find((c) => c !== 13) ?? categories[0]
      const excerpt = cleanExcerpt(p.excerpt?.raw || p.excerpt?.rendered || '')
      const data = {
        title,
        slug: decodeSlug(p.slug),
        content,
        contentHtml: lexicalToHTML(content as never, lookup),
        excerpt: excerpt || undefined,
        featuredImage: featured,
        publishedAt: gmt(p.date_gmt),
        author: users.has(p.author) ? p.author : undefined,
        ...(kind === 'posts'
          ? {
              categories: categories.length ? categories : [1],
              primaryCategory: primary ?? 1,
              tags: (p.tags ?? []).filter((t) => tags.has(t)),
              sticky: Boolean(p.sticky),
              format: p.format === 'video' || p.format === 'gallery' ? p.format : 'standard',
              wpLink: p.link,
              legacyHtml: p.content.rendered,
            }
          : {}),
        wpId: p.id,
        _status: WP_STATUS[p.status] ?? 'draft',
        meta: {
          title: seo.title,
          description: seo.description,
          canonical: seo.canonical,
          noindex: seo.noindex ?? false,
          nofollow: seo.nofollow ?? false,
        },
        createdAt: gmt(p.date_gmt),
      }
      if (exists) {
        await payload.update({ collection: kind, id: p.id, data: data as never, overrideAccess: true, context: ctx })
        updated++
      } else {
        await payload.create({ collection: kind, data: { id: p.id, ...data } as never, overrideAccess: true, context: ctx })
        // Keep WordPress's timestamps (the import is not an edit).
        await payload.db.updateOne({ collection: kind, id: p.id, data: { updatedAt: gmt(p.modified_gmt), createdAt: gmt(p.date_gmt) } })
        created++
      }
    } catch (err) {
      failed++
      const msg = (err as Error).message.split('\n')[0]
      report.write(`${p.id}\tFAILED\t${msg}\n`)
      log(`${kind} ${p.id} failed: ${msg}`)
    }
  }

  for await (const { items, page, totalPages, total } of wp.pages<WPPost>(`/${kind}`, params, trackPages ? (state[key]?.page ?? 0) + 1 : 1)) {
    const batch = items.slice(0, Math.max(0, LIMIT - seen))
    seen += batch.length
    await pool(batch, CONCURRENCY, one)
    if (trackPages) {
      state[key] = { page }
      saveState()
    }
    log(`${kind} page ${page}/${totalPages} — created ${created}, updated ${updated}, failed ${failed} (of ${total})`)
    if (seen >= LIMIT) break
  }
  report.end()

  if (!KEEP_VERSIONS && created) {
    // Each create also wrote a version row with a full copy of the story;
    // imported stories have no edit history worth keeping, so drop them.
    const versions = kind === 'posts' ? '_posts_v' : '_pages_v'
    await payload.db.drizzle.run(
      sql.raw(`DELETE FROM ${versions} WHERE parent_id IN (SELECT id FROM ${kind} WHERE wp_id IS NOT NULL)
               AND parent_id IN (SELECT parent_id FROM ${versions} GROUP BY parent_id HAVING COUNT(*) = 1)`),
    )
    log(`${kind}: dropped import-time version copies`)
  }
}

async function recountTags(payload: Payload) {
  await payload.db.drizzle.run(
    sql.raw(`UPDATE tags SET post_count = (
       SELECT COUNT(*) FROM posts_rels r JOIN posts p ON p.id = r.parent_id
       WHERE r.path = 'tags' AND r.tags_id = tags.id AND p._status = 'published')`),
  )
  log('tag post counts recalculated')
}

// ---------- run ----------
const wp = new WordPress(WP_URL, { user: process.env.WP_USER ?? '', password: process.env.WP_APP_PASSWORD ?? '' })
log(`WordPress ${WP_URL}${wp.authenticated ? ' (authenticated: drafts included)' : ' (public API: published content only)'}`)

const dbSteps = [...steps].filter((s) => s !== 'files')
if (dbSteps.length) {
  const { default: config } = await import('../../src/payload.config')
  const payload = await getPayload({ config })
  log(`target: ${process.env.PAYLOAD_REMOTE === '1' ? 'Cloudflare (remote D1/R2)' : 'local D1 (.wrangler)'}; steps: ${dbSteps.join(', ')}`)

  if (steps.has('users')) await migrateUsers(payload, wp)
  if (steps.has('categories')) await migrateCategories(payload, wp)
  if (steps.has('tags')) await migrateTags(payload, wp)
  if (steps.has('media')) await migrateMedia(payload, wp)
  if (steps.has('posts') || steps.has('pages')) {
    const media = await loadMediaIndex(payload)
    const editorConfig = await editorConfigFactory.fromEditor({ config: payload.config, editor: articleEditor })
    if (steps.has('posts')) await migrateContent(payload, wp, 'posts', media, editorConfig)
    if (steps.has('pages')) await migrateContent(payload, wp, 'pages', media, editorConfig)
  }
  if (steps.has('counts') || steps.has('posts')) await recountTags(payload)
}

// Files go to the real R2 bucket (not the local database), see files.ts.
if (steps.has('files')) {
  await copyFiles(wp, {
    concurrency: Number(args['file-concurrency'] ?? 16),
    workDir: WORK_DIR,
    local: args['local-r2'] === 'true',
    since: SINCE,
  })
}

log('done')
process.exit(0)
