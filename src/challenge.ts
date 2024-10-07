import config from './challenge.config';
import {
  ChallengeType,
  Challenge,
  ChallengeDefinition,
  ChallengeLevel,
} from './types';

import {
  chooseRandom,
  chooseRandoms,
  getChordNotes,
  getIntervalNotes,
  getProgressionNotes,
  getScaleNotes,
  parseChordNumerals,
} from './util';

export function createChallenge(
  type: ChallengeType,
  level: ChallengeLevel
): Challenge {
  const definitions = (config[type] as ChallengeDefinition[]).filter(
    (definition) => {
      switch (level) {
        case 'easy': {
          return definition.level === 'easy';
        }

        case 'medium': {
          return ['easy', 'medium'].includes(definition.level);
        }
      }

      return true;
    }
  );

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
      const chordNumerals = parseChordNumerals(definition.value);
      const filteredDefinitions = definitions.filter(
        (otherDefinition) =>
          otherDefinition.value !== definition.value &&
          parseChordNumerals(otherDefinition.value).length ===
            chordNumerals.length
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
