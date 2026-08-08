/* =========================================================
   Chata u Lubátka — Hero texty s GSAP animací
   Character stagger reveal s rotation a opacity
   ========================================================= */
(function () {
  "use strict";

  if (typeof gsap === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Najít prvky
  var titleEl = document.querySelector(".hero__title");
  var subtitleEl = document.querySelector(".hero__subtitle");

  if (!titleEl || !subtitleEl) return;

  // Vzít text a rozdělit na znaky
  var titleText = titleEl.textContent.trim();
  var subtitleText = subtitleEl.textContent.trim();

  // Vyčistit a vytvořit HTML s <span> pro každý znak
  function wrapCharacters(element, text) {
    element.innerHTML = text
      .split("")
      .map(function (char) {
        return char === " " ? '&nbsp;' : '<span class="char">' + char + "</span>";
      })
      .join("");
  }

  wrapCharacters(titleEl, titleText);
  wrapCharacters(subtitleEl, subtitleText);

  // Animovat znaky titulu
  var titleChars = titleEl.querySelectorAll(".char");
  gsap.from(titleChars, {
    opacity: 0,
    y: 30,
    rotationX: -90,
    transformOrigin: "center center -20px",
    duration: 0.8,
    ease: "back.out(1.5)",
    stagger: {
      amount: 0.6,
      from: "start"
    },
    delay: 0.28
  });

  // Animovat znaky subtitulu
  var subtitleChars = subtitleEl.querySelectorAll(".char");
  gsap.from(subtitleChars, {
    opacity: 0,
    y: 20,
    scale: 0.8,
    duration: 0.7,
    ease: "power2.out",
    stagger: {
      amount: 0.5,
      from: "start"
    },
    delay: 0.68
  });
})();
