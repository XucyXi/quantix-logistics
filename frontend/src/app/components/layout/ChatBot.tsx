import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'motion/react';
import {MessageCircle, Send, X, Loader2, Info} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hei! Olen Quantix-botti. Voit kysyä minulta hinnoista, toimituksista tai tilauksista. Kirjoita "apua" jos haluat puhua ihmiselle.',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- DISCORD ASETUS ---
  const DISCORD_WEBHOOK_URL =
    'https://discord.com/api/webhooks/1496053804880101458/0Dov4ZvVnORLtox18okAYMlowTDTataqHrT9Xl1FQswTNNgMFt9Ywo3gzZVMr3rUUi-4';

  const sendDiscordNotification = async (userMessage: string) => {
    try {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          content: `🚨 **Uusi yhteydenottopyyntö!**\nAsiakas sanoi: "${userMessage}"`,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getBotResponse = (input: string): string => {
    const text = input.toLowerCase();

    if (text.includes('hinta') || text.includes('maksaa')) {
      return 'Logistiikkahinnastomme löytyy "Palvelut"-sivulta. Peruslähetys alkaen 9,90€. Haluatko tarkemman tarjouksen?';
    }
    if (text.includes('toimitus') || text.includes('kesto')) {
      return 'Toimitamme arkisin 24h sisällä tilauksesta pääkaupunkiseudulla. Muualle Suomeen 1-3 arkipäivää.';
    }
    if (text.includes('tilaus') || text.includes('tehdä')) {
      return 'Voit tehdä tilauksen suoraan verkkokaupastamme kirjautumalla sisään.';
    }
    if (
      text.includes('apua') ||
      text.includes('ihminen') ||
      text.includes('soita')
    ) {
      sendDiscordNotification(input); // Lähettää ilmoituksen sinulle
      return 'Selvä! Lähetin ilmoituksen asiakaspalvelullemme. Voit myös soittaa meille: 010 123 4567.';
    }

    // Jos botti ei tunnista sanaa, se lähettää ilmoituksen varmuuden vuoksi
    sendDiscordNotification(input);
    return 'Kiitos viestistä! En aivan ymmärtänyt, mutta välitin tiedon eteenpäin ja vastaamme sinulle pian.';
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(text),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            whileHover={{scale: 1.1}}
            whileTap={{scale: 0.9}}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-blue-600 text-white shadow-xl flex items-center justify-center"
          >
            <MessageCircle size={32} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{opacity: 0, y: 100}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 100}}
            className="fixed bottom-6 right-6 z-50 w-95 h-137.5 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
          >
            <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
              <span className="font-bold">Quantix Logistics Chat</span>
              <button onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl text-sm max-w-[80%] ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'}`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Botti vastaa...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Ohjeasiakkaalle -palkki */}
            <div className="px-4 py-2 bg-blue-50 border-t border-blue-100 flex items-center gap-2">
              <Info size={14} className="text-blue-600" />
              <span className="text-[10px] text-blue-800 uppercase font-bold">
                Kokeile: &quot;hinta&quot;, &quot;toimitus&quot; tai
                &quot;apua&quot;
              </span>
            </div>

            <div className="p-3 border-t flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-600"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder="Miten voimme auttaa?"
              />
              <button
                onClick={() => handleSend(inputValue)}
                className="bg-blue-600 text-white p-2 rounded-lg"
              >
                <Send size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
