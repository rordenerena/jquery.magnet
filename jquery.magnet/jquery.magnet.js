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
                padding: "0px",
                type: ["INNER"], // Array with the types availables are: INNER, CENTERV, CENTERH, CENTER, ALL
                animate: true,
                highlight: true,
                dragCallback: null,
                overCallback: null,
                dropCallback: null,
                outCallback: null,
                animateCallback: null,
                debug: true,
                classAffected: "",
                classEphemeral: "",
                tolerance: "touch"
            }, options);

            var ctop, cleft, cwidth, cheight; // Children draggable data
            var ptop, pleft, pwidth, pheight; // Parent Droppable data
            var cCenterLeft, cCenterTop; // Center Horizontal and Vertical children position
            var vlimitLeftCentral, vlimitRightCentral; // Vertical center line data
            var hlimitTopCentral, hlimitBottomCentral; // Horizontal center line data
            var isInner, isCenterV, isCenterH, isCenter; // Type positioning flags
            var isAddedVisibleDropZone;
            var magnet;

            return this.each(function() {
                magnet = $(this);
                $(this).droppable({
                    tolerance: settings.tolerance,
                    activate: function(event, ui) {
                        if (isValidElement(event, ui) || isEphemeralElement(event, ui)) {
                            magnetZone("hide");
                            getConfig(event, ui);
                            $(this).addClass("magnet-drag");
                            callback("drag", event, ui);
                        }
                    },
                    over: function(event, ui) {
                        if (isValidElement(event, ui) || isEphemeralElement(event, ui)) {
                            magnetZone("show");
                            getConfig(event, ui);

                            $(this).addClass("magnet-hover");
                            callback("over", event, ui);
                        }
                    },
                    out: function(event, ui) {
                        if (isValidElement(event, ui) || isEphemeralElement(event, ui)) {
                            magnetZone("hide");
                            getConfig(event, ui);

                            $(this).removeClass("magnet-hover");
                            callback("out", event, ui);
                        }
                    },
                    drop: function(event, ui) {
                        var isEphemeral = isEphemeralElement(event, ui);
                        if (isValidElement(event, ui) || isEphemeral) {
                            magnetZone("hide");
                            getConfig(event, ui);

                            var inner = false, centerv = false, centerh = false, center = false;

                            if (isInner) {
                                inner = setInner(event, ui);
                            }
                            if (isCenterV) {
                                centerv = setCenterV(event, ui);
                            }
                            if (isCenterH) {
                                centerh = setCenterH(event, ui);
                            }
                            if (isCenter) {
//                            center = getCenter(event, ui);
                            }

                            applyPadding(event, ui);

                            if (!isEphemeral) {
                                callback("drop", event, ui);
                            }

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
            if (settings.highlight) {
                if (action === "show") {
                    magnet.find(".magnet-area").show();
                    resizeMagnetArea();
                } else if (action === "hide") {
                    magnet.find(".magnet-area").hide();
                }
            }
        }

        /**
         * Resize the element of the magnet area
         */
        function resizeMagnetArea() {

            var tipos = ["magnet-area-black", "magnet-area-white"];
            var offset = 0;

            for (var i = 0; i < tipos.length; i++, offset++) {

                var area = tipos[i];
                var magnetArea = magnet.find("." + area);

                if (isInner) {
                    var offsetH = getOffset(magnet, "h");
                    var offsetV = getOffset(magnet, "v");

                    magnetArea.css({
                        position: "absolute",
                        top: offsetV + offset + "px",
                        left: offsetH + offset + "px",
                        width: (pwidth - (offsetH * 2) - (offset * 2)) + "px",
                        height: (pheight - (offsetV * 2) - (offset * 2)) + "px"
                    });
                }

                if (isCenterV) {
                    var offsetH = getOffset(magnet, "h");

                    magnetArea.css({
                        position: "absolute",
                        top: "0px",
                        left: ((pwidth / 2) - offsetH) + "px",
                        width: (offsetH * 2) + "px",
                        height: pheight + "px"
                    });
                }

                if (isCenterH) {
                    var offsetV = getOffset(magnet, "v");

                    magnetArea.css({
                        position: "absolute",
                        top: ((pheight / 2) - offsetV) + "px",
                        left: "0px",
                        width: pwidth + "px",
                        height: (offsetV * 2) + "px"
                    });
                }
            }
        }

        /**
         * Check if the element dragging over the element droppable is valid
         * @param {type} event
         * @param {type} ui
         * @returns {@exp;ui@pro;draggable@call;hasClass}
         */
        function isValidElement(event, ui) {

            var el = ui.helper;
            var classes = settings.classAffected;

            classes = getArrayFromString(classes);

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

        function isEphemeralElement(event, ui) {
            var el = ui.helper;
            var classes = settings.classEphemeral;

            classes = getArrayFromString(classes);

            var canTrigger = false;
            var tmp = "";
            for (var i = 0; i < classes.length; i++) {
                tmp = classes[i];
                tmp = tmp.trim();
                if (el.hasClass(tmp) || tmp === "") {
                    canTrigger = true;
                    break;
                }
            }
            return canTrigger;
        }

        function getArrayFromString(classes) {
            if (typeof classes === "string") {
                classes = classes.rtrim();
                classes = classes.split(" ");
            } else {
                classes = new Array("");
            }
            return classes;
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

            var element = ui.helper;
            element = $(element);

            ctop = element.position().top;
            cleft = element.position().left;
            cheight = element.height();
            cwidth = element.width();

            ptop = magnet.position().top;
            pleft = magnet.position().left;
            pheight = magnet.height();
            pwidth = magnet.width();

            cCenterLeft = (cleft + (cwidth / 2));
            cCenterTop = (ctop + (cheight / 2));

            var offsetH = getOffset(magnet, "h");
            var offsetV = getOffset(magnet, "v");

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
            var divw = $("<div>").addClass("magnet-area magnet-area-white").hide().appendTo(magnet);
            var divb = $("<div>").addClass("magnet-area magnet-area-black").hide().appendTo(magnet);
            if (isInner) {
                divw.addClass("magnet-area-inner");
                divb.addClass("magnet-area-inner");
            }

            if (isCenterV) {
                divw.addClass("magnet-area-vertical");
                divb.addClass("magnet-area-vertical");
            }

            if (isCenterH) {
                divw.addClass("magnet-area-horizontal");
                divb.addClass("magnet-area-horizontal");
            }
        }

        /**
         * Doing the work needed to center vertically the children dropped
         * @param {type} event
         * @param {type} ui
         * @returns {Boolean}
         */
        function setCenterV(event, ui) {
            getConfig(event, ui);
            var el = $(ui.helper);
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
        function setCenterH(event, ui) {
            getConfig(event, ui);
            var el = $(ui.helper);
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
        function setInner(event, ui) {
            getConfig(event, ui);

            var el = ui.helper;
            el = $(el);

            var inner = false;

            var offsetH = getOffset(magnet, "h");
            var offsetV = getOffset(magnet, "v");

            //From Top Element

            var minTop = ptop;
            var maxTop = ptop + offsetV;
            var maxBottom = ptop + pheight;
            var minBottom = maxBottom - offsetV;


            /*
             if(minTop between ctop and cbottom or maxTop between ctop and cbottom) {   
             }
             else if (minBottom between ctop) {
             }
             */
            var cbottom = ctop + cheight;
            if ((minTop >= ctop && minTop <= cbottom) || (maxTop >= ctop && maxTop <= cbottom)) {
                debug("TOP: " + ptop + "px");
                el.css("top", ptop + "px");
                inner = true;
            }

            if ((minBottom >= ctop && minBottom <= cbottom) || (maxBottom >= ctop && maxBottom <= cbottom)) {
                debug("BOTTOM: " + (ptop + pheight - cheight) + "px");
                el.css("top", (ptop + pheight - cheight) + "px");
                inner = true;
            }

            var minLeft = pleft;
            var maxLeft = pleft + offsetH;
            var maxRight = pleft + pwidth;
            var minRight = maxRight - offsetH;

            var cright = cleft + cwidth;
            if ((minLeft >= cleft && minLeft <= cright) || (maxLeft >= cleft && maxLeft <= cright)) {
                debug("LEFT: " + pleft + "px");
                el.css("left", pleft + "px");
                inner = true;
            }

            if ((minRight >= cleft && minRight <= cright) || (maxRight >= cleft && maxRight <= cright)) {
                debug("RIGHT: " + (pleft + pwidth - cwidth) + "px");
                el.css("left", (pleft + pwidth - cwidth) + "px");
                inner = true;
            }


//            if ((ctop - ptop) <= offsetV) {
//                debug("TOP: " + ptop + "px");
//                el.css("top", ptop + "px");
//                inner = true;
//            }
//            //From Bottom Element
//            if (((ptop + pheight) - (ctop + cheight)) <= offsetV) {
//                debug("BOTTOM: " + (ptop + pheight - cheight) + "px");
//                el.css("top", (ptop + pheight - cheight) + "px");
//                inner = true;
//            }
            //Left
//            if (Math.abs(pleft - cleft) <= offsetH) {
//                debug("LEFT: " + pleft + "px");
//                el.css("left", pleft + "px");
//                inner = true;
//            }
//            //Right
//            if (Math.abs((pleft + pwidth) - (cleft + cwidth)) <= offsetH) {
//                debug("RIGHT: " + (pleft + pwidth - cwidth) + "px");
//                el.css("left", (pleft + pwidth - cwidth) + "px");
//                inner = true;
//            }

            return inner;
        }

        function applyPadding(event, ui) {
            getConfig(event, ui);

            var el = ui.helper;
            el = $(el);

            var _left = el.position().left;
            var _right = _left + el.width();
            var _top = el.position().top;
            var _bottom = _top + el.height();

            var padd = settings.padding;
            var maxPaddWidth = pwidth - padd;
            var maxPaddHeight = pheight - padd;

            if (_left < padd) {
                el.css("left", _left + "px");
            } else if (_right > maxPaddWidth) {
                el.css("left", (maxPaddWidth - el.width()) + "px");
            }

            if (_top < padd) {
                el.css("top", padd + "px");
            } else if (_bottom > maxPaddHeight) {
                el.css("top", (maxPaddHeight - el.height()) + "px");
            }
        }

        /**
         * Return the number of pixels setted in offset indepently if are em, px or %.
         * @param {type} el
         * @param {type} position
         * @returns {@exp;settings@pro;offset|Number|@exp;settings@pro;offset@call;replace|value}
         */
        function getOffset(el, position) {

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
        /**
         * Method to print to standard output messages if plugin is in debug mode
         * @param {type} message
         */
        function debug(message) {
            if (settings.debug && window.console && window.console.log) {
                window.console.log(message);
            }
        }

    };

})(jQuery);


/**
 * Delete the white spaces at start and at the end of String
 * @type String
 */
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, "");
};

/**
 * Delete the white spaces at start of String
 * @returns String
 */
String.prototype.ltrim = function() {
    return this.replace(/^\s+/, "");
};

/**
 * Delete the white spaces at end of String
 * @returns String
 */
String.prototype.rtrim = function() {
    return this.replace(/\s+$/, "");
};

/**
 * Find a string inside String
 * @type Boolean
 */
String.prototype.contains = function(str) {
    var str = this.toString();
    return (str.indexOf(str) !== -1);
};