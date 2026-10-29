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
| שרשרת המבודדים (point cloud) | `src/canvas/InsulatorCloud.tsx` |
| אנימציות גלילה | `src/motion/*` (Reveal, LineReveal, WordReveal) |
| לוגו (placeholder) | `src/components/Logo.tsx` + `public/favicon.svg` |
| מדיניות פרטיות (טיוטה) | `src/components/PrivacyModal.tsx` |
| שליחת הטופס | `api/contact.ts` |

## עלייה לאוויר (Vercel)

1. להעלות ל-GitHub ולחבר ב-Vercel (Framework: Vite – מזוהה אוטומטית).
2. Environment Variables (ראו `.env.example`):
   - `RESEND_API_KEY` – מ-resend.com (לאמת את הדומיין שם כדי לשלוח מהכתובת שלו)
   - הנמענים: כל פנייה נשלחת לחמשת המיילים שברשימה `RECIPIENTS` ב-`api/contact.ts`. אפשר לדרוס עם `CONTACT_TO` (מופרד בפסיקים)
   - `CONTACT_FROM` – ברירת מחדל `Prodigy Website <website@prodigy-technology.com>` (הדומיין prodigy-technology.com חייב להיות מאומת ב-Resend)
   - אופציונלי: `TURNSTILE_SECRET_KEY` + `VITE_TURNSTILE_SITE_KEY` (Cloudflare Turnstile, מצב Invisible)
3. לחבר דומיין.

## לפני מסירה — להחליף `[domain]`

- `src/content.ts` → `SITE.email`, `SITE.linkedin`
- `index.html` → canonical, og:url, og:image, JSON-LD
- `public/robots.txt`, `public/sitemap.xml`
- לוגו סופי → `Logo.tsx`, `favicon.svg`, `apple-touch-icon.png`, ואז לייצר מחדש את `og.png`
- טקסט פרטיות מאושר → `PrivacyModal.tsx`

## הגנה מספאם

Honeypot · חסימת שליחה תוך פחות מ-3 שניות · הגבלת 5 פניות לשעה ל-IP · Turnstile (אם מוגדר). אין עוגיות מעקב.

## נגישות וביצועים

`prefers-reduced-motion` עוצר את כל האנימציות. ה-canvas נעצר כשהוא מחוץ למסך או כשהטאב לא פעיל, ובמובייל רץ ב-30fps עם פחות קווים ונקודות.
