import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import * as cors from "cors";

admin.initializeApp();

// Initialiser cors avec les options désirées
// Pour le développement, on peut autoriser l\'origine localhost
const corsHandler = cors({origin: "http://localhost:5173"});

// Lire la config Firebase au lieu de process.env
const STRIPE_SECRET_KEY = functions.config().stripe.secret_key;
const STRIPE_WEBHOOK_SECRET = functions.config().stripe.webhook_secret;
const FRONTEND_URL = functions.config().frontend.url;

if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !FRONTEND_URL) {
  console.error("Erreur: Configuration Stripe ou Frontend manquante dans les variables d'environnement Firebase Functions.");
  // Vous pourriez vouloir lancer une erreur ici pour empêcher le démarrage
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const db = admin.firestore();

export const createStripeConnectAccount = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "L'utilisateur doit être connecté"
    );
  }

  const { userId } = data;

  try {
    const account = await stripe.accounts.create({
      type: "express",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    await db.collection("users").doc(userId).set({
      stripeAccountId: account.id,
    }, { merge: true });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${FRONTEND_URL}/stripe/refresh`,
      return_url: `${FRONTEND_URL}/stripe/return`,
      type: "account_onboarding",
    });

    return { accountLink: accountLink.url };
  } catch (error: any) {
    // Log plus détaillé de l'erreur Stripe
    console.error("Erreur Stripe détaillée:", {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      raw: error.raw, // Inclut l'objet brut de Stripe
      stack: error.stack, // Inclut la pile d'appels
    });
    throw new functions.https.HttpsError(
      "internal",
      "Erreur lors de la création du compte Stripe"
    );
  }
});

export const createCheckoutSession = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "L'utilisateur doit être connecté"
    );
  }

  const { eventId, amount, message } = data;

  // Validate input parameters
  if (!eventId || typeof eventId !== 'string') {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "L'identifiant de l'événement est invalide"
    );
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Le montant doit être un nombre positif"
    );
  }

  try {
    // Get event data
    const eventDoc = await db.collection("events").doc(eventId).get();
    if (!eventDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Événement non trouvé"
      );
    }

    const event = eventDoc.data()!;
    console.log("Event data:", event); // Debug log

    // Get creator data
    const creatorDoc = await db.collection("users").doc(event.userId).get();
    if (!creatorDoc.exists) {
      throw new functions.https.HttpsError(
        "not-found",
        "Créateur de l'événement non trouvé"
      );
    }

    const creator = creatorDoc.data()!;
    console.log("Creator data:", { ...creator, stripeAccountId: creator.stripeAccountId ? 'exists' : 'missing' }); // Debug log

    if (!creator.stripeAccountId) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Le créateur n'a pas configuré son compte Stripe"
      );
    }

    // Verify Stripe account status
    const stripeAccount = await stripe.accounts.retrieve(creator.stripeAccountId);
    console.log("Stripe account status:", { 
      id: stripeAccount.id,
      charges_enabled: stripeAccount.charges_enabled,
      payouts_enabled: stripeAccount.payouts_enabled
    }); // Debug log

    if (!stripeAccount.charges_enabled) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Le compte Stripe du créateur n'est pas encore complètement configuré"
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Contribution pour ${event.title}`,
              description: message || undefined,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${FRONTEND_URL}/fundraiser/${eventId}/success`,
      cancel_url: `${FRONTEND_URL}/fundraiser/${eventId}`,
      payment_intent_data: {
        application_fee_amount: Math.round(amount * 100 * 0.029 + 30),
        transfer_data: {
          destination: creator.stripeAccountId,
        },
      },
      metadata: {
        eventId,
        userId: context.auth.uid,
        message: message || "",
      },
    });

    console.log("Checkout session created:", { 
      id: session.id,
      url: session.url 
    }); // Debug log

    return { sessionUrl: session.url };
  } catch (error: any) {
    console.error("Detailed error in createCheckoutSession:", {
      error: error,
      message: error.message,
      code: error.code,
      type: error.type,
      raw: error.raw
    });

    // Handle Stripe errors specifically
    if (error.type === 'StripeError') {
      throw new functions.https.HttpsError(
        "unknown",
        `Erreur Stripe: ${error.message}`
      );
    }

    // Re-throw Firebase errors
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Handle all other errors
    throw new functions.https.HttpsError(
      "internal",
      "Erreur lors de la création de la session de paiement"
    );
  }
});

export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig as string,
      STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const { eventId, userId, message } = session.metadata!;

      const eventRef = db.collection("events").doc(eventId);
      await db.runTransaction(async (transaction) => {
        const eventDoc = await transaction.get(eventRef);
        if (!eventDoc.exists) {
          throw new Error("Événement non trouvé");
        }

        const event = eventDoc.data()!;
        const currentAmount = event.fundraiserDetails?.currentAmount || 0;
        const participants = event.fundraiserDetails?.participants || [];

        transaction.update(eventRef, {
          "fundraiserDetails.currentAmount": currentAmount + (session.amount_total! / 100),
          "fundraiserDetails.participants": [
            ...participants,
            {
              userId,
              amount: session.amount_total! / 100,
              message,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          ],
        });
      });
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error("Erreur webhook Stripe:", err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

/**
 * Vérifie l'état d'un compte Stripe Connect (Express) pour savoir s'il peut
 * recevoir des paiements et des virements.
 * @param {object} data - Données envoyées à la fonction.
 * @param {string} data.accountId - L'ID du compte Stripe Connect à vérifier.
 * @param {functions.https.CallableContext} context - Contexte de la fonction.
 * @returns {Promise<{chargesEnabled: boolean, payoutsEnabled: boolean}>}
 *   Un objet indiquant si les paiements et les virements sont activés.
 */
export const getStripeAccountStatus = functions.https.onRequest(async (req, res) => {
  // Utiliser le middleware cors
  corsHandler(req, res, async () => {
    // Pour onRequest, les données sont dans req.body (si POST) ou req.query (si GET)
    // Pour la cohérence avec onCall, on attend les données dans req.body.data
    // Note : Le SDK client httpsCallable envoie une requête POST avec les données dans { data: ... }
    const accountId = req.body.data?.accountId; 

    if (!accountId || typeof accountId !== 'string') {
      // Avec onRequest, on utilise res.status().send() ou HttpsError pour les erreurs
      console.error("Missing or invalid accountId in request body:", req.body);
      res.status(400).send({ 
        error: {
          status: "INVALID_ARGUMENT",
          message: "L'ID du compte Stripe ('accountId') est requis dans le corps de la requête { data: { accountId: ... } } et doit être une chaîne de caractères.",
        }
      });
      return; // Important de retourner après avoir envoyé la réponse
    }

    try {
      const account = await stripe.accounts.retrieve(accountId);

      // Retourne l\'état des capacités de paiement et de virement
      // Avec onRequest, on renvoie les données via res.send() ou res.json()
      // Pour être compatible avec httpsCallable, on encapsule dans { data: ... }
      res.status(200).send({ 
        data: {
          chargesEnabled: account.charges_enabled,
          payoutsEnabled: account.payouts_enabled,
        }
      });

    } catch (error: any) {
      console.error("Erreur lors de la récupération du statut du compte Stripe:", error);

      // Gérer les erreurs spécifiques de Stripe si nécessaire
      if (error.type === 'StripeInvalidRequestError' && error.code === 'account_invalid') {
        res.status(404).send({ 
          error: {
            status: "NOT_FOUND",
            message: `Le compte Stripe avec l'ID '${accountId}' n'a pas été trouvé.`,
          }
        });
      } else {
        // Pour les autres erreurs, renvoyer une erreur interne
        res.status(500).send({
          error: {
            status: "INTERNAL",
            message: "Erreur lors de la vérification du statut du compte Stripe.",
          }
        });
      }
    }
  });
});