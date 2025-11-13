import React from 'react';
import { Button } from '../ui/button';
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
import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { EnvironmentVariable } from '../../utils/types';

interface EnvironmentVariableItemProps {
  variable: EnvironmentVariable & { parentName?: string; isPathParent?: boolean };
  isExpanded?: boolean;
  expandedPathVariables: Set<string>;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePathVariable: (variableId: string) => void;
  confirmDelete: () => void;
}

const EnvironmentVariableItem: React.FC<EnvironmentVariableItemProps> = ({
  variable,
  isExpanded = true,
  expandedPathVariables,
  onEdit,
  onDelete,
  onTogglePathVariable,
  confirmDelete,
}) => {
  return (
    <li 
      className={variable.parentName 
        ? 'px-8 py-2 bg-gray-50 border-l-2 border-blue-200 sm:px-6' 
        : 'px-4 py-4 sm:px-6'}
    >
      <div 
        className={`flex items-center justify-between ${variable.isPathParent ? 'cursor-pointer hover:bg-gray-50 transition-colors duration-200' : ''}`}
        onClick={variable.isPathParent ? (e) => {
          e.preventDefault();
          e.stopPropagation();
          onTogglePathVariable(variable.id);
        } : undefined}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center text-sm">
            <p className="font-medium text-indigo-600 truncate">{variable.name}</p>
            {variable.isPathParent && (
              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                {variable.name.toUpperCase()} ({variable.value.split(';').filter(p => p.trim()).length} 项)
              </span>
            )}
            {variable.parentName && (
              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                {variable.parentName}
              </span>
            )}
            {!variable.isPathParent && (
              <p className="ml-2 flex-shrink-0 font-normal text-gray-500">
                ({variable.type === 'user' ? '用户' : '系统'})
              </p>
            )}
          </div>
          {!variable.isPathParent && (
            <div className="mt-2 flex">
              <div className="flex items-center text-sm text-gray-500 w-full">
                <span className="break-all">{variable.value}</span>
              </div>
            </div>
          )}
          {variable.remark && (
            <div className="mt-1 flex">
              <div className="flex items-center text-sm text-gray-400">
                <span>备注: {variable.remark}</span>
              </div>
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0 flex space-x-2">
          {variable.isPathParent ? (
            <div className="flex items-center">
              {expandedPathVariables.has(variable.id) ? (
                <ChevronUp className="h-4 w-4 text-gray-600 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600 transition-transform duration-200" />
              )}
            </div>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(variable.id);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(variable.id);
                    }}
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
            </>
          )}
        </div>
      </div>
    </li>
  );
};

export default EnvironmentVariableItem;