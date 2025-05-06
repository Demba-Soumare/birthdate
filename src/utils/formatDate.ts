import { format, differenceInDays, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDate = (date: Date): string => {
  return format(date, 'd MMMM yyyy', { locale: fr });
};

export const getCountdown = (date: Date): number => {
  const today = new Date();
  
  today.setHours(0, 0, 0, 0);
  const eventDate = new Date(date);
  eventDate.setHours(0, 0, 0, 0);
  
  if (isBefore(eventDate, today)) {
    const nextYear = new Date(eventDate);
    nextYear.setFullYear(today.getFullYear() + 1);
    return differenceInDays(nextYear, today);
  }
  
  return differenceInDays(eventDate, today);
};

export const formatCountdown = (days: number): string => {
  if (days === 0) {
    return "Aujourd'hui !";
  } else if (days === 1) {
    return 'Demain !';
  } else {
    return `${days} jours`;
  }
};