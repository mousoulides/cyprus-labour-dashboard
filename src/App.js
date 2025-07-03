import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Employment data by gender (2002–2024) extracted from Employment Data.xlsx
const employmentDataByGender = [
  { year: 2002, total: 326075, male: 181489, female: 144585, participationRate: 61.9 },
  { year: 2003, total: 341203, male: 188733, female: 152470, participationRate: 63.2 },
  { year: 2004, total: 354686, male: 197787, female: 156899, participationRate: 63.0 },
  { year: 2005, total: 367524, male: 206395, female: 161129, participationRate: 63.2 },
  { year: 2006, total: 374285, male: 208403, female: 165882, participationRate: 63.5 },
  { year: 2007, total: 393377, male: 216805, female: 176572, participationRate: 64.4 },
  { year: 2008, total: 397374, male: 219184, female: 178191, participationRate: 64.2 },
  { year: 2009, total: 404622, male: 215967, female: 188655, participationRate: 63.7 },
  { year: 2010, total: 421628, male: 222377, female: 199252, participationRate: 64.3 },
  { year: 2011, total: 432165, male: 227143, female: 205022, participationRate: 63.7 },
  { year: 2012, total: 436742, male: 230198, female: 206544, participationRate: 63.4 },
  { year: 2013, total: 433949, male: 227806, female: 206143, participationRate: 63.3 },
  { year: 2014, total: 432288, male: 223168, female: 209120, participationRate: 63.7 },
  { year: 2015, total: 420961, male: 216156, female: 204805, participationRate: 62.3 },
  { year: 2016, total: 417069, male: 215602, female: 201467, participationRate: 61.3 },
  { year: 2017, total: 426789, male: 221782, female: 205006, participationRate: 61.6 },
  { year: 2018, total: 437495, male: 228509, female: 208985, participationRate: 62.4 },
  { year: 2019, total: 457246, male: 241488, female: 215759, participationRate: 63.7 },
  { year: 2020, total: 464839, male: 247940, female: 216900, participationRate: 63.4 },
  { year: 2021, total: 479000, male: 253187, female: 225813, participationRate: 63.9 },
  { year: 2022, total: 497967, male: 259203, female: 238764, participationRate: 65.1 },
  { year: 2023, total: 509585, male: 262076, female: 247510, participationRate: 65.5 },
  { year: 2024, total: 511862, male: 264630, female: 247232, participationRate: 65.1 }
];

// Translations object
const translations = {
  en: {
    title: "Cyprus and EU Labour Market Dashboard",
    lastUpdated: "Last Updated:",
    exportToExcel: "Export to Excel",
    printReport: "Print Report",
    tabs: {
      overview: "Overview",
      unemploymentTrends: "Unemployment Trends",
      demographics: "Demographics",
      employment: "Employment",
      sectoralEmployment: "Sectoral Employment",
      wageComparison: "Wage Comparison",
      dataTables: "Data Tables"
    },
    metrics: {
      cyprusKeyMetrics: "Cyprus Key Metrics",
      euAverageMetrics: "EU Average Metrics",
      unemploymentRate: "Unemployment Rate",
      employmentRate: "Employment Rate",
      averageSalary: "Average Salary",
      youthUnemployment: "Youth Unemployment"
    },
    sections: {
      keyIndicators: "Key Labour Market Indicators Summary",
      comprehensiveOverview: "Comprehensive overview of Cyprus and EU labour market performance",
      performanceComparison: "Performance Comparison",
      cyprusVsEU: "Cyprus vs EU Key Labour Market Indicators"
    },
    chartLabels: {
      unemploymentRate: "Unemployment Rate",
      employmentRate: "Employment Rate",
      youthUnemployment: "Youth Unemployment",
      labourForceParticipation: "Labour Force Participation",
      cyprus: "Cyprus",
      euAverage: "EU Average",
      percentage: "Percentage (%)"
    }
  },
  el: {
    title: "Πίνακας Ελέγχου Αγοράς Εργασίας Κύπρου και ΕΕ",
    lastUpdated: "Τελευταία Ενημέρωση:",
    exportToExcel: "Εξαγωγή σε Excel",
    printReport: "Εκτύπωση Αναφοράς",
    tabs: {
      overview: "Επισκόπηση",
      unemploymentTrends: "Τάσεις Ανεργίας",
      demographics: "Δημογραφικά",
      employment: "Απασχόληση",
      sectoralEmployment: "Τομεακή Απασχόληση",
      wageComparison: "Σύγκριση Μισθών",
      dataTables: "Πίνακες Δεδομένων"
    },
    metrics: {/* ... */},
    sections: {/* ... */},
    chartLabels: {/* ... */}
  }
};

const LabourMarketDashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [language, setLanguage] = useState('en');
  const [csvData, setCsvData] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [monthlyData, setMonthlyData] = useState([
    { month: 'Jan 2025', Cyprus: 4.8, EU: 6.1, date: '2025-01' },
    { month: 'Feb 2025', Cyprus: 4.7, EU: 6.0, date: '2025-02' },
    { month: 'Mar 2025', Cyprus: 4.6, EU: 5.9, date: '2025-03' },
    { month: 'Apr 2025', Cyprus: 4.5, EU: 5.8, date: '2025-04' },
    { month: 'May 2025', Cyprus: 4.6, EU: 5.9, date: '2025-05' }
  ]);
  const [currentMetrics, setCurrentMetrics] = useState({ cyprus: {}, eu: {} });

  const t = translations[language];
  const tabs = [
    'Overview',
    'Unemployment Trends',
    'Demographics',
    'Employment',
    'Sectoral Employment',
    'Wage Comparison',
    'Data Tables'
  ];

  // New: render summary table and graphs for Employment tab
  const renderEmployment = () => {
    const latest = employmentDataByGender[employmentDataByGender.length - 1];
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h3 className="text-xl font-semibold">Key Employment Findings ({latest.year})</h3>
        {/* Summary Table */}
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Metric</th>
              <th className="px-4 py-2">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border px-4 py-2">Total Labour Force</td>
              <td className="border px-4 py-2">{latest.total.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Male</td>
              <td className="border px-4 py-2">{latest.male.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Female</td>
              <td className="border px-4 py-2">{latest.female.toLocaleString()}</td>
            </tr>
            <tr>
              <td className="border px-4 py-2">Participation Rate</td>
              <td className="border px-4 py-2">{latest.participationRate}%</td>
            </tr>
          </tbody>
        </table>
        {/* Graphs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-medium mb-2">Labour Force Over Time</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={employmentDataByGender}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-2">Gender Breakdown (2024)</h4>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[{ name: 'Male', value: latest.male }, { name: 'Female', value: latest.female }] }>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'Overview':
        return renderOverview();
      case 'Unemployment Trends':
        return renderUnemploymentTrends();
      case 'Demographics':
        return renderDemographics();
      case 'Employment':
        return renderEmployment();      
      case 'Sectoral Employment':
        return renderSectoralEmployment();
      case 'Wage Comparison':
        return renderWageComparison();
      case 'Data Tables':
        return renderDataTables();
      default:
        return renderOverview();
    }
  };

  // ... existing handlers and render functions remain unchanged ...

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header and navigation */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <nav className="space-x-4">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 font-medium ${activeTab === tab ? 'text-teal-600 border-b-2 border-teal-600' : 'text-gray-600'}`}
              >
                {t.tabs[tab.charAt(0).toLowerCase() + tab.slice(1)]}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="p-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default LabourMarketDashboard;
