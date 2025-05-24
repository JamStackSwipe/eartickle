import React from 'react';

const Terms = () => (
  <div className="min-h-screen bg-white text-black p-6 max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">📄 Terms of Use</h1>
    <p className="mb-4">
      By using EarTickle™, you agree to follow the rules below. We aim to
      provide a safe, fun, and creative space for music discovery and artist
      support.
    </p>
    <ul className="list-disc list-inside mb-4 space-y-2">
      <li>No illegal, hateful, or explicit content may be uploaded.</li>
      <li>You retain full rights to songs you upload.</li>
      <li>Do not impersonate others or create misleading profiles.</li>
      <li>We reserve the right to remove content or ban accounts that violate these terms.</li>
      <li>We are not responsible for any losses due to misuse of the platform.</li>
    </ul>
    <p className="mb-4">
      All content and code are the property of their respective owners. Use of
      the platform indicates agreement to these terms.
    </p>
    <p className="text-sm text-gray-500">
      For questions, contact us at <strong>support@eartickle.com</strong>
    </p>
  </div>
);

export default Terms;
