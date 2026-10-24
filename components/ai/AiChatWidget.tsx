"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAiStore, AiProvider } from '../../lib/stores/aiStore';
import { useTabsStore } from '../../lib/stores/tabsStore';
import { Bot, Send, X, Settings2, Sparkles, User, RefreshCw, Loader2, Minus, Maximize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { motion, useMotionValue } from 'framer-motion';
import { apiFetch } from '@/lib/utils';

const generateId = () => {
  return typeof crypto !== 'undefined' && crypto.randomUUID 
    ? crypto.randomUUID() 
    : Math.random().toString(36).substring(2, 15);
};

export const AiChatWidget = ({ inline = false }: { inline?: boolean }) => {
  const { isOpen, toggleOpen, isTabbed, setIsTabbed, iconPosition, setIconPosition, messages, provider, setProvider, addMessage, updateMessage, isLoading, setLoading, clearHistory } = useAiStore();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Position logic
  const x = useMotionValue(iconPosition?.x || 0);
  const y = useMotionValue(iconPosition?.y || 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen || inline) {
      scrollToBottom();
    }
  }, [messages, isOpen, inline]);

  useEffect(() => {
    if (iconPosition && !inline) {
      x.set(iconPosition.x);
      y.set(iconPosition.y);
    }
  }, [iconPosition, inline, x, y]);

  // If this is the floating component, check if it's currently tabbed
  if (!inline && isTabbed) {
    return null;
  }

  // Floating Closed State (Icon)
  if (!isOpen && !inline) {
    return (
      <motion.button 
        style={{ x, y }}
        drag
        dragMomentum={false}
        onClick={toggleOpen}
        onDragEnd={(e, info) => {
          // If dropped near the top (e.g. TabBar is at the top, typically y < 80)
          if (info.point.y < 80) {
            setIsTabbed(true);
            toggleOpen(); // Make sure floating widget is closed internally
            const addTab = useTabsStore.getState().addTab;
            // Add as a tab
            addTab('دستیار هوشمند (AI)', 'general_group', <Sparkles size={16} />, 'AiChatWidget', {});
          } else {
            // Save the drop position so it doesn't snap back on state change
            setIconPosition({ x: x.get(), y: y.get() });
          }
        }}
        className="fixed bottom-6 left-6 z-50 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center group"
        title="دستیار هوشمند (AI)"
        whileHover={{ scale: 1.1 }}
      >
        <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
      </motion.button>
    );
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMsgId = generateId();
    addMessage({
      id: userMsgId,
      role: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
      status: 'success'
    });
    
    setInputValue('');
    setLoading(true);

    const asstMsgId = generateId();
    addMessage({
      id: asstMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      status: 'sending'
    });

    try {
      const response = await apiFetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputValue, 
          provider: provider,
          history: messages 
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'خطا در ارتباط با سرور هوش مصنوعی');
      }

      let cleanContent = data.reply;
      
      const actionMatch = cleanContent.match(/\[FORM_ACTION\]([\s\S]*?)\[\/FORM_ACTION\]/);
      if (actionMatch) {
        try {
          const actionData = JSON.parse(actionMatch[1]);
          if (actionData.action === 'NAVIGATE_WITH_DATA' && actionData.path) {
             let navUrl = actionData.path;
             if (actionData.data && Object.keys(actionData.data).length > 0) {
                 const encoded = encodeURIComponent(JSON.stringify(actionData.data));
                 navUrl += `?ai_data=${encoded}`;
             }
             
             // Give the user 2 seconds to read the message before routing
             setTimeout(() => {
                toggleOpen(); // Close chat
                router.push(navUrl);
             }, 2500);
          }
        } catch (e) {
          console.error("Failed to parse FORM_ACTION JSON", e);
        }
        // Remove the block from content so the user doesn't see raw JSON
        cleanContent = cleanContent.replace(/\[FORM_ACTION\][\s\S]*?\[\/FORM_ACTION\]/, '');
      }

      updateMessage(asstMsgId, {
        content: cleanContent,
        status: 'success'
      });
    } catch (err: any) {
      updateMessage(asstMsgId, {
        content: `**خطا:** ${err.message}`,
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[400px] h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 rtl">
      
      {/* Header */}
      <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight">دستیار هوشمند ERP</h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-indigo-100">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>آنلاین</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={clearHistory}
            className="p-2 hover:bg-white/20 rounded-md transition-colors text-white/80 hover:text-white"
            title="پاک کردن تاریخچه"
          >
            <RefreshCw size={16} />
          </button>
          <button 
            onClick={toggleOpen}
            className="p-2 hover:bg-red-500/80 rounded-md transition-colors text-white/80 hover:text-white"
            title="بستن"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="p-2 border-b border-gray-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2 shrink-0 text-xs">
        <Settings2 size={14} className="text-gray-500 dark:text-gray-400 ml-1" />
        <span className="text-gray-600 dark:text-gray-300 font-medium whitespace-nowrap">مدل هوش مصنوعی:</span>
        <select 
          value={provider}
          onChange={(e) => setProvider(e.target.value as AiProvider)}
          className="bg-transparent border border-gray-200 dark:border-slate-700 rounded px-2 py-1 flex-1 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-sans"
        >
          <option value="gemini">Google Gemini 1.5</option>
          <option value="chatgpt">OpenAI ChatGPT-4o</option>
          <option value="deepseek">DeepSeek Coder</option>
        </select>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-800/20">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 space-y-3 opacity-70">
            <Bot size={48} className="text-gray-300 dark:text-gray-700" />
            <p className="text-sm">سلام! من دستیار هوشمند شما هستم.<br/>چگونه می‌توانم در سیستم به شما کمک کنم؟</p>
            <div className="text-xs space-y-1 mt-4 text-left">
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-2 py-1.5 rounded-full inline-block cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => setInputValue('سند تسویه تنخواه آقای مصطفی شربتی را صادر کن')}>
                 سند تسویه تنخواه آقای مصطفی شربتی را صادر کن
              </div>
              <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-2 py-1.5 rounded-full inline-block cursor-pointer hover:border-indigo-500 transition-colors" onClick={() => setInputValue('یک فرد جدید به نام لیلا شهبازی ثبت کن')}>
                 یک فرد جدید به نام لیلا شهبازی ثبت کن
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`p-2 rounded-full h-8 w-8 shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-start' : 'items-end'} max-w-[80%]`}>
                <div className={`p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : msg.status === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
                      : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.status === 'sending' ? (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Loader2 size={14} className="animate-spin" />
                      در حال پردازش...
                    </div>
                  ) : (
                    <div className="markdown-body prose-sm rtl max-w-none text-right">
                      {msg.role === 'assistant' ? (
                        <div dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }} />
                      ) : (
                        msg.content
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="دستور خود را تایپ کنید..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl pl-3 pr-3 py-3 text-sm resize-none h-[50px] max-h-[120px] focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-muted disabled:text-muted-foreground text-white rounded-xl h-[50px] w-[50px] flex items-center justify-center shrink-0 transition-colors"
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-1" />}
          </button>
        </form>
      </div>
      
    </div>
  );
};
