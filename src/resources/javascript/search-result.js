/* search-result.js — aggregate six categories, filter by category */
(function () {
  "use strict";

  var LABEL = {
    consortium: "Synthetic Consortia",
    species: "Species / Taxonomy",
    gene: "Genes",
    metagenome: "Environment Samples",
    enzyme: "Enzymes",
    pathway: "Pathways"
  };
  var BADGE = {
    consortium: "cl-badge-blue",
    species: "cl-badge-green",
    gene: "cl-badge-violet",
    metagenome: "cl-badge-green",
    enzyme: "cl-badge-amber",
    pathway: "cl-badge-amber"
  };
  var LINK = {
    consortium: "/consortium",
    species: "/search_result",
    gene: "/gene",
    metagenome: "/metagenome",
    enzyme: "/search_result",
    pathway: "/pathway"
  };

  function getQuery() {
    var m = window.location.search.match(/[?&]q=([^&]+)/);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "butyrate";
  }

  var q = getQuery();
  document.getElementById("q-label").textContent = q;
  document.getElementById("total-label").textContent = "…";

  fetch("/resources/assets/api_demo/search_result.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById("total-label").textContent = d.total;
      var cats = Object.keys(d.results || {});

      // Filter list
      var fl = document.getElementById("filter-list");
      cats.forEach(function (cat) {
        var item = document.createElement("div");
        item.className = "cl-filter-item active";
        item.dataset.cat = cat;
        item.innerHTML = '<span>' + LABEL[cat] + '</span>' +
          '<span class="cl-count">' + (d.counts[cat] || 0) + '</span>';
        item.addEventListener("click", function () { toggle(cat); });
        fl.appendChild(item);
      });

      var active = {};
      cats.forEach(function (c) { active[c] = true; });

      function toggle(cat) {
        active[cat] = !active[cat];
        var el = fl.querySelector('[data-cat="' + cat + '"]');
        el.classList.toggle("active", active[cat]);
        render();
      }

      document.getElementById("filter-all").addEventListener("click", function () {
        cats.forEach(function (c) { active[c] = true; });
        fl.querySelectorAll(".cl-filter-item").forEach(function (el) { el.classList.add("active"); });
        render();
      });

      function render() {
        var area = document.getElementById("result-area");
        area.innerHTML = "";
        var any = false;
        cats.forEach(function (cat) {
          if (!active[cat]) return;
          var list = d.results[cat] || [];
          if (!list.length) return;
          any = true;
          var sec = document.createElement("div");
          sec.className = "cl-section";
          var head = '<div class="cl-section-title">' + LABEL[cat] +
            ' <span class="cl-badge ' + BADGE[cat] + '">' + list.length + '</span></div>';
          var cards = list.map(function (it) {
            return '<a class="cl-result" href="' + (LINK[cat] || "#") + '">' +
              '<div class="cl-result-top"><h4>' + it.name + '</h4>' +
              '<span class="cl-badge ' + BADGE[cat] + ' cl-result-cat">' + cat + '</span></div>' +
              '<p>' + (it.desc || "") + '</p>' +
              '<div class="cl-muted" style="font-size:12px;margin-top:6px;">' + (it.meta || "") + '</div>' +
              '</a>';
          }).join("");
          sec.innerHTML = head + cards;
          area.appendChild(sec);
        });
        if (!any) area.innerHTML = '<p class="cl-muted">No results in selected categories.</p>';
      }

      render();
    })
    .catch(function (e) { console.error("Failed to load search_result.json", e); });
})();
