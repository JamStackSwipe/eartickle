import React, { useState } from "react";

const UploadScreen = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [cover, setCover] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !artist || !cover) {
      setMessage("Please fill in all fields.");
      return;
    }

    try {
      // TODO: Replace with API call to upload song
      console.log("Uploading:", { title, artist, cover });

      setMessage("✅ Song uploaded!");
      setTitle("");
      setArtist("");
      setCover("");
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Failed to upload song.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 p-8 rounded-lg max-w-md w-full shadow-xl"
      >
        <h1 className="text-2xl text-white font-bold text-center mb-6">
          Upload a Song
        </h1>
        <input
          type="text"
          placeholder="Song Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <input
          type="text"
          placeholder="Artist Name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <input
          type="text"
          placeholder="Cover Image URL"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded bg-gray-800 text-white border border-gray-600"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold"
        >
          Upload Song
        </button>
        {message && (
          <p className="text-center text-sm text-white mt-4">{message}</p>
        )}
      </form>
    </div>
  );
};

export default UploadScreen;
