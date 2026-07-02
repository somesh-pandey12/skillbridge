import { useState, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function VoiceRecorder({ onAnalysisComplete }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Speech recognition not supported! Please use Chrome browser.', { duration: 4000 });
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    transcriptRef.current = '';

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setRecording(true);
      setTranscript('');
      toast.success('🎤 Recording started! Speak your experience...', { duration: 3000 });
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' ';
        } else {
          interimText += event.results[i][0].transcript;
        }
      }

      transcriptRef.current = finalText;
      setTranscript(finalText + interimText);
    };

    recognition.onerror = (e) => {
      console.error('Speech error:', e.error);
      setRecording(false);
      if (e.error === 'not-allowed') {
        toast.error('Microphone permission denied! Please allow mic access.', { duration: 5000 });
      } else if (e.error === 'no-speech') {
        toast.error('No speech detected. Try again!');
      } else {
        toast.error('Recording error: ' + e.error);
      }
    };

    recognition.onend = () => {
      setRecording(false);
    };

    recognition.start();
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  const analyzeTranscript = async () => {
    const finalText = transcriptRef.current.trim() || transcript.trim();

    if (finalText.length < 30) {
      toast.error('Please record more! Speak about your skills and experience.');
      return;
    }

    setProcessing(true);
    const toastId = toast.loading('🤖 AI is analyzing your voice resume...');

    try {
      const { data } = await api.post('/resume/analyze-text', { text: finalText });
      toast.success('✅ Voice resume analyzed!', { id: toastId });
      onAnalysisComplete(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Analysis failed. Try again!';
      toast.error(msg, { id: toastId, duration: 4000 });
    } finally {
      setProcessing(false);
    }
  };

  const clearRecording = () => {
    setTranscript('');
    transcriptRef.current = '';
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);
  };

  return (
    <div className="space-y-4">

      {/* Recording indicator */}
      {recording && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"/>
          <span className="text-red-400 text-sm font-medium">Recording in progress...</span>
        </div>
      )}

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-40 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Transcript</p>
          <p className="text-gray-300 text-sm leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition"
          >
            <span className="w-3 h-3 bg-white rounded-full"/>
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-xl transition"
          >
            <span className="w-3 h-3 bg-red-400 rounded-full"/>
            Stop Recording
          </button>
        )}

        {/* Analyze button — recording band hone ke baad dikhega */}
        {transcript && !recording && (
          <button
            onClick={analyzeTranscript}
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition shadow-lg shadow-violet-500/25"
          >
            {processing ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                Analyzing...
              </>
            ) : (
              <>🤖 Analyze Resume</>
            )}
          </button>
        )}
      </div>

      {/* Clear button */}
      {transcript && !recording && !processing && (
        <button
          onClick={clearRecording}
          className="w-full text-gray-600 hover:text-gray-400 text-xs py-1 transition"
        >
          Clear & Record Again
        </button>
      )}

      <p className="text-xs text-gray-600 text-center">
        🎤 Works best in Chrome · Speak clearly in English · Allow microphone access
      </p>
    </div>
  );
}