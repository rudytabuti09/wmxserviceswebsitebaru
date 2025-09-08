import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

// Types for analytics data
type AnalyticsData = {
  summary: {
    totalRevenue: number;
    averageProjectValue: number;
    totalProjects: number;
    completedProjects: number;
    activeProjects: number;
    completionRate: number;
    totalClients: number;
    activeClients: number;
    totalMessages: number;
    averageMessagesPerProject: number;
  };
  charts: {
    revenueByMonth: Array<{ period: string; revenue: number }>;
    projectsByMonth: Array<{ period: string; created: number; completed: number }>;
    messagesByDay: Array<{ date: string; total: number; fromClients: number; fromAdmins: number }>;
    projectStatus: Array<{ status: string; count: number; percentage: number }>;
  };
  projects: Array<{
    id: string;
    title: string;
    status: string;
    progress: number;
    client: { name: string | null; email: string };
    createdAt: Date;
    updatedAt: Date;
    messageCount: number;
    revenue: number;
    milestoneCount: number;
    completedMilestones: number;
  }>;
  clients: Array<{
    id: string;
    name: string;
    email: string;
    projectCount: number;
    messageCount: number;
    totalSpent: number;
    lastActive: Date | null;
  }>;
};

type ProjectTimelineData = Array<{
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
  client: { name: string | null; email: string };
  createdAt: Date;
  updatedAt: Date;
  milestones: Array<{
    title: string;
    status: string;
    order: number;
    createdAt: Date;
  }>;
  financials: {
    totalInvoiced: number;
    totalPaid: number;
    pendingAmount: number;
  };
}>;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return format(date, 'dd/MM/yyyy');
};

const formatDateTime = (date: Date) => {
  return format(date, 'dd/MM/yyyy HH:mm');
};

// PDF Export Functions
export const exportAnalyticsToPDF = (data: AnalyticsData, period: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('WMX Services - Analytics Report', margin, 20);
  
  // Period
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${period.toUpperCase()}`, margin, 30);
  doc.text(`Generated: ${formatDateTime(new Date())}`, margin, 37);

  let yPosition = 50;

  // Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', margin, yPosition);
  yPosition += 10;

  const summaryData = [
    ['Total Revenue', formatCurrency(data.summary.totalRevenue)],
    ['Average Project Value', formatCurrency(data.summary.averageProjectValue)],
    ['Total Projects', data.summary.totalProjects.toString()],
    ['Completed Projects', data.summary.completedProjects.toString()],
    ['Active Projects', data.summary.activeProjects.toString()],
    ['Completion Rate', `${(data.summary.completionRate * 100).toFixed(1)}%`],
    ['Total Clients', data.summary.totalClients.toString()],
    ['Active Clients', data.summary.activeClients.toString()],
    ['Total Messages', data.summary.totalMessages.toString()],
  ];

  autoTable(doc, {
    head: [['Metric', 'Value']],
    body: summaryData,
    startY: yPosition,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [61, 82, 241] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 20;

  // Revenue by Month
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Revenue Trends', margin, yPosition);
  yPosition += 10;

  if (data.charts.revenueByMonth.length > 0) {
    const revenueData = data.charts.revenueByMonth.map(item => [
      item.period,
      formatCurrency(item.revenue)
    ]);

    autoTable(doc, {
      head: [['Month', 'Revenue']],
      body: revenueData,
      startY: yPosition,
      theme: 'striped',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [255, 199, 0] },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 20;
  }

  // Project Status Distribution
  if (yPosition > 200) {
    doc.addPage();
    yPosition = 20;
  }

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Status Distribution', margin, yPosition);
  yPosition += 10;

  const statusData = data.charts.projectStatus.map(item => [
    item.status.replace('_', ' '),
    item.count.toString(),
    `${item.percentage.toFixed(1)}%`
  ]);

  autoTable(doc, {
    head: [['Status', 'Count', 'Percentage']],
    body: statusData,
    startY: yPosition,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 62, 165] },
  });

  // Projects Detail
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Project Details', margin, yPosition);
  yPosition += 10;

  const projectsData = data.projects.slice(0, 50).map(project => [
    project.title,
    project.client.name || project.client.email,
    project.status.replace('_', ' '),
    `${project.progress}%`,
    formatCurrency(project.revenue),
    formatDate(project.createdAt)
  ]);

  autoTable(doc, {
    head: [['Project', 'Client', 'Status', 'Progress', 'Revenue', 'Created']],
    body: projectsData,
    startY: yPosition,
    theme: 'striped',
    styles: { fontSize: 8 },
    headStyles: { fillColor: [0, 255, 255] },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 35 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 30 },
      5: { cellWidth: 25 },
    },
  });

  // Client Analysis
  doc.addPage();
  yPosition = 20;
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Client Analysis', margin, yPosition);
  yPosition += 10;

  const clientsData = data.clients.slice(0, 30).map(client => [
    client.name,
    client.projectCount.toString(),
    client.messageCount.toString(),
    formatCurrency(client.totalSpent),
    client.lastActive ? formatDate(client.lastActive) : 'Never'
  ]);

  autoTable(doc, {
    head: [['Client', 'Projects', 'Messages', 'Total Spent', 'Last Active']],
    body: clientsData,
    startY: yPosition,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [0, 255, 0] },
  });

  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 30, doc.internal.pageSize.height - 10);
    doc.text('WMX Services Analytics Report', margin, doc.internal.pageSize.height - 10);
  }

  return doc;
};

export const exportProjectTimelineToPDF = (data: ProjectTimelineData, title: string = 'Project Timeline') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  
  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(`WMX Services - ${title}`, margin, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${formatDateTime(new Date())}`, margin, 30);

  let yPosition = 50;

  data.forEach((project, index) => {
    // Project Header
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${project.title}`, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${project.client.name || project.client.email}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Status: ${project.status.replace('_', ' ')} | Progress: ${project.progress}%`, margin, yPosition);
    yPosition += 5;
    doc.text(`Created: ${formatDate(project.createdAt)} | Updated: ${formatDate(project.updatedAt)}`, margin, yPosition);
    yPosition += 10;

    // Financial Summary
    const financialData = [
      ['Total Invoiced', formatCurrency(project.financials.totalInvoiced)],
      ['Total Paid', formatCurrency(project.financials.totalPaid)],
      ['Pending Amount', formatCurrency(project.financials.pendingAmount)]
    ];

    autoTable(doc, {
      body: financialData,
      startY: yPosition,
      theme: 'plain',
      styles: { fontSize: 9 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 40 },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Milestones
    if (project.milestones.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Milestones:', margin, yPosition);
      yPosition += 8;

      const milestonesData = project.milestones.map(milestone => [
        milestone.order.toString(),
        milestone.title,
        milestone.status,
        formatDate(milestone.createdAt)
      ]);

      autoTable(doc, {
        head: [['#', 'Milestone', 'Status', 'Created']],
        body: milestonesData,
        startY: yPosition,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [200, 200, 200] },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 80 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;
    } else {
      yPosition += 15;
    }
  });

  return doc;
};

// Excel Export Functions
export const exportAnalyticsToExcel = (data: AnalyticsData, period: string) => {
  const workbook = XLSX.utils.book_new();

  // Summary Sheet
  const summaryData = [
    ['WMX Services - Analytics Report'],
    [`Period: ${period.toUpperCase()}`],
    [`Generated: ${formatDateTime(new Date())}`],
    [''],
    ['Metric', 'Value'],
    ['Total Revenue', formatCurrency(data.summary.totalRevenue)],
    ['Average Project Value', formatCurrency(data.summary.averageProjectValue)],
    ['Total Projects', data.summary.totalProjects],
    ['Completed Projects', data.summary.completedProjects],
    ['Active Projects', data.summary.activeProjects],
    ['Completion Rate', `${(data.summary.completionRate * 100).toFixed(1)}%`],
    ['Total Clients', data.summary.totalClients],
    ['Active Clients', data.summary.activeClients],
    ['Total Messages', data.summary.totalMessages],
    ['Average Messages per Project', data.summary.averageMessagesPerProject.toFixed(1)],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Revenue Trends Sheet
  const revenueData = [
    ['Revenue by Month'],
    [''],
    ['Month', 'Revenue (IDR)'],
    ...data.charts.revenueByMonth.map(item => [item.period, item.revenue])
  ];

  const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue');

  // Projects Sheet
  const projectsData = [
    ['Project Details'],
    [''],
    ['Title', 'Client Name', 'Client Email', 'Status', 'Progress %', 'Revenue (IDR)', 'Messages', 'Milestones', 'Completed Milestones', 'Created', 'Updated'],
    ...data.projects.map(project => [
      project.title,
      project.client.name || '',
      project.client.email,
      project.status.replace('_', ' '),
      project.progress,
      project.revenue,
      project.messageCount,
      project.milestoneCount,
      project.completedMilestones,
      formatDate(project.createdAt),
      formatDate(project.updatedAt)
    ])
  ];

  const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
  XLSX.utils.book_append_sheet(workbook, projectsSheet, 'Projects');

  // Clients Sheet
  const clientsData = [
    ['Client Analysis'],
    [''],
    ['Name', 'Email', 'Projects', 'Messages', 'Total Spent (IDR)', 'Last Active'],
    ...data.clients.map(client => [
      client.name,
      client.email,
      client.projectCount,
      client.messageCount,
      client.totalSpent,
      client.lastActive ? formatDate(client.lastActive) : 'Never'
    ])
  ];

  const clientsSheet = XLSX.utils.aoa_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, clientsSheet, 'Clients');

  // Project Status Sheet
  const statusData = [
    ['Project Status Distribution'],
    [''],
    ['Status', 'Count', 'Percentage'],
    ...data.charts.projectStatus.map(item => [
      item.status.replace('_', ' '),
      item.count,
      `${item.percentage.toFixed(1)}%`
    ])
  ];

  const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
  XLSX.utils.book_append_sheet(workbook, statusSheet, 'Status Distribution');

  // Messages Activity Sheet  
  const messagesData = [
    ['Daily Message Activity'],
    [''],
    ['Date', 'Total Messages', 'From Clients', 'From Admins'],
    ...data.charts.messagesByDay.map(item => [
      item.date,
      item.total,
      item.fromClients,
      item.fromAdmins
    ])
  ];

  const messagesSheet = XLSX.utils.aoa_to_sheet(messagesData);
  XLSX.utils.book_append_sheet(workbook, messagesSheet, 'Message Activity');

  return workbook;
};

export const exportProjectTimelineToExcel = (data: ProjectTimelineData, title: string = 'Project Timeline') => {
  const workbook = XLSX.utils.book_new();

  // Projects Overview Sheet
  const overviewData = [
    [`WMX Services - ${title}`],
    [`Generated: ${formatDateTime(new Date())}`],
    [''],
    ['Project', 'Client', 'Status', 'Progress %', 'Total Invoiced (IDR)', 'Total Paid (IDR)', 'Pending (IDR)', 'Milestones', 'Created', 'Updated'],
    ...data.map(project => [
      project.title,
      project.client.name || project.client.email,
      project.status.replace('_', ' '),
      project.progress,
      project.financials.totalInvoiced,
      project.financials.totalPaid,
      project.financials.pendingAmount,
      project.milestones.length,
      formatDate(project.createdAt),
      formatDate(project.updatedAt)
    ])
  ];

  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Overview');

  // Milestones Detail Sheet
  const milestonesData = [
    ['All Project Milestones'],
    [''],
    ['Project', 'Milestone', 'Order', 'Status', 'Created'],
  ];

  data.forEach(project => {
    project.milestones.forEach(milestone => {
      milestonesData.push([
        project.title,
        milestone.title,
        milestone.order,
        milestone.status,
        formatDate(milestone.createdAt)
      ]);
    });
  });

  const milestonesSheet = XLSX.utils.aoa_to_sheet(milestonesData);
  XLSX.utils.book_append_sheet(workbook, milestonesSheet, 'Milestones');

  return workbook;
};

// Download helpers
export const downloadPDF = (doc: jsPDF, filename: string) => {
  doc.save(`${filename}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
  XLSX.writeFile(workbook, `${filename}-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};
