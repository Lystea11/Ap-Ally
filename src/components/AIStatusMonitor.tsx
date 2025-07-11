'use client';

import React, { useState, useEffect } from 'react';
import { aiResilience } from '@/lib/ai-resilience';

interface AIStatus {
  queueLength: number;
  circuitOpen: boolean;
  failureCount: number;
  requestCount: number;
  processing: boolean;
}

interface AIStatusMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export const AIStatusMonitor: React.FC<AIStatusMonitorProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [status, setStatus] = useState<AIStatus>({
    queueLength: 0,
    circuitOpen: false,
    failureCount: 0,
    requestCount: 0,
    processing: false
  });

  useEffect(() => {
    const updateStatus = () => {
      setStatus(aiResilience.getStatus());
    };

    // Update immediately
    updateStatus();

    // Set up polling every 2 seconds
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (status.circuitOpen) return 'text-red-500';
    if (status.queueLength > 5) return 'text-yellow-500';
    if (status.processing) return 'text-blue-500';
    return 'text-green-500';
  };

  const getStatusText = () => {
    if (status.circuitOpen) return 'Service Unavailable';
    if (status.queueLength > 5) return 'High Load';
    if (status.processing) return 'Processing';
    return 'Available';
  };

  const StatusIndicator = () => (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        status.circuitOpen ? 'bg-red-500' : 
        status.queueLength > 5 ? 'bg-yellow-500' : 
        status.processing ? 'bg-blue-500' : 'bg-green-500'
      } ${status.processing ? 'animate-pulse' : ''}`} />
      <span className={`text-sm font-medium ${getStatusColor()}`}>
        AI {getStatusText()}
      </span>
    </div>
  );

  if (!showDetails) {
    return <StatusIndicator />;
  }

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">AI Service Status</h3>
        <StatusIndicator />
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Queue:</span>
          <span className="ml-2 font-medium">{status.queueLength} requests</span>
        </div>
        <div>
          <span className="text-gray-600">Processing:</span>
          <span className="ml-2 font-medium">{status.processing ? 'Yes' : 'No'}</span>
        </div>
        <div>
          <span className="text-gray-600">Circuit:</span>
          <span className={`ml-2 font-medium ${status.circuitOpen ? 'text-red-600' : 'text-green-600'}`}>
            {status.circuitOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Failures:</span>
          <span className="ml-2 font-medium">{status.failureCount}</span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-600">Requests this window:</span>
          <span className="ml-2 font-medium">{status.requestCount}</span>
        </div>
      </div>

      {status.circuitOpen && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          ⚠️ AI service is temporarily unavailable due to multiple failures. 
          The system will automatically retry soon.
        </div>
      )}

      {status.queueLength > 10 && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          ⏳ High request volume detected. Your request may take longer than usual.
        </div>
      )}
    </div>
  );
};