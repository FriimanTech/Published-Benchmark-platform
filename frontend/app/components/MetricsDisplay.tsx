'use client';

import React from 'react';

interface MetricsDisplayProps {
  results: {
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
  } | null;
}

const MetricsDisplay = ({ results }: MetricsDisplayProps) => {
  if (!results) return null;

  const metrics = [
    { name: 'Accuracy', value: results.accuracy * 100, color: 'from-blue-500 to-blue-600' },
    { name: 'Precision', value: results.precision * 100, color: 'from-purple-500 to-purple-600' },
    { name: 'Recall', value: results.recall * 100, color: 'from-pink-500 to-pink-600' },
    { name: 'F1 Score', value: results.f1_score * 100, color: 'from-indigo-500 to-indigo-600' }
  ];

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {metrics.map((metric, index) => (
        <div
          key={metric.name}
          className="fade-in relative overflow-hidden rounded-2xl glass-card p-6"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative z-10">
            <h3 className="text-lg font-medium text-gray-900">{metric.name}</h3>
            <div className="mt-2 flex items-baseline">
              <p className="text-4xl font-bold tracking-tight text-gray-900">
                {metric.value.toFixed(2)}%
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-2">
            <div
              className={`h-full bg-gradient-to-r ${metric.color} shimmer`}
              style={{ width: `${metric.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsDisplay;
