/**
 * VoltFix Admin - Responsive Navigation & Hamburger System
 * Supports Mobile (< 768px), Tablet (768px - 1023px), and Desktop (>= 1024px)
 */
document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    if (!header) return;

    const menu = header.querySelector('.menu');
    if (!menu) return;

    const rightContainer = header.querySelector('.right');
    const wrapContainer = header.querySelector('.wrap');

    // 1. Ensure Hamburger Button exists in .right
    let toggleBtn = header.querySelector('.hamburger-btn, .nav-toggle');
    if (!toggleBtn && rightContainer) {
        toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'hamburger-btn';
        toggleBtn.id = 'adminNavToggle';
        toggleBtn.setAttribute('aria-label', 'เมนูหลัก');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.innerHTML = '<span class="bar"></span><span class="bar"></span><span class="bar"></span>';
        rightContainer.appendChild(toggleBtn);
    }

    // 2. Ensure Backdrop Overlay exists in header
    let backdrop = header.querySelector('.nav-overlay');
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.className = 'nav-overlay';
        backdrop.id = 'adminNavOverlay';
        header.appendChild(backdrop);
    }

    const MOBILE_QUERY = window.matchMedia('(max-width: 1023px)');

    function isMobileOrTablet() {
        return MOBILE_QUERY.matches;
    }

    function openMobileMenu() {
        menu.classList.add('nav-open');
        header.classList.add('is-nav-open');
        document.body.classList.add('admin-menu-open');
        if (toggleBtn) {
            toggleBtn.classList.add('active');
            toggleBtn.setAttribute('aria-expanded', 'true');
        }
        if (backdrop) {
            backdrop.classList.add('active');
        }
    }

    function closeMobileMenu() {
        menu.classList.remove('nav-open');
        header.classList.remove('is-nav-open');
        document.body.classList.remove('admin-menu-open');
        if (toggleBtn) {
            toggleBtn.classList.remove('active');
            toggleBtn.setAttribute('aria-expanded', 'false');
        }
        if (backdrop) {
            backdrop.classList.remove('active');
        }

        // Close any open submenus in mobile menu
        menu.querySelectorAll('.dropdown.submenu-open').forEach(function (d) {
            d.classList.remove('submenu-open');
        });
    }

    function toggleMobileMenu() {
        if (menu.classList.contains('nav-open')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    // Hamburger button toggle click
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMobileMenu();
        });
    }

    // Backdrop overlay click to close
    if (backdrop) {
        backdrop.addEventListener('click', function (e) {
            e.preventDefault();
            closeMobileMenu();
        });
    }

    // Mobile menu inside click handling
    menu.addEventListener('click', function (event) {
        if (!isMobileOrTablet()) return;

        const target = event.target;
        const dropdownButton = target.closest('.dropdown-btn');
        const link = target.closest('a');

        // Dropdown accordion toggle
        if (dropdownButton) {
            event.preventDefault();
            event.stopPropagation();
            const currentDropdown = dropdownButton.closest('.dropdown');
            if (currentDropdown) {
                const wasOpen = currentDropdown.classList.contains('submenu-open');
                
                // Accordion behavior: close other open dropdowns in .menu
                menu.querySelectorAll('.dropdown.submenu-open').forEach(function (d) {
                    if (d !== currentDropdown) {
                        d.classList.remove('submenu-open');
                    }
                });

                if (wasOpen) {
                    currentDropdown.classList.remove('submenu-open');
                } else {
                    currentDropdown.classList.add('submenu-open');
                }
            }
            return;
        }

        // Direct links: allow navigation and close mobile menu
        if (link) {
            closeMobileMenu();
        }
    });

    // Close on click outside
    document.addEventListener('click', function (event) {
        if (!isMobileOrTablet()) return;
        if (!menu.classList.contains('nav-open')) return;

        // If click is outside header, close
        if (!header.contains(event.target)) {
            closeMobileMenu();
        }
    });

    // Close on Escape key press
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && menu.classList.contains('nav-open')) {
            closeMobileMenu();
            if (toggleBtn) toggleBtn.focus();
        }
    });

    // Reset when resizing window to desktop
    window.addEventListener('resize', function () {
        if (!isMobileOrTablet() && menu.classList.contains('nav-open')) {
            closeMobileMenu();
        }
    });
});
