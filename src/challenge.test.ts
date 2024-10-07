import { expect, test } from 'vitest';
import { createChallenge } from './challenge';

test('creates easy challenge', () => {
  const challenge = createChallenge('progressions', 'easy');
  const correctDifficulty = challenge.options.every(
    (option) => option.level === 'easy'
  );

  expect(challenge.type).toBe('progressions');
  expect(correctDifficulty);
});

test('creates medium challenge', () => {
  const challenge = createChallenge('scales', 'medium');
  const correctDifficulty = challenge.options.every((option) =>
    ['easy', 'medium'].includes(option.level)
  );

  expect(challenge.type).toBe('scales');
  expect(correctDifficulty);
});
