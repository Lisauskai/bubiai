// Bubių bendruomenės svetainės (bubiai.eu) SPA navigacijos, orų ir žemėlapio skriptas

document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");
    const tabButtons = document.querySelectorAll(".nav-tab[data-tab]");
    const tabViews = document.querySelectorAll(".tab-view");
    const tabTriggers = document.querySelectorAll("[data-tab-target]");
    const yearSpan = document.getElementById("currentYear");

    let leafletMap = null;
    const mapMarkers = [];

    // 1. Einamųjų metų atnaujinimas poraštėje
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // 2. Mobilaus meniu (Hamburger) valdymas
    const closeMobileMenu = () => {
        if (menuToggle && mainNav) {
            menuToggle.setAttribute("aria-expanded", "false");
            mainNav.classList.remove("open");
        }
    };

    if (menuToggle && mainNav) {
        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!isExpanded));
            mainNav.classList.toggle("open");
        });
    }

    // 3. SPA Skilčių (Tab) perjungimas be ilgo slinkimo
    const validTabs = ["pradzia", "vietos", "verslas", "seniunija", "zemelapis"];

    const switchTab = (tabId, updateHash = true) => {
        const targetId = validTabs.includes(tabId) ? tabId : "pradzia";

        tabButtons.forEach((btn) => {
            const isActive = btn.getAttribute("data-tab") === targetId;
            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-selected", String(isActive));
        });

        tabViews.forEach((view) => {
            const isMatch = view.id === `view-${targetId}`;
            view.classList.toggle("active", isMatch);
            if (isMatch) {
                view.removeAttribute("hidden");
            } else {
                view.setAttribute("hidden", "hidden");
            }
        });

        closeMobileMenu();

        if (updateHash && history.replaceState) {
            history.replaceState(null, "", `#${targetId}`);
        }

        window.scrollTo({ top: 0, behavior: "smooth" });

        // Jei atidaroma žemėlapio skiltis, inicijuojame arba atnaujiname Leaflet žemėlapio dydį
        if (targetId === "zemelapis") {
            initOrRefreshMap();
        }
    };

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const tabId = btn.getAttribute("data-tab");
            if (tabId) {
                switchTab(tabId);
            }
        });
    });

    tabTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (e) => {
            const targetTab = trigger.getAttribute("data-tab-target");
            if (targetTab) {
                e.preventDefault();
                switchTab(targetTab);
            }
        });
    });

    // Patikrinti URL hash įkėlus puslapį
    const initialHash = window.location.hash.replace("#", "").trim();
    if (validTabs.includes(initialHash)) {
        switchTab(initialHash, false);
    }

    // 4. Tiesioginiai orai prie Bubių jūros (Open-Meteo API, lat=55.858, lon=23.133)
    const weatherValuesEl = document.getElementById("weatherValues");
    const weatherIconEl = document.getElementById("weatherIcon");
    const heroWeatherTextEl = document.getElementById("heroWeatherText");

    const getWeatherIconAndText = (code) => {
        if (code === 0) return { icon: "☀️", desc: "Giedra" };
        if (code === 1 || code === 2) return { icon: "🌤️", desc: "Mažai debesuota" };
        if (code === 3) return { icon: "☁️", desc: "Debesuota" };
        if (code === 45 || code === 48) return { icon: "🌫️", desc: "Rūkas" };
        if (code >= 51 && code <= 67) return { icon: "🌧️", desc: "Lietus" };
        if (code >= 71 && code <= 77) return { icon: "❄️", desc: "Sniegas" };
        if (code >= 80 && code <= 82) return { icon: "🌦️", desc: "Trumpas lietus" };
        if (code >= 95) return { icon: "⛈️", desc: "Perkūnija" };
        return { icon: "🌤️", desc: "Vidutiniai orai" };
    };

    const fetchBubiaiWeather = async () => {
        const url = "https://api.open-meteo.com/v1/forecast?latitude=55.858&longitude=23.133&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=ms&timezone=Europe%2FVilnius";
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Orų užklausa nepavyko");
            const data = await response.json();

            if (data && data.current) {
                const temp = Math.round(data.current.temperature_2m * 10) / 10;
                const wind = Math.round(data.current.wind_speed_10m * 10) / 10;
                const { icon, desc } = getWeatherIconAndText(data.current.weather_code);
                const formattedTemp = temp > 0 ? `+${temp}°C` : `${temp}°C`;
                const summary = `${formattedTemp} • Vėjas ${wind} m/s (${desc})`;

                if (weatherIconEl) weatherIconEl.textContent = icon;
                if (weatherValuesEl) weatherValuesEl.textContent = `${formattedTemp}, vėjas ${wind} m/s`;
                if (heroWeatherTextEl) heroWeatherTextEl.textContent = summary;
            }
        } catch (err) {
            if (weatherValuesEl) weatherValuesEl.textContent = "Duomenys laikinai nepasiekiami";
            if (heroWeatherTextEl) heroWeatherTextEl.textContent = "Stebėkite Bubių tvenkinio orus";
        }
    };

    fetchBubiaiWeather();

    // 5. Interaktyvus Leaflet.js žemėlapis (Centras: 55.8570, 23.1340, mastelis: 14)
    const locations = [
        {
            title: "Bubių piliakalnis",
            coords: [55.8568, 23.1278],
            category: "Istorinis paminklas",
            desc: "Bubių piliakalnis (Dubysos slėnio apžvalga ir istorinė Šiaulių žemės pilies vieta)"
        },
        {
            title: "Bubių paplūdimys",
            coords: [55.8647, 23.1360],
            category: "Poilsio ir maudynių zona",
            desc: "Bubių paplūdimys (Pagrindinė Bubių tvenkinio maudykla, pontoninis lieptas ir poilsio zona)"
        },
        {
            title: "Bubių mokykla",
            coords: [55.8562, 23.1362],
            category: "Švietimas ir bendruomenė",
            desc: "Šiaulių r. Bubių mokykla (Dubysos g. / Šiaulių pl.)"
        },
        {
            title: "Bubių dvaro sodyba",
            coords: [55.8530, 23.1305],
            category: "Architektūros paveldas",
            desc: "Bubių dvaro sodyba (Grafų Zubovų dvaras, viešbutis ir parkas)"
        },
        {
            title: "Bubių bravoras",
            coords: [55.8532, 23.1312],
            category: "Kraftinė aludarystė",
            desc: "„Bubių bravoras“ (Vietinė kraftinio alaus darykla šalia dvaro)"
        },
        {
            title: "Šiaulių šamas",
            coords: [55.8550, 23.1385],
            category: "Akvakultūros ūkis",
            desc: "„Šiaulių šamas“ (Afrikinių šamų ūkis Bubiuose)"
        }
    ];

    function initOrRefreshMap() {
        const mapContainer = document.getElementById("bubiaiMap");
        if (!mapContainer || typeof L === "undefined") return;

        if (!leafletMap) {
            leafletMap = L.map("bubiaiMap").setView([55.8570, 23.1340], 14);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> bendradarbiai'
            }).addTo(leafletMap);

            locations.forEach((loc, idx) => {
                const popupHtml = `
                    <div style="min-width:220px; font-family:system-ui,sans-serif; line-height:1.45;">
                        <span style="display:inline-block; font-size:11px; font-weight:700; color:#1b4d3e; background:#eef4f0; padding:2px 7px; border-radius:99px; margin-bottom:4px;">
                            ${loc.category}
                        </span>
                        <h4 style="margin:4px 0 6px; font-size:15px; color:#12352b;">${loc.title}</h4>
                        <p style="margin:0; font-size:13px; color:#374151;">${loc.desc}</p>
                    </div>
                `;
                const marker = L.marker(loc.coords).addTo(leafletMap).bindPopup(popupHtml);
                mapMarkers.push(marker);

                marker.on("click", () => {
                    pinButtons.forEach((b) => b.classList.remove("active"));
                    if (pinButtons[idx]) pinButtons[idx].classList.add("active");
                });

                if (idx === 0) {
                    marker.openPopup();
                }
            });
        }

        setTimeout(() => {
            leafletMap.invalidateSize();
        }, 120);
    }

    // Greito žymeklių pasirinkimo mygtukai virš žemėlapio
    const pinButtons = document.querySelectorAll(".map-pin-btn[data-marker-index]");
    pinButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.getAttribute("data-marker-index") || "0", 10);
            pinButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            initOrRefreshMap();
            if (leafletMap && mapMarkers[idx]) {
                const targetCoords = locations[idx].coords;
                leafletMap.flyTo(targetCoords, 16, { duration: 0.7 });
                mapMarkers[idx].openPopup();
            }
        });
    });
});
