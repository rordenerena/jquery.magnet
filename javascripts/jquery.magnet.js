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
				offset : "10px",
				padding : "0px",
				type : ["INNER"], // Array with the types availables are: INNER, CENTERV, CENTERH, CENTER
				animate : true,
				highlight : true,
				dragCallback : null,
				overCallback : null,
				dropCallback : null,
				outCallback : null,
				animateCallback : null,
				debug : true,
				classAffected : "",
				classEphemeral : "",
				tolerance : "touch"
			}, options);

			var ctop, cleft, cwidth, cheight;
			// Children draggable data
			var ptop, pleft, pwidth, pheight;
			// Parent Droppable data
			var cCenterLeft, cCenterTop;
			// Center Horizontal and Vertical children position
			var pTopCenterMin, pTopCenterMax;
			// Vertical center line data
			var pLeftCenterMin, pLeftCenterMax;
			// Horizontal center line data
			var isInner, isCenterV, isCenterH, isCenter;
			// Type positioning flags
			var pLeftCenter, pTopCenter;
			var offsetH, offsetV;
			var isAddedVisibleDropZone = false;
			var magnet;

			return this.each(function() {
				magnet = $(this);
				$(this).droppable({
					tolerance : settings.tolerance,
					activate : function(event, ui) {
						if (isValidElement(event, ui) || isEphemeralElement(event, ui)) {
							makeMagnetArea();
							magnetZone("hide");
							getConfig(event, ui);
							$(this).addClass("magnet-drag");
							callback("drag", event, ui);
						}
					},
					over : function(event, ui) {
						if (isValidElement(event, ui) || isEphemeralElement(event, ui)) {
							makeMagnetArea();
							magnetZone("show");
							getConfig(event, ui);

							$(this).addClass("magnet-hover");
							callback("over", event, ui);
						}
					},
					out : function(event, ui) {
						if (isValidElement(event, ui) || isEphemeralElement(event, ui)) {
							makeMagnetArea();
							magnetZone("hide");
							getConfig(event, ui);

							$(this).removeClass("magnet-hover");
							callback("out", event, ui);
						}
					},
					drop : function(event, ui) {
						var isEphemeral = isEphemeralElement(event, ui);
						if (isValidElement(event, ui) || isEphemeral) {
							makeMagnetArea();
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
								center = setCenter(event, ui);
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
		 * @param action
		 */
		function magnetZone(action) {
			if (settings.highlight) {
				if (action === "show") {
					magnet.find(".magnet-area").show();
					setMagnetArea();
				} else if (action === "hide") {
					magnet.find(".magnet-area").hide();
				}
			}
		}

		/**
		 * Resize the element of the magnet area
		 */
		function setMagnetArea() {

			var tipos = ["magnet-area-black", "magnet-area-white"];
			var offset = 0;

			for (var i = 0; i < tipos.length; i++, offset++) {

				var area = tipos[i];
				var magnetArea = magnet.find("." + area);

				if (isInner) {
					var offsetH = getOffset(magnet, "h");
					var offsetV = getOffset(magnet, "v");

					magnetArea.css({
						position : "absolute",
						top : offsetV + offset + "px",
						left : offsetH + offset + "px",
						width : (pwidth - (offsetH * 2) - (offset * 2)) + "px",
						height : (pheight - (offsetV * 2) - (offset * 2)) + "px"
					});
				}

				if (isCenterH) {
					var offsetH = getOffset(magnet, "h");

					magnetArea.css({
						position : "absolute",
						top : (0 + offset) + "px",
						left : ((pwidth / 2) - offsetH + offset) + "px",
						width : (offsetH * 2 - (offset * 2)) + "px",
						height : (pheight - (offset * 2)) + "px"
					});
				}

				if (isCenterV) {
					var offsetV = getOffset(magnet, "v");

					magnetArea.css({
						position : "absolute",
						top : ((pheight / 2) - offsetV + offset) + "px",
						left : 0 + offset + "px",
						width : pwidth - (offset * 2) + "px",
						height : (offsetV * 2 - (offset * 2)) + "px"
					});
				}

				if (isCenter) {
					var offsetV = getOffset(magnet, "v");
					var offsetH = getOffset(magnet, "h");

					var css = {
						position : "absolute",
						top : ((pheight / 2) - offsetV + offset) + "px",
						left : ((pwidth / 2) - offsetH + offset) + "px",
						width : ((offsetH * 2) - (offset * 2)) + "px",
						height : ((offsetV * 2) - (offset * 2)) + "px"
					};

					magnetArea.css(css);
				}
			}
		}

		/**
		 * Check if the element dragging over the element droppable is valid
		 * @param event
		 * @param ui
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
			if ( typeof classes === "string") {
				classes = classes.rtrim();
				classes = classes.split(" ");
			} else {
				classes = new Array("");
			}
			return classes;
		}

		/**
		 * Method to animate the element dropped in this
		 * @param event
		 * @param ui
		 */
		function animateElement(event, ui) {
			if (settings.animate) {
				callback("animate", event, ui);
			}
		}

		function makeMagnetArea() {
			if (!isAddedVisibleDropZone) {
				isAddedVisibleDropZone = true;
				addVisibleDropZone();
			}
		}

		/**
		 * Set the data values needed to plugin
		 * @param event
		 * @param ui
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

			offsetH = getOffset(magnet, "h");
			offsetV = getOffset(magnet, "v");

			pLeftCenter = pleft + (pwidth / 2);
			pTopCenter = ptop + (pheight / 2);

			pLeftCenterMin = pLeftCenter - offsetH;
			pLeftCenterMax = pLeftCenter + offsetH;

			pTopCenterMin = pTopCenter - offsetV;
			pTopCenterMax = pTopCenter + offsetV;

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
					console.log("Nothing TODO");
				} else {
					//                    settings.offset = "100%";
					isCenter = true;
				}
			}

			makeMagnetArea();

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

			if (isCenter) {
				divw.addClass("magnet-area-center");
				divb.addClass("magnet-area-center");
			}
		}

		/**
		 * Doing the work needed to center vertically the children dropped
		 * @param event
		 * @param ui
		 * @returns {Boolean}
		 */
		function setCenterV(event, ui) {
			getConfig(event, ui);
			var el = $(ui.helper);

			var centerv = false;
			var cbottom = ctop + cheight;
			var pbottom = ptop + pheight;

			if ((pTopCenterMin >= ctop && pTopCenterMin <= cbottom) || (pTopCenterMax >= ctop && pTopCenterMax <= cbottom)) {
				centerv = true;
			} else if ((ctop >= pTopCenterMin && cbottom <= pTopCenterMax)) {
				centerv = true;
			}

			if (centerv) {
				el.css({
					top : (pTopCenter - (cheight / 2)) + "px"
				});
			}

			return centerv;

		}

		/**
		 * Doing the work needed to center horizontally the children dropped
		 * @param event
		 * @param ui
		 * @returns {Boolean}
		 */
		function setCenterH(event, ui) {
			getConfig(event, ui);
			var el = $(ui.helper);

			var centerh = false;

			var cright = cleft + cwidth;
			var pright = pleft + pwidth;

			if ((pLeftCenterMin >= cleft && pLeftCenterMin <= cright) || (pLeftCenterMax >= cleft && pLeftCenterMax <= cright)) {
				centerh = true;
			} else if ((pLeftCenterMin <= cleft && pLeftCenterMax >= cright)) {
				centerh = true;
			}

			if (centerh) {
				el.css({
					left : (pLeftCenter - (cwidth / 2)) + "px"
				});
			}

			return centerh;
		}

		/**
		 * Uses centerh and centerv with offset at 100%
		 * @param event
		 * @param ui
		 */
		function setCenter(event, ui) {
			getConfig(event, ui);
			var el = $(ui.helper);

			var xleft = pLeftCenter - offsetH;
			var xright = pLeftCenter + offsetH;
			var xtop = pTopCenter - offsetV;
			var xbottom = pTopCenter + offsetV;

			var cright = cleft + cwidth;
			var cbottom = ctop + cheight;

			var elementHisBigger = false;
			var elementVisBigger = false;

			if (cwidth >= pwidth) {
				elementHisBigger = true;
			}
			if (cheight >= pheight) {
				elementVisBigger = true;
			}
			var doCenter = false;

			if (!elementHisBigger && !elementVisBigger) {
				//The element is more little than area
				if (((cleft >= xleft && cleft <= xright) || (cright >= xleft && cright <= xright)) || ((ctop >= xtop && ctop <= xbottom) || (cbottom >= xtop && cbottom <= xbottom))) {
					doCenter = true;
				}
			} else if (elementHisBigger && elementVisBigger) {
				//The element is bigger than area
				//1. If the area magnet is fully hidden
				if (cleft <= xleft && cright >= xright && ctop <= xtop && cbottom >= xbottom) {
					doCenter = true;
				}
				if (((cleft >= xleft && cleft <= xright) || (cright >= xleft && cright <= xright)) || ((ctop >= xtop && ctop <= xbottom) || (cbottom >= xtop && cbottom <= xbottom))) {
					doCenter = true;
				}

			} else if (elementHisBigger && !elementVisBigger) {
				//LANDSCAPE
				if (((cleft >= xleft && cleft <= xright) || (cright >= xleft && cright <= xright)) && ((ctop >= xtop && ctop <= xbottom) || (cbottom >= xtop && cbottom <= xbottom))) {
					doCenter = true;
				} else if (((xleft >= cleft && xleft <= cright) || (xright >= cleft && xright <= cright))) {
					if ((ctop >= xtop && cbottom <= xbottom)) {
						doCenter = true;
					} else if (cbottom >= xtop && cbottom <= xbottom) {
						doCenter = true;
					} else if (ctop >= xtop && ctop <= xbottom) {
						doCenter = true;
					}
				}
			} else {
				//PORTRAIT
				if (((cleft >= xleft && cleft <= xright) || (cright >= xleft && cright <= xright)) && ((ctop >= xtop && ctop <= xbottom) || (cbottom >= xtop && cbottom <= xbottom))) {
					doCenter = true;
				} else if (((xtop >= ctop && xtop <= cbottom) || (xbottom >= ctop && xbottom <= cbottom))) {
					if (cleft >= xleft && cright <= xright) {
						doCenter = true;
					} else if (cleft >= xleft && cleft <= xright) {
						doCenter = true;
					} else if (cright >= xleft && cright <= xright) {
						doCenter = true;
					}
				}
			}

			if (doCenter) {
				el.css({
					top : (pTopCenter - (cheight / 2)) + "px",
					left : (pLeftCenter - (cwidth / 2)) + "px"
				});
			}
		}

		/**
		 * Doing the work needed to set the position if configured as INNER
		 * @param event
		 * @param ui
		 */
		function setInner(event, ui) {
			getConfig(event, ui);

			var el = ui.helper;
			el = $(el);

			var inner = false;

			var offsetH = getOffset(magnet, "h");
			var offsetV = getOffset(magnet, "v");

			var minTop = ptop;
			var maxTop = ptop + offsetV;
			var maxBottom = ptop + pheight;
			var minBottom = maxBottom - offsetV;

			var cbottom = ctop + cheight;
			if ((minTop >= ctop && minTop <= cbottom) || (maxTop >= ctop && maxTop <= cbottom)) {
				debug("TOP: " + ptop + "px");
				el.css("top", ptop);
				inner = true;
			}

			if ((minBottom >= ctop && minBottom <= cbottom) || (maxBottom >= ctop && maxBottom <= cbottom)) {
				debug("BOTTOM: " + (ptop + pheight - cheight) + "px");
				el.css("top", (ptop + pheight - cheight));
				inner = true;
			}

			var minLeft = pleft;
			var maxLeft = pleft + offsetH;
			var maxRight = pleft + pwidth;
			var minRight = maxRight - offsetH;

			var cright = cleft + cwidth;
			if ((minLeft >= cleft && minLeft <= cright) || (maxLeft >= cleft && maxLeft <= cright)) {
				debug("LEFT: " + pleft + "px");
				el.css("left", pleft);
				inner = true;
			}

			if ((minRight >= cleft && minRight <= cright) || (maxRight >= cleft && maxRight <= cright)) {
				debug("RIGHT: " + (pleft + pwidth - cwidth) + "px");
				el.css("left", (pleft + pwidth - cwidth));
				inner = true;
			}

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
		 * @param el
		 * @param position
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
		 * @param type
		 * @param event
		 * @param ui
		 */
		function callback(type, event, ui) {
			switch (type) {
				case "out":
					if (settings.outCallback !== null && ( typeof settings.outCallback === 'function')) {
						settings.outCallback(event, ui);
					}
					break;
				case "drop":
					if (settings.dropCallback !== null && ( typeof settings.dropCallback === 'function')) {
						settings.dropCallback(event, ui);
					}
					break;
				case "over":
					if (settings.overCallback !== null && ( typeof settings.overCallback === 'function')) {
						settings.overCallback(event, ui);
					}
					break;
				case "drag":
					if (settings.dragCallback !== null && ( typeof settings.dragCallback === 'function')) {
						settings.dragCallback(event, ui);
					}
					break;
				case "animate":
					if (settings.animateCallback !== null && ( typeof settings.animateCallback === 'function')) {
						settings.animateCallback(event, ui);
					}
					break;
			}
		}

		/**
		 * Method to print to standard output messages if plugin is in debug mode
		 * @param message
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