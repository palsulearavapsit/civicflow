"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, Button } from "@/components/ui";
import { Send, Bot, User, ShieldCheck, Sparkles, MessageCircle, ChevronLeft, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { chatWithCopilot } from "../actions/gemini";
import { useGeminiNano } from "@/hooks/useGeminiNano";
import { useVoiceNavigation } from "@/hooks/useVoiceNavigation";
import { translateToPlainLanguage } from "@/lib/gemini";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function CopilotChat() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your CivicFlow Copilot. I've analyzed your profile for ${profile?.location.state}. How can I help you today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isPlainLanguage, setIsPlainLanguage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { ask: askNano, isAvailable: isNanoAvailable } = useGeminiNano();
  useVoiceNavigation(); // Activate voice commands globally in chat

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Placeholder for assistant message that we will stream into
    const assistantId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: "",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMsg]);

    setMessages(prev => [...prev, assistantMsg]);

    try {
      // PHASE 6: Try On-Device AI first for simple queries
      if (isNanoAvailable) {
        const nanoResponse = await askNano(input);
        if (nanoResponse) {
          setMessages(prev => prev.map(msg => 
            msg.id === assistantId ? { ...msg, content: nanoResponse } : msg
          ));
          setIsTyping(false);
          return;
        }
      }

      const history = messages.map(msg => ({
        role: (msg.role === 'user' ? 'user' : 'model') as "user" | "model",
        parts: [{ text: msg.content }]
      }));

      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input, history }),
      });

      if (!response.ok) throw new Error("Stream failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;
          
          let finalContent = accumulatedContent;
          // PHASE 5: Apply Plain Language translation if enabled
          if (isPlainLanguage && !done) {
             // We only translate the final block for efficiency, or we could do it live
          }

          // Update the specific assistant message in state
          setMessages(prev => prev.map(msg => 
            msg.id === assistantId ? { ...msg, content: finalContent } : msg
          ));
        }
        
        if (isPlainLanguage) {
           const simple = await translateToPlainLanguage(accumulatedContent);
           setMessages(prev => prev.map(msg => 
            msg.id === assistantId ? { ...msg, content: simple } : msg
          ));
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => prev.map(msg => 
        msg.id === assistantId 
        ? { ...msg, content: "I'm having trouble connecting to my brain right now. Please try again in a moment." } 
        : msg
      ));
    } finally {
      setIsTyping(false);
    }
  };


  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500" aria-label="Go back to dashboard">
            <ChevronLeft size={20} />
          </Link>
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="font-bold tracking-tight">Election Copilot</h1>
            <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Engine
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsPlainLanguage(!isPlainLanguage)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isPlainLanguage ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
          >
            Simple Mode {isPlainLanguage ? 'ON' : 'OFF'}
          </button>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800/50">
            <ShieldCheck size={14} /> Official Data Sources
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef} 
        role="log" 
        aria-live="polite" 
        aria-atomic="false"
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar"
      >

        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-800 text-slate-600' : 'bg-blue-600 text-white'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-3xl text-sm md:text-base leading-relaxed shadow-sm transition-all ${
                  msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none prose prose-slate dark:prose-invert max-w-none'
                }`}>
                  {msg.content}
                  
                  {/* PHASE 6: Grounded Sources Display */}
                  {msg.role === 'assistant' && msg.content && (
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Shield size={12} className="text-blue-500" /> Grounded Sources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400">vote.gov</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400">usa.gov</span>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-400">Official State Board</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Bot size={16} />
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl rounded-tl-none flex items-center gap-1.5 h-12 shadow-sm">
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full"></motion.span>
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full"></motion.span>
                <motion.span animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full"></motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about deadlines, documents, or polling places..."
            className="w-full p-4 pr-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-0 transition-all shadow-inner outline-none text-slate-900 dark:text-white"
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
            className="absolute right-2 top-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-center mt-4 text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center justify-center gap-2">
          <Sparkles size={12} className="text-blue-500" /> Powered by Gemini 2.0 Flash & Verified Election Data
        </p>
      </div>
    </div>
  );
}
