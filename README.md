# เรื่องเล่าข่าวเกษตร (agrinewsthai.com)

Monorepo ของเว็บไซต์และระบบจัดการเนื้อหา ทั้งระบบรันบน Cloudflare

| แอป | คืออะไร | รันบน |
| --- | --- | --- |
| `apps/web` | เว็บไซต์ข่าว (Next.js 16) | Cloudflare Workers ผ่าน OpenNext |
| `apps/cms` | Payload CMS 3 ใช้เป็นระบบหลังบ้านแทน WordPress | Cloudflare Workers + D1 (ฐานข้อมูล) + R2 (ไฟล์สื่อ) |

```
apps/
  web/   เว็บไซต์ — อ่านเนื้อหาจาก CMS ผ่าน REST API
  cms/   Payload CMS — /admin สำหรับกองบรรณาธิการ
    scripts/migrate-wp/   สคริปต์ย้ายข้อมูลจาก WordPress
```

## เริ่มต้นพัฒนา

ต้องใช้ Node 24 (`nvm use`) และ pnpm 10

```bash
pnpm install
cp apps/cms/.env.example apps/cms/.env   # ใส่ PAYLOAD_SECRET (openssl rand -hex 32)
cp apps/web/.env.example apps/web/.env.local
pnpm --filter @agrinewsthai/cms migrate:db   # สร้างตารางใน D1 local (.wrangler)
pnpm dev                                      # web :3000, cms :3001
```

- หลังบ้าน: http://localhost:3001/admin
- เว็บ: http://localhost:3000 — ตั้ง `CMS_SOURCE=wordpress` ใน `apps/web/.env.local` เพื่อกลับไปอ่านจาก WordPress เดิมได้ทุกเมื่อ

### แก้ schema ของ CMS

แก้ไฟล์ใน `apps/cms/src/collections` แล้ว

```bash
pnpm --filter @agrinewsthai/cms generate:types
pnpm --filter @agrinewsthai/cms migrate:create <ชื่อ>
pnpm --filter @agrinewsthai/cms migrate:db
```

(ปิด `push` ไว้ ทุกการเปลี่ยน schema ต้องผ่าน migration เพื่อให้ local และ production ตรงกัน)

## โครงสร้างข้อมูลใน CMS (เทียบ WordPress)

| WordPress | Payload | หมายเหตุ |
| --- | --- | --- |
| post | `posts` | id เดิมของ WordPress — URL `/{หมวด}/{id}` ไม่เปลี่ยน, มี draft/เวอร์ชัน, ตั้งเวลาเผยแพร่ได้ด้วย `publishedAt` |
| page | `pages` | หน้า slug `topic-{slug}` = คู่มือ + FAQ ของหน้า /topic |
| category | `categories` | ลำดับเมนู, ซ่อนจากเมนู, noindex |
| post_tag | `tags` | `postCount` นับอัตโนมัติ |
| attachment | `media` | ไฟล์ใน R2 ที่ path เดิม `uploads/{ปี}/{เดือน}/{ไฟล์}` |
| user | `users` | บทบาท admin / editor / author, เลือกได้ว่าจะแสดงชื่อเป็นผู้เขียนหรือ “กองบรรณาธิการ” |
| Rank Math | `meta` (SEO plugin) | title, description, รูป OG, คีย์เวิร์ดหลัก, canonical, noindex/nofollow |

เนื้อหาเก็บเป็น Lexical (แก้ไขได้ใน editor) และสร้าง `contentHtml` อัตโนมัติทุกครั้งที่บันทึก เว็บอ่าน HTML นี้โดยตรง

## ย้ายข้อมูลจาก WordPress

สคริปต์อยู่ที่ `apps/cms/scripts/migrate-wp` อ่านจาก WordPress REST API แล้วเขียนลง Payload โดยคง id เดิม

```bash
cd apps/cms
pnpm migrate:wp                          # ทุกขั้น: users → categories → tags → media → posts → pages → counts
pnpm migrate:wp --steps=posts --limit=50 # ทดลองบางส่วน
pnpm migrate:wp --since=2026-11-01       # เฉพาะที่แก้ไขหลังวันที่ (อัปเดตของเดิมด้วย)
pnpm migrate:wp --steps=files            # คัดลอกไฟล์สื่อเข้า R2
```

- รันซ้ำได้ ข้ามรายการที่มีแล้ว และจำหน้าที่ทำถึงไว้ใน `.migrate/state.json` (`--restart` เพื่อเริ่มใหม่)
- ตัวเลือก: `--update` เขียนทับของเดิม, `--concurrency=6`, `--rankmath=false` ข้ามการดึง SEO จาก Rank Math, `--keep-versions`
- ใส่ `WP_USER` + `WP_APP_PASSWORD` (Application Password ของ WordPress) ใน `.env` เพื่อดึงฉบับร่าง/บทความส่วนตัว และอีเมลผู้ใช้ด้วย ถ้าไม่ใส่จะได้เฉพาะที่เผยแพร่แล้ว
- รหัสผ่านชั่วคราวของผู้ใช้ที่ย้ายมาอยู่ใน `.migrate/credentials.tsv`
- ภาพที่หาในคลังสื่อไม่เจอ และบทความที่ย้ายไม่สำเร็จ จะถูกบันทึกใน `.migrate/*-warnings.log`
- การแปลงเนื้อหา: ย่อหน้า หัวข้อ รายการ ลิงก์ อ้างอิง → Lexical, ภาพ → ภาพจากคลังสื่อ (พร้อมคำบรรยาย), แกลเลอรี/YouTube/โซเชียล → block, ตาราง/โค้ด → block HTML ต้นฉบับเก็บไว้ในช่อง “HTML ต้นฉบับ” ของแต่ละบทความ

### คัดลอกไฟล์สื่อเข้า R2

ไฟล์ต้นฉบับประมาณ 1 แสนไฟล์ เร็วที่สุดคือผ่าน S3 API ของ R2: สร้าง API token ของ R2 แล้วใส่ใน `apps/cms/.env`

```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=agrinewsthai-media
```

แล้วรัน `pnpm migrate:wp --steps=files` (รันซ้ำได้ จะข้ามไฟล์ที่คัดลอกแล้ว) ถ้าไม่ตั้งค่าเหล่านี้ สคริปต์จะใช้ R2 binding ของ wrangler แทน

## Deploy บน Cloudflare

ครั้งแรก: สร้าง resource แล้วใส่ id ใน `wrangler.jsonc` ของแต่ละแอป

```bash
cd apps/cms
npx wrangler d1 create agrinewsthai-cms          # → database_id ใน apps/cms/wrangler.jsonc
npx wrangler r2 bucket create agrinewsthai-media # เปิด custom domain media.agrinewsthai.com ใน dashboard
npx wrangler secret put PAYLOAD_SECRET
npx wrangler secret put REVALIDATE_SECRET
npx wrangler secret put PREVIEW_SECRET

cd ../web
npx wrangler d1 create agrinewsthai-web-tags      # → database_id ใน apps/web/wrangler.jsonc
npx wrangler r2 bucket create agrinewsthai-web-cache
npx wrangler secret put REVALIDATE_SECRET         # ค่าเดียวกับฝั่ง CMS
npx wrangler secret put PREVIEW_SECRET            # ค่าเดียวกับฝั่ง CMS
npx wrangler secret put CMS_PREVIEW_API_KEY       # API key ของผู้ใช้ใน CMS (สำหรับอ่านฉบับร่าง)
```

ปุ่ม “Preview” ในหน้าแก้ไขบทความจะเปิดฉบับร่างบนเว็บจริง (draft mode) โดยคนทั่วไปยังเห็นฉบับที่เผยแพร่แล้วตามปกติ

ย้ายข้อมูลขึ้น production (ย้ายลง D1 local ก่อน แล้วอัปโหลดทีเดียว เร็วกว่าเขียนทีละแถวผ่านเน็ต)

```bash
cd apps/cms
pnpm migrate:wp                 # ลง D1 local
pnpm push:db                    # export → import เข้า D1 remote (ต้องเป็นฐานว่าง)
pnpm migrate:wp --steps=files   # ไฟล์สื่อเข้า R2
```

Deploy:

```bash
pnpm deploy:cms   # รัน payload migrate กับ D1 remote แล้ว deploy Worker
pnpm deploy:web
```

Workers ทั้งสองใช้ Workers Paid plan (ขนาด bundle ของ Payload เกิน 3 MB ของแพลนฟรี)

### วันย้ายระบบจริง

1. งดแก้ไขใน WordPress
2. `pnpm migrate:wp --since=<วันที่ย้ายรอบแรก>` แล้ว `--steps=files` อีกรอบ เพื่อเก็บของที่เพิ่ม/แก้หลังย้ายรอบแรก (ถ้าย้ายลง local ให้ใช้ `PAYLOAD_REMOTE=1` เขียนตรงเข้า D1 remote)
3. เปิด `routes` ใน `apps/web/wrangler.jsonc` (www.agrinewsthai.com) และ `apps/cms/wrangler.jsonc` (cms.agrinewsthai.com) แล้ว deploy
4. Redirect `/wp-content/uploads/*` → `https://media.agrinewsthai.com/uploads/*` (Cloudflare Redirect Rule) เพื่อให้ลิงก์ภาพเดิมยังใช้ได้
