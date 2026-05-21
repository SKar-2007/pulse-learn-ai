import { motion } from 'framer-motion';
import { ExternalLink, Award } from 'lucide-react';

export default function StellarModal({ txHash, roadmapTitle, onClose }) {
  if (!txHash) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', bounce: 0.4 }}
        className="bg-gray-900/90 border border-indigo-500 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl shadow-indigo-500/20"
      >
        <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Course Complete! 🎉</h2>
        <p className="text-indigo-300 font-medium mb-1">{roadmapTitle}</p>
        <p className="text-gray-400 text-sm mb-6">
          Your proof of knowledge has been permanently anchored on the Stellar Blockchain.
        </p>

        <div className="bg-gray-800 rounded-xl p-4 mb-6">
          <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
          <p className="text-xs text-green-400 font-mono break-all">{txHash}</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-xs text-indigo-400 hover:text-indigo-300"
          >
            View on Stellar Expert <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}
