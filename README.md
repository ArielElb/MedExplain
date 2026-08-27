# 🩺 MedExplain AI — Medical Blood Test Explanation & Patient Preparation

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61dafb.svg?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178c6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff.svg?logo=vite)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg?logo=docker)](https://www.docker.com/)
[![Render](https://img.shields.io/badge/Render-Deployable-46e3b7.svg?logo=render)](https://render.com/)
[![GitHub Pages](https://img.shields.io/badge/Docs-GitHub%20Pages-22c55e.svg)](https://arielelb.github.io/MedExplain/)

> **MedExplain AI** היא מערכת רפואית-הסברתית אינטליגנטית להסבר ופענוח בדיקות דם, המשלבת **מנוע קליני מקומי (100% פרטי)**, ניתוח שילובי מדדים רחב, מעקב מגמות (Trends), דף הכנה ממוקד לפגישה עם הרופא/ה (Visit Brief), ועוזר **Dual-Engine AI** (צ'אט-בוט היברידי עם תמיכה ב-Google Gemini 2.0/1.5 Flash).

---

## 📚 אתר התיעוד הרשמי (Documentation Portal)

התיעוד המלא, קטלוג 24 המדדים, הארכיטקטורה ומדריכי הפריסה זמינים ב-**[GitHub Pages Documentation Portal](https://arielelb.github.io/MedExplain/)**:

| מסמך תיעוד | תיאור |
| :--- | :--- |
| 📖 **[System Architecture](docs/ARCHITECTURE.md)** | ארכיטקטורת המערכת, זרימת נתונים ומודל הפרטיות (100% Client-Side). |
| 🔬 **[Clinical Engine](docs/CLINICAL_ENGINE.md)** | פירוט 24 המדדים, טווחי נורמה לפי גיל/מין, חוקי שילובים ומגמות. |
| 🤖 **[AI & Chatbot Guide](docs/AI_AND_CHATBOT.md)** | ארכיטקטורת Dual-Engine, זיהוי דגמים דינמי (Gemini REST) ומנוע מקומי. |
| ⚛️ **[Components & Hooks](docs/COMPONENTS_AND_HOOKS.md)** | עץ הרכיבים, ממשקי Props ו-Custom Hooks. |
| 🚀 **[Deployment Guide](docs/DEPLOYMENT.md)** | מדריכי פריסה מפורטים ל-Docker, Render, Vite ו-GitHub Pages. |

---

## ✨ תכונות עיקריות (Key Features)

- 🔒 **100% פרטי ומקומי (Zero-Backend)**: כל חישובי הבדיקות, ההתאמות לגיל ולמין, וההיסטוריה מתבצעים בדפדפן המשתמש בלבד ללא שרת מרכזי.
- 🔬 **24 מדדי מעבדה חיוניים**: ספירת דם (CBC), שומנים (Lipids), סוכר ומטבוליזם, תפקודי כבד וכליות, מדדי דלקת (CRP/WBC) וויטמינים.
- 🧩 **התמונה הכוללת (Multi-Test Synergy)**: מנוע חוקים המזהה תבניות משותפות (כגון אנמיה מחוסר ברזל, תסמונת מטבולית, תגובה דלקתית).
- 📈 **מעקב מגמות ושינויים (Trends)**: השוואה לבדיקות קודמות עם חישוב $\Delta\%$ וחצי מגמה גרפיים.
- 🤖 **עוזר AI רפואי (MedBot)**: צ'אט-בוט חכם בעל מודעות מלאה להקשר הבדיקות של המטופל/ת, כולל שאלות מומלצות בלחיצה אחת, מנוע קליני מקומי מהיר וחיבור ישיר ל-Gemini API עם זיהוי דגמים אוטומטי.
- 👥 **12 דוגמאות מטופלים (Clinical Scenarios)**: מאגר תרחישים קליניים מגוונים (שגרה, אנמיה, סוכרת, דלקת מפרקים, מעקב ספורטאי).
- 📄 **דף הכנה לרופא (Visit Brief)**: סיכום מובנה, מותאם להדפסה בפורמט A4 עם שאלות מדורגות וצ'ק-ליסט לפגישה.
- 🌓 **עיצוב מותאם אישית (Dark & Light Mode)**: מערכת עיצוב מודרנית עם ניגודיות גבוהה וממשק מותאם לסמארטפונים (Mobile-First).

---

## 🚀 הרצה מקומית מהירה (Quickstart)

```bash
# 1. שיבוט המאגר
git clone https://github.com/ArielElb/MedExplain.git
cd MedExplain/blood-test-app

# 2. התקנת תלויות
npm install

# 3. הרצת שרת פיתוח
npm run dev

# 4. בניית גרסת פיתוח לייצור
npm run build
```

פתח את הדפדפן בכתובת: **`http://localhost:5173/`**.

---

## 🐳 הרצה עם Docker

```bash
cd blood-test-app
docker build -t medexplain-app .
docker run -d -p 80:80 --name medexplain medexplain-app
```

---

## ☁️ פריסה ב-Render

הפרויקט כולל קובץ **`render.yaml`** מוכן לפריסה אוטומטית כ-Static Site. כל דחיפה (Push) לענף `main` ב-GitHub מעדכנת את הפריסה אוטומטית.

---

## 📄 רישיון (License)

פרויקט זה מופץ תחת רישיון **MIT**. ראו קובץ [LICENSE](LICENSE) לפרטים.

---

*כתב ויתור רפואי: MedExplain AI פותחה למטרות הסברה, למידה והעצמת המטופל/ת בלבד. המידע אינו מהווה אבחנה רפואית, חוות דעת מקצועית או תחליף לייעוץ עם רופא/ת המשפחה.*

