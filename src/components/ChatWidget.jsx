import React, { useState, useRef, useEffect } from 'react';
import useStore from '../store/useStore';
import { sendChatMessage } from '../services/api';

const GENERIC_PROMPTS = [
  "What is a safe dividend yield?",
  "Explain payout ratio",
  "How does DRIP work?",
  "What's the difference between REITs and dividend stocks?",
];

const buildStockPrompts = (ctx) => {
  const name = ctx.name || ctx.symbol;
  const shortName = name.split(' ')[0];
  return [
    `Why is ${shortName}'s yield ${ctx.yield ? ctx.yield.toFixed(2) + '%' : 'at this level'}?`,
    `Is ${shortName}'s dividend safe?`,
    `Explain ${shortName}'s payout ratio`,
    `What does ${shortName}'s safety score mean?`,
  ];
};

const buildPortfolioPrompts = () => [
  "What's my total annual dividend income?",
  "Which holding has the highest yield?",
  "Which holding contributes the most income?",
  "How many holdings do I have?",
];

const ChatWidget = () => {
  const { isChatOpen, chatContext, setChatContext, clearChatContext, toggleChat } = useStore();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isChatOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isChatOpen]);

  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [chatContext?.symbol, chatContext?.type]);

  const handleSend = async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const data = await sendChatMessage(newMessages, chatContext);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: data.reply,
          suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
        },
      ]);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    clearChatContext();
  };

  const isPortfolio = chatContext?.type === 'portfolio';
  const isStock = !isPortfolio && chatContext?.symbol;

  const initialPrompts = isPortfolio
    ? buildPortfolioPrompts()
    : isStock
      ? buildStockPrompts(chatContext)
      : GENERIC_PROMPTS;

  const contextLabel = isPortfolio
    ? `My Portfolio (${chatContext.holdings?.length || 0})`
    : isStock
      ? chatContext.symbol
      : null;

  const placeholder = isPortfolio
    ? 'Ask about your portfolio...'
    : isStock
      ? `Ask about ${chatContext.symbol}...`
      : 'Ask about dividends...';

  // Get the last assistant's suggestions (if any)
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
  const followUpSuggestions = lastAssistantMessage?.suggestions?.length > 0
    ? lastAssistantMessage.suggestions
    : null;

  return (
    <>
      <button
        onClick={toggleChat}
        aria-label="Ask DividendBro AI"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-accent-blue to-accent-teal text-white shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
      >
        {isChatOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {isChatOpen && (
        <div className="fixed bottom-36 md:bottom-24 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] max-w-md h-[70vh] max-h-[600px] bg-bg-secondary border border-border/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-gradient-to-r from-accent-blue/10 to-accent-teal/5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-blue to-accent-teal flex items-center justify-center text-white font-black text-xs">
                D
              </div>
              <div>
                <p className="text-sm font-bold text-text-primary leading-tight">DividendBro AI</p>
                <p className="text-[10px] text-text-muted">Educational assistant</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-[10px] font-bold uppercase tracking-wider text-text-muted hover:text-accent-red transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Context Chip */}
          {contextLabel && (
            <div className={`px-4 py-2 border-b flex items-center justify-between ${isPortfolio ? 'bg-accent-purple/5 border-accent-purple/10' : 'bg-accent-blue/5 border-accent-blue/10'}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isPortfolio ? 'text-accent-purple' : 'text-accent-blue'}`}>
                  {isPortfolio ? '💼 Asking about' : '📊 Asking about'}
                </span>
                <span className="text-xs font-bold text-text-primary truncate">
                  {contextLabel}
                </span>
                {isStock && chatContext.yield != null && (
                  <span className="text-[10px] text-accent-teal font-bold flex-shrink-0">
                    {chatContext.yield.toFixed(2)}%
                  </span>
                )}
              </div>
              <button
                onClick={clearChatContext}
                className="text-[10px] text-text-muted hover:text-accent-red transition-colors flex-shrink-0 ml-2"
                title="Remove context"
              >
                ✕
              </button>
            </div>
          )}

          {/* Disclaimer */}
          <div className="px-4 py-1.5 bg-accent-yellow/5 border-b border-accent-yellow/10">
            <p className="text-[10px] text-accent-yellow font-medium leading-tight">
              ⚠️ Educational only. Not financial advice.
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs text-text-muted text-center">
                  {isPortfolio
                    ? 'Ask me anything about your portfolio:'
                    : isStock
                      ? `Ask me anything about ${chatContext.name || chatContext.symbol}:`
                      : "Hi! I'm here to help you understand dividend investing. Try one of these:"}
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {initialPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleSend(prompt)}
                      className="text-left text-xs px-3 py-2.5 bg-bg-surface border border-border/40 rounded-xl hover:border-accent-blue/40 hover:bg-bg-surface-hover transition-all text-text-secondary"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => {
              const isLastAssistant =
                msg.role === 'assistant' &&
                idx === messages.length - 1 &&
                msg.suggestions?.length > 0;

              return (
                <div key={idx} className="space-y-2">
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-accent-blue text-white rounded-br-md'
                          : 'bg-bg-surface border border-border/40 text-text-secondary rounded-bl-md'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {/* ✅ Follow-up suggestions under the last AI response */}
                  {isLastAssistant && (
                    <div className="ml-1 pt-1">
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mb-2">
                        Suggested follow-ups
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(s)}
                            disabled={isLoading}
                            className="text-[11px] px-2.5 py-1.5 bg-bg-surface border border-border/40 rounded-lg hover:border-accent-blue/40 hover:bg-bg-surface-hover transition-all text-text-secondary disabled:opacity-50 text-left"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-bg-surface border border-border/40 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="text-xs text-accent-red bg-accent-red/5 border border-accent-red/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="px-3 py-3 border-t border-border/40 bg-bg-primary/40">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholder}
                disabled={isLoading}
                className="flex-1 bg-bg-surface border border-border/60 rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder-text-muted/60 focus:outline-none focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/10 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2.5 bg-gradient-to-r from-accent-blue to-accent-teal text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;