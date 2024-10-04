import { expect, test } from 'vitest';

import {
  chooseRandoms,
  getChordIntervals,
  getChordName,
  notesToPianoKeys,
  translateProgression,
} from './util';

test('chooses randoms', () => {
  const items = [1, 2, 3, 4, 5];
  const randoms = chooseRandoms(items, 3);
  expect(randoms).toHaveLength(3);
});

test('chooses randoms with included item', () => {
  const items = [1, 2, 3, 4, 5];
  const randoms = chooseRandoms(items, 3, 2);
  expect(randoms).toHaveLength(4);
  expect(randoms).toContain(2);
  expect(randoms.filter((item) => item === 2)).toHaveLength(1);
});

test('chooses randoms with included items', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const randoms = chooseRandoms(items, 5, 3, 4);
  expect(randoms).toHaveLength(7);
  expect(randoms).toContain(3);
  expect(randoms).toContain(4);
  expect(randoms.filter((item) => item === 3)).toHaveLength(1);
  expect(randoms.filter((item) => item === 4)).toHaveLength(1);
});

test('gets correct chord name', () => {
  expect(getChordName('maj7', 'C#')).toBe('maj7');
});

test('gets correct chord name with inversion', () => {
  expect(getChordName('/3', 'C#')).toBe('C#/E#');
});

test('gets correct chord name with another inversion', () => {
  expect(getChordName('/5', 'C#')).toBe('C#/G#');
});

test('gets correct piano keys', () => {
  expect(
    notesToPianoKeys([
      ['F4', 'A4', 'C5'],
      ['Bb4', 'D5', 'F5'],
      ['C5', 'Eb5', 'G5'],
    ])
  ).toStrictEqual([
    [6, 10, 13],
    [11, 15, 18],
    [13, 16, 20],
  ]);
});

test('gets correct piano keys across 4 octaves', () => {
  expect(
    notesToPianoKeys([
      ['F4', 'A4', 'C5'],
      ['Bb3', 'D4', 'F4'],
      ['Eb5', 'G5', 'C6'],
    ])
  ).toStrictEqual([
    [18, 22, 25],
    [11, 15, 18],
    [28, 32, 37],
  ]);
});

test('translates progression', () => {
  expect(translateProgression('I7, IId7, IIIm, VIa')).toBe(
    'I7, iiᵒ7, iii, VI+'
  );
});

test('gets correct intervals for chord name', () => {
  expect(getChordIntervals('maj7#5', 'E')).toStrictEqual(['1', '3', '#5', '7']);
});

test('gets correct intervals for chord name with spaces', () => {
  expect(getChordIntervals('maj7#5 ', 'E')).toStrictEqual([
    '1',
    '3',
    '#5',
    '7',
  ]);
});
