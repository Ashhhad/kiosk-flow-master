import { useKioskStore } from '@/store/kioskStore';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import type { OrderType } from '@/types/kiosk';

export const OrderTypeScreen = () => {
  const { setOrderType, setScreen } = useKioskStore();

  const handleSelect = (type: OrderType) => {
    setOrderType(type);
    setScreen('menu');
  };

  const options = [
    {
      type: 'dine-in' as OrderType,
      icon: '🍽️',
      title: 'Eat In',
      description: 'Enjoy your meal in our restaurant',
    },
    {
      type: 'takeaway' as OrderType,
      icon: '🥡',
      title: 'Take Away',
      description: 'Get your order to go',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen gradient-hero flex flex-col"
    >
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-border">
        <Button
          variant="kiosk-ghost"
          size="kiosk"
          onClick={() => useKioskStore.getState().setScreen('idle')}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <div className="text-kiosk-xl font-bold text-foreground">
          Quick<span className="text-primary">Serve</span>
        </div>
        <div className="w-32" />
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-16"
        >
          <h1 className="text-kiosk-4xl font-bold text-foreground mb-4">
            How would you like to order?
          </h1>
          <p className="text-kiosk-lg text-muted-foreground">
            Select your preferred dining option
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-8 w-full max-w-3xl">
          {options.map((option, index) => (
            <motion.button
              key={option.type}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => handleSelect(option.type)}
              className="group relative bg-card border-2 border-border hover:border-primary rounded-3xl p-12 flex flex-col items-center gap-6 transition-all duration-300 hover:shadow-elevated active:scale-[0.98]"
            >
              <div className="w-32 h-32 bg-secondary rounded-2xl flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-300">
                {option.icon}
              </div>
              <div className="text-center">
                <h2 className="text-kiosk-2xl font-bold text-foreground mb-2">
                  {option.title}
                </h2>
                <p className="text-kiosk-base text-muted-foreground">
                  {option.description}
                </p>
              </div>
              <div className="absolute inset-0 rounded-3xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.button>
          ))}
        </div>
      </main>
    </motion.div>
  );
};
