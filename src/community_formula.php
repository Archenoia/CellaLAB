<?php

include dirname(__DIR__) . "/etc/bootstrap.php";

/**
 * community_formula Controller
 * 
 * RESTful API for managing community_formula records.
 * Community formula defines the species composition of a synthetic 
 * microbial community, linking community to model library entries 
 * with composition percentages.
 * 
 * URL patterns:
 *   /community_formula/list                    - GET  - List all formulas
 *   /community_formula/get?id=N                - GET  - Get formula by ID
 *   /community_formula/list_by_community       - GET  - List formulas by community_id
 *   /community_formula/list_by_model           - GET  - List formulas by model_id
 *   /community_formula/create                  - POST - Create a new formula
 *   /community_formula/update?id=N             - POST - Update a formula
 *   /community_formula/delete?id=N             - POST - Delete a formula
 */

class App {

    /**
     * List all community_formula records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list() {
        $table = new Table("community_formula");
        $page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
        $pageSize = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
        if (isset($_GET["community_id"]) && !empty($_GET["community_id"])) {
            $table = $table->where(["community_id" => intval($_GET["community_id"])]);
        }
        if (isset($_GET["model_id"]) && !empty($_GET["model_id"])) {
            $table = $table->where(["model_id" => intval($_GET["model_id"])]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single community_formula record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("community_formula");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Community formula record not found", 404); }
        controller::success($record);
    }

    /**
     * List formulas by community_id
     * @access * @uses api @method GET @require community_id=i32
     */
    public function list_by_community($community_id) {
        $table = new Table("community_formula");
        $data = $table->where(["community_id" => $community_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * List formulas by model_id
     * @access * @uses api @method GET @require model_id=i32
     */
    public function list_by_model($model_id) {
        $table = new Table("community_formula");
        $data = $table->where(["model_id" => $model_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Create a new community_formula record
     * @access * @uses api @method POST @require community_id=i32|model_id=i32|composition=double
     */
    public function create($community_id, $model_id, $composition) {
        $table = new Table("community_formula");
        // Verify community exists
        $community = (new Table("community"))->where(["id" => $community_id])->find();
        if (!$community) { controller::error("Community with id $community_id not found", 404); }
        // Verify model exists
        $model = (new Table("model_library"))->where(["id" => $model_id])->find();
        if (!$model) { controller::error("Model library record with id $model_id not found", 404); }
        // Validate composition range
        $compositionVal = doubleval($composition);
        if ($compositionVal < 0 || $compositionVal > 1) {
            controller::error("Composition must be in range [0, 1]", 400);
        }
        $data = ["community_id" => $community_id, "model_id" => $model_id, "composition" => $compositionVal];
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Community formula created successfully"]); }
        else { controller::error("Failed to create community formula", 500); }
    }

    /**
     * Update an existing community_formula record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("community_formula");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Community formula record not found", 404); }
        $data = [];
        if (isset($_POST["community_id"]) && !empty($_POST["community_id"])) {
            $community = (new Table("community"))->where(["id" => intval($_POST["community_id"])])->find();
            if (!$community) { controller::error("Community with id " . $_POST["community_id"] . " not found", 404); }
            $data["community_id"] = intval($_POST["community_id"]);
        }
        if (isset($_POST["model_id"]) && !empty($_POST["model_id"])) {
            $model = (new Table("model_library"))->where(["id" => intval($_POST["model_id"])])->find();
            if (!$model) { controller::error("Model library record with id " . $_POST["model_id"] . " not found", 404); }
            $data["model_id"] = intval($_POST["model_id"]);
        }
        if (isset($_POST["composition"]) && $_POST["composition"] !== "") {
            $compositionVal = doubleval($_POST["composition"]);
            if ($compositionVal < 0 || $compositionVal > 1) { controller::error("Composition must be in range [0, 1]", 400); }
            $data["composition"] = $compositionVal;
        }
        if (isset($_POST["note"])) { $data["note"] = $_POST["note"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Community formula updated successfully"]); }
        else { controller::error("Failed to update community formula", 500); }
    }

    /**
     * Delete a community_formula record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("community_formula");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Community formula record not found", 404); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Community formula deleted successfully"]); }
        else { controller::error("Failed to delete community formula", 500); }
    }
}
