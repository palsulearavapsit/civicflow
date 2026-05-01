"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Map, MessageSquare, LayoutDashboard, 
  Settings, Shield, HelpCircle, Command as CmdIcon,
  ChevronRight, X
} from 'lucide-react';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Command {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  shortcut?: string;
}

const COMMANDS: Command[] = [
  { id: 'dash', title: 'Dashboard', description: 'View your election plan', icon: LayoutDashboard, href: '/dashboard', shortcut: 'D' },
  { id: 'map', title: 'Polling Map', description: 'Find stations near you', icon: Map, href: '/map', shortcut: 'M' },
  { id: 'chat', title: 'AI Copilot', description: 'Ask questions about voting', icon: MessageSquare, href: '/chat', shortcut: 'C' },
  { id: 'admin', title: 'Cost Analytics', description: 'Manage AI usage (Admin)', icon: Shield, href: '/admin/analytics', shortcut: 'A' },
  { id: 'settings', title: 'Settings', description: 'Preferences and Privacy', icon: Settings, href: '/onboarding', shortcut: 'S' },
  { id: 'help', title: 'Help Center', description: 'FAQs and Support', icon: HelpCircle, href: '/resources', shortcut: 'H' },
];

/**
 * ORG-05: Command Palette (⌘+K).
 * Implements accessible, keyboard-first navigation for power users.
 */
export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const containerRef = useFocusTrap({ isActive: isOpen, onEscape: () => setIsOpen(false) });

  const filteredCommands = COMMANDS.filter(cmd => 
    cmd.title.toLowerCase().includes(query.toLowerCase()) || 
    cmd.description.toLowerCase().includes(query.toLowerCase())
  );

  const handleNavigate = useCallback((href: string) => {
    router.push(href);
    setIsOpen(false);
    setQuery('');
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleNavigate(filteredCommands[selectedIndex].href);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Palette Container */}
          <motion.div
            ref={containerRef as any}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-500"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">
                <span className="text-[12px]">ESC</span>
              </div>
            </div>

            {/* Command List */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredCommands.length > 0 ? (
                <div className="space-y-1">
                  {filteredCommands.map((cmd, idx) => {
                    const Icon = cmd.icon;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={cmd.id}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        onClick={() => handleNavigate(cmd.href)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{cmd.title}</p>
                            <p className={`text-[10px] ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>{cmd.description}</p>
                          </div>
                        </div>
                        {isSelected && <ChevronRight size={16} />}
                        {!isSelected && cmd.shortcut && (
                          <div className="px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold text-slate-400">
                            {cmd.shortcut}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Search size={24} />
                  </div>
                  <p className="text-sm text-slate-500">No commands found for &quot;{query}&quot;</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 font-medium uppercase tracking-widest">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5"><ChevronRight size={10} className="rotate-90" /> Navigate</span>
                <span className="flex items-center gap-1.5"><CmdIcon size={10} /> Select</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={10} /> SECURE COMMAND ENGINE
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
