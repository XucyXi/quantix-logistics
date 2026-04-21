import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {MessageCircle, Send, X} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hei! Olen Quantix Logistics -asiakaspalvelubotti. Miten voin auttaa sinua tänään?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (input: string): string => {
    if (input.includes('hinta') || input.includes('price')) {
      return 'Voin auttaa sinua hintojen kanssa! Siirry Hinnoittelu-sivulle nähdäksesi kaikki tuotteidemme hinnat.';
    }

    if (input.includes('toimitus') || input.includes('delivery')) {
      return 'Toimitamme tuotteet kauppoihin live-seurannalla. Voit seurata toimitusta reaaliajassa hallintapaneelissa.';
    }

    if (input.includes('tuote') || input.includes('product')) {
      return 'Tuoteluettelomme sisältää laajan valikoiman elintarvikkeita. Siirry Tuotteet-sivulle nähdäksesi koko valikoiman.';
    }

    if (input.includes('tilaus') || input.includes('order')) {
      return 'Voit tehdä tilauksen kirjautumalla sisään ja lisäämällä tuotteita ostoskoriin. Tarvitsetko apua tilauksen tekemisessä?';
    }

    return 'Kiitos viestistäsi! Asiakaspalvelumme käsittelee kysymyksesi pian. Voit myös soittaa meille numeroon 010 123 4567.';
  };

  const handleSend = () => {
    if (!inputValue.trim()) {
      return;
    }

    const submittedText = inputValue;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: submittedText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(submittedText.toLowerCase()),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{scale: 0, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            exit={{scale: 0, opacity: 0}}
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.9}}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-secondary shadow-lg transition-all hover:shadow-xl"
            aria-label="Avaa chat"
          >
            <MessageCircle className="h-8 w-8 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{opacity: 0, y: 100, scale: 0.8}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 100, scale: 0.8}}
            transition={{type: 'spring', damping: 25, stiffness: 300}}
            className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[400px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between bg-primary px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <MessageCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Quantix Chat</h3>
                  <p className="text-xs text-white/80">
                    Aina valmiina auttamaan
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 transition-colors hover:bg-white/10"
                aria-label="Sulje chat"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-muted/30 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{opacity: 0, y: 10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: index * 0.05}}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-secondary text-white'
                          : 'bg-white text-foreground shadow-sm'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`mt-1 text-xs ${
                          message.sender === 'user'
                            ? 'text-white/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString('fi-FI', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-border bg-white p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Kirjoita viestisi..."
                  className="flex-1 rounded-full border border-border bg-input-background px-4 py-3 text-sm outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                />
                <motion.button
                  whileHover={{scale: 1.05}}
                  whileTap={{scale: 0.95}}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary transition-all hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Lähetä viesti"
                >
                  <Send className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
