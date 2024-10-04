import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/radio-button/radio-button.js';
import '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import '@shoelace-style/shoelace/dist/components/range/range.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab-panel/tab-panel.js';
import 'custom-piano-keys';
import './theme.css';

import SlButton from '@shoelace-style/shoelace/dist/components/button/button.js';
import SlRadioGroup from '@shoelace-style/shoelace/dist/components/radio-group/radio-group.js';
import SlRange from '@shoelace-style/shoelace/dist/components/range/range.js';
import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.js';

import { ChallengeType } from './types';
import { sampler } from './sampler';
import { state } from './state';

import {
  getChordIntervals,
  getMode,
  getScaleIntervals,
  getScores,
  hideElements,
  removeSpaces,
  showElements,
  translateInterval,
  translateProgression,
} from './util';

state.localStorage = window.localStorage;
state.setMode(getMode());
state.setScores(getScores());

const switchMode = document.querySelector('div.switch-mode > sl-switch');
const metaThemeColor = document.head.querySelector(
  'meta[name="theme-color"]'
) as HTMLMetaElement;

function changeBackgroundColor() {
  document.documentElement.style.backgroundColor = metaThemeColor.content =
    state.mode === 'dark' ? '#191c47' : '#f9f9ff';
}

switchMode?.addEventListener('sl-change', (event) => {
  const { checked } = event.target as HTMLInputElement;
  state.setMode(checked ? 'dark' : 'light');

  if (state.mode === 'dark') {
    document.body.classList.add('sl-theme-dark');
  } else {
    document.body.classList.remove('sl-theme-dark');
  }

  changeBackgroundColor();
});

if (state.mode === 'dark') {
  switchMode?.setAttribute('checked', 'true');
}

changeBackgroundColor();

const rangeSpeed = document.querySelector('sl-range.speed') as SlRange;

rangeSpeed.addEventListener('sl-change', () => {
  state.noteLength = rangeSpeed.value;
});

const pianoKeys = document.querySelector('custom-piano-keys') as HTMLElement;
const pResult = document.querySelector('p.result') as HTMLParagraphElement;
const pCompleted = document.querySelector(
  'div.score-field.completed > p.value'
) as HTMLParagraphElement;
const pStarted = document.querySelector(
  'div.score-field.started > p.value'
) as HTMLParagraphElement;
const pCorrect = document.querySelector(
  'div.score-field.correct > p.value'
) as HTMLParagraphElement;
const pAverage = document.querySelector(
  'div.score-field.average > p.value'
) as HTMLParagraphElement;

const buttonNewChallenge = document.querySelector(
  'sl-button.new-challenge'
) as SlButton;

const buttonPlayChallenge = document.querySelector(
  'sl-button.play-challenge'
) as SlButton;

const buttonTogglePiano = document.querySelector(
  'sl-button.toggle-piano'
) as SlButton;

function setNewChallenge() {
  state.stopPlayback();
  state.setNewChallenge();
  pResult.classList.remove('correct', 'incorrect');
  pResult.innerText = 'Result';
  pianoKeys.setAttribute('marked-keys', '');
  setAnswerOptions();
}

function setAnswerOptions() {
  if (!state.challenge) {
    return;
  }

  selectAnswer.innerHTML = '';
  selectAnswer.value = '';

  for (const option of state.challenge.options) {
    const slOption = document.createElement('sl-option');
    slOption.setAttribute('value', removeSpaces(option.value));

    switch (state.challengeType) {
      case 'chords': {
        const small = document.createElement('small');
        small.setAttribute('slot', 'suffix');
        small.innerText = getChordIntervals(
          option.value,
          state.challenge.note
        ).join(', ');
        slOption.innerText = option.value;
        slOption.append(small);
        break;
      }

      case 'intervals': {
        slOption.innerText = translateInterval(option.value);
        break;
      }

      case 'scales': {
        const small = document.createElement('small');
        small.setAttribute('slot', 'suffix');
        small.innerText = getScaleIntervals(
          option.value,
          state.challenge.note
        ).join(', ');
        slOption.innerText = option.value;
        slOption.append(small);
        break;
      }

      case 'progressions': {
        slOption.innerText = translateProgression(option.value);
        break;
      }

      default: {
        slOption.innerText = option.value;
      }
    }

    selectAnswer.append(slOption);
  }
}

async function playChallenge() {
  if (!state.challenge) {
    return;
  }

  if (state.isPlaying) {
    state.shouldRestart = true;
    return;
  }

  if (!state.started) {
    state.startChallenge();
    renderScore();
  }

  state.isPlaying = true;
  pianoKeys.setAttribute('marked-keys', '');

  let index = 0;

  while (index < state.challenge.notes.length) {
    if (state.shouldRestart) {
      state.shouldRestart = false;
      index = 0;
      continue;
    }

    if (state.shouldStop) {
      state.shouldStop = false;
      break;
    }

    if (sampler.context.state !== 'running') {
      await sampler.context.resume();
    }

    sampler.triggerAttackRelease(
      state.challenge.notes[index],
      String(state.noteLength)
    );
    pianoKeys.setAttribute('marked-keys', state.markedKeys[index].join(' '));
    await new Promise((resolve) => setTimeout(resolve, state.noteLength * 1e3));
    ++index;
  }

  state.isPlaying = false;
}

buttonNewChallenge?.addEventListener('click', () => {
  setNewChallenge();
});

buttonPlayChallenge.addEventListener('click', async () => {
  playChallenge();
});

buttonTogglePiano.addEventListener('click', () => {
  const text = buttonTogglePiano.innerText;

  if (text === 'Hide piano') {
    hideElements(pianoKeys);
    buttonTogglePiano.innerText = 'Show piano';
  } else {
    showElements(pianoKeys);
    buttonTogglePiano.innerText = 'Hide piano';
  }
});

const radioGroupChallengeType = document.querySelector(
  'sl-radio-group.challenge-type'
) as SlRadioGroup;

const selectAnswer = document.querySelector('sl-select.answer') as SlSelect;

radioGroupChallengeType?.addEventListener('sl-change', () => {
  state.changeChallengeType(radioGroupChallengeType.value as ChallengeType);
  renderScore();
  setNewChallenge();
});

selectAnswer?.addEventListener('sl-change', (event) => {
  const answer = (event.target as SlSelect).value as string;
  const isCorrect = state.guess(answer);

  if (isCorrect) {
    pResult.classList.remove('incorrect');
    pResult.classList.add('correct');
    pResult.innerText = 'Correct';
    renderScore();
  } else {
    pResult.classList.remove('correct');
    pResult.classList.add('incorrect');
    pResult.innerText = 'Try again';
  }
});

function renderScore() {
  pStarted.innerText = String(state.score.challengesStarted);
  pCompleted.innerText = String(state.score.challengesCompleted);
  pCorrect.innerText = String(state.score.correctFirstGuesses);
  pAverage.innerText = String(state.scoreAverage);
}

function setPianoKeysWidth() {
  pianoKeys.setAttribute(
    'oct-w-factor',
    String(window.innerWidth <= 800 ? 1.1 : 1.5)
  );
}

document.addEventListener('visibilitychange', () => {
  state.setScores();
});

window.addEventListener('beforeunload', () => {
  state.setScores();
});

window.addEventListener('resize', () => {
  setPianoKeysWidth();
});

setNewChallenge();
setPianoKeysWidth();
renderScore();
