(function() {
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

    var deviceHeight = $(".bottom-icons")[0].offsetHeight;
    $(".draw-content").css("margin-bottom", deviceHeight + "px");

    var AppView = D.View.extend({
        initialize: function() {
            this.svg = SVG("svg-wrapper").size("100%", "100%");
            this.bg = this.svg.group();
            this.render();
        },
        renderGrid: function() {
            var gap = 12,
                box = this.svg.rbox(),
                start, end,
                shadowColor = "#ccc",
                deepColor = "#999",
                lineWidth = 1,
                path,
                max = Math.max(box.width, box.height);
            for (i = 0; i <= max; i += gap) {
                if (i <= box.height) { // 横线
                    path = this.bg.path("M " + 0 + " " + i + " L " + box.width + " " + i);
                    if ((i / gap) % 4) {
                        path.stroke({ color: shadowColor });
                    } else {
                        path.stroke({ color: deepColor });
                    }
                    path.transform({ y: 0.5 });
                }
                if (i <= box.width) { // 竖线
                    path = this.bg.path("M " + i + " " + 0 + " L " + i + " " + box.height);
                    if ((i / gap) % 4) {
                        path.stroke({ color: shadowColor, width: lineWidth });
                    } else {
                        path.stroke({ color: deepColor, width: lineWidth });
                    }
                    path.transform({ x: 0.5 });
                }
            }
        },
        render: function() {
            this.renderGrid();
        }
    });
    var app = null;

    window.Draw = {
        checkData: function(data) {
            return {};
        },
        init: function(data, callback) {
            var validData = this.checkData(data);
            app = new AppView(validData);
        },
        save: function(callback) {
            if (!app) {
                console.log("draw not inited");
                return;
            }
        },
        setEvent: function(eventType, targetType, callback) {
            if (!app) {
                console.log("draw not inited");
                return;
            }
        }
    }

    Draw.init({}, function() {
        C.layer.topNotify("success", { content: "draw inited", shade: false, time: 2 });
    });
})();