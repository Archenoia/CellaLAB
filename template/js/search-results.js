/* search-results.js — aggregated results with category tabs */
(function () {
  "use strict";
  CellaApp.initLayout("search");

  var CATS = [
    { key: "all",        label: "全部" },
    { key: "consortium", label: "合成菌群" },
    { key: "taxon",      label: "物种分类" },
    { key: "gene",       label: "基因" },
    { key: "sample",     label: "环境样本" },
    { key: "enzyme",     label: "酶" },
    { key: "pathway",    label: "代谢通路" }
  ];
  var catLabel = { consortium: "合成菌群", taxon: "物种分类", gene: "基因", sample: "环境样本", enzyme: "酶", pathway: "代谢通路" };

  var q = CellaApp.getQueryParam("q") || "";
  var activeCat = CellaApp.getQueryParam("category") || "all";
  var payload = null;

  document.getElementById("breadcrumb").innerHTML =
    '<a href="index.html">首页</a><span class="sep">/</span><a href="search.html">搜索</a>' +
    '<span class="sep">/</span>结果：' + CellaApp.esc(q);

  CellaApp.fetchJSON("data/api/search/query.json").then(function (data) {
    payload = data;
    /* summary */
    document.getElementById("summary").innerHTML =
      '关键词 <b>' + CellaApp.esc(data.query) + "</b> 共找到 <b>" + data.total + "</b> 条结果" +
      (data.query !== q && q ? "" : "") + "。";

    /* tabs */
    document.getElementById("tabs").innerHTML = CATS.map(function (c) {
      var count = c.key === "all" ? data.total : (data.facets[c.key] || 0);
      var cls = c.key === activeCat ? " active" : "";
      return '<div class="tab' + cls + '" data-cat="' + c.key + '">' + c.label +
        ' <span class="badge">' + count + "</span></div>";
    }).join("");

    document.querySelectorAll("#tabs .tab").forEach(function (t) {
      t.addEventListener("click", function () {
        activeCat = t.getAttribute("data-cat");
        document.querySelectorAll("#tabs .tab").forEach(function (x) { x.classList.remove("active"); });
        t.classList.add("active");
        renderResults();
      });
    });

    renderResults();
  }).catch(function (e) {
    CellaApp.showError("results", e.message);
    document.getElementById("summary").textContent = "加载失败";
  });

  function renderResults() {
    var list = payload.results.filter(function (r) {
      return activeCat === "all" || r.category === activeCat;
    });
    var html = list.map(function (r) {
      return '<div class="result-card">' +
        '<div class="rc-main">' +
          '<span class="badge-cat ' + r.category + '">' + (catLabel[r.category] || r.category) + "</span> " +
          "<h3><a href=\"" + CellaApp.linkTo(r.category, r.id) + "\">" + CellaApp.esc(r.title) + "</a></h3>" +
          '<div class="rc-desc">' + CellaApp.esc(r.desc) + "</div>" +
          '<div class="rc-meta">来源：' + CellaApp.esc(r.source) + " · ID：" + CellaApp.esc(r.id) + "</div>" +
        "</div>" +
        '<div class="rc-action"><a class="btn sm" href="' + CellaApp.linkTo(r.category, r.id) + '">查看详情</a></div>' +
      "</div>";
    }).join("");
    document.getElementById("results").innerHTML = html ||
      '<div class="loading">该分类下暂无匹配结果</div>';

    /* simple pager (single page for template) */
    document.getElementById("pager").innerHTML =
      '<a class="active" href="javascript:void(0)">1</a>';
  }
})();
