import { useState, useEffect, useCallback } from 'react';
import { githubService, Database } from '../services/githubService';

export function useGitHubData() {
  const [data, setData] = useState<Database | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGitHubMode, setIsGitHubMode] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Check if GitHub is configured
  useEffect(() => {
    const initialized = githubService.isInitialized();
    setIsGitHubMode(initialized);
  }, []);

  // Load data from GitHub or localStorage
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (githubService.isInitialized()) {
        // Load from GitHub
        const db = await githubService.fetchDatabase();
        setData(db);
        setIsGitHubMode(true);
        
        // Also save to localStorage as backup
        localStorage.setItem('khs_backup', JSON.stringify(db));
      } else {
        // Load from localStorage
        const saved = localStorage.getItem('khs_data');
        if (saved) {
          setData(JSON.parse(saved));
        } else {
          // Initialize with empty data
          setData({
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
        }
        setIsGitHubMode(false);
      }
    } catch (err) {
      setError('ডেটা লোড করতে সমস্যা হয়েছে');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Save data
  const saveData = useCallback(async (newData: Database) => {
    setData(newData);
    
    // Always save to localStorage as backup
    localStorage.setItem('khs_data', JSON.stringify(newData));
    
    // If GitHub mode, also save to GitHub
    if (isGitHubMode && githubService.isInitialized()) {
      setHasPendingChanges(true);
      const success = await githubService.saveDatabase(newData);
      if (success) {
        setHasPendingChanges(false);
      }
    }
  }, [isGitHubMode]);

  // Update specific field
  const updateField = useCallback(<K extends keyof Database>(
    field: K,
    value: Database[K]
  ) => {
    if (data) {
      const newData = { ...data, [field]: value };
      saveData(newData);
    }
  }, [data, saveData]);

  // Enable GitHub mode
  const enableGitHubMode = useCallback(async (token: string) => {
    githubService.initialize(token);
    await loadData();
  }, [loadData]);

  // Disable GitHub mode
  const disableGitHubMode = useCallback(() => {
    githubService.clearToken();
    setIsGitHubMode(false);
  }, []);

  // Manual sync to GitHub
  const syncToGitHub = useCallback(async () => {
    if (data && githubService.isInitialized()) {
      setHasPendingChanges(true);
      const success = await githubService.saveDatabase(data);
      if (success) {
        setHasPendingChanges(false);
      }
      return success;
    }
    return false;
  }, [data]);

  return {
    data,
    loading,
    error,
    isGitHubMode,
    hasPendingChanges,
    loadData,
    saveData,
    updateField,
    enableGitHubMode,
    disableGitHubMode,
    syncToGitHub,
    refresh: loadData,
  };
}
