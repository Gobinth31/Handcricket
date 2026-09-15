import React from 'react';
import { PaperCard } from './PaperCard';

interface UserStats {
  totalMatches: number;
  wins: number;
  losses: number;
  highestScore: number;
  wicketsTaken: number;
}

interface ScoreCardProps {
  stats: UserStats;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ stats }) => {
  return (
    <PaperCard className="w-full max-w-md mx-auto my-4">
      <h2 className="font-[var(--font-caveat)] text-3xl text-center mb-6 text-[var(--color-notebook-ink)] border-b-2 border-[var(--color-notebook-line)] pb-2">
        My Cricket Stats
      </h2>
      
      <div className="flex flex-col gap-4">
        <StatRow label="Total Matches" value={stats.totalMatches} />
        <StatRow label="Wins" value={stats.wins} />
        <StatRow label="Losses" value={stats.losses} />
        <StatRow label="Highest Score" value={stats.highestScore} />
        <StatRow label="Wickets Taken" value={stats.wicketsTaken} />
      </div>
    </PaperCard>
  );
};

const StatRow: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="flex justify-between items-end border-b border-[var(--color-notebook-line)] pb-1 relative">
    <span className="font-[var(--font-patrick)] text-xl text-gray-700">{label}</span>
    <span className="font-[var(--font-kalam)] text-2xl font-bold text-[var(--color-notebook-ink)]">
      {value}
    </span>
  </div>
);
