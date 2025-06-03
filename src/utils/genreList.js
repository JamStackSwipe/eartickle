// src/utils/genreList.js

export const genreFlavorMap = {
  country: {
    color: 'amber-500',
    label: 'Country',
    emoji: '🤠',
  },
  christian: {
    color: 'blue-400',
    label: 'Christian',
    emoji: '🙏',
  },
  rock: {
    color: 'red-500',
    label: 'Rock',
    emoji: '🎸',
  },
  hiphop: {
    color: 'green-500',
    label: 'Hip-Hop',
    emoji: '🎤',
  },
  pop: {
    color: 'pink-400',
    label: 'Pop',
    emoji: '💃',
  },
  acoustic: {
    color: 'yellow-400',
    label: 'Acoustic',
    emoji: '🎻',
  },
};

// Optional: use this if you want to list genres in a dropdown
export const genreOptions = Object.keys(genreFlavorMap);
