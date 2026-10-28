import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Flame,
  Wind,
  Droplets,
  Activity,
  FileCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { AiDiagnosisResult, PoultryShed } from '../types';

interface AiDiagnosticsProps {
  sheds: Record<string, PoultryShed>;
  selectedShedId: string;
  onApplyActuators: (actuators: Partial<PoultryShed['actuators']>) => void;
}

const sampleScenarios = [
  {
    id: 'shed-default',
    title: 'Current Shed Optical Inspection',
    description: 'Suspended high-definition sensor station camera feed.',
    image: '/images/poultry_shed.jpg',
    defaultSymptoms: 'Broiler flock active around feed pan lines; minor clustering observed near center bay.',
  },
  {
    id: 'heat-stress',
    title: 'Afternoon Heat Stress & Panting',
    description: 'Birds showing open-beak panting and elevated wing carriage.',
    image: '/images/poultry_shed.jpg',
    defaultSymptoms: 'Frequent panting with open beaks, wings held away from bodies, reduced feed activity, crowding near ventilation fans.',
  },
  {
    id: 'ammonia-wet-litter',
    title: 'High Ammonia & Wet Litter Zone',
    description: 'Elevated humidity with damp bedding around nipple drinkers.',
    image: '/images/poultry_shed.jpg',
    defaultSymptoms: 'Pungent ammonia odor detected at bird level; wet shavings beneath nipple line; minor corneal blinking and head shaking.',
  },
];

export const AiDiagnostics: React.FC<AiDiagnosticsProps> = ({
  sheds,
  selectedShedId,
  onApplyActuators,
}) => {
  const currentShed = sheds[selectedShedId] || Object.values(sheds)[0];

  const [selectedPhoto, setSelectedPhoto] = useState<string>(sampleScenarios[0].image);
  const [symptomText, setSymptomText] = useState<string>(sampleScenarios[0].defaultSymptoms);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AiDiagnosisResult | null>(null);
  const [appliedNotification, setAppliedNotification] = useState(false);

  const handleSelectScenario = (scenario: typeof sampleScenarios[0]) => {
    setSelectedPhoto(scenario.image);
    setSymptomText(scenario.defaultSymptoms);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runDiagnosis = async () => {
    setIsAnalyzing(true);
    setAppliedNotification(false);

    try {
      const res = await fetch('/api/ai/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shedId: currentShed.id,
          symptoms: symptomText,
          imageBase64: selectedPhoto.startsWith('data:') ? selectedPhoto : undefined,
          flockAge: currentShed.flockAgeDays,
          breed: currentShed.type,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      }
    } catch (err) {
      console.error('Diagnosis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyRecommendedActuators = () => {
    if (result?.actuatorRecommendations) {
      const rec = result.actuatorRecommendations;
      onApplyActuators({
        exhaustFans: rec.fanSpeed,
        coolingPads: rec.coolingPads,
        brooderHeater: rec.heaters,
        mistingFoggers: rec.foggers,
      });
      setAppliedNotification(true);
      setTimeout(() => setAppliedNotification(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
                <Stethoscope className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI Flock Health & Disease Risk Diagnostic Console
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Correlates live IoT telemetry with visual bird postures using Gemini 2.5 Flash to flag microclimate stress, respiratory hazards, and biosecurity risks.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono bg-stone-950 px-3 py-2 rounded-lg border border-stone-800">
            <span className="text-stone-400">Target Shed:</span>
            <span className="font-bold text-emerald-400">{currentShed.name}</span>
            <span className="text-stone-600">|</span>
            <span className="text-stone-300">{currentShed.currentReading.temperature}°C</span>
            <span className="text-stone-600">·</span>
            <span className="text-stone-300">{currentShed.currentReading.humidity}% RH</span>
            <span className="text-stone-600">·</span>
            <span className="text-stone-300">{currentShed.currentReading.ammonia} ppm NH3</span>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Selection & Symptoms Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-md space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>1. Shed Photographic Inspection</span>
              <span className="text-[11px] text-stone-500 font-normal">Optical Feed</span>
            </h3>

            {/* Selected Image Preview */}
            <div className="relative rounded-lg overflow-hidden border border-stone-800 aspect-video bg-stone-950">
              <img
                src={selectedPhoto}
                alt="Flock Visual Reference"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-stone-950/85 backdrop-blur-sm border border-stone-700/80 rounded px-2 py-1 text-[10px] font-mono text-stone-300">
                Flock: {currentShed.type} (Age: {currentShed.flockAgeDays} days)
              </div>
            </div>

            {/* Sample Presets */}
            <div className="space-y-1.5">
              <div className="text-xs text-stone-400 font-medium">Diagnostic Scenarios:</div>
              <div className="grid grid-cols-1 gap-1.5">
                {sampleScenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectScenario(s)}
                    className={`text-left p-2 rounded-lg border text-xs transition-colors flex items-center justify-between ${
                      symptomText === s.defaultSymptoms
                        ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
                        : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                    }`}
                  >
                    <div>
                      <div className="font-semibold">{s.title}</div>
                      <div className="text-[11px] text-stone-500">{s.description}</div>
                    </div>
                    {symptomText === s.defaultSymptoms && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Photo Upload */}
            <div className="pt-2 border-t border-stone-800">
              <label className="flex items-center justify-center gap-2 w-full py-2 px-3 border border-dashed border-stone-700 hover:border-emerald-500/60 rounded-lg text-xs text-stone-300 cursor-pointer bg-stone-950/50 hover:bg-stone-900 transition-colors">
                <Upload className="w-3.5 h-3.5 text-stone-400" />
                <span>Upload Custom Shed Photo (Camera / JPG / PNG)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Attendant Symptom Notes Input */}
            <div className="space-y-1.5 pt-2 border-t border-stone-800">
              <label className="text-xs text-stone-300 font-medium flex items-center justify-between">
                <span>2. Field Observations & Bird Symptoms:</span>
                <span className="text-[10px] text-stone-500 font-mono">Multimodal Input</span>
              </label>
              <textarea
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                rows={3}
                placeholder="Describe bird posture, panting, vocalization sounds, or litter conditions..."
                className="w-full bg-stone-950 border border-stone-800 focus:border-emerald-500 rounded-lg p-2.5 text-xs text-stone-200 placeholder-stone-600 focus:outline-none resize-none"
              />
            </div>

            {/* Run Button */}
            <button
              onClick={runDiagnosis}
              disabled={isAnalyzing}
              className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                isAnalyzing
                  ? 'bg-stone-800 text-stone-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/60'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Telemetry with Gemini 2.5 Flash...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Multi-Factor Disease Assessment</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Analysis Output Results */}
        <div className="lg:col-span-7 space-y-4">
          {!result && !isAnalyzing && (
            <div className="bg-stone-900/60 border border-stone-800 rounded-xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-800 text-emerald-400 flex items-center justify-center mx-auto">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Diagnostic Engine Standby</h4>
              <p className="text-xs text-stone-400 max-w-md mx-auto">
                Select a diagnostic scenario or upload a farm image, review the current microclimate telemetry, and click Execute to generate a real-time risk report.
              </p>
              <button
                onClick={runDiagnosis}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-950/40 transition-colors"
              >
                <span>Run Quick Baseline Scan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {isAnalyzing && (
            <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-12 text-center space-y-4 animate-pulse">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div>
                <h4 className="text-sm font-bold text-white">Gemini Multimodal Inference in Progress</h4>
                <p className="text-xs text-stone-400 mt-1">
                  Correlating sensor telemetry (Temp: {currentShed.currentReading.temperature}°C, NH3: {currentShed.currentReading.ammonia} ppm) against avian welfare models...
                </p>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Primary Risk & Health Score Card */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono font-extrabold text-lg ${
                        result.overallHealthScore > 85
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : result.overallHealthScore > 65
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {result.overallHealthScore}
                    </div>
                    <div>
                      <div className="text-xs text-stone-400 font-medium">Flock Welfare Score</div>
                      <div className="text-base font-bold text-white">
                        {result.overallHealthScore > 85
                          ? 'Flock In Physiological Equilibrium'
                          : result.overallHealthScore > 65
                          ? 'Sub-Optimal Comfort / Elevated Risk'
                          : 'Severe Environmental Stress Detected'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">Risk Severity:</span>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold font-mono border ${
                        result.riskLevel === 'NORMAL'
                          ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                          : result.riskLevel === 'MODERATE'
                          ? 'bg-amber-950/70 border-amber-800 text-amber-300'
                          : 'bg-rose-950/70 border-rose-800 text-rose-300'
                      }`}
                    >
                      {result.riskLevel}
                    </span>
                  </div>
                </div>

                {/* Synthesis Summary */}
                <div className="mt-3 text-xs text-stone-300 leading-relaxed bg-stone-950/60 p-3 rounded-lg border border-stone-850">
                  <span className="font-semibold text-emerald-400 mr-1.5">Environmental Synthesis:</span>
                  <span>{result.environmentalAnalysis}</span>
                </div>
              </div>

              {/* Suspected Pathologies and Risks */}
              <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-5 shadow-lg space-y-3">
                <h4 className="text-sm font-bold text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Identified Risk Factors & Pathologies</span>
                  </span>
                  <span className="text-xs text-stone-500 font-mono">
                    Avian Thermal Index: {result.heatIndex} pts
                  </span>
                </h4>

                <div className="space-y-2.5">
                  {result.suspectedConditions.map((cond, i) => (
                    <div
                      key={i}
                      className="bg-stone-950/70 border border-stone-800/80 rounded-lg p-3 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-100 flex items-center gap-1.5">
                          {cond.severity === 'Critical' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          ) : (
                            <Flame className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{cond.name}</span>
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          <span className="text-stone-400">Probability:</span>
                          <span
                            className={
                              cond.probability === 'High'
                                ? 'text-rose-400 font-bold'
                                : cond.probability === 'Medium'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {cond.probability}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-stone-400">
                        <span className="text-stone-300 font-medium">Observed Cues: </span>
                        {cond.symptomClues}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        <span className="text-stone-300 font-medium">IoT Correlation: </span>
                        {cond.correlationWithSensors}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actionable Recommendations & Veterinary Protocol */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Immediate Attendant Checklist */}
                <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 space-y-2.5">
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Immediate Farm Attendant Actions</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-300">
                    {result.immediateFarmActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">·</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Veterinary & Biosecurity Protocol */}
                <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 space-y-2.5">
                  <div className="text-xs font-bold text-stone-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span>Veterinary & Biosecurity Protocols</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-stone-300">
                    {result.veterinaryProtocols.map((proto, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-teal-400 font-bold">·</span>
                        <span>{proto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actuator Remediation Box */}
              {result.actuatorRecommendations && (
                <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-xl p-4 shadow-md space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                        AI Recommended Actuator Presets
                      </h5>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        {result.actuatorRecommendations.rationale}
                      </p>
                    </div>
                    <button
                      onClick={handleApplyRecommendedActuators}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm transition-colors whitespace-nowrap"
                    >
                      {appliedNotification ? 'Settings Dispatched!' : 'Apply Presets to Relays'}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-400">Fan Speed</div>
                      <div className="font-bold text-white">{result.actuatorRecommendations.fanSpeed}</div>
                    </div>
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-400">Cooling Pads</div>
                      <div className="font-bold text-white">{result.actuatorRecommendations.coolingPads ? 'ACTIVE' : 'OFF'}</div>
                    </div>
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-400">Brooder Heaters</div>
                      <div className="font-bold text-white">{result.actuatorRecommendations.heaters ? 'ON' : 'STANDBY'}</div>
                    </div>
                    <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                      <div className="text-[10px] text-stone-400">Misting Foggers</div>
                      <div className="font-bold text-white">{result.actuatorRecommendations.foggers ? 'ENGAGED' : 'OFF'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
