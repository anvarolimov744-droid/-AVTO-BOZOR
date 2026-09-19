/*
====================================================
AVTO-BOZOR ONLINE APP
====================================================

MUHIM:

Render serveringiz URL manzilini quyidagi joyga yozing:

const SERVER_URL =
"https://SIZNING-SERVERINGIZ.onrender.com";

Agar server GitHub Pages bilan bir xil domen ostida
ishlasa, SERVER_URL bo'sh qolishi mumkin.
====================================================
*/


const SERVER_URL = "";


/*
API manzili
*/

const API =
  (SERVER_URL || "").replace(/\/$/, "") + "/api";


/*
HTML elementlarini qisqa olish
*/

const $ = (id) =>
  document.getElementById(id);


/*
Barcha avtomobillar
*/

let cars = [];


/*
Rasm preview uchun
*/

let selectedImage = "";


/*
====================================================
TOAST
====================================================
*/

function toast(message) {

  const box = $("toast");

  box.textContent = message;

  box.style.display = "block";

  clearTimeout(window.toastTimer);

  window.toastTimer =
    setTimeout(() => {

      box.style.display = "none";

    }, 3000);

}


/*
====================================================
HTML XAVFSIZLIGI
====================================================
*/

function escapeHTML(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/*
====================================================
PUL FORMAT
====================================================
*/

function formatMoney(value) {

  return Number(value || 0)
    .toLocaleString("uz-UZ") + " so'm";

}


/*
====================================================
SERVERDAN E'LONLARNI OLISH
====================================================
*/

async function loadCars() {

  try {

    const response =
      await fetch(API + "/cars");

    if (!response.ok) {

      throw new Error(
        "Server javobi xato"
      );

    }

    cars =
      await response.json();

    renderCars();

  }

  catch (error) {

    console.error(error);

    $("carsGrid").innerHTML = "";

    $("emptyState").classList.remove(
      "hidden"
    );

    $("emptyState").querySelector("h2").textContent =
      "Server ulanmagan";

    $("emptyState").querySelector("p").textContent =
      "app.js ichidagi SERVER_URL manzilini Render serveringiz URL manziliga almashtiring.";

    $("resultCount").textContent =
      "0 ta e'lon";

  }

}


/*
====================================================
FILTER
====================================================
*/

function getFilteredCars() {

  let result =
    [...cars];


  /*
  SEARCH
  */

  const search =
    $("searchInput")
      .value
      .trim()
      .toLowerCase();


  if (search) {

    result =
      result.filter(car => {

        return (

          String(car.model || "")
            .toLowerCase()
            .includes(search)

          ||

          String(car.region || "")
            .toLowerCase()
            .includes(search)

          ||

          String(car.fuel || "")
            .toLowerCase()
            .includes(search)

        );

      });

  }


  /*
  MODEL
  */

  const model =
    $("modelFilter").value;


  if (model) {

    result =
      result.filter(car =>
        String(car.model)
          .toLowerCase()
          .includes(
            model.toLowerCase()
          )
      );

  }


  /*
  MIN PRICE
  */

  const minPrice =
    Number(
      $("minPrice").value
    );


  if (minPrice) {

    result =
      result.filter(car =>
        Number(car.price) >= minPrice
      );

  }


  /*
  MAX PRICE
  */

  const maxPrice =
    Number(
      $("maxPrice").value
    );


  if (maxPrice) {

    result =
      result.filter(car =>
        Number(car.price) <= maxPrice
      );

  }


  /*
  REGION
  */

  const region =
    $("regionFilter").value;


  if (region) {

    result =
      result.filter(car =>
        String(car.region)
          .toLowerCase()
          .includes(
            region.toLowerCase()
          )
      );

  }


  /*
  SORT
  */

  const sort =
    $("sortSelect").value;


  if (sort === "cheap") {

    result.sort(
      (a,b) =>
        Number(a.price) -
        Number(b.price)
    );

  }


  if (sort === "expensive") {

    result.sort(
      (a,b) =>
        Number(b.price) -
        Number(a.price)
    );

  }


  if (sort === "year") {

    result.sort(
      (a,b) =>
        Number(b.year) -
        Number(a.year)
    );

  }


  if (sort === "new") {

    result.sort(
      (a,b) =>
        Number(b.createdAt || 0) -
        Number(a.createdAt || 0)
    );

  }


  return result;

}


/*
====================================================
E'LONLARNI CHIQARISH
====================================================
*/

function renderCars() {

  const list =
    getFilteredCars();


  $("resultCount").textContent =
    list.length + " ta e'lon";


  const empty =
    $("emptyState");


  if (!list.length) {

    $("carsGrid").innerHTML = "";

    empty.classList.remove(
      "hidden"
    );

    return;

  }


  empty.classList.add(
    "hidden"
  );


  $("carsGrid").innerHTML =
    list.map(car => {

      const image =
        car.image
          ? `
            <img
              class="car-image"
              src="${car.image}"
              alt="${escapeHTML(car.model)}">
          `
          : `
            <div
              class="car-image"
              style="
                display:flex;
                align-items:center;
                justify-content:center;
                font-size:55px;
              ">
              🚘
            </div>
          `;


      return `

        <article class="car-card">

          ${image}

          <div class="car-body">

            <h3>
              ${escapeHTML(car.model)}
            </h3>

            <div class="price">
              ${formatMoney(car.price)}
            </div>

            <div class="car-meta">

              📅 ${escapeHTML(car.year)}
              <br>

              🛣️
              ${Number(car.mileage || 0)
                .toLocaleString()}
              km

              <br>

              ⚙️ ${escapeHTML(car.gear)}

              <br>

              ⛽ ${escapeHTML(car.fuel)}

              <br>

              📍 ${escapeHTML(car.region)}

            </div>


            <div class="car-actions">

              <button
                class="detail-btn"
                onclick="showDetail('${car.id}')">

                Batafsil

              </button>


              <a
                class="phone-btn"
                href="tel:${escapeHTML(car.phone)}">

                📞 Telefon

              </a>

            </div>

          </div>

        </article>

      `;

    }).join("");

}


/*
====================================================
DETAIL
====================================================
*/

window.showDetail =
  function(id) {

    const car =
      cars.find(
        item =>
          String(item.id) === String(id)
      );


    if (!car) {

      return;

    }


    const image =
      car.image
        ? `
          <img
            class="detail-image"
            src="${car.image}"
            alt="${escapeHTML(car.model)}">
        `
        : "";


    $("detailContent").innerHTML = `

      ${image}

      <h2>
        ${escapeHTML(car.model)}
      </h2>

      <div class="detail-price">
        ${formatMoney(car.price)}
      </div>

      <p>
        📅 Yili:
        <strong>${escapeHTML(car.year)}</strong>
      </p>

      <p>
        🛣️ Yurgani:
        <strong>
          ${Number(car.mileage || 0)
            .toLocaleString()} km
        </strong>
      </p>

      <p>
        ⚙️ Uzatma:
        <strong>${escapeHTML(car.gear)}</strong>
      </p>

      <p>
        ⛽ Yoqilg'i:
        <strong>${escapeHTML(car.fuel)}</strong>
      </p>

      <p>
        📍 Hudud:
        <strong>${escapeHTML(car.region)}</strong>
      </p>

      <p>
        📞 Telefon:
        <strong>${escapeHTML(car.phone)}</strong>
      </p>

      <a
        class="phone-btn"
        style="
          display:block;
          text-align:center;
          padding:13px;
          border-radius:10px;
          text-decoration:none;
        "
        href="tel:${escapeHTML(car.phone)}">

        📞 Sotuvchi bilan bog'lanish

      </a>

    `;


    $("detailModal")
      .classList
      .remove("hidden");

  };


/*
====================================================
MODAL
====================================================
*/

document
  .querySelectorAll("[data-close]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const modal =
          $(button.dataset.close);

        modal.classList.add(
          "hidden"
        );

      }
    );

  });


/*
====================================================
MODAL TASHQARISIGA BOSISH
====================================================
*/

document
  .querySelectorAll(".modal")
  .forEach(modal => {

    modal.addEventListener(
      "click",
      event => {

        if (
          event.target === modal
        ) {

          modal.classList.add(
            "hidden"
          );

        }

      }
    );

  });


/*
====================================================
ADD MODAL OCHISH
====================================================
*/

function openAddModal() {

  $("addModal")
    .classList
    .remove("hidden");

}


$("openAddBtn")
  .addEventListener(
    "click",
    openAddModal
  );


$("openAddBtn2")
  .addEventListener(
    "click",
    openAddModal
  );


$("emptyAddBtn")
  .addEventListener(
    "click",
    openAddModal
  );


/*
====================================================
SEARCH
====================================================
*/

$("searchInput")
  .addEventListener(
    "input",
    renderCars
  );


$("searchBtn")
  .addEventListener(
    "click",
    renderCars
  );


/*
====================================================
FILTERLAR
====================================================
*/

[
  "modelFilter",
  "minPrice",
  "maxPrice",
  "regionFilter",
  "sortSelect"
].forEach(id => {

  $(id).addEventListener(
    "input",
    renderCars
  );

});


/*
====================================================
FILTER TOZALASH
====================================================
*/

$("clearFilters")
  .addEventListener(
    "click",
    () => {

      $("searchInput").value = "";

      $("modelFilter").value = "";

      $("minPrice").value = "";

      $("maxPrice").value = "";

      $("regionFilter").value = "";

      $("sortSelect").value = "new";

      renderCars();

    }
  );


/*
====================================================
DARK MODE
====================================================
*/

$("themeBtn")
  .addEventListener(
    "click",
    () => {

      document.body
        .classList
        .toggle("dark");

      const dark =
        document.body.classList.contains(
          "dark"
        );

      localStorage.setItem(
        "avtoTheme",
        dark ? "dark" : "light"
      );

      $("themeBtn").textContent =
        dark ? "☀️" : "🌙";

    }
  );


/*
OLDINGI TEMA
*/

if (
  localStorage.getItem(
    "avtoTheme"
  ) === "dark"
) {

  document.body
    .classList
    .add("dark");

  $("themeBtn").textContent =
    "☀️";

}


/*
====================================================
RASMLARNI PREVIEW
====================================================
*/

$("photoInput")
  .addEventListener(
    "change",
    event => {

      const file =
        event.target.files[0];


      if (!file) {

        selectedImage = "";

        $("photoPreview").innerHTML =
          "";

        return;

      }


      if (
        !file.type.startsWith(
          "image/"
        )
      ) {

        toast(
          "Faqat rasm faylini tanlang."
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function() {

          selectedImage =
            reader.result;


          $("photoPreview")
            .innerHTML = `

              <img
                src="${selectedImage}"
                alt="Avtomobil rasmi">

            `;

        };


      reader.readAsDataURL(file);

    }
  );


/*
====================================================
E'LON JOYLASH
====================================================
*/

$("carForm")
  .addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const data = {

        model:
          $("carModel").value.trim(),

        price:
          $("carPrice").value,

        year:
          $("carYear").value,

        mileage:
          $("carMileage").value || 0,

        gear:
          $("carGear").value,

        fuel:
          $("carFuel").value,

        region:
          $("carRegion").value.trim(),

        phone:
          $("carPhone").value.trim(),

        image:
          selectedImage

      };


      if (
        !data.model ||
        !data.price ||
        !data.year ||
        !data.region ||
        !data.phone
      ) {

        toast(
          "Majburiy maydonlarni to'ldiring."
        );

        return;

      }


      try {

        toast(
          "E'lon yuborilmoqda..."
        );


        const response =
          await fetch(
            API + "/cars",
            {

              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(data)

            }
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.error ||
            "Server xatosi"
          );

        }


        /*
        Formani tozalash
        */

        $("carForm").reset();

        selectedImage = "";

        $("photoPreview")
          .innerHTML = "";


        /*
        Modalni yopish
        */

        $("addModal")
          .classList
          .add("hidden");


        toast(
          "✅ E'lon joylandi! Uni boshqa foydalanuvchilar ham ko'radi."
        );


        /*
        E'lonlarni qayta olish
        */

        await loadCars();

      }

      catch(error) {

        console.error(error);

        toast(
          "❌ E'lon joylanmadi. Server manzilini tekshiring."
        );

      }

    }
  );


/*
====================================================
START
====================================================
*/

loadCars();