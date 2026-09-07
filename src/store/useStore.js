import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updatePortfolio, updateWatchlist } from '../services/api'; 

const useStore = create(
  persist(
    (set, get) => ({
      // ---------- State Matrix ----------
      user: null,
      token: null,
      portfolio: [],
      watchlist: [],
      compareList: [], // NEW
      theme: 'dark',
      market: 'us',
      currency: 'usd',
      isLoading: false,
      error: null,
      _isSyncing: false,

      // ---------- Auth Handles ----------
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
        set({ user: null, token: null, portfolio: [], watchlist: [], compareList: [] });
      },

      // ---------- Portfolio Engine ----------
      setPortfolio: (portfolio) => set({ portfolio }),
      syncPortfolio: async () => {
        const { portfolio, token, _isSyncing } = get();
        if (!token || _isSyncing) return;
        set({ _isSyncing: true });
        try {
          await updatePortfolio(portfolio);
        } catch (e) {
          console.warn('Portfolio sync channel dropped:', e);
        } finally {
          set({ _isSyncing: false });
        }
      },
      addToPortfolio: (item) => {
        const { portfolio } = get();
        const upperSymbol = item.symbol.toUpperCase().trim();
        const exists = portfolio.some(p => p.symbol.toUpperCase() === upperSymbol);
        let newPortfolio;
        if (exists) {
          newPortfolio = portfolio.map(p =>
            p.symbol.toUpperCase() === upperSymbol
              ? { ...p, shares: item.shares || p.shares, purchaseDate: item.purchaseDate || p.purchaseDate, purchasePrice: item.purchasePrice || p.purchasePrice }
              : p
          );
        } else {
          newPortfolio = [...portfolio, { symbol: upperSymbol, name: item.name || item.symbol, market: item.market || 'us', shares: item.shares || 1, purchaseDate: item.purchaseDate || null, purchasePrice: item.purchasePrice || null }];
        }
        set({ portfolio: newPortfolio });
        setTimeout(() => get().syncPortfolio(), 150);
      },
      removeFromPortfolio: (symbol) => {
        const { portfolio } = get();
        const upperSymbol = symbol.toUpperCase().trim();
        set({ portfolio: portfolio.filter(item => item.symbol.toUpperCase() !== upperSymbol) });
        setTimeout(() => get().syncPortfolio(), 150);
      },
      updatePortfolioItem: (symbol, updates) => {
        const { portfolio } = get();
        const upperSymbol = symbol.toUpperCase().trim();
        set({ portfolio: portfolio.map(item => item.symbol.toUpperCase() === upperSymbol ? { ...item, ...updates } : item) });
        setTimeout(() => get().syncPortfolio(), 150);
      },
      clearPortfolio: () => {
        set({ portfolio: [] });
        setTimeout(() => get().syncPortfolio(), 150);
      },

      // ---------- Watchlist Engine ----------
      setWatchlist: (watchlist) => set({ watchlist }),
      syncWatchlist: async () => {
        const { watchlist, token, _isSyncing } = get();
        if (!token || _isSyncing) return;
        set({ _isSyncing: true });
        try {
          await updateWatchlist(watchlist);
        } catch (e) {
          console.warn('Watchlist sync channel dropped:', e);
        } finally {
          set({ _isSyncing: false });
        }
      },
      addToWatchlist: (item) => {
        const { watchlist } = get();
        const upperSymbol = item.symbol.toUpperCase().trim();
        if (!watchlist.some(w => w.symbol.toUpperCase() === upperSymbol)) {
          set({ watchlist: [...watchlist, { ...item, symbol: upperSymbol }] });
          setTimeout(() => get().syncWatchlist(), 150);
        }
      },
      removeFromWatchlist: (symbol) => {
        const { watchlist } = get();
        const upperSymbol = symbol.toUpperCase().trim();
        set({ watchlist: watchlist.filter(item => item.symbol.toUpperCase() !== upperSymbol) });
        setTimeout(() => get().syncWatchlist(), 150);
      },
      isInWatchlist: (symbol) => {
        const { watchlist } = get();
        return watchlist.some(item => item.symbol.toUpperCase() === symbol.toUpperCase().trim());
      },

      // ---------- Compare Engine (Max 5) ----------
      setCompareList: (compareList) => set({ compareList }),
      addToCompare: (item) => {
        const { compareList } = get();
        const upperSymbol = item.symbol.toUpperCase().trim();
        if (compareList.length >= 5) return; // Hard limit
        if (!compareList.some(c => c.symbol.toUpperCase() === upperSymbol)) {
          set({ compareList: [...compareList, { ...item, symbol: upperSymbol }] });
        }
      },
      removeFromCompare: (symbol) => {
        const { compareList } = get();
        const upperSymbol = symbol.toUpperCase().trim();
        set({ compareList: compareList.filter(item => item.symbol.toUpperCase() !== upperSymbol) });
      },
      isInCompare: (symbol) => {
        const { compareList } = get();
        return compareList.some(item => item.symbol.toUpperCase() === symbol.toUpperCase().trim());
      },
      clearCompare: () => set({ compareList: [] }),

      // ---------- Adaptive UI Themes Control ----------
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

      // ---------- Global Segment Anchors ----------
      setMarket: (market) => set({ market }),
      setCurrency: (currency) => set({ currency }),

      setLoading: (isLoading) => set({ setLoading: isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      getPortfolioSymbols: () => get().portfolio.map(item => item.symbol),
      getPortfolioCount: () => get().portfolio.length,
      isInPortfolio: (symbol) => get().portfolio.some(item => item.symbol.toUpperCase() === symbol.toUpperCase().trim()),
      getWatchlistSymbols: () => get().watchlist.map(item => item.symbol),
      getWatchlistCount: () => get().watchlist.length,
      getCurrencySymbol: () => get().currency === 'sgd' ? 'S$' : '$',
    }),
    {
      name: 'DividendBro-State-Layer',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        portfolio: state.portfolio,
        watchlist: state.watchlist,
        compareList: state.compareList, // Persist
        theme: state.theme,
        market: state.market,
        currency: state.currency,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) {
            document.documentElement.setAttribute('data-theme', state.theme || 'dark');
          }
        };
      },
    }
  )
);

export default useStore;