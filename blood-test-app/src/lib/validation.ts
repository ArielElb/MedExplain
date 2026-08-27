import { BIOMARKERS_BY_ID } from '../data/biomarkers';
import { TestResults } from '../types';

export interface ParseOutcome {
  values: TestResults;
  errors: string[];
}

/** Validates the raw form strings before running the analysis. */
export const parseFormValues = (raw: Record<string, string>): ParseOutcome => {
  const values: TestResults = {};
  const errors: string[] = [];

  for (const [markerId, input] of Object.entries(raw)) {
    const trimmed = (input ?? '').trim();
    if (trimmed === '') continue;

    const marker = BIOMARKERS_BY_ID[markerId];
    if (!marker) continue;

    const num = Number(trimmed);
    if (!Number.isFinite(num)) {
      errors.push(`הערך של ${marker.name} אינו מספר תקין.`);
      continue;
    }
    if (num < marker.min || num > marker.max) {
      errors.push(
        `הערך של ${marker.name} (${num}) חורג מטווח הקליטה הסביר (${marker.min}–${marker.max}).`
      );
      continue;
    }
    values[markerId] = num;
  }

  if (Object.keys(values).length === 0 && errors.length === 0) {
    errors.push('יש להזין לפחות ערך אחד כדי לקבל הסבר.');
  }

  return { values, errors };
};
