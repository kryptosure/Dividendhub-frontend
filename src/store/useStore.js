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
      compareList: [],
      theme: 'dark',
      market: 'us',
      currency: 'usd',
      isLoading: false,
      error: null,
      _isSyncingPortfolio: false,
      _isSyncingWatchlist: false,

      // ✅ NEW: AI Chat state
      chatContext: null,       // { symbol, name, market, price, yield, ... }
      isChatOpen: false,       // widget visibility

      // ---------- Auth ----------
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, portfolio: [], watchlist: [], compareList: [], chatContext: null });
      },

      // ---------- Portfolio ----------
      setPortfolio: (portfolio) => set({ portfolio }),
      syncPortfolio: async () => {
        const { portfolio, token, _isSyncingPortfolio } = get();
        if (!token || _isSyncingPortfolio) return;
        set({ _isSyncingPortfolio: true });
        try { await updatePortfolio(portfolio); }
        catch (e) { console.warn('Portfolio sync failed:', e); }
        finally { set({ _isSyncingPortfolio: false }); }
      },
      addToPortfolio: (item) => {
        const { portfolio } = get();
        const upperSymbol = item.symbol.toUpperCase().trim();
        const exists = portfolio.some(p => p.symbol.toUpperCase() === upperSymbol);
        let newPortfolio;
        if (exists) {
          newPortfolio = portfolio.map(p => p.symbol.toUpperCase() === upperSymbol ? { ...p, ...item } : p);
        } else {
          newPortfolio = [...portfolio, { ...item, symbol: upperSymbol }];
        }
        set({ portfolio: newPortfolio });
        setTimeout(() => get().syncPortfolio(), 150);
      },
      removeFromPortfolio: (symbol) => {
        const { portfolio } = get();
        set({ portfolio: portfolio.filter(item => item.symbol.toUpperCase() !== symbol.toUpperCase().trim()) });
        setTimeout(() => get().syncPortfolio(), 150);
      },
      updatePortfolioItem: (symbol, updates) => {
        const { portfolio } = get();
        set({ portfolio: portfolio.map(item => item.symbol.toUpperCase() === symbol.toUpperCase().trim() ? { ...item, ...updates } : item) });
        setTimeout(() => get().syncPortfolio(), 150);
      },
      clearPortfolio: () => { set({ portfolio: [] }); setTimeout(() => get().syncPortfolio(), 150); },

      // ---------- Watchlist ----------
      setWatchlist: (watchlist) => set({ watchlist }),
      syncWatchlist: async () => {
        const { watchlist, token, _isSyncingWatchlist } = get();
        if (!token || _isSyncingWatchlist) return;
        set({ _isSyncingWatchlist: true });
        try { await updateWatchlist(watchlist); }
        catch (e) { console.warn('Watchlist sync failed:', e); }
        finally { set({ _isSyncingWatchlist: false }); }
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
        set({ watchlist: watchlist.filter(item => item.symbol.toUpperCase() !== symbol.toUpperCase().trim()) });
        setTimeout(() => get().syncWatchlist(), 150);
      },
      isInWatchlist: (symbol) => {
        const { watchlist } = get();
        return watchlist.some(item => item.symbol.toUpperCase() === symbol.toUpperCase().trim());
      },

      // ---------- Compare ----------
      setCompareList: (compareList) => set({ compareList }),
      addToCompare: (item) => {
        const { compareList } = get();
        const upperSymbol = item.symbol.toUpperCase().trim();
        if (compareList.length >= 5) return;
        if (!compareList.some(c => c.symbol.toUpperCase() === upperSymbol)) {
          set({ compareList: [...compareList, { ...item, symbol: upperSymbol }] });
        }
      },
      removeFromCompare: (symbol) => {
        const { compareList } = get();
        set({ compareList: compareList.filter(item => item.symbol.toUpperCase() !== symbol.toUpperCase().trim()) });
      },
      isInCompare: (symbol) => {
        const { compareList } = get();
        return compareList.some(item => item.symbol.toUpperCase() === symbol.toUpperCase().trim());
      },
      clearCompare: () => set({ compareList: [] }),

      // ---------- AI Chat ----------
      setChatContext: (context) => set({ chatContext: context, isChatOpen: true }),
      clearChatContext: () => set({ chatContext: null }),
      openChat: () => set({ isChatOpen: true }),
      closeChat: () => set({ isChatOpen: false }),
      toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

      // ---------- Theme & Misc ----------
      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.setAttribute('data-theme', newTheme);
          return { theme: newTheme };
        });
      },
      setTheme: (theme) => { document.documentElement.setAttribute('data-theme', theme); set({ theme }); },
      setMarket: (market) => set({ market }),
      setCurrency: (currency) => set({ currency }),
      setLoading: (isLoading) => set({ isLoading }),
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
        user: state.user, token: state.token, portfolio: state.portfolio,
        watchlist: state.watchlist, compareList: state.compareList,
        theme: state.theme, market: state.market, currency: state.currency,
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (!error && state) document.documentElement.setAttribute('data-theme', state.theme || 'dark');
        };
      },
    }
  )
);

export default useStore;