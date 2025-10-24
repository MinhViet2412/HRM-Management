import { useState } from 'react'
import { useQuery } from 'react-query'
import { Users, Clock, DollarSign, Download, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../services/api'
import { useTranslation } from 'react-i18next'
import { formatCurrencyVN } from '../utils/format'

const Reports = () => {
  const [reportType, setReportType] = useState('attendance')
  const { t } = useTranslation()
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const { data: attendanceSummary } = useQuery(
    ['attendance-summary', startDate, endDate],
    async () => {
      const response = await api.get(`/reports/attendance-summary?startDate=${startDate}&endDate=${endDate}`)
      return response.data
    },
    { enabled: reportType === 'attendance' }
  )

  const { data: staffingReport } = useQuery(
    'staffing-report',
    async () => {
      const response = await api.get('/reports/staffing-by-department')
      return response.data
    },
    { enabled: reportType === 'staffing' }
  )

  const { data: payrollSummary } = useQuery(
    ['payroll-summary', (endDate || startDate).slice(0, 7)],
    async () => {
      const period = (endDate || startDate).slice(0, 7) // YYYY-MM format
      const response = await api.get(`/reports/payroll-summary?period=${period}`)
      return response.data
    },
    { enabled: reportType === 'payroll' }
  )

  const { data: turnoverReport } = useQuery(
    ['personnel-turnover', startDate, endDate],
    async () => {
      const response = await api.get(`/reports/personnel-turnover?startDate=${startDate}&endDate=${endDate}`)
      return response.data
    },
    { enabled: reportType === 'turnover' }
  )

  const handleExportExcel = async () => {
    try {
      let url = '';
      let filename = '';
      
      switch (reportType) {
        case 'attendance':
          url = `/reports/export/attendance-summary?startDate=${startDate}&endDate=${endDate}`;
          filename = `attendance-summary-${startDate}-to-${endDate}.xlsx`;
          break;
        case 'payroll':
          const period = (endDate || startDate).slice(0, 7);
          url = `/reports/export/payroll-summary?period=${period}`;
          filename = `payroll-summary-${period}.xlsx`;
          break;
        case 'turnover':
          url = `/reports/export/personnel-turnover?startDate=${startDate}&endDate=${endDate}`;
          filename = `personnel-turnover-${startDate}-to-${endDate}.xlsx`;
          break;
        case 'staffing':
          url = `/reports/export/staffing-by-department`;
          filename = `staffing-by-department-${new Date().toISOString().split('T')[0]}.xlsx`;
          break;
        default:
          return;
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${url}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Export error:', error);
      alert('Xuất báo cáo thất bại. Vui lòng thử lại.');
    }
  }

  const reportTypes = [
    { id: 'attendance', name: t('reports.attendanceSummary'), icon: Clock },
    { id: 'staffing', name: t('reports.staffingReport'), icon: Users },
    { id: 'payroll', name: t('reports.payrollSummary'), icon: DollarSign },
    { id: 'turnover', name: t('reports.personnelTurnover'), icon: TrendingUp },
  ]

  const renderReport = () => {
    switch (reportType) {
      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Employees</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {attendanceSummary?.totalEmployees || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Present Days</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {attendanceSummary?.presentDays || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Late Days</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {attendanceSummary?.lateDays || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Absent Days</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {attendanceSummary?.absentDays || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.workingHoursSummary')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">{t('reports.totalWorkingHours')}</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {Number(attendanceSummary?.totalWorkingHours || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} hours
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('reports.totalOvertimeHours')}</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {Number(attendanceSummary?.totalOvertimeHours || 0).toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'staffing':
        return (
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.staffingByDepartment')}</h3>
            <div className="overflow-x-auto">
              <table className="table">
                <thead className="bg-gray-50">
                  <tr>
                    <th>{t('reports.department')}</th>
                    <th>{t('reports.totalEmployees')}</th>
                    <th>{t('reports.activeEmployees')}</th>
                    <th>{t('reports.utilizationRate')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffingReport?.map((dept: any) => (
                    <tr key={dept.departmentId} className="hover:bg-gray-50">
                      <td className="font-medium">{dept.departmentName}</td>
                      <td>{dept.totalEmployees}</td>
                      <td>{dept.activeEmployees}</td>
                      <td>
                        {dept.totalEmployees > 0 
                          ? `${Math.round((dept.activeEmployees / dept.totalEmployees) * 100)}%`
                          : '0%'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )

      case 'payroll':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('reports.totalEmployees')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {payrollSummary?.totalEmployees || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('payroll.totalGross')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrencyVN(payrollSummary?.totalGrossSalary || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('payroll.totalNet')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrencyVN(payrollSummary?.totalNetSalary || 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('payroll.totalDeductions')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {formatCurrencyVN(payrollSummary?.totalDeductions || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.payrollSummary')}</h3>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrencyVN(payrollSummary?.averageSalary || 0)}
              </p>
            </div>
          </div>
        )

      case 'turnover':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="card p-4">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('reports.hires')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {turnoverReport?.summary?.totalHires || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('reports.departures')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {turnoverReport?.summary?.totalDepartures || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('reports.netChange')}</p>
                    <p className={`text-2xl font-semibold ${(turnoverReport?.summary?.netChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(turnoverReport?.summary?.netChange || 0) >= 0 ? '+' : ''}{turnoverReport?.summary?.netChange || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('reports.currentEmployees')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {turnoverReport?.summary?.currentActiveEmployees || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('reports.turnoverRate')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {turnoverReport?.summary?.turnoverRate || 0}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="card p-4">
                <div className="flex items-center">
                  <TrendingDown className="h-8 w-8 text-red-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">{t('reports.terminatedEmployees')}</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {turnoverReport?.summary?.terminatedEmployees || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.personnelTurnoverByDepartment')}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.department')}</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.hires')}</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.departures')}</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.netChange')}</th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.currentEmployees')}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {turnoverReport?.byDepartment?.map((dept: any) => (
                      <tr key={dept.departmentName} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{dept.departmentName}</td>
                        <td className="px-4 py-2 text-sm text-center text-green-600 font-semibold">{dept.hires}</td>
                        <td className="px-4 py-2 text-sm text-center text-red-600 font-semibold">{dept.departures}</td>
                        <td className={`px-4 py-2 text-sm text-center font-semibold ${dept.netChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {dept.netChange >= 0 ? '+' : ''}{dept.netChange}
                        </td>
                        <td className="px-4 py-2 text-sm text-center text-gray-900">{dept.currentActive}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {turnoverReport?.terminatedEmployees && turnoverReport.terminatedEmployees.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.terminatedEmployeesList')}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.employeeCode')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.fullName')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.department')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.hireDate')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.terminationDate')}</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('reports.status')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {turnoverReport.terminatedEmployees.map((emp: any) => (
                        <tr key={emp.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{emp.employeeCode}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{emp.firstName} {emp.lastName}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{emp.department}</td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">
                            {emp.terminationDate ? new Date(emp.terminationDate).toLocaleDateString('vi-VN') : '-'}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {t('reports.terminated')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h1>
          <p className="text-gray-600">{t('reports.subtitle')}</p>
        </div>
        <button 
          className="btn btn-primary flex items-center space-x-2"
          onClick={handleExportExcel}
        >
          <Download className="h-4 w-4" />
          <span>{t('reports.export')}</span>
        </button>
      </div>

      <div className="card p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {reportTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    reportType === type.id
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{type.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {(reportType === 'attendance' || reportType === 'payroll' || reportType === 'turnover') && (
          <div className="flex items-center space-x-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('reports.startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('reports.endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>
        )}

        {renderReport()}
      </div>
    </div>
  )
}

export default Reports
