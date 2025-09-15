import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useToast } from '../ui/toast';

interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  type: 'user' | 'system';
  remark?: string;
  createdAt: string;
  updatedAt: string;
  isValid: boolean;
}

interface SearchQuery {
  nameKeyword?: string;
  valueKeyword?: string;
  remarkKeyword?: string;
  types?: string[];
}

interface SearchPanelProps {
  onSearchResults: (results: EnvironmentVariable[]) => void;
  refreshTrigger?: number;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearchResults, refreshTrigger }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['user', 'system']);
  const [isSearching, setIsSearching] = useState(false);
  const { addToast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      const query: SearchQuery = {
        nameKeyword: keyword || undefined,
        valueKeyword: keyword || undefined,
        remarkKeyword: keyword || undefined,
        types: selectedTypes.length > 0 ? selectedTypes : undefined,
      };
      
      const results = await invoke<EnvironmentVariable[]>('search_environment_variables', {
        query
      });
      
      console.log('Search results:', results);
      onSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      addToast({
         type: 'error',
         title: '搜索失败',
         description: (error as Error).message
       });
    } finally {
      setIsSearching(false);
    }
  };


  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  return (
    <div className="bg-white shadow sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">搜索环境变量</h3>
        <form className="mt-5" onSubmit={handleSearch}>
          <div className="flex flex-wrap items-end gap-4">
            {/* 搜索关键字 */}
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-1">
                搜索关键字（名称、值或备注）
              </label>
              <input
                type="text"
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入名称、值或备注关键字"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            {/* 变量类型 */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                变量类型
              </label>
              <div className="flex items-center space-x-4 h-10">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('user')}
                    onChange={() => handleTypeChange('user')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">用户变量</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('system')}
                    onChange={() => handleTypeChange('system')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">系统变量</span>
                </label>
              </div>
            </div>
            
            {/* 操作按钮 */}
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={isSearching}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? '搜索中...' : '搜索'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchPanel;