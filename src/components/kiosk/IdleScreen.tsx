import { useKioskStore } from '@/store/kioskStore';
import { motion } from 'framer-motion';

export const IdleScreen = () => {
  const setScreen = useKioskStore((state) => state.setScreen);

  const handleTouch = () => {
    setScreen('order-type');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-hero flex flex-col items-center justify-center cursor-pointer"
      onClick={handleTouch}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center space-y-8">
        {/* Logo/Brand */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="w-32 h-32 mx-auto gradient-primary rounded-3xl flex items-center justify-center shadow-elevated mb-6">
            <span className="text-6xl">🍔</span>
          </div>
          <h1 className="text-kiosk-5xl font-bold text-foreground">
            Quick<span className="text-primary">Serve</span>
          </h1>
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <p className="text-kiosk-2xl text-muted-foreground">
            Fast • Fresh • Delicious
          </p>
        </motion.div>

        {/* Touch prompt */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-12"
        >
          <div className="inline-flex items-center gap-4 px-12 py-6 bg-card/50 backdrop-blur rounded-2xl border border-border animate-pulse-glow">
            <span className="text-kiosk-xl font-semibold text-foreground">
              Tap anywhere to start your order
            </span>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-muted-foreground text-kiosk-sm">
          Available 24/7 • Card & Contactless Accepted
        </p>
      </div>
    </motion.div>
  );
};
