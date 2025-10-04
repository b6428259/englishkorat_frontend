"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { healthService } from '@/services/health.service';
import type { DatabaseDetails, Dependency, HealthResponse, RedisDetails } from '@/types/settings.types';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface HealthDashboardProps {
  className?: string;
}

const HealthDashboard: React.FC<HealthDashboardProps> = ({ className }) => {
  const { language } = useLanguage();
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadHealthData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await healthService.getHealthInfo();
      setHealthData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load health data:', error);
      toast.error(language === 'th' ? 'ไม่สามารถโหลดข้อมูลสถานะระบบได้' : 'Failed to load system health data');
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    loadHealthData();
  }, [loadHealthData]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, loadHealthData]);

  const getLatencyColor = (latency: number): string => {
    if (latency < 100) return 'text-green-600';
    if (latency < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderDependencyDetails = (dep: Dependency) => {
    if (dep.name === 'mysql' && 'open_connections' in dep.details) {
      const details = dep.details as DatabaseDetails;
      return (
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mt-2">
          <div>Open: {details.open_connections}/{details.max_open_connections}</div>
          <div>In Use: {details.in_use}</div>
          <div>Idle: {details.idle}</div>
          <div>Wait: {details.wait_count}</div>
        </div>
      );
    }

    if (dep.name === 'redis' && 'address' in dep.details) {
      const details = dep.details as RedisDetails;
      return (
        <div className="text-xs text-gray-600 mt-2">
          <div>Address: {details.address}</div>
          <div>Mode: {details.mode}</div>
        </div>
      );
    }

    return null;
  };

  if (isLoading && !healthData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <div className="text-red-500 mb-2">⚠️</div>
          <p>{language === 'th' ? 'ไม่สามารถโหลดข้อมูลสถานะระบบได้' : 'Unable to load system health data'}</p>
          <button
            onClick={loadHealthData}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {language === 'th' ? 'ลองใหม่' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${healthData.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <h2 className="text-xl font-semibold text-gray-800">
              {language === 'th' ? 'สถานะระบบ' : 'System Health'}
            </h2>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              healthData.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {healthData.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              {language === 'th' ? 'อัปเดตอัตโนมัติ' : 'Auto Refresh'}
            </label>
            <button
              onClick={loadHealthData}
              disabled={isLoading}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? '⟳' : '↻'} {language === 'th' ? 'รีเฟรช' : 'Refresh'}
            </button>
          </div>
        </div>

        {lastUpdated && (
          <p className="text-xs text-gray-500 mt-2">
            {language === 'th' ? 'อัปเดตล่าสุด:' : 'Last updated:'} {lastUpdated.toLocaleString()}
          </p>
        )}
      </div>

      <div className="p-6">
        {/* Basic Info */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                {language === 'th' ? 'บริการ' : 'Service'}
              </h3>
              <p className="text-lg font-semibold text-gray-900">{healthData.service}</p>
              <p className="text-sm text-gray-600">v{healthData.version}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                {language === 'th' ? 'สภาพแวดลอม' : 'Environment'}
              </h3>
              <p className="text-lg font-semibold text-gray-900">{healthData.environment}</p>
              <p className="text-sm text-gray-600">{healthData.system.go_version}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                {language === 'th' ? 'เวลาทำงาน' : 'Uptime'}
              </h3>
              <p className="text-lg font-semibold text-gray-900">{healthData.uptime_human}</p>
              <p className="text-sm text-gray-600">{healthData.uptime_seconds.toFixed(1)}s</p>
            </div>
          </div>
        </div>

        {/* Dependencies */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'th' ? 'การเชื่อมต่อ' : 'Dependencies'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthData.dependencies.map((dep, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      dep.status === 'up' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="font-medium text-gray-800 capitalize">{dep.name}</span>
                  </div>
                  <span className={`text-sm font-medium ${healthService.getStatusColor(dep.status)}`}>
                    {dep.status.toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {language === 'th' ? 'เวลาตอบสนอง:' : 'Latency:'}
                  </span>
                  <span className={`text-sm font-medium ${getLatencyColor(dep.latency_ms)}`}>
                    {dep.latency_ms}ms
                  </span>
                </div>

                {renderDependencyDetails(dep)}
              </div>
            ))}
          </div>
        </div>

        {/* System Metrics */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'th' ? 'เมตริกระบบ' : 'System Metrics'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Memory */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3">
                {language === 'th' ? 'หน่วยความจำ' : 'Memory'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Allocated:</span>
                  <span className="font-medium">{healthService.formatBytes(healthData.metrics.memory.alloc_bytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">System:</span>
                  <span className="font-medium">{healthService.formatBytes(healthData.metrics.memory.sys_bytes)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Heap Objects:</span>
                  <span className="font-medium">{healthData.metrics.memory.heap_objects.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Database */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">
                {language === 'th' ? 'ฐานข้อมูล' : 'Database'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Connections:</span>
                  <span className="font-medium">
                    {healthData.metrics.database.open_connections}/{healthData.metrics.database.max_open_connections}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">In Use:</span>
                  <span className="font-medium">{healthData.metrics.database.in_use}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Idle:</span>
                  <span className="font-medium">{healthData.metrics.database.idle}</span>
                </div>
              </div>
            </div>

            {/* System */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-3">
                {language === 'th' ? 'ระบบ' : 'System'}
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-purple-700">Goroutines:</span>
                  <span className="font-medium">{healthData.metrics.goroutines}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">OS:</span>
                  <span className="font-medium">{healthData.system.go_os}/{healthData.system.go_arch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Go Version:</span>
                  <span className="font-medium">{healthData.system.go_version}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Flags */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'th' ? 'การตั้งค่าระบบ' : 'System Flags'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(healthData.flags).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {value ? 'ON' : 'OFF'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
