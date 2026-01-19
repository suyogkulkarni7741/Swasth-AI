'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AyurvedicRemedy() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [symptoms, setSymptoms] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New State for AI Integration
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  // Keep these for static fallback/suggestions if needed
  const [showDetailedRemedy, setShowDetailedRemedy] = useState(false);
  const [currentRemedy, setCurrentRemedy] = useState<any>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const commonSymptoms = [
    { id: 'headache', name: 'Headache', icon: 'ri-brain-line' },
    { id: 'cough', name: 'Cough', icon: 'ri-lungs-line' },
    { id: 'fever', name: 'Fever', icon: 'ri-thermometer-line' },
    { id: 'stomach-pain', name: 'Stomach Pain', icon: 'ri-heart-pulse-line' },
    { id: 'fatigue', name: 'Fatigue', icon: 'ri-battery-low-line' },
    { id: 'stress', name: 'Stress', icon: 'ri-mind-map' },
    { id: 'insomnia', name: 'Insomnia', icon: 'ri-moon-line' },
    { id: 'skin-issues', name: 'Skin Issues', icon: 'ri-hand-heart-line' },
    { id: 'joint-pain', name: 'Joint Pain', icon: 'ri-bone-line' },
    { id: 'digestive-issues', name: 'Digestive Issues', icon: 'ri-restaurant-line' },
    { id: 'cold', name: 'Cold', icon: 'ri-snowy-line' },
    { id: 'anxiety', name: 'Anxiety', icon: 'ri-emotion-unhappy-line' }
  ];

  // Static remedies data (kept for "Common Suggestions" display)
  const remedies = [
    {
      id: 1,
      name: 'Turmeric Golden Milk',
      symptoms: ['inflammation', 'immunity', 'joint-pain', 'fatigue'],
      description: 'Anti-inflammatory drink for boosting immunity and reducing pain',
      ingredients: ['1 cup milk (dairy or plant-based)', '1 tsp turmeric powder', '1 tbsp honey', '1/4 tsp black pepper', '1/2 tsp ginger powder', '1/4 tsp cinnamon'],
      preparation: [
        'Heat milk in a saucepan over medium heat',
        'Add turmeric, ginger, and cinnamon',
        'Whisk continuously for 3-5 minutes',
        'Add black pepper and stir well',
        'Remove from heat and let cool slightly',
        'Add honey and mix well',
        'Serve warm before bedtime'
      ],
      benefits: ['Reduces inflammation', 'Boosts immunity', 'Better sleep', 'Joint pain relief', 'Antioxidant properties'],
      dosage: 'Drink once daily, preferably before bedtime',
      precautions: ['Avoid if allergic to turmeric', 'Consult doctor if on blood thinners', 'May stain teeth if consumed frequently'],
      image: 'https://readdy.ai/api/search-image?query=golden%20turmeric%20milk%20in%20traditional%20Indian%20cup%2C%20warm%20lighting%2C%20ayurvedic%20herbs%20around%2C%20natural%20wooden%20background%2C%20steam%20rising%20from%20cup%2C%20soothing%20amber%20colors%2C%20traditional%20medicine%20aesthetic&width=400&height=300&seq=turmeric2&orientation=landscape'
    },
    {
      id: 2,
      name: 'Ginger Tea for Digestive Issues',
      symptoms: ['stomach-pain', 'digestive-issues', 'nausea'],
      description: 'Soothing tea for digestive problems and nausea relief',
      ingredients: ['2 inches fresh ginger root', '2 cups water', '1 lemon (juiced)', '2 tbsp honey', '5-6 fresh mint leaves'],
      preparation: [
        'Peel and slice ginger root thinly',
        'Boil water in a pot',
        'Add ginger slices and simmer for 10 minutes',
        'Strain the tea into cups',
        'Add lemon juice and honey',
        'Garnish with fresh mint leaves',
        'Serve hot after meals'
      ],
      benefits: ['Improves digestion', 'Reduces nausea', 'Anti-inflammatory', 'Relieves stomach cramps', 'Boosts metabolism'],
      dosage: 'Drink 2-3 times daily, especially after meals',
      precautions: ['Avoid if you have gallstones', 'May interact with blood thinners', 'Limit intake if pregnant'],
      image: 'https://readdy.ai/api/search-image?query=fresh%20ginger%20tea%20in%20glass%20cup%2C%20sliced%20ginger%20root%2C%20mint%20leaves%2C%20lemon%20slices%2C%20warm%20steam%2C%20natural%20kitchen%20setting%2C%20golden%20warm%20lighting%2C%20healthy%20herbal%20tea%20aesthetic&width=400&height=300&seq=ginger3&orientation=landscape'
    },
    {
      id: 3,
      name: 'Ashwagandha for Stress',
      symptoms: ['stress', 'anxiety', 'insomnia', 'fatigue'],
      description: 'Natural adaptogen for stress relief and better sleep',
      ingredients: ['1 tsp ashwagandha powder', '1 cup warm milk', '1 tbsp honey', '1 tsp ghee', '1/4 tsp cardamom powder'],
      preparation: [
        'Warm milk in a saucepan',
        'Add ashwagandha powder and whisk well',
        'Add cardamom powder and mix',
        'Heat for 2-3 minutes while stirring',
        'Remove from heat',
        'Add honey and ghee',
        'Drink warm 1 hour before bedtime'
      ],
      benefits: ['Reduces stress', 'Improves sleep', 'Boosts energy', 'Enhances mental clarity', 'Supports immune system'],
      dosage: 'Once daily in the evening, preferably on empty stomach',
      precautions: ['Avoid during pregnancy', 'May lower blood pressure', 'Consult doctor if on medications'],
      image: 'https://readdy.ai/api/search-image?query=ashwagandha%20herb%20powder%20in%20wooden%20bowl%2C%20traditional%20ayurvedic%20setting%2C%20green%20herbs%2C%20natural%20lighting%2C%20peaceful%20meditation%20background%2C%20healing%20herbs%20aesthetic&width=400&height=300&seq=ashwa3&orientation=landscape'
    },
    {
      id: 4,
      name: 'Tulsi Tea for Respiratory Health',
      symptoms: ['cough', 'cold', 'fever', 'respiratory-issues'],
      description: 'Holy basil remedy for respiratory health and immunity',
      ingredients: ['15-20 fresh tulsi leaves', '2 cups water', '1 tsp honey', '1/2 tsp ginger paste', '1/4 tsp black pepper'],
      preparation: [
        'Wash tulsi leaves thoroughly',
        'Boil water in a pot',
        'Add tulsi leaves and ginger paste',
        'Simmer for 8-10 minutes',
        'Add black pepper and boil for 2 more minutes',
        'Strain the tea',
        'Add honey and serve hot'
      ],
      benefits: ['Respiratory health', 'Cough relief', 'Immune support', 'Reduces fever', 'Antioxidant properties'],
      dosage: 'Drink 2-3 times daily during illness, once daily for prevention',
      precautions: ['May lower blood sugar', 'Avoid if on diabetes medication without consultation', 'Safe for most people'],
      image: 'https://readdy.ai/api/search-image?query=fresh%20tulsi%20holy%20basil%20leaves%20in%20traditional%20copper%20pot%2C%20steam%20rising%2C%20green%20herbs%2C%20wooden%20background%2C%20natural%20healing%20environment%2C%20sacred%20plant%20aesthetic%2C%20peaceful%20lighting&width=400&height=300&seq=tulsi3&orientation=landscape'
    }
  ];

  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  // --- UPDATED: Main Function to Call Python Backend ---
  const handleGetRemedies = async () => {
    // Combine text input and tags
    const query = [symptoms, ...selectedSymptoms].filter(Boolean).join(", ");
    
    if (!query) return;

    setLoading(true);
    setAiResponse(null); // Clear previous results
    setShowDetailedRemedy(false); // Hide static details if open

    try {
      // Call the Python API running on port 8000
      const res = await fetch('http://localhost:8000/api/remedy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: query }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      setAiResponse(data.response);
      
      // Auto-scroll to results
      setTimeout(() => {
        document.getElementById('ai-result-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error("Failed to fetch remedy", error);
      setAiResponse("Sorry, I couldn't connect to the AI Knowledge Base. Please ensure the Python backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Helper for static list (fallback)
  const getRecommendedRemedies = () => {
    if (selectedSymptoms.length === 0) return [];
    return remedies.filter(remedy => 
      remedy.symptoms.some(symptom => selectedSymptoms.includes(symptom))
    );
  };

  const showRemedyDetails = (remedy: any) => {
    setCurrentRemedy(remedy);
    setShowDetailedRemedy(true);
    setAiResponse(null); // Clear AI response when viewing static detail
    setTimeout(() => {
      document.getElementById('detailed-remedy-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const filteredRemedies = getRecommendedRemedies().filter(remedy => 
    remedy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    remedy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <main className="relative z-10 max-w-7xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Tell Your Symptoms
          </h2>
          <p className={`text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Describe your symptoms and get personalized ayurvedic remedies
          </p>
        </div>

        {/* Symptoms Input Section */}
        <div className={`rounded-3xl p-8 mb-12 ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'} backdrop-blur-md shadow-xl`}>
          <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            What symptoms are you experiencing?
          </h3>
          
          {/* Text Input */}
          <div className="mb-6">
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms in detail (e.g. 'I have a dry cough and headache since yesterday')..."
              className={`w-full p-4 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode ? 'bg-gray-700/70 text-white placeholder-gray-400 border border-gray-600/50 backdrop-blur-sm' : 'bg-white/70 text-gray-900 placeholder-gray-500 backdrop-blur-sm border border-gray-200/50'
              }`}
              rows={4}
            />
          </div>

          {/* Common Symptoms */}
          <div className="mb-6">
            <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Or select from common symptoms:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonSymptoms.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all flex items-center whitespace-nowrap ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                      : isDarkMode
                      ? 'bg-gray-700/70 text-gray-300 hover:bg-gray-600/70 backdrop-blur-sm'
                      : 'bg-white/70 text-gray-600 hover:bg-gray-100/70 backdrop-blur-sm'
                  }`}
                >
                  <i className={`${symptom.icon} mr-2`}></i>
                  {symptom.name}
                </button>
              ))}
            </div>
          </div>

          {/* Get Remedies Button (UPDATED) */}
          <div className="text-center">
            <button 
              onClick={handleGetRemedies}
              disabled={loading || (selectedSymptoms.length === 0 && !symptoms.trim())}
              className={`px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-semibold hover:shadow-lg transition-all whitespace-nowrap ${
                loading || (selectedSymptoms.length === 0 && !symptoms.trim()) 
                  ? 'opacity-75 cursor-not-allowed' 
                  : 'hover:scale-105'
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Consulting Knowledge Base...
                </span>
              ) : (
                <span className="flex items-center">
                  <i className="ri-medicine-bottle-line mr-2"></i>
                  Get Personalized Remedies
                </span>
              )}
            </button>
          </div>
        </div>

        {/* --- NEW AI RESULTS SECTION --- */}
        {aiResponse && (
          <div id="ai-result-section" className="max-w-4xl mx-auto px-4 mb-16">
            <div className={`rounded-3xl p-8 ${isDarkMode ? 'bg-gray-800/60 border-gray-700' : 'bg-white/60 border-white/40'} border backdrop-blur-md shadow-xl`}>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 shadow-sm">
                  <i className="ri-magic-line text-green-600 text-xl"></i>
                </div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  AI Doctor's Recommendation
                </h3>
              </div>
              
              <div className={`prose max-w-none ${isDarkMode ? 'prose-invert text-gray-300' : 'text-gray-700'}`}>
                {aiResponse.split('\n').map((line, i) => (
                   <p key={i} className={`mb-2 leading-relaxed ${line.trim().startsWith('**') || /^\d+\./.test(line.trim()) ? 'font-semibold mt-4 text-lg' : ''}`}>
                     {line.replaceAll('**', '')}
                   </p>
                 ))}
              </div>
              
              <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-center text-gray-500">
                Disclaimer: This is AI-generated advice based on ayurvedic texts. Always consult a certified doctor for serious conditions.
              </div>
            </div>
          </div>
        )}

        {/* Detailed Remedy Section (Static Fallback) */}
        {showDetailedRemedy && currentRemedy && (
          <div id="detailed-remedy-section" className="mb-12">
            <div className={`rounded-3xl p-8 ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'} backdrop-blur-md shadow-xl`}>
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Image and Basic Info */}
                <div>
                  <img
                    src={currentRemedy.image}
                    alt={currentRemedy.name}
                    className="w-full h-64 object-cover object-top rounded-2xl mb-6"
                  />
                  <h3 className={`text-3xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {currentRemedy.name}
                  </h3>
                  <p className={`text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {currentRemedy.description}
                  </p>
                  
                  {/* Benefits */}
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                      Benefits:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentRemedy.benefits.map((benefit: string, index: number) => (
                        <span
                          key={index}
                          className={`px-3 py-1 text-sm rounded-full ${
                            isDarkMode ? 'bg-green-800/50 text-green-200' : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Dosage */}
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      Dosage:
                    </h4>
                    <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {currentRemedy.dosage}
                    </p>
                  </div>
                </div>

                {/* Right Column - Ingredients and Preparation */}
                <div>
                  {/* Ingredients */}
                  <div className="mb-8">
                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Ingredients:
                    </h4>
                    <div className="space-y-2">
                      {currentRemedy.ingredients.map((ingredient: string, index: number) => (
                        <div key={index} className="flex items-center">
                          <i className="ri-check-line text-green-500 mr-3 flex-shrink-0"></i>
                          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {ingredient}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preparation */}
                  <div className="mb-8">
                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      Preparation:
                    </h4>
                    <div className="space-y-3">
                      {currentRemedy.preparation.map((step: string, index: number) => (
                        <div key={index} className="flex items-start">
                          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {step}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precautions */}
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-yellow-50/70 border border-yellow-200/50'} backdrop-blur-sm`}>
                    <h4 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      <i className="ri-alert-line mr-2"></i>
                      Precautions:
                    </h4>
                    <ul className="space-y-1">
                      {currentRemedy.precautions.map((precaution: string, index: number) => (
                        <li key={index} className={`text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                          • {precaution}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Back to Results Button */}
              <div className="text-center mt-8">
                <button
                  onClick={() => setShowDetailedRemedy(false)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                    isDarkMode ? 'bg-gray-700/70 text-white hover:bg-gray-600/70 backdrop-blur-sm' : 'bg-gray-100/70 text-gray-700 hover:bg-gray-200/70 backdrop-blur-sm'
                  }`}
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Back to Results
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Remedies Cards (Suggestions Section) */}
        {!showDetailedRemedy && !aiResponse && (selectedSymptoms.length > 0 || symptoms.trim()) && (
          <div className="mb-12">
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Common Suggestions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRemedies.map((remedy) => (
                <div
                  key={remedy.id}
                  className={`rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer ${
                    isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'
                  } backdrop-blur-md`}
                  onClick={() => showRemedyDetails(remedy)}
                >
                  <img
                    src={remedy.image}
                    alt={remedy.name}
                    className="w-full h-48 object-cover object-top"
                  />
                  <div className="p-6">
                    <h4 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {remedy.name}
                    </h4>
                    <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {remedy.description}
                    </p>
                    
                    <button className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium hover:shadow-lg transition-shadow whitespace-nowrap">
                      View Full Recipe
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredRemedies.length === 0 && selectedSymptoms.length > 0 && (
              <div className="text-center py-16">
                 <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Click "Get Personalized Remedies" above for AI advice.
                </p>
              </div>
            )}
          </div>
        )}

        {!showDetailedRemedy && !aiResponse && selectedSymptoms.length === 0 && !symptoms.trim() && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-stethoscope-line text-white text-2xl"></i>
            </div>
            <h4 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Tell us about your symptoms
            </h4>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select symptoms or describe your condition to get personalized ayurvedic remedies
            </p>
          </div>
        )}
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