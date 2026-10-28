import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Filter,
  Plus,
  Calendar,
  Layers,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AlertLogItem, PoultryShed } from '../types';

interface FarmLogbookProps {
  alerts: AlertLogItem[];
  sheds: Record<string, PoultryShed>;
  onResolveAlert: (id: string) => void;
}

export const FarmLogbook: React.FC<FarmLogbookProps> = ({
  alerts,
  sheds,
  onResolveAlert,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [showAddLog, setShowAddLog] = useState(false);

  // New daily log form
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logShed, setLogShed] = useState('shed-1');
  const [logMortality, setLogMortality] = useState('1');
  const [logFeed, setLogFeed] = useState('165');
  const [logWater, setLogWater] = useState('380');
  const [logNotes, setLogNotes] = useState('Routine inspection complete; litter dry and ventilation optimal.');

  const [productionLogs, setProductionLogs] = useState([
    {
      id: 'prod-1',
      date: '2026-10-28',
      shedName: 'Shed 1 - Broiler Unit A',
      birdAge: 'Day 24',
      mortality: 1,
      feedKg: 165,
      waterLiters: 380,
      fcr: '1.42',
      notes: 'Birds active; litter moisture tested at 26.5%.',
    },
    {
      id: 'prod-2',
      date: '2026-10-28',
      shedName: 'Shed 2 - Layer House B',
      birdAge: 'Week 20',
      mortality: 0,
      feedKg: 112,
      waterLiters: 260,
      fcr: '2.10',
      notes: 'Layer eggs collected: 890 units (90.8% lay rate).',
    },
    {
      id: 'prod-3',
      date: '2026-10-27',
      shedName: 'Shed 1 - Broiler Unit A',
      birdAge: 'Day 23',
      mortality: 2,
      feedKg: 158,
      waterLiters: 360,
      fcr: '1.41',
      notes: 'Afternoon misting foggers operated for 45 mins during peak heat.',
    },
    {
      id: 'prod-4',
      date: '2026-10-27',
      shedName: 'Shed 3 - Chick Brooding Pen C',
      birdAge: 'Day 4',
      mortality: 1,
      feedKg: 24,
      waterLiters: 58,
      fcr: '1.05',
      notes: 'Infrared heaters adjusted to 33.5°C; chick huddling resolved.',
    },
  ]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const shedObj = sheds[logShed] || sheds['shed-1'];
    const newLog = {
      id: `prod-${Date.now()}`,
      date: logDate,
      shedName: shedObj.name,
      birdAge: `Day ${shedObj.flockAgeDays}`,
      mortality: parseInt(logMortality) || 0,
      feedKg: parseFloat(logFeed) || 0,
      waterLiters: parseFloat(logWater) || 0,
      fcr: (parseFloat(logFeed) / (shedObj.birdCount * 0.1 || 1)).toFixed(2),
      notes: logNotes,
    };
    setProductionLogs([newLog, ...productionLogs]);
    setShowAddLog(false);
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ACTIVE') return !a.resolved;
    if (filter === 'RESOLVED') return a.resolved;
    return true;
  });

  const handleExportCsv = () => {
    let csv = 'Timestamp,Shed,Severity,Parameter,RecordedValue,Threshold,Message,Resolved\n';
    alerts.forEach((a) => {
      csv += `"${a.timestamp}","${a.shedName}","${a.severity}","${a.parameter}","${a.value}","${a.threshold}","${a.message}","${a.resolved ? 'YES' : 'NO'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PoultrySense_Incident_Log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Alert Audit Log & Daily Farm Records
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Time-stamped audit trail of environmental threshold violations, actuator automation transitions, and flock production logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-750 text-xs font-semibold text-stone-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV Audit Log</span>
            </button>
            <button
              onClick={() => setShowAddLog(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-950/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Daily Inspection</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Daily Inspection Modal */}
      {showAddLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-sm font-bold text-white">Record Daily Flock Inspection</h3>
              <button
                onClick={() => setShowAddLog(false)}
                className="text-stone-400 hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 font-medium">Inspection Date</label>
                  <input
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-medium">Select Shed</label>
                  <select
                    value={logShed}
                    onChange={(e) => setLogShed(e.target.value)}
                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                  >
                    {Object.values(sheds).map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-stone-400 font-medium">Mortality Count</label>
                  <input
                    type="number"
                    min="0"
                    value={logMortality}
                    onChange={(e) => setLogMortality(e.target.value)}
                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-medium">Feed Added (kg)</label>
                  <input
                    type="number"
                    min="0"
                    value={logFeed}
                    onChange={(e) => setLogFeed(e.target.value)}
                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-medium">Water (L)</label>
                  <input
                    type="number"
                    min="0"
                    value={logWater}
                    onChange={(e) => setLogWater(e.target.value)}
                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-stone-400 font-medium">Attendant Observation Notes</label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddLog(false)}
                  className="px-3 py-1.5 rounded text-stone-400 hover:text-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-semibold text-white shadow-sm"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Environmental Threshold Alerts Table */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Microclimate Incident & Safety Violations</span>
            </h3>
            <p className="text-xs text-stone-400">
              Active alarms require farm supervisor verification and litter or ventilation checks.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'ALL' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'ACTIVE'
                  ? 'bg-amber-950 text-amber-300 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Active Alarms ({alerts.filter((a) => !a.resolved).length})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filter === 'RESOLVED'
                  ? 'bg-emerald-950 text-emerald-300 font-bold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Resolved ({alerts.filter((a) => a.resolved).length})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-800">
            <thead className="bg-stone-950 text-stone-300 font-semibold border-b border-stone-800">
              <tr>
                <th className="p-3 border-r border-stone-800">Time</th>
                <th className="p-3 border-r border-stone-800">Shed</th>
                <th className="p-3 border-r border-stone-800">Severity</th>
                <th className="p-3 border-r border-stone-800">Parameter</th>
                <th className="p-3 border-r border-stone-800">Value vs Limit</th>
                <th className="p-3 border-r border-stone-800">Message</th>
                <th className="p-3 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850 font-mono text-[11px] text-stone-300">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-500 font-sans">
                    No alerts found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-950/40">
                    <td className="p-3 border-r border-stone-850 text-stone-400 whitespace-nowrap">
                      {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="p-3 border-r border-stone-850 font-sans font-medium text-stone-200 whitespace-nowrap">
                      {a.shedName}
                    </td>
                    <td className="p-3 border-r border-stone-850 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          a.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : a.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-stone-800 text-stone-400'
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="p-3 border-r border-stone-850 font-sans font-medium text-stone-100">
                      {a.parameter}
                    </td>
                    <td className="p-3 border-r border-stone-850 text-stone-300 whitespace-nowrap">
                      <span className="text-white font-bold">{a.value}</span> / {a.threshold}
                    </td>
                    <td className="p-3 border-r border-stone-850 font-sans text-stone-400 max-w-xs truncate">
                      {a.message}
                    </td>
                    <td className="p-3 text-right whitespace-nowrap font-sans">
                      {a.resolved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onResolveAlert(a.id)}
                          className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-750 text-stone-200 border border-stone-700 text-[11px] font-semibold transition-colors"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Production Records Table */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Flock Daily Husbandry Log</span>
            </h3>
            <p className="text-xs text-stone-400">
              Mortality tracking, daily feed intake, and estimated feed conversion ratio.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-800">
            <thead className="bg-stone-950 text-stone-300 font-semibold border-b border-stone-800">
              <tr>
                <th className="p-3 border-r border-stone-800">Date</th>
                <th className="p-3 border-r border-stone-800">Facility / Shed</th>
                <th className="p-3 border-r border-stone-800">Age</th>
                <th className="p-3 border-r border-stone-800">Mortality</th>
                <th className="p-3 border-r border-stone-800">Feed Delivered</th>
                <th className="p-3 border-r border-stone-800">Water Consumed</th>
                <th className="p-3 border-r border-stone-800">Est. FCR</th>
                <th className="p-3">Attendant Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-850 font-mono text-[11px] text-stone-300">
              {productionLogs.map((log) => (
                <tr key={log.id} className="hover:bg-stone-950/40">
                  <td className="p-3 border-r border-stone-850 text-stone-400 whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="p-3 border-r border-stone-850 font-sans font-medium text-stone-200">
                    {log.shedName}
                  </td>
                  <td className="p-3 border-r border-stone-850 text-emerald-400 font-bold">
                    {log.birdAge}
                  </td>
                  <td className="p-3 border-r border-stone-850 text-stone-200">
                    {log.mortality} birds
                  </td>
                  <td className="p-3 border-r border-stone-850 text-stone-200">
                    {log.feedKg} kg
                  </td>
                  <td className="p-3 border-r border-stone-850 text-stone-200">
                    {log.waterLiters} L
                  </td>
                  <td className="p-3 border-r border-stone-850 text-stone-300">
                    {log.fcr}
                  </td>
                  <td className="p-3 font-sans text-stone-400 max-w-sm">
                    {log.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
