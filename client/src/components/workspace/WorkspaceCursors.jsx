import { motion, AnimatePresence } from 'framer-motion';
import { MousePointer2 } from 'lucide-react';

export default function WorkspaceCursors({ presence, currentUserId }) {
    return (
        <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            <AnimatePresence>
                {Object.entries(presence).map(([userId, state]) => {
                    if (userId === currentUserId || !state.cursor) return null;

                    return (
                        <motion.div
                            key={userId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, x: state.cursor.x, y: state.cursor.y }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.5 }}
                            className="absolute"
                        >
                            <MousePointer2
                                size={18}
                                className="text-indigo-500 fill-indigo-500 shadow-xl"
                                style={{ transform: 'rotate(-90deg)' }}
                            />
                            <div className="ml-4 mt-2 px-2 py-1 bg-indigo-600 text-white text-[8px] font-bold rounded-lg shadow-lg whitespace-nowrap">
                                {state.email?.split('@')[0] || 'Learning Peer'}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
