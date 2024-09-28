import { Sampler, start } from 'tone';

const urls = {
  A0: 'A0.mp3',
  C8: 'C8.mp3',
};

for (let i = 2; i <= 6; i++) {
  Object.assign(urls, {
    [`C${i}`]: `C${i}.mp3`,
    [`D#${i}`]: `Ds${i}.mp3`,
    [`F#${i}`]: `Fs${i}.mp3`,
    [`A${i}`]: `A${i}.mp3`,
  });
}

export const sampler = new Sampler({
  urls,
  release: 1,
  baseUrl: 'https://tonejs.github.io/audio/salamander/',
}).toDestination();

start();
