/* =========================================================
   Chata u Lubátka — hero interakce
   Bez závislostí. Animuje se pouze transform/opacity (GPU).
   Nástup obsahu řeší čistě CSS — hero je čitelné i bez JS.
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- 1) Parallax fotky a textu ----------------------- */
  var media = document.getElementById("heroMedia");
  var content = document.getElementById("heroContent");
  var header = document.getElementById("header");

  var ticking = false;
  var lastY = -1;

  // Parallax jen u myši na velkém displeji. Na dotykových zařízeních
  // (telefon, tablet, iPad) je vypnutý: kontinuální přepis transform uvnitř
  // ořízlého (overflow:hidden + border-radius) hero kontejneru je na iOS
  // Safari známý spouštěč bugu, kdy si prohlížeč při plynulém scrollu špatně
  // přepočítá pozici a "vrátí" viewport na začátek stránky. Dotek se pozná
  // podle pointer/hover, takže sedí i telefon otočený na šířku.
  var parallaxMQ = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  var lastOn = null;

  function render() {
    ticking = false;

    var y = window.scrollY || window.pageYOffset;
    var on = !reduceMotion && parallaxMQ.matches;
    if (y === lastY && on === lastOn) return;
    lastY = y;
    lastOn = on;

    // Hlavička dostane pozadí, jakmile opustíme špičku stránky.
    if (header) header.classList.toggle("is-scrolled", y > 40);

    if (!on) {
      // Režim se změnil (otočení, připojení myši…) — vrátit výchozí stav.
      if (media && media.style.transform) media.style.transform = "";
      if (content && content.style.transform) {
        content.style.transform = "";
        content.style.opacity = "";
      }
      return;
    }

    var vh = window.innerHeight;
    if (y > vh) return; // mimo hero už nepočítáme nic

    var p = y / vh; // 0 → 1 v rámci hero sekce

    if (media) media.style.transform = "translate3d(0," + (y * 0.3).toFixed(1) + "px,0)";
    if (content) {
      content.style.transform = "translate3d(0," + (y * 0.12).toFixed(1) + "px,0)";
      content.style.opacity = String(Math.max(0, 1 - p * 1.4));
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  render();

  /* --- 2) Animovaná navigace ----------------------------- */
  var navLinks = document.querySelectorAll(".nav__links a");

  navLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      navLinks.forEach(function (l) { l.classList.remove("is-active"); });
      link.classList.add("is-active");
    });
  });

  /* --- 3) Mobilní menu --------------------------------- */
  var burger = document.getElementById("burger");
  var menu = document.getElementById("mobile-menu");

  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Zavřít menu" : "Otevřít menu");
    document.body.style.overflow = open ? "hidden" : "";

    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("is-open"); });
    } else {
      menu.classList.remove("is-open");
      window.setTimeout(function () {
        if (burger.getAttribute("aria-expanded") === "false") menu.hidden = true;
      }, 340);
    }
  }

  if (burger && menu) {
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });

    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        burger.focus();
      }
    });
  }

  /* --- 4) Odložené načtení hero videa -------------------
     14MB video se stahuje až po načtení zbytku stránky, aby
     nesoupeřilo s CSS, obrázky a galerií. Do té doby drží
     hero poster (hero-1280.jpg), takže sekce je hned plná.
     Na mobilu (< 520px) video vůbec nenačítáme — jen posterí. */
  var heroVideo = document.getElementById("heroVideo");
  if (heroVideo && heroVideo.dataset && heroVideo.dataset.src) {
    var videoStarted = false;
    var startVideo = function () {
      if (videoStarted) return;
      // Zkontroluj aktuální velikost viewportu — ne tu, která byla při startu JS
      if (window.innerWidth < 520) return;
      videoStarted = true;
      var source = document.createElement("source");
      source.src = heroVideo.dataset.src;
      source.type = "video/mp4";
      heroVideo.appendChild(source);
      heroVideo.preload = "auto";
      heroVideo.load();
      var tryPlay = heroVideo.play();
      if (tryPlay && typeof tryPlay.catch === "function") tryPlay.catch(function () {});
    };

    // Spustí se při nejbližší z událostí — vždy až po kritickém
    // prvním vykreslení, ale s jistotou (kdyby se "load" zasekl):
    //  • po načtení zbytku stránky (window.load) + malé zpoždění
    //  • při prvním scrollu uživatele
    //  • pojistný časovač po 3 s
    // Na mobilu (< 520px) video nikdy nenačteme.
    if (window.innerWidth >= 520) {
      if (document.readyState === "complete") {
        window.setTimeout(startVideo, 600);
      } else {
        window.addEventListener("load", function () {
          window.setTimeout(startVideo, 600);
        });
      }
      window.addEventListener("scroll", startVideo, { passive: true, once: true });
      window.setTimeout(startVideo, 3000);
    }
  }
})();
