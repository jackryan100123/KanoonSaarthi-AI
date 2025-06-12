import React from 'react';
import DocumentAnalysisFlow from '../components/DocumentAnalysis/DocumentAnalysisFlow';

const DocumentAnalysis: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50 py-8 relative overflow-hidden">
      <DocumentAnalysisFlow />
    </div>
  );
};

export default DocumentAnalysis;