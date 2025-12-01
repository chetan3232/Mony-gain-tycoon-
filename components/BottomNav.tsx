import React from 'react';
import Icon from './Icon';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
  const activeClass = isActive ? 'text-blue-brand' : 'text-gray-400';
  const activeBg = isActive ? 'bg-gray-800' : 'bg-transparent';
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full p-2 transition-all duration-200 rounded-lg ${activeClass} ${activeBg} hover:bg-gray-700`}>
      <Icon iconName={icon} className="text-2xl" />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-gray-950 border-t border-gray-700 shadow-lg z-50">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto px-2">
        <NavItem icon="fa-house" label="Home" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon="fa-briefcase" label="Business" isActive={activeTab === 'business'} onClick={() => setActiveTab('business')} />
        <NavItem icon="fa-chart-line" label="Invest" isActive={activeTab === 'invest'} onClick={() => setActiveTab('invest')} />
        <NavItem icon="fa-clipboard-check" label="Tasks" isActive={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
        <NavItem icon="fa-gem" label="Items" isActive={activeTab === 'items'} onClick={() => setActiveTab('items')} />
        <NavItem icon="fa-user" label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
      </div>
    </nav>
  );
};

export default BottomNav;
