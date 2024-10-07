import { createChallenge } from './challenge';
import { Challenge, ChallengeLevel, ChallengeType, Mode } from './types';
import { createScores, notesToPianoKeys, removeSpaces } from './util';

export class State {
  answer: string = '';
  challenge: Challenge | null = null;
  challengeType: ChallengeType = 'chords';
  guesses = 0;
  isPlaying = false;
  level: ChallengeLevel = 'easy';
  localStorage: Storage | null = null;
  markedKeys: number[][] = [[]];
  mode: Mode = 'light';
  noteLength = 1;
  shouldRestart = false;
  shouldStop = false;
  scores = createScores();
  score = this.scores[this.challengeType];
  solved = false;
  started = false;

  get scoreAverage() {
    return (
      (Math.round(
        (this.score.totalGuesses * 10) / this.score.challengesCompleted
      ) || 0) / 10
    );
  }

  guess(answer: string) {
    if (!this.challenge) {
      throw new Error('No challenge.');
    }

    this.answer = answer;

    if (!this.answer) {
      throw new Error('Empty answer.');
    }

    if (!this.solved) {
      ++this.score.totalGuesses;
      ++this.guesses;
    }

    const isCorrect = removeSpaces(this.challenge.answer.value) === this.answer;

    if (isCorrect) {
      if (!this.solved) {
        ++this.score.challengesCompleted;

        if (this.guesses === 1) {
          ++this.score.correctFirstGuesses;
        }
      }

      this.solved = true;
    }

    return isCorrect;
  }

  setChallengeType(challengeType = this.challengeType) {
    this.challengeType = challengeType;
    this.score = this.scores[challengeType];
  }

  setLevel(level = this.level) {
    this.level = level;

    if (this.localStorage) {
      this.localStorage.setItem('level', level);
    }
  }

  setLocalStorage() {
    this.localStorage = window.localStorage;
  }

  setMode(mode = this.mode) {
    if (this.localStorage) {
      this.localStorage.setItem('mode', mode);
    }

    this.mode = mode;
  }

  setNewChallenge() {
    this.challenge = createChallenge(this.challengeType, this.level);
    this.guesses = 0;
    this.markedKeys = notesToPianoKeys(this.challenge.notes);
    this.solved = false;
    this.started = false;
  }

  setScores(scores = this.scores) {
    if (this.localStorage) {
      this.localStorage.setItem('scores', JSON.stringify(scores));
    }

    this.scores = scores;
    this.score = this.scores[this.challengeType];
  }

  startChallenge() {
    this.started = true;
    ++this.score.challengesStarted;
  }

  stopPlayback() {
    if (this.shouldStop || !this.isPlaying) {
      return;
    }

    this.shouldStop = true;
  }
}

export const state = new State();
