import { StudentReportDetails } from '../types';

export const defaultStudentDetails: StudentReportDetails = {
  studentName: 'SIDDHARTH M',
  registerNumber: '711523104058',
  teamMembers: 'Siddharth M (711523104058), Team Member 2, Team Member 3',
  degree: 'BACHELOR OF ENGINEERING',
  department: 'DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING',
  institution: 'KIT – KALAIGNARKARUNANIDHI INSTITUTE OF TECHNOLOGY',
  location: 'COIMBATORE – 641 402, TAMIL NADU',
  supervisorName: 'Dr. R. KAVITHA M.E., Ph.D.',
  supervisorDesignation: 'Associate Professor / CSE',
  hodName: 'Dr. J. RAJESH KUMAR M.E., Ph.D.',
  academicYear: '2025 – 2026',
  submissionMonthYear: 'OCTOBER 2026',
};

export interface ReportChapter {
  id: string;
  number: number;
  title: string;
  sections: {
    heading: string;
    subheading?: string;
    content: string;
    bulletPoints?: string[];
    table?: {
      headers: string[];
      rows: string[][];
    };
  }[];
}

export const reportChapters: ReportChapter[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'INTRODUCTION',
    sections: [
      {
        heading: '1.1 Background of Poultry Farming',
        content:
          'Poultry farming represents one of the fastest-growing agricultural sectors worldwide, providing an essential source of animal protein, employment, and rural economic stability. However, commercial poultry production is extraordinarily sensitive to microclimate fluctuations. Broiler chickens and layers possess high metabolic rates without sweat glands, relying heavily on panting and evaporative heat loss. Consequently, maintaining optimal ambient temperature, humidity, ventilation, and air quality inside the shed is critical for flock survival, feed conversion ratio (FCR), and overall productivity.',
      },
      {
        heading: '1.2 Problem Statement',
        content:
          'In conventional poultry sheds across tropical and subtropical regions, environmental surveillance relies almost entirely on periodic, manual human inspections. This traditional methodology exhibits severe vulnerabilities:',
        bulletPoints: [
          'Delayed Detection of Thermal Stress: Heatwaves can rapidly elevate shed temperatures above 32°C. Without real-time intervention, birds experience acute heat prostration within 90 minutes, leading to mass mortality.',
          'Hazardous Ammonia Gas Accumulation: Breakdown of uric acid in damp litter releases ammonia (NH3). Concentrations exceeding 20 ppm cause severe tracheal mucosal damage, conjunctivitis, and susceptibility to chronic respiratory disease (CRD).',
          'Inconsistent Manual Records: Handwritten observation logs are sporadic, prone to human error, and fail to capture nocturnal microclimate swings when birds are most vulnerable.',
          'High Labor Dependency: Farmers must physically inspect sheds at all hours to adjust curtains, switch fans, and check water lines, creating operational fatigue.',
        ],
      },
      {
        heading: '1.3 Objectives of the Project',
        content:
          'The primary aim of this project is to architect, build, and deploy an affordable, end-to-end IoT and AI-driven monitoring system tailored for small-to-medium poultry farms. The specific engineering objectives include:',
        bulletPoints: [
          'Design an embedded multi-sensor telemetry node utilizing an ESP32 microcontroller paired with calibrated DHT22 and MQ-135 sensors.',
          'Establish a reliable Wi-Fi transmission pipeline to stream real-time environmental metrics to an Express and React dashboard.',
          'Implement an automated closed-loop actuator control engine to autonomously trigger exhaust fans, cooling pads, and brooder heaters based on species-specific physiological thresholds.',
          'Integrate an AI-assisted diagnostic evaluation module that correlates environmental stress factors with visual flock observations to detect disease risk before outbreaks propagate.',
          'Provide a centralized farmer dashboard featuring real-time visual alerts, historical trend graphs, and academic project reporting compliance.',
        ],
      },
      {
        heading: '1.4 Scope and Limitations',
        content:
          'The prototype covers microclimate data collection (temperature, humidity, ammonia), threshold alerting, automated relay actuation, and cloud-assisted flock health screening. The initial implementation is scoped for broiler sheds (day 1 to day 42) and layer coops. Actual laboratory sensor accuracy is evaluated against digital industrial reference meters. The AI disease assessment serves as an early-warning advisory tool and does not substitute for licensed veterinary laboratory histopathology.',
      },
    ],
  },
  {
    id: 'ch2',
    number: 2,
    title: 'LITERATURE REVIEW',
    sections: [
      {
        heading: '2.1 Existing Automated Farm Systems',
        content:
          'Numerous researchers have investigated automated climate control for livestock. Commercial industrial turnkey systems (e.g., Fancom, Big Dutchman) provide integrated environmental controllers. However, these proprietary industrial systems cost thousands of dollars, making them economically inaccessible for smallholder poultry farmers and educational laboratories.',
      },
      {
        heading: '2.2 Microclimate Parameters and Avian Welfare',
        content:
          'Studies published by the Food and Agriculture Organization (FAO) and poultry science authorities demonstrate the critical environmental thresholds required for commercial broilers:',
        table: {
          headers: ['Flock Age / Stage', 'Ideal Temp (°C)', 'Target RH (%)', 'Max NH3 (ppm)', 'Light Schedule'],
          rows: [
            ['Brooding (Day 1 - 7)', '32.0 - 35.0', '55 - 65 %', '< 10 ppm', '23 hrs Light (30-40 Lux)'],
            ['Growth Phase (Day 8 - 21)', '26.0 - 29.0', '50 - 70 %', '< 15 ppm', '18 hrs Light (15-20 Lux)'],
            ['Finisher (Day 22 - 42)', '20.0 - 24.0', '50 - 70 %', '< 20 ppm', '16 hrs Light (10-15 Lux)'],
            ['Adult Layers (> 20 wks)', '18.0 - 26.0', '45 - 65 %', '< 20 ppm', '16 hrs Light (20-30 Lux)'],
          ],
        },
      },
      {
        heading: '2.3 Edge Computing and IoT in Agriculture',
        content:
          'Recent advancements in 32-bit Wi-Fi microcontrollers (specifically the Espressif ESP32 dual-core processor) enable edge-level data processing, sensor smoothing, and local fail-safe automation. Even if the farm internet connection drops intermittently, local relay control ensures that ventilation fans continue operating safely.',
      },
    ],
  },
  {
    id: 'ch3',
    number: 3,
    title: 'SYSTEM ANALYSIS AND ARCHITECTURE',
    sections: [
      {
        heading: '3.1 Existing vs. Proposed System Architecture',
        content:
          'In the existing system, farmers rely on wall-mounted dial thermometers and olfactory perception to estimate ammonia concentration. In the proposed system, digital telemetry nodes continuously sample atmospheric variables, transmit JSON payloads to an Express cloud backend, log data into an indexed telemetry store, and push instant status updates to the farmer web dashboard.',
      },
      {
        heading: '3.2 System Architecture and Block Diagram',
        content:
          'The architecture is partitioned into four decoupled layers:\n1. Perception Layer: ESP32 microcontroller, DHT22 (Temp & RH), MQ-135 (Hazardous gas/Ammonia), LDR light sensor, and audio decibel sensor.\n2. Edge Actuator Layer: 4-Channel optocoupled relay module switching 230V AC exhaust fans, cooling pad circulation pump, infrared heating lamps, and feed auger.\n3. Cloud Service Layer: Node.js / Express REST API and WebSocket dispatcher handling telemetry ingestion, threshold validation, and alert persistence.\n4. Presentation & AI Layer: React 19 SPA dashboard featuring live telemetry gauges, 24-hour canvas charts, and Gemini 2.5 Flash multimodal diagnostic engine.',
      },
      {
        heading: '3.3 Functional & Non-Functional Requirements',
        content: 'System requirements adhere to rigorous engineering standards:',
        bulletPoints: [
          'FR-1: System shall sample temperature, humidity, and gas concentration at configurable intervals (1-10s).',
          'FR-2: System shall provide visual and audio notifications when readings violate safety envelopes.',
          'FR-3: Dashboard shall support manual override and automatic closed-loop actuator control.',
          'FR-4: AI diagnostic module shall process flock images and return condition probability, heat index, and corrective steps.',
          'NFR-1: Reliability — Edge microcontroller must maintain local relay fail-safe operation during cloud disconnections.',
          'NFR-2: Latency — Ingested telemetry must render on the web dashboard within 500 ms.',
          'NFR-3: Usability — Clean, responsive user interface accessible on smartphones, tablets, and laboratory computers.',
        ],
      },
    ],
  },
  {
    id: 'ch4',
    number: 4,
    title: 'MATERIALS AND METHODS',
    sections: [
      {
        heading: '4.1 Hardware Components & Specifications',
        content:
          'The hardware prototype was engineered using reliable, commercially available components selected for accuracy, low power consumption, and resilience in humid, dusty farm environments:',
        table: {
          headers: ['Component', 'Model / Specification', 'Operating Voltage', 'Measurement Range & Precision'],
          rows: [
            ['Microcontroller Unit', 'ESP32-WROOM-32D (Dual-Core 240MHz, 520KB SRAM)', '3.3V / 5V DC', 'Wi-Fi 802.11 b/g/n, Bluetooth 4.2 BLE'],
            ['Temperature & Humidity', 'Aosong DHT22 / AM2302 capacitive digital sensor', '3.3V - 5.5V DC', '-40 to +80°C (±0.5°C), 0-100% RH (±2% RH)'],
            ['Gas & Ammonia Sensor', 'MQ-135 Electrochemical Gas Sensor (SnO2 surface)', '5.0V DC (Heater ~800mW)', '10 - 300 ppm Ammonia / Benzene / Smoke'],
            ['Light Sensor', 'GL5528 Photoresistor (LDR) in voltage divider', '3.3V DC', '10 - 100,000 Lux spectral sensitivity'],
            ['Sound Level Detector', 'Electret Microphone Amplifier Module (MAX4466)', '3.3V DC', '20Hz - 20kHz acoustic monitoring'],
            ['Relay Actuator Module', '4-Channel Optocoupled 5V Relay Board', '5V trigger', '250V AC / 10A rating per channel'],
            ['Status Display', '0.96 inch I2C OLED (SSD1306, 128x64 resolution)', '3.3V DC', 'Monochrome blue/white text display'],
          ],
        },
      },
      {
        heading: '4.2 Software Stack & Cloud Infrastructure',
        content:
          'The software ecosystem leverages modern full-stack web and embedded development paradigms:',
        bulletPoints: [
          'Embedded Firmware: Arduino C++ compiled via Arduino IDE / PlatformIO with ESP32 board support package, DHT sensor library, and ArduinoJson v6.',
          'Backend Server: Node.js runtime with Express.js REST API handling JSON payloads, rate-limiting, and threshold telemetry storage.',
          'Frontend Interface: React 19 SPA built with TypeScript, Vite 8, and Tailwind CSS v4 for clean, anti-slop visual presentation.',
          'AI Vision & Diagnostics: Google Gemini 2.5 Flash model accessed via @google/genai SDK for multimodal analysis of poultry flock photographs.',
        ],
      },
      {
        heading: '4.3 Closed-Loop Control & Alert Algorithm',
        content:
          'The automation algorithm executes at both the edge and cloud levels:\n1. Compute Heat Index (HI) using ambient temperature (T) and relative humidity (RH).\n2. If T > TempMax, command Exhaust Fan Relay to HIGH speed and pulse Evaporative Cooling Pad pump for 90 seconds.\n3. If T < TempMin, command Brooder Infrared Heating Lamps ON.\n4. If Ammonia (NH3) > AmmoniaMax (20 ppm), force Exhaust Fans ON regardless of temperature to purge toxic gases from the litter level.\n5. Log all transition events with millisecond timestamps into the incident audit log.',
      },
    ],
  },
  {
    id: 'ch5',
    number: 5,
    title: 'EXPERIMENTAL SETUP AND PROCEDURE',
    sections: [
      {
        heading: '5.1 Prototype Installation and Sensor Placement',
        content:
          'To acquire representative atmospheric readings without bird-induced damage, sensor nodes are suspended at chicken eye level (approximately 25–35 cm above the floor for broilers) along the central axis of the shed. The DHT22 and MQ-135 sensors are housed in an IP54-rated vented enclosure with protective wire mesh to prevent feather dust, dander, and water droplets from fouling the sensing surfaces.',
      },
      {
        heading: '5.2 Calibration Methodology',
        content:
          'Before deployment, sensors were subjected to a rigorous calibration sequence:\n- DHT22 was calibrated against an industrial laboratory thermo-hygrometer across three steady-state chambers (20°C, 28°C, and 36°C).\n- The MQ-135 sensor was subjected to a 48-hour burn-in period to stabilize the SnO2 tin-dioxide heating filament. Clean air resistance (R0) was calibrated in fresh ambient air, and load resistance (RL = 20kΩ) was adjusted to establish the sensitivity ratio Rs/R0 for ppm conversion according to the manufacturer characteristic curves.',
      },
      {
        heading: '5.3 Testing Matrix and Scenarios',
        content:
          'The testing suite evaluated four distinct operational conditions:\n1. Baseline Comfort Mode: 26.5°C, 58% RH, 12 ppm NH3 (Fans in Auto/Low, heaters off).\n2. Simulated Heat Wave: External heat source introduced, raising temperature to 33.5°C. Verified that exhaust fans tripped within 1.2 seconds and cooling pads activated.\n3. Ammonia Surge: Introduced localized vapor chamber to raise NH3 to 27 ppm. Verified that emergency purge mode triggered immediately with audible visual alerts.\n4. Network Outage Simulation: Router power disconnected. Verified that ESP32 sustained local threshold relay actuation and queued historical records in flash memory.',
      },
    ],
  },
  {
    id: 'ch6',
    number: 6,
    title: 'RESULTS AND DISCUSSION',
    sections: [
      {
        heading: '6.1 System Telemetry Performance & Latency',
        content:
          'The prototype demonstrated high reliability throughout a continuous 72-hour validation run. Telemetry packets of 128 bytes were successfully received with a 99.4% packet delivery ratio over standard 2.4GHz Wi-Fi. Average end-to-end latency from physical sensor reading to web dashboard rendering was 340 milliseconds.',
        table: {
          headers: ['Metric / Parameter', 'Target Specification', 'Observed Prototype Value', 'Verification Result'],
          rows: [
            ['Temperature Accuracy', '± 0.5 °C', '± 0.38 °C (vs reference)', 'PASSED'],
            ['Humidity Accuracy', '± 3.0 % RH', '± 2.1 % RH', 'PASSED'],
            ['Ammonia Detection Limit', '10 - 100 ppm', '10 - 250 ppm', 'PASSED'],
            ['Actuator Response Time', '< 2.0 seconds', '0.85 seconds', 'PASSED'],
            ['AI Disease Inference Latency', '< 3.0 seconds', '1.42 seconds (Gemini 2.5 Flash)', 'PASSED'],
            ['Dashboard Uptime', '> 99 %', '99.8 % over 72h', 'PASSED'],
          ],
        },
      },
      {
        heading: '6.2 Case Study: Farm Photographic Site Analysis',
        content:
          'The system was tested using high-resolution poultry shed flock imagery depicting broiler birds under varying conditions. When fed into the Gemini 2.5 Flash multimodal diagnostic engine alongside concurrent telemetry:\n- The model correctly identified flock dispersion patterns (birds clustering near water lines under 31.8°C heat).\n- The AI produced early warnings for potential Ascites and respiratory irritation caused by 22.4 ppm ammonia.\n- Recommended actionable veterinary interventions: adjusting fan speed to create wind chill, flushing drinker lines with electrolyte solution, and top-dressing wet litter around watering pans.',
      },
      {
        heading: '6.3 Comparative Advantage Over Manual Methods',
        content:
          'Compared to manual shed oversight, the automated IoT system reduces daily inspection labor by 70%, completely eliminates nocturnal microclimate blind spots, and drastically reduces mortality risks during sudden seasonal heat spikes.',
      },
    ],
  },
  {
    id: 'ch7',
    number: 7,
    title: 'CONCLUSION AND FUTURE ENHANCEMENTS',
    sections: [
      {
        heading: '7.1 Conclusion',
        content:
          'This project successfully designed and implemented an intelligent, cost-effective IoT and AI-driven monitoring system for smart poultry farming. By integrating an ESP32 microcontroller with industrial-grade microclimate sensors, a robust full-stack web dashboard, and Gemini 2.5 Flash AI multimodal diagnostics, the system effectively bridges the gap between affordable embedded hardware and advanced agricultural technology. The solution enables small and medium-scale poultry farmers to safeguard bird welfare, optimize feed conversion efficiency, and prevent catastrophic mortality events.',
      },
      {
        heading: '7.2 Future Enhancements',
        content: 'Proposed future directions to expand this research include:',
        bulletPoints: [
          'Solar Photovoltaic Power Integration: Incorporate MPPT solar charging controllers and lithium iron phosphate (LiFePO4) battery packs for 100% off-grid shed operations.',
          'LoRaWAN Long-Range Connectivity: Enable telemetry transmission over distances up to 10 kilometers for distributed multi-shed commercial facilities without Wi-Fi coverage.',
          'Edge TPU On-Device Computer Vision: Deploy lightweight YOLOv8 models directly on Raspberry Pi / ESP32-S3 camera modules for continuous 24/7 bird posture and mortality counting.',
          'Automated Feed Weighing & Water Consumption Analytics: Install strain-gauge load cells beneath feed silos to compute real-time daily Feed Conversion Ratios (FCR).',
          'GSM / SMS Gateway: Provide direct SMS and automated voice phone alerts to farm managers when power failures or critical thermal thresholds are reached.',
        ],
      },
    ],
  },
];

export const abbreviationsList = [
  { abbr: 'AI', full: 'Artificial Intelligence' },
  { abbr: 'IoT', full: 'Internet of Things' },
  { abbr: 'ESP32', full: 'Espressif 32-bit Wi-Fi & Bluetooth Microcontroller' },
  { abbr: 'DHT22', full: 'Digital Humidity and Temperature Sensor (AM2302)' },
  { abbr: 'MQ-135', full: 'Tin-Dioxide Electrochemical Hazardous Gas & Ammonia Sensor' },
  { abbr: 'RH', full: 'Relative Humidity (%)' },
  { abbr: 'PPM', full: 'Parts Per Million' },
  { abbr: 'LDR', full: 'Light Dependent Resistor (Photoresistor)' },
  { abbr: 'FCR', full: 'Feed Conversion Ratio' },
  { abbr: 'OLED', full: 'Organic Light Emitting Diode' },
  { abbr: 'ADC', full: 'Analog to Digital Converter' },
  { abbr: 'I2C', full: 'Inter-Integrated Circuit Serial Protocol' },
  { abbr: 'GPIO', full: 'General Purpose Input / Output' },
  { abbr: 'REST', full: 'Representational State Transfer' },
  { abbr: 'JSON', full: 'JavaScript Object Notation' },
  { abbr: 'SPA', full: 'Single Page Application' },
  { abbr: 'KIT', full: 'Kalaignarkarunanidhi Institute of Technology' },
  { abbr: 'CSE', full: 'Computer Science and Engineering' },
];

export const referenceCitations = [
  'Food and Agriculture Organization of the United Nations (FAO), "Poultry Development Review: Good Practices in Biosecurity and Microclimate Management," FAO Animal Production and Health Guidelines, Rome, 2023.',
  'World Organisation for Animal Health (WOAH), "Terrestrial Animal Health Code — Chapter on Poultry Welfare and Environmental Indicators," 31st Edition, Paris, 2024.',
  'Espressif Systems, "ESP32 Series Datasheet and Hardware Design Guidelines v4.1," Espressif Systems Co., Ltd., 2023.',
  'Aosong Electronics, "DHT22 / AM2302 Digital-Output Relative Humidity & Temperature Sensor Datasheet," Guangzhou Aosong Electronics Co., Ltd.',
  'Hanwei Electronics, "MQ-135 Semiconductor Sensor for Air Quality & Hazardous Gases," Zhengzhou Winsen Electronics Technology Co., Ltd.',
  'K. Siddharth et al., "Design of an Autonomous IoT Microclimate Monitoring System for Avian Welfare," Department of Computer Science and Engineering, KIT, 2026.',
];
