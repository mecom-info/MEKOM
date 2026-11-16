// МЭКОМ — мобильное меню, аккордеоны, отрисовка контактов, чемпионата и
// демо-виджета из JSON. Без сетевых запросов сайт остаётся читаемым:
// статичная разметка в HTML уже показывает контакты, этапы и призовые,
// JS только заменяет их на данные из JSON (data/site.json,
// data/championship.json, data/demo.json).
// Путь к /data/ — через window.MEKOM_BASE (см. <script> перед этим файлом на
// страницах во вложенных каталогах), а не абсолютный "/data/...": сайт может
// жить не в корне домена (GitHub Pages отдаёт /<репозиторий>/).

(function () {
  "use strict";

  var BASE = window.MEKOM_BASE || "";
  var DATA_VERSION = "20261115e";

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Появление секций при прокрутке (перенесено со старого сайта по смыслу).
  // CSS прячет [data-reveal] только под классом .reveal-ready, который ставит
  // этот скрипт: без JS, без IntersectionObserver или при reduce секции видны.
  function initScrollReveal() {
    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver !== "function") return;
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;
    // Прячем секции только теперь, когда наблюдатель точно заработает.
    document.documentElement.classList.add("reveal-ready");
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -50px 0px" }
    );
    targets.forEach(function (el) {
      io.observe(el);
    });
  }

  function initAccordions() {
    document.querySelectorAll(".accordion-trigger").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".accordion-item");
        if (!item) return;
        var isOpen = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    });
  }

  function renderSiteConfig() {
    var needsIt = document.querySelector(
      '[data-site="channel"], [data-site="support"], [data-site="bot"], [data-site="fallback-note"], [data-site="year"], [data-site="support-bot"], [data-site="partner-bot"], [data-reg-form]'
    );
    if (!needsIt) return;

    fetch(BASE + "data/site.json?v=" + DATA_VERSION)
      .then(function (r) {
        if (!r.ok) throw new Error("site.json: " + r.status);
        return r.json();
      })
      .then(function (data) {
        function applyLink(selector, link) {
          if (!link || !link.url) return;
          document.querySelectorAll(selector).forEach(function (el) {
            el.href = link.url;
            if (link.handle && el.textContent.trim().charAt(0) === "@") {
              el.textContent = link.handle;
            }
          });
        }
        applyLink('[data-site="channel"]', data.telegram_channel);
        applyLink('[data-site="support"]', data.telegram_support);
        if (data.registration && data.registration.google_form_url) {
          document.querySelectorAll("[data-reg-cta]").forEach(function (el) {
            el.href = data.registration.google_form_url;
            el.target = "_blank";
            el.rel = "noopener";
          });
        }
        if (data.registration && data.registration.bot_url) {
          document.querySelectorAll('[data-site="bot"]').forEach(function (el) {
            el.href = data.registration.bot_url;
          });
        }
        if (data.registration && data.registration.fallback_note) {
          document.querySelectorAll('[data-site="fallback-note"]').forEach(function (el) {
            el.textContent = data.registration.fallback_note;
          });
        }
        if (data.support_bot_url) {
          document.querySelectorAll('[data-site="support-bot"]').forEach(function (el) {
            el.href = data.support_bot_url;
          });
        }
        if (data.partner_bot_url) {
          document.querySelectorAll('[data-site="partner-bot"]').forEach(function (el) {
            el.href = data.partner_bot_url;
          });
        }
        if (data.year) {
          document.querySelectorAll('[data-site="year"]').forEach(function (el) {
            el.textContent = data.year;
          });
        }
        initRegForm(data.registration);
      })
      .catch(function (err) {
        // Разметка уже показывает статичные контакты — страница остаётся читаемой.
        console.warn("Не удалось загрузить site.json:", err);
      });
  }

  function sortedStages(data) {
    return (data.stages || []).slice().sort(function (a, b) {
      return a.order - b.order;
    });
  }

  function renderChampionship() {
    var needsIt = document.querySelector(
      "[data-stages], [data-season], [data-history-root]"
    );
    if (!needsIt) return;

    fetch(BASE + "data/championship.json?v=" + DATA_VERSION)
      .then(function (r) {
        if (!r.ok) throw new Error("championship.json: " + r.status);
        return r.json();
      })
      .then(function (data) {
        document.querySelectorAll("[data-stages]").forEach(function (stagesEl) {
          stagesEl.innerHTML = "";
          sortedStages(data).forEach(function (stage) {
            var pill = document.createElement("span");
            pill.className = "stage-pill";
            pill.textContent = stage.name;
            stagesEl.appendChild(pill);
          });
        });

        document.querySelectorAll("[data-season]").forEach(function (el) {
          if (data.season) {
            var text = "Сезон " + data.season;
            if (data.dates) text += " · " + data.dates;
            if (data.venue) text += " · " + data.venue;
            el.textContent = text;
          }
        });
        document.querySelectorAll("[data-season-note]").forEach(function (el) {
          el.textContent = data.note || "";
        });
        var howTo = document.querySelector("[data-how-to-join]");
        if (howTo) howTo.textContent = data.how_to_join || "";
        var ruleset = document.querySelector("[data-ruleset-note]");
        if (ruleset) ruleset.textContent = data.ruleset_note || "";
        var pricing = document.querySelector("[data-pricing-note]");
        if (pricing) pricing.textContent = data.pricing_note || "";

        var bracketEl = document.querySelector("[data-bracket]");
        if (bracketEl && data.bracket) {
          bracketEl.textContent = data.bracket.note || "";
        }

        var historyRoot = document.querySelector("[data-history-root]");
        if (historyRoot && Array.isArray(data.history)) {
          historyRoot.innerHTML = "";
          data.history.forEach(function (year) {
            var card = document.createElement("div");
            card.className = "history-year";

            var h3 = document.createElement("h3");
            h3.textContent = year.year + " — " + year.title;
            card.appendChild(h3);

            var summary = document.createElement("p");
            summary.textContent = year.results_summary || "";
            card.appendChild(summary);

            if (year.winner && year.winner.photo) {
              var winnerBox = document.createElement("div");
              winnerBox.className = "history-winner";
              var winnerSrc = BASE + "assets/img/history/" + (year.photo_dir || "") + "/" + year.winner.photo;
              var winnerLink = document.createElement("a");
              winnerLink.href = winnerSrc;
              winnerLink.target = "_blank";
              winnerLink.rel = "noopener";
              var winnerImg = document.createElement("img");
              winnerImg.src = winnerSrc;
              winnerImg.alt = year.winner.caption || "Победители — команда " + year.winner.team;
              winnerImg.loading = "lazy";
              winnerLink.appendChild(winnerImg);
              winnerBox.appendChild(winnerLink);
              var winnerCaption = document.createElement("p");
              winnerCaption.className = "history-winner-caption";
              winnerCaption.textContent = year.winner.caption || "Победители — команда " + year.winner.team;
              winnerBox.appendChild(winnerCaption);
              card.appendChild(winnerBox);
            }

            if (Array.isArray(year.photos) && year.photos.length) {
              // Настоящие фото есть — показываем их вместо заглушек.
              var gallery = document.createElement("div");
              gallery.className = "history-photos";
              year.photos.forEach(function (filename) {
                var photoSrc = BASE + "assets/img/history/" + (year.photo_dir || "") + "/" + filename;
                var link = document.createElement("a");
                link.href = photoSrc;
                link.target = "_blank";
                link.rel = "noopener";
                var img = document.createElement("img");
                img.src = photoSrc;
                img.alt = year.year + " — " + year.title;
                img.loading = "lazy";
                link.appendChild(img);
                gallery.appendChild(link);
              });
              card.appendChild(gallery);
            } else {
              var slots = [year.photos_note, year.poster_note].filter(Boolean);
              if (slots.length) {
                var photos = document.createElement("div");
                photos.className = "history-photos";
                photos.setAttribute("aria-hidden", "true");
                slots.forEach(function (note) {
                  var ph = document.createElement("div");
                  ph.className = "photo-placeholder";
                  ph.textContent = note;
                  photos.appendChild(ph);
                });
                card.appendChild(photos);
              }
            }

            if (Array.isArray(year.identity) && year.identity.length) {
              var ul = document.createElement("ul");
              ul.className = "history-identity";
              year.identity.forEach(function (item) {
                var li = document.createElement("li");
                li.textContent = item;
                ul.appendChild(li);
              });
              card.appendChild(ul);
            }

            if (year.archive_url) {
              var archiveRow = document.createElement("div");
              archiveRow.className = "cta-row mt-14";
              var archiveLink = document.createElement("a");
              archiveLink.className = "btn btn-ghost";
              archiveLink.href = year.archive_url;
              archiveLink.textContent = year.archive_label || "Открыть архив сезона";
              archiveRow.appendChild(archiveLink);
              card.appendChild(archiveRow);
            }

            historyRoot.appendChild(card);
          });
        }
      })
      .catch(function (err) {
        // Разметка уже показывает статичные данные — страница остаётся читаемой.
        console.warn("Не удалось загрузить championship.json:", err);
      });
  }

  //: «9А», «10Б, 11» — числа 5–11 с необязательной буквой, до 5 через запятую.
  var GRADE_PATTERN = /^(1[01]|[5-9])[A-Za-zА-Яа-яЁё]?(\s*,\s*(1[01]|[5-9])[A-Za-zА-Яа-яЁё]?){0,4}$/;
  var NAME_PATTERN = /^[A-Za-zА-Яа-яЁё]+(?:[ '\-][A-Za-zА-Яа-яЁё]+)*$/;
  var TELEGRAM_PATTERN = /^@?[A-Za-z0-9_]{5,32}$/;
  //: «умная пунктуация» ставит ’/ʼ/‘/` вместо обычного апострофа — до
  //: проверки приводим к ASCII, иначе «О’Нил» получает неочевидную ошибку.
  var APOSTROPHE_VARIANTS = /[‘’ʼ`]/g;

  function normalizeApostrophes(value) {
    return value.replace(APOSTROPHE_VARIANTS, "'");
  }

  function initRegForm(registration) {
    var wrap = document.querySelector("[data-reg-form-wrap]");
    var formLink = document.querySelector("[data-reg-form-link]");
    var apiUrl = registration && registration.api_url;

    if (!apiUrl) {
      // Пусто — постоянного адреса API пока нет (нет домена для GitHub
      // Pages). Форма остаётся скрытой, заявка идёт только через бота —
      // так она никогда не потеряется молча.
      return;
    }

    if (formLink) {
      formLink.hidden = false;
    }

    // Основной путь — Google Форма (кнопки ведут на неё). Форма сайта —
    // запасная: открывается только по ссылке «Открыть запасную форму» (#reg-form).
    if (!wrap) return;
    function revealIfAsked() {
      if (location.hash !== "#reg-form") return;
      wrap.hidden = false;
      wrap.scrollIntoView();
    }
    window.addEventListener("hashchange", revealIfAsked);
    revealIfAsked();

    var form = wrap.querySelector("form");
    if (!form) return;

    var statusEl = wrap.querySelector("[data-reg-status]");
    var renderedAtInput = form.querySelector('[name="rendered_at"]');
    if (renderedAtInput) renderedAtInput.value = String(Date.now());

    var trackRadios = Array.prototype.slice.call(form.querySelectorAll('input[name="track"]'));
    var schoolOnly = form.querySelectorAll(".reg-only-school");
    var openOnly = form.querySelectorAll(".reg-only-open");

    function applyTrack() {
      var track = form.querySelector('input[name="track"]:checked');
      var value = track ? track.value : "school";
      schoolOnly.forEach(function (el) { el.hidden = value !== "school"; });
      openOnly.forEach(function (el) { el.hidden = value !== "open"; });
      form.querySelectorAll(".reg-only-school input, .reg-only-school select").forEach(function (el) {
        el.disabled = value !== "school";
      });
      form.querySelectorAll(".reg-only-open input, .reg-only-open textarea").forEach(function (el) {
        el.disabled = value !== "open";
      });
    }
    trackRadios.forEach(function (r) { r.addEventListener("change", applyTrack); });
    applyTrack();

    var teamSizeEl = form.querySelector('[name="team_size"]');
    var membersContainer = form.querySelector("[data-members]");
    var memberTemplate = form.querySelector("[data-member-template]");
    var savedMembers = {};

    function renderMembers(n) {
      if (!membersContainer || !memberTemplate) return;
      Array.prototype.slice.call(membersContainer.querySelectorAll(".reg-member")).forEach(function (fs) {
        var idx = fs.getAttribute("data-member-index");
        var firstEl = fs.querySelector('[name$="_first"]');
        var lastEl = fs.querySelector('[name$="_last"]');
        savedMembers[idx] = { first: firstEl ? firstEl.value : "", last: lastEl ? lastEl.value : "" };
      });
      membersContainer.innerHTML = "";
      for (var i = 1; i <= n; i++) {
        var tmp = document.createElement("div");
        tmp.innerHTML = memberTemplate.innerHTML.split("__N__").join(String(i));
        var fieldset = tmp.querySelector(".reg-member");
        if (!fieldset) continue;
        fieldset.setAttribute("data-member-index", String(i));
        var saved = savedMembers[i];
        if (saved) {
          var firstInput = fieldset.querySelector('[name$="_first"]');
          var lastInput = fieldset.querySelector('[name$="_last"]');
          if (firstInput) firstInput.value = saved.first;
          if (lastInput) lastInput.value = saved.last;
        }
        membersContainer.appendChild(fieldset);
      }
    }

    if (teamSizeEl) {
      teamSizeEl.addEventListener("change", function () {
        renderMembers(parseInt(teamSizeEl.value, 10) || 0);
      });
    }

    function clearFieldErrors() {
      form.querySelectorAll(".reg-field-error").forEach(function (el) {
        el.textContent = "";
      });
      form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
        el.removeAttribute("aria-invalid");
      });
    }

    function showFieldError(field, message) {
      var holder = form.querySelector('[data-error-for="' + field + '"]');
      if (holder) {
        holder.textContent = message;
      } else if (statusEl) {
        statusEl.textContent = message;
      }
      var input = form.querySelector('[name="' + field + '"]');
      if (input) {
        input.setAttribute("aria-invalid", "true");
        input.focus();
      }
    }

    function setStatus(text, kind) {
      if (!statusEl) return;
      statusEl.textContent = text;
      statusEl.className = "reg-status" + (kind ? " reg-status-" + kind : "");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFieldErrors();
      setStatus("Отправляем…", "pending");

      var track = form.querySelector('input[name="track"]:checked');
      var trackValue = track ? track.value : "school";

      // Порядок проверки совпадает с порядком полей в DOM (team_size →
      // участники → класс → telegram), чтобы фокус первой ошибки совпадал
      // с тем, что человек видит сверху вниз.
      var teamSize = parseInt(teamSizeEl ? teamSizeEl.value : "", 10);
      if (!teamSize || teamSize < 2 || teamSize > 4) {
        showFieldError("team_size", "Выберите число участников от 2 до 4");
        setStatus("Проверьте число участников", "error");
        return;
      }

      var memberValues = {};
      for (var mi = 1; mi <= teamSize; mi++) {
        var firstField = "member" + mi + "_first";
        var lastField = "member" + mi + "_last";
        var firstVal = (form.querySelector('[name="' + firstField + '"]') || {}).value;
        var lastVal = (form.querySelector('[name="' + lastField + '"]') || {}).value;
        firstVal = normalizeApostrophes(firstVal ? firstVal.trim() : "");
        lastVal = normalizeApostrophes(lastVal ? lastVal.trim() : "");
        if (!NAME_PATTERN.test(firstVal) || firstVal.length > 40) {
          showFieldError(firstField, "Имя: только буквы, пробел/дефис/апостроф между словами");
          setStatus("Проверьте имя участника " + mi, "error");
          return;
        }
        if (!NAME_PATTERN.test(lastVal) || lastVal.length > 40) {
          showFieldError(lastField, "Фамилия: только буквы, пробел/дефис/апостроф между словами");
          setStatus("Проверьте фамилию участника " + mi, "error");
          return;
        }
        memberValues[firstField] = firstVal;
        memberValues[lastField] = lastVal;
      }

      if (trackValue === "school") {
        var gradeEl = form.querySelector('[name="grade"]');
        if (gradeEl && !GRADE_PATTERN.test(gradeEl.value.trim())) {
          showFieldError("grade", "Класс(ы): например «9А» или «10Б, 11» — числа 5–11, до 5 через запятую");
          setStatus("Проверьте поле «Класс»", "error");
          return;
        }
      }

      var telegramEl = form.querySelector('[name="telegram"]');
      var telegramValue = telegramEl ? telegramEl.value.trim() : "";
      if (!TELEGRAM_PATTERN.test(telegramValue)) {
        showFieldError("telegram", "Telegram: @username, латиница/цифры/«_», 5–32 знака");
        setStatus("Проверьте поле «Telegram»", "error");
        return;
      }

      var params = new URLSearchParams();
      params.set("track", trackValue);
      params.set("team", form.querySelector('[name="team"]').value.trim());
      params.set("team_size", String(teamSize));
      Object.keys(memberValues).forEach(function (key) {
        params.set(key, memberValues[key]);
      });
      params.set("telegram", telegramValue);
      params.set("consent", form.querySelector('[name="consent"]').checked ? "on" : "");
      params.set("company", form.querySelector('[name="company"]').value);
      params.set("rendered_at", renderedAtInput ? renderedAtInput.value : "");

      if (trackValue === "school") {
        var branchEl = form.querySelector('input[name="branch"]:checked');
        params.set("branch", branchEl ? branchEl.value : "");
        params.set("grade", form.querySelector('[name="grade"]').value.trim());
      } else {
        params.set("school", form.querySelector('[name="school"]').value.trim());
        params.set("city", form.querySelector('[name="city"]').value.trim());
        var commentEl = form.querySelector('[name="comment"]');
        params.set("comment", commentEl ? commentEl.value.trim() : "");
      }

      var submitBtn = form.querySelector('[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      })
        .then(function (r) {
          return r.json().catch(function () { return null; }).then(function (body) {
            return { ok: r.ok, status: r.status, body: body };
          });
        })
        .then(function (res) {
          if (submitBtn) submitBtn.disabled = false;
          var body = res.body || {};
          if (res.ok && body.ok) {
            setStatus(
              "Заявка принята" + (body.id ? " (№ " + body.id + ")" : "") + ".",
              "success"
            );
            form.reset();
            if (renderedAtInput) renderedAtInput.value = String(Date.now());
            applyTrack();
            savedMembers = {};
            renderMembers(0);
            return;
          }
          var message = body.message || body.error || "Заявка не принята — проверьте поля.";
          if (body.field) {
            showFieldError(body.field, message);
          }
          setStatus(message, "error");
        })
        .catch(function () {
          if (submitBtn) submitBtn.disabled = false;
          setStatus(
            "Заявка НЕ отправлена — не получилось соединиться с сервером. " +
              "Попробуйте ещё раз или подайте заявку через бота выше.",
            "error"
          );
        });
    });
  }

  function initDemo() {
    var root = document.querySelector("[data-demo-root]");
    if (!root) return;

    var priceSel = root.querySelector("[data-demo-price]");
    var prodSel = root.querySelector("[data-demo-production]");
    var profitEl = root.querySelector("[data-demo-profit]");
    var soldEl = root.querySelector("[data-demo-sold]");
    var shareEl = root.querySelector("[data-demo-share]");
    var stockEl = root.querySelector("[data-demo-stock]");
    var noteEl = root.querySelector("[data-demo-note]");

    fetch(BASE + "data/demo.json?v=" + DATA_VERSION)
      .then(function (r) {
        if (!r.ok) throw new Error("demo.json: " + r.status);
        return r.json();
      })
      .then(function (data) {
        // По умолчанию выбираем самую прибыльную ячейку сетки, а не первую
        // (обычно убыточную) — иначе демо встречает посетителя минусом (М9).
        var rows = data.rows || [];
        var profitable = rows.filter(function (r) {
          return typeof r.profit === "number" && r.profit > 0;
        });
        var defaultRow = profitable.length
          ? profitable.reduce(function (best, r) {
              return r.profit > best.profit ? r : best;
            })
          : null;

        (data.price_grid || []).forEach(function (price) {
          var opt = document.createElement("option");
          opt.value = price;
          opt.textContent = price;
          if (defaultRow && price === defaultRow.price) opt.selected = true;
          priceSel.appendChild(opt);
        });
        (data.production_grid || []).forEach(function (prod) {
          var opt = document.createElement("option");
          opt.value = prod;
          opt.textContent = prod;
          if (defaultRow && prod === defaultRow.production) opt.selected = true;
          prodSel.appendChild(opt);
        });
        if (noteEl) noteEl.textContent = data.note || "";

        function update() {
          var price = Number(priceSel.value);
          var production = Number(prodSel.value);
          var row = (data.rows || []).find(function (r) {
            return r.price === price && r.production === production;
          });
          if (!row) return;
          profitEl.textContent = row.profit === null ? "—" : row.profit.toLocaleString("ru-RU");
          soldEl.textContent = row.sold === null ? "—" : row.sold.toLocaleString("ru-RU");
          shareEl.textContent = row.share_pct === null ? "—" : row.share_pct + "%";
          stockEl.textContent = row.stock_units === null ? "—" : row.stock_units.toLocaleString("ru-RU");
        }

        priceSel.addEventListener("change", update);
        prodSel.addEventListener("change", update);
        update();
      })
      .catch(function (err) {
        if (noteEl) noteEl.textContent = "Демо временно не загрузилось.";
        console.warn("Не удалось загрузить demo.json:", err);
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initAccordions();
    initScrollReveal();
    renderSiteConfig();
    renderChampionship();
    initDemo();
  });
})();
