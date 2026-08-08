/* =========================================================
   Chata u Lubátka — rezervační formulář
   Validace, kontrola proti obsazenosti z kalendáře a odeslání
   přes Web3Forms (bez vlastního backendu). Bez závislostí.
   ========================================================= */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     PROPOJENÍ S E-MAILEM: založte si zdarma účet na web3forms.com,
     zadejte doručovací adresu (lucie_dostalova@seznam.cz) a vygenerovaný
     Access Key vložte sem. Dokud je pole prázdné, formulář se
     neodešle a nabídne hostovi telefon a e-mail.

     POZOR: příjemce určuje výhradně tenhle klíč, ne konstanta EMAIL níž —
     ta se jen vypisuje hostovi v hláškách. Klíč musí být vygenerovaný
     pro adresu, na kterou mají poptávky chodit.
     --------------------------------------------------------------- */
  var ACCESS_KEY = "c1305d04-8c1d-4304-82be-3bdf021533bc";
  var ENDPOINT = "https://api.web3forms.com/submit";

  var PHONE = "+420 776 145 444";
  var EMAIL = "lucie_dostalova@seznam.cz";

  var form = document.getElementById("bookForm");
  if (!form) return;

  var statusEl = document.getElementById("bookStatus");
  var hintEl = document.getElementById("bookHint");
  var submitEl = document.getElementById("bookSubmit");
  var submitLabel = submitEl.querySelector("span");
  var fromEl = document.getElementById("bookFrom");
  var toEl = document.getElementById("bookTo");
  var gotchaEl = document.getElementById("bookWebsite");

  var defaultLabel = submitLabel.textContent;

  function iso(d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function parseISO(s) {
    var p = s.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function formatCZ(isoStr) {
    return parseISO(isoStr).toLocaleDateString("cs-CZ", {
      day: "numeric", month: "long", year: "numeric"
    });
  }

  /* --- Termíny: nelze do minulosti, odjezd nesmí předcházet příjezdu --- */
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  fromEl.min = iso(today);
  toEl.min = iso(today);

  fromEl.addEventListener("change", function () {
    toEl.min = fromEl.value || iso(today);
    if (toEl.value && toEl.value < fromEl.value) toEl.value = fromEl.value;
    checkRange();
  });

  toEl.addEventListener("change", checkRange);
  document.addEventListener("availability:ready", checkRange);

  function setHint(kind, msg) {
    hintEl.className = "book__hint" + (kind ? " book__hint--" + kind : "");
    hintEl.textContent = msg || "";
  }

  /* --- Kontrola poptávaného termínu proti obsazenosti z kalendáře --- */
  function checkRange() {
    if (!fromEl.value || !toEl.value) { setHint("", ""); return; }

    if (toEl.value < fromEl.value) {
      setHint("warn", "Datum odjezdu nemůže být dřív než datum příjezdu.");
      return;
    }

    var nights = Math.round(
      (parseISO(toEl.value) - parseISO(fromEl.value)) / 86400000
    );

    var data = window.__availability;
    if (!data || !data.occupied) {
      setHint("", nights > 0 ? nights + nocText(nights) : "");
      return;
    }

    // Den odjezdu se nepočítá jako obsazený — kryjeme jen noci pobytu.
    var d = parseISO(fromEl.value);
    var end = parseISO(toEl.value);
    var collision = null;
    while (d < end) {
      if (data.occupied[iso(d)]) { collision = iso(d); break; }
      d.setDate(d.getDate() + 1);
    }

    if (collision) {
      setHint("warn",
        "Pozor: podle kalendáře je chata v tomto termínu obsazená (" +
        formatCZ(collision) + "). Poptávku klidně pošlete — ozveme se s alternativou.");
    } else {
      setHint("ok", "Termín je podle kalendáře volný — " + nights + nocText(nights) + ".");
    }
  }

  function nocText(n) {
    if (n === 1) return " noc";
    if (n >= 2 && n <= 4) return " noci";
    return " nocí";
  }

  function setStatus(kind, msg) {
    statusEl.className = "book__status" + (kind ? " book__status--" + kind : "");
    statusEl.textContent = msg || "";
  }

  function setLoading(on) {
    submitEl.disabled = on;
    submitLabel.textContent = on ? "Odesílám…" : defaultLabel;
  }

  /* --- Odeslání --- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    setStatus("", "");

    // Robot vyplnil skryté pole — tvařme se, že je odesláno.
    if (gotchaEl && gotchaEl.value) return;

    form.classList.add("is-validated");
    if (!form.reportValidity()) return;

    if (toEl.value < fromEl.value) {
      setStatus("err", "Zkontrolujte prosím termín — odjezd nemůže být dřív než příjezd.");
      return;
    }

    if (!ACCESS_KEY) {
      setStatus("err",
        "Formulář zatím není propojený s e-mailem. Zavolejte prosím na " +
        PHONE + " nebo napište na " + EMAIL + ".");
      return;
    }

    // access_key, subject a from_name už nese formulář jako skrytá pole
    // (viz index.html) — díky tomu funguje odeslání i jako čistá nouzová
    // záloha bez JS. Tady je znovu NEPŘIDÁVÁME, aby nevznikla ve
    // FormData duplicita se dvěma různými hodnotami pro totéž pole.
    var fd = new FormData(form);
    fd.delete("_gotcha");

    setLoading(true);

    fetch(ENDPOINT, { method: "POST", body: fd })
      .then(function (r) { return r.json(); })
      .then(function (json) {
        if (!json.success) throw new Error(json.message || "Odeslání selhalo");
        form.reset();
        form.classList.remove("is-validated");
        setHint("", "");
        setStatus("ok",
          "Děkujeme, poptávku máme! Ozveme se vám do 24 hodin. " +
          "Pokud spěcháte, zavolejte na " + PHONE + ".");
      })
      .catch(function () {
        setStatus("err",
          "Odeslání se teď nepovedlo. Zkuste to prosím znovu, nebo nám zavolejte na " +
          PHONE + ".");
      })
      .then(function () { setLoading(false); });
  });
})();
