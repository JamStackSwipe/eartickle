// src/utils/tickleSound.js

export const playTickle = () => {
  const audio = new Audio('/sounds/tickle.mp3');
  audio.play();
};

export const playTickleSent = () => {
  const audio = new Audio('/sounds/tickle-sent.mp3');
  audio.play();
};

export const playTickleWelcome = () => {
  const audio = new Audio('/sounds/tickle-welcome.mp3');
  audio.play();
};

export const playTickleSpecial = () => {
  const audio = new Audio('/sounds/tickle-sent.mp3'); // ✅ this file exists
  audio.play().catch((err) => {
    console.warn('⚠️ Boost sound failed:', err);
  });
};
