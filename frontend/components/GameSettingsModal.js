import { useState } from "react";

export default function GameSettingsModal({
  setShowGameSettingsModal,
  setSettings,
  settings,
  join_code,
  socket,
}) {
  const [modalSettings, setModalSettings] = useState(settings);

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;

    setModalSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleSaveSettings = () => {
    socket.emit(
      "update-game-settings",
      {
        join_code,
        settings: modalSettings,
      },
      (updatedSettings) => {
        if (updatedSettings) {
          setSettings(updatedSettings);
        }
      },
    );

    setShowGameSettingsModal(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-xl font-semibold mb-4">Game Settings</h2>

        {/* Time Per Question */}
        <label className="block mb-2 font-semibold">
          Time Per Question (seconds)
        </label>
        <input
          type="number"
          name="timePerQuestion"
          value={modalSettings.timePerQuestion}
          onChange={handleSettingsChange}
          className="border p-2 w-full mb-4 rounded"
          min="5"
          max="120"
        />

        {/* Max Players */}
        <label className="block mb-2 font-semibold">Max Players</label>
        <input
          type="number"
          name="maxPlayers"
          value={modalSettings.maxPlayers}
          onChange={handleSettingsChange}
          className="border p-2 w-full mb-4 rounded"
          min="2"
          max="100"
        />

        {/* Shuffle Questions */}
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            name="shuffleQuestions"
            checked={modalSettings.shuffleQuestions}
            onChange={handleSettingsChange}
            className="mr-2"
          />
          <label>Shuffle Questions</label>
        </div>

        {/* Show Correct Answer */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="showAnswer"
            checked={modalSettings.showAnswer}
            onChange={handleSettingsChange}
            className="mr-2"
          />
          <label>Show Correct Answer After Question</label>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Save
          </button>

          <button
            onClick={() => setShowGameSettingsModal(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
