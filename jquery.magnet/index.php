<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title></title>
        <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
        <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
        <style>
            .dropping {
                position: absolute;
                right: 10px;
                top: 10px;
                background-color: red;
                width: 200px;
                height: 200px;
            }

            .draging {
                position: absolute;
                width: 30px;
                height: 30px;
                background-color: yellow;
            }

            .activeDragging {
                background-color: orange !important;
            }

            .hoverDrop {
                background-color: black !important;
            }

        </style>
    </head>
    <body>
        <div class="dropping"></div>
        <div class="draging"></div>
        <script>
            $(".dropping").droppable({
                activate: function(){
                    $(this).addClass("overDrop");
                },
                over: function() {
                    $(this).addClass("hoverDrop");
                },
                out: function() {
                    $(this).removeClass("hoverDrop");
                },
                drop: function(event, ui) {
                    console.log(event);
                    console.log(ui);

                    var el = ui.draggable;
                    el = $(el);

                    var ctop = el.position().top;
                    var cleft = el.position().left;
                    var cheight = el.height();
                    var cwidth = el.width();

                    var ptop = $(this).position().top;
                    var pleft = $(this).position().left;
                    var pheight = $(this).height();
                    var pwidth = $(this).width();

                    var offset = 30;

                    var moved = false;

                    if (Math.abs(ptop - ctop) <= offset) {
                        el.css("top", ptop + "px");
                        moved = true;
                    }

                    if (Math.abs((ptop + pheight) - (ctop + cheight)) <= offset) {
                        el.css("top", (ptop + pheight - cheight) + "px");
                        moved = true;
                    }

                    if (Math.abs(pleft - cleft) <= offset) {
                        el.css("left", pleft + "px");
                        moved = true;
                    }
                    if (Math.abs((pleft + pwidth) - (cleft + cwidth)) <= offset) {
                        el.css("left", (pleft + pwidth - cwidth) + "px");
                        moved = true;
                    }

                    if (moved) {
                        animateElement(el);
                    }

                    //Calculamos que se pueda centrar horizontalmente
                    var centroEl = (cleft + (cwidth / 2));
                    var limiteIzquierdoCentral = (pleft + (pwidth / 2) - offset);
                    var limiteDerechoCentral = (pleft + (pwidth / 2) + offset);

                    if (centroEl >= limiteIzquierdoCentral && centroEl <= limiteDerechoCentral) {
                        el.css("left", function() {
                            return (pleft + (pwidth / 2) - (cwidth / 2)) + "px";
                        });
                        //Animamos el elemento tras el centrado
                        animateElement(el);
                    }
                }
            });

            function animateElement(el) {
                el = $(el);
                el.animate({
                    backgroundColor: "blue",
                    opacity: 0.8
                }, 200, function() {
                    el.animate({
                        backgroundColor: "yellow",
                        opacity: 1
                    }, 200);
                });
            }

            $(".draging").draggable();
        </script>
    </body>
</html>
