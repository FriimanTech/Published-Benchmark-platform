'use client';
import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { AlertCircle, Upload, Activity } from 'lucide-react';
/*This file holds all the page adjustments*/
const BenchmarkApp = () => {
  const [modelFile, setModelFile] = useState(null);
  const [datasetFile, setDatasetFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (file, type) => {
    if (!file) return;

    // Validate file type for dataset
    if (type === 'dataset' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file for the dataset');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setError('');
      const response = await fetch(`http://localhost:8000/upload-${type}`, {
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
    } catch (error) {
      setError(`Error uploading ${type}: ${error.message}`);
      console.error(error);
    }
  };

  const runBenchmark = async () => {
    if (!modelFile || !datasetFile) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`http://localhost:8000/benchmark?model_id=${modelFile}&dataset_id=${datasetFile}`, {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Benchmark failed');
      
      const data = await response.json();
      setResults(data.metrics);
    } catch (error) {
      setError(`Error running benchmark: ${error.message}`);
    }
    setLoading(false);
  };

  const metricsData = results ? [
    { name: 'Accuracy', value: results.accuracy * 100 },
    { name: 'Precision', value: results.precision * 100 },
    { name: 'Recall', value: results.recall * 100 },
    { name: 'F1 Score', value: results.f1_score * 100 }
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">ML Model Benchmark Platform</h1>
          <p className="text-blue-600">Upload your model and dataset to analyze performance metrics</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <Upload size={24} /> Upload Files
              </h3>
              
              <div className="mt-4 space-y-4">
                {/* Model Upload */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Model File</h4>
                  <input
                    type="file"
                    onChange={(e) => handleUpload(e.target.files[0], 'model')}
                    className="block w-full text-sm text-blue-600
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
                  />
                  {modelFile && <p className="text-green-600 mt-2">✓ Model uploaded: {modelFile}</p>}
                </div>

                {/* Dataset Upload */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Dataset (CSV)</h4>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleUpload(e.target.files[0], 'dataset')}
                    className="block w-full text-sm text-blue-600
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
                  />
                  {datasetFile && <p className="text-green-600 mt-2">✓ Dataset uploaded: {datasetFile}</p>}
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              <button
                onClick={runBenchmark}
                disabled={!modelFile || !datasetFile || loading}
                className="mt-6 w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold
                         hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                         transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Activity className="animate-spin" />
                    Running Benchmark...
                  </>
                ) : (
                  'Run Benchmark'
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-blue-900 mb-4">Results</h3>
            {results ? (
              <div className="space-y-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar 
                        dataKey="value" 
                        fill="#3b82f6" 
                        name="Score (%)"
                        radius={[4, 4, 0, 0]} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {metricsData.map((metric) => (
                    <div key={metric.name} className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-blue-800 font-medium">{metric.name}</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {metric.value.toFixed(2)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-blue-400">
                No results to display yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default BenchmarkApp;