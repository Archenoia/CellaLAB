/* pathway.js — metabolic network, upstream/downstream, gene/metabolite/reaction tables, associations */
(function () {
  "use strict";
  CellaApp.initLayout("pathway");

  var id = CellaApp.getQueryParam("id") || "PWY-567";
  var data = null;

  document.getElementById("breadcrumb").innerHTML =
    '<a href="index.html">首页</a><span class="sep">/</span>' +
    '<a href="pathway.html">通路</a><span class="sep">/</span>' + CellaApp.esc(id);

  CellaApp.fetchJSON("data/api/pathway/" + id + ".json").then(function (d) {
    data = d;
    renderHead(d);
    renderNetwork(d);
    renderLinkList("upstream", d.upstream);
    renderLinkList("downstream", d.downstream);
    renderGeneTable(d);
    renderMetaboliteTable(d);
    renderReactionTable(d);
    renderAssoc("assoc-consort", d.associated_consorts, "consortium");
    renderAssoc("assoc-sample", d.associated_samples, "metagenome");
  }).catch(function (e) { CellaApp.showError("detail-head", e.message); });

  function renderHead(d) {
    document.getElementById("detail-head").innerHTML =
      '<div class="detail-head">' +
        "<h1>" + CellaApp.esc(d.name) + "</h1>" +
        '<div class="btn-row" style="margin-bottom:8px"><span class="badge-cat pathway">代谢通路</span>' +
          '<span class="tag">' + CellaApp.esc(d.class) + "</span></div>" +
        '<div class="meta"><div><b>通路编号</b> ' + CellaApp.esc(d.pathway_id) + "</div>" +
          "<div><b>类别</b> " + CellaApp.esc(d.class) + "</div></div>" +
        '<p class="muted" style="margin-top:10px">' + CellaApp.esc(d.description) + "</p>" +
      "</div>";
  }

  function renderNetwork(d) {
    var chart = CellaApp.makeChart("chart-net");
    var nodeData = d.network.nodes.map(function (n) {
      var isMeta = n.type === "metabolite";
      return {
        id: n.id, name: n.name,
        symbol: isMeta ? "circle" : "roundRect",
        symbolSize: isMeta ? 46 : 60,
        itemStyle: { color: isMeta ? "#20558a" : "#c1873b", borderColor: "#14375f", borderWidth: 1 },
        label: { show: true, fontSize: 11, color: "#fff" }
      };
    });
    var links = d.network.edges.map(function (e) {
      return { source: e.source, target: e.target,
        lineStyle: { color: "#3a8f5f", width: 1.5, curveness: 0.1 },
        label: { show: false } };
    });
    chart.setOption({
      tooltip: { formatter: function (p) { return p.data.name || p.data.id; } },
      legend: { show: false },
      series: [{ type: "graph", layout: "force", roam: true, force: { repulsion: 200, edgeLength: 110 },
        label: { show: true }, emphasis: { focus: "adjacency" }, data: nodeData, links: links }]
    });
  }

  function renderLinkList(domId, list) {
    var html = list.length ? list.map(function (p) {
      return '<div style="padding:9px 12px;border-bottom:1px solid #ececE6">' +
        '<a href="pathway.html?id=' + p.pathway_id + '">' + CellaApp.esc(p.name) + "</a>" +
        ' <span class="small muted">' + CellaApp.esc(p.pathway_id) + "</span></div>";
    }).join("") : '<div class="loading">暂无关联</div>';
    document.getElementById(domId).innerHTML = html;
  }

  function renderGeneTable(d) {
    var cols = [
      { key: "gene_id", title: "基因 ID", render: function (r) { return '<a href="gene.html?id=' + r.gene_id + '">' + r.gene_id + "</a>"; } },
      { key: "product", title: "产物" },
      { key: "reaction", title: "参与反应" }
    ];
    CellaApp.renderTable("gene-table", cols, d.genes);
  }

  function renderMetaboliteTable(d) {
    var cols = [
      { key: "metabolite_id", title: "代谢物 ID" },
      { key: "name", title: "名称" },
      { key: "formula", title: "化学式", render: function (r) { return '<span class="mono">' + CellaApp.esc(r.formula) + "</span>"; } }
    ];
    CellaApp.renderTable("metabolite-table", cols, d.metabolites);
  }

  function renderReactionTable(d) {
    var cols = [
      { key: "reaction_id", title: "反应 ID" },
      { key: "name", title: "反应式" },
      { key: "enzyme", title: "酶 / EC" }
    ];
    CellaApp.renderTable("reaction-table", cols, d.reactions);
  }

  function renderAssoc(domId, list, type) {
    var html = list.length ? list.map(function (x) {
      return '<div style="padding:9px 12px;border-bottom:1px solid #ececE6">' +
        '<a href="' + CellaApp.linkTo(type, x[type + "_id"]) + '">' + CellaApp.esc(x.name) + "</a>" +
        ' <span class="small muted">' + CellaApp.esc(x[type + "_id"]) + "</span></div>";
    }).join("") : '<div class="loading">暂无关联</div>';
    document.getElementById(domId).innerHTML = html;
  }
})();
