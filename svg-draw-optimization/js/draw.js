(function() {
    C.layer.topNotify("success", { content: "layer popup test", shade: false, time: 2 });
    $(".color, .full-color, .stroke-color").click(function() {
        var $target = $(this);
        C.ColorPicker.init($target, "000000", function(color) {
            C.layer.topNotify("info", { content: "颜色值: #" + color, shade: false, time: 2 });
        }, "triggerByTarget");
    });
    var data = {
        type: "with-selected",
        menus: [{
                operate: "copy",
                status: "selected",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                operate: "copy",
                status: "disabled",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                type: "separator"
            },
            {
                operate: "cut",
                status: "",
                value: "cut",
                text: "剪切",
                shortcut: "ctrl+x"
            },
            {
                operate: "page",
                status: "",
                value: "paste",
                text: "粘贴",
                shortcut: "ctrl+v"
            }
        ]
    };
    var data1 = {
        type: "",
        menus: [{
                operate: "copy",
                status: "selected",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                operate: "copy",
                status: "disabled",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                type: "separator"
            },
            {
                operate: "cut",
                status: "",
                value: "cut",
                text: "剪切",
                shortcut: "ctrl+x"
            },
            {
                operate: "page",
                status: "",
                value: "paste",
                text: "粘贴",
                shortcut: "ctrl+v"
            }
        ]
    };
    $(".border-width, .border-style").click(function(event) {
        var $target = $(this);
        C.Menu.init($target, data, function(operate, value) {
            C.layer.topNotify("info", { content: "operate: " + operate + "<br />value: " + value, shade: false, time: 2 });
        }, "triggerByTarget");
    });
    $(document).contextmenu(function(event) {
        var $target = $(event.target);
        if ($target.hasClass("draw-content")) {
            C.Menu.init(event, data1, function(operate, value) {
                C.layer.topNotify("info", { content: "operate: " + operate + "<br />value: " + value, shade: false, time: 2 });
            });
            return false;
        }
    });
})();