import { stripHtml } from "./wp";

export type Faq = { question: string; answer: string };

/**
 * Pull question/answer pairs from an editor-written guide: under an H2 named
 * "คำถามที่พบบ่อย" (or "FAQ"), each H3 is a question and the content up to the
 * next H3/H2 is its answer. Only what is visibly on the page goes into the
 * FAQPage schema, as Google requires.
 */
export function extractFaq(html: string): Faq[] {
  const start = html.search(/<h2[^>]*>(?:(?!<\/h2>)[\s\S])*(คำถามที่พบบ่อย|FAQ)(?:(?!<\/h2>)[\s\S])*<\/h2>/i);
  if (start < 0) return [];
  const afterHeading = html.slice(start).replace(/^<h2[^>]*>[\s\S]*?<\/h2>/i, "");
  const section = afterHeading.split(/<h2[\s>]/i)[0];
  const parts = section.split(/<h3[^>]*>/i).slice(1);
  return parts
    .map((part) => {
      const [q, ...rest] = part.split(/<\/h3>/i);
      return { question: stripHtml(q), answer: stripHtml(rest.join("")) };
    })
    .filter((f) => f.question && f.answer);
}
