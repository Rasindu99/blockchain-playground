const { verifySignature, addressFromPublicKey } = require("./crypto");

class Ledger {
  constructor() {
    this.balances = new Map(); // address -> number
    this.nonces = new Map();   // address -> number
  }

  getBalance(address) {
    return this.balances.get(address) ?? 0;
  }

  getNonce(address) {
    return this.nonces.get(address) ?? 0;
  }

  credit(address, amount) {
    const current = this.getBalance(address);
    this.balances.set(address, current + amount);
  }

  /**
   * Apply a transaction if valid.
   * Validations:
   * 1) publicKey must match from address
   * 2) signature must verify
   * 3) nonce must match expected (prevents replay)
   * 4) sender must have enough balance
   */
  applyTransaction(tx) {
    // 1) publicKey => address check
    const derivedFrom = addressFromPublicKey(tx.publicKey);
    if (derivedFrom !== tx.from) {
      throw new Error("Invalid tx: publicKey does not match from address.");
    }

    // 2) signature check
    const ok = verifySignature(tx.publicKey, tx.hash(), tx.signature);
    if (!ok) {
      throw new Error("Invalid tx: signature verification failed.");
    }

    // 3) nonce check
    const expectedNonce = this.getNonce(tx.from);
    if (tx.nonce !== expectedNonce) {
      throw new Error(
        `Invalid tx: bad nonce. expected=${expectedNonce}, got=${tx.nonce}`
      );
    }

    // 4) balance check
    const senderBal = this.getBalance(tx.from);
    if (senderBal < tx.amount) {
      throw new Error(
        `Invalid tx: insufficient funds. balance=${senderBal}, amount=${tx.amount}`
      );
    }

    // Apply state changes
    this.balances.set(tx.from, senderBal - tx.amount);
    this.credit(tx.to, tx.amount);

    // Increment nonce after successful tx
    this.nonces.set(tx.from, expectedNonce + 1);

    return true;
  }
}

module.exports = { Ledger };

/*
  
We increment only the sender’s nonce because nonce tracks signed outgoing transactions, 
and the receiver neither signs nor authorizes anything, 
so incrementing their nonce would be meaningless and dangerous.

*/
