"use client";

import { IResult } from '@/types';
import ResultsDesign1 from './ResultsDesign1';
import ResultsDesign2 from './ResultsDesign2';
import ResultsDesign3 from './ResultsDesign3';
import ResultsDesign4 from './ResultsDesign4';

export default function ResultsRouter({ results, design }: { results: IResult[], design?: string }) {
  if (design === 'design2') return <ResultsDesign2 results={results} />;
  if (design === 'design3') return <ResultsDesign3 results={results} />;
  if (design === 'design4') return <ResultsDesign4 results={results} />;
  
  // Default to design1
  return <ResultsDesign1 results={results} />;
}
