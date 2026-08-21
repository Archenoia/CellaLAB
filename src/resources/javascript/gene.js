/* gene.js — gene detail page */
(function () {
  "use strict";

  fetch("/resources/assets/api_demo/gene.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById("g-name").textContent = d.name + " (" + d.id + ")";
      document.getElementById("g-meta").innerHTML =
        "<span>Product: <b>" + d.product + "</b></span>" +
        "<span>Family: <b>" + d.family + "</b></span>";
      document.getElementById("g-func").textContent = d.function;

      // Sequence (formatted in blocks of 60)
      var seq = d.sequence || "";
      var formatted = "";
      for (var i = 0; i < seq.length; i += 60) {
        formatted += seq.slice(i, i + 60) + "\n";
      }
      document.getElementById("g-seq").textContent = formatted.trim();

      // PFAM domains (relative bar)
      var pfam = d.pfam || [];
      var maxEnd = pfam.reduce(function (m, p) { return Math.max(m, p.end); }, 1);
      var box = document.getElementById("g-pfam");
      pfam.forEach(function (p) {
        var row = document.createElement("div");
        row.className = "cl-pfam-row";
        var left = (p.start / maxEnd * 100).toFixed(1);
        var width = ((p.end - p.start) / maxEnd * 100).toFixed(1);
        row.innerHTML =
          '<span style="width:140px;" class="cl-mono">' + p.name + '</span>' +
          '<span class="cl-pfam-track"><span class="cl-pfam-seg" style="left:' + left + '%;width:' + width + '%;background:' + p.color + ';"></span></span>';
        box.appendChild(row);
      });

      // Associated lists
      function listInto(id, items, link, badge) {
        var el = document.getElementById(id);
        (items || []).forEach(function (it) {
          var a = document.createElement("a");
          a.className = "cl-result";
          a.href = link;
          var extra = it.role ? it.role : (it.cov ? "cov " + it.cov + "×" : "");
          a.innerHTML = '<div class="cl-result-top"><h4 style="font-size:14px;">' + it.name +
            '</h4><span class="cl-badge ' + badge + ' cl-result-cat">' + it.id + '</span></div>' +
            '<div class="cl-muted" style="font-size:12px;">' + extra + '</div>';
          el.appendChild(a);
        });
      }
      listInto("g-strains", d.strains, "/consortium", "cl-badge-blue");
      listInto("g-mags", d.metagenomes, "/metagenome", "cl-badge-green");
      listInto("g-cons", d.consortia, "/consortium", "cl-badge-blue");

      // Pathways
      var pw = document.getElementById("g-pathways");
      (d.pathways || []).forEach(function (p) {
        var a = document.createElement("a");
        a.className = "cl-result";
        a.href = "/pathway";
        a.innerHTML = '<div class="cl-result-top"><h4 style="font-size:15px;">' + p.name +
          '</h4><span class="cl-badge cl-badge-amber cl-result-cat">' + p.id + '</span></div>';
        pw.appendChild(a);
      });
    })
    .catch(function (e) { console.error("Failed to load gene.json", e); });
})();
