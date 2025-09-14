import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { EnvironmentVariable } from '../../utils/types';
import EnvironmentVariableItem from './EnvironmentVariableItem';
import './PathAnimation.css';

interface EnvironmentSectionProps {
  title: string;
  type: 'user' | 'system';
  variables: (EnvironmentVariable & { parentName?: string; isPathParent?: boolean })[];
  allVariables: EnvironmentVariable[];
  expandedSections: Set<string>;
  expandedPathVariables: Set<string>;
  onToggleSection: (section: string) => void;
  onTogglePathVariable: (variableId: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  confirmDelete: () => void;
  isPathVariable: (variable: EnvironmentVariable) => boolean;
}

const EnvironmentSection: React.FC<EnvironmentSectionProps> = ({
  title,
  type,
  variables,
  allVariables,
  expandedSections,
  expandedPathVariables,
  onToggleSection,
  onTogglePathVariable,
  onEdit,
  onDelete,
  confirmDelete,
  isPathVariable,
}) => {
  const sectionVariables = variables.filter(v => v.type === type);
  
  if (sectionVariables.length === 0) {
    return null;
  }

  const sectionConfig = {
    user: {
      title: '用户环境变量',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
    },
    system: {
      title: '系统环境变量',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
    },
  };

  const config = sectionConfig[type];

  return (
    <div>
      <div 
        className={`px-4 py-2 ${config.bgColor} border-b cursor-pointer ${config.hoverColor} flex items-center justify-between`}
        onClick={() => onToggleSection(type)}
      >
        <h4 className={`text-sm font-medium ${config.textColor}`}>
          {title} ({sectionVariables.length})
        </h4>
        {expandedSections.has(type) ? (
          <ChevronUp className={`h-4 w-4 ${config.iconColor}`} />
        ) : (
          <ChevronDown className={`h-4 w-4 ${config.iconColor}`} />
        )}
      </div>
      {expandedSections.has(type) && (
        <ul className="divide-y divide-gray-200">
          {sectionVariables.map((variable) => {
            const isPathChild = variable.parentName && isPathVariable(allVariables.find(v => v.name === variable.parentName) || {} as EnvironmentVariable);
            const parentVariable = isPathChild ? allVariables.find(v => v.name === variable.parentName) : null;
            const isExpanded = isPathChild && parentVariable ? expandedPathVariables.has(parentVariable.id) : true;
            
            // PATH子节点使用动画容器
            if (isPathChild) {
              return (
                <div 
                  key={variable.id}
                  className={`path-children ${
                    isExpanded ? 'path-children-expanded' : 'path-children-collapsed'
                  }`}
                >
                  <EnvironmentVariableItem
                    variable={variable}
                    isExpanded={isExpanded}
                    expandedPathVariables={expandedPathVariables}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onTogglePathVariable={onTogglePathVariable}
                    confirmDelete={confirmDelete}
                  />
                </div>
              );
            }
            
            return (
              <EnvironmentVariableItem
                key={variable.id}
                variable={variable}
                isExpanded={isExpanded}
                expandedPathVariables={expandedPathVariables}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePathVariable={onTogglePathVariable}
                confirmDelete={confirmDelete}
              />
            );
          })
          }
        </ul>
      )}
    </div>
  );
};

export default EnvironmentSection;