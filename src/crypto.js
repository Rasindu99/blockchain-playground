// src/crypto.js
const crypto = require("crypto");

/**
 * Generate an ECDSA keypair using the secp256k1 curve (same curve used by Bitcoin/Ethereum).
 * Returns keys in PEM format (easy for Node crypto).
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "secp256k1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  return { publicKey, privateKey };
}

/**
 * Hash data with SHA-256 (common building block in blockchains).
 * Converts any input → fixed-length output
 * Deterministic (same input → same output)
 * One-way (cannot reverse)
 */
function sha256(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Sign a message hash with a private key.
 * Takes:
    hashHex → already hashed message
    privateKeyPem → secret key
 * Produces a signature
 * do not sign on raw data 
 * only sign on hashed data
 */
function signHash(privateKeyPem, hashHex) {
  const sign = crypto.createSign("SHA256");
  sign.update(hashHex);
  sign.end();
  return sign.sign(privateKeyPem, "hex"); // output format is hex, bcz easy to store, transmit, human-readable
}

/**
 * Verify a signature for a message hash with a public key.
 * Uses public key, original hash, signature 
 * Returns -> True ( if signature is valid )
 * Returns -> False (forged or Modified )
 */
function verifySignature(publicKeyPem, hashHex, signatureHex) {
  const verify = crypto.createVerify("SHA256");
  verify.update(hashHex);
  verify.end();
  return verify.verify(publicKeyPem, signatureHex, "hex");
}

/**
 * Derive a simple "address" from a public key.
 * Hashes public key
 * Takes first 40 hex characters
 * Adds 0x prefix
 * Real chains have specific address formats; here we do:
 * address = first 40 hex chars of sha256(publicKey)
 */
function addressFromPublicKey(publicKeyPem) {
  const pubHash = sha256(publicKeyPem);
  return "0x" + pubHash.slice(0, 40);
}

module.exports = {
  generateKeyPair,
  sha256,
  signHash,
  verifySignature,
  addressFromPublicKey,
};
