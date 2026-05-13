import React, { useState } from 'react';
import { reportService } from '../services/reportService';
import { BarChart3, Calendar, Download, FileText, Package, RefreshCw } from 'lucide-react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daywise' | 'areawise' | 'item' | 'renewal'>('daywise');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [filters, setFilters] = useState({
    taskDate: new Date().toISOString().split('T')[0],
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    areaCode: '',
    itemId: '',
    days: 30,
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      let response;
      switch (activeTab) {
        case 'daywise':
          response = await reportService.getDaywiseTask(filters.taskDate);
          break;
        case 'areawise':
          response = await reportService.getAreawiseTask({
            startDate: filters.startDate,
            endDate: filters.endDate,
            areaCode: filters.areaCode,
          });
          break;
        case 'item':
          response = await reportService.getItemRequired({
            startDate: filters.startDate,
            endDate: filters.endDate,
            itemId: filters.itemId ? parseInt(filters.itemId) : undefined,
          });
          break;
        case 'renewal':
          response = await reportService.getContractRenewal(filters.days);
          break;
      }
      setReportData(response?.data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'daywise' as const, label: 'Daywise Task', icon: Calendar },
    { id: 'areawise' as const, label: 'Areawise Task', icon: FileText },
    { id: 'item' as const, label: 'Item Required', icon: Package },
    { id: 'renewal' as const, label: 'Contract Renewal', icon: RefreshCw },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">Generate and view various reports</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setReportData(null);
                }}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Report Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeTab === 'daywise' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Date</label>
                  <input
                    type="date"
                    value={filters.taskDate}
                    onChange={(e) => setFilters({ ...filters, taskDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              )}
              {(activeTab === 'areawise' || activeTab === 'item') && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </>
              )}
              {activeTab === 'areawise' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area Code</label>
                  <input
                    type="text"
                    value={filters.areaCode}
                    onChange={(e) => setFilters({ ...filters, areaCode: e.target.value })}
                    placeholder="Enter area code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              )}
              {activeTab === 'item' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item ID</label>
                  <input
                    type="number"
                    value={filters.itemId}
                    onChange={(e) => setFilters({ ...filters, itemId: e.target.value })}
                    placeholder="Enter item ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              )}
              {activeTab === 'renewal' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Days Threshold</label>
                  <input
                    type="number"
                    value={filters.days}
                    onChange={(e) => setFilters({ ...filters, days: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                <BarChart3 className="w-4 h-4" />
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>

          {reportData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Report Results</h3>
                <button className="flex items-center gap-2 text-primary hover:text-primary-dark text-sm">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(reportData[0] || {}).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Array.isArray(reportData) && reportData.length > 0 ? (
                      reportData.map((row: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {Object.values(row).map((value: any, i: number) => (
                            <td key={i} className="px-4 py-2 text-sm text-gray-900">
                              {value?.toString() || '-'}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={Object.keys(reportData).length} className="px-4 py-8 text-center text-gray-500">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Select filters and generate a report</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
