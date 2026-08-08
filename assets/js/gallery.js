/* =========================================================
   Chata u Lubátka — galerie

   Dva nezávislé bloky. Prohlížeč fotek je funkce, ne ozdoba,
   takže běží vždy — i bez GSAP a při zapnutém omezeném pohybu.
   Odkrývání při scrollu je ozdoba, ta se smí vypnout.
   ========================================================= */

/* --- 1) Prohlížeč fotek (lightbox) — běží vždy ------------------ */
(function () {
  "use strict";

  var box = document.getElementById("lightbox");
  var items = Array.prototype.slice.call(document.querySelectorAll(".gallery__item"));
  if (!box || !items.length) return;

  var imgEl = document.getElementById("lightboxImg");
  var capEl = document.getElementById("lightboxCaption");
  var cntEl = document.getElementById("lightboxCounter");
  var closeEl = document.getElementById("lightboxClose");
  var prevEl = document.getElementById("lightboxPrev");
  var nextEl = document.getElementById("lightboxNext");

  var photos = items.map(function (it) {
    var img = it.querySelector("img");
    return { src: img.getAttribute("src"), alt: img.getAttribute("alt") || "" };
  });

  var index = 0;
  var lastFocused = null;

  function show(i) {
    index = (i + photos.length) % photos.length;
    var p = photos[index];
    imgEl.src = p.src;
    imgEl.alt = p.alt;
    capEl.textContent = p.alt;
    cntEl.textContent = index + 1 + " / " + photos.length;
  }

  function open(i) {
    lastFocused = document.activeElement;
    show(i);
    box.hidden = false;
    document.body.style.overflow = "hidden";
    void box.offsetWidth; // vynutí reflow, aby přechod naběhl
    box.classList.add("is-open");
    closeEl.focus();
    document.addEventListener("keydown", onKey);
  }

  function close() {
    box.classList.remove("is-open");
    document.removeEventListener("keydown", onKey);
    window.setTimeout(function () {
      box.hidden = true;
      document.body.style.overflow = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }, 280);
  }

  function onKey(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowLeft") { show(index - 1); return; }
    if (e.key === "ArrowRight") { show(index + 1); return; }

    // Fokus nesmí utéct na stránku pod otevřeným prohlížečem
    if (e.key === "Tab") {
      var f = [closeEl, prevEl, nextEl];
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[((e.shiftKey ? i - 1 : i + 1) + f.length) % f.length].focus();
    }
  }

  items.forEach(function (it, i) {
    it.addEventListener("click", function () { open(i); });
  });

  closeEl.addEventListener("click", close);
  prevEl.addEventListener("click", function () { show(index - 1); });
  nextEl.addEventListener("click", function () { show(index + 1); });

  // Klik na plochu mimo fotku zavírá
  box.addEventListener("click", function (e) {
    if (e.target === box) close();
  });
})();

/* --- 2) Odkrytí fotek při scrollu — jen ozdoba ------------------ */
(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var items = document.querySelectorAll(".gallery__item img");
  if (!items.length) return;

  items.forEach(function (img, index) {
    function reveal() {
      gsap.from(img, {
        scrollTrigger: { trigger: img, start: "top 85%", once: true },
        opacity: 0,
        scale: 0.94,
        y: 18,
        duration: 0.7,
        ease: "power2.out",
        delay: (index % 4) * 0.06,
        immediateRender: false,
        // Bez tohohle nechá GSAP na fotce inline transform, který má
        // vyšší prioritu než CSS — a přiblížení při najetí myší by nefungovalo.
        clearProps: "transform,opacity"
      });
    }

    // Fotky mají loading="lazy" a stahují se nezávisle na scrollu.
    // Když by ScrollTrigger spustil odkrytí dřív, než je fotka opravdu
    // načtená, animace doběhne na prázdném místě a snímek pak "vyskočí"
    // bez přechodu — vypadá to jako blikání. Proto počkáme na load.
    if (img.complete && img.naturalWidth > 0) {
      reveal();
    } else {
      img.addEventListener("load", reveal, { once: true });
    }
  });
})();
