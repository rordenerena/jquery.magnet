/**
 * jquery.magnet.js v0.1 BETA
 * jQuery Magnet Elements - released under MIT License 
 * Author: Roberto Orden <dakotadelnorte@gmail.com>
 * https://github.com/dakotadelnorte/jquery.magnet
 * Copyright (c) 2013 Roberto Orden {{{
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * }}}
 */
;
(function($) {
    $.fn.magnet = function(options) {
        if (jQuery.ui) {
            var settings = $.extend({
                offset: "10px",
//                offsetCenter: "10px",
                type: ["INNER", "CENTERV"], // Array with the types availables are: INNER, CENTERV, CENTERH, CENTER, ALL
                animate: true,
                dragCallback: null,
                overCallback: null,
                dropCallback: null,
                outCallback: null,
                animateCallback: null,
                debug: true,
                classAffected: "ui-draggable-dragging"
            }, options);

            var ctop, cleft, cwidth, cheight; // Children draggable data
            var ptop, pleft, pwidth, pheight; // Parent Droppable data
            var cCenterLeft, cCenterTop; // Center Horizontal and Vertical children position
            var vlimitLeftCentral, vlimitRightCentral; // Vertical center line data
            var hlimitTopCentral, hlimitBottomCentral; // Horizontal center line data
            var isInner, isCenterV, isCenterH, isCenter; // Type positioning flags
            var isAddedVisibleDropZone;
            var este;

            return this.each(function() {
                este = this;
                $(this).droppable({
                    activate: function(event, ui) {
                        magnetZone("hide");
                        getConfig(event, ui);
                        if (isValidElement(event, ui)) {
                            $(this).addClass("magnet-drag");
                            callback("drag", event, ui);
                        }
                    },
                    over: function(event, ui) {
                        magnetZone("show");
                        getConfig(event, ui);
                        if (isValidElement(event, ui)) {
                            $(this).addClass("magnet-hover");
                            callback("over", event, ui);
                        }
                    },
                    out: function(event, ui) {
                        magnetZone("hide");
                        getConfig(event, ui);
                        if (isValidElement(event, ui)) {
                            $(this).removeClass("magnet-hover");
                            callback("out", event, ui);
                        }
                    },
                    drop: function(event, ui) {
                        magnetZone("hide");
                        getConfig(event, ui);
                        if (isValidElement(event, ui)) {
                            var inner = false, centerv = false, centerh = false, center = false;

                            if (isInner) {
                                inner = getInner(event, ui);
                            }
                            if (isCenterV) {
                                centerv = getCenterV(event, ui);
                            }
                            if (isCenterH) {
                                centerh = getCenterH(event, ui);
                            }
                            if (isCenter) {
//                            center = getCenter(event, ui);
                            }

                            callback("drop", event, ui);

                            if (inner || centerv || centerh || center) {
                                animateElement(event, ui);
                            }
                        }
                    }
                });
            });
        }

        /**
         * Show/Hide the magnet zone
         * @param {type} action
         */
        function magnetZone(action) {
            if (action === "show") {
                $(este).find(".magnet-area").show();
            } else if (action === "hide") {
                $(este).find(".magnet-area").hide();
            }
        }

        /**
         * Check if the element dragging over the element droppable is valid
         * @param {type} event
         * @param {type} ui
         * @returns {@exp;ui@pro;draggable@call;hasClass}
         */
        function isValidElement(event, ui) {

            var el = ui.draggable;
            var classes = settings.classAffected;

            if (typeof classes === "string") {
                classes = classes.rtrim();
                classes = classes.split(",");
            } else {
                classes = new Array("");
            }

            var hasClasses = false;
            var tmp = "";
            for (var i = 0; i < classes.length; i++) {
                tmp = classes[i];
                tmp = tmp.trim();
                if (el.hasClass(tmp) || tmp === "") {
                    hasClasses = true;
                    break;
                }
            }
            return hasClasses;
        }

        /**
         * Method to animate the element dropped in this
         * @param {type} event
         * @param {type} ui
         */
        function animateElement(event, ui) {
            if (settings.animate) {
                callback("animate", event, ui);
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

            var offsetH = getOffset(este, "h");
            var offsetV = getOffset(este, "v");

            var pLeftCenter = pleft + (pwidth / 2);
            var pTopCenter = ptop + (pheight / 2);

            vlimitLeftCentral = pLeftCenter - offsetH;
            vlimitRightCentral = pLeftCenter + offsetH;

            hlimitTopCentral = pTopCenter - offsetV;
            hlimitBottomCentral = pTopCenter + offsetV;

            isInner = isCenter = isCenterH = isCenterV = false;

            if ($.inArray("INNER", settings.type) !== -1 || $.inArray("ALL", settings.type) !== -1) {
                isInner = true;
            }
            if ($.inArray("CENTERV", settings.type) !== -1 || $.inArray("ALL", settings.type) !== -1) {
                isCenterV = true;
            }
            if ($.inArray("CENTERH", settings.type) !== -1 || $.inArray("ALL", settings.type) !== -1) {
                isCenterH = true;
            }
            if ($.inArray("CENTER", settings.type) !== -1) {
                if ($.inArray("CENTERV", settings.type) !== -1 && $.inArray("CENTERH", settings.type) !== -1) {
                    //Nothing TODO
                } else {
                    isCenter = true;
                }
            }

            if (!isAddedVisibleDropZone) {
                isAddedVisibleDropZone = true;
                addVisibleDropZone();
            }
        }

        /**
         * Add elements that show the dropping zone enabled
         */
        function addVisibleDropZone() {
            if (isInner) {
                var offsetH = getOffset(este, "h");
                var offsetV = getOffset(este, "v");

                $("<div>").css({
                    position: "absolute",
                    top: offsetV + "px",
                    left: offsetH + "px",
                    width: (pwidth - (offsetH * 2)) + "px",
                    height: (pheight - (offsetV * 2)) + "px"
                }).addClass("magnet-area-inner magnet-area").hide().appendTo(este);
            }

            if (isCenterV) {
                var offsetH = getOffset(este, "h");

                $("<div>").css({
                    position: "absolute",
                    top: "0px",
                    left: ((pwidth / 2) - offsetH) + "px",
                    width: (offsetH * 2) + "px",
                    height: pheight + "px"
                }).addClass("magnet-area-vertical magnet-area").hide().appendTo(este);
            }

            if (isCenterH) {
                var offsetV = getOffset(este, "v");

                $("<div>").css({
                    position: "absolute",
                    top: ((pheight / 2) - offsetV) + "px",
                    left: "0px",
                    width: pwidth + "px",
                    height: (offsetV * 2) + "px"
                }).addClass("magnet-area-horizontal magnet-area").hide().appendTo(este);
            }
        }

        /**
         * Doing the work needed to center vertically the children dropped
         * @param {type} event
         * @param {type} ui
         * @returns {Boolean}
         */
        function getCenterV(event, ui) {
            getConfig(event, ui);
            var el = $(ui.draggable);
            if (cCenterLeft >= vlimitLeftCentral && cCenterLeft <= vlimitRightCentral) {
                el.css("left", function() {
                    var da = (pleft + (pwidth / 2) - (cwidth / 2)) + "px";
                    return da;
                });
                return true;
            }
            return false;
        }

        /**
         * Doing the work needed to center horizontally the children dropped
         * @param {type} event
         * @param {type} ui
         * @returns {Boolean}
         */
        function getCenterH(event, ui) {
            getConfig(event, ui);
            var el = $(ui.draggable);
            if (cCenterTop >= hlimitTopCentral && cCenterTop <= hlimitBottomCentral) {
                el.css("top", function() {
                    var da = (ptop + (pheight / 2) - (cheight / 2)) + "px";
                    return da;
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
            getConfig(event, ui);

            var el = ui.draggable;
            el = $(el);

            var inner = false;

            var offsetH = getOffset(este, "h");
            var offsetV = getOffset(este, "v");

            //Top
            if (Math.abs(ptop - ctop) <= offsetV) {
                debug("TOP: " + ptop + "px");
                el.css("top", ptop + "px");
                inner = true;
            }
            //Bottom
            if (Math.abs((ptop + pheight) - (ctop + cheight)) <= offsetV) {
                debug("BOTTOM: " + (ptop + pheight - cheight) + "px");
                el.css("top", (ptop + pheight - cheight) + "px");
                inner = true;
            }
            //Left
            if (Math.abs(pleft - cleft) <= offsetH) {
                debug("LEFT: " + pleft + "px");
                el.css("left", pleft + "px");
                inner = true;
            }
            //Right
            if (Math.abs((pleft + pwidth) - (cleft + cwidth)) <= offsetH) {
                debug("RIGHT: " + (pleft + pwidth - cwidth) + "px");
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
            var offset = (settings.offset);
            if (offset.indexOf("%") !== -1) {
                //In percentage
                var value = 0;
                if (position === "h") {
                    value = el.width();
                } else {
                    value = el.height();
                }

                return parseInt(value * (offset.replace("%", "", 'g') / 100), 10);
            } else if (offset.indexOf("px") !== -1) {
                //In pixels
                return parseInt(offset.replace("px", "", 'g'), 10);
            } else if (offset.indexOf("em") !== -1) {
                //EM => 1em === 16px
                return parseInt(offset.replace("em", "", 'g') * 16, 10);
            } else {
                return parseInt(offset, 10);
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
                    if (settings.outCallback !== null && (typeof settings.outCallback === 'function')) {
                        settings.outCallback(event, ui);
                    }
                    break;
                case "drop":
                    if (settings.dropCallback !== null && (typeof settings.dropCallback === 'function')) {
                        settings.dropCallback(event, ui);
                    }
                    break;
                case "over":
                    if (settings.overCallback !== null && (typeof settings.overCallback === 'function')) {
                        settings.overCallback(event, ui);
                    }
                    break;
                case "drag":
                    if (settings.dragCallback !== null && (typeof settings.dragCallback === 'function')) {
                        settings.dragCallback(event, ui);
                    }
                    break;
                case "animate":
                    if (settings.animateCallback !== null && (typeof settings.animateCallback === 'function')) {
                        settings.animateCallback(event, ui);
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

})(jQuery);
