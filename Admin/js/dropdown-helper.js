(function () {
    function initDropdowns() {
        const DROPDOWN_SELECTORS = [
            '.dropdown',
            '.account',
            '.nav-item.dropdown',
            '.dropdown-submenu',
            '.user-dropdown'
        ];

        const containers = document.querySelectorAll(DROPDOWN_SELECTORS.join(', '));
        if (!containers.length) return;

        const MOBILE_QUERY = window.matchMedia('(max-width: 1023px)');
        const timers = new WeakMap();

        function clearCloseTimer(el) {
            if (timers.has(el)) {
                clearTimeout(timers.get(el));
                timers.delete(el);
            }
        }

        function setCloseTimer(el, callback, delay = 220) {
            clearCloseTimer(el);
            const timerId = setTimeout(() => {
                callback();
                timers.delete(el);
            }, delay);
            timers.set(el, timerId);
        }

        function closeAllDropdowns(exceptEl = null) {
            containers.forEach(c => {
                if (c !== exceptEl && !c.contains(exceptEl)) {
                    clearCloseTimer(c);
                    c.classList.remove('is-open');
                    delete c.dataset.clickedOpen;
                }
            });
        }

        containers.forEach(container => {
            const trigger = container.querySelector(
                '.dropdown-btn, .dropbtn, .user-avatar, .user, .profile, a.nav-link, a.has-arrow, .icon-btn'
            );

            container.addEventListener('mouseenter', function () {
                // On mobile/tablet, navbar.js handles .menu accordions
                if (container.closest('.menu') && MOBILE_QUERY.matches) return;

                clearCloseTimer(container);
                let parent = container.parentElement;
                while (parent) {
                    if (parent.matches && DROPDOWN_SELECTORS.some(sel => parent.matches(sel))) {
                        clearCloseTimer(parent);
                        parent.classList.add('is-open');
                    }
                    parent = parent.parentElement;
                }
                container.classList.add('is-open');
            });

            container.addEventListener('mouseleave', function () {
                if (container.closest('.menu') && MOBILE_QUERY.matches) return;

                if (container.dataset.clickedOpen === 'true') {
                    return;
                }
                setCloseTimer(container, function () {
                    container.classList.remove('is-open');
                }, 220);
            });

            if (trigger) {
                trigger.addEventListener('click', function (e) {
                    // On mobile/tablet, navbar.js handles .menu accordions
                    if (container.closest('.menu') && MOBILE_QUERY.matches) return;

                    const href = trigger.getAttribute('href');
                    const isHashOrEmpty = !href || href === '#' || href.startsWith('javascript:');

                    if (trigger.tagName.toLowerCase() === 'button' || isHashOrEmpty) {
                        e.preventDefault();
                        e.stopPropagation();

                        const wasOpen = container.classList.contains('is-open') && container.dataset.clickedOpen === 'true';

                        if (wasOpen) {
                            container.classList.remove('is-open');
                            delete container.dataset.clickedOpen;
                        } else {
                            const siblings = container.parentElement ? container.parentElement.querySelectorAll(DROPDOWN_SELECTORS.join(', ')) : [];
                            siblings.forEach(s => {
                                if (s !== container) {
                                    s.classList.remove('is-open');
                                    delete s.dataset.clickedOpen;
                                }
                            });

                            clearCloseTimer(container);
                            container.classList.add('is-open');
                            container.dataset.clickedOpen = 'true';
                        }
                    }
                });
            }
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest(DROPDOWN_SELECTORS.join(', '))) {
                closeAllDropdowns();
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                closeAllDropdowns();
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDropdowns);
    } else {
        initDropdowns();
    }
})();
