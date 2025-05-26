// src/screens/AboutScreen.js
import React from 'react';

const AboutScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white px-6 py-12 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-extrabold mb-6 text-teal-400 text-center">Why We Built EarTickle</h1>

        <p className="mb-6 text-gray-300 text-lg">
          EarTickle™ is more than a music platform — it’s a tribute to the good old days, when music was sacred, physical, and personal.
          Back when we stacked cassettes and CDs, flipped through them at the lake, the park, in our cars, and let the music carry us.
          You didn’t just press play — you built a vibe, a stack, a soundtrack to your life.
        </p>

        <p className="mb-6 text-gray-300 text-lg">
          We built EarTickle for that feeling. That connection. The nostalgia of discovery.
          Because today’s platforms — while convenient — have stripped away the soul. They pay artists fractions of pennies.
          They feed us the same sound, over and over, shaped by money, not meaning.
        </p>

        <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-400 mb-6">
          “In a truly fair system, money can’t buy success. Talent and truth carry you to the top.”
        </blockquote>

        <p className="mb-6 text-gray-300 text-lg">
          We believe real music still matters. That <span className="text-teal-400">passion is power</span>, and <span className="text-teal-400">songs with meaning</span> can still move people.
          Art isn’t dead — it’s just been buried under noise. It’s the first thing lost in a culture that’s slipping.
        </p>

        <p className="mb-6 text-gray-300 text-lg">
          That’s why we made EarTickle. A platform where:
        </p>

        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
          <li>You discover songs by swiping — not scrolling endlessly.</li>
          <li>You build your own JamStack™ — your personal mixtape revival.</li>
          <li>Artists can upload in seconds and actually reach people.</li>
          <li>You can reward artists who move you — directly.</li>
          <li>And one day, we hope, talent will rise on its own merit again.</li>
        </ul>

        <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-400 mb-6">
          “The music today often glorifies despair — drugs, sex, violence, pain. But we believe music can still inspire. Still heal. Still bring hope.”
        </blockquote>

        <p className="mb-10 text-gray-300 text-lg">
          EarTickle is our way of fighting for the artists who still care.
          For the kids who still dream.
          For the fans who miss how music used to feel.
        </p>

        <h2 className="text-xl font-semibold text-gray-200 text-center">This isn’t just another app. It’s a mission.<br/>And you’re part of it.</h2>
      </div>
    </div>
  );
};

export default AboutScreen;
