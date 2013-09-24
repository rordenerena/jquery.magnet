;
(function($) {
    $.fn.magnet = function(options) {
        if (jQuery.ui) {
            var settings = $.extend({
                offset: "10%",
                offsetInner: "10px",
                offsetCenterV: "10px",
                offsetCenterH: "10px",
                offsetCenter: "10px",
                type: ["INNER", "CENTERV"], // Array with the types availables are: INNER, CENTERV, CENTERH, CENTER, ALL
                animate: true,
                dragCallback: null,
                overCallback: null,
                dropCallback: null,
                outCallback: null,
                animateCallback: null,
                debug: true
            }, options);

            var ctop, cleft, cwidth, cheight; // Children draggable data
            var ptop, pleft, pwidth, pheight; // Parent Droppable data
            var cCenterLeft, cCenterTop; // Center Horizontal and Vertical children position
            var vlimitLeftCentral, vlimitRightCentral; // Vertical center line data
            var hlimitLeftCentral, hlimitRightCentral; // Horizontal center line data
            var este;

            return this.each(function() {
                $(this).droppable({
                    activate: function(event, ui) {
                        $(this).addClass("overDrop");
                        callback("drag", event, ui);
                    },
                    over: function(event, ui) {
                        $(this).addClass("hoverDrop");
                        callback("over", event, ui);
                    },
                    out: function(event, ui) {
                        $(this).removeClass("hoverDrop");
                        callback("out", event, ui);
                    },
                    drop: function(event, ui) {
                        este = this;
                        getConfig(event, ui);

                        var inner = false, centerv = false, centerh = false, center = false;
                        
                        if ($.inArray("INNER", settings.type)!==-1 || $.inArray("ALL", settings.type)!==-1) {
                            debug("With Inner");
                            inner = getInner(event, ui);
                        }
                        if ($.inArray("CENTERV", settings.type)!==-1 || $.inArray("ALL", settings.type)!==-1) {
                            debug("With CenterV");
                            centerv = getCenterV(event, ui);
                        }
                        if ($.inArray("CENTERH", settings.type)!==-1 || $.inArray("ALL", settings.type)!==-1) {
                            debug("With CenterH");
//                            centerh = getCenterH(event, ui);
                        }
                        if ($.inArray("CENTER", settings.type)!==-1 || $.inArray("ALL", settings.type)!==-1) {
                            debug("With Center Complete");
//                            center = getCenter(event, ui);
                        }

                        callback("drop", event, ui);

                        if (inner || centerv || centerh || center) {
                            animateElement();
                            callback("animate", event, ui)
                        }
                    }
                });
            });
        }
        /**
         * Method to animate the element dropped in this
         */
        function animateElement() {
            if (settings.animate) {

            }
        }

        /**
         * Set the data values needed to plugin
         * @param {type} event
         * @param {type} ui
         */
        function getConfig(event, ui) {
            var el = ui.draggable;
            el = $(el);

            ctop = el.position().top;
            cleft = el.position().left;
            cheight = el.height();
            cwidth = el.width();

            ptop = $(este).position().top;
            pleft = $(este).position().left;
            pheight = $(este).height();
            pwidth = $(este).width();

            cCenterLeft = (cleft + (cwidth / 2));
            cCenterTop = (ctop + (cheight / 2));

            var offsetH = getOffset(el, "h");
            var offsetV = getOffset(el, "v");

            vlimitLeftCentral = (pleft + (pwidth / 2) - offsetV);
            vlimitRightCentral = (pleft + (pwidth / 2) + offsetV);

            hlimitLeftCentral = (ptop + (pheight / 2) - offsetH);
            hlimitRightCentral = (ptop + (pheight / 2) + offsetH);
        }

        /**
         * Doing the work needed to center vertically the children dropped
         * @param {type} event
         * @param {type} ui
         * @returns {Boolean}
         */
        function getCenterV(event, ui) {
            var el = $(ui.draggable);
            if (cCenterLeft >= vlimitLeftCentral && cCenterLeft <= vlimitRightCentral) {
                el.css("left", function() {
                    return (pleft + (pwidth / 2) - (cwidth / 2)) + "px";
                });
                return true;
            }
            return false;
        }

        /**
         * Doing the work needed to set the position if configured as INNER
         * @param {type} event
         * @param {type} ui
         */
        function getInner(event, ui) {
            var el = ui.draggable;
            el = $(el);

            var inner = false;

            var offsetH = getOffset(el, "h");
            var offsetV = getOffset(el, "v");

            if (Math.abs(ptop - ctop) <= offsetV) {
                el.css("top", ptop + "px");
                inner = true;
            }

            if (Math.abs((ptop + pheight) - (ctop + cheight)) <= offsetV) {
                el.css("top", (ptop + pheight - cheight) + "px");
                inner = true;
            }

            if (Math.abs(pleft - cleft) <= offsetH) {
                el.css("left", pleft + "px");
                inner = true;
            }
            if (Math.abs((pleft + pwidth) - (cleft + cwidth)) <= offsetH) {
                el.css("left", (pleft + pwidth - cwidth) + "px");
                inner = true;
            }

            return inner;
        }

        /**
         * Return the number of pixels setted in offset indepently if are em, px or %.
         * @param {type} el
         * @param {type} position
         * @returns {@exp;settings@pro;offset|Number|@exp;settings@pro;offset@call;replace|value}
         */
        function getOffset(el, position) {
            el = $(el);

            if (settings.offset.indexOf("%") !== -1) {
                //In percentage
                var value = 0;
                if (position === "h") {
                    value = el.width;
                } else {
                    value = el.height;
                }

                return value * settings.offset.replace("%", "", 'g');
            } else if (settings.offset.indexOf("px") !== -1) {
                //In pixels
                return settings.offset.replace("px", "", 'g');
            } else if (settings.offset.indexOf("em") !== -1) {
                //EM => 1em === 16px
                return settings.offset.replace("em", "", 'g') * 16;
            } else {
                return settings.offset;
            }

        }
        /**
         * Generic auxiliar method to invoke the callbacks setted by the user
         * @param {type} type
         * @param {type} event
         * @param {type} ui
         */
        function callback(type, event, ui) {
            switch (type) {
                case "out":
                    if (settings.outCallback !== null) {
                        settings.outCallback(event, ui);
                    }
                    break;
                case "drop":
                    if (settings.dropCallback !== null) {
                        settings.dropCallback(event, ui);
                    }
                    break;
                case "over":
                    if (settings.overCallback !== null) {
                        settings.overCallback(event, ui);
                    }
                    break;
                case "drag":
                    if (settings.dragCallback !== null) {
                        settings.dragCallback(event, ui);
                    }
                    break;
            }
        }

        function debug(message) {
            if (settings.debug && window.console && window.console.log) {
                window.console.log(message);
            }
        }

    };

    // Private function for debugging.
    function debug(message) {
        if (window.console && window.console.log) {
            window.console.log(message);
        }
    }
    ;

})(jQuery);