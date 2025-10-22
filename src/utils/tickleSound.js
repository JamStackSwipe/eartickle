// utils/tickleSound.js – SSR-safe (already good); Next.js ready
// Place in root /utils/ (post-flatten)

export const playTickle = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle.mp3');
    audio.play().catch(console.warn);
  }
};

export const playTickleSent = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle-sent.mp3');
    audio.play().catch(console.warn);
  }
};

export const playTickleWelcome = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle-welcome.mp3');
    audio.play().catch(console.warn);
  }
};

export const playTickleSpecial = () => {
  if (typeof window !== 'undefined') {
    const audio = new Audio('/sounds/tickle-special.mp3'); // Updated for special
    audio.play().catch(console.warn);
  }
};
