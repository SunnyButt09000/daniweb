/* Veltrix — privacy-first Google Analytics 4 (basic Consent Mode v2).
   No Google tag is requested before the visitor opts in. Marketing tags
   and advertising storage remain disabled until separately implemented. */
(() => {
  'use strict';
  const measurementId = 'G-NHVN3MDH19';
  const storageKey = 'vx-analytics-consent-v1';
  const lifetimeMs = 180 * 24 * 60 * 60 * 1000;
  let tagLoaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  const gtag = window.gtag;

  // These defaults MUST precede all measurement/config commands.
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied'
  });

  function savedDecision() {
    try {
      const entry = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (!entry || typeof entry.analytics !== 'boolean' ||
          !Number.isFinite(entry.at) || Date.now() - entry.at > lifetimeMs ||
          entry.at > Date.now()) return null;
      return entry.analytics;
    } catch (_) { return null; }
  }

  function rememberDecision(allow) {
    try { localStorage.setItem(storageKey, JSON.stringify({ analytics: allow, at: Date.now() })); }
    catch (_) { /* If storage is blocked, ask again on the next visit. */ }
  }

  function deleteAnalyticsCookies() {
    // Best effort removal of first-party GA cookies when a visitor opts out.
    const hosts = ['', location.hostname, '.' + location.hostname,
      '.' + location.hostname.split('.').slice(-2).join('.')];
    for (const entry of document.cookie.split(';')) {
      const name = entry.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) continue;
      for (const domain of hosts) {
        document.cookie = name + '=; Max-Age=0; Path=/; SameSite=Lax' +
          (domain ? '; Domain=' + domain : '');
      }
    }
  }

  function enableAnalytics() {
    if (tagLoaded) return;
    tagLoaded = true;
    // Consent is granted before loading gtag.js or sending a config/pageview.
    gtag('js', new Date());
    gtag('config', measurementId);
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    document.head.appendChild(script);
  }

  function applyDecision(allow) {
    gtag('consent', 'update', {
      analytics_storage: allow ? 'granted' : 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    if (allow) enableAnalytics();
    else if (tagLoaded) {
      deleteAnalyticsCookies();
      // Unload the already-initialised Google script and prevent further events.
      location.reload();
    }
  }

  function init() {
    const banner = document.createElement('section');
    banner.className = 'vx-consent';
    banner.id = 'vx-cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-labelledby', 'vx-consent-title');
    banner.hidden = true;
    banner.innerHTML =
      '<div class="vx-consent__copy">' +
        '<h2 id="vx-consent-title">Your privacy choices</h2>' +
        '<p>We use optional Google Analytics cookies to understand visits and improve this website. ' +
        'You can accept or reject them. No advertising cookies are used at present. ' +
        '<a href="/cookies/">Cookie details</a>.</p>' +
        '<p class="vx-consent__current" id="vx-consent-current" hidden></p>' +
      '</div>' +
      '<div class="vx-consent__actions">' +
        '<button type="button" data-vx-consent="reject">Reject analytics</button>' +
        '<button type="button" data-vx-consent="accept">Accept analytics</button>' +
      '</div>';
    document.body.appendChild(banner);

    const current = banner.querySelector('#vx-consent-current');
    const show = () => {
      const decision = savedDecision();
      current.hidden = decision === null;
      current.textContent = decision === null ? '' : 'Current choice: analytics ' + (decision ? 'accepted' : 'rejected') + '.';
      banner.hidden = false;
      banner.querySelector('[data-vx-consent="reject"]').focus();
    };

    banner.addEventListener('click', (event) => {
      const choice = event.target.closest('[data-vx-consent]');
      if (!choice) return;
      const allow = choice.dataset.vxConsent === 'accept';
      const previous = savedDecision();
      rememberDecision(allow);
      banner.hidden = true;
      if (!allow && previous === true) {
        gtag('consent', 'update', {
          analytics_storage: 'denied', ad_storage: 'denied',
          ad_user_data: 'denied', ad_personalization: 'denied'
        });
        deleteAnalyticsCookies();
        location.reload();
        return;
      }
      applyDecision(allow);
    });
    document.querySelectorAll('[data-vx-cookie-settings]').forEach((button) => {
      button.addEventListener('click', show);
    });

    const decision = savedDecision();
    if (decision === null) banner.hidden = false;
    else applyDecision(decision);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
