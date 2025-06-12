import { preprocessQuery } from './preprocessQuery';

export interface QueryFeatures {
  law?: string;
  section?: string;
  intent?: string;
  keywords: string[];
}

const lawRegex = /(bns|bnss|bsa|ipc|crpc|iea)/i;
const sectionRegex = /section\s*(\d+)/i;
const intentMap = [
  { intent: 'punishment', patterns: [/punishment|jail|imprisonment|fine|sentence/] },
  { intent: 'definition', patterns: [/define|definition|meaning|what is/] },
  { intent: 'procedure', patterns: [/procedure|process|how to|steps|file|apply/] },
  { intent: 'comparison', patterns: [/compare|difference|vs|versus/] },
  { intent: 'general', patterns: [/.*/] }
];

export function extractFeatures(query: string): QueryFeatures {
  const features: QueryFeatures = { keywords: [] };
  const preprocessed = preprocessQuery(query);

  // Law
  const lawMatch = preprocessed.match(lawRegex);
  if (lawMatch) features.law = lawMatch[1].toUpperCase();

  // Section
  const sectionMatch = preprocessed.match(sectionRegex);
  if (sectionMatch) features.section = sectionMatch[1];

  // Intent
  for (const { intent, patterns } of intentMap) {
    if (patterns.some(p => p.test(preprocessed))) {
      features.intent = intent;
      break;
    }
  }

  // Keywords (remove stopwords, law, section, etc.)
  const stopwords = ['the', 'is', 'what', 'how', 'when', 'where', 'why', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'section', features.law?.toLowerCase()];
  features.keywords = preprocessed.split(' ')
    .filter(w => w.length > 2 && !stopwords.includes(w));
  return features;
} 