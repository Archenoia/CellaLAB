/* pathway.js — metabolic pathway detail page */
(function () {
  "use strict";

  fetch("/resources/assets/api_demo/pathway.json")
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById("pw-name").textContent = d.name + " (" + d.id + ")";
      document.getElementById("pw-meta").innerHTML =
        "<span>Reactions: <b>" + d.reaction_count + "</b></span>" +
        "<span>Metabolites: <b>" + (d.metabolites || []).length + "</b></span>" +
        "<span>Genes: <b>" + (d.genes || []).length + "</b></span>";
      document.getElementById("pw-desc").textContent = d.description;

      // Network
      var nodes = (d.network.nodes || []).map(function (n) {
        var isProd = n.cat === "product";
        return {
          id: n.id, name: n.label, label: n.label,
          symbolSize: isProd ? 28 : 20,
          itemStyle: { color: isProd ? "#C77D3A" : "#1F4E79" }
        };
      });
      var links = (d.network.links || []).map(function (l) {
        return { source: l.source, target: l.target, lineStyle: { color: "#2E7D5B" } };
      });
      CLCharts.graph("pw-net", nodes, links, { layout: "force" });

      // Upstream/downstream chain
      var chain = document.getElementById("pw-chain");
      function block(title, items, badge) {
        var html = '<div class="cl-card mb-2"><div class="cl-muted" style="font-size:12px;">' + title + '</div>';
        (items || []).forEach(function (it) {
          html += '<div class="mt-1"><span class="cl-badge ' + badge + '">' + it.id + '</span> ' + it.name +
            '<div class="cl-muted" style="font-size:12px;">' + (it.relation || "") + '</div></div>';
        });
        if (!(items || []).length) html += '<div class="cl-muted" style="font-size:13px;">—</div>';
        html += "</div>";
        return html;
      }
      chain.innerHTML = block("Upstream", d.upstream, "cl-badge-blue") + block("Downstream", d.downstream, "cl-badge-amber");

      // Metabolites
      var mt = document.getElementById("pw-met");
      (d.metabolites || []).forEach(function (m) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td>" + m.name + "</td><td>" + m.role + "</td>";
        mt.appendChild(tr);
      });

      // Reactions
      var rx = document.getElementById("pw-rxn");
      (d.reactions || []).forEach(function (r) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td class='cl-mono'>" + r.id + "</td><td>" + r.name + " (" + r.from + " → " + r.to + ")</td><td class='cl-mono'>" + r.enzyme + "</td>";
        rx.appendChild(tr);
      });

      // Genes
      var gn = document.getElementById("pw-genes");
      (d.genes || []).forEach(function (g) {
        var tr = document.createElement("tr");
        tr.innerHTML = "<td class='cl-mono'>" + g.name + "</td><td>" + g.product + "</td><td>" + g.organism + "</td>";
        gn.appendChild(tr);
      });

      // Related records
      var rel = document.getElementById("pw-rel");
      function relCard(title, items, link, badge) {
        if (!items || !items.length) return;
        var col = document.createElement("div");
        col.className = "col-lg-4 col-md-6";
        var html = '<div class="cl-card"><h4 style="font-size:16px;">' + title + '</h4>';
        items.forEach(function (it) {
          html += '<a class="cl-result" href="' + link + '"><div class="cl-result-top"><h4 style="font-size:14px;">' + it.name +
            '</h4><span class="cl-badge ' + badge + ' cl-result-cat">' + it.id + '</span></div></a>';
        });
        html += "</div>";
        col.innerHTML = html;
        rel.appendChild(col);
      }
      relCard("Related Consortia", d.related_consortia, "/consortium", "cl-badge-blue");
      relCard("Related Metagenomes", d.related_metagenomes, "/metagenome", "cl-badge-green");
      relCard("Associated Pathways", d.downstream.concat(d.upstream), "/pathway", "cl-badge-amber");
    })
    .catch(function (e) { console.error("Failed to load pathway.json", e); });
})();
