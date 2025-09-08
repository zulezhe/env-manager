import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface EnvironmentVariable {
  id: string;
  name: string;
  value: string;
  type: 'user' | 'system';
  remark?: string;
  createdAt: number;
  updatedAt: number;
  isValid: boolean;
}

interface SearchQuery {
  nameKeyword?: string;
  remarkKeyword?: string;
  types?: string[];
}

interface SearchPanelProps {
  onSearchResults: (results: EnvironmentVariable[]) => void;
  refreshTrigger?: number;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearchResults, refreshTrigger }) => {
  const [nameKeyword, setNameKeyword] = useState('');
  const [remarkKeyword, setRemarkKeyword] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['user', 'system']);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      const query: SearchQuery = {
        nameKeyword: nameKeyword || null,
        remarkKeyword: remarkKeyword || null,
        types: selectedTypes.length > 0 ? selectedTypes : null,
      };
      
      const results = await invoke<EnvironmentVariable[]>('search_environment_variables', {
        query
      });
      
      console.log('Search results:', results);
      onSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      alert('搜索失败: ' + (error as Error).message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = async () => {
    setNameKeyword('');
    setRemarkKeyword('');
    setSelectedTypes(['user', 'system']);
    
    try {
      // 重置时获取所有环境变量
      const allVariables = await invoke<EnvironmentVariable[]>('get_environment_variables');
      onSearchResults(allVariables);
    } catch (error) {
      console.error('Failed to reset search:', error);
      alert('重置搜索失败: ' + (error as Error).message);
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // 监听刷新触发器，重置搜索状态
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      handleReset();
    }
  }, [refreshTrigger]);

  return (
    <div className="bg-white shadow sm:rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">搜索环境变量</h3>
        <form className="mt-5 space-y-4" onSubmit={handleSearch}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="name-keyword" className="block text-sm font-medium text-gray-700">
                名称关键字
              </label>
              <input
                type="text"
                id="name-keyword"
                value={nameKeyword}
                onChange={(e) => setNameKeyword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="remark-keyword" className="block text-sm font-medium text-gray-700">
                备注关键字
              </label>
              <input
                type="text"
                id="remark-keyword"
                value={remarkKeyword}
                onChange={(e) => setRemarkKeyword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                变量类型
              </label>
              <div className="mt-1 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes('user')}
                    onChange={() => handleTypeChange('user')}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">用户变量</span>
                </label>
                <label className="inline-flex items-center ml-4">
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
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              type="submit"
              disabled={isSearching}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '搜索中...' : '搜索'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              重置
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchPanel;