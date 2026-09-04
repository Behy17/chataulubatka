/* =========================================================
   Chata u Lubátka — sekce "Tipy na výlety"
   Video: vlastník má na YouTube zakázané vkládání (Chyba 153),
   takže embed nefunguje. Náhled je proto obyčejný odkaz
   (<a target="_blank">), který video otevře na YouTube v nové
   záložce — žádný JS pro přehrání není potřeba.

   GSAP ScrollTrigger: nadpis vyjede zpod masky, video a karty
   se jemně objeví. immediateRender:false drží obsah viditelný,
   i kdyby trigger nevystřelil.
   ========================================================= */
(function () {
  "use strict";

  /* --- Scroll reveal (GSAP) --------------------------- */
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
