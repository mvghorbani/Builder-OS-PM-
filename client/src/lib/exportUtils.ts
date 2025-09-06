import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Property, Milestone, Activity } from '@shared/schema';

interface ExportData {
  project: Property;
  milestones: Milestone[];
  budgetLines: any[];
  permits: any[];
  activities: Activity[];
  generatedAt: string;
}

export const generatePDFReport = (data: ExportData) => {
  const { project, milestones, budgetLines, permits, activities } = data;
  
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text('Project Report', 20, 20);
  
  // Add project info
  doc.setFontSize(16);
  doc.text('Project Details', 20, 40);
  doc.setFontSize(12);
  doc.text(`Project: ${project.name || project.address}`, 20, 50);
  doc.text(`Address: ${project.address}`, 20, 60);
  doc.text(`Type: ${project.type}`, 20, 70);
  doc.text(`Status: ${project.status}`, 20, 80);
  doc.text(`Progress: ${project.progress}%`, 20, 90);
  doc.text(`Budget: $${parseFloat(project.totalBudget).toLocaleString()}`, 20, 100);
  doc.text(`Spent: $${parseFloat(project.spentBudget).toLocaleString()}`, 20, 110);
  
  // Add milestones table
  if (milestones.length > 0) {
    doc.setFontSize(16);
    doc.text('Milestones', 20, 130);
    
    const milestoneData = milestones.map(m => [
      m.name,
      m.status,
      m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'TBD',
      m.actualDate ? new Date(m.actualDate).toLocaleDateString() : 'N/A'
    ]);
    
    autoTable(doc, {
      startY: 140,
      head: [['Milestone', 'Status', 'Target Date', 'Actual Date']],
      body: milestoneData,
    });
  }
  
  // Add budget lines table
  if (budgetLines.length > 0) {
    const finalY = (doc as any).lastAutoTable.finalY || 140;
    
    doc.setFontSize(16);
    doc.text('Budget Lines', 20, finalY + 20);
    
    const budgetData = budgetLines.map(b => [
      b.scope,
      `$${parseFloat(b.contractAmount).toLocaleString()}`,
      `$${parseFloat(b.spentAmount).toLocaleString()}`,
      `${b.percentComplete}%`
    ]);
    
    autoTable(doc, {
      startY: finalY + 30,
      head: [['Scope', 'Contract Amount', 'Spent', 'Complete']],
      body: budgetData,
    });
  }
  
  // Add footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(10);
  doc.text(`Generated on ${new Date(data.generatedAt).toLocaleString()}`, 20, pageHeight - 10);
  
  // Download the PDF
  doc.save(`${project.name || project.address}_report.pdf`);
};

export const generateExcelReport = (data: ExportData) => {
  const { project, milestones, budgetLines, permits, activities } = data;
  
  // Create new workbook
  const wb = XLSX.utils.book_new();
  
  // Project overview sheet
  const projectData = [
    ['Field', 'Value'],
    ['Project Name', project.name || project.address],
    ['Address', project.address],
    ['Type', project.type],
    ['Status', project.status],
    ['Progress', `${project.progress}%`],
    ['Total Budget', parseFloat(project.totalBudget)],
    ['Spent Budget', parseFloat(project.spentBudget)],
    ['Schedule Adherence', `${project.scheduleAdherence}%`],
    ['Generated At', new Date(data.generatedAt).toLocaleString()]
  ];
  
  const projectWs = XLSX.utils.aoa_to_sheet(projectData);
  XLSX.utils.book_append_sheet(wb, projectWs, 'Project Overview');
  
  // Milestones sheet
  if (milestones.length > 0) {
    const milestonesData = [
      ['Name', 'Status', 'Description', 'Target Date', 'Actual Date', 'Order'],
      ...milestones.map(m => [
        m.name,
        m.status,
        m.description || '',
        m.targetDate ? new Date(m.targetDate).toLocaleDateString() : '',
        m.actualDate ? new Date(m.actualDate).toLocaleDateString() : '',
        m.order
      ])
    ];
    
    const milestonesWs = XLSX.utils.aoa_to_sheet(milestonesData);
    XLSX.utils.book_append_sheet(wb, milestonesWs, 'Milestones');
  }
  
  // Budget lines sheet
  if (budgetLines.length > 0) {
    const budgetData = [
      ['Scope', 'Contract Amount', 'Spent Amount', 'Percent Complete', 'Bid Count'],
      ...budgetLines.map(b => [
        b.scope,
        parseFloat(b.contractAmount),
        parseFloat(b.spentAmount),
        b.percentComplete,
        b.bidCount
      ])
    ];
    
    const budgetWs = XLSX.utils.aoa_to_sheet(budgetData);
    XLSX.utils.book_append_sheet(wb, budgetWs, 'Budget Lines');
  }
  
  // Permits sheet
  if (permits.length > 0) {
    const permitsData = [
      ['Type', 'Status', 'Application Date', 'Approval Date', 'Expiry Date'],
      ...permits.map(p => [
        p.type,
        p.status,
        p.applicationDate ? new Date(p.applicationDate).toLocaleDateString() : '',
        p.approvalDate ? new Date(p.approvalDate).toLocaleDateString() : '',
        p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : ''
      ])
    ];
    
    const permitsWs = XLSX.utils.aoa_to_sheet(permitsData);
    XLSX.utils.book_append_sheet(wb, permitsWs, 'Permits');
  }
  
  // Activities sheet
  if (activities.length > 0) {
    const activitiesData = [
      ['Description', 'Action', 'Date', 'Entity Type'],
      ...activities.map(a => [
        a.description,
        a.action,
        (a as any).createdAt ? new Date((a as any).createdAt).toLocaleDateString() : '',
        a.entityType
      ])
    ];
    
    const activitiesWs = XLSX.utils.aoa_to_sheet(activitiesData);
    XLSX.utils.book_append_sheet(wb, activitiesWs, 'Recent Activities');
  }
  
  // Download the Excel file
  XLSX.writeFile(wb, `${project.name || project.address}_report.xlsx`);
};

export const exportProject = async (projectId: string, format: 'pdf' | 'excel') => {
  try {
    const response = await fetch(`/api/projects/${projectId}/export/${format}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      if (format === 'pdf') {
        generatePDFReport(result.data);
      } else {
        generateExcelReport(result.data);
      }
      return { success: true };
    } else {
      throw new Error('Export failed');
    }
  } catch (error) {
    console.error(`Error exporting ${format}:`, error);
    throw error;
  }
};