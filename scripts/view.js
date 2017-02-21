var toDo = toDo || {};

(function ($) {
    'use strict';

    function View(template) {
        var that = this;
        that.template = template;
        that.$formContainer = $('#form-container');
        that.$formTitleInput = that.$formContainer.find('.form__title-input');
        that.$section = $('main').find('section');
        that.$header = $('#header');
        that.$btnCreateCat = $('.btn--add-category');
        that.$btnMenu = that.$header.find('.btn__menu');
        that.$currentCat = undefined;
        that.$currentTask = undefined;

    }

    View.prototype.render = function (render, data) {
        var that = this;
        var updateRender = {
            addCategory: function () {
                that.addNewCategory(data);
            },
            createNewTask: function () {
                that.addTask(data);
            },
            editTask: function () {
                that.editTask();
            },
            taskReady: function () {
                that.taskReady(data);
            },
            saveOnEdit: function () {
                that.saveEdit(data);
            },
            deleteCategory: function () {
                that.deleteCategory();
            },
            cancelEdit: function () {
                that.cancelEdit();
            },
            removeTask: function () {
                that.removeTask(data);
            },
            toggleMenu: function () {
                that.toggleDesktopMenu();
            },
            hideMenuIfClickedOut: function () {
                that.hideMenuIfClickedOutsied(data);
            },
            loadAboutHtml: function () {
                that.loadAboutHtml(data);
            }
        };
        updateRender[render]();
    };
    View.prototype.bind = function (event, handler) {
        var that = this;
        if (event === 'createCategory') {
            that.$btnCreateCat.on('click', function () {
                var $formTitleInputValue = that.$formTitleInput.val();
                var $formBgColorInputValue = that.$formContainer.find('#bg-color').val();
                var $formColorInputValue = that.$formContainer.find('#title-color').val();
                var $formSelectPositionValue = that.$formContainer.find('#select-position').val();
                //check HTML validation if input is valid
                if (!that.$formTitleInput[0].checkValidity()) {
                    return;
                }
                handler($formTitleInputValue, $formColorInputValue, $formBgColorInputValue, $formSelectPositionValue);
            });
        } else if (event === 'addTask') {
            that.$section.on('click', '.btn__create-task', function () {
                that.$currentCat = $(this).parents('article');
                var $categoryDataId = that.$currentCat.data('id');
                var $categoryInput = that.$currentCat.find('.category__create-task');
                var $categoryInputValue = $categoryInput.val();
                //check html validation
                if (!$categoryInput[0].checkValidity()) {
                    return;
                }
                handler($categoryDataId, $categoryInputValue);
            });
        } else if (event === 'editTask') {
            that.$section.on('click', '.task__btn__edit', function () {
                var $this = $(this);
                that.$currentTask = $this.parents('.task');
                that.$category = that.$currentTask.parents('article');
                handler();
            });
        } else if (event === 'setReadyState') {
            that.$section.on('click', ' .task__value', function () {
                var $this = $(this);
                that.$currentTask = $this.parent('.task');
                that.$currentCat = that.$currentTask.parents('.category');
                var $categoryDataId = that.$currentCat.data('id');
                var $taskDataId = that.$currentTask.data('taskid');

                handler($categoryDataId, $taskDataId, that.$currentTask);
            });
        } else if (event === 'saveEdit') {
            that.$section.on('click', 'article .btn__saveEdit', function () {
                var $this = $(this);
                that.$currentTask = $this.parents('.task');
                that.$currentCat = that.$currentTask.parents('.category');
                var $categoryDataId = that.$currentCat.data('id');
                var $taskDataId = that.$currentTask.data('taskid');
                var $editedTextValue = $this.parent('.edit__btns').prev('.edit__field').val();

                handler($categoryDataId, $taskDataId, that.$currentTask, $editedTextValue);
            });
        } else if (event === 'deleteCategory') {
            that.$section.on('click', '.category__btn--close ', function () {
                var $this = $(this);
                that.$currentCat = $this.parents('.category');
                var $categoryDataId = that.$currentCat.data('id');
                handler($categoryDataId);
            });
        } else if (event === 'cancelEdit') {
            that.$section.on('click', 'article .btn__cancelEdit', function () {
                var $this = $(this);
                that.$currentTask = $this.parents('.task');
                handler();
            });
        } else if (event === 'removeTask') {
            that.$section.on('click', '.task__btn__delete', function () {
                that.$currentTask = $(this).parents('.task');
                that.$currentCat = that.$currentTask.parents('article');
                var $categoryDataId = that.$currentCat.data('id');
                var $taskDataId = that.$currentTask.data('taskid');
                handler($categoryDataId, $taskDataId);
            });
        } else if (event === 'toggleMenu') {
            that.$header.on('click', '.btn__menu', function () {
                handler();
            });
        } else if (event === 'hideMenuIfClickedOut') {
            $(document).on('click', function (e) {
                var target = e.target;
                handler(target);
            });
        } else if (event === 'loadAboutHtml') {
            that.$header.on('click', '.nav__anchor', function () {
                var $this = $(this);
                var $ancorValue = $this.text();
                handler($ancorValue);
            });
        }

    };
    //create new category
    View.prototype.addNewCategory = function (category) {
        // e.preventDefault();
        var that = this;
        var $tasksContainer = $('#tasks-container');
        var $leftSide = $tasksContainer.find('.left');
        var $middleSide = $tasksContainer.find('.middle');
        var $rightSide = $tasksContainer.find('.right');
        var url = 'templates/category.handlebars';
        var currentCategory;

        currentCategory = category;

        that.template.get(url).then(function (addTemplate) {
            var taskTemplate = addTemplate(currentCategory.categoryInput);
            if (currentCategory.position === 'Left') {
                $leftSide.append(taskTemplate);
            } else if (currentCategory.position === 'Middle') {
                $middleSide.append(taskTemplate);
            } else if (currentCategory.position === 'Right') {
                $rightSide.append(taskTemplate);
            }

            that.$formTitleInput.val('');
        });
    };

    View.prototype.addTask = function addTask(taskData) {
        var that = this;
        var $category = that.$currentCat;
        var $categoryInput = that.$currentCat.find('.category__create-task');
        var $categoryList = $category.find('ul');
        var url = 'templates/task.handlebars';
        var addTaskTemplateValue;

        addTaskTemplateValue = {
            value: taskData.taskVal,
            taskId: taskData.tasksId
        };
        //load  Task template with the object addTaskTemplateValue
        that.template.get(url).then(function (injectValueInHtml) {
            var taskTemplate = injectValueInHtml(addTaskTemplateValue);
            $categoryList.append(taskTemplate);
            $categoryInput.val('');
            $category.find('.tasks-count__counter--total').text(taskData.taskTotal);
            $category.find('.tasks-count__counter--uncompleted').text(taskData.tasksToFinish);

        });
    };
    View.prototype.editTask = function editTask() {
        var that = this;
        var $editBtn = that.$currentTask.find('.task__btn__edit');
        var url = 'templates/edit.handlebars';
        var bgColor = that.$currentCat.css('background-color');
        var titleColor = that.$currentCat.find('h3').css('color');
        var taskValue = that.$currentTask.find('.task__text').text();
        var taskData;
        //template values
        taskData = {
            bgColor: bgColor,
            titleColor: titleColor,
            text: taskValue
        };
        //load  edit-task template
      
        that.template.get(url).then(function (addEditTemplate) {
            var editTaskTemplate = addEditTemplate(taskData);
            that.$currentTask.append(editTaskTemplate);
        });

        if (!$editBtn.hasClass('disabled')) { // check if  the button is disabled
            $editBtn.addClass('disabled');
        } else {
            $editBtn.removeClass('disabled');
        }

    };
    View.prototype.taskReady = function taskReady(data) {
        var that = this;
        var task = that.$currentTask;
        var taskBox = task.find('.task__value');
        var $taskReadyCounter = that.$currentCat.find('.tasks-count__counter--completed');
        var $taskToFinishCounter = that.$currentCat.find('.tasks-count__counter--uncompleted');
        var $taskTextValue = that.$currentTask.find('.task__text');
        var $taskCheckbox = that.$currentTask.find('.text__checkbox');
        var tasksWithStatusReady, tasksWithStatusNotReady, counters;

        //check for  Task marked as ready and change  the task status and  classes, if true
        if (!(taskBox.hasClass('task__value--ready-js'))) {
            $taskTextValue.css('text-decoration', 'line-through');
            $taskCheckbox.prop('checked', true);
            taskBox.removeClass('task__value--unready-js').addClass('task__value--ready-js');


        } else {
            $taskTextValue.css('text-decoration', 'none');
            $taskCheckbox.prop('checked', false);
            taskBox.removeClass('task__value--ready-js').addClass('task__value--unready-js');

        }
        counters = data;
        //set task counters values
        tasksWithStatusReady = counters.finishedTasks;
        tasksWithStatusNotReady = counters.unFinishedTasks;
        //update task counters
        $taskReadyCounter.text(tasksWithStatusReady);
        $taskToFinishCounter.text(tasksWithStatusNotReady);
    };
    //Save in edit mode  and put the edited task to the paragraph
    View.prototype.saveEdit = function saveEdit(data) {
        var that = this;
        var $saveBtn = that.$currentTask.find('.btn__saveEdit');
        var $taskEditContainer = $saveBtn.parents('.edit');
        var $taskTextValue = that.$currentTask.find('p');

        $taskTextValue.text(data);
        animateEditOnAction($taskEditContainer);
        restoreEdit(that.$currentTask);
    };
    //Function adding animation via CSS to Cancel and Save buttons in edit mode, removing the element from dom
    function animateEditOnAction(parent) {
        parent.removeClass('edit--show ').addClass('edit--hide');
        setTimeout(function () {
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
    //Delete category
    View.prototype.deleteCategory = function () {
        var that = this;
        that.$currentCat.addClass('category--delete-js');
        //remove the element after animation completion
        setTimeout(function () {
            that.$currentCat.remove();
        }, 400);

    };
    // Cancel edit mode
    View.prototype.cancelEdit = function cancelEdit() {
        var that = this;
        var $taskEditContainer = that.$currentTask.find('.edit');
        animateEditOnAction($taskEditContainer);
        restoreEdit(that.$currentTask);
    };
    //Remove Task
    View.prototype.removeTask = function removeTask(data) {
        var that = this;
        that.$currentTask.addClass('task--hide');
        setTimeout(function () {
            that.$currentTask.remove();
            //clear counters
            that.$currentCat.find('.tasks-count__counter--total').text(data.total);
            that.$currentCat.find('.tasks-count__counter--completed').text(data.ready);
            that.$currentCat.find('.tasks-count__counter--uncompleted').text(data.notReady);

        }, 400);

    };
    //Show Menu on click
    View.prototype.toggleDesktopMenu = function toggleDesktopMenu() {
        var that = this;
        var $sandwitchIcon = that.$btnMenu.children();
        var $nav = that.$header.find('.nav');
        $nav.toggleClass('nav--visible-js');
        $sandwitchIcon.toggleClass('btn__menu__icon--active-js');
    };
    //Function for hiding   menu when user click outside of it
    View.prototype.hideMenuIfClickedOutsied = function hideMenuIfClickedOutsied(target) {
        var that = this;
        var $btnMenuSandwitch = that.$btnMenu.find('.btn__menu__icon');
        var $nav = that.$header.find('.nav');
        //check if its clicked outside header, if not cancel menu
        if (!that.$header.is(target) && that.$header.has(target).length === 0) {
            $nav.removeClass('nav--visible-js');
            $btnMenuSandwitch.removeClass('btn__menu__icon--active-js');
        }
    };
    View.prototype.loadAboutHtml = function loadAboutHtml(ancor) {
        var $aboutCont = $('#about');
        var $about = $aboutCont.children('.about__description');
        var $toDoCont = $('#to-do');

        if (ancor === 'To do' && $about.length === 0) {
            return;
        }
        if (ancor === 'About') {
            if ($aboutCont.hasClass('hidden-js')) {
                $toDoCont.addClass('hidden-js');
                $aboutCont.removeClass('hidden-js');
            } else {
                $aboutCont.load('../../about.html');
                $toDoCont.addClass('hidden-js');
            }
        } else {
            $toDoCont.removeClass('hidden-js');
            $aboutCont.addClass('hidden-js');
        }

    };

    toDo.View = View;
}(jQuery));

