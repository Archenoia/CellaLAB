<?php

imports("MVC.controller");
imports("RFC7231.logger");
imports("RFC7231.index");

/**
 * record user activity for application 
 * usage data analysis
*/
class usageLogger implements logger {

    /**
     * @var GeoIp2\Database\Reader
    */
    private $maxmindDb;

    /**
     * @var Table
    */
    private $user_activity;

    function __construct() {
        // This creates the Reader object, which should be reused across
        // lookups.
        $geodb = DotNetRegistry::Read("MAXMIND_GEOIP");

        # $this->maxmindDb = new \GeoIp2\Database\Reader($geodb);
        $this->user_activity = new Table("user_activity");
    }

    public function log($code, $message) {
        $uri = $_SERVER["REQUEST_URI"];
        $ipv4 = Utils::UserIPAddress();

        if (is_bool($message)) {
            $result = $message;
            $message = "";
        } else {
            $result = $code == 200;
        }        

        // filter out server jsonrpc services
        // components
        if ($ipv4 == "8.210.29.117") {
            return $result;
        }

        // Replace "city" with the appropriate method for your database, e.g.,
        // "country".
        # $record = $this->maxmindDb->city($ipv4);breakpoint("get city");
        # $geoip = "{$record->country->isoCode}:{$record->city->name}";breakpoint("get info");
        $geoip = "n/a";
        $d = $this->user_activity->add([
            "ssid" => session_id(),
            "ip" => $ipv4,
            "UA" => $_SERVER['HTTP_USER_AGENT'],
            "api" => $uri,
            "method" => $_SERVER["REQUEST_METHOD"],
            "status_code" => $code,
            "time" => Utils::Now(),
            "message" => $message,
            "geo_location" => $geoip
        ]);

        if ($d == false) {
            breakpoint($this->user_activity->getLastMySql());
        }

        return $result;
    }
}

/**
 * 用户访问权限控制器
*/
class accessController extends controller {

    /**
     * @var usageLogger
    */
    private $logger;

    function __construct() {
        parent::__construct();

        # set callback handler
        # \RFC7231Error::$logger = $this->logger = new usageLogger();
    }

    public function accessControl() {       
        if ($this->AccessByEveryOne()) {
            # return $this->logger->log(200, true);
            return true;
        }

        return true;

        if (!empty($_SESSION)) {
            if (array_key_exists("user", $_SESSION)) {
                # return $this->logger->log(200, true);
                return true;
            }
        }

        # return $this->logger->log(403, false);
        return false;
    }

    /**
     * 假若没有权限的话，会执行这个函数进行重定向
    */
    public function Redirect($code) {
        $url = urlencode(Utils::URL());
        $url = "{passport/portal}&goto=$url";

        \Redirect($url);
    }   
}