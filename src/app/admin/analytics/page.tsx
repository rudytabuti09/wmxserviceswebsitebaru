"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { RetroCard } from "@/components/ui/retro-card";
import { RetroButton } from "@/components/ui/retro-button";
import { trpc } from "@/lib/trpc";
import { 
  BarChart3, ArrowLeft, TrendingUp, TrendingDown, DollarSign, 
  Users, FolderOpen, MessageSquare, Calendar, Star, Eye,
  Target, Zap, Award, Activity, Download, FileText, FileSpreadsheet,
  Clock, CheckCircle, AlertCircle, PauseCircle, Filter, RefreshCw,
  Clock as Timeline
} from "lucide-react";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  Legend
} from "recharts";
import { format, subDays, subMonths, startOfMonth } from "date-fns";
import {
  exportAnalyticsToPDF,
  exportProjectTimelineToPDF,
  exportAnalyticsToExcel,
  exportProjectTimelineToExcel,
  downloadPDF,
  downloadExcel
} from "@/lib/export-utils";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'projects' | 'clients' | 'timeline'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  
  // Get comprehensive analytics data
  const { data: analyticsData, isLoading: analyticsLoading, refetch } = trpc.admin.getAnalytics.useQuery({
    period: selectedPeriod,
  });
  
  const { data: projectTimelineData, isLoading: timelineLoading } = trpc.admin.getProjectTimeline.useQuery({});
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd/MM/yyyy');
  };

  // Export functions
  const handleExportPDF = async (type: 'analytics' | 'timeline') => {
    if (!analyticsData && type === 'analytics') {
      toast.error('Analytics data not available');
      return;
    }
    if (!projectTimelineData && type === 'timeline') {
      toast.error('Timeline data not available');
      return;
    }

    setIsExporting(true);
    try {
      if (type === 'analytics' && analyticsData) {
        const doc = exportAnalyticsToPDF(analyticsData, selectedPeriod);
        downloadPDF(doc, 'wmx-analytics-report');
        toast.success('Analytics report exported to PDF');
      } else if (type === 'timeline' && projectTimelineData) {
        const doc = exportProjectTimelineToPDF(projectTimelineData, 'Project Timeline Report');
        downloadPDF(doc, 'wmx-project-timeline');
        toast.success('Timeline report exported to PDF');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async (type: 'analytics' | 'timeline') => {
    if (!analyticsData && type === 'analytics') {
      toast.error('Analytics data not available');
      return;
    }
    if (!projectTimelineData && type === 'timeline') {
      toast.error('Timeline data not available');
      return;
    }

    setIsExporting(true);
    try {
      if (type === 'analytics' && analyticsData) {
        const workbook = exportAnalyticsToExcel(analyticsData, selectedPeriod);
        downloadExcel(workbook, 'wmx-analytics-report');
        toast.success('Analytics report exported to Excel');
      } else if (type === 'timeline' && projectTimelineData) {
        const workbook = exportProjectTimelineToExcel(projectTimelineData, 'Project Timeline Report');
        downloadExcel(workbook, 'wmx-project-timeline');
        toast.success('Timeline report exported to Excel');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefreshData = () => {
    refetch();
    toast.success('Data refreshed');
  };

  // Chart colors
  const RETRO_COLORS = {
    primary: '#3D52F1',
    secondary: '#FFC700', 
    success: '#00FF00',
    warning: '#FF3EA5',
    info: '#00FFFF',
    dark: '#111111',
    light: '#FFFFFF'
  };

  const CHART_COLORS = [RETRO_COLORS.success, RETRO_COLORS.secondary, RETRO_COLORS.warning, RETRO_COLORS.info, RETRO_COLORS.primary];

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center max-w-md">
          <div style={{ fontSize: '72px', marginBottom: '24px' }}>🛡️</div>
          <h1 style={{
            fontFamily: 'Poppins, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#111111',
            marginBottom: '16px'
          }}>Access Denied</h1>
          <p style={{
            fontSize: '16px',
            color: '#111111',
            marginBottom: '24px'
          }}>You need admin privileges to access this page.</p>
          <Link href="/">
            <RetroButton variant="primary" size="lg">
              Back to Home
            </RetroButton>
          </Link>
        </RetroCard>
      </div>
    );
  }

  if (analyticsLoading || timelineLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RetroCard padding="lg" className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full mb-4" />
          <p>Loading analytics data...</p>
        </RetroCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/admin/dashboard">
              <button style={{
                backgroundColor: '#FFFFFF',
                color: '#111111',
                border: '2px solid #111111',
                padding: '8px 16px',
                fontFamily: 'Poppins, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                boxShadow: '2px 2px 0px #111111',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translate(-1px, -1px)';
                e.currentTarget.style.boxShadow = '3px 3px 0px #111111';
                e.currentTarget.style.backgroundColor = '#FFC700';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translate(0, 0)';
                e.currentTarget.style.boxShadow = '2px 2px 0px #111111';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }}>
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
            </Link>
          </div>
          
          {/* Page Header with Controls */}
          <div className="mb-8">
            <div className="text-center mb-8">
              <div style={{
                display: 'inline-block',
                animation: 'bounce 2s infinite'
              }}>
                <div style={{
                  backgroundColor: '#00FF00',
                  width: '80px',
                  height: '80px',
                  margin: '0 auto 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '3px solid #111111',
                  boxShadow: '4px 4px 0px #111111',
                  transform: 'rotate(-5deg)',
                }}>
                  <BarChart3 size={40} strokeWidth={3} color="#111111" />
                </div>
              </div>
              <h1 style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '42px',
                fontWeight: 800,
                textTransform: 'uppercase',
                color: '#00FF00',
                marginBottom: '16px',
                textShadow: '2px 2px 0px #111111'
              }}>
                Analytics Dashboard
              </h1>
              <p style={{
                fontSize: '18px',
                color: '#FFFFFF',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                Comprehensive business insights and performance metrics
              </p>
            </div>

            {/* Period Selector & Export Controls */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={20} className="text-white" />
                <span className="text-white font-medium">Period:</span>
                {['7d', '30d', '90d', '1y', 'all'].map((period) => (
                  <RetroButton
                    key={period}
                    variant={selectedPeriod === period ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedPeriod(period as typeof selectedPeriod)}
                  >
                    {period.toUpperCase()}
                  </RetroButton>
                ))}
                <RetroButton
                  variant="secondary"
                  size="sm"
                  onClick={handleRefreshData}
                  disabled={analyticsLoading}
                >
                  <RefreshCw size={16} className="mr-1" />
                  Refresh
                </RetroButton>
              </div>
              
              <div className="flex items-center gap-2">
                <RetroButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleExportPDF('analytics')}
                  disabled={isExporting || !analyticsData}
                >
                  <FileText size={16} className="mr-1" />
                  PDF
                </RetroButton>
                <RetroButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleExportExcel('analytics')}
                  disabled={isExporting || !analyticsData}
                >
                  <FileSpreadsheet size={16} className="mr-1" />
                  Excel
                </RetroButton>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'revenue', label: 'Revenue', icon: DollarSign },
                { id: 'projects', label: 'Projects', icon: FolderOpen },
                { id: 'clients', label: 'Clients', icon: Users },
                { id: 'timeline', label: 'Timeline', icon: Timeline },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <RetroButton
                    key={tab.id}
                    variant={activeTab === tab.id ? 'primary' : 'secondary'}
                    size="md"
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  >
                    <Icon size={18} className="mr-2" />
                    {tab.label}
                  </RetroButton>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && analyticsData && (
            <>
              {/* Key Performance Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  { 
                    icon: DollarSign, 
                    label: 'Total Revenue', 
                    value: formatCurrency(analyticsData.summary.totalRevenue),
                    trend: `Avg: ${formatCurrency(analyticsData.summary.averageProjectValue)}`,
                    trendUp: true,
                    color: RETRO_COLORS.success
                  },
                  { 
                    icon: FolderOpen, 
                    label: 'Projects', 
                    value: analyticsData.summary.totalProjects,
                    trend: `${analyticsData.summary.completedProjects} completed`,
                    trendUp: analyticsData.summary.completionRate > 0.5,
                    color: RETRO_COLORS.secondary
                  },
                  { 
                    icon: Users, 
                    label: 'Clients', 
                    value: analyticsData.summary.totalClients,
                    trend: `${analyticsData.summary.activeClients} active`,
                    trendUp: true,
                    color: RETRO_COLORS.warning
                  },
                  { 
                    icon: MessageSquare, 
                    label: 'Messages', 
                    value: analyticsData.summary.totalMessages,
                    trend: `${analyticsData.summary.averageMessagesPerProject.toFixed(1)} avg/project`,
                    trendUp: true,
                    color: RETRO_COLORS.info
                  }
                ].map((kpi, index) => {
                  const Icon = kpi.icon;
                  const TrendIcon = kpi.trendUp ? TrendingUp : TrendingDown;
                  return (
                    <RetroCard key={index} padding="lg" className="relative overflow-hidden">
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '60px',
                        height: '60px',
                        backgroundColor: kpi.color,
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%)',
                        opacity: 0.2
                      }} />
                      
                      <div className="flex items-center justify-between mb-4">
                        <div style={{
                          backgroundColor: kpi.color,
                          padding: '12px',
                          border: '3px solid #111111',
                          boxShadow: '3px 3px 0px #111111'
                        }}>
                          <Icon size={24} strokeWidth={2} color="#111111" />
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${kpi.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendIcon size={16} />
                          <span className="text-xs">{kpi.trend}</span>
                        </div>
                      </div>
                      
                      <h3 style={{
                        fontFamily: 'Poppins, sans-serif',
                        fontSize: '28px',
                        fontWeight: 800,
                        color: '#111111',
                        marginBottom: '4px'
                      }}>{kpi.value}</h3>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#666'
                      }}>{kpi.label}</p>
                    </RetroCard>
                  );
                })}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Revenue Chart */}
                <RetroCard padding="xl">
                  <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
                    <DollarSign size={24} className="text-green-500" />
                    Revenue Trends
                  </h2>
                  {analyticsData.charts.revenueByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={analyticsData.charts.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="period" 
                          stroke="#666"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#666"
                          style={{ fontSize: '12px' }}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                          labelStyle={{ color: '#111' }}
                          contentStyle={{
                            backgroundColor: '#FFF',
                            border: '3px solid #111',
                            borderRadius: '0',
                            boxShadow: '4px 4px 0px #111'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={RETRO_COLORS.success} 
                          fill={RETRO_COLORS.success}
                          fillOpacity={0.3}
                          strokeWidth={3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No revenue data available for selected period
                    </div>
                  )}
                </RetroCard>

                {/* Project Status Pie Chart */}
                <RetroCard padding="xl">
                  <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
                    <Target size={24} className="text-blue-500" />
                    Project Status
                  </h2>
                  {analyticsData.charts.projectStatus.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.charts.projectStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ status, percentage }) => `${status.replace('_', ' ')}: ${percentage.toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          stroke="#111"
                          strokeWidth={2}
                        >
                          {analyticsData.charts.projectStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value: number, name) => [value, 'Projects']}
                          labelStyle={{ color: '#111' }}
                          contentStyle={{
                            backgroundColor: '#FFF',
                            border: '3px solid #111',
                            borderRadius: '0',
                            boxShadow: '4px 4px 0px #111'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      No project data available
                    </div>
                  )}
                </RetroCard>
              </div>
            </>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && analyticsData && (
            <div className="space-y-8">
              <RetroCard padding="xl">
                <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
                  <DollarSign size={24} className="text-green-500" />
                  Revenue Analytics
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={analyticsData.charts.revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="period" stroke="#666" />
                        <YAxis 
                          stroke="#666" 
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                        />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), 'Revenue']} />
                        <Bar dataKey="revenue" fill={RETRO_COLORS.success} stroke="#111" strokeWidth={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Revenue Metrics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-100 border-2 border-black">
                        <span className="font-medium">Total Revenue</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(analyticsData.summary.totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-100 border-2 border-black">
                        <span className="font-medium">Average Project Value</span>
                        <span className="font-bold">
                          {formatCurrency(analyticsData.summary.averageProjectValue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-100 border-2 border-black">
                        <span className="font-medium">Projects Contributing</span>
                        <span className="font-bold">
                          {analyticsData.projects.filter(p => p.revenue > 0).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </RetroCard>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && analyticsData && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <RetroCard padding="xl">
                  <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
                    <FolderOpen size={24} className="text-yellow-500" />
                    Project Performance
                  </h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analyticsData.charts.projectsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="period" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="created" 
                        stroke={RETRO_COLORS.primary} 
                        strokeWidth={3}
                        name="Created"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke={RETRO_COLORS.success} 
                        strokeWidth={3}
                        name="Completed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </RetroCard>
                
                <RetroCard padding="xl">
                  <h3 className="text-lg font-bold uppercase mb-4">Top Projects by Revenue</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {analyticsData.projects
                      .sort((a, b) => b.revenue - a.revenue)
                      .slice(0, 10)
                      .map((project, index) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border-2 border-gray-300 hover:bg-gray-50">
                        <div>
                          <div className="font-medium text-sm">{project.title}</div>
                          <div className="text-xs text-gray-600">
                            {project.client.name || project.client.email} • {project.progress}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-600">
                            {formatCurrency(project.revenue)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {project.status.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </RetroCard>
              </div>
            </div>
          )}

          {/* Clients Tab */}
          {activeTab === 'clients' && analyticsData && (
            <div className="space-y-8">
              <RetroCard padding="xl">
                <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3">
                  <Users size={24} className="text-pink-500" />
                  Client Analytics
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Message Activity</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <AreaChart data={analyticsData.charts.messagesByDay.slice(-30)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#666" 
                          tickFormatter={(value) => format(new Date(value), 'MM/dd')}
                        />
                        <YAxis stroke="#666" />
                        <Tooltip labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')} />
                        <Area 
                          type="monotone" 
                          dataKey="fromClients" 
                          stackId="1"
                          stroke={RETRO_COLORS.warning} 
                          fill={RETRO_COLORS.warning}
                          name="From Clients"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="fromAdmins" 
                          stackId="1"
                          stroke={RETRO_COLORS.info} 
                          fill={RETRO_COLORS.info}
                          name="From Admins"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Top Clients by Spend</h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {analyticsData.clients
                        .sort((a, b) => b.totalSpent - a.totalSpent)
                        .slice(0, 10)
                        .map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-3 border-2 border-gray-300">
                          <div>
                            <div className="font-medium text-sm">{client.name}</div>
                            <div className="text-xs text-gray-600">
                              {client.projectCount} projects • {client.messageCount} messages
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-600">
                              {formatCurrency(client.totalSpent)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {client.lastActive ? `Active ${formatDate(client.lastActive)}` : 'Never active'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </RetroCard>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && projectTimelineData && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold uppercase flex items-center gap-3">
                  <Timeline size={24} className="text-cyan-500" />
                  Project Timeline
                </h2>
                <div className="flex gap-2">
                  <RetroButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportPDF('timeline')}
                    disabled={isExporting}
                  >
                    <FileText size={16} className="mr-1" />
                    Export PDF
                  </RetroButton>
                  <RetroButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleExportExcel('timeline')}
                    disabled={isExporting}
                  >
                    <FileSpreadsheet size={16} className="mr-1" />
                    Export Excel
                  </RetroButton>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                {projectTimelineData.slice(0, 10).map((project) => (
                  <RetroCard key={project.id} padding="lg">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`w-4 h-4 border-2 border-black ${
                            project.status === 'COMPLETED' ? 'bg-green-500' :
                            project.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                            project.status === 'REVIEW' ? 'bg-pink-500' :
                            project.status === 'ON_HOLD' ? 'bg-red-500' : 'bg-gray-500'
                          }`} />
                          <h3 className="text-lg font-bold">{project.title}</h3>
                          <span className="text-sm bg-gray-200 px-2 py-1 border border-black">
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span><strong>Client:</strong> {project.client.name || project.client.email}</span>
                          <span><strong>Progress:</strong> {project.progress}%</span>
                          <span><strong>Created:</strong> {formatDate(project.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Financial Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Invoiced:</span>
                            <span className="font-medium">{formatCurrency(project.financials.totalInvoiced)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Paid:</span>
                            <span className="font-medium text-green-600">{formatCurrency(project.financials.totalPaid)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pending:</span>
                            <span className="font-medium text-orange-600">{formatCurrency(project.financials.pendingAmount)}</span>
                          </div>
                        </div>
                        
                        {project.milestones.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-semibold mb-2">Milestones ({project.milestones.length})</h4>
                            <div className="space-y-1">
                              {project.milestones.slice(0, 3).map((milestone) => (
                                <div key={milestone.id} className="flex items-center gap-2 text-xs">
                                  <div className={`w-2 h-2 border border-black ${
                                    milestone.status === 'COMPLETED' ? 'bg-green-500' :
                                    milestone.status === 'IN_PROGRESS' ? 'bg-yellow-500' : 'bg-gray-300'
                                  }`} />
                                  <span className="truncate">{milestone.title}</span>
                                </div>
                              ))}
                              {project.milestones.length > 3 && (
                                <div className="text-xs text-gray-500">+{project.milestones.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </RetroCard>
                ))}
              </div>
            </div>
          )}

          {/* No Data State */}
          {!analyticsData && !analyticsLoading && (
            <RetroCard padding="xl" className="text-center">
              <div className="py-12">
                <BarChart3 size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-bold mb-2">No Analytics Data Available</h3>
                <p className="text-gray-600 mb-6">
                  Unable to load analytics data. Please try refreshing or contact support.
                </p>
                <RetroButton variant="primary" onClick={handleRefreshData}>
                  <RefreshCw size={16} className="mr-2" />
                  Retry Loading Data
                </RetroButton>
              </div>
            </RetroCard>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
