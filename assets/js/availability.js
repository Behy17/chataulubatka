/* =========================================================
   Chata u Lubátka — kalendář volných termínů
   Načte assets/data/availability.json (aktualizuje ho skript
   scripts/update_availability.py z API e-chalupy.cz) a vykreslí
   několik měsíců dopředu s vyznačením obsazených dnů.
   Bez závislostí.
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     ŽIVÁ DATA: po nasazení Cloudflare Workeru sem vložte jeho URL
     (viz scripts/cloudflare-worker/NASAZENI.md). Kalendář pak bere
     obsazenost živě při každém načtení. Dokud je prázdné — nebo když
     Worker selže — použije se lokální assets/data/availability.json.
     --------------------------------------------------------------- */
  var LIVE_URL = "https://chata-obsazenost.vladimir-behavy.workers.dev";
  var LOCAL_URL = "assets/data/availability.json";

  var MONTHS_AHEAD = 6; // kolik měsíců dopředu zobrazit
  var MONTHS_ON_MOBILE = 3; // kolik jich na telefonu vidí host rovnou
  var MONTH_NAMES = [
    "leden", "únor", "březen", "duben", "květen", "červen",
    "červenec", "srpen", "září", "říjen", "listopad", "prosinec"
  ];
  var WEEKDAYS = ["po", "út", "st", "čt", "pá", "so", "ne"];

  var root = document.getElementById("availCalendar");
  if (!root) return;

  var updatedEl = document.getElementById("availUpdated");

  function iso(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function parseISO(s) {
    var p = s.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  // Množina obsazených dnů (startDate..endDate včetně)
  function buildOccupied(reservations) {
    var set = Object.create(null);
    reservations.forEach(function (r) {
      var d = parseISO(r.startDate);
      var end = parseISO(r.endDate);
      while (d <= end) {
        set[iso(d)] = true;
        d.setDate(d.getDate() + 1);
      }
    });
    return set;
  }

  function renderMonth(year, month, occupied, today) {
    var wrap = document.createElement("div");
    wrap.className = "avail__month";

    var name = document.createElement("div");
    name.className = "avail__month-name";
    name.textContent = MONTH_NAMES[month] + " " + year;
    wrap.appendChild(name);

    var head = document.createElement("div");
    head.className = "avail__weekdays";
    WEEKDAYS.forEach(function (w) {
      var c = document.createElement("span");
      c.textContent = w;
      head.appendChild(c);
    });
    wrap.appendChild(head);

    var grid = document.createElement("div");
    grid.className = "avail__days";

    var first = new Date(year, month, 1);
    var pad = (first.getDay() + 6) % 7; // Po = 0
    for (var i = 0; i < pad; i++) {
      var blank = document.createElement("span");
      blank.className = "avail__day avail__day--pad";
      grid.appendChild(blank);
    }

    var daysInMonth = new Date(year, month + 1, 0).getDate();
    for (var day = 1; day <= daysInMonth; day++) {
      var date = new Date(year, month, day);
      var key = iso(date);
      var cell = document.createElement("span");
      cell.className = "avail__day";
      cell.textContent = String(day);

      if (date < today) {
        cell.className += " avail__day--past";
      } else if (occupied[key]) {
        cell.className += " avail__day--booked";
        cell.title = "Obsazeno";
        cell.setAttribute("aria-label", key + " – obsazeno");
      } else {
        cell.className += " avail__day--free";
        cell.title = "Volno";
        cell.setAttribute("aria-label", key + " – volno");
      }
      if (key === iso(today)) cell.className += " avail__day--today";

      grid.appendChild(cell);
    }

    wrap.appendChild(grid);
    return wrap;
  }

  function render(data) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var occupied = buildOccupied(data.reservations || []);

    // Obsazenost zpřístupníme rezervačnímu formuláři (booking.js), aby uměl
    // upozornit, že se poptávaný termín kryje s obsazeným.
    window.__availability = { occupied: occupied, updatedAt: data.updatedAt };
    document.dispatchEvent(new CustomEvent("availability:ready"));

    var frag = document.createDocumentFragment();
    var y = today.getFullYear();
    var m = today.getMonth();
    for (var i = 0; i < MONTHS_AHEAD; i++) {
      var mesic = renderMonth(y, m, occupied, today);
      // Na telefonu ukážeme jen první tři měsíce; zbytek si host rozbalí.
      // Šest měsíců pod sebou dělalo 1 923 px, tedy 2,4 obrazovky kalendáře.
      if (i >= MONTHS_ON_MOBILE) mesic.classList.add("avail__month--extra");
      frag.appendChild(mesic);
      m++;
      if (m > 11) { m = 0; y++; }
    }
    root.innerHTML = "";
    root.appendChild(frag);
    setupExpander();

    if (updatedEl && data.updatedAt) {
      var d = new Date(data.updatedAt);
      if (!isNaN(d)) {
        updatedEl.textContent =
          "Aktualizováno " + d.toLocaleDateString("cs-CZ", {
            day: "numeric", month: "long", year: "numeric"
          });
      }
    }
  }

  /* Tlačítko „další měsíce" — vzniká jen na úzkých displejích.
     Na širokých se skryje přes CSS a všech šest měsíců je vidět rovnou,
     takže tam by tlačítko nedávalo smysl. */
  function setupExpander() {
    if (document.getElementById("availMore")) return;
    var skryte = root.querySelectorAll(".avail__month--extra");
    if (!skryte.length) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "availMore";
    btn.className = "avail__more";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "availCalendar");
    btn.textContent = "Zobrazit další měsíce";

    btn.addEventListener("click", function () {
      var otevreno = root.classList.toggle("is-expanded");
      btn.setAttribute("aria-expanded", otevreno ? "true" : "false");
      btn.textContent = otevreno ? "Skrýt další měsíce" : "Zobrazit další měsíce";
      // Po sbalení vrátíme pohled na kalendář, ať host nezůstane v prázdnu.
      if (!otevreno) {
        var horni = root.getBoundingClientRect().top + window.scrollY - 80;
        if (window.scrollY > horni) window.scrollTo({ top: horni, behavior: "smooth" });
      }
    });

    root.insertAdjacentElement("afterend", btn);
  }

  function showError() {
    root.innerHTML =
      '<p class="avail__error">Kalendář se teď nepodařilo načíst. ' +
      'Aktuální volné termíny najdete ' +
      '<a href="https://www.e-chalupy.cz/ubytovani-dolni-moravice-nova-ves-chata-u-lubatka-k-pronajmu-o22812" ' +
      'target="_blank" rel="noopener noreferrer">na e-chalupy.cz</a>.</p>';
  }

  function okJson(r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }

  function loadLocal() {
    return fetch(LOCAL_URL, { cache: "no-cache" }).then(okJson);
  }

  // Nejdřív živý Worker (je-li nastaven), při chybě spadni na lokální JSON.
  function load() {
    if (LIVE_URL) {
      return fetch(LIVE_URL, { cache: "no-cache" }).then(okJson).catch(loadLocal);
    }
    return loadLocal();
  }

  load().then(render).catch(showError);
})();
