export async function sendWhatsAppMessage(_phoneNumber: string, _message: string) {
  if (!process.env.WHATSAPP_API_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    return { skipped: true };
  }

  return { skipped: true, reason: 'WhatsApp integration is scaffolded for a future stage.' };
}
