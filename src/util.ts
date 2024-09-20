import { get as getChord, notes as chordNotes } from '@tonaljs/chord';
import { get as getNote, transpose } from '@tonaljs/note';
import { fromRomanNumerals as progression } from '@tonaljs/progression';
import { get as getScale } from '@tonaljs/scale';
import { ChallengeDefinition, Mode, Score, Scores } from './types';

export function chooseRandom<T>(items: T[]): T {
  return items[Math.floor(items.length * Math.random())];
}

export function chooseRandoms<T>(
  items: T[],
  count: number,
  ...includeItems: T[]
): T[] {
  const shuffledItems = shuffleItems(items);

  if (!includeItems.length) {
    return shuffledItems.slice(0, count);
  }

  const randoms = shuffledItems
    .slice(0, count + includeItems.length)
    .filter((item) => !includeItems.includes(item))
    .slice(0, count);

  randoms.push(...includeItems);

  return shuffleItems(randoms);
}

export function createScore(): Score {
  return {
    challengesCompleted: 0,
    challengesStarted: 0,
    correctFirstGuesses: 0,
    totalGuesses: 0,
  };
}

export function getChordName(chordName: string, note: string) {
  return (
    chordName.replace(
      /^.*?\/([1-7])([MPdm])?$/,
      (match, p1, p2 = '', offset) => {
        let interval;

        if (p2.length) {
          interval = p1 + p2;
        } else {
          if (['4', '5'].includes(p1)) {
            interval = p1 + 'P';
          } else {
            interval = p1 + 'M';
          }
        }

        return (
          note +
          (match.slice(0, offset) +
            '/' +
            transpose(note, interval) +
            match.slice(offset + p1.length + p2.length + 1))
        );
      }
    ) || 'M'
  );
}

export function getChordIntervals(chordName: string, note: string) {
  const { intervals } = getChord(getChordName(chordName, note));

  return intervals.map(translateInterval);
}

export function getChordNotes(chordName: string, note: string, octave: number) {
  return chordNotes(getChordName(chordName, note), `${note}${octave}`);
}

export function getIntervalNotes(
  interval: string,
  note: string,
  octave: number
) {
  const tonic = `${note}${octave}`;

  return [[tonic], [transpose(tonic, interval)]];
}

export function getMode(): Mode {
  const mode = localStorage.getItem('mode');

  if (mode) {
    return mode as Mode;
  }

  if (
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    setMode('dark');
    return 'dark';
  }

  setMode('light');
  return 'light';
}

export function getProgressionNotes(
  chordNumerals: string[],
  note: string,
  octave: number
) {
  const chords = progression(note, chordNumerals);

  return chords.map((chord) => {
    const [, note, chordName] = chord.match(
      /^([A-G](?:#|b)*)(.*?)$/i
    ) as string[];
    return getChordNotes(chordName, note, octave);
  });
}

export function getScaleIntervals(scale: string, note: string) {
  return getScale(`${note} ${scale}`).intervals.map(translateInterval);
}

export function getScaleNotes(scale: string, note: string, octave: number) {
  return [
    ...getScale(`${note}${octave} ${scale}`).notes.map((note) => [note]),
    [`${note}${octave + 1}`],
  ];
}

export function getScores(): Scores {
  const scoreString = localStorage.getItem('scores');

  if (!scoreString) {
    const scores = {
      chords: createScore(),
      intervals: createScore(),
      progressions: createScore(),
      scales: createScore(),
    };

    setScores(scores);

    return scores;
  }

  return JSON.parse(scoreString);
}

export function hideElements(...elements: HTMLElement[]) {
  for (const element of elements) {
    element.style.visibility = 'hidden';
  }
}

export function notesToPianoKeys(notes: string[][]) {
  let minOctave = 8;

  for (const someNotes of notes) {
    for (const note of someNotes) {
      const octave = getNote(note).oct ?? 8;

      if (octave < minOctave) {
        minOctave = octave;
      }
    }
  }

  return notes.map((notes) => {
    return notes.map((note) => {
      const { acc: accidentals, oct, letter } = getNote(note);
      const octave = oct as number;
      let { chroma } = getNote(`${letter}${octave}`);

      ++chroma;

      for (const accidental of accidentals) {
        if (accidental === '#') {
          ++chroma;
        } else if (accidental === 'b') {
          --chroma;
        }
      }

      return chroma + 12 * (octave - minOctave);
    });
  });
}

export function parseChordNumerals(definition: ChallengeDefinition) {
  return definition.value.split(/,\s*/g);
}

export function removeSpaces(string: string) {
  return string.replace(/ /g, '_');
}

export function setMode(mode: Mode) {
  localStorage.setItem('mode', mode);
  return mode;
}

export function setScores(scores: Scores) {
  localStorage.setItem('scores', JSON.stringify(scores));
}

export function showElements(...elements: HTMLElement[]) {
  for (const element of elements) {
    element.style.visibility = 'visible';
  }
}

export function shuffleItems<T>(items: T[]): T[] {
  return [...items].sort(() => (Math.random() > 0.5 ? 1 : -1));
}

export function translateInterval(interval: string) {
  const [, number, letter] = interval.match(/([0-9]+)([ADMPdm])/) as string[];

  let accidental = '';

  switch (letter) {
    case 'A': {
      accidental = '#';
      break;
    }

    case 'D':
    case 'd':
    case 'm': {
      accidental = 'b';
      break;
    }
  }

  return accidental + number;
}
