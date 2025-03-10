'use client';

import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  type: 'model' | 'dataset';
  fileName: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload = ({ type, fileName, onFileChange }: FileUploadProps) => {
  return (
    <div className="fade-in relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {type === 'model' ? 'Upload Model' : 'Upload Dataset'}
          </h3>
          {fileName ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
          ) : (
            <Upload className="w-6 h-6 text-blue-500" />
          )}
        </div>
        
        <div className="mt-2">
          <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {type === 'model' ? '.pkl files only' : '.csv files only'}
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept={type === 'model' ? '.pkl' : '.csv'}
              onChange={onFileChange}
            />
          </label>
        </div>
        
        {fileName && (
          <div className="fade-in mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              {fileName}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
