/* =========================================================
   Chata u Lubátka — sekce "Tipy na výlety"
   1) Fasáda videa: místo těžkého YouTube iframu se nejdřív
      ukáže jen náhled se zlatým play tlačítkem. Iframe
      (a tím i skripty YouTube) se načte až po kliknutí —
      rychlejší první načtení stránky a šetrnější k soukromí
      (youtube-nocookie).
   2) GSAP ScrollTrigger: nadpis vyjede zpod masky, video a
      karty se jemně objeví. immediateRender:false drží obsah
      viditelný, i kdyby trigger nevystřelil.
   ========================================================= */
(function () {
  "use strict";

  /* --- 1) Fasáda videa --------------------------------- */
  var player = document.querySelector(".trips__player");
  var stage = document.querySelector(".trips__video");
  if (player && stage) {
    player.addEventListener("click", function () {
      var id = player.getAttribute("data-yt");
      if (!id) return;

      var iframe = document.createElement("iframe");
      iframe.className = "trips__iframe";
      iframe.setAttribute(
        "src",
        "https://www.youtube-nocookie.com/embed/" + id +
          "?autoplay=1&rel=0&modestbranding=1&playsinline=1"
      );
      iframe.setAttribute("title", "Video — Jeseníky a okolí Chaty u Lubátka");
      iframe.setAttribute("frameborder", "0");
      iframe.setAttribute(
        "allow",
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      );
      iframe.setAttribute("allowfullscreen", "");

      // Fasáda i filmová „chrome" se schovají přes .is-playing (viz CSS),
      // zůstanou ale v DOM, aby GSAP ScrollTrigger neztratil svůj cíl.
      stage.appendChild(iframe);
      stage.classList.add("is-playing");
      iframe.focus();
    });
  }

  /* --- 2) Scroll reveal (GSAP) ------------------------- */
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector(".trips");
  if (!section) return;

  var lines = section.querySelectorAll(".trips__title-inner");
  var subtitle = section.querySelector(".trips__subtitle");
  var video = section.querySelector(".trips__video");

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 68%",
      once: true
    }
  });

  tl.from(lines, {
    yPercent: 110,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.1,
    immediateRender: false
  }, 0.1);

  tl.from(subtitle, {
    opacity: 0,
    y: 18,
    duration: 0.6,
    ease: "power2.out",
    immediateRender: false
  }, 0.4);

  tl.from(video, {
    opacity: 0,
    y: 40,
    scale: 0.98,
    duration: 0.9,
    ease: "power3.out",
    immediateRender: false
  }, 0.5);

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
