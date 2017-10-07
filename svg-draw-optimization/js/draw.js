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

        var data1 = {
            type: "",
            menus: [
                {
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

        var AppView = View.base.extend({

            initialize: function(data) {
                this.data = data;
                this.$main = $("<div></div>").addClass("draw-container");
                this.$container = null;
                this.$el.append(this.$main);

                this.root = null;
                this.svg = null;
                this.scale = 100;
                this.bg = null;
                this.selectTipsBox = null;
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

                this.selectedViews = [];

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

            getSelectedViewByTarget: function(event) {
                var className = "svg-view",
                    $target = $(event.target),
                    id = 0;
                if ($target.hasClass(className)) {
                    id = $target.attr("data-id");
                } else if ($target.parents("." + className).length) {
                    $target = $target.parents("." + className);
                    id = $target.attr("data-id");
                }
                if (id) {
                    return this.getSubView(id);
                }
                return null;
            },
            isClickOnCreateLine: function(event) {
                var className = "svg-group-points";
                return this.isClickOnEle(event, className);
            },
            isClickOnResize: function(event) {
                var className = "svg-group-border";
                return this.isClickOnEle(event, className);
            },
            isMoveOperate: function(event) {
                return !this.isClickOnResize(event) && !this.isClickOnCreateLine(event);
            },
            isClickOnEle: function(event, className) {
                var $target = $(event.target);
                if ($target.hasClass(className) || $target.parents("." + className).length) {
                    return true;
                }
                return false;
            },
            isClickOnSvgView: function(event) {
                return this.isClickOnEle(event, "svg-view");
            },
            isClickOnAttrEle: function(event) {
                return this.isClickOnEle(event, "top-attrs");
            },
            isClickOnPopup: function(event) {
                return this.isClickOnEle(event, "common-popup-block");
            },
            isClickOnDraw: function(event) {
                return this.isClickOnEle(event, "draw-content");
            },
            isClickOnTool: function(event) {
                return this.isClickOnEle(event, "left-tools");
            },
            isClickOnDevice: function(event) {
                return this.isClickOnEle(event, "bottom-icons");
            },
            getClickAttr: function(event) {},

            moveView: function(offset) {
                this.selectedViews.forEach(function(view) {
                    view.trigger("move", offset);
                });
            },
            endMoveView: function() {
                this.selectedViews.forEach(function(view) {
                    view.trigger("moveEnd");
                });
            },
            setMoveEvents: function() {
                var self = this,
                    isClickOnSvgView = false,
                    lastPos = null;
                $(document).mousedown(function(event) {
                    if (event.button == 0 && self.isMoveOperate(event)) {
                        isClickOnSvgView = self.isClickOnSvgView(event);
                        lastPos = {
                            x: event.clientX,
                            y: event.clientY
                        };
                    }
                });
                $(document).mousemove(function(event) {
                    if (lastPos && isClickOnSvgView) {
                        var offset = {
                            x: event.clientX - lastPos.x,
                            y: event.clientY - lastPos.y
                        };
                        lastPos = {
                            x: event.clientX,
                            y: event.clientY
                        };
                        self.moveView(offset);
                    }
                });
                $(document).click(function(event) {
                    if (lastPos && isClickOnSvgView) {
                        self.endMoveView();
                    }
                    lastPos = null;
                    isClickOnSvgView = false;
                });
                $(document).keydown(function(event) {
                    var key = event.key || event.keyCode,
                        offset = { x: 0, y: 0 };
                    if (key == "ArrowUp" || key == 38) {
                        offset.y -= 1;
                    } else if (key == "ArrowDown" || key == 40) { // down
                        offset.y += 1;
                    } else if (key == "ArrowLeft" || key == 37) { // left
                        offset.x -= 1;
                    } else if (key == "ArrowRight" || key == 39) { // right
                        offset.x += 1;
                    }
                    self.moveView(offset);
                    self.endMoveView();
                });
            },
            getLinePoints: function(view, event, offset) {
                var startPoint = this.getLineStart(view, event);
                return [
                    startPoint,
                    {
                        x: startPoint.x + offset.x,
                        y: startPoint.y + offset.y
                    }
                ];
            },
            getLineStart: function(view, event) {
                var index = parseInt($(event.target).attr("data-order"), 10),
                    connectPoints = view.getConnectPoints(view[view.type + "Group"]);
                return connectPoints[index];
            },
            createConnectLine: function(view, event, offset) {
                var model,
                    line,
                    points = this.getLinePoints(view, event, offset),
                    rect = C.utils.getPointsRectInfo(points);
                model = this.lineCollections.create({
                    type: "tool",
                    value: "line",
                    width: rect.width,
                    height: rect.height,
                    centerX: rect.cx,
                    centerY: rect.cy,
                    points: points
                });
                line = new View.line({ model: model, viewId: C.utils.count() });
                this.svg.add(line.render().svg);
                this.addSubView(line);
                return line;
            },
            updateConnectLine: function(line, view, offset) {
                var points = line.model.get("points"),
                    len = points.length;
                offset = this.getResizeLineOffset(
                    line,
                    len > 2 ? len : len - 1,
                    line.model.get("value"),
                    points,
                    offset
                );
                line.trigger("resize", offset);
            },
            setCreateLineEvents: function() {
                var self = this,
                    connectLine = null,
                    selectedView = null,
                    lastPos = null;
                $(document).mousedown(function(event) {
                    if (event.button == 0 && self.isClickOnCreateLine(event)) {
                        selectedView = self.getSelectedViewByTarget(event);
                        lastPos = {
                            x: event.clientX,
                            y: event.clientY
                        };
                    }
                });
                $(document).mousemove(function(event) {
                    if (lastPos && selectedView) {
                        var offset = {
                            x: event.clientX - lastPos.x,
                            y: event.clientY - lastPos.y
                        };
                        if (!connectLine) {
                            connectLine = self.createConnectLine(selectedView, event, offset);
                        } else {
                            self.updateConnectLine(connectLine, selectedView, offset);
                        }
                        lastPos = {
                            x: event.clientX,
                            y: event.clientY
                        };
                    }
                });
                $(document).mouseup(function(event) {
                    if (connectLine) {
                        Backbone.trigger("lineClose", {});
                    }
                    connectLine = null;
                    lastPos = null;
                });
            },
            getClosestViewInfo: function(point, diff) {
                var target = {},
                    hasFound = false;
                _.each(this.subViews, function(view) {
                    if (hasFound) {
                        return;
                    }
                    if (view.type == "rect" || view.type == "device") {
                        var connectPoints = view.getConnectPoints(view[view.type + "Group"]);
                        var minRectDis = C.utils.minDisToRect(point, connectPoints);
                        if (!target.minRectDis || minRectDis < target.minRectDis) {
                            target.point = null;
                            target.minDis = null;
                            target.minRectDis = minRectDis;
                            target.view = view;
                            for (var i = 0; i < connectPoints.length; i++) {
                                var dis = C.utils.distance(point, connectPoints[i]);
                                if (!target.minDis || dis < target.minDis) {
                                    target.minDis = dis;
                                    target.point = connectPoints[i];
                                }
                            }
                        }
                    }
                });
                if (diff) {
                    if (target.minRectDis <= diff) {
                        return target;
                    } else {
                        return {};
                    }
                }
                return target;
            },
            getResizeLineOffset: function(selectedView, order, type, points, pointOffset) {
                if (order == 0 || (type == "polyline" && order == points.length) || (type == "line" && order == points.length - 1)) {
                    var index = type == "line" ? order : Math.max(order - 1, 0),
                        viewInfo = this.getClosestViewInfo(
                            {
                                x: points[index].x + pointOffset.x,
                                y: points[index].y + pointOffset.y
                            },
                            selectedView.closeDis
                        );
                    if (viewInfo.view) {
                        Backbone.trigger("lineClose", { id: viewInfo.view.id });
                        if (viewInfo.minDis <= selectedView.connectDis) {
                            pointOffset = {
                                x: viewInfo.point.x - points[index].x,
                                y: viewInfo.point.y - points[index].y
                            };
                            viewInfo.isConnected = true;
                        }
                    } else {
                        Backbone.trigger("lineClose", {});
                    }
                }
                return _.extend({ points: C.utils.deepCopy(points), order: order }, pointOffset, viewInfo);
            },
            setResizeEvents: function() {
                var self = this,
                    selectedView = null,
                    lastPos = null,
                    size = null,
                    points = null,
                    order = 0;
                $(document).mousedown(function(event) {
                    if (event.button == 0 && self.isClickOnResize(event)) {
                        selectedView = self.getSelectedViewByTarget(event);
                        var style = selectedView.getStyle();
                        points = selectedView.model.get("points");
                        order = parseInt(event.target.getAttribute("data-order")) || 0;
                        size = {
                            width: style.width,
                            height: style.height,
                            centerX: selectedView.model.get("centerX"),
                            centerY: selectedView.model.get("centerY"),
                        };
                    }
                    if (selectedView && size) {
                        lastPos = {
                            x: event.clientX,
                            y: event.clientY
                        };
                    }
                });
                $(document).mousemove(function(event) {
                    if (selectedView && lastPos && size) {
                        var type = selectedView.model.get("value"),
                            pointOffset = {
                                x: event.clientX - lastPos.x,
                                y: event.clientY - lastPos.y
                            },
                            offset, scaleOffset;
                        if (type == "line" || type == "polyline") {
                            offset = self.getResizeLineOffset(selectedView, order, type, points, pointOffset);
                        } else {
                            scaleOffset = C.utils.getScaleOffset(order, lastPos, { x: event.clientX, y: event.clientY });
                            offset = {
                                width: size.width + scaleOffset.x,
                                height: size.height + scaleOffset.y,
                                centerX: size.centerX + pointOffset.x / 2,
                                centerY: size.centerY + pointOffset.y / 2,
                            };
                        }
                        selectedView.trigger("resize", offset);
                    }
                });
                $(document).mouseup(function(event) {
                    if (selectedView) {
                        Backbone.trigger("lineClose", {});
                    }
                    lastPos = null;
                    selectedView = null;
                    order = 0;
                    size = null;
                });
            },

            removeSelectedView: function() {
                this.selectedViews.forEach(function(view) {
                    view.trigger("removeSelected");
                });
                this.selectedViews = [];
            },
            mergeStyle: function(styleTarget, styleSource) {
                _.each(styleSource, function(value, key) {
                    if (value != styleTarget[key]) {
                        styleTarget[key] = "";
                    }
                });
                return styleTarget;
            },
            getGlobalStyle: function(){
                return {
                    scale: this.scale
                };
            },
            updateAttrBySelectedView: function() {
                var types = [],
                    ids = [],
                    style = null,
                    self = this;
                this.selectedViews.forEach(function(view) {
                    types.push(view.type);
                    ids.push(view.id);
                    if (!style) {
                        style = view.getStyle();
                    } else {
                        style = self.mergeStyle(style, view.getStyle());
                    }
                });
                style = _.extend(style, this.getGlobalStyle());
                this.attrView.trigger("showTypeAttr", { types: types, viewIds: ids, style: style });
            },

            selectView: function(view, isAppend) {
                if (!isAppend) {
                    var index = this.selectedViews.indexOf(view);
                    if (!!~index) {
                        return;
                    }
                    this.removeSelectedView();
                    this.selectedViews.push(view);
                    view.trigger("setSelected");
                } else {
                    var index = this.selectedViews.indexOf(view);
                    if (!~index) {
                        this.selectedViews.push(view);
                        view.trigger("setSelected");
                    } else {
                        this.selectedViews.splice(index, 1);
                        view.trigger("removeSelected");
                    }
                }
                this.updateAttrBySelectedView();
            },
            getInsideView: function(area) {
                var views = [];
                _.each(this.subViews, function(view) {
                    var box = view.svg.bbox(),
                        rect = [
                            { x: box.x, y: box.y },
                            { x: box.x2, y: box.y2 },
                        ];
                    if (view.type == "line") {
                        if (C.utils.isRectContain(area, rect)) {
                            views.push(view);
                        }
                    } else if (C.utils.isRectIntersect(area, rect)) {
                        views.push(view);
                    }
                });
                return views;
            },
            setSelectEvents: function() {
                var self = this,
                    lastPos = null,
                    isSelecting = false,
                    insideViews = [];
                $(document).mousedown(function(event) {
                    if (event.button != 0) {
                        return;
                    }
                    var isClickOnAttrEle = self.isClickOnAttrEle(event),
                        isClickOnPopup = self.isClickOnPopup(event),
                        selectedView = self.getSelectedViewByTarget(event);
                    if (!isClickOnAttrEle && !selectedView && !isClickOnPopup) {
                        if (self.selectedViews.length) {
                            self.removeSelectedView();
                        }
                        self.attrView.trigger("showTypeAttr", {style: self.getGlobalStyle()});
                        if (self.isClickOnDraw(event)) {
                            isSelecting = true;
                            lastPos = {
                                x: event.clientX,
                                y: event.clientY
                            };
                        }
                    } else if (selectedView) {
                        self.selectView(selectedView, event.ctrlKey);
                    }
                });
                $(document).mousemove(function(event) {
                    if (isSelecting && lastPos) {
                        if (!self.selectTipsBox) {
                            self.selectTipsBox = self.svg.group().addClass("svg-select-tips");
                        }
                        var startPos = self.domToSvgPos(lastPos),
                            endPos = self.domToSvgPos({
                                x: event.clientX,
                                y: event.clientY
                            }),
                            rectPoints = C.utils.getRectPoints([startPos, endPos]);
                        self.selectTipsBox.clear();
                        self.selectTipsBox.rect(Math.abs(endPos.x - startPos.x), Math.abs(endPos.y - startPos.y))
                            .attr({
                                x: parseInt(rectPoints[0].x) + 0.5,
                                y: parseInt(rectPoints[0].y) + 0.5
                            })
                            .fill("rgba(0, 0, 120, 0.05)")
                            .stroke({ color: "rgba(0,0,120, 0.8)" });
                        insideViews = self.getInsideView([rectPoints[0], rectPoints[2]]);
                    }
                });
                $(document).mouseup(function(event) {
                    isSelecting = false;
                    lastPos = null;
                    if (self.selectTipsBox) {
                        self.selectTipsBox.remove();
                    }
                    self.selectTipsBox = null;
                    if (insideViews.length) {
                        insideViews.forEach(function(view) {
                            self.selectedViews.push(view);
                            view.trigger("setSelected");
                        });
                    }
                    insideViews = [];
                });
            },

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
                this.toolView.trigger("selectDone");
                this.deviceView.trigger("selectDone");
            },
            hover: function(event) {
                if (this.itemToBeAdd.type && this.itemToBeAdd.value) {
                    this.showItemToBeAdd(event);
                } else {}
            },
            showItemToBeAdd: function(event) {
                var pos = this.getMousePos(event),
                    model = this.createItem(this.itemToBeAdd, pos);
                this.createItemView(model, { isToBeAdd: true });
            },
            removeItemView: function() {
                if (this.elemToBeAdd) {
                    var collection = this.getTypeItem(this.elemToBeAdd.model.toJSON());
                    collection.remove(this.elemToBeAdd.model);
                    this.elemToBeAdd.model.destroy();
                }
            },
            addItem: function(event) {
                var pos = this.getMousePos(event),
                    model = null;
                if (this.itemToBeAdd.type && this.itemToBeAdd.value) {
                    if (!this.isClickOnDraw(event)) {
                        this.removeItemView();
                    } else {
                        model = this.createItem(this.itemToBeAdd, pos);
                        this.createItemView(model, { isToBeAdd: false });
                    }
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
            createItem: function(item, pos) {
                var collection = this.getTypeItem(item),
                    model = null;
                if (!this.elemToBeAdd) {
                    model = collection.create({
                        centerX: pos.x,
                        centerY: pos.y,
                        type: item.type,
                        value: item.value
                    });
                } else {
                    if (this.elemToBeAdd.type != "line") {
                        model = this.elemToBeAdd.model.set({
                            centerX: pos.x,
                            centerY: pos.y
                        });
                    } else {
                        var modelData = this.elemToBeAdd.model.toJSON(),
                            offset = {
                                x: pos.x - modelData.centerX,
                                y: pos.y - modelData.centerY
                            },
                            points = C.utils.updatePoints(this.elemToBeAdd.getPoints(), offset);
                        model = this.elemToBeAdd.model.set({
                            centerX: pos.x,
                            centerY: pos.y,
                            points: points
                        });
                    }
                }
                return model;
            },
            createItemView: function(model, options) {
                var data = model.toJSON(),
                    type = "";
                if (data.type == "device") {
                    type = data.type;
                } else if (data.value == "line" || data.value == "polyline") {
                    type = "line";
                } else if (data.value) {
                    type = "rect";
                }
                return this.addItemView(type, model, options);
            },
            addSubView: function(view) {
                var id = view.id || C.utils.count();
                this.subViews[id] = view;
                view.id = id;
                view.svg.addClass("svg-view").attr("data-id", id);
            },
            getSubView: function(key) {
                var view = null;
                if (this.subViews.hasOwnProperty(key)) {
                    view = this.subViews[key];
                }
                return view;
            },
            addItemView: function(type, model, options) {
                var view = null;
                if (!this.elemToBeAdd) {
                    this.elemToBeAdd = view = new View[type]({ model: model, viewId: C.utils.count() });
                    this.svg.add(view.render().svg);
                } else {
                    view = this.elemToBeAdd;
                }
                if (!options.isToBeAdd) {
                    this.addSubView(view);
                    this.selectView(view);
                }
            },
            setAddViewEvents: function() {
                var self = this;
                $(document).mousedown(function(event) {
                    if (self.isClickOnDevice(event)) {
                        self.deviceView.trigger("setSelected", { event: event });
                    } else if (self.isClickOnTool(event)) {
                        self.toolView.trigger("setSelected", { event: event });
                    }
                });
                $(document).mousemove(function(event) {
                    self.hover(event);
                });
                $(document).mouseup(function(event) {
                    self.addItem(event);
                });
            },

            setBodyEvents: function() {
                this.setAddViewEvents();
                this.setMoveEvents();
                this.setResizeEvents();
                this.setCreateLineEvents();
                this.setSelectEvents();
            },
            setOtherEvents: function() {
                this.listenTo(Backbone, "setScale", this.scaleSvg);
            },
            scaleSvg: function(options) {
                this.scale = options.value;
                var scale = options.value / 100;
                this.svg.transform({scale: scale});
                this.updateBarSize();
            },

            renderGrid: function() {
                var gap = 12,
                    box = this.root.rbox(),
                    shadowColor = "#f2f2f2",
                    deepColor = "#ccc",
                    lineWidth = 1,
                    path,
                    max = Math.max(box.width, box.height);
                if (this.bg) {
                    this.bg.clear();
                } else {
                    this.bg = this.root.group();
                }
                for (var i = 0; i <= max; i += gap) {
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
                this.$container = $elem;
                this.root = SVG($elem[0]).size("100%", "100%");
                this.renderGrid();
                this.svg = this.root.group();
                this.initScroll();
            },
            updateBarPos: function(type, offset) {
                var $target;
                if (type == "ver") {
                    $target = this.$container.find(".ver-bar");
                    $target.css("top", this.getScrollBarOffset(type, parseFloat($target.css("top")) + offset) + "px");
                } else {
                    $target = this.$container.find(".hor-bar");
                    $target.css("left", this.getScrollBarOffset(type, parseFloat($target.css("left")) + offset) + "px");
                }
            },
            updateSvgPos: function(offset) {
                var transform = this.svg.transform();
                transform.x -= offset.x || 0;
                transform.y -= offset.y || 0;
                this.svg.transform(transform);
            },
            updateScrollPos: function($target, isMove, offset) {
                var type, direction, data = {};
                if ($target.hasClass("ver-bar")) {
                    type = "ver";
                    direction = "y";
                } else {
                    type = "hor";
                    direction = "x";
                }
                if (isMove) {
                    data[direction] = this.getScrollSize(type, isMove, offset[direction]);
                    this.updateSvgPos(data);
                    this.updateBarPos(type, offset[direction]);
                } else {
                    data[direction] = this.getScrollSize(type, isMove, offset[direction]);
                    this.updateSvgPos(_.pick(offset, direction));
                    this.updateBarPos(type, data[direction]);
                }
            },
            updateBarSize: function() {
                var minSize = 15,
                    $verBar = this.$container.find(".ver-bar"),
                    $horBar = this.$container.find(".hor-bar"),
                    width = this.$container.width(),
                    height = this.$container.height(),
                    svgSize = this.root.rbox(),
                    transform = this.svg.transform(),
                    svgWidth = svgSize.width * transform.scaleX,
                    svgHeight = svgSize.height * transform.scaleY;
                if (svgWidth <= width) {
                    $horBar.hide();
                } else {
                    $horBar.show();
                    $horBar.width(Math.max(width * width / svgWidth, minSize));
                }
                if (svgHeight <= height) {
                    $verBar.hide();
                } else {
                    $verBar.show();
                    $verBar.height(Math.max(height * height / svgHeight, minSize));
                }
            },
            getScrollBarOffset: function(type, offset){
                var minValue = 20,
                    maxValue,
                    size,
                    $target;
                if (type == "ver") {
                    $target = this.$container.find(".ver-bar");
                    maxValue = this.$container.height();
                    size = $target.height();
                } else {
                    $target = this.$container.find(".hor-bar");
                    maxValue = this.$container.width();
                    size = $target.width();
                }
                if (offset < minValue) {
                    offset = minValue;
                } else if (offset + size > maxValue) {
                    offset = maxValue - size + minValue;
                }
                return offset;
            },
            getScrollSize: function(type, isMove, offset){
                var width = this.$container.width(),
                    height = this.$container.height(),
                    svgSize = this.root.rbox(),
                    transform = this.svg.transform(),
                    svgWidth = svgSize.width * transform.scaleX,
                    svgHeight = svgSize.height * transform.scaleY,
                    percent = 0,
                    value;
                if (type == "ver") {
                    percent = svgHeight / height;
                } else {
                    percent = svgWidth / width;
                }
                if (isMove) {
                    value = offset * percent;
                } else {
                    value = offset / percent;
                }
                return value;
            },
            initScroll: function() {
                var self = this;
                function createScrollbar(){
                    var $elem = $("<span></span>").addClass("scrollbar hor-bar");
                    self.$container.append($elem);
                    $elem = $("<span></span>").addClass("scrollbar ver-bar");
                    self.$container.append($elem);
                }
                function setEvents(){
                    var $scrollbar = self.$container.find(".scrollbar"),
                        lastPos = null,
                        $target = null;
                    if ($scrollbar.length) {
                        $scrollbar.mousedown(function(event){
                            lastPos = {x: event.clientX, y: event.clientY};
                            $target = $(event.target);
                        });
                        $(document).mousemove(function(event){
                            if (!lastPos) {
                                return ;
                            }
                            var offset = {
                                x: event.clientX - lastPos.x,
                                y: event.clientY - lastPos.y
                            };
                            self.updateScrollPos($target, true, offset);
                            lastPos = {x: event.clientX, y: event.clientY};
                        });
                        $(document).mouseup(function(){
                            lastPos = null;
                            $target = null;
                        });
                    }
                    self.root.node.addEventListener("wheel", function(event){
                        var $verBar = self.$container.find(".ver-bar"),
                            $horBar = self.$container.find(".hor-bar");
                        self.updateScrollPos($verBar, false, {y: event.deltaY});
                        self.updateScrollPos($horBar, false, {x: event.deltaX});
                    });
                }
                createScrollbar();
                this.updateBarSize();
                setEvents();
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
                this.attrView = new Attr.view({ model: new Attr.model() });
                this.$main.append(this.attrView.render().el);
            },

            initDevice: function(devices) {
                this.deviceView = new Device.view({ model: new Device.model(), devices: devices });
                this.$main.append(this.deviceView.render().el);
                var deviceHeight = $(".bottom-icons")[0].offsetHeight;
                $(".draw-content").css("margin-bottom", deviceHeight + "px");

                this.listenTo(this.deviceView, "selectDevice", this.setSelectedItem);
            },

            initTool: function(tools) {
                this.toolView = new Tool.view({ model: new Tool.model(), tools: tools });
                this.$main.find(".top-attrs").after(this.toolView.render().el);

                this.listenTo(this.toolView, "selectTool", this.setSelectedItem);
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
                window.app = app;
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
        };

        Draw.init(
            {
                el: ".outer-container",
                isEdit: true,
                tools: [
                    {
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
                devices: [
                    {
                        type: 2,
                        name: "接地设备",
                        src: "/imgs/2.svg",
                        devices: [
                            {
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