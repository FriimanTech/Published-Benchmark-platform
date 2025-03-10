'use client';

import React, { useState } from 'react';
import { Activity, AlertCircle } from 'lucide-react';
import HeroSection from './components/HeroSection';
import FileUpload from './components/FileUpload';
import MetricsDisplay from './components/MetricsDisplay';
import config from './config';

interface BenchmarkResults {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
}

const BenchmarkApp = () => {
  const [modelFile, setModelFile] = useState<string | null>(null);
  const [datasetFile, setDatasetFile] = useState<string | null>(null);
  const [results, setResults] = useState<BenchmarkResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file: File | null, type: 'model' | 'dataset') => {
    if (!file) return;

    if (type === 'dataset' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file for the dataset');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setError('');
      const response = await fetch(`${config.apiUrl}/upload-${type}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`Failed to upload ${type}`);

      const data = await response.json();
      if (type === 'model') {
        setModelFile(data.filename);
      } else {
        setDatasetFile(data.filename);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error uploading ${type}: ${error.message}`);
      } else {
        setError(`Error uploading ${type}: Unknown error`);
      }
      console.error(error);
    }
  };

  const runBenchmark = async () => {
    if (!modelFile || !datasetFile) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${config.apiUrl}/benchmark?model_id=${modelFile}&dataset_id=${datasetFile}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Benchmark failed');

      const data = await response.json();
      setResults(data.metrics);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error running benchmark: ${error.message}`);
      }
      console.error(error);
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'dataset') => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, type);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <FileUpload
              type="model"
              fileName={modelFile}
              onFileChange={(e) => handleFileChange(e, 'model')}
            />
            <FileUpload
              type="dataset"
              fileName={datasetFile}
              onFileChange={(e) => handleFileChange(e, 'dataset')}
            />
          </div>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              onClick={runBenchmark}
              disabled={!modelFile || !datasetFile || loading}
              className="relative group px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-xl">
                {loading ? (
                  <>
                    <Activity className="animate-spin" />
                    Running Benchmark...
                  </>
                ) : (
                  'Run Benchmark'
                )}
              </div>
            </button>
          </div>
        </div>

        {results && (
          <div className="mt-8">
            <MetricsDisplay results={results} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkApp;
