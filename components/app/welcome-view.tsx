'use client';

import { forwardRef, useEffect } from 'react';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = forwardRef<HTMLDivElement, WelcomeViewProps>(({ onStartCall }, ref) => {
  useEffect(() => {
    const autoInit = async () => {
      const params = new URLSearchParams(window.location.search);

      const payload = {
        name: params.get('name') || undefined,
        age: params.get('age') || undefined,
        gender: params.get('gender') || undefined,
        likes: params.get('likes') || undefined,
        learning: params.get('learning') || undefined,
      };

      try {
        await fetch('https://livekit-backend-1zev.onrender.com/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch {
        console.warn('Profile failed to submit, continuing without it');
      }

      onStartCall();
    };

    autoInit();
  }, [onStartCall]);

  return (
    <div ref={ref} className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-700">Starting the session…</h2>
        <div className="mx-auto mt-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
      </div>
    </div>
  );
});

WelcomeView.displayName = 'WelcomeView';
