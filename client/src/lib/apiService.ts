
// services/apiService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

class APIService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return response;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async googleCallback(credential: string) {
    return this.request('/auth/google/callback', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  }

  async refreshToken() {
    return this.request('/auth/refresh', { method: 'POST' });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getUser() {
    return this.request('/auth/user');
  }

  // Projects (Properties)
  async getProjects(params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects?${queryString}`);
  }

  async getProject(projectId: string) {
    return this.request(`/projects/${projectId}`);
  }

  async updateProject(projectId: string, data: any) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async createProject(data: { address: string; project_type: string }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  // Milestones
  async getMilestones(projectId: string, params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/projects/${projectId}/milestones?${queryString}`);
  }

  async updateMilestone(milestoneId: string, data: any) {
    return this.request(`/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeMilestone(milestoneId: string, data: any = {}) {
    return this.request(`/milestones/${milestoneId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...data, status: 'complete', actual_end: new Date().toISOString() }),
    });
  }

  async createMilestone(projectId: string, data: any) {
    return this.request(`/projects/${projectId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Budget
  async getBudget(projectId: string) {
    return this.request(`/projects/${projectId}/budget_lines`);
  }

  async createBudgetLine(projectId: string, data: any) {
    return this.request(`/projects/${projectId}/budget_lines`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBudgetLine(budgetLineId: string, data: any) {
    return this.request(`/budget_lines/${budgetLineId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Vendors
  async getVendors() {
    return this.request('/vendors');
  }

  async createVendor(data: any) {
    return this.request('/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVendor(vendorId: string, data: any) {
    return this.request(`/vendors/${vendorId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getVendorPerformance(vendorId: string) {
    return this.request(`/vendors/${vendorId}/performance`);
  }

  // Companies (alias for vendors)
  async createCompany(data: { name: string; type: string }) {
    return this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // RFQs and Procurement
  async getRFQs(projectId?: string) {
    const params = projectId ? { propertyId: projectId } : {};
    const queryString = new URLSearchParams(params as Record<string, string>).toString();
    return this.request(`/rfqs?${queryString}`);
  }

  async createRFQ(data: any) {
    return this.request('/rfqs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRFQ(rfqId: string, data: any) {
    return this.request(`/rfqs/${rfqId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async sendRFQ(rfqId: string, vendorIds: string[]) {
    return this.request(`/rfqs/${rfqId}/send`, {
      method: 'POST',
      body: JSON.stringify({ vendorIds }),
    });
  }

  async getBids(rfqId: string) {
    return this.request(`/rfqs/${rfqId}/bids`);
  }

  async createBid(rfqId: string, data: any) {
    return this.request(`/rfqs/${rfqId}/bids`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async awardBid(bidId: string) {
    return this.request(`/bids/${bidId}/award`, {
      method: 'PATCH',
    });
  }

  // Permits
  async getPermits(projectId: string) {
    return this.request(`/properties/${projectId}/permits`);
  }

  async createPermit(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/permits`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePermit(permitId: string, data: any) {
    return this.request(`/permits/${permitId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getExpiringPermits(days: number = 30) {
    return this.request(`/permits/expiring?days=${days}`);
  }

  // Risks
  async getRisks(projectId: string) {
    return this.request(`/properties/${projectId}/risks`);
  }

  async createRisk(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/risks`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRisk(riskId: string, data: any) {
    return this.request(`/risks/${riskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Documents
  async getDocuments(params: { propertyId?: string; milestoneId?: string } = {}) {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/documents?${queryString}`);
  }

  async uploadDocument(file: File, metadata: Record<string, any>) {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    return this.request('/documents', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async uploadMilestoneDocument(milestoneId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/milestones/${milestoneId}/documents`, {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async downloadDocument(documentId: string) {
    return this.request(`/documents/${documentId}`);
  }

  async deleteDocument(documentId: string) {
    return this.request(`/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Activities
  async getActivities(projectId?: string, limit?: number) {
    const params: Record<string, string> = {};
    if (projectId) params.propertyId = projectId;
    if (limit) params.limit = limit.toString();
    
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/activities?${queryString}`);
  }

  async createActivity(data: any) {
    return this.request('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dashboard & Analytics
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getKPIs(projectId: string, period: string = 'month') {
    return this.request(`/properties/${projectId}/kpis?period=${period}`);
  }

  async getPortfolioDashboard() {
    return this.request('/dashboard/portfolio');
  }

  // Reports
  async generateWeeklyReport(projectId: string) {
    return this.request(`/reports/weekly/${projectId}`, {
      headers: { Accept: 'application/pdf' },
    });
  }

  async generateProjectReport(projectId: string, type: string = 'summary') {
    return this.request(`/reports/project/${projectId}?type=${type}`, {
      headers: { Accept: 'application/pdf' },
    });
  }

  // Object Storage
  async getUploadURL() {
    return this.request('/objects/upload', {
      method: 'POST',
    });
  }

  async setObjectACL(documentURL: string, aclPolicy: any) {
    return this.request('/objects', {
      method: 'PUT',
      body: JSON.stringify({ documentURL, ...aclPolicy }),
    });
  }

  // Admin endpoints
  async adminLogin(email: string) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Change Orders (future implementation)
  async getChangeOrders(projectId: string) {
    return this.request(`/properties/${projectId}/change-orders`);
  }

  async createChangeOrder(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/change-orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async approveChangeOrder(changeOrderId: string) {
    return this.request(`/change-orders/${changeOrderId}/approve`, {
      method: 'POST',
    });
  }

  // RFIs (Request for Information)
  async getRFIs(projectId: string, params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/properties/${projectId}/rfis?${queryString}`);
  }

  async createRFI(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/rfis`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async answerRFI(rfiId: string, answer: string) {
    return this.request(`/rfis/${rfiId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    });
  }

  // Daily Logs
  async getDailyLogs(projectId: string, params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/properties/${projectId}/daily-logs?${queryString}`);
  }

  async createDailyLog(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/daily-logs`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Punch List
  async getPunchList(projectId: string, params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/properties/${projectId}/punch-list?${queryString}`);
  }

  async createPunchItem(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/punch-list`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async completePunchItem(itemId: string) {
    return this.request(`/punch-list/${itemId}/complete`, {
      method: 'POST',
    });
  }

  // Safety
  async getSafetyIncidents(projectId: string) {
    return this.request(`/properties/${projectId}/safety-incidents`);
  }

  async reportSafetyIncident(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/safety-incidents`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Communication/Messages
  async getMessages(projectId: string) {
    return this.request(`/properties/${projectId}/messages`);
  }

  async sendMessage(projectId: string, data: any) {
    return this.request(`/properties/${projectId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Invoices
  async getInvoices(projectId: string, params: Record<string, any> = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/properties/${projectId}/invoices?${queryString}`);
  }

  async approveInvoice(invoiceId: string) {
    return this.request(`/invoices/${invoiceId}/approve`, {
      method: 'POST',
    });
  }
  // AI Permit Lookup
  async lookupPermit(data: { projectAddress: string; scopeOfWork: string }) {
    return this.request('/api/v1/permits/lookup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new APIService();
export default APIService;
