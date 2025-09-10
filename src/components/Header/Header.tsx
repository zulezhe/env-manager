/*
 * @Author: oliver
 * @Date: 2025-09-08 11:38:27
 * @LastEditors: oliver
 * @LastEditTime: 2025-09-10 10:11:10
 * @Description: 
 */
import React from 'react';
import { Button } from '../ui/button';
import { RefreshCw, ShieldCheck } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">环境变量管理器</h1>
        <div className="flex space-x-4">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button>
            <ShieldCheck className="mr-2 h-4 w-4" />
            检测
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;