require(["config", "jquery", "underscore", "backbone", "svg", "common", "attrs", "view", "model"], function(config, $, _, Backbone, SVG, C, Attr, View, Model) {
    $(".color, .full-color, .stroke-color").click(function() {
        var $target = $(this);
        C.colorPicker.init($target, "000000", function(color) {
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
        C.popupMenu.init($target, data, function(operate, value) {
            C.layer.topNotify("info", { content: "operate: " + operate + "<br />value: " + value, shade: false, time: 2 });
        }, "triggerByTarget");
    });

    var AppView = View.base.extend({
        initialize: function(data) {
            this.svg = SVG("svg-wrapper").size("100%", "100%");
            this.bg = null;
            if (data.isEdit) {
                var deviceHeight = $(".bottom-icons")[0].offsetHeight;
                $(".draw-content").css("margin-bottom", deviceHeight + "px");
            }
            this.render(data);
            this.setRightBtnMenu();
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
            if (this.bg) {
                this.bg.clear();
            } else {
                this.bg = this.svg.group();
            }
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
        render: function(data) {
            this.renderGrid();
        },
        setRightBtnMenu: function() {
            $(document).contextmenu(function(event) {
                var $target = $(event.target);
                if ($target.hasClass("draw-content") || $target.parents(".draw-content").length) {
                    C.popupMenu.init(event, data1, function(operate, value) {
                        C.layer.topNotify("info", { content: "operate: " + operate + "<br />value: " + value, shade: false, time: 2 });
                    });
                    return false;
                }
            });
        }

    });
    var app = null;

    window.Draw = {
        checkData: function(data) {
            return data;
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

    Draw.init({
            el: ".outer-wrapper",
            isEdit: true
        },
        function() {
            C.layer.topNotify("success", { content: "draw inited", shade: false, time: 2 });
        }
    );
});