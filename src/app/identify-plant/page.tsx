'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function IdentifyPlant() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [predictions, setPredictions] = useState<Array<{label: string; score: number}>>([]);
  const modelRef = useRef<any>(null);
  const tfRef = useRef<any>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentify = () => {
    if (!selectedImage) return;
    setIsIdentifying(true);
    setPredictions([]);
    runModelOnImage(selectedImage).finally(() => setIsIdentifying(false));
  };

  // Load TFJS and model (lazy load)
  const loadModel = async () => {
    if (modelRef.current) return modelRef.current;
    const tf = await import('@tensorflow/tfjs');
    tfRef.current = tf;
    try {
      // Try loading as GraphModel (SavedModel format) first
      const model = await tf.loadGraphModel('/models/simple_mobilenet_classifier/model.json');
      modelRef.current = model;
      return model;
    } catch (err) {
      console.error('Failed to load model from /models/simple_mobilenet_classifier/model.json', err);
      throw err;
    }
  };

  const runModelOnImage = async (dataUrl: string) => {
    try {
      const tf = tfRef.current || (await import('@tensorflow/tfjs'));
      tfRef.current = tf;
      const model = await loadModel();

      // Create image element to draw into a canvas
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = dataUrl;
      await new Promise((res, rej) => {
        img.onload = () => res(true);
        img.onerror = (e) => rej(e);
      });

      // Preprocess image: resize to 224×224 (MobileNet standard)
      const inputSize = 224;
      const canvas = document.createElement('canvas');
      canvas.width = inputSize;
      canvas.height = inputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Fill with white background (matching training data)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, inputSize, inputSize);
      
      // Draw image with aspect ratio maintained (cover mode)
      const { width: iw, height: ih } = img;
      const scale = Math.max(inputSize / iw, inputSize / ih);
      const w = iw * scale;
      const h = ih * scale;
      const dx = (inputSize - w) / 2;
      const dy = (inputSize - h) / 2;
      ctx.drawImage(img, dx, dy, w, h);

      // Convert to tensor and normalize to [0, 1]
      // This matches the preprocessing: img_array / 255.0
      const input = tf.browser.fromPixels(canvas).toFloat();
      const normalized = input.div(tf.scalar(255)); // Normalize to [0, 1]
      const batched = normalized.expandDims(0); // Add batch dimension

      // Run prediction (GraphModel)
      let preds = await model.executeAsync(batched) as any;
      // If array, get first output
      if (Array.isArray(preds)) preds = preds[0];
      
      let probs = preds;
      // If shape is [1, N], squeeze batch dimension
      if (probs.shape && probs.shape.length === 2) {
        probs = probs.squeeze([0]);
      }
      
      // Get probabilities
      const probsData = await tf.softmax(probs).data();

      // Try load labels
      let labels: string[] = [];
      try {
        const res = await fetch('/models/simple_mobilenet_classifier/labels.json');
        if (res.ok) labels = await res.json();
      } catch (e) {
        // ignore
      }

      // Get top 3
      const items = Array.from(probsData).map((score, idx) => ({ idx, score }));
      items.sort((a, b) => b.score - a.score);
      const top = items.slice(0, 3).map((it) => ({
        label: labels[it.idx] ?? `class_${it.idx}`,
        score: Math.round(it.score * 10000) / 10000,
      }));

      setPredictions(top);
      tf.dispose([input, normalized, batched, preds]);
      return top;
    } catch (err) {
      console.error('Inference error', err);
      setPredictions([]);
      return [];
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-green-50 to-emerald-100'}`}>
      {/* Fluid Wave Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className={`absolute inset-0 ${isDarkMode ? 'opacity-20' : 'opacity-30'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/40 via-green-500/60 to-teal-400/40 animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/30 via-emerald-700/50 to-teal-600/30 animate-pulse animation-delay-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-teal-500/20 via-green-600/40 to-emerald-500/20 animate-pulse animation-delay-2000"></div>
          </div>
          
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-green-400/10 to-transparent transform rotate-12 animate-pulse"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-500/15 to-transparent transform -rotate-12 animate-pulse animation-delay-1500"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-teal-400/10 to-transparent transform rotate-6 animate-pulse animation-delay-3000"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`relative z-10 flex items-center justify-between px-8 py-6 ${isDarkMode ? 'bg-gray-800/70 border-b border-gray-700/50' : 'bg-white/70'} backdrop-blur-md`}>
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-600 hover:text-green-600 transition-colors">
            <i className="ri-arrow-left-line text-xl"></i>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
              <i className="ri-leaf-line text-white text-xl"></i>
            </div>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`} style={{ fontFamily: 'Pacifico, serif' }}>
              SwathAI
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'bg-gray-700/70 text-yellow-400 hover:bg-gray-600/70 backdrop-blur-sm' : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70 backdrop-blur-sm'
            }`}
          >
            <i className={`text-lg ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center cursor-pointer">
            <i className="ri-user-line text-white text-lg"></i>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Plant Object Detection
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Advanced AI-powered object detection to identify any plant species
          </p>
        </div>

        <div className={`rounded-3xl p-8 ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'} backdrop-blur-md shadow-xl`}>
          {/* Upload Area */}
          <div className="mb-8">
            <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              isDarkMode 
                ? 'border-gray-600/50 hover:border-green-500/50 bg-gray-700/30' 
                : 'border-gray-300/50 hover:border-green-500/50 bg-gray-50/30'
            } backdrop-blur-sm`}>
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="Plant for object detection" 
                    className="max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Image ready for object detection analysis
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <i className="ri-scan-line text-white text-2xl"></i>
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    Upload Plant Image for Detection
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Our AI will detect and identify plant objects in your image
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full cursor-pointer hover:shadow-lg transition-shadow whitespace-nowrap"
              >
                Choose Image
              </label>
            </div>
          </div>

          {/* Detect Button */}
          <div className="text-center mb-8">
            <button
              onClick={handleIdentify}
              disabled={!selectedImage || isIdentifying}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isIdentifying ? (
                <span className="flex items-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Detecting Objects...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="ri-scan-line mr-2"></i>
                  Start Object Detection
                </span>
              )}
            </button>
          </div>

          {/* Results */}
          {isIdentifying && (
            <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-700/30 border border-gray-600/30' : 'bg-green-50/30 border border-green-200/30'} backdrop-blur-sm`}>
              <div className="flex items-center mb-4">
                <i className="ri-scan-line animate-spin text-green-600 text-xl mr-3"></i>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Object Detection in Progress...
                </h3>
              </div>
              <div className="space-y-2">
                <div className={`h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full animate-pulse w-3/4"></div>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Analyzing image for plant objects and species identification...
                </p>
              </div>
            </div>
          )}

          {/* Prediction Results */}
          {predictions.length > 0 && !isIdentifying && (
            <div className={`rounded-xl p-6 ${isDarkMode ? 'bg-gray-700/30 border border-gray-600/30' : 'bg-green-50/30 border border-green-200/30'} backdrop-blur-sm`}>
              <div className="flex items-center mb-4">
                <i className="ri-check-line text-green-600 text-xl mr-3"></i>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  Detection Results
                </h3>
              </div>
              <div className="space-y-3">
                {predictions.map((pred, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {pred.label}
                    </span>
                    <div className="flex items-center gap-3 flex-1 ml-4">
                      <div className={`flex-1 h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                        <div
                          className="h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                          style={{ width: `${pred.score * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                        {Math.round(pred.score * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setPredictions([]);
                }}
                className="mt-4 px-6 py-2 text-sm bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Try Another Image
              </button>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}