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
