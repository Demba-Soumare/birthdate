import React from 'react';
import { Gift, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventType } from '../types';
import { formatDate, getCountdown, formatCountdown } from '../utils/formatDate';
import Button from './Button';

interface EventCardProps {
  event: EventType;
  isPrimary?: boolean;
}

const getEventIcon = (type: EventType['type']) => {
  switch (type) {
    case 'Birthday':
      return <Calendar size={20} className="text-teal-500" />;
    case 'Wedding':
      return <Calendar size={20} className="text-teal-500" />;
    case 'Anniversary':
      return <Calendar size={20} className="text-teal-500" />;
    case 'Baby':
      return <Calendar size={20} className="text-teal-500" />;
    default:
      return <Calendar size={20} className="text-teal-500" />;
  }
};

const getEventTypeLabel = (type: EventType['type']): string => {
  switch (type) {
    case 'Birthday':
      return 'Anniversaire';
    case 'Wedding':
      return 'Mariage';
    case 'Anniversary':
      return 'Célébration';
    case 'Baby':
      return 'Naissance';
    default:
      return 'Autre';
  }
};

const EventCard: React.FC<EventCardProps> = ({ event, isPrimary = false }) => {
  const navigate = useNavigate();
  const daysLeft = getCountdown(event.date);
  const formattedCountdown = formatCountdown(daysLeft);
  
  const bgColors = {
    'Birthday': 'bg-teal-50 border-teal-200',
    'Wedding': 'bg-teal-50 border-teal-200',
    'Anniversary': 'bg-teal-50 border-teal-200',
    'Baby': 'bg-teal-50 border-teal-200',
    'Other': 'bg-teal-50 border-teal-200',
  };
  
  const handleCardClick = () => {
    navigate(`/event/${event.id}`);
  };
  
  const handleFundraiserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/fundraiser/${event.id}`);
  };
  
  if (isPrimary) {
    return (
      <div 
        className={`rounded-xl shadow-md overflow-hidden border transition-all duration-300 hover:shadow-lg cursor-pointer ${bgColors[event.type] || bgColors.Other}`}
        onClick={handleCardClick}
      >
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {getEventIcon(event.type)}
                <span className="text-sm font-medium text-teal-600">{getEventTypeLabel(event.type)}</span>
              </div>
              <h3 className="text-xl font-bold text-teal-900 mb-2">{event.title}</h3>
              <p className="text-teal-600 mb-4">{formatDate(event.date)}</p>
              
              <div className="bg-white/60 rounded-lg p-3 inline-block">
                <div className="text-sm text-teal-600 mb-1">Compte à rebours</div>
                <div className="text-2xl font-bold text-teal-700">{formattedCountdown}</div>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-xs text-teal-500 mb-2">Voir les détails</span>
              <ChevronRight size={20} className="text-teal-400" />
            </div>
          </div>
          
          {event.hasFundraiser && (
            <div className="mt-6">
              <Button 
                variant="outline"
                size="sm"
                onClick={handleFundraiserClick}
                icon={<Gift size={16} />}
                className="w-full border-teal-200 text-teal-700 hover:bg-teal-50"
              >
                Voir la cagnotte
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`rounded-lg shadow-sm border overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer ${bgColors[event.type] || bgColors.Other}`}
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              {getEventIcon(event.type)}
              <span className="text-xs font-medium text-teal-600">{getEventTypeLabel(event.type)}</span>
            </div>
            <h3 className="text-base font-semibold text-teal-900">{event.title}</h3>
            <p className="text-sm text-teal-600">{formatDate(event.date)}</p>
          </div>
          
          <div className="bg-white/60 rounded-lg p-2">
            <div className="text-xs text-teal-600">Dans</div>
            <div className="text-lg font-bold text-teal-700">{formattedCountdown}</div>
          </div>
        </div>
        
        {event.hasFundraiser && (
          <div className="mt-3 flex justify-end">
            <Button 
              variant="text"
              size="sm"
              onClick={handleFundraiserClick}
              icon={<Gift size={14} />}
              className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
            >
              Cagnotte
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;