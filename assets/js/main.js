(() => {
    const selectors = {
        header: "[data-site-header]",
        navToggle: "[data-nav-toggle]",
        navMenu: "[data-nav-menu]",
        year: "#year",
    };

    const stateClasses = {
        menuOpen: "is-open",
        navOpen: "is-nav-open",
        headerScrolled: "is-scrolled",
    };

    const desktopQuery = window.matchMedia("(min-width: 48rem)");

    const setFooterYear = () => {
        const yearElement = document.querySelector(selectors.year);

        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    const setHeaderScrollState = () => {
        const header = document.querySelector(selectors.header);

        if (!header) {
            return;
        }

        header.classList.toggle(stateClasses.headerScrolled, window.scrollY > 8);
    };

    const initializeNavigation = () => {
        const navToggle = document.querySelector(selectors.navToggle);
        const navMenu = document.querySelector(selectors.navMenu);

        if (!navToggle || !navMenu) {
            return;
        }

        const setMenuState = (isOpen) => {
            navMenu.classList.toggle(stateClasses.menuOpen, isOpen);
            navToggle.setAttribute("aria-expanded", String(isOpen));
            document.body.classList.toggle(stateClasses.navOpen, isOpen);
        };

        navToggle.addEventListener("click", () => {
            const isOpen = navToggle.getAttribute("aria-expanded") === "true";
            setMenuState(!isOpen);
        });

        navMenu.addEventListener("click", (event) => {
            const clickedLink = event.target.closest("a");

            if (clickedLink) {
                setMenuState(false);
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                setMenuState(false);
            }
        });

        desktopQuery.addEventListener("change", (event) => {
            if (event.matches) {
                setMenuState(false);
            }
        });
    };

    const initializeApp = () => {
        setFooterYear();
        setHeaderScrollState();
        initializeNavigation();
        window.addEventListener("scroll", setHeaderScrollState, { passive: true });
    };

    initializeApp();
})();
