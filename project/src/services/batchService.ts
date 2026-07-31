const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export interface BatchConfig {
  id: number;
  batchYear: number;
  targetStudents: number;
  registeredStudents: number;
  progressPercentage: string;
  isFull: boolean;
  status: string;
  autoStartEnabled: boolean;
  delayBeforeStartHours: number;
  analysisStartedAt: string | null;
  analysisCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BatchResponse {
  totalBatches: number;
  batches: BatchConfig[];
}

class BatchService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllBatches(): Promise<BatchResponse> {
    const response = await fetch(`${API_BASE_URL}/admin/batch-config/all`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch batches: ${response.statusText}`);
    }

    return response.json();
  }

  async getBatchByYear(year: number): Promise<BatchConfig> {
    const response = await fetch(`${API_BASE_URL}/admin/batch-config/${year}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch batch: ${response.statusText}`);
    }

    return response.json();
  }

  async createBatch(
    batchYear: number,
    targetStudentCount: number,
    autoStartEnabled: boolean = true,
    delayBeforeStartHours: number = 0
  ): Promise<BatchConfig> {
    const params = new URLSearchParams({
      batchYear: batchYear.toString(),
      targetStudentCount: targetStudentCount.toString(),
      autoStartEnabled: autoStartEnabled.toString(),
      delayBeforeStartHours: delayBeforeStartHours.toString()
    });

    const response = await fetch(`${API_BASE_URL}/admin/batch-config/create?${params}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to create batch: ${response.statusText}`);
    }

    return response.json();
  }

  async updateBatch(
    year: number,
    targetStudentCount?: number,
    autoStartEnabled?: boolean,
    delayBeforeStartHours?: number
  ): Promise<BatchConfig> {
    const params = new URLSearchParams();
    if (targetStudentCount !== undefined) {
      params.append('targetStudentCount', targetStudentCount.toString());
    }
    if (autoStartEnabled !== undefined) {
      params.append('autoStartEnabled', autoStartEnabled.toString());
    }
    if (delayBeforeStartHours !== undefined) {
      params.append('delayBeforeStartHours', delayBeforeStartHours.toString());
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/batch-config/${year}/update?${params}`,
      {
        method: 'PUT',
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update batch: ${response.statusText}`);
    }

    return response.json();
  }

  async startAnalysis(year: number): Promise<BatchConfig> {
    const response = await fetch(
      `${API_BASE_URL}/admin/batch-config/${year}/start-analysis`,
      {
        method: 'POST',
        headers: this.getAuthHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to start analysis: ${response.statusText}`);
    }

    return response.json();
  }
}

export const batchService = new BatchService();
