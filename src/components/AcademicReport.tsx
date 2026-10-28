import React, { useState } from 'react';
import {
  Printer,
  Download,
  Edit3,
  BookOpen,
  Award,
  CheckCircle2,
  List,
  Layers,
  Save,
  X,
  FileText,
} from 'lucide-react';
import {
  defaultStudentDetails,
  reportChapters,
  abbreviationsList,
  referenceCitations,
} from '../data/reportData';
import { StudentReportDetails } from '../types';

export const AcademicReport: React.FC = () => {
  const [details, setDetails] = useState<StudentReportDetails>(() => {
    const saved = localStorage.getItem('poultry_student_details');
    return saved ? JSON.parse(saved) : defaultStudentDetails;
  });

  const [activeSection, setActiveSection] = useState<string>('all');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState<StudentReportDetails>(details);

  const saveDetails = () => {
    setDetails(editForm);
    localStorage.setItem('poultry_student_details', JSON.stringify(editForm));
    setIsEditing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${details.institution}\n`;
    md += `## ${details.department}\n\n`;
    md += `### PROJECT REPORT: Smart Poultry Farm Monitoring and Disease Risk Detection Using IoT and AI\n\n`;
    md += `**Submitted by:** ${details.studentName} (${details.registerNumber})\n`;
    md += `**Team Members:** ${details.teamMembers}\n`;
    md += `**Supervisor:** ${details.supervisorName}, ${details.supervisorDesignation}\n`;
    md += `**Head of Department:** ${details.hodName}\n`;
    md += `**Academic Year:** ${details.academicYear}\n\n`;
    md += `---\n\n`;

    reportChapters.forEach((ch) => {
      md += `## CHAPTER ${ch.number}: ${ch.title}\n\n`;
      ch.sections.forEach((s) => {
        md += `### ${s.heading}\n\n${s.content}\n\n`;
        if (s.bulletPoints) {
          s.bulletPoints.forEach((b) => (md += `- ${b}\n`));
          md += `\n`;
        }
        if (s.table) {
          md += `| ${s.table.headers.join(' | ')} |\n`;
          md += `| ${s.table.headers.map(() => '---').join(' | ')} |\n`;
          s.table.rows.forEach((r) => {
            md += `| ${r.join(' | ')} |\n`;
          });
          md += `\n`;
        }
      });
    });

    md += `## REFERENCES\n\n`;
    referenceCitations.forEach((ref, idx) => {
      md += `[${idx + 1}] ${ref}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Smart_Poultry_Farm_Project_Report_${details.registerNumber}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (No-Print) */}
      <div className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 shadow-lg no-print">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400">
                <BookOpen className="w-4 h-4" />
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Academic Project Report Viewer & Generator
              </h2>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Structured to conform with KIT – Kalaignarkarunanidhi Institute of Technology CSE project report guidelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setEditForm(details);
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-750 text-xs font-semibold text-stone-200 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Student / Guide Details</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-750 text-xs font-semibold text-stone-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Download (.md)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md shadow-emerald-950/40 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save Clean PDF</span>
            </button>
          </div>
        </div>

        {/* Section Jump Bar (No-Print) */}
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-stone-800 overflow-x-auto text-xs">
          <span className="text-stone-400 text-[11px] whitespace-nowrap mr-1">Quick Jump:</span>
          <button
            onClick={() => setActiveSection('all')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeSection === 'all'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            Full Complete Document
          </button>
          <button
            onClick={() => setActiveSection('cover')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeSection === 'cover'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            Cover Page
          </button>
          <button
            onClick={() => setActiveSection('certificates')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
              activeSection === 'certificates'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
            }`}
          >
            Certificates & Abstract
          </button>
          {reportChapters.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveSection(ch.id)}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                activeSection === ch.id
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              Ch {ch.number}: {ch.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Edit Student Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 no-print backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Customize Project Report Details</span>
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-stone-400 hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="text-stone-400 font-medium">Candidate Name</label>
                <input
                  type="text"
                  value={editForm.studentName}
                  onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-400 font-medium">Register Number</label>
                <input
                  type="text"
                  value={editForm.registerNumber}
                  onChange={(e) => setEditForm({ ...editForm, registerNumber: e.target.value })}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="text-stone-400 font-medium">Team Members</label>
                <textarea
                  rows={2}
                  value={editForm.teamMembers}
                  onChange={(e) => setEditForm({ ...editForm, teamMembers: e.target.value })}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                />
              </div>

              <div>
                <label className="text-stone-400 font-medium">Project Supervisor / Guide Name</label>
                <input
                  type="text"
                  value={editForm.supervisorName}
                  onChange={(e) => setEditForm({ ...editForm, supervisorName: e.target.value })}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                />
              </div>

              <div>
                <label className="text-stone-400 font-medium">Supervisor Designation</label>
                <input
                  type="text"
                  value={editForm.supervisorDesignation}
                  onChange={(e) => setEditForm({ ...editForm, supervisorDesignation: e.target.value })}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                />
              </div>

              <div>
                <label className="text-stone-400 font-medium">Head of Department (HOD)</label>
                <input
                  type="text"
                  value={editForm.hodName}
                  onChange={(e) => setEditForm({ ...editForm, hodName: e.target.value })}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                />
              </div>

              <div>
                <label className="text-stone-400 font-medium">Institution Name</label>
                <input
                  type="text"
                  value={editForm.institution}
                  onChange={(e) => setEditForm({ ...editForm, institution: e.target.value })}
                  className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-400 font-medium">Academic Year</label>
                  <input
                    type="text"
                    value={editForm.academicYear}
                    onChange={(e) => setEditForm({ ...editForm, academicYear: e.target.value })}
                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-stone-400 font-medium">Submission Month & Year</label>
                  <input
                    type="text"
                    value={editForm.submissionMonthYear}
                    onChange={(e) => setEditForm({ ...editForm, submissionMonthYear: e.target.value })}
                    className="w-full mt-1 bg-stone-950 border border-stone-800 rounded p-2 text-stone-100 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded text-xs text-stone-400 hover:text-stone-200"
              >
                Cancel
              </button>
              <button
                onClick={saveDetails}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Report Header</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Document Body (Academic Report Paper Layout) */}
      <div className="academic-report bg-stone-950 text-stone-100 border border-stone-800 rounded-xl p-8 md:p-14 shadow-2xl max-w-4xl mx-auto space-y-16 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
        
        {/* ======================================================== */}
        {/* COVER PAGE                                               */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'cover') && (
          <div className="page-break flex flex-col justify-between min-h-[900px] text-center border-b border-stone-800 pb-12 print:border-none">
            <div className="space-y-4">
              <div className="text-sm font-semibold tracking-wider text-emerald-400 print:text-stone-800 uppercase">
                A Project Report on
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white print:text-black uppercase leading-snug max-w-2xl mx-auto">
                Smart Poultry Farm Monitoring and Disease Risk Detection Using IoT and AI
              </h1>
              <div className="text-xs text-stone-400 print:text-stone-600 max-w-xl mx-auto pt-2">
                Submitted in partial fulfillment of the requirements for the award of the degree of
              </div>
              <div className="text-sm font-bold text-stone-200 print:text-black uppercase tracking-wide">
                {details.degree}
              </div>
              <div className="text-xs text-stone-400 print:text-stone-600 uppercase">
                IN
              </div>
              <div className="text-sm font-bold text-emerald-400 print:text-black uppercase tracking-wide">
                COMPUTER SCIENCE AND ENGINEERING
              </div>
            </div>

            {/* Institution Badge & Details */}
            <div className="my-10 space-y-3">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-xl print:border print:border-black print:bg-none print:text-black">
                KIT
              </div>
              <div className="text-sm font-bold text-white print:text-black uppercase tracking-wide">
                {details.department}
              </div>
              <div className="text-base font-extrabold text-white print:text-black uppercase tracking-wide">
                {details.institution}
              </div>
              <div className="text-xs text-stone-400 print:text-stone-600 uppercase">
                (An Autonomous Institution | Accredited by NBA & NAAC with 'A' Grade)
              </div>
              <div className="text-xs text-stone-400 print:text-stone-600">
                {details.location}
              </div>
            </div>

            {/* Candidate & Supervisor Footnote */}
            <div className="grid grid-cols-2 gap-8 text-left text-xs border-t border-stone-800 print:border-stone-400 pt-6">
              <div>
                <span className="text-stone-400 print:text-stone-600 block text-[11px]">Submitted by:</span>
                <span className="font-bold text-stone-100 print:text-black font-mono text-sm block mt-0.5">
                  {details.studentName}
                </span>
                <span className="text-stone-400 print:text-stone-600 font-mono block">
                  Reg No: {details.registerNumber}
                </span>
                <span className="text-stone-500 print:text-stone-500 text-[10px] block mt-1">
                  Team: {details.teamMembers}
                </span>
              </div>
              <div className="text-right">
                <span className="text-stone-400 print:text-stone-600 block text-[11px]">Under the Guidance of:</span>
                <span className="font-bold text-stone-100 print:text-black text-sm block mt-0.5">
                  {details.supervisorName}
                </span>
                <span className="text-stone-400 print:text-stone-600 block">
                  {details.supervisorDesignation}
                </span>
                <span className="text-stone-500 print:text-stone-500 text-[11px] block mt-1 font-mono">
                  Academic Year: {details.academicYear}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CERTIFICATES & DECLARATIONS                              */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'certificates') && (
          <div className="page-break space-y-12 border-b border-stone-800 pb-12 print:border-none">
            {/* Bonafide Certificate */}
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-white print:text-black uppercase tracking-widest">
                  BONAFIDE CERTIFICATE
                </h3>
                <div className="w-16 h-0.5 bg-emerald-500 mx-auto"></div>
              </div>
              <p className="text-xs md:text-sm text-stone-300 print:text-black text-justify leading-relaxed">
                Certified that this project report titled{' '}
                <strong className="text-white print:text-black">
                  "SMART POULTRY FARM MONITORING AND DISEASE RISK DETECTION USING IOT AND AI"
                </strong>{' '}
                is the bonafide work of{' '}
                <strong className="text-white print:text-black font-mono">
                  {details.studentName} (Reg. No: {details.registerNumber})
                </strong>
                , who carried out the project under my supervision in partial fulfillment of the requirements for the award of the degree of{' '}
                <strong>Bachelor of Engineering in Computer Science and Engineering</strong> at{' '}
                <strong>{details.institution}</strong>, Coimbatore during the academic year{' '}
                <strong className="font-mono">{details.academicYear}</strong>.
              </p>

              <div className="pt-12 grid grid-cols-2 gap-8 text-xs">
                <div>
                  <div className="w-40 border-b border-stone-700 print:border-black mb-2"></div>
                  <div className="font-bold text-stone-200 print:text-black">{details.supervisorName}</div>
                  <div className="text-stone-400 print:text-stone-600">{details.supervisorDesignation}</div>
                  <div className="text-stone-500 print:text-stone-500 text-[10px]">Project Supervisor</div>
                </div>
                <div className="text-right">
                  <div className="w-40 ml-auto border-b border-stone-700 print:border-black mb-2"></div>
                  <div className="font-bold text-stone-200 print:text-black">{details.hodName}</div>
                  <div className="text-stone-400 print:text-stone-600">Professor & Head</div>
                  <div className="text-stone-500 print:text-stone-500 text-[10px]">Department of CSE, KIT</div>
                </div>
              </div>
            </div>

            {/* Abstract */}
            <div className="page-break pt-8 space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-base font-extrabold text-white print:text-black uppercase tracking-widest">
                  ABSTRACT
                </h3>
                <div className="w-12 h-0.5 bg-emerald-500 mx-auto"></div>
              </div>
              <p className="text-xs md:text-sm text-stone-300 print:text-black text-justify leading-relaxed">
                Commercial poultry production is highly sensitive to microclimate variations. Sudden surges in shed ambient temperature, excessive relative humidity, and toxic concentrations of ammonia gas from decomposing poultry litter precipitate severe thermal exhaustion, tracheal mucosal damage, ascites, and elevated mortality. Traditional manual inspection regimens fail to provide continuous nocturnal surveillance or rapid closed-loop intervention.
              </p>
              <p className="text-xs md:text-sm text-stone-300 print:text-black text-justify leading-relaxed">
                This project presents the engineering and deployment of an autonomous, low-cost microclimate surveillance and early disease risk detection platform for poultry farms. The perception hardware integrates an ESP32 dual-core microcontroller connected to digital DHT22 temperature and relative humidity sensors, an MQ-135 electrochemical gas sensor for ammonia detection, and an optocoupled 4-channel relay system controlling ventilation exhaust fans, evaporative cooling pads, and brooder heaters.
              </p>
              <p className="text-xs md:text-sm text-stone-300 print:text-black text-justify leading-relaxed">
                Telemetry packets are streamed via Wi-Fi to a Node.js Express REST backend and rendered on a responsive React dashboard. Furthermore, an AI diagnostic engine powered by Gemini 2.5 Flash correlates environmental sensor indices with optical photographic inspections of bird postures to detect early indicators of heat stroke, chilling stress, and coccidiosis. Experimental validation across 72 continuous operating hours confirmed a 99.4% packet delivery ratio, average end-to-end telemetry latency of 340 milliseconds, and immediate closed-loop actuator responses within 0.85 seconds, demonstrating substantial improvements in avian welfare and labor efficiency.
              </p>
              <div className="text-xs text-stone-400 print:text-stone-600 pt-2 font-mono">
                <strong>Keywords:</strong> Internet of Things (IoT), ESP32 Microcontroller, Smart Poultry Farming, Ammonia Gas Monitoring (MQ-135), Heat Stress Index, Closed-Loop Automation, Gemini 2.5 Flash AI.
              </div>
            </div>

            {/* List of Abbreviations */}
            <div className="pt-6 space-y-3">
              <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wide">
                LIST OF ABBREVIATIONS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {abbreviationsList.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-1 border-b border-stone-850 print:border-stone-200">
                    <span className="font-mono font-bold text-emerald-400 print:text-black w-20 shrink-0">
                      {item.abbr}
                    </span>
                    <span className="text-stone-300 print:text-stone-700">{item.full}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TECHNICAL CHAPTERS 1 TO 7                                */}
        {/* ======================================================== */}
        {reportChapters.map((chapter) => {
          if (activeSection !== 'all' && activeSection !== chapter.id) return null;

          return (
            <div key={chapter.id} className="page-break space-y-6 border-b border-stone-800 pb-12 print:border-none">
              {/* Chapter Title */}
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold text-emerald-400 print:text-stone-600 tracking-wider uppercase">
                  CHAPTER {chapter.number}
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-white print:text-black uppercase tracking-tight">
                  {chapter.title}
                </h2>
                <div className="w-12 h-1 bg-emerald-500"></div>
              </div>

              {/* Embed Figures in Chapter 4 and Chapter 6 */}
              {chapter.number === 4 && (
                <div className="avoid-break bg-stone-900 print:bg-stone-50 border border-stone-800 print:border-stone-300 rounded-xl p-4 my-6 space-y-2">
                  <img
                    src="/images/esp32_kit.jpg"
                    alt="ESP32 IoT Sensor Hardware Prototype"
                    className="w-full max-h-80 object-cover rounded-lg"
                  />
                  <div className="text-center text-xs text-stone-400 print:text-stone-600 font-mono">
                    Figure 4.1: ESP32 Microcontroller connected to DHT22, MQ-135 Gas Sensor, and SSD1306 OLED Display on breadboard prototype.
                  </div>
                </div>
              )}

              {chapter.number === 6 && (
                <div className="avoid-break bg-stone-900 print:bg-stone-50 border border-stone-800 print:border-stone-300 rounded-xl p-4 my-6 space-y-2">
                  <img
                    src="/images/poultry_shed.jpg"
                    alt="Poultry Farm Facility Case Study"
                    className="w-full max-h-80 object-cover rounded-lg"
                  />
                  <div className="text-center text-xs text-stone-400 print:text-stone-600 font-mono">
                    Figure 6.1: Case study validation environment inside commercial broiler shed with suspended IoT sensor station.
                  </div>
                </div>
              )}

              {/* Chapter Sections */}
              <div className="space-y-6">
                {chapter.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="space-y-2.5">
                    <h3 className="text-sm md:text-base font-bold text-stone-100 print:text-black">
                      {sec.heading}
                    </h3>
                    <p className="text-xs md:text-sm text-stone-300 print:text-black text-justify leading-relaxed whitespace-pre-line">
                      {sec.content}
                    </p>

                    {/* Bullet Points */}
                    {sec.bulletPoints && (
                      <ul className="space-y-1.5 pl-4 text-xs md:text-sm text-stone-300 print:text-black">
                        {sec.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="list-disc leading-relaxed">
                            {pt}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* Data Tables */}
                    {sec.table && (
                      <div className="avoid-break overflow-x-auto my-4">
                        <table className="w-full text-left text-xs border border-stone-800 print:border-stone-400">
                          <thead className="bg-stone-900 print:bg-stone-100 text-stone-200 print:text-black font-semibold border-b border-stone-800 print:border-stone-400">
                            <tr>
                              {sec.table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="p-2.5 border-r border-stone-800 print:border-stone-300 last:border-r-0">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-850 print:divide-stone-300 font-mono">
                            {sec.table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-stone-900/40 print:hover:bg-transparent">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2.5 border-r border-stone-850 print:border-stone-300 last:border-r-0 text-stone-300 print:text-black">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* ======================================================== */}
        {/* REFERENCES                                               */}
        {/* ======================================================== */}
        {(activeSection === 'all' || activeSection === 'references') && (
          <div className="page-break space-y-4 pt-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white print:text-black uppercase tracking-widest">
                REFERENCES
              </h3>
              <div className="w-12 h-0.5 bg-emerald-500"></div>
            </div>
            <ol className="space-y-2 text-xs text-stone-300 print:text-black pl-5">
              {referenceCitations.map((ref, idx) => (
                <li key={idx} className="list-decimal leading-relaxed">
                  {ref}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
