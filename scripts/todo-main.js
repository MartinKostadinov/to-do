//class category
(function() {
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
            get: get,

        };
    }(jQuery));
    //Main Module
    var mainModule = (function($) {
        'use strict';
        //variables
        var $section = $('main').find('section'),
            $header = $('header'),
            $tasksParent = $('main').find('section.row'),
            $leftSide = $tasksParent.find('.left'),
            $middleSide = $tasksParent.find('.middle'),
            $rightSide = $tasksParent.find('.right'),
            arrCategories = [],
            taskCount;

        //function for loading add-task template
        //functions loading templates  from scripts/pagescripts/templates/
        function injectAddCatTemplate() {
            var $this = $(this),
                $container = $this.parents('article'),
                $input = $container.find('input[type="text"]'),
                $getTaskTitle = $input.val(),
                $getTaskColorValue = $container.find('input[name="bg-color"]').val(),
                $getTitleColorValue = $container.find('input[name="font-color"]').val(),
                $getPosition = $container.find('select').val(),
                url = 'templates/category.handlebars',
                addCategoryInputs, category;

            if (!$input[0].checkValidity()) {
                return;
            }
            //create new category and  push it into array
            category = new Category($getTaskTitle, $getTitleColorValue, $getTaskColorValue, $getPosition);
            arrCategories.push(category);
            //add template values
            addCategoryInputs = {
                title: category.name,
                hColor: category.titleColor,
                bgColor: category.bgColor,
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
        function createTask() {
            //get Values
            var $article = $(this).parents('article'),
                $articleDataId = $article.data('id'),
                $input = $article.find("input[name='setInput']"),
                url = 'templates/task.handlebars',
                $getInputValue = $input.val(),
                $findList = $article.find('ul'),
                task = {
                    taskValue: $getInputValue,
                    taskReady: false
                },
                inputValue, taskVal, tasksId, taskLen, selectedCategory, readyTasks;
            //check html validation
            if (!$input[0].checkValidity()) {
                return;
            }
            //add task value to the category object, and  add it to inputVal obj to inject it in html
            selectedCategory = categories.findCategory(arrCategories, $articleDataId);
            readyTasks = selectedCategory.finishedTasks().finishedTasks;

            if (selectedCategory.tasks.length > 0) {
                taskCount = selectedCategory.tasks.length;
            } else {
                taskCount = 0;
            }
            selectedCategory.addTasks(task);
            //set  task id
            taskLen = selectedCategory.tasks.length - 1;
            selectedCategory.tasks[taskLen].taskId = taskCount + 1;
            //get task input and value;
            taskVal = selectedCategory.tasks[taskLen].taskValue;
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
                $task = $this.parents('.task'),
                $article = $(this).parents('article'),
                $articleDataId = $article.data('id'),
                $taskDataId = $task.data('taskid'),
                url = 'templates/edit.handlebars',
                selectedCategory, selectedTask, textValue;

            selectedCategory = categories.findCategory(arrCategories, $articleDataId);
            selectedTask = categories.findTask(selectedCategory, $taskDataId);
            //template values
            textValue = {
                bgColor: selectedCategory.bgColor,
                titleColor: selectedCategory.titleColor,
                text: selectedTask.taskValue
            };
            //load  edit-task template
            templates.get(url).then(function(addEditTemplate) {
                var addValueToTemplate = addEditTemplate(textValue);
                $task.append(addValueToTemplate);
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
                $readyTasks = $article.find('.tasks-count__counter--completed'),
                $notReadyTasks = $article.find('.tasks-count__counter--uncompleted'),
                $paragraphValue = $task.find('p'),
                $checkbox = $task.find('input[type="checkbox"]'),
                readyTasks, unReadyTasks, readyTask, selectedCategory, selectedTask;
            //check if the task has class Ready

            selectedCategory = categories.findCategory(arrCategories, $articleDataId);
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
                $editedText = $this.parent('div')
                .prev()
                .val(),
                $task = $this.parents('.task'),
                $article = $task.parents('article'),
                $taskDataId = $task.data('taskid'),
                $articleDataId = $article.data('id'),
                $saveButtonParent = $this.parents('.edit'),
                $paragraphValue = $task.find('p'),
                selectedCategory, selectedTask;

            //find current category and task
            selectedCategory = categories.findCategory(arrCategories, $articleDataId);
            selectedTask = categories.findTask(selectedCategory, $taskDataId);
            selectedTask.taskValue = $editedText;

            $paragraphValue.text(selectedTask.taskValue);
            animateEditOnAction($saveButtonParent);
            restoreEdit($task);
        }

        //Delete category
        function deleteTaskCategory() {
            var $this = $(this),
                $article = $this.parents('article'),
                $articleDataId = $article.data('id'),
                selectedCategory, categoryId;

            selectedCategory = categories.findCategory(arrCategories, $articleDataId),
                categoryId = selectedCategory.id;
            arrCategories = arrCategories.filter(function(el) {
                return el.id !== categoryId;
            });
            $article.addClass('category--delete-js');
            //remove the element after animation completion
            setTimeout(function() {
                $article.remove();
            }, 400);

        }

        // Cancel edit mode
        function cancelEdit() {
            var $this = $(this),
                $task = $this.parents('.task'),
                $cancelButtonParent = $this.parents('.edit');
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
        //Function restoring  the default state  for the Edit button, when exiting edit mode either via  Save or Cancel
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
                $taskDataId = $task.data('taskid'),
                selectedCategory, selectedTask, readyTask, readyTasks, unReadyTasks;

            selectedCategory = categories.findCategory(arrCategories, $articleDataId);
            selectedTask = categories.findTask(selectedCategory, $taskDataId);

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

        function toggleDesktopMenu() {
            var $this = $(this),
                $toggleNav = $this.children(),
                $menuParent = $this.parent().find('.header__nav');
            $menuParent.toggleClass('header__nav--visible-js');
            $toggleNav.toggleClass('header__menu-btn__icon--active-js');
        }
        //Function for hiding   menu when user click outside of it
        function hideMenuIfClickedOutsied(e) {
            var $header = $('header'),
                $toggleNav = $header.find('.header__menu-btn__icon'),
                $nav = $header.find('.header__nav');
            //check if its clicked outside header, if not cancel menu
            if (!$header.is(e.target) && $header.has(e.target).length === 0) {
                $nav.removeClass('header__nav--visible-js');
                $toggleNav.removeClass('header__menu-btn__icon--active-js');
            }
        }

        function loadAboutHtml() {
            var $this = $(this),
                $ancorValue = $this.text(),
                $aboutCont = $('#about'),
                $about = $aboutCont.children('.about__description'),
                $toDoCont = $('#to-do');

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
            $header.on('click', '.header__menu-btn', toggleDesktopMenu);
            $header.on('click', '.header__nav__anchor', loadAboutHtml);
            $section.on('click', '.category__btn--close ', deleteTaskCategory);
            $('.btn--add-category').on('click', injectAddCatTemplate);
            $section.on('click', '.btn__create-task', createTask); //inject task template
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
