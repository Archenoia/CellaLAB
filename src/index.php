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
        View::Display();
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
    public function search() {
        View::Display(['title' => 'Search · Cella LAB']);
    }

    public function searchResult() {
        View::Display(['title' => 'Search Results · Cella LAB']);
    }

    public function consortium() {
        View::Display(['title' => 'Synthetic Consortium · Cella LAB']);
    }

    public function metagenome() {
        View::Display(['title' => 'Metagenome Sample · Cella LAB']);
    }

    public function pangenome() {
        View::Display(['title' => 'Pangenome Analysis · Cella LAB']);
    }

    public function pathway() {
        View::Display(['title' => 'Metabolic Pathway · Cella LAB']);
    }

    public function gene() {
        View::Display(['title' => 'Gene · Cella LAB']);
    }
}