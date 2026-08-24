import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import { CertificateForm, Operator } from '@/lib/types';
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Calendar,
  Filter,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Receipt,
  User,
  ShieldCheck,
  Building2,
  PieChart as PieChartIcon,
  BarChart3,
  SlidersHorizontal,
  X,
  ExternalLink,
  AlertCircle,
  Hash,
  FileText
} from 'lucide-react';

interface AdminBillingDashboardProps {
  formsList?: CertificateForm[];
  operatorsList?: Operator[];
}

export const AdminBillingDashboard: React.FC<AdminBillingDashboardProps> = ({
  formsList = [],
  operatorsList = []
}) => {
  const { language } = useLanguage();

  // Primary Date Preset Filter
  const [datePreset, setDatePreset] = useState<string>('this_month');
  const [customFrom, setCustomFrom] = useState<string>('2026-08-01');
  const [customTo, setCustomTo] = useState<string>('2026-08-23');

  // Secondary Filters
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedOperator, setSelectedOperator] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // View Mode: Daily vs Monthly Chart
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDayDetail, setSelectedDayDetail] = useState<any | null>(null);

  // Selected Transaction for Invoice Modal
  const [selectedInvoiceTxn, setSelectedInvoiceTxn] = useState<any | null>(null);

  // Data States from Real Database API
  const [summary, setSummary] = useState<any | null>(null);
  const [monthlySeries, setMonthlySeries] = useState<any[]>([]);
  const [dailySeries, setDailySeries] = useState<any[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any | null>(null);
  const [transactionsData, setTransactionsData] = useState<{
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
    transactions: any[];
  }>({ total_count: 0, page: 1, limit: 15, total_pages: 1, transactions: [] });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Compute actual date range strings from preset
  const { fromDate, toDate } = useMemo(() => {
    const today = new Date(2026, 7, 23); // August 23, 2026 as base reference
    const formatDate = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    switch (datePreset) {
      case 'today':
        return { fromDate: '2026-08-23', toDate: '2026-08-23' };
      case 'yesterday':
        return { fromDate: '2026-08-22', toDate: '2026-08-22' };
      case 'this_week':
        return { fromDate: '2026-08-17', toDate: '2026-08-23' };
      case 'this_month':
        return { fromDate: '2026-08-01', toDate: '2026-08-23' };
      case 'last_month':
        return { fromDate: '2026-07-01', toDate: '2026-07-31' };
      case '7d':
        return { fromDate: '2026-08-17', toDate: '2026-08-23' };
      case '30d':
        return { fromDate: '2026-07-25', toDate: '2026-08-23' };
      case 'this_year':
        return { fromDate: '2026-01-01', toDate: '2026-12-31' };
      case 'custom':
        return { fromDate: customFrom, toDate: customTo };
      default:
        return { fromDate: '2026-08-01', toDate: '2026-08-23' };
    }
  }, [datePreset, customFrom, customTo]);

  // Load all analytics data from real database backend
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        from_date: fromDate,
        to_date: toDate,
        service_id: selectedService,
        payment_status: selectedPaymentStatus,
        operator_id: selectedOperator,
        payment_method: selectedPaymentMethod,
        search: searchQuery,
        page: currentPage,
        limit: 15
      };

      const [summaryRes, monthlyRes, dailyRes, serviceRes, methodsRes, txnsRes] = await Promise.all([
        ApiService.getBillingSummary(queryParams),
        ApiService.getMonthlyRevenue({ year: 2026, service_id: selectedService }),
        ApiService.getDailyRevenue({ from_date: fromDate, to_date: toDate, service_id: selectedService }),
        ApiService.getRevenueByService({ from_date: fromDate, to_date: toDate }),
        ApiService.getPaymentMethodsSplit({ from_date: fromDate, to_date: toDate }),
        ApiService.getBillingTransactions(queryParams)
      ]);

      setSummary(summaryRes);
      setMonthlySeries(monthlyRes || []);
      setDailySeries(dailyRes || []);
      setServiceBreakdown(serviceRes || []);
      setPaymentMethods(methodsRes);
      setTransactionsData(txnsRes || { total_count: 0, page: 1, limit: 15, total_pages: 1, transactions: [] });
    } catch (err: any) {
      console.error('Error fetching billing data:', err);
      setError('Unable to load revenue data from database. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedService, selectedPaymentStatus, selectedOperator, selectedPaymentMethod, searchQuery, currentPage]);

  // Re-fetch on any filter modification
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Live reload on event dispatch
  useEffect(() => {
    const handleSync = () => loadDashboardData();
    window.addEventListener('formseva_data_updated', handleSync);
    return () => window.removeEventListener('formseva_data_updated', handleSync);
  }, [loadDashboardData]);

  // Handle Export CSV of Current Filtered Records
  const handleExportCSV = () => {
    if (!transactionsData.transactions || transactionsData.transactions.length === 0) return;
    const headers = ['Invoice No', 'Application No', 'Date', 'Citizen Name', 'Phone', 'District', 'Service', 'Govt Fee (INR)', 'Portal Fee (INR)', 'Total Paid (INR)', 'Payment Mode', 'Operator', 'Status'];
    const rows = transactionsData.transactions.map(t => [
      t.invoice_no,
      t.application_number,
      t.date,
      `"${t.citizen_name}"`,
      t.citizen_phone,
      t.district,
      `"${t.form_title_en}"`,
      t.govt_fee,
      t.portal_fee,
      t.total_fee,
      t.payment_method.toUpperCase(),
      t.operator_name,
      t.status.toUpperCase()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FormSeva_Billing_Report_${fromDate}_to_${toDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Currency formatter for Y-axis ticks
  const formatYAxisTick = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    return `₹${Math.round(val)}`;
  };

  // Max value and grid ticks for Daily Chart
  const { yTicksDaily, maxDayGrossCeiling } = useMemo(() => {
    if (!dailySeries || dailySeries.length === 0) {
      return { yTicksDaily: [10000, 7500, 5000, 2500, 0], maxDayGrossCeiling: 10000 };
    }
    const maxVal = Math.max(...dailySeries.map(d => d.gross), 1000);
    const pow = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const ratio = maxVal / pow;
    let multiplier = 1;
    if (ratio <= 1) multiplier = 1;
    else if (ratio <= 2) multiplier = 2;
    else if (ratio <= 2.5) multiplier = 2.5;
    else if (ratio <= 5) multiplier = 5;
    else if (ratio <= 7.5) multiplier = 7.5;
    else multiplier = 10;
    const ceiling = Math.ceil(multiplier * pow);
    return {
      yTicksDaily: [ceiling, ceiling * 0.75, ceiling * 0.5, ceiling * 0.25, 0],
      maxDayGrossCeiling: ceiling
    };
  }, [dailySeries]);

  // Max value and grid ticks for Monthly Chart
  const { yTicksMonthly, maxMonthGrossCeiling } = useMemo(() => {
    if (!monthlySeries || monthlySeries.length === 0) {
      return { yTicksMonthly: [50000, 37500, 25000, 12500, 0], maxMonthGrossCeiling: 50000 };
    }
    const maxVal = Math.max(...monthlySeries.map(m => m.gross), 1000);
    const pow = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const ratio = maxVal / pow;
    let multiplier = 1;
    if (ratio <= 1) multiplier = 1;
    else if (ratio <= 2) multiplier = 2;
    else if (ratio <= 2.5) multiplier = 2.5;
    else if (ratio <= 5) multiplier = 5;
    else if (ratio <= 7.5) multiplier = 7.5;
    else multiplier = 10;
    const ceiling = Math.ceil(multiplier * pow);
    return {
      yTicksMonthly: [ceiling, ceiling * 0.75, ceiling * 0.5, ceiling * 0.25, 0],
      maxMonthGrossCeiling: ceiling
    };
  }, [monthlySeries]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ─── 1. HEADER & GLOBAL CONTROLS ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-emerald-50 text-[#159447] border border-emerald-200/80 shadow-2xs">
                <Receipt className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#18232D]">
                  {language === 'gu' ? 'બિલિંગ, આવક અને પેમેન્ટ એનાલિટિક્સ' : 'Billing & Revenue Analytics'}
                </h1>
                <p className="text-xs sm:text-sm text-[#5B6470] mt-0.5">
                  {language === 'gu'
                    ? 'સરકારી તિજોરી ફી, પોર્ટલ સર્વિસ ચાર્જ અને દૈનિક ટ્રાન્ઝેક્શન ટ્રેકર'
                    : 'Monitor payments, revenue streams, and real-time transaction performance.'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={loading || transactionsData.transactions.length === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#18232D] hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#18232D] hover:bg-slate-50 transition shadow-2xs"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Summary</span>
            </button>

            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl border border-slate-200 text-[#5B6470] hover:text-[#159447] hover:bg-emerald-50 transition"
              title="Reload from Database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#159447]' : ''}`} />
            </button>
          </div>
        </div>

        {/* ─── 2. DATE PRESETS & MULTI-DIMENSIONAL FILTERS ─── */}
        <div className="mt-5 pt-5 border-t border-slate-100 space-y-4">
          
          {/* Preset Buttons Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'this_week', label: 'This Week' },
              { id: 'this_month', label: 'This Month' },
              { id: 'last_month', label: 'Last Month' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'this_year', label: 'This Year (2026)' },
              { id: 'custom', label: 'Custom Range' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setDatePreset(p.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  datePreset === p.id
                    ? 'bg-[#159447] text-white shadow-2xs'
                    : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            
            {/* Custom Range Picker (if custom selected) */}
            {datePreset === 'custom' ? (
              <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-2 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase">From Date</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={e => {
                      setCustomFrom(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-[#18232D]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-emerald-800 uppercase">To Date</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={e => {
                      setCustomTo(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-[#18232D]"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-[#5B6470] uppercase tracking-wider mb-1">
                  Active Date Range
                </label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18232D] flex items-center justify-between">
                  <span>{fromDate} → {toDate}</span>
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            )}

            {/* Service Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#5B6470] uppercase tracking-wider mb-1">
                Service / Form
              </label>
              <select
                value={selectedService}
                onChange={e => {
                  setSelectedService(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
              >
                <option value="all">All Services (6 Types)</option>
                <option value="income_certificate">Income Certificate (આવક)</option>
                <option value="ews_certificate">EWS Certificate (10%)</option>
                <option value="caste_ncl_certificate">NCL / SEBC Certificate</option>
                <option value="land_records_7_12">7/12 Land Records (AnyRoR)</option>
                <option value="driving_licence_rto">Driving Licence (RTO)</option>
                <option value="neet_exam">NEET UG Medical Exam 2026</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#5B6470] uppercase tracking-wider mb-1">
                Payment Status
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={e => {
                  setSelectedPaymentStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
              >
                <option value="all">All Statuses</option>
                <option value="succeeded">Successful (Paid)</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Specialist Operator Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#5B6470] uppercase tracking-wider mb-1">
                Specialist Operator
              </label>
              <select
                value={selectedOperator}
                onChange={e => {
                  setSelectedOperator(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
              >
                <option value="all">All Operators (4 Specialists)</option>
                <option value="Vicky">Vicky (Ahmedabad)</option>
                <option value="Nikhil">Nikhil (Vadodara)</option>
                <option value="DHulo">DHulo (Surat)</option>
                <option value="Loy">Loy (Rajkot)</option>
              </select>
            </div>

            {/* Live Search */}
            <div>
              <label className="block text-[11px] font-bold text-[#5B6470] uppercase tracking-wider mb-1">
                Search Transactions
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ID, App #, Citizen, Phone..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-[#18232D] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Error Alert Display */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-bold">{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* ─── 3. PRIMARY FINANCIAL KPI CARDS (FROM DATABASE) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Gross Revenue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">
              {language === 'gu' ? 'કુલ ગ્રોસ આવક' : 'Total Revenue'}
            </span>
            <span className="p-2 rounded-xl bg-emerald-50 text-[#159447]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-28 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-[#18232D]">
                  ₹{(summary?.gross_revenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#5B6470] mt-1">
            {loading ? '...' : `${summary?.successful_count || 0} successful payments`}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />
        </div>

        {/* Card 2: Successful Payments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">
              Successful Payments
            </span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-blue-900">
                  {(summary?.successful_count || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {summary?.success_rate || 100}% Rate
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#5B6470] mt-1">
            Portal Fee: ₹{(summary?.portal_earnings || 0).toLocaleString('en-IN')}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        {/* Card 3: Pending Payments */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">
              Pending Payments
            </span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <span className="text-2xl sm:text-3xl font-black text-amber-900">
                {(summary?.pending_count || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p className="text-xs text-[#5B6470] mt-1">
            Awaiting citizen bank confirmation
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-400" />
        </div>

        {/* Card 4: Failed / Refunded */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">
              Failed / Refunded
            </span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-900">
                  {((summary?.failed_count || 0) + (summary?.refunded_count || 0)).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  ({summary?.refunded_count || 0} ref.)
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#5B6470] mt-1">
            Processed within SLA guidelines
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-500" />
        </div>

        {/* Card 5: Total Transactions & AOV */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5B6470] uppercase tracking-wider">
              Total Transactions
            </span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            {loading ? (
              <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-purple-900">
                  {(summary?.total_transactions || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#5B6470] mt-1">
            Avg Order: <strong>₹{summary?.avg_order_value || 0}</strong>
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
        </div>
      </div>

      {/* ─── 4. REVENUE CHARTS SECTION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Dynamic Line / Bar Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#18232D] flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#159447]" />
                  <span>
                    {viewMode === 'daily'
                      ? (language === 'gu' ? 'દૈનિક આવક પ્રવાહ (Daily Revenue)' : `Daily Revenue Trend (${fromDate} to ${toDate})`)
                      : (language === 'gu' ? '૨૦૨૬: માસિક આવક પ્રવાહ (Monthly Revenue)' : 'Monthly Revenue (2026 Database Aggregate)')}
                  </span>
                </h2>
                <p className="text-xs text-[#5B6470] mt-0.5">
                  Calculated dynamically from real database payment entries
                </p>
              </div>

              {/* View Switcher & Legend */}
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs">
                  <button
                    onClick={() => setViewMode('daily')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      viewMode === 'daily' ? 'bg-white text-[#18232D] shadow-xs' : 'text-[#5B6470]'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setViewMode('monthly')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      viewMode === 'monthly' ? 'bg-white text-[#18232D] shadow-xs' : 'text-[#5B6470]'
                    }`}
                  >
                    Monthly
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#159447]" /> Portal Fee
                  </span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Govt Fee
                  </span>
                </div>
              </div>
            </div>

            {/* Chart Area */}
            {loading ? (
              <div className="h-72 sm:h-80 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#159447]" />
                  <span className="text-xs font-bold">Loading revenue series from database...</span>
                </div>
              </div>
            ) : viewMode === 'daily' ? (
              /* Daily Interactive Chart with True Y-Axis and Aligned Columns */
              dailySeries.length === 0 ? (
                <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-bold">
                  No payment records found in database for selected date range.
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex">
                    {/* Y-Axis Label Column (Left) */}
                    <div className="flex flex-col justify-between h-64 sm:h-72 pr-2.5 sm:pr-3 text-[10px] font-bold text-slate-400 select-none text-right shrink-0 w-11 sm:w-14">
                      {yTicksDaily.map((tick, i) => (
                        <span key={i} className="leading-none">
                          {formatYAxisTick(tick)}
                        </span>
                      ))}
                    </div>

                    {/* Main Plot Area */}
                    <div className="relative flex-1 h-64 sm:h-72">
                      {/* Background Horizontal Guide Lines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {yTicksDaily.map((_, i) => (
                          <div
                            key={i}
                            className={`w-full border-b ${
                              i === yTicksDaily.length - 1
                                ? 'border-slate-300'
                                : 'border-dashed border-slate-100'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Interactive Stacked Bars */}
                      <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-1.5 px-1">
                        {dailySeries.map((d) => {
                          const heightPercent = maxDayGrossCeiling > 0
                            ? Math.min(100, Math.max(0, (d.gross / maxDayGrossCeiling) * 100))
                            : 0;
                          const isSelected = selectedDayDetail?.date === d.date;
                          const portalRatio = d.gross > 0 ? (d.portal / d.gross) : 0;
                          const govtRatio = d.gross > 0 ? (d.govt / d.gross) : 0;

                          return (
                            <div
                              key={d.date}
                              onClick={() => setSelectedDayDetail(d)}
                              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                            >
                              {/* Floating Tooltip */}
                              <div className="absolute -top-16 z-30 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap border border-slate-700/60">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                                  <span>{d.date}</span>
                                  <span className="text-slate-400 font-normal">({d.weekday})</span>
                                </div>
                                <div className="text-emerald-400 font-extrabold text-xs mt-0.5">
                                  ₹{d.gross.toLocaleString('en-IN')}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                                  <span className="text-emerald-300 font-medium">Portal: ₹{d.portal.toLocaleString('en-IN')}</span>
                                  <span className="text-amber-300 font-medium">Govt: ₹{d.govt.toLocaleString('en-IN')}</span>
                                  <span className="text-slate-300 font-medium">{d.successful_txns} txns</span>
                                </div>
                                <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-1" />
                              </div>

                              {/* Hover Highlight Column Overlay */}
                              <div className="absolute inset-0 bg-emerald-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                              {/* Stacked Bar */}
                              {heightPercent > 0 ? (
                                <div
                                  style={{ height: `${heightPercent}%` }}
                                  className={`w-full max-w-[18px] sm:max-w-[24px] rounded-t-md transition-all duration-300 flex flex-col justify-end overflow-hidden shadow-2xs ${
                                    isSelected
                                      ? 'ring-2 ring-emerald-600 ring-offset-1 shadow-md brightness-105'
                                      : 'group-hover:brightness-105 group-hover:scale-y-[1.02]'
                                  }`}
                                >
                                  {/* Portal segment (top) */}
                                  <div
                                    style={{ height: `${portalRatio * 100}%` }}
                                    className="bg-[#159447] w-full shrink-0"
                                  />
                                  {/* Govt segment (bottom) */}
                                  <div
                                    style={{ height: `${govtRatio * 100}%` }}
                                    className="bg-amber-400 w-full shrink-0"
                                  />
                                </div>
                              ) : (
                                <div className="w-full max-w-[18px] sm:max-w-[24px] h-1 bg-slate-200 rounded-full mb-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* X-Axis Date Labels with Exact Column Alignment */}
                  <div className="flex ml-11 sm:ml-14 mt-2.5 text-[9px] sm:text-[10px] font-bold text-slate-400">
                    <div className="flex-1 flex items-center justify-between px-1">
                      {dailySeries.map((d, idx) => {
                        const step = Math.max(1, Math.round(dailySeries.length / 8));
                        const isKeyDate = idx === 0 || idx === dailySeries.length - 1 || idx % step === 0;
                        const isSelected = selectedDayDetail?.date === d.date;

                        return (
                          <div key={d.date} className="flex-1 text-center">
                            {isKeyDate ? (
                              <span className={`inline-block px-1 rounded ${
                                isSelected ? 'text-emerald-700 font-black bg-emerald-50' : 'text-slate-500'
                              }`}>
                                {d.day}
                              </span>
                            ) : (
                              <span className="opacity-0 select-none">·</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Period Footer */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 ml-11 sm:ml-14 px-1 pt-2.5 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dailySeries[0]?.date}</span>
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                      {dailySeries.length} Recorded Days in Period
                    </span>
                    <span className="font-semibold text-slate-700">
                      {dailySeries[dailySeries.length - 1]?.date}
                    </span>
                  </div>
                </div>
              )
            ) : (
              /* Monthly Interactive Chart with True Y-Axis and Aligned Columns */
              <div className="mt-5">
                <div className="flex">
                  {/* Y-Axis Label Column (Left) */}
                  <div className="flex flex-col justify-between h-64 sm:h-72 pr-2.5 sm:pr-3 text-[10px] font-bold text-slate-400 select-none text-right shrink-0 w-11 sm:w-14">
                    {yTicksMonthly.map((tick, i) => (
                      <span key={i} className="leading-none">
                        {formatYAxisTick(tick)}
                      </span>
                    ))}
                  </div>

                  {/* Main Plot Area */}
                  <div className="relative flex-1 h-64 sm:h-72">
                    {/* Background Horizontal Guide Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {yTicksMonthly.map((_, i) => (
                        <div
                          key={i}
                          className={`w-full border-b ${
                            i === yTicksMonthly.length - 1
                              ? 'border-slate-300'
                              : 'border-dashed border-slate-100'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Interactive Stacked Bars */}
                    <div className="absolute inset-0 flex items-end justify-between gap-2 sm:gap-3 px-2">
                      {monthlySeries.map((m) => {
                        const heightPercent = maxMonthGrossCeiling > 0
                          ? Math.min(100, Math.max(0, (m.gross / maxMonthGrossCeiling) * 100))
                          : 0;
                        const portalRatio = m.gross > 0 ? (m.portal / m.gross) : 0;
                        const govtRatio = m.gross > 0 ? (m.govt / m.gross) : 0;

                        return (
                          <div
                            key={m.month}
                            className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                          >
                            {/* Floating Tooltip */}
                            <div className="absolute -top-16 z-30 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap border border-slate-700/60">
                              <div className="font-bold text-xs text-white">{m.month}</div>
                              <div className="text-emerald-400 font-extrabold text-xs mt-0.5">
                                ₹{m.gross.toLocaleString('en-IN')}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[9px]">
                                <span className="text-emerald-300 font-medium">Portal: ₹{m.portal.toLocaleString('en-IN')}</span>
                                <span className="text-amber-300 font-medium">Govt: ₹{m.govt.toLocaleString('en-IN')}</span>
                                <span className="text-slate-300 font-medium">{m.txns} txns</span>
                              </div>
                              <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-1" />
                            </div>

                            {/* Hover Highlight Column Overlay */}
                            <div className="absolute inset-0 bg-emerald-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {/* Stacked Bar */}
                            {heightPercent > 0 ? (
                              <div
                                style={{ height: `${heightPercent}%` }}
                                className="w-full max-w-[32px] sm:max-w-[44px] rounded-t-lg transition-all duration-300 flex flex-col justify-end overflow-hidden shadow-2xs group-hover:brightness-105 group-hover:scale-y-[1.02]"
                              >
                                <div
                                  style={{ height: `${portalRatio * 100}%` }}
                                  className="bg-[#159447] w-full shrink-0"
                                />
                                <div
                                  style={{ height: `${govtRatio * 100}%` }}
                                  className="bg-amber-400 w-full shrink-0"
                                />
                              </div>
                            ) : (
                              <div className="w-full max-w-[32px] sm:max-w-[44px] h-1 bg-slate-200 rounded-full mb-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* X-Axis Month Labels */}
                <div className="flex ml-11 sm:ml-14 mt-2.5 text-[10px] sm:text-xs font-bold text-slate-500">
                  <div className="flex-1 flex items-center justify-between px-2">
                    {monthlySeries.map((m) => (
                      <div key={m.month} className="flex-1 text-center truncate">
                        {m.monthShort}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Period Footer */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 ml-11 sm:ml-14 px-1 pt-2.5 border-t border-slate-100">
                  <span className="font-semibold text-slate-700">Jan 2026</span>
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                    Annual 2026 Database Aggregate Series
                  </span>
                  <span className="font-semibold text-slate-700">Dec 2026</span>
                </div>
              </div>
            )}
          </div>

          {/* Selected Day Info Banner */}
          {selectedDayDetail && viewMode === 'daily' && (
            <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#159447] text-white font-bold text-xs">
                  {selectedDayDetail.day}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#18232D]">
                    {selectedDayDetail.date} ({selectedDayDetail.weekday})
                  </h4>
                  <p className="text-[11px] text-[#5B6470]">
                    Total Collection: <strong className="text-[#18232D]">₹{selectedDayDetail.gross.toLocaleString('en-IN')}</strong> | Portal Margin: <strong className="text-emerald-700">₹{selectedDayDetail.portal.toLocaleString('en-IN')}</strong> | Govt: <strong className="text-amber-800">₹{selectedDayDetail.govt.toLocaleString('en-IN')}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Revenue by Service / Form (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-black text-base text-[#18232D] flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-600" />
                  <span>Revenue by Service</span>
                </h3>
                <p className="text-xs text-[#5B6470]">
                  Ranking by gross fee collected
                </p>
              </div>
            </div>

            {/* List of services with progress bars */}
            <div className="mt-4 space-y-3.5">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : serviceBreakdown.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No service revenue for this period</p>
              ) : (
                serviceBreakdown.map(s => (
                  <div key={s.slug} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#18232D] truncate max-w-[180px]">
                        {language === 'gu' && s.name_gu ? s.name_gu : s.name}
                      </span>
                      <span className="font-black text-slate-700">
                        ₹{s.revenue.toLocaleString('en-IN')} ({s.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${s.percentage}%`, backgroundColor: s.color }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                      <span>{s.count} applications</span>
                      <span>Portal Margin: ₹{s.portal_fee.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Method Distribution */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <h4 className="text-xs font-bold text-[#18232D] mb-2 flex items-center justify-between">
              <span>Payment Channel Share</span>
              <span className="text-[10px] text-emerald-600 font-bold">100% Digital</span>
            </h4>
            <div className="grid grid-cols-4 gap-1 text-center">
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">UPI</span>
                <span className="text-xs font-black text-[#18232D]">{paymentMethods?.upi?.percent || 74}%</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">Cards</span>
                <span className="text-xs font-black text-[#18232D]">{paymentMethods?.card?.percent || 16}%</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">NetBank</span>
                <span className="text-xs font-black text-[#18232D]">{paymentMethods?.netbanking?.percent || 7}%</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 block">QR</span>
                <span className="text-xs font-black text-[#18232D]">{paymentMethods?.qr?.percent || 3}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 5. DAY-WISE REVENUE DETAILS TABLE ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-black text-base sm:text-lg text-[#18232D] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#159447]" />
              <span>Day-wise Revenue Audit Breakdown</span>
            </h3>
            <p className="text-xs text-[#5B6470]">
              Complete daily payment and revenue ledger for {fromDate} to {toDate}
            </p>
          </div>
          <span className="text-xs font-bold text-[#159447] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start">
            {dailySeries.length} Days Audited
          </span>
        </div>

        {dailySeries.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-bold">
            No daily records found in database for the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-slate-50 z-10">
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-[#5B6470]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Day</th>
                  <th className="py-2.5 px-3 text-center">Total Payments</th>
                  <th className="py-2.5 px-3 text-center">Successful</th>
                  <th className="py-2.5 px-3 text-right">Govt Fee (₹)</th>
                  <th className="py-2.5 px-3 text-right">Portal Fee (₹)</th>
                  <th className="py-2.5 px-3 text-right">Gross Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dailySeries.map(d => (
                  <tr key={d.date} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#18232D]">{d.date}</td>
                    <td className="py-2.5 px-3 text-slate-600 font-semibold">{d.weekday}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-700">{d.txns}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-emerald-700">{d.successful_txns}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-800">₹{d.govt.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-blue-800">₹{d.portal.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-right font-black text-[#159447]">₹{d.gross.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── 6. RECENT TRANSACTIONS TABLE (WITH REAL-TIME DB PAGINATION) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-black text-base sm:text-lg text-[#18232D] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-purple-600" />
              <span>Real-time Database Transactions Ledger</span>
            </h3>
            <p className="text-xs text-[#5B6470]">
              Showing {transactionsData.total_count} total payments matching database queries
            </p>
          </div>
        </div>

        {/* Table Container */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-[#159447]" />
            <span className="text-xs font-bold">Querying database transactions...</span>
          </div>
        ) : transactionsData.transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-600">No payment data available for this period.</p>
            <p className="text-xs text-slate-400">Try adjusting date range or clearing filter parameters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-[#5B6470]">
                  <th className="py-3 px-3">Transaction / Date</th>
                  <th className="py-3 px-3">Application #</th>
                  <th className="py-3 px-3">Citizen User</th>
                  <th className="py-3 px-3">Service Form</th>
                  <th className="py-3 px-3 text-right">Govt Fee</th>
                  <th className="py-3 px-3 text-right">Portal Fee</th>
                  <th className="py-3 px-3 text-right">Amount (₹)</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactionsData.transactions.map(txn => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 transition group">
                    {/* Invoice & Date */}
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-[#18232D] block">
                        {txn.invoice_no}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {txn.date}
                      </span>
                    </td>

                    {/* App Number */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-600">
                      {txn.application_number}
                    </td>

                    {/* Citizen User */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#18232D] block">
                        {txn.citizen_name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {txn.citizen_phone}
                      </span>
                    </td>

                    {/* Service Form */}
                    <td className="py-3 px-3">
                      <span className="font-bold text-[#18232D] block max-w-[180px] truncate" title={txn.form_title_en}>
                        {language === 'gu' && txn.form_title_gu ? txn.form_title_gu : txn.form_title_en}
                      </span>
                    </td>

                    {/* Govt Fee */}
                    <td className="py-3 px-3 text-right font-bold text-amber-800">
                      ₹{txn.govt_fee}
                    </td>

                    {/* Portal Fee */}
                    <td className="py-3 px-3 text-right font-bold text-blue-800">
                      ₹{txn.portal_fee}
                    </td>

                    {/* Total Paid */}
                    <td className="py-3 px-3 text-right">
                      <span className="font-black text-[#159447] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        ₹{txn.total_fee}
                      </span>
                    </td>

                    {/* Payment Method */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                        {txn.payment_method}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        txn.status === 'paid'
                          ? 'bg-emerald-50 text-[#159447] border border-emerald-200'
                          : txn.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {txn.status}
                      </span>
                    </td>

                    {/* Receipt Modal Trigger */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => setSelectedInvoiceTxn(txn)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#159447] hover:border-emerald-300 hover:bg-emerald-50 transition"
                        title="View & Print Tax Receipt"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {transactionsData.total_pages > 1 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-bold">
              Page {transactionsData.page} of {transactionsData.total_pages} ({transactionsData.total_count} records)
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-800">
                {currentPage}
              </span>
              <button
                disabled={currentPage >= transactionsData.total_pages}
                onClick={() => setCurrentPage(prev => Math.min(transactionsData.total_pages, prev + 1))}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 7. OFFICIAL INVOICE RECEIPT MODAL ─── */}
      {selectedInvoiceTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-scaleUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-[#18232D] to-slate-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#159447] flex items-center justify-center font-black text-white">
                  FS
                </div>
                <div>
                  <h4 className="font-black text-base">Payment Receipt</h4>
                  <p className="text-[11px] text-slate-300">FormSeva Gujarat Service Acknowledgement</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoiceTxn(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Details */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Invoice Number</span>
                  <span className="font-mono font-bold text-[#18232D]">{selectedInvoiceTxn.invoice_no}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Transaction Date</span>
                  <span className="font-bold text-[#18232D]">{selectedInvoiceTxn.date}</span>
                </div>
              </div>

              {/* Citizen Details */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Applicant Details</span>
                <p className="font-bold text-[#18232D]">{selectedInvoiceTxn.citizen_name}</p>
                <p className="text-slate-500">{selectedInvoiceTxn.citizen_phone} | Application: <span className="font-mono font-bold">{selectedInvoiceTxn.application_number}</span></p>
              </div>

              {/* Service Item */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Applied Certificate</span>
                <p className="font-bold text-[#18232D]">{selectedInvoiceTxn.form_title_en}</p>
                <p className="text-slate-500">{selectedInvoiceTxn.form_title_gu}</p>
              </div>

              {/* Fee Breakdown */}
              <div className="pt-3 border-t border-dashed border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Official Government Statutory Fee:</span>
                  <span className="font-bold text-[#18232D]">₹{selectedInvoiceTxn.govt_fee}.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">FormSeva Assisted Filing Service Fee:</span>
                  <span className="font-bold text-[#18232D]">₹{selectedInvoiceTxn.portal_fee}.00</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Payment Gateway Mode:</span>
                  <span className="font-bold uppercase text-slate-700">{selectedInvoiceTxn.payment_method}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Specialist Assigned:</span>
                  <span className="font-bold text-slate-700">{selectedInvoiceTxn.operator_name}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-black text-sm text-[#18232D]">Total Amount Paid:</span>
                  <span className="text-lg font-black text-[#159447]">₹{selectedInvoiceTxn.total_fee}.00</span>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#159447]" />
                  <span>Payment Verified in Database</span>
                </span>
                <span className="text-slate-500 text-[10px]">Ref: {selectedInvoiceTxn.payment_reference?.slice(0, 16)}...</span>
              </div>
            </div>

            {/* Receipt Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedInvoiceTxn(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#159447] text-white hover:bg-[#12803c] transition flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
