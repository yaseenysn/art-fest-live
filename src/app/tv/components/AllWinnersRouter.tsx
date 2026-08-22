"use client";

import { AllWinnersPosterProps } from '@/components/AllWinnersPoster';
import AllWinnersPoster from '@/components/AllWinnersPoster';
import WinnerDesign2 from './WinnerDesign2';
import WinnerDesign3 from './WinnerDesign3';
import WinnerDesign4 from '@/app/tv/components/WinnerDesign4';

export interface AllWinnersConfig extends AllWinnersPosterProps {
  presentation?: 'design1' | 'design2' | 'design3' | 'design4';
}

export default function AllWinnersRouter({ config }: { config?: AllWinnersConfig }) {
  if (!config) return null;

  switch (config.presentation) {
    case 'design2':
      return <WinnerDesign2 key={config.presentation} {...config} />;
    case 'design3':
      return <WinnerDesign3 key={config.presentation} {...config} />;
    case 'design4':
      return <WinnerDesign4 key={config.presentation} {...config} />;
    case 'design1':
    default:
      return <AllWinnersPoster key={config.presentation || 'design1'} {...config} />;
  }
}

