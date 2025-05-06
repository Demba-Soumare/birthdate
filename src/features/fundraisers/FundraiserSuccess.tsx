import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../../components/Button';

const FundraiserSuccess: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full text-center">
        <div className="bg-teal-100 rounded-full p-3 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
          <Check size={32} className="text-teal-600" />
        </div>
        <h1 className="text-2xl font-bold text-teal-900 mb-4">
          Merci pour votre contribution !
        </h1>
        <p className="text-teal-600 mb-8">
          Votre paiement a été traité avec succès. Un email de confirmation vous sera envoyé prochainement.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => navigate(`/fundraiser/${id}`)}
            fullWidth
            className="bg-teal-600 text-white hover:bg-teal-700"
          >
            Retour à la cagnotte
          </Button>
          <Button
            onClick={() => navigate('/home')}
            variant="outline"
            fullWidth
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FundraiserSuccess;