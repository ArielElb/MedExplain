import { COMBINATION_RULES, COMBINATION_QUESTIONS } from '../data/crossTestRules';
import { AnalysisItem, ContextFinding } from '../types';

/**
 * Evaluates cross-test rules against the patient's classified analysis items.
 * A rule fires when ALL required test conditions match in the specified direction.
 */
export const evaluateCrossTestCombinations = (
  items: AnalysisItem[]
): ContextFinding[] => {
  const itemsByKey = new Map<string, AnalysisItem>();
  items.forEach((item) => itemsByKey.set(item.markerId, item));

  const findings: ContextFinding[] = [];

  for (const rule of COMBINATION_RULES) {
    let matchesAll = true;

    for (const [testKey, requiredDir] of Object.entries(rule.requiredDirections)) {
      const item = itemsByKey.get(testKey);
      if (!item) {
        matchesAll = false;
        break;
      }
      // Must be abnormal or warning AND in the required direction
      const isFlagged = item.severity === 'danger' || item.severity === 'warning';
      if (!isFlagged || item.direction !== requiredDir) {
        matchesAll = false;
        break;
      }
    }

    if (matchesAll) {
      findings.push({
        ruleId: rule.ruleId,
        matchedTests: rule.matchedTests,
        priority: rule.priority,
        headline: rule.headline,
        patientMessage: rule.patientMessage,
        questionTags: rule.questionTags,
        badgeText: rule.badgeText,
      });
    }
  }

  // Sort by priority (lower number = higher clinical relevance)
  findings.sort((a, b) => a.priority - b.priority);
  return findings;
};

export const getCombinationQuestions = (ruleId: string): string[] => {
  return COMBINATION_QUESTIONS[ruleId] || [];
};

