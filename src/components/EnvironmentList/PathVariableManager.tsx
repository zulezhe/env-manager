import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';

interface PathItem {
  id: string;
  path: string;
  remark?: string;
  isValid?: boolean;
}

interface PathVariableManagerProps {
  variableId: string;
  variableName: string;
  pathValue: string;
  onPathUpdate: (newPathValue: string) => void;
}

const PathVariableManager: React.FC<PathVariableManagerProps> = ({
  variableId,
  variableName,
  pathValue,
  onPathUpdate
}) => {
  const [pathItems, setPathItems] = useState<PathItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPath, setEditingPath] = useState('');
  const [editingRemark, setEditingRemark] = useState('');
  const [newPath, setNewPath] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // 初始化PATH项目
  useEffect(() => {
    const paths = pathValue.split(';').filter(path => path.trim() !== '');
    const items: PathItem[] = paths.map((path, index) => ({
      id: `${variableId}_path_${index}`,
      path: path.trim(),
      remark: '',
      isValid: undefined
    }));
    setPathItems(items);
  }, [pathValue, variableId]);

  // 验证所有路径的有效性
  const validateAllPaths = async () => {
    setIsValidating(true);
    try {
      const updatedItems = await Promise.all(
        pathItems.map(async (item) => {
          try {
            const isValid = await invoke<boolean>('validate_path', { path: item.path });
            return { ...item, isValid };
          } catch {
            return { ...item, isValid: false };
          }
        })
      );
      setPathItems(updatedItems);
    } catch (error) {
      console.error('验证路径失败:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // 删除无效路径
  const removeInvalidPaths = () => {
    const validItems = pathItems.filter(item => item.isValid !== false);
    setPathItems(validItems);
    updatePathVariable(validItems);
  };

  // 更新PATH环境变量
  const updatePathVariable = (items: PathItem[]) => {
    const newPathValue = items.map(item => item.path).join(';');
    onPathUpdate(newPathValue);
  };

  // 开始编辑
  const startEdit = (item: PathItem) => {
    setEditingId(item.id);
    setEditingPath(item.path);
    setEditingRemark(item.remark || '');
  };

  // 保存编辑
  const saveEdit = () => {
    if (!editingId) return;
    
    const updatedItems = pathItems.map(item => 
      item.id === editingId 
        ? { ...item, path: editingPath, remark: editingRemark }
        : item
    );
    
    setPathItems(updatedItems);
    updatePathVariable(updatedItems);
    setEditingId(null);
    setEditingPath('');
    setEditingRemark('');
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditingPath('');
    setEditingRemark('');
  };

  // 删除路径
  const deletePath = (id: string) => {
    const updatedItems = pathItems.filter(item => item.id !== id);
    setPathItems(updatedItems);
    updatePathVariable(updatedItems);
  };

  // 添加新路径
  const addNewPath = () => {
    if (!newPath.trim()) return;
    
    const newItem: PathItem = {
      id: `${variableId}_path_${Date.now()}`,
      path: newPath.trim(),
      remark: '',
      isValid: undefined
    };
    
    const updatedItems = [...pathItems, newItem];
    setPathItems(updatedItems);
    updatePathVariable(updatedItems);
    setNewPath('');
  };

  const validCount = pathItems.filter(item => item.isValid === true).length;
  const invalidCount = pathItems.filter(item => item.isValid === false).length;
  const unvalidatedCount = pathItems.filter(item => item.isValid === undefined).length;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">
          {variableName} 路径管理 ({pathItems.length} 个路径)
        </h4>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={validateAllPaths}
            disabled={isValidating}
          >
            {isValidating ? '验证中...' : '验证路径'}
          </Button>
          {invalidCount > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  删除无效路径 ({invalidCount})
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>确认删除无效路径</AlertDialogTitle>
                  <AlertDialogDescription>
                    确定要删除 {invalidCount} 个无效路径吗？此操作无法撤销。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction onClick={removeInvalidPaths}>删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* 验证状态统计 */}
      {(validCount > 0 || invalidCount > 0) && (
        <div className="flex items-center gap-4 text-sm">
          {validCount > 0 && (
            <span className="text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              有效: {validCount}
            </span>
          )}
          {invalidCount > 0 && (
            <span className="text-red-600 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              无效: {invalidCount}
            </span>
          )}
          {unvalidatedCount > 0 && (
            <span className="text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              未验证: {unvalidatedCount}
            </span>
          )}
        </div>
      )}

      {/* 路径列表 */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {pathItems.map((item) => (
          <div key={item.id} className="bg-white p-3 rounded border">
            {editingId === item.id ? (
              // 编辑模式
              <div className="space-y-2">
                <Input
                  value={editingPath}
                  onChange={(e) => setEditingPath(e.target.value)}
                  placeholder="路径"
                  className="font-mono text-sm"
                />
                <Input
                  value={editingRemark}
                  onChange={(e) => setEditingRemark(e.target.value)}
                  placeholder="备注（可选）"
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit}>
                    <Save className="h-3 w-3 mr-1" />
                    保存
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="h-3 w-3 mr-1" />
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              // 显示模式
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {item.isValid === true && (
                      <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                    )}
                    {item.isValid === false && (
                      <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                    )}
                    {item.isValid === undefined && (
                      <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
                    )}
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded break-all flex-1">
                      {item.path}
                    </code>
                  </div>
                  {item.remark && (
                    <div className="mt-1 text-xs text-gray-600 ml-4">
                      备注: {item.remark}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 ml-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(item)}
                    className="h-6 w-6 p-0"
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除路径</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除路径 "{item.path}" 吗？此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deletePath(item.id)}>删除</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 添加新路径 */}
      <div className="flex gap-2">
        <Input
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          placeholder="添加新路径..."
          className="flex-1 font-mono text-sm"
          onKeyPress={(e) => e.key === 'Enter' && addNewPath()}
        />
        <Button onClick={addNewPath} disabled={!newPath.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          添加
        </Button>
      </div>
    </div>
  );
};

export default PathVariableManager;