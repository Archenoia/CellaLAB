<?php
/**
 * community Controller
 * 
 * RESTful API for managing community records.
 * Community represents a synthetic microbial community design 
 * that belongs to a specific project.
 * 
 * URL patterns:
 *   /community/list                    - GET  - List all communities
 *   /community/get?id=N                - GET  - Get community by ID
 *   /community/list_by_project         - GET  - List communities by project_id
 *   /community/get_with_formula?id=N   - GET  - Get community with its formula details
 *   /community/create                  - POST - Create a new community
 *   /community/update?id=N             - POST - Update a community
 *   /community/delete?id=N             - POST - Delete a community
 */

class App {

    /**
     * List all community records with optional pagination and filtering
     * @access * @uses api @method GET
     */
    public function list() {
        $table = new Table("community");
        $page = isset($_GET["page"]) ? intval($_GET["page"]) : 1;
        $pageSize = isset($_GET["page_size"]) ? intval($_GET["page_size"]) : 20;
        if (isset($_GET["name"]) && !empty($_GET["name"])) {
            $table = $table->where(["name" => like("%" . $_GET["name"] . "%")]);
        }
        if (isset($_GET["project_id"]) && !empty($_GET["project_id"])) {
            $table = $table->where(["project_id" => intval($_GET["project_id"])]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single community record by ID
     * @access * @uses api @method GET @require id=i32
     */
    public function get($id) {
        $table = new Table("community");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Community record not found", 404); }
        controller::success($record);
    }

    /**
     * List communities by project_id
     * @access * @uses api @method GET @require project_id=i32
     */
    public function list_by_project($project_id) {
        $table = new Table("community");
        $data = $table->where(["project_id" => $project_id])->select();
        controller::success(["data" => $data, "total" => count($data)]);
    }

    /**
     * Get community with its formula details
     * @access * @uses api @method GET @require id=i32
     */
    public function get_with_formula($id) {
        $table = new Table("community");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Community record not found", 404); }
        $formulas = (new Table("community_formula"))->where(["community_id" => $id])->select();
        $record["formulas"] = $formulas;
        controller::success($record);
    }

    /**
     * Create a new community record
     * @access * @uses api @method POST @require project_id=i32|name=string
     */
    public function create($project_id, $name) {
        $table = new Table("community");
        // Verify project exists
        $project = (new Table("project_data"))->where(["id" => $project_id])->find();
        if (!$project) { controller::error("Project with id $project_id not found", 404); }
        $data = ["project_id" => $project_id, "name" => $name];
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Community created successfully"]); }
        else { controller::error("Failed to create community", 500); }
    }

    /**
     * Update an existing community record
     * @access * @uses api @method POST @require id=i32
     */
    public function update($id) {
        $table = new Table("community");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Community record not found", 404); }
        $data = [];
        if (isset($_POST["project_id"]) && !empty($_POST["project_id"])) {
            $project = (new Table("project_data"))->where(["id" => intval($_POST["project_id"])])->find();
            if (!$project) { controller::error("Project with id " . $_POST["project_id"] . " not found", 404); }
            $data["project_id"] = intval($_POST["project_id"]);
        }
        if (isset($_POST["name"]) && !empty($_POST["name"])) { $data["name"] = $_POST["name"]; }
        if (isset($_POST["note"])) { $data["note"] = $_POST["note"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Community updated successfully"]); }
        else { controller::error("Failed to update community", 500); }
    }

    /**
     * Delete a community record by ID
     * @access * @uses api @method POST @require id=i32
     */
    public function delete($id) {
        $table = new Table("community");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Community record not found", 404); }
        $formulaRef = (new Table("community_formula"))->where(["community_id" => $id])->count();
        if ($formulaRef > 0) { controller::error("Cannot delete: community is referenced by $formulaRef community_formula record(s)", 409); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Community deleted successfully"]); }
        else { controller::error("Failed to delete community", 500); }
    }
}
