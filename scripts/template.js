var toDo = toDo || {};
(function ($) {
    'use strict';
    function Template() {
        var handlebars = window.handlebars || window.Handlebars,
            Handlebars = window.handlebars || window.Handlebars;
        //load task template
        function get(url) {
            var injectValueInHtml;
            var promise = new Promise(function (resolve, reject) {
                $.get(url, function (toDoTemplateHtml) {
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
    }
    toDo.Template = Template;
}(jQuery));
