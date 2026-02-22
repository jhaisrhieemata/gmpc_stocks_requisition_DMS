import { InventoryItem, BranchGroup, RequisitionItem, DashboardStats, Supplier, OfficeSupplyStatus, SpecialRequestStatus, SupplierClassification } from '@/types';

// Express/MySQL Backend API Configuration
// Backend Server: http://localhost:3000
// API base URL configured for Express server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to get Authorization header
const getAuthHeader = () => {
  const token = localStorage.getItem('requisition_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function for API calls with error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeader(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Call Error [${endpoint}]:`, error);
    throw error;
  }
}

// Mock data for fallback (optional)
export const mockSuppliers: Supplier[] = [];
export const mockInventory: InventoryItem[] = [];
export const mockOfficeRequests: BranchGroup[] = [];
export const mockSpecialRequests: BranchGroup[] = [];
export const mockDashboardStats: DashboardStats = {
  officeCount: 0,
  specialCount: 0,
  statusCounts: {
    'Pending': 0,
    'Approved': 0,
    'Completed': 0,
    'Rejected': 0,
  },
};

// Real API implementation - Connected to Express/MySQL Backend
export const api = {
  // ========== SUPPLIERS ==========
  async getSuppliers(): Promise<Supplier[]> {
    try {
      const response = await apiCall<{ success: boolean; suppliers: Supplier[] }>('/suppliers');
      return response.suppliers || [];
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      return [];
    }
  },

  async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier | null> {
    try {
      const response = await apiCall<{ success: boolean; supplier: Supplier }>('/suppliers', {
        method: 'POST',
        body: JSON.stringify(supplier),
      });
      return response.supplier || null;
    } catch (error) {
      console.error('Failed to add supplier:', error);
      return null;
    }
  },

  async updateSupplier(supplier: Supplier): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(`/suppliers/${supplier.id}`, {
        method: 'PUT',
        body: JSON.stringify(supplier),
      });
      return response.success;
    } catch (error) {
      console.error('Failed to update supplier:', error);
      return false;
    }
  },

  async deleteSupplier(id: string): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(`/suppliers/${id}`, {
        method: 'DELETE',
      });
      return response.success;
    } catch (error) {
      console.error('Failed to delete supplier:', error);
      return false;
    }
  },

  // ========== INVENTORY ==========
  async getInventory(): Promise<InventoryItem[]> {
    try {
      const response = await apiCall<{ success: boolean; inventory: InventoryItem[] }>('/inventory');
      return response.inventory || [];
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      return [];
    }
  },

  async getInventoryBySupplier(supplierId: string): Promise<InventoryItem[]> {
    try {
      const response = await apiCall<{ success: boolean; inventory: InventoryItem[] }>(
        `/inventory?supplierId=${supplierId}`
      );
      return response.inventory || [];
    } catch (error) {
      console.error('Failed to fetch inventory by supplier:', error);
      return [];
    }
  },

  async addInventoryItem(item: Omit<InventoryItem, 'itemId'>): Promise<InventoryItem | null> {
    try {
      const response = await apiCall<{ success: boolean; item: InventoryItem }>('/inventory', {
        method: 'POST',
        body: JSON.stringify(item),
      });
      return response.item || null;
    } catch (error) {
      console.error('Failed to add inventory item:', error);
      return null;
    }
  },

  async updateInventoryItem(item: InventoryItem): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(`/inventory/${item.itemId}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      });
      return response.success;
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      return false;
    }
  },

  async deleteInventoryItem(itemId: string): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(`/inventory/${itemId}`, {
        method: 'DELETE',
      });
      return response.success;
    } catch (error) {
      console.error('Failed to delete inventory item:', error);
      return false;
    }
  },

  async getInventoryFromAPI(): Promise<InventoryItem[]> {
    return this.getInventory();
  },

  async createInventoryItem(data: Record<string, unknown>): Promise<{ success: boolean; id?: number }> {
    try {
      const response = await apiCall<{ success: boolean; id: number }>('/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      return { success: false };
    }
  },

  // ========== BRANCHES ==========
  async getBranches(): Promise<Record<string, unknown>[]> {
    try {
      const response = await apiCall<{ success: boolean; branches: Record<string, unknown>[] }>('/branches');
      return response.branches || [];
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      return [];
    }
  },

  async createBranch(data: Record<string, unknown>): Promise<{ success: boolean; id?: number }> {
    try {
      const response = await apiCall<{ success: boolean; id: number }>('/branches', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Failed to create branch:', error);
      return { success: false };
    }
  },

  async updateBranch(id: number, data: Record<string, unknown>): Promise<{ success: boolean }> {
    try {
      const response = await apiCall<{ success: boolean }>(`/branches/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Failed to update branch:', error);
      return { success: false };
    }
  },

  async deleteBranch(id: number): Promise<{ success: boolean }> {
    try {
      const response = await apiCall<{ success: boolean }>(`/branches/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Failed to delete branch:', error);
      return { success: false };
    }
  },

  // ========== REQUISITIONS ==========
  async getRequisitions(): Promise<Record<string, unknown>[]> {
    try {
      const response = await apiCall<{ success: boolean; requisitions: Record<string, unknown>[] }>(
        '/requisitions'
      );
      return response.requisitions || [];
    } catch (error) {
      console.error('Failed to fetch requisitions:', error);
      return [];
    }
  },

  async getRequisition(id: number): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiCall<{ success: boolean; requisition: Record<string, unknown> }>(
        `/requisitions/${id}`
      );
      return response.requisition || null;
    } catch (error) {
      console.error('Failed to fetch requisition:', error);
      return null;
    }
  },

  async submitRequisition(data: Record<string, unknown>): Promise<{ success: boolean; pdfUrl?: string; id?: number }> {
    try {
      const response = await apiCall<{ success: boolean; requisition_id: number }>(
        '/requisitions',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );
      return {
        success: response.success,
        id: response.requisition_id,
        pdfUrl: response.success ? `/api/requisitions/${response.requisition_id}/pdf` : undefined,
      };
    } catch (error) {
      console.error('Failed to submit requisition:', error);
      return { success: false };
    }
  },

  async updateRequisitionStatus(
    id: number,
    status: string
  ): Promise<{ success: boolean }> {
    try {
      const response = await apiCall<{ success: boolean }>(
        `/requisitions/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status }),
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to update requisition status:', error);
      return { success: false };
    }
  },

  async approveRequisition(id: number): Promise<{ success: boolean }> {
    try {
      return this.updateRequisitionStatus(id, 'approved');
    } catch (error) {
      console.error('Failed to approve requisition:', error);
      return { success: false };
    }
  },

  async rejectRequisition(id: number, reason: string): Promise<{ success: boolean }> {
    try {
      const response = await apiCall<{ success: boolean }>(
        `/requisitions/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
        }
      );
      return response;
    } catch (error) {
      console.error('Failed to reject requisition:', error);
      return { success: false };
    }
  },

  // ========== DASHBOARD ==========
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await apiCall<Record<string, unknown>>('/dashboard/stats');
      return {
        officeCount: (response.officeCount as number) || 0,
        specialCount: (response.specialCount as number) || 0,
        statusCounts: (response.statusCounts as Record<string, number>) || {
          'Pending': 0,
          'Approved': 0,
          'Completed': 0,
          'Rejected': 0,
        },
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      return mockDashboardStats;
    }
  },

  // ========== OFFICE REQUESTS ==========
  async getOfficeRequests(): Promise<BranchGroup[]> {
    try {
      const response = await apiCall<{ success: boolean; requests: BranchGroup[] }>(
        '/requisitions?type=office'
      );
      return response.requests || [];
    } catch (error) {
      console.error('Failed to fetch office requests:', error);
      return [];
    }
  },

  // ========== SPECIAL REQUESTS ==========
  async getSpecialRequests(): Promise<BranchGroup[]> {
    try {
      const response = await apiCall<{ success: boolean; requests: BranchGroup[] }>(
        '/requisitions?type=special'
      );
      return response.requests || [];
    } catch (error) {
      console.error('Failed to fetch special requests:', error);
      return [];
    }
  },

  // ========== REQUISITION ACTIONS ==========
  async approveRow(sheetName: string, rowNumber: number): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(
        '/requisition-items/approve',
        {
          method: 'PUT',
          body: JSON.stringify({ sheetName, rowNumber }),
        }
      );
      return response.success;
    } catch (error) {
      console.error('Failed to approve row:', error);
      return false;
    }
  },

  async deleteRow(sheetName: string, rowNumber: number): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(
        '/requisition-items',
        {
          method: 'DELETE',
          body: JSON.stringify({ sheetName, rowNumber }),
        }
      );
      return response.success;
    } catch (error) {
      console.error('Failed to delete row:', error);
      return false;
    }
  },

  async editQty(sheetName: string, rowNumber: number, newQty: number): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(
        '/requisition-items/qty',
        {
          method: 'PUT',
          body: JSON.stringify({ sheetName, rowNumber, quantity: newQty }),
        }
      );
      return response.success;
    } catch (error) {
      console.error('Failed to edit quantity:', error);
      return false;
    }
  },

  async batchApprove(rows: RequisitionItem[]): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(
        '/requisition-items/batch-approve',
        {
          method: 'PUT',
          body: JSON.stringify({ rows }),
        }
      );
      return response.success;
    } catch (error) {
      console.error('Failed to batch approve:', error);
      return false;
    }
  },

  async batchUpdateStatus(
    rows: RequisitionItem[],
    status: OfficeSupplyStatus | SpecialRequestStatus
  ): Promise<boolean> {
    try {
      const response = await apiCall<{ success: boolean }>(
        '/requisition-items/batch-update',
        {
          method: 'PUT',
          body: JSON.stringify({ rows, status }),
        }
      );
      return response.success;
    } catch (error) {
      console.error('Failed to batch update status:', error);
      return false;
    }
  },

  // ========== USERS ==========
  async getUsers(): Promise<Record<string, unknown>[]> {
    try {
      const response = await apiCall<{ success: boolean; users: Record<string, unknown>[] }>('/users');
      return response.users || [];
    } catch (error) {
      console.error('Failed to fetch users:', error);
      return [];
    }
  },

  async createUser(data: Record<string, unknown>): Promise<{ success: boolean; id?: number }> {
    try {
      const response = await apiCall<{ success: boolean; id: number }>('/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Failed to create user:', error);
      return { success: false };
    }
  },

  async updateUser(id: number, data: Record<string, unknown>): Promise<{ success: boolean }> {
    try {
      const response = await apiCall<{ success: boolean }>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Failed to update user:', error);
      return { success: false };
    }
  },

  async deleteUser(id: number): Promise<{ success: boolean }> {
    try {
      const response = await apiCall<{ success: boolean }>(`/users/${id}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      console.error('Failed to delete user:', error);
      return { success: false };
    }
  },

  // ========== AUTHENTICATION ==========
  async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: Record<string, unknown> }> {
    try {
      const response = await apiCall<{ success: boolean; token?: string; user?: Record<string, unknown> }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (response.success && response.token) {
        localStorage.setItem('requisition_token', response.token as string);
      }
      return response as { success: boolean; token?: string; user?: Record<string, unknown> };
    } catch (error) {
      console.error('Failed to login:', error);
      return { success: false };
    }
  },

  async logout(): Promise<{ success: boolean }> {
    try {
      localStorage.removeItem('requisition_token');
      return { success: true };
    } catch (error) {
      console.error('Failed to logout:', error);
      return { success: false };
    }
  },

  async getCurrentUser(): Promise<Record<string, unknown> | null> {
    try {
      const response = await apiCall<{ success: boolean; user: Record<string, unknown> }>('/auth/me');
      return response.user || null;
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      return null;
    }
  },
};