import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, CheckSquare } from 'lucide-react';
import PlanPage from './routes/PlanPage';
import ActualPage from './routes/thuchien';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Lập Kế Hoạch', icon: ClipboardList },
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
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
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

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <main className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<PlanPage />} />
            <Route path="/actual" element={<ActualPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
