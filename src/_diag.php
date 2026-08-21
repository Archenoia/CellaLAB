<?php
include dirname(__DIR__) . "/etc/bootstrap.php";
$app = new App();
$methods = get_class_methods($app);
echo "METHODS: " . implode(",", $methods) . "\n";
foreach (["project","consortium","metagenome","pangenome","pathway","gene","search","searchResult"] as $m) {
    echo "$m => " . (method_exists($app, $m) ? "YES" : "NO") . "\n";
}
echo "APP_DEBUG=" . (defined("APP_DEBUG") ? var_export(APP_DEBUG,true) : "undef") . "\n";
