(function() {
    C.layer.topNotify("success", { content: "layer popup test", shade: false, time: 2 });
    $(".color, .full-color, .stroke-color").click(function() {
        var $target = $(this);
        C.ColorPicker.init($target, "000000", function(color) {
            C.layer.topNotify("info", { content: "颜色值: #" + color, shade: false, time: 2 });
        }, "triggerByTarget");
    });
})();