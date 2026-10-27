// Build-time safety gate for optional direct customer enquiry collection.
// No customer data must be collected accidentally by changing site.json alone.
// A human-approved Cloudflare rollout must explicitly supply the launch flag.
const KEY_PATTERN = /^[A-Za-z0-9_-]{12,180}$/;
export function checkLeadReleaseConfig(forms = {}, env = {}) {
  const endpoint = String(forms.endpoint || '').trim();
  const siteKey = String(forms.turnstileSiteKey || '').trim();
  const provider = String(forms.provider || '').trim();

  if (endpoint !== '/api/leads') {
    if (siteKey) throw new Error('Turnstile site key must remain empty while native lead receipt is disabled.');
    // Legacy external form services are not activated by this gate. They need
    // their own privacy/security review and cannot claim D1 receipt.
    return { enabled: false, legacyEndpoint: !!endpoint };
  }
  if (provider !== 'Cloudflare D1') throw new Error('Set forms.provider to Cloudflare D1 before enabling native lead receipt.');
  if (!KEY_PATTERN.test(siteKey)) throw new Error('A real public Cloudflare Turnstile site key is required.');
  if (env.VELTRIX_LEADS_LAUNCH_APPROVED !== 'yes') {
    throw new Error('Native leads are blocked: missing explicit VELTRIX_LEADS_LAUNCH_APPROVED=yes build authorization.');
  }
  return { enabled: true, legacyEndpoint: false };
}
