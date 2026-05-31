<?php

include dirname(__DIR__) . "/etc/bootstrap.php";

/**
 * substrate_modification Controller
 * 
 * RESTful API for managing substrate_modification records.
 * Substrate modification records the metabolite content modifications 
 * applied to the culture medium for a specific experiment.
 * 
 * URL patterns:
 *   /substrate_modification/list                    - GET  - List all modifications
 *   /substrate_modification/get?id=N                - GET  - Get modification by ID
 *   /substrate_modification/list_by_experiment      - GET  - List modifications by experiment
 *   /substrate_modification/create                  - POST - Create a new modification
 *   /substrate_modification/update?id=N             - POST - Update a modification
 *   /substrate_modification/delete?id=N             - POST - Delete a modification
 */

class App {

    /**
     * List all substrate_modification records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list($page=1, $pageSize = 20) {
        $table = new Table("substrate_modification");
        
        if (isset($_GET["experiment_id"]) && !empty($_GET["experiment_id"])) {
            $table = $table->where(["experiment_id" => intval($_GET["experiment_id"])]);
        }
        if (isset($_GET["metabolite_id"]) && !empty($_GET["metabolite_id"])) {
            $table = $table->where(["metabolite_id" => $_GET["metabolite_id"]]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single substrate_modification record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("substrate_modification");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Substrate modification record not found", 404); }
        controller::success($record);
    }

    /**
     * List modifications by experiment_id
     * @access * @uses api @method GET @require experiment_id=i32
     */
    public function list_by_experiment($experiment_id) {
        $table = new Table("substrate_modification");
        $data = $table->where(["experiment_id" => $experiment_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Create a new substrate_modification record
     * @access * @uses api @method POST @require experiment_id=i32|metabolite_id=string|content=double
     */
    public function create($experiment_id, $metabolite_id, $content) {
        $table = new Table("substrate_modification");
        // Verify experiment exists
        $exp = (new Table("experiment"))->where(["id" => $experiment_id])->find();
        if (!$exp) { controller::error("Experiment with id $experiment_id not found", 404); }
        // Validate content
        $contentVal = doubleval($content);
        if ($contentVal < 0) { controller::error("Content value must be non-negative", 400); }
        $data = ["experiment_id" => $experiment_id, "metabolite_id" => $metabolite_id, "content" => $contentVal];
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Substrate modification created successfully"]); }
        else { controller::error("Failed to create substrate modification", 500); }
    }

    /**
     * Update an existing substrate_modification record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("substrate_modification");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Substrate modification record not found", 404); }
        $data = [];
        if (isset($_POST["experiment_id"]) && !empty($_POST["experiment_id"])) {
            $exp = (new Table("experiment"))->where(["id" => intval($_POST["experiment_id"])])->find();
            if (!$exp) { controller::error("Experiment with id " . $_POST["experiment_id"] . " not found", 404); }
            $data["experiment_id"] = intval($_POST["experiment_id"]);
        }
        if (isset($_POST["metabolite_id"]) && !empty($_POST["metabolite_id"])) { $data["metabolite_id"] = $_POST["metabolite_id"]; }
        if (isset($_POST["content"]) && $_POST["content"] !== "") {
            $contentVal = doubleval($_POST["content"]);
            if ($contentVal < 0) { controller::error("Content value must be non-negative", 400); }
            $data["content"] = $contentVal;
        }
        if (isset($_POST["note"])) { $data["note"] = $_POST["note"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Substrate modification updated successfully"]); }
        else { controller::error("Failed to update substrate modification", 500); }
    }

    /**
     * Delete a substrate_modification record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("substrate_modification");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Substrate modification record not found", 404); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Substrate modification deleted successfully"]); }
        else { controller::error("Failed to delete substrate modification", 500); }
    }
}
