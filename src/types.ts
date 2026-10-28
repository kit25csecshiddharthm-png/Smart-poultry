export interface SensorReading {
  timestamp: string;
  temperature: number; // Celsius
  humidity: number; // % RH
  ammonia: number; // ppm (NH3)
  co2: number; // ppm
  light: number; // Lux
  soundLevel: number; // dB
  waterFlowRate: number; // L/hr
  litterMoisture: number; // %
}

export interface ActuatorState {
  exhaustFans: 'OFF' | 'LOW' | 'MED' | 'HIGH' | 'AUTO';
  coolingPads: boolean;
  brooderHeater: boolean;
  mistingFoggers: boolean;
  feedAuger: boolean;
  waterValve: boolean;
}

export interface ThresholdConfig {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
  ammoniaMax: number;
  co2Max: number;
}

export interface PoultryShed {
  id: string;
  name: string;
  type: 'Broiler' | 'Layer' | 'Brooding' | 'Quarantine';
  flockAgeDays: number;
  birdCount: number;
  mortalityToday: number;
  feedConsumedKg: number;
  waterConsumedLiters: number;
  currentReading: SensorReading;
  history: SensorReading[];
  actuators: ActuatorState;
  thresholds: ThresholdConfig;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  statusReason?: string;
}

export interface AlertLogItem {
  id: string;
  timestamp: string;
  shedId: string;
  shedName: string;
  severity: 'WARNING' | 'CRITICAL' | 'INFO';
  parameter: string;
  value: number | string;
  threshold: number | string;
  message: string;
  resolved: boolean;
}

export interface AiDiagnosisResult {
  riskLevel: 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  overallHealthScore: number;
  heatIndex: number;
  suspectedConditions: {
    name: string;
    probability: 'Low' | 'Medium' | 'High';
    severity: 'Low' | 'Medium' | 'Critical';
    symptomClues: string;
    correlationWithSensors: string;
  }[];
  environmentalAnalysis: string;
  immediateFarmActions: string[];
  veterinaryProtocols: string[];
  actuatorRecommendations: {
    fanSpeed: 'OFF' | 'LOW' | 'MED' | 'HIGH';
    coolingPads: boolean;
    heaters: boolean;
    foggers: boolean;
    rationale: string;
  };
}

export interface StudentReportDetails {
  studentName: string;
  registerNumber: string;
  teamMembers: string;
  degree: string;
  department: string;
  institution: string;
  location: string;
  supervisorName: string;
  supervisorDesignation: string;
  hodName: string;
  academicYear: string;
  submissionMonthYear: string;
}
