/* gene.js — PFAM domain bar, FASTA colored, associations, pathways */
(function () {
  "use strict";
  CellaApp.initLayout("gene");

  var id = CellaApp.getQueryParam("id") || "GENE001";
  var data = null;
  var FAM_COLORS = ["#20558a", "#3a8f5f", "#c1873b", "#8f3a3a", "#5f5f8f", "#3a7f8f"];

  document.getElementById("breadcrumb").innerHTML =
    '<a href="index.html">首页</a><span class="sep">/</span>' +
    '<a href="search.html">搜索</a><span class="sep">/</span>基因 ' + CellaApp.esc(id);

  CellaApp.fetchJSON("data/api/gene/" + id + ".json").then(function (d) {
    data = d;
    renderHead(d);
    renderPfam(d);
    renderFasta(d);
    renderAssocs(d);
    renderPathwayTable(d);
  }).catch(function (e) { CellaApp.showError("detail-head", e.message); });

  function renderHead(d) {
    document.getElementById("detail-head").innerHTML =
      '<div class="detail-head">' +
        "<h1>" + CellaApp.esc(d.name) + " — " + CellaApp.esc(d.product) + "</h1>" +
        '<div class="btn-row" style="margin-bottom:8px"><span class="badge-cat gene">基因</span>' +
          '<span class="tag">EC ' + CellaApp.esc(d.ec) + "</span>" +
          '<span class="tag">家族 ' + CellaApp.esc(d.family_id) + "</span></div>" +
        '<div class="meta">' +
          "<div><b>基因 ID</b> " + CellaApp.esc(d.gene_id) + "</div>" +
          "<div><b>来源生物</b> " + CellaApp.esc(d.organism) + "</div>" +
          "<div><b>蛋白长度</b> " + d.length_aa + " aa</div>" +
          "<div><b>GC 含量</b> " + (d.gc_content * 100).toFixed(1) + "%</div>" +
        "</div>" +
      "</div>";
  }

  function renderPfam(d) {
    var chart = CellaApp.makeChart("chart-pfam");
    var maxPos = 0;
    d.pfam.forEach(function (p) { if (p.end > maxPos) maxPos = p.end; });
    var items = d.pfam.map(function (p, i) {
      return {
        name: p.name, family: p.family,
        value: [p.name, i, p.start, p.end],
        itemStyle: { color: FAM_COLORS[i % FAM_COLORS.length] },
        description: p.description
      };
    });
    chart.setOption({
      tooltip: { formatter: function (p) {
        var v = p.data.value; return p.data.family + " · " + p.data.name + "<br/>区间 " + v[2] + "–" + v[3] + "<br/>" + p.data.description;
      } },
      grid: { left: 90, right: 20, top: 16, bottom: 30 },
      xAxis: { type: "value", max: maxPos, name: "氨基酸位置", axisLabel: { fontSize: 11 } },
      yAxis: { type: "category", data: d.pfam.map(function (p) { return p.name; }), inverse: true, axisLabel: { fontSize: 11 } },
      series: [{
        type: "custom", barWidth: "60%",
        renderItem: function (params, api) {
          var yCat = api.value(1);
          var start = api.coord([api.value(2), yCat])[0];
          var end = api.coord([api.value(3), yCat])[0];
          var height = api.size([0, 1])[1] * 0.5;
          var yPix = api.coord([0, yCat])[1] - height / 2;
          var rectWidth = end - start;
          return {
            type: "group", children: [
              { type: "rect", shape: { x: start, y: yPix, width: rectWidth, height: height }, style: api.style() },
              { type: "text", style: { text: rectWidth > 46 ? params.data.family : "", x: start + 6, y: yPix + height / 2,
                fontSize: 11, fill: "#fff", textVerticalAlign: "middle" } }
            ]
          };
        },
        data: items
      }]
    });
  }

  function renderFasta(d) {
    var seq = d.fasta.replace(/^>.*\n/, "");
    var header = d.fasta.split("\n")[0];
    var colorMap = { A: "b-a", T: "b-t", G: "b-g", C: "b-c", N: "b-n" };
    var lines = seq.match(/.{1,60}/g) || [];
    var html = '<span class="header">' + CellaApp.esc(header) + "</span>\n";
    lines.forEach(function (ln) {
      var colored = ln.split("").map(function (ch) {
        return '<span class="' + (colorMap[ch] || "b-n") + '">' + ch + "</span>";
      }).join("");
      html += colored + "\n";
    });
    document.getElementById("fasta").innerHTML = html;
  }

  function renderAssocs(d) {
    document.getElementById("strains").innerHTML = d.associated_strains.map(function (s) {
      return '<span class="tag">' + CellaApp.esc(s) + "</span>";
    }).join("") || '<span class="muted small">—</span>';
    document.getElementById("samples").innerHTML = d.associated_samples.map(function (s) {
      return '<a class="tag" href="metagenome.html?id=' + s + '">' + CellaApp.esc(s) + "</a>";
    }).join("") || '<span class="muted small">—</span>';
    document.getElementById("consorts").innerHTML = d.associated_consorts.map(function (c) {
      return '<a class="tag" href="consortium.html?id=' + c + '">' + CellaApp.esc(c) + "</a>";
    }).join("") || '<span class="muted small">—</span>';
  }

  function renderPathwayTable(d) {
    var cols = [
      { key: "pathway_id", title: "通路 ID", render: function (r) { return '<a href="pathway.html?id=' + r.pathway_id + '">' + r.pathway_id + "</a>"; } },
      { key: "name", title: "名称" }
    ];
    CellaApp.renderTable("pathway-table", cols, d.pathways);
  }
})();
