import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    try {
      setError('');
      setIsLoading(true);
      await register(email, password);
      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Échec de la création du compte');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-teal-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center items-center size-16 rounded-full bg-teal-600 text-white mb-4">
            <Calendar size={32} />
          </div>
          <h1 className="text-3xl font-bold text-teal-900">Rejoignez Birthdate</h1>
          <p className="text-teal-600 mt-2">Créez votre compte pour commencer</p>
        </div>
        
        <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-teal-900 mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-teal-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-teal-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="votre.email@exemple.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-teal-900 mb-1" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-teal-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-teal-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="••••••••"
                />
              </div>
              <p className="mt-1 text-xs text-teal-500">
                Le mot de passe doit contenir au moins 6 caractères
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-teal-900 mb-1" htmlFor="confirmPassword">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-teal-400" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-teal-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              className="bg-teal-600 hover:bg-teal-700"
            >
              Créer un compte
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-teal-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;