# Blood Test App — פענוח בדיקות דם, 100% בצד הלקוח

אפליקציית React + TypeScript שמסבירה ערכים של בדיקת דם בשפה פשוטה
ומכינה שאלות לשיחה עם רופא/ת המשפחה.

## 🔒 פרטיות: אין שרת, אין מסד נתונים

**כל החישובים מתבצעים בדפדפן שלך בלבד.**

- אין Backend ואין API — הפרויקט הוא סטטי לחלוטין.
- אין שום קריאת רשת: אין `fetch`, אין `axios`, אין אנליטיקס.
- הנתונים שהוזנו לא נשלחים לשום מקום ולא נשמרים בשום שרת.
- שמירת היסטוריה היא **אופציונלית וכבויה כברירת מחדל**, ומשתמשת ב-`localStorage`
  של הדפדפן בלבד. ניתן למחוק את הכול בלחיצה אחת.
- אפשר להפעיל את האפליקציה גם במצב Offline לאחר טעינה ראשונה.

> ⚠️ המידע נועד להסברה ולהכנה לשיחה עם רופא/ה בלבד. אין באמור אבחנה רפואית,
> המלצה על טיפול או תחליף לייעוץ מקצועי.

## מבנה הפרויקט

```
blood-test-app/
├── docker-compose.yml      # הרצה כאתר סטטי (nginx)
├── Dockerfile              # build רב-שלבי: vite build -> nginx
├── nginx.conf
├── index.html
├── package.json
├── vite.config.ts
└── src/
    ├── data/               # טווחי המדדים וכללי הפענוח (biomarkers.ts)
    ├── lib/                # לוגיקת הפענוח, אחסון מקומי, ייצוא
    ├── hooks/              # useAnalysis, useLocalHistory
    ├── components/         # רכיבי UI לשימוש חוזר
    ├── pages/              # Dashboard
    ├── types/              # Types/Interfaces
    └── App.tsx
```

## הרצה

```bash
npm install
npm run dev      # http://localhost:5173
```

בנייה לפרודקשן (קבצים סטטיים בלבד ב-`dist/`):

```bash
npm run build
npm run preview
```

Docker:

```bash
docker compose up --build   # http://localhost:5173
```

## הוספת מדד חדש

הכול מרוכז בקובץ אחד — `src/data/biomarkers.ts`. מוסיפים רשומה עם
`name`, `unit`, `category`, `reference` ופונקציית `evaluate` שמחזירה
סטטוס, הודעה ושאלות. ה-UI מתעדכן אוטומטית.
