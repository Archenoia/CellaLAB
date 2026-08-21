/* metagenome.js — metagenome sample detail page */
(function () {
  "use strict";

  fetch("/resources/assets/api_demo/metagenome.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById("m-name").textContent = d.name + " (" + d.id + ")";
      document.getElementById("m-meta").innerHTML =
        "<span>Environment: <b>" + d.environment + "</b></span>" +
        "<span>Location: <b>" + d.location + "</b></span>" +
        "<span>Sample date: <b>" + d.sample_date + "</b></span>" +
        "<span>Sequencing: <b>" + d.depth + " " + d.depth_unit + "</b></span>" +
        "<span>MAGs: <b>" + d.mags_count + "</b></span>" +
        "<span>pH: <b>" + d.ph + "</b></span>";

      // Composition
      var comp = (d.composition || []).map(function (c) { return { name: c.name, value: c.abundance }; });
      CLCharts.pie("m-comp", comp, { name: "Phylum" });

      // MAGs tree
      CLCharts.tree("m-tree", d.mags_tree);

      // Wordcloud
      CLCharts.wordcloud("m-word", d.wordcloud);

      // Genes table
      var tb = document.getElementById("m-genes");
      (d.genes || []).forEach(function (g) {
        var tr = document.createElement("tr");
        tr.innerHTML = '<td class="cl-mono">' + g.name + '</td><td>' + g.product +
          '</td><td class="cl-mono">' + g.mag + '</td><td>' + g.cov + '</td>';
        tb.appendChild(tr);
      });

      // Pathways
      var pw = document.getElementById("m-pathways");
      (d.pathways || []).forEach(function (p) {
        var a = document.createElement("a");
        a.className = "cl-result";
        a.href = "/pathway";
        a.innerHTML = '<div class="cl-result-top"><h4>' + p.name + '</h4>' +
          '<span class="cl-badge cl-badge-amber">' + p.genes + ' genes</span></div>';
        pw.appendChild(a);
      });
    })
    .catch(function (e) { console.error("Failed to load metagenome.json", e); });
})();
