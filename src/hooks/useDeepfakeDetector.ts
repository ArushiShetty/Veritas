import { useState, useCallback } from 'react';
import { analyzeImageForDeepfake, DeepfakeAnalysisResult } from '@/lib/deepfakeDetector';

interface UseDeepfakeDetectorState {
  isAnalyzing: boolean;
  result: DeepfakeAnalysisResult | null;
  error: string | null;
}

export function useDeepfakeDetector() {
  const [state, setState] = useState<UseDeepfakeDetectorState>({
    isAnalyzing: false,
    result: null,
    error: null,
  });

  const analyze = useCallback(async (imageSource: HTMLImageElement | CanvasImageSource) => {
    setState({ isAnalyzing: true, result: null, error: null });

    try {
      const result = await analyzeImageForDeepfake(imageSource);
      setState({ isAnalyzing: false, result, error: null });
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during analysis';
      setState({ isAnalyzing: false, result: null, error: errorMessage });
      throw err;
    }
  }, []);

  return {
    ...state,
    analyze,
  };
}
