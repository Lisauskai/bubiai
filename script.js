// ==========================================================================
// Bubių bendruomenės svetainės (bubiai.eu) JavaScript skriptas
// Moduliai: Einamieji metai, SPA navigacija, orų valdiklis, Leaflet žemėlapis
// Kiekvienas modulis vykdomas nepriklausomai su pilnu klaidų apdorojimu.
// ==========================================================================

// Globalūs žemėlapio kintamieji
let leafletMap = null;
const mapMarkers = [];
let switchTabGlobal = null;

// Tikslios objektų ir pažintinių takų pradžios koordinatės
const bubiaiLocations = [
    // 1-6: Miestelio objektai
    {
        title: "Bubių piliakalnis",
        coords: [55.86191674603082, 23.130694252141637],
        category: "Istorinis paminklas",
        desc: "Bubių piliakalnis (Dubysos slėnio apžvalga ir istorinė Šiaulių žemės pilies vieta)",
        isTrail: false
    },
    {
        title: "Bubių paplūdimys",
        coords: [55.8647, 23.1360],
        category: "Poilsio ir maudynių zona",
        desc: "Bubių paplūdimys (Pagrindinė Bubių tvenkinio maudykla, pontoninis lieptas ir poilsio zona)",
        isTrail: false
    },
    {
        title: "Bubių mokykla",
        coords: [55.8562, 23.1362],
        category: "Švietimas ir bendruomenė",
        desc: "Šiaulių r. Bubių mokykla (Dubysos g. / Šiaulių pl.)",
        isTrail: false
    },
    {
        title: "Bubių dvaro sodyba",
        coords: [55.856309960305694, 23.137114295601748],
        category: "Architektūros paveldas",
        desc: "Bubių dvaro sodyba (Grafų Zubovų dvaras, viešbutis ir parkas)",
        isTrail: false
    },
    {
        title: "Bubių bravoras",
        coords: [55.85664780818139, 23.13836183904464],
        category: "Kraftinė aludarystė",
        desc: "„Bubių bravoras“ (Vietinė kraftinio alaus darykla šalia dvaro)",
        isTrail: false
    },
    {
        title: "Šiaulių šamas",
        coords: [55.862205127656495, 23.149591167708433],
        category: "Akvakultūros ūkis",
        desc: "„Šiaulių šamas“ (Afrikinių šamų ūkis Bubiuose)",
        isTrail: false
    },
    // 7-15: Pažintinių takų pradžios (Kurtuvėnų regioninis parkas)
    {
        title: "„Šalia dvaro“ takai (Startas)",
        coords: [55.826093, 23.048426],
        category: "Pažintinio tako pradžia",
        desc: "Kurtuvėnų dvaro parko ir apylinkių pažintinių takų pradžios vieta.",
        isTrail: true
    },
    {
        title: "Svilės kraštovaizdžio takas (Startas)",
        coords: [55.839828, 22.942569],
        category: "Pažintinio tako pradžia",
        desc: "Svilės kraštovaizdžio tako pradžia prie Svilės šaltinių ir žemapelkės.",
        isTrail: true
    },
    {
        title: "Juodlės pažintinis takas (Startas)",
        coords: [55.818028, 22.924126],
        category: "Pažintinio tako pradžia",
        desc: "Juodlės pažintinio tako pradžia ir poilsiavietė prie Juodlės ežero.",
        isTrail: true
    },
    {
        title: "Vainagių miško pažintinis takas (Startas)",
        coords: [55.804118, 22.994006],
        category: "Pažintinio tako pradžia",
        desc: "Vainagių miško pažintinio tako pradžia prie Vainagių ežero ir girininkijos.",
        isTrail: true
    },
    {
        title: "Bubių istorinis takas (Startas)",
        coords: [55.848634, 23.126620],
        category: "Istorinis-pažintinis takas",
        desc: "Bubių istorinio tako ir Ventos–Dubysos perkaso pradžios vieta Bubiuose.",
        isTrail: true
    },
    {
        title: "Pageluvio ežeryno takai (Startas)",
        coords: [55.797760, 23.103825],
        category: "Pažintinio tako pradžia",
        desc: "Pageluvio ežeryno takų pradžia prie Geluvos ežero ir Barsukyno ozo.",
        isTrail: true
    },
    {
        title: "Targių ozų takas (Startas)",
        coords: [55.752967, 22.979436],
        category: "Pažintinio tako pradžia",
        desc: "Targių ozų kraštovaizdžio tako pradžia prie Šventjonio miško.",
        isTrail: true
    },
    {
        title: "Pustlaukio duobių takas (Startas)",
        coords: [55.807853, 22.970293],
        category: "Pažintinio tako pradžia",
        desc: "Pustlaukio geomorfologinių termokarstinių duobių tako pradžios vieta.",
        isTrail: true
    },
    {
        title: "Smirdėlės pelkių takas (Startas)",
        coords: [55.799573, 23.028290],
        category: "Pažintinio tako pradžia",
        desc: "Smirdėlės gamtinio pažintinio tako pradžia prie pelkių ir šaltiniuoto upelio.",
        isTrail: true
    }
];

// ==========================================================================
// 1. Einamieji metai poraštėje
// ==========================================================================
function initCurrentYear() {
    try {
        const yearSpan = document.getElementById("currentYear");
        if (yearSpan) {
            yearSpan.textContent = String(new Date().getFullYear());
        }
    } catch (e) {
        console.warn("Metų atnaujinimo klaida:", e);
    }
}

// ==========================================================================
// 2. Mobilus navigacijos meniu (Hamburger)
// ==========================================================================
function initMobileMenu() {
    try {
        const menuToggle = document.getElementById("menuToggle");
        const mainNav = document.getElementById("mainNav");
        if (!menuToggle || !mainNav) return;

        menuToggle.addEventListener("click", () => {
            const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
            menuToggle.setAttribute("aria-expanded", String(!isExpanded));
            mainNav.classList.toggle("open");
        });
    } catch (e) {
        console.warn("Mobilaus meniu klaida:", e);
    }
}

function closeMobileMenu() {
    try {
        const menuToggle = document.getElementById("menuToggle");
        const mainNav = document.getElementById("mainNav");
        if (menuToggle && mainNav) {
            menuToggle.setAttribute("aria-expanded", "false");
            mainNav.classList.remove("open");
        }
    } catch (e) {
        // Ignoruojame
    }
}

// ==========================================================================
// 3. SPA skilčių (Tabs) navigacija
// ==========================================================================
function initTabsNavigation() {
    try {
        const validTabs = ["pradzia", "vietos", "verslas", "seniunija", "zemelapis"];
        const tabButtons = document.querySelectorAll(".nav-tab[data-tab]");
        const tabViews = document.querySelectorAll(".tab-view");

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

            // Jei atveriamas žemėlapis, užtikriname jo dydžio perskaičiavimą
            if (targetId === "zemelapis") {
                refreshLeafletMap();
            }
        };

        switchTabGlobal = switchTab;

        // Navigacijos mygtukų paspaudimai
        tabButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const tabId = btn.getAttribute("data-tab");
                if (tabId) {
                    switchTab(tabId);
                }
            });
        });

        // Visų [data-tab-target] nuorodų / mygtukų paspaudimai
        document.addEventListener("click", (e) => {
            if (!e || !e.target || typeof e.target.closest !== "function") return;
            const trigger = e.target.closest("[data-tab-target]");
            if (trigger) {
                const targetTab = trigger.getAttribute("data-tab-target");
                if (targetTab) {
                    if (typeof e.preventDefault === "function") e.preventDefault();
                    switchTab(targetTab);
                }
            }
        });

        // Patikriname pradinį URL hash
        const initialHash = window.location.hash.replace("#", "").trim();
        if (validTabs.includes(initialHash)) {
            switchTab(initialHash, false);
        }
    } catch (e) {
        console.warn("SPA navigacijos inicializavimo klaida:", e);
    }
}

// ==========================================================================
// 4. Gyvas orų valdiklis prie Bubių tvenkinio (Open-Meteo API)
// ==========================================================================
function getWeatherIconAndText(code) {
    if (code === 0) return { icon: "☀️", desc: "Giedra" };
    if (code === 1 || code === 2) return { icon: "🌤️", desc: "Mažai debesuota" };
    if (code === 3) return { icon: "☁️", desc: "Debesuota" };
    if (code === 45 || code === 48) return { icon: "🌫️", desc: "Rūkas" };
    if (code >= 51 && code <= 67) return { icon: "🌧️", desc: "Lietus" };
    if (code >= 71 && code <= 77) return { icon: "❄️", desc: "Sniegas" };
    if (code >= 80 && code <= 82) return { icon: "🌦️", desc: "Trumpas lietus" };
    if (code >= 95) return { icon: "⛈️", desc: "Perkūnija" };
    return { icon: "🌤️", desc: "Vidutiniai orai" };
}

async function initWeatherWidget() {
    const weatherValuesEl = document.getElementById("weatherValues");
    const weatherIconEl = document.getElementById("weatherIcon");
    const heroWeatherTextEl = document.getElementById("heroWeatherText");

    const apiUrl = "https://api.open-meteo.com/v1/forecast?latitude=55.858&longitude=23.133&current=temperature_2m,wind_speed_10m,weather_code&wind_speed_unit=ms&timezone=Europe%2FVilnius";

    try {
        const response = await fetch(apiUrl, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Orų API atsakymo klaida: ${response.status}`);
        }
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
        console.warn("Nepavyko gauti orų duomenų:", err);
        if (weatherValuesEl) weatherValuesEl.textContent = "Duomenys laikinai nepasiekiami";
        if (heroWeatherTextEl) heroWeatherTextEl.textContent = "Stebėkite Bubių tvenkinio orus";
    }
}

// ==========================================================================
// 5. Interaktyvus Leaflet.js žemėlapis
// Centras: [55.8570, 23.1340], mastelis: 14
// ==========================================================================
function refreshLeafletMap() {
    try {
        if (!leafletMap) {
            initLeafletMap();
        } else {
            setTimeout(() => {
                if (leafletMap) leafletMap.invalidateSize();
            }, 100);
            setTimeout(() => {
                if (leafletMap) leafletMap.invalidateSize();
            }, 300);
        }
    } catch (e) {
        console.warn("Žemėlapio atnaujinimo klaida:", e);
    }
}

function initLeafletMap() {
    try {
        const mapContainer = document.getElementById("bubiaiMap");
        if (!mapContainer) return;

        // Jei Leaflet biblioteka dar nebaigta krauti, laukiame ir bandome dar kartą
        if (typeof L === "undefined") {
            let retries = 0;
            const checkL = setInterval(() => {
                retries++;
                if (typeof L !== "undefined") {
                    clearInterval(checkL);
                    initLeafletMap();
                } else if (retries >= 30) {
                    clearInterval(checkL);
                    console.warn("Leaflet biblioteka nebuvo įkelta per 3 sekundes.");
                }
            }, 100);
            return;
        }

        // Jeigu žemėlapis jau inicializuotas ant šio konteinerio, tik atnaujiname dydį
        if (leafletMap || mapContainer._leaflet_id) {
            if (leafletMap) {
                setTimeout(() => leafletMap.invalidateSize(), 100);
            }
            return;
        }

        // Sukuriame Leaflet žemėlapį
        leafletMap = L.map("bubiaiMap").setView([55.8570, 23.1340], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> bendradarbiai'
        }).addTo(leafletMap);

        // Pridedame visus žymeklius
        bubiaiLocations.forEach((loc, idx) => {
            const trailNotice = loc.isTrail
                ? `<div style="margin-top:7px; padding-top:6px; border-top:1px dashed #cbd5e1; font-size:12px; color:#1b4d3e; font-weight:600;">
                    🌲 Daugiau informacijos ir video rasite „Lankytinos vietos ir Takai“ skiltyje.
                    <div style="margin-top:4px;"><a href="#vietos" data-tab-target="vietos" style="color:#0e5a3c; text-decoration:underline; font-weight:700;">Atidaryti takų aprašymus ir video →</a></div>
                </div>`
                : "";

            const popupHtml = `
                <div style="min-width:240px; font-family:system-ui,sans-serif; line-height:1.45;">
                    <span style="display:inline-block; font-size:11px; font-weight:700; color:#1b4d3e; background:#eef4f0; padding:2px 7px; border-radius:99px; margin-bottom:4px;">
                        ${loc.category}
                    </span>
                    <h4 style="margin:4px 0 6px; font-size:15px; color:#12352b;">${loc.title}</h4>
                    <p style="margin:0; font-size:13px; color:#374151;">${loc.desc}</p>
                    ${trailNotice}
                </div>
            `;

            const marker = L.marker(loc.coords).addTo(leafletMap).bindPopup(popupHtml);
            mapMarkers.push(marker);

            marker.on("click", () => {
                try {
                    const allPinButtons = document.querySelectorAll(".map-pin-btn[data-marker-index]");
                    allPinButtons.forEach((b) => b.classList.remove("active"));
                    const targetBtn = document.querySelector(`.map-pin-btn[data-marker-index="${idx}"]`);
                    if (targetBtn) targetBtn.classList.add("active");
                } catch (err) {
                    // Ignoruojame
                }
            });

            // Pirmasis žymeklis (Bubių piliakalnis) pagal nutylėjimą su atvertu langeliu
            if (idx === 0) {
                marker.openPopup();
            }
        });

        // Užtikriname teisingą žemėlapio plytelių atvaizdavimą
        setTimeout(() => {
            if (leafletMap) leafletMap.invalidateSize();
        }, 120);

    } catch (e) {
        console.warn("Leaflet žemėlapio inicializavimo klaida:", e);
    }
}

// ==========================================================================
// 6. Žemėlapio greito pasirinkimo mygtukai
// ==========================================================================
function initMapPinButtons() {
    try {
        const pinButtons = document.querySelectorAll(".map-pin-btn[data-marker-index]");
        if (!pinButtons || pinButtons.length === 0) return;

        pinButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                const idx = parseInt(btn.getAttribute("data-marker-index") || "0", 10);

                pinButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");

                // Užtikriname, kad esame žemėlapio skiltyje
                if (switchTabGlobal) {
                    const zemelapisView = document.getElementById("view-zemelapis");
                    if (zemelapisView && zemelapisView.hasAttribute("hidden")) {
                        switchTabGlobal("zemelapis");
                    }
                }

                // Užtikriname, kad žemėlapis inicializuotas
                if (!leafletMap) {
                    initLeafletMap();
                }

                if (leafletMap && mapMarkers[idx] && bubiaiLocations[idx]) {
                    const targetCoords = bubiaiLocations[idx].coords;
                    const targetZoom = idx >= 6 ? 14 : 16;
                    leafletMap.flyTo(targetCoords, targetZoom, { duration: 0.8 });
                    mapMarkers[idx].openPopup();
                }
            });
        });
    } catch (e) {
        console.warn("Žemėlapio mygtukų klaida:", e);
    }
}

// ==========================================================================
// Bendra saugi aplikacijos inicializacija
// ==========================================================================
function initBubiaiApp() {
    try { initCurrentYear(); } catch (e) { console.error("Klaida initCurrentYear:", e); }
    try { initMobileMenu(); } catch (e) { console.error("Klaida initMobileMenu:", e); }
    try { initTabsNavigation(); } catch (e) { console.error("Klaida initTabsNavigation:", e); }
    try { initWeatherWidget(); } catch (e) { console.error("Klaida initWeatherWidget:", e); }
    try { initLeafletMap(); } catch (e) { console.error("Klaida initLeafletMap:", e); }
    try { initMapPinButtons(); } catch (e) { console.error("Klaida initMapPinButtons:", e); }

    // Stebime lango dydžio pasikeitimą, kad atnaujintume žemėlapį
    window.addEventListener("resize", () => {
        if (leafletMap) {
            leafletMap.invalidateSize();
        }
    });
}

// Paleidžiame nepriklausomai nuo to, ar DOMContentLoaded jau įvyko, ar dar tik įvyks
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBubiaiApp);
} else {
    initBubiaiApp();
}
