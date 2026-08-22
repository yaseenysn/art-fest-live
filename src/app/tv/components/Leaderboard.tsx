"use client";

import { LeaderboardConfig } from '@/types';
import OriginalLeaderboard from './OriginalLeaderboard';
import LeaderboardDesign2 from './LeaderboardDesign2';
import LeaderboardDesign3 from './LeaderboardDesign3';
import LeaderboardDesign4 from './LeaderboardDesign4';
import CurrentProgramStatus from './CurrentProgramStatus';

export default function Leaderboard({ config, isPreview }: { config?: LeaderboardConfig; isPreview?: boolean }) {
  console.log("[LEADERBOARD] rendering:", config?.presentation);
  
  if (!config) return null;

  const renderDesign = () => {
    switch (config.presentation) {
      case 'design2':
        return <LeaderboardDesign2 key={config.presentation} config={config} />;
      case 'design3':
        return <LeaderboardDesign3 key={config.presentation} config={config} />;
      case 'design4':
        return <LeaderboardDesign4 key={config.presentation} config={config} />;
      case 'design1':
      default:
        return <OriginalLeaderboard key={config.presentation || 'design1'} config={config} />;
    }
  };

  return (
    <div className="relative w-full h-full">
      <CurrentProgramStatus presentation={config.presentation} />
      {renderDesign()}
    </div>
  );
}
