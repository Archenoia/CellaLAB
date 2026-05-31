<?php

include dirname(__DIR__) . "/etc/bootstrap.php";

/**
 * project_data Controller
 * 
 * RESTful API for managing project_data records.
 * Project data represents the top-level project entity for 
 * virtual cell simulation and analysis.
 * 
 * URL patterns:
 *   /project_data/list              - GET  - List all projects (with optional pagination)
 *   /project_data/get?id=N          - GET  - Get project by ID
 *   /project_data/get_by_project_id - GET  - Get project by project_id string
 *   /project_data/create            - POST - Create a new project
 *   /project_data/update?id=N       - POST - Update a project
 *   /project_data/delete?id=N       - POST - Delete a project
 */

class App {

    /**
     * List all project_data records with optional pagination and filtering
     * @access * 
     * @uses api 
     * @method GET
     */
    public function list($page = 1, $pageSize = 20) {
        $table = new Table("project_data");

        if (isset($_GET["name"]) && !empty($_GET["name"])) {
            $table = $table->where(["name" => like("%" . $_GET["name"] . "%")]);
        }
        if (isset($_GET["project_id"]) && !empty($_GET["project_id"])) {
            $table = $table->where(["project_id" => $_GET["project_id"]]);
        }
        $total = $table->count();
        $offset = ($page - 1) * $pageSize;
        $data = $table->limit($offset, $pageSize)->select();
        controller::success(["data" => $data, "total" => $total, "page" => $page, "page_size" => $pageSize]);
    }

    /**
     * Get a single project_data record by ID
     * @access * 
     * @uses api 
     * @method GET 
     * @require id=i32
     */
    public function get($id) {
        $table = new Table("project_data");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Project data not found", 404); }
        controller::success($record);
    }

    /**
     * Get a project_data record by project_id string
     * @access * 
     * @uses api 
     * @method GET 
     * @require project_id=string
     */
    public function get_by_project_id($project_id) {
        $table = new Table("project_data");
        $record = $table->where(["project_id" => $project_id])->find();
        if (!$record) { controller::error("Project data not found for project_id: " . $project_id, 404); }
        controller::success($record);
    }

    /**
     * Create a new project_data record
     * @access * 
     * @uses api 
     * @method POST 
     * @require project_id=string|name=string
     */
    public function create($project_id, $name) {
        $table = new Table("project_data");
        $existing = $table->where(["project_id" => $project_id])->find();
        if ($existing) { controller::error("Project with project_id '" . $project_id . "' already exists", 409); }
        $data = ["project_id" => $project_id, "name" => $name];
        if (isset($_POST["note"]) && !empty($_POST["note"])) { $data["note"] = $_POST["note"]; }
        $result = $table->add($data);
        if ($result) { controller::success(["id" => $result, "message" => "Project created successfully"]); }
        else { controller::error("Failed to create project", 500); }
    }

    /**
     * Update an existing project_data record
     * @access * 
     * @uses api 
     * @method POST 
     * @require id=i32
     */
    public function update($id) {
        $table = new Table("project_data");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Project data not found", 404); }
        $data = [];
        if (isset($_POST["project_id"]) && !empty($_POST["project_id"])) {
            $existing = $table->where(["project_id" => $_POST["project_id"]])->find();
            if ($existing && $existing["id"] != $id) { controller::error("Project with project_id '" . $_POST["project_id"] . "' already exists", 409); }
            $data["project_id"] = $_POST["project_id"];
        }
        if (isset($_POST["name"]) && !empty($_POST["name"])) { $data["name"] = $_POST["name"]; }
        if (isset($_POST["note"])) { $data["note"] = $_POST["note"]; }
        if (empty($data)) { controller::error("No fields to update", 400); }
        $result = $table->where(["id" => $id])->limit(1)->save($data);
        if ($result) { controller::success(["message" => "Project updated successfully"]); }
        else { controller::error("Failed to update project", 500); }
    }

    /**
     * Delete a project_data record by ID
     * @access * 
     * @uses api 
     * @method POST 
     * @require id=i32
     */
    public function delete($id) {
        $table = new Table("project_data");
        $record = $table->where(["id" => $id])->find();
        if (!$record) { controller::error("Project data not found", 404); }
        $communityRef = (new Table("community"))->where(["project_id" => $id])->count();
        if ($communityRef > 0) { controller::error("Cannot delete: project is referenced by $communityRef community record(s)", 409); }
        $experimentRef = (new Table("experiment"))->where(["proj_id" => $id])->count();
        if ($experimentRef > 0) { controller::error("Cannot delete: project is referenced by $experimentRef experiment record(s)", 409); }
        $result = $table->where(["id" => $id])->limit(1)->delete();
        if ($result) { controller::success(["message" => "Project deleted successfully"]); }
        else { controller::error("Failed to delete project", 500); }
    }
}
