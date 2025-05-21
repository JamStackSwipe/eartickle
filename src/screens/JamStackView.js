// src/components/JamStackView.js
const JamStackView = ({ jamstack }) => {
  if (!jamstack || jamstack.length === 0) {
    return <p>You haven’t added any songs to your JamStack yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {jamstack.map((jam) => (
        <li key={jam.id} className="border p-4 rounded shadow bg-white dark:bg-gray-800">
          <h2 className="text-lg font-semibold">
            {jam.title || 'Untitled'}
          </h2>
          {jam.description && (
            <p className="text-sm text-gray-500">{jam.description}</p>
          )}
        </li>
      ))}
    </ul>
  );
};

export default JamStackView;
