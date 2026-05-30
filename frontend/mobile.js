(() => {
  const MOBILE_QUERY = '(max-width: 768px)';
  const INSTALL_DISMISSED_KEY = 'sweetroots-install-dismissed';
  const mobileMedia = window.matchMedia(MOBILE_QUERY);
  let deferredInstallPrompt = null;
  let bottomNav = null;
  let installBanner = null;

  const routes = [
    { page: 'home', label: 'Home', icon: '🏡' },
    { page: 'dashboard', label: 'Garden', icon: '🌱' },
    { page: 'gallery', label: 'Gallery', icon: '📸' }
  ];

  function getCurrentPage() {
    const activeDesktopLink = document.querySelector('.nav-links a.active');
    const activeText = activeDesktopLink?.textContent?.trim().toLowerCase();

    if (activeText?.includes('dashboard')) return 'dashboard';
    if (activeText?.includes('gallery')) return 'gallery';
    return 'home';
  }

  function navigate(page) {
    if (typeof window.navigateTo === 'function') {
      window.navigateTo(page);
    } else {
      window.location.hash = page;
    }

    requestAnimationFrame(updateBottomNavState);
  }

  function buildBottomNav() {
    if (bottomNav) return bottomNav;

    bottomNav = document.createElement('nav');
    bottomNav.className = 'mobile-bottom-nav';
    bottomNav.setAttribute('aria-label', 'Mobile primary navigation');

    bottomNav.innerHTML = routes.map((route) => `
      <button class="mobile-bottom-nav__item" type="button" data-mobile-route="${route.page}" aria-label="Go to ${route.label}">
        <span class="mobile-bottom-nav__icon" aria-hidden="true">${route.icon}</span>
        <span>${route.label}</span>
      </button>
    `).join('');

    bottomNav.addEventListener('click', (event) => {
      const button = event.target.closest('[data-mobile-route]');
      if (!button) return;
      navigate(button.dataset.mobileRoute);
    });

    document.body.appendChild(bottomNav);
    return bottomNav;
  }

  function updateBottomNavState() {
    if (!bottomNav) return;

    const currentPage = getCurrentPage();
    bottomNav.querySelectorAll('[data-mobile-route]').forEach((item) => {
      const isActive = item.dataset.mobileRoute === currentPage;
      item.classList.toggle('is-active', isActive);
      item.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  function syncBottomNav() {
    if (!mobileMedia.matches) {
      if (bottomNav) bottomNav.hidden = true;
      return;
    }

    buildBottomNav();
    bottomNav.hidden = false;
    updateBottomNavState();
  }

  function buildInstallBanner() {
    if (installBanner) return installBanner;

    installBanner = document.createElement('aside');
    installBanner.className = 'mobile-install-banner';
    installBanner.hidden = true;
    installBanner.setAttribute('aria-live', 'polite');
    installBanner.innerHTML = `
      <div>
        <strong>Install SweetRoots</strong>
        <span>Add the garden tracker to your home screen for a faster app-like experience.</span>
      </div>
      <div class="mobile-install-banner__actions">
        <button class="mobile-install-banner__install" type="button">Install</button>
        <button class="mobile-install-banner__close" type="button" aria-label="Dismiss install prompt">Later</button>
      </div>
    `;

    installBanner.querySelector('.mobile-install-banner__install')?.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;
      installBanner.hidden = true;
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice.catch(() => null);
      deferredInstallPrompt = null;
    });

    installBanner.querySelector('.mobile-install-banner__close')?.addEventListener('click', () => {
      localStorage.setItem(INSTALL_DISMISSED_KEY, 'true');
      installBanner.hidden = true;
    });

    document.body.appendChild(installBanner);
    return installBanner;
  }

  function maybeShowInstallBanner() {
    if (!mobileMedia.matches || !deferredInstallPrompt) return;
    if (localStorage.getItem(INSTALL_DISMISSED_KEY) === 'true') return;

    buildInstallBanner();
    installBanner.hidden = false;
  }

  function enhanceModalCloseGestures() {
    document.addEventListener('click', (event) => {
      const modal = event.target.closest('.modal.active, .modal-overlay');
      if (!modal || event.target !== modal) return;
      if (typeof window.closeModal === 'function') window.closeModal();
    });
  }

  function keepCssViewportFresh() {
    const setViewportHeight = () => {
      document.documentElement.style.setProperty('--mobile-vh', `${window.innerHeight * 0.01}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight, { passive: true });
    window.addEventListener('orientationchange', setViewportHeight, { passive: true });
  }

  function watchAppRenders() {
    const app = document.getElementById('app');
    if (!app) return;

    const observer = new MutationObserver(() => {
      syncBottomNav();
      window.setTimeout(updateBottomNavState, 60);
    });

    observer.observe(app, { childList: true, subtree: true });
  }

  function syncAfterSpaRouteChanges() {
    if (typeof window.navigateTo === 'function' && !window.navigateTo.__mobileNavWrapped) {
      const originalNavigateTo = window.navigateTo;

      window.navigateTo = function wrappedNavigateTo(...args) {
        const result = originalNavigateTo.apply(this, args);

        Promise.resolve(result).finally(() => {
          syncBottomNav();
          window.setTimeout(updateBottomNavState, 60);
        });

        return result;
      };

      window.navigateTo.__mobileNavWrapped = true;
    }

    window.addEventListener('hashchange', updateBottomNavState, { passive: true });
    window.addEventListener('popstate', updateBottomNavState, { passive: true });
  }

  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    maybeShowInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installBanner) installBanner.hidden = true;
  });

  document.addEventListener('DOMContentLoaded', () => {
    keepCssViewportFresh();
    enhanceModalCloseGestures();
    watchAppRenders();
    syncAfterSpaRouteChanges();
    syncBottomNav();
  });

  mobileMedia.addEventListener?.('change', () => {
    syncBottomNav();
    maybeShowInstallBanner();
  });
})();
