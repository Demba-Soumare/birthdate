import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

const Profile: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-2 text-white mb-6">
          <User size={24} />
          <h1 className="text-xl font-semibold">Profil</h1>
        </div>

        <div className="bg-teal-50/90 backdrop-blur-sm rounded-2xl p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-teal-600 rounded-full p-6 mb-4">
              <User size={48} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-teal-900">Mon Compte</h2>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-3 text-teal-800">
                <Mail size={20} />
                <span>{currentUser?.email}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            onClick={handleLogout}
            icon={<LogOut size={20} />}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;