import StellarSdk from '@stellar/stellar-sdk';
import { HttpError } from '../utils/httpError.js';
import { buildStellarDataKey, buildStellarDataValue } from './stellarUtils.js';

const HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org';

function getServer() {
  return new StellarSdk.Server(HORIZON_URL);
}

export async function mintCredentialReceipt({ walletSecret, credentialData }) {
  const secret = walletSecret || process.env.WALLET_SECRET;
  if (!secret) {
    throw new HttpError('Stellar secret key is required.', 400, 'missing_stellar_secret');
  }

  let sourceKeypair;
  try {
    sourceKeypair = StellarSdk.Keypair.fromSecret(secret);
  } catch (error) {
    throw new HttpError('Invalid Stellar secret key.', 400, 'invalid_stellar_secret');
  }

  const server = getServer();
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

  try {
    const response = await server.submitTransaction(transaction);
    return response.hash;
  } catch (error) {
    throw new HttpError('Unable to mint Stellar receipt.', 502, 'stellar_transaction_failed');
  }
}

export async function verifyStellarReceipt(txHash) {
  if (!txHash) {
    throw new HttpError('Transaction hash is required for Stellar verification.', 400, 'missing_tx_hash');
  }

  const server = getServer();

  let transaction;
  let operationPage;
  try {
    transaction = await server.transactions().transaction(txHash).call();
    operationPage = await server.operations().forTransaction(txHash).call();
  } catch (error) {
    throw new HttpError('Unable to verify Stellar receipt.', 502, 'stellar_lookup_failed');
  }

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
