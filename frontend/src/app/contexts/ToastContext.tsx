import React, {createContext, useContext, useState, ReactNode} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {CheckCircle, AlertTriangle} from 'lucide-react';

type ToastType = 'success' | 'error';

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Luodaan Provider-komponentti, joka käärii sovelluksen
export function ToastProvider({children}: {children: ReactNode}) {
  const [toast, setToast] = useState<{message: string; type: ToastType} | null>(
    null
  );

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({message, type});
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{showToast}}>
      {children}

      {/* TÄMÄ RENDERÖIDÄÄN KOKO SOVELLUKSEN PÄÄLLÄ */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{opacity: 0, y: 50, scale: 0.9}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 20, scale: 0.9}}
            className={`fixed bottom-6 right-6 px-5 py-3.5 rounded-xl shadow-2xl border text-sm font-bold z-[100] flex items-center gap-3 ${
              toast.type === 'error'
                ? 'bg-destructive text-destructive-foreground border-destructive/50'
                : 'bg-green-600 text-white border-green-700'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertTriangle size={18} className="opacity-90" />
            ) : (
              <CheckCircle size={18} className="opacity-90" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

// Custom hook, jotta contextin käyttö on helpompaa
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast pitää käyttää ToastProviderin sisällä');
  }
  return context;
}
