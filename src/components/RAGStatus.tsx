// src/components/RAGStatus.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Database, AlertCircle, CheckCircle } from 'lucide-react';

interface RAGStats {
  totalVectors: number;
  indexName: string;
  embeddingModel: string;
  dimension: number;
}

export function RAGStatus() {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRAGStats();
  }, []);

  const fetchRAGStats = async () => {
    try {
      const response = await fetch('/api/rag/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to load RAG stats');
      }
    } catch (err) {
      setError('RAG system unavailable');
      console.error('RAG stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <Card className="mb-6 border-l-4 border-l-green-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-green-600" />
          RAG System Status
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin h-3 w-3 border border-current border-r-transparent rounded-full"></div>
            Loading RAG status...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {stats && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Vectors:</span>
                <Badge variant="secondary" className="text-xs">
                  {stats.totalVectors.toLocaleString()}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Model:</span>
                <Badge variant="outline" className="text-xs">
                  {stats.embeddingModel}
                </Badge>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Index:</span>
                <code className="text-xs bg-muted px-1 rounded">
                  {stats.indexName}
                </code>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Dim:</span>
                <Badge variant="outline" className="text-xs">
                  {stats.dimension}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}