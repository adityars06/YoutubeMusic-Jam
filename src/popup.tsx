import { useState } from "react";

const YouTubeJam = () => {
  const [generatedCode, setGeneratedCode] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [joinedRoom, setJoinedRoom] = useState("");
  const [copyStatus, setCopyStatus] = useState("");

  const handleCreateSession = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCode(newCode);
    setJoinedRoom("");
    setShowJoinInput(false);
    setCopyStatus("");
  };

  const handleJoinSession = () => {
    if (sessionCode.trim()) {
      setJoinedRoom(sessionCode.trim());
      setGeneratedCode("");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode).then(() => {
      setCopyStatus("Code copied!");
      setTimeout(() => setCopyStatus(""), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center px-4">
      <div className="bg-neutral-900 text-white p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-red-500 tracking-wider drop-shadow-lg">
          YouTubeParty
        </h2>

        {!generatedCode && !showJoinInput && !joinedRoom && (
          <div className="space-y-4">
            <button
              className="bg-green-600 hover:bg-green-500 transition-colors w-full py-3 px-6 rounded-xl text-lg font-semibold cursor-pointer"
              onClick={handleCreateSession}
            >
              Create New Session
            </button>
            <button
              className="bg-red-600 hover:bg-red-500 transition-colors w-full py-3 px-6 rounded-xl text-lg font-semibold cursor-pointer"
              onClick={() => {
                setShowJoinInput(true);
                setGeneratedCode("");
                setJoinedRoom("");
              }}
            >
              Join a Session
            </button>
          </div>
        )}

        {generatedCode && (
          <div className="mt-6 text-center bg-green-900/20 p-4 rounded-xl border border-green-700">
            <p className="text-lg font-semibold text-green-400">🎉 Session Created!</p>
            <p className="text-sm mt-1 text-green-300 tracking-wide">
              Code: <span className="font-mono text-white">{generatedCode}</span>
            </p>
            <button
              className="mt-3 bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg text-sm cursor-pointer"
              onClick={handleCopy}
            >
              Copy to Clipboard
            </button>
            {copyStatus && <p className="text-green-400 mt-2 text-sm">{copyStatus}</p>}
          </div>
        )}

        {showJoinInput && (
          <div className="mt-6">
            <input
              type="text"
              placeholder="Enter Session Code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              className="w-full p-3 rounded-xl text-white mb-4 outline-none border border-gray-300"
            />
            <button
              className="bg-red-600 hover:bg-red-500 transition-colors w-full py-3 px-6 rounded-xl text-lg font-semibold cursor-pointer"
              onClick={handleJoinSession}
            >
              Join Session
            </button>
          </div>
        )}

        {joinedRoom && (
          <div className="mt-6 text-center bg-blue-900/20 p-4 rounded-xl border border-blue-700">
            <p className="text-blue-300 text-sm">✅ You have joined room:</p>
            <p className="text-white font-mono text-lg mt-1">{joinedRoom}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeJam;