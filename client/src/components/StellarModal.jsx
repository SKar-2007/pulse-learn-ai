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
        className="bg-black/95 border border-white/10 rounded-3xl p-10 max-w-md w-full text-center shadow-2xl shadow-black/20"
      >
        <Award className="w-20 h-20 text-white mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2">Course Complete! 🎉</h2>
        <p className="text-white/60 font-medium mb-1">{roadmapTitle}</p>
        <p className="text-white/50 text-sm mb-6">
          Your proof of knowledge has been permanently anchored on the Stellar Blockchain.
        </p>

        <div className="bg-black/90 rounded-xl p-4 mb-6 border border-white/10">
          <p className="text-xs text-white/40 mb-1">Transaction Hash</p>
          <p className="text-xs text-white/80 font-mono break-all">{txHash}</p>
          <a
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-xs text-white/60 hover:text-white"
          >
            View on Stellar Expert <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </motion.div>
  );
}
