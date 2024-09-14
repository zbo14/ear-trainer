import { notes as chordNotes } from '@tonaljs/chord';
import { get as getNote, transpose } from '@tonaljs/note';
import { fromRomanNumerals as progression } from '@tonaljs/progression';
import { get as getScale } from '@tonaljs/scale';
import { ChallengeDefinition } from './types';

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

export function getChordNotes(chordName: string, note: string, octave: number) {
  chordName = chordName.replace(
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
  );

  return chordNotes(chordName || 'M', `${note}${octave}`);
}

export function getIntervalNotes(
  interval: string,
  note: string,
  octave: number
) {
  const tonic = `${note}${octave}`;

  return [[tonic], [transpose(tonic, interval)]];
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

export function getScaleNotes(scale: string, note: string, octave: number) {
  return getScale(`${note}${octave} ${scale}`).notes.map((note) => [note]);
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

export function showElements(...elements: HTMLElement[]) {
  for (const element of elements) {
    element.style.visibility = 'visible';
  }
}

export function shuffleItems<T>(items: T[]): T[] {
  return [...items].sort(() => (Math.random() > 0.5 ? 1 : -1));
}
