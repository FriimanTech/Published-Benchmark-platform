// 'use client' is necessary for Next.js pages to enable client-side rendering for the React component.
'use client';

// Import React and useState for managing component state.
import React, { useState } from 'react';

// Import visualization components from 'recharts' library to create charts.
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PieChart,
  Pie,
  Cell
} from 'recharts'; // Import only necessary components to optimize code.

// Import icons from 'lucide-react' for UI elements.
import { AlertCircle, Upload, Activity } from 'lucide-react';

// Define a TypeScript interface for the structure of benchmark results.
interface BenchmarkResults {
  accuracy: number;  // Model accuracy (percentage of correct predictions).
  precision: number; // Model precision (positive predictive value).
  recall: number;    // Model recall (sensitivity or true positive rate).
  f1_score: number;  // Model F1 score (harmonic mean of precision and recall).
}

// Main component for the Benchmark Application.
const BenchmarkApp = () => {
  // State variables to manage application data and user interactions.
  const [modelFile, setModelFile] = useState<string | null>(null); // Stores uploaded model file name.
  const [datasetFile, setDatasetFile] = useState<string | null>(null); // Stores uploaded dataset file name.
  const [results, setResults] = useState<BenchmarkResults | null>(null); // Stores benchmark results.
  const [loading, setLoading] = useState(false); // Tracks whether benchmarking is in progress.
  const [error, setError] = useState(''); // Stores error messages.
  const [comment, setComment] = useState(''); // Manages user comments.

  // Handles file uploads and communicates with the backend API.
  const handleUpload = async (file: File | null, type: 'model' | 'dataset') => {
    if (!file) return; // Exit if no file is selected.

    // Ensure dataset files are in CSV format.
    if (type === 'dataset' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file for the dataset');
      return;
    }

    const formData = new FormData(); // Create a FormData object for file upload.
    formData.append('file', file); // Append the file to the FormData object.

    try {
      setError(''); // Clear any existing errors.
      const response = await fetch(`http://localhost:8000/upload-${type}`, {
        method: 'POST', // POST request to backend.
        body: formData, // Send file data.
      });

      if (!response.ok) throw new Error(`Failed to upload ${type}`); // Handle non-200 responses.

      const data = await response.json(); // Parse response JSON.
      if (type === 'model') {
        setModelFile(data.filename); // Store the uploaded model file name.
      } else {
        setDatasetFile(data.filename); // Store the uploaded dataset file name.
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error uploading ${type}: ${error.message}`); // Display error message.
      } else {
        setError(`Error uploading ${type}: Unknown error`); // Handle unexpected errors.
      }
      console.error(error); // Log error for debugging.
    }
  };

  // Initiates a benchmark request to the backend API.
  const runBenchmark = async () => {
    if (!modelFile || !datasetFile) return; // Ensure files are uploaded.

    setLoading(true); // Indicate benchmarking is in progress.
    setError(''); // Clear any existing errors.
    try {
      const response = await fetch(`http://localhost:8000/benchmark?model_id=${modelFile}&dataset_id=${datasetFile}`, {
        method: 'POST', // POST request to backend.
      });

      if (!response.ok) throw new Error('Benchmark failed'); // Handle non-200 responses.

      const data = await response.json(); // Parse response JSON.
      setResults(data.metrics); // Store benchmark results.
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(`Error running benchmark: ${error.message}`); // Display error message.
      }
      console.error(error); // Log error for debugging.
    }
    setLoading(false); // Stop loading indicator.
  };

  // Prepare data for charts based on benchmark results.
  const metricsData = results ? [
    { name: 'Accuracy', value: results.accuracy * 100 },
    { name: 'Precision', value: results.precision * 100 },
    { name: 'Recall', value: results.recall * 100 },
    { name: 'F1 Score', value: results.f1_score * 100 }
  ] : [];

  // Handles file input changes and triggers the upload process.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'model' | 'dataset') => {
    const file = e.target.files?.[0]; // Get selected file.
    if (file) {
      handleUpload(file, type); // Upload file.
    }
  };

  // Handles user comments (e.g., save or process comments).
  const handleCommentSubmit = () => {
    alert('Comment submitted!'); // Placeholder for comment submission logic.
    setComment(''); // Reset comment input.
  };

  return (
    // Main container with a gradient background.
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-2">ML Model Benchmark Platform</h1>
          <p className="text-blue-600">Upload your model and dataset to analyze performance metrics</p>
        </div>

        {/* Two-column layout for uploads and results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* File Upload Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-blue-900 flex items-center gap-2">
                <Upload size={24} /> Upload Files
              </h3>
              <div className="mt-4 space-y-4">
                {/* Upload Model */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Model File</h4>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, 'model')}
                    className="block w-full text-sm text-blue-600
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-lg file:border-0
                             file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700
                             hover:file:bg-blue-100"
                  />
                  {modelFile && <p className="text-green-600 mt-2">✓ Model uploaded: {modelFile}</p>}
                </div>

                {/* Upload Dataset */}
                <div className="border-2 border-dashed border-blue-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Dataset (CSV)</h4>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileChange(e, 'dataset')}
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

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertCircle size={20} />
                  {error}
                </div>
              )}

              {/* Run Benchmark Button */}
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
                {/* Bar Chart */}
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

                {/* Radar Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={metricsData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" />
                      <Radar 
                        name="Score"
                        dataKey="value"
                        stroke="#3b82f6"
                        fill="#60a5fa"
                        fillOpacity={0.6}
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={metricsData} dataKey="value" nameKey="name" fill="#3b82f6" label>
                        {metricsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#60a5fa" : "#3b82f6"} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Comment Section */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-blue-900">Add a Comment</h4>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full h-32 mt-2 border border-blue-200 rounded-lg p-4 text-blue-700"
                    placeholder="Your feedback here..."
                  />
                  <button
                    onClick={handleCommentSubmit}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Submit Comment
                  </button>
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

// Export the component to use it in the application.
export default BenchmarkApp;



