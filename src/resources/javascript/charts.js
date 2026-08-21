/* =======================================================
   Cella LAB — charts.js
   Unified echarts wrappers (academic light theme)
   ======================================================= */
(function (global) {
  "use strict";

  // Low-saturation academic color palette
  var PALETTE = [
    "#1F4E79", "#2E7D5B", "#C77D3A", "#8E44AD",
    "#B8860B", "#5B8C5A", "#4A7BA6", "#A0524D",
    "#6B8E9E", "#9C7CAB", "#C2A35A", "#7A8B6F"
  ];

  var charts = [];

  function baseGrid() {
    return { left: 48, right: 24, top: 48, bottom: 48, containLabel: true };
  }

  function baseTextStyle() {
    return { fontFamily: "Source Sans Pro, Segoe UI, PingFang SC, sans-serif", color: "#2B2B2B" };
  }

  function axisStyle() {
    return {
      axisLine: { lineStyle: { color: "#B9B2A0" } },
      axisLabel: { color: "#5A5A5A", fontSize: 12 },
      splitLine: { lineStyle: { color: "#ECE8DD" } }
    };
  }

  function tooltipStyle() {
    return {
      backgroundColor: "#FFFFFF",
      borderColor: "#D9D4C7",
      textStyle: { color: "#2B2B2B", fontSize: 12 },
      extraCssText: "box-shadow:0 2px 8px rgba(43,43,43,.12);border-radius:4px;"
    };
  }

  function init(domId) {
    var el = document.getElementById(domId);
    if (!el) return null;
    var chart = echarts.init(el, null, { renderer: "canvas" });
    charts.push(chart);
    return chart;
  }

  function disposeAll() {
    charts.forEach(function (c) { try { c.dispose(); } catch (e) {} });
    charts = [];
  }

  // Keep all charts responsive
  window.addEventListener("resize", function () {
    charts.forEach(function (c) { try { c.resize(); } catch (e) {} });
  });

  /* ---------- Pie / Donut ---------- */
  function pie(domId, data, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      color: PALETTE,
      textStyle: baseTextStyle(),
      tooltip: Object.assign({ trigger: "item", formatter: "{b}: {c} ({d}%)" }, tooltipStyle()),
      legend: Object.assign({ bottom: 0, textStyle: { color: "#5A5A5A" } }, opts.legend || {}),
      series: [{
        name: opts.name || "Composition",
        type: "pie",
        radius: opts.donut ? ["42%", "68%"] : "62%",
        center: ["50%", "46%"],
        itemStyle: { borderColor: "#FAF8F3", borderWidth: 2 },
        label: { color: "#2B2B2B", fontSize: 12 },
        data: data
      }]
    });
    return chart;
  }

  /* ---------- Bar ---------- */
  function bar(domId, categories, series, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      color: PALETTE,
      textStyle: baseTextStyle(),
      grid: baseGrid(),
      tooltip: Object.assign({ trigger: "axis" }, tooltipStyle()),
      legend: Object.assign({ top: 8, textStyle: { color: "#5A5A5A" } }, opts.legend || {}),
      xAxis: Object.assign({ type: "category", data: categories }, axisStyle()),
      yAxis: Object.assign({ type: "value" }, axisStyle()),
      series: (Array.isArray(series) ? series : [series]).map(function (s) {
        return Object.assign({ type: "bar", barMaxWidth: 36, itemStyle: { borderRadius: [3, 3, 0, 0] } }, s);
      })
    });
    return chart;
  }

  /* ---------- Horizontal Bar ---------- */
  function hbar(domId, categories, values, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      color: PALETTE,
      textStyle: baseTextStyle(),
      grid: Object.assign(baseGrid(), { left: 140 }),
      tooltip: Object.assign({ trigger: "axis" }, tooltipStyle()),
      xAxis: Object.assign({ type: "value" }, axisStyle()),
      yAxis: Object.assign({ type: "category", data: categories, inverse: true }, axisStyle()),
      series: [{
        type: "bar",
        data: values,
        barMaxWidth: 22,
        itemStyle: { color: opts.color || PALETTE[0], borderRadius: [0, 3, 3, 0] },
        label: { show: true, position: "right", color: "#5A5A5A", fontSize: 11 }
      }]
    });
    return chart;
  }

  /* ---------- Line (pangenome curve) ---------- */
  function line(domId, xData, series, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      color: PALETTE,
      textStyle: baseTextStyle(),
      grid: baseGrid(),
      tooltip: Object.assign({ trigger: "axis" }, tooltipStyle()),
      legend: Object.assign({ top: 8, textStyle: { color: "#5A5A5A" } }, opts.legend || {}),
      xAxis: Object.assign({ type: "category", data: xData, boundaryGap: false }, axisStyle()),
      yAxis: Object.assign({ type: "value" }, axisStyle()),
      series: series.map(function (s) {
        return Object.assign({ type: "line", smooth: true, symbol: "circle", symbolSize: 6, lineStyle: { width: 2.5 } }, s);
      })
    });
    return chart;
  }

  /* ---------- Heatmap (PAV) ---------- */
  function heatmap(domId, xData, yData, matrix, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    var data = [];
    for (var i = 0; i < yData.length; i++) {
      for (var j = 0; j < xData.length; j++) {
        data.push([j, i, matrix[i][j]]);
      }
    }
    chart.setOption({
      textStyle: baseTextStyle(),
      grid: Object.assign(baseGrid(), { left: 120, top: 20 }),
      tooltip: Object.assign({ position: "top", formatter: function (p) {
        return yData[p.data[1]] + " / " + xData[p.data[0]] + ": " + (p.data[2] ? "Present" : "Absent");
      } }, tooltipStyle()),
      xAxis: Object.assign({ type: "category", data: xData, splitArea: { show: true } }, axisStyle(), { axisLabel: { color: "#5A5A5A", fontSize: 11, rotate: 45 } }),
      yAxis: Object.assign({ type: "category", data: yData, splitArea: { show: true } }, axisStyle(), { axisLabel: { color: "#5A5A5A", fontSize: 11 } }),
      visualMap: {
        min: 0, max: 1, calculable: false, show: false,
        inRange: { color: ["#F0EDE4", "#1F4E79"] }
      },
      series: [{
        type: "heatmap",
        data: data,
        itemStyle: { borderColor: "#FAF8F3", borderWidth: 1 },
        emphasis: { itemStyle: { borderColor: "#C77D3A", borderWidth: 1.5 } }
      }]
    });
    return chart;
  }

  /* ---------- Tree (dendrogram) ---------- */
  function tree(domId, treeData, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      textStyle: baseTextStyle(),
      tooltip: Object.assign({ trigger: "item", formatter: function (p) { return p.data.name + (p.data.value ? " (" + p.data.value.toFixed(2) + ")" : ""); } }, tooltipStyle()),
      series: [{
        type: "tree",
        data: [treeData],
        top: "2%", left: "12%", bottom: "2%", right: "18%",
        symbolSize: 8,
        initialTreeDepth: 2,
        label: { position: "left", verticalAlign: "middle", align: "right", color: "#2B2B2B", fontSize: 12 },
        leaves: { label: { position: "right", verticalAlign: "middle", align: "left" } },
        expandAndCollapse: true,
        animationDuration: 550,
        lineStyle: { color: "#B9B2A0", width: 1.5 }
      }]
    });
    return chart;
  }

  /* ---------- Graph (network) ---------- */
  function graph(domId, nodes, links, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      textStyle: baseTextStyle(),
      tooltip: Object.assign({ trigger: "item", formatter: function (p) {
        if (p.dataType === "edge") return (p.data.source || "") + " → " + (p.data.target || "") + (p.data.relation ? " (" + p.data.relation + ")" : "");
        return p.data.label || p.data.name || "";
      } }, tooltipStyle()),
      legend: opts.legend ? Object.assign({ top: 8, textStyle: { color: "#5A5A5A" } }, opts.legend) : undefined,
      series: [{
        type: "graph",
        layout: opts.layout || "force",
        roam: true,
        draggable: true,
        data: nodes,
        links: links,
        categories: opts.categories,
        label: { show: true, color: "#2B2B2B", fontSize: 12, position: "right" },
        lineStyle: { color: opts.edgeColor || "#B9B2A0", curveness: 0.15, width: 1.6 },
        emphasis: { focus: "adjacency", lineStyle: { width: 3 } },
        force: { repulsion: 220, edgeLength: [60, 140], gravity: 0.08 }
      }]
    });
    return chart;
  }

  /* ---------- 3D Scatter (UMAP) ---------- */
  function scatter3d(domId, points, opts) {
    opts = opts || {};
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      textStyle: baseTextStyle(),
      tooltip: {},
      legend: opts.legend ? Object.assign({ top: 8, textStyle: { color: "#5A5A5A" } }, opts.legend) : undefined,
      xAxis3D: { type: "value", name: "UMAP1" },
      yAxis3D: { type: "value", name: "UMAP2" },
      zAxis3D: { type: "value", name: "UMAP3" },
      grid3D: {
        boxWidth: 100, boxDepth: 100, boxHeight: 100,
        axisLine: { lineStyle: { color: "#B9B2A0" } },
        splitLine: { lineStyle: { color: "#ECE8DD" } },
        axisPointer: { lineStyle: { color: "#C77D3A" } },
        viewControl: { distance: 200, alpha: 20, beta: 30 }
      },
      series: [{
        type: "scatter3D",
        data: points,
        symbolSize: 14,
        itemStyle: { opacity: 0.9 },
        label: { show: opts.showLabel, fontSize: 11, color: "#2B2B2B" },
        emphasis: { label: { show: true } }
      }]
    });
    return chart;
  }

  /* ---------- Wordcloud ---------- */
  function wordcloud(domId, words) {
    var chart = init(domId);
    if (!chart) return null;
    chart.setOption({
      tooltip: { show: true },
      series: [{
        type: "wordCloud",
        shape: "circle",
        sizeRange: [14, 64],
        rotationRange: [-45, 45],
        gridSize: 8,
        drawOutOfBound: false,
        textStyle: {
          fontFamily: "Source Sans Pro, sans-serif",
          color: function () {
            return PALETTE[Math.floor(Math.random() * PALETTE.length)];
          }
        },
        data: words
      }]
    });
    return chart;
  }

  global.CLCharts = {
    PALETTE: PALETTE,
    pie: pie,
    bar: bar,
    hbar: hbar,
    line: line,
    heatmap: heatmap,
    tree: tree,
    graph: graph,
    scatter3d: scatter3d,
    wordcloud: wordcloud,
    disposeAll: disposeAll
  };
})(window);
