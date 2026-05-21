import StellarSdk from '@stellar/stellar-sdk';

export async function mintCredentialReceipt({ walletSecret, credentialData }) {
  const sourceKeypair = StellarSdk.Keypair.fromSecret(walletSecret);
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(sourceKeypair.publicKey());

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.manageData({
        name: 'pulse_learn_receipt',
        value: JSON.stringify(credentialData).slice(0, 64),
      })
    )
    .setTimeout(180)
    .build();

  transaction.sign(sourceKeypair);
  const response = await server.submitTransaction(transaction);
  return response.hash;
}
