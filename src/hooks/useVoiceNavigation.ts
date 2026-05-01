import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * A11Y-25: Voice Navigation via Web Speech API.
 * Allows users to navigate the app using voice commands.
 */
export const useVoiceNavigation = () => {
  const router = useRouter();

  const handleCommand = useCallback((command: string) => {
    const cmd = command.toLowerCase();
    
    if (cmd.includes('dashboard') || cmd.includes('home')) {
      router.push('/dashboard');
    } else if (cmd.includes('map') || cmd.includes('polling')) {
      router.push('/map');
    } else if (cmd.includes('chat') || cmd.includes('copilot')) {
      router.push('/chat');
    } else if (cmd.includes('onboarding') || cmd.includes('setup')) {
      router.push('/onboarding');
    } else if (cmd.includes('analytics') || cmd.includes('cost')) {
      router.push('/admin/analytics');
    }
  }, [router]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      handleCommand(transcript);
    };

    recognition.start();

    return () => recognition.stop();
  }, [handleCommand]);
};
