/* home.js — render homepage from /resources/assets/api_demo/home.json */
(function () {
  "use strict";

  var CAT = {
    consortium: "cl-badge-blue",
    metagenome: "cl-badge-green",
    pathway: "cl-badge-amber",
    pangenome: "cl-badge-violet",
    gene: "cl-badge-gray"
  };
  var LINK = {
    consortium: "/consortium",
    metagenome: "/metagenome",
    pathway: "/pathway",
    pangenome: "/pangenome",
    gene: "/gene"
  };

  fetch("/resources/assets/api_demo/home.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById("hero-title").textContent = d.db_full_name || d.db_name;
      document.getElementById("hero-tagline").textContent = d.tagline || "";
      document.getElementById("hero-intro").textContent = d.intro || "";
      document.getElementById("hero-tag").textContent = d.db_name + " · " + (d.tagline ? "Database" : "");

      // Stats
      var sr = document.getElementById("stat-row");
      (d.stats || []).forEach(function (s) {
        var col = document.createElement("div");
        col.className = "col-lg-2 col-md-4 col-6";
        col.innerHTML =
          '<div class="cl-stat"><div class="cl-stat-num">' + s.num.toLocaleString() + '</div>' +
          '<div class="cl-stat-label">' + s.label + (s.unit ? " (" + s.unit + ")" : "") + '</div></div>';
        sr.appendChild(col);
      });

      // Modules
      var mr = document.getElementById("module-row");
      (d.modules || []).forEach(function (m) {
        var col = document.createElement("div");
        col.className = "col-lg-3 col-md-6";
        col.innerHTML =
          '<a class="cl-card d-block" href="' + (LINK[m.key] || "#") + '">' +
            '<div class="cl-card-icon"><i class="bi ' + m.icon + ' fs-4"></i></div>' +
            '<h4>' + m.title + '</h4>' +
            '<p>' + m.desc + '</p>' +
            '<span class="cl-card-link">Explore</span>' +
          '</a>';
        mr.appendChild(col);
      });

      // Latest
      var lr = document.getElementById("latest-row");
      (d.latest || []).forEach(function (it) {
        var col = document.createElement("div");
        col.className = "col-lg-3 col-md-6";
        var badge = CAT[it.type] || "cl-badge-gray";
        var link = LINK[it.type] || "#";
        col.innerHTML =
          '<a class="cl-card d-block" href="' + link + '">' +
            '<span class="cl-badge ' + badge + '">' + it.type + '</span>' +
            '<h4 class="mt-2" style="font-size:16px;">' + it.name + '</h4>' +
            '<p>' + it.desc + '</p>' +
            '<div class="cl-muted" style="font-size:12px;margin-top:8px;">' + it.date + '</div>' +
          '</a>';
        lr.appendChild(col);
      });
    })
    .catch(function (e) {
      console.error("Failed to load home.json", e);
    });
})();
