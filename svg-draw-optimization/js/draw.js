require.config({
    baseUrl: "js",
    paths: {
        "jquery": "lib/jquery.min",
        "underscore": "lib/underscore.min",
        "backbone": "lib/backbone.min",
        "svg": "lib/svg.min",
    }
});
require(
    ["jquery", "underscore", "backbone", "svg", "common", "attrs", "tools", "devices", "view", "model"],
    function($, _, Backbone, SVG, C, Attr, Tool, Device, View, Model) {
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
                this.$main = this.$el.find(".draw-container");
                this.svg = SVG("svg-wrapper").size("100%", "100%");
                this.bg = null;
                this.elemToBeAdd = null;
                this.deviceView = null;

                this.itemToBeAdd = {
                    type: "",
                    value: "",
                };

                this.attrSelected = {
                    type: "",
                    value: "",
                };

                this.selectedItem = [];

                if (data.isEdit) {
                    this.setRightBtnMenu();
                    this.initTool(data.tools);
                    this.initDevice(data.devices);
                }
                this.render(data);
            },

            events: {
                "mousemove svg": "hover",
                "mouseup svg, click svg": "addItem"
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
            },

            initDevice: function(devices) {
                this.deviceView = new Device.view({ model: new Device.model(), devices: devices });
                this.$main.append(this.deviceView.render().el);
                var deviceHeight = $(".bottom-icons")[0].offsetHeight;
                $(".draw-content").css("margin-bottom", deviceHeight + "px");

                this.listenTo(this.deviceView, "selectDevice", this.setSelectedItem);
                this.listenTo(this.deviceView, "cancelDevice", this.clearSelectedItem);
            },

            initTool: function(tools) {
                this.toolView = new Tool.view({ model: new Tool.model(), tools: tools });
                // TODO 需要调整
                this.$main.find(".top-attrs").after(this.toolView.render().el);

                this.listenTo(this.toolView, "selectTool", this.setSelectedItem);
                this.listenTo(this.toolView, "cancelTool", this.clearSelectedItem);
            },

            // events and methods
            setSelectedItem: function(data) {
                this.itemToBeAdd = data;
            },
            clearItemToBeAdd: function() {
                if (this.elemToBeAdd) {
                    this.elemToBeAdd.clear();
                }
            },
            clearSelectedItem: function() {
                this.itemToBeAdd = { type: "", value: "" };
                this.clearItemToBeAdd();
            },
            hover: function(event) {
                if (this.itemToBeAdd.type && this.itemToBeAdd.value) {
                    this.showItemToBeAdd(event);
                } else {}
            },
            showItemToBeAdd: function(event) {
                var group = null,
                    rect = null,
                    x = event.clientX,
                    y = event.clientY,
                    offset = $(this.svg.node).offset(),
                    scrollTop = this.$main.scrollTop(),
                    scrollLeft = this.$main.scrollLeft();

                if (this.elemToBeAdd) {
                    this.elemToBeAdd.clear();
                } else {
                    this.elemToBeAdd = this.svg.group();
                }
                group = this.elemToBeAdd;
                rect = group.rect(40, 40).fill("#f06").attr({ x: x - offset.left + scrollLeft - 20, y: y - offset.top + scrollTop - 20 });
            },
            addItem: function(event) {
                var group,
                    x = event.clientX,
                    y = event.clientY,
                    offset = $(this.svg.node).offset(),
                    scrollTop = this.$main.scrollTop(),
                    scrollLeft = this.$main.scrollLeft();

                if (this.itemToBeAdd.type && this.itemToBeAdd.value) {
                    group = this.svg.group();
                    group.rect(40, 40).fill("#f06").attr({ x: x - offset.left + scrollLeft - 20, y: y - offset.top + scrollTop - 20 });
                    this.clearSelectedItem();
                }
            },
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
                el: ".outer-container",
                isEdit: true,
                tools: [{
                        type: "rect",
                        name: "矩形"
                    },
                    {
                        type: "round-rect",
                        name: "圆角矩形"
                    },
                    {
                        type: "line",
                        name: "直线"
                    },
                    {
                        type: "polyline",
                        name: "折线"
                    },
                ],
                devices: [{
                        type: 2,
                        name: "接地设备",
                        src: "/imgs/2.svg"
                    },
                    {
                        type: 3,
                        name: "接地设备",
                        src: "/imgs/3.svg"
                    },
                    {
                        type: 4,
                        name: "接地设备",
                        src: "/imgs/4.svg"
                    },
                    {
                        type: 5,
                        name: "接地设备",
                        src: "/imgs/5.svg"
                    }
                ]
            },
            function() {
                C.layer.topNotify("success", { content: "draw inited", shade: false, time: 2 });
            }
        );
    });