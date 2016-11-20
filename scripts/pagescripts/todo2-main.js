(function($) {
    'use strict';
    //vars
    var $section = $('main').find('section');

    //functions loading templates  from scripts/pagescripts/templates/
    //function for loading add-task template
    function injectAddCatTemplate(e) {
        e.preventDefault();
        var $this = $(this),
            $container = $this.parents('article'),
            $getTaskTitle = $container.find('input[type="text"]').val(),
            $getTaskColorValue = $container.find('input[name="bg-color"]').val(),
            $getHeaderColorValue = $container.find('input[name="font-color"]').val(),
            $getSelectValue = $container.find('select').val(),
            url = 'scripts/pagescripts/templates/task-category.handlebars',
            addCatInputs = {
                title: $getTaskTitle,
                hColor: $getHeaderColorValue,
                bgColor: $getTaskColorValue
            };
        //load  add task template
        templates.addTask(url).then(function(addTaskCategory) {
            var taskTemplate = addTaskCategory(addCatInputs),
                $tasksParent = $('main').find('section.row'),
                $leftSide = $tasksParent.find('.left'),
                $middleSide = $tasksParent.find('.middle'),
                $rightSide = $tasksParent.find('.right'),
                appendTaskCatTemplate;
            //check select tag value  and append template
            if ($getSelectValue === 'Left') {
                $leftSide.append(taskTemplate);
            } else if ($getSelectValue === 'Middle') {
                appendTaskCatTemplate = $middleSide.append(taskTemplate);
            } else if ($getSelectValue === 'Right') {
                appendTaskCatTemplate = $rightSide.append(taskTemplate);
            }
            $container.find('input[type="text"]').val('');
        });
    }

    //function for loading  task template
    function injectTemplate(e) {
        //get Values
        e.preventDefault();

        var $findButtonParrent = $(this).parents('article'),
            $input = $findButtonParrent.find("input[name='setInput']"),
            url = 'scripts/pagescripts/templates/to-do-template.handlebars',
            $getInputValue = $input.val(),
            $findList = $findButtonParrent.find('ul'),
            inputValue = {
                value: $getInputValue
            };
        //load  Task template
        templates.get(url).then(function(injectValueInHtml) {
            var final = injectValueInHtml(inputValue),
                //find count of all tasks which have class task-ready
                totalCount = $findList.children('li').length + 1,
                readyTskCount = $findList.find('.task-ready').length;
            //get total tasks count
            $findList.append(final);
            $input.val('');
            $findButtonParrent.find('.total').text(totalCount);
            $findButtonParrent.find('.uncompleted').text(totalCount - readyTskCount);
        });

    }

    //function for  loading edit-task template
    function editTask() {
        var $this = $(this),
            $editParent = $this.parents('.task'),
            $taskValue = $editParent.find('p').text(),
            url = 'scripts/pagescripts/templates/edit.handlebars',
            textValue = {
                text: $taskValue
            };
        //load  edit-task template
        templates.edit(url).then(function(addEditTemplate) {
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
            ul = $task.parent('ul'),
            article = ul.parent('article'),
            $readyCount,
            $unReady,
            $readyTasks = article.find('.completed'),
            $notReadyTasks = article.find('.uncompleted'),
            $paragraphValue = $task.find('p'),
            $checkbox = $task.find('input[type="checkbox"]');
        //check if the task has class Ready
        if (!($this.hasClass('task-ready'))) {
            $paragraphValue.css('text-decoration', 'line-through');
            $checkbox.prop('checked', true);
            $this.removeClass('task-unready').addClass('task-ready');


        } else {
            $paragraphValue.css('text-decoration', 'none');
            $checkbox.prop('checked', false);
            $this.removeClass('task-ready').addClass('task-unready');
        }
        //set counter value
        $readyCount = ul.find('.task-ready').length;
        $unReady = ul.find('.task-unready').length;
        $readyTasks.text($readyCount);
        $notReadyTasks.text($unReady);

    }

    //Save in edit mode  and put the edited task to the paragraph
    function saveEdit() {
        var $this = $(this),
            $editedText = $this.prev().val(),
            $task = $this.parents('.task'),
            $saveButtonParent = $this.parent('div'),
            $paragraphValue = $task.find('p');
        $paragraphValue.text($editedText);
        animateEditOnAction($saveButtonParent);
        restoreEdit($task);
    }

    //Delete category
    function deleteTaskCategory() {
        var $this = $(this),
            $deleteTaskParent = $this.parent('article');
        $deleteTaskParent.addClass('delete-task-cat');
        setTimeout(function() {
            $this.parent('article').remove();
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

        parent.removeClass('edit-box').addClass('save-edit');
        setTimeout(function() {
            parent.remove();
        }, 400);

    }
    //Function restoring  the default state  for Task Button - Edit, when exiting edit mode either viea  Save or Cancel
    function restoreEdit(returnDefaultStateOfEdit) {
        var $selectEdit = returnDefaultStateOfEdit.find('.edit');
        if ($selectEdit.hasClass('disabled')) {
            $selectEdit.removeClass('disabled');
        }
    }
    //Remove Task
    function removeTask(e) {
        var $removeTask = $(e.target).parents('li'),
            article = $removeTask.parents('article'),
            total, completed, uncompleted;

        $removeTask.addClass('hide-task');
        setTimeout(function() {
            $removeTask.remove();
            //clear counters
            total = article.find('li').length;
            article.find('.total').text(total);
            completed = article.find('.task-ready').length;
            article.find('.completed').text(completed);
            uncompleted = article.find('.task-unready').length;
            article.find('.uncompleted').text(uncompleted);
        }, 400);

    }

    // all binds here
    function binds() {
        $section.on('click', 'article > .btn-danger', deleteTaskCategory);
        $('#add-category').on('click', injectAddCatTemplate);
        $section.on('click', '.btn-success', injectTemplate); //inject task template
        $section.on('click', 'article .delete', removeTask); //add delete button functionality
        $section.on('click', ' article .task-value', taskReady);
        $section.on('click', 'article .edit', editTask); //edit task function
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
