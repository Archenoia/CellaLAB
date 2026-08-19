/* pangenome.js — family proportions, pan/core curve, PAV heatmap, SV dist, synteny, tables */
(function () {
  "use strict";
  CellaApp.initLayout("pangenome");

  var id = CellaApp.getQueryParam("id") || "PAN001";
  var data = null, famChart = null;
  var FAM_COLORS = { core: "#14375f", soft_core: "#3a7f8f", shell: "#c1873b", cloud: "#b5b5ad" };
  var FAM_LABELS = { core: "核心基因", soft_core: "软核心基因", shell: "壳基因", cloud: "云基因" };

  document.getElementById("breadcrumb").innerHTML =
    '<a href="index.html">首页</a><span class="sep">/</span>' +
    '<a href="pangenome.html">泛基因组</a><span class="sep">/</span>' + CellaApp.esc(id);

  CellaApp.fetchJSON("data/api/pangenome/" + id + ".json").then(function (d) {
    data = d;
    renderHead(d);
    renderFamily("pie");
    renderCurve(d);
    renderPAV(d);
    renderSV(d);
    renderSynteny(d);
    renderSVTable(d);
    renderFamilyTable(d);
  }).catch(function (e) { CellaApp.showError("detail-head", e.message); });

  function renderHead(d) {
    document.getElementById("detail-head").innerHTML =
      '<div class="detail-head">' +
        "<h1>" + CellaApp.esc(d.name) + "</h1>" +
        '<div class="btn-row" style="margin-bottom:8px"><span class="badge-cat pangenome" style="background:#1a5276">泛基因组</span>' +
          '<span class="tag">' + CellaApp.esc(d.scope) + "</span></div>" +
        '<div class="meta">' +
          "<div><b>分析编号</b> " + CellaApp.esc(d.pangenome_id) + "</div>" +
          "<div><b>基因组数</b> " + d.n_genomes + "</div>" +
          "<div><b>基因家族数</b> " + d.n_gene_families.toLocaleString() + "</div>" +
          "<div><b>来源</b> " + CellaApp.esc(d.source) + "</div>" +
        "</div>" +
      "</div>";
  }

  function famData() {
    return Object.keys(data.family_counts).map(function (k) {
      return { name: FAM_LABELS[k], value: data.family_counts[k], itemStyle: { color: FAM_COLORS[k] } };
    });
  }
  function renderFamily(type) {
    if (!famChart) famChart = CellaApp.makeChart("chart-fam");
    if (type === "pie") {
      famChart.setOption({
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: { bottom: 0 },
        series: [{ type: "pie", radius: ["35%", "62%"], center: ["50%", "46%"],
          itemStyle: { borderColor: "#fff", borderWidth: 1 }, label: { fontSize: 11 }, data: famData() }]
      }, true);
    } else {
      var entries = Object.keys(data.family_counts);
      famChart.setOption({
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: 90, right: 40, top: 24, bottom: 30 },
        xAxis: { type: "value", name: "基因家族数" },
        yAxis: { type: "category", data: entries.map(function (k) { return FAM_LABELS[k]; }).reverse() },
        series: [{ type: "bar", barWidth: "55%", data: entries.map(function (k) {
          return { value: data.family_counts[k], itemStyle: { color: FAM_COLORS[k], borderColor: "#14375f", borderWidth: 1 } };
        }).reverse() }]
      }, true);
    }
  }
  document.getElementById("btn-pie").addEventListener("click", function () { renderFamily("pie"); });
  document.getElementById("btn-bar").addEventListener("click", function () { renderFamily("bar"); });

  function renderCurve(d) {
    var chart = CellaApp.makeChart("chart-curve");
    var c = d.curve;
    chart.setOption({
      tooltip: { trigger: "axis" },
      legend: { top: 0, data: ["泛基因组 (pan)", "核心基因 (core)"] },
      grid: { left: 60, right: 60, top: 44, bottom: 44 },
      xAxis: { type: "category", name: "基因组数", data: c.genomes, boundaryGap: false },
      yAxis: [
        { type: "value", name: "Pan 基因数", position: "left" },
        { type: "value", name: "Core 基因数", position: "right", splitLine: { show: false } }
      ],
      series: [
        { name: "泛基因组 (pan)", type: "line", smooth: true, symbol: "circle", yAxisIndex: 0,
          lineStyle: { color: "#20558a", width: 2 }, itemStyle: { color: "#20558a" }, data: c.pangenome },
        { name: "核心基因 (core)", type: "line", smooth: true, symbol: "circle", yAxisIndex: 1,
          lineStyle: { color: "#8f3a3a", width: 2 }, itemStyle: { color: "#8f3a3a" }, data: c.core }
      ]
    });
  }

  function renderPAV(d) {
    var chart = CellaApp.makeChart("chart-pav");
    var p = d.pav;
    var rows = [];
    for (var i = 0; i < p.families.length; i++) {
      for (var j = 0; j < p.genomes.length; j++) {
        rows.push([j, i, p.matrix[i][j]]);
      }
    }
    chart.setOption({
      tooltip: { position: "top", formatter: function (pp) {
        return p.families[pp.data[1]] + " / " + p.genomes[pp.data[0]] + "：" + (pp.data[2] ? "存在" : "缺失");
      } },
      grid: { left: 80, right: 20, top: 20, bottom: 70 },
      xAxis: { type: "category", data: p.genomes, splitArea: { show: true }, axisLabel: { fontSize: 11 } },
      yAxis: { type: "category", data: p.families, splitArea: { show: true }, axisLabel: { fontSize: 11 } },
      visualMap: { min: 0, max: 1, show: false, inRange: { color: ["#ffffff", "#20558a"] } },
      series: [{ type: "heatmap", data: rows,
        itemStyle: { borderColor: "#f5f5f2", borderWidth: 1 },
        emphasis: { itemStyle: { borderColor: "#14375f", borderWidth: 1 } } }]
    });
  }

  function renderSV(d) {
    var chart = CellaApp.makeChart("chart-sv");
    var palette = ["#8f3a3a", "#3a8f5f", "#c1873b", "#5f5f8f"];
    chart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 90, right: 20, top: 20, bottom: 30 },
      xAxis: { type: "value", name: "数量" },
      yAxis: { type: "category", data: d.sv_type_counts.map(function (s) { return s.type; }).reverse() },
      series: [{ type: "bar", barWidth: "55%", data: d.sv_type_counts.map(function (s, i) {
        return { value: s.count, itemStyle: { color: palette[i % palette.length], borderColor: "#14375f", borderWidth: 1 } };
      }).reverse() }]
    });
  }

  function renderSynteny(d) {
    var chart = CellaApp.makeChart("chart-synteny");
    var syn = d.collinearity;
    var trackY = { A: 20, B: 64 };
    var blocks = [];
    syn.trackA.forEach(function (b) { blocks.push({ id: b.id, type: "A", start: b.start, end: b.end, label: b.label }); });
    syn.trackB.forEach(function (b) { blocks.push({ id: b.id, type: "B", start: b.start, end: b.end, label: b.label }); });
    var map = {}; blocks.forEach(function (b) { map[b.id] = b; });

    // Build renderItem data: gene blocks first, then links
    var rectData = blocks.map(function (b) {
      return { id: b.id, type: b.type, start: b.start, end: b.end, label: b.label };
    });
    var linkData = syn.links.map(function (l) {
      var a = map[l.from], b = map[l.to];
      return { from: l.from, to: l.to, x1: (a.start + a.end) / 2, x2: (b.start + b.end) / 2 };
    });
    var maxCoord = 84;

    chart.setOption({
      tooltip: { show: false },
      xAxis: { type: "value", min: 0, max: maxCoord, show: false },
      yAxis: { type: "value", min: 0, max: 80, show: false },
      grid: { left: 8, right: 8, top: 22, bottom: 8 },
      series: [{
        type: "custom",
        renderItem: function (params, api) {
          var di = params.dataIndex;
          if (di < rectData.length) {
            var r = rectData[di];
            return {
              type: "rect",
              shape: { x: r.start, y: trackY[r.type], width: r.end - r.start, height: 12 },
              style: { fill: r.type === "A" ? "#20558a" : "#3a8f5f" },
              children: [{ type: "text", style: { text: r.label, x: r.start, y: trackY[r.type] - 4, fontSize: 11, fill: "#2b2b2b", textVerticalAlign: "bottom" } }]
            };
          }
          var ln = linkData[di - rectData.length];
          return {
            type: "line",
            shape: { x1: ln.x1, y1: trackY.A + 12, x2: ln.x2, y2: trackY.B },
            style: { stroke: "#c1873b", lineWidth: 1.2 }
          };
        },
        data: rectData.concat(linkData)
      }]
    });
  }

  function renderSVTable(d) {
    var cols = [
      { key: "sv_id", title: "SV ID" },
      { key: "type", title: "类型" },
      { key: "length", title: "长度 (bp)", num: true, render: function (r) { return r.length.toLocaleString(); } },
      { key: "region", title: "区域" },
      { key: "genomes_affected", title: "受影响基因组数", num: true }
    ];
    CellaApp.renderTable("sv-table", cols, d.sv);
  }

  function renderFamilyTable(d) {
    var cols = [
      { key: "family_id", title: "家族 ID" },
      { key: "category", title: "分类", render: function (r) { return '<span class="tag" style="border-color:' + FAM_COLORS[r.category] + '">' + FAM_LABELS[r.category] + "</span>"; } },
      { key: "size", title: "家族大小", num: true },
      { key: "representative", title: "代表基因", render: function (r) { return '<a href="gene.html?id=' + r.representative + '">' + r.representative + "</a>"; } },
      { key: "function", title: "功能注释" }
    ];
    CellaApp.renderTable("family-table", cols, d.families);
  }
})();
