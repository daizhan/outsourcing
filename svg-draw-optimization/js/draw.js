require.config({
    baseUrl: "js",
    paths: {
        "jquery": "lib/jquery.min",
        "underscore": "lib/underscore.min",
        // TODO
        "backbone": "lib/backbone",
        "svg": "lib/svg.min",
    }
});
require(
    ["jquery", "underscore", "backbone", "svg", "common", "attrs", "tools", "devices", "view", "model", "collection"],
    function($, _, Backbone, SVG, C, Attr, Tool, Device, View, Model, Collection) {
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
                this.deviceView = null;
                this.toolView = null;
                this.deviceCollections = new Collection.device();
                this.rectCollections = new Collection.rect();
                this.lineCollections = new Collection.line();
                this.elemToBeAdd = null;

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

                this.setOtherEvents();
            },

            setOtherEvents: function() {
                this.listenTo(this.deviceCollections, "add", this.addDevice);
                this.listenTo(this.rectCollections, "add", this.addRect);
                this.listenTo(this.lineCollections, "add", this.addLine);
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
                this.$main.find(".top-attrs").after(this.toolView.render().el);

                this.listenTo(this.toolView, "selectTool", this.setSelectedItem);
                this.listenTo(this.toolView, "cancelTool", this.clearSelectedItem);
            },

            // events and methods
            setSelectedItem: function(data) {
                this.clearItemToBeAdd();
                this.itemToBeAdd = _.extend({}, data);
            },
            clearItemToBeAdd: function() {
                if (this.elemToBeAdd) {
                    this.elemToBeAdd.model.destroy();
                    this.elemToBeAdd = null;
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
            getMousePos: function(event) {
                var x = event.clientX,
                    y = event.clientY,
                    offset = $(this.svg.node).offset(),
                    docScrollTop = $(window).scrollTop(),
                    docScrollLeft = $(window).scrollLeft(),
                    scrollTop = this.$main.scrollTop() + docScrollTop,
                    scrollLeft = this.$main.scrollLeft() + docScrollLeft;
                return {
                    x: x - offset.left + scrollLeft,
                    y: y - offset.top + scrollTop
                };
            },
            showItemToBeAdd: function(event) {
                var pos = this.getMousePos(event);
                this.createItem(this.itemToBeAdd, pos, true);
            },
            notifyAddDone: function(type) {
                if (type == this.toolView.type) {
                    this.toolView.trigger("selectDone");
                } else if (type == this.deviceView.type) {
                    this.deviceView.trigger("selectDone");
                }
            },
            addItem: function(event) {
                var pos = this.getMousePos(event);
                if (this.itemToBeAdd.type && this.itemToBeAdd.value) {
                    this.createItem(this.itemToBeAdd, pos);
                    this.notifyAddDone(this.itemToBeAdd.type);
                    this.clearSelectedItem();
                }
            },
            getTypeItem: function(data) {
                if (data.value == "rect" || data.value == "round-rect") {
                    return this.rectCollections;
                } else if (data.value == "line" || data.value == "polyline") {
                    return this.lineCollections;
                } else if (data.value) {
                    return this.deviceCollections;
                }
                return null;
            },
            createItem: function(item, pos, isToBeAdd) {
                var collection = this.getTypeItem(item);
                if (!isToBeAdd) {
                    collection.create({
                        centerX: pos.x,
                        centerY: pos.y,
                        type: item.type,
                        value: item.value
                    });
                } else {
                    if (!this.elemToBeAdd) {
                        collection.create({
                            centerX: pos.x,
                            centerY: pos.y,
                            type: item.type,
                            value: item.value
                        }, { isToBeAdd: isToBeAdd });
                    } else {
                        this.elemToBeAdd.model.set({
                            centerX: pos.x,
                            centerY: pos.y
                        });
                    }
                }
            },

            addDevice: function(device, collection, options) {
                var view = new View.device({ model: device });
                if (options.isToBeAdd) {
                    this.elemToBeAdd = view;
                }
                this.svg.add(view.render().svg);
            },
            addLine: function(line, collection, options) {
                var view = new View.line({ model: line });
                if (options.isToBeAdd) {
                    this.elemToBeAdd = view;
                }
                this.svg.add(view.render().svg);
            },
            addRect: function(rect, collection, options) {
                var view = new View.rect({ model: rect });
                if (options.isToBeAdd) {
                    this.elemToBeAdd = view;
                }
                this.svg.add(view.render().svg);
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