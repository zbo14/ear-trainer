export type ChallengeType = 'chords' | 'intervals' | 'progressions' | 'scales';
export type ChallengeLevel = 'easy' | 'medium' | 'hard';

export interface ChallengeDefinition {
  level: ChallengeLevel;
  value: string;
}

export interface Challenge {
  answer: ChallengeDefinition;
  note: string;
  notes: string[][];
  octave: number;
  options: ChallengeDefinition[];
  type: ChallengeType;
}

export type Mode = 'light' | 'dark';

export interface Score {
  challengesCompleted: number;
  challengesStarted: number;
  correctFirstGuesses: number;
  totalGuesses: number;
}

export interface Scores {
  chords: Score;
  intervals: Score;
  progressions: Score;
  scales: Score;
}
