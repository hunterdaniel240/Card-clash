class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.isReady = false;
    this.score = 0;
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      isReady: this.isReady,
      score: this.score,
    };
  }
}

module.exports = { Player };
