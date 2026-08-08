/* =========================================================
   Chata u Lubátka — sekce "Vytvořeno z lásky"
   GSAP ScrollTrigger: řádky nadpisu vyjedou zpod masky,
   fotky se odkryjí clip-path stěrem a dojedou z měřítka.
   ========================================================= */
(function () {
  "use strict";

  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger);

  var story = document.querySelector(".story");
  if (!story) return;

  var lines = story.querySelectorAll(".story__title-inner");
  var text = story.querySelector(".story__text");
  var frames = story.querySelectorAll(".story__frame");

  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: story,
      start: "top 70%",
      once: true
    }
  });

  // Řádky nadpisu vyjíždějí zpod overflow:hidden na .story__title-line
  tl.from(lines, {
    yPercent: 110,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.1
  }, 0);

  tl.from(text, {
    opacity: 0,
    y: 16,
    duration: 0.8,
    ease: "power2.out"
  }, 0.45);

  // Fotky: stěr zdola + doježdění měřítka
  tl.from(frames, {
    clipPath: "inset(100% 0% 0% 0%)",
    scale: 1.12,
    duration: 1.1,
    ease: "power3.out",
    stagger: 0.12
  }, 0.25);
})();
