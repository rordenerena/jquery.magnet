;
(function($) {
    $.fn.magnet = function(options) {

        var settings = $.extend({
            delay: 100, // milliseconds
            animation: "ease",
            css: {
                backgroundColor: red
            },
            callback: null,
            //Public method
            value: function(value) {
                if (value == undefined) {
                    return this.settings.value;
                } else {
                    //Set the value to value property
                }
            },
            //private method
            _search: function() {

            },
            destroy: function() {

            }
        }, options);

        return this.each(function() {

        });
    }

    // Private function for debugging.
    function debug($obj) {
        if (window.console && window.console.log) {
            window.console.log("hilight selection count: " + $obj.size());
        }
    }
    ;

})(jQuery);