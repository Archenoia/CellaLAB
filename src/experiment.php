<?php

include dirname(__DIR__) . "/etc/bootstrap.php";

/**
 * experiment Controller
 * 
 * RESTful API for managing experiment records.
 * Experiment represents a virtual cell simulation/analysis 
 * experiment setup with environment parameters.
 * 
 * URL patterns:
 *   /experiment/list                         - GET  - List all experiments
 *   /experiment/get?id=N                     - GET  - Get experiment by ID
 *   /experiment/list_by_project              - GET  - List experiments by project
 *   /experiment/list_by_culture_medium       - GET  - List experiments by culture_medium
 *   /experiment/get_full?id=N                - GET  - Get experiment with related data
 *   /experiment/create                       - POST - Create a new experiment
 *   /experiment/update?id=N                  - POST - Update an experiment
 *   /experiment/delete?id=N                  - POST - Delete an experiment
 */

class App {

    /**
     * List all experiment records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list($page=1, $pageSize = 20) {
        $table = new Table("experiment");
        
        if (isset($_GET["name"]) && !empty($_GET["name"])) {
            $table = $table->where(["name" => like("%" . $_GET["name"] . "%")]);
        }
        if (isset($_GET["proj_id"]) && !empty($_GET["proj_id"])) {
            $table = $table->where(["proj_id" => intval($_GET["proj_id"])]);
        }
        if (isset($_GET["culture_medium"]) && !empty($_GET["culture_medium"])) {
            $table = $table->where(["culture_medium" => intval($_GET["culture_medium"])]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single experiment record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("experiment");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Experiment record not found", 404); }
        controller::success($record);
    }

    /**
     * List experiments by project (proj_id)
     * @access * @uses api @method GET @require proj_id=i32
     */
    public function list_by_project($proj_id) {
        $table = new Table("experiment");
        $data = $table->where(["proj_id" => $proj_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * List experiments by culture_medium
     * @access * @uses api @method GET @require culture_medium=i32
     */
    public function list_by_culture_medium($culture_medium) {
        $table = new Table("experiment");
        $data = $table->where(["culture_medium" => $culture_medium])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Get experiment with related dynamics and substrate_modification data
     * @access * @uses api @method GET @require id=i32
     */
    public function get_full($id) {
        $table = new Table("experiment");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Experiment record not found", 404); }
        $dynamics = (new Table("dynamics"))->where(["experiment_id" => $id])->select();
        $modifications = (new Table("substrate_modification"))->where(["experiment_id" => $id])->select();
        $record["dynamics"] = $dynamics;
        $record["substrate_modifications"] = $modifications;
        controller::success($record);
    }

    /**
     * Create a new experiment record
     * @access * @uses api @method POST @require proj_id=i32|name=string
     */
    public function create($proj_id, $name) {
        $table = new Table("experiment");
        // Verify project exists
        $project = (new Table("project_data"))->where(["id" => $proj_id])->find();
        if (!$project) { controller::error("Project with id $proj_id not found", 404); }
        $data = ["proj_id" => $proj_id, "name" => $name];
        if (isset($_POST["temperature"]) && $_POST["temperature"] !== "") { $data["temperature"] = doubleval($_POST["temperature"]); }
        if (isset($_POST["ph"]) && $_POST["ph"] !== "") { $data["ph"] = doubleval($_POST["ph"]); }
        if (isset($_POST["culture_medium"]) && !empty($_POST["culture_medium"])) {
            $medium = (new Table("culture_medium"))->where(["id" => intval($_POST["culture_medium"])])->find();
            if (!$medium) { controller::error("Culture medium with id " . $_POST["culture_medium"] . " not found", 404); }
            $data["culture_medium"] = intval($_POST["culture_medium"]);
        }
        if (isset($_POST["total_time"]) && $_POST["total_time"] !== "") { $data["total_time"] = doubleval($_POST["total_time"]); }
        if (isset($_POST["time"]) && $_POST["time"] !== "") { $data["time"] = doubleval($_POST["time"]); }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Experiment created successfully"]); }
        else { controller::error("Failed to create experiment", 500); }
    }

    /**
     * Update an existing experiment record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("experiment");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Experiment record not found", 404); }
        $data = [];
        if (isset($_POST["proj_id"]) && !empty($_POST["proj_id"])) {
            $project = (new Table("project_data"))->where(["id" => intval($_POST["proj_id"])])->find();
            if (!$project) { controller::error("Project with id " . $_POST["proj_id"] . " not found", 404); }
            $data["proj_id"] = intval($_POST["proj_id"]);
        }
        if (isset($_POST["name"]) && !empty($_POST["name"])) { $data["name"] = $_POST["name"]; }
        if (isset($_POST["temperature"]) && $_POST["temperature"] !== "") { $data["temperature"] = doubleval($_POST["temperature"]); }
        if (isset($_POST["ph"]) && $_POST["ph"] !== "") { $data["ph"] = doubleval($_POST["ph"]); }
        if (isset($_POST["culture_medium"]) && !empty($_POST["culture_medium"])) {
            $medium = (new Table("culture_medium"))->where(["id" => intval($_POST["culture_medium"])])->find();
            if (!$medium) { controller::error("Culture medium with id " . $_POST["culture_medium"] . " not found", 404); }
            $data["culture_medium"] = intval($_POST["culture_medium"]);
        }
        if (isset($_POST["total_time"]) && $_POST["total_time"] !== "") { $data["total_time"] = doubleval($_POST["total_time"]); }
        if (isset($_POST["time"]) && $_POST["time"] !== "") { $data["time"] = doubleval($_POST["time"]); }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Experiment updated successfully"]); }
        else { controller::error("Failed to update experiment", 500); }
    }

    /**
     * Delete an experiment record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("experiment");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Experiment record not found", 404); }
        $dynamicsRef = (new Table("dynamics"))->where(["experiment_id" => $id])->count();
        if ($dynamicsRef > 0) { controller::error("Cannot delete: experiment is referenced by $dynamicsRef dynamics record(s)", 409); }
        $modRef = (new Table("substrate_modification"))->where(["experiment_id" => $id])->count();
        if ($modRef > 0) { controller::error("Cannot delete: experiment is referenced by $modRef substrate_modification record(s)", 409); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Experiment deleted successfully"]); }
        else { controller::error("Failed to delete experiment", 500); }
    }
}
