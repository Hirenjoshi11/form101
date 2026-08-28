import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { ApiService } from '@/lib/api';
import {
  CertificateForm,
  Operator,
  BillingSummary,
  DailyRevenueRecord,
  MonthlyRevenueRecord,
  ServiceRevenueBreakdown,
  PlatformProfitRecord,
  GovtRemittanceRecord,
  BillingTransaction
} from '@/lib/types';
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
  FileText,
  Landmark,
  Wallet,
  Sparkles,
  Layers,
  ArrowUpDown,
  Coins,
  Percent
} from 'lucide-react';

interface AdminBillingDashboardProps {
  formsList?: CertificateForm[];
  operatorsList?: Operator[];
}

export type FinancialTableTab = 'overall' | 'profit' | 'govt' | 'all';
export type ChartMetricMode = 'all_three' | 'gross' | 'portal' | 'govt';

export const AdminBillingDashboard: React.FC<AdminBillingDashboardProps> = ({
  formsList = [],
  operatorsList = []
}) => {
  const { language } = useLanguage();

  // ─── 1. DATE PRESET & FILTER STATES ───
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

  // ─── 2. ACTIVE VIEW MODES ───
  // Active Table Selection: 'overall' | 'profit' | 'govt' | 'all'
  const [activeTableTab, setActiveTableTab] = useState<FinancialTableTab>('overall');

  // Chart View Mode: Daily vs Monthly
  const [chartViewMode, setChartViewMode] = useState<'daily' | 'monthly'>('daily');
  // Chart Metric Filter Mode: 'all_three' | 'gross' | 'portal' | 'govt'
  const [chartMetricMode, setChartMetricMode] = useState<ChartMetricMode>('all_three');
  // Selected Data Point for Interactive Banner
  const [selectedPointDetail, setSelectedPointDetail] = useState<any | null>(null);

  // Selected Transaction for Invoice Modal
  const [selectedInvoiceTxn, setSelectedInvoiceTxn] = useState<BillingTransaction | null>(null);

  // ─── 3. DATA STATES FROM DATABASE API ───
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [monthlySeries, setMonthlySeries] = useState<MonthlyRevenueRecord[]>([]);
  const [dailySeries, setDailySeries] = useState<DailyRevenueRecord[]>([]);
  const [serviceBreakdown, setServiceBreakdown] = useState<ServiceRevenueBreakdown[]>([]);
  const [platformProfitData, setPlatformProfitData] = useState<PlatformProfitRecord[]>([]);
  const [govtRemittanceData, setGovtRemittanceData] = useState<GovtRemittanceRecord[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any | null>(null);
  const [transactionsData, setTransactionsData] = useState<{
    total_count: number;
    page: number;
    limit: number;
    total_pages: number;
    transactions: BillingTransaction[];
  }>({ total_count: 0, page: 1, limit: 15, total_pages: 1, transactions: [] });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ─── 4. DATE RANGE CALCULATION ───
  const { fromDate, toDate } = useMemo(() => {
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

  // ─── 5. DATA LOADER ───
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

      const [
        summaryRes,
        monthlyRes,
        dailyRes,
        serviceRes,
        profitRes,
        govtRes,
        methodsRes,
        txnsRes
      ] = await Promise.all([
        ApiService.getBillingSummary(queryParams),
        ApiService.getMonthlyRevenue({ year: 2026, service_id: selectedService }),
        ApiService.getDailyRevenue({ from_date: fromDate, to_date: toDate, service_id: selectedService }),
        ApiService.getRevenueByService({ from_date: fromDate, to_date: toDate }),
        ApiService.getPlatformProfitSummary({ from_date: fromDate, to_date: toDate }),
        ApiService.getGovtRemittances({ from_date: fromDate, to_date: toDate }),
        ApiService.getPaymentMethodsSplit({ from_date: fromDate, to_date: toDate }),
        ApiService.getBillingTransactions(queryParams)
      ]);

      setSummary(summaryRes);
      setMonthlySeries(monthlyRes || []);
      setDailySeries(dailyRes || []);
      setServiceBreakdown(serviceRes || []);
      setPlatformProfitData(profitRes || []);
      setGovtRemittanceData(govtRes || []);
      setPaymentMethods(methodsRes);
      setTransactionsData(txnsRes || { total_count: 0, page: 1, limit: 15, total_pages: 1, transactions: [] });
    } catch (err: any) {
      console.error('Error fetching billing analytics:', err);
      setError('Unable to load revenue data from database. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate, selectedService, selectedPaymentStatus, selectedOperator, selectedPaymentMethod, searchQuery, currentPage]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Live reload on event dispatch
  useEffect(() => {
    const handleSync = () => loadDashboardData();
    window.addEventListener('formseva_data_updated', handleSync);
    return () => window.removeEventListener('formseva_data_updated', handleSync);
  }, [loadDashboardData]);

  // ─── 6. EXPORT HELPERS ───
  // Export Table 1 (Overall Revenue)
  const handleExportOverallRevenueCSV = () => {
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
      t.operator_name || 'N/A',
      t.status.toUpperCase()
    ]);
    downloadCSV(headers, rows, `Overall_Revenue_Report_${fromDate}_to_${toDate}.csv`);
  };

  // Export Table 2 (Platform Profit)
  const handleExportProfitCSV = () => {
    if (platformProfitData.length === 0) return;
    const headers = ['Service Scheme', 'Department', 'Applications Count', 'Unit Service Fee (INR)', 'Gross Platform Revenue (INR)', 'Operator Processing Expense (INR)', 'Net Platform Profit (INR)', 'Profit Margin (%)', 'Share of Total Profit (%)'];
    const rows = platformProfitData.map(p => [
      `"${p.service_title_en}"`,
      `"${p.department_name_en}"`,
      p.applications_count,
      p.unit_service_fee,
      p.gross_platform_revenue,
      p.operator_payout_expense,
      p.net_platform_profit,
      `${p.profit_margin_percentage}%`,
      `${p.profit_share_percentage}%`
    ]);
    downloadCSV(headers, rows, `Platform_Profit_Margin_Report_${fromDate}_to_${toDate}.csv`);
  };

  // Export Table 3 (Government Remittances)
  const handleExportGovtRemittancesCSV = () => {
    if (govtRemittanceData.length === 0) return;
    const headers = ['Department Name', 'Official Portal', 'Service Scheme', 'Unit Govt Fee (INR)', 'Applications Remitted', 'Total Amount Remitted (INR)', 'Treasury Head Code', 'Settlement Gateway', 'Status', 'Settlement Date'];
    const rows = govtRemittanceData.map(g => [
      `"${g.department_name_en}"`,
      `"${g.portal_name}"`,
      `"${g.service_title_en}"`,
      g.unit_govt_fee,
      g.applications_remitted,
      g.total_remitted_inr,
      `"${g.treasury_head_code}"`,
      `"${g.settlement_gateway}"`,
      g.remittance_status.toUpperCase(),
      g.last_settlement_date
    ]);
    downloadCSV(headers, rows, `Govt_Side_Remittance_Report_${fromDate}_to_${toDate}.csv`);
  };

  const downloadCSV = (headers: string[], rows: (string | number)[][], filename: string) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ─── 7. CHART CALCULATIONS & CEILINGS ───
  const formatYAxisTick = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(val % 1000 === 0 ? 0 : 1)}k`;
    return `₹${Math.round(val)}`;
  };

  // Daily Chart Max Value & Ticks
  const { yTicksDaily, maxDayCeiling } = useMemo(() => {
    if (!dailySeries || dailySeries.length === 0) {
      return { yTicksDaily: [10000, 7500, 5000, 2500, 0], maxDayCeiling: 10000 };
    }
    const maxVal = Math.max(...dailySeries.map(d => {
      if (chartMetricMode === 'gross') return d.gross;
      if (chartMetricMode === 'portal') return d.portal;
      if (chartMetricMode === 'govt') return d.govt;
      return d.gross; // all_three
    }), 1000);

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
      maxDayCeiling: ceiling
    };
  }, [dailySeries, chartMetricMode]);

  // Monthly Chart Max Value & Ticks
  const { yTicksMonthly, maxMonthCeiling } = useMemo(() => {
    if (!monthlySeries || monthlySeries.length === 0) {
      return { yTicksMonthly: [50000, 37500, 25000, 12500, 0], maxMonthCeiling: 50000 };
    }
    const maxVal = Math.max(...monthlySeries.map(m => {
      if (chartMetricMode === 'gross') return m.gross;
      if (chartMetricMode === 'portal') return m.portal;
      if (chartMetricMode === 'govt') return m.govt;
      return m.gross;
    }), 1000);

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
      maxMonthCeiling: ceiling
    };
  }, [monthlySeries, chartMetricMode]);

  // Total Totals for Tables Summary
  const profitTotals = useMemo(() => {
    const totalRevenue = platformProfitData.reduce((acc, p) => acc + p.gross_platform_revenue, 0);
    const totalExpenses = platformProfitData.reduce((acc, p) => acc + p.operator_payout_expense, 0);
    const totalProfit = platformProfitData.reduce((acc, p) => acc + p.net_platform_profit, 0);
    const totalApps = platformProfitData.reduce((acc, p) => acc + p.applications_count, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    return { totalRevenue, totalExpenses, totalProfit, totalApps, avgMargin };
  }, [platformProfitData]);

  const govtTotals = useMemo(() => {
    const totalRemitted = govtRemittanceData.reduce((acc, g) => acc + g.total_remitted_inr, 0);
    const totalApps = govtRemittanceData.reduce((acc, g) => acc + g.applications_remitted, 0);
    return { totalRemitted, totalApps, deptsCount: govtRemittanceData.length };
  }, [govtRemittanceData]);

  return (
    <div className="space-y-7 animate-fadeIn pb-16">

      {/* ─── 1. TOP HEADER & GLOBAL CONTROLS ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="p-3 rounded-2xl bg-[#159447]/10 text-[#159447] border border-[#159447]/20 shadow-2xs">
                <Landmark className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#18232D]">
                  {language === 'gu'
                    ? 'નાણાકીય વિશ્લેષણ અને આવક નિયંત્રણ'
                    : 'Financial Revenue & Remittance Control Room'}
                </h1>
                <p className="text-xs sm:text-sm text-[#5B6470] mt-0.5">
                  {language === 'gu'
                    ? '૩ પત્રકો: કુલ એકંદર આવક, અમારો નફો અને સરકારી તિજોરી ચુકવણી | દૈનિક અને માસિક બાર ચાર્ટ'
                    : '3 Dedicated Tables: Overall Revenue, Our Profit Margin & Govt Side Payouts | Daily & Monthly Bar Chart'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                if (activeTableTab === 'profit') handleExportProfitCSV();
                else if (activeTableTab === 'govt') handleExportGovtRemittancesCSV();
                else handleExportOverallRevenueCSV();
              }}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#18232D] hover:bg-slate-50 transition shadow-2xs disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>
                {activeTableTab === 'profit'
                  ? 'Export Profit CSV'
                  : activeTableTab === 'govt'
                  ? 'Export Govt CSV'
                  : 'Export Revenue CSV'}
              </span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#18232D] hover:bg-slate-50 transition shadow-2xs"
            >
              <Printer className="w-4 h-4 text-blue-600" />
              <span>Print Audit Sheet</span>
            </button>

            <button
              onClick={loadDashboardData}
              className="p-2 rounded-xl border border-slate-200 text-[#5B6470] hover:text-[#159447] hover:bg-emerald-50 transition"
              title="Reload from Live Database"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#159447]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Date Presets & Multi-Dimensional Filters */}
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
              { id: 'this_year', label: 'Year 2026' },
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

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            
            {/* Custom Range Picker */}
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
                  Active Range
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
                Gujarat Scheme
              </label>
              <select
                value={selectedService}
                onChange={e => {
                  setSelectedService(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#18232D] focus:outline-none focus:ring-2 focus:ring-[#159447]/30"
              >
                <option value="all">All Services (6 Schemes)</option>
                <option value="income_certificate">Income Certificate (આવક)</option>
                <option value="ews_certificate">EWS Certificate (10%)</option>
                <option value="caste_ncl_certificate">NCL / SEBC Certificate</option>
                <option value="land_records_7_12">7/12 Land Records (AnyRoR)</option>
                <option value="driving_licence_rto">Driving Licence (RTO)</option>
                <option value="neet_exam">NEET UG Exam 2026</option>
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
                <option value="pending">Pending Confirmation</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            {/* Specialist Operator */}
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

            {/* Search Filter */}
            <div>
              <label className="block text-[11px] font-bold text-[#5B6470] uppercase tracking-wider mb-1">
                Search Records
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Citizen, App #, Inv #..."
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

      {/* ─── 2. PRIMARY 3 FINANCIAL KPI CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* KPI Card 1: Overall Gross Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden group hover:border-blue-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg">
                1. Overall Gross Inflow
              </span>
              <h3 className="text-sm font-bold text-[#18232D] mt-2">
                {language === 'gu' ? 'કુલ એકંદર આવક (Total Revenue)' : 'Overall Gross Revenue'}
              </h3>
            </div>
            <span className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <DollarSign className="w-6 h-6" />
            </span>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-9 w-36 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-[#18232D] tracking-tight">
                  ₹{(summary?.gross_revenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#5B6470]">
            <span>{summary?.successful_count || 0} Successful Txns</span>
            <span className="font-bold text-blue-700">
              Avg ₹{summary?.avg_order_value || 0} / Order
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
        </div>

        {/* KPI Card 2: Profit for Our Side Revenue */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-lg">
                2. Our Side Margin
              </span>
              <h3 className="text-sm font-bold text-[#18232D] mt-2">
                {language === 'gu' ? 'અમારી બાજુનો નફો (Our Profit)' : 'Our Side Platform Profit'}
              </h3>
            </div>
            <span className="p-3 rounded-2xl bg-emerald-50 text-[#159447] border border-emerald-100">
              <TrendingUp className="w-6 h-6" />
            </span>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-9 w-36 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                  ₹{(summary?.portal_earnings || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ~76.8% Margin
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#5B6470]">
            <span>Net Platform Commission</span>
            <span className="font-bold text-emerald-700">
              ₹{(profitTotals.totalProfit || 0).toLocaleString('en-IN')} Net Retained
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
        </div>

        {/* KPI Card 3: Amount Paid in Government Side */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs relative overflow-hidden group hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-lg">
                3. Govt Remittance
              </span>
              <h3 className="text-sm font-bold text-[#18232D] mt-2">
                {language === 'gu' ? 'સરકારી તિજોરી ચુકવણી (Govt Paid)' : 'Amount Paid in Govt Side'}
              </h3>
            </div>
            <span className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Landmark className="w-6 h-6" />
            </span>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="h-9 w-36 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-amber-900 tracking-tight">
                  ₹{(summary?.govt_remittance || 0).toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  100% Remitted
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-[#5B6470]">
            <span>Cyber Treasury Gujarat (SBI e-Pay)</span>
            <span className="font-bold text-amber-800">
              {govtTotals.deptsCount} Depts Settled
            </span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        </div>

      </div>

      {/* ─── 3. INTERACTIVE BAR CHART (DAILY & MONTHLY DATA) ─── */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-xs space-y-6">
        
        {/* Chart Header & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#159447]" />
              <h2 className="text-lg sm:text-xl font-black text-[#18232D]">
                {chartViewMode === 'daily'
                  ? (language === 'gu' ? 'દૈનિક આવક બાર ચાર્ટ (Daily Revenue Bar Chart)' : `Daily Revenue & Profit Bar Chart (${fromDate} to ${toDate})`)
                  : (language === 'gu' ? '૨૦૨૬ માસિક આવક બાર ચાર્ટ (Monthly Revenue Bar Chart)' : 'Monthly Revenue & Profit Bar Chart (Year 2026 Database Series)')}
              </h2>
            </div>
            <p className="text-xs text-[#5B6470] mt-1">
              Comparative visualization across Overall Revenue, Our Platform Profit, and Government Remittances
            </p>
          </div>

          {/* Controls: Daily/Monthly Switcher + Metric Filter */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Daily vs Monthly Switch */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => {
                  setChartViewMode('daily');
                  setSelectedPointDetail(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  chartViewMode === 'daily'
                    ? 'bg-white text-[#18232D] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Data (દૈનિક)
              </button>
              <button
                onClick={() => {
                  setChartViewMode('monthly');
                  setSelectedPointDetail(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg transition-all ${
                  chartViewMode === 'monthly'
                    ? 'bg-white text-[#18232D] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Data (માસિક)
              </button>
            </div>

            {/* Metric Mode Filter */}
            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setChartMetricMode('all_three')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  chartMetricMode === 'all_three'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All 3 Metrics
              </button>
              <button
                onClick={() => setChartMetricMode('gross')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  chartMetricMode === 'gross'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Overall (Gross)
              </button>
              <button
                onClick={() => setChartMetricMode('portal')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  chartMetricMode === 'portal'
                    ? 'bg-[#159447] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Our Profit
              </button>
              <button
                onClick={() => setChartMetricMode('govt')}
                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                  chartMetricMode === 'govt'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Govt Paid
              </button>
            </div>

          </div>
        </div>

        {/* Chart Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold text-blue-900">
              <span className="w-3 h-3 rounded-md bg-blue-600" />
              <span>Overall Revenue (Gross)</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-emerald-800">
              <span className="w-3 h-3 rounded-md bg-[#159447]" />
              <span>Our Side Profit (Portal Fee)</span>
            </span>
            <span className="flex items-center gap-1.5 font-bold text-amber-800">
              <span className="w-3 h-3 rounded-md bg-amber-400" />
              <span>Amount Paid in Govt Side</span>
            </span>
          </div>

          <span className="text-[11px] text-[#5B6470] font-semibold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60">
            💡 Hover over bars for exact breakdown • Click to pin day details
          </span>
        </div>

        {/* ── Chart Canvas Plot Area ── */}
        {loading ? (
          <div className="h-72 sm:h-80 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <RefreshCw className="w-7 h-7 animate-spin text-[#159447]" />
              <span className="text-xs font-bold">Querying database revenue time series...</span>
            </div>
          </div>
        ) : chartViewMode === 'daily' ? (
          /* DAILY BAR CHART */
          dailySeries.length === 0 ? (
            <div className="h-72 flex items-center justify-center text-slate-400 text-xs font-bold">
              No daily revenue records found for the selected date range.
            </div>
          ) : (
            <div className="mt-4">
              <div className="flex">
                {/* Y-Axis Currency Label Column */}
                <div className="flex flex-col justify-between h-64 sm:h-72 pr-3 text-[10px] font-bold text-slate-400 select-none text-right shrink-0 w-12 sm:w-16">
                  {yTicksDaily.map((tick, i) => (
                    <span key={i} className="leading-none">
                      {formatYAxisTick(tick)}
                    </span>
                  ))}
                </div>

                {/* Main Plot Area */}
                <div className="relative flex-1 h-64 sm:h-72">
                  {/* Guide lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {yTicksDaily.map((_, i) => (
                      <div
                        key={i}
                        className={`w-full border-b ${
                          i === yTicksDaily.length - 1 ? 'border-slate-300' : 'border-dashed border-slate-100'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Interactive Bars */}
                  <div className="absolute inset-0 flex items-end justify-between gap-1 sm:gap-2 px-1">
                    {dailySeries.map(d => {
                      const maxVal = maxDayCeiling || 1000;
                      const grossHeight = Math.min(100, Math.max(0, (d.gross / maxVal) * 100));
                      const portalHeight = Math.min(100, Math.max(0, (d.portal / maxVal) * 100));
                      const govtHeight = Math.min(100, Math.max(0, (d.govt / maxVal) * 100));

                      const isSelected = selectedPointDetail?.date === d.date;

                      return (
                        <div
                          key={d.date}
                          onClick={() => setSelectedPointDetail(d)}
                          className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                        >
                          {/* Floating Tooltip */}
                          <div className="absolute -top-20 z-30 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-semibold py-2 px-3 rounded-xl shadow-2xl pointer-events-none whitespace-nowrap border border-slate-700">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                              <span>{d.date}</span>
                              <span className="text-slate-400 font-normal">({d.weekday})</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-1.5 text-center">
                              <div>
                                <span className="text-[9px] text-blue-300 block">Overall</span>
                                <span className="font-black text-blue-200">₹{d.gross.toLocaleString('en-IN')}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-emerald-300 block">Our Profit</span>
                                <span className="font-black text-emerald-300">₹{d.portal.toLocaleString('en-IN')}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-amber-300 block">Govt Paid</span>
                                <span className="font-black text-amber-300">₹{d.govt.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-300 mt-1 block">
                              {d.successful_txns} payments processed
                            </span>
                            <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-1" />
                          </div>

                          {/* Hover Overlay Highlight */}
                          <div className="absolute inset-0 bg-[#159447]/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                          {/* Bar Render based on Metric Mode */}
                          {chartMetricMode === 'all_three' ? (
                            /* Multi-Bar Grouped */
                            <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 max-w-[32px] sm:max-w-[40px]">
                              {/* Overall bar */}
                              <div
                                style={{ height: `${grossHeight}%` }}
                                className={`w-1.5 sm:w-2.5 rounded-t-sm bg-blue-600 transition-all duration-300 ${
                                  isSelected ? 'ring-2 ring-blue-500 brightness-110' : 'group-hover:brightness-110'
                                }`}
                              />
                              {/* Profit bar */}
                              <div
                                style={{ height: `${portalHeight}%` }}
                                className={`w-1.5 sm:w-2.5 rounded-t-sm bg-[#159447] transition-all duration-300 ${
                                  isSelected ? 'ring-2 ring-emerald-500 brightness-110' : 'group-hover:brightness-110'
                                }`}
                              />
                              {/* Govt bar */}
                              <div
                                style={{ height: `${govtHeight}%` }}
                                className={`w-1.5 sm:w-2.5 rounded-t-sm bg-amber-400 transition-all duration-300 ${
                                  isSelected ? 'ring-2 ring-amber-500 brightness-110' : 'group-hover:brightness-110'
                                }`}
                              />
                            </div>
                          ) : chartMetricMode === 'gross' ? (
                            <div
                              style={{ height: `${grossHeight}%` }}
                              className={`w-full max-w-[18px] sm:max-w-[26px] rounded-t-md bg-blue-600 transition-all duration-300 shadow-2xs ${
                                isSelected ? 'ring-2 ring-blue-600 shadow-md brightness-110' : 'group-hover:brightness-110'
                              }`}
                            />
                          ) : chartMetricMode === 'portal' ? (
                            <div
                              style={{ height: `${portalHeight}%` }}
                              className={`w-full max-w-[18px] sm:max-w-[26px] rounded-t-md bg-[#159447] transition-all duration-300 shadow-2xs ${
                                isSelected ? 'ring-2 ring-emerald-600 shadow-md brightness-110' : 'group-hover:brightness-110'
                              }`}
                            />
                          ) : (
                            <div
                              style={{ height: `${govtHeight}%` }}
                              className={`w-full max-w-[18px] sm:max-w-[26px] rounded-t-md bg-amber-400 transition-all duration-300 shadow-2xs ${
                                isSelected ? 'ring-2 ring-amber-500 shadow-md brightness-110' : 'group-hover:brightness-110'
                              }`}
                            />
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* X-Axis Aligned Labels */}
              <div className="flex ml-12 sm:ml-16 mt-3 text-[9px] sm:text-[10px] font-bold text-slate-400">
                <div className="flex-1 flex items-center justify-between px-1">
                  {dailySeries.map((d, idx) => {
                    const step = Math.max(1, Math.round(dailySeries.length / 8));
                    const isKey = idx === 0 || idx === dailySeries.length - 1 || idx % step === 0;
                    const isSelected = selectedPointDetail?.date === d.date;

                    return (
                      <div key={d.date} className="flex-1 text-center">
                        {isKey ? (
                          <span className={`inline-block px-1 rounded ${
                            isSelected ? 'text-emerald-700 font-black bg-emerald-50' : 'text-slate-600'
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
            </div>
          )
        ) : (
          /* MONTHLY BAR CHART (JAN TO DEC 2026) */
          <div className="mt-4">
            <div className="flex">
              {/* Y-Axis Label Column */}
              <div className="flex flex-col justify-between h-64 sm:h-72 pr-3 text-[10px] font-bold text-slate-400 select-none text-right shrink-0 w-12 sm:w-16">
                {yTicksMonthly.map((tick, i) => (
                  <span key={i} className="leading-none">
                    {formatYAxisTick(tick)}
                  </span>
                ))}
              </div>

              {/* Main Plot Area */}
              <div className="relative flex-1 h-64 sm:h-72">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {yTicksMonthly.map((_, i) => (
                    <div
                      key={i}
                      className={`w-full border-b ${
                        i === yTicksMonthly.length - 1 ? 'border-slate-300' : 'border-dashed border-slate-100'
                      }`}
                    />
                  ))}
                </div>

                {/* Bars */}
                <div className="absolute inset-0 flex items-end justify-between gap-1.5 sm:gap-3 px-2">
                  {monthlySeries.map(m => {
                    const maxVal = maxMonthCeiling || 50000;
                    const grossHeight = Math.min(100, Math.max(0, (m.gross / maxVal) * 100));
                    const portalHeight = Math.min(100, Math.max(0, (m.portal / maxVal) * 100));
                    const govtHeight = Math.min(100, Math.max(0, (m.govt / maxVal) * 100));
                    const isSelected = selectedPointDetail?.month === m.month;

                    return (
                      <div
                        key={m.month}
                        onClick={() => setSelectedPointDetail(m)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                      >
                        {/* Tooltip */}
                        <div className="absolute -top-20 z-30 hidden group-hover:flex flex-col items-center bg-slate-900/95 backdrop-blur-xs text-white text-[10px] font-semibold py-2 px-3 rounded-xl shadow-2xl pointer-events-none whitespace-nowrap border border-slate-700">
                          <div className="font-bold text-xs text-white">{m.month}</div>
                          <div className="grid grid-cols-3 gap-2 mt-1.5 text-center">
                            <div>
                              <span className="text-[9px] text-blue-300 block">Overall</span>
                              <span className="font-black text-blue-200">₹{m.gross.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-emerald-300 block">Our Profit</span>
                              <span className="font-black text-emerald-300">₹{m.portal.toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-amber-300 block">Govt Paid</span>
                              <span className="font-black text-amber-300">₹{m.govt.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                          <span className="text-[9px] text-slate-300 mt-1 block">
                            {m.txns} total applications
                          </span>
                          <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-1" />
                        </div>

                        {/* Bar Rendering */}
                        {chartMetricMode === 'all_three' ? (
                          <div className="w-full flex items-end justify-center gap-1 max-w-[44px]">
                            <div
                              style={{ height: `${grossHeight}%` }}
                              className={`w-2.5 sm:w-3.5 rounded-t-md bg-blue-600 transition-all duration-300 ${
                                isSelected ? 'ring-2 ring-blue-500 brightness-110' : 'group-hover:brightness-110'
                              }`}
                            />
                            <div
                              style={{ height: `${portalHeight}%` }}
                              className={`w-2.5 sm:w-3.5 rounded-t-md bg-[#159447] transition-all duration-300 ${
                                isSelected ? 'ring-2 ring-emerald-500 brightness-110' : 'group-hover:brightness-110'
                              }`}
                            />
                            <div
                              style={{ height: `${govtHeight}%` }}
                              className={`w-2.5 sm:w-3.5 rounded-t-md bg-amber-400 transition-all duration-300 ${
                                isSelected ? 'ring-2 ring-amber-500 brightness-110' : 'group-hover:brightness-110'
                              }`}
                            />
                          </div>
                        ) : chartMetricMode === 'gross' ? (
                          <div
                            style={{ height: `${grossHeight}%` }}
                            className={`w-full max-w-[32px] sm:max-w-[44px] rounded-t-lg bg-blue-600 transition-all duration-300 ${
                              isSelected ? 'ring-2 ring-blue-600 shadow-md brightness-110' : 'group-hover:brightness-110'
                            }`}
                          />
                        ) : chartMetricMode === 'portal' ? (
                          <div
                            style={{ height: `${portalHeight}%` }}
                            className={`w-full max-w-[32px] sm:max-w-[44px] rounded-t-lg bg-[#159447] transition-all duration-300 ${
                              isSelected ? 'ring-2 ring-emerald-600 shadow-md brightness-110' : 'group-hover:brightness-110'
                            }`}
                          />
                        ) : (
                          <div
                            style={{ height: `${govtHeight}%` }}
                            className={`w-full max-w-[32px] sm:max-w-[44px] rounded-t-lg bg-amber-400 transition-all duration-300 ${
                              isSelected ? 'ring-2 ring-amber-500 shadow-md brightness-110' : 'group-hover:brightness-110'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* X-Axis Month Labels */}
            <div className="flex ml-12 sm:ml-16 mt-3 text-[10px] sm:text-xs font-bold text-slate-500">
              <div className="flex-1 flex items-center justify-between px-2">
                {monthlySeries.map(m => (
                  <div key={m.month} className="flex-1 text-center truncate">
                    {m.monthShort}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Selected Data Point Insight Card */}
        {selectedPointDetail && (
          <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#159447] text-white font-black text-xs">
                {selectedPointDetail.day || selectedPointDetail.monthShort || 'AUDIT'}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#18232D]">
                  {selectedPointDetail.date || selectedPointDetail.month} ({selectedPointDetail.weekday || '2026'})
                </h4>
                <p className="text-xs text-[#5B6470] mt-0.5">
                  Overall Collection: <strong className="text-blue-900">₹{selectedPointDetail.gross.toLocaleString('en-IN')}</strong> | Our Side Profit: <strong className="text-emerald-700">₹{selectedPointDetail.portal.toLocaleString('en-IN')}</strong> | Govt Paid: <strong className="text-amber-800">₹{selectedPointDetail.govt.toLocaleString('en-IN')}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedPointDetail(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 self-end sm:self-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>

      {/* ─── 4. THE 3 DEDICATED FINANCIAL TABLES ─── */}
      <div className="space-y-5">
        
        {/* Table Selector Tabs Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            
            {/* Tab 1: Overall Revenue */}
            <button
              onClick={() => setActiveTableTab('overall')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTableTab === 'overall'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>1. Overall Revenue Ledger</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTableTab === 'overall' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                ₹{(summary?.gross_revenue || 0).toLocaleString('en-IN')}
              </span>
            </button>

            {/* Tab 2: Profit for Our Side Revenue */}
            <button
              onClick={() => setActiveTableTab('profit')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTableTab === 'profit'
                  ? 'bg-[#159447] text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>2. Profit for Our Side Revenue</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTableTab === 'profit' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                ₹{(summary?.portal_earnings || 0).toLocaleString('en-IN')}
              </span>
            </button>

            {/* Tab 3: Amount Paid in Government Side */}
            <button
              onClick={() => setActiveTableTab('govt')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTableTab === 'govt'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>3. Amount Paid in Govt Side</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTableTab === 'govt' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                ₹{(summary?.govt_remittance || 0).toLocaleString('en-IN')}
              </span>
            </button>

            {/* Tab 4: View All 3 Together */}
            <button
              onClick={() => setActiveTableTab('all')}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTableTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>View All 3 Tables</span>
            </button>

          </div>

          <div className="px-3 text-xs text-[#5B6470] font-semibold">
            Status: <span className="text-[#159447] font-bold">● Live Database Synchronized</span>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TABLE 1: OVERALL REVENUE LEDGER
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTableTab === 'overall' || activeTableTab === 'all') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs">
                    TABLE 1
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-[#18232D]">
                    {language === 'gu' ? 'કુલ એકંદર આવક પત્રક (Overall Revenue Ledger)' : 'Table 1: Overall Revenue Ledger (Gross Citizen Payments)'}
                  </h3>
                </div>
                <p className="text-xs text-[#5B6470] mt-1">
                  Individual citizen application fees collected across Gujarat portals • Total recorded: {transactionsData.total_count} transactions
                </p>
              </div>

              <button
                onClick={handleExportOverallRevenueCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition self-start sm:self-center"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Table 1 CSV</span>
              </button>
            </div>

            {/* Table Container */}
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs font-bold">Loading overall revenue ledger...</span>
              </div>
            ) : transactionsData.transactions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-sm text-slate-600">No payment transactions found.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-[#5B6470]">
                      <th className="py-3 px-3">Invoice # / Date</th>
                      <th className="py-3 px-3">Application #</th>
                      <th className="py-3 px-3">Citizen Applicant</th>
                      <th className="py-3 px-3">Service Scheme</th>
                      <th className="py-3 px-3 text-right">Govt Fee</th>
                      <th className="py-3 px-3 text-right">Portal Fee</th>
                      <th className="py-3 px-3 text-right">Gross Total</th>
                      <th className="py-3 px-3 text-center">Payment Mode</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-center">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {transactionsData.transactions.map(t => (
                      <tr key={t.id} className="hover:bg-blue-50/40 transition">
                        <td className="py-3 px-3 font-mono">
                          <span className="font-bold text-[#18232D] block">{t.invoice_no}</span>
                          <span className="text-[10px] text-slate-400">{t.date}</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {t.application_number}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[#18232D]">{t.citizen_name}</div>
                          <div className="text-[11px] text-slate-500">📍 {t.district} • {t.citizen_phone}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800 block">{t.form_title_en}</span>
                          <span className="text-[10px] text-slate-400 font-normal">{t.operator_name}</span>
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-amber-800">
                          ₹{t.govt_fee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-[#159447]">
                          ₹{t.portal_fee.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-black text-blue-950 text-sm bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            ₹{t.total_fee.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {t.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            PAID
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setSelectedInvoiceTxn(t)}
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition"
                            title="View Official Receipt"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {transactionsData.total_pages > 1 && (
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Page {transactionsData.page} of {transactionsData.total_pages} ({transactionsData.total_count} records)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-slate-800 px-2">{currentPage}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(transactionsData.total_pages, prev + 1))}
                    disabled={currentPage === transactionsData.total_pages}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TABLE 2: PROFIT FOR OUR SIDE REVENUE (SERVICE MARGINS & EXPENSES)
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTableTab === 'profit' || activeTableTab === 'all') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-50 text-[#159447] font-bold text-xs">
                    TABLE 2
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-[#18232D]">
                    {language === 'gu' ? 'અમારી બાજુનો નફો અને સર્વિસ આવક પત્રક' : 'Table 2: Profit for Our Side Revenue & Operational Margins'}
                  </h3>
                </div>
                <p className="text-xs text-[#5B6470] mt-1">
                  Service charges collected, operator processing cost allocations, and net retained platform profit
                </p>
              </div>

              <button
                onClick={handleExportProfitCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition self-start sm:self-center"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Table 2 CSV</span>
              </button>
            </div>

            {/* Top Profit Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Gross Service Revenue</span>
                <span className="text-sm font-black text-emerald-950">₹{profitTotals.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Operator Disbursements</span>
                <span className="text-sm font-black text-rose-800">₹{profitTotals.totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Net Platform Profit</span>
                <span className="text-sm font-black text-[#159447]">₹{profitTotals.totalProfit.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Average Profit Margin</span>
                <span className="text-sm font-black text-emerald-900">{profitTotals.avgMargin.toFixed(1)}%</span>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-[#5B6470]">
                    <th className="py-3 px-3">Service Scheme</th>
                    <th className="py-3 px-3">Gujarat Department</th>
                    <th className="py-3 px-3 text-center">Applications</th>
                    <th className="py-3 px-3 text-right">Unit Portal Fee</th>
                    <th className="py-3 px-3 text-right">Gross Platform Rev.</th>
                    <th className="py-3 px-3 text-right">Operator Cost</th>
                    <th className="py-3 px-3 text-right">Net Profit (₹)</th>
                    <th className="py-3 px-3 text-center">Profit Margin (%)</th>
                    <th className="py-3 px-3 text-right">Profit Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {platformProfitData.map(p => (
                    <tr key={p.service_id} className="hover:bg-emerald-50/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#18232D] block">{p.service_title_en}</span>
                        <span className="text-[10px] text-slate-400">{p.service_title_gu}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold">
                        {p.department_name_en}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {p.applications_count}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        ₹{p.unit_service_fee}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">
                        ₹{p.gross_platform_revenue.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-rose-700">
                        -₹{p.operator_payout_expense.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-[#159447] text-sm bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          ₹{p.net_platform_profit.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                          {p.profit_margin_percentage}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-slate-700">
                        {p.profit_share_percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TABLE 3: AMOUNT PAID IN GOVERNMENT SIDE (TREASURY REMITTANCES)
        ══════════════════════════════════════════════════════════════════════ */}
        {(activeTableTab === 'govt' || activeTableTab === 'all') && (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-amber-50 text-amber-600 font-bold text-xs">
                    TABLE 3
                  </span>
                  <h3 className="font-black text-base sm:text-lg text-[#18232D]">
                    {language === 'gu' ? 'સરકારી તિજોરી / પોર્ટલ ચુકવણી પત્રક' : 'Table 3: Amount Paid in Government Side (Treasury Remittance)'}
                  </h3>
                </div>
                <p className="text-xs text-[#5B6470] mt-1">
                  Official statutory government fees remitted to Gujarat Cyber Treasury, AnyRoR, Digital Gujarat, and Parivahan heads
                </p>
              </div>

              <button
                onClick={handleExportGovtRemittancesCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition self-start sm:self-center"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export Table 3 CSV</span>
              </button>
            </div>

            {/* Top Govt Summary Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 text-xs">
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Total Statutory Fees Remitted</span>
                <span className="text-sm font-black text-amber-950">₹{govtTotals.totalRemitted.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Applications Remitted</span>
                <span className="text-sm font-black text-amber-900">{govtTotals.totalApps} Certificates</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Remittance Gateway</span>
                <span className="text-xs font-black text-emerald-800">Cyber Treasury Gujarat (SBI e-Pay)</span>
              </div>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-[#5B6470]">
                    <th className="py-3 px-3">Department & Portal</th>
                    <th className="py-3 px-3">Service Scheme</th>
                    <th className="py-3 px-3 text-right">Unit Govt Fee</th>
                    <th className="py-3 px-3 text-center">Applications Remitted</th>
                    <th className="py-3 px-3 text-right">Total Remitted (₹)</th>
                    <th className="py-3 px-3">Treasury Head Code</th>
                    <th className="py-3 px-3 text-center">Settlement Status</th>
                    <th className="py-3 px-3 text-right">Last Settled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {govtRemittanceData.map(g => (
                    <tr key={g.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-3">
                        <span className="font-bold text-[#18232D] block">{g.department_name_en}</span>
                        <span className="text-[10px] text-slate-500">🏛️ {g.portal_name}</span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {g.service_title_en}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-700">
                        ₹{g.unit_govt_fee}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-800">
                        {g.applications_remitted}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-amber-950 text-sm bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          ₹{g.total_remitted_inr.toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                        {g.treasury_head_code}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>100% Remitted</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[11px] text-slate-500">
                        {g.last_settlement_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* ─── 5. INVOICE / RECEIPT MODAL ─── */}
      {selectedInvoiceTxn && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#159447]" />
                <h3 className="font-black text-base text-[#18232D]">Official Payment Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedInvoiceTxn(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Number:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceTxn.invoice_no}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Application Number:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceTxn.application_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceTxn.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Citizen Applicant:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceTxn.citizen_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certificate Service:</span>
                <span className="font-bold text-slate-900">{selectedInvoiceTxn.form_title_en}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="text-slate-500">Government Statutory Fee:</span>
                <span className="font-bold text-amber-800">₹{selectedInvoiceTxn.govt_fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">FormSeva Portal Service Fee:</span>
                <span className="font-bold text-emerald-700">₹{selectedInvoiceTxn.portal_fee}</span>
              </div>
              <div className="border-t border-slate-300 pt-2 flex justify-between text-sm">
                <span className="font-bold text-slate-900">Total Paid (Gross):</span>
                <span className="font-black text-[#159447]">₹{selectedInvoiceTxn.total_fee}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-slate-500">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase">{selectedInvoiceTxn.payment_method}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#159447] text-white font-bold text-xs rounded-xl hover:bg-[#12803c] transition shadow-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Receipt</span>
              </button>
              <button
                onClick={() => setSelectedInvoiceTxn(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
