<?php
/**
 * model_library Controller
 * 
 * RESTful API for managing model_library records.
 * Model library stores the standard GEMs (Genome-scale Metabolic models) 
 * for microbial species used in synthetic community design.
 * 
 * URL patterns:
 *   /model_library/list              - GET  - List all models (with optional pagination)
 *   /model_library/get?id=N          - GET  - Get model by ID
 *   /model_library/create            - POST - Create a new model
 *   /model_library/update?id=N       - POST - Update a model
 *   /model_library/delete?id=N       - POST - Delete a model
 */

class App {

    /**
     * List all model_library records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list() {
        $table = new Table("model_library");
        $page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
        $pageSize = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
        if (isset($_GET["name"]) && !empty($_GET["name"])) {
            $table = $table->where(["name" => like("%" . $_GET["name"] . "%")]);
        }
        if (isset($_GET["taxid"]) && !empty($_GET["taxid"])) {
            $table = $table->where(["taxid" => intval($_GET["taxid"])]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single model_library record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("model_library");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Model library record not found", 404); }
        controller::success($record);
    }

    /**
     * Create a new model_library record
     * @access * @uses api @method POST @require name=string
     */
    public function create($name) {
        $table = new Table("model_library");
        $data = ["name" => $name];
        if (isset($_POST["taxid"]) && !empty($_POST["taxid"])) { $data["taxid"] = intval($_POST["taxid"]); }
        if (isset($_POST["metabolic_vec"]) && !empty($_POST["metabolic_vec"])) { $data["metabolic_vec"] = $_POST["metabolic_vec"]; }
        if (isset($_POST["tf_vec"]) && !empty($_POST["tf_vec"])) { $data["tf_vec"] = $_POST["tf_vec"]; }
        if (isset($_POST["transporter_vec"]) && !empty($_POST["transporter_vec"])) { $data["transporter_vec"] = $_POST["transporter_vec"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Model library record created successfully"]); }
        else { controller::error("Failed to create model library record", 500); }
    }

    /**
     * Update an existing model_library record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("model_library");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Model library record not found", 404); }
        $data = [];
        if (isset($_POST["name"]) && !empty($_POST["name"])) { $data["name"] = $_POST["name"]; }
        if (isset($_POST["taxid"]) && $_POST["taxid"] !== "") { $data["taxid"] = intval($_POST["taxid"]); }
        if (isset($_POST["metabolic_vec"])) { $data["metabolic_vec"] = $_POST["metabolic_vec"]; }
        if (isset($_POST["tf_vec"])) { $data["tf_vec"] = $_POST["tf_vec"]; }
        if (isset($_POST["transporter_vec"])) { $data["transporter_vec"] = $_POST["transporter_vec"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Model library record updated successfully"]); }
        else { controller::error("Failed to update model library record", 500); }
    }

    /**
     * Delete a model_library record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("model_library");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Model library record not found", 404); }
        $formulaRef = (new Table("community_formula"))->where(["model_id" => $id])->count();
        if ($formulaRef > 0) { controller::error("Cannot delete: model is referenced by $formulaRef community_formula record(s)", 409); }
        $variantRef = (new Table("model_variant"))->where(["model_id" => $id])->count();
        if ($variantRef > 0) { controller::error("Cannot delete: model is referenced by $variantRef model_variant record(s)", 409); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Model library record deleted successfully"]); }
        else { controller::error("Failed to delete model library record", 500); }
    }
}
