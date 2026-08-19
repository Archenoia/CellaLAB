/* search.js — hot words dropdown + jump */
(function () {
  "use strict";
  CellaApp.initLayout("search");

  var catLabel = { consortium: "合成菌群", taxon: "物种", gene: "基因", sample: "样本", enzyme: "酶", pathway: "通路", pangenome: "泛基因组" };

  CellaApp.fetchJSON("data/api/search/hot.json").then(function (data) {
    document.getElementById("hotwords").innerHTML = data.hot_terms.map(function (t) {
      return '<span class="hotword" onclick="location.href=\'search-results.html?q=' +
        encodeURIComponent(t.term) + '\'">' +
        '<span class="rank">' + t.rank + '</span>' + CellaApp.esc(t.term) +
        '<span class="heat">' + catLabel[t.category] + " · " + t.heat.toLocaleString() + "</span></span>";
    }).join("");

    /* prefill from ?q= */
    var q = CellaApp.getQueryParam("q");
    if (q) document.getElementById("q-input").value = q;
  }).catch(function (e) { CellaApp.showError("hotwords", e.message); });
})();
