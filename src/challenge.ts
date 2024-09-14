import config from './challenge.config';
import { ChallengeType, Challenge, ChallengeDefinition } from './types';

import {
  chooseRandom,
  chooseRandoms,
  getChordNotes,
  getIntervalNotes,
  getProgressionNotes,
  getScaleNotes,
  parseChordNumerals,
} from './util';

export function createChallenge(type: ChallengeType): Challenge {
  const definitions = config[type] as ChallengeDefinition[];
  const note = chooseRandom(config.notes);
  const octave = chooseRandom(config.octaves);

  switch (type) {
    case 'chords': {
      const options = chooseRandoms(definitions, 8);
      const definition = chooseRandom(options);
      const notes = getChordNotes(definition.value, note, octave);

      return {
        answer: definition,
        note,
        notes: [notes],
        octave,
        options,
        type,
      };
    }

    case 'intervals': {
      const definition = chooseRandom(definitions);
      const notes = getIntervalNotes(definition.value, note, octave);

      return {
        answer: definition,
        note,
        notes,
        octave,
        options: definitions,
        type,
      };
    }

    case 'progressions': {
      const definition = chooseRandom(definitions);
      const chordNumerals = parseChordNumerals(definition);
      const filteredDefinitions = definitions.filter(
        (definition) =>
          parseChordNumerals(definition).length === chordNumerals.length
      );
      const options = chooseRandoms(filteredDefinitions, 5, definition);
      const notes = getProgressionNotes(chordNumerals, note, octave);

      return {
        answer: definition,
        note,
        notes,
        octave,
        options,
        type,
      };
    }

    case 'scales': {
      const options = chooseRandoms(definitions, 6);
      const definition = chooseRandom(options);
      const notes = getScaleNotes(definition.value, note, octave);

      return {
        answer: definition,
        note,
        notes,
        octave,
        options,
        type,
      };
    }
  }
}
