import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, Home, Plus, LogOut, Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-teal-50">
      <header className="bg-teal-600 py-4 px-4 fixed top-0 left-0 right-0 z-30">
        <div className="container mx-auto max-w-5xl flex justify-between items-center">
          <div className="w-10" /> {/* Spacer pour centrer le logo */}
          <div className="flex items-center gap-3 text-white absolute left-1/2 -translate-x-1/2">
            <Gift size={28} />
            <h1 className="text-2xl font-bold">Birthdate</h1>
          </div>
          
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-sm text-teal-50">
                {currentUser.email}
              </div>
              <div className="hidden md:block">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  icon={<LogOut size={16} />}
                  className="text-white border-white hover:bg-teal-700"
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-1 container mx-auto max-w-5xl p-4 mb-20 md:mb-0 mt-20">
        <Outlet />
      </main>
      
      {currentUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-teal-600 shadow-lg">
          <div className="flex justify-around items-center h-16">
            <button 
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive('/home') ? 'text-white' : 'text-teal-200'
              }`}
              onClick={() => navigate('/home')}
            >
              <Home size={20} />
              <span className="text-xs mt-1">Accueil</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive('/my-events') ? 'text-white' : 'text-teal-200'
              }`}
              onClick={() => navigate('/my-events')}
            >
              <Calendar size={20} />
              <span className="text-xs mt-1">Événements</span>
            </button>
            <button 
              className="flex flex-col items-center justify-center w-full h-full bg-teal-700 text-white rounded-full shadow-lg -mt-8 pb-1"
              onClick={() => navigate('/create-event')}
            >
              <Plus size={24} />
              <span className="text-xs mt-1">Ajouter</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive('/fundraisers') ? 'text-white' : 'text-teal-200'
              }`}
              onClick={() => navigate('/fundraisers')}
            >
              <Gift size={20} />
              <span className="text-xs mt-1">Cagnottes</span>
            </button>
            <button 
              className={`flex flex-col items-center justify-center w-full h-full ${
                isActive('/profile') ? 'text-white' : 'text-teal-200'
              }`}
              onClick={() => navigate('/profile')}
            >
              <User size={20} />
              <span className="text-xs mt-1">Profil</span>
            </button>
          </div>
        </nav>
      )}
      
      {currentUser && (
        <div className="hidden md:block fixed left-4 top-24 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="flex flex-col">
            <button 
              className={`flex items-center gap-3 p-4 hover:bg-teal-50 ${
                isActive('/home') ? 'text-teal-600 border-l-4 border-teal-600 pl-3' : 'text-gray-600'
              }`}
              onClick={() => navigate('/home')}
            >
              <Home size={20} />
              <span>Accueil</span>
            </button>
            <button 
              className={`flex items-center gap-3 p-4 hover:bg-teal-50 ${
                isActive('/my-events') ? 'text-teal-600 border-l-4 border-teal-600 pl-3' : 'text-gray-600'
              }`}
              onClick={() => navigate('/my-events')}
            >
              <Calendar size={20} />
              <span>Mes Événements</span>
            </button>
            <button 
              className={`flex items-center gap-3 p-4 hover:bg-teal-50 ${
                isActive('/fundraisers') ? 'text-teal-600 border-l-4 border-teal-600 pl-3' : 'text-gray-600'
              }`}
              onClick={() => navigate('/fundraisers')}
            >
              <Gift size={20} />
              <span>Cagnottes</span>
            </button>
            <button 
              className={`flex items-center gap-3 p-4 hover:bg-teal-50 ${
                isActive('/profile') ? 'text-teal-600 border-l-4 border-teal-600 pl-3' : 'text-gray-600'
              }`}
              onClick={() => navigate('/profile')}
            >
              <User size={20} />
              <span>Profil</span>
            </button>
          </div>
        </div>
      )}
      
      {currentUser && (
        <div className="hidden md:block fixed right-8 bottom-8">
          <Button 
            onClick={() => navigate('/create-event')}
            icon={<Plus size={20} />}
            className="rounded-full h-14 w-14 !p-0 bg-teal-600 hover:bg-teal-700"
          >
            <span className="sr-only">Ajouter un événement</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Layout;