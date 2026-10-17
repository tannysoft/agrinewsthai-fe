/**
 * Editorial copy for each category. WordPress category descriptions are
 * empty, so these drive the archive intro, <title> and meta description.
 */
export const CATEGORY_COPY: Record<string, { title?: string; description: string }> = {
  news: {
    title: "ข่าวเกษตรวันนี้ ล่าสุด",
    description:
      "ข่าวเกษตรล่าสุดทุกวัน นโยบายกระทรวงเกษตรฯ ราคาพืชผล มาตรการช่วยเหลือเกษตรกร และความเคลื่อนไหวในพื้นที่ทั่วประเทศ",
  },
  "domestic-animal": {
    title: "ข่าวปศุสัตว์",
    description:
      "ข่าวปศุสัตว์ไทย โคเนื้อ โคนม สุกร สัตว์ปีก แพะ และประมง พร้อมมาตรการควบคุมโรค ราคา และเทคโนโลยีฟาร์ม",
  },
  "soil-and-water": {
    title: "ข่าวดินและน้ำ",
    description:
      "การจัดการดิน น้ำ ชลประทาน ภัยแล้งและน้ำท่วม เพื่อการเกษตรที่ยั่งยืน อัปเดตสถานการณ์น้ำและมาตรการรับมือ",
  },
  "large-farm": {
    title: "เกษตรแปลงใหญ่",
    description:
      "เรื่องเล่าและความสำเร็จของเกษตรแปลงใหญ่ทั่วประเทศ การรวมกลุ่ม ลดต้นทุน เพิ่มผลผลิต และตลาดนำการผลิต",
  },
  "economic-crops": {
    title: "ข่าวพืชเศรษฐกิจ",
    description:
      "ข่าวพืชเศรษฐกิจไทย ข้าว ยางพารา ปาล์มน้ำมัน อ้อย มันสำปะหลัง ทุเรียน และผลไม้ส่งออก ทั้งราคา นโยบาย และตลาด",
  },
  "agriculture-special": {
    title: "เกษตร Special",
    description:
      "รายงานพิเศษเจาะลึกประเด็นเกษตร ตลาดส่งออก การค้าระหว่างประเทศ และแนวโน้มที่เกษตรกรไทยควรรู้",
  },
  column: {
    title: "คอลัมน์เกษตร",
    description:
      "มุมมองและบทวิเคราะห์จากคอลัมนิสต์ เรื่องเล่าข่าวเกษตรประจำสัปดาห์ คาร์บอนเครดิต และประเด็นที่กระทบเกษตรกร",
  },
  "did-you-know": {
    title: "รู้หรือไม่? ความรู้เกษตร",
    description:
      "ความรู้เกษตรใกล้ตัวที่หลายคนยังเข้าใจผิด เทคนิคดูแลพืชและสัตว์ วิธีแก้ปัญหาในแปลง อ่านแล้วนำไปใช้ได้จริง",
  },
  "agricultural-technology": {
    title: "เทคโนโลยีการเกษตร",
    description:
      "นวัตกรรมและเทคโนโลยีการเกษตร โดรน เครื่องจักรกล สมาร์ทฟาร์ม และงานวิจัยที่ช่วยลดต้นทุนให้เกษตรกรไทย",
  },
  "folk-wisdom": {
    title: "ภูมิปัญญาชาวบ้าน",
    description:
      "ภูมิปัญญาชาวบ้านและองค์ความรู้ดั้งเดิมด้านเกษตร อาหาร และการใช้ทรัพยากรท้องถิ่นจากทุกภูมิภาค",
  },
};

/** Categories that exist only to drive layout (e.g. the homepage slider) and must not be indexed. */
export const NOINDEX_CATEGORY_SLUGS = new Set(["slide"]);
