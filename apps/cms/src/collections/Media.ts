import type { CollectionConfig } from 'payload'
import { isStaff } from '../access'
import { generateSizes, sizesAfterRead } from '../hooks/image-sizes'

/**
 * Images and files (WordPress `attachment`). Stored in the R2 bucket
 * `agrinewsthai` (files.agrinewsthai.com) under `{yyyy}/{mm}/{filename}` —
 * the layout of wp-content/uploads, which the bucket already used for the
 * files offloaded from WordPress. WebP copies at the sizes the website
 * renders are written next to each original (hooks/image-sizes.ts) —
 * Payload's own imageSizes need sharp, which Workers don't have.
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
          data.prefix = `${now.getUTCFullYear()}/${mm}`
        }
        return data
      },
    ],
    afterChange: [generateSizes],
  },
  fields: [
    { name: 'alt', label: 'ข้อความแทนภาพ (alt)', type: 'text' },
    { name: 'caption', label: 'คำบรรยายภาพ', type: 'textarea' },
    { name: 'credit', label: 'เครดิตภาพ', type: 'text' },
    {
      // True once the resized copies exist in R2 (upload hook or the backfill);
      // until then `sizes` is null and the website shows the original.
      name: 'sizesReady',
      type: 'checkbox',
      defaultValue: false,
      admin: { hidden: true },
    },
    {
      // URLs of the resized copies the website uses (see lib/image-sizes.ts).
      name: 'sizes',
      type: 'json',
      virtual: true,
      admin: { hidden: true },
      hooks: { afterRead: [sizesAfterRead] },
    },
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
