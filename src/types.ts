// Types for the entire application

export type UserRole = 'admin' | 'viewer';

export interface User {
  username: string;
  role: UserRole;
}

export interface Member {
  id: string;
  name: string;
  designation: string;
  phone: string;
  address: string;
  photo?: string;
  createdAt: string;
}

export type PujaType = 'শ্যামা পূজা' | 'স্বরসতী পূজা' | 'দূর্গা পূজা' | 'অন্যান্য';

export interface Puja {
  id: string;
  name: string;
  type: PujaType;
  budget: number;
  date: string;
  description: string;
  createdAt: string;
}

export type PaymentStatus = 'পরিশোধিত' | 'বকেয়া' | 'অতিরিক্ত বকেয়া';
export type PaymentMethod = 'নগদ' | 'অনলাইন' | 'চেক';

export interface Contribution {
  id: string;
  memberId: string;
  pujaId: string;
  amount: number;
  paidAmount: number;
  status: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
}

export type IncomeType = 'দান' | 'স্পনসরশিপ' | 'সরকারি অনুদান' | 'অন্যান্য';

export interface OtherIncome {
  id: string;
  type: IncomeType;
  source: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export type ExpenseCategory = 'প্রতিমা' | 'মণ্ডপ' | 'পুজো সামগ্রী' | 'খাবার' | 'আলোকসজ্জা' | 'বাজনা' | 'অন্যান্য';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  receiptNo?: string;
  pujaId?: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  date: string;
  isImportant: boolean;
  createdAt: string;
}

export type TabType = 
  | 'dashboard' 
  | 'members' 
  | 'pujas' 
  | 'contributions' 
  | 'income' 
  | 'expenses' 
  | 'notices' 
  | 'reports';

export interface DashboardStats {
  totalMembers: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  totalContributionsExpected: number;
  totalContributionsReceived: number;
  totalContributionsPending: number;
}

export interface ContributionSummary {
  memberId: string;
  memberName: string;
  totalExpected: number;
  totalPaid: number;
  totalPending: number;
}

export interface PujaExpenseSummary {
  pujaId: string;
  pujaName: string;
  totalExpenses: number;
}
