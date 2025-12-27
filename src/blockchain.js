// src/blockchain.js
const { Block } = require("./block");

class Blockchain {
  // once the initial blockchain created , it cretaed with genesis block
  constructor() {
    this.chain = [this.createGenesisBlock()];
  }

  createGenesisBlock() {
    return new Block({
      index: 0,
      previousHash: "0".repeat(64),
      transactions: [],
    });
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(transactions) {
    const block = new Block({
      index: this.chain.length,
      previousHash: this.getLatestBlock().hash,
      transactions,
    });

    this.chain.push(block);
    return block;
  }

  validateChain() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.previousHash !== previous.hash) {
        throw new Error("Invalid chain: broken hash link");
      }

      if (current.computeHash() !== current.hash) {
        throw new Error("Invalid chain: block tampered");
      }
    }
    return true;
  }
}

module.exports = { Blockchain };
