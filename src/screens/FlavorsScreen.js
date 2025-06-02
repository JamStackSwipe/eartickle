// src/screens/FlavorsScreen.js

import React from 'react';

const flavors = [
  {
    name: 'Country & Roots',
    tag: 'country_roots',
    styles: ['Country', 'Bluegrass', 'Christian Country', 'Americana'],
    emoji: '🤠',
  },
  {
    name: 'Hip-Hop & Flow',
    tag: 'hiphop_flow',
    styles: ['Rap', 'Trap', 'Conscious', 'Old School'],
    emoji: '🎤',
  },
  {
    name: 'Rock & Raw',
    tag: 'rock_raw',
    styles: ['Alt Rock', 'Punk', 'Emo', 'Grunge'],
    emoji: '🤘',
  },
  {
    name: 'Pop & Shine',
    tag: 'pop_shine',
    styles: ['Pop', 'R&B', 'ElectroPop', 'Indie Pop'],
    emoji: '✨',
  },
  {
    name: 'Spiritual & Soul',
    tag: 'spiritual_soul',
    styles: ['Gospel', 'Christian', 'Worship', 'Soul'],
    emoji: '✝️',
  },
];

const FlavorsScreen = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-extrabold text-center text-blue-700">🎶 EarTickle Flavors</h1>
      <p className="text-center text-gray-600">
        We group music by vibe, not just labels. These are the flavor zones of EarTickle — each one a unique sound universe.
      </p>
      <div className="space-y-6">
        {flavors.map((flavor) => (
          <div key={flavor.tag} className="bg-white border-l-4 border-blue-500 p-4 shadow rounded">
            <h2 className="text-xl font-bold text-blue-800">
              {flavor.emoji} {flavor.name}
            </h2>
            <p className="mt-1 text-gray-600 text-sm">
              Includes: {flavor.styles.join(', ')}
            </p>
            <p className="mt-2 text-gray-500 text-xs italic">
              Internal tag: <code>{flavor.tag}</code>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlavorsScreen;
