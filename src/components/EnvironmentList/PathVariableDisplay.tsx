import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';

interface PathVariableDisplayProps {
  value: string;
  maxPreviewLength?: number;
}

const PathVariableDisplay: React.FC<PathVariableDisplayProps> = ({ 
  value, 
  maxPreviewLength = 100 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 检查是否是PATH类型的变量（包含分号分隔的路径）
  const isPathVariable = value.includes(';') && value.length > maxPreviewLength;
  
  if (!isPathVariable) {
    // 对于非PATH变量，使用原来的显示方式
    return <span className="truncate">{value}</span>;
  }
  
  // 分割PATH变量为单独的路径
  const paths = value.split(';').filter(path => path.trim() !== '');
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  if (!isExpanded) {
    // 折叠状态：显示前几个路径和总数
    const previewPaths = paths.slice(0, 2);
    const remainingCount = paths.length - previewPaths.length;
    
    return (
      <div className="flex items-center gap-2 group">
        <div className="flex-1">
          <div className="text-sm text-gray-600">
            {previewPaths.map((path, index) => (
              <div key={index} className="truncate font-mono text-xs bg-gray-50 px-2 py-1 rounded mb-1 last:mb-0">
                {path}
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-gray-300 rounded-full"></span>
                还有 {remainingCount} 个路径...
              </div>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="flex-shrink-0 p-1 h-6 w-6 opacity-60 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight className="h-3 w-3 transition-transform" />
        </Button>
      </div>
    );
  }
  
  // 展开状态：显示所有路径
  return (
    <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
      <div className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
        <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
          PATH 路径列表 ({paths.length} 个)
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleExpanded}
          className="flex-shrink-0 p-1 h-6 w-6 hover:bg-blue-100"
        >
          <ChevronDown className="h-3 w-3 transition-transform" />
        </Button>
      </div>
      <div className="max-h-48 overflow-y-auto border rounded-md bg-white shadow-sm">
        {paths.map((path, index) => (
          <div 
            key={index} 
            className="text-xs text-gray-700 py-2 px-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 group"
          >
            <div className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 bg-gray-400 rounded-full group-hover:bg-blue-400 transition-colors"></span>
              <span className="font-mono break-all flex-1">{path}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PathVariableDisplay;