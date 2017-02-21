var toDo = toDo || {};
(function ($) {
    'use strict';
    //IDs for categories and counts
    var catCountId = 0;
    var taskCount = 0;

    function Controller(model, view) {
        var that = this;
        that.catCountId = 0;
        that.model = model;
        that.view = view;

        that.view.bind('createCategory', function (title, titleColor, bgColor, position) {
            that.addNewCategory(title, titleColor, bgColor, position);
        });
        that.view.bind('addTask', function (categoryId, taskValue) {
            that.createTaskProperty(categoryId, taskValue);
        });
        that.view.bind('editTask', function () {
            that.view.render('editTask');
        });
        that.view.bind('setReadyState', function (catId, taskId) {
            that.checkReadyState(catId, taskId);
        });
        that.view.bind('saveEdit', function (catId, taskId, task, newValue) {
            that.saveNewTaskValue(catId, taskId, task, newValue);
        });
        that.view.bind('deleteCategory', function(catId){
            that.deleteCategory(catId);
        });
        that.view.bind('cancelEdit',function(){
            that.view.render('cancelEdit');
        });
        that.view.bind('removeTask',function(catId, taskId){
            that.removeTask(catId, taskId);
        });
        that.view.bind('toggleMenu', function (){
            that.view.render('toggleMenu');
        });
        that.view.bind('hideMenuIfClickedOut', function (target){
            that.view.render('hideMenuIfClickedOut', target);
        });
        that.view.bind('loadAboutHtml', function(ancor){
            that.view.render('loadAboutHtml',ancor);
        });
        //Creates new category        
        Controller.prototype.addNewCategory = function addNewCategory(title, titleColor, bgColor, position) {
            var categoryInput;
            catCountId += 1;
            that.model.createCategory(title, titleColor, bgColor, position, catCountId);
            categoryInput = that.getCategoryInput(title, titleColor, bgColor, position, catCountId);
            that.view.render('addCategory', categoryInput);
        };
        //Creates the data for the  template input
        Controller.prototype.getCategoryInput = function getCategoryInput(title, titleColor, bgColor, position, id) {
            var categoryInput = {
                title: title,
                hColor: titleColor,
                bgColor: bgColor,
                id: id
            };
            return {
                categoryInput: categoryInput,
                position: position
            };
        };
        //Creates new task property
        Controller.prototype.createTaskProperty = function (categoryId, taskValue) {
            var currentCategory, taskTemplateValue, taskLen, task,
                taskVal, tasksId, tasksToFinish, tasksTotalCount;

            currentCategory = that.findCategory(categoryId);

            task = {
                taskValue: taskValue,
                taskReadyState: false,
                taskId: taskCount
            };
            // Set task ID to be equal to the tasks length
            if (currentCategory.tasks.length > 0) {
                taskCount = currentCategory.tasks.length + 1;
            } else {
                taskCount = 0;
            }
            that.addTasksToCategory(currentCategory, task);

            tasksTotalCount = currentCategory.tasksCount.total;
            tasksToFinish = currentCategory.tasksCount.notReady;
            taskLen = currentCategory.tasks.length - 1;
            //get task input and value;
            taskVal = currentCategory.tasks[taskLen].taskValue;
            tasksId = currentCategory.tasks[taskLen].taskId;
            //Creat the tempalpate input
            taskTemplateValue = {
                taskVal: taskVal,
                tasksId: tasksId,
                tasksToFinish: tasksToFinish,
                taskTotal: tasksTotalCount
            };
            that.view.render('createNewTask', taskTemplateValue);
        };
        //Adding  the new Category to Array categories
        Controller.prototype.addTasksToCategory = function (category, task) {
            that.model.addTasks(category,task);
            taskCount += 1;
        };
        //Set Ready state
        Controller.prototype.checkReadyState = function (catId, taskId) {
            var currCategory = that.findCategory(catId);
            var currTask = that.findTask(currCategory, taskId);
            var taskCounters;
            //update tasks counters
            if (!currTask.taskReadyState) {
                that.setTaskState(currTask, currCategory, true);
            } else {

                that.setTaskState(currTask, currCategory, false);
            }
            taskCounters = that.geTasksCounters(currCategory);
            that.view.render('taskReady', taskCounters);
        };
        // Set Task ready state
        Controller.prototype.setTaskState = function (task, category, state) {
            task.taskReadyState = state;
            if (task.taskReadyState === true) {

                category.tasksCount.ready += 1;
                category.tasksCount.notReady -= 1;
            } else {
                category.tasksCount.ready -= 1;
                category.tasksCount.notReady += 1;
            }

        };
        //Set new  tasl val after edit
        Controller.prototype.saveNewTaskValue = function (catId, taskId, task, newValue) {
            var currCategory = that.findCategory(catId);
            var currTask = that.findTask(currCategory, taskId);
            currTask.taskValue = newValue;

            that.view.render('saveOnEdit',currTask.taskValue);
        };
        Controller.prototype.findCategory = function (checkId) {
            var currCategory, arrCategories;
            arrCategories = that.model.getCategories();
            $.each(arrCategories, function (i, val) {
                if (val.id === checkId) {
                    currCategory = val;
                    return;
                }
            });
            return currCategory;
        };
        Controller.prototype.findTask = function (category, id) {
            var taskId;
            $.each(category.tasks, function (i, val) {
                if (val.taskId === id) {
                    taskId = val;
                    return;
                }
            });
            return taskId;
        };
        Controller.prototype.geTasksCounters = function (category) {
            var finishedTasks = category.tasksCount.ready;
            var unFinishedTasks = category.tasksCount.notReady;
            var totalTasks = category.tasksCount.total;
            return {
                finishedTasks: finishedTasks,
                unFinishedTasks: unFinishedTasks,
                totalTasks: totalTasks
            };
        };
        Controller.prototype.deleteCategory = function(id) {
            var that = this;
            var currCategory = that.findCategory(id);
            var currCategoryId = currCategory.id;
            that.model.deleteCategory(currCategoryId);
            that.view.render('deleteCategory');
        };
        Controller.prototype.removeTask = function(catId, taskId){
            var that = this;
            var currCategory = that.findCategory(catId);
            var currTask = that.findTask(currCategory,taskId);
            var counters = currCategory.tasksCount;
            that.setCounters(currCategory, currTask);
            that.model.removeTask(currCategory,taskId);
            that.view.render('removeTask',counters);
        };
        Controller.prototype.setCounters = function(cat, task) {
            var state = task.taskReadyState;
            if (state === true) {
                if (cat.tasksCount.ready > 0) {
                    cat.tasksCount.ready -= 1;
                }
            } else if (state === false) {
                if (cat.tasksCount.notReady > 0) {
                    cat.tasksCount.notReady -= 1;
                }
            }

            cat.tasksCount.total -= 1;
        };
    }

    toDo.Controller = Controller;

}(jQuery));