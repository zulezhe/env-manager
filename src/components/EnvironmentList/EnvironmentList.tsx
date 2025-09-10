import React, { useState, useEffect } from 'react';
import { EnvironmentVariable } from '../../utils/types';
import EnvironmentForm from '../EnvironmentForm/EnvironmentForm';
import EnvironmentListHeader from './EnvironmentListHeader';
import EnvironmentListActions from './EnvironmentListActions';
import EnvironmentSection from './EnvironmentSection';
import InvalidVariablesDialog from './InvalidVariablesDialog';
import './PathAnimation.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useToast } from '../ui/toast';
import { invoke } from '@tauri-apps/api/core';
import { mockInvoke } from '../../utils/mockData';

// 声明全局类型
declare global {
  interface Window {
    __TAURI__: any;
  }
}

// 在浏览器环境中使用模拟数据
const safeInvoke = async (command: string, args?: any) => {
  // 检查是否在Tauri环境中
  if (typeof window !== 'undefined' && window.__TAURI__ && window.__TAURI__.invoke) {
    return window.__TAURI__.invoke(command, args);
  }
  // 否则使用模拟数据
  return mockInvoke(command, args);
};

const EnvironmentList: React.FC = () => {
  const { addToast } = useToast();
  const [variables, setVariables] = useState<EnvironmentVariable[]>([]);
  const [filteredVariables, setFilteredVariables] = useState<EnvironmentVariable[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [editingVariable, setEditingVariable] = useState<EnvironmentVariable | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['user', 'system']));
  const [expandedPathVariables, setExpandedPathVariables] = useState<Set<string>>(new Set());
  const [invalidVariables, setInvalidVariables] = useState<EnvironmentVariable[]>([]);
  const [showInvalidDialog, setShowInvalidDialog] = useState(false);

  // 初始加载
  useEffect(() => {
    loadEnvironmentVariables();
  }, []);

  const loadEnvironmentVariables = async () => {
    try {
      setIsLoading(true);
      const result = await safeInvoke('get_environment_variables') as EnvironmentVariable[];
      setVariables(result);
    } catch (error) {
      console.error('Failed to load environment variables:', error);
      addToast({
        title: '加载失败',
        description: '无法加载环境变量列表',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results: EnvironmentVariable[]) => {
    setVariables(results);
  };

  const isPathVariable = (variable: EnvironmentVariable) => {
    const pathVariableNames = ['PATH', 'CLASSPATH', 'PYTHONPATH', 'PYTHON_PATH', 'PATHEXT'];
    return variable?.name && pathVariableNames.includes(variable.name.toUpperCase()) && variable.value?.includes(';');
  };

  // 更新filteredVariables为展开后的变量
  useEffect(() => {
    const expandedVariables = variables.reduce<(EnvironmentVariable & { parentName?: string; isPathParent?: boolean })[]>((acc, variable) => {
      if (isPathVariable(variable)) {
        // 添加PATH父节点
        acc.push({
          ...variable,
          isPathParent: true
        });

        // 添加PATH子节点（总是添加，但通过CSS控制显示）
        const paths = variable.value.split(';').filter(path => path.trim() !== '');
        const pathItems = paths.map((path, index) => ({
          id: `${variable.id}_path_${index}`,
          name: path.trim(),
          value: path.trim(),
          type: variable.type,
          remark: variable.remark,
          parentName: variable.name,
          createdAt: variable.createdAt,
          updatedAt: variable.updatedAt,
          isValid: variable.isValid
        }));
        acc.push(...pathItems);
      } else {
        acc.push(variable);
      }
      return acc;
    }, []);

    setFilteredVariables(expandedVariables);
  }, [variables, expandedPathVariables]);

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
      await safeInvoke('update_environment_variable', {
        id: editingVariable.id,
        variable: updatedVariable
      });

      addToast({
        title: '更新成功',
        description: `环境变量 "${updatedVariable.name}" 已更新`,
        variant: 'default',
      });

      setIsEditDialogOpen(false);
      setEditingVariable(null);
      loadEnvironmentVariables();
    } catch (error) {
      console.error('Failed to update environment variable:', error);
      addToast({
        title: '更新失败',
        description: '无法更新环境变量',
        variant: 'destructive',
      });
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
    if (!deleteId) return;

    try {
      await safeInvoke('delete_environment_variable', { id: deleteId });
      addToast({
        title: '删除成功',
        description: '环境变量已删除',
        variant: 'default',
      });
      loadEnvironmentVariables();
    } catch (error) {
      console.error('Failed to delete environment variable:', error);
      addToast({
        title: '删除失败',
        description: '无法删除环境变量',
        variant: 'destructive',
      });
    } finally {
      setDeleteId(null);
    }
  };

  const handleValidateAll = async () => {
    try {
      setIsValidating(true);
      const result = await safeInvoke('validate_all_environment_variables') as EnvironmentVariable[];

      const invalidVars = result.filter(v => v.isValid === false);

      if (invalidVars.length > 0) {
        setInvalidVariables(invalidVars);
        setShowInvalidDialog(true);
        addToast({
          title: '验证完成',
          description: `发现 ${invalidVars.length} 个无效的环境变量`,
          variant: 'destructive',
        });
      } else {
        addToast({
          title: '验证完成',
          description: '所有环境变量都是有效的',
          variant: 'default',
        });
      }

      setVariables(result);
    } catch (error) {
      console.error('Failed to validate environment variables:', error);
      addToast({
        title: '验证失败',
        description: '无法验证环境变量',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleDeleteInvalidVariables = async () => {
    const invalidVars = variables.filter(v => v.isValid === false);
    if (invalidVars.length === 0) return;

    setInvalidVariables(invalidVars);
    setShowInvalidDialog(true);
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const togglePathVariable = (variableId: string) => {
    const newExpanded = new Set(expandedPathVariables);
    if (newExpanded.has(variableId)) {
      newExpanded.delete(variableId);
    } else {
      newExpanded.add(variableId);
    }
    setExpandedPathVariables(newExpanded);
  };

  const handleBatchDeleteInvalid = async (selectedIds: string[]) => {
    try {
      await Promise.all(
        selectedIds.map(id => safeInvoke('delete_environment_variable', { id }))
      );

      addToast({
        title: '删除成功',
        description: `已删除 ${selectedIds.length} 个无效的环境变量`,
        variant: 'default',
      });

      setShowInvalidDialog(false);
      loadEnvironmentVariables();
    } catch (error) {
      console.error('Failed to delete invalid variables:', error);
      addToast({
        title: '删除失败',
        description: '无法删除无效的环境变量',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* 顶部标题和搜索区域 */}
        <EnvironmentListHeader
          refreshTrigger={refreshTrigger}
          onSearchResults={handleSearchResults}
        />

        {/* 环境变量列表区域 */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b flex justify-between">
            <h3 className="text-lg font-medium text-gray-700">环境变量列表</h3>
            {/* 底部操作区域 */}
            <EnvironmentListActions
              isLoading={isLoading}
              isValidating={isValidating}
              variables={variables}
              onRefresh={handleRefresh}
              onValidateAll={handleValidateAll}
              onDeleteInvalidVariables={handleDeleteInvalidVariables}
              onImportSuccess={loadEnvironmentVariables}
            />
          </div>
          <div className="h-96 min-h-48 max-h-screen overflow-y-auto resize-y" style={{ resize: 'vertical' }}>
            {filteredVariables.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {isLoading ? '正在加载环境变量...' : '暂无环境变量'}
              </div>
            ) : (
              <div>
                {/* 用户环境变量 */}
                <EnvironmentSection
                  title="用户环境变量"
                  type="user"
                  variables={filteredVariables.filter(v => v.type === 'user')}
                  allVariables={variables}
                  expandedSections={expandedSections}
                  expandedPathVariables={expandedPathVariables}
                  onToggleSection={toggleSection}
                  onTogglePathVariable={togglePathVariable}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  confirmDelete={confirmDelete}
                  isPathVariable={isPathVariable}
                />

                {/* 系统环境变量 */}
                <EnvironmentSection
                  title="系统环境变量"
                  type="system"
                  variables={filteredVariables.filter(v => v.type === 'system')}
                  allVariables={variables}
                  expandedSections={expandedSections}
                  expandedPathVariables={expandedPathVariables}
                  onToggleSection={toggleSection}
                  onTogglePathVariable={togglePathVariable}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  confirmDelete={confirmDelete}
                  isPathVariable={isPathVariable}
                />
              </div>
            )}
          </div>
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

        {/* 无效变量对话框 */}
        <InvalidVariablesDialog
          open={showInvalidDialog}
          onOpenChange={setShowInvalidDialog}
          invalidVariables={invalidVariables}
          onBatchDelete={handleBatchDeleteInvalid}
        />
      </div>
    </>
  );
};

export default EnvironmentList;