/* Anonymous, consent-gated contact-intent measurement for Veltrix.
   "contact_click" and "lead_handoff" do NOT prove a message was sent.
   Only the server's saved receipt can trigger "generate_lead".
   Never include contact form values or WhatsApp/email message text. */
(() => {
  'use strict';

  const track = (name, dimensions) => window.VXAnalytics?.track(name, dimensions);

  // Delegation covers the header/footer, all marketing CTAs, and assistant links
  // added after initial page load. No tracking occurs without analytics consent.
  document.addEventListener('click', (event) => {
    const link = event.target?.closest?.('a[href]');
    if (!link) return;
    const url = link.getAttribute('href') || '';
    let method = '';
    if (/^tel:/i.test(url)) method = 'phone';
    else if (/^mailto:/i.test(url)) method = 'email';
    else if (/^https:\/\/wa\.me\//i.test(url)) method = 'whatsapp';
    if (!method) return;

    // The quote builder already validated the request and prepared its PDF,
    // but the final message must still be sent in WhatsApp or email.
    if (link.matches('[data-sb-open]')) {
      track('lead_handoff', { form_type: 'quote', contact_method: method });
    } else {
      track('contact_click', { contact_method: method });
    }
  }, true);
})();
