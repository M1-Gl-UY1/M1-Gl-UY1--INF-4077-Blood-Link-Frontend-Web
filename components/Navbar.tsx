import React from 'react';
import { User, Home, Droplet, LogOut, Menu } from 'lucide-react';
import { AppView, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export const Navbar: React.FC<Props> = ({ currentView, onNavigate, onLogout }) => {
  const { user } = useAuth();
  
  const navItemClass = (view: AppView) => 
    `cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${currentView === view ? 'text-red-500 bg-red-50 font-medium' : 'text-gray-500 hover:text-gray-800'}`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate(AppView.DASHBOARD)}>
             <span className="text-[#EF5350] font-bold text-xl flex items-center gap-2">
                BloodLink
             </span>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button 
              className={navItemClass(AppView.DASHBOARD)}
              onClick={() => onNavigate(AppView.DASHBOARD)}
            >
              <Home size={18} />
              <span>Accueil</span>
            </button>
            
            {user?.role === UserRole.DONOR && (
              <button 
                className={navItemClass(AppView.MEDICAL_FOLDER)}
                onClick={() => onNavigate(AppView.MEDICAL_FOLDER)}
              >
                <Droplet size={18} />
                <span>Dons effectués</span>
              </button>
            )}

            <button 
              className={navItemClass(AppView.PROFILE)}
              onClick={() => onNavigate(AppView.PROFILE)}
            >
              <User size={18} />
              <span>Profil</span>
            </button>

            <div className="h-6 w-px bg-gray-200 mx-2"></div>

            <button 
              className="text-gray-400 hover:text-red-500 p-2"
              onClick={onLogout}
              title="Déconnexion"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="flex items-center md:hidden text-gray-500">
            <Menu size={24} />
          </div>
        </div>
      </div>
    </nav>
  );
};