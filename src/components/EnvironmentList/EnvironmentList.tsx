import React, { useEffect } from 'react';
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
import { useEnvStore } from '../../store/envStore';

// 声明全局类型


// 直接使用Tauri的invoke函数获取真实环境变量
const safeInvoke = async (command: string, args?: any) => {
  return await invoke(command, args);
};

const EnvironmentList: React.FC = () => {
  const { addToast } = useToast();
  const {
    variables, setVariables, filteredVariables, setFilteredVariables,
    deleteId, setDeleteId, isLoading, setIsLoading, isValidating, setIsValidating,
    refreshTrigger, setRefreshTrigger, editingVariable, setEditingVariable,
    isEditDialogOpen, setIsEditDialogOpen, expandedSections, setExpandedSections,
    expandedPathVariables, setExpandedPathVariables, invalidVariables, setInvalidVariables,
    showInvalidDialog, setShowInvalidDialog, loadEnvironmentVariables,
    toggleSection, togglePathVariable
  } = useEnvStore();

  // 初始加载
  useEffect(() => {
    loadEnvironmentVariables();
  }, []);

  // 当变量加载完成后，自动展开系统PATH变量
  useEffect(() => {
    if (variables.length > 0) {
      const pathVariables = variables.filter(v => isPathVariable(v) && v.type === 'system');
      if (pathVariables.length > 0) {
        const newExpanded = new Set(expandedPathVariables);
        pathVariables.forEach(v => {
          if (v.name.toUpperCase() === 'PATH') {
            newExpanded.add(v.id);
          }
        });
        setExpandedPathVariables(newExpanded);
      }
    }
  }, [variables, setExpandedPathVariables]);

  const loadEnvironmentVariables = async () => {
    try {
      setIsLoading(true);
      const result = await safeInvoke('get_environment_variables') as EnvironmentVariable[];
      setVariables(result);
    } catch (error) {
      console.error('Failed to load environment variables:', error);
      addToast({
        type: 'error',
        title: '加载失败',
        description: '无法加载环境变量列表',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchResults = (results: EnvironmentVariable[]) => {
    setVariables(results);
  };

  const isPathVariable = (variable: EnvironmentVariable): boolean => {
    const pathVariableNames = ['PATH', 'CLASSPATH', 'PYTHONPATH', 'PYTHON_PATH', 'PATHEXT'];
    return !!(variable?.name && pathVariableNames.includes(variable.name.toUpperCase()) && variable.value?.includes(';'));
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
          createdAt: variable.createdAt || '',
          updatedAt: variable.updatedAt || '',
          isValid: variable.isValid
        }));
        acc.push(...pathItems);
      } else {
        acc.push(variable);
      }
      return acc;
    }, []);

    setFilteredVariables(expandedVariables);
  }, [variables, expandedPathVariables, setFilteredVariables]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    loadEnvironmentVariables();
  };

  // 从 Zustand Store 中获取 toggleSection 和 togglePathVariable

  const handleEdit = (id: string) => {
    // 检查是否是PATH子节点
    if (id.includes('_path_')) {
      // 对于PATH子节点，创建一个只包含当前路径值的临时变量
      const parentId = id.split('_path_')[0];
      const pathIndex = parseInt(id.split('_path_')[1]);
      const parentVariable = variables.find(v => v.id === parentId);
      
      if (parentVariable) {
        const paths = parentVariable.value.split(';').filter(path => path.trim() !== '');
        const currentPath = paths[pathIndex] || '';
        
        // 创建临时变量对象，只包含当前路径值
        const tempVariable = {
          ...parentVariable,
          id: id, // 使用子节点ID
          name: `${parentVariable.name} - 路径项 ${pathIndex + 1}`,
          value: currentPath.trim(),
          remark: `PATH变量中的第 ${pathIndex + 1} 个路径项`
        };
        
        setEditingVariable(tempVariable);
        setIsEditDialogOpen(true);
      }
    } else {
      // 普通变量直接编辑
      const variable = variables.find(v => v.id === id);
      if (variable) {
        setEditingVariable(variable);
        setIsEditDialogOpen(true);
      }
    }
  };

  const handleEditSubmit = async (updatedVariable: Omit<EnvironmentVariable, 'id' | 'createdAt' | 'updatedAt' | 'isValid'>) => {
    if (!editingVariable) return;

    try {
      // 检查是否是PATH子节点的编辑
      if (editingVariable.id.includes('_path_')) {
        // PATH子节点编辑：更新父变量中的特定路径项
        const parentId = editingVariable.id.split('_path_')[0];
        const pathIndex = parseInt(editingVariable.id.split('_path_')[1]);
        const parentVariable = variables.find(v => v.id === parentId);
        
        if (parentVariable) {
          const paths = parentVariable.value.split(';').filter(path => path.trim() !== '');
          paths[pathIndex] = updatedVariable.value.trim();
          
          // 更新父变量
          await safeInvoke('update_environment_variable', {
            id: parentId,
            variable: {
              ...parentVariable,
              value: paths.join(';')
            }
          });
          
          addToast({
            type: 'success',
            title: '更新成功',
            description: `PATH路径项已更新`,
          });
        }
      } else {
        // 普通变量编辑
        await safeInvoke('update_environment_variable', {
          id: editingVariable.id,
          variable: updatedVariable
        });

        addToast({
          type: 'success',
          title: '更新成功',
          description: `环境变量 "${updatedVariable.name}" 已更新`,
        });
      }

      setIsEditDialogOpen(false);
      setEditingVariable(null);
      loadEnvironmentVariables();
    } catch (error) {
      console.error('Failed to update environment variable:', error);
      addToast({
        type: 'error',
        title: '更新失败',
        description: '无法更新环境变量',
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
        type: 'success',
        title: '删除成功',
        description: '环境变量已删除',
      });
      loadEnvironmentVariables();
    } catch (error) {
      console.error('Failed to delete environment variable:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        description: '无法删除环境变量',
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
          type: 'error',
          title: '验证完成',
          description: `发现 ${invalidVars.length} 个无效的环境变量`,
        });
      } else {
        addToast({
          type: 'success',
          title: '验证完成',
          description: '所有环境变量都是有效的',
        });
      }

      // 验证完成后重新加载真实的环境变量数据，而不是使用验证结果
      await loadEnvironmentVariables();
    } catch (error) {
      console.error('Failed to validate environment variables:', error);
      addToast({
        type: 'error',
        title: '验证失败',
        description: '无法验证环境变量',
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
    console.log('Toggling PATH variable:', variableId, 'Current expanded:', expandedPathVariables.has(variableId));
    const newExpanded = new Set(expandedPathVariables);
    if (newExpanded.has(variableId)) {
      newExpanded.delete(variableId);
    } else {
      newExpanded.add(variableId);
    }
    setExpandedPathVariables(newExpanded);
    console.log('New expanded state:', newExpanded.has(variableId));
  };

  const handleBatchDeleteInvalid = async (selectedIds: string[]) => {
    try {
      await Promise.all(
        selectedIds.map(id => safeInvoke('delete_environment_variable', { id }))
      );

      addToast({
        type: 'success',
        title: '删除成功',
        description: `已删除 ${selectedIds.length} 个无效的环境变量`,
      });

      setShowInvalidDialog(false);
      loadEnvironmentVariables();
    } catch (error) {
      console.error('Failed to delete invalid variables:', error);
      addToast({
        type: 'error',
        title: '删除失败',
        description: '无法删除无效的环境变量',
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
          <div className="overflow-y-auto resize-y" style={{ 
            resize: 'vertical',
            height: 'calc(100vh - 280px)',
            minHeight: '300px',
            maxHeight: 'calc(100vh - 200px)'
          }}>
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