import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TelemetryDashboard } from './components/TelemetryDashboard';
import { AiDiagnostics } from './components/AiDiagnostics';
import { AcademicReport } from './components/AcademicReport';
import { HardwareHub } from './components/HardwareHub';
import { FarmLogbook } from './components/FarmLogbook';
import { PoultryShed, AlertLogItem } from './types';
import { Activity, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ai-scanner' | 'academic-report' | 'hardware' | 'logbook'>('dashboard');
  const [sheds, setSheds] = useState<Record<string, PoultryShed>>({});
  const [alerts, setAlerts] = useState<AlertLogItem[]>([]);
  const [selectedShedId, setSelectedShedId] = useState<string>('shed-1');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch telemetry from server
  const fetchTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data = await res.json();
        if (data.sheds) {
          setSheds(data.sheds);
        }
        if (data.alerts) {
          setAlerts(data.alerts);
        }
      }
    } catch (err) {
      console.error('Error fetching telemetry:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 4000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Update actuators on server
  const handleUpdateActuator = async (newActuators: Partial<PoultryShed['actuators']>) => {
    try {
      const res = await fetch(`/api/sheds/${selectedShedId}/actuators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActuators),
      });
      if (res.ok) {
        fetchTelemetry();
      }
    } catch (err) {
      console.error('Failed to update actuator:', err);
    }
  };

  // Simulate reading on server
  const handleSimulateReading = async (reading: { temperature?: number; humidity?: number; ammonia?: number }) => {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shedId: selectedShedId,
          ...reading,
        }),
      });
      fetchTelemetry();
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const handleResetSimulation = async () => {
    try {
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shedId: selectedShedId,
          temperature: 28.0,
          humidity: 58.0,
          ammonia: 13.5,
        }),
      });
      fetchTelemetry();
    } catch (err) {
      console.error('Reset simulation error:', err);
    }
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a))
    );
  };

  const currentShed = sheds[selectedShedId] || Object.values(sheds)[0];
  const activeAlertCount = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sheds={sheds}
        selectedShedId={selectedShedId}
        setSelectedShedId={setSelectedShedId}
        alertCount={activeAlertCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading && Object.keys(sheds).length === 0 ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-stone-400 font-mono">Connecting to IoT Telemetry Ingestion Hub...</p>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && currentShed && (
              <TelemetryDashboard
                shed={currentShed}
                onUpdateActuator={handleUpdateActuator}
                onSimulateReading={handleSimulateReading}
                onResetSimulation={handleResetSimulation}
                onNavigateToAi={() => setActiveTab('ai-scanner')}
              />
            )}

            {activeTab === 'ai-scanner' && (
              <AiDiagnostics
                sheds={sheds}
                selectedShedId={selectedShedId}
                onApplyActuators={handleUpdateActuator}
              />
            )}

            {activeTab === 'academic-report' && <AcademicReport />}

            {activeTab === 'hardware' && <HardwareHub />}

            {activeTab === 'logbook' && (
              <FarmLogbook
                alerts={alerts}
                sheds={sheds}
                onResolveAlert={handleResolveAlert}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-stone-800 bg-stone-950 py-6 mt-12 text-xs text-stone-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="font-semibold text-stone-300">PoultrySense Platform</span>
            <span>·</span>
            <span>KIT – Kalaignarkarunanidhi Institute of Technology</span>
            <span>·</span>
            <span>Dept. of CSE</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>ESP32 IoT Nodes Connected: {Object.keys(sheds).length}</span>
            <span>·</span>
            <span className="text-emerald-400 font-mono">Gemini 2.5 Flash Vision Enabled</span>
            <span>·</span>
            <span>Academic Year 2025–2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
