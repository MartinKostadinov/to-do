var toDo = toDo || {};

(function () {
    //
    var categories = [];
    function Model() {
        var that = this;
    }
    Model.prototype.createCategory = function (title, titleColor, bgColor, position, id) {
        var category = {};
        // catCountId +=1;
        category.name = title;
        category.bgColor = bgColor;
        category.titleColor = titleColor;
        category.position = position;
        category.id = id;
        category.tasks = [];
        category.tasksCount = {
            ready: 0,
            notReady: 0,
            total: 0
        };
        categories.push(category);
        console.log(categories);
    };

    Model.prototype.addTasks = function (category,task) {
        category.tasks.push(task);
        category.tasksCount.notReady += 1;
        category.tasksCount.total += 1;
    };

    Model.prototype.removeTask = function (category, id) {
        var tasks = category.tasks;
        for (var i = 0; i < tasks.length; i++) {
            var element = tasks[i];
            if (element.taskId === id) {
                tasks.splice(i, 1);
            }
        }

    };
    Model.prototype.deleteCategory = function (id) {
        var that = this;
        var categories = that.getCategories();
        for (var i = 0; i < categories.length; i++) {
            var element = categories[i];
            if (element.id === id) {
                categories.splice(i, 1);
            }
        }
    };
    Model.prototype.getCategories = function () {
        return categories;
    };

    toDo.Model = Model;
}());
