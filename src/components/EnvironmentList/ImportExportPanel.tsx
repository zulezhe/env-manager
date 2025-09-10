import React, { useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { EnvironmentVariable } from '../../utils/types';
import { useToast } from '../ui/toast';

interface ImportExportPanelProps {
  onImportSuccess?: () => void;
}

const ImportExportPanel: React.FC<ImportExportPanelProps> = ({ onImportSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleExport = async () => {
    try {
      const filePath = await invoke<string>('export_environment_variables');
      console.log('Exported to:', filePath);
      addToast({
         type: 'success',
         title: '导出成功',
         description: `环境变量已导出到: ${filePath}`
       });
    } catch (error) {
      console.error('Export failed:', error);
      addToast({
         type: 'error',
         title: '导出失败',
         description: (error as Error).message
       });
    }
  };

  const handleImportClick = () => {
    // 触发文件选择对话框
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      try {
        // 使用文件路径进行导入
        const filePath = (file as any).path || file.name;
        const variables = await invoke<EnvironmentVariable[]>('import_environment_variables', {
          filePath: filePath
        });
        console.log('Imported variables:', variables);
        addToast({
           type: 'success',
           title: '导入成功',
           description: `成功导入 ${variables.length} 个环境变量`
         });
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // 调用成功回调，刷新环境变量列表
        if (onImportSuccess) {
          onImportSuccess();
        } else {
          // 如果没有回调，则刷新页面
          window.location.reload();
        }
      } catch (error) {
        console.error('Import failed:', error);
        addToast({
           type: 'error',
           title: '导入失败',
           description: (error as Error).message
         });
      }
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="file"
        ref={fileInputRef}
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
      <button
        onClick={handleExport}
        className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 cursor-pointer"
      >
        导出
      </button>
      <button
        onClick={handleImportClick}
        className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
      >
        导入
       </button>
     </div>
   );
 };
 
 export default ImportExportPanel;