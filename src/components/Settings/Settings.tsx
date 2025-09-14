import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { useToast } from '../ui/toast';
import { useTheme } from '../../contexts/ThemeContext';
import { Settings as SettingsIcon, Palette, Keyboard, Power } from 'lucide-react';

interface SettingsData {
  theme: 'light' | 'dark' | 'system';
  autoStart: boolean;
  showHotkey: string;
}

const Settings: React.FC = () => {
  const { addToast } = useToast();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'system',
    autoStart: false,
    showHotkey: 'Ctrl+Shift+E'
  });
  const [isLoading, setIsLoading] = useState(false);

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, []);

  // 同步主题状态
  useEffect(() => {
    if (settings.theme !== theme) {
      setSettings(prev => ({ ...prev, theme }));
    }
  }, [theme]);

  const loadSettings = async () => {
    try {
      // 检查是否在真正的Tauri环境中
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke && !window.location.hostname.includes('localhost')) {
        try {
          const savedSettings = await window.__TAURI__.invoke('get_settings');
          setSettings(savedSettings);
          return;
        } catch (tauriError) {
          console.warn('Tauri load failed, falling back to localStorage:', tauriError);
        }
      }
      
      // 开发环境fallback或Tauri调用失败时的fallback
      const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
      const savedAutoStart = localStorage.getItem('autoStart') === 'true';
      const savedHotkey = localStorage.getItem('showHotkey') || 'Ctrl+Shift+E';
      setSettings({
         theme: savedTheme,
         autoStart: savedAutoStart,
         showHotkey: savedHotkey
       });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async (newSettings: SettingsData) => {
    setIsLoading(true);
    try {
      // 检查是否在真正的Tauri环境中
      if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke && !window.location.hostname.includes('localhost')) {
        try {
          await window.__TAURI__.invoke('save_settings', { settings: newSettings });
        } catch (tauriError) {
          console.warn('Tauri save failed, falling back to localStorage:', tauriError);
          // Fallback to localStorage
          localStorage.setItem('theme', newSettings.theme);
          localStorage.setItem('autoStart', newSettings.autoStart.toString());
          localStorage.setItem('showHotkey', newSettings.showHotkey);
        }
      } else {
        // 开发环境fallback
        localStorage.setItem('theme', newSettings.theme);
        localStorage.setItem('autoStart', newSettings.autoStart.toString());
        localStorage.setItem('showHotkey', newSettings.showHotkey);
      }
      
      setSettings(newSettings);
      addToast({
        type: 'success',
        title: '设置已保存',
        description: '所有设置已成功保存',
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        description: '无法保存设置，请重试',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      const updatedSettings = { ...settings, theme: newTheme };
      
      // 检查是否在Tauri环境中
       if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke) {
         await window.__TAURI__.invoke('save_settings', { settings: updatedSettings });
      } else {
        // 开发环境fallback
        localStorage.setItem('theme', newTheme);
        localStorage.setItem('autoStart', updatedSettings.autoStart.toString());
        localStorage.setItem('showHotkey', updatedSettings.showHotkey);
      }
      
      setSettings(updatedSettings);
      setTheme(newTheme); // 更新主题上下文
      addToast({
        type: 'success',
        title: '主题已更新',
        description: `已切换到${newTheme === 'light' ? '亮色' : newTheme === 'dark' ? '暗色' : '跟随系统'}主题`,
      });
    } catch (error) {
      console.error('保存主题设置失败:', error);
      addToast({
        type: 'error',
        title: '保存失败',
        description: '无法保存主题设置',
      });
    }
  };

  const handleAutoStartChange = (autoStart: boolean) => {
    const newSettings = { ...settings, autoStart };
    saveSettings(newSettings);
  };

  const handleHotkeyChange = (showHotkey: string) => {
    const newSettings = { ...settings, showHotkey };
    saveSettings(newSettings);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">设置</h1>
      </div>

      {/* 主题设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>主题设置</span>
          </CardTitle>
          <CardDescription>
            选择应用程序的外观主题
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="theme-select">主题模式</Label>
            <Select value={settings.theme} onValueChange={handleThemeChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="选择主题" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">浅色主题</SelectItem>
                <SelectItem value="dark">深色主题</SelectItem>
                <SelectItem value="system">跟随系统</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* 快捷键设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Keyboard className="h-5 w-5" />
            <span>快捷键设置</span>
          </CardTitle>
          <CardDescription>
            设置显示/隐藏应用程序的快捷键
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="hotkey-input">显示快捷键</Label>
            <Input
              id="hotkey-input"
              value={settings.showHotkey}
              onChange={(e) => handleHotkeyChange(e.target.value)}
              className="w-48"
              placeholder="Ctrl+Shift+E"
            />
          </div>
          <p className="text-sm text-gray-500">
            支持的修饰键：Ctrl, Shift, Alt, Meta
          </p>
        </CardContent>
      </Card>

      {/* 启动设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Power className="h-5 w-5" />
            <span>启动设置</span>
          </CardTitle>
          <CardDescription>
            配置应用程序的启动行为
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-start">开机自启</Label>
              <p className="text-sm text-gray-500">
                系统启动时自动运行应用程序
              </p>
            </div>
            <Switch
              id="auto-start"
              checked={settings.autoStart}
              onCheckedChange={handleAutoStartChange}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* 操作按钮 */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={loadSettings}>
          重置
        </Button>
        <Button onClick={() => saveSettings(settings)} disabled={isLoading}>
          {isLoading ? '保存中...' : '保存设置'}
        </Button>
      </div>
    </div>
  );
};

export default Settings;