import React from 'react';
import { useNavigate } from 'react-router-dom';
import NotebookOverlay from '../components/ui/NotebookOverlay';
import CampaignMap from '../components/campaign/CampaignMap';

const Campaign: React.FC = () => {
  const navigate = useNavigate();

  return (
    <NotebookOverlay>
      <div className="p-4 md:p-8 relative min-h-[calc(100vh-80px)]">
        <div className="flex items-center justify-between mb-8 pl-8 md:pl-10">
          <div>
            <h1 className="text-4xl md:text-5xl handwritten-caveat text-[var(--color-ink-blue)] font-bold">
              School Tournament
            </h1>
            <p className="text-xl handwritten-indie text-[var(--color-ink-red)]">
              Defeat everyone to become the Hand Cricket Champion!
            </p>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="paper-card doodle-border px-4 py-2 text-xl handwritten-patrick hover:bg-gray-100"
          >
            ← Back Home
          </button>
        </div>

        <div className="pl-6 md:pl-10 pb-10">
          <CampaignMap />
        </div>
      </div>
    </NotebookOverlay>
  );
};

export default Campaign;
