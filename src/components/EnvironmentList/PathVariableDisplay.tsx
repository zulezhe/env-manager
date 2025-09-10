import React from 'react';

interface PathVariableDisplayProps {
  value: string;
}

const PathVariableDisplay: React.FC<PathVariableDisplayProps> = ({ value }) => {
  // 检查是否是PATH类型的变量（包含分号分隔的路径）
  const isPathVariable = value.includes(';') && value.length > 50;
  
  if (!isPathVariable) {
    return <span className="text-sm text-gray-600">{value}</span>;
  }
  
  // 分割路径
  const paths = value.split(';').filter(path => path.trim() !== '');
  
  if (paths.length <= 2) {
    return <span className="text-sm text-gray-600">{value}</span>;
  }
  
  // 对于PATH变量，显示路径数量和前几个路径的预览
  return (
    <div className="w-full">
      <span className="text-sm text-gray-600">
        {paths.length} 个路径: {paths.slice(0, 2).join('; ')}
        {paths.length > 2 && '...'}
      </span>
    </div>
  );
};

export default PathVariableDisplay;