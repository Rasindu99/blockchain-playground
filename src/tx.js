// src/tx.js
const { sha256 } = require("./crypto");

/**
 * Transaction data model (simplified)
 * from: sender address
 * to: receiver address
 * amount: number
 * nonce: prevents replay (like "transaction count")
 * signature: proof of authorization
 * publicKey: used by others to verify signature
 */
class Transaction {
  constructor({ from, to, amount, nonce, publicKey, signature }) {
    this.from = from;
    this.to = to;
    this.amount = amount;
    this.nonce = nonce;
    this.publicKey = publicKey;
    this.signature = signature;
  }

  /**
   * What gets hashed and signed must be deterministic.
   * Signature is NOT included in the hash (otherwise infinite recursion).
   * Transaction is Stateful object
   * Thats why first we initialize using constructor
   * const tx = new Transaction(...);
   * tx.hash()
   */
  hash() {
    return sha256(
      JSON.stringify({
        from: this.from,
        to: this.to,
        amount: this.amount,
        nonce: this.nonce,
        publicKey: this.publicKey,
      })
    );
  }
}

module.exports = { Transaction };



/**
 * WHY NOT TRANSACTION INCLUDE SIGNATURE ---
 * If signature were included:
 * Hash depends on signature
 * Signature depends on hash
 * Infinite loop 🔁
 */
