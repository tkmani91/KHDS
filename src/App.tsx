import { useEffect, useMemo, useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Users,
  Calendar,
  Wallet,
  DollarSign,
  Receipt,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  Download,
  Eye,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  Menu,
  Github,
  RefreshCw,
  Cloud,
  CloudOff,
  Check,
} from 'lucide-react';
import { GitHubSetup } from './components/GitHubSetup';
import { githubService } from './services/githubService';
import type {
  Contribution,
  DashboardStats,
  Expense,
  ExpenseCategory,
  IncomeType,
  Member,
  Notice,
  OtherIncome,
  PaymentMethod,
  PaymentStatus,
  Puja,
  PujaType,
  TabType,
  User,
} from './types';

// Storage keys
const STORAGE_KEYS = {
  USER: 'khs_user',
  DATA: 'khs_data',
  GITHUB_SETUP: 'khs_github_setup',
};

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 15);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

// LocalStorage helpers
const saveToStorage = (key: string, data: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Error loading from localStorage:', e);
    return defaultValue;
  }
};

// Main App Component
export function App() {
  // GitHub setup state
  const [showGitHubSetup, setShowGitHubSetup] = useState(false);
  const [isGitHubMode, setIsGitHubMode] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Data state
  const [members, setMembers] = useState<Member[]>([]);
  const [pujas, setPujas] = useState<Puja[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [income, setIncome] = useState<OtherIncome[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check GitHub mode on mount
  useEffect(() => {
    const githubInitialized = githubService.isInitialized();
    setIsGitHubMode(githubInitialized);
    
    // Check if first time
    const hasSeenSetup = loadFromStorage(STORAGE_KEYS.GITHUB_SETUP, false);
    if (!hasSeenSetup && !githubInitialized) {
      setShowGitHubSetup(true);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        if (isGitHubMode && githubService.isInitialized()) {
          // Load from GitHub
          const db = await githubService.fetchDatabase();
          setMembers(db.members || []);
          setPujas(db.pujas || []);
          setContributions(db.contributions || []);
          setIncome(db.income || []);
          setExpenses(db.expenses || []);
          setNotices(db.notices || []);
        } else {
          // Load from localStorage
          const savedData = loadFromStorage<{
            members: Member[];
            pujas: Puja[];
            contributions: Contribution[];
            income: OtherIncome[];
            expenses: Expense[];
            notices: Notice[];
          }>(STORAGE_KEYS.DATA, {
            members: [],
            pujas: [],
            contributions: [],
            income: [],
            expenses: [],
            notices: [],
          });
          
          setMembers(savedData.members);
          setPujas(savedData.pujas);
          setContributions(savedData.contributions);
          setIncome(savedData.income);
          setExpenses(savedData.expenses);
          setNotices(savedData.notices);
        }
        
        // Load user
        const savedUser = loadFromStorage<User | null>(STORAGE_KEYS.USER, null);
        if (savedUser) {
          setUser(savedUser);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isGitHubMode]);

  // Save data when changes occur
  useEffect(() => {
    if (!isLoading) {
      const dataToSave = {
        members,
        pujas,
        contributions,
        income,
        expenses,
        notices,
      };
      
      // Always save to localStorage as backup
      saveToStorage(STORAGE_KEYS.DATA, dataToSave);
      
      // If GitHub mode, also save to GitHub
      if (isGitHubMode && githubService.isInitialized()) {
        const syncToGitHub = async () => {
          setSyncStatus('syncing');
          const success = await githubService.saveDatabase({
            ...dataToSave,
            users: [{ id: '1', username: 'tkmani91', password: 'tkmani91', role: 'admin', name: 'অ্যাডমিন', createdAt: new Date().toISOString() }],
            lastUpdated: new Date().toISOString(),
          });
          setSyncStatus(success ? 'success' : 'error');
          setTimeout(() => setSyncStatus('idle'), 2000);
        };
        
        // Debounce sync
        const timeout = setTimeout(syncToGitHub, 1000);
        return () => clearTimeout(timeout);
      }
    }
  }, [members, pujas, contributions, income, expenses, notices, isLoading, isGitHubMode]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.USER, user);
  }, [user]);

  // Auth handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'tkmani91' && loginForm.password === 'tkmani91') {
      const newUser: User = { username: loginForm.username, role: 'admin' };
      setUser(newUser);
      setLoginError('');
    } else {
      setLoginError('ভুল ইউজারনেম বা পাসওয়ার্ড!');
    }
  };

  const handleViewerAccess = () => {
    setUser({ username: 'viewer', role: 'viewer' });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  // Dashboard stats
  const dashboardStats: DashboardStats = useMemo(() => {
    const totalMembers = members.length;
    const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalContributionsExpected = contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalContributionsReceived = contributions.reduce((sum, c) => sum + c.paidAmount, 0);
    const totalContributionsPending = totalContributionsExpected - totalContributionsReceived;
    const balance = totalIncome + totalContributionsReceived - totalExpenses;

    return {
      totalMembers,
      totalIncome,
      totalExpenses,
      balance,
      totalContributionsExpected,
      totalContributionsReceived,
      totalContributionsPending,
    };
  }, [members, income, expenses, contributions]);

  // Manual sync handler
  const handleManualSync = async () => {
    if (!isGitHubMode) return;
    
    setSyncStatus('syncing');
    const dataToSave = {
      members,
      pujas,
      contributions,
      income,
      expenses,
      notices,
    };
    
    const success = await githubService.saveDatabase({
      ...dataToSave,
      users: [{ id: '1', username: 'tkmani91', password: 'tkmani91', role: 'admin', name: 'অ্যাডমিন', createdAt: new Date().toISOString() }],
      lastUpdated: new Date().toISOString(),
    });
    
    setSyncStatus(success ? 'success' : 'error');
    setTimeout(() => setSyncStatus('idle'), 2000);
  };

  // GitHub setup complete
  const handleGitHubSetupComplete = () => {
    saveToStorage(STORAGE_KEYS.GITHUB_SETUP, true);
    setShowGitHubSetup(false);
    setIsGitHubMode(githubService.isInitialized());
  };

  // Show GitHub setup
  if (showGitHubSetup) {
    return <GitHubSetup onSetupComplete={handleGitHubSetupComplete} />;
  }

  // Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutDashboard className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">কলম হিন্দু ধর্মসভা</h1>
            <p className="text-gray-600 mt-2">ম্যানেজমেন্ট অ্যাপ</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ইউজারনেম</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="ইউজারনেম লিখুন"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">পাসওয়ার্ড</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="পাসওয়ার্ড লিখুন"
              />
            </div>
            {loginError && (
              <div className="text-red-500 text-sm text-center">{loginError}</div>
            )}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              লগইন
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
            <button
              onClick={handleViewerAccess}
              className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              শুধু দেখার অনুমতি (লগইন ছাড়া)
            </button>
            
            {!isGitHubMode && (
              <button
                onClick={() => setShowGitHubSetup(true)}
                className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" />
                GitHub-এ সংযোগ করুন
              </button>
            )}
          </div>

          <div className="mt-4 text-center text-xs text-gray-500">
            <p>Admin: tkmani91 / tkmani91</p>
            {isGitHubMode && (
              <p className="flex items-center justify-center gap-1 mt-1 text-green-600">
                <Cloud className="w-3 h-3" />
                GitHub সংযুক্ত
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Navigation items
  const navItems: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'members', label: 'সদস্য ব্যবস্থাপনা', icon: Users },
    { id: 'pujas', label: 'পূজা ব্যবস্থাপনা', icon: Calendar },
    { id: 'contributions', label: 'চাঁদা ব্যবস্থাপনা', icon: Wallet },
    { id: 'income', label: 'অন্যান্য আয়', icon: DollarSign },
    { id: 'expenses', label: 'ব্যয় ব্যবস্থাপনা', icon: Receipt },
    { id: 'notices', label: 'নোটিস বোর্ড', icon: Bell },
    { id: 'reports', label: 'রিপোর্ট ও PDF', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800 text-lg">কলম হিন্দু</h1>
                <p className="text-xs text-gray-500">ধর্মসভা</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-700 hover:bg-orange-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200">
            {/* Sync Status */}
            {isGitHubMode && (
              <div className="mb-4 px-4">
                <button
                  onClick={handleManualSync}
                  disabled={syncStatus === 'syncing'}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    syncStatus === 'success' 
                      ? 'bg-green-100 text-green-700' 
                      : syncStatus === 'error'
                      ? 'bg-red-100 text-red-700'
                      : syncStatus === 'syncing'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {syncStatus === 'syncing' ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : syncStatus === 'success' ? (
                    <Check className="w-4 h-4" />
                  ) : syncStatus === 'error' ? (
                    <CloudOff className="w-4 h-4" />
                  ) : (
                    <Cloud className="w-4 h-4" />
                  )}
                  {syncStatus === 'syncing' 
                    ? 'সিঙ্ক হচ্ছে...' 
                    : syncStatus === 'success' 
                    ? 'সিঙ্ক সম্পূর্ণ' 
                    : syncStatus === 'error'
                    ? 'সিঙ্ক ব্যর্থ'
                    : 'GitHub-এ সিঙ্ক করুন'}
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4 px-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{user.username}</p>
                <p className="text-xs text-gray-500">{user.role === 'admin' ? 'অ্যাডমিন' : 'ভিউয়ার'}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">লগআউট</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-800">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
            <div className="w-10" />
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6">
          {activeTab === 'dashboard' && (
            <DashboardTab
              stats={dashboardStats}
              pujas={pujas}
              notices={notices}
              income={income}
              expenses={expenses}
              onNavigate={setActiveTab}
            />
          )}
          {activeTab === 'members' && (
            <MembersTab
              members={members}
              setMembers={setMembers}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'pujas' && (
            <PujasTab
              pujas={pujas}
              setPujas={setPujas}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'contributions' && (
            <ContributionsTab
              contributions={contributions}
              setContributions={setContributions}
              members={members}
              pujas={pujas}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'income' && (
            <IncomeTab
              income={income}
              setIncome={setIncome}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpensesTab
              expenses={expenses}
              setExpenses={setExpenses}
              pujas={pujas}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'notices' && (
            <NoticesTab
              notices={notices}
              setNotices={setNotices}
              isAdmin={isAdmin}
            />
          )}
          {activeTab === 'reports' && (
            <ReportsTab
              members={members}
              contributions={contributions}
              pujas={pujas}
              income={income}
              expenses={expenses}
            />
          )}
        </div>
      </main>
    </div>
  );
}

// Dashboard Tab Component
function DashboardTab({
  stats,
  pujas,
  notices,
  income,
  expenses,
  onNavigate,
}: {
  stats: DashboardStats;
  pujas: Puja[];
  notices: Notice[];
  income: OtherIncome[];
  expenses: Expense[];
  onNavigate: (tab: TabType) => void;
}) {
  const upcomingPujas = pujas
    .filter((p) => new Date(p.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const importantNotices = notices
    .filter((n) => n.isImportant)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const recentTransactions = [
    ...income.map((i) => ({ ...i, type: 'income' as const })),
    ...expenses.map((e) => ({ ...e, type: 'expense' as const })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="মোট সদস্য"
          value={stats.totalMembers}
          icon={Users}
          color="blue"
          onClick={() => onNavigate('members')}
        />
        <StatCard
          title="মোট আয়"
          value={formatCurrency(stats.totalIncome + stats.totalContributionsReceived)}
          icon={TrendingUp}
          color="green"
          onClick={() => onNavigate('income')}
        />
        <StatCard
          title="মোট ব্যয়"
          value={formatCurrency(stats.totalExpenses)}
          icon={TrendingDown}
          color="red"
          onClick={() => onNavigate('expenses')}
        />
        <StatCard
          title="ব্যালেন্স"
          value={formatCurrency(stats.balance)}
          icon={Wallet}
          color="purple"
        />
      </div>

      {/* Scrolling Notices */}
      {importantNotices.length > 0 && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 text-white overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5" />
            <span className="font-bold">গুরুত্বপূর্ণ ঘোষণা</span>
          </div>
          <div className="relative overflow-hidden h-6">
            <div className="animate-marquee whitespace-nowrap">
              {importantNotices.map((n) => n.title).join(' • ')}
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLinkButton
          label="সদস্য যোগ"
          icon={Users}
          onClick={() => onNavigate('members')}
          color="blue"
        />
        <QuickLinkButton
          label="পূজা যোগ"
          icon={Calendar}
          onClick={() => onNavigate('pujas')}
          color="orange"
        />
        <QuickLinkButton
          label="চাঁদা যোগ"
          icon={Wallet}
          onClick={() => onNavigate('contributions')}
          color="green"
        />
        <QuickLinkButton
          label="রিপোর্ট দেখুন"
          icon={FileText}
          onClick={() => onNavigate('reports')}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Pujas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            আসন্ন পূজা
          </h3>
          {upcomingPujas.length === 0 ? (
            <p className="text-gray-500 text-center py-4">কোনো আসন্ন পূজা নেই</p>
          ) : (
            <div className="space-y-3">
              {upcomingPujas.map((puja) => (
                <div
                  key={puja.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">{puja.name}</p>
                    <p className="text-sm text-gray-500">{puja.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600">
                      {formatDate(puja.date)}
                    </p>
                    <p className="text-xs text-gray-500">{formatCurrency(puja.budget)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            সাম্প্রতিক লেনদেন
          </h3>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">কোনো লেনদেন নেই</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {'source' in t ? t.source : t.description}
                    </p>
                    <p className="text-sm text-gray-500">{formatDate(t.date)}</p>
                  </div>
                  <span
                    className={`font-medium ${
                      t.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {t.type === 'income' ? '+' : '-'}
                    {formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'red' | 'purple';
  onClick?: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function QuickLinkButton({
  label,
  icon: Icon,
  onClick,
  color,
}: {
  label: string;
  icon: React.ElementType;
  onClick: () => void;
  color: 'blue' | 'green' | 'orange' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl ${colorClasses[color]} transition-colors flex flex-col items-center gap-2`}
    >
      <Icon className="w-6 h-6" />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

// Members Tab Component
function MembersTab({
  members,
  setMembers,
  isAdmin,
}: {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  isAdmin: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    phone: '',
    address: '',
    photo: '',
  });

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? { ...m, ...formData } : m))
      );
    } else {
      const newMember: Member = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setMembers((prev) => [...prev, newMember]);
    }
    setShowModal(false);
    setEditingMember(null);
    setFormData({ name: '', designation: '', phone: '', address: '', photo: '' });
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      designation: member.designation,
      phone: member.phone,
      address: member.address,
      photo: member.photo || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই সদস্যকে মুছে ফেলতে চান?')) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('কলম হিন্দু ধর্মসভা - সদস্য তালিকা', 14, 20);

    const tableData = filteredMembers.map((m) => [
      m.name,
      m.designation,
      m.phone,
      m.address,
    ]);

    autoTable(doc, {
      head: [['নাম', 'পদবি', 'ফোন', 'ঠিকানা']],
      body: tableData,
      startY: 30,
      styles: { font: 'helvetica', fontSize: 10 },
      headStyles: { fillColor: [249, 115, 22] },
    });

    doc.save('সদস্য_তালিকা.pdf');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="সদস্য খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF ডাউনলোড
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingMember(null);
                setFormData({ name: '', designation: '', phone: '', address: '', photo: '' });
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              সদস্য যোগ
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ছবি</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">নাম</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পদবি</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ফোন</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ঠিকানা</th>
                {isAdmin && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{member.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.designation}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{member.address}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredMembers.length === 0 && (
          <div className="text-center py-8 text-gray-500">কোনো সদস্য পাওয়া যায়নি</div>
        )}
      </div>

      {/* Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingMember ? 'সদস্য সম্পাদনা' : 'নতুন সদস্য'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পদবি *</label>
                  <select
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">পদবি নির্বাচন করুন</option>
                    <option value="সভাপতি">সভাপতি</option>
                    <option value="সম্পাদক">সম্পাদক</option>
                    <option value="কোষাধ্যক্ষ">কোষাধ্যক্ষ</option>
                    <option value="সদস্য">সদস্য</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ফোন *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ঠিকানা</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ছবি</label>
                  <div className="flex items-center gap-4">
                    {formData.photo && (
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <ImageIcon className="w-4 h-4" />
                      <span className="text-sm">ছবি আপলোড</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingMember ? 'আপডেট' : 'সংরক্ষণ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Pujas Tab Component
function PujasTab({
  pujas,
  setPujas,
  isAdmin,
}: {
  pujas: Puja[];
  setPujas: React.Dispatch<React.SetStateAction<Puja[]>>;
  isAdmin: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingPuja, setEditingPuja] = useState<Puja | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'দূর্গা পূজা' as PujaType,
    budget: 0,
    date: '',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPuja) {
      setPujas((prev) =>
        prev.map((p) => (p.id === editingPuja.id ? { ...p, ...formData } : p))
      );
    } else {
      const newPuja: Puja = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setPujas((prev) => [...prev, newPuja]);
    }
    setShowModal(false);
    setEditingPuja(null);
    setFormData({ name: '', type: 'দূর্গা পূজা', budget: 0, date: '', description: '' });
  };

  const handleEdit = (puja: Puja) => {
    setEditingPuja(puja);
    setFormData({
      name: puja.name,
      type: puja.type,
      budget: puja.budget,
      date: puja.date,
      description: puja.description,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই পূজা মুছে ফেলতে চান?')) {
      setPujas((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingPuja(null);
              setFormData({ name: '', type: 'দূর্গা পূজা', budget: 0, date: '', description: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            পূজা যোগ
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pujas.map((puja) => (
          <div key={puja.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                puja.type === 'দূর্গা পূজা' ? 'bg-red-100 text-red-700' :
                puja.type === 'স্বরসতী পূজা' ? 'bg-yellow-100 text-yellow-700' :
                puja.type === 'শ্যামা পূজা' ? 'bg-purple-100 text-purple-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {puja.type}
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(puja)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(puja.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{puja.name}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">তারিখ:</span>
                <span className="font-medium">{formatDate(puja.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">বাজেট:</span>
                <span className="font-medium text-green-600">{formatCurrency(puja.budget)}</span>
              </div>
            </div>
            {puja.description && (
              <p className="mt-3 text-sm text-gray-600">{puja.description}</p>
            )}
          </div>
        ))}
      </div>

      {pujas.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>কোনো পূজা যোগ করা হয়নি</p>
        </div>
      )}

      {/* Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingPuja ? 'পূজা সম্পাদনা' : 'নতুন পূজা'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পূজার নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পূজার ধরন *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as PujaType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="শ্যামা পূজা">শ্যামা পূজা</option>
                    <option value="স্বরসতী পূজা">স্বরসতী পূজা</option>
                    <option value="দূর্গা পূজা">দূর্গা পূজা</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বাজেট *</label>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingPuja ? 'আপডেট' : 'সংরক্ষণ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Contributions Tab Component
function ContributionsTab({
  contributions,
  setContributions,
  members,
  pujas,
  isAdmin,
}: {
  contributions: Contribution[];
  setContributions: React.Dispatch<React.SetStateAction<Contribution[]>>;
  members: Member[];
  pujas: Puja[];
  isAdmin: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [filterPuja, setFilterPuja] = useState('');
  const [filterMember, setFilterMember] = useState('');
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | ''>('');

  const [formData, setFormData] = useState({
    memberId: '',
    pujaId: '',
    amount: 0,
    paidAmount: 0,
    status: 'বকেয়া' as PaymentStatus,
    paymentMethod: 'নগদ' as PaymentMethod,
    paymentDate: '',
    notes: '',
  });

  const [bulkFormData, setBulkFormData] = useState({
    pujaId: '',
    amount: 0,
    selectedMembers: [] as string[],
  });

  const filteredContributions = contributions.filter((c) => {
    const matchPuja = !filterPuja || c.pujaId === filterPuja;
    const matchMember = !filterMember || c.memberId === filterMember;
    const matchStatus = !filterStatus || c.status === filterStatus;
    return matchPuja && matchMember && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContribution) {
      setContributions((prev) =>
        prev.map((c) => (c.id === editingContribution.id ? { ...c, ...formData } : c))
      );
    } else {
      const newContribution: Contribution = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setContributions((prev) => [...prev, newContribution]);
    }
    setShowModal(false);
    setEditingContribution(null);
    setFormData({
      memberId: '',
      pujaId: '',
      amount: 0,
      paidAmount: 0,
      status: 'বকেয়া',
      paymentMethod: 'নগদ',
      paymentDate: '',
      notes: '',
    });
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newContributions: Contribution[] = bulkFormData.selectedMembers.map((memberId) => ({
      id: generateId(),
      memberId,
      pujaId: bulkFormData.pujaId,
      amount: bulkFormData.amount,
      paidAmount: 0,
      status: 'বকেয়া',
      createdAt: new Date().toISOString(),
    }));
    setContributions((prev) => [...prev, ...newContributions]);
    setShowBulkModal(false);
    setBulkFormData({ pujaId: '', amount: 0, selectedMembers: [] });
  };

  const handleEdit = (contribution: Contribution) => {
    setEditingContribution(contribution);
    setFormData({
      memberId: contribution.memberId,
      pujaId: contribution.pujaId,
      amount: contribution.amount,
      paidAmount: contribution.paidAmount,
      status: contribution.status,
      paymentMethod: contribution.paymentMethod || 'নগদ',
      paymentDate: contribution.paymentDate || '',
      notes: contribution.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই চাঁদা রেকর্ড মুছে ফেলতে চান?')) {
      setContributions((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Summary calculations
  const totalExpected = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = contributions.reduce((sum, c) => sum + c.paidAmount, 0);
  const totalPending = totalExpected - totalPaid;

  const pendingContributions = contributions.filter((c) => c.status !== 'পরিশোধিত');

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-sm text-blue-600 mb-1">মোট চাঁদা (প্রত্যাশিত)</p>
          <p className="text-2xl font-bold text-blue-800">{formatCurrency(totalExpected)}</p>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-600 mb-1">মোট পরিশোধিত</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-sm text-red-600 mb-1">মোট বকেয়া</p>
          <p className="text-2xl font-bold text-red-800">{formatCurrency(totalPending)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">পূজা অনুযায়ী</label>
            <select
              value={filterPuja}
              onChange={(e) => setFilterPuja(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সব পূজা</option>
              {pujas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">সদস্য অনুযায়ী</label>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সব সদস্য</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস অনুযায়ী</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as PaymentStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="">সব স্ট্যাটাস</option>
              <option value="পরিশোধিত">পরিশোধিত</option>
              <option value="বকেয়া">বকেয়া</option>
              <option value="অতিরিক্ত বকেয়া">অতিরিক্ত বকেয়া</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isAdmin && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Users className="w-4 h-4" />
            একাধিক চাঁদা নির্ধারণ
          </button>
          <button
            onClick={() => {
              setEditingContribution(null);
              setFormData({
                memberId: '',
                pujaId: '',
                amount: 0,
                paidAmount: 0,
                status: 'বকেয়া',
                paymentMethod: 'নগদ',
                paymentDate: '',
                notes: '',
              });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            চাঁদা যোগ
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">সদস্য</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পূজা</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">চাঁদা</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পরিশোধ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">বকেয়া</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">স্ট্যাটাস</th>
                {isAdmin && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContributions.map((c) => {
                const member = members.find((m) => m.id === c.memberId);
                const puja = pujas.find((p) => p.id === c.pujaId);
                const pending = c.amount - c.paidAmount;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{member?.name || 'অজানা'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{puja?.name || 'অজানা'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{formatCurrency(c.amount)}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{formatCurrency(c.paidAmount)}</td>
                    <td className="px-4 py-3 text-sm text-red-600">{formatCurrency(pending)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === 'পরিশোধিত' ? 'bg-green-100 text-green-700' :
                        c.status === 'বকেয়া' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredContributions.length === 0 && (
          <div className="text-center py-8 text-gray-500">কোনো চাঁদা রেকর্ড পাওয়া যায়নি</div>
        )}
      </div>

      {/* Pending List */}
      {pendingContributions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            বকেয়া তালিকা
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {pendingContributions.map((c) => {
              const member = members.find((m) => m.id === c.memberId);
              const puja = pujas.find((p) => p.id === c.pujaId);
              const pending = c.amount - c.paidAmount;
              return (
                <div key={c.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{member?.name}</p>
                    <p className="text-sm text-gray-500">{puja?.name}</p>
                  </div>
                  <span className="font-bold text-red-600">{formatCurrency(pending)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Single Contribution Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingContribution ? 'চাঁদা সম্পাদনা' : 'নতুন চাঁদা'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">সদস্য *</label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">সদস্য নির্বাচন করুন</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পূজা *</label>
                  <select
                    required
                    value={formData.pujaId}
                    onChange={(e) => setFormData({ ...formData, pujaId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">পূজা নির্বাচন করুন</option>
                    {pujas.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">চাঁদার পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিশোধিত পরিমাণ</label>
                  <input
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as PaymentStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="পরিশোধিত">পরিশোধিত</option>
                    <option value="বকেয়া">বকেয়া</option>
                    <option value="অতিরিক্ত বকেয়া">অতিরিক্ত বকেয়া</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="নগদ">নগদ</option>
                    <option value="অনলাইন">অনলাইন</option>
                    <option value="চেক">চেক</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট তারিখ</label>
                  <input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নোট</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={2}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingContribution ? 'আপডেট' : 'সংরক্ষণ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Contribution Modal */}
      {showBulkModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">একাধিক চাঁদা নির্ধারণ</h3>
                <button onClick={() => setShowBulkModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পূজা *</label>
                  <select
                    required
                    value={bulkFormData.pujaId}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, pujaId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">পূজা নির্বাচন করুন</option>
                    {pujas.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">চাঁদার পরিমাণ (প্রতি সদস্য) *</label>
                  <input
                    type="number"
                    required
                    value={bulkFormData.amount}
                    onChange={(e) => setBulkFormData({ ...bulkFormData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">সদস্য নির্বাচন করুন</label>
                  <div className="border border-gray-300 rounded-lg p-3 max-h-60 overflow-y-auto space-y-2">
                    <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bulkFormData.selectedMembers.length === members.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkFormData({ ...bulkFormData, selectedMembers: members.map((m) => m.id) });
                          } else {
                            setBulkFormData({ ...bulkFormData, selectedMembers: [] });
                          }
                        }}
                        className="w-4 h-4 text-orange-500 rounded"
                      />
                      <span className="font-medium">সব সদস্য নির্বাচন করুন</span>
                    </label>
                    <div className="border-t border-gray-200 my-2" />
                    {members.map((m) => (
                      <label key={m.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={bulkFormData.selectedMembers.includes(m.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkFormData({
                                ...bulkFormData,
                                selectedMembers: [...bulkFormData.selectedMembers, m.id],
                              });
                            } else {
                              setBulkFormData({
                                ...bulkFormData,
                                selectedMembers: bulkFormData.selectedMembers.filter((id) => id !== m.id),
                              });
                            }
                          }}
                          className="w-4 h-4 text-orange-500 rounded"
                        />
                        <span>{m.name}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {bulkFormData.selectedMembers.length} জন সদস্য নির্বাচিত
                  </p>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={bulkFormData.selectedMembers.length === 0 || !bulkFormData.pujaId}
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                  >
                    সংরক্ষণ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Income Tab Component
function IncomeTab({
  income,
  setIncome,
  isAdmin,
}: {
  income: OtherIncome[];
  setIncome: React.Dispatch<React.SetStateAction<OtherIncome[]>>;
  isAdmin: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState<OtherIncome | null>(null);
  const [formData, setFormData] = useState({
    type: 'দান' as IncomeType,
    source: '',
    description: '',
    amount: 0,
    date: '',
  });

  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIncome) {
      setIncome((prev) =>
        prev.map((i) => (i.id === editingIncome.id ? { ...i, ...formData } : i))
      );
    } else {
      const newIncome: OtherIncome = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setIncome((prev) => [...prev, newIncome]);
    }
    setShowModal(false);
    setEditingIncome(null);
    setFormData({ type: 'দান', source: '', description: '', amount: 0, date: '' });
  };

  const handleEdit = (inc: OtherIncome) => {
    setEditingIncome(inc);
    setFormData({
      type: inc.type,
      source: inc.source,
      description: inc.description,
      amount: inc.amount,
      date: inc.date,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই আয় মুছে ফেলতে চান?')) {
      setIncome((prev) => prev.filter((i) => i.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 rounded-xl p-6">
        <p className="text-sm text-green-600 mb-1">মোট অন্যান্য আয়</p>
        <p className="text-3xl font-bold text-green-800">{formatCurrency(totalIncome)}</p>
      </div>

      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingIncome(null);
              setFormData({ type: 'দান', source: '', description: '', amount: 0, date: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Plus className="w-4 h-4" />
            আয় যোগ
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">তারিখ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ধরন</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">উৎস</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">বিবরণ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পরিমাণ</th>
                {isAdmin && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {income.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((inc) => (
                <tr key={inc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDate(inc.date)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      {inc.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 font-medium">{inc.source}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{inc.description}</td>
                  <td className="px-4 py-3 text-sm font-bold text-green-600">{formatCurrency(inc.amount)}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(inc)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inc.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {income.length === 0 && (
          <div className="text-center py-8 text-gray-500">কোনো আয় রেকর্ড পাওয়া যায়নি</div>
        )}
      </div>

      {/* Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingIncome ? 'আয় সম্পাদনা' : 'নতুন আয়'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">আয়ের ধরন *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as IncomeType })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="দান">দান</option>
                    <option value="স্পনসরশিপ">স্পনসরশিপ</option>
                    <option value="সরকারি অনুদান">সরকারি অনুদান</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">উৎস *</label>
                  <input
                    type="text"
                    required
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  >
                    {editingIncome ? 'আপডেট' : 'সংরক্ষণ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Expenses Tab Component
function ExpensesTab({
  expenses,
  setExpenses,
  pujas,
  isAdmin,
}: {
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  pujas: Puja[];
  isAdmin: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [filterPuja, setFilterPuja] = useState('');

  const [formData, setFormData] = useState({
    category: 'অন্যান্য' as ExpenseCategory,
    description: '',
    amount: 0,
    date: '',
    receiptNo: '',
    pujaId: '',
  });

  const filteredExpenses = filterPuja
    ? expenses.filter((e) => e.pujaId === filterPuja)
    : expenses;

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExpense) {
      setExpenses((prev) =>
        prev.map((ex) => (ex.id === editingExpense.id ? { ...ex, ...formData } : ex))
      );
    } else {
      const newExpense: Expense = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setExpenses((prev) => [...prev, newExpense]);
    }
    setShowModal(false);
    setEditingExpense(null);
    setFormData({ category: 'অন্যান্য', description: '', amount: 0, date: '', receiptNo: '', pujaId: '' });
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description,
      amount: expense.amount,
      date: expense.date,
      receiptNo: expense.receiptNo || '',
      pujaId: expense.pujaId || '',
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই ব্যয় মুছে ফেলতে চান?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-red-50 rounded-xl p-6">
        <p className="text-sm text-red-600 mb-1">মোট ব্যয়</p>
        <p className="text-3xl font-bold text-red-800">{formatCurrency(totalExpenses)}</p>
      </div>

      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex-1 min-w-[200px]">
          <select
            value={filterPuja}
            onChange={(e) => setFilterPuja(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="">সব পূজার ব্যয়</option>
            {pujas.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingExpense(null);
              setFormData({ category: 'অন্যান্য', description: '', amount: 0, date: '', receiptNo: '', pujaId: '' });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <Plus className="w-4 h-4" />
            ব্যয় যোগ
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">তারিখ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">ক্যাটাগরি</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">বিবরণ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পূজা</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">রসিদ নং</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">পরিমাণ</th>
                {isAdmin && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">অ্যাকশন</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((expense) => {
                const puja = pujas.find((p) => p.id === expense.pujaId);
                return (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800">{expense.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{puja?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{expense.receiptNo || '-'}</td>
                    <td className="px-4 py-3 text-sm font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredExpenses.length === 0 && (
          <div className="text-center py-8 text-gray-500">কোনো ব্যয় রেকর্ড পাওয়া যায়নি</div>
        )}
      </div>

      {/* Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingExpense ? 'ব্যয় সম্পাদনা' : 'নতুন ব্যয়'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="প্রতিমা">প্রতিমা</option>
                    <option value="মণ্ডপ">মণ্ডপ</option>
                    <option value="পুজো সামগ্রী">পুজো সামগ্রী</option>
                    <option value="খাবার">খাবার</option>
                    <option value="আলোকসজ্জা">আলোকসজ্জা</option>
                    <option value="বাজনা">বাজনা</option>
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ *</label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পূজা (ঐচ্ছিক)</label>
                  <select
                    value={formData.pujaId}
                    onChange={(e) => setFormData({ ...formData, pujaId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {pujas.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পরিমাণ *</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">রসিদ নং</label>
                  <input
                    type="text"
                    value={formData.receiptNo}
                    onChange={(e) => setFormData({ ...formData, receiptNo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    {editingExpense ? 'আপডেট' : 'সংরক্ষণ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Notices Tab Component
function NoticesTab({
  notices,
  setNotices,
  isAdmin,
}: {
  notices: Notice[];
  setNotices: React.Dispatch<React.SetStateAction<Notice[]>>;
  isAdmin: boolean;
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    isImportant: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNotice) {
      setNotices((prev) =>
        prev.map((n) => (n.id === editingNotice.id ? { ...n, ...formData } : n))
      );
    } else {
      const newNotice: Notice = {
        id: generateId(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      setNotices((prev) => [...prev, newNotice]);
    }
    setShowModal(false);
    setEditingNotice(null);
    setFormData({ title: '', description: '', date: '', isImportant: false });
  };

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice);
    setFormData({
      title: notice.title,
      description: notice.description,
      date: notice.date,
      isImportant: notice.isImportant,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিতভাবে এই নোটিস মুছে ফেলতে চান?')) {
      setNotices((prev) => prev.filter((n) => n.id !== id));
    }
  };

  const sortedNotices = [...notices].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingNotice(null);
              setFormData({ title: '', description: '', date: '', isImportant: false });
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            নোটিস যোগ
          </button>
        </div>
      )}

      <div className="space-y-4">
        {sortedNotices.map((notice) => (
          <div
            key={notice.id}
            className={`rounded-xl p-6 ${
              notice.isImportant
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                : 'bg-white shadow-sm'
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {notice.isImportant && (
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">
                      গুরুত্বপূর্ণ
                    </span>
                  )}
                  <span className={`text-sm ${notice.isImportant ? 'text-white/80' : 'text-gray-500'}`}>
                    {formatDate(notice.date)}
                  </span>
                </div>
                <h3 className={`text-lg font-bold mb-2 ${notice.isImportant ? 'text-white' : 'text-gray-800'}`}>
                  {notice.title}
                </h3>
                <p className={notice.isImportant ? 'text-white/90' : 'text-gray-600'}>
                  {notice.description}
                </p>
              </div>
              {isAdmin && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(notice)}
                    className={`p-2 rounded ${
                      notice.isImportant ? 'hover:bg-white/20' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Edit2 className={`w-4 h-4 ${notice.isImportant ? 'text-white' : 'text-blue-600'}`} />
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className={`p-2 rounded ${
                      notice.isImportant ? 'hover:bg-white/20' : 'hover:bg-gray-100'
                    }`}
                  >
                    <Trash2 className={`w-4 h-4 ${notice.isImportant ? 'text-white' : 'text-red-600'}`} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {notices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>কোনো নোটিস নেই</p>
        </div>
      )}

      {/* Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">
                  {editingNotice ? 'নোটিস সম্পাদনা' : 'নতুন নোটিস'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">বিবরণ *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">তারিখ *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="w-4 h-4 text-orange-500 rounded"
                  />
                  <label htmlFor="isImportant" className="text-sm font-medium text-gray-700">
                    গুরুত্বপূর্ণ নোটিস
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    {editingNotice ? 'আপডেট' : 'সংরক্ষণ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Reports Tab Component
function ReportsTab({
  members,
  contributions,
  pujas,
  income,
  expenses,
}: {
  members: Member[];
  contributions: Contribution[];
  pujas: Puja[];
  income: OtherIncome[];
  expenses: Expense[];
}) {
  const downloadMemberListPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('কলম হিন্দু ধর্মসভা', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('সদস্য তালিকা', 105, 30, { align: 'center' });

    const tableData = members.map((m, index) => [
      (index + 1).toString(),
      m.name,
      m.designation,
      m.phone,
      m.address,
    ]);

    autoTable(doc, {
      head: [['ক্রম', 'নাম', 'পদবি', 'ফোন', 'ঠিকানা']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save('সদস্য_তালিকা.pdf');
  };

  const downloadPendingContributionsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('কলম হিন্দু ধর্মসভা', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('বকেয়া চাঁদার তালিকা', 105, 30, { align: 'center' });

    const pendingContributions = contributions.filter((c) => c.status !== 'পরিশোধিত');

    const tableData = pendingContributions.map((c, index) => {
      const member = members.find((m) => m.id === c.memberId);
      const puja = pujas.find((p) => p.id === c.pujaId);
      const pending = c.amount - c.paidAmount;
      return [
        (index + 1).toString(),
        member?.name || 'অজানা',
        puja?.name || 'অজানা',
        formatCurrency(c.amount),
        formatCurrency(c.paidAmount),
        formatCurrency(pending),
      ];
    });

    autoTable(doc, {
      head: [['ক্রম', 'সদস্য', 'পূজা', 'মোট চাঁদা', 'পরিশোধ', 'বকেয়া']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save('বকেয়া_চাঁদা.pdf');
  };

  const downloadFullStatementPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('কলম হিন্দু ধর্মসভা', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('সম্পূর্ণ হিসাব বিবরণী', 105, 30, { align: 'center' });

    const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
    const totalContributions = contributions.reduce((sum, c) => sum + c.paidAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const balance = totalIncome + totalContributions - totalExpenses;

    let yPos = 45;

    // Summary
    doc.setFontSize(12);
    doc.text('সারাংশ', 14, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`মোট অন্যান্য আয়: ${formatCurrency(totalIncome)}`, 14, yPos);
    yPos += 7;
    doc.text(`মোট চাঁদা (পরিশোধিত): ${formatCurrency(totalContributions)}`, 14, yPos);
    yPos += 7;
    doc.text(`মোট ব্যয়: ${formatCurrency(totalExpenses)}`, 14, yPos);
    yPos += 7;
    doc.text(`বর্তমান ব্যালেন্স: ${formatCurrency(balance)}`, 14, yPos);
    yPos += 15;

    // Income details
    doc.setFontSize(12);
    doc.text('আয়ের বিবরণ', 14, yPos);
    yPos += 5;

    autoTable(doc, {
      head: [['তারিখ', 'ধরন', 'উৎস', 'পরিমাণ']],
      body: income.map((i) => [formatDate(i.date), i.type, i.source, formatCurrency(i.amount)]),
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [34, 197, 94] },
    });

    yPos = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

    // Expense details
    doc.setFontSize(12);
    doc.text('ব্যয়ের বিবরণ', 14, yPos);
    yPos += 5;

    autoTable(doc, {
      head: [['তারিখ', 'ক্যাটাগরি', 'বিবরণ', 'পরিমাণ']],
      body: expenses.map((e) => [formatDate(e.date), e.category, e.description, formatCurrency(e.amount)]),
      startY: yPos,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [239, 68, 68] },
    });

    doc.save('সম্পূর্ণ_হিসাব.pdf');
  };

  const downloadContributionSummaryPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('কলম হিন্দু ধর্মসভা', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text('চাঁদা সারাংশ', 105, 30, { align: 'center' });

    const summary: Record<string, { name: string; expected: number; paid: number; pending: number }> = {};

    contributions.forEach((c) => {
      const member = members.find((m) => m.id === c.memberId);
      if (member) {
        if (!summary[member.id]) {
          summary[member.id] = { name: member.name, expected: 0, paid: 0, pending: 0 };
        }
        summary[member.id].expected += c.amount;
        summary[member.id].paid += c.paidAmount;
        summary[member.id].pending += c.amount - c.paidAmount;
      }
    });

    const tableData = Object.values(summary).map((s, index) => [
      (index + 1).toString(),
      s.name,
      formatCurrency(s.expected),
      formatCurrency(s.paid),
      formatCurrency(s.pending),
    ]);

    autoTable(doc, {
      head: [['ক্রম', 'সদস্য', 'মোট চাঁদা', 'পরিশোধ', 'বকেয়া']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [249, 115, 22], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save('চাঁদা_সারাংশ.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReportCard
          title="সদস্য তালিকা"
          description="সকল সদস্যের নাম, পদবি, ফোন ও ঠিকানা সহ পূর্ণাঙ্গ তালিকা"
          icon={Users}
          color="blue"
          onClick={downloadMemberListPDF}
        />
        <ReportCard
          title="বকেয়া চাঁদার তালিকা"
          description="যাদের চাঁদা বাকি আছে তাদের বিস্তারিত তালিকা"
          icon={AlertCircle}
          color="red"
          onClick={downloadPendingContributionsPDF}
        />
        <ReportCard
          title="সম্পূর্ণ হিসাব বিবরণী"
          description="আয়-ব্যয়ের সম্পূর্ণ বিবরণী ও ব্যালেন্স শীট"
          icon={FileText}
          color="purple"
          onClick={downloadFullStatementPDF}
        />
        <ReportCard
          title="চাঁদা সারাংশ"
          description="প্রতি সদস্যের চাঁদার বিস্তারিত বিবরণ"
          icon={Wallet}
          color="orange"
          onClick={downloadContributionSummaryPDF}
        />
      </div>
    </div>
  );
}

function ReportCard({
  title,
  description,
  icon: Icon,
  color,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  color: 'blue' | 'red' | 'purple' | 'orange';
  onClick: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-300',
    red: 'bg-red-50 border-red-200 hover:border-red-300',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-300',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-300',
  };

  const iconColors = {
    blue: 'text-blue-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-xl border-2 ${colorClasses[color]} transition-all hover:shadow-md text-left`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-white ${iconColors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Download className="w-4 h-4" />
            PDF ডাউনলোড করুন
          </div>
        </div>
      </div>
    </button>
  );
}
