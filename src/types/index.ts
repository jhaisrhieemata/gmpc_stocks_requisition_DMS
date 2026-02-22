// User and Auth Types
export type UserRole = 'admin' | 'branch_manager' | 'credit_investigator' | 'accountant' | 'cashier' | 'receptionist' | 'mechanic';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branch?: string;
}

// Branch Classification Types
export type BranchClassification = 'Multibrand' | 'Yamaha 3S' | 'Parts & Accessories' | 'Service Center';

// Supplier Classification Types
export type SupplierClassification = 'Multibrand' | 'Yamaha 3S Only' | 'General Supplies' | 'Office Supplies';

// Supplier Types
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  classification?: SupplierClassification;
}

// Inventory Types with Supplier
export interface InventoryItem {
  itemId: string;
  supplierId: string;
  supplierName: string;
  date: string;
  description: string;
  unit: string;
  qty: number;
  unitPrice: number;
  amount: number;
  totalRunningStocks: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Critical';
  classification?: SupplierClassification;
}

// Request Status Types
export type OfficeSupplyStatus = 'Pending' | 'Approved' | 'No Stocks Available' | 'Petty Cash By Branch' | 'Cancelled';
export type SpecialRequestStatus = 'Pending' | 'Approved By Purchasing' | 'Approved By Accounting' | 'Petty Cash By Branch' | 'Cancelled' | 'To Purchased';

// Requisition Types
export interface RequisitionItem {
  id: string;
  qty: number;
  unit: string;
  description: string;
  uprice: number;
  amount: number;
  sheetName: string;
  rowNumber: number;
  status?: OfficeSupplyStatus | SpecialRequestStatus;
}

export interface BranchGroup {
  branch: string;
  total: number;
  rows: RequisitionItem[];
  type: 'office' | 'special';
}

export interface RequisitionForm {
  branch: string;
  date: string;
  to: string;
  purpose: 'OFFICE SUPPLIES' | 'SPECIAL REQUEST';
  items: RequisitionItem[];
  note: string;
  requestedBy: string;
  signature: string;
}

// Dashboard Stats
export interface DashboardStats {
  officeCount: number;
  specialCount: number;
  statusCounts: Record<string, number>;
  officeStatusCounts?: Record<string, number>;
  specialStatusCounts?: Record<string, number>;
}

// Branch Email Mapping
export const BRANCH_EMAIL_MAP: Record<string, string> = {
  'ADMIN': 'gmpcpurchasing@gmail.com',
  'WAREHOUSE': 'warehousegiant21@gmail.com',
  'LAGTANG': 'giantmotoprolagtang@gmail.com',
  'V-RAMA': 'gmpcguad_accounting@yahoo.com.ph',
  'BULACAO': 'ivyhamistoso@gmail.com',
  'Y3S TALISAY': 'gmpcyamaha3st@gmail.com',
  'MINGLANILLA': 'giantmotoprolinao@gmail.com',
  'Y3S PARDO': 'gmpcy3spardo@yahoo.com',
  'LAPU-LAPU': 'giantmotoproopon19@gmail.com',
  'BACAYAN': 'gmpcbacayan@gmail.com',
  'SAN FERNANDO MB': 'gmpcsanfernando@gmail.com',
  'Y3S SAN FERNANDO': 'sanfernandoyamaha3s@gmail.com',
  'LILOAN': 'gmpctayud@gmail.com',
  'CORDOVA MB': 'gmpccordova@gmail.com',
  'Y3S CORDOVA': 'gmpccordovay3s@gmail.com',
  'CLARIN': 'gmpcclarin@gmail.com',
  'TOLEDO': 'giantmotopro_corporation@yahoo.com.ph',
  'UBAY': 'gmpcubay@gmail.com',
  'CARMEN': 'gmpccarmenbh@gmail.com',
  'TUBIGON': 'gmpctubigon@gmail.com',
  'TALIBON': 'gmpctalibon@gmail.com',
  'BOGO': 'gmpcbogo@gmail.com',
  'BALAMBAN': 'gmpcbalamban@gmail.com',
  'Y3S BARILI': 'yamaha3sbarili@gmail.com',
  'BARILI MB': 'giantmotoprobarilibranch@gmail.com',
  'SIERRA BULLONES': 'gmpcsierra@gmail.com',
  'PITOGO': 'gmpcpitogo@gmail.com',
  'TAYUD CONSOLACION': 'gmpctayudconsolacion@gmail.com',
  'PINAMUNGAJAN': 'gmpcpinamungajan22@gmail.com',
  'CANDIJAY': 'giantcandijay@gmail.com',
  'YATI LILOAN': 'gmpcyatililoan@gmail.com',
};

// Branch classification mapping
export const BRANCH_CLASSIFICATION_MAP: Record<string, BranchClassification> = {
  'Y3S TALISAY': 'Yamaha 3S',
  'Y3S PARDO': 'Yamaha 3S',
  'Y3S SAN FERNANDO': 'Yamaha 3S',
  'Y3S CORDOVA': 'Yamaha 3S',
  'Y3S BARILI': 'Yamaha 3S',
};

export const BRANCHES = Object.keys(BRANCH_EMAIL_MAP);

export const BRANCH_CLASSIFICATIONS: BranchClassification[] = [
  'Multibrand',
  'Yamaha 3S',
  'Parts & Accessories',
  'Service Center',
];

export const SUPPLIER_CLASSIFICATIONS: SupplierClassification[] = [
  'Multibrand',
  'Yamaha 3S Only',
  'General Supplies',
  'Office Supplies',
];

export const BRANCH_ROLES: UserRole[] = [
  'branch_manager',
  'credit_investigator',
  'accountant',
  'cashier',
  'receptionist',
  'mechanic',
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  branch_manager: 'Branch Manager',
  credit_investigator: 'Credit Investigator',
  accountant: 'Accountant',
  cashier: 'Cashier',
  receptionist: 'Receptionist',
  mechanic: 'Mechanic',
};

export function getEmailForBranch(branch: string): string {
  if (!branch) return BRANCH_EMAIL_MAP['ADMIN'];
  const upper = branch.toUpperCase().trim();
  return BRANCH_EMAIL_MAP[upper] || BRANCH_EMAIL_MAP['ADMIN'];
}

export function formatCurrency(num: number): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function generateItemId(supplierId: string, index: number): string {
  const prefix = supplierId.substring(0, 3).toUpperCase();
  const num = String(index + 1).padStart(4, '0');
  return `${prefix}-${num}`;
}

// Unit pluralization
export const UNIT_PLURAL_MAP: Record<string, string> = {
  REAM: 'REAMS',
  PC: 'PCS',
  PAD: 'PADS',
  BOX: 'BOXES',
  PACK: 'PACKS',
  BDL: 'BDLS',
  BTL: 'BTLS',
  ROLL: 'ROLLS',
  SET: 'SETS',
  UNIT: 'UNITS',
};

// Reverse map for de-pluralization
export const UNIT_SINGULAR_MAP: Record<string, string> = {
  REAMS: 'REAM',
  PCS: 'PC',
  PADS: 'PAD',
  BOXES: 'BOX',
  PACKS: 'PACK',
  BDLS: 'BDL',
  BTLS: 'BTL',
  ROLLS: 'ROLL',
  SETS: 'SET',
  UNITS: 'UNIT',
};

export function getPluralUnit(unit: string, qty: number): string {
  const upperUnit = unit.toUpperCase();
  if (qty > 1) {
    return UNIT_PLURAL_MAP[upperUnit] || unit;
  } else {
    // Return singular
    return UNIT_SINGULAR_MAP[upperUnit] || upperUnit;
  }
}