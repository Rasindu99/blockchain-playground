// src/wallet.js
const {
  generateKeyPair,
  addressFromPublicKey,
} = require("./crypto");

class Wallet {
  constructor({ publicKey, privateKey }) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.address = addressFromPublicKey(publicKey);
  }

  // static method belongs to the class can call by class name without having instance of it
  static create() {
    return new Wallet(generateKeyPair());
  }
}

module.exports = { Wallet };

/**
 * And also this is a factory method of object instantiation 
 * cretae method can be called by Wallet.create()
 * this will create instance of wallet
 * it will hides the complexity of object creation from the user 
 */
