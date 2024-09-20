import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import 'custom-piano-keys';
import './theme.css';

import SlDialog from '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import SlButton from '@shoelace-style/shoelace/dist/components/button/button.js';
import SlTabGroup from '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import SlSelect from '@shoelace-style/shoelace/dist/components/select/select.js';

import { createChallenge } from './challenge';
import { Challenge, ChallengeType } from './types';
import { sampler } from './sampler';

import {
  getMode,
  getScores,
  hideElements,
  notesToPianoKeys,
  removeSpaces,
  setMode,
  setScores,
  showElements,
} from './util';

let answer: string = '';
let challenge: Challenge | null = null;
let challengeType: ChallengeType = 'chords';
let guesses = 0;
let isPlaying = false;
let markedKeys: number[][] = [[]];
let mode = getMode();
let noteLength = 1;
let shouldRestart = false;
let shouldStop = false;
let scores = getScores();
let score = scores[challengeType];
let started = false;

const switchMode = document.querySelector('div.switch-mode > sl-switch');
const metaThemeColor = document.head.querySelector(
  'meta[name="theme-color"]'
) as HTMLMetaElement;

function changeBackgroundColor() {
  document.documentElement.style.backgroundColor = metaThemeColor.content =
    mode === 'dark' ? '#191c47' : '#f9f9ff';
}

switchMode?.addEventListener('sl-change', (event) => {
  const { checked } = event.target as HTMLInputElement;
  mode = setMode(checked ? 'dark' : 'light');

  if (mode === 'dark') {
    document.body.classList.add('sl-theme-dark');
  } else {
    document.body.classList.remove('sl-theme-dark');
  }

  changeBackgroundColor();
});

if (mode === 'dark') {
  switchMode?.setAttribute('checked', 'true');
}

changeBackgroundColor();

const dialog = document.querySelector('div.info > sl-dialog') as SlDialog;
const openDialogButton = dialog.nextElementSibling as SlButton;
const closeDialogButton = dialog.querySelector(
  'sl-button[slot="footer"]'
) as SlButton;

openDialogButton.addEventListener('click', () => dialog.show());
closeDialogButton.addEventListener('click', () => dialog.hide());

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
  stopPlayback();
  challenge = createChallenge(challengeType);
  guesses = 0;
  markedKeys = notesToPianoKeys(challenge.notes);
  pResult.classList.remove('correct', 'incorrect');
  pResult.innerText = 'Result';
  pianoKeys.setAttribute('marked-keys', '');
  started = false;
  setAnswerOptions();
}

function setAnswerOptions() {
  if (!challenge) {
    return;
  }

  selectAnswer.innerHTML = '';
  selectAnswer.value = '';

  for (const option of challenge.options) {
    const slOption = document.createElement('sl-option');
    slOption.setAttribute('value', removeSpaces(option.value));
    slOption.innerText = option.value;
    selectAnswer.append(slOption);
  }
}

async function playChallenge() {
  if (!challenge) {
    return;
  }

  if (isPlaying) {
    shouldRestart = true;
    return;
  }

  if (!started) {
    started = true;
    ++score.challengesStarted;
    renderScore();
  }

  isPlaying = true;
  pianoKeys.setAttribute('marked-keys', '');

  let index = 0;

  while (index < challenge.notes.length) {
    if (shouldRestart) {
      shouldRestart = false;
      index = 0;
      continue;
    }

    if (shouldStop) {
      shouldStop = false;
      break;
    }

    if (sampler.context.state !== 'running') {
      await sampler.context.resume();
    }

    sampler.triggerAttackRelease(challenge.notes[index], String(noteLength));
    pianoKeys.setAttribute('marked-keys', markedKeys[index].join(' '));
    await new Promise((resolve) => setTimeout(resolve, noteLength * 1e3));
    ++index;
  }

  isPlaying = false;
}

function stopPlayback() {
  if (shouldStop || !isPlaying) {
    return;
  }

  shouldStop = true;
}

function saveScores() {
  setScores(scores);
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

const tabChallengeType = document.querySelector(
  'sl-tab-group.challenge-type'
) as SlTabGroup;

const selectAnswer = document.querySelector('sl-select.answer') as SlSelect;

tabChallengeType?.addEventListener('sl-tab-show', (event: any) => {
  challengeType = event.detail.name as ChallengeType;
  score = scores[challengeType];
  renderScore();
  setNewChallenge();
});

selectAnswer?.addEventListener('sl-change', (event) => {
  answer = (event.target as SlSelect).value as string;

  if (!challenge || !answer) {
    return;
  }

  const score = scores[challengeType];
  ++score.totalGuesses;
  ++guesses;

  if (removeSpaces(challenge.answer.value) === answer) {
    ++score.challengesCompleted;
    pResult.classList.remove('incorrect');
    pResult.classList.add('correct');
    pResult.innerText = 'Correct';

    if (guesses === 1) {
      ++score.correctFirstGuesses;
    }

    renderScore();
  } else {
    pResult.classList.remove('correct');
    pResult.classList.add('incorrect');
    pResult.innerText = 'Try again';
  }
});

function renderScore() {
  pStarted.innerText = String(score.challengesStarted);
  pCompleted.innerText = String(score.challengesCompleted);
  pCorrect.innerText = String(score.correctFirstGuesses);
  pAverage.innerText = String(
    (Math.round((score.totalGuesses * 10) / score.challengesCompleted) || 0) /
      10
  );
}

function setPianoKeysWidth() {
  pianoKeys.setAttribute(
    'oct-w-factor',
    String(window.innerWidth <= 800 ? 1.25 : 1.5)
  );
}

document.addEventListener('visibilitychange', () => {
  saveScores();
});

window.addEventListener('beforeunload', () => {
  saveScores();
});

window.addEventListener('resize', () => {
  setPianoKeysWidth();
});

setNewChallenge();
setPianoKeysWidth();
renderScore();
