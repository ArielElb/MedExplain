import { useCallback, useState } from 'react';
import { analyzeBloodTest } from '../lib/analyzer';
import { parseFormValues } from '../lib/validation';
import { AnalysisResult, PatientContext } from '../types';

/** Runs the analysis synchronously in the browser with full privacy. */
export const useAnalysis = () => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const analyze = useCallback(
    (
      raw: Record<string, string>,
      patient?: PatientContext,
      previousValues?: Record<string, number>
    ): AnalysisResult | null => {
      const { values, errors: parseErrors } = parseFormValues(raw);
      if (parseErrors.length > 0) {
        setErrors(parseErrors);
        return null;
      }
      setErrors([]);
      const analysis = analyzeBloodTest(values, patient, previousValues);
      setResult(analysis);
      return analysis;
    },
    []
  );

  const analyzeDirect = useCallback(
    (
      numericValues: Record<string, number>,
      patient?: PatientContext,
      previousValues?: Record<string, number>
    ): AnalysisResult => {
      setErrors([]);
      const analysis = analyzeBloodTest(numericValues, patient, previousValues);
      setResult(analysis);
      return analysis;
    },
    []
  );

  const reset = useCallback(() => {
    setResult(null);
    setErrors([]);
  }, []);

  return { result, errors, analyze, analyzeDirect, reset, setResult };
};
