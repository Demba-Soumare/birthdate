import { Timestamp } from 'firebase/firestore';

// Interface pour un participant à la cagnotte
export interface Participant {
  userId: string;
  amount: number;
  message?: string;
  createdAt: Date;
}

// Interface pour les détails de la cagnotte
export interface FundraiserDetails {
  targetAmount: number;
  description: string;
  endDate: Date;
  currentAmount: number;
  participants: Participant[];
  paymentLinkUrl?: string;
}

// Interface principale pour un événement
export interface EventType {
  id: string;
  title: string;
  date: Date;
  type: string;
  hasFundraiser: boolean;
  userId: string;
  createdAt: Date;
  imageUrl?: string;
  fundraiserDetails?: FundraiserDetails;
} 