import { expect, test } from 'vitest';
import { State } from './state';

test('changes score after correct guess', () => {
  const state = new State();

  state.setNewChallenge();
  state.startChallenge();

  expect(state.score.challengesCompleted).toBe(0);
  expect(state.score.challengesStarted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(0);

  state.guess(state.challenge?.answer.value as string);

  expect(state.score.challengesCompleted).toBe(1);
  expect(state.score.challengesStarted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(1);
  expect(state.score.totalGuesses).toBe(1);
});

test('changes score after incorrect guess', () => {
  const state = new State();

  state.setNewChallenge();
  state.startChallenge();

  expect(state.score.challengesCompleted).toBe(0);
  expect(state.score.challengesStarted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(0);

  state.guess('foo');

  expect(state.score.challengesCompleted).toBe(0);
  expect(state.score.challengesStarted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(1);
});

test('changes score after several guesses', () => {
  const state = new State();

  state.setNewChallenge();
  state.startChallenge();

  expect(state.score.challengesCompleted).toBe(0);
  expect(state.score.challengesStarted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(0);

  state.guess('foo');
  state.guess('bar');
  state.guess(state.challenge?.answer.value as string);

  expect(state.score.challengesCompleted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(3);
  expect(state.scoreAverage).toBe(3);
});

test('changes score after several challenges', () => {
  const state = new State();

  state.setNewChallenge();
  state.startChallenge();

  expect(state.score.challengesCompleted).toBe(0);
  expect(state.score.challengesStarted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(0);

  state.guess('foo');
  state.guess('bar');
  state.guess(state.challenge?.answer.value as string);

  expect(state.score.challengesCompleted).toBe(1);
  expect(state.score.challengesStarted).toBe(1);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(3);
  expect(state.scoreAverage).toBe(3);

  state.setNewChallenge();
  state.startChallenge();

  state.guess('baz');
  state.guess(state.challenge?.answer.value as string);

  expect(state.score.challengesCompleted).toBe(2);
  expect(state.score.challengesStarted).toBe(2);
  expect(state.score.correctFirstGuesses).toBe(0);
  expect(state.score.totalGuesses).toBe(5);
  expect(state.scoreAverage).toBe(2.5);

  state.setNewChallenge();
  state.startChallenge();

  state.guess(state.challenge?.answer.value as string);

  expect(state.score.challengesCompleted).toBe(3);
  expect(state.score.challengesStarted).toBe(3);
  expect(state.score.correctFirstGuesses).toBe(1);
  expect(state.score.totalGuesses).toBe(6);
  expect(state.scoreAverage).toBe(2);
});
