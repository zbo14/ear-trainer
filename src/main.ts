import '@shoelace-style/shoelace/dist/themes/light.css';
import '@shoelace-style/shoelace/dist/themes/dark.css';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/dialog/dialog.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';
import '@shoelace-style/shoelace/dist/components/option/option.js';
import '@shoelace-style/shoelace/dist/components/select/select.js';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import 'custom-piano-keys';
import './style.css';

import { createChallenge } from './challenge';
import { Challenge, ChallengeType } from './types';
import { sampler } from './sampler';

import {
  getMode,
  hideElements,
  notesToPianoKeys,
  removeSpaces,
  setMode,
  showElements,
} from './util';

let answer: string = '';
let challenge: Challenge | null = null;
let challengeType: ChallengeType = 'chords';
let isPlaying = false;
let markedKeys: number[][] = [[]];
let mode = getMode();
let noteLength = 1;

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

const dialog = document.querySelector('div.info > sl-dialog') as any;
const openDialogButton = dialog.nextElementSibling;
const closeDialogButton = dialog.querySelector('sl-button[slot="footer"]');

openDialogButton.addEventListener('click', () => dialog.show());
closeDialogButton.addEventListener('click', () => dialog.hide());

const pianoKeys = document.querySelector('custom-piano-keys') as HTMLElement;
const pResult = document.querySelector('p.result') as HTMLDivElement;

const buttonNewChallenge = document.querySelector(
  'sl-button.new-challenge'
) as HTMLButtonElement;

const buttonPlayChallenge = document.querySelector(
  'sl-button.play-challenge'
) as HTMLButtonElement;

const buttonTogglePiano = document.querySelector(
  'sl-button.toggle-piano'
) as HTMLButtonElement;

function setNewChallenge() {
  challenge = createChallenge(challengeType);
  markedKeys = notesToPianoKeys(challenge.notes);
  pResult.classList.remove('correct', 'incorrect');
  pResult.innerText = 'Result';
  pianoKeys.setAttribute('marked-keys', '');
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

export async function playChallenge() {
  if (!challenge || isPlaying) {
    return;
  }

  isPlaying = true;
  pianoKeys.setAttribute('marked-keys', '');

  // TODO: fix issue with Tone.loop() not playing every note
  for (const [index, notes] of challenge.notes.entries()) {
    if (sampler.context.state !== 'running') {
      await sampler.context.resume();
    }

    sampler.triggerAttackRelease(notes, String(noteLength));
    pianoKeys.setAttribute('marked-keys', markedKeys[index].join(' '));
    await new Promise((resolve) => setTimeout(resolve, noteLength * 1e3));
  }

  isPlaying = false;
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

const selectChallengeType = document.querySelector(
  'sl-select.challenge-type'
) as HTMLSelectElement;

const selectAnswer = document.querySelector(
  'sl-select.answer'
) as HTMLSelectElement;

selectChallengeType?.addEventListener('sl-change', (event) => {
  challengeType = (event.target as HTMLSelectElement).value as ChallengeType;
  setNewChallenge();
});

selectAnswer?.addEventListener('sl-change', (event) => {
  answer = (event.target as HTMLSelectElement).value;

  if (!challenge || !answer) {
    return;
  }

  if (removeSpaces(challenge.answer.value) === answer) {
    pResult.classList.remove('incorrect');
    pResult.classList.add('correct');
    pResult.innerText = 'Correct';
  } else {
    pResult.classList.remove('correct');
    pResult.classList.add('incorrect');
    pResult.innerText = 'Try again';
  }
});

function setPianoKeysWidth() {
  pianoKeys.setAttribute(
    'oct-w-factor',
    String(window.innerWidth <= 800 ? 1.25 : 1.5)
  );
}

window.addEventListener('resize', () => {
  setPianoKeysWidth();
});

setNewChallenge();
setPianoKeysWidth();
