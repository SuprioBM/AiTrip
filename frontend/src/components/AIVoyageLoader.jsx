import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const particles = [
  { id: 1, x: "12%", y: "18%", size: "3px", delay: 0.0, duration: 5.4 },
  { id: 2, x: "28%", y: "68%", size: "4px", delay: 0.6, duration: 6.1 },
  { id: 3, x: "48%", y: "12%", size: "2px", delay: 0.2, duration: 4.8 },
  { id: 4, x: "72%", y: "22%", size: "3px", delay: 0.9, duration: 6.7 },
  { id: 5, x: "86%", y: "48%", size: "4px", delay: 0.4, duration: 5.6 },
  { id: 6, x: "64%", y: "76%", size: "2px", delay: 1.1, duration: 5.1 },
  { id: 7, x: "18%", y: "44%", size: "3px", delay: 0.3, duration: 6.3 },
  { id: 8, x: "38%", y: "86%", size: "2px", delay: 0.8, duration: 5.9 },
  { id: 9, x: "58%", y: "58%", size: "3px", delay: 0.1, duration: 6.8 },
  { id: 10, x: "80%", y: "70%", size: "2px", delay: 0.5, duration: 5.2 },
  { id: 11, x: "10%", y: "80%", size: "2px", delay: 0.7, duration: 4.9 },
  { id: 12, x: "90%", y: "16%", size: "3px", delay: 1.2, duration: 6.4 }
];

const AIVoyageLoader = ({ isVisible = true, message }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 text-black backdrop-blur-3xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(14,165,233,0.1),transparent_58%),radial-gradient(circle_at_85%_20%,rgba(59,130,246,0.08),transparent_55%),radial-gradient(circle_at_50%_85%,rgba(6,182,212,0.1),transparent_62%)]" />
            {particles.map((particle) => (
              <motion.span
                key={particle.id}
                className="absolute rounded-full bg-cyan-200/70 shadow-[0_0_12px_rgba(34,211,238,0.7)]"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size
                }}
                animate={{ opacity: [0.15, 0.7, 0.15], y: [0, -12, 0] }}
                transition={{
                  duration: particle.duration,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center gap-4 px-6">
            <div className="relative flex items-center justify-center">
              <motion.div
                className="absolute h-28 w-28 rounded-full border border-cyan-400/30 shadow-[0_0_24px_rgba(34,211,238,0.35)] sm:h-36 sm:w-36"
                animate={{ rotate: 360 }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute h-20 w-20 rounded-full border border-blue-400/20 shadow-[0_0_18px_rgba(59,130,246,0.25)] sm:h-24 sm:w-24"
                animate={{ rotate: -360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute h-8 w-8 rounded-full bg-cyan-400/20 blur-xl"
                animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="relative h-32 w-32 sm:h-40 sm:w-40">
                <motion.div
                  className="absolute inset-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <motion.div
                    className="absolute left-1/2 top-0 -translate-x-1/2"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="rounded-full bg-cyan-400/20 p-1.5 shadow-[0_0_20px_rgba(34,211,238,0.6)]">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-cyan-200"
                      >
                        <path
                          d="M2 12L21 3L13.5 21L11.5 13.5L2 12Z"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-base font-medium text-cyan-100/90 sm:text-lg">
                {message || "AIVoyage is preparing your journey..."}
              </p>
              <div className="flex items-end gap-1 text-cyan-200">
                {[0, 1, 2].map((dot) => (
                  <motion.span
                    key={dot}
                    className="h-2 w-2 rounded-full bg-cyan-300"
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: dot * 0.2
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIVoyageLoader;
