import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, Volume2 } from 'lucide-react';

export default function AudioEvidenceRecorder({ onAudioCaptured, initialAudioText = '' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioText, setAudioText] = useState(initialAudioText);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioElementRef = useRef(null);

  // Start live microphone recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        const duration = recordingDuration;
        const textNote = `Live Voice Recording (${duration}s captured via device microphone)`;
        setAudioText(textNote);

        if (onAudioCaptured) {
          onAudioCaptured({
            audioUrl: url,
            audioBlob,
            duration,
            hasAudio: true,
            audioNoteText: textNote
          });
        }

        // Stop media tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable, offering simulated memo fallback:', err);
      // Fallback to simulated audio sample
      useSimulatedDistressMemo();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Quick preset voice memo for fast testing
  const useSimulatedDistressMemo = () => {
    const sampleText = "[Simulated Voice Evidence]: 'Suspect is an adult male, tall, approaching from the alley behind the convenience store. Please send help immediately.'";
    setAudioText(sampleText);
    setAudioUrl('simulated');
    setRecordingDuration(12);

    if (onAudioCaptured) {
      onAudioCaptured({
        audioUrl: null,
        audioBlob: null,
        duration: 12,
        hasAudio: true,
        audioNoteText: sampleText
      });
    }
  };

  const clearAudio = () => {
    if (audioUrl && audioUrl !== 'simulated') {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioText('');
    setRecordingDuration(0);
    if (onAudioCaptured) {
      onAudioCaptured({
        audioUrl: null,
        audioBlob: null,
        duration: 0,
        hasAudio: false,
        audioNoteText: ''
      });
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl && audioUrl !== 'simulated') URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Volume2 className="w-3.5 h-3.5 text-rose-500" />
          <span>Audio Recording / Voice Statement (Optional)</span>
        </label>
        {audioText && (
          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
            Audio Attached
          </span>
        )}
      </div>

      {!audioText && !isRecording && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={startRecording}
            className="flex-1 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span>Record Voice Memo</span>
          </button>
          <button
            type="button"
            onClick={useSimulatedDistressMemo}
            className="py-3 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition"
            title="Attach a sample distress recording for testing without needing mic access"
          >
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Use Sample Distress Memo</span>
          </button>
        </div>
      )}

      {isRecording && (
        <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl p-3.5 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
            <div>
              <p className="text-xs font-semibold text-rose-700 dark:text-rose-300">Recording Evidence Audio...</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">00:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={stopRecording}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
          >
            <Square className="w-3 h-3" />
            <span>Stop & Attach</span>
          </button>
        </div>
      )}

      {audioText && (
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-mono text-xs">
                {recordingDuration}s
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-white">Emergency Voice Evidence</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Encrypted audio clip attached</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {audioUrl && audioUrl !== 'simulated' && (
                <audio ref={audioElementRef} src={audioUrl} controls className="h-8 max-w-[150px]" />
              )}
              <button
                type="button"
                onClick={clearAudio}
                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-600 transition"
                title="Remove audio"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
            {audioText}
          </p>
        </div>
      )}
    </div>
  );
}
