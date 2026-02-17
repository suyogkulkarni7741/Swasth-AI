'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function IdentifyPlant() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Track actual file
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [predictions, setPredictions] = useState<Array<{label: string; score: number}>>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save file for upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      // Reset state
      setPredictions([]);
      setError(null);
    }
  };

  const handleIdentify = async () => {
    if (!selectedFile) return;
    
    setIsIdentifying(true);
    setPredictions([]);
    setError(null);

    try {
      // Create form data to send to Python backend
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Call the Python API (running on port 8000)
      const response = await fetch('http://localhost:8000/api/identify', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.predictions) {
        setPredictions(data.predictions);
      } else {
        throw new Error(data.error || 'Failed to identify plant');
      }

    } catch (err: any) {
      console.error('Identification failed:', err);
      setError(err.message || "Failed to connect to the AI server.");
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-emerald-100'}`}>
      {/* Background & Header (Keep your existing background/header code here) */}
      
      <header className={`relative z-10 flex items-center justify-between px-8 py-6 ${isDarkMode ? 'bg-gray-800/70 border-b border-gray-700/50' : 'bg-white/70'} backdrop-blur-md`}>
         {/* ... Your existing header code ... */}
         <div className="flex items-center space-x-3">
            <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
              <i className="ri-arrow-left-line text-xl"></i>
            </Link>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>SwathAI</h1>
         </div>
         <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-100/70"><i className="ri-contrast-line"></i></button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Plant Object Detection
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Powered by EfficientNet & Python
          </p>
        </div>

        <div className={`rounded-3xl p-8 ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'} backdrop-blur-md shadow-xl`}>
          
          {/* Upload Area */}
          <div className="mb-8">
            <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${selectedImage ? 'border-green-500' : 'border-gray-300'}`}>
              {selectedImage ? (
                <img src={selectedImage} alt="Selected" className="max-h-64 mx-auto rounded-lg object-cover" />
              ) : (
                <div className="space-y-4">
                  <i className="ri-upload-cloud-2-line text-4xl text-gray-400"></i>
                  <p className="text-gray-500">Upload a plant image</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="inline-block mt-4 px-6 py-2 bg-green-600 text-red rounded-full cursor-pointer hover:bg-green-700">
                Choose Image
              </label>
            </div>
          </div>

          {/* Detect Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleIdentify}
              disabled={!selectedImage || isIdentifying}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-lg disabled:opacity-50"
            >
              {isIdentifying ? 'Analyzing...' : 'Identify Plant'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Results */}
          {predictions.length > 0 && !isIdentifying && (
            <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-700/30' : 'bg-green-50/30'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Detection Results</h3>
              <div className="space-y-3">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{pred.label}</span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className="flex-1 h-2 rounded-full bg-gray-200">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${pred.score * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-green-600">{Math.round(pred.score * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}