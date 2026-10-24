export const CHAT_FAILED_MESSAGE =
  "Sorry, something went wrong on our side and we couldn't answer your question. We'll connect you with the organizer on WhatsApp.";

// Pre-filled WhatsApp message. Includes the event name and the user's question.
export const buildChatWhatsAppMessage = (eventTitle: string, userQuestion?: string): string => {
  const question = userQuestion?.trim();
  return question
    ? `Hi, I have a question about "${eventTitle}": ${question}`
    : `Hi, I have a question about "${eventTitle}".`;
};

// ---------- 2. WhatsApp link ----------
export const toWhatsAppNumber = (phone?: string | null): string | null => {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, ''); // keep digits only
  if (digits.startsWith('0092')) digits = digits.slice(2);

  if (digits.startsWith('92') && digits.length === 12) return digits;
  if (digits.startsWith('920') && digits.length === 13) return `92${digits.slice(3)}`;
  if (digits.startsWith('0') && digits.length === 11) return `92${digits.slice(1)}`;
  if (digits.startsWith('3') && digits.length === 10) return `92${digits}`;

  return null; // unknown format: do not build a broken link
};

export const buildWhatsAppLink = (phone: string | null | undefined, message: string): string | null => {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
};