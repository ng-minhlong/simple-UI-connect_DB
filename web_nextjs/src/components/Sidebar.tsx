'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, CheckSquare } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { path: '/plan', label: 'Lập Kế Hoạch', icon: ClipboardList },
    { path: '/actual', label: 'Nhập Thực Tế', icon: CheckSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-black min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-black">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="w-8 h-8" />
          <h1 className="text-xl font-bold">Quản Lý SX</h1>
        </div>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
