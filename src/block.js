// src/block.js
const { sha256 } = require("./crypto");

class Block {
  constructor({ index, previousHash, transactions, timestamp = Date.now() }) {
    this.index = index;
    this.previousHash = previousHash;
    this.transactions = transactions;
    this.timestamp = timestamp;
    this.hash = this.computeHash();
  }

  // Generate hash of the current block
  computeHash() {
    return sha256(
      JSON.stringify({
        index: this.index,
        previousHash: this.previousHash,
        transactions: this.transactions.map(tx => tx.hash()),
        timestamp: this.timestamp,
      })
    );
  }
}

module.exports = { Block };


/*

WHY Blocks must be hashable ?

  Hashing gives:
    * immutability
    * tamper detection
    * chaining between blocks
  
  Once a block is created, its hash represents all its data
  any changes into its data causes completely different hash

 */