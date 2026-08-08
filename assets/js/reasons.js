/* =========================================================
   Chata u Lubátka — sekce "5 důvodů, proč si dopřát Jeseníky"
   GSAP ScrollTrigger: nadpis vyjede zpod masky, důvody se
   postupně objeví, fotopozadí získá jemný parallax.

   Reveal používá immediateRender:false — prvky zůstávají
   viditelné, dokud se animace opravdu nespustí. Když
   ScrollTrigger z jakéhokoli důvodu nevystřelí (např. pozdě
   načtené video posune pozice), obsah je pořád vidět.
   ========================================================= */
(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector(".reasons");
  if (!section) return;

  var lines = section.querySelectorAll(".reasons__title-inner");
  var items = section.querySelectorAll(".reasons__item");
  var cta = section.querySelector(".reasons__cta");
  var bg = section.querySelector(".reasons__bg");

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 68%",
      once: true
    }
  });

  // Řádky nadpisu vyjíždějí zpod overflow:hidden (transform, ne opacity)
  tl.from(lines, {
    yPercent: 110,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.1,
    immediateRender: false
  }, 0.1);

  // Jednotlivé důvody: nadjedou zdola a rozsvítí se
  tl.from(items, {
    opacity: 0,
    y: 28,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.12,
    immediateRender: false
  }, 0.4);

  tl.from(cta, {
    opacity: 0,
    y: 16,
    duration: 0.6,
    ease: "power2.out",
    immediateRender: false
  }, "-=0.2");

  // Jemný parallax fotopozadí (scrub — bezpečné, opacity se nedotýká)
  if (bg) {
    gsap.to(bg, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  }

  // Pozice přepočítat, až se donačte video a obrázky (jinak by
  // ScrollTrigger počítal se starou výškou stránky).
  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
