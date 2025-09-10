import React, { createContext, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 检测系统主题
const getSystemTheme = (): ResolvedTheme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

// 解析主题
const resolveTheme = (theme: Theme): ResolvedTheme => {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
};

// 应用主题到DOM
const applyTheme = (resolvedTheme: ResolvedTheme) => {
  const root = document.documentElement;
  
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // 加载保存的主题设置
  useEffect(() => {
    const loadTheme = async () => {
    try {
      // 检查是否在真正的Tauri环境中（不是开发环境）
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke && !window.location.hostname.includes('localhost')) {
        try {
          const result = await window.__TAURI__.invoke('get_settings');
          const savedTheme = result.theme || 'system';
          setThemeState(savedTheme);
          const resolved = resolveTheme(savedTheme);
          setResolvedTheme(resolved);
          applyTheme(resolved);
          return;
        } catch (tauriError) {
          console.warn('Tauri command failed, falling back to localStorage:', tauriError);
        }
      }
      
      // 开发环境fallback或Tauri调用失败时的fallback
      const savedTheme = (localStorage.getItem('theme') as Theme) || 'system';
      setThemeState(savedTheme);
      const resolved = resolveTheme(savedTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch (error) {
      console.error('Failed to load theme:', error);
      // 使用默认主题
      const resolved = resolveTheme('system');
      setResolvedTheme(resolved);
      applyTheme(resolved);
    }
  };

    loadTheme();
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const resolved = getSystemTheme();
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = async (newTheme: Theme) => {
    try {
      // 检查是否在Tauri环境中
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke) {
        // 保存到后端
        const currentSettings = await window.__TAURI__.invoke('get_settings');
        await window.__TAURI__.invoke('save_settings', {
          settings: {
            ...currentSettings,
            theme: newTheme
          }
        });
      } else {
        // 开发环境fallback - 保存到localStorage
        localStorage.setItem('theme', newTheme);
      }
      
      // 更新状态
      setThemeState(newTheme);
      const resolved = resolveTheme(newTheme);
      setResolvedTheme(resolved);
      applyTheme(resolved);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};