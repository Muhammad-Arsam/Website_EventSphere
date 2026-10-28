// (CHAT_FAILED_MESSAGE promises a WhatsApp connection, so it would be misleading).
export const CHAT_FAILED_NO_WHATSAPP_MESSAGE =
  "Sorry, something went wrong on our side and we couldn't answer your question. Please try again in a moment.";

// Used if the backend returns IRRELEVANT with an empty answer.
export const CHAT_IRRELEVANT_FALLBACK = "Sorry, I couldn't help with that one.";

export const MAX_MESSAGE_LENGTH = 500; // frontend limit only, change if you like

export const SUGGESTIONS = [
  'What time does the event start?',
  'Where is the venue?',
  'What ticket options are available?',
  'What is the refund policy?',
];