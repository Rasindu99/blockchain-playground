// src/demo.js
const { Wallet } = require("./wallet");
const { Ledger } = require("./ledger");
const { Transaction } = require("./tx");
const { signHash } = require("./crypto");

function createSignedTx({ wallet, to, amount, nonce }) {
  const tx = new Transaction({
    from: wallet.address,
    to,
    amount,
    nonce,
    publicKey: wallet.publicKey,
    signature: null,
  });

  const signature = signHash(wallet.privateKey, tx.hash());
  tx.signature = signature;
  return tx;
}

function printState(label, ledger, wallets) {
  console.log(`\n=== ${label} ===`);
  for (const w of wallets) {
    console.log(`${w.address} balance = ${ledger.getBalance(w.address)}`);
  }
}

function main() {
  const ledger = new Ledger();

  // Create two wallets
  const alice = Wallet.create();
  const bob = Wallet.create();

  // Give Alice some initial funds (like a faucet / initial issuance)
  ledger.credit(alice.address, 100);

  printState("Initial", ledger, [alice, bob]);

  // Alice sends 30 to Bob
  const tx1 = createSignedTx({
    wallet: alice,
    to: bob.address,
    amount: 30,
    nonce: ledger.getNonce(alice.address),
  });

  ledger.applyTransaction(tx1);
  printState("After Alice -> Bob (30)", ledger, [alice, bob]);

  // Try replay attack: reuse same tx (same nonce) again
  try {
    ledger.applyTransaction(tx1);
  } catch (e) {
    console.log("\nReplay prevented:", e.message);
  }

  // Try to forge: Bob attempts to send from Alice address (should fail)
  try {
    const forged = createSignedTx({
      wallet: bob, // bob signs
      to: bob.address,
      amount: 10,
      nonce: ledger.getNonce(alice.address),
    });

    // but lie: forged "from" is Alice's addre`ss
    forged.from = alice.address;

    ledger.applyTransaction(forged);
  } catch (e) {
    console.log("\nForgery prevented:", e.message);
  }

  // Alice tries to overspend
  try {
    const tx2 = createSignedTx({
      wallet: alice,
      to: bob.address,
      amount: 1000,
      nonce: ledger.getNonce(alice.address),
    });
    ledger.applyTransaction(tx2);
  } catch (e) {
    console.log("\nOverspend prevented:", e.message);
  }

  printState("Final", ledger, [alice, bob]);
}

main();
