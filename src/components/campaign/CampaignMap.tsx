import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CAMPAIGN_RIVALS } from '../../data/campaign';
import { RivalCard } from './RivalCard';
import { useAuthStore } from '../../stores/authStore';
import { CampaignRival } from '../../types/game';

interface CampaignMapProps {
  onChallenge?: (rival: CampaignRival) => void;
}

export const CampaignMap: React.FC<CampaignMapProps> = ({ onChallenge }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentRivalIndex = user?.campaign?.currentRival ?? 0;

  const handleChallenge = (rival: CampaignRival) => {
    if (onChallenge) {
      onChallenge(rival);
    } else {
      navigate(`/play?mode=solo&rival=${rival.id}`);
    }
  };

  // Group rivals by location for visual separation
  const locationGroups: { location: string; rivals: CampaignRival[] }[] = [];
  let currentLocation = '';
  
  CAMPAIGN_RIVALS.forEach(rival => {
    if (rival.location !== currentLocation) {
      currentLocation = rival.location;
      locationGroups.push({ location: currentLocation, rivals: [] });
    }
    locationGroups[locationGroups.length - 1].rivals.push(rival);
  });

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold text-gray-800 inline-block relative" style={{ fontFamily: '"Caveat", cursive' }}>
          Class Championship 🏆
          <div className="absolute -bottom-2 left-0 right-0 h-1 bg-red-400 transform -rotate-1"></div>
          <div className="absolute -bottom-3 left-2 right-2 h-1 bg-red-400 transform rotate-1 opacity-70"></div>
        </h1>
        <p className="mt-6 text-2xl text-gray-600" style={{ fontFamily: '"Patrick Hand", cursive' }}>
          Defeat everyone in the school to become the ultimate Hand Cricket Champion!
        </p>
      </div>

      <div className="relative">
        {/* The dotted path line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0 border-l-4 border-dashed border-gray-400 transform -translate-x-1/2 opacity-50 z-0"></div>

        {locationGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-16 relative z-10">
            {/* Location Banner */}
            <div className="flex justify-center mb-8 relative z-10">
              <div className="bg-yellow-200 border-2 border-yellow-400 text-yellow-800 px-6 py-2 rounded-lg shadow-md transform rotate-2">
                <h2 className="text-3xl font-bold uppercase tracking-wider" style={{ fontFamily: '"Kalam", cursive' }}>
                  {group.location}
                </h2>
              </div>
            </div>

            {/* Rivals in this location */}
            <div className="space-y-12">
              {group.rivals.map((rival) => {
                const rivalGlobalIndex = CAMPAIGN_RIVALS.findIndex(r => r.id === rival.id);
                let state: 'locked' | 'available' | 'defeated' = 'locked';
                
                if (rivalGlobalIndex < currentRivalIndex) {
                  state = 'defeated';
                } else if (rivalGlobalIndex === currentRivalIndex) {
                  state = 'available';
                }

                // Alternate sides for the cards
                const isLeft = rivalGlobalIndex % 2 === 0;

                return (
                  <div key={rival.id} className={`flex ${isLeft ? 'justify-start md:pr-1/2' : 'justify-end md:pl-1/2'} relative`}>
                    {/* Connection dot */}
                    <div className="hidden md:block absolute top-1/2 left-1/2 w-4 h-4 bg-gray-600 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-4 border-white shadow-sm z-10">
                      {state === 'available' && (
                        <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                      )}
                    </div>

                    <div className={`w-full md:w-[90%] lg:w-[80%] flex ${isLeft ? 'justify-end md:mr-12' : 'justify-start md:ml-12'}`}>
                      <div className="w-full">
                        <RivalCard
                          rival={rival}
                          state={state}
                          onChallenge={handleChallenge}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CampaignMap;
