export type EventTypeCategory = 'Birthday' | 'Wedding' | 'Anniversary' | 'Baby' | 'Other';

export interface FundraiserParticipant {
  userId: string;
  amount: number;
  message?: string;
  createdAt: Date;
}

export interface FundraiserDetails {
  targetAmount: number;
  currentAmount: number;
  description: string;
  endDate: Date;
  participants: FundraiserParticipant[];
}

export interface EventType {
  id: string;
  title: string;
  date: Date;
  type: EventTypeCategory;
  hasFundraiser: boolean;
  fundraiserDetails?: FundraiserDetails;
  userId: string;
  createdAt: Date;
  imageUrl?: string;
}

export interface User {
  stripeAccountId: any;
  uid: string;
  email: string;
  displayName?: string;
  hasCompletedOnboarding?: boolean;
}

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserOnboardingStatus: () => Promise<void>;
}