// Общий модуль турнирной сетки по стадиям: чипы, трек со слайдами, точки,
// свайп/перетаскивание, клавиши ←/→. Используется архивом 2025/26 и
// страницей чемпионата 2026/27.
// MekomBracket.mount(rootEl, rounds, opts) — rounds в формате TOURNAMENT_DATA:
// [{ name, winnerchamp?, packs: [{ title, teams: [{name, grade, branch}], winnerIndex? }] }]
(function () {
  "use strict";

  var DATA_VERSION = "20261116c";
  var SWIPE_RATIO = 0.18;   // доля ширины для переключения
  var FLICK_SPEED = 0.6;    // px/мс
  var LOCK_PX = 8;          // порог определения оси жеста

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function branchTagClass(branch) {
    var b = String(branch || "").toLowerCase();
    if (b.indexOf("север") !== -1) return "mc25-tag-north";
    if (b.indexOf("юг") !== -1) return "mc25-tag-south";
    return "";
  }

  function renderTeam(team, pack, round, pIndex, tIndex) {
    var t = el("div", "mc25-team");
    var isWinner = Array.isArray(pack.winnerIndex) && pack.winnerIndex.indexOf(tIndex) !== -1;
    var isChampion = round.winnerchamp &&
      round.winnerchamp.pack === pIndex && round.winnerchamp.index === tIndex;
    if (isChampion) t.classList.add("mc25-champion");
    else if (isWinner) t.classList.add("mc25-winner");
    else if (team.out) t.classList.add("mc25-out");

    var left = el("div", "mc25-team-left");
    left.appendChild(el("span", "mc25-tag mc25-tag-grade", team.grade + (/[–-]/.test(String(team.grade)) ? " классы" : " класс")));
    left.appendChild(el("span", "mc25-tag " + branchTagClass(team.branch), team.branch));
    if (team.out) left.appendChild(el("span", "mc25-tag mc25-tag-out", "выбыла"));
    t.appendChild(left);
    t.appendChild(el("div", "mc25-team-name", team.name));
    return t;
  }

  function renderSlide(round, rIndex, emptyText) {
    var slide = el("div", "mc25-slide");
    slide.id = "mc25-slide-" + rIndex + "-" + Math.random().toString(36).slice(2, 7);
    slide.setAttribute("role", "tabpanel");
    var packs = round.packs || [];
    var hasTeams = packs.some(function (p) { return p.teams && p.teams.length; });
    packs.forEach(function (pack, pIndex) {
      if (!pack.teams || !pack.teams.length) return;
      var packEl = el("div", "mc25-pack");
      packEl.appendChild(el("div", "mc25-pack-title", pack.title));
      var contents = el("div", "mc25-pack-contents");
      pack.teams.forEach(function (team, tIndex) {
        contents.appendChild(renderTeam(team, pack, round, pIndex, tIndex));
      });
      packEl.appendChild(contents);
      slide.appendChild(packEl);
    });
    if (!hasTeams) slide.appendChild(el("p", "mc25-empty", emptyText));
    return slide;
  }

  function mount(root, rounds, opts) {
    if (!root) return null;
    if (!Array.isArray(rounds) || !rounds.length) { root.hidden = true; return null; }
    root.hidden = false;
    opts = opts || {};
    var emptyText = opts.emptyText || "Состав появится после жеребьёвки.";
    var label = opts.label || "Этапы сезона";
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    root.textContent = "";
    var nav = el("div", "mc25-rounds-nav");
    nav.setAttribute("role", "tablist");
    nav.setAttribute("aria-label", label);
    var swiper = el("div", "mc25-swiper");
    swiper.tabIndex = 0;
    swiper.setAttribute("aria-label", label + ": листайте или используйте стрелки");
    var track = el("div", "mc25-track");
    var dotsEl = el("div", "mc25-dots");
    dotsEl.setAttribute("aria-hidden", "true");
    swiper.appendChild(track);
    root.appendChild(nav);
    root.appendChild(swiper);
    root.appendChild(dotsEl);

    var uid = Math.random().toString(36).slice(2, 7);
    var chips = [], dots = [], slides = [];
    var current = 0, width = 0, dragging = false, moved = false;

    rounds.forEach(function (round, i) {
      var chip = el("button", "mc25-chip", round.name);
      chip.type = "button";
      chip.id = "mc25-tab-" + uid + "-" + i;
      chip.setAttribute("role", "tab");
      chip.addEventListener("click", function () { goTo(i, true); });
      nav.appendChild(chip);
      chips.push(chip);

      var slide = renderSlide(round, i, emptyText);
      chip.setAttribute("aria-controls", slide.id);
      slide.setAttribute("aria-labelledby", chip.id);
      track.appendChild(slide);
      slides.push(slide);

      var dot = el("button", "mc25-dot");
      dot.type = "button";
      dot.tabIndex = -1;
      dot.addEventListener("click", function () { goTo(i, true); });
      dotsEl.appendChild(dot);
      dots.push(dot);
    });

    function setInert(slide, off) {
      if (off) {
        slide.setAttribute("aria-hidden", "true");
        slide.setAttribute("inert", "");
      } else {
        slide.removeAttribute("aria-hidden");
        slide.removeAttribute("inert");
      }
      // Старые Safari без inert: дублируем tabindex у фокусируемых внутри.
      Array.prototype.forEach.call(slide.querySelectorAll("a, button, [tabindex]"), function (n) {
        if (off) n.setAttribute("tabindex", "-1");
        else n.removeAttribute("tabindex");
      });
    }

    function updateHeight() {
      swiper.style.height = slides[current].offsetHeight + "px";
    }

    function applyTransform(dx, animate) {
      track.style.transition = (animate && !reduce) ? "" : "none";
      track.style.transform = "translate3d(" + (-current * width + (dx || 0)) + "px,0,0)";
    }

    // Если верх сетки выше экрана (под шапкой) — вернуть его в видимую область.
    function revealTop() {
      var header = document.querySelector(".site-header");
      var hh = header ? header.offsetHeight : 0;
      var top = root.getBoundingClientRect().top;
      if (top < hh + 8) {
        window.scrollTo({ top: window.pageYOffset + top - hh - 12, behavior: reduce ? "auto" : "smooth" });
      }
    }

    function goTo(i, scroll) {
      var prev = current;
      current = Math.max(0, Math.min(rounds.length - 1, i));
      chips.forEach(function (c, k) {
        c.classList.toggle("is-active", k === current);
        c.setAttribute("aria-selected", k === current ? "true" : "false");
        c.tabIndex = k === current ? 0 : -1;
      });
      dots.forEach(function (d, k) { d.classList.toggle("is-active", k === current); });
      slides.forEach(function (s, k) { setInert(s, k !== current); });
      width = swiper.clientWidth;
      swiper.dataset.current = String(current);
      applyTransform(0, true);
      updateHeight();
      var active = chips[current];
      if (active.scrollIntoView && nav.scrollWidth > nav.clientWidth) {
        nav.scrollLeft = active.offsetLeft - (nav.clientWidth - active.offsetWidth) / 2;
      }
      if (scroll && current !== prev) revealTop();
    }

    function layout() {
      width = swiper.clientWidth;
      slides.forEach(function (s) { s.style.width = width + "px"; s.style.flex = "0 0 " + width + "px"; });
      applyTransform(0, false);
      updateHeight();
    }

    // --- жест: pointer events (touch + мышь + перо) ---
    var sx = 0, sy = 0, st = 0, axis = null, pid = null;

    swiper.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; moved = false; axis = null; pid = e.pointerId;
      sx = e.clientX; sy = e.clientY; st = e.timeStamp;
    });

    swiper.addEventListener("pointermove", function (e) {
      if (!dragging || e.pointerId !== pid) return;
      var dx = e.clientX - sx, dy = e.clientY - sy;
      if (!axis) {
        if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (axis === "x") {
          try { swiper.setPointerCapture(pid); } catch (err) { /* ok */ }
          swiper.classList.add("is-dragging");
        }
      }
      if (axis === "y") return; // вертикаль — прокрутка страницы
      moved = true;
      // у краёв — сопротивление
      if ((current === 0 && dx > 0) || (current === rounds.length - 1 && dx < 0)) dx = dx / 3;
      applyTransform(dx, false);
    });

    function end(e) {
      if (!dragging || (e && e.pointerId !== pid)) return;
      dragging = false;
      swiper.classList.remove("is-dragging");
      if (axis !== "x") { axis = null; return; }
      var dx = e.clientX - sx;
      var dt = Math.max(1, e.timeStamp - st);
      var speed = Math.abs(dx) / dt;
      var next = current;
      if (e.type !== "pointercancel" && (Math.abs(dx) > width * SWIPE_RATIO || speed > FLICK_SPEED)) {
        next = dx < 0 ? current + 1 : current - 1;
      }
      axis = null;
      goTo(next, true);
    }
    swiper.addEventListener("pointerup", end);
    swiper.addEventListener("pointercancel", end);
    // после перетаскивания мышью не даём клику сработать на ссылке/кнопке
    swiper.addEventListener("click", function (e) {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
    swiper.addEventListener("dragstart", function (e) { e.preventDefault(); });

    swiper.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { goTo(current - 1, true); e.preventDefault(); }
      else if (e.key === "ArrowRight") { goTo(current + 1, true); e.preventDefault(); }
    });
    nav.addEventListener("keydown", function (e) {
      var to = null;
      if (e.key === "ArrowLeft") to = current - 1;
      else if (e.key === "ArrowRight") to = current + 1;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = rounds.length - 1;
      if (to === null) return;
      goTo(to);
      chips[current].focus();
      e.preventDefault();
    });

    if (window.ResizeObserver) {
      new ResizeObserver(function () {
        if (swiper.clientWidth !== width) layout();
      }).observe(swiper);
      slides.forEach(function (s) { new ResizeObserver(updateHeight).observe(s); });
    } else {
      window.addEventListener("resize", layout);
    }

    layout();
    goTo(0);
    return { goTo: goTo, get current() { return current; } };
  }

  window.MekomBracket = { mount: mount };

  // Автомонтаж сетки сезона 2026/27: [data-bracket-root] <- data/bracket-2026-27.json
  function autoMount() {
    var root = document.querySelector("[data-bracket-root]");
    if (!root) return;
    var base = window.MEKOM_BASE || "";
    fetch(base + "data/bracket-2026-27.json?v=" + DATA_VERSION)
      .then(function (r) {
        if (!r.ok) throw new Error("bracket-2026-27.json: " + r.status);
        return r.json();
      })
      .then(function (d) {
        mount(root, d.rounds, {
          label: "Этапы сезона " + (d.season || "2026/27"),
          emptyText: "Состав появится после жеребьёвки."
        });
      })
      .catch(function () { root.hidden = true; });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoMount);
  else autoMount();
})();
