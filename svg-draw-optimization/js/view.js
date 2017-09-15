define(["jquery", "underscore", "backbone", "svg", "common"], function($, _, Backbone, SVG, C) {
    var BaseView = Backbone.View.extend({
        domToSvgPos: function(pos) {
            var svgDoc = this.getSvgRoot(),
                $main = this.getMainContainerElem(),
                offset = $(svgDoc.node).offset(),
                docScrollTop = $(window).scrollTop(),
                docScrollLeft = $(window).scrollLeft(),
                scrollTop = $main.scrollTop() + docScrollTop,
                scrollLeft = $main.scrollLeft() + docScrollLeft;
            return {
                x: pos.x - offset.left + scrollLeft,
                y: pos.y - offset.top + scrollTop
            };
        },

        getSvgRoot: function(isSvgNode) {
            var svgRoot = this.svg.doc();
            return svgRoot;
        },
        getMainContainerElem: function() {
            return $(this.svg.node).parents(".draw-container");
        },

        getMousePos: function(event) {
            var x = event.clientX,
                y = event.clientY;
            return this.domToSvgPos({
                x: x,
                y: y
            });
        },
    });
    var View = BaseView.extend({
        initialize: function(data) {
            this.baseSvg = data.svg;
            this.svg = null;

            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, "destroy", this.remove);
            this.id = data.viewId || 0;

            this.listenTo(Backbone, "setFont", this.setFont);
            this.listenTo(Backbone, "setFontSize", this.setFontSize);
            this.listenTo(Backbone, "setTextColor", this.setTextColor);

            this.listenTo(Backbone, "setFillColor", this.setFillColor);

            this.listenTo(Backbone, "setBorderColor", this.setBorderColor);
            this.listenTo(Backbone, "setBorderWidth", this.setBorderWidth);
            this.listenTo(Backbone, "setBorderStyle", this.setBorderStyle);

            this.listenTo(Backbone, "setStartArrow", this.setLinePoint);
            this.listenTo(Backbone, "setEndArrow", this.setLinePoint);

            this.listenTo(Backbone, "setArrange", this.setArrange);

            this.on({
                "setSelected": this.selectedView,
                "removeSelected": this.removeSelected
            }, this);

            this.init(data);
        },
        init: function() {},
        setSvgText: function(text, svg) {
            var padding = {
                    top: 2,
                    left: 4
                },
                boxWidth = svg.bbox().width,
                svgText = svg.text(""),
                svgTspan = null,
                textBox = null,
                lineText = [],
                str = "",
                lastStr = "",
                dy = 0;
            for (var i = 0, len = text.length; i < len; i++) {
                lastStr = str;
                str += text[i];
                svgText.tspan(str);
                textBox = svgText.bbox();
                if (textBox.width + padding.left * 2 > boxWidth) {
                    lineText.push({ text: lastStr, dy: dy });
                    dy = textBox.height;
                    str = text[i];
                    svgText.tspan(str);
                }
            }
            if (str) {
                lineText.push({ text: str, dy: dy });
            }
            svgText.remove();
            svgText = svg.text(function(add) {
                lineText.forEach(function(item) {
                    add.tspan(item.text).newLine();
                });
            });
            return svgText;
        },

        getStyleList: function() {
            var styles = [
                "font", "fontSize", "textColor", "textBold", "textItalic",
                "arrange",
                "fillColor", "borderColor", "borderStyle", "borderWidth",
                "startArrow", "endArrow",
                "width", "height",
            ];
            return styles;
        },
        getDefaultStyle: function() {
            return this.defaultStyle;
        },
        getStyle: function() {
            var defaultStyle = this.getDefaultStyle(),
                styleList = this.getStyleList(),
                currentStyle = _.pick.apply(_, [this.model.toJSON()].concat(styleList));
            return _.extend({}, defaultStyle, currentStyle);
        },
        setStyle: function() {},

        isIncludeCurrentView: function(ids) {
            ids = ids || [];
            if (!~ids.indexOf(this.id)) {
                return false;
            }
            return true;
        },

        setFont: function(options) {
            C.layer.topNotify("info", { content: "set font " + options.value, shade: false, time: 2 });
        },
        setFontSize: function(options) {
            C.layer.topNotify("info", { content: "set font size" + options.value + "px", shade: false, time: 2 });
        },

        setTextColor: function(options) {
            C.layer.topNotify("info", { content: "set text color #" + options.value, shade: false, time: 2 });
        },
        setFillColor: function(options) {
            C.layer.topNotify("info", { content: "set fill color #" + options.value, shade: false, time: 2 });
        },
        setBorderColor: function(options) {
            C.layer.topNotify("info", { content: "set border color #" + options.value, shade: false, time: 2 });
        },
        setLinePoint: function(options) {
            var startArrow = _.extend({}, this.model.get("startArrow")),
                endArrow = _.extend({}, this.model.get("startArrow"));
            if (this.isIncludeCurrentView(options.viewIds)) {
                if (options.attr == "startArrow") {
                    startArrow = options.value;
                } else {
                    endArrow = options.value;
                }
                this.model.set({
                    startArrow: startArrow,
                    endArrow: endArrow
                });
            }
        },
        setBorderWidth: function(options) {
            C.layer.topNotify("info", { content: "set border width" + options.value, shade: false, time: 2 });
        },
        setBorderStyle: function(options) {
            C.layer.topNotify("info", { content: "set border style " + options.value, shade: false, time: 2 });
        },

        setArrange: function(options) {
            C.layer.topNotify("info", { content: "set arrange " + options.value, shade: false, time: 2 });
        },

        createBorder: function(positionGroup, isShow) {
            var padding = 0,
                cornerWidth = 6,
                box = positionGroup.bbox(),
                group = this.svg.group().addClass("svg-group-border"),
                centerPoints = [
                    box,
                    { cx: box.cx - box.width / 2 - padding, cy: box.cy - box.height / 2 - padding, width: cornerWidth, height: cornerWidth },
                    { cx: box.cx + box.width / 2 + padding, cy: box.cy - box.height / 2 - padding, width: cornerWidth, height: cornerWidth },
                    { cx: box.cx + box.width / 2 + padding, cy: box.cy + box.height / 2 + padding, width: cornerWidth, height: cornerWidth },
                    { cx: box.cx - box.width / 2 - padding, cy: box.cy + box.height / 2 + padding, width: cornerWidth, height: cornerWidth },
                ],
                path = null;
            if (!isShow) {
                group.addClass("dsn");
            }
            group.back();
            this.borderGroup = group;
            for (var i = 0, len = centerPoints.length; i < len; i++) {
                box = centerPoints[i];
                path = group.path(
                    "M " + (box.cx - box.width / 2) + " " + (box.cy - box.height / 2) +
                    "L " + (box.cx + box.width / 2) + " " + (box.cy - box.height / 2) +
                    "L " + (box.cx + box.width / 2) + " " + (box.cy + box.height / 2) +
                    "L " + (box.cx - box.width / 2) + " " + (box.cy + box.height / 2) +
                    "Z"
                );
                path.stroke({ color: "#60f" })
                    .fill("#fff");
                if (i != 0) {
                    path.addClass("svg-border-corner").attr("data-order", i);
                    if (i % 2 == 1) {
                        path.addClass("svg-border-corner svg-cursor-nwse");
                    } else {
                        path.addClass("svg-border-corner svg-cursor-nesw");
                    }
                }
            }
        },
        getConnectPoints: function(positionGroup) {
            var padding = 0,
                box = positionGroup.bbox();
            return [
                { x: box.cx, y: box.cy - box.height / 2 - padding },
                { x: box.cx + box.width / 2 + padding, y: box.cy },
                { x: box.cx, y: box.cy + box.height / 2 + padding },
                { x: box.cx - box.width / 2 - padding, y: box.cy }
            ];
        },
        createConnectPoints: function(positionGroup, isShow) {
            var group = this.svg.group().addClass("svg-group-points"),
                cornerWidth = 6,
                centerPoints = this.getConnectPoints(positionGroup),
                circle = null;
            if (!isShow) {
                group.addClass("dsn");
            }
            this.pointGroup = group;
            for (var i = 0, len = centerPoints.length; i < len; i++) {
                box = centerPoints[i];
                circle = group.circle(cornerWidth).center(box.x, box.y)
                circle.fill("#999").attr("data-order", i);
            }
        },
        setPointGroupStatus: function(isShow) {
            if (!this.pointGroup) {
                return;
            }
            if (isShow) {
                this.pointGroup.removeClass("dsn");
            } else {
                this.pointGroup.addClass("dsn");
            }
        },
        showConnectPoints: function(options) {
            if (options.id == this.id) {
                this.setPointGroupStatus(true);
                this.isShowPoints = true;
            } else {
                this.setPointGroupStatus(false);
                this.isShowPoints = false;
            }
        },
        setBorderGroupStatus: function(isShow) {
            if (!this.borderGroup) {
                return;
            }
            if (isShow) {
                this.borderGroup.removeClass("dsn");
            } else {
                this.borderGroup.addClass("dsn");
            }
        },
        removeSelected: function() {
            this.setBorderGroupStatus(false);
            this.setPointGroupStatus(false);
            this.isSelected = false;
            this.isShowPoints = false;
        },
        selectedView: function() {
            this.setBorderGroupStatus(true);
            this.setPointGroupStatus(true);
            this.isShowPoints = true;
            this.isSelected = true;
        },
        moveView: function(offset) {
            var transform = this.svg.transform();
            this.svg.transform({
                x: transform.x + offset.x,
                y: transform.y + offset.y
            });
        },
        moveEnd: function() {
            var transform = this.svg.transform();
            this.model.set({ offset: transform });
        },
        resizeView: function(size) {
            this.model.set({
                width: size.width,
                height: size.height,
                centerX: size.centerX,
                centerY: size.centerY
            });
        },
    });

    var LineView = View.extend({
        tagName: "g",
        className: "svg-line",
        type: "line",
        defaultStyle: {
            borderColor: "#333",
            borderStyle: "solid",
            borderWidth: 1,
            fillColor: "transparent",
            startArrow: "line-no-arrow",
            endArrow: "line-width-arrow",
            width: 100,
            hight: 60,
        },
        init: function() {
            this.svg = new SVG.G().addClass(this.className);
            this.lineGroup = null;
            this.borderGroup = null;
            this.pointGroup = null;

            this.isSelected = false;
            this.connectDis = 5;
            this.closeDis = 10;
            this.setElement(this.svg.node);
            this.on({
                "move": this.moveView,
                "moveEnd": this.moveEnd,
                "resize": this.resizeView,
            }, this);
        },

        events: {},
        resizeView: function(options) {
            // 更新变动点的坐标
            options.points = C.utils.updateLinePoints(options.points, options.order, { x: options.x, y: options.y });
            var rect = C.utils.getPointsRectInfo(options.points);
            this.model.set({
                width: rect.width,
                height: rect.height,
                centerX: rect.cx,
                centerY: rect.cy,
                points: options.points
            });
        },
        createBorder: function(isShow) {
            var endPoints = this.getPoints(),
                points = this.getMovePoints(),
                cornerWidth = 4,
                group = this.svg.group().addClass("svg-group-border"),
                path = null;
            if (!isShow) {
                group.addClass("dsn");
            }
            this.borderGroup = group;
            for (var i = 0, len = points.length; i < len; i++) {
                box = points[i];
                path = group.path(
                    "M " + (box.x - cornerWidth / 2) + " " + (box.y - cornerWidth / 2) +
                    "L " + (box.x + cornerWidth / 2) + " " + (box.y - cornerWidth / 2) +
                    "L " + (box.x + cornerWidth / 2) + " " + (box.y + cornerWidth / 2) +
                    "L " + (box.x - cornerWidth / 2) + " " + (box.y + cornerWidth / 2) +
                    "Z"
                );
                if (i == 0) {
                    resizeClass = "svg-cursor-nwse";
                } else if (i == points.length - 1) {
                    resizeClass = "svg-cursor-nesw";
                } else {
                    if (C.utils.isFloatEqual(endPoints[i - 1].x, endPoints[i].x)) {
                        resizeClass = "svg-cursor-ew";
                    } else {
                        resizeClass = "svg-cursor-ns";
                    }
                }
                path.stroke({ color: "#60f" })
                    .fill("#fff")
                    .addClass("svg-border-corner " + resizeClass)
                    .attr("data-order", i);
            }
        },
        getSize: function() {
            return {
                width: this.model.get("width") || this.defaultStyle.width,
                height: this.model.get("height") || this.defaultStyle.height
            }
        },
        getLineDefaultPoints: function() {
            var modelData = this.model.toJSON(),
                size = this.getSize();
            return [{
                    x: modelData.centerX - size.width / 2,
                    y: modelData.centerY
                },
                {
                    x: modelData.centerX + size.width / 2,
                    y: modelData.centerY
                }
            ];
        },
        getPolylineDefaultPoints: function() {
            var modelData = this.model.toJSON(),
                size = this.getSize();
            return [{
                    x: modelData.centerX - size.width / 2,
                    y: modelData.centerY - size.height / 2
                },
                {
                    x: modelData.centerX,
                    y: modelData.centerY - size.height / 2
                },
                {
                    x: modelData.centerX,
                    y: modelData.centerY + size.height / 2
                },
                {
                    x: modelData.centerX + size.width / 2,
                    y: modelData.centerY + size.height / 2
                }
            ];
        },
        getPoints: function(refresh) {
            var modelData = this.model.toJSON();
            if (!refresh && modelData.points.length) {
                return modelData.points;
            }
            if (modelData.value == "line") {
                return this.getLineDefaultPoints();
            } else {
                return this.getPolylineDefaultPoints();
            }
        },
        getEndPoints: function() {
            var points = this.getPoints();
            return {
                start: points[0],
                end: points[points.length - 1]
            };
        },
        getMidPoints: function() {
            var points = this.getPoints(),
                midPoints = [];
            if (points.length > 2) {
                for (var i = 1; i < points.length; i++) {
                    midPoints.push({
                        x: (points[i - 1].x + points[i].x) / 2,
                        y: (points[i - 1].y + points[i].y) / 2
                    });
                }
            }
            return midPoints;
        },
        getMovePoints: function() {
            var modelData = this.model.toJSON(),
                points = this.getEndPoints(),
                midPoints;
            points = [points.start, points.end];
            if (modelData.value == "line") {
                return points;
            }
            midPoints = this.getMidPoints();
            Array.prototype.splice.apply(points, ([1, 0]).concat(midPoints));
            return points;
        },
        createArrow: function(pos) {
            var svgRoot = this.getSvgRoot(),
                key = pos + "Arrow";
            if (this[key]) {
                return this[key];
            }
            if (!svgRoot) {
                return null;
            }
            if (pos == "end") {
                this[key] = svgRoot.marker(10, 10, function(add) {
                    add.path("M 0 0 L 10 5 L 0 10 z");
                    this.attr({
                        refX: 10,
                        refY: 5
                    });
                });
            } else {
                this[key] = svgRoot.marker(10, 10, function(add) {
                    add.path("M 0 5 L 10 0 L 10 10 z");
                    this.attr({
                        refX: 0,
                        refY: 5
                    });
                });
            }
            return this[key];
        },
        setArrow: function(path) {
            var self = this,
                arrowPos = ["start", "end"];
            arrowPos.forEach(function(pos) {
                var marker = self.createArrow(pos),
                    arrow = self.model.get(pos + "Arrow");
                if (!arrow || arrow == "line-no-arrow") {
                    path.attr("marker-" + pos, null);
                } else if (marker) {
                    path.marker(pos, marker);
                }
            });
        },
        create: function(pos, type) {
            var group = this.svg.group().addClass("svg-line-group"),
                line = null,
                d = "",
                path,
                marker,
                points = C.utils.parsePointInt(this.getPoints());
            if (points.length > 2) {
                d = "M " + points[0].x + " " + points[0].y +
                    " L " + points[1].x + " " + points[1].y +
                    " L " + points[2].x + " " + points[2].y +
                    " L " + points[3].x + " " + points[3].y;
            } else {
                d = "M " + points[0].x + " " + points[0].y +
                    " L " + points[1].x + " " + points[1].y;
            }
            group.path(d).attr({
                stroke: "transparent",
                "stroke-width": 5,
                fill: "transparent"
            });
            path = group.path(d).attr({
                stroke: this.defaultStyle.borderColor,
                fill: this.defaultStyle.fillColor
            });
            this.setArrow(path);
        },
        render: function() {
            var data = this.model.toJSON();
            this.svg.clear();
            if (data.offset) {
                this.svg.transform(data.offset);
            }
            this.create({ x: data.centerX, y: data.centerY }, data.value);
            this.createBorder(this.isSelected);
            return this;
        },
    });

    var RectView = View.extend({
        tagName: "g",
        className: "svg-rect",
        type: "rect",
        defaultStyle: {
            font: "Microsoft Yahei",
            fontSize: 12,
            textColor: "#333",
            textBold: false,
            textItalic: false,
            fillColor: "#fff",
            borderColor: "#333",
            borderStyle: "solid",
            borderWidth: 1,
            width: 100,
            height: 60,
            radius: 4
        },
        init: function() {
            this.svg = new SVG.G().addClass(this.className);
            this.borderGroup = null;
            this.rectGroup = null;
            this.pointGroup = null;
            this.isSelected = false;
            this.isShowPoints = false;
            this.setElement(this.svg.node);
            this.on({
                "move": this.moveView,
                "moveEnd": this.moveEnd,
                "resize": this.resizeView,
            }, this);

            this.listenTo(Backbone, "lineClose", this.showConnectPoints);
        },

        events: {
            "dblclick": "showTextEdit",
        },
        showTextEdit: function(event) {
            var box = this.svg.rbox(),
                pos = {
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height
                },
                self = this;
            C.textInput.init(pos, { text: this.model.get("text") }, function(data) {
                self.model.set({ text: data.text, width: data.width, height: data.height });
            }, "triggerByTarget");
        },
        create: function(pos, type, text) {
            var group = this.svg.group().addClass("svg-rect-group"),
                rect = null,
                width = this.model.get("width") || this.defaultStyle.width,
                height = this.model.get("height") || this.defaultStyle.height;
            this.rectGroup = group;
            rect = group.rect(width, height);
            rect.attr({
                x: pos.x - width / 2,
                y: pos.y - height / 2,
                fill: this.defaultStyle.fillColor,
                stroke: this.defaultStyle.borderColor
            });
            if (type == "round-rect") {
                rect.radius(this.defaultStyle.radius);
            }
            if (text) {
                text = this.setSvgText(text, group)
                    .addClass("svg-rect-text")
                    .attr({
                        fill: this.defaultStyle.fillColor
                    }).leading(1);
                text.center(pos.x, pos.y);
            }
        },
        render: function() {
            var data = this.model.toJSON();
            this.svg.clear();
            if (data.offset) {
                this.svg.transform(data.offset);
            }
            this.create({ x: data.centerX, y: data.centerY }, data.value, data.text);
            this.createConnectPoints(this.rectGroup, this.isShowPoints);
            this.createBorder(this.rectGroup, this.isSelected);
            return this;
        },
    });

    var DeviceView = View.extend({
        tagName: "g",
        className: "svg-device",
        type: "device",
        defaultStyle: {
            font: "Microsoft Yahei",
            fontSize: 12,
            textColor: "#333",
            textBold: false,
            textItalic: false,
            fillColor: "#fff",
            borderColor: "#333",
            borderStyle: "solid",
            borderWidth: 1,
            width: 60,
            height: 60,
        },
        iconPadding: 10,
        init: function() {
            this.svg = new SVG.G().addClass(this.className);
            this.deviceGroup = null;
            this.borderGroup = null;
            this.pointGroup = null;
            this.isSelected = false;
            this.isShowPoints = false;
            this.setElement(this.svg.node);

            this.on({
                "move": this.moveView,
                "moveEnd": this.moveEnd,
                "resize": this.resizeView,
            }, this);

            this.listenTo(this.model, "change:deviceId", this.updateDeviceId);
            this.listenTo(Backbone, "setId", this.setDeviceId);
        },

        events: {
            "dblclick": "showDeviceIdList",
        },
        updateDeviceId: function(model, newId) {
            var id = model.previous("deviceId");
            if (id && id != newId) {
                Backbone.trigger("updateDeviceIdStatus", { type: this.model.get("value"), id: id, status: true });
            }
        },
        setDeviceId: function(options) {
            if (options.viewId == this.id) {
                this.model.set({ deviceId: options.deviceId, deviceName: options.deviceName });
            }
        },
        showDeviceIdList: function(event) {
            Backbone.trigger("showDeviceIdList", { type: this.model.get("value"), pos: { x: event.clientX, y: event.clientY }, id: this.id });
        },

        getImgUrl: function(type) {
            return "/imgs/" + type + ".svg";
        },
        create: function(pos, type, deviceName) {
            var group = this.svg.group().addClass("svg-device-group"),
                img = null,
                text = null,
                box = null,
                width = this.model.get("width") || this.defaultStyle.width,
                height = this.model.get("height") || this.defaultStyle.height;
            deviceName = deviceName || "设置设备";
            text = group.text("" + deviceName)
                .addClass("svg-device-id")
                .font({
                    fill: this.defaultStyle.fillColor,
                    family: this.defaultStyle.font,
                    size: this.defaultStyle.fontSize
                });
            box = text.rbox();
            text.attr({
                x: pos.x - box.width / 2,
                y: pos.y - height / 2 - box.height - this.iconPadding
            });
            img = group.image(this.getImgUrl(type), width, height)
                .attr({
                    x: pos.x - width / 2,
                    y: pos.y - height / 2
                });
            this.deviceGroup = group;
        },
        render: function() {
            var data = this.model.toJSON();
            if (this.deviceGroup) {
                this.svg.clear();
            }
            if (data.offset) {
                this.svg.transform(data.offset);
            }
            this.create({ x: data.centerX, y: data.centerY }, data.value, data.deviceName);
            this.createConnectPoints(this.deviceGroup, this.isShowPoints);
            this.createBorder(this.deviceGroup, this.isSelected);
            return this;
        },
    });

    return {
        base: BaseView,
        line: LineView,
        rect: RectView,
        device: DeviceView,

    }
});