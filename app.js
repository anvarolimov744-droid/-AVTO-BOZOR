"use strict";

/* =========================================================
   AVTO BOZOR
   app.js
========================================================= */

const $ = (id) => document.getElementById(id);

/* =========================================================
   STORAGE
========================================================= */

let cars = loadJSON("avtoBozorCars", []);
let favorites = loadJSON("avtoBozorFavorites", []);

let selectedPhotos = [];
let favoritesOnly = false;

function loadJSON(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (error) {
        console.error("Storage xatosi:", error);
        return fallback;
    }
}

function saveCars() {
    localStorage.setItem("avtoBozorCars", JSON.stringify(cars));
}

function saveFavorites() {
    localStorage.setItem(
        "avtoBozorFavorites",
        JSON.stringify(favorites)
    );
}

/* =========================================================
   ELEMENTLAR
========================================================= */

const addModal = $("addModal");
const detailModal = $("detailModal");

const carForm = $("carForm");

const carsGrid = $("carsGrid");
const emptyState = $("emptyState");

const photoInput = $("photoInput");
const photoPreview = $("photoPreview");

/* =========================================================
   MODAL
========================================================= */

function openAddModal() {
    if (!addModal) return;

    addModal.classList.add("show");
    document.body.style.overflow = "hidden";
}

function closeAddModal() {
    if (!addModal) return;

    addModal.classList.remove("show");
    document.body.style.overflow = "";
}

function closeDetailModal() {
    if (!detailModal) return;

    detailModal.classList.remove("show");
    document.body.style.overflow = "";
}

$("openAddBtn")?.addEventListener("click", openAddModal);
$("emptyAddBtn")?.addEventListener("click", openAddModal);

$("closeAddBtn")?.addEventListener(
    "click",
    closeAddModal
);

$("closeDetailBtn")?.addEventListener(
    "click",
    closeDetailModal
);

window.addEventListener("click", (event) => {

    if (event.target === addModal) {
        closeAddModal();
    }

    if (event.target === detailModal) {
        closeDetailModal();
    }
});

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {
        closeAddModal();
        closeDetailModal();
    }

});

/* =========================================================
   RASMLARNI TANLASH
========================================================= */

$("photoBtn")?.addEventListener("click", () => {

    if (photoInput) {
        photoInput.click();
    }

});

photoInput?.addEventListener("change", async () => {

    const files = Array.from(photoInput.files || []);

    if (!files.length) {
        return;
    }

    selectedPhotos = [];

    for (const file of files) {

        if (!file.type.startsWith("image/")) {
            continue;
        }

        try {

            const compressed =
                await compressImage(file);

            selectedPhotos.push(compressed);

        } catch (error) {

            console.error(
                "Rasmni qayta ishlash xatosi:",
                error
            );

        }

    }

    renderPhotoPreview();

});

/* =========================================================
   RASMNI SIQISH
========================================================= */

function compressImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = (event) => {

            const img = new Image();

            img.onload = () => {

                const maxWidth = 1200;
                const maxHeight = 900;

                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {

                    height =
                        height * (maxWidth / width);

                    width = maxWidth;
                }

                if (height > maxHeight) {

                    width =
                        width * (maxHeight / height);

                    height = maxHeight;
                }

                const canvas =
                    document.createElement("canvas");

                canvas.width = width;
                canvas.height = height;

                const ctx =
                    canvas.getContext("2d");

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                const result =
                    canvas.toDataURL(
                        "image/jpeg",
                        0.82
                    );

                resolve(result);
            };

            img.onerror = reject;

            img.src = event.target.result;
        };

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}

/* =========================================================
   RASM PREVIEW
========================================================= */

function renderPhotoPreview() {

    if (!photoPreview) return;

    photoPreview.innerHTML = "";

    selectedPhotos.forEach((src, index) => {

        const item =
            document.createElement("div");

        item.className = "preview-item";

        const img =
            document.createElement("img");

        img.src = src;
        img.alt = `Avtomobil rasmi ${index + 1}`;

        const remove =
            document.createElement("button");

        remove.type = "button";
        remove.className = "preview-remove";
        remove.textContent = "×";

        remove.addEventListener(
            "click",
            () => {

                selectedPhotos.splice(index, 1);

                renderPhotoPreview();

            }
        );

        item.appendChild(img);
        item.appendChild(remove);

        photoPreview.appendChild(item);

    });

}

/* =========================================================
   FORM
========================================================= */

carForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        if (selectedPhotos.length === 0) {

            showToast(
                "Avval avtomobil rasmini tanlang!"
            );

            return;
        }

        const model =
            $("carModel")?.value.trim();

        const price =
            Number($("carPrice")?.value);

        const year =
            Number($("carYear")?.value);

        const mileage =
            Number($("carMileage")?.value);

        const gear =
            $("carGear")?.value;

        const fuel =
            $("carFuel")?.value;

        const region =
            $("carRegion")?.value;

        const phone =
            $("carPhone")?.value.trim();

        const location =
            $("carLocation")?.value.trim()
            || "Joylashuv tanlanmagan";

        if (!model) {

            showToast(
                "Avtomobil modelini kiriting!"
            );

            return;
        }

        if (!price || price <= 0) {

            showToast(
                "Narxni to'g'ri kiriting!"
            );

            return;
        }

        if (!year) {

            showToast(
                "Ishlab chiqarilgan yilni kiriting!"
            );

            return;
        }

        if (!phone) {

            showToast(
                "Telefon raqamni kiriting!"
            );

            return;
        }

        const car = {

            id:
                Date.now() +
                Math.floor(
                    Math.random() * 1000
                ),

            model,
            price,
            year,
            mileage,

            gear,
            fuel,
            region,

            phone,

            location,

            photos: [...selectedPhotos],

            createdAt: Date.now()

        };

        cars.unshift(car);

        saveCars();

        carForm.reset();

        selectedPhotos = [];

        if (photoPreview) {
            photoPreview.innerHTML = "";
        }

        if (photoInput) {
            photoInput.value = "";
        }

        closeAddModal();

        renderCars();

        showToast(
            "E'lon muvaffaqiyatli joylandi!"
        );
    }
);

/* =========================================================
   GEOLOCATION
========================================================= */

$("locationBtn")?.addEventListener(
    "click",
    () => {

        if (!navigator.geolocation) {

            showToast(
                "Brauzeringiz geolokatsiyani qo'llamaydi"
            );

            return;
        }

        showToast(
            "Joylashuv aniqlanmoqda..."
        );

        navigator.geolocation.getCurrentPosition(

            (position) => {

                const lat =
                    position.coords.latitude;

                const lng =
                    position.coords.longitude;

                if ($("carLocation")) {

                    $("carLocation").value =
                        `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                }

                const mapText =
                    $("mapArea")?.querySelector("p");

                if (mapText) {

                    mapText.textContent =
                        "Joylashuv tanlandi ✓";
                }

                showToast(
                    "Joylashuv saqlandi!"
                );
            },

            (error) => {

                console.error(
                    "Geolocation:",
                    error
                );

                showToast(
                    "Joylashuvga ruxsat berilmadi"
                );
            },

            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }

        );

    }
);

/* =========================================================
   FORMAT
========================================================= */

function formatPrice(value) {

    return (
        new Intl.NumberFormat("uz-UZ")
            .format(Number(value) || 0)
        + " so'm"
    );

}

function formatMileage(value) {

    return (
        new Intl.NumberFormat("uz-UZ")
            .format(Number(value) || 0)
        + " km"
    );

}

/* =========================================================
   HTML XAVFSIZLIGI
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}

/* =========================================================
   TELEFON
========================================================= */

function cleanPhone(phone) {

    return String(phone || "")
        .replace(/[^\d+]/g, "");

}

/* =========================================================
   FILTER
========================================================= */

function getFilteredCars() {

    const search =
        $("searchInput")?.value
            .trim()
            .toLowerCase() || "";

    const model =
        $("modelFilter")?.value || "";

    const minPrice =
        Number(
            $("minPrice")?.value
        ) || 0;

    const maxPrice =
        Number(
            $("maxPrice")?.value
        ) || Infinity;

    const minYear =
        Number(
            $("minYear")?.value
        ) || 0;

    const maxYear =
        Number(
            $("maxYear")?.value
        ) || Infinity;

    const minMileage =
        Number(
            $("minMileage")?.value
        ) || 0;

    const maxMileage =
        Number(
            $("maxMileage")?.value
        ) || Infinity;

    const gear =
        $("gearFilter")?.value || "";

    const fuel =
        $("fuelFilter")?.value || "";

    const region =
        $("regionFilter")?.value || "";

    let result =
        cars.filter((car) => {

            const carModel =
                String(car.model || "")
                    .toLowerCase();

            const carRegion =
                String(car.region || "")
                    .toLowerCase();

            const matchesSearch =
                !search ||
                carModel.includes(search) ||
                carRegion.includes(search);

            const matchesModel =
                !model ||
                car.model === model;

            const matchesPrice =
                Number(car.price) >= minPrice &&
                Number(car.price) <= maxPrice;

            const matchesYear =
                Number(car.year) >= minYear &&
                Number(car.year) <= maxYear;

            const matchesMileage =
                Number(car.mileage) >= minMileage &&
                Number(car.mileage) <= maxMileage;

            const matchesGear =
                !gear ||
                car.gear === gear;

            const matchesFuel =
                !fuel ||
                car.fuel === fuel;

            const matchesRegion =
                !region ||
                car.region === region;

            const matchesFavorite =
                !favoritesOnly ||
                favorites.includes(car.id);

            return (
                matchesSearch &&
                matchesModel &&
                matchesPrice &&
                matchesYear &&
                matchesMileage &&
                matchesGear &&
                matchesFuel &&
                matchesRegion &&
                matchesFavorite
            );

        });

    return sortCars(result);
}

/* =========================================================
   SORT
========================================================= */

function sortCars(list) {

    const sort =
        $("sortSelect")?.value || "new";

    const result = [...list];

    if (sort === "cheap") {

        result.sort(
            (a, b) =>
                Number(a.price) -
                Number(b.price)
        );

    }

    if (sort === "expensive") {

        result.sort(
            (a, b) =>
                Number(b.price) -
                Number(a.price)
        );

    }

    if (sort === "year") {

        result.sort(
            (a, b) =>
                Number(b.year) -
                Number(a.year)
        );

    }

    if (sort === "new") {

        result.sort(
            (a, b) =>
                Number(b.createdAt) -
                Number(a.createdAt)
        );

    }

    return result;
}

/* =========================================================
   RENDER
========================================================= */

function renderCars() {

    if (!carsGrid) return;

    const filtered =
        getFilteredCars();

    if ($("resultCount")) {

        $("resultCount").textContent =
            `${filtered.length} ta e'lon`;
    }

    if ($("favCount")) {

        $("favCount").textContent =
            favorites.length;
    }

    carsGrid.innerHTML = "";

    if (filtered.length === 0) {

        emptyState?.classList.add("show");

        return;
    }

    emptyState?.classList.remove("show");

    filtered.forEach((car) => {

        const card =
            document.createElement("article");

        card.className = "car-card";

        const isFavorite =
            favorites.includes(car.id);

        let imageHTML = "";

        if (
            Array.isArray(car.photos) &&
            car.photos.length > 0
        ) {

            imageHTML = `
                <img
                    src="${car.photos[0]}"
                    alt="${escapeHTML(car.model)}"
                    loading="lazy"
                >
            `;

        } else {

            imageHTML = `
                <div class="no-image">
                    Rasm yo'q
                </div>
            `;

        }

        card.innerHTML = `

            <div class="car-image">

                ${imageHTML}

                ${
                    car.photos &&
                    car.photos.length > 1
                    ? `
                        <span class="photo-count">
                            📷 ${car.photos.length}
                        </span>
                    `
                    : ""
                }

                <button
                    class="favorite ${
                        isFavorite
                            ? "active"
                            : ""
                    }"
                    type="button"
                    aria-label="Sevimli"
                >
                    ${
                        isFavorite
                            ? "♥"
                            : "♡"
                    }
                </button>

            </div>

            <div class="car-info">

                <div class="car-title">

                    <h3>
                        ${escapeHTML(car.model)}
                    </h3>

                    <span>
                        ${escapeHTML(car.year)}
                    </span>

                </div>

                <div class="price">
                    ${formatPrice(car.price)}
                </div>

                <div class="specs">

                    <span class="spec">
                        🛣️
                        ${formatMileage(car.mileage)}
                    </span>

                    <span class="spec">
                        ⚙️
                        ${escapeHTML(car.gear)}
                    </span>

                    <span class="spec">
                        ⛽
                        ${escapeHTML(car.fuel)}
                    </span>

                </div>

                <div class="car-bottom">

                    <span class="region">
                        📍
                        ${escapeHTML(car.region)}
                    </span>

                    <a
                        class="contact-btn"
                        href="tel:${cleanPhone(car.phone)}"
                    >
                        📞 Bog'lanish
                    </a>

                </div>

            </div>
        `;

        const favoriteButton =
            card.querySelector(".favorite");

        favoriteButton?.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                toggleFavorite(car.id);

            }
        );

        const contactButton =
            card.querySelector(".contact-btn");

        contactButton?.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

            }
        );

        card.addEventListener(
            "click",
            () => {

                openDetail(car.id);

            }
        );

        carsGrid.appendChild(card);

    });

}

/* =========================================================
   FAVORITES
========================================================= */

function toggleFavorite(id) {

    if (favorites.includes(id)) {

        favorites =
            favorites.filter(
                item => item !== id
            );

        showToast(
            "Sevimlilardan olib tashlandi"
        );

    } else {

        favorites.push(id);

        showToast(
            "Sevimlilarga qo'shildi"
        );

    }

    saveFavorites();

    renderCars();
}

window.toggleFavorite = toggleFavorite;

/* =========================================================
   FAVORITES BUTTON
========================================================= */

$("favoritesBtn")?.addEventListener(
    "click",
    () => {

        if (favorites.length === 0) {

            showToast(
                "Hali sevimli e'lonlar yo'q"
            );

            return;
        }

        favoritesOnly =
            !favoritesOnly;

        const button =
            $("favoritesBtn");

        if (favoritesOnly) {

            button?.classList.add("active");

            showToast(
                "Faqat sevimli e'lonlar"
            );

        } else {

            button?.classList.remove("active");

            showToast(
                "Barcha e'lonlar"
            );

        }

        renderCars();

    }
);

/* =========================================================
   DETAIL
========================================================= */

function openDetail(id) {

    const car =
        cars.find(
            item => item.id === id
        );

    if (!car) return;

    const photos =
        Array.isArray(car.photos)
            ? car.photos
            : [];

    let galleryHTML = "";

    if (photos.length > 0) {

        galleryHTML = `
            <div class="detail-gallery">

                ${photos.map((src, index) => `
                    <img
                        src="${src}"
                        alt="${escapeHTML(car.model)} ${index + 1}"
                    >
                `).join("")}

            </div>
        `;

    }

    const phone =
        cleanPhone(car.phone);

    $("detailContent").innerHTML = `

        ${galleryHTML}

        <h2>
            ${escapeHTML(car.model)}
            ${escapeHTML(car.year)}
        </h2>

        <div class="price">
            ${formatPrice(car.price)}
        </div>

        <div class="detail-specs">

            <div class="detail-spec-item">
                <small>Probeg</small>
                <b>
                    ${formatMileage(car.mileage)}
                </b>
            </div>

            <div class="detail-spec-item">
                <small>Uzatma</small>
                <b>
                    ${escapeHTML(car.gear)}
                </b>
            </div>

            <div class="detail-spec-item">
                <small>Yoqilg'i</small>
                <b>
                    ${escapeHTML(car.fuel)}
                </b>
            </div>

            <div class="detail-spec-item">
                <small>Viloyat</small>
                <b>
                    ${escapeHTML(car.region)}
                </b>
            </div>

            <div class="detail-spec-item">
                <small>Joylashuv</small>
                <b>
                    ${escapeHTML(car.location)}
                </b>
            </div>

            <div class="detail-spec-item">
                <small>Telefon</small>
                <b>
                    ${escapeHTML(car.phone)}
                </b>
            </div>

        </div>

        <a
            href="tel:${phone}"
            class="submit-btn detail-contact"
        >
            📞 Sotuvchi bilan bog'lanish
        </a>
    `;

    detailModal?.classList.add("show");

    document.body.style.overflow =
        "hidden";
}

/* =========================================================
   SEARCH + FILTER EVENTS
========================================================= */

const filterIds = [

    "searchInput",

    "modelFilter",

    "minPrice",
    "maxPrice",

    "minYear",
    "maxYear",

    "minMileage",
    "maxMileage",

    "gearFilter",
    "fuelFilter",
    "regionFilter",

    "sortSelect"

];

filterIds.forEach((id) => {

    const element = $(id);

    if (!element) return;

    element.addEventListener(
        "input",
        renderCars
    );

    element.addEventListener(
        "change",
        renderCars
    );

});

/* =========================================================
   SEARCH BUTTON
========================================================= */

$("searchBtn")?.addEventListener(
    "click",
    () => {

        renderCars();

        document
            .getElementById("carsSection")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }
);

/* =========================================================
   CLEAR FILTERS
========================================================= */

$("clearFilters")?.addEventListener(
    "click",
    () => {

        const ids = [

            "searchInput",

            "modelFilter",

            "minPrice",
            "maxPrice",

            "minYear",
            "maxYear",

            "minMileage",
            "maxMileage",

            "gearFilter",
            "fuelFilter",
            "regionFilter"

        ];

        ids.forEach((id) => {

            const element = $(id);

            if (element) {
                element.value = "";
            }

        });

        favoritesOnly = false;

        $("favoritesBtn")
            ?.classList.remove("active");

        renderCars();

        showToast(
            "Filterlar tozalandi"
        );

    }
);

/* =========================================================
   MOBILE FILTER
========================================================= */

$("filterMobileBtn")?.addEventListener(
    "click",
    () => {

        $("filters")
            ?.classList.toggle("open");

    }
);

/* =========================================================
   DARK MODE
========================================================= */

const savedTheme =
    localStorage.getItem(
        "avtoBozorTheme"
    );

if (savedTheme === "dark") {

    document.body.classList.add(
        "dark"
    );

    if ($("themeBtn")) {
        $("themeBtn").textContent =
            "☀️";
    }

}

$("themeBtn")?.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );

        const dark =
            document.body.classList.contains(
                "dark"
            );

        localStorage.setItem(
            "avtoBozorTheme",
            dark
                ? "dark"
                : "light"
        );

        if ($("themeBtn")) {

            $("themeBtn").textContent =
                dark
                    ? "☀️"
                    : "🌙";
        }

    }
);

/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {

    const toast = $("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2500);

}

/* =========================================================
   E'LONLAR SONINI YANGILASH
========================================================= */

function updateCounters() {

    if ($("resultCount")) {

        $("resultCount").textContent =
            `${getFilteredCars().length} ta e'lon`;
    }

    if ($("favCount")) {

        $("favCount").textContent =
            favorites.length;
    }

}

/* =========================================================
   START
========================================================= */

renderCars();
updateCounters();

console.log(
    "🚘 AVTO BOZOR ishga tushdi!"
);