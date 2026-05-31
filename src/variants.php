<?php

include dirname(__DIR__) . "/etc/bootstrap.php";

/**
 * variants Controller
 * 
 * RESTful API for managing variants records.
 * Variants stores the detailed modification records of a model variant,
 * including gene expression level changes, enzyme kinetics parameter 
 * modifications, etc.
 * 
 * URL patterns:
 *   /variants/list                    - GET  - List all variants
 *   /variants/get?id=N                - GET  - Get variant by ID
 *   /variants/list_by_variant         - GET  - List variants by variant_id (model_variant)
 *   /variants/list_by_type            - GET  - List variants by type
 *   /variants/create                  - POST - Create a new variant
 *   /variants/update?id=N             - POST - Update a variant
 *   /variants/delete?id=N             - POST - Delete a variant
 */

class App {

    /**
     * List all variants records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list() {
        $table = new Table("variants");
        $page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
        $pageSize = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
        if (isset($_GET["variant_id"]) && !empty($_GET["variant_id"])) {
            $table = $table->where(["variant_id" => intval($_GET["variant_id"])]);
        }
        if (isset($_GET["type"]) && !empty($_GET["type"])) {
            $table = $table->where(["type" => $_GET["type"]]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single variants record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("variants");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Variant record not found", 404); }
        controller::success($record);
    }

    /**
     * List variants by variant_id (model_variant FK)
     * @access * @uses api @method GET @require variant_id=i32
     */
    public function list_by_variant($variant_id) {
        $table = new Table("variants");
        $data = $table->where(["variant_id" => $variant_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * List variants by type
     * @access * @uses api @method GET @require type=string
     */
    public function list_by_type($type) {
        $table = new Table("variants");
        $data = $table->where(["type" => $type])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Create a new variants record
     * @access * @uses api @method POST @require variant_id=i32|type=string|object_id=string
     */
    public function create($variant_id, $type, $object_id) {
        $table = new Table("variants");
        // Verify model_variant exists
        $modelVariant = (new Table("model_variant"))->where(["id" => $variant_id])->find();
        if (!$modelVariant) { controller::error("Model variant with id $variant_id not found", 404); }
        $data = ["variant_id" => $variant_id, "type" => $type, "object_id" => $object_id];
        if (isset($_POST["parameters"]) && !empty($_POST["parameters"])) {
            $params = json_decode($_POST["parameters"], true);
            if ($params === null && json_last_error() !== JSON_ERROR_NONE) {
                controller::error("Invalid JSON format for parameters field", 400);
            }
            $data["parameters"] = $_POST["parameters"];
        }
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Variant record created successfully"]); }
        else { controller::error("Failed to create variant record", 500); }
    }

    /**
     * Update an existing variants record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("variants");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Variant record not found", 404); }
        $data = [];
        if (isset($_POST["variant_id"]) && !empty($_POST["variant_id"])) {
            $modelVariant = (new Table("model_variant"))->where(["id" => intval($_POST["variant_id"])])->find();
            if (!$modelVariant) { controller::error("Model variant with id " . $_POST["variant_id"] . " not found", 404); }
            $data["variant_id"] = intval($_POST["variant_id"]);
        }
        if (isset($_POST["type"]) && !empty($_POST["type"])) { $data["type"] = $_POST["type"]; }
        if (isset($_POST["object_id"]) && !empty($_POST["object_id"])) { $data["object_id"] = $_POST["object_id"]; }
        if (isset($_POST["parameters"]) && $_POST["parameters"] !== "") {
            $params = json_decode($_POST["parameters"], true);
            if ($params === null && json_last_error() !== JSON_ERROR_NONE) {
                controller::error("Invalid JSON format for parameters field", 400);
            }
            $data["parameters"] = $_POST["parameters"];
        }
        if (isset($_POST["note"])) { $data["note"] = $_POST["note"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Variant record updated successfully"]); }
        else { controller::error("Failed to update variant record", 500); }
    }

    /**
     * Delete a variants record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("variants");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Variant record not found", 404); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Variant record deleted successfully"]); }
        else { controller::error("Failed to delete variant record", 500); }
    }
}
