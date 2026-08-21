/* consortium.js — synthetic consortium detail page */
(function () {
  "use strict";

  var REL_COLOR = {
    antagonism: "#C0392B",
    complement: "#2E7D5B",
    compete: "#B8860B",
    crossfeed: "#1F4E79",
    produce: "#8E44AD",
    consume: "#5B8C5A"
  };

  fetch("/resources/assets/api_demo/consortium.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById("c-name").textContent = d.name + " (" + d.id + ")";
      document.getElementById("c-meta").innerHTML =
        "<span>Function: <b>" + d.function + "</b></span>" +
        "<span>Strains: <b>" + d.strains + "</b></span>" +
        "<span>Environment: <b>" + d.environment + "</b></span>" +
        "<span>Source: <b>" + d.source + "</b></span>";
      document.getElementById("c-desc").textContent = d.description;

      // Composition pie
      var comp = (d.composition || []).map(function (c) { return { name: c.name, value: c.abundance }; });
      CLCharts.pie("c-comp", comp, { donut: true, name: "Composition" });

      // 3D UMAP
      var pts = (d.umap || []).map(function (p) {
        return { value: [p.x, p.y, p.z], name: p.name };
      });
      CLCharts.scatter3d("c-umap", pts, { showLabel: true });

      // Network
      var nodes = (d.network.nodes || []).map(function (n) {
        var isStrain = n.cat === "strain";
        return {
          id: n.id, name: n.label, label: n.label,
          symbolSize: isStrain ? 26 : 14,
          itemStyle: { color: isStrain ? "#1F4E79" : "#C77D3A" },
          category: n.cat
        };
      });
      var links = (d.network.links || []).map(function (l) {
        return { source: l.source, target: l.target, relation: l.relation,
          lineStyle: { color: REL_COLOR[l.relation] || "#B9B2A0" } };
      });
      CLCharts.graph("c-net", nodes, links, { layout: "force" });

      // Legend
      var lg = document.getElementById("c-legend");
      (d.relation_legend || []).forEach(function (r) {
        var it = document.createElement("span");
        it.className = "cl-legend-item";
        it.innerHTML = '<span class="cl-line" style="border-color:' + r.color + '"></span>' + r.label;
        lg.appendChild(it);
      });

      // Strains table
      var tb = document.getElementById("c-strains");
      (d.composition || []).forEach(function (s) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + s.name + "</td><td>" + s.abundance + "</td><td>" + s.role + "</td>";
        tb.appendChild(tr);
      });
    })
    .catch(function (e) { console.error("Failed to load consortium.json", e); });
})();
