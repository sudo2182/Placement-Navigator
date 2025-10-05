'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

// Card Components (shadcn/ui style)
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// Table Components (shadcn/ui style)
const Table = ({ children, className = '' }) => (
  <div className="overflow-x-auto">
    <table className={`w-full border-collapse ${className}`}>
      {children}
    </table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="bg-gray-50">
    {children}
  </thead>
);

const TableBody = ({ children }) => (
  <tbody className="divide-y divide-gray-200">
    {children}
  </tbody>
);

const TableRow = ({ children, className = '' }) => (
  <tr className={`hover:bg-gray-50 ${className}`}>
    {children}
  </tr>
);

const TableHead = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`}>
    {children}
  </td>
);

// Button Component
const Button = ({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Badge Component
const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, max = 100, className = '' }) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Error Message Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="text-red-600 mb-4">
      <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm font-medium">Error loading data</p>
      <p className="text-xs text-gray-500 mt-1">{message}</p>
    </div>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="sm">
        Try Again
      </Button>
    )}
  </div>
);

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    progress: null,
    recommendations: null,
    skillGaps: null
  });

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [progressRes, recommendationsRes, skillGapsRes] = await Promise.all([
        apiClient.get('/analytics/progress'),
        apiClient.get('/analytics/recommendations'),
        apiClient.get('/analytics/skill-gaps')
      ]);
      
      setData({
        progress: progressRes.data,
        recommendations: recommendationsRes.data,
        skillGaps: skillGapsRes.data
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Real-time updates (polling every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle job application
  const handleApplyToJob = async (jobId) => {
    try {
      await apiClient.post(`/jobs/${jobId}/apply-with-ai`);
      // Refresh data after application
      fetchAnalyticsData();
      alert('Application submitted successfully with AI-generated resume!');
    } catch (err) {
      alert('Failed to submit application: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  // Tab navigation
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'applications', label: 'Applications', icon: '📝' },
    { id: 'recommendations', label: 'Recommendations', icon: '🎯' },
    { id: 'skill-gaps', label: 'Skill Gaps', icon: '🎓' }
  ];

  // Dashboard Overview Component
  const DashboardOverview = () => {
    if (!data.progress) return <LoadingSpinner />;
    
    const { statistics, insights, recent_activity } = data.progress;
    
    return (
      <div className="space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_applications}</p>
                </div>
                <div className="text-blue-600">📝</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.interviews_scheduled}</p>
                </div>
                <div className="text-green-600">🎤</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offers</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.offers_received}</p>
                </div>
                <div className="text-yellow-600">🎉</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.success_rate}%</p>
                </div>
                <div className="text-purple-600">📈</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle>🤖 AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>📅 Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recent_activity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg">{activity.type === 'application' ? '📝' : activity.type === 'interview' ? '🎤' : '📧'}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{new Date(activity.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Applications Component
  const ApplicationsView = () => {
    if (!data.progress) return <LoadingSpinner />;
    
    const { application_history } = data.progress;
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>📝 Application History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AI Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {application_history.map((app, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{app.company}</TableCell>
                  <TableCell>{app.position}</TableCell>
                  <TableCell>{new Date(app.applied_date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      app.status === 'selected' ? 'success' :
                      app.status === 'rejected' ? 'error' :
                      app.status === 'interview' ? 'warning' : 'default'
                    }>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <ProgressBar value={app.ai_match_score} className="w-16" />
                      <span className="text-xs text-gray-600">{app.ai_match_score}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  // Recommendations Component
  const RecommendationsView = () => {
    if (!data.recommendations) return <LoadingSpinner />;
    
    const { recommendations, next_steps } = data.recommendations;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎯 AI Job Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {recommendations.map((job, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{job.title}</h4>
                      <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <ProgressBar value={job.match_score} className="w-20" />
                          <span className="text-sm font-medium text-blue-600">{job.match_score}%</span>
                        </div>
                        <p className="text-xs text-gray-500">Match Score</p>
                      </div>
                      <Button
                        onClick={() => handleApplyToJob(job.id)}
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        Apply with AI
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-700 mb-2">{job.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {job.required_skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="info" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>💰 {job.salary_range} • 📅 Posted {new Date(job.posted_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>🚀 Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {next_steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 mt-0.5">✓</div>
                  <p className="text-sm text-green-800">{step}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Skill Gaps Component
  const SkillGapsView = () => {
    if (!data.skillGaps) return <LoadingSpinner />;
    
    const { missing_skills, skill_recommendations, learning_resources } = data.skillGaps;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>🎓 Missing Skills Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {missing_skills.map((skill, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{skill.name}</h4>
                    <Badge variant="warning">Missing</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{skill.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Market Demand:</span>
                      <ProgressBar value={skill.market_demand} className="w-24" />
                      <span className="text-xs text-gray-600">{skill.market_demand}%</span>
                    </div>
                    <Badge variant="info" className="text-xs">
                      {skill.priority} Priority
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>💡 Skill Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {skill_recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm text-blue-800">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📚 Learning Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {learning_resources.map((resource, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{resource.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="info" className="text-xs">{resource.type}</Badge>
                        <span className="text-xs text-gray-500">⭐ {resource.rating}/5</span>
                        <span className="text-xs text-gray-500">⏱️ {resource.duration}</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => window.open(resource.url, '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      Learn
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Track your placement progress and get AI-powered insights</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && <LoadingSpinner />}
        
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={fetchAnalyticsData}
          />
        )}
        
        {!loading && !error && (
          <>
            {activeTab === 'dashboard' && <DashboardOverview />}
            {activeTab === 'applications' && <ApplicationsView />}
            {activeTab === 'recommendations' && <RecommendationsView />}
            {activeTab === 'skill-gaps' && <SkillGapsView />}
          </>
        )}
      </div>

      {/* Real-time Update Indicator */}
      <div className="fixed bottom-4 right-4">
        <div className="bg-white rounded-full shadow-lg p-2 border">
          <div className="flex items-center space-x-2 px-3 py-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;