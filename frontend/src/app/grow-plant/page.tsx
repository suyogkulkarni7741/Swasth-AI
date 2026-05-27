'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getPlants, getCareInstruction } from '@/app/actions/plant';
import { useTheme } from "next-themes";
import { signOut, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

// Define types based on schema
type Plant = {
  id: string;
  name: string;
  difficulty: string;
  benefits: string[];
  image: string;
};

type CareInstruction = {
  title: string;
  steps: string[];
  tips: string[];
};

export default function GrowPlant() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [careStage, setCareStage] = useState('planting');
  const [searchQuery, setSearchQuery] = useState('');

  // New state for dynamic data
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<CareInstruction | null>(null);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [loadingInstruction, setLoadingInstruction] = useState(false);

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

  const careStages = [
    { id: 'planting', name: 'Planting', icon: 'ri-seedling-line' },
    { id: 'watering', name: 'Watering', icon: 'ri-drop-line' },
    { id: 'sunlight', name: 'Sunlight', icon: 'ri-sun-line' },
    { id: 'fertilizing', name: 'Fertilizing', icon: 'ri-leaf-line' },
    { id: 'harvesting', name: 'Harvesting', icon: 'ri-scissors-line' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      async function fetchPlants() {
        setLoadingPlants(true); // Ensure loading state is set before fetch
        try {
          const data = await getPlants(searchQuery);
          setPlants(data);
        } catch (error) {
          console.error("Failed to fetch plants", error);
        } finally {
          setLoadingPlants(false);
        }
      }
      fetchPlants();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    async function fetchInstruction() {
      if (!selectedPlant) return;

      setLoadingInstruction(true);
      try {
        const data = await getCareInstruction(selectedPlant, careStage);
        if (data) {
          setCurrentInstruction({
            title: data.title,
            steps: data.steps,
            tips: data.tips
          });
        } else {
          // Fallback if no specific instruction found
          setCurrentInstruction({
            title: 'Care Instructions',
            steps: ['Detailed instructions coming soon.'],
            tips: []
          });
        }
      } catch (error) {
        console.error("Failed to fetch instruction", error);
      } finally {
        setLoadingInstruction(false);
      }
    }

    fetchInstruction();
  }, [selectedPlant, careStage]);



  const careSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPlant && careSectionRef.current) {
      careSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedPlant]);

  const selectedPlantData = plants.find(plant => plant.id === selectedPlant);

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
          {/* Centered Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className={`ri-search-line text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
            </div>
            <input
              type="text"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`pl-10 pr-4 py-2 text-sm rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-green-500 ${isDarkMode ? 'bg-gray-700/70 text-white placeholder-gray-400 border border-gray-600/50 backdrop-blur-sm' : 'bg-white/70 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                }`}
            />
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-700/70 text-yellow-400 hover:bg-gray-600/70 backdrop-blur-sm' : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70 backdrop-blur-sm'
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
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Grow Your Own Medicinal Plants
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Learn to cultivate healing herbs at home with expert guidance
          </p>
        </div>

        {/* Plant Selection */}
        <div className="mb-12">
          <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Choose Your Plant
          </h3>

          {loadingPlants ? (
            <div className="text-center py-12">Loading plants...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plants.map((plant) => (
                <div
                  key={plant.id}
                  onClick={() => setSelectedPlant(plant.id)}
                  className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg h-80 flex flex-col ${selectedPlant === plant.id
                      ? 'ring-2 ring-green-500 shadow-lg scale-105'
                      : isDarkMode
                        ? 'bg-gray-800/40 border border-gray-700/30 backdrop-blur-md hover:bg-gray-700/50'
                        : 'bg-white/40 border border-white/20 backdrop-blur-md hover:bg-white/60'
                    }`}
                >
                  <img
                    src={plant.image}
                    alt={plant.name}
                    className="w-full h-40 object-cover object-top flex-shrink-0"
                  />
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {plant.name}
                      </h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${plant.difficulty === 'Easy'
                            ? 'bg-green-100 text-green-800'
                            : plant.difficulty === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {plant.difficulty}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-wrap content-start">
                      {plant.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className={`inline-block px-2 py-1 text-xs rounded-full mr-1 mb-1 ${isDarkMode ? 'bg-green-800/50 text-green-200' : 'bg-green-100 text-green-800'
                            }`}
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loadingPlants && plants.length === 0 && (
            <div className={`text-center py-12 rounded-xl ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'} backdrop-blur-md`}>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-plant-line text-white text-2xl"></i>
              </div>
              <h4 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Plant not found
              </h4>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                The plant you're looking for will be added soon. Try searching for other available plants.
              </p>
            </div>
          )}
        </div>

        {/* Care Instructions */}
        {selectedPlant && selectedPlantData && (
          <div ref={careSectionRef} className={`rounded-3xl p-8 ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'} backdrop-blur-md shadow-xl`}>
            <div className="flex items-center mb-6">
              <img
                src={selectedPlantData.image}
                alt={selectedPlantData.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedPlantData.name} Care Guide
                </h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Complete growing instructions for optimal results
                </p>
              </div>
            </div>

            {/* Care Stage Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              {careStages.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => setCareStage(stage.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center whitespace-nowrap ${careStage === stage.id
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : isDarkMode
                        ? 'bg-gray-700/70 text-gray-300 hover:bg-gray-600/70 backdrop-blur-sm'
                        : 'bg-gray-100/70 text-gray-600 hover:bg-gray-200/70 backdrop-blur-sm'
                    }`}
                >
                  <i className={`${stage.icon} mr-2`}></i>
                  {stage.name}
                </button>
              ))}
            </div>

            {/* Care Instructions Content */}
            {loadingInstruction ? (
              <div className="text-center py-8">Loading instructions...</div>
            ) : currentInstruction ? (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {currentInstruction.title}
                  </h4>
                  <div className="space-y-3">
                    {currentInstruction.steps.map((step, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {step}
                        </p>
                      </div>
                    ))}
                    {currentInstruction.steps.length === 0 && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No steps available for this stage yet.</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Pro Tips
                  </h4>
                  <div className="space-y-3">
                    {currentInstruction.tips.map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <i className="ri-lightbulb-line text-green-500 mr-3 mt-1 flex-shrink-0"></i>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {tip}
                        </p>
                      </div>
                    ))}
                    {currentInstruction.tips.length === 0 && (
                      <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>No tips available.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {!selectedPlant && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-plant-line text-white text-2xl"></i>
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Select a Plant to Get Started
            </h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Choose from our collection of medicinal plants above to see detailed growing instructions
            </p>
          </div>
        )}
      </main>

      <style jsx>
        {`
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
        `}
      </style>
    </div>
  );
}