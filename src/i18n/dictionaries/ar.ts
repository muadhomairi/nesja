/**
 * Arabic UI dictionary — DRAFT. Requires review by a native Arabic copywriter
 * before `ar` is enabled in src/config/locales.ts. Page-level marketing copy
 * should be written for Arabic readers, not translated line by line.
 */
import type { Dictionary } from "./en";

export const ar: Dictionary = {
  nav: { openMenu: "فتح القائمة", closeMenu: "إغلاق القائمة", skipToContent: "انتقل إلى المحتوى", primary: "الرئيسية" },
  cta: { bookDemo: "احجز عرضاً توضيحياً", explore: "اكتشف نسجة", signIn: "تسجيل الدخول", talkToSales: "تحدث إلى المبيعات", startTrial: "ابدأ تجربة مجانية" },
  form: { required: "مطلوب", optional: "اختياري", submit: "إرسال", sending: "جارٍ الإرسال…", back: "رجوع", continue: "متابعة" },
  consent: {
    title: "خيارات الخصوصية",
    body: "نستخدم ملفات تعريف الارتباط الضرورية لتشغيل هذا الموقع. وبإذنك، نستخدم أيضاً أدوات التحليل لفهم طريقة الاستخدام، وملفات التسويق لقياس الحملات.",
    acceptAll: "قبول الكل",
    rejectAll: "الضرورية فقط",
    customise: "تخصيص",
    save: "حفظ الخيارات",
  },
};
