/* pangenome.js — pangenome analysis detail page */
(function () {
  "use strict";

  var CAT_COLOR = {
    core: "#1F4E79",
    soft_core: "#2E7D5B",
    shell: "#C77D3A",
    cloud: "#8E44AD"
  };
  var CAT_BADGE = {
    core: "cl-badge-blue",
    soft_core: "cl-badge-green",
    shell: "cl-badge-amber",
    cloud: "cl-badge-violet"
  };

  fetch("/resources/assets/api_demo/pangenome.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById("p-name").textContent = d.name + " (" + d.id + ")";
      document.getElementById("p-meta").innerHTML =
        "<span>Taxon: <b>" + d.taxon + "</b></span>" +
        "<span>Genomes: <b>" + d.genomes + "</b></span>" +
        "<span>Core threshold: <b>" + d.core_threshold + "</b></span>";

      // Family composition donut
      var fc = d.family_counts || {};
      var pieData = Object.keys(fc).map(function (k) {
        return { name: k.replace("_", " "), value: fc[k], itemStyle: { color: CAT_COLOR[k] } };
      });
      CLCharts.pie("p-pie", pieData, { donut: true, name: "Gene families" });

      // Pangenome curve
      var c = d.curve || {};
      CLCharts.line("p-curve", c.x, [
        { name: "Pangenome", data: c.pan_genome, color: "#1F4E79" },
        { name: "Core genome", data: c.core_genome, color: "#C77D3A" }
      ], { legend: { show: true } });

      // PAV heatmap
      CLCharts.heatmap("p-pav", d.pav.samples, d.pav.genes, d.pav.matrix);

      // SV table
      var tb = document.getElementById("p-sv");
      (d.sv || []).forEach(function (s) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td class='cl-mono'>" + s.id + "</td><td>" + s.type +
          "</td><td class='cl-mono'>" + s.chr + ":" + s.start + "-" + s.end +
          "</td><td>" + s.size + "</td><td>" + s.genes + "</td>";
        tb.appendChild(tr);
      });

      // Synteny as a simple heatmap-like scatter alignment
      var syn = d.synteny || {};
      var synData = (syn.links || []).map(function (l) { return [l[1], l[0]]; });
      (function () {
        var chart = echarts.init(document.getElementById("p-synteny"));
        chart.setOption({
          grid: { left: 60, right: 20, top: 30, bottom: 40, containLabel: true },
          tooltip: { trigger: "item", formatter: function (p) {
            return "Ref " + syn.ref[p.data[1]] + " ↔ Query " + syn.query[p.data[0]];
          } },
          xAxis: { type: "category", data: syn.query, axisLabel: { rotate: 45, fontSize: 10, color: "#5A5A5A" }, axisLine: { lineStyle: { color: "#B9B2A0" } } },
          yAxis: { type: "category", data: syn.ref, axisLabel: { fontSize: 10, color: "#5A5A5A" }, axisLine: { lineStyle: { color: "#B9B2A0" } } },
          series: [{ type: "scatter", data: synData, symbolSize: 12, itemStyle: { color: "#1F4E79" } }]
        });
        window.addEventListener("resize", function () { chart.resize(); });
      })();

      // Family details
      var fam = document.getElementById("p-fam");
      (d.family_detail || []).forEach(function (f) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td class='cl-mono'>" + f.family + "</td><td>" + f.name +
          "</td><td><span class='cl-badge " + (CAT_BADGE[f.category] || "cl-badge-gray") + "'>" + f.category + "</span></td>" +
          "<td>" + f.count + "</td><td class='cl-mono'>" + f.representative + "</td>";
        fam.appendChild(tr);
      });
    })
    .catch(function (e) { console.error("Failed to load pangenome.json", e); });
})();
