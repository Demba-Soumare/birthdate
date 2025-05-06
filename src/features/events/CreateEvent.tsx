import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Calendar, Heart, GlassWater, AlertCircle, Image as ImageIcon, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent } from '../../services/eventService';
import { EventTypeCategory } from '../../types';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Button from '../../components/Button';

const CreateEvent: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [eventType, setEventType] = useState<EventTypeCategory>('Birthday');
  const [hasFundraiser, setHasFundraiser] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const eventTypes: EventTypeCategory[] = ['Birthday', 'Wedding', 'Anniversary', 'Baby', 'Other'];

  const getEventTypeLabel = (type: EventTypeCategory): string => {
    switch (type) {
      case 'Birthday': return 'Anniversaire';
      case 'Wedding': return 'Mariage';
      case 'Anniversary': return 'Célébration';
      case 'Baby': return 'Naissance';
      default: return 'Autre';
    }
  };

  const getEventIcon = (type: EventTypeCategory) => {
    switch (type) {
      case 'Birthday':
        return <Gift className="text-white" size={20} />;
      case 'Wedding':
        return <Heart className="text-white" size={20} />;
      case 'Anniversary':
        return <Calendar className="text-white" size={20} />;
      default:
        return <GlassWater className="text-white" size={20} />;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 5 Mo');
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const storageRef = ref(storage, `events/${currentUser?.uid}/${Date.now()}_${file.name}`);
    
    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      throw new Error('Impossible d\'uploader l\'image');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (!title || !date) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    try {
      setIsLoading(true);
      setError('');
      
      let imageUrl = '';
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          setError('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
          setIsLoading(false);
          return;
        }
      }
      
      const eventData = {
        title,
        date: new Date(date),
        type: eventType,
        hasFundraiser,
        userId: currentUser.uid,
        createdAt: new Date(),
        imageUrl,
      };
      
      await createEvent(eventData);
      navigate('/home');
    } catch (err: any) {
      console.error('Erreur lors de la création de l\'événement:', err);
      setError(err.message || 'Échec de la création de l\'événement');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto pb-8">
      <div className="bg-teal-600 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center gap-2 text-white mb-6">
          <Gift size={24} />
          <h1 className="text-xl font-semibold">Nouvel événement</h1>
        </div>

        <div className="bg-teal-50/90 backdrop-blur-sm rounded-2xl p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-center gap-2 text-red-700 border border-red-200">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-teal-900 mb-2">
                Titre de l'événement *
              </label>
              <input
                id="title"
                type="text"
                className="block w-full px-4 py-3 bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                placeholder="Ex: Anniversaire de Maman"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-teal-900 mb-2">
                Date de l'événement *
              </label>
              <input
                id="date"
                type="date"
                className="block w-full px-4 py-3 bg-white border border-teal-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-teal-900 mb-2">
                Type d'événement
              </label>
              <div className="grid grid-cols-2 gap-3">
                {eventTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                      eventType === type
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-teal-900 border-teal-200 hover:bg-teal-50'
                    }`}
                    onClick={() => setEventType(type)}
                  >
                    <div className={`rounded-full p-1.5 ${eventType === type ? 'bg-teal-500' : 'bg-teal-100'}`}>
                      {getEventIcon(type)}
                    </div>
                    <span className="text-sm font-medium">{getEventTypeLabel(type)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-teal-900 mb-2">
                Image de l'événement
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-teal-200 border-dashed rounded-xl bg-white transition-colors hover:border-teal-300">
                <div className="space-y-2 text-center">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Aperçu"
                        className="max-h-32 rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon
                        className="mx-auto h-12 w-12 text-teal-400"
                        aria-hidden="true"
                      />
                      <div className="flex text-sm text-teal-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                        >
                          <span>Télécharger une image</span>
                          <input
                            id="image-upload"
                            ref={fileInputRef}
                            name="image-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageSelect}
                          />
                        </label>
                      </div>
                      <p className="text-xs text-teal-500">
                        PNG, JPG, GIF jusqu'à 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center bg-white p-4 rounded-xl border border-teal-200">
              <input
                id="hasFundraiser"
                type="checkbox"
                className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-teal-300 rounded transition-colors"
                checked={hasFundraiser}
                onChange={(e) => setHasFundraiser(e.target.checked)}
              />
              <label htmlFor="hasFundraiser" className="ml-3 block text-sm text-teal-900">
                Activer une cagnotte pour cet événement
              </label>
            </div>
          </form>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate(-1)}
            className="bg-white text-teal-700 hover:bg-teal-50"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            fullWidth
            isLoading={isLoading}
            className="bg-teal-700 text-white hover:bg-teal-800"
          >
            Créer l'événement
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;