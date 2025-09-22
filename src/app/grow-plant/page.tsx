
'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function GrowPlant() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<string | null>(null);
  const [careStage, setCareStage] = useState('planting');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const plantTypes = [
    {
      id: 'tulsi',
      name: 'Holy Basil (Tulsi)',
      difficulty: 'Easy',
      benefits: ['Respiratory health', 'Immunity boost', 'Stress relief'],
      image: 'https://readdy.ai/api/search-image?query=holy%20basil%20tulsi%20plant%20in%20terracotta%20pot%2C%20green%20leaves%2C%20natural%20sunlight%2C%20indoor%20garden%20setting%2C%20peaceful%20home%20environment%2C%20traditional%20indian%20herbs%2C%20healthy%20plant%20growth&width=300&height=200&seq=tulsi4&orientation=landscape'
    },
    {
      id: 'aloe',
      name: 'Aloe Vera',
      difficulty: 'Easy',
      benefits: ['Skin healing', 'Burns treatment', 'Digestive aid'],
      image: 'https://readdy.ai/api/search-image?query=aloe%20vera%20plant%20in%20modern%20pot%2C%20thick%20succulent%20leaves%2C%20bright%20green%20color%2C%20minimal%20home%20decor%2C%20natural%20lighting%2C%20healing%20plant%20aesthetic%2C%20clean%20background&width=300&height=200&seq=aloe2&orientation=landscape'
    },
    {
      id: 'mint',
      name: 'Mint',
      difficulty: 'Easy',
      benefits: ['Digestive health', 'Fresh breath', 'Aromatherapy'],
      image: 'https://readdy.ai/api/search-image?query=fresh%20mint%20plant%20in%20ceramic%20pot%2C%20vibrant%20green%20leaves%2C%20kitchen%20herb%20garden%2C%20natural%20daylight%2C%20cooking%20herbs%2C%20aromatic%20plants%2C%20homegrown%20herbs%20aesthetic&width=300&height=200&seq=mint2&orientation=landscape'
    },
    {
      id: 'ginger',
      name: 'Ginger',
      difficulty: 'Medium',
      benefits: ['Anti-inflammatory', 'Digestive aid', 'Immune support'],
      image: 'https://readdy.ai/api/search-image?query=ginger%20plant%20growing%20in%20pot%2C%20fresh%20green%20shoots%2C%20rhizome%20roots%20visible%2C%20tropical%20indoor%20plant%2C%20wooden%20background%2C%20natural%20herbs%20garden%2C%20sustainable%20growing&width=300&height=200&seq=ginger4&orientation=landscape'
    },
    {
      id: 'neem',
      name: 'Neem',
      difficulty: 'Medium',
      benefits: ['Antibacterial', 'Skin health', 'Natural pesticide'],
      image: 'https://readdy.ai/api/search-image?query=neem%20tree%20sapling%20in%20clay%20pot%2C%20compound%20leaves%2C%20medicinal%20tree%2C%20traditional%20ayurvedic%20plant%2C%20natural%20outdoor%20setting%2C%20green%20foliage%2C%20healing%20tree%20aesthetic&width=300&height=200&seq=neem3&orientation=landscape'
    },
    {
      id: 'ashwagandha',
      name: 'Ashwagandha',
      difficulty: 'Hard',
      benefits: ['Stress reduction', 'Energy boost', 'Adaptogenic'],
      image: 'https://readdy.ai/api/search-image?query=ashwagandha%20plant%20in%20traditional%20pot%2C%20small%20green%20leaves%2C%20medicinal%20herb%20garden%2C%20natural%20earth%20background%2C%20ayurvedic%20herbs%2C%20adaptogenic%20plant%20aesthetic&width=300&height=200&seq=ashwa4&orientation=landscape'
    }
  ];

  const careStages = [
    { id: 'planting', name: 'Planting', icon: 'ri-seedling-line' },
    { id: 'watering', name: 'Watering', icon: 'ri-drop-line' },
    { id: 'sunlight', name: 'Sunlight', icon: 'ri-sun-line' },
    { id: 'fertilizing', name: 'Fertilizing', icon: 'ri-leaf-line' },
    { id: 'harvesting', name: 'Harvesting', icon: 'ri-scissors-line' }
  ];

  const filteredPlants = plantTypes.filter(plant =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plant.benefits.some(benefit => benefit.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getCareInstructions = (plantId: string, stage: string) => {
    const instructions = {
      tulsi: {
        planting: {
          title: 'Planting Tulsi',
          steps: [
            'Choose a well-draining pot with drainage holes',
            'Fill with organic potting mix',
            'Plant seeds 1/4 inch deep or transplant seedlings',
            'Keep soil consistently moist but not waterlogged'
          ],
          tips: ['Best planted in spring or early summer', 'Tulsi prefers warm temperatures']
        },
        watering: {
          title: 'Watering Tulsi',
          steps: [
            'Water when top inch of soil feels dry',
            'Water thoroughly until water drains from bottom',
            'Reduce watering in winter months',
            'Use room temperature water'
          ],
          tips: ['Overwatering can cause root rot', 'Morning watering is best']
        },
        sunlight: {
          title: 'Sunlight for Tulsi',
          steps: [
            'Provide 6-8 hours of direct sunlight daily',
            'Place in south-facing window indoors',
            'Rotate pot weekly for even growth',
            'Supplement with grow lights if needed'
          ],
          tips: ['Tulsi loves bright, direct sunlight', 'Insufficient light causes leggy growth']
        },
        fertilizing: {
          title: 'Fertilizing Tulsi',
          steps: [
            'Feed with balanced organic fertilizer monthly',
            'Use compost tea every 2 weeks',
            'Reduce feeding in winter',
            'Avoid over-fertilizing to prevent reduced oil production'
          ],
          tips: ['Organic fertilizers enhance medicinal properties', 'Fish emulsion works well']
        },
        harvesting: {
          title: 'Harvesting Tulsi',
          steps: [
            'Start harvesting when plant is 6 inches tall',
            'Pinch off flowers to encourage leaf growth',
            'Harvest leaves in morning after dew dries',
            'Cut stems above a pair of leaves for regrowth'
          ],
          tips: ['Regular harvesting promotes bushier growth', 'Dry leaves for tea storage']
        }
      }
    };

    return instructions[plantId as keyof typeof instructions]?.[stage as keyof typeof instructions.tulsi] || {
      title: 'Care Instructions',
      steps: ['Select a plant type to see detailed care instructions'],
      tips: ['Choose from the plant options above']
    };
  };

  const selectedPlantData = plantTypes.find(plant => plant.id === selectedPlant);
  const careInstructions = selectedPlant ? getCareInstructions(selectedPlant, careStage) : null;

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
              className={`pl-10 pr-4 py-2 text-sm rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-green-500 ${
                isDarkMode ? 'bg-gray-700/70 text-white placeholder-gray-400 border border-gray-600/50 backdrop-blur-sm' : 'bg-white/70 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
              }`}
            />
          </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => setSelectedPlant(plant.id)}
                className={`cursor-pointer rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg h-80 flex flex-col ${
                  selectedPlant === plant.id
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
                      className={`px-2 py-1 text-xs rounded-full ${
                        plant.difficulty === 'Easy'
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
                        className={`inline-block px-2 py-1 text-xs rounded-full mr-1 mb-1 ${
                          isDarkMode ? 'bg-green-800/50 text-green-200' : 'bg-green-100 text-green-800'
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

          {filteredPlants.length === 0 && (
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
        {selectedPlant && (
          <div className={`rounded-3xl p-8 ${isDarkMode ? 'bg-gray-800/40 border border-gray-700/30' : 'bg-white/40 border border-white/20'} backdrop-blur-md shadow-xl`}>
            <div className="flex items-center mb-6">
              <img
                src={selectedPlantData?.image}
                alt={selectedPlantData?.name}
                className="w-16 h-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {selectedPlantData?.name} Care Guide
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center whitespace-nowrap ${
                    careStage === stage.id
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
            {careInstructions && (
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {careInstructions.title}
                  </h4>
                  <div className="space-y-3">
                    {careInstructions.steps.map((step, index) => (
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

                <div>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                    Pro Tips
                  </h4>
                  <div className="space-y-3">
                    {careInstructions.tips.map((tip, index) => (
                      <div key={index} className="flex items-start">
                        <i className="ri-lightbulb-line text-green-500 mr-3 mt-1 flex-shrink-0"></i>
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {tip}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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