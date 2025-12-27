const { Wallet } = require("./wallet");
const { Ledger } = require("./ledger");
const { Transaction } = require("./tx");
const { signHash } = require("./crypto");
const { Blockchain } = require("./blockchain");

function createSignedTx({ wallet, to, amount, nonce }) {
  const tx = new Transaction({
    from: wallet.address,
    to,
    amount,
    nonce,
    publicKey: wallet.publicKey,
    signature: null,
  });

  tx.signature = signHash(wallet.privateKey, tx.hash());
  return tx;
}

function printBalances(label, ledger, wallets) {
  console.log(`\n=== ${label} ===`);
  wallets.forEach(w =>
    console.log(`${w.address}: ${ledger.getBalance(w.address)}`)
  );
}

function main() {
  const ledger = new Ledger();
  const blockchain = new Blockchain();

  const alice = Wallet.create();
  const bob = Wallet.create();

  // Initial issuance (like genesis allocation)
  ledger.credit(alice.address, 100);

  printBalances("Initial", ledger, [alice, bob]);

  // Create transactions
  const tx1 = createSignedTx({
    wallet: alice,
    to: bob.address,
    amount: 30,
    nonce: ledger.getNonce(alice.address),
  });

  // Build a block
  const block1 = blockchain.addBlock([tx1]);

  console.log('block created:', block1);

  // Apply block to ledger
  ledger.applyBlock(block1);

  printBalances("After Block 1", ledger, [alice, bob]);

  // Validate chain integrity
  blockchain.validateChain();
  console.log("\nBlockchain valid ✔");

  // This change of amount is example to tempering block
  // blockchain.chain[1].transactions[0].amount = 999;
  // blockchain.validateChain();
}

main();
