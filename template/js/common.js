/* ============================================================
   Cella LAB — common.js
   Public layer: layout injection, JSON loading, ECharts theme,
   chart factory with unified resize, academic table renderer.
   Exposes window.CellaApp
   ============================================================ */
(function () {
  "use strict";

  var NAV = [
    { key: "home",        label: "首页",     href: "index.html" },
    { key: "search",      label: "搜索",     href: "search.html" },
    { key: "consortium",  label: "合成菌群", href: "consortium.html" },
    { key: "metagenome",  label: "宏基因组", href: "metagenome.html" },
    { key: "pangenome",   label: "泛基因组", href: "pangenome.html" },
    { key: "pathway",     label: "通路",     href: "pathway.html" },
    { key: "gene",        label: "基因",     href: "gene.html" }
  ];

  var charts = [];
  var resizeTimer = null;

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function buildHeader(active) {
    var navHtml = NAV.map(function (n) {
      var cls = n.key === active ? ' class="active"' : "";
      return '<a href="' + n.href + '"' + cls + ">" + n.label + "</a>";
    }).join("");
    var header = el(
      '<header class="site-header">' +
        '<div class="bar">' +
          '<a class="brand" href="index.html">' +
            '<img src="assets/logo.svg" width="32" height="32" alt="Cella LAB" onerror="this.style.display=\'none\'">' +
            '<span>Cella LAB<span class="brand-sub"> &nbsp;微生物实验室</span></span>' +
          "</a>" +
          '<nav class="main-nav">' + navHtml + "</nav>" +
          '<form class="nav-search" onsubmit="return CellaApp._navSearch(this)">' +
            '<input type="text" name="q" placeholder="搜索数据库…" aria-label="搜索">' +
            '<button type="submit">搜索</button>' +
          "</form>" +
        "</div>" +
      "</header>"
    );
    return header;
  }

  function buildFooter() {
    return el(
      '<footer class="site-footer">' +
        '<div class="cols">' +
          '<div><h4>关于 Cella LAB</h4><ul>' +
            '<li><a href="index.html">数据库简介</a></li>' +
            '<li><a href="index.html">数据来源</a></li>' +
            '<li><a href="index.html">更新日志</a></li>' +
          "</ul></div>" +
          '<div><h4>数据模块</h4><ul>' +
            '<li><a href="consortium.html">合成菌群</a></li>' +
            '<li><a href="metagenome.html">宏基因组样本</a></li>' +
            '<li><a href="pangenome.html">泛基因组分析</a></li>' +
            '<li><a href="pathway.html">代谢通路</a></li>' +
          "</ul></div>" +
          '<div><h4>使用帮助</h4><ul>' +
            '<li><a href="search.html">检索指南</a></li>' +
            '<li><a href="search.html">API 说明</a></li>' +
            '<li><a href="search.html">常见问题</a></li>' +
          "</ul></div>" +
          '<div><h4>引用格式</h4><ul>' +
            '<li>Cella LAB: a synthetic microbiome database.</li>' +
            '<li>Version 1.0 (2026).</li>' +
          "</ul></div>" +
        "</div>" +
        '<div class="copyright">© 2026 Cella LAB · 合成菌群设计与理论支撑数据库 · 本页面为前端模板示例（数据均为演示用途）</div>' +
      "</footer>"
    );
  }

  function initLayout(active) {
    var header = buildHeader(active);
    document.body.insertBefore(header, document.body.firstChild);
    document.body.appendChild(buildFooter());
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        charts.forEach(function (c) { try { c.resize(); } catch (e) {} });
      }, 150);
    });
  }

  /* ---- query params ---- */
  function getQueryParam(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : null;
  }

  /* ---- JSON loading (unwraps {code,message,data}) ---- */
  function fetchJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (json) {
      if (json && typeof json.code === "number" && json.code !== 0) {
        throw new Error(json.message || "API error");
      }
      return json && json.data !== undefined ? json.data : json;
    });
  }

  function showError(domId, msg) {
    var d = document.getElementById(domId);
    if (d) d.innerHTML = '<div class="error-box">加载失败：' + (msg || "未知错误") + "</div>";
  }
  function showLoading(domId) {
    var d = document.getElementById(domId);
    if (d) d.innerHTML = '<div class="loading">数据加载中…</div>';
  }

  /* ---- ECharts theme (cella-paper) ---- */
  function registerTheme() {
    if (!window.echarts || echarts.registerTheme.__cella) return;
    var palette = ["#20558a", "#3a8f5f", "#c1873b", "#8f3a3a", "#5f5f8f",
                   "#3a7f8f", "#7a6a3a", "#6b8f3a", "#a8557a", "#47607d"];
    echarts.registerTheme("cella-paper", {
      color: palette,
      backgroundColor: "#ffffff",
      textStyle: { fontFamily: "Segoe UI, PingFang SC, Microsoft YaHei, sans-serif", color: "#2b2b2b" },
      title: { textStyle: { color: "#14375f", fontWeight: 600, fontSize: 15 }, subtextStyle: { color: "#5a5a5a" } },
      legend: { textStyle: { color: "#2b2b2b" } },
      tooltip: { backgroundColor: "#ffffff", borderColor: "#d8d8d2", borderWidth: 1,
                 textStyle: { color: "#2b2b2b", fontSize: 12 }, extraCssText: "box-shadow:0 1px 4px rgba(0,0,0,.12);" },
      categoryAxis: {
        axisLine: { lineStyle: { color: "#b5b5ad" } },
        axisTick: { lineStyle: { color: "#b5b5ad" } },
        axisLabel: { color: "#2b2b2b" },
        splitLine: { show: false, lineStyle: { color: "#ececE6" } }
      },
      valueAxis: {
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: "#2b2b2b" },
        splitLine: { lineStyle: { color: "#ececE6", type: "solid" } }
      },
      visualMap: { textStyle: { color: "#2b2b2b" } }
    });
    echarts.registerTheme.__cella = true;
  }

  /* ---- chart factory ---- */
  function makeChart(domId) {
    var dom = document.getElementById(domId);
    if (!dom) return null;
    registerTheme();
    var c = echarts.init(dom, "cella-paper", { renderer: "canvas" });
    charts.push(c);
    return c;
  }

  /* ---- academic table renderer ---- */
  function renderTable(domId, columns, rows) {
    var dom = document.getElementById(domId);
    if (!dom) return;
    if (!rows || !rows.length) {
      dom.innerHTML = '<div class="loading">暂无数据</div>';
      return;
    }
    var thead = "<thead><tr>" + columns.map(function (c) {
      return '<th class="' + (c.num ? "num" : "") + '">' + (c.title || c.key) + "</th>";
    }).join("") + "</tr></thead>";
    var tbody = "<tbody>" + rows.map(function (row) {
      return "<tr>" + columns.map(function (c) {
        var val = c.render ? c.render(row) : (row[c.key] != null ? row[c.key] : "");
        return '<td class="' + (c.num ? "num" : "") + '">' + (val === "" || val == null ? "—" : val) + "</td>";
      }).join("") + "</tr>";
    }).join("") + "</tbody>";
    dom.innerHTML = '<div class="table-wrap"><table class="data">' + thead + tbody + "</table></div>";
  }

  /* ---- helpers ---- */
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function linkTo(type, id) {
    var map = {
      consortium: "consortium.html", metagenome: "metagenome.html",
      pangenome: "pangenome.html", pathway: "pathway.html", gene: "gene.html"
    };
    return map[type] ? (map[type] + "?id=" + encodeURIComponent(id)) : "#";
  }

  window.CellaApp = {
    NAV: NAV,
    initLayout: initLayout,
    getQueryParam: getQueryParam,
    fetchJSON: fetchJSON,
    showError: showError,
    showLoading: showLoading,
    makeChart: makeChart,
    renderTable: renderTable,
    registerTheme: registerTheme,
    esc: esc,
    linkTo: linkTo,
    _navSearch: function (form) {
      var q = (form.q && form.q.value || "").trim();
      window.location.href = "search-results.html?q=" + encodeURIComponent(q);
      return false;
    }
  };

  /* Auto-build breadcrumb target container if a #breadcrumb exists */
  document.addEventListener("DOMContentLoaded", function () {
    // ensure header is above any existing content already handled in initLayout calls
  });
})();
