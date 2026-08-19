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
      return { name: p.name, family: p.family, description: p.description, start: p.start, end: p.end, color: FAM_COLORS[i % FAM_COLORS.length] };
    });
    // Use an empty scatter series for tooltip/axis mapping, then overlay graphic rectangles.
    chart.setOption({
      tooltip: { trigger: "item", formatter: function (p) {
        var it = items[p.dataIndex];
        return it.family + " · " + it.name + "<br/>区间 " + it.start + "–" + it.end + "<br/>" + it.description;
      } },
      grid: { left: 90, right: 20, top: 16, bottom: 30 },
      xAxis: { type: "value", min: 0, max: maxPos, name: "氨基酸位置", axisLabel: { fontSize: 11 } },
      yAxis: { type: "category", data: d.pfam.map(function (p) { return p.name; }), inverse: true, axisLabel: { fontSize: 11 } },
      series: [{
        type: "scatter", symbolSize: 1, itemStyle: { opacity: 0 },
        data: items.map(function (it) { return [it.end, it.name, it]; })
      }]
    });
    // After axes are computed, draw rectangles using convertFromPixel
    setTimeout(function () {
      var yPositions = items.map(function (it) { return chart.convertToPixel({ seriesIndex: 0 }, [0, it.name])[1]; });
      var bandHeight = chart.convertToPixel({ seriesIndex: 0 }, [0, 1])[1] - chart.convertToPixel({ seriesIndex: 0 }, [0, 0])[1];
      var height = Math.abs(bandHeight) * 0.45;
      var elements = [];
      items.forEach(function (it, i) {
        var yCenter = yPositions[i];
        var xStart = chart.convertToPixel({ xAxisIndex: 0 }, it.start);
        var xEnd = chart.convertToPixel({ xAxisIndex: 0 }, it.end);
        elements.push({
          type: "rect",
          shape: { x: xStart, y: yCenter - height / 2, width: xEnd - xStart, height: height },
          style: { fill: it.color }, z: 10
        });
        if (xEnd - xStart > 50) {
          elements.push({
            type: "text",
            style: { text: it.family, x: xStart + 6, y: yCenter, fill: "#fff", fontSize: 11, textVerticalAlign: "middle" },
            z: 11
          });
        }
      });
      chart.setOption({ graphic: elements });
    }, 50);
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
