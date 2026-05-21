// Small UI component showing who is currently online in the roadmap
import { motion, AnimatePresence } from 'framer-motion';

export default function PresenceBar({ presence }) {
    const users = Object.values(presence).flat();

    if (users.length <= 1) return null; // Don't show if it's just the current user

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <div className="flex -space-x-2 mr-2">
                <AnimatePresence>
                    {users.map((u, i) => (
                        <motion.div
                            key={u.user_id + i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-gray-950 flex items-center justify-center text-[10px] font-bold text-white uppercase"
                            title={`User ${u.user_id} is online`}
                        >
                            {u.user_id[0].toUpperCase()}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest animate-pulse">
                {users.length} Active Now
            </span>
        </div>
    );
}
