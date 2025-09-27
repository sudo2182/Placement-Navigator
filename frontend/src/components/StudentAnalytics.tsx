'use client';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AnalyticsData {
  progress?: {
    applications_count: number;
    interviews_count: number;
    offers_count: number;
    success_rate: number;
    recent_activity: any[];
    insights: string[];
  };
  recommendations?: {
    recommended_jobs: any[];
    match_reasons: string[];
    next_steps: string[];
  };
  skill_gaps?: {
    missing_skills: string[];
    skill_recommendations: string[];
    learning_resources: any[];
    market_demand: any[];
  };
}

export default function StudentAnalytics() {
  const [activeTab, setActiveTab] = useState<'progress' | 'recommendations' | 'skills'>('progress');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (type: string) => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      switch (type) {
        case 'progress':
          response = await api.analytics.getProgress();
          break;
        case 'recommendations':
          response = await api.analytics.getRecommendations();
          break;
        case 'skills':
          response = await api.analytics.getSkillGaps();
          break;
        default:
          return;
      }
      
      setAnalyticsData(prev => ({
        ...prev,
        [type]: response.data
      }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(activeTab);
  }, [activeTab]);

  const renderProgressTab = () => {
    const progress = analyticsData.progress;
    if (!progress) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Applications</h3>
            <p className="text-2xl font-bold text-blue-600">{progress.applications_count}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-800">Interviews</h3>
            <p className="text-2xl font-bold text-yellow-600">{progress.interviews_count}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Offers</h3>
            <p className="text-2xl font-bold text-green-600">{progress.offers_count}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">Success Rate</h3>
            <p className="text-2xl font-bold text-purple-600">{(progress.success_rate * 100).toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
          <div className="space-y-2">
            {progress.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-blue-500">💡</span>
                <p className="text-gray-700">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {progress.recent_activity.map((activity, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4">
                <p className="font-medium">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendationsTab = () => {
    const recommendations = analyticsData.recommendations;
    if (!recommendations) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🎯 Recommended Jobs</h3>
          <div className="space-y-4">
            {recommendations.recommended_jobs.map((job, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{job.title}</h4>
                    <p className="text-gray-600">{job.company}</p>
                    <p className="text-sm text-gray-500 mt-1">{job.location}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                    {(job.match_score * 100).toFixed(0)}% Match
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {job.required_skills?.slice(0, 3).map((skill: string, skillIndex: number) => (
                    <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📋 Next Steps</h3>
          <div className="space-y-2">
            {recommendations.next_steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <p className="text-gray-700">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSkillsTab = () => {
    const skills = analyticsData.skill_gaps;
    if (!skills) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">🎯 Skill Gaps</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-red-700">Missing Skills</h4>
              <div className="space-y-2">
                {skills.missing_skills.map((skill, index) => (
                  <span key={index} className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3 text-blue-700">Recommended Skills</h4>
              <div className="space-y-2">
                {skills.skill_recommendations.map((skill, index) => (
                  <span key={index} className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📚 Learning Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.learning_resources.map((resource, index) => (
              <div key={index} className="border border-gray-200 p-4 rounded-lg">
                <h4 className="font-medium">{resource.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-xs text-gray-500">{resource.type}</span>
                  <a 
                    href={resource.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Learn More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📊 Market Demand</h3>
          <div className="space-y-3">
            {skills.market_demand.map((demand, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <span className="font-medium">{demand.skill}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${demand.demand_percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{demand.demand_percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Analytics</h1>
        <p className="text-gray-600">AI-powered insights to boost your placement success</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'progress'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Progress
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'recommendations'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎯 Recommendations
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'skills'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🎓 Skills
        </button>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading AI insights...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">Error: {error}</p>
          <button 
            onClick={() => fetchAnalytics(activeTab)}
            className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div>
          {activeTab === 'progress' && renderProgressTab()}
          {activeTab === 'recommendations' && renderRecommendationsTab()}
          {activeTab === 'skills' && renderSkillsTab()}
        </div>
      )}
    </div>
  );
}