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

// Update player score
async function updatePlayerScoreController(data) {
  try {
    const userIds = data.scores.map((player) => player.userId);
    const scores = data.scores.map((player) => player.score);

    const updated_result = await GamePlayer.updateScore(
      data.gameId,
      userIds,
      scores,
    );

    console.log(
      "Game scores updated to DB for " +
        data.join_code +
        ": " +
        updated_result.rowCount +
        " added",
    );
  } catch (err) {
    console.error(err);
  }
}

module.exports = {
  addPlayersController,
  updatePlayerScoreController,
};
