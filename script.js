// Bubių bendruomenės svetainės (bubiai.eu) interaktyvumo skriptas

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const siteHeader = document.querySelector(".site-header");
    const navLinks = document.querySelectorAll(".nav-link");
    const yearSpan = document.getElementById("currentYear");

    // Einamųjų metų atnaujinimas poraštėje
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Mobilaus meniu valdymas
    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!isExpanded));
            mainNav.classList.toggle("open");
        });

        // Uždaryti meniu paspaudus ant nuorodos
        navLinks.forEach((link) => {
            link.addEventListener("click", () => {
                menuToggle.setAttribute("aria-expanded", "false");
                mainNav.classList.remove("open");
            });
        });
    }

    // Viršutinės juostos šešėlis ir aktyvios sekcijos pažymėjimas slenkant
    const sections = document.querySelectorAll("main section[id]");

    const onScroll = () => {
        const scrollY = window.scrollY;

        if (siteHeader) {
            siteHeader.classList.toggle("scrolled", scrollY > 16);
        }

        let currentSectionId = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop - 130;
            const sectionHeight = section.offsetHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute("id") || "";
            }
        });

        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            link.classList.toggle("active", href === `#${currentSectionId}`);
        });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
});
