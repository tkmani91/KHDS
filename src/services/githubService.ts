// GitHub Data Service
// This service handles all data storage and retrieval from GitHub

const GITHUB_CONFIG = {
  OWNER: 'YOUR_GITHUB_USERNAME', // Replace with your GitHub username
  REPO: 'khs-data', // Repository name for data storage
  BRANCH: 'main',
  DATA_FILE: 'database.json',
};

// Data structure
export interface Database {
  members: Member[];
  pujas: Puja[];
  contributions: Contribution[];
  income: OtherIncome[];
  expenses: Expense[];
  notices: Notice[];
  users: User[];
  lastUpdated: string;
}

// Types
export interface User {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'viewer';
  name: string;
  createdAt: string;
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

// Default empty database
const getDefaultDatabase = (): Database => ({
  members: [],
  pujas: [],
  contributions: [],
  income: [],
  expenses: [],
  notices: [],
  users: [
    {
      id: '1',
      username: 'tkmani91',
      password: 'tkmani91',
      role: 'admin',
      name: 'অ্যাডমিন',
      createdAt: new Date().toISOString(),
    },
  ],
  lastUpdated: new Date().toISOString(),
});

class GitHubService {
  private token: string = '';
  private cache: Database | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute cache

  // Initialize with GitHub token
  initialize(token: string) {
    this.token = token;
    // Save token to localStorage for persistence
    localStorage.setItem('github_token', token);
  }

  // Check if initialized
  isInitialized(): boolean {
    if (!this.token) {
      const savedToken = localStorage.getItem('github_token');
      if (savedToken) {
        this.token = savedToken;
        return true;
      }
      return false;
    }
    return true;
  }

  // Get token
  getToken(): string {
    return this.token || localStorage.getItem('github_token') || '';
  }

  // Clear token
  clearToken() {
    this.token = '';
    this.cache = null;
    localStorage.removeItem('github_token');
  }

  // Fetch database from GitHub
  async fetchDatabase(): Promise<Database> {
    // Check cache
    if (this.cache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    if (!this.isInitialized()) {
      throw new Error('GitHub token not set');
    }

    try {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.DATA_FILE}?ref=${GITHUB_CONFIG.BRANCH}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.status === 404) {
        // File doesn't exist, create it
        const defaultDb = getDefaultDatabase();
        await this.saveDatabase(defaultDb);
        this.cache = defaultDb;
        this.lastFetch = Date.now();
        return defaultDb;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      const content = atob(data.content);
      const database: Database = JSON.parse(content);
      
      // Ensure all arrays exist
      database.members = database.members || [];
      database.pujas = database.pujas || [];
      database.contributions = database.contributions || [];
      database.income = database.income || [];
      database.expenses = database.expenses || [];
      database.notices = database.notices || [];
      database.users = database.users || getDefaultDatabase().users;

      this.cache = database;
      this.lastFetch = Date.now();
      return database;
    } catch (error) {
      console.error('Error fetching database:', error);
      // Return default database on error
      return getDefaultDatabase();
    }
  }

  // Save database to GitHub
  async saveDatabase(database: Database): Promise<boolean> {
    if (!this.isInitialized()) {
      throw new Error('GitHub token not set');
    }

    try {
      // Update lastUpdated
      database.lastUpdated = new Date().toISOString();

      // First, get the current file to get the SHA
      const getResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.DATA_FILE}?ref=${GITHUB_CONFIG.BRANCH}`,
        {
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      let sha: string | undefined;
      if (getResponse.ok) {
        const data = await getResponse.json();
        sha = data.sha;
      }

      // Create or update file
      const content = btoa(JSON.stringify(database, null, 2));
      const body: { message: string; content: string; sha?: string; branch: string } = {
        message: `Update database - ${new Date().toLocaleString('bn-BD')}`,
        content,
        branch: GITHUB_CONFIG.BRANCH,
      };

      if (sha) {
        body.sha = sha;
      }

      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_CONFIG.OWNER}/${GITHUB_CONFIG.REPO}/contents/${GITHUB_CONFIG.DATA_FILE}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `token ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      // Update cache
      this.cache = database;
      this.lastFetch = Date.now();

      return true;
    } catch (error) {
      console.error('Error saving database:', error);
      return false;
    }
  }

  // Auto sync - save to GitHub every 30 seconds if there are changes
  private autoSyncInterval: number | null = null;
  private pendingChanges: boolean = false;

  startAutoSync(callback: () => Promise<Database>) {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }

    this.autoSyncInterval = window.setInterval(async () => {
      if (this.pendingChanges) {
        const db = await callback();
        await this.saveDatabase(db);
        this.pendingChanges = false;
      }
    }, 30000); // 30 seconds
  }

  stopAutoSync() {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  markPendingChanges() {
    this.pendingChanges = true;
  }

  // User authentication
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const db = await this.fetchDatabase();
    const user = db.users.find(
      (u) => u.username === username && u.password === password
    );
    return user || null;
  }

  // Create new user
  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User | null> {
    const db = await this.fetchDatabase();
    
    // Check if username exists
    if (db.users.some((u) => u.username === userData.username)) {
      return null;
    }

    const newUser: User = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    await this.saveDatabase(db);
    return newUser;
  }

  // Helper method to generate unique IDs
  generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

// Export singleton instance
export const githubService = new GitHubService();

// Export default database structure
export { getDefaultDatabase };
