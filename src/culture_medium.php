<?php
/**
 * culture_medium Controller
 * 
 * RESTful API for managing culture_medium records.
 * Culture medium defines the nutrient environment formula 
 * for virtual cell growth simulation.
 * 
 * URL patterns:
 *   /culture_medium/list                        - GET  - List all culture media
 *   /culture_medium/get?id=N                    - GET  - Get culture medium by ID
 *   /culture_medium/get_with_composition?id=N   - GET  - Get medium with substrate compositions
 *   /culture_medium/create                      - POST - Create a new culture medium
 *   /culture_medium/update?id=N                 - POST - Update a culture medium
 *   /culture_medium/delete?id=N                 - POST - Delete a culture medium
 */

class App {

    /**
     * List all culture_medium records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list() {
        $table = new Table("culture_medium");
        $page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
        $pageSize = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
        if (isset($_GET["name"]) && !empty($_GET["name"])) {
            $table = $table->where(["name" => like("%" . $_GET["name"] . "%")]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single culture_medium record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("culture_medium");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Culture medium record not found", 404); }
        controller::success($record);
    }

    /**
     * Get culture medium with its substrate compositions
     * @access * @uses api @method GET @require id=i32
     */
    public function get_with_composition($id) {
        $table = new Table("culture_medium");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Culture medium record not found", 404); }
        $compositions = (new Table("substrate_composition"))->where(["culture_medium" => $id])->select();
        $record["compositions"] = $compositions;
        controller::success($record);
    }

    /**
     * Create a new culture_medium record
     * @access * @uses api @method POST @require name=string
     */
    public function create($name) {
        $table = new Table("culture_medium");
        $data = ["name" => $name];
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Culture medium created successfully"]); }
        else { controller::error("Failed to create culture medium", 500); }
    }

    /**
     * Update an existing culture_medium record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("culture_medium");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Culture medium record not found", 404); }
        $data = [];
        if (isset($_POST["name"]) && !empty($_POST["name"])) { $data["name"] = $_POST["name"]; }
        if (isset($_POST["note"])) { $data["note"] = $_POST["note"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Culture medium updated successfully"]); }
        else { controller::error("Failed to update culture medium", 500); }
    }

    /**
     * Delete a culture_medium record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("culture_medium");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Culture medium record not found", 404); }
        $compRef = (new Table("substrate_composition"))->where(["culture_medium" => $id])->count();
        if ($compRef > 0) { controller::error("Cannot delete: culture medium is referenced by $compRef substrate_composition record(s)", 409); }
        $expRef = (new Table("experiment"))->where(["culture_medium" => $id])->count();
        if ($expRef > 0) { controller::error("Cannot delete: culture medium is referenced by $expRef experiment record(s)", 409); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Culture medium deleted successfully"]); }
        else { controller::error("Failed to delete culture medium", 500); }
    }
}
