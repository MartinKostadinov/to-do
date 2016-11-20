(function($) {
    'use strict';
    //vars
    var $section = $('main').find('section');

    //functions

    //functions loading templates  from scripts/pagescripts/templates/
    //function for loading category template
    //functions here
    function injectAddCatTemplate(e) {
        e.preventDefault();
        var $this = $(this),
            $container = $this.parents('article'),
            $getTaskTitle = $container.find('input[type="text"]').val(),
            $getTaskColorValue = $container.find('input[name="bg-color"]').val(),
            $getHeaderColorValue = $container.find('input[name="font-color"]').val(),
            $getSelectValue = $container.find('select').val(),
            templateAddCat = $('#add-cat').html(),
            compileCatTemplate = Handlebars.compile(templateAddCat),
            addCatInputs = {
                title: $getTaskTitle,
                hColor: $getHeaderColorValue,
                bgColor: $getTaskColorValue
            };
        var injectCatValueInHtml = compileCatTemplate(addCatInputs),
            $tasksParent = $('main').find('section.row'),
            $leftSide = $tasksParent.find('.left'),
            $middleSide = $tasksParent.find('.middle'),
            $rightSide = $tasksParent.find('.right'),
            appendTaskCatTemplate;
        if ($getSelectValue === 'Left') {
            $leftSide.append(injectCatValueInHtml);
        } else if ($getSelectValue === 'Middle') {
            appendTaskCatTemplate = $middleSide.append(injectCatValueInHtml);
        } else if ($getSelectValue === 'Right') {
            appendTaskCatTemplate = $rightSide.append(injectCatValueInHtml);
        }
        $container.find('input[type="text"]').val('');
    }
    //function for loading  task template
    function injectTemplate() {

        var $this = $(this),
            $findButtonParrent = $this.parents('article'),
            $input = $findButtonParrent.find("input[name='setInput']"),
            templateHtml = $('#entry-template').html(),
            compileTemplate = Handlebars.compile(templateHtml),
            $getInputValue = $input.val(),
            $findList = $findButtonParrent.find('ul'),
            context = {
                value: $getInputValue
            },
            injectValueInHtml = compileTemplate(context),
            //find count of all tasks which have class task-ready

            totalCount = $findList.children('li').length + 1,
            readyTskCount = $findList.find('.task-ready').length,
            //apend template
            $appendTemplate = $findList.append(injectValueInHtml);

        //get total tasks count
        $input.val('');
        $findButtonParrent.find('.total').text(totalCount);
        $findButtonParrent.find('.uncompleted').text(totalCount - readyTskCount);;
    };

    //function for  loadign edit-task template
    function editTask() {
        var $this = $(this),
            $editParent = $this.parents('.task'),
            $taskValue = $editParent.find('p').text(),
            $templateEditHtml = $('#edit-mode').html(),
            $compileEditTemplate = Handlebars.compile($templateEditHtml),
            textValue = {
                text: $taskValue
            },
            addValueToTemplate = $compileEditTemplate(textValue);
        $editParent.append(addValueToTemplate);
        if (!$this.hasClass('disabled')) {
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
