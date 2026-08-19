/* metagenome.js — composition pie/bar, MAGs cluster tree, gene/pathway tables, keyword wordcloud */
(function () {
  "use strict";
  CellaApp.initLayout("metagenome");

  var id = CellaApp.getQueryParam("id") || "MGS001";
  var data = null, compChart = null;

  document.getElementById("breadcrumb").innerHTML =
    '<a href="index.html">首页</a><span class="sep">/</span>' +
    '<a href="metagenome.html">宏基因组</a><span class="sep">/</span>' + CellaApp.esc(id);

  CellaApp.fetchJSON("data/api/metagenome/" + id + ".json").then(function (d) {
    data = d;
    renderHead(d);
    renderComposition("pie");
    renderTree(d);
    renderGeneTable(d);
    renderPathwayTable(d);
    renderWordCloud(d);
  }).catch(function (e) { CellaApp.showError("detail-head", e.message); });

  function renderHead(d) {
    document.getElementById("detail-head").innerHTML =
      '<div class="detail-head">' +
        "<h1>" + CellaApp.esc(d.name) + "</h1>" +
        '<div class="btn-row" style="margin-bottom:8px"><span class="badge-cat sample">宏基因组样本</span>' +
          '<span class="tag">' + CellaApp.esc(d.environment) + "</span></div>" +
        '<div class="meta">' +
          "<div><b>样本编号</b> " + CellaApp.esc(d.sample_id) + "</div>" +
          "<div><b>宿主/来源</b> " + CellaApp.esc(d.host) + "</div>" +
          "<div><b>采样地点</b> " + CellaApp.esc(d.location) + "</div>" +
          "<div><b>采样日期</b> " + CellaApp.esc(d.collection_date) + "</div>" +
          "<div><b>测序平台</b> " + CellaApp.esc(d.sequencing_platform) + "</div>" +
          "<div><b>读长数</b> " + d.read_count.toLocaleString() + "</div>" +
          "<div><b>MAGs 数</b> " + d.n_mags + "</div>" +
          "<div><b>来源</b> " + CellaApp.esc(d.source) + "</div>" +
        "</div>" +
      "</div>";
  }

  function compOption(type) {
    if (type === "pie") {
      return {
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: { bottom: 0, type: "scroll", textStyle: { fontSize: 11 } },
        series: [{ type: "pie", radius: ["35%", "62%"], center: ["50%", "46%"],
          itemStyle: { borderColor: "#fff", borderWidth: 1 }, label: { fontSize: 11 },
          data: data.composition.map(function (c) { return { name: c.name, value: c.abundance }; }) }]
      };
    }
    var cats = data.composition.map(function (c) { return c.name; });
    var vals = data.composition.map(function (c) { return c.abundance; });
    return {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: "{b}: {c}" },
      grid: { left: 120, right: 40, top: 30, bottom: 30 },
      xAxis: { type: "value", name: "相对丰度" },
      yAxis: { type: "category", data: cats.slice().reverse(), axisLabel: { fontSize: 11 } },
      series: [{ type: "bar", barWidth: "60%", itemStyle: { color: "#20558a", borderColor: "#14375f", borderWidth: 1 },
        data: vals.slice().reverse() }]
    };
  }
  function renderComposition(type) {
    if (!compChart) compChart = CellaApp.makeChart("chart-comp");
    compChart.setOption(compOption(type), true);
  }
  document.getElementById("btn-pie").addEventListener("click", function () { renderComposition("pie"); });
  document.getElementById("btn-bar").addEventListener("click", function () { renderComposition("bar"); });

  function renderTree(d) {
    var chart = CellaApp.makeChart("chart-tree");
    chart.setOption({
      tooltip: { trigger: "item", formatter: function (p) { return p.name; } },
      series: [{
        type: "tree", layout: "orthogonal", orient: "LR",
        data: [d.cluster_tree], top: "2%", left: "8%", bottom: "2%", right: "18%",
        symbolSize: 9, initialTreeDepth: 2,
        label: { position: "right", fontSize: 11, color: "#2b2b2b" },
        leaves: { label: { position: "right", fontSize: 11 } },
        lineStyle: { color: "#b5b5ad", width: 1.2, curveness: 0 },
        itemStyle: { color: "#20558a", borderColor: "#14375f" },
        expandAndCollapse: true, animationDuration: 400
      }]
    });
  }

  function renderGeneTable(d) {
    var cols = [
      { key: "gene_id", title: "基因 ID", render: function (r) { return '<a href="gene.html?id=' + r.gene_id + '">' + r.gene_id + "</a>"; } },
      { key: "product", title: "注释产物" },
      { key: "taxon", title: "分类" },
      { key: "pathway", title: "通路", render: function (r) { return '<a href="pathway.html?id=' + r.pathway + '">' + r.pathway + "</a>"; } }
    ];
    CellaApp.renderTable("gene-table", cols, d.genes);
  }

  function renderPathwayTable(d) {
    var cols = [
      { key: "pathway_id", title: "通路 ID", render: function (r) { return '<a href="pathway.html?id=' + r.pathway_id + '">' + r.pathway_id + "</a>"; } },
      { key: "name", title: "名称" },
      { key: "coverage", title: "注释覆盖度", num: true, render: function (r) { return (r.coverage * 100).toFixed(0) + "%"; } }
    ];
    CellaApp.renderTable("pathway-table", cols, d.pathways);
  }

  function renderWordCloud(d) {
    var chart = CellaApp.makeChart("chart-word");
    chart.setOption({
      tooltip: { show: true },
      series: [{
        type: "wordCloud", shape: "circle", sizeRange: [14, 56], rotationRange: [-45, 45],
        gridSize: 8, width: "100%", height: "100%",
        textStyle: { color: function () {
          var c = ["#20558a", "#3a8f5f", "#c1873b", "#8f3a3a", "#5f5f8f", "#3a7f8f"];
          return c[Math.floor(Math.random() * c.length)];
        } },
        data: d.keywords.map(function (k) { return { name: k.name, value: k.value }; })
      }]
    });
  }
})();
