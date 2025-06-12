import React, { useRef, useState } from 'react';
import DocumentUpload from './DocumentUpload';
import DocumentSummary from './DocumentSummary';
import DocumentQuery from './DocumentQuery';
import { motion } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Loader2 } from 'lucide-react';

const DocumentAnalysisFlow: React.FC = () => {
  const [documentText, setDocumentText] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const queryRef = useRef<HTMLDivElement>(null);

  const handleDocumentAnalyzed = async (text: string) => {
    setDocumentText(text);
    setSummary('');
    setSummaryError(null);
    setSummaryLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `As KanoonSarthi-AI, a specialized legal assistant for Indian law, please provide a comprehensive analysis of the following legal document:
\n${text}\n\nPlease provide:\n1. Document type and classification\n2. Key legal points and provisions\n3. Relevant Indian legal sections (BNS, BNSS, BSA, IPC, CrPC, etc.)\n4. Important dates, parties, and case details (if applicable)\n5. Legal implications and recommendations\n6. Summary of main issues and potential legal actions\n\nFormat your response in a clear, structured manner that would be helpful for legal professionals and citizens alike.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const aiSummary = response.text();
      setSummary(aiSummary);
      setTimeout(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummaryError('Failed to generate summary. Please try again.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-full mx-auto py-12 space-y-12">
      {/* Upload Section */}
      <div className="w-full flex justify-center">
        <DocumentUpload onDocumentAnalyzed={handleDocumentAnalyzed} />
      </div>

      {/* Summary Section */}
      <div ref={summaryRef} className="w-full">
        {summaryLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl border-2 border-primary-100 p-12 min-h-[200px]"
          >
            <Loader2 className="h-10 w-10 text-primary-500 animate-spin mb-4" />
            <div className="text-lg font-semibold text-primary-700">Generating AI summary...</div>
            <div className="text-primary-500 mt-2">This may take a few moments.</div>
          </motion.div>
        )}
        {summaryError && !summaryLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center bg-gradient-to-br from-white to-primary-50 rounded-2xl shadow-xl border-2 border-red-200 p-12 min-h-[200px]"
          >
            <div className="text-lg font-semibold text-red-700">{summaryError}</div>
          </motion.div>
        )}
        {summary && !summaryLoading && !summaryError && (
          <DocumentSummary summary={summary} />
        )}
      </div>

      {/* Query/Chatbot Section */}
      {summary && !summaryLoading && !summaryError && documentText && (
        <div ref={queryRef} className="w-full">
          <DocumentQuery documentText={documentText} />
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysisFlow; 