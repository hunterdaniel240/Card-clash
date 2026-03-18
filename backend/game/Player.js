class Player {
  constructor(id, name, role) {
    this.id = id;
    this.name = name;
    this.score = 0;
    this.role = role;

    this.answer = null;
    this.answeredAt = null;
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      score: this.score,
    };
  }
}

module.exports = { Player };
