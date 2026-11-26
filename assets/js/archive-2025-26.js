// Архив сезона 2025/26 — турнирная сетка, перенесённая со старого сайта
// как она была опубликована (реальные названия команд, класс, филиал и
// отметки победителей по пачкам; TOURNAMENT_DATA скопирован без изменений).
// Только отрисовка — никакого редактирования и localStorage.
(function () {
  "use strict";

  var TOURNAMENT_DATA = [
    {
      name: "Отборочные",
      packs: [
        {
          title: "Пачка A — 7 класс",
          teams: [
            { name: "enhereum", grade: "7", branch: "Юг" },
            { name: "Buymeraf", grade: "7", branch: "Юг" },
            { name: "7h384115", grade: "7", branch: "Юг" },
            { name: "Baldi", grade: "7", branch: "Юг" },
            { name: "Oguzki", grade: "7", branch: "Юг" },
            { name: "Koshkas", grade: "7", branch: "Юг" },
            { name: "Bogini", grade: "7", branch: "Юг" },
            { name: "456KG", grade: "7", branch: "Юг" },
            { name: "Gavriki", grade: "7", branch: "Юг" },
            { name: "AZKG61TM", grade: "7", branch: "Юг" }
          ],
          winnerIndex: [0, 1, 2, 3, 4, 5]
        },
        {
          title: "Пачка B — 8 класс",
          teams: [
            { name: "BapeAape", grade: "8", branch: "Юг" },
            { name: "Bam", grade: "8", branch: "Юг" },
            { name: "Smelost", grade: "8", branch: "Юг" },
            { name: "Vishni", grade: "8", branch: "Юг" },
            { name: "Ermogagi", grade: "8", branch: "Юг" },
            { name: "Vetchina", grade: "8", branch: "Юг" },
            { name: "SV", grade: "8", branch: "Юг" },
            { name: "Mutagen", grade: "8", branch: "Юг" }
          ],
          winnerIndex: [0, 1, 2, 3, 4, 5]
        },
        {
          title: "Пачка C — 9 класс",
          teams: [
            { name: "Kozlatki", grade: "9", branch: "Юг" },
            { name: "Xex", grade: "9", branch: "Юг" },
            { name: "OOOBNAL", grade: "9", branch: "Юг" },
            { name: "Red bull", grade: "9", branch: "Юг" },
            { name: "MMM", grade: "9", branch: "Юг" },
            { name: "Didiblad", grade: "9", branch: "Юг" },
            { name: "Mstiteli", grade: "9", branch: "Юг" },
            { name: "Apelsin", grade: "9", branch: "Юг" }
          ],
          winnerIndex: [0, 1, 2, 3, 4, 5]
        },
        {
          title: "Пачка D — 10 класс",
          teams: [
            { name: "SAMO", grade: "10", branch: "Юг" },
            { name: "BIMBO", grade: "10", branch: "Юг" },
            { name: "MEOW", grade: "10", branch: "Юг" },
            { name: "Eighteff", grade: "10", branch: "Юг" },
            { name: "Selo", grade: "10", branch: "Юг" },
            { name: "DEFENDER", grade: "10", branch: "Юг" },
            { name: "TeamH 2G", grade: "10", branch: "Юг" }
          ],
          winnerIndex: [0, 1, 2, 3, 4, 5]
        },
        {
          title: "Пачка E — 11 класс",
          teams: [
            { name: "Foot’a", grade: "11", branch: "Юг" },
            { name: "Foot’a 2", grade: "11", branch: "Юг" },
            { name: "Kelden", grade: "11", branch: "Юг" },
            { name: "TeK_lan", grade: "11", branch: "Юг" }
          ],
          winnerIndex: [0]
        }
      ]
    },
    {
      name: "Вторая стадия",
      packs: [
        {
          title: "Пачка F – 78 регион",
          teams: [
            { name: "Koshkas", grade: "7", branch: "Юг" },
            { name: "7h384115", grade: "7", branch: "Юг" },
            { name: "Ermogagi", grade: "8", branch: "Юг" },
            { name: "Buymeraf", grade: "7", branch: "Юг" },
            { name: "Bam", grade: "8", branch: "Юг" },
            { name: "BapeAape", grade: "8", branch: "Юг" },
            { name: "enhereum", grade: "7", branch: "Юг" },
            { name: "Baldi", grade: "7", branch: "Юг" },
            { name: "Vishni", grade: "8", branch: "Юг" },
            { name: "Smelost", grade: "8", branch: "Юг" },
            { name: "Oguzki", grade: "7", branch: "Юг" },
            { name: "Vetchina", grade: "8", branch: "Юг" }
          ],
          winnerIndex: [0, 1, 2, 3, 4]
        },
        {
          title: "Пачка G — 9/10/11",
          teams: [
            { name: "SAMO", grade: "10", branch: "Юг" },
            { name: "MMM", grade: "9", branch: "Юг" },
            { name: "Selo", grade: "10", branch: "Юг" },
            { name: "Foot’a", grade: "11", branch: "Юг" },
            { name: "Xex", grade: "9", branch: "Юг" },
            { name: "Kozlatki", grade: "9", branch: "Юг" },
            { name: "MEOW", grade: "10", branch: "Юг" },
            { name: "BIMBO", grade: "10", branch: "Юг" },
            { name: "DEFENDER", grade: "10", branch: "Юг" },
            { name: "Red bull", grade: "9", branch: "Юг" },
            { name: "OOOBNAL", grade: "9", branch: "Юг" },
            { name: "Eighteff", grade: "10", branch: "Юг" },
            { name: "Didiblad", grade: "9", branch: "Юг" }
          ],
          winnerIndex: [0, 1, 2, 3, 4, 5]
        }
      ]
    },
    {
      name: "Полуфинал",
      packs: [
        {
          title: "Пачка H",
          teams: [
            { name: "Xex", grade: "9", branch: "Юг" },
            { name: "Selo", grade: "10", branch: "Юг" },
            { name: "Foot’a", grade: "11", branch: "Юг" },
            { name: "SAMO", grade: "10", branch: "Юг" },
            { name: "Koshkas", grade: "7", branch: "Юг" },
            { name: "Bam", grade: "8", branch: "Юг" },
            { name: "Ermogagi", grade: "8", branch: "Юг" },
            { name: "Kozlatki", grade: "9", branch: "Юг" },
            { name: "Buymeraf", grade: "7", branch: "Юг" },
            { name: "MMM", grade: "9", branch: "Юг" },
            { name: "7h384115", grade: "7", branch: "Юг" }
          ],
          winnerIndex: [0, 1, 2, 3, 4]
        }
      ]
    },
    {
      name: "Финал",
      winnerchamp: { pack: 0, index: 0 },
      packs: [
        {
          title: "Финальная пачка",
          teams: [
            { name: "SAMO", grade: "10", branch: "Юг" },
            { name: "Xex", grade: "9", branch: "Юг" },
            { name: "Grishland", grade: "9", branch: "Север" },
            { name: "Foot’a", grade: "11", branch: "Юг" },
            { name: "Koshkas", grade: "7", branch: "Юг" },
            { name: "Tapochek", grade: "8", branch: "Север" },
            { name: "Pomidor", grade: "8", branch: "Север" },
            { name: "Shishki", grade: "10", branch: "Север" },
            { name: "MMM", grade: "7", branch: "Север" },
            { name: "Selo", grade: "10", branch: "Юг" }
          ]
        }
      ]
    }
  ];

  function init() {
    initPrizes();
    var root = document.querySelector("[data-mc25-root]");
    if (!root || !window.MekomBracket) return;
    MekomBracket.mount(root, TOURNAMENT_DATA, { label: "Этапы сезона 2025/26" });
  }

  // --- Призовые: строки въезжают по очереди, суммы считаются от 0 ---
  function fmt(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  }

  function initPrizes() {
    var box = document.querySelector("[data-prizes]");
    if (!box) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    var rows = box.querySelectorAll(".prize-row");
    var counters = box.querySelectorAll(".counter");
    Array.prototype.forEach.call(rows, function (r, i) { r.style.setProperty("--i", i); });
    Array.prototype.forEach.call(counters, function (c) { c.textContent = "0"; });
    box.classList.add("is-armed");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        box.classList.add("is-played");
        Array.prototype.forEach.call(counters, function (c, i) { count(c, 1300, 60 * i); });
      });
    }, { threshold: 0.4 });
    io.observe(box);
  }

  function count(node, dur, delay) {
    var target = parseInt(node.getAttribute("data-target"), 10) || 0;
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, Math.max(0, (ts - t0 - delay) / dur));
      var eased = 1 - Math.pow(1 - p, 3);
      node.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else node.textContent = fmt(target);
    }
    requestAnimationFrame(step);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
