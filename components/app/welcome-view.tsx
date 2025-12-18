'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { Button } from '@/components/livekit/button';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

const ChildIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
      fill="currentColor"
    />
  </svg>
);

const GraduationIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
    <path d="M11 12.65V21h2v-8.35l-1 .55-1-.55z" fill="currentColor" />
  </svg>
);

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  const [childName, setChildName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [interests, setInterests] = useState('');
  const [currentLearning, setCurrentLearning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoStartMode, setAutoStartMode] = useState(false);
  const [waitingForProfile, setWaitingForProfile] = useState(false);

  const submitProfileAndStart = async () => {
    // map to backend-expected LiveKit profile keys
    const payload = {
      name: childName || undefined,
      age: age || undefined,
      gender: gender || undefined,
      likes: interests || undefined,
      learning: currentLearning || undefined,
    };

    setIsSubmitting(true);
    try {
      await fetch('https://livekit-backend-1zev.onrender.com/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      // ignore errors — the agent will still start with defaults
    } finally {
      setIsSubmitting(false);
      onStartCall();
    }
  };

  // Auto-start: hide the form and poll GET /profile when ?autoStart=true
  useEffect(() => {
    let cancelled = false;
    const doAutoStart = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autoStart') === 'true') {
          setAutoStartMode(true);

          // If Talkypie passed profile data in query params, start immediately
          const qpName = params.get('name');
          const qpLikes = params.get('likes');
          if (qpName || qpLikes) {
            const backendPayload = {
              name: qpName || undefined,
              age: params.get('age') || undefined,
              gender: params.get('gender') || undefined,
              likes: qpLikes || undefined,
              learning: params.get('learning') || undefined,
            };

            try {
              setIsSubmitting(true);
              await fetch('https://livekit-backend-1zev.onrender.com/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendPayload),
              });
            } catch (e) {
              // ignore
            } finally {
              setIsSubmitting(false);
              setAutoStartMode(false);
              if (!cancelled) onStartCall();
            }

            return;
          }

          setWaitingForProfile(true);

          // try immediate fetch first, then poll for a short period
          const maxAttempts = 10; // 10 * 500ms = 5s
          for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
            try {
              const res = await fetch('https://livekit-backend-1zev.onrender.com/profile');
              if (res.status === 200) {
                const data = await res.json();
                if (data) {
                  // map backend profile -> frontend fields
                  const fields = {
                    childName: data.name ?? data.childName ?? '',
                    age: data.age ?? data.age ?? '',
                    gender: data.gender ?? data.gender ?? 'male',
                    interests: data.likes ?? data.interests ?? '',
                    currentLearning: data.learning ?? data.currentLearning ?? '',
                  };

                  // set local fields for visibility (not necessary)
                  if (fields.childName) setChildName(fields.childName);
                  if (fields.age) setAge(String(fields.age));
                  if (fields.gender) setGender(fields.gender);
                  if (fields.interests) setInterests(fields.interests);
                  if (fields.currentLearning) setCurrentLearning(fields.currentLearning);

                  // convert back to backend-expected keys before POSTing
                  const backendPayload = {
                    name: fields.childName || undefined,
                    age: fields.age || undefined,
                    gender: fields.gender || undefined,
                    likes: fields.interests || undefined,
                    learning: fields.currentLearning || undefined,
                  };

                  try {
                    setIsSubmitting(true);
                    await fetch('https://livekit-backend-1zev.onrender.com/profile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(backendPayload),
                    });
                  } catch (e) {
                    // ignore
                  } finally {
                    setIsSubmitting(false);
                    setWaitingForProfile(false);
                    setAutoStartMode(false);
                    if (!cancelled) onStartCall();
                  }

                  return;
                }
              }
            } catch (e) {
              // ignore fetch errors and retry
            }

            // wait 500ms before next attempt
            await new Promise((r) => setTimeout(r, 500));
          }

          // timed out waiting for profile; fall back to showing the form
          if (!cancelled) {
            setWaitingForProfile(false);
            setAutoStartMode(false);
          }
        }
      } catch (e) {
        // noop
        setWaitingForProfile(false);
        setAutoStartMode(false);
      }
    };

    doAutoStart();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div ref={ref}>
      {autoStartMode && waitingForProfile ? (
        <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
          <section className="w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mb-6 flex items-center justify-center gap-3">
              <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Starting session…</h2>
            </div>
            <p className="mb-4 text-sm text-gray-700">
              Waiting for profile from Talkypie and starting the call automatically.
            </p>
            <div className="mt-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
            </div>
          </section>
        </div>
      ) : (
        <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
          <section className="w-full max-w-2xl rounded-2xl bg-white p-8 text-center shadow-xl">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto mb-6"
            >
              <path
                d="M15 24V40C15 40.7957 14.6839 41.5587 14.1213 42.1213C13.5587 42.6839 12.7956 43 12 43C11.2044 43 10.4413 42.6839 9.87868 42.1213C9.31607 41.5587 9 40.7957 9 40V24C9 23.2044 9.31607 22.4413 9.87868 21.8787C10.4413 21.3161 11.2044 21 12 21C12.7956 21 13.5587 21.3161 14.1213 21.8787C14.6839 22.4413 15 23.2044 15 24ZM22 5C21.2044 5 20.4413 5.31607 19.8787 5.87868C19.3161 6.44129 19 7.20435 19 8V56C19 56.7957 19.3161 57.5587 19.8787 58.1213C20.4413 58.6839 21.2044 59 22 59C22.7956 59 23.5587 58.6839 24.1213 58.1213C24.6839 57.5587 25 56.7957 25 56V8C25 7.20435 24.6839 6.44129 24.1213 5.87868C23.5587 5.31607 22.7956 5 22 5ZM32 13C31.2044 13 30.4413 13.3161 29.8787 13.8787C29.3161 14.4413 29 15.2044 29 16V48C29 48.7957 29.3161 49.5587 29.8787 50.1213C30.4413 50.6839 31.2044 51 32 51C32.7956 51 33.5587 50.6839 34.1213 50.1213C34.6839 49.5587 35 48.7957 35 48V16C35 15.2044 34.6839 14.4413 34.1213 13.8787C33.5587 13.3161 32.7956 13 32 13ZM42 21C41.2043 21 40.4413 21.3161 39.8787 21.8787C39.3161 22.4413 39 23.2044 39 24V40C39 40.7957 39.3161 41.5587 39.8787 42.1213C40.4413 42.6839 41.2043 43 42 43C42.7957 43 43.5587 42.6839 44.1213 42.1213C44.6839 41.5587 45 40.7957 45 40V24C45 23.2044 44.6839 22.4413 44.1213 21.8787C43.5587 21.3161 42.7957 21 42 21ZM52 17C51.2043 17 50.4413 17.3161 49.8787 17.8787C49.3161 18.4413 49 19.2044 49 20V44C49 44.7957 49.3161 45.5587 49.8787 46.1213C50.4413 46.6839 51.2043 47 52 47C52.7957 47 53.5587 46.6839 54.1213 46.1213C54.6839 45.5587 55 44.7957 55 44V20C55 19.2044 54.6839 18.4413 54.1213 17.8787C53.5587 17.3161 52.7957 17 52 17Z"
                fill="currentColor"
              />
            </svg>

            <h2 className="mb-3 text-2xl font-bold text-gray-900">Voice AI Agent</h2>
            <p className="mb-6 text-gray-600">Chat live with your voice AI agent</p>

            <Button
              variant="primary"
              size="lg"
              onClick={onStartCall}
              className="mx-auto w-64 font-mono"
            >
              {startButtonText}
            </Button>

            <form
              className="hidden space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                submitProfileAndStart();
              }}
            >
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="childName"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Child Name
                  </label>
                  <input
                    id="childName"
                    name="childName"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
                    Age
                  </label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min="1"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                    What does your child like (or dislike)?
                  </label>
                  <div className="mb-2 rounded-lg bg-rose-50 p-4">
                    <div className="mb-3 flex items-start gap-2">
                      <StarIcon className="mt-1 h-6 w-6 text-xl text-rose-600" />
                      <div>
                        <h4 className="mb-1 font-semibold text-rose-900">
                          Interests & Preferences
                        </h4>
                        <p className="text-sm text-rose-800">
                          Help us understand what excites or bores your child, so Talkypie can spark
                          better conversations.
                        </p>
                      </div>
                    </div>
                    <div className="ml-7 rounded-lg bg-rose-100 p-3">
                      <p className="mb-1 text-sm font-medium text-rose-800">✍ Example:</p>
                      <p className="text-sm text-rose-700">
                        Loves animals and space, dislikes long stories; enjoys jokes, music, and
                        pretend play.
                      </p>
                    </div>
                  </div>
                  <textarea
                    id="interests"
                    name="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    rows={4}
                    placeholder="Tell us about your child's likes, dislikes, hobbies, favorite activities, and interests..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="currentLearning"
                    className="block text-sm font-medium text-gray-700"
                  >
                    What is your child currently learning in school?
                  </label>
                  <div className="mb-2 rounded-lg bg-blue-50 p-4">
                    <div className="mb-3 flex items-start gap-2">
                      <GraduationIcon className="mt-1 h-6 w-6 text-xl text-blue-600" />
                      <div>
                        <h4 className="mb-1 font-semibold text-blue-900">Current Learning</h4>
                        <p className="text-sm text-blue-800">
                          Let Talkypie gently support your child's current learning through playful
                          chat.
                        </p>
                      </div>
                    </div>
                    <div className="ml-7 rounded-lg bg-blue-100 p-3">
                      <p className="mb-1 text-sm font-medium text-blue-800">✍ Example:</p>
                      <p className="text-sm text-blue-700">
                        Learning addition and subtraction, Hindi alphabets, and the solar system.
                      </p>
                    </div>
                  </div>
                  <textarea
                    id="currentLearning"
                    name="currentLearning"
                    value={currentLearning}
                    onChange={(e) => setCurrentLearning(e.target.value)}
                    rows={4}
                    placeholder="Share what your child is currently studying in school, subjects they're working on, or skills they're developing..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Starting...' : 'Continue to Setup'}
              </button>
            </form>
          </section>
        </div>
      )}

      <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
        <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
          Need help getting set up? Check out the{' '}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.livekit.io/agents/start/voice-ai/"
            className="underline"
          >
            Voice AI quickstart
          </a>
          .
        </p>
      </div>
    </div>
  );
};
