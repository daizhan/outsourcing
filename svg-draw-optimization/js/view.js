define(["jquery", "underscore", "backbone", "svg", "common"], function($, _, Backbone, SVG, C) {
    var View = Backbone.View.extend({
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
                "setSelected": this.selectedView
            }, this);
            this.listenTo(Backbone, "removeSelected", this.removeSelected);

            this.init(data);
        },
        init: function() {},
        create: function(pos, type, parent) {},
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
            return this.svg.doc();
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

        getDefaultStyle: function() {},
        getCurrentStyle: function() {},
        setStyle: function() {},

        setFont: function(options){
            C.layer.topNotify("info", {content: "set font " + options.value, shade: false, time: 2});
        },
        setFontSize: function(options){
            C.layer.topNotify("info", {content: "set font size" + options.value + "px", shade: false, time: 2});
        },

        setTextColor: function(options){
            C.layer.topNotify("info", {content: "set text color #" + options.value, shade: false, time: 2});
        },
        setFillColor: function(options){
            C.layer.topNotify("info", {content: "set fill color #" + options.value, shade: false, time: 2});
        },
        setBorderColor: function(options){
            C.layer.topNotify("info", {content: "set border color #" + options.value, shade: false, time: 2});
        },
        setLinePoint: function(options){
            C.layer.topNotify("info", {content: "set line point " + options.value, shade: false, time: 2});
        },
        setBorderWidth: function(options){
            C.layer.topNotify("info", {content: "set border width" + options.value, shade: false, time: 2});
        },
        setBorderStyle: function(options){
            C.layer.topNotify("info", {content: "set border style " + options.value, shade: false, time: 2});
        },

        setArrange: function(options){
            C.layer.topNotify("info", {content: "set arrange " + options.value, shade: false, time: 2});
        },

        createBorder: function(positionGroup, isShow){
            var padding = 0,
                corderWidth = 6,
                box = positionGroup.bbox(),
                group = this.svg.group().addClass("svg-group-border"),
                centerPoints = [
                    box,
                    {cx: box.cx - box.width/2 - padding, cy: box.cy - box.height/2 - padding, width: corderWidth, height: corderWidth},
                    {cx: box.cx + box.width/2 + padding, cy: box.cy - box.height/2 - padding, width: corderWidth, height: corderWidth},
                    {cx: box.cx + box.width/2 + padding, cy: box.cy + box.height/2 + padding, width: corderWidth, height: corderWidth},
                    {cx: box.cx - box.width/2 - padding, cy: box.cy + box.height/2 + padding, width: corderWidth, height: corderWidth},
                ],
                path = null;
            if (!isShow) {
                group.addClass("dsn");
            }
            group.back();
            this.borderGroup = group;
            for (var i = 0, len = centerPoints.length; i < len; i ++) {
                box = centerPoints[i];
                path = group.path(
                    "M " + (box.cx - box.width/2) + " " + (box.cy - box.height/2) +
                    "L " + (box.cx + box.width/2) + " " + (box.cy - box.height/2) +
                    "L " + (box.cx + box.width/2) + " " + (box.cy + box.height/2) +
                    "L " + (box.cx - box.width/2) + " " + (box.cy + box.height/2) +
                    "Z"
                );
                path.stroke({ color: "#60f"})
                    .fill("#fff");
                if (i != 0) {
                    path.addClass("svg-border-corner");
                    if (i % 2 == 1) {
                        path.addClass("svg-border-corner svg-cursor-nwse");
                    } else {
                        path.addClass("svg-border-corner svg-cursor-nesw");
                    }
                }
            }
        },

        createConnectPoints: function(positionGroup, isShow){
            var padding = 0,
                corderWidth = 6,
                box = positionGroup.bbox(),
                group = this.svg.group().addClass("svg-group-points"),
                centerPoints = [
                    {cx: box.cx, cy: box.cy - box.height/2 - padding, width: corderWidth},
                    {cx: box.cx + box.width/2 + padding, cy: box.cy, width: corderWidth},
                    {cx: box.cx, cy: box.cy + box.height/2 + padding, width: corderWidth},
                    {cx: box.cx - box.width/2 - padding, cy: box.cy, width: corderWidth},
                ],
                circle = null;
            if (!isShow) {
                group.addClass("dsn");
            }
            this.pointGroup = group;
            for (var i = 0, len = centerPoints.length; i < len; i ++) {
                box = centerPoints[i];
                circle = group.circle(box.width).center(box.cx, box.cy)
                circle.fill("#999");
            }
        },
        setPointGroupStatus: function(isShow){
            if (!this.pointGroup) {
                return;
            }
            if (isShow) {
                this.pointGroup.removeClass("dsn");
            } else {
                this.pointGroup.addClass("dsn");
            }
        },
        setBorderGroupStatus: function(isShow){
            if (!this.borderGroup) {
                return;
            }
            if (isShow) {
                this.borderGroup.removeClass("dsn");
            } else {
                this.borderGroup.addClass("dsn");
            }
        },
        removeSelected: function(options){
            if (!options.viewId || options.viewId != this.id) {
                this.setBorderGroupStatus(false);
                this.isSelected = false;
            }
        },
        selectedView: function(){
            var type = this.model.get("type");
            Backbone.trigger("removeSelected", {viewId: this.id});
            Backbone.trigger("showTypeAttr", {type: type == "device" ? type : this.model.get("value")});
            this.setBorderGroupStatus(true);

            this.isSelected = true;
        },
        moveView: function(offset){
            var transform = this.svg.transform();
            this.svg.transform({
                x: transform.x+offset.x,
                y: transform.y+offset.y
            });
        },
        moveEnd: function(){
            var transform = this.svg.transform();
            this.model.set({ offset: transform });
        }
    });

    var LineView = View.extend({
        tagName: "g",
        className: "svg-line",
        defaultStyle: {
            strokeColor: "#333",
        },
        defaultSize: {
            width: 100,
            height: 60
        },
        init: function() {
            this.svg = new SVG.G().addClass(this.className);
            this.lineGroup = null;
            this.borderGroup = null;
            this.pointGroup = null;

            this.isSelected = false;

            this.setElement(this.svg.node);
            this.on({
                "move": this.moveView,
                "moveEnd": this.moveEnd,
            }, this);
        },

        events: {
            "click": "selectedView",
        },
        createBorder: function(isShow){
            var points = this.getMovePoints();
                corderWidth = 4,
                group = this.svg.group().addClass("svg-group-border"),
                centerPoints = [
                    {cx: points.start.x, cy: points.start.y, width: corderWidth, height: corderWidth},
                    {cx: points.end.x, cy: points.end.y, width: corderWidth, height: corderWidth},
                ],
                path = null;
            if (points.mid){
                centerPoints.push({cx: points.mid.x, cy: points.mid.y, width: corderWidth, height: corderWidth});
            }
            if (!isShow) {
                group.addClass("dsn");
            }
            this.borderGroup = group;
            for (var i = 0, len = centerPoints.length; i < len; i ++) {
                box = centerPoints[i];
                path = group.path(
                    "M " + (box.cx - box.width/2) + " " + (box.cy - box.height/2) +
                    "L " + (box.cx + box.width/2) + " " + (box.cy - box.height/2) +
                    "L " + (box.cx + box.width/2) + " " + (box.cy + box.height/2) +
                    "L " + (box.cx - box.width/2) + " " + (box.cy + box.height/2) +
                    "Z"
                );
                path.stroke({ color: "#60f"})
                    .fill("#fff")
                    .addClass("svg-border-corner svg-cursor-nesw");
                if (i == 0) {
                    path.removeClass("svg-cursor-nesw").addClass("svg-cursor-nwse");
                }
                if (i == 2) {
                    path.removeClass("svg-cursor-nesw").addClass("svg-cursor-ew");
                }
            }
        },
        getLineDefaultPoints: function(){
            var modelData = this.model.toJSON();
            return {
                start: {
                    x: parseInt(modelData.centerX - this.defaultSize.width / 2),
                    y: parseInt(modelData.centerY)
                }, 
                end: {
                    x: parseInt(modelData.centerX + this.defaultSize.width / 2),
                    y: parseInt(modelData.centerY)
                }
            };
        },
        getPolylineDefaultPoints: function(){
            var modelData = this.model.toJSON();
            return {
                start: {
                    x: parseInt(modelData.centerX - this.defaultSize.width / 2),
                    y: parseInt(modelData.centerY - this.defaultSize.height / 2)
                },
                point1: {
                    x: parseInt(modelData.centerX),
                    y: parseInt(modelData.centerY - this.defaultSize.height / 2)
                },
                point2: {
                    x: parseInt(modelData.centerX),
                    y: parseInt(modelData.centerY + this.defaultSize.height / 2)
                },
                end: {
                    x: parseInt(modelData.centerX + this.defaultSize.width / 2),
                    y: parseInt(modelData.centerY + this.defaultSize.height / 2)
                }
            };
        },
        getPoints: function(){
            var modelData = this.model.toJSON();
            if (modelData.points.length) {
                return modelData.points;
            }
            if (modelData.value == "line") {
                return this.getLineDefaultPoints();
            } else {
                return this.getPolylineDefaultPoints();
            }
        },
        getEndPoints: function(){
            var points = this.getPoints();
            return {
                start: points.start,
                end: points.end
            };
        },
        getMidPoints: function(){
            var points = this.getPoints();
            if (points.point1 || points.point2) {
                return {
                    point1: points.point1,
                    point2: points.point2
                };
            }
            return null;
        },
        getMovePoints: function(){
            var modelData = this.model.toJSON();
                points = this.getEndPoints();
            if (modelData.value == "line") {
                return points;
            }
            return _.extend({mid: {x: modelData.centerX, y: modelData.centerY}}, points);
        },
        create: function(pos, type) {
            var group = this.svg.group().addClass("svg-line-group"),
                line = null,
                points = this.getPoints();
            if (points.point1) {
                line = group.path(
                    "M " + points.start.x + " " + points.start.y +
                    " L " + points.point1.x + " " + points.point1.y +
                    " L " + points.point2.x + " " + points.point2.y +
                    " L " + points.end.x + " " + points.end.y
                );
            } else {
                line = group.path(
                    "M " + points.start.x + " " + points.start.y +
                    " L " + points.end.x + " " + points.end.y
                );
            }
            line.attr({
                stroke: this.defaultStyle.strokeColor,
                fill: "transparent"
            });
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
        defaultStyle: {
            fill: "#fff",
            strokeColor: "#333",
            fontSize: 12,
            color: "#666"
        },
        defaultSize: {
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
            this.setElement(this.svg.node);
            this.on({
                "move": this.moveView,
                "moveEnd": this.moveEnd,
            }, this);
        },

        events: {
            "dblclick": "showTextEdit",
            "click": "selectedView",
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
                width = this.model.get("width") || this.defaultSize.width,
                height = this.model.get("height") || this.defaultSize.height;
            this.rectGroup = group;
            rect = group.rect(width, height);
            rect.attr({
                x: pos.x - width / 2,
                y: pos.y - height / 2,
                fill: this.defaultStyle.fill,
                stroke: this.defaultStyle.strokeColor
            });
            if (type == "round-rect") {
                rect.radius(this.defaultSize.radius);
            }
            if (text) {
                text = this.setSvgText(text, group)
                    .addClass("svg-rect-text")
                    .attr({
                        fill: this.defaultStyle.color
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
        defaultStyle: {
            font: "Helvetica",
            fontSize: 12,
            color: "#666"
        },
        iconPadding: 10,
        defaultSize: {
            width: 60,
            height: 60
        },
        init: function() {
            this.svg = new SVG.G().addClass(this.className);
            this.deviceGroup = null;
            this.borderGroup = null;
            this.pointGroup = null;
            this.isSelected = false;
            this.setElement(this.svg.node);

            this.on({
                "move": this.moveView,
                "moveEnd": this.moveEnd,
            }, this);

            this.listenTo(this.model, "change:deviceId", this.updateDeviceId);
            this.listenTo(Backbone, "setId", this.setDeviceId);
        },

        events: {
            "dblclick": "showDeviceIdList",
            "click": "selectedView",
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
                box = null;
            deviceName = deviceName || "设置设备";
            text = group.text("" + deviceName)
                .addClass("svg-device-id")
                .font({
                    fill: this.defaultStyle.color,
                    family: this.defaultStyle.font,
                    size: this.defaultStyle.size
                });
            box = text.rbox();
            text.attr({
                x: pos.x - box.width / 2,
                y: pos.y - this.defaultSize.height / 2 - box.height - this.iconPadding
            });
            img = group.image(this.getImgUrl(type), this.defaultSize.width, this.defaultSize.height)
                .attr({
                    x: pos.x - this.defaultSize.width / 2,
                    y: pos.y - this.defaultSize.height / 2
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
        base: View,
        line: LineView,
        rect: RectView,
        device: DeviceView,

    }
});