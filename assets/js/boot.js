(function () {
  var script = document.currentScript;
  var base = (script && script.dataset && script.dataset.base) || "./";
  window.MEKOM_BASE = base;

  if (script && script.dataset && script.dataset.themeInit === "champ-2025") {
    try {
      if (window.localStorage.getItem("mekom-theme") === "champ-2025") {
        document.documentElement.setAttribute("data-theme", "champ-2025");
      }
    } catch (e) {}
  }
})();
