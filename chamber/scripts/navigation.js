document.addEventListener('DOMContentLoaded', () => {
    const menuButton = document.querySelector('#menu');
    const primaryNav = document.querySelector('#primary-nav');
    const navLinks = primaryNav ? primaryNav.querySelectorAll('a') : [];

    const closeMenu = () => {
        if (!menuButton || !primaryNav) return;
        primaryNav.classList.remove('open');
        menuButton.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', 'Open navigation');
    };

    if (menuButton && primaryNav) {
        menuButton.addEventListener('click', () => {
            const isOpen = primaryNav.classList.toggle('open');
            menuButton.classList.toggle('open', isOpen);
            menuButton.setAttribute('aria-expanded', String(isOpen));
            menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
        });

        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 768) {
                    closeMenu();
                }
            });
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 768) {
                closeMenu();
            }
        });
    }
});
