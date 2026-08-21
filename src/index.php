<?php

include dirname(__DIR__) . "/etc/bootstrap.php";

class App {

    /**
     * Cella LAB
     * 
     * @access *
     * @uses view
    */
    public function index() {
        View::Display(['title' => 'Cella LAB · Synthetic Microbial Consortium Database']);
    }

    /**
     * Cella LAB
     * 
     * @access *
     * @uses view
    */
    public function about() {
        View::Display(['title' => 'About · Cella LAB']);
    }

    /**
     * @access *
     * @uses view
     */
    public function home() {
        View::Display(['title' => 'Cella LAB · Synthetic Microbial Consortium Database']);
    }
    
    /**
     * Cella LAB
     * 
     * @access *
     * @uses view
    */
    public function experiment() {
        View::Display();
    }

    /**
     * Cella LAB
     * 
     * @access *
     * @uses view
    */
    public function project() {
        View::Display();
    }

    /* ===== Cella LAB database controllers ===== */
    /**
     * @access *
     * @uses view
     */
    public function search() {
        View::Display(['title' => 'Search · Cella LAB']);
    }

    /**
     * @access *
     * @uses view
     */
    public function search_result() {
        View::Display(['title' => 'Search Results · Cella LAB'], 'search_result.html');
    }

    /**
     * @access *
     * @uses view
     */
    public function consortium() {
        View::Display(['title' => 'Synthetic Consortium · Cella LAB']);
    }

    /**
     * @access *
     * @uses view
     */
    public function metagenome() {
        View::Display(['title' => 'Metagenome Sample · Cella LAB']);
    }

    /**
     * @access *
     * @uses view
     */
    public function pangenome() {
        View::Display(['title' => 'Pangenome Analysis · Cella LAB']);
    }

    /**
     * @access *
     * @uses view
     */
    public function pathway() {
        View::Display(['title' => 'Metabolic Pathway · Cella LAB']);
    }

    /**
     * @access *
     * @uses view
     */
    public function gene() {
        View::Display(['title' => 'Gene · Cella LAB']);
    }
}