<?php
/**
 * dynamics Controller
 * 
 * RESTful API for managing dynamics records.
 * Dynamics stores the cellular component dynamics data from 
 * virtual cell simulation, including time-series mass content 
 * vectors for molecules.
 * 
 * URL patterns:
 *   /dynamics/list                    - GET  - List all dynamics records
 *   /dynamics/get?id=N                - GET  - Get dynamics by ID
 *   /dynamics/list_by_experiment      - GET  - List dynamics by experiment_id
 *   /dynamics/list_by_cella           - GET  - List dynamics by cella_id (model_variant)
 *   /dynamics/create                  - POST - Create a new dynamics record
 *   /dynamics/update?id=N             - POST - Update a dynamics record
 *   /dynamics/delete?id=N             - POST - Delete a dynamics record
 */

class App {

    /**
     * List all dynamics records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list() {
        $table = new Table("dynamics");
        $page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
        $pageSize = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
        if (isset($_GET["experiment_id"]) && !empty($_GET["experiment_id"])) {
            $table = $table->where(["experiment_id" => intval($_GET["experiment_id"])]);
        }
        if (isset($_GET["cella_id"]) && !empty($_GET["cella_id"])) {
            $table = $table->where(["cella_id" => intval($_GET["cella_id"])]);
        }
        if (isset($_GET["molecule_id"]) && !empty($_GET["molecule_id"])) {
            $table = $table->where(["molecule_id" => $_GET["molecule_id"]]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single dynamics record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("dynamics");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Dynamics record not found", 404); }
        controller::success($record);
    }

    /**
     * List dynamics by experiment_id
     * @access * @uses api @method GET @require experiment_id=i32
     */
    public function list_by_experiment($experiment_id) {
        $table = new Table("dynamics");
        $data = $table->where(["experiment_id" => $experiment_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * List dynamics by cella_id (model_variant FK)
     * @access * @uses api @method GET @require cella_id=i32
     */
    public function list_by_cella($cella_id) {
        $table = new Table("dynamics");
        $data = $table->where(["cella_id" => $cella_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Create a new dynamics record
     * @access * @uses api @method POST @require experiment_id=i32|cella_id=i32|molecule_id=string|x0=double|dynamics=string
     */
    public function create($experiment_id, $cella_id, $molecule_id, $x0, $dynamics) {
        $table = new Table("dynamics");
        // Verify experiment exists
        $exp = (new Table("experiment"))->where(["id" => $experiment_id])->find();
        if (!$exp) { controller::error("Experiment with id $experiment_id not found", 404); }
        // Verify model_variant exists
        $variant = (new Table("model_variant"))->where(["id" => $cella_id])->find();
        if (!$variant) { controller::error("Model variant with id $cella_id not found", 404); }
        $data = [
            "experiment_id" => $experiment_id,
            "cella_id"      => $cella_id,
            "molecule_id"   => $molecule_id,
            "x0"            => doubleval($x0),
            "dynamics"      => $dynamics
        ];
        if (isset($_POST["mean"]) && $_POST["mean"] !== "") { $data["mean"] = doubleval($_POST["mean"]); }
        if (isset($_POST["min"]) && $_POST["min"] !== "") { $data["min"] = doubleval($_POST["min"]); }
        if (isset($_POST["max"]) && $_POST["max"] !== "") { $data["max"] = doubleval($_POST["max"]); }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Dynamics record created successfully"]); }
        else { controller::error("Failed to create dynamics record", 500); }
    }

    /**
     * Update an existing dynamics record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("dynamics");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Dynamics record not found", 404); }
        $data = [];
        if (isset($_POST["experiment_id"]) && !empty($_POST["experiment_id"])) {
            $exp = (new Table("experiment"))->where(["id" => intval($_POST["experiment_id"])])->find();
            if (!$exp) { controller::error("Experiment with id " . $_POST["experiment_id"] . " not found", 404); }
            $data["experiment_id"] = intval($_POST["experiment_id"]);
        }
        if (isset($_POST["cella_id"]) && !empty($_POST["cella_id"])) {
            $variant = (new Table("model_variant"))->where(["id" => intval($_POST["cella_id"])])->find();
            if (!$variant) { controller::error("Model variant with id " . $_POST["cella_id"] . " not found", 404); }
            $data["cella_id"] = intval($_POST["cella_id"]);
        }
        if (isset($_POST["molecule_id"]) && !empty($_POST["molecule_id"])) { $data["molecule_id"] = $_POST["molecule_id"]; }
        if (isset($_POST["x0"]) && $_POST["x0"] !== "") { $data["x0"] = doubleval($_POST["x0"]); }
        if (isset($_POST["dynamics"]) && !empty($_POST["dynamics"])) { $data["dynamics"] = $_POST["dynamics"]; }
        if (isset($_POST["mean"]) && $_POST["mean"] !== "") { $data["mean"] = doubleval($_POST["mean"]); }
        if (isset($_POST["min"]) && $_POST["min"] !== "") { $data["min"] = doubleval($_POST["min"]); }
        if (isset($_POST["max"]) && $_POST["max"] !== "") { $data["max"] = doubleval($_POST["max"]); }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Dynamics record updated successfully"]); }
        else { controller::error("Failed to update dynamics record", 500); }
    }

    /**
     * Delete a dynamics record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("dynamics");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Dynamics record not found", 404); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Dynamics record deleted successfully"]); }
        else { controller::error("Failed to delete dynamics record", 500); }
    }
}
