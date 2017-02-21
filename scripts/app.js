var toDo = toDo || {};

(function () {
    'use strict';
    function App() {
        this.template = new toDo.Template();
        this.model = new toDo.Model();
        this.view = new toDo.View(this.template);        
        this.controller= new toDo.Controller(this.model, this.view);
    }
    var toDoApp = new App();
}());
