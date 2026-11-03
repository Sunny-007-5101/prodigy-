# Prodigy — One Pager

React + Vite + TypeScript · Tailwind · Framer Motion · Lenis · Canvas 2D

## הרצה מקומית

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # בדיקת טיפוסים + build ל-dist/
```

> הטופס לא שולח בפיתוח מקומי (`/api/contact` רץ רק ב-Vercel). לבדיקה מלאה: `npx vercel dev`.

## איפה מה

| מה | קובץ |
| --- | --- |
| כל הטקסטים באתר | `src/content.ts` |
| צבעים (טוקנים) | `src/styles/index.css` → `:root` |
| רקע המעגל ב-Hero | `src/canvas/CircuitField.tsx` + `circuit.ts` |
| איורי point cloud (אריחים + First application) | `src/canvas/shapes.ts` + `clouds.ts` |
| אנימציות גלילה | `src/motion/*` (Reveal, LineReveal, WordReveal) |
| לוגו (placeholder) | `src/components/Logo.tsx` + `public/favicon.svg` |
| מדיניות פרטיות (טיוטה) | `src/components/PrivacyModal.tsx` |
| שליחת הטופס ונמענים | `api/contact.ts` → `RECIPIENTS` |

## עלייה לאוויר (Vercel)

1. להעלות ל-GitHub ולחבר ב-Vercel (Framework: Vite – מזוהה אוטומטית).
2. הטופס: `api/contact.ts` (פונקציית Vercel) → Resend → contact@prodigy-technology.com
   - ב-Vercel → Settings → Environment Variables להוסיף `RESEND_API_KEY` (המפתח "Lia website" מחשבון Resend של Prodigy). לא לשמור את המפתח בקוד
   - הדומיין prodigy-technology.com חייב להיות Verified ב-Resend (רשומות DKIM + send/rsend ב-DNS)
   - אחרי Deploy: לשלוח טופס בדיקה ולוודא שהגיע ל-contact@
3. לחבר דומיין.

## לפני מסירה

- הדומיין https://www.prodigy-technology.com כבר מוגדר ב-`index.html`, `robots.txt`, `sitemap.xml`
- לינקדאין של החברה: להכניס ל-`SITE.linkedin` ב-`src/content.ts` (הקישור בפוטר מופיע רק כשהוא מוגדר)
- לוגו סופי → `Logo.tsx`, `favicon.svg`, `apple-touch-icon.png`, ואז לייצר מחדש את `og.png`
- טקסט פרטיות מאושר → `PrivacyModal.tsx`

## הגנה מספאם

Honeypot · חסימת שליחה תוך פחות מ-3 שניות מטעינת הדף · עד 5 פניות לשעה מאותה כתובת IP. אין עוגיות מעקב.

## נגישות וביצועים

`prefers-reduced-motion` עוצר את כל האנימציות. ה-canvas נעצר כשהוא מחוץ למסך או כשהטאב לא פעיל, ובמובייל רץ ב-30fps עם פחות קווים ונקודות.
