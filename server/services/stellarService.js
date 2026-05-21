import StellarSdk from '@stellar/stellar-sdk';
import { buildStellarDataKey, buildStellarDataValue } from './stellarUtils.js';

export async function mintCredentialReceipt({ walletSecret, credentialData }) {
  const secret = walletSecret || process.env.WALLET_SECRET;
  if (!secret) {
    throw new Error('Stellar secret key is required');
  }

  const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(sourceKeypair.publicKey());

  const dataValue = buildStellarDataValue(credentialData);
  const dataKey = buildStellarDataKey(credentialData?.roadmapId || 'receipt');

  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      StellarSdk.Operation.manageData({
        name: dataKey,
        value: dataValue,
      })
    )
    .addMemo(StellarSdk.Memo.text(`pulse-learn:${new Date().toISOString()}`))
    .setTimeout(180)
    .build();

  transaction.sign(sourceKeypair);
  const response = await server.submitTransaction(transaction);
  return response.hash;
}
