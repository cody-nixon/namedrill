export interface Person {
  id: string;
  name: string;
  photo: string;
  notes?: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReview: number;
  lastReviewed?: number;
  correctCount: number;
  totalCount: number;
}

export interface Deck {
  id: string;
  name: string;
  emoji: string;
  createdAt: number;
  lastStudied?: number;
  people: Person[];
}

export type StudyMode = 'flash' | 'choice' | 'reverse' | 'speed';

export interface StudyResult {
  personId: string;
  correct: boolean;
  timeMs: number;
}

export interface SessionStats {
  total: number;
  correct: number;
  timeMs: number;
  mode: StudyMode;
}
