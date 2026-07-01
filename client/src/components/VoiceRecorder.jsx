import { useState, useRef } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function VoiceRecorder({ onAnalysisComplete }) {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const startRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser. Use Chrome!');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let fullTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          fullTranscript += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(fullTranscript + interim);
    };

    recognition.onerror = (e) => {
      toast.error('Microphone error: ' + e.error);
      setRecording(false);
    };

    recognition.start();
    setRecording(true);
    setTranscript('');
    toast.success('Recording started — speak your experience!');
  };

  const stopAndAnalyze = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRecording(false);

    const finalText = transcript.trim();
    if (finalText.length < 30) {
      toast.error('Please speak more about your experience!');
      return;
    }

    setProcessing(true);
    toast.loading('Analyzing your voice resume...', { id: 'voice-analyze' });

    try {
      const { data } = await api.post('/resume/analyze-text', {
        text: finalText
      });
      toast.success('Voice resume analyzed!', { id: 'voice-analyze' });
      onAnalysisComplete(data);
    } catch (err) {
      toast.error('Analysis failed. Try again!', { id: 'voice-analyze' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Transcript Display */}
      {transcript && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 max-h-32 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-1">Transcript:</p>
          <p className="text-gray-300 text-sm">{transcript}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        {!recording ? (
          <button
            onClick={startRecording}
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-500 hover:bg-red-400 disabled:opacity-40 text-white font-medium rounded-xl transition"
          >
            <span className="w-3 h-3 bg-white rounded-full"/>
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopAndAnalyze}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-xl transition animate-pulse"
          >
            <span className="w-3 h-3 bg-white rounded-full animate-ping"/>
            Stop & Analyze
          </button>
        )}
      </div>

      <p className="text-xs text-gray-600 text-center">
        Speak clearly • Works best in Chrome • English only
      </p>
    </div>
  );
}