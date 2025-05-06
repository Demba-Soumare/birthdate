import { getFunctions, httpsCallable } from 'firebase/functions';

export const createStripeConnectAccount = async (userId: string, email: string) => {
  try {
    const functions = getFunctions();
    const createAccount = httpsCallable(functions, 'createStripeConnectAccount');
    
    const result = await createAccount({ userId, email });
    return result.data as { accountLink: string };
  } catch (error: any) {
    console.error('Error creating Stripe Connect account:', error);
    throw new Error(error.message || 'Failed to create Stripe Connect account');
  }
};

export const createCheckoutSession = async (eventId: string, amount: number, message?: string) => {
  try {
    if (!eventId || typeof eventId !== 'string') {
      throw new Error('Invalid event ID');
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('Amount must be a positive number');
    }

    const functions = getFunctions();
    const createSession = httpsCallable(functions, 'createCheckoutSession');
    
    const result = await createSession({ eventId, amount, message });
    return result.data as { sessionUrl: string };
  } catch (error: any) {
    console.error('Error creating checkout session:', {
      error,
      code: error.code,
      message: error.message,
      details: error.details
    });

    // Handle specific error cases
    if (error.code === 'not-found') {
      throw new Error('Event not found');
    }
    if (error.code === 'failed-precondition') {
      throw new Error(error.message || 'Stripe account not properly configured');
    }
    if (error.code === 'invalid-argument') {
      throw new Error(error.message || 'Invalid input parameters');
    }
    if (error.code === 'unauthenticated') {
      throw new Error('User must be logged in');
    }

    // Handle general error case
    throw new Error(error.message || 'Failed to create checkout session');
  }
};

export const getStripeAccountStatus = async (accountId: string) => {
  try {
    if (!accountId) {
      throw new Error('Stripe account ID is required');
    }
    const functions = getFunctions();
    const checkStatus = httpsCallable<{ accountId: string }, { chargesEnabled: boolean, payoutsEnabled: boolean }>(functions, 'getStripeAccountStatus');
    
    const result = await checkStatus({ accountId });
    return result.data;
  } catch (error: any) {
    console.error('Error checking Stripe account status:', error);
    // Renvoyer un message d'erreur spécifique si possible
    throw new Error(error.message || 'Failed to check Stripe account status');
  }
};