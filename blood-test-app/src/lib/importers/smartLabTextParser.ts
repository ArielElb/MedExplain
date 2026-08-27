/**
 * MedExplain AI - Smart Lab Text Parser
 * Comprehensive client-side parser for raw lab report text copied from Israeli HMO portals
 * (Clalit, Maccabi, Meuhedet, Leumit) and hospital laboratories (Sheba, Rambam, Hadassah, Ichilov, etc.).
 *
 * Supports all 24 core biomarkers with bidirectional alias resolution, tabular data parsing,
 * RTL/LTR handling, decimal comma normalization, and patient/date metadata extraction.
 */

export interface ExtractedMarker {
  key: string;
  name: string;
  value: string;
  unit: string;
  originalText: string;
}

export interface ParseLabReportResult {
  extracted: Record<string, string>;
  rawCount: number;
  detectedPatientName?: string;
  detectedDate?: string;
  detectedAge?: number;
  detectedSex?: 'male' | 'female';
  detectedHmo?: string;
  unmatchedLines: string[];
  markersList: ExtractedMarker[];
}

export interface BiomarkerMatcherConfig {
  key: string;
  name: string;
  unit: string;
  aliases: string[];
  patterns: RegExp[];
  validate?: (val: number) => boolean;
}

export const LAB_MATCHERS: BiomarkerMatcherConfig[] = [
  // 1. Glucose
  {
    key: 'glucose',
    name: 'גלוקוז בצום (Glucose)',
    unit: 'mg/dL',
    aliases: ['glu', 'glucose', 'sugar', 'גלוקוז', 'סוכר בצום', 'גלוקוזה', 'glucose in serum', 'fasting blood glucose'],
    patterns: [
      /(?:fasting\s*blood\s*glucose|glucose(?:\s*in\s*serum|\s*\(?b\)?)?|glu\b|גלוקוז(?:\s*בצום|\s*בדם)?|סוכר(?:\s*בצום|\s*בדם)?|גלוקוזה)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL]|mg%)\s*(?:glucose|glu|גלוקוז|סוכר)/i,
      /\b(?:glucose|glu)\b[^\d\n\r]*\b([0-9]{2,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 20 && v <= 1000,
  },

  // 2. HbA1c
  {
    key: 'hba1c',
    name: 'המוגלובין מסוכרר (HbA1c)',
    unit: '%',
    aliases: ['hba1c', 'hb-a1c', 'hb a1c', 'a1c', 'glycated hemoglobin', 'glycohemoglobin', 'המוגלובין a1c', 'המוגלובין מסוכרר'],
    patterns: [
      /(?:hba1c(?:\s*\(%\))?|hb[\s_-]*a1c|glycated\s*h(?:emoglobi)?n|a1c(?:\s*\(%\))?|המוגלובין[\s_-]*a1c|המוגלובין\s*מסוכרר)[\s:=|_\t% -]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*%\s*(?:hba1c|hb[\s_-]*a1c|המוגלובין\s*מסוכרר)/i,
      /\bhba1c\b[^\d\n\r]*\b([0-9]{1,2}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 3.0 && v <= 25.0,
  },

  // 3. Total Cholesterol
  {
    key: 'cholesterol',
    name: 'כולסטרול כללי (Total Cholesterol)',
    unit: 'mg/dL',
    aliases: ['cholesterol', 'total cholesterol', 'chol', 'cholesterol total', 'כולסטרול', 'כולסטרול כללי', 'כולסטרול טוטאל'],
    patterns: [
      /(?:total\s*cholesterol|cholesterol\s*total|cholesterol\s*\(b\)|כולסטרול\s*כללי|כולסטרול\s*טוטאל|\bchol\b(?!\s*[-_]?\s*(?:ldl|hdl))|\bcholesterol\b(?!\s*[-_]?\s*(?:ldl|hdl|calc))|כולסטרול(?!\s*(?:ldl|hdl|רע|טוב)))[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL])?\s*(?:total\s*cholesterol|כולסטרול\s*כללי)/i,
      /\btotal\s*cholesterol\b[^\d\n\r]*\b([0-9]{2,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 50 && v <= 600,
  },

  // 4. LDL Cholesterol
  {
    key: 'ldl',
    name: 'כולסטרול LDL',
    unit: 'mg/dL',
    aliases: ['ldl', 'ldl-c', 'ldl cholesterol', 'cholesterol-ldl', 'ldl-cholest', 'ldl calc', 'כולסטרול ldl', 'כולסטרול רע'],
    patterns: [
      /(?:cholesterol\s*[-_]?\s*ldl(?:\s*calc)?|ldl\s*[-_]?\s*chol(?:esterol)?(?:\s*calc)?|ldl\s*[-_]?\s*c\b|ldl\s*calc\b|\bldl\b|כולסטרול\s*ldl|כולסטרול\s*רע|ldl\s*כולסטרול)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL])?\s*(?:ldl|כולסטרול\s*ldl)/i,
      /\bldl\b[^\d\n\r]*\b([0-9]{2,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 10 && v <= 500,
  },

  // 5. HDL Cholesterol
  {
    key: 'hdl',
    name: 'כולסטרול HDL',
    unit: 'mg/dL',
    aliases: ['hdl', 'hdl-c', 'hdl cholesterol', 'cholesterol-hdl', 'hdl-cholest', 'כולסטרול hdl', 'כולסטרול טוב'],
    patterns: [
      /(?:cholesterol\s*[-_]?\s*hdl|hdl\s*[-_]?\s*chol(?:est(?:erol)?)?\.?|hdl\s*[-_]?\s*c\b|\bhdl\b|כולסטרול\s*hdl|כולסטרול\s*טוב|hdl\s*כולסטרול)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL])?\s*(?:hdl|כולסטרול\s*hdl)/i,
      /\bhdl\b[^\d\n\r]*\b([0-9]{1,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 5 && v <= 200,
  },

  // 6. Triglycerides
  {
    key: 'triglycerides',
    name: 'טריגליצרידים (Triglycerides)',
    unit: 'mg/dL',
    aliases: ['triglycerides', 'triglyceride', 'trig', 'trigs', 'טריגליצרידים', 'טריגליצריד'],
    patterns: [
      /(?:triglycerides|triglyceride|\btrig\b|\btrigs\b|טריגליצרידים|טריגליצריד)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL])?\s*(?:triglycerides|trig|טריגליצרידים)/i,
      /\btriglycerides\b[^\d\n\r]*\b([0-9]{2,4}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 10 && v <= 2500,
  },

  // 7. Hemoglobin
  {
    key: 'hemoglobin',
    name: 'המוגלובין (Hemoglobin)',
    unit: 'g/dL',
    aliases: ['hemoglobin', 'hgb', 'hb', 'המוגלובין', 'המוגלובין בדם'],
    patterns: [
      /(?:hgb\s*[-_]?\s*hemoglobin|hemoglobin(?:\s*\(b\))?|\bhgb\b|\bhb\b(?!\s*[-_]?\s*a1c)|המוגלובין(?!\s*(?:מסוכרר|a1c)))[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:g\/d[lL]|g\/l|gr\/dl)\s*(?:hgb|hemoglobin|המוגלובין)/i,
      /\b(?:hemoglobin|hgb)\b[^\d\n\r]*\b([0-9]{1,2}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 3.0 && v <= 25.0,
  },

  // 8. Ferritin
  {
    key: 'ferritin',
    name: 'פריטין (Ferritin)',
    unit: 'ng/mL',
    aliases: ['ferritin', 'feritin', 'פריטין'],
    patterns: [
      /(?:ferritin|feritin|פריטין)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:ng\/m[lL]|ug\/[lL]|mcg\/[lL])\s*(?:ferritin|פריטין)/i,
      /\bferritin\b[^\d\n\r]*\b([0-9]{1,4}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 0.5 && v <= 5000,
  },

  // 9. Iron
  {
    key: 'iron',
    name: 'ברזל בסרום (Iron)',
    unit: 'mcg/dL',
    aliases: ['iron', 'fe', 'iron in serum', 'ברזל', 'ברזל בסרום', 'ברזל בדם'],
    patterns: [
      /(?:iron(?:\s*in\s*serum|\s*\(?b\)?)?|\bfe\b(?!\s*[-_]?\s*rritin)|ברזל(?:\s*בסרום|\s*בדם)?)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:ug\/d[lL]|mcg\/d[lL]|umol\/[lL])\s*(?:iron|ברזל)/i,
      /\biron\b[^\d\n\r]*\b([0-9]{1,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 5 && v <= 500,
  },

  // 10. Platelets (PLT)
  {
    key: 'plt',
    name: 'טסיות דם (Platelets / PLT)',
    unit: 'K/uL',
    aliases: ['plt', 'platelets', 'thrombocytes', 'טסיות', 'טסיות דם', 'תרומבוציטים'],
    patterns: [
      /(?:platelets(?:\s*count)?|\bplt\b|thrombocytes|טסיות(?:\s*דם)?|תרומבוציטים)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:[kK]\/u[lL]|10\^3\/micl|10\^3\/u[lL]|10\*3\/u[lL]|thou\/u[lL])\s*(?:plt|platelets|טסיות)/i,
      /\b(?:plt|platelets)\b[^\d\n\r]*\b([0-9]{2,4}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 10 && v <= 2000,
  },

  // 11. WBC (White Blood Cells)
  {
    key: 'wbc',
    name: 'כדוריות דם לבנות (WBC)',
    unit: 'K/uL',
    aliases: ['wbc', 'leukocytes', 'leucocytes', 'white blood cells', 'כדוריות דם לבנות', 'לויקוציטים', 'תאי דם לבנים'],
    patterns: [
      /(?:wbc(?:\s*[-_]?\s*leucocytes)?|leukocytes|leucocytes|white\s*blood\s*cells|כדוריות(?:\s*דם)?\s*לבנות|לויקוציטים|תאי\s*דם\s*לבנים)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:[kK]\/u[lL]|10\^3\/micl|10\^3\/u[lL]|10\*3\/u[lL]|thou\/u[lL])\s*(?:wbc|leukocytes|לויקוציטים)/i,
      /\bwbc\b[^\d\n\r]*\b([0-9]{1,2}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 0.2 && v <= 100,
  },

  // 12. CRP (C-Reactive Protein)
  {
    key: 'crp',
    name: 'מדד דלקת CRP',
    unit: 'mg/L',
    aliases: ['crp', 'c-reactive protein', 'c reactive protein', 'hs-crp', 'חלבון מגיב c', 'חלבון תגובתי c', 'חלבון c תגובתי', 'סי אר פי'],
    patterns: [
      /(?:c[\s_-]*reactive\s*protein|hs[\s_-]*crp|\bcrp\b|חלבון\s*(?:c\s*)?תגובתי(?:\s*c)?|חלבון\s*מגיב\s*c|סי[\s_-]*אר[\s_-]*פי)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/[lL]|mg\/d[lL])\s*(?:crp|c-reactive\s*protein|חלבון\s*תגובתי)/i,
      /\bcrp\b[^\d\n\r]*\b([0-9]{1,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 0 && v <= 500,
  },

  // 13. Creatinine
  {
    key: 'creatinine',
    name: 'קריאטינין (Creatinine)',
    unit: 'mg/dL',
    aliases: ['creatinine', 'crea', 'creat', 'creatinine (b)', 'קריאטינין', 'קראטינין', 'קריאטנין'],
    patterns: [
      /(?:creatinine(?:\s*\(?b\)?)?|\bcreat\b|\bcrea\b|קריאטינין|קראטינין|קריאטנין)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL]|umol\/[lL])\s*(?:creatinine|creat|קריאטינין)/i,
      /\bcreatinine\b[^\d\n\r]*\b([0-9]{1,2}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 0.1 && v <= 20.0,
  },

  // 14. eGFR
  {
    key: 'egfr',
    name: 'קצב סינון כלייתי (eGFR)',
    unit: 'mL/min',
    aliases: ['egfr', 'gfr', 'ckd-epi', 'egfr-epi', 'סינון כלייתי', 'קצב סינון כלייתי'],
    patterns: [
      /(?:egfr(?:\s*\(?ckd-epi\)?)?|gfr(?:\s*\(?ckd-epi\)?)?|קצב\s*סינון\s*כלייתי|סינון\s*כלייתי)[\s:=|_\t-><]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:m[lL]\/min(?:\/1\.73m2)?)\s*(?:egfr|gfr|סינון\s*כלייתי)/i,
      /\begfr\b[^\d\n\r]*\b([0-9]{1,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 1 && v <= 250,
  },

  // 15. ALT (GPT)
  {
    key: 'alt',
    name: 'אנזים כבד ALT / GPT',
    unit: 'U/L',
    aliases: ['alt', 'gpt', 'sgpt', 'alt (gpt)', 'אלט', 'אלנין אמינוטרנספראז', 'gpt (alt)'],
    patterns: [
      /(?:alt\s*\(?(?:gpt|sgpt)\)?|gpt\s*\(?alt\)?|\balt\b|\bsgpt\b|\bgpt\b|אלט|אלנין\s*אמינוטרנספראז)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:u\/[lL]|iu\/[lL])\s*(?:alt|gpt|sgpt|אלט)/i,
      /\balt\b[^\d\n\r]*\b([0-9]{1,4}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 1 && v <= 2000,
  },

  // 16. AST (GOT)
  {
    key: 'ast',
    name: 'אנזים כבד AST / GOT',
    unit: 'U/L',
    aliases: ['ast', 'got', 'sgot', 'ast (got)', 'אסט', 'אספרטט אמינוטרנספראז', 'got (ast)'],
    patterns: [
      /(?:ast\s*\(?(?:got|sgot)\)?|got\s*\(?ast\)?|\bast\b|\bsgot\b|\bgot\b|אסט|אספרטט\s*אמינוטרנספראז)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:u\/[lL]|iu\/[lL])\s*(?:ast|got|sgot|אסט)/i,
      /\bast\b[^\d\n\r]*\b([0-9]{1,4}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 1 && v <= 2000,
  },

  // 17. TSH
  {
    key: 'tsh',
    name: 'הורמון בלוטת התריס (TSH)',
    unit: 'mIU/L',
    aliases: ['tsh', 'thyrotropin', 'thyroid stimulating hormone', 'בלוטת התריס', 'הורמון בלוטת התריס', 'תירוטרופין'],
    patterns: [
      /(?:thyrotropin|thyroid\s*stimulating\s*hormone|\btsh\b|הורמון\s*בלוטת\s*התריס|בלוטת\s*התריס(?:\s*\(?tsh\)?)?|תירוטרופין)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:miu\/[lL]|uiu\/m[lL]|miu\/m[lL])\s*(?:tsh|thyrotropin|בלוטת\s*התריס)/i,
      /\btsh\b[^\d\n\r]*\b([0-9]{1,2}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 0.001 && v <= 150,
  },

  // 18. Vitamin D (25-OH)
  {
    key: 'vitamin_d',
    name: 'ויטמין D (25-OH)',
    unit: 'ng/mL',
    aliases: ['vitamin d', 'vit d', 'vit-d', '25-oh-d', '25-oh vitamin d', 'vitamin d (25-oh)', 'ויטמין d', 'ויטמין די', '25-oh-vit-d'],
    patterns: [
      /(?:vitamin\s*d(?:\s*\(?25[\s_-]*oh\)?)?|vit(?:amin)?[\s_-]*d3?|25[\s_-]*oh[\s_-]*vit(?:amin)?[\s_-]*d|25[\s_-]*hydroxyvitamin\s*d|ויטמין[\s_-]*d|ויטמין[\s_-]*די)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:ng\/m[lL]|nmol\/[lL])\s*(?:vit(?:amin)?[\s_-]*d|ויטמין\s*d)/i,
      /\bvit(?:amin)?[\s_-]*d\b[^\d\n\r]*\b([0-9]{1,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 1 && v <= 250,
  },

  // 19. Vitamin B12
  {
    key: 'vitamin_b12',
    name: 'ויטמין B12',
    unit: 'pg/mL',
    aliases: ['vitamin b12', 'vit b12', 'vit-b12', 'b12', 'b-12', 'cobalamin', 'ויטמין b12', 'ויטמין בי 12', 'בי 12'],
    patterns: [
      /(?:vitamin[\s_-]*b12|vit[\s_-]*b12|\bb12\b|\bb-12\b|cobalamin|ויטמין[\s_-]*b12|ויטמין[\s_-]*בי[\s_-]*12|בי[\s_-]*12)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:pg\/m[lL]|pmol\/[lL])\s*(?:vit(?:amin)?[\s_-]*b12|b12|ויטמין\s*b12)/i,
      /\bb12\b[^\d\n\r]*\b([0-9]{2,4}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 10 && v <= 3000,
  },

  // 20. Sodium (Na)
  {
    key: 'sodium',
    name: 'נתרן (Sodium / Na)',
    unit: 'mEq/L',
    aliases: ['sodium', 'na', 'sodium (b)', 'sodium in serum', 'נתרן', 'נתרן בדם', 'נתרן בסרום'],
    patterns: [
      /(?:sodium(?:\s*in\s*serum|\s*\(?b\)?)?|\bna\b(?!\s*[-_]?\s*\(?k\)?)|נתרן(?:\s*בדם|\s*בסרום)?)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:meq\/[lL]|mmol\/[lL])\s*(?:sodium|na|נתרן)/i,
      /\bsodium\b[^\d\n\r]*\b([0-9]{2,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 100 && v <= 180,
  },

  // 21. Potassium (K)
  {
    key: 'potassium',
    name: 'אשלגן (Potassium / K)',
    unit: 'mEq/L',
    aliases: ['potassium', 'k', 'potassium (b)', 'potassium in serum', 'אשלגן', 'אשלגן בדם', 'אשלגן בסרום'],
    patterns: [
      /(?:potassium(?:\s*in\s*serum|\s*\(?b\)?)?|\bk\b(?!\s*[-_]?\s*\/u[lL])|אשלגן(?:\s*בדם|\s*בסרום)?)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:meq\/[lL]|mmol\/[lL])\s*(?:potassium|אשלגן)/i,
      /\bpotassium\b[^\d\n\r]*\b([0-9]{1,2}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 1.5 && v <= 10.0,
  },

  // 22. Calcium (Ca)
  {
    key: 'calcium',
    name: 'סידן (Calcium / Ca)',
    unit: 'mg/dL',
    aliases: ['calcium', 'ca', 'calcium (b)', 'total calcium', 'סידן', 'סידן בדם', 'סידן כללי'],
    patterns: [
      /(?:total\s*calcium|calcium(?:\s*total|\s*\(?b\)?)?|\bca\b(?!\s*[-_]?\s*(?:125|19-9))|סידן(?:\s*בדם|\s*כללי)?)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL]|mmol\/[lL])\s*(?:calcium|ca|סידן)/i,
      /\bcalcium\b[^\d\n\r]*\b([0-9]{1,2}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 4.0 && v <= 18.0,
  },

  // 23. Urea / BUN
  {
    key: 'urea',
    name: 'אוריאה / שתנן (Urea / BUN)',
    unit: 'mg/dL',
    aliases: ['urea', 'urea (b)', 'blood urea nitrogen', 'bun', 'urea nitrogen', 'אוריאה', 'אוריאה בדם', 'חנקן השתנן'],
    patterns: [
      /(?:blood\s*urea\s*nitrogen|\bbun\b|urea(?:\s*nitrogen|\s*\(?b\)?)?|אוריאה(?:\s*בדם)?|חנקן\s*השתנן)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mg\/d[lL]|mmol\/[lL])\s*(?:urea|bun|אוריאה)/i,
      /\burea\b[^\d\n\r]*\b([0-9]{1,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 2 && v <= 200,
  },

  // 24. ESR (Erythrocyte Sedimentation Rate)
  {
    key: 'esr',
    name: 'שקיעת דם (ESR)',
    unit: 'mm/hr',
    aliases: ['esr', 'esr 1 hour', 'sedimentation rate', 'erythrocyte sedimentation rate', 'westergren', 'שקיעת דם', 'שקיעת דם לשעה', 'שקיעה'],
    patterns: [
      /(?:erythrocyte\s*sedimentation\s*rate|sedimentation\s*rate|esr(?:\s*1\s*hour)?|westergren|שקיעת\s*דם(?:\s*לשעה)?|שקיעה\s*לשעה)[\s:=|_\t-]+([0-9]+(?:\.[0-9]+)?)/i,
      /([0-9]+(?:\.[0-9]+)?)\s*(?:mm\/h(?:r)?|mm)\s*(?:esr|שקיעת\s*דם)/i,
      /\besr\b[^\d\n\r]*\b([0-9]{1,3}(?:\.[0-9]+)?)\b/i,
    ],
    validate: (v) => v >= 0 && v <= 150,
  },
];

/**
 * Normalizes text line by replacing Hebrew punctuation, multiple tabs/spaces,
 * and converting decimal commas to decimal dots (e.g. "14,5" -> "14.5").
 */
function normalizeLine(line: string): string {
  return line
    .replace(/[\u200E\u200F\u202A-\u202E]/g, '') // Remove RTL/LTR invisible formatting marks
    .replace(/(\d+),(\d+)/g, '$1.$2') // Normalize decimal commas
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Detects Israeli HMO name / Lab origin if present in text header
 */
function detectHmoSource(rawText: string): string | undefined {
  if (/כללית|clalit/i.test(rawText)) return 'כללית (Clalit)';
  if (/מכבי|maccabi/i.test(rawText)) return 'מכבי (Maccabi)';
  if (/מאוחדת|meuhedet/i.test(rawText)) return 'מאוחדת (Meuhedet)';
  if (/לאומית|leumit/i.test(rawText)) return 'לאומית (Leumit)';
  if (/שיבא|תל\s*השומר|sheba/i.test(rawText)) return 'המרכז הרפואי שיבא (Sheba)';
  if (/רמב"?ם|rambam/i.test(rawText)) return 'רמב"ם (Rambam)';
  if (/הדסה|hadassah/i.test(rawText)) return 'הדסה (Hadassah)';
  if (/איכילוב|סוראסקי|ichilov|sourasky/i.test(rawText)) return 'איכילוב (Ichilov)';
  if (/אסותא|assuta/i.test(rawText)) return 'אסותא (Assuta)';
  return undefined;
}

/**
 * Comprehensive parser for raw lab report text running 100% client-side.
 * Parses copied text from Clalit, Maccabi, Meuhedet, Leumit, Sheba, Rambam, etc.
 */
export function parseRawLabText(rawText: string): ParseLabReportResult {
  const extracted: Record<string, string> = {};
  const markersList: ExtractedMarker[] = [];
  const unmatchedLines: string[] = [];

  if (!rawText || !rawText.trim()) {
    return {
      extracted: {},
      rawCount: 0,
      unmatchedLines: [],
      markersList: [],
    };
  }

  const detectedHmo = detectHmoSource(rawText);
  let detectedPatientName: string | undefined;
  let detectedDate: string | undefined;
  let detectedAge: number | undefined;
  let detectedSex: 'male' | 'female' | undefined;

  // Split lines and sanitize
  const rawLines = rawText.split(/\r?\n/);

  for (const rawLine of rawLines) {
    const line = normalizeLine(rawLine);
    if (!line || line.length < 2) continue;

    // Detect Patient Name (e.g. שם המטופל/ת: יעל כהן | Patient Name: David Levi)
    if (!detectedPatientName) {
      const nameMatch = line.match(/(?:שם(?:\s*המטופל(?:\/ת)?|\s*נבדק(?:\/ת)?|\s*מטופל(?:\/ת)?)?|patient(?:\s*name)?|name)\s*[:|=|\-]\s*([א-תa-zA-Z\s]{2,35})/i);
      if (nameMatch && nameMatch[1]) {
        const candidate = nameMatch[1].trim();
        // Ignore lines that matched titles like "שם בדיקה"
        if (!candidate.includes('בדיקה') && !candidate.includes('מעבדה') && !candidate.includes('קופת')) {
          detectedPatientName = candidate;
        }
      }
    }

    // Detect Date (e.g. 14/06/2026, 2026-06-14, 14.06.2026)
    if (!detectedDate) {
      const dateMatch = line.match(/(?:תאריך(?:\s*בדיקה|\s*דגימה|\s*הפקה|\s*ביצוע)?|date(?:\s*of\s*test|\s*collected)?)\s*[:|=|\-]?\s*([0-9]{1,4}[/.-][0-9]{1,2}[/.-][0-9]{1,4})/i);
      if (dateMatch && dateMatch[1]) {
        detectedDate = dateMatch[1].trim();
      } else {
        // Direct standalone date pattern on top lines
        const standaloneDate = line.match(/\b([0-9]{1,2}[/.-][0-9]{1,2}[/.-][0-9]{2,4})\b/);
        if (standaloneDate && standaloneDate[1]) {
          detectedDate = standaloneDate[1].trim();
        }
      }
    }

    // Detect Age (e.g. גיל: 38, Age: 45)
    if (detectedAge === undefined) {
      const ageMatch = line.match(/(?:גיל|age)\s*[:|=|\-]?\s*([0-9]{1,3})/i);
      if (ageMatch && ageMatch[1]) {
        const parsedAge = parseInt(ageMatch[1], 10);
        if (parsedAge > 0 && parsedAge < 125) {
          detectedAge = parsedAge;
        }
      }
    }

    // Detect Biological Sex (e.g. מין: נקבה, Sex: Female)
    if (!detectedSex) {
      if (/(?:מין|sex|gender)\s*[:|=|\-]?\s*(?:נקבה|אישה|נ|female|f\b)/i.test(line)) {
        detectedSex = 'female';
      } else if (/(?:מין|sex|gender)\s*[:|=|\-]?\s*(?:זכר|גבר|ז|male|m\b)/i.test(line)) {
        detectedSex = 'male';
      }
    }

    let lineMatched = false;

    // Evaluate against each biomarker matcher
    for (const matcher of LAB_MATCHERS) {
      if (extracted[matcher.key]) continue; // Already extracted earlier

      for (const pattern of matcher.patterns) {
        const match = line.match(pattern);
        if (match && match[1]) {
          const valNum = parseFloat(match[1]);
          if (!isNaN(valNum)) {
            // Apply physiological plausibility check if provided
            if (matcher.validate && !matcher.validate(valNum)) {
              continue;
            }

            const strVal = String(valNum);
            extracted[matcher.key] = strVal;

            markersList.push({
              key: matcher.key,
              name: matcher.name,
              value: strVal,
              unit: matcher.unit,
              originalText: rawLine.trim(),
            });

            lineMatched = true;
            break;
          }
        }
      }

      if (lineMatched) break;
    }

    // If line had potential data but didn't match any known test, record as unmatched line
    if (!lineMatched && line.length > 3 && !/קופת\s*חולים|בדיקות|מעבדה|תוצאות|טווח|ערכי\s*נורמה|page|report/i.test(line)) {
      unmatchedLines.push(rawLine.trim());
    }
  }

  // Alias bidirectional synchronization for components that query 'platelets' instead of 'plt' or 'b12' instead of 'vitamin_b12'
  if (extracted['plt'] && !extracted['platelets']) {
    extracted['platelets'] = extracted['plt'];
  } else if (extracted['platelets'] && !extracted['plt']) {
    extracted['plt'] = extracted['platelets'];
  }

  if (extracted['vitamin_b12'] && !extracted['b12']) {
    extracted['b12'] = extracted['vitamin_b12'];
  } else if (extracted['b12'] && !extracted['vitamin_b12']) {
    extracted['vitamin_b12'] = extracted['b12'];
  }

  // Calculate canonical rawCount (counting canonical keys without double-counting aliases)
  const canonicalKeys = new Set(LAB_MATCHERS.map((m) => m.key));
  const distinctCount = Object.keys(extracted).filter((k) => canonicalKeys.has(k)).length;

  return {
    extracted,
    rawCount: distinctCount,
    detectedPatientName,
    detectedDate,
    detectedAge,
    detectedSex,
    detectedHmo,
    unmatchedLines,
    markersList,
  };
}

export default parseRawLabText;
