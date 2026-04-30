class Player {
  constructor(socketId, userId, name, role) {
    this.socketId = socketId;
    this.userId = userId;
    this.name = name;
    this.score = 0;
    this.role = role;

    this.answer = null;
    this.answeredAt = null;
  }

  toDTO() {
    return {
      socketId: this.socketId,
      userId: this.userId,
      name: this.name,
      score: this.score,
    };
  }
}

module.exports = { Player };
