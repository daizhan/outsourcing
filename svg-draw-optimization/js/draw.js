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
                this.data = data;
                this.$main = $("<div></div>").addClass("draw-container");
                this.$el.append(this.$main);

                this.svg = null;
                this.bg = null;
                this.deviceView = null;
                this.toolView = null;
                this.attrView = null;
                this.deviceCollections = new Collection.device();
                this.rectCollections = new Collection.rect();
                this.lineCollections = new Collection.line();

                this.elemToBeAdd = null;
                this.subViews = {};

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
                    this.$main.addClass("can-edit");
                    this.initAttr();
                    this.render(data);
                    this.initTool(data.tools);
                    this.initDevice(data.devices);
                    this.setRightBtnMenu();
                } else {
                    this.render(data);
                }

                this.setOtherEvents();
                this.setBodyEvents();
            },

            setBodyEvents: function(){
                var self = this;
                $(document).click(function(event){
                    var $target = $(event.target),
                        targetClasses = ["svg-line", "svg-rect", "svg-device", "top-attrs", "common-popup-block"];
                    if (self.hasItemSelected) {
                        self.hasItemSelected = false;
                        return;
                    }
                    for (var i = 0, len = targetClasses.length; i < len; i ++) {
                        if ($target.hasClass(targetClasses[i]) || $target.parents("." + targetClasses[i]).length) {
                            return;
                        }
                    }
                    Backbone.trigger("removeSelected", {});
                    Backbone.trigger("showTypeAttr");
                });
            },
            setOtherEvents: function() {
                this.listenTo(Backbone, "setScale", this.scaleSvg);
            },
            scaleSvg: function(options) {
                C.layer.topNotify("info", {content: "scale page " + options.value + "%", shade: false, time: 2});
            },

            events: {
                "mousemove svg": "hover",
                "mouseup svg, click svg": "addItem",
            },
            renderGrid: function() {
                var gap = 12,
                    box = this.svg.rbox(),
                    start, end,
                    shadowColor = "#f2f2f2",
                    deepColor = "#ccc",
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
                var $elem = $("<div></div>").addClass("draw-content");
                this.$main.append($elem.attr("id", "svg-wrapper"));
                this.svg = SVG($elem[0]).size("100%", "100%");
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

            initAttr: function() {
                this.attrView = new Attr.view({ model: new Attr.model()});
                this.$main.append(this.attrView.render().el);
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
            showItemToBeAdd: function(event) {
                var pos = this.getMousePos(event),
                    model = this.createItem(this.itemToBeAdd, pos);
                this.createItemView(model, {isToBeAdd: true});
            },
            notifyAddDone: function(type) {
                if (type == this.toolView.type) {
                    this.toolView.trigger("selectDone");
                } else if (type == this.deviceView.type) {
                    this.deviceView.trigger("selectDone");
                }
            },
            addItem: function(event) {
                var pos = this.getMousePos(event),
                    model = null;
                if (this.itemToBeAdd.type && this.itemToBeAdd.value) {
                    model = this.createItem(this.itemToBeAdd, pos);
                    this.createItemView(model, {isToBeAdd: false});
                    this.notifyAddDone(this.itemToBeAdd.type);
                    this.clearSelectedItem();
                    if (event.type != "click") {
                        this.hasItemSelected = true;
                    }
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
            createItem: function(item, pos) {
                var collection = this.getTypeItem(item),
                    model = null,
                    view = null;
                if (!this.elemToBeAdd) {
                    model = collection.create({
                        centerX: pos.x,
                        centerY: pos.y,
                        type: item.type,
                        value: item.value
                    });
                } else {
                    model = this.elemToBeAdd.model.set({
                        centerX: pos.x,
                        centerY: pos.y
                    });
                }
                return model;
            },
            createItemView: function(model, options) {
                var data = model.toJSON();
                if (data.type == "device") {
                    return this.addDevice(model, options);
                } else if (data.value == "line" || data.value == "polyline") {
                    return this.addLine(model, options);
                } else if (data.value) {
                    return this.addRect(model, options);
                }
                return null;
            },
            addSubView: function(view) {
                var id = view.id || C.utils.count();
                this.subViews[id] = view;
                view.id = id;
            },
            getSubView: function(key) {
                var view = null;
                if (this.subViews.hasOwnProperty(key)) {
                    view = this.subViews[key];
                }
                return view;
            },
            addDevice: function(device, options) {
                var view = null;
                if (!this.elemToBeAdd) {
                    this.elemToBeAdd = view = new View.device({ model: device, viewId: C.utils.count() });
                    this.svg.add(view.render().svg);
                } else {
                    view = this.elemToBeAdd;
                }
                if (!options.isToBeAdd) {
                    this.addSubView(view);
                    view.trigger("setSelected");
                }
            },
            addLine: function(line, options) {
                var view = null;
                if (!this.elemToBeAdd) {
                    this.elemToBeAdd = view = new View.line({ model: line, viewId: C.utils.count() });
                    this.svg.add(view.render().svg);
                } else {
                    view = this.elemToBeAdd;
                }
                if (!options.isToBeAdd) {
                    view.trigger("setSelected");
                }
            },
            addRect: function(rect, options) {
                var view = null;
                if (!this.elemToBeAdd) {
                    this.elemToBeAdd = view = new View.rect({ model: rect, viewId: C.utils.count() });
                    this.svg.add(view.render().svg);
                } else {
                    view = this.elemToBeAdd;
                }
                if (!options.isToBeAdd) {
                    view.trigger("setSelected");
                }
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
                    return;
                }
            },
            setEvent: function(eventType, targetType, callback) {
                if (!app) {
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
                        src: "/imgs/2.svg",
                        devices: [{
                                id: 1,
                                name: "jack-1jack-1jack-1",
                                available: true
                            },
                            {
                                id: 2,
                                name: "jack-2",
                                available: true
                            },
                            {
                                id: 3,
                                name: "jack-3",
                                available: true
                            },
                        ]
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