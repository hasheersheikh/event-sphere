import React from "react";
import { motion } from "framer-motion";
import { Hammer, Timer, Wrench } from "lucide-react";

const MaintenancePage = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 flex items-center justify-center font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px]" />
      </div>

      {/* Glassmorphic Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mx-4 w-full max-w-2xl"
      >
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 md:p-16 rounded-[2.5rem] shadow-2xl overflow-hidden group">
          {/* Animated Icons */}
          <div className="flex justify-center mb-10 space-x-6">
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                y: [0, -5, 0]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
              }}
              className="p-4 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/20"
            >
              <Wrench className="w-8 h-8 md:w-10 md:h-10" />
            </motion.div>
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                scale: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }}
              className="p-5 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 -mt-4 shadow-[0_0_25px_rgba(99,102,241,0.3)]"
            >
              <Hammer className="w-10 h-10 md:w-12 md:h-12" />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                y: [0, -5, 0]
              }}
              transition={{ 
                rotate: { repeat: Infinity, duration: 4, ease: "easeInOut" },
                y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
              }}
              className="p-4 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/20"
            >
              <Timer className="w-8 h-8 md:w-10 md:h-10" />
            </motion.div>
          </div>

          <div className="text-center space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm font-semibold tracking-wider uppercase border border-blue-500/20">
                System Update
              </span>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mt-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Under <br className="hidden md:block" /> Maintenance
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 text-lg md:text-xl max-w-md mx-auto leading-relaxed"
            >
              We're polishing some pixels and tightening a few bolts to bring you a better experience. We'll be back shortly!
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="pt-8 flex flex-col items-center justify-center space-y-4"
            >
              <div className="h-1.5 w-48 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="h-full w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                />
              </div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-[0.2em]">
                Progress: Polishing UI
              </p>
            </motion.div>
          </div>
        </div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Event Sphere. Built for Excellence.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
