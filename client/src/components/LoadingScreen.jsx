import { motion } from 'framer-motion';

const letters = ['P', 'U', 'L', 'S', 'E', '_', 'L', 'E', 'A', 'R', 'N', '_', 'A', 'I'];

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="pulse-loader-box"
      >
        <div className="pulse-loader-center">
          <ul className="pulse-loader-list">
            {letters.map((letter, index) => (
              <li key={`${letter}-${index}`} className={`pulse-letter pulse-letter-${index + 1}`}>
                {letter}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
