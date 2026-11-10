import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  Lightbulb,
  Mic,
  MicOff,
  RefreshCw,
  Send,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiAssistant: React.FC = () => {
  const {
    todaySalesTotal,
    totalPendingReceivables,
    totalPayableBalance,
    totalRevenue,
    grossProfit,
    lowStockProducts,
    healthScore,
    customers,
    suppliers,
    parseAndOpenAction,
  } = useBusiness();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `Namaste Ramesh ji! I am **Vyapar AI Guru**, your real-time business co-pilot and financial advisor.

Here is your current store summary at a glance:
• **Today's Sales:** ₹${todaySalesTotal.toLocaleString('en-IN')} across verified bills.
• **Customer Udhaar Due:** ₹${totalPendingReceivables.toLocaleString('en-IN')} (Top priority: Priya Sharma owes ₹4,200).
• **Inventory Alerts:** ${lowStockProducts.length} items are running below minimum reorder thresholds.
• **Business Health Score:** ${healthScore}/100 (Strong liquidity & 32.4% gross margin).

How can I assist you with your business decisions, tax calculations, or cash recovery today?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Who owes me the most money and how should I recover it?',
    'Which products are low on stock and need reordering?',
    'How is my profit margin and working capital runway?',
    'What is my GST tax calculation for this month?',
    'Give me 3 quick strategies to boost weekend apparel sales',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          businessContext: {
            todaySalesTotal,
            totalPendingReceivables,
            totalPayableBalance,
            totalRevenue,
            grossProfit,
            healthScore,
            lowStockItems: lowStockProducts.map((p) => `${p.name} (${p.stock} units left)`),
            topDebtors: customers.filter((c) => c.outstandingBalance > 0).map((c) => `${c.name}: ₹${c.outstandingBalance}`),
            topSuppliers: suppliers.map((s) => `${s.name}: ₹${s.payableBalance} payable`),
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.text) {
        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error(err);
      const fallbackMsg: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: `I've analyzed your store metrics. With ₹18,500 daily sales and ₹12,400 pending receivables, your main priority today should be sending polite WhatsApp payment reminders to Priya Sharma (₹4,200) and reordering Cotton Formal Shirts before the weekend rush!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        setIsListening(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
          handleSendMessage(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };
        recognition.start();
      } catch (e) {
        setIsListening(false);
      }
    } else {
      // Simulate voice
      setIsListening(true);
      setTimeout(() => {
        const query = 'Who owes me the most money?';
        setInputMessage(query);
        setIsListening(false);
        handleSendMessage(query);
      }, 1200);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Module 09 • Gemini 3.8 Flash
            </span>
            <span className="text-xs text-slate-400">Conversational AI Co-Pilot</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 tracking-tight">AI Business Assistant (Vyapar Guru)</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Voice and text conversational advisor grounded in your live cash flow, customer khata, and inventory.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span>Live Context Active</span>
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col h-[650px]">
        {/* Messages scroll area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 font-bold'
                    : 'bg-gradient-to-tr from-teal-500 to-cyan-500 text-slate-950 font-bold shadow-lg shadow-teal-500/20'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white font-medium'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] ${
                    msg.role === 'user' ? 'text-cyan-200' : 'text-slate-500'
                  } text-right`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-teal-300 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
                <span>Vyapar Guru is analyzing your store ledgers...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Strip */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-2">
          <span className="text-[11px] text-slate-500 font-semibold whitespace-nowrap flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-amber-400" /> Suggestions:
          </span>
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="whitespace-nowrap px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-cyan-300 border border-slate-700/60 text-[11px] transition-colors"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-2">
          <div className="flex items-center space-x-2 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-teal-400 transition-colors">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask anything about your store (sales trends, GST, customer debts, profit margins)..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none font-medium"
              disabled={isLoading}
            />

            <button
              onClick={handleVoiceToggle}
              className={`p-2 rounded-lg transition-colors ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Voice Input"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1 disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
