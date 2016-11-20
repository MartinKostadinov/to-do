var templates = (function($) {
    var handlebars = window.handlebars || window.Handlebars,
        Handlebars = window.handlebars || window.Handlebars;
//load task template
    function get(url) {
        var promise = new Promise(function(resolve, reject) {
            $.get(url, function(toDoTemplateHtml) {
                var injectValueInHtml = Handlebars.compile(toDoTemplateHtml);
                resolve(injectValueInHtml);
            });
        });

        return promise;
    }
//load edit mode template
    function edit(url) {
        var promiseEdit = new Promise(function(resolve, reject) {
            $.get(url, function(addEditFunctionality) {
                var addEditTemplate = Handlebars.compile(addEditFunctionality);
                resolve(addEditTemplate);
            });
        });

        return promiseEdit;
    }
//load  task category template
    function addTask(url) {
        var promiseAddTask = new Promise(function(resolve, reject) {
            $.get(url, function(addTask) {
                var addTaskCategory = Handlebars.compile(addTask);
                resolve(addTaskCategory);
            });

        });
        return promiseAddTask;
    }
    return {
        get: get,
        edit: edit,
        addTask: addTask
    };
}(jQuery));
