import { useCallback, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ResumeUploader({ onAnalysisComplete }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
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
      toast.error(err.response?.data?.message || 'Upload failed. Try again.');
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
        ${dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">AI is analyzing your resume...</p>
          <p className="text-gray-400 text-sm">This may take 15-20 seconds</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-2xl">📄</div>
          <p className="text-lg font-medium text-gray-700">Drop your resume here</p>
          <p className="text-gray-400 text-sm">or</p>
          <label className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg cursor-pointer hover:bg-indigo-700 transition font-medium">
            Browse File
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>
          <p className="text-gray-400 text-xs mt-1">PDF only · Max 5MB</p>
        </div>
      )}
    </div>
  );
}