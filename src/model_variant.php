<?php

include dirname(__DIR__) . "/etc/bootstrap.php";

/**
 * model_variant Controller
 * 
 * RESTful API for managing model_variant records.
 * Model variant represents a modified version of a standard GEMs model,
 * with specific variant parameters for simulation experiments.
 * 
 * URL patterns:
 *   /model_variant/list                    - GET  - List all model variants
 *   /model_variant/get?id=N                - GET  - Get model variant by ID
 *   /model_variant/list_by_model           - GET  - List variants by model_id
 *   /model_variant/get_with_variants?id=N  - GET  - Get variant with its detail records
 *   /model_variant/create                  - POST - Create a new model variant
 *   /model_variant/update?id=N             - POST - Update a model variant
 *   /model_variant/delete?id=N             - POST - Delete a model variant
 */

class App {

    /**
     * List all model_variant records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list($page=1, $pageSize = 20) {
        $table = new Table("model_variant");
        
        if (isset($_GET["name"]) && !empty($_GET["name"])) {
            $table = $table->where(["name" => like("%" . $_GET["name"] . "%")]);
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
     * Get a single model_variant record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("model_variant");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Model variant record not found", 404); }
        controller::success($record);
    }

    /**
     * List model variants by model_id
     * @access * @uses api @method GET @require model_id=i32
     */
    public function list_by_model($model_id) {
        $table = new Table("model_variant");
        $data = $table->where(["model_id" => $model_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Get model variant with its variant detail records
     * @access * @uses api @method GET @require id=i32
     */
    public function get_with_variants($id) {
        $table = new Table("model_variant");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Model variant record not found", 404); }
        $variantDetails = (new Table("variants"))->where(["variant_id" => $id])->select();
        $record["variant_details"] = $variantDetails;
        controller::success($record);
    }

    /**
     * Create a new model_variant record
     * @access * @uses api @method POST @require model_id=i32|name=string
     */
    public function create($model_id, $name) {
        $table = new Table("model_variant");
        // Verify model exists
        $model = (new Table("model_library"))->where(["id" => $model_id])->find();
        if (!$model) { controller::error("Model library record with id $model_id not found", 404); }
        $data = ["model_id" => $model_id, "name" => $name];
        if (isset($_POST["variants"]) && !empty($_POST["variants"])) { $data["variants"] = $_POST["variants"]; }
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Model variant created successfully"]); }
        else { controller::error("Failed to create model variant", 500); }
    }

    /**
     * Update an existing model_variant record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("model_variant");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Model variant record not found", 404); }
        $data = [];
        if (isset($_POST["model_id"]) && !empty($_POST["model_id"])) {
            $model = (new Table("model_library"))->where(["id" => intval($_POST["model_id"])])->find();
            if (!$model) { controller::error("Model library record with id " . $_POST["model_id"] . " not found", 404); }
            $data["model_id"] = intval($_POST["model_id"]);
        }
        if (isset($_POST["name"]) && !empty($_POST["name"])) { $data["name"] = $_POST["name"]; }
        if (isset($_POST["variants"])) { $data["variants"] = $_POST["variants"]; }
        if (isset($_POST["note"])) { $data["note"] = $_POST["note"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Model variant updated successfully"]); }
        else { controller::error("Failed to update model variant", 500); }
    }

    /**
     * Delete a model_variant record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("model_variant");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Model variant record not found", 404); }
        $dynamicsRef = (new Table("dynamics"))->where(["cella_id" => $id])->count();
        if ($dynamicsRef > 0) { controller::error("Cannot delete: model variant is referenced by $dynamicsRef dynamics record(s)", 409); }
        $variantsRef = (new Table("variants"))->where(["variant_id" => $id])->count();
        if ($variantsRef > 0) { controller::error("Cannot delete: model variant is referenced by $variantsRef variants record(s)", 409); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Model variant deleted successfully"]); }
        else { controller::error("Failed to delete model variant", 500); }
    }
}
