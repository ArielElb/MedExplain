import { AnalysisResult } from '../types';

/** Builds a plain-text summary the user can print or paste into a note. */
export const buildTextReport = (result: AnalysisResult): string => {
  const lines: string[] = [];
  lines.push('סיכום תוצאות בדיקת דם');
  lines.push(`נוצר בתאריך: ${new Date(result.createdAt).toLocaleString('he-IL')}`);
  lines.push('');
  lines.push(result.summary.headline);
  lines.push('');

  result.analysis.forEach((item) => {
    lines.push(`${item.name}: ${item.result} ${item.unit} — ${item.status}`);
    lines.push(`  טווח ייחוס: ${item.reference}`);
    lines.push(`  ${item.safeMessage}`);
    item.questions.forEach((question) => lines.push(`  • ${question}`));
    lines.push('');
  });

  if (result.generalQuestions.length > 0) {
    lines.push('שאלות כלליות לפגישה:');
    result.generalQuestions.forEach((question) => lines.push(`  • ${question}`));
    lines.push('');
  }

  lines.push(result.disclaimer);
  return lines.join('\n');
};

const download = (filename: string, content: string, type: string): void => {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const timestamp = (iso: string): string =>
  new Date(iso).toISOString().slice(0, 16).replace(/[:T]/g, '-');

export const downloadTextReport = (result: AnalysisResult): void => {
  download(
    `blood-test-${timestamp(result.createdAt)}.txt`,
    buildTextReport(result),
    'text/plain'
  );
};

export const downloadJson = (result: AnalysisResult): void => {
  download(
    `blood-test-${timestamp(result.createdAt)}.json`,
    JSON.stringify(result, null, 2),
    'application/json'
  );
};

export const copyTextReport = async (result: AnalysisResult): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(buildTextReport(result));
    return true;
  } catch {
    return false;
  }
};
