import StellarSdk from '@stellar/stellar-sdk';
import { buildStellarDataKey, buildStellarDataValue } from './stellarUtils.js';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export async function mintCredentialReceipt({ walletSecret, credentialData }) {
  const secret = walletSecret || process.env.WALLET_SECRET;
  if (!secret) {
    throw new Error('Stellar secret key is required');
  }

  const sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
  const server = new StellarSdk.Server(HORIZON_URL);
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

export async function verifyStellarReceipt(txHash) {
  if (!txHash) {
    throw new Error('Transaction hash is required for Stellar verification');
  }

  const server = new StellarSdk.Server(HORIZON_URL);

  const transaction = await server.transactions().transaction(txHash).call();
  const operationPage = await server.operations().forTransaction(txHash).call();

  const receiptOps = operationPage.records.filter((record) => record.type === 'manage_data');
  const verified = receiptOps.some((record) => record.name?.startsWith('pulse_learn_receipt'));

  return {
    verified,
    transaction: {
      hash: txHash,
      source_account: transaction.source_account,
      created_at: transaction.created_at,
      memo: transaction.memo,
    },
    receiptOps: receiptOps.map((record) => ({
      name: record.name,
      value: record.value,
      source_account: record.source_account,
    })),
  };
}
