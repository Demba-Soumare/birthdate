import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Users, Calendar, ChevronRight, User, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

interface UserInfo {
  displayName: string;
  birthdate: string;
}

const OnboardingStep: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  onAction: () => void;
  onSkip?: () => void;
  children?: React.ReactNode;
}> = ({ title, description, icon, action, onAction, onSkip, children }) => (
  <div className="max-w-md mx-auto h-full flex flex-col">
    <div className="bg-teal-600 rounded-3xl p-6 shadow-lg flex-1 flex flex-col">
      <div className="flex-1">
        <div className="bg-teal-50/90 backdrop-blur-sm rounded-2xl p-8">
          <div className="text-center">
            <div className="inline-flex justify-center items-center w-20 h-20 rounded-full bg-teal-600 mb-6">
              {icon}
            </div>
            <h2 className="text-xl font-semibold text-teal-900 mb-4">{title}</h2>
            <p className="text-teal-700 mb-6">{description}</p>
          </div>
          {children}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={onAction}
          className="w-full bg-teal-700 text-white rounded-xl py-3 font-medium hover:bg-teal-800 transition-colors flex items-center justify-center gap-2"
        >
          {action}
          <ChevronRight size={20} />
        </button>
        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full bg-transparent text-teal-50 py-2 font-medium hover:text-white transition-colors"
          >
            Passer
          </button>
        )}
      </div>
    </div>
  </div>
);

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const { currentUser, updateUserOnboardingStatus } = useAuth();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    displayName: '',
    birthdate: '',
  });
  const [error, setError] = useState('');

  const handleComplete = async () => {
    await updateUserOnboardingStatus();
    navigate('/home');
  };

  const handleUserInfoSubmit = () => {
    if (!userInfo.displayName.trim()) {
      setError('Veuillez entrer votre nom');
      return;
    }
    if (!userInfo.birthdate) {
      setError('Veuillez entrer votre date de naissance');
      return;
    }
    setError('');
    setStep(1);
  };

  const steps = [
    {
      title: "Bienvenue sur Birthdate !",
      description: "Pour commencer, dites-nous en un peu plus sur vous",
      icon: <User size={32} className="text-white" />,
      action: "Continuer",
      onAction: handleUserInfoSubmit,
      content: (
        <div className="space-y-4 mt-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-teal-900 mb-1">
              Votre nom
            </label>
            <input
              type="text"
              value={userInfo.displayName}
              onChange={(e) => setUserInfo(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-teal-900 mb-1">
              Votre date de naissance
            </label>
            <input
              type="date"
              value={userInfo.birthdate}
              onChange={(e) => setUserInfo(prev => ({ ...prev, birthdate: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-teal-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>
      ),
    },
    {
      title: "Ne ratez plus jamais un moment spécial",
      description: "Birthdate vous aide à ne jamais oublier les anniversaires, mariages et autres moments précieux.",
      icon: <Gift size={32} className="text-white" />,
      action: "Continuer",
      onAction: () => setStep(2),
    },
    {
      title: "Organisez des cagnottes en un clic",
      description: "Créez facilement des cagnottes pour offrir des cadeaux ensemble.",
      icon: <Users size={32} className="text-white" />,
      action: "Continuer",
      onAction: () => setStep(3),
    },
    {
      title: "Ajoutez votre premier événement",
      description: "Prêt(e) à créer votre premier événement ? C'est rapide et facile !",
      icon: <Calendar size={32} className="text-white" />,
      action: "Ajouter un événement",
      onAction: handleComplete,
      onSkip: handleComplete,
    },
  ];

  const currentStep = steps[step];

  return (
    <div className="min-h-screen bg-teal-50 p-4 flex items-center">
      <OnboardingStep {...currentStep}>
        {currentStep.content}
      </OnboardingStep>
    </div>
  );
};

export default Onboarding;