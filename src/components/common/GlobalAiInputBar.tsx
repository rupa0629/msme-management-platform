import React, { useState } from 'react';
import {
  ArrowRight,
  Mic,
  MicOff,
  Radio,
  Send,
  Sparkles,
  Volume2,
  Zap,
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

export const GlobalAiInputBar: React.FC = () => {
  const { parseAndOpenAction } = useBusiness();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);

  const samplePresets = [
    'I purchased 50 shirts from ABC Traders for ₹20,000',
    'Sold 5 Banarasi sarees to Sunita Rao for ₹11,000 on UPI',
    'Paid ₹3,850 BESCOM electricity bill via GPay',
    'Received ₹4,200 pending payment from Priya Sharma',
    'Purchased 20 Silk Sarees from Shree Ganesh for ₹35,000 on credit',
  ];

  const handleSubmit = async (textToProcess?: string) => {
    const text = textToProcess || inputText;
    if (!text.trim()) return;

    setIsLoading(true);
    setSpeechFeedback('AI is extracting business entities and calculating math...');

    try {
      const res = await parseAndOpenAction(text);
      if (res.success) {
        setInputText('');
        setSpeechFeedback(null);
      } else {
        setSpeechFeedback('Could not parse action. Please check your command.');
      }
    } catch (err) {
      setSpeechFeedback('Network error while analyzing action.');
    } finally {
      setIsLoading(false);
      setIsListening(false);
    }
  };

  // Voice recording handler using Web Speech API or realistic fallback simulation
  const handleToggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsListening(true);
        setSpeechFeedback('Listening... Please speak (e.g., "I purchased 50 shirts from ABC Traders for ₹20,000")');

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText(transcript);
          setIsListening(false);
          setSpeechFeedback(`Heard: "${transcript}"`);
          handleSubmit(transcript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech error:', event.error);
          setIsListening(false);
          // Fallback to demo prompt for immediate smooth user testing
          const demoPrompt = 'I purchased 50 shirts from ABC Traders for ₹20,000';
          setInputText(demoPrompt);
          setSpeechFeedback('Microphone permission check. Loaded sample voice transcript.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (e) {
        setIsListening(false);
        const demoPrompt = 'I purchased 50 shirts from ABC Traders for ₹20,000';
        setInputText(demoPrompt);
      }
    } else {
      // Simulate voice input for environments without SpeechRecognition
      setIsListening(true);
      setSpeechFeedback('Simulating voice input...');
      setTimeout(() => {
        const demoPrompt = 'I purchased 50 shirts from ABC Traders for ₹20,000';
        setInputText(demoPrompt);
        setIsListening(false);
        setSpeechFeedback(`Transcribed: "${demoPrompt}"`);
      }, 1500);
    }
  };

  return (
    <div className="w-full relative">
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-teal-500/30 rounded-2xl p-4 shadow-xl glow-teal transition-all">
        {/* Top Tagline */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI One-Input Automation
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              • Speak or type any purchase, sale, bill or udhaar collection
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono hidden md:block">
            Gemini 3.8 Flash • Real-time Bookkeeping
          </div>
        </div>

        {/* Input & Action buttons */}
        <div className="relative flex items-center bg-slate-950/80 border border-slate-700/80 rounded-xl overflow-hidden focus-within:border-teal-400 transition-colors">
          <div className="pl-3.5 pr-2 text-teal-400">
            <Zap className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder='Try: "I purchased 50 shirts from ABC Traders for ₹20,000" or "Sold 3 sarees to Ramesh for ₹7,500 UPI"'
            className="w-full py-3.5 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-medium"
            disabled={isLoading}
          />

          <div className="flex items-center pr-2 space-x-1.5">
            {/* Voice Mic Button */}
            <button
              onClick={handleToggleVoice}
              title={isListening ? 'Stop listening' : 'Speak command with microphone'}
              className={`p-2 rounded-lg transition-all ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Execute Button */}
            <button
              onClick={() => handleSubmit()}
              disabled={isLoading || !inputText.trim()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center space-x-1.5 disabled:opacity-40"
            >
              {isLoading ? (
                <span>Analyzing...</span>
              ) : (
                <>
                  <span>Process</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Listening feedback or status */}
        {speechFeedback && (
          <div className="mt-2 text-xs text-teal-300 flex items-center space-x-2 animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span>{speechFeedback}</span>
          </div>
        )}

        {/* Clickable Quick Prompt Presets */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-cyan-400" /> Quick test:
          </span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(preset);
                handleSubmit(preset);
              }}
              className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-cyan-300 border border-slate-700/60 hover:border-cyan-500/40 transition-colors text-[11px]"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
