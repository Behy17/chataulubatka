/* Cookie Consent Manager */
(function() {
  const COOKIE_NAME = 'chataulubatka_cookies_accepted';
  const COOKIE_EXPIRY = 365 * 24 * 60 * 60 * 1000; // 1 rok

  function getCookie(name) {
    const nameEQ = name + '=';
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  }

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/;SameSite=Lax';
  }

  function initializeCookieConsent() {
    const banner = document.getElementById('cookie-consent');
    if (!banner) return;

    const hasConsent = getCookie(COOKIE_NAME);

    if (hasConsent) {
      banner.classList.add('hidden');
      // Pokud je souhlas, načti Google Maps
      loadGoogleMaps();
    } else {
      // Zmraz Google Maps iframe
      freezeGoogleMaps();
      banner.classList.remove('hidden');
    }

    // Event listenery na tlačítka
    const acceptBtn = banner.querySelector('[data-cookie-accept]');
    const declineBtn = banner.querySelector('[data-cookie-decline]');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', () => {
        setCookie(COOKIE_NAME, 'accepted', 365);
        banner.classList.add('hidden');
        loadGoogleMaps();
      });
    }

    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        setCookie(COOKIE_NAME, 'declined', 365);
        banner.classList.add('hidden');
      });
    }
  }

  function freezeGoogleMaps() {
    const mapFrame = document.querySelector('[src*="google.com/maps"]');
    if (mapFrame) {
      mapFrame.style.opacity = '0.4';
      mapFrame.style.pointerEvents = 'none';
      mapFrame.style.filter = 'blur(2px)';
    }
  }

  function loadGoogleMaps() {
    const mapFrame = document.querySelector('[src*="google.com/maps"]');
    if (mapFrame) {
      mapFrame.style.opacity = '1';
      mapFrame.style.pointerEvents = 'auto';
      mapFrame.style.filter = 'none';
      mapFrame.style.transition = 'all 300ms ease';
    }
  }

  // Spusť při načtení DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCookieConsent);
  } else {
    initializeCookieConsent();
  }
})();
