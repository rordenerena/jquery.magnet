<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title></title>
        <script src="http://code.jquery.com/jquery-1.9.1.js"></script>
        <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
        <script src="jquery.magnet.js"></script>
        <link rel="stylesheet" href="jquery.magnet.css" />
    </head>
    <body>
        <div class="dropping"></div>
        <div class="draging"></div>
        <script>
            $(".dropping").magnet({
                offset: "20px",
                type: ["INNER"],
                animateCallback: function(event, ui) {
                    var el = ui.draggable;
                    el.animate({
                        opacity: 0
                    }, 200, function() {
                        el.animate({
                            opacity: 1
                        }, 200);
                    });
                },
                overCallback: function(event, ui) {
                    console.log("over");
                }
            });

            $(".draging").draggable();
        </script>
    </body>
</html>
