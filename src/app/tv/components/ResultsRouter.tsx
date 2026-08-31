"use client";

import { IResult } from '@/types';
import ResultsDesign1 from './ResultsDesign1';
import ResultsDesign2 from './ResultsDesign2';
import ResultsDesign3 from './ResultsDesign3';
import ResultsDesign4 from './ResultsDesign4';

export default function ResultsRouter({ 
  results, 
  design,
  revealStage = 'WINNER'
}: { 
  results: IResult[], 
  design?: string,
  revealStage?: 'PLACE' | 'WINNER'
}) {
  const currentHash = results.map(r => `${r._id}-${r.position}`).join(',');
  const key = currentHash;

  if (design === 'design2') return <ResultsDesign2 key={key} results={results} revealStage={revealStage} />;
  if (design === 'design3') return <ResultsDesign3 key={key} results={results} revealStage={revealStage} />;
  if (design === 'design4') return <ResultsDesign4 key={key} results={results} revealStage={revealStage} />;
  
  // Default to design1
  return <ResultsDesign1 key={key} results={results} revealStage={revealStage} />;
}
