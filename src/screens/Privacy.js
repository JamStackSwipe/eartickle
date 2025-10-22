import React from 'react';

const Privacy = () => (
  <div className="min-h-screen bg-white text-black p-6 max-w-3xl mx-auto">
    <h1 className="text-2xl font-bold mb-4">🔒 Privacy Policy</h1>
    <p className="mb-4">
      EarTickle™ respects your privacy. We only collect the minimum data needed
      to make the platform work, including your email, display name, and
      avatar—provided through GitHub or Google login. Your data is securely
      stored in our database and is never sold or shared with third parties.
    </p>
    <p className="mb-4">
      Songs you upload are publicly viewable by others. Your profile, reactions,
      and JamStack additions are also visible as part of community interaction.
    </p>
    <p className="mb-4">
      We may use aggregated, anonymized data for internal analytics to improve
      the EarTickle experience.
    </p>
    <p className="mb-4">
      By using EarTickle, you consent to this policy. You may contact us at
      <strong> privacy@eartickle.com </strong> with any questions or deletion
      requests.
    </p>
  </div>
);

export default Privacy;
