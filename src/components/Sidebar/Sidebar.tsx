import React, { useState } from 'react';
import { Button } from '../ui/button';

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState('all');

  const menuItems = [
    { id: 'all', label: '全部变量' },
    { id: 'user', label: '用户变量' },
    { id: 'system', label: '系统变量' },
    { id: 'invalid', label: '无效变量' },
  ];

  return (
    <div className="bg-white shadow w-64 h-full p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeItem === item.id ? "secondary" : "ghost"}
            className="w-full justify-start"
            onClick={() => setActiveItem(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;