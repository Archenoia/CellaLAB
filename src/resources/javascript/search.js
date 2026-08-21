/* search.js — render search box, hot suggestions, category entries */
(function () {
  "use strict";

  var CAT_BADGE = {
    consortium: "cl-badge-blue",
    species: "cl-badge-green",
    gene: "cl-badge-violet",
    metagenome: "cl-badge-green",
    enzyme: "cl-badge-amber",
    pathway: "cl-badge-amber",
    pangenome: "cl-badge-violet"
  };
  var CAT_LINK = {
    consortium: "/consortium",
    species: "/search_result?q=",
    gene: "/gene",
    metagenome: "/metagenome",
    enzyme: "/search_result?q=",
    pathway: "/pathway",
    pangenome: "/pangenome"
  };

  var input = document.getElementById("search-input");
  var suggest = document.getElementById("search-suggest");
  var goBtn = document.getElementById("search-go");

  function doSearch(term) {
    term = (term || input.value || "").trim();
    if (!term) { input.focus(); return; }
    window.location.href = "/search_result?q=" + encodeURIComponent(term);
  }

  goBtn.addEventListener("click", function () { doSearch(); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") doSearch();
  });

  fetch("/resources/assets/api_demo/search_hot.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      // Hot tags
      var hot = document.getElementById("hot-tags");
      (d.hot_searches || []).forEach(function (h) {
        var tag = document.createElement("span");
        tag.className = "cl-hot-tag";
        tag.textContent = h.term;
        tag.addEventListener("click", function () { doSearch(h.term); });
        hot.appendChild(tag);
      });

      // Suggest dropdown
      function renderSuggest(q) {
        var list = (d.hot_searches || []).filter(function (h) {
          return !q || h.term.toLowerCase().indexOf(q.toLowerCase()) !== -1;
        });
        suggest.innerHTML = "";
        if (!list.length) { suggest.classList.remove("show"); return; }
        list.slice(0, 12).forEach(function (h) {
          var item = document.createElement("div");
          item.className = "cl-suggest-item";
          item.innerHTML = '<span>' + h.term + '</span>' +
            '<span class="cl-badge ' + (CAT_BADGE[h.cat] || "cl-badge-gray") + ' cl-suggest-cat">' + h.cat + '</span>';
          item.addEventListener("click", function () { doSearch(h.term); });
          suggest.appendChild(item);
        });
        suggest.classList.add("show");
      }

      input.addEventListener("focus", function () { renderSuggest(input.value); });
      input.addEventListener("input", function () { renderSuggest(input.value); });
      document.addEventListener("click", function (e) {
        if (!suggest.contains(e.target) && e.target !== input) suggest.classList.remove("show");
      });

      // Category cards
      var cr = document.getElementById("cat-row");
      (d.categories || []).forEach(function (c) {
        var col = document.createElement("div");
        col.className = "col-lg-4 col-md-6";
        col.innerHTML =
          '<a class="cl-card d-block" href="' + (CAT_LINK[c.key] || "#") + '">' +
            '<h4>' + c.label + '</h4>' +
            '<p>Browse ' + c.label.toLowerCase() + ' records curated in Cella LAB.</p>' +
            '<span class="cl-card-link">Open</span>' +
          '</a>';
        cr.appendChild(col);
      });
    })
    .catch(function (e) { console.error("Failed to load search_hot.json", e); });
})();
