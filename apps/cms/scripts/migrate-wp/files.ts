import fs from 'node:fs'
import path from 'node:path'
import type { Payload } from 'payload'

/**
 * Copy every media file from wp-content/uploads into R2 at the same path
 * (uploads/{yyyy}/{mm}/{file}). Originals only: resized versions are made
 * on the fly by Cloudflare Images.
 *
 * Two ways to reach R2:
 *  - S3 API, when R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY /
 *    R2_BUCKET are set (fastest for the full 100k-file copy);
 *  - otherwise the Worker binding from wrangler (local R2, or the real bucket
 *    with PAYLOAD_REMOTE=1).
 * Copied ids are logged to .migrate/files-done.txt so re-runs skip them.
 */
type Put = (key: string, body: ArrayBuffer, contentType: string) => Promise<void>
type Exists = (key: string) => Promise<boolean>

async function r2Client(): Promise<{ put: Put; exists: Exists; label: string }> {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET } = process.env
  if (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET) {
    const { S3Client, PutObjectCommand, HeadObjectCommand } = await import('@aws-sdk/client-s3')
    const s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
    })
    return {
      label: `R2 bucket ${R2_BUCKET} (S3 API)`,
      put: async (Key, body, ContentType) => {
        await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key, Body: new Uint8Array(body), ContentType, CacheControl: 'public, max-age=31536000, immutable' }))
      },
      exists: async (Key) => {
        try {
          await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key }))
          return true
        } catch {
          return false
        }
      },
    }
  }
  const { cloudflare } = await import('../../src/payload.config')
  const bucket = cloudflare.env.R2 as unknown as {
    put: (k: string, v: ArrayBuffer, o: object) => Promise<unknown>
    head: (k: string) => Promise<unknown>
  }
  return {
    label: process.env.PAYLOAD_REMOTE === '1' ? 'R2 binding (remote)' : 'R2 binding (local .wrangler)',
    put: async (key, body, contentType) => {
      await bucket.put(key, body, { httpMetadata: { contentType, cacheControl: 'public, max-age=31536000, immutable' } })
    },
    exists: async (key) => Boolean(await bucket.head(key)),
  }
}

export async function copyFiles(payload: Payload, opts: { wpBase: string; concurrency: number; workDir: string }) {
  const r2 = await r2Client()
  const doneFile = path.join(opts.workDir, 'files-done.txt')
  const failFile = path.join(opts.workDir, 'files-failed.tsv')
  const done = new Set(fs.existsSync(doneFile) ? fs.readFileSync(doneFile, 'utf8').split('\n').filter(Boolean).map(Number) : [])
  const doneOut = fs.createWriteStream(doneFile, { flags: 'a' })
  const failOut = fs.createWriteStream(failFile, { flags: 'a' })
  console.log(`files → ${r2.label}; ${done.size} already copied`)

  let page = 1
  let copied = 0
  let failed = 0
  let bytes = 0
  const started = Date.now()
  for (;;) {
    const res = await payload.find({
      collection: 'media',
      limit: 500,
      page,
      depth: 0,
      sort: 'id',
      overrideAccess: true,
      select: { filename: true, prefix: true, mimeType: true },
    })
    const todo = res.docs.filter((d) => !done.has(d.id as number))
    let i = 0
    await Promise.all(
      Array.from({ length: Math.min(opts.concurrency, todo.length) }, async () => {
        while (i < todo.length) {
          const m = todo[i++] as { id: number; filename: string; prefix?: string; mimeType?: string }
          const key = [m.prefix, m.filename].filter(Boolean).join('/')
          try {
            if (!(await r2.exists(key))) {
              const rel = key.replace(/^uploads\//, '')
              const url = `${opts.wpBase}/wp-content/uploads/${rel.split('/').map(encodeURIComponent).join('/')}`
              const r = await fetch(url)
              if (!r.ok) throw new Error(`${r.status} ${url}`)
              const body = await r.arrayBuffer()
              await r2.put(key, body, m.mimeType || r.headers.get('content-type') || 'application/octet-stream')
              bytes += body.byteLength
            }
            copied++
            doneOut.write(`${m.id}\n`)
          } catch (err) {
            failed++
            failOut.write(`${m.id}\t${key}\t${(err as Error).message}\n`)
          }
        }
      }),
    )
    const secs = (Date.now() - started) / 1000
    console.log(
      `files page ${page}/${res.totalPages}: copied ${copied}, failed ${failed}, ${(bytes / 1e9).toFixed(2)} GB, ${(copied / Math.max(secs, 1)).toFixed(1)} files/s`,
    )
    if (!res.hasNextPage) break
    page++
  }
  doneOut.end()
  failOut.end()
  if (failed) console.log(`failed files listed in ${failFile} — re-run the step to retry`)
}
