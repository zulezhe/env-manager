import React, { useState, useEffect } from 'react';
import { EnvironmentVariable } from '../../utils/types';
import SearchPanel from './SearchPanel';
import ImportExportPanel from './ImportExportPanel';
import PathVariableDisplay from './PathVariableDisplay';
import EnvironmentForm from '../EnvironmentForm/EnvironmentForm';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

// 声明Tauri全局对象类型
declare global {
  interface Window {
    __TAURI__?: any;
  }
}

const EnvironmentList: React.FC = () => {
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [filteredVariables, setFilteredVariables] = useState<EnvironmentVariable[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // 加载环境变量
  useEffect(() => {
    loadEnvironmentVariables();
  }, []);

  const loadEnvironmentVariables = async () => {
    setIsLoading(true);
    try {
      // 检查是否在Tauri环境中
      if (typeof window !== 'undefined' && window.__TAURI__) {
        const vars = await invoke<EnvironmentVariable[]>('get_environment_variables');
        setVariables(vars);
        setFilteredVariables(vars);
      } else {
        // 在浏览器环境中显示模拟数据
        const mockVars: EnvironmentVariable[] = [
          {
            id: 'system_PATH',
            name: 'PATH',
            value: 'C:\\Windows\\system32;C:\\Windows;C:\\Windows\\System32\\Wbem;C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\;C:\\Program Files\\Git\\cmd;C:\\Program Files\\nodejs\\;C:\\Users\\User\\AppData\\Roaming\\npm;C:\\Program Files\\Docker\\Docker\\resources\\bin;C:\\ProgramData\\DockerDesktop\\version-bin',
            type: 'system',
            remark: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isValid: true
          },
          {
            id: 'user_TEMP',
            name: 'TEMP',
            value: 'C:\\Users\\User\\AppData\\Local\\Temp',
            type: 'user',
            remark: null,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isValid: true
          }
        ];
        setVariables(mockVars);
        setFilteredVariables(mockVars);
      }
    } catch (error) {
      console.error('Failed to load environment variables:', error);
      alert('加载环境变量失败: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results: EnvironmentVariable[]) => {
    setFilteredVariables(results);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    loadEnvironmentVariables();
  };

  const handleEdit = (id: string) => {
    const variable = variables.find(v => v.id === id);
    if (variable) {
      setEditingVariable(variable);
      setIsEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async (updatedVariable: Omit<EnvironmentVariable, 'id' | 'createdAt' | 'updatedAt' | 'isValid'>) => {
    if (!editingVariable) return;
    
    try {
      await invoke<void>('update_environment_variable', {
        id: editingVariable.id,
        name: updatedVariable.name,
        value: updatedVariable.value,
        varType: updatedVariable.type,
        remark: updatedVariable.remark || null,
      });
      
      setIsEditDialogOpen(false);
      setEditingVariable(null);
      await loadEnvironmentVariables();
      alert('环境变量更新成功');
    } catch (error) {
      console.error('Failed to update environment variable:', error);
      alert('更新环境变量失败: ' + (error as Error).message);
    }
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingVariable(null);
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await invoke<void>('delete_environment_variable', { id: deleteId });
        // 重新加载环境变量列表
        await loadEnvironmentVariables();
        alert('环境变量删除成功');
      } catch (error) {
        console.error('Failed to delete environment variable:', error);
        alert('删除环境变量失败: ' + (error as Error).message);
      } finally {
        setDeleteId(null);
      }
    }
  };

  const handleValidateAll = async () => {
    setIsValidating(true);
    try {
      // 验证所有环境变量
      const validationResults = await Promise.all(
        variables.map(async (variable) => {
          try {
            const isValid = await invoke<boolean>('validate_environment_variable', {
              id: variable.id,
            });
            return { ...variable, isValid };
          } catch {
            return { ...variable, isValid: false };
          }
        })
      );
      
      setVariables(validationResults);
      setFilteredVariables(validationResults);
      alert('环境变量有效性检测完成');
    } catch (error) {
      console.error('Validation failed:', error);
      alert('环境变量检测失败: ' + (error as Error).message);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <SearchPanel onSearchResults={handleSearchResults} refreshTrigger={refreshTrigger} />
      
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">环境变量列表</h2>
          <div className="flex gap-2 items-center">
            <ImportExportPanel onImportSuccess={loadEnvironmentVariables} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? '加载中...' : '刷新'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleValidateAll}
              disabled={isValidating || variables.length === 0}
            >
              {isValidating ? '验证中...' : '验证所有'}
            </Button>
          </div>
        </div>
        {filteredVariables.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {isLoading ? '正在加载环境变量...' : '暂无环境变量'}
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredVariables.map((variable) => (
            <li key={variable.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center text-sm">
                    <p className="font-medium text-indigo-600 truncate">{variable.name}</p>
                    <p className="ml-2 flex-shrink-0 font-normal text-gray-500">
                      ({variable.type === 'user' ? '用户' : '系统'})
                    </p>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500 w-full">
                      <PathVariableDisplay value={variable.value} />
                    </div>
                  </div>
                  {variable.remark && (
                    <div className="mt-1 flex">
                      <div className="flex items-center text-sm text-gray-400">
                        <span>备注: {variable.remark}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(variable.id)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(variable.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除环境变量 "{variable.name}" 吗？此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </li>
          ))}
          </ul>
        )}
      </div>
      
      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑环境变量</DialogTitle>
          </DialogHeader>
          {editingVariable && (
            <EnvironmentForm
              variable={editingVariable}
              onSubmit={handleEditSubmit}
              onCancel={handleEditCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnvironmentList;