import React from 'react';
import { Activity, Cpu, FileText, LayoutDashboard, Stethoscope, AlertTriangle, ShieldCheck } from 'lucide-react';
import { PoultryShed } from '../types';

interface HeaderProps {
  activeTab: 'dashboard' | 'ai-scanner' | 'academic-report' | 'hardware' | 'logbook';
  setActiveTab: (tab: 'dashboard' | 'ai-scanner' | 'academic-report' | 'hardware' | 'logbook') => void;
  sheds: Record<string, PoultryShed>;
  selectedShedId: string;
  setSelectedShedId: (id: string) => void;
  alertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  sheds,
  selectedShedId,
  setSelectedShedId,
  alertCount,
}) => {
  const currentShed = sheds[selectedShedId] || Object.values(sheds)[0];

  return (
    <header className="border-b border-stone-800 bg-stone-950/90 backdrop-blur-md sticky top-0 z-40 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          {/* Logo & Institute Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">PoultrySense</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-mono">
                  IoT + AI
                </span>
              </div>
              <div className="text-xs text-stone-400 flex items-center gap-1.5">
                <span>KIT – Kalaignarkarunanidhi Institute of Technology</span>
                <span className="text-stone-600">·</span>
                <span className="text-stone-400">Dept. of CSE</span>
              </div>
            </div>
          </div>

          {/* Shed Selector & Quick Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5">
              <span className="text-xs text-stone-400 font-medium">Active Shed:</span>
              <select
                value={selectedShedId}
                onChange={(e) => setSelectedShedId(e.target.value)}
                className="bg-transparent text-sm text-stone-100 font-semibold focus:outline-none cursor-pointer"
              >
                {Object.values(sheds).map((s) => (
                  <option key={s.id} value={s.id} className="bg-stone-900 text-stone-100">
                    {s.name} ({s.type} - Day {s.flockAgeDays})
                  </option>
                ))}
              </select>
            </div>

            {currentShed && (
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold ${
                  currentShed.status === 'OPTIMAL'
                    ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                    : currentShed.status === 'WARNING'
                    ? 'bg-amber-950/50 border-amber-800/60 text-amber-300'
                    : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
                }`}
              >
                {currentShed.status === 'OPTIMAL' ? (
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400 animate-pulse" />
                )}
                <span>{currentShed.status}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 border-t border-stone-850">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-stone-800/90 text-emerald-400 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Live Telemetry & Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-scanner')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'ai-scanner'
                ? 'bg-stone-800/90 text-emerald-400 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>AI Flock Disease Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('academic-report')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'academic-report'
                ? 'bg-stone-800/90 text-emerald-400 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Academic Project Report (KIT)</span>
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'hardware'
                ? 'bg-stone-800/90 text-emerald-400 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Hardware & ESP32 Code Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('logbook')}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
              activeTab === 'logbook'
                ? 'bg-stone-800/90 text-emerald-400 shadow-sm border border-stone-700/60'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Alert Log & Farm Records</span>
            {alertCount > 0 && (
              <span className="ml-1 text-xs px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                {alertCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
