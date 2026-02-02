
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

const LiveAudioController: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState('');
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  // World-class manual base64 decoding as per guidelines
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  // World-class manual base64 encoding as per guidelines
  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // World-class PCM decoding as per guidelines for raw streams
  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const stopSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    setIsActive(false);
    for (const s of sourcesRef.current) s.stop();
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    // Guidelines: Always create a new GoogleGenAI instance right before making an API call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks: {
        onopen: () => {
          setIsActive(true);
          const inputCtx = new AudioContext({ sampleRate: 16000 });
          const source = inputCtx.createMediaStreamSource(stream);
          const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
              int16[i] = inputData[i] * 32768;
            }
            
            // Guidelines: Use the sessionPromise to send data to prevent race conditions or stale closures
            sessionPromise.then(session => {
              session.sendRealtimeInput({
                media: { 
                  data: encode(new Uint8Array(int16.buffer)), 
                  mimeType: 'audio/pcm;rate=16000' 
                }
              });
            });
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputCtx.destination);
        },
        onmessage: async (msg: any) => {
          if (msg.serverContent?.outputTranscription) {
            setTranscription(prev => prev + msg.serverContent.outputTranscription.text);
          }
          if (msg.serverContent?.turnComplete) {
            setTranscription('');
          }
          
          const base64EncodedAudioString = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64EncodedAudioString && audioContextRef.current) {
            // Guidelines: Use a running timestamp to ensure smooth, gapless playback
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.addEventListener('ended', () => {
              sourcesRef.current.delete(source);
            });
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            sourcesRef.current.add(source);
          }

          if (msg.serverContent?.interrupted) {
            for (const s of sourcesRef.current) {
              s.stop();
              sourcesRef.current.delete(s);
            }
            nextStartTimeRef.current = 0;
          }
        },
        onerror: (e) => console.error("Gemini Live session error:", e),
        onclose: () => {
          setIsActive(false);
          stopSession();
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        outputAudioTranscription: {},
        systemInstruction: "You are a real-time voice strategist for a surplus recovery firm. Be concise, professional, and clear."
      }
    });

    sessionRef.current = await sessionPromise;
  };

  return (
    <div className="glass p-4 rounded-xl flex items-center gap-4">
      <button 
        onClick={isActive ? stopSession : startSession}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isActive ? 'bg-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'bg-emerald-500 hover:bg-emerald-400'
        }`}
      >
        {isActive ? (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
        )}
      </button>
      <div>
        <h4 className="font-bold text-sm">{isActive ? 'Strategist Listening...' : 'Talk to a Strategist'}</h4>
        <p className="text-xs text-slate-400">{isActive ? (transcription || '...') : 'Tap to start real-time audio session'}</p>
      </div>
    </div>
  );
};

export default LiveAudioController;
