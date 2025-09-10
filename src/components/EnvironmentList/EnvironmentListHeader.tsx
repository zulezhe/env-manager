/*
 * @Author: oliver
 * @Date: 2025-09-10 13:56:02
 * @LastEditors: oliver
 * @LastEditTime: 2025-09-10 14:17:28
 * @Description: 
 */
import React from 'react';
import SearchPanel from './SearchPanel';
import { EnvironmentVariable } from '../../utils/types';

interface EnvironmentListHeaderProps {
  refreshTrigger: number;
  onSearchResults: (results: EnvironmentVariable[]) => void;
}

const EnvironmentListHeader: React.FC<EnvironmentListHeaderProps> = ({
  refreshTrigger,
  onSearchResults,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <SearchPanel onSearchResults={onSearchResults} refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default EnvironmentListHeader;