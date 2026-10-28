import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Volume2,
  Activity,
  Sliders,
  Flame,
  Zap,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { PoultryShed } from '../types';

interface TelemetryDashboardProps {
  shed: PoultryShed;
  onUpdateActuator: (actuators: Partial<PoultryShed['actuators']>) => void;
  onSimulateReading: (reading: { temperature?: number; humidity?: number; ammonia?: number }) => void;
  onResetSimulation: () => void;
  onNavigateToAi: () => void;
}

export const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  shed,
  onUpdateActuator,
  onSimulateReading,
  onResetSimulation,
  onNavigateToAi,
}) => {
  const [chartMetric, setChartMetric] = useState<'temperature' | 'humidity' | 'ammonia'>('temperature');
  const [simTemp, setSimTemp] = useState<number>(shed.currentReading.temperature);
  const [simHum, setSimHum] = useState<number>(shed.currentReading.humidity);
  const [simNh3, setSimNh3] = useState<number>(shed.currentReading.ammonia);
  const [showSimPanel, setShowSimPanel] = useState(false);

  // Calculate Heat Index for poultry
  const tempF = (shed.currentReading.temperature * 9) / 5 + 32;
  const poultryHeatIndex = Math.round(tempF + shed.currentReading.humidity);
  const isHeatStress = poultryHeatIndex > 160 || shed.currentReading.temperature > shed.thresholds.tempMax;
  const isAmmoniaHigh = shed.currentReading.ammonia > shed.thresholds.ammoniaMax;

  // Render SVG Chart based on history
  const history = shed.history.slice(-20);
  const values = history.map((h) => h[chartMetric]);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const valRange = maxVal - minVal || 1;

  const chartHeight = 160;
  const chartWidth = 600;
  const paddingX = 30;
  const paddingY = 20;

  const points = history.map((h, i) => {
    const x = paddingX + (i / (history.length - 1 || 1)) * (chartWidth - 2 * paddingX);
    const val = h[chartMetric];
    const y = chartHeight - paddingY - ((val - minVal) / valRange) * (chartHeight - 2 * paddingY);
    return { x, y, val, time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  });

  const svgPath = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaPath = points.length > 0
    ? `${svgPath} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`
    : '';

  const getMetricColor = (metric: 'temperature' | 'humidity' | 'ammonia') => {
    switch (metric) {
      case 'temperature':
        return { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.15)', text: 'text-amber-400', unit: '°C' };
      case 'humidity':
        return { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.15)', text: 'text-sky-400', unit: '%' };
      case 'ammonia':
        return { stroke: '#ec4899', fill: 'rgba(236, 72, 153, 0.15)', text: 'text-pink-400', unit: 'ppm' };
    }
  };

  const currentColors = getMetricColor(chartMetric);

  const applyCustomSim = () => {
    onSimulateReading({
      temperature: Number(simTemp),
      humidity: Number(simHum),
      ammonia: Number(simNh3),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Shed Status Summary Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white tracking-tight">{shed.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-stone-800 text-stone-300 border border-stone-700">
                {shed.type} Flock · Day {shed.flockAgeDays}
              </span>
            </div>
            <p className="text-sm text-stone-400 flex items-center gap-2">
              <span>{shed.birdCount.toLocaleString()} Birds</span>
              <span>·</span>
              <span>Mortality Today: {shed.mortalityToday} birds</span>
              <span>·</span>
              <span>Water Flow: {shed.currentReading.waterFlowRate} L/hr</span>
              <span>·</span>
              <span>Feed: {shed.feedConsumedKg} kg</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowSimPanel(!showSimPanel)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800/80 hover:bg-stone-750 text-xs font-semibold text-stone-200 transition-colors"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>{showSimPanel ? 'Hide Simulator' : 'Sensor Simulator / Stress-Tester'}</span>
            </button>

            <button
              onClick={onNavigateToAi}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-950/50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Run AI Disease Risk Analysis</span>
            </button>
          </div>
        </div>

        {/* Status Callout if Warning or Critical */}
        {shed.statusReason && (
          <div
            className={`mt-4 p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
              shed.status === 'OPTIMAL'
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : shed.status === 'WARNING'
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-300'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-300'
            }`}
          >
            {shed.status === 'OPTIMAL' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            )}
            <div className="flex-1">
              <span className="font-semibold uppercase tracking-wider text-[11px] mr-2">Automation Engine:</span>
              <span>{shed.statusReason}</span>
            </div>
            <div className="text-[11px] text-stone-400 font-mono flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(shed.currentReading.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Sensor Simulator Drawer (When toggled) */}
      {showSimPanel && (
        <div className="bg-stone-900 border border-emerald-900/60 rounded-xl p-5 shadow-inner">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Interactive IoT Sensor Simulator & Stress-Testing Console</span>
              </h3>
              <p className="text-xs text-stone-400">
                Adjust virtual sensor inputs to demonstrate real-time threshold alarms, automated fan ramp-up, and heater response for project presentations.
              </p>
            </div>
            <button
              onClick={onResetSimulation}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Temperature Slider */}
            <div className="space-y-2 bg-stone-950/60 p-3 rounded-lg border border-stone-800">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300 font-medium">Temperature (DHT22)</span>
                <span className="font-mono font-bold text-amber-400">{simTemp} °C</span>
              </div>
              <input
                type="range"
                min="16.0"
                max="39.0"
                step="0.5"
                value={simTemp}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSimTemp(val);
                  onSimulateReading({ temperature: val });
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>16°C (Cold)</span>
                <span>24-28°C (Optimal)</span>
                <span>38°C (Extreme Heat)</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div className="space-y-2 bg-stone-950/60 p-3 rounded-lg border border-stone-800">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300 font-medium">Relative Humidity (RH)</span>
                <span className="font-mono font-bold text-sky-400">{simHum} %</span>
              </div>
              <input
                type="range"
                min="25"
                max="95"
                step="1"
                value={simHum}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSimHum(val);
                  onSimulateReading({ humidity: val });
                }}
                className="w-full accent-sky-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>30% (Dry/Dusty)</span>
                <span>55-65% (Comfort)</span>
                <span>95% (Wet Litter)</span>
              </div>
            </div>

            {/* Ammonia Slider */}
            <div className="space-y-2 bg-stone-950/60 p-3 rounded-lg border border-stone-800">
              <div className="flex justify-between text-xs">
                <span className="text-stone-300 font-medium">Ammonia NH3 (MQ-135)</span>
                <span className="font-mono font-bold text-pink-400">{simNh3} ppm</span>
              </div>
              <input
                type="range"
                min="3"
                max="50"
                step="0.5"
                value={simNh3}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setSimNh3(val);
                  onSimulateReading({ ammonia: val });
                }}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>&lt;10 ppm (Clean)</span>
                <span>20 ppm (Safety Limit)</span>
                <span>50 ppm (Toxic)</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-stone-800 text-xs">
            <span className="text-stone-400 py-1">Quick Scenarios:</span>
            <button
              onClick={() => {
                setSimTemp(26.5);
                setSimHum(58);
                setSimNh3(11);
                onSimulateReading({ temperature: 26.5, humidity: 58, ammonia: 11 });
              }}
              className="px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700"
            >
              Normal Daylight Comfort
            </button>
            <button
              onClick={() => {
                setSimTemp(34.2);
                setSimHum(72);
                setSimNh3(18);
                onSimulateReading({ temperature: 34.2, humidity: 72, ammonia: 18 });
              }}
              className="px-2.5 py-1 rounded bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-800"
            >
              Summer Heat Wave Stress
            </button>
            <button
              onClick={() => {
                setSimTemp(28.0);
                setSimHum(82);
                setSimNh3(27.5);
                onSimulateReading({ temperature: 28.0, humidity: 82, ammonia: 27.5 });
              }}
              className="px-2.5 py-1 rounded bg-rose-950/70 hover:bg-rose-900/80 text-rose-300 border border-rose-800"
            >
              Wet Litter & Ammonia Spike
            </button>
            <button
              onClick={() => {
                setSimTemp(19.0);
                setSimHum(60);
                setSimNh3(8);
                onSimulateReading({ temperature: 19.0, humidity: 60, ammonia: 8 });
              }}
              className="px-2.5 py-1 rounded bg-blue-950/70 hover:bg-blue-900/80 text-blue-300 border border-blue-800"
            >
              Winter Brooding Chilling
            </button>
          </div>
        </div>
      )}

      {/* Main Real-Time Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Temperature */}
        <div className={`p-4 rounded-xl border transition-all ${
          shed.currentReading.temperature > shed.thresholds.tempMax || shed.currentReading.temperature < shed.thresholds.tempMin
            ? 'bg-amber-950/30 border-amber-700/60 shadow-amber-950/20'
            : 'bg-stone-900/80 border-stone-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <span>Temperature</span>
            </span>
            <span className="font-mono text-[11px] text-stone-500">
              Target: {shed.thresholds.tempMin}-{shed.thresholds.tempMax}°C
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {shed.currentReading.temperature.toFixed(1)}
            </span>
            <span className="text-stone-400 font-semibold">°C</span>
            <span className="text-xs text-stone-500 font-mono">
              ({((shed.currentReading.temperature * 9) / 5 + 32).toFixed(1)}°F)
            </span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between">
            <span className={shed.currentReading.temperature > shed.thresholds.tempMax ? 'text-amber-400 font-semibold' : 'text-stone-400'}>
              {shed.currentReading.temperature > shed.thresholds.tempMax ? 'Above Limit' : 'Safe Operating Zone'}
            </span>
            <span className="text-[11px] font-mono text-stone-500">Sensor: DHT22</span>
          </div>
        </div>

        {/* 2. Humidity */}
        <div className={`p-4 rounded-xl border transition-all ${
          shed.currentReading.humidity > shed.thresholds.humidityMax || shed.currentReading.humidity < shed.thresholds.humidityMin
            ? 'bg-sky-950/30 border-sky-700/60'
            : 'bg-stone-900/80 border-stone-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-400" />
              <span>Relative Humidity</span>
            </span>
            <span className="font-mono text-[11px] text-stone-500">
              Target: {shed.thresholds.humidityMin}-{shed.thresholds.humidityMax}%
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white tracking-tight">
              {shed.currentReading.humidity.toFixed(1)}
            </span>
            <span className="text-stone-400 font-semibold">% RH</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between">
            <span className={shed.currentReading.humidity > 70 ? 'text-sky-300 font-semibold' : 'text-stone-400'}>
              {shed.currentReading.humidity > 70 ? 'High Humidity (Wet Litter Risk)' : 'Normal Aeration'}
            </span>
            <span className="text-[11px] font-mono text-stone-500">Capacitive</span>
          </div>
        </div>

        {/* 3. Ammonia NH3 */}
        <div className={`p-4 rounded-xl border transition-all ${
          isAmmoniaHigh ? 'bg-rose-950/40 border-rose-700/70 shadow-rose-950/30' : 'bg-stone-900/80 border-stone-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-pink-400" />
              <span>Ammonia Gas (NH3)</span>
            </span>
            <span className="font-mono text-[11px] text-stone-500">
              Safe: &lt;{shed.thresholds.ammoniaMax} ppm
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${isAmmoniaHigh ? 'text-rose-400' : 'text-white'}`}>
              {shed.currentReading.ammonia.toFixed(1)}
            </span>
            <span className="text-stone-400 font-semibold">ppm</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between">
            <span className={isAmmoniaHigh ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {isAmmoniaHigh ? 'Danger: Tracheal Hazard' : 'Below Exposure Limit'}
            </span>
            <span className="text-[11px] font-mono text-stone-500">Sensor: MQ-135</span>
          </div>
        </div>

        {/* 4. Thermal Comfort / Heat Index */}
        <div className={`p-4 rounded-xl border transition-all ${
          isHeatStress ? 'bg-amber-950/40 border-amber-600/70' : 'bg-stone-900/80 border-stone-800'
        }`}>
          <div className="flex items-center justify-between text-xs text-stone-400 mb-2">
            <span className="font-medium flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Avian Heat Index</span>
            </span>
            <span className="font-mono text-[11px] text-stone-500">T(°F) + RH(%)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-extrabold font-mono tracking-tight ${isHeatStress ? 'text-amber-400' : 'text-emerald-400'}`}>
              {poultryHeatIndex}
            </span>
            <span className="text-stone-400 font-semibold">pts</span>
          </div>
          <div className="mt-3 text-xs flex items-center justify-between">
            <span className={isHeatStress ? 'text-amber-300 font-bold' : 'text-emerald-400'}>
              {poultryHeatIndex > 165 ? 'Severe Heat Prostration' : poultryHeatIndex > 155 ? 'Panting Alert' : 'Comfortable'}
            </span>
            <span className="text-[11px] font-mono text-stone-500">Biometeorology</span>
          </div>
        </div>
      </div>

      {/* Secondary Telemetry Strip: CO2, Light, Sound, Water */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400">Carbon Dioxide (CO2)</div>
            <div className="text-base font-bold font-mono text-stone-100">{shed.currentReading.co2} ppm</div>
          </div>
          <div className="text-[10px] text-stone-500 font-mono">&lt; 2,500 ppm</div>
        </div>

        <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Lighting (LDR)</span>
            </div>
            <div className="text-base font-bold font-mono text-stone-100">{shed.currentReading.light} Lux</div>
          </div>
          <div className="text-[10px] text-emerald-400 font-mono">18h Schedule</div>
        </div>

        <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Acoustic Stridor</span>
            </div>
            <div className="text-base font-bold font-mono text-stone-100">{shed.currentReading.soundLevel} dB</div>
          </div>
          <div className="text-[10px] text-stone-500 font-mono">Vocalization</div>
        </div>

        <div className="bg-stone-900/60 border border-stone-800 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-stone-400">Litter Moisture</div>
            <div className="text-base font-bold font-mono text-stone-100">{shed.currentReading.litterMoisture}%</div>
          </div>
          <div className="text-[10px] text-stone-500 font-mono">&lt; 30% safe</div>
        </div>
      </div>

      {/* Middle Section: 24h Trend Chart & Farm Site Camera Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive 24-Hour Trend Graph */}
        <div className="lg:col-span-2 bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Environmental Telemetry Trends</span>
              </h3>
              <p className="text-xs text-stone-400">
                Continuous sampling showing diurnal curve and microclimate transitions.
              </p>
            </div>

            {/* Metric Switcher */}
            <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-lg border border-stone-800">
              <button
                onClick={() => setChartMetric('temperature')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  chartMetric === 'temperature'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Temperature (°C)
              </button>
              <button
                onClick={() => setChartMetric('humidity')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  chartMetric === 'humidity'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Humidity (%)
              </button>
              <button
                onClick={() => setChartMetric('ammonia')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  chartMetric === 'ammonia'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                Ammonia (ppm)
              </button>
            </div>
          </div>

          {/* SVG Vector Chart */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 select-none"
            >
              <defs>
                <linearGradient id="metricGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentColors.stroke} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={currentColors.stroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Reference Grid Lines */}
              <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#332e2b" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#332e2b" strokeDasharray="3 3" />
              <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#332e2b" />

              {/* Gradient Area Fill */}
              {areaPath && <path d={areaPath} fill="url(#metricGradient)" />}

              {/* Main Line */}
              {svgPath && (
                <path
                  d={svgPath}
                  fill="none"
                  stroke={currentColors.stroke}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Point Circles */}
              {points.map((p, idx) => (
                <g key={idx} className="group cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={idx === points.length - 1 ? 5 : 3}
                    fill={idx === points.length - 1 ? '#ffffff' : currentColors.stroke}
                    stroke="#1c1917"
                    strokeWidth="1.5"
                  />
                  {/* Subtle hover tooltip */}
                  <title>{`${p.time}: ${p.val} ${currentColors.unit}`}</title>
                </g>
              ))}

              {/* Axis Labels */}
              <text x={paddingX} y={paddingY - 5} fill="#78716c" fontSize="10" fontFamily="monospace">
                Max: {maxVal} {currentColors.unit}
              </text>
              <text x={paddingX} y={chartHeight - 4} fill="#78716c" fontSize="10" fontFamily="monospace">
                Min: {minVal} {currentColors.unit}
              </text>
              <text x={chartWidth - paddingX - 45} y={chartHeight - 4} fill="#78716c" fontSize="10" fontFamily="monospace">
                Now: {shed.currentReading[chartMetric]} {currentColors.unit}
              </text>
            </svg>
          </div>

          <div className="flex justify-between items-center text-xs text-stone-400 mt-2 pt-2 border-t border-stone-800">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: currentColors.stroke }}></span>
              <span>24 Hours Ago ({points[0]?.time || '00:00'})</span>
            </span>
            <span className="font-mono text-[11px] text-stone-500">Sampling Rate: 10 sec intervals</span>
            <span className="font-mono text-[11px] text-stone-300">Latest ({points[points.length - 1]?.time || 'Now'})</span>
          </div>
        </div>

        {/* Farm Facility Camera & Telemetry Overlay */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Facility Optical Feed</span>
              </h3>
              <span className="text-[11px] px-2 py-0.5 rounded font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                LIVE CAM
              </span>
            </div>
            <p className="text-xs text-stone-400 mb-3">
              Suspended IoT sensor station inspecting flock distribution and feeding lines.
            </p>

            <div className="relative rounded-lg overflow-hidden border border-stone-800 group">
              <img
                src="/images/poultry_shed.jpg"
                alt="Poultry Farm Shed Interior"
                className="w-full h-44 object-cover group-hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>

              {/* Suspended IoT Sensor Node HUD Overlay */}
              <div className="absolute top-2 left-2 bg-stone-950/80 backdrop-blur-md border border-stone-700/80 rounded px-2.5 py-1 text-[11px] font-mono text-emerald-300">
                <div>NODE-01 · ESP32</div>
                <div className="text-[10px] text-stone-400">
                  {shed.currentReading.temperature}°C · {shed.currentReading.humidity}% RH
                </div>
              </div>

              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[11px] text-stone-300">
                <span className="bg-stone-900/80 px-2 py-0.5 rounded backdrop-blur-sm">
                  {shed.name}
                </span>
                <span className="bg-stone-900/80 px-2 py-0.5 rounded backdrop-blur-sm font-mono text-[10px]">
                  Flock Density: 12 birds/m²
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
            <span className="text-xs text-stone-400">Computer Vision Ready</span>
            <button
              onClick={onNavigateToAi}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Scan Flock Health</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actuator Automation Switchboard (Relays & Motors) */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Automated Actuator Switchboard (4-Channel Relay Control)</span>
            </h3>
            <p className="text-xs text-stone-400">
              Closed-loop environmental response motors. Manual overrides switch off autonomous closed-loop triggers.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Fan Operation Mode:</span>
            <span className="px-2 py-0.5 rounded font-mono font-bold bg-stone-800 text-emerald-400 border border-stone-700">
              {shed.actuators.exhaustFans}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Exhaust Fans */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                <Wind className={`w-4 h-4 ${shed.actuators.exhaustFans !== 'OFF' ? 'text-emerald-400 animate-spin' : 'text-stone-500'}`} />
                <span>Exhaust Ventilation Fans</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                shed.actuators.exhaustFans !== 'OFF' ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-400'
              }`}>
                {shed.actuators.exhaustFans}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Removes heat and purges ammonia gas from bird height.
            </p>
            <div className="flex gap-1">
              {(['AUTO', 'OFF', 'LOW', 'HIGH'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => onUpdateActuator({ exhaustFans: mode })}
                  className={`flex-1 py-1 text-xs font-semibold rounded border transition-colors ${
                    shed.actuators.exhaustFans === mode
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Evaporative Cooling Pads */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                <Droplets className={`w-4 h-4 ${shed.actuators.coolingPads ? 'text-sky-400 animate-bounce' : 'text-stone-500'}`} />
                <span>Evaporative Cooling Pads</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                shed.actuators.coolingPads ? 'bg-sky-950 text-sky-400' : 'bg-stone-800 text-stone-400'
              }`}>
                {shed.actuators.coolingPads ? 'PUMP ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Pumps water over cellulose honeycomb pads for evaporative cooling.
            </p>
            <button
              onClick={() => onUpdateActuator({ coolingPads: !shed.actuators.coolingPads })}
              className={`w-full py-1 text-xs font-semibold rounded border transition-colors ${
                shed.actuators.coolingPads
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
              }`}
            >
              {shed.actuators.coolingPads ? 'Stop Water Circulation' : 'Engage Cooling Pads'}
            </button>
          </div>

          {/* 3. Brooder Infrared Heaters */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                <Flame className={`w-4 h-4 ${shed.actuators.brooderHeater ? 'text-amber-500' : 'text-stone-500'}`} />
                <span>Infrared Brooder Heaters</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                shed.actuators.brooderHeater ? 'bg-amber-950 text-amber-400' : 'bg-stone-800 text-stone-400'
              }`}>
                {shed.actuators.brooderHeater ? 'HEATING ON' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Essential for brooding stage chicks (Target: 32-35°C).
            </p>
            <button
              onClick={() => onUpdateActuator({ brooderHeater: !shed.actuators.brooderHeater })}
              className={`w-full py-1 text-xs font-semibold rounded border transition-colors ${
                shed.actuators.brooderHeater
                  ? 'bg-amber-600 text-white border-amber-500'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
              }`}
            >
              {shed.actuators.brooderHeater ? 'Turn Off Heaters' : 'Activate Infrared Brooders'}
            </button>
          </div>

          {/* 4. Misting Foggers */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                <Droplets className={`w-4 h-4 ${shed.actuators.mistingFoggers ? 'text-teal-400' : 'text-stone-500'}`} />
                <span>High-Pressure Misting Foggers</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                shed.actuators.mistingFoggers ? 'bg-teal-950 text-teal-400' : 'bg-stone-800 text-stone-400'
              }`}>
                {shed.actuators.mistingFoggers ? 'MISTING' : 'IDLE'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Drops dry-bulb temperature when humidity is low (&lt;50%).
            </p>
            <button
              onClick={() => onUpdateActuator({ mistingFoggers: !shed.actuators.mistingFoggers })}
              className={`w-full py-1 text-xs font-semibold rounded border transition-colors ${
                shed.actuators.mistingFoggers
                  ? 'bg-teal-600 text-white border-teal-500'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
              }`}
            >
              {shed.actuators.mistingFoggers ? 'Turn Off Foggers' : 'Start High-Pressure Mist'}
            </button>
          </div>

          {/* 5. Automated Feeder Auger */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                <Zap className={`w-4 h-4 ${shed.actuators.feedAuger ? 'text-emerald-400' : 'text-stone-500'}`} />
                <span>Automated Feeder Pan Motor</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                shed.actuators.feedAuger ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-400'
              }`}>
                {shed.actuators.feedAuger ? 'FEEDING RUNNING' : 'STOPPED'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Delivers balanced pelletized feed along automated pan lines.
            </p>
            <button
              onClick={() => onUpdateActuator({ feedAuger: !shed.actuators.feedAuger })}
              className={`w-full py-1 text-xs font-semibold rounded border transition-colors ${
                shed.actuators.feedAuger
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
              }`}
            >
              {shed.actuators.feedAuger ? 'Stop Feeder Auger' : 'Dispense Scheduled Feed'}
            </button>
          </div>

          {/* 6. Nipple Drinking Line Solenoid */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                <Droplets className={`w-4 h-4 ${shed.actuators.waterValve ? 'text-sky-400' : 'text-stone-500'}`} />
                <span>Nipple Drinker Main Valve</span>
              </span>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                shed.actuators.waterValve ? 'bg-sky-950 text-sky-400' : 'bg-stone-800 text-stone-400'
              }`}>
                {shed.actuators.waterValve ? 'LINE OPEN' : 'CLOSED'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Regulates pressure (20-30 mbar) to prevent wet litter puddling.
            </p>
            <button
              onClick={() => onUpdateActuator({ waterValve: !shed.actuators.waterValve })}
              className={`w-full py-1 text-xs font-semibold rounded border transition-colors ${
                shed.actuators.waterValve
                  ? 'bg-sky-600 text-white border-sky-500'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:bg-stone-800'
              }`}
            >
              {shed.actuators.waterValve ? 'Shut Water Line' : 'Open Water Line'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
