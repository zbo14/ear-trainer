import 'custom-piano-keys';
import './style.css';
import { createChallenge } from './challenge';
import { Challenge, ChallengeType } from './types';
import { sampler } from './sampler';
import {
  hideElements,
  notesToPianoKeys,
  removeSpaces,
  showElements,
} from './util';

let answer: string = '';
let challenge: Challenge | null = null;
let challengeType: ChallengeType = 'chords';
let markedKeys: number[][] = [[]];
let noteLength = 1;

const pianoKeys = document.querySelector('custom-piano-keys') as HTMLElement;
const pResult = document.querySelector('p.result') as HTMLDivElement;

const buttonNewChallenge = document.querySelector(
  'sl-button.new-challenge'
) as HTMLButtonElement;

const buttonPlayChallenge = document.querySelector(
  'sl-button.play-challenge'
) as HTMLButtonElement;

const buttonCheckAnswer = document.querySelector(
  'sl-button.check-answer'
) as HTMLButtonElement;

const buttonTogglePiano = document.querySelector(
  'sl-button.toggle-piano'
) as HTMLButtonElement;

function setNewChallenge() {
  challenge = createChallenge(challengeType);
  markedKeys = notesToPianoKeys(challenge.notes);
  pResult.classList.remove('correct', 'incorrect');
  pResult.innerText = 'Result';
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

  buttonCheckAnswer.disabled = true;
}

export async function playChallenge() {
  if (!challenge) {
    return;
  }

  // TODO: fix issue with Tone.loop() not playing every note
  for (const [index, notes] of challenge.notes.entries()) {
    sampler.triggerAttackRelease(notes, String(noteLength));
    pianoKeys.setAttribute('marked-keys', markedKeys[index].join(' '));
    await new Promise((resolve) => setTimeout(resolve, noteLength * 1e3));
  }

  pianoKeys.setAttribute('marked-keys', '');
}

buttonNewChallenge?.addEventListener('click', () => {
  setNewChallenge();
});

buttonPlayChallenge.addEventListener('click', async () => {
  playChallenge();
});

buttonCheckAnswer.addEventListener('click', () => {
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

  if (buttonCheckAnswer.disabled) {
    buttonCheckAnswer.disabled = false;
  }
});

setNewChallenge();
