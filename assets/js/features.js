/* =========================================================
   Chata u Lubátka — Features animace s GSAP ScrollTrigger
   Scroll-triggered animace s prémiovými efekty
   ========================================================= */
(function () {
  "use strict";

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  var cards = document.querySelectorAll('.feature-card');
  if (cards.length === 0) return;

  // Animovat každou kartu na scroll
  cards.forEach(function (card, index) {
    var number = card.querySelector('.feature-card__number');
    var text = card.querySelector('.feature-card__text');

    // Počáteční stav — skryté (ale nejdřív nastav do viditelného stavu)
    gsap.set(number, { opacity: 1, y: 0 });
    gsap.set(text, { opacity: 1, y: 0 });

    // Vytvořit timeline pro kartu
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        end: "top 60%",
        scrub: false,
        once: true
      }
    });

    // Animovat kartu — scale, shadow, opacity
    tl.from(
      card,
      {
        opacity: 0,
        y: 30,
        scale: 0.92,
        duration: 0.8,
        ease: "power2.out"
      },
      0
    );

    // Animovat číslo s delay
    tl.from(
      number,
      {
        opacity: 0,
        y: 16,
        scale: 0.85,
        duration: 0.7,
        ease: "back.out(1.3)"
      },
      0.15
    );

    // Animovat text s dalším delay
    tl.from(
      text,
      {
        opacity: 0,
        y: 12,
        duration: 0.6,
        ease: "power2.out"
      },
      0.35
    );

    // Hover efekt na číslo
    card.addEventListener('mouseenter', function () {
      gsap.to(number, {
        scale: 1.12,
        duration: 0.3,
        ease: "power2.out"
      });
    });

    card.addEventListener('mouseleave', function () {
      gsap.to(number, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    });
  });
})();
