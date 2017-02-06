(function() {
    //class category
    var Category = (function() {
        var catCountId = 1;

        function Category(name, titleColor, bgColor, postition) {
            //check  if its called with New
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
        Category.prototype.addTasks = function(task) {
            return this.tasks.push(task);
        };

        Category.prototype.removeTask = function(id) {
            this.tasks = this.tasks.filter(function(el) {
                return el.taskId !== id;
            });
            return this.tasks;
        };
        Category.prototype.taskReadyState = function() {
            var finishedTasks = 0;
            var unfinishedTasks = 0;
            $.each(this.tasks, function(i, val) {
                if (val.taskReadyState === true) {
                    finishedTasks += 1;
                } else {
                    unfinishedTasks += 1;
                }
            });
            return {
                finishedTasks: finishedTasks,
                unfinishedTasks: unfinishedTasks
            };
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
            var injectValueInHtml;
            var promise = new Promise(function(resolve, reject) {
                $.get(url, function(toDoTemplateHtml) {
                    if (injectValueInHtml) {
                        resolve(injectValueInHtml);
                    } else {
                        injectValueInHtml = Handlebars.compile(toDoTemplateHtml);
                        resolve(injectValueInHtml);
                    }
                });
            });

            return promise;
        }
        return {
            get: get
        };
    }(jQuery));
    //Main Module
    var mainModule = (function($) {
        'use strict';
        //variables
        var $section = $('main').find('section');
        var $header = $('#header');
        var arrCategories = [];
        var taskCount;

        //function for loading add-task template
        //functions loading templates  from scripts/pagescripts/templates/
        function injectAddCatTemplate() {
            var $this = $(this);
            var $formContainer = $this.parents('#form-container');
            var $formTitleInput = $formContainer.find('.form__title-input');
            var $formTitleInputValue = $formTitleInput.val();
            var $formBgColorInputValue = $formContainer.find('#bg-color').val();
            var $formTitleColorInputValue = $formContainer.find('title-color').val();
            var $formSelectPositionValue = $formContainer.find('#select-position').val();
            var $tasksContainer = $('#tasks-container');
            var $leftSide = $tasksContainer.find('.left');
            var $middleSide = $tasksContainer.find('.middle');
            var $rightSide = $tasksContainer.find('.right');
            var url = 'templates/category.handlebars';
            var category;
            //check HTML validation if input is valid
            if (!$formTitleInput[0].checkValidity()) {
                return;
            }
            //create new category
            category = createNewCategory($formTitleInputValue, $formTitleColorInputValue, $formBgColorInputValue, $formSelectPositionValue);
            //load  category template
            templates.get(url).then(function(addTemplate) {
                var taskTemplate = addTemplate(category.categoryInputs);
                //check select tag value  and append template
                if (category.position === 'Left') {
                    $leftSide.append(taskTemplate);
                } else if (category.position === 'Middle') {
                    $middleSide.append(taskTemplate);
                } else if (category.position === 'Right') {
                    $rightSide.append(taskTemplate);
                }
                //clear form title input
                $formTitleInput.val('');
            });

            taskCount = 1;
        }
        //create new category and  push it into categories array
        function createNewCategory(title, titleColor, bgColor, position) {
            var addCategoryInputs;
            var newCategory;
            //create new category with the inputs from the form
            newCategory = new Category(title, titleColor, bgColor, position);
            arrCategories.push(newCategory);
            //add template values
            addCategoryInputs = {
                title: newCategory.name,
                hColor: newCategory.titleColor,
                bgColor: newCategory.bgColor,
                id: newCategory.id
            };

            return {
                categoryInputs: addCategoryInputs,
                position: newCategory.position
            };
        }
        //create new task property in the  current Category
        function createTaskProperty(categoriesArray, categoryId, currentTask) {
            var currentCategory;
            var tasksWithStatusReady;
            var taskLen;
            var taskVal;
            var tasksId;
            var tasksToFinish;
            //add task value to the category object, and  add it to inputVal obj to inject it in html
            currentCategory = categories.findCategory(categoriesArray, categoryId);
            tasksWithStatusReady = currentCategory.taskReadyState().finishedTasks;
            currentCategory.addTasks(currentTask);
            //Set task count to tasks length
            if (currentCategory.tasks.length > 0) {
                taskCount = currentCategory.tasks.length;
            } else {
                taskCount = 0;
            }
            //add task object to the current category
            //currentCategory.addTasks( currentTask);
            taskLen = currentCategory.tasks.length - 1;
            //set taskId to the created task
            currentCategory.tasks[taskLen].taskId = taskCount + 1;
            //get task input and value;
            taskVal = currentCategory.tasks[taskLen].taskValue;
            tasksId = currentCategory.tasks[taskLen].taskId;
            //set tasks counters values
            tasksToFinish = taskCount - tasksWithStatusReady;

            return {
                taskVal: taskVal,
                tasksId: tasksId,
                tasksToFinish: tasksToFinish
            };
        }
        //function for loading  task template
        function addTask() {
            //get Values
            var $category = $(this).parents('article');
            var $categoryDataId = $category.data('id');
            var $categoryInput = $category.find('.category__create-task');
            var $categoryInputValue = $categoryInput.val();
            var $categoryList = $category.find('ul');
            var url = 'templates/task.handlebars';
            var task;
            var addTaskTemplateValue;
            var taskData;
            //check html validation
            if (!$categoryInput[0].checkValidity()) {
                return;
            }
            //task object
            task = {
                taskValue: $categoryInputValue,
                taskReadyState: false
            };
            //create Task property
            taskData = createTaskProperty(arrCategories, $categoryDataId, task);

            addTaskTemplateValue = {
                value: taskData.taskVal,
                taskId: taskData.tasksId
            };
            //load  Task template with the object addTaskTemplateValue
            templates.get(url).then(function(injectValueInHtml) {
                var taskTemplate = injectValueInHtml(addTaskTemplateValue);
                $categoryList.append(taskTemplate);
                $categoryInput.val('');
                $category.find('.tasks-count__counter--total').text(taskCount);
                $category.find('.tasks-count__counter--uncompleted').text(taskData.tasksToFinish);
            });
            //taskCount += 1;
        }

        //function for  loading edit-task template
        function editTask() {
            var $this = $(this);
            var $task = $this.parents('.task');
            var $category = $this.parents('article');
            var $categoryDataId = $category.data('id');
            var $taskDataId = $task.data('taskid');
            var url = 'templates/edit.handlebars';
            var currentCategory;
            var currentTask;
            var taskData;

            currentCategory = categories.findCategory(arrCategories, $categoryDataId);
            currentTask = categories.findTask(currentCategory, $taskDataId);
            //template values
            taskData = {
                bgColor: currentCategory.bgColor,
                titleColor: currentCategory.titleColor,
                text: currentTask.taskValue
            };
            //load  edit-task template
            templates.get(url).then(function(addEditTemplate) {
                var editTaskTemplate = addEditTemplate(taskData);
                $task.append(editTaskTemplate);
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
            var $this = $(this);
            var $task = $this.parent('.task');
            var $category = $task.parents('.category');
            var $categoryDataId = $category.data('id');
            var $taskDataId = $task.data('taskid');
            var $taskReadyCounter = $category.find('.tasks-count__counter--completed');
            var $taskToFinishCounter = $category.find('.tasks-count__counter--uncompleted');
            var $taskTextValue = $task.find('.task__text');
            var $taskCheckbox = $task.find('.text__checkbox');
            var tasksWithStatusReady;
            var tasksWithStatusNotReady;
            var taskReadyStatus;
            var currentCategory;
            var currentTask;
            //check if the task has class Ready
            currentCategory = categories.findCategory(arrCategories, $categoryDataId);
            currentTask = categories.findTask(currentCategory, $taskDataId);

            //check for  Task marked as ready and change  the task status and  classes, if true
            if (!($this.hasClass('task__value--ready-js'))) {
                $taskTextValue.css('text-decoration', 'line-through');
                $taskCheckbox.prop('checked', true);
                $this.removeClass('task__value--unready-js').addClass('task__value--ready-js');
                currentTask.taskReadyState = true;

            } else {
                $taskTextValue.css('text-decoration', 'none');
                $taskCheckbox.prop('checked', false);
                $this.removeClass('task__value--ready-js').addClass('task__value--unready-js');
                currentTask.taskReadyState = false;
            }
            taskReadyStatus = currentCategory.taskReadyState();
            //set task counters values
            tasksWithStatusReady = taskReadyStatus.finishedTasks;
            tasksWithStatusNotReady = taskReadyStatus.unfinishedTasks;
            //update task counters
            $taskReadyCounter.text(tasksWithStatusReady);
            $taskToFinishCounter.text(tasksWithStatusNotReady);
        }

        //Save in edit mode  and put the edited task to the paragraph
        function saveEdit() {
            var $this = $(this);
            var $editedTextValue = $this.parent('.edit__btns').prev('.edit__field').val();
            var $task = $this.parents('.task');
            var $taskDataId = $task.data('taskid');
            var $taskEditContainer = $this.parents('.edit');
            var $taskTextValue = $task.find('p');
            var $category = $task.parents('.category');
            var $categoryDataId = $category.data('id');
            var currentCategory;
            var currentTask;

            //find current category and task
            currentCategory = categories.findCategory(arrCategories, $categoryDataId);
            currentTask = categories.findTask(currentCategory, $taskDataId);
            currentTask.taskValue = $editedTextValue;

            $taskTextValue.text(currentTask.taskValue);
            animateEditOnAction($taskEditContainer);
            restoreEdit($task);
        }

        //Delete category
        function deleteTaskCategory() {
            var $this = $(this);
            var $category = $this.parents('article');
            var $categoryDataId = $category.data('id');
            var currentCategory;
            var categoryId;

            currentCategory = categories.findCategory(arrCategories, $categoryDataId),
                categoryId = currentCategory.id;
            arrCategories = arrCategories.filter(function(el) {
                return el.id !== categoryId;
            });
            $category.addClass('category--delete-js');
            //remove the element after animation completion
            setTimeout(function() {
                $category.remove();
            }, 400);

        }

        // Cancel edit mode
        function cancelEdit() {
            var $this = $(this);
            var $task = $this.parents('.task');
            var $taskEditContainer = $this.parents('.edit');
            animateEditOnAction($taskEditContainer);
            restoreEdit($task);
        }
        //Function adding animation via CSS to Cancel and Save buttons in edit mode, removing the element from dom
        function animateEditOnAction(parent) {
            parent.removeClass('edit--show ').addClass('edit--hide');
            setTimeout(function() {
                parent.remove();
            }, 400);

        }
        //Function restoring  the default state  for the Edit button, when exiting edit mode either via  Save or Cancel
        function restoreEdit(returnDefaultStateOfEdit) {
            var $selectEdit = returnDefaultStateOfEdit.find('.task__btn__edit');
            if ($selectEdit.hasClass('disabled')) {
                $selectEdit.removeClass('disabled');
            }
        }
        //Remove Task
        function removeTask(e) {
            var $task = $(e.target).parents('.task');
            var $category = $task.parents('article');
            var $categoryDataId = $category.data('id');
            var $taskDataId = $task.data('taskid');
            var currentCategory;
            var currentTask;
            var taskReadyStatus;
            var tasksWithStatusReady;
            var tasksWithStatusNotReady;

            currentCategory = categories.findCategory(arrCategories, $categoryDataId);
            currentTask = categories.findTask(currentCategory, $taskDataId);

            currentCategory.removeTask(currentTask.taskId);
            //set  nnew value to the  Task counter
            taskCount = currentCategory.tasks.length;
            $task.addClass('task--hide');

            setTimeout(function() {
                $task.remove();
                //clear counters
                $category.find('.tasks-count__counter--total').text(taskCount);
                $category.find('.tasks-count__counter--completed').text(tasksWithStatusReady);
                $category.find('.tasks-count__counter--uncompleted').text(tasksWithStatusNotReady);

            }, 400);
            taskReadyStatus = currentCategory.taskReadyState();
            tasksWithStatusReady = taskReadyStatus.finishedTasks;
            tasksWithStatusNotReady = taskReadyStatus.unfinishedTasks;

        }
        //Show Menu on click
        function toggleDesktopMenu() {
            var $this = $(this);
            var $btnMenuSandwitch = $this.children();
            var $nav = $header.find('.nav');
            $nav.toggleClass('nav--visible-js');
            $btnMenuSandwitch.toggleClass('btn__menu__icon--active-js');
        }
        //Function for hiding   menu when user click outside of it
        function hideMenuIfClickedOutsied(e) {
            var $header = $('header');
            var $btnMenuSandwitch = $header.find('.btn__menu__icon');
            var $nav = $header.find('.nav');
            //check if its clicked outside header, if not cancel menu
            if (!$header.is(e.target) && $header.has(e.target).length === 0) {
                $nav.removeClass('nav--visible-js');
                $btnMenuSandwitch.removeClass('btn__menu__icon--active-js');
            }
        }

        function loadAboutHtml() {
            var $this = $(this);
            var $ancorValue = $this.text();
            var $aboutCont = $('#about');
            var $about = $aboutCont.children('.about__description');
            var $toDoCont = $('#to-do');

            if ($ancorValue === 'To do' && $about.length === 0) {
                return;
            }
            if ($ancorValue === 'About') {
                if ($aboutCont.hasClass('hidden-js')) {
                    $toDoCont.addClass('hidden-js');
                    $aboutCont.removeClass('hidden-js');
                } else {
                    $aboutCont.load('./about.html');
                    $toDoCont.addClass('hidden-js');
                }
            } else {
                $toDoCont.removeClass('hidden-js');
                $aboutCont.addClass('hidden-js');
            }

        }
        // all binds here
        function binds() {
            $(document).on('click', hideMenuIfClickedOutsied);
            $header.on('click', '.btn__menu', toggleDesktopMenu);
            $header.on('click', '.nav__anchor', loadAboutHtml);
            $section.on('click', '.category__btn--close ', deleteTaskCategory);
            $('.btn--add-category').on('click', injectAddCatTemplate);
            $section.on('click', '.btn__create-task', addTask); //inject task template
            $section.on('click', '.task__btn__delete', removeTask); //add delete button functionality
            $section.on('click', ' .task__value', taskReady);
            $section.on('click', '.task__btn__edit', editTask); //edit task function
            $section.on('click', 'article a.disabled', function(e) { //preventing click multiple clicks on edit button
                e.preventDefault();
            });
            $section.on('click', 'article .btn__cancelEdit', cancelEdit); //functionality for  cancel button in delete mode
            $section.on('click', 'article .btn__saveEdit', saveEdit); //functionality for save button in delete mode
        }
        //load when ready
        $(document).ready(function() {
            binds();
        });

    }(jQuery));

}());
