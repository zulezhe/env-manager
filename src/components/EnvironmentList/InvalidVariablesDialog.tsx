import React from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { EnvironmentVariable } from '../../utils/types';

interface InvalidVariablesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invalidVariables: EnvironmentVariable[];
  onBatchDeleteInvalid: (selectedIds: string[]) => void;
}

const InvalidVariablesDialog: React.FC<InvalidVariablesDialogProps> = ({
  open,
  onOpenChange,
  invalidVariables,
  onBatchDeleteInvalid,
}) => {
  const handleDeleteSelected = () => {
    const checkboxes = document.querySelectorAll('input[id^="invalid-"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => 
      (cb as HTMLInputElement).id.replace('invalid-', '')
    );
    onBatchDeleteInvalid(selectedIds);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>发现无效的环境变量</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            检测到 {invalidVariables.length} 个无效的环境变量，请选择要删除的变量：
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {invalidVariables.map((variable) => (
              <div key={variable.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <input
                  type="checkbox"
                  id={`invalid-${variable.id}`}
                  className="mt-1"
                  defaultChecked
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor={`invalid-${variable.id}`} className="block">
                    <div className="font-medium text-sm">{variable.name}</div>
                    <div className="text-xs text-gray-500 mt-1 break-all">
                      {variable.value.length > 100 
                        ? `${variable.value.substring(0, 100)}...` 
                        : variable.value
                      }
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      类型: {variable.type === 'user' ? '用户' : '系统'}
                    </div>
                  </label>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSelected}
            >
              删除选中的变量
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvalidVariablesDialog;