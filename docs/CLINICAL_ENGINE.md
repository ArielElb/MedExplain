# MedExplain AI — Clinical Engine & Biomarker Specification

This document details the clinical reasoning engine, the 24 biomarkers, sex/age-adjusted reference intervals, cross-test synergy rules, and delta trend formulas.

---

## 1. The 24 Biomarkers

The clinical database covers 24 key lab markers divided into 5 clinical domains:

| Key | Marker Name | English / Abbr | Category | Standard Reference Interval |
| :--- | :--- | :--- | :--- | :--- |
| `hemoglobin` | המוגלובין | Hb | CBC / ספירת דם | Male: 13.5–17.5 g/dL \| Female: 12.0–15.5 g/dL |
| `ferritin` | פריטין (מאגר ברזל) | Ferritin | מאגרי ברזל | Male: 24–336 ng/mL \| Female: 11–307 ng/mL |
| `iron` | ברזל בסרום | Serum Iron | מאגרי ברזל | 60–170 mcg/dL |
| `plt` | טסיות דם | Platelets | CBC / ספירת דם | 150–450 K/uL |
| `wbc` | כדוריות דם לבנות | Leukocytes | CBC / דלקת | 4.5–11.0 K/uL |
| `crp` | חלבון תגובתי C | C-Reactive Protein | מדדי דלקת | 0.0–5.0 mg/L |
| `glucose` | גלוקוז בצום | Fasting Glucose | סוכר ומטבוליזם | 70–99 mg/dL |
| `hba1c` | המוגלובין מסוכרר | Glycated Hb | סוכר ומטבוליזם | 4.0–5.6 % |
| `cholesterol` | כולסטרול כללי | Total Cholesterol | שומני דם | 120–199 mg/dL |
| `ldl` | כולסטרול LDL | "Bad" Cholesterol | שומני דם | < 100 mg/dL |
| `hdl` | כולסטרול HDL | "Good" Cholesterol | שומני דם | Male: > 40 mg/dL \| Female: > 50 mg/dL |
| `triglycerides`| טריגליצרידים | Triglycerides | שומני דם | < 150 mg/dL |
| `creatinine` | קריאטינין | Creatinine | תפקודי כליות | 0.6–1.2 mg/dL |
| `egfr` | קצב סינון כלייתי | eGFR | תפקודי כליות | > 90 mL/min/1.73m² |
| `alt` | אנזימי כבד ALT | Alanine Transaminase| תפקודי כבד | 7–56 U/L |
| `ast` | אנזימי כבד AST | Aspartate Transaminase| תפקודי כבד | 10–40 U/L |
| `tsh` | בלוטת התריס TSH | Thyroid Stimulating | אנדוקרינולוגיה | 0.4–4.2 mIU/L |
| `vitamin_d` | ויטמין D | 25-OH Vitamin D | ויטמינים | 30–100 ng/mL |
| `vitamin_b12` | ויטמין B12 | Cobalamin | ויטמינים | 200–900 pg/mL |

---

## 2. Multi-Test Synergy Rules (Cross-Test Matrix)

The system checks for combined physiological patterns across multiple tests:

1. **Iron Deficiency Anemia (אנמיה מחוסר ברזל)**:
   - *Condition*: `Hemoglobin < min` AND (`Ferritin < min` OR `Iron < min`).
   - *Message*: Explains how depleted iron reserves restrict red blood cell production, causing fatigue and shortness of breath.
2. **Metabolic Syndrome Pattern (דפוס מטבולי משולב)**:
   - *Condition*: `Triglycerides > 150` AND `HDL < min` AND (`Glucose > 100` OR `HbA1c > 5.7%`).
   - *Message*: Explains insulin resistance and cardiovascular risk synergy.
3. **Active Inflammatory State (תגובה דלקתית פעילה)**:
   - *Condition*: `CRP > 5.0` AND `WBC > 11.0`.
   - *Message*: Identifies an active infectious or inflammatory response requiring clinical evaluation.
4. **Hepatic Stress Pattern (עומס על רקמת הכבד)**:
   - *Condition*: `ALT > 56` AND `AST > 40`.
   - *Message*: Explains liver enzyme elevation and recommends reviewing medications, fatty liver, or alcohol intake.

---

## 3. Historical Trend Deltas

When previous test values are provided, the engine computes:

$$\Delta\% = \frac{\text{Current Value} - \text{Previous Value}}{\text{Previous Value}} \times 100$$

- **Direction**: `increased`, `decreased`, `unchanged`
- **Clinical Significance**: Flagged when change exceeds threshold ($\ge 10\%-15\%$) or moves between normal and abnormal ranges.

