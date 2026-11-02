import type { CollectionConfig } from 'payload'
import { isStaff } from '../access'

/**
 * Images and files (WordPress `attachment`). Stored in R2 under
 * `uploads/{yyyy}/{mm}/{filename}` — the same layout as wp-content/uploads,
 * so migrated files keep their paths. Resized variants are produced on the
 * fly by Cloudflare Images on the website, so no sizes are generated here
 * (sharp isn't available on Workers).
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'สื่อ', plural: 'คลังสื่อ' },
  admin: {
    defaultColumns: ['filename', 'alt', 'createdAt'],
    group: 'เนื้อหา',
  },
  access: {
    read: () => true,
    create: isStaff,
    update: isStaff,
    delete: isStaff,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        // New uploads go to a year/month folder, like WordPress.
        if (operation === 'create' && !data.prefix) {
          const now = new Date()
          const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
          data.prefix = `uploads/${now.getUTCFullYear()}/${mm}`
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'alt', label: 'ข้อความแทนภาพ (alt)', type: 'text' },
    { name: 'caption', label: 'คำบรรยายภาพ', type: 'textarea' },
    { name: 'credit', label: 'เครดิตภาพ', type: 'text' },
    {
      name: 'wpId',
      label: 'WordPress attachment ID',
      type: 'number',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
  upload: {
    mimeTypes: ['image/*', 'application/pdf', 'video/mp4'],
    // WordPress reuses filenames across months; the folder (prefix) tells them apart.
    filenameCompoundIndex: ['filename', 'prefix'],
    // Not supported on Workers (no sharp).
    crop: false,
    focalPoint: false,
  },
}
