/* consortium.js — composition pie/bar, 3D UMAP scatter, cross-feeding network, strain table */
(function () {
  "use strict";
  CellaApp.initLayout("consortium");

  var id = CellaApp.getQueryParam("id") || "COD001";
  var data = null, compChart = null;

  document.getElementById("breadcrumb").innerHTML =
    '<a href="index.html">首页</a><span class="sep">/</span>' +
    '<a href="consortium.html">合成菌群</a><span class="sep">/</span>' + CellaApp.esc(id);

  CellaApp.fetchJSON("data/api/consortium/" + id + ".json").then(function (d) {
    data = d;
    renderHead(d);
    renderComposition("pie");
    renderUMAP(d);
    renderNetwork(d);
    renderStrainTable(d);
    document.getElementById("func-desc").textContent = d.description;
  }).catch(function (e) { CellaApp.showError("detail-head", e.message); });

  function renderHead(d) {
    document.getElementById("detail-head").innerHTML =
      '<div class="detail-head">' +
        '<h1>' + CellaApp.esc(d.name) + "</h1>" +
        '<div class="btn-row" style="margin-bottom:8px">' +
          '<span class="badge-cat consortium">合成菌群</span>' +
          '<span class="tag">' + CellaApp.esc(d.function) + "</span>" +
        "</div>" +
        '<div class="meta">' +
          "<div><b>编号</b> " + CellaApp.esc(d.consortium_id) + "</div>" +
          "<div><b>菌株数</b> " + d.n_strains + "</div>" +
          "<div><b>来源</b> " + CellaApp.esc(d.source) + "</div>" +
          "<div><b>设计依据</b> " + CellaApp.esc(d.design_basis) + "</div>" +
        "</div>" +
      "</div>";
  }

  function compOption(type) {
    var cats = data.composition.map(function (c) { return c.name; });
    var vals = data.composition.map(function (c) { return c.abundance; });
    if (type === "pie") {
      return {
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: { bottom: 0, type: "scroll", textStyle: { fontSize: 11 } },
        series: [{ type: "pie", radius: ["35%", "62%"], center: ["50%", "46%"],
          itemStyle: { borderColor: "#fff", borderWidth: 1 },
          label: { fontSize: 11 },
          data: data.composition.map(function (c) { return { name: c.name, value: c.abundance }; }) }]
      };
    }
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: "{b}: {c}" },
      grid: { left: 180, right: 40, top: 30, bottom: 30 },
      xAxis: { type: "value", name: "相对丰度" },
      yAxis: { type: "category", data: cats.slice().reverse(), axisLabel: { fontSize: 11 } },
      series: [{ type: "bar", barWidth: "60%",
        itemStyle: { color: "#20558a", borderColor: "#14375f", borderWidth: 1 },
        data: vals.slice().reverse() }]
    };
  }

  function renderComposition(type) {
    if (!compChart) compChart = CellaApp.makeChart("chart-comp");
    compChart.setOption(compOption(type), true);
  }
  document.getElementById("btn-pie").addEventListener("click", function () { renderComposition("pie"); });
  document.getElementById("btn-bar").addEventListener("click", function () { renderComposition("bar"); });

  function renderUMAP(d) {
    var chart = CellaApp.makeChart("chart-umap");
    var funcs = {};
    d.umap.points.forEach(function (p) { funcs[p.function] = 1; });
    var palette = ["#20558a", "#3a8f5f", "#c1873b", "#8f3a3a", "#5f5f8f", "#3a7f8f"];
    var funcList = Object.keys(funcs);
    var series = funcList.map(function (fn, i) {
      return {
        type: "scatter3D",
        name: fn,
        symbolSize: function (val, params) { return 8 + (params.data[3] || 0) * 40; },
        itemStyle: { color: palette[i % palette.length] },
        data: d.umap.points.filter(function (p) { return p.function === fn; })
          .map(function (p) { return [p.coords[0], p.coords[1], p.coords[2], p.abundance, p.strain_id]; })
      };
    });
    chart.setOption({
      tooltip: { formatter: function (p) { return p.data[4] + "<br/>" + p.seriesName + "<br/>丰度 " + p.data[3]; } },
      legend: { top: 0 },
      xAxis3D: { type: "value", name: "UMAP-1" },
      yAxis3D: { type: "value", name: "UMAP-2" },
      zAxis3D: { type: "value", name: "UMAP-3" },
      grid3D: { boxWidth: 90, boxDepth: 90, boxHeight: 90, viewControl: { distance: 180 },
        axisLine: { lineStyle: { color: "#b5b5ad" } },
        splitLine: { lineStyle: { color: "#ececE6" } },
        axisPointer: { lineStyle: { color: "#d8d8d2" } } },
      series: series
    });
  }

  var REL = {
    antagonism:   { color: "#8f3a3a", type: "solid",  label: "拮抗" },
    complementary:{ color: "#3a8f5f", type: "solid",  label: "营养互补" },
    competition:  { color: "#c1873b", type: "solid",  label: "营养竞争" },
    biosynthesis: { color: "#3a7f8f", type: "dashed", label: "跨菌株生物合成" }
  };

  function renderNetwork(d) {
    var chart = CellaApp.makeChart("chart-net");
    var nodes = {}, links = [];
    d.strains.forEach(function (s) { nodes[s.strain_id] = s; });
    d.interactions.forEach(function (it) {
      var r = REL[it.type] || REL.complementary;
      links.push({
        source: it.from, target: it.to,
        lineStyle: { color: r.color, type: r.type, width: 2, curveness: 0.18 },
        label: { show: true, formatter: it.metabolite, fontSize: 10, color: "#5a5a5a" }
      });
    });
    var nodeData = d.strains.map(function (s) {
      return { id: s.strain_id, name: s.strain_id, value: s.abundance,
        symbolSize: 14 + s.abundance * 40,
        itemStyle: { color: "#20558a", borderColor: "#14375f", borderWidth: 1 },
        label: { show: true, formatter: s.strain_id + "\n" + s.species, fontSize: 10 } };
    });
    chart.setOption({
      tooltip: { formatter: function (p) {
        if (p.dataType === "edge") return p.data.source + " → " + p.data.target + "<br/>" + p.data.label.formatter;
        return p.data.name;
      } },
      series: [{
        type: "graph", layout: "force", roam: true,
        force: { repulsion: 220, edgeLength: 120 },
        edgeLabel: { show: false },
        emphasis: { focus: "adjacency" },
        data: nodeData, links: links
      }]
    });
  }

  function renderStrainTable(d) {
    var cols = [
      { key: "strain_id", title: "菌株 ID" },
      { key: "species", title: "物种", render: function (r) { return CellaApp.esc(r.species); } },
      { key: "phylum", title: "门" },
      { key: "abundance", title: "相对丰度", num: true, render: function (r) { return (r.abundance * 100).toFixed(1) + "%"; } },
      { key: "role", title: "功能角色" },
      { key: "metabolism", title: "代谢类别" }
    ];
    CellaApp.renderTable("strain-table", cols, d.strains);
  }
})();
