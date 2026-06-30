'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from "next-themes";
import { signOut, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function IdentifyPlant() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Track actual file
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [predictions, setPredictions] = useState<Array<{label: string; score: number}>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    if (!session) return;
    toast.success("You have logged out.");
    setTimeout(async () => {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/sign-in";
          },
        },
      });
    }, 1000);
  };

  const isDarkMode = mounted && resolvedTheme === "dark";

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
          <button
            onClick={handleLogout}
            disabled={!session}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-lg ${
              session
                ? 'bg-red-500/80 hover:bg-red-600 cursor-pointer'
                : 'bg-gray-500/50 cursor-not-allowed opacity-50'
            }`}
            title="Logout"
          >
            <i className="ri-logout-box-r-line text-white text-lg"></i>
          </button>
        </div>
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