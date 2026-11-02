import type { DefaultServerCellComponentProps } from 'payload'

type MediaDoc = {
  url?: string | null
  alt?: string | null
  sizes?: { thumbnail?: { url: string } } | null
}

/** Cover image thumbnail in the posts list (the 320 px copy when it exists). */
export async function CoverCell({ cellData, payload }: DefaultServerCellComponentProps) {
  const id = cellData && typeof cellData === 'object' ? (cellData as { id?: number }).id : cellData
  if (!id) return <div style={box} />
  const media = (await payload
    .findByID({ collection: 'media', id: id as number, depth: 0, overrideAccess: true, disableErrors: true })
    .catch((): null => null)) as MediaDoc | null
  const src = media?.sizes?.thumbnail?.url ?? media?.url
  if (!src) return <div style={box} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={media?.alt ?? ''} loading="lazy" style={{ ...box, objectFit: 'cover' }} />
}

const box = {
  display: 'block',
  width: 96,
  height: 54,
  borderRadius: 4,
  background: 'var(--theme-elevation-100)',
} as const
