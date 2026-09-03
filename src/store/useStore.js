import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updatePortfolio } from '../services/api';

const useStore = create(
  persist(
    (set, get) => ({
      // ---------- State ----------
      user: null,
      token: null,
      portfolio: [],
      watchlist: [],
      theme: 'dark',
      market: 'us',
      currency: 'sgd',
      isLoading: false,
      error: null,
      _isSyncing: false, // prevent infinite loops

      // ---------- Auth ----------
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },

      logout: () => {
        localStorage.removeItem('token');
        // ✅ Keep portfolio in localStorage (do NOT clear it)
        // The persist middleware will keep it
        set({ user: null, token: null });
      },

      // ---------- Portfolio ----------
      setPortfolio: (portfolio) => set({ portfolio }),

      // Sync portfolio to server
      syncPortfolio: async () => {
        const { portfolio, token, _isSyncing } = get();
        // Only sync if logged in and not already syncing
        if (!token || _isSyncing) return;
        set({ _isSyncing: true });
        try {
          await updatePortfolio(portfolio);
          console.log('✅ Portfolio synced to server');
        } catch (e) {
          console.warn('Failed to sync portfolio:', e);
        } finally {
          set({ _isSyncing: false });
        }
      },

      addToPortfolio: (item) => {
        const { portfolio } = get();
        const exists = portfolio.some(p => p.symbol === item.symbol);
        let newPortfolio;
        if (exists) {
          newPortfolio = portfolio.map(p =>
            p.symbol === item.symbol ? { ...p, shares: item.shares || p.shares } : p
          );
        } else {
          newPortfolio = [...portfolio, { ...item, shares: item.shares || 1 }];
        }
        set({ portfolio: newPortfolio });
        // Sync to server after state update
        setTimeout(() => get().syncPortfolio(), 100);
      },

      removeFromPortfolio: (symbol) => {
        const { portfolio } = get();
        const newPortfolio = portfolio.filter(item => item.symbol !== symbol);
        set({ portfolio: newPortfolio });
        // Sync to server after state update
        setTimeout(() => get().syncPortfolio(), 100);
      },

      updatePortfolioItem: (symbol, updates) => {
        const { portfolio } = get();
        const newPortfolio = portfolio.map(item =>
          item.symbol === symbol ? { ...item, ...updates } : item
        );
        set({ portfolio: newPortfolio });
        setTimeout(() => get().syncPortfolio(), 100);
      },

      clearPortfolio: () => {
        set({ portfolio: [] });
        setTimeout(() => get().syncPortfolio(), 100);
      },

      // ---------- Watchlist ----------
      setWatchlist: (watchlist) => set({ watchlist }),
      addToWatchlist: (item) => {
        const { watchlist } = get();
        const exists = watchlist.some(w => w.symbol === item.symbol);
        if (!exists) {
          set({ watchlist: [...watchlist, item] });
        }
      },
      removeFromWatchlist: (symbol) => {
        const { watchlist } = get();
        set({ watchlist: watchlist.filter(item => item.symbol !== symbol) });
      },
      isInWatchlist: (symbol) => {
        const { watchlist } = get();
        return watchlist.some(item => item.symbol === symbol);
      },
      clearWatchlist: () => set({ watchlist: [] }),

      // ---------- Theme ----------
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        });
      },
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        set({ theme });
      },

      // ---------- Market & Currency ----------
      setMarket: (market) => set({ market }),
      setCurrency: (currency) => set({ currency }),

      // ---------- Loading / Error ----------
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // ---------- Getters ----------
      getPortfolioSymbols: () => {
        const { portfolio } = get();
        return portfolio.map(item => item.symbol);
      },
      getPortfolioCount: () => {
        const { portfolio } = get();
        return portfolio.length;
      },
      isInPortfolio: (symbol) => {
        const { portfolio } = get();
        return portfolio.some(item => item.symbol === symbol);
      },
      getWatchlistSymbols: () => {
        const { watchlist } = get();
        return watchlist.map(item => item.symbol);
      },
      getWatchlistCount: () => {
        const { watchlist } = get();
        return watchlist.length;
      },
      getCurrencySymbol: () => {
        const { currency } = get();
        return currency === 'sgd' ? 'S$' : '$';
      },
    }),
    {
      name: 'DividendBro-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        portfolio: state.portfolio,
        watchlist: state.watchlist,
        theme: state.theme,
        market: state.market,
        currency: state.currency,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Error rehydrating store:', error);
          } else if (state) {
            document.documentElement.setAttribute('data-theme', state.theme || 'dark');
          }
        };
      },
    }
  )
);

export default useStore;