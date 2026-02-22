import { InventoryItem, BranchGroup, RequisitionItem, DashboardStats, Supplier, OfficeSupplyStatus, SpecialRequestStatus, SupplierClassification } from '@/types';

// Express/MySQL Backend API Configuration
// Backend Server: http://localhost:3000
// API base URL configured for Express server
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mock Suppliers with classification
export const mockSuppliers: Supplier[] = [
  { id: 'SUP001', name: 'Office Depot', contactPerson: 'John Smith', phone: '09171234567', email: 'sales@officedepot.com', classification: 'Office Supplies' },
  { id: 'SUP002', name: 'National Bookstore', contactPerson: 'Maria Garcia', phone: '09181234567', email: 'wholesale@nationalbookstore.com', classification: 'General Supplies' },
  { id: 'SUP003', name: 'CDR King', contactPerson: 'Pedro Santos', phone: '09191234567', email: 'business@cdrking.com', classification: 'Multibrand' },
  { id: 'SUP004', name: 'Yamaha Parts Center', contactPerson: 'Ana Reyes', phone: '09201234567', email: 'parts@yamaha.com', classification: 'Yamaha 3S Only' },
];

// Mock inventory with supplier data and classification
export const mockInventory: InventoryItem[] = [
  { itemId: 'OFD-0001', supplierId: 'SUP001', supplierName: 'Office Depot', date: '2024-01-15', description: 'Bond Paper A4 (500 sheets)', unit: 'REAM', qty: 50, unitPrice: 250, amount: 12500, totalRunningStocks: 150, status: 'In Stock', classification: 'Office Supplies' },
  { itemId: 'OFD-0002', supplierId: 'SUP001', supplierName: 'Office Depot', date: '2024-01-15', description: 'Ballpen Black (12 pcs)', unit: 'BOX', qty: 20, unitPrice: 120, amount: 2400, totalRunningStocks: 45, status: 'In Stock', classification: 'Office Supplies' },
  { itemId: 'NAT-0001', supplierId: 'SUP002', supplierName: 'National Bookstore', date: '2024-01-16', description: 'Stapler #35', unit: 'PC', qty: 10, unitPrice: 350, amount: 3500, totalRunningStocks: 8, status: 'Low Stock', classification: 'General Supplies' },
  { itemId: 'NAT-0002', supplierId: 'SUP002', supplierName: 'National Bookstore', date: '2024-01-16', description: 'Staple Wire #35', unit: 'BOX', qty: 30, unitPrice: 85, amount: 2550, totalRunningStocks: 25, status: 'In Stock', classification: 'General Supplies' },
  { itemId: 'CDR-0001', supplierId: 'SUP003', supplierName: 'CDR King', date: '2024-01-17', description: 'Yellow Pad 1/2', unit: 'PAD', qty: 50, unitPrice: 45, amount: 2250, totalRunningStocks: 0, status: 'Out of Stock', classification: 'Multibrand' },
  { itemId: 'CDR-0002', supplierId: 'SUP003', supplierName: 'CDR King', date: '2024-01-17', description: 'Correction Tape', unit: 'PC', qty: 40, unitPrice: 65, amount: 2600, totalRunningStocks: 30, status: 'In Stock', classification: 'Multibrand' },
  { itemId: 'OFD-0003', supplierId: 'SUP001', supplierName: 'Office Depot', date: '2024-01-18', description: 'Folder Long Brown', unit: 'PC', qty: 100, unitPrice: 15, amount: 1500, totalRunningStocks: 200, status: 'In Stock', classification: 'Office Supplies' },
  { itemId: 'NAT-0003', supplierId: 'SUP002', supplierName: 'National Bookstore', date: '2024-01-18', description: 'Marker Permanent Black', unit: 'PC', qty: 24, unitPrice: 45, amount: 1080, totalRunningStocks: 3, status: 'Critical', classification: 'General Supplies' },
  { itemId: 'CDR-0003', supplierId: 'SUP003', supplierName: 'CDR King', date: '2024-01-19', description: 'Scissors 8"', unit: 'PC', qty: 10, unitPrice: 120, amount: 1200, totalRunningStocks: 5, status: 'Low Stock', classification: 'Multibrand' },
  { itemId: 'OFD-0004', supplierId: 'SUP001', supplierName: 'Office Depot', date: '2024-01-19', description: 'Masking Tape 1"', unit: 'ROLL', qty: 50, unitPrice: 55, amount: 2750, totalRunningStocks: 40, status: 'In Stock', classification: 'Office Supplies' },
  { itemId: 'YAM-0001', supplierId: 'SUP004', supplierName: 'Yamaha Parts Center', date: '2024-01-20', description: 'Yamaha Oil 1L', unit: 'BTL', qty: 100, unitPrice: 450, amount: 45000, totalRunningStocks: 80, status: 'In Stock', classification: 'Yamaha 3S Only' },
];

export const mockOfficeRequests: BranchGroup[] = [
  {
    branch: 'LAGTANG',
    total: 3,
    type: 'office',
    rows: [
      { id: '1', qty: 5, unit: 'REAM', description: 'Bond Paper A4', uprice: 250, amount: 1250, sheetName: 'Office Supplies', rowNumber: 2, status: 'Pending' as OfficeSupplyStatus },
      { id: '2', qty: 2, unit: 'BOX', description: 'Ballpen Black', uprice: 120, amount: 240, sheetName: 'Office Supplies', rowNumber: 3, status: 'Pending' as OfficeSupplyStatus },
      { id: '3', qty: 1, unit: 'PC', description: 'Stapler #35', uprice: 350, amount: 350, sheetName: 'Office Supplies', rowNumber: 4, status: 'Approved' as OfficeSupplyStatus },
    ],
  },
  {
    branch: 'BACAYAN',
    total: 2,
    type: 'office',
    rows: [
      { id: '4', qty: 10, unit: 'PAD', description: 'Yellow Pad', uprice: 45, amount: 450, sheetName: 'Office Supplies', rowNumber: 5, status: 'No Stocks Available' as OfficeSupplyStatus },
      { id: '5', qty: 5, unit: 'PC', description: 'Correction Tape', uprice: 65, amount: 325, sheetName: 'Office Supplies', rowNumber: 6, status: 'Pending' as OfficeSupplyStatus },
    ],
  },
  {
    branch: 'TOLEDO',
    total: 4,
    type: 'office',
    rows: [
      { id: '6', qty: 3, unit: 'REAM', description: 'Bond Paper Legal', uprice: 280, amount: 840, sheetName: 'Office Supplies', rowNumber: 7, status: 'Pending' as OfficeSupplyStatus },
      { id: '7', qty: 1, unit: 'BOX', description: 'Staple Wire', uprice: 85, amount: 85, sheetName: 'Office Supplies', rowNumber: 8, status: 'Petty Cash By Branch' as OfficeSupplyStatus },
      { id: '8', qty: 2, unit: 'ROLL', description: 'Masking Tape', uprice: 55, amount: 110, sheetName: 'Office Supplies', rowNumber: 9, status: 'Pending' as OfficeSupplyStatus },
      { id: '9', qty: 6, unit: 'PC', description: 'Marker Black', uprice: 45, amount: 270, sheetName: 'Office Supplies', rowNumber: 10, status: 'Cancelled' as OfficeSupplyStatus },
    ],
  },
];

export const mockSpecialRequests: BranchGroup[] = [
  {
    branch: 'MINGLANILLA',
    total: 2,
    type: 'special',
    rows: [
      { id: '10', qty: 1, unit: 'UNIT', description: 'Office Chair Ergonomic', uprice: 8500, amount: 8500, sheetName: 'Special Request', rowNumber: 2, status: 'Pending' as SpecialRequestStatus },
      { id: '11', qty: 2, unit: 'SET', description: 'Computer Mouse + Keyboard', uprice: 1200, amount: 2400, sheetName: 'Special Request', rowNumber: 3, status: 'Approved By Purchasing' as SpecialRequestStatus },
    ],
  },
  {
    branch: 'BOGO',
    total: 1,
    type: 'special',
    rows: [
      { id: '12', qty: 1, unit: 'UNIT', description: 'Air Conditioning Unit 1HP', uprice: 25000, amount: 25000, sheetName: 'Special Request', rowNumber: 4, status: 'To Purchased' as SpecialRequestStatus },
    ],
  },
];

export const mockDashboardStats: DashboardStats = {
  officeCount: 9,
  specialCount: 3,
  statusCounts: {
    'Pending': 12,
    'Approved': 45,
    'Completed': 120,
    'Rejected': 8,
  },
};

// API function placeholders - Replace with actual PHP endpoints when ready
export const api = {
  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    // TODO: Replace with actual PHP API call
    // return fetch(`${API_BASE_URL}/suppliers.php`).then(r => r.json());
    await new Promise(r => setTimeout(r, 300));
    return mockSuppliers;
  },

  async addSupplier(supplier: Omit<Supplier, 'id'>): Promise<Supplier> {
    // TODO: Replace with actual PHP API call
    // return fetch(`${API_BASE_URL}/suppliers.php`, { method: 'POST', body: JSON.stringify(supplier) }).then(r => r.json());
    await new Promise(r => setTimeout(r, 500));
    const newSupplier = { ...supplier, id: `SUP${String(mockSuppliers.length + 1).padStart(3, '0')}` };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  },

  async updateSupplier(supplier: Supplier): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    const index = mockSuppliers.findIndex(s => s.id === supplier.id);
    if (index >= 0) {
      mockSuppliers[index] = supplier;
      return true;
    }
    return false;
  },

  async deleteSupplier(id: string): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    const index = mockSuppliers.findIndex(s => s.id === id);
    if (index >= 0) {
      mockSuppliers.splice(index, 1);
      return true;
    }
    return false;
  },

  // Dashboard data
  async getDashboardStats(): Promise<DashboardStats> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    return mockDashboardStats;
  },

  async getInventory(): Promise<InventoryItem[]> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    return mockInventory;
  },

  async getInventoryBySupplier(supplierId: string): Promise<InventoryItem[]> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    return mockInventory.filter(i => i.supplierId === supplierId);
  },

  async getOfficeRequests(): Promise<BranchGroup[]> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    return mockOfficeRequests;
  },

  async getSpecialRequests(): Promise<BranchGroup[]> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    return mockSpecialRequests;
  },

  // Actions
  async approveRow(sheetName: string, rowNumber: number): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    console.log('Approving:', sheetName, rowNumber);
    return true;
  },

  async deleteRow(sheetName: string, rowNumber: number): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    console.log('Deleting:', sheetName, rowNumber);
    return true;
  },

  async editQty(sheetName: string, rowNumber: number, newQty: number): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    console.log('Editing:', sheetName, rowNumber, newQty);
    return true;
  },

  async batchApprove(rows: RequisitionItem[]): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 800));
    console.log('Batch approving:', rows.length, 'items');
    return true;
  },

  async batchUpdateStatus(rows: RequisitionItem[], status: OfficeSupplyStatus | SpecialRequestStatus): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 800));
    console.log('Batch updating status:', rows.length, 'items to', status);
    return true;
  },

  // Inventory management
  async addInventoryItem(item: Omit<InventoryItem, 'itemId'>): Promise<InventoryItem> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    const supplierItems = mockInventory.filter(i => i.supplierId === item.supplierId);
    const prefix = item.supplierName.substring(0, 3).toUpperCase();
    const newItem: InventoryItem = {
      ...item,
      itemId: `${prefix}-${String(supplierItems.length + 1).padStart(4, '0')}`,
    };
    mockInventory.push(newItem);
    return newItem;
  },

  async updateInventoryItem(item: InventoryItem): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    const index = mockInventory.findIndex(i => i.itemId === item.itemId);
    if (index >= 0) {
      mockInventory[index] = item;
      return true;
    }
    return false;
  },

  async deleteInventoryItem(itemId: string): Promise<boolean> {
    // TODO: Replace with actual PHP API call
    await new Promise(r => setTimeout(r, 500));
    const index = mockInventory.findIndex(i => i.itemId === itemId);
    if (index >= 0) {
      mockInventory.splice(index, 1);
      return true;
    }
    return false;
  },

  // Requisition form
  async submitRequisition(data: any): Promise<{ success: boolean; pdfUrl?: string }> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/requisitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        return { success: true, pdfUrl: '#' };
      }
      return { success: false };
    } catch (error) {
      console.error('Error submitting requisition:', error);
      return { success: false };
    }
  },

  // Branches API
  async getBranches(): Promise<any[]> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return result.branches || [];
    } catch (error) {
      console.error('Error fetching branches:', error);
      return [];
    }
  },

  async createBranch(data: any): Promise<{ success: boolean; id?: number }> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/branches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating branch:', error);
      return { success: false };
    }
  },

  // Suppliers API
  async getSuppliers(): Promise<any[]> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return result.suppliers || [];
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  },

  async createSupplier(data: any): Promise<{ success: boolean; id?: number }> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/suppliers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating supplier:', error);
      return { success: false };
    }
  },

  // Inventory API
  async getInventoryFromAPI(): Promise<any[]> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return result.inventory || [];
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return mockInventory; // Fallback to mock data
    }
  },

  async createInventoryItem(data: any): Promise<{ success: boolean; id?: number }> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating inventory item:', error);
      return { success: false };
    }
  },

  // Requisitions API
  async getRequisitions(): Promise<any[]> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/requisitions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return result.requisitions || [];
    } catch (error) {
      console.error('Error fetching requisitions:', error);
      return [];
    }
  },

  async getRequisition(id: number): Promise<any | null> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/requisitions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      return result.requisition || null;
    } catch (error) {
      console.error('Error fetching requisition:', error);
      return null;
    }
  },

  async updateRequisitionStatus(id: number, status: string): Promise<{ success: boolean }> {
    try {
      const token = localStorage.getItem('requisition_token');
      const response = await fetch(`${API_BASE_URL}/requisitions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating requisition:', error);
      return { success: false };
    }
  },
};