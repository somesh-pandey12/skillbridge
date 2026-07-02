import { useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ResumeUploader({ onAnalysisComplete }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Max 5MB allowed.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Resume analyzed successfully!');
      onAnalysisComplete(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Try again.';
      if (msg.includes('scanned') || msg.includes('extract')) {
        toast.error('Scanned PDF detected! Please use a text-based PDF.', { duration: 5000 });
      } else {
        toast.error(msg, { duration: 4000 });
      }
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all
        ${dragOver
          ? 'border-violet-500 bg-violet-500/5'
          : 'border-white/10 hover:border-violet-500/50'}`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"/>
          <p className="text-white font-medium">AI is analyzing your resume...</p>
          <p className="text-gray-500 text-sm">This may take 15-20 seconds</p>
          <div className="flex gap-1 mt-2">
            {['Extracting text', 'Parsing skills', 'Finding gaps'].map((step, i) => (
              <span key={i} className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-1 rounded-full">
                {step}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 bg-violet-500/10 border border-violet-500/20 rounded-2xl flex items-center justify-center text-3xl">
            📄
          </div>
          <p className="text-lg font-medium text-white">Drop your resume here</p>
          <p className="text-gray-600 text-sm">or</p>
          <label className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-xl cursor-pointer transition font-medium shadow-lg shadow-violet-500/25">
            Browse File
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>
          <p className="text-gray-600 text-xs mt-1">PDF only · Max 5MB · Text-based PDFs only</p>
        </div>
      )}
    </div>
  );
}