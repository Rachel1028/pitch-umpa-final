/**
 * 분석 히스토리 관리 유틸리티
 */

export interface AnalysisHistory {
  id: string;
  fileName: string;
  duration: number;
  sampleRate: number;
  channels: number;
  pitchData: number[];
  timeLabels: string[];
  timestamp: string;
  averagePitch: number;
  maxPitch: number;
  minPitch: number;
}

const STORAGE_KEY = 'umpa_analysis_history';
const MAX_HISTORY_ITEMS = 20;

/**
 * 분석 결과를 히스토리에 저장
 */
export const saveToHistory = (analysis: Omit<AnalysisHistory, 'id'>): AnalysisHistory => {
  const history = getHistory();
  
  const newItem: AnalysisHistory = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...analysis,
  };

  // 최신 항목을 맨 앞에 추가
  history.unshift(newItem);

  // 최대 개수 초과 시 오래된 항목 삭제
  if (history.length > MAX_HISTORY_ITEMS) {
    history.pop();
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newItem;
};

/**
 * 모든 분석 히스토리 조회
 */
export const getHistory = (): AnalysisHistory[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('히스토리 로드 오류:', error);
    return [];
  }
};

/**
 * 특정 ID의 분석 결과 조회
 */
export const getHistoryItem = (id: string): AnalysisHistory | null => {
  const history = getHistory();
  return history.find(item => item.id === id) || null;
};

/**
 * 특정 ID의 분석 결과 삭제
 */
export const deleteHistoryItem = (id: string): void => {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * 모든 히스토리 삭제
 */
export const clearHistory = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * 히스토리 항목 개수
 */
export const getHistoryCount = (): number => {
  return getHistory().length;
};
