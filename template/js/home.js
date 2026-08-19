/* home.js — render stats, module cards, overview charts, latest list */
(function () {
  "use strict";
  CellaApp.initLayout("home");

  var modules = [
    { key: "consortium", label: "合成菌群", desc: "具有特定功能的合成菌群配方，含群落组成与交叉喂养网络。", countKey: "consortium" },
    { key: "metagenome", label: "宏基因组", desc: "多环境采样样本的菌群组成、MAGs 与基因注释。", countKey: "metagenome" },
    { key: "pangenome",  label: "泛基因组", desc: "基因家族分类、PAV 矩阵与结构变异分析。", countKey: "pangenome" },
    { key: "pathway",    label: "代谢通路", desc: "解释合成菌群功能来源的底层通路机制。", countKey: "pathway" }
  ];
  var hrefMap = {
    consortium: "consortium.html", metagenome: "metagenome.html",
    pangenome: "pangenome.html", pathway: "pathway.html"
  };

  CellaApp.fetchJSON("data/api/stats.json").then(function (data) {
    /* stat strip */
    var stats = [
      { num: data.counts.consortium, label: "合成菌群" },
      { num: data.counts.metagenome, label: "宏基因组样本" },
      { num: data.counts.gene.toLocaleString(), label: "注释基因" },
      { num: data.counts.pathway, label: "代谢通路" }
    ];
    document.getElementById("stat-strip").innerHTML = stats.map(function (s) {
      return '<div class="stat"><div class="num">' + s.num + '</div><div class="label">' + s.label + "</div></div>";
    }).join("");

    /* module cards */
    document.getElementById("module-grid").innerHTML = modules.map(function (m) {
      var cnt = data.counts[m.countKey] != null ? data.counts[m.countKey].toLocaleString() : "";
      return '<a class="module-card" href="' + hrefMap[m.key] + '">' +
        '<img class="ic" src="assets/logo.svg" alt="" onerror="this.style.display=\'none\'">' +
        "<h3>" + m.label + "</h3><p>" + m.desc + '</p>' +
        '<span class="count">收录 ' + cnt + " 条</span></a>";
    }).join("");

    /* pie */
    document.getElementById("pie-title").textContent = data.overview_pie.title;
    var pie = CellaApp.makeChart("chart-pie");
    pie.setOption({
      title: { text: data.overview_pie.subtext, left: "center", top: 6, textStyle: { fontSize: 12, color: "#5a5a5a" } },
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 0, type: "scroll", textStyle: { fontSize: 11 } },
      series: [{
        type: "pie", radius: ["38%", "62%"], center: ["50%", "48%"],
        avoidLabelOverlap: true, itemStyle: { borderColor: "#fff", borderWidth: 1 },
        label: { fontSize: 11 }, data: data.overview_pie.data
      }]
    });

    /* bar */
    document.getElementById("bar-title").textContent = data.overview_bar.title;
    var bar = CellaApp.makeChart("chart-bar");
    bar.setOption({
      title: { text: data.overview_bar.subtext, left: "center", top: 6, textStyle: { fontSize: 12, color: "#5a5a5a" } },
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 50, right: 24, top: 48, bottom: 40 },
      xAxis: { type: "category", data: data.overview_bar.categories, axisLabel: { interval: 0 } },
      yAxis: { type: "value", name: "样本数" },
      series: [{ type: "bar", barWidth: "52%",
        itemStyle: { color: "#20558a", borderColor: "#14375f", borderWidth: 1 },
        data: data.overview_bar.values }]
    });

    /* latest */
    document.getElementById("latest").innerHTML = CellaApp.renderTable ? "" : "";
    var cols = [
      { key: "type", title: "类型", render: function (r) {
        var nm = { consortium: "合成菌群", metagenome: "宏基因组", pangenome: "泛基因组", pathway: "通路", gene: "基因" };
        return '<span class="badge-cat ' + r.type + '">' + (nm[r.type] || r.type) + "</span>";
      }},
      { key: "name", title: "名称", render: function (r) { return '<a href="' + CellaApp.linkTo(r.type, r.id) + '">' + CellaApp.esc(r.name) + "</a>"; } },
      { key: "date", title: "收录日期", num: true }
    ];
    CellaApp.renderTable("latest", cols, data.latest);
  }).catch(function (e) { CellaApp.showError("stat-strip", e.message); });
})();
