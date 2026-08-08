/* =========================================================
   Chata u Lubátka — sekce "Speciální nabídky" (balíčky)
   GSAP ScrollTrigger: nadpis a karty se jemně objeví.
   immediateRender:false drží obsah viditelný i tehdy, když
   trigger z jakéhokoli důvodu nevystřelí.
   ========================================================= */
(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var section = document.querySelector(".offers");
  if (!section) return;

  var head = section.querySelector(".offers__head");
  var cards = section.querySelectorAll(".offers__card");
  var foot = section.querySelector(".offers__foot");

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top 70%",
      once: true
    }
  });

  tl.from(head, {
    opacity: 0,
    y: 24,
    duration: 0.7,
    ease: "power3.out",
    immediateRender: false
  }, 0);

  tl.from(cards, {
    opacity: 0,
    y: 32,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.1,
    immediateRender: false
  }, 0.2);

  tl.from(foot, {
    opacity: 0,
    y: 16,
    duration: 0.6,
    ease: "power2.out",
    immediateRender: false
  }, "-=0.3");

  window.addEventListener("load", function () {
    ScrollTrigger.refresh();
  });
})();
