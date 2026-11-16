(function () {
  var script = document.currentScript;
  var base = (script && script.dataset && script.dataset.base) || "./";
  window.MEKOM_BASE = base;
})();
