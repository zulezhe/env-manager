import React from 'react';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';
import ImportExportPanel from './ImportExportPanel';
import { EnvironmentVariable } from '../../utils/types';

interface EnvironmentListActionsProps {
  isLoading: boolean;
  isValidating: boolean;
  variables: EnvironmentVariable[];
  onRefresh: () => void;
  onValidateAll: () => void;
  onDeleteInvalidVariables: () => void;
  onImportSuccess: () => void;
}

const EnvironmentListActions: React.FC<EnvironmentListActionsProps> = ({
  isLoading,
  isValidating,
  variables,
  onRefresh,
  onValidateAll,
  onDeleteInvalidVariables,
  onImportSuccess,
}) => {
  const invalidVariablesCount = variables.filter(v => v.isValid === false).length;

  return (
     <div className="flex gap-2 items-center justify-center">
        <ImportExportPanel onImportSuccess={onImportSuccess} />
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="cursor-pointer hover:cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? '加载中...' : '刷新'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onValidateAll}
          disabled={isValidating || variables.length === 0}
          className="cursor-pointer hover:cursor-pointer"
        >
          {isValidating ? '验证中...' : '验证所有'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDeleteInvalidVariables}
          disabled={invalidVariablesCount === 0}
          className="cursor-pointer hover:cursor-pointer"
        >
          删除无效变量
        </Button>
      </div>
  );
};

export default EnvironmentListActions;