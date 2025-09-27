'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  match_score?: number;
}

interface AIJobApplicationProps {
  job: Job;
  onApplicationSubmit: () => void;
}

export default function AIJobApplication({ job, onApplicationSubmit }: AIJobApplicationProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [applicationResult, setApplicationResult] = useState<any>(null);
  
  const handleApply = async () => {
    setIsApplying(true);
    
    try {
      const response = await api.jobs.apply(job.id, {
        job_id: job.id,
        cover_letter: coverLetter
      });
      
      setApplicationResult(response.data);
      onApplicationSubmit();
      
    } catch (error: any) {
      console.error('Application failed:', error);
      setApplicationResult({
        error: error.response?.data?.detail || 'Application failed'
      });
    } finally {
      setIsApplying(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="mb-4">
        <h3 className="text-xl font-bold">{job.title}</h3>
        <p className="text-gray-600">{job.company}</p>
        {job.match_score && (
          <div className="mt-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
              AI Match: {(job.match_score * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold mb-2">Job Requirements:</h4>
        <div className="flex flex-wrap gap-2">
          {job.requirements.map((req, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {req}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Cover Letter (Optional):
        </label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md"
          rows={4}
          placeholder="Write a brief cover letter..."
        />
      </div>
      
      <div className="bg-yellow-50 p-3 rounded-md mb-4">
        <p className="text-sm text-yellow-800">
          🤖 AI will generate a tailored resume specifically for this position based on your profile
        </p>
      </div>
      
      {applicationResult && (
        <div className={`p-3 rounded-md mb-4 ${
          applicationResult.error ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          {applicationResult.error ? (
            <p>Error: {applicationResult.error}</p>
          ) : (
            <div>
              <p>✅ Application submitted successfully!</p>
              <p className="text-sm mt-1">
                Resume generated with AI: {applicationResult.ai_generated ? 'Yes' : 'No'}
              </p>
              {applicationResult.resume_preview && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm">View Resume Preview</summary>
                  <pre className="text-xs mt-1 bg-white p-2 rounded border overflow-auto">
                    {applicationResult.resume_preview}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}
      
      <button
        onClick={handleApply}
        disabled={isApplying}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isApplying ? 'Applying with AI Resume...' : 'Apply with AI-Generated Resume'}
      </button>
    </div>
  );
}