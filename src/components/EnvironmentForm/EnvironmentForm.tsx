import React, { useState } from 'react';
import { EnvironmentVariable } from '../../utils/types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { open } from '@tauri-apps/plugin-dialog';
import { FolderOpen } from 'lucide-react';

interface EnvironmentFormProps {
  variable?: EnvironmentVariable;
  onSubmit: (variable: Omit<EnvironmentVariable, 'id' | 'createdAt' | 'updatedAt' | 'isValid'>) => void;
  onCancel: () => void;
}

const EnvironmentForm: React.FC<EnvironmentFormProps> = ({ variable, onSubmit, onCancel }) => {
  const [name, setName] = useState(variable?.name || '');
  const [value, setValue] = useState(variable?.value || '');
  const [type, setType] = useState<'user' | 'system'>(variable?.type || 'user');
  const [remark, setRemark] = useState(variable?.remark || '');

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: '选择文件夹路径'
      });
      
      if (selected && typeof selected === 'string') {
        setValue(selected);
      }
    } catch (error) {
      console.error('选择文件夹失败:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      value,
      type,
      remark,
    });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {variable ? '编辑环境变量' : '添加环境变量'}
        </h3>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="value">值</Label>
            <div className="flex space-x-2">
              <Input
                id="value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectFolder}
                className="px-3"
              >
                <FolderOpen className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">类型</Label>
            <Select value={type} onValueChange={(value: 'user' | 'system') => setType(value)}>
              <SelectTrigger id="type">
                <SelectValue placeholder="选择类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">用户变量</SelectItem>
                <SelectItem value="system">系统变量</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="remark">备注</Label>
            <Input
              id="remark"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              取消
            </Button>
            <Button type="submit">
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnvironmentForm;