//class category
var Category = (function() {
    var catCountId = 1;

    function Category(name, bgColor, titleColor, postition) {
        if (!(this instanceof arguments.callee)) {
            return new Category(name, bgColor, titleColor, postition);
        }
        this.name = name;
        this.bgColor = bgColor;
        this.titleColor = titleColor;
        this.position = postition;
        this.id = catCountId++;
        this.tasks = [];

    }
    Category.prototype = {
        addTasks: function(task) {
            return this.tasks.push(task);
        },
        removeTask: function(id) {
            this.tasks = this.tasks.filter(function(el) {
                return el.taskId !== id;
            });
            return this.tasks;
        },
        finishedTasks: function() {
            var finishedTasks = 0,
                unfinishedTasks = 0;
            $.each(this.tasks, function(i, val) {
                if (val.taskReady === true) {
                    finishedTasks += 1;
                } else {
                    unfinishedTasks += 1;
                }
            });
            return {
                finishedTasks: finishedTasks,
                unfinishedTasks: unfinishedTasks
            };

        }
    };

    return Category;
}());
//module for looping over categories and tasks
var categories = (function() {
    //find selected category
    var findCategory = function(arrCategories, checkId) {
        var currCategory;
        $.each(arrCategories, function(i, val) {
            if (val.id === checkId) {
                currCategory = val;
                return;
            }
        });
        return currCategory;
    };
    //find current task
    var findTask = function(category, id) {
        var taskId;
        $.each(category.tasks, function(i, val) {
            if (val.taskId === id) {
                taskId = val;
                return;
            }
        });
        return taskId;
    };
    return {
        findCategory: findCategory,
        findTask: findTask
    };
}());

//promise for getting templates
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
    return {
        get: get,

    };
}(jQuery));
//Main Module
var mainModule = (function($) {
    'use strict';
    //variables
    var $section = $('main').find('section'),
        $tasksParent = $('main').find('section.row'),
        $leftSide = $tasksParent.find('.left'),
        $middleSide = $tasksParent.find('.middle'),
        $rightSide = $tasksParent.find('.right'),
        arrCategories = [],
        taskCount;

    //function for loading add-task template
    //functions loading templates  from scripts/pagescripts/templates/
    function injectAddCatTemplate(e) {
        e.preventDefault();
        var $this = $(this),
            $container = $this.parents('article'),
            $getTaskTitle = $container.find('input[type="text"]').val(),
            $getTaskColorValue = $container.find('input[name="bg-color"]').val(),
            $getTitleColorValue = $container.find('input[name="font-color"]').val(),
            $getPosition = $container.find('select').val(),
            url = 'templates/category.handlebars',
            addCategoryInputs;

        var category = new Category($getTaskTitle, $getTitleColorValue, $getTaskColorValue, $getPosition);
        arrCategories.push(category);
        addCategoryInputs = {
            title: category.name,
            hColor: category.bgColor,
            bgColor: category.titleColor,
            id: category.id
        };
        //load  add task template
        templates.get(url).then(function(addTemplate) {
            var taskTemplate = addTemplate(addCategoryInputs);
            //check select tag value  and append template
            if (category.position === 'Left') {
                $leftSide.append(taskTemplate);
            } else if (category.position === 'Middle') {
                $middleSide.append(taskTemplate);
            } else if (category.position === 'Right') {
                $rightSide.append(taskTemplate);
            }
            //clear create category input
            $container.find('input[type="text"]').val('');
        });

        taskCount = 1;
    }

    //function for loading  task template
    function injectTemplate(e) {
        //get Values
        e.preventDefault();
        var $article = $(this).parents('article'),
            $articleDataId = $article.data('id'),
            $input = $article.find("input[name='setInput']"),
            url = 'templates/task.handlebars',
            $getInputValue = $input.val(),
            $findList = $article.find('ul'),
            task = {
                taskName: $getInputValue,
                taskReady: false
            },
            inputValue, taskVal, tasksId, taskLen, selectedCategory, getReadyState, readyTasks;
        //add task value to the category object, and  add it to inputVal obj to inject it in html
        selectedCategory = categories.findCategory(arrCategories, $articleDataId);
        getReadyState = selectedCategory.finishedTasks();
        readyTasks = getReadyState.finishedTasks;

        if (selectedCategory.tasks.length > 0) {
            taskCount = selectedCategory.tasks.length;
        } else {
            taskCount = 0;
        }
        selectedCategory.addTasks(task);
        //get  task input and id
        taskLen = selectedCategory.tasks.length - 1;
        selectedCategory.tasks[taskLen].taskId = taskCount + 1;
        taskVal = selectedCategory.tasks[taskLen].taskName;
        tasksId = selectedCategory.tasks[taskLen].taskId;
        taskCount += 1;

        //object containing task value and id
        inputValue = {
            value: taskVal,
            taskId: tasksId
        };
        //load  Task template with the object inputValue
        templates.get(url).then(function(injectValueInHtml) {
            var final = injectValueInHtml(inputValue);
            $findList.append(final);
            $input.val('');
            $article.find('.tasks-count__counter--total').text(taskCount);
            $article.find('.tasks-count__counter--uncompleted').text(taskCount - readyTasks);
        });

    }

    //function for  loading edit-task template
    function editTask() {
        var $this = $(this),
            $editParent = $this.parents('.task'),
            $taskValue = $editParent.find('p').text(),
            url = 'templates/edit.handlebars',
            textValue = {
                text: $taskValue
            };
        //load  edit-task template
        templates.get(url).then(function(addEditTemplate) {
            var addValueToTemplate = addEditTemplate(textValue);
            $editParent.append(addValueToTemplate);
        });
        if (!$this.hasClass('disabled')) { // check if  the button is disabled
            $this.addClass('disabled');
        } else {
            $this.removeClass('disabled');
        }

    }

    //Functions adding functionality
    // Task-ready button functionality - on click, button is disabled, text changed, task is with line-through, checkbox-checked
    function taskReady() {
        var $this = $(this),
            $task = $this.parent('.task'),
            $ul = $task.parent('ul'),
            $article = $ul.parent('article'),
            $articleDataId = $article.data('id'),
            $taskDataId = $task.data('taskid'),
            readyTasks,
            unReadyTasks,
            readyTask,
            $readyTasks = $article.find('.tasks-count__counter--completed'),
            $notReadyTasks = $article.find('.tasks-count__counter--uncompleted'),
            $paragraphValue = $task.find('p'),
            $checkbox = $task.find('input[type="checkbox"]');
        //check if the task has class Ready

        var selectedCategory = categories.findCategory(arrCategories, $articleDataId),
            selectedTask = categories.findTask(selectedCategory, $taskDataId);


        if (!($this.hasClass('task__value--ready-js'))) {
            $paragraphValue.css('text-decoration', 'line-through');
            $checkbox.prop('checked', true);
            $this.removeClass('task__value--unready-js').addClass('task__value--ready-js');
            selectedTask.taskReady = true;

        } else {
            $paragraphValue.css('text-decoration', 'none');
            $checkbox.prop('checked', false);
            $this.removeClass('task__value--ready-js').addClass('task__value--unready-js');
            selectedTask.taskReady = false;
        }
        readyTask = selectedCategory.finishedTasks();
        //set counter value
        readyTasks = readyTask.finishedTasks;
        unReadyTasks = readyTask.unfinishedTasks;
        //update counters
        $readyTasks.text(readyTasks);
        $notReadyTasks.text(unReadyTasks);
    }

    //Save in edit mode  and put the edited task to the paragraph
    function saveEdit() {
        var $this = $(this),
            $editedText = $this.prev().val(),
            $task = $this.parents('.task'),
            $article = $task.parents('article'),
            $taskDataId = $task.data('taskid'),
            $articleDataId = $article.data('id'),
            $saveButtonParent = $this.parent('div'),
            $paragraphValue = $task.find('p'),
            selectedCategory, selectedTask;

        //find current category and task
        selectedCategory = categories.findCategory(arrCategories, $articleDataId);
        selectedTask = categories.findTask(selectedCategory, $taskDataId);
        selectedTask.taskName = $editedText;

        $paragraphValue.text(selectedTask.taskName);
        animateEditOnAction($saveButtonParent);
        restoreEdit($task);
    }

    //Delete category
    function deleteTaskCategory() {
        var $this = $(this),
            $article = $this.parent('article'),
            $articleDataId = $article.data('id'),
            selectedCategory, categoryId;

        selectedCategory = categories.findCategory(arrCategories, $articleDataId),
            categoryId = selectedCategory.id;
        arrCategories = arrCategories.filter(function(el) {
            return el.id !== categoryId;
        });
        $article.addClass('category--delete-js');
        setTimeout(function() {
            $article.remove();
        }, 400);

    }

    // Cancel edit mode
    function cancelEdit() {
        var $this = $(this),
            $task = $this.parents('.task'),
            $cancelButtonParent = $this.parent('div');
        animateEditOnAction($cancelButtonParent);
        restoreEdit($task);
    }
    //Function adding animation via CSS to Cancel and Save buttons in edit mode, removing the element from dom
    function animateEditOnAction(parent) {
        parent.removeClass('edit--show ').addClass('edit--hide');
        setTimeout(function() {
            parent.remove();
        }, 400);

    }
    //Function restoring  the default state  for Task Button - Edit, when exiting edit mode either viea  Save or Cancel
    function restoreEdit(returnDefaultStateOfEdit) {
        var $selectEdit = returnDefaultStateOfEdit.find('.task__btn__edit');
        if ($selectEdit.hasClass('disabled')) {
            $selectEdit.removeClass('disabled');
        }
    }
    //Remove Task
    function removeTask(e) {
        var $task = $(e.target).parents('.task'),
            $article = $task.parents('article'),
            $articleDataId = $article.data('id'),
            $taskDataId = $task.data('taskid');

        var selectedCategory = categories.findCategory(arrCategories, $articleDataId),
            selectedTask = categories.findTask(selectedCategory, $taskDataId),
            readyTask, readyTasks, unReadyTasks;

        selectedCategory.removeTask(selectedTask.taskId);
        taskCount = selectedCategory.tasks.length;
        $task.addClass('task--hide');
        setTimeout(function() {
            $task.remove();
            //clear counters
            $article.find('.tasks-count__counter--total').text(taskCount);
            $article.find('.tasks-count__counter--completed').text(readyTasks);
            $article.find('.tasks-count__counter--uncompleted').text(unReadyTasks);

        }, 400);
        readyTask = selectedCategory.finishedTasks();
        readyTasks = readyTask.finishedTasks;
        unReadyTasks = readyTask.unfinishedTasks;

    }

    // all binds here
    function binds() {
        $section.on('click', '.category__btn--close ', deleteTaskCategory);
        $('.btn--add-category').on('click', injectAddCatTemplate);
        $section.on('click', '.btn__create-task', injectTemplate); //inject task template
        $section.on('click', '.task__btn__delete', removeTask); //add delete button functionality
        $section.on('click', ' .task__value', taskReady);
        $section.on('click', '.task__btn__edit', editTask); //edit task function
        $section.on('click', 'article a.disabled', function(e) { //preventing click multiple clicks on edit button
            e.preventDefault();
        });
        $section.on('click', 'article .btn-cancel', cancelEdit); //functionality for  cancel button in delete mode
        $section.on('click', 'article .btn-info', saveEdit); //functionality for save button in delete mode
    }
    //load when ready
    $(document).ready(function() {
        binds();
    });

}(jQuery));
