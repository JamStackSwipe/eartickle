// src/utils/tickleSound.js
export const playTickle = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle.mp3');
    audio.play();
  }
};

export const playTickleSent = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle-sent.mp3');
    audio.play();
  }
};

export const playTickleWelcome = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle-welcome.mp3');
    audio.play();
  }
};

export const playTickleSpecial = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle-sent.mp3');
    audio.play().catch((err) => {
      console.warn('⚠️ Boost sound failed:', err);
    });
  }
};
