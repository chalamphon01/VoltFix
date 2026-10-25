document.addEventListener('DOMContentLoaded', function () {
    const navMenus = document.querySelectorAll('.menu');
    if (!navMenus.length) return;

    const MOBILE_QUERY = window.matchMedia('(max-width: 1023px)');

    navMenus.forEach(function (menu) {
        const hamburgerArea = function (event) {
            if (!MOBILE_QUERY.matches) return false;

            const rect = menu.getBoundingClientRect();
            const header = menu.closest('header');
            if (!header) return false;
            const headerRect = header.getBoundingClientRect();

            const x = event.clientX;
            const y = event.clientY;
            return (
                x >= headerRect.right - 64 &&
                x <= headerRect.right &&
                y >= headerRect.top &&
                y <= headerRect.bottom
            );
        };

        menu.addEventListener('click', function (event) {
            if (!MOBILE_QUERY.matches) return;

            const target = event.target;
            const dropdownButton = target.closest('.dropdown-btn');
            const submenuLink = target.closest('.dropdown-menu a');
            const normalLink = target.closest(':scope > a');

            if (hamburgerArea(event)) {
                event.preventDefault();
                event.stopPropagation();
                const isOpen = menu.classList.toggle('nav-open');
                if (!isOpen) {
                    menu.querySelectorAll('.dropdown.submenu-open').forEach(function (dropdown) {
                        dropdown.classList.remove('submenu-open');
                    });
                }
                return;
            }

            if (submenuLink || normalLink) return;

            if (dropdownButton) {
                event.preventDefault();
                event.stopPropagation();
                const dropdown = dropdownButton.closest('.dropdown');
                if (dropdown) dropdown.classList.toggle('submenu-open');
            }
        });

        document.addEventListener('click', function (event) {
            if (!MOBILE_QUERY.matches) return;
            if (menu.contains(event.target)) return;
            if (hamburgerArea(event)) return;

            menu.classList.remove('nav-open');
            menu.querySelectorAll('.dropdown.submenu-open').forEach(function (dropdown) {
                dropdown.classList.remove('submenu-open');
            });
        });

        document.addEventListener('keydown', function (event) {
            if (event.key !== 'Escape' || !MOBILE_QUERY.matches) return;
            menu.classList.remove('nav-open');
            menu.querySelectorAll('.dropdown.submenu-open').forEach(function (dropdown) {
                dropdown.classList.remove('submenu-open');
            });
        });
    });
});
