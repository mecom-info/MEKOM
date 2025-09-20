/* script.js — MECOM landing
   - Вся логика: UX (scroll, fade-in), счётчики, floaters, типинг
   - Турнирная сетка (mecom-bracket) — инкапсулирована, с публичным API
*/

"use strict";

/* ------------------------------------------------------------------------
   DOMContentLoaded: инициализация всех модулей, чтобы скрипт размещался в <head> или подключался с defer
   ------------------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  initFloaters();
  initTitleTyping();
  initPrizeCounters();
  initForm();
  initMecomBracket(); // сетка турнирa
});

/* ---------------------------
   Utility: smooth scroll to id
   --------------------------- */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------------------
   Fade-in on scroll (IntersectionObserver)
   --------------------------- */
function initFadeIn() {
  const fades = document.querySelectorAll('.fade-in');
  if (!fades || fades.length === 0) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  fades.forEach(el => io.observe(el));
}

/* ---------------------------
   Number formatting helper
   --------------------------- */
function formatNumber(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/* ---------------------------
   Animated counters
   --------------------------- */
function animateCounter(el, target, duration = 1200) {
  const start = performance.now();
  const from = 0;
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const value = Math.floor(from + (target - from) * t);
    el.textContent = formatNumber(value);
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = formatNumber(target);
  }
  requestAnimationFrame(step);
}
function initPrizeCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters || counters.length === 0) return;
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const tgt = parseInt(el.dataset.target, 10) || 0;
        animateCounter(el, tgt, 1300);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => io.observe(c));
}

/* ---------------------------
   Floaters (hero decorative) — subtle parallax
   --------------------------- */
function initFloaters() {
  const floaters = Array.from(document.querySelectorAll('.riff'));
  floaters.forEach((el, i) => {
    el.style.animation = `riff-float ${4 + (i % 3)}s ${i * 0.28}s ease-in-out infinite`;
  });
  // minor parallax on scroll
  window.addEventListener('scroll', () => {
    const sc = window.scrollY;
    floaters.forEach((el, idx) => {
      const speed = (idx % 2 === 0) ? 0.06 : 0.03;
      el.style.transform = `translateY(${sc * speed}px)`;
    });
  }, { passive: true });
}

/* ---------------------------
   Hero title typing (tiny)
   --------------------------- */
function initTitleTyping() {
  const el = document.getElementById('hero-title');
  if (!el) return;
  const text = el.textContent.trim();
  el.textContent = '';
  let idx = 0;
  function tick() {
    if (idx <= text.length) {
      el.textContent = text.slice(0, idx);
      idx++;
      setTimeout(tick, 20);
    } else {
      el.style.borderRight = 'none';
    }
  }
  tick();
}

/* ---------------------------
   Simple form handling (progressive enhancement)
   - показывает успешный статус локально
   - совет: отправку на сервер/Sheets реализовать отдельно
   --------------------------- */
function initForm() {
  const form = document.getElementById('mecomForm');
  const status = document.getElementById('formStatus');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const team = (form.querySelector('#team') || {}).value || '';
    const captain = (form.querySelector('#captain') || {}).value || '';
    const phone = (form.querySelector('#phone') || {}).value || '';
    if (!team || !captain) {
      status.textContent = 'Пожалуйста, заполните обязательные поля: название команды и имя капитана.';
      status.style.color = '#b24545';
      return;
    }
    // Local feedback (progressive): сохраняем в localStorage (для организатора — можно экспортировать)
    try {
      const key = 'mecom_local_registrations_v1';
      const prevRaw = localStorage.getItem(key);
      const prev = prevRaw ? JSON.parse(prevRaw) : [];
      prev.push({ team, captain, phone, ts: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch (err) {
      // ignore storage errors
    }
    status.textContent = '✅ Заявка принята локально. Организаторы свяжутся в Telegram.';
    status.style.color = 'green';
    form.reset();
  });
}

/* =========================
   MECOM BRACKET — турнирная сетка
   - Все данные редактируются в TOURNAMENT_DATA внутри функции.
   - expose window.MECOM_BRACKET_V2 для дебага/редактирования в консоли.
   ========================= */
function initMecomBracket() {
  // локальные селекторы
  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from((r || document).querySelectorAll(s));

  // Render options
  const RENDER_OPTIONS = { keepEmptySlots: false };

  // ---------- ДАННЫЕ: редактируй эту структуру ----------
  const TOURNAMENT_DATA = [
    {
      name: "Отборочные",
      packs: [
        {
          title: "Пачка A — 7 класс",
          teams: [
            { name: "Альфа", grade: "7", branch: "Север" },
            { name: "Бета", grade: "7", branch: "Юг" },
            { name: "Гамма", grade: "7", branch: "Север" },
            { name: "Дельта", grade: "7", branch: "Юг" },
            { name: "Эпсилон", grade: "7", branch: "Север" },
            { name: "Зета", grade: "7", branch: "Юг" }
          ],
          winnerIndex: [0, 1]
        },
        {
          title: "Пачка B — 8 класс",
          teams: [
            { name: "Икс", grade: "8", branch: "Север" },
            { name: "Йота", grade: "8", branch: "Юг" },
            { name: "Каппа", grade: "8", branch: "Север" },
            { name: "Лямбда", grade: "8", branch: "Юг" },
            { name: "Мю", grade: "8", branch: "Север" },
            { name: "Ню", grade: "8", branch: "Юг" }
          ],
          winnerIndex: [0, 2]
        },
        {
          title: "Пачка C — смешанная",
          teams: [
            { name: "Омега", grade: "9", branch: "Север" },
            { name: "Пси", grade: "9", branch: "Юг" },
            { name: "Ро", grade: "10", branch: "Север" },
            { name: "Сигма", grade: "10", branch: "Юг" },
            { name: "Тау", grade: "11", branch: "Север" },
            { name: "Упсилон", grade: "11", branch: "Юг" }
          ],
          winnerIndex: [4, 5]
        }
      ]
    },
    {
      name: "Вторая стадия",
      packs: [
        {
          title: "Пачка D",
          teams: [
            { name: null, grade: null, branch: null },
            { name: null, grade: null, branch: null },
            { name: null, grade: null, branch: null }
          ]
        },
        {
          title: "Пачка E",
          teams: [
            { name: null, grade: null, branch: null },
            { name: null, grade: null, branch: null },
            { name: null, grade: null, branch: null }
          ]
        }
      ]
    },
    {
      name: "Полуфинал",
      packs: [
        { title: "Пачка F1", teams: [{ name: null }, { name: null }] },
        { title: "Пачка F2", teams: [{ name: null }, { name: null }] }
      ]
    },
    {
      name: "Финал",
      winnerchamp: { pack: 0, index: 0 },
      packs: [
        {
          title: "Финальная пачка",
          teams: [
            { name: "Титул", grade: "11", branch: "Север" },
            { name: "Претендент", grade: "11", branch: "Юг" }
          ]
        }
      ]
    }
  ];
  // ---------- /ДАННЫЕ ----------

  function deepCopy(obj) { return JSON.parse(JSON.stringify(obj)); }
  function prepareRenderData(src) { return deepCopy(src); }

  // DOM refs
  const ROOT = qs('#mecom-bracket');
  if (!ROOT) {
    console.warn('[MECOM] #mecom-bracket not found — сетка не инициализирована');
    return;
  }
  const navEl = qs('#mecomRoundsNav', ROOT);
  const swiper = qs('#mecomSwiper', ROOT);
  const track = qs('#mecomSwiperTrack', ROOT);
  const dotsEl = qs('#mecomDots', ROOT);

  const STORAGE_KEY = ROOT.getAttribute('data-storage-key') || 'mecom_bracket_state_vX';
  const AUTO_SEED = (ROOT.getAttribute('data-auto-seed') || 'true') === 'true';

  let renderData = prepareRenderData(TOURNAMENT_DATA);

  // Render nav chips
  function renderNav(activeIdx = 0) {
    navEl.innerHTML = '';
    renderData.forEach((r, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mecom-chip' + (idx === activeIdx ? ' is-active' : '');
      btn.textContent = r.name || `Раунд ${idx + 1}`;
      btn.addEventListener('click', () => goTo(idx));
      navEl.appendChild(btn);
    });
  }

  // Dots
  function renderDots(activeIdx = 0) {
    dotsEl.innerHTML = '';
    renderData.forEach((_, idx) => {
      const d = document.createElement('div');
      d.className = 'mecom-dot' + (idx === activeIdx ? ' is-active' : '');
      d.addEventListener('click', () => goTo(idx));
      dotsEl.appendChild(d);
    });
  }

  // Slides (rounds)
  function renderSlides() {
    track.innerHTML = '';
    renderData.forEach((round, rIndex) => {
      const slide = document.createElement('div');
      slide.className = 'mecom-slide fade-in';

      const title = document.createElement('div');
      title.className = 'mecom-round-title';
      const left = document.createElement('div'); left.textContent = round.name || `Раунд ${rIndex + 1}`;
      title.appendChild(left);
      slide.appendChild(title);

      (round.packs || []).forEach((pack, pIndex) => {
        const packEl = document.createElement('div'); packEl.className = 'pack';
        const packTitle = document.createElement('div'); packTitle.className = 'pack-title';
        packTitle.textContent = pack.title || `Пачка ${pIndex + 1}`;
        packEl.appendChild(packTitle);

        const contents = document.createElement('div'); contents.className = 'pack-contents';

        (pack.teams || []).forEach((team, tIndex) => {
          // skip empty unless keepEmptySlots
          if (!team || !team.name) {
            if (RENDER_OPTIONS.keepEmptySlots) {
              const teamEl = document.createElement('div');
              teamEl.className = 'mecom-team empty-slot placeholder';
              const leftBlock = document.createElement('div'); leftBlock.className = 'left';
              const rightBlock = document.createElement('div'); rightBlock.className = 'name-wrap';
              const nameDiv = document.createElement('div'); nameDiv.className = 'team-name';
              nameDiv.textContent = '(пусто)';
              rightBlock.appendChild(nameDiv);
              teamEl.appendChild(leftBlock);
              teamEl.appendChild(rightBlock);
              contents.appendChild(teamEl);
            }
            return;
          }

          const teamEl = document.createElement('div'); teamEl.className = 'mecom-team';

          // highlight winners
          if (typeof pack.winnerIndex === 'number' && pack.winnerIndex === tIndex) teamEl.classList.add('winner');
          else if (Array.isArray(pack.winnerIndex) && pack.winnerIndex.includes(tIndex)) teamEl.classList.add('winner');

          // champion detection
          const isChampion =
            (typeof pack.winnerchampIndex === 'number' && pack.winnerchampIndex === tIndex)
            || (round && round.winnerchamp && round.winnerchamp.pack === pIndex && round.winnerchamp.index === tIndex);

          if (isChampion) {
            teamEl.classList.add('champion');
            teamEl.classList.remove('winner');
          }

          const leftBlock = document.createElement('div'); leftBlock.className = 'left';
          if (!(team && team.noDescription)) {
            const cls = document.createElement('span'); cls.className = 'mecom-tag mecom-tag-grade';
            cls.textContent = team && team.grade ? `${team.grade} класс` : '';
            const br = document.createElement('span');
            let branchClass = '';
            if (team && team.branch) {
              const b = String(team.branch).toLowerCase();
              if (b.includes('север')) branchClass = 'mecom-tag-north';
              else if (b.includes('юг')) branchClass = 'mecom-tag-south';
              else if (b.includes('вост')) branchClass = 'mecom-tag-east';
              else if (b.includes('зап')) branchClass = 'mecom-tag-west';
              else branchClass = 'mecom-tag-north';
            }
            br.className = 'mecom-tag ' + branchClass;
            br.textContent = team && team.branch ? team.branch : '';
            leftBlock.appendChild(cls);
            leftBlock.appendChild(br);
          }

          const rightBlock = document.createElement('div'); rightBlock.className = 'name-wrap';
          const nameDiv = document.createElement('div'); nameDiv.className = 'team-name';
          nameDiv.textContent = team && team.name ? team.name : '(пусто)';
          rightBlock.appendChild(nameDiv);

          if (team && team._promotedFrom && team._showPromoted && !(team.noDescription)) {
            const note = document.createElement('div'); note.className = 'promoted-note';
            note.textContent = `проходит из: ${team._promotedFrom.roundName} · ${team._promotedFrom.packTitle}`;
            rightBlock.appendChild(note);
          }

          teamEl.appendChild(leftBlock);
          teamEl.appendChild(rightBlock);
          contents.appendChild(teamEl);
        });

        packEl.appendChild(contents);
        slide.appendChild(packEl);
      });

      track.appendChild(slide);
    });

    // trigger fade-ins after insertion
    requestAnimationFrame(() => {
      qsa('.mecom-slide.fade-in', track).forEach(el => el.classList.add('show'));
      setTimeout(() => updateHeightForSlide(current), 30);
    });
  }

  // Swiper mechanics
  let current = 0;
  let startX = 0, startY = 0, curX = 0;
  let dragging = false;
  let width = 0;
  let lastMoveAt = 0;

  function setTranslate(px, withAnim = true) {
    track.style.transition = withAnim ? 'transform .26s ease' : 'none';
    track.style.transform = `translate3d(${px}px,0,0)`;
  }

  function updateWidth() { width = swiper.clientWidth || 1; }
  window.addEventListener('resize', () => { updateWidth(); setTranslate(-current * width, false); updateHeightForSlide(current); });

  function updateHeightForSlide(i) {
    const slide = track.children[i];
    if (!slide) { swiper.style.height = '120px'; return; }
    const rect = slide.getBoundingClientRect();
    const h = Math.ceil(rect.height);
    const minH = 80;
    swiper.style.height = (Math.max(h, minH)) + 'px';
  }

  function goTo(i) {
    current = Math.max(0, Math.min(i, renderData.length - 1));
    setTranslate(-current * width, true);
    setTimeout(() => updateHeightForSlide(current), 120);
    const chips = navEl.querySelectorAll('.mecom-chip');
    chips.forEach((c, idx) => c.classList.toggle('is-active', idx === current));
    const dots = dotsEl.querySelectorAll('.mecom-dot');
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === current));
  }

  function onStart(e) {
    const touch = e.touches ? e.touches[0] : e;
    startX = touch.clientX; startY = touch.clientY; curX = startX;
    dragging = true; lastMoveAt = performance.now(); track.style.transition = 'none';
  }
  function onMove(e) {
    if (!dragging) return;
    const touch = e.touches ? e.touches[0] : e;
    const dx = touch.clientX - startX; const dy = touch.clientY - startY;
    if (Math.abs(dy) > Math.abs(dx)) { dragging = false; setTranslate(-current * width, false); return; }
    e.preventDefault(); curX = touch.clientX;
    const base = -current * width;
    setTranslate(base + dx, false); lastMoveAt = performance.now();
  }
  function onEnd() {
    if (!dragging) return;
    dragging = false;
    const dx = (curX || startX) - startX;
    const dt = Math.max(1, performance.now() - lastMoveAt);
    const velocity = Math.abs(dx) / dt;
    const threshold = width * 0.18;
    if (dx < -threshold || (dx < -10 && velocity > 0.6)) goTo(current + 1);
    else if (dx > threshold || (dx > 10 && velocity > 0.6)) goTo(current - 1);
    else goTo(current);
  }

  function attachSwipe() {
    updateWidth(); updateHeightForSlide(current);
    // touch
    swiper.addEventListener('touchstart', onStart, { passive: true });
    swiper.addEventListener('touchmove', onMove, { passive: false });
    swiper.addEventListener('touchend', onEnd, { passive: true });
    // mouse
    swiper.addEventListener('mousedown', (e) => { e.preventDefault(); onStart(e); });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);
  }

  // Persistence
  function saveState(obj) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) { /* ignore */ }
  }
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function renderAll() {
    renderSlides(); renderNav(current); renderDots(current);
    setTranslate(-current * width, false); updateHeightForSlide(current);
  }

  function init() {
    const saved = loadState();
    if (saved && Array.isArray(saved)) {
      renderData = saved;
    } else if (saved && saved.rounds) {
      // convert older format
      renderData = Array.isArray(saved.rounds) ? saved.rounds.map(r => ({ name: r.name, packs: [{ title: 'Слоты', teams: (r.teams || []).map(t => ({ name: t })) }] })) : prepareRenderData(TOURNAMENT_DATA);
    } else {
      renderData = prepareRenderData(TOURNAMENT_DATA);
    }

    renderAll();
    attachSwipe();

    // expose API for console debugging
    window.MECOM_BRACKET_V2 = {
      getState: () => deepCopy(renderData),
      setState: (obj) => { if (Array.isArray(obj)) { renderData = deepCopy(obj); saveState(renderData); renderAll(); } },
      resetDefaults: () => { renderData = prepareRenderData(TOURNAMENT_DATA); saveState(renderData); renderAll(); }
    };
  }

  init();
}
