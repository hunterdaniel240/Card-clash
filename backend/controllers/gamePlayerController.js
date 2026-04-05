const GamePlayer = require("../models/GamePlayer");

// Add a player to a game
async function addPlayersController(data) {
  try {
    // formats as below
    // ($1, $2), ...
    const placeholder = [...data.players.values()]
      .map((_, i) => `($${i * 2 + 1}, $${i * 2 + 2})`)
      .join(", ");

    const values = [...data.players.values()].flatMap((player) => [
      data.gameId,
      player.userId,
    ]);

    const gamePlayer_result = await GamePlayer.addPlayers(placeholder, values);
    console.log(
      "Game Players Added to DB for " +
        data.join_code +
        ": " +
        gamePlayer_result.rowCount +
        " added",
    );
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Remove a player from a game
async function removePlayerController(req, res) {
  try {
    const removed = await GamePlayer.removePlayer(req.params.id);
    if (!removed) return res.status(404).json({ message: "Player not found" });
    res.json({ message: "Player removed", player: removed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to remove player" });
  }
}

// Get all players in a game
async function getPlayersByGameController(req, res) {
  try {
    const players = await GamePlayer.getPlayersByGame(req.params.gameId);
    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch players" });
  }
}

// Update player score
async function updatePlayerScoreController(req, res) {
  try {
    const updated = await GamePlayer.updateScore(req.params.id, req.body.score);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update score" });
  }
}

module.exports = {
  addPlayersController,
  removePlayerController,
  getPlayersByGameController,
  updatePlayerScoreController,
};
