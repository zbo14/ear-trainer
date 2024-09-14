export type ChallengeType = 'chords' | 'intervals' | 'progressions' | 'scales';
export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

export interface ChallengeDefinition {
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
