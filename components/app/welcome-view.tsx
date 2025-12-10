// 'use client';

// import { useState } from 'react';
// import { useEffect } from 'react';
// import { Button } from '@/components/livekit/button';

// interface WelcomeViewProps {
//   startButtonText: string;
//   onStartCall: () => void;
// }

// const ChildIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor" />
//     <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor" />
//   </svg>
// );

// const StarIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path
//       d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
//       fill="currentColor"
//     />
//   </svg>
// );

// const GraduationIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
//     <path d="M11 12.65V21h2v-8.35l-1 .55-1-.55z" fill="currentColor" />
//   </svg>
// );

// export const WelcomeView = ({
//   startButtonText,
//   onStartCall,
//   ref,
// }: React.ComponentProps<'div'> & WelcomeViewProps) => {
//   const [childName, setChildName] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState('male');
//   const [interests, setInterests] = useState('');
//   const [currentLearning, setCurrentLearning] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [autoStartMode, setAutoStartMode] = useState(false);
//   const [waitingForProfile, setWaitingForProfile] = useState(false);

//   const submitProfileAndStart = async () => {
//     // map to backend-expected LiveKit profile keys
//     const payload = {
//       name: childName || undefined,
//       age: age || undefined,
//       gender: gender || undefined,
//       likes: interests || undefined,
//       learning: currentLearning || undefined,
//     };

//     setIsSubmitting(true);
//     try {
//       await fetch('livekit-backend-production.up.railway.app/profile', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//     } catch (e) {
//       // ignore errors — the agent will still start with defaults
//     } finally {
//       setIsSubmitting(false);
//       onStartCall();
//     }
//   };

//   // Auto-start: hide the form and poll GET /profile when ?autoStart=true
//   useEffect(() => {
//     let cancelled = false;
//     const doAutoStart = async () => {
//       try {
//         const params = new URLSearchParams(window.location.search);
//         if (params.get('autoStart') === 'true') {
//           setAutoStartMode(true);

//           // If Talkypie passed profile data in query params, start immediately
//           const qpName = params.get('name');
//           const qpLikes = params.get('likes');
//           if (qpName || qpLikes) {
//             const backendPayload = {
//               name: qpName || undefined,
//               age: params.get('age') || undefined,
//               gender: params.get('gender') || undefined,
//               likes: qpLikes || undefined,
//               learning: params.get('learning') || undefined,
//             };

//             try {
//               setIsSubmitting(true);
//               await fetch('livekit-backend-production.up.railway.app/profile', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(backendPayload),
//               });
//             } catch (e) {
//               // ignore
//             } finally {
//               setIsSubmitting(false);
//               setAutoStartMode(false);
//               if (!cancelled) onStartCall();
//             }

//             return;
//           }

//           setWaitingForProfile(true);

//           // try immediate fetch first, then poll for a short period
//           const maxAttempts = 10; // 10 * 500ms = 5s
//           for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
//             try {
//               const res = await fetch('livekit-backend-production.up.railway.app/profile');
//               if (res.status === 200) {
//                 const data = await res.json();
//                 if (data) {
//                   // map backend profile -> frontend fields
//                   const fields = {
//                     childName: data.name ?? data.childName ?? '',
//                     age: data.age ?? data.age ?? '',
//                     gender: data.gender ?? data.gender ?? 'male',
//                     interests: data.likes ?? data.interests ?? '',
//                     currentLearning: data.learning ?? data.currentLearning ?? '',
//                   };

//                   // set local fields for visibility (not necessary)
//                   if (fields.childName) setChildName(fields.childName);
//                   if (fields.age) setAge(String(fields.age));
//                   if (fields.gender) setGender(fields.gender);
//                   if (fields.interests) setInterests(fields.interests);
//                   if (fields.currentLearning) setCurrentLearning(fields.currentLearning);

//                   // convert back to backend-expected keys before POSTing
//                   const backendPayload = {
//                     name: fields.childName || undefined,
//                     age: fields.age || undefined,
//                     gender: fields.gender || undefined,
//                     likes: fields.interests || undefined,
//                     learning: fields.currentLearning || undefined,
//                   };

//                   try {
//                     setIsSubmitting(true);
//                     await fetch('livekit-backend-production.up.railway.app/profile', {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify(backendPayload),
//                     });
//                   } catch (e) {
//                     // ignore
//                   } finally {
//                     setIsSubmitting(false);
//                     setWaitingForProfile(false);
//                     setAutoStartMode(false);
//                     if (!cancelled) onStartCall();
//                   }

//                   return;
//                 }
//               }
//             } catch (e) {
//               // ignore fetch errors and retry
//             }

//             // wait 500ms before next attempt
//             await new Promise((r) => setTimeout(r, 500));
//           }

//           // timed out waiting for profile; fall back to showing the form
//           if (!cancelled) {
//             setWaitingForProfile(false);
//             setAutoStartMode(false);
//           }
//         }
//       } catch (e) {
//         // noop
//         setWaitingForProfile(false);
//         setAutoStartMode(false);
//       }
//     };

//     doAutoStart();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <div ref={ref}>
//       {autoStartMode && waitingForProfile ? (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Starting session…</h2>
//             </div>
//             <p className="mb-4 text-sm text-gray-700">
//               Waiting for profile from Talkypie and starting the call automatically.
//             </p>
//             <div className="mt-4">
//               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
//             </div>
//           </section>
//         </div>
//       ) : (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Kid's Profile</h2>
//             </div>

//             <form
//               className="space-y-6"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 submitProfileAndStart();
//               }}
//             >
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label
//                     htmlFor="childName"
//                     className="mb-1 block text-sm font-medium text-gray-700"
//                   >
//                     Child Name
//                   </label>
//                   <input
//                     id="childName"
//                     name="childName"
//                     value={childName}
//                     onChange={(e) => setChildName(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
//                     Age
//                   </label>
//                   <input
//                     id="age"
//                     name="age"
//                     type="number"
//                     min="1"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
//                   Gender
//                 </label>
//                 <select
//                   id="gender"
//                   name="gender"
//                   value={gender}
//                   onChange={(e) => setGender(e.target.value)}
//                   required
//                   className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
//                     What does your child like (or dislike)?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-rose-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <StarIcon className="mt-1 h-6 w-6 text-xl text-rose-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-rose-900">
//                           Interests & Preferences
//                         </h4>
//                         <p className="text-sm text-rose-800">
//                           Help us understand what excites or bores your child, so Talkypie can spark
//                           better conversations.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-rose-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-rose-800">✍ Example:</p>
//                       <p className="text-sm text-rose-700">
//                         Loves animals and space, dislikes long stories; enjoys jokes, music, and
//                         pretend play.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="interests"
//                     name="interests"
//                     value={interests}
//                     onChange={(e) => setInterests(e.target.value)}
//                     rows={4}
//                     placeholder="Tell us about your child's likes, dislikes, hobbies, favorite activities, and interests..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label
//                     htmlFor="currentLearning"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     What is your child currently learning in school?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-blue-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <GraduationIcon className="mt-1 h-6 w-6 text-xl text-blue-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-blue-900">Current Learning</h4>
//                         <p className="text-sm text-blue-800">
//                           Let Talkypie gently support your child's current learning through playful
//                           chat.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-blue-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-blue-800">✍ Example:</p>
//                       <p className="text-sm text-blue-700">
//                         Learning addition and subtraction, Hindi alphabets, and the solar system.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="currentLearning"
//                     name="currentLearning"
//                     value={currentLearning}
//                     onChange={(e) => setCurrentLearning(e.target.value)}
//                     rows={4}
//                     placeholder="Share what your child is currently studying in school, subjects they're working on, or skills they're developing..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Starting...' : 'Continue to Setup'}
//               </button>
//             </form>
//           </section>
//         </div>
//       )}

//       <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
//         <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
//           Need help getting set up? Check out the{' '}
//           <a
//             target="_blank"
//             rel="noopener noreferrer"
//             href="https://docs.livekit.io/agents/start/voice-ai/"
//             className="underline"
//           >
//             Voice AI quickstart
//           </a>
//           .
//         </p>
//       </div>
//     </div>
//   );
// };

'use client';

import { useEffect } from 'react';

// 'use client';

// import { useState } from 'react';
// import { useEffect } from 'react';
// import { Button } from '@/components/livekit/button';

// interface WelcomeViewProps {
//   startButtonText: string;
//   onStartCall: () => void;
// }

// const ChildIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor" />
//     <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor" />
//   </svg>
// );

// const StarIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path
//       d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
//       fill="currentColor"
//     />
//   </svg>
// );

// const GraduationIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
//     <path d="M11 12.65V21h2v-8.35l-1 .55-1-.55z" fill="currentColor" />
//   </svg>
// );

// export const WelcomeView = ({
//   startButtonText,
//   onStartCall,
//   ref,
// }: React.ComponentProps<'div'> & WelcomeViewProps) => {
//   const [childName, setChildName] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState('male');
//   const [interests, setInterests] = useState('');
//   const [currentLearning, setCurrentLearning] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [autoStartMode, setAutoStartMode] = useState(false);
//   const [waitingForProfile, setWaitingForProfile] = useState(false);

//   const submitProfileAndStart = async () => {
//     // map to backend-expected LiveKit profile keys
//     const payload = {
//       name: childName || undefined,
//       age: age || undefined,
//       gender: gender || undefined,
//       likes: interests || undefined,
//       learning: currentLearning || undefined,
//     };

//     setIsSubmitting(true);
//     try {
//       await fetch('livekit-backend-production.up.railway.app/profile', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//     } catch (e) {
//       // ignore errors — the agent will still start with defaults
//     } finally {
//       setIsSubmitting(false);
//       onStartCall();
//     }
//   };

//   // Auto-start: hide the form and poll GET /profile when ?autoStart=true
//   useEffect(() => {
//     let cancelled = false;
//     const doAutoStart = async () => {
//       try {
//         const params = new URLSearchParams(window.location.search);
//         if (params.get('autoStart') === 'true') {
//           setAutoStartMode(true);

//           // If Talkypie passed profile data in query params, start immediately
//           const qpName = params.get('name');
//           const qpLikes = params.get('likes');
//           if (qpName || qpLikes) {
//             const backendPayload = {
//               name: qpName || undefined,
//               age: params.get('age') || undefined,
//               gender: params.get('gender') || undefined,
//               likes: qpLikes || undefined,
//               learning: params.get('learning') || undefined,
//             };

//             try {
//               setIsSubmitting(true);
//               await fetch('livekit-backend-production.up.railway.app/profile', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(backendPayload),
//               });
//             } catch (e) {
//               // ignore
//             } finally {
//               setIsSubmitting(false);
//               setAutoStartMode(false);
//               if (!cancelled) onStartCall();
//             }

//             return;
//           }

//           setWaitingForProfile(true);

//           // try immediate fetch first, then poll for a short period
//           const maxAttempts = 10; // 10 * 500ms = 5s
//           for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
//             try {
//               const res = await fetch('livekit-backend-production.up.railway.app/profile');
//               if (res.status === 200) {
//                 const data = await res.json();
//                 if (data) {
//                   // map backend profile -> frontend fields
//                   const fields = {
//                     childName: data.name ?? data.childName ?? '',
//                     age: data.age ?? data.age ?? '',
//                     gender: data.gender ?? data.gender ?? 'male',
//                     interests: data.likes ?? data.interests ?? '',
//                     currentLearning: data.learning ?? data.currentLearning ?? '',
//                   };

//                   // set local fields for visibility (not necessary)
//                   if (fields.childName) setChildName(fields.childName);
//                   if (fields.age) setAge(String(fields.age));
//                   if (fields.gender) setGender(fields.gender);
//                   if (fields.interests) setInterests(fields.interests);
//                   if (fields.currentLearning) setCurrentLearning(fields.currentLearning);

//                   // convert back to backend-expected keys before POSTing
//                   const backendPayload = {
//                     name: fields.childName || undefined,
//                     age: fields.age || undefined,
//                     gender: fields.gender || undefined,
//                     likes: fields.interests || undefined,
//                     learning: fields.currentLearning || undefined,
//                   };

//                   try {
//                     setIsSubmitting(true);
//                     await fetch('livekit-backend-production.up.railway.app/profile', {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify(backendPayload),
//                     });
//                   } catch (e) {
//                     // ignore
//                   } finally {
//                     setIsSubmitting(false);
//                     setWaitingForProfile(false);
//                     setAutoStartMode(false);
//                     if (!cancelled) onStartCall();
//                   }

//                   return;
//                 }
//               }
//             } catch (e) {
//               // ignore fetch errors and retry
//             }

//             // wait 500ms before next attempt
//             await new Promise((r) => setTimeout(r, 500));
//           }

//           // timed out waiting for profile; fall back to showing the form
//           if (!cancelled) {
//             setWaitingForProfile(false);
//             setAutoStartMode(false);
//           }
//         }
//       } catch (e) {
//         // noop
//         setWaitingForProfile(false);
//         setAutoStartMode(false);
//       }
//     };

//     doAutoStart();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <div ref={ref}>
//       {autoStartMode && waitingForProfile ? (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Starting session…</h2>
//             </div>
//             <p className="mb-4 text-sm text-gray-700">
//               Waiting for profile from Talkypie and starting the call automatically.
//             </p>
//             <div className="mt-4">
//               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
//             </div>
//           </section>
//         </div>
//       ) : (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Kid's Profile</h2>
//             </div>

//             <form
//               className="space-y-6"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 submitProfileAndStart();
//               }}
//             >
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label
//                     htmlFor="childName"
//                     className="mb-1 block text-sm font-medium text-gray-700"
//                   >
//                     Child Name
//                   </label>
//                   <input
//                     id="childName"
//                     name="childName"
//                     value={childName}
//                     onChange={(e) => setChildName(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
//                     Age
//                   </label>
//                   <input
//                     id="age"
//                     name="age"
//                     type="number"
//                     min="1"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
//                   Gender
//                 </label>
//                 <select
//                   id="gender"
//                   name="gender"
//                   value={gender}
//                   onChange={(e) => setGender(e.target.value)}
//                   required
//                   className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
//                     What does your child like (or dislike)?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-rose-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <StarIcon className="mt-1 h-6 w-6 text-xl text-rose-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-rose-900">
//                           Interests & Preferences
//                         </h4>
//                         <p className="text-sm text-rose-800">
//                           Help us understand what excites or bores your child, so Talkypie can spark
//                           better conversations.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-rose-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-rose-800">✍ Example:</p>
//                       <p className="text-sm text-rose-700">
//                         Loves animals and space, dislikes long stories; enjoys jokes, music, and
//                         pretend play.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="interests"
//                     name="interests"
//                     value={interests}
//                     onChange={(e) => setInterests(e.target.value)}
//                     rows={4}
//                     placeholder="Tell us about your child's likes, dislikes, hobbies, favorite activities, and interests..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label
//                     htmlFor="currentLearning"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     What is your child currently learning in school?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-blue-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <GraduationIcon className="mt-1 h-6 w-6 text-xl text-blue-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-blue-900">Current Learning</h4>
//                         <p className="text-sm text-blue-800">
//                           Let Talkypie gently support your child's current learning through playful
//                           chat.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-blue-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-blue-800">✍ Example:</p>
//                       <p className="text-sm text-blue-700">
//                         Learning addition and subtraction, Hindi alphabets, and the solar system.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="currentLearning"
//                     name="currentLearning"
//                     value={currentLearning}
//                     onChange={(e) => setCurrentLearning(e.target.value)}
//                     rows={4}
//                     placeholder="Share what your child is currently studying in school, subjects they're working on, or skills they're developing..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Starting...' : 'Continue to Setup'}
//               </button>
//             </form>
//           </section>
//         </div>
//       )}

//       <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
//         <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
//           Need help getting set up? Check out the{' '}
//           <a
//             target="_blank"
//             rel="noopener noreferrer"
//             href="https://docs.livekit.io/agents/start/voice-ai/"
//             className="underline"
//           >
//             Voice AI quickstart
//           </a>
//           .
//         </p>
//       </div>
//     </div>
//   );
// };

// 'use client';

// import { useState } from 'react';
// import { useEffect } from 'react';
// import { Button } from '@/components/livekit/button';

// interface WelcomeViewProps {
//   startButtonText: string;
//   onStartCall: () => void;
// }

// const ChildIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor" />
//     <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor" />
//   </svg>
// );

// const StarIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path
//       d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
//       fill="currentColor"
//     />
//   </svg>
// );

// const GraduationIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
//     <path d="M11 12.65V21h2v-8.35l-1 .55-1-.55z" fill="currentColor" />
//   </svg>
// );

// export const WelcomeView = ({
//   startButtonText,
//   onStartCall,
//   ref,
// }: React.ComponentProps<'div'> & WelcomeViewProps) => {
//   const [childName, setChildName] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState('male');
//   const [interests, setInterests] = useState('');
//   const [currentLearning, setCurrentLearning] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [autoStartMode, setAutoStartMode] = useState(false);
//   const [waitingForProfile, setWaitingForProfile] = useState(false);

//   const submitProfileAndStart = async () => {
//     // map to backend-expected LiveKit profile keys
//     const payload = {
//       name: childName || undefined,
//       age: age || undefined,
//       gender: gender || undefined,
//       likes: interests || undefined,
//       learning: currentLearning || undefined,
//     };

//     setIsSubmitting(true);
//     try {
//       await fetch('livekit-backend-production.up.railway.app/profile', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//     } catch (e) {
//       // ignore errors — the agent will still start with defaults
//     } finally {
//       setIsSubmitting(false);
//       onStartCall();
//     }
//   };

//   // Auto-start: hide the form and poll GET /profile when ?autoStart=true
//   useEffect(() => {
//     let cancelled = false;
//     const doAutoStart = async () => {
//       try {
//         const params = new URLSearchParams(window.location.search);
//         if (params.get('autoStart') === 'true') {
//           setAutoStartMode(true);

//           // If Talkypie passed profile data in query params, start immediately
//           const qpName = params.get('name');
//           const qpLikes = params.get('likes');
//           if (qpName || qpLikes) {
//             const backendPayload = {
//               name: qpName || undefined,
//               age: params.get('age') || undefined,
//               gender: params.get('gender') || undefined,
//               likes: qpLikes || undefined,
//               learning: params.get('learning') || undefined,
//             };

//             try {
//               setIsSubmitting(true);
//               await fetch('livekit-backend-production.up.railway.app/profile', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(backendPayload),
//               });
//             } catch (e) {
//               // ignore
//             } finally {
//               setIsSubmitting(false);
//               setAutoStartMode(false);
//               if (!cancelled) onStartCall();
//             }

//             return;
//           }

//           setWaitingForProfile(true);

//           // try immediate fetch first, then poll for a short period
//           const maxAttempts = 10; // 10 * 500ms = 5s
//           for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
//             try {
//               const res = await fetch('livekit-backend-production.up.railway.app/profile');
//               if (res.status === 200) {
//                 const data = await res.json();
//                 if (data) {
//                   // map backend profile -> frontend fields
//                   const fields = {
//                     childName: data.name ?? data.childName ?? '',
//                     age: data.age ?? data.age ?? '',
//                     gender: data.gender ?? data.gender ?? 'male',
//                     interests: data.likes ?? data.interests ?? '',
//                     currentLearning: data.learning ?? data.currentLearning ?? '',
//                   };

//                   // set local fields for visibility (not necessary)
//                   if (fields.childName) setChildName(fields.childName);
//                   if (fields.age) setAge(String(fields.age));
//                   if (fields.gender) setGender(fields.gender);
//                   if (fields.interests) setInterests(fields.interests);
//                   if (fields.currentLearning) setCurrentLearning(fields.currentLearning);

//                   // convert back to backend-expected keys before POSTing
//                   const backendPayload = {
//                     name: fields.childName || undefined,
//                     age: fields.age || undefined,
//                     gender: fields.gender || undefined,
//                     likes: fields.interests || undefined,
//                     learning: fields.currentLearning || undefined,
//                   };

//                   try {
//                     setIsSubmitting(true);
//                     await fetch('livekit-backend-production.up.railway.app/profile', {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify(backendPayload),
//                     });
//                   } catch (e) {
//                     // ignore
//                   } finally {
//                     setIsSubmitting(false);
//                     setWaitingForProfile(false);
//                     setAutoStartMode(false);
//                     if (!cancelled) onStartCall();
//                   }

//                   return;
//                 }
//               }
//             } catch (e) {
//               // ignore fetch errors and retry
//             }

//             // wait 500ms before next attempt
//             await new Promise((r) => setTimeout(r, 500));
//           }

//           // timed out waiting for profile; fall back to showing the form
//           if (!cancelled) {
//             setWaitingForProfile(false);
//             setAutoStartMode(false);
//           }
//         }
//       } catch (e) {
//         // noop
//         setWaitingForProfile(false);
//         setAutoStartMode(false);
//       }
//     };

//     doAutoStart();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <div ref={ref}>
//       {autoStartMode && waitingForProfile ? (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Starting session…</h2>
//             </div>
//             <p className="mb-4 text-sm text-gray-700">
//               Waiting for profile from Talkypie and starting the call automatically.
//             </p>
//             <div className="mt-4">
//               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
//             </div>
//           </section>
//         </div>
//       ) : (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Kid's Profile</h2>
//             </div>

//             <form
//               className="space-y-6"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 submitProfileAndStart();
//               }}
//             >
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label
//                     htmlFor="childName"
//                     className="mb-1 block text-sm font-medium text-gray-700"
//                   >
//                     Child Name
//                   </label>
//                   <input
//                     id="childName"
//                     name="childName"
//                     value={childName}
//                     onChange={(e) => setChildName(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
//                     Age
//                   </label>
//                   <input
//                     id="age"
//                     name="age"
//                     type="number"
//                     min="1"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
//                   Gender
//                 </label>
//                 <select
//                   id="gender"
//                   name="gender"
//                   value={gender}
//                   onChange={(e) => setGender(e.target.value)}
//                   required
//                   className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
//                     What does your child like (or dislike)?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-rose-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <StarIcon className="mt-1 h-6 w-6 text-xl text-rose-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-rose-900">
//                           Interests & Preferences
//                         </h4>
//                         <p className="text-sm text-rose-800">
//                           Help us understand what excites or bores your child, so Talkypie can spark
//                           better conversations.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-rose-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-rose-800">✍ Example:</p>
//                       <p className="text-sm text-rose-700">
//                         Loves animals and space, dislikes long stories; enjoys jokes, music, and
//                         pretend play.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="interests"
//                     name="interests"
//                     value={interests}
//                     onChange={(e) => setInterests(e.target.value)}
//                     rows={4}
//                     placeholder="Tell us about your child's likes, dislikes, hobbies, favorite activities, and interests..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label
//                     htmlFor="currentLearning"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     What is your child currently learning in school?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-blue-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <GraduationIcon className="mt-1 h-6 w-6 text-xl text-blue-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-blue-900">Current Learning</h4>
//                         <p className="text-sm text-blue-800">
//                           Let Talkypie gently support your child's current learning through playful
//                           chat.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-blue-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-blue-800">✍ Example:</p>
//                       <p className="text-sm text-blue-700">
//                         Learning addition and subtraction, Hindi alphabets, and the solar system.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="currentLearning"
//                     name="currentLearning"
//                     value={currentLearning}
//                     onChange={(e) => setCurrentLearning(e.target.value)}
//                     rows={4}
//                     placeholder="Share what your child is currently studying in school, subjects they're working on, or skills they're developing..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Starting...' : 'Continue to Setup'}
//               </button>
//             </form>
//           </section>
//         </div>
//       )}

//       <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
//         <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
//           Need help getting set up? Check out the{' '}
//           <a
//             target="_blank"
//             rel="noopener noreferrer"
//             href="https://docs.livekit.io/agents/start/voice-ai/"
//             className="underline"
//           >
//             Voice AI quickstart
//           </a>
//           .
//         </p>
//       </div>
//     </div>
//   );
// };

// 'use client';

// import { useState } from 'react';
// import { useEffect } from 'react';
// import { Button } from '@/components/livekit/button';

// interface WelcomeViewProps {
//   startButtonText: string;
//   onStartCall: () => void;
// }

// const ChildIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" fill="currentColor" />
//     <path d="M4 20c0-4 4-6 8-6s8 2 8 6v1H4v-1z" fill="currentColor" />
//   </svg>
// );

// const StarIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path
//       d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
//       fill="currentColor"
//     />
//   </svg>
// );

// const GraduationIcon = ({ className }: { className?: string }) => (
//   <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
//     <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" fill="currentColor" />
//     <path d="M11 12.65V21h2v-8.35l-1 .55-1-.55z" fill="currentColor" />
//   </svg>
// );

// export const WelcomeView = ({
//   startButtonText,
//   onStartCall,
//   ref,
// }: React.ComponentProps<'div'> & WelcomeViewProps) => {
//   const [childName, setChildName] = useState('');
//   const [age, setAge] = useState('');
//   const [gender, setGender] = useState('male');
//   const [interests, setInterests] = useState('');
//   const [currentLearning, setCurrentLearning] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [autoStartMode, setAutoStartMode] = useState(false);
//   const [waitingForProfile, setWaitingForProfile] = useState(false);

//   const submitProfileAndStart = async () => {
//     // map to backend-expected LiveKit profile keys
//     const payload = {
//       name: childName || undefined,
//       age: age || undefined,
//       gender: gender || undefined,
//       likes: interests || undefined,
//       learning: currentLearning || undefined,
//     };

//     setIsSubmitting(true);
//     try {
//       await fetch('livekit-backend-production.up.railway.app/profile', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });
//     } catch (e) {
//       // ignore errors — the agent will still start with defaults
//     } finally {
//       setIsSubmitting(false);
//       onStartCall();
//     }
//   };

//   // Auto-start: hide the form and poll GET /profile when ?autoStart=true
//   useEffect(() => {
//     let cancelled = false;
//     const doAutoStart = async () => {
//       try {
//         const params = new URLSearchParams(window.location.search);
//         if (params.get('autoStart') === 'true') {
//           setAutoStartMode(true);

//           // If Talkypie passed profile data in query params, start immediately
//           const qpName = params.get('name');
//           const qpLikes = params.get('likes');
//           if (qpName || qpLikes) {
//             const backendPayload = {
//               name: qpName || undefined,
//               age: params.get('age') || undefined,
//               gender: params.get('gender') || undefined,
//               likes: qpLikes || undefined,
//               learning: params.get('learning') || undefined,
//             };

//             try {
//               setIsSubmitting(true);
//               await fetch('livekit-backend-production.up.railway.app/profile', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(backendPayload),
//               });
//             } catch (e) {
//               // ignore
//             } finally {
//               setIsSubmitting(false);
//               setAutoStartMode(false);
//               if (!cancelled) onStartCall();
//             }

//             return;
//           }

//           setWaitingForProfile(true);

//           // try immediate fetch first, then poll for a short period
//           const maxAttempts = 10; // 10 * 500ms = 5s
//           for (let attempt = 0; attempt < maxAttempts && !cancelled; attempt++) {
//             try {
//               const res = await fetch('livekit-backend-production.up.railway.app/profile');
//               if (res.status === 200) {
//                 const data = await res.json();
//                 if (data) {
//                   // map backend profile -> frontend fields
//                   const fields = {
//                     childName: data.name ?? data.childName ?? '',
//                     age: data.age ?? data.age ?? '',
//                     gender: data.gender ?? data.gender ?? 'male',
//                     interests: data.likes ?? data.interests ?? '',
//                     currentLearning: data.learning ?? data.currentLearning ?? '',
//                   };

//                   // set local fields for visibility (not necessary)
//                   if (fields.childName) setChildName(fields.childName);
//                   if (fields.age) setAge(String(fields.age));
//                   if (fields.gender) setGender(fields.gender);
//                   if (fields.interests) setInterests(fields.interests);
//                   if (fields.currentLearning) setCurrentLearning(fields.currentLearning);

//                   // convert back to backend-expected keys before POSTing
//                   const backendPayload = {
//                     name: fields.childName || undefined,
//                     age: fields.age || undefined,
//                     gender: fields.gender || undefined,
//                     likes: fields.interests || undefined,
//                     learning: fields.currentLearning || undefined,
//                   };

//                   try {
//                     setIsSubmitting(true);
//                     await fetch('livekit-backend-production.up.railway.app/profile', {
//                       method: 'POST',
//                       headers: { 'Content-Type': 'application/json' },
//                       body: JSON.stringify(backendPayload),
//                     });
//                   } catch (e) {
//                     // ignore
//                   } finally {
//                     setIsSubmitting(false);
//                     setWaitingForProfile(false);
//                     setAutoStartMode(false);
//                     if (!cancelled) onStartCall();
//                   }

//                   return;
//                 }
//               }
//             } catch (e) {
//               // ignore fetch errors and retry
//             }

//             // wait 500ms before next attempt
//             await new Promise((r) => setTimeout(r, 500));
//           }

//           // timed out waiting for profile; fall back to showing the form
//           if (!cancelled) {
//             setWaitingForProfile(false);
//             setAutoStartMode(false);
//           }
//         }
//       } catch (e) {
//         // noop
//         setWaitingForProfile(false);
//         setAutoStartMode(false);
//       }
//     };

//     doAutoStart();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   return (
//     <div ref={ref}>
//       {autoStartMode && waitingForProfile ? (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 text-center shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Starting session…</h2>
//             </div>
//             <p className="mb-4 text-sm text-gray-700">
//               Waiting for profile from Talkypie and starting the call automatically.
//             </p>
//             <div className="mt-4">
//               <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-300 border-t-indigo-600" />
//             </div>
//           </section>
//         </div>
//       ) : (
//         <div className="mb-20 flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 md:mb-0">
//           <section className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
//             <div className="mb-6 flex items-center justify-center gap-3">
//               <ChildIcon className="h-8 w-8 text-3xl text-indigo-600" />
//               <h2 className="text-2xl font-bold text-gray-900">Kid's Profile</h2>
//             </div>

//             <form
//               className="space-y-6"
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 submitProfileAndStart();
//               }}
//             >
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div>
//                   <label
//                     htmlFor="childName"
//                     className="mb-1 block text-sm font-medium text-gray-700"
//                   >
//                     Child Name
//                   </label>
//                   <input
//                     id="childName"
//                     name="childName"
//                     value={childName}
//                     onChange={(e) => setChildName(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div>
//                   <label htmlFor="age" className="mb-1 block text-sm font-medium text-gray-700">
//                     Age
//                   </label>
//                   <input
//                     id="age"
//                     name="age"
//                     type="number"
//                     min="1"
//                     value={age}
//                     onChange={(e) => setAge(e.target.value)}
//                     required
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="gender" className="mb-1 block text-sm font-medium text-gray-700">
//                   Gender
//                 </label>
//                 <select
//                   id="gender"
//                   name="gender"
//                   value={gender}
//                   onChange={(e) => setGender(e.target.value)}
//                   required
//                   className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                 >
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 <div className="space-y-2">
//                   <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
//                     What does your child like (or dislike)?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-rose-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <StarIcon className="mt-1 h-6 w-6 text-xl text-rose-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-rose-900">
//                           Interests & Preferences
//                         </h4>
//                         <p className="text-sm text-rose-800">
//                           Help us understand what excites or bores your child, so Talkypie can spark
//                           better conversations.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-rose-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-rose-800">✍ Example:</p>
//                       <p className="text-sm text-rose-700">
//                         Loves animals and space, dislikes long stories; enjoys jokes, music, and
//                         pretend play.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="interests"
//                     name="interests"
//                     value={interests}
//                     onChange={(e) => setInterests(e.target.value)}
//                     rows={4}
//                     placeholder="Tell us about your child's likes, dislikes, hobbies, favorite activities, and interests..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>

//                 <div className="space-y-2">
//                   <label
//                     htmlFor="currentLearning"
//                     className="block text-sm font-medium text-gray-700"
//                   >
//                     What is your child currently learning in school?
//                   </label>
//                   <div className="mb-2 rounded-lg bg-blue-50 p-4">
//                     <div className="mb-3 flex items-start gap-2">
//                       <GraduationIcon className="mt-1 h-6 w-6 text-xl text-blue-600" />
//                       <div>
//                         <h4 className="mb-1 font-semibold text-blue-900">Current Learning</h4>
//                         <p className="text-sm text-blue-800">
//                           Let Talkypie gently support your child's current learning through playful
//                           chat.
//                         </p>
//                       </div>
//                     </div>
//                     <div className="ml-7 rounded-lg bg-blue-100 p-3">
//                       <p className="mb-1 text-sm font-medium text-blue-800">✍ Example:</p>
//                       <p className="text-sm text-blue-700">
//                         Learning addition and subtraction, Hindi alphabets, and the solar system.
//                       </p>
//                     </div>
//                   </div>
//                   <textarea
//                     id="currentLearning"
//                     name="currentLearning"
//                     value={currentLearning}
//                     onChange={(e) => setCurrentLearning(e.target.value)}
//                     rows={4}
//                     placeholder="Share what your child is currently studying in school, subjects they're working on, or skills they're developing..."
//                     className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
//                   />
//                 </div>
//               </div>

//               <button
//                 type="submit"
//                 className="w-full cursor-pointer rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-all duration-300 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300"
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? 'Starting...' : 'Continue to Setup'}
//               </button>
//             </form>
//           </section>
//         </div>
//       )}

//       <div className="fixed bottom-5 left-0 flex w-full items-center justify-center">
//         <p className="text-muted-foreground max-w-prose pt-1 text-xs leading-5 font-normal text-pretty md:text-sm">
//           Need help getting set up? Check out the{' '}
//           <a
//             target="_blank"
//             rel="noopener noreferrer"
//             href="https://docs.livekit.io/agents/start/voice-ai/"
//             className="underline"
//           >
//             Voice AI quickstart
//           </a>
//           .
//         </p>
//       </div>
//     </div>
//   );
// };

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
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
        await fetch('https://livekit-backend-1-production.up.railway.app/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Profile failed to submit, continuing without it');
      }

      onStartCall(); // Start the call immediately!
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
};
