<?php
/**
 * substrate_composition Controller
 * 
 * RESTful API for managing substrate_composition records.
 * Substrate composition defines the metabolite content within 
 * a culture medium formula.
 * 
 * URL patterns:
 *   /substrate_composition/list                    - GET  - List all compositions
 *   /substrate_composition/get?id=N                - GET  - Get composition by ID
 *   /substrate_composition/list_by_medium          - GET  - List compositions by culture_medium
 *   /substrate_composition/create                  - POST - Create a new composition
 *   /substrate_composition/update?id=N             - POST - Update a composition
 *   /substrate_composition/delete?id=N             - POST - Delete a composition
 */

class App {

    /**
     * List all substrate_composition records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list() {
        $table = new Table("substrate_composition");
        $page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
        $pageSize = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
        if (isset($_GET["culture_medium"]) && !empty($_GET["culture_medium"])) {
            $table = $table->where(["culture_medium" => intval($_GET["culture_medium"])]);
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
     * Get a single substrate_composition record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("substrate_composition");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Substrate composition record not found", 404); }
        controller::success($record);
    }

    /**
     * List compositions by culture_medium
     * @access * @uses api @method GET @require culture_medium=i32
     */
    public function list_by_medium($culture_medium) {
        $table = new Table("substrate_composition");
        $data = $table->where(["culture_medium" => $culture_medium])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Create a new substrate_composition record
     * @access * @uses api @method POST @require culture_medium=i32|metabolite_id=string|content=double
     */
    public function create($culture_medium, $metabolite_id, $content) {
        $table = new Table("substrate_composition");
        // Verify culture_medium exists
        $medium = (new Table("culture_medium"))->where(["id" => $culture_medium])->find();
        if (!$medium) { controller::error("Culture medium with id $culture_medium not found", 404); }
        // Validate content
        $contentVal = doubleval($content);
        if ($contentVal < 0) { controller::error("Content value must be non-negative", 400); }
        $data = ["culture_medium" => $culture_medium, "metabolite_id" => $metabolite_id, "content" => $contentVal];
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Substrate composition created successfully"]); }
        else { controller::error("Failed to create substrate composition", 500); }
    }

    /**
     * Update an existing substrate_composition record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("substrate_composition");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Substrate composition record not found", 404); }
        $data = [];
        if (isset($_POST["culture_medium"]) && !empty($_POST["culture_medium"])) {
            $medium = (new Table("culture_medium"))->where(["id" => intval($_POST["culture_medium"])])->find();
            if (!$medium) { controller::error("Culture medium with id " . $_POST["culture_medium"] . " not found", 404); }
            $data["culture_medium"] = intval($_POST["culture_medium"]);
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
        if ($result) { controller::success(["message" => "Substrate composition updated successfully"]); }
        else { controller::error("Failed to update substrate composition", 500); }
    }

    /**
     * Delete a substrate_composition record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("substrate_composition");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Substrate composition record not found", 404); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Substrate composition deleted successfully"]); }
        else { controller::error("Failed to delete substrate composition", 500); }
    }
}
