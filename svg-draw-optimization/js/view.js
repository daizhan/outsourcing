define(["jquery", "underscore", "backbone", "svg"], function($, _, Backbone, SVG) {
    var View = Backbone.View.extend({
        initialize: function(data) {
            this.baseSvg = data.svg;
            this.svg = null;

            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, "destroy", this.remove);
            this.id = data.viewId || 0;
            this.init(data);
        },
        init: function() {},
        create: function(pos, type, parent) {},

        svgToDomPos: function() {},
        domToSvgPos: function(pos) {},
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
            this.setElement(this.svg.node);
            this.on({

            }, this);
        },

        events: {},

        create: function(pos, type) {
            var group = this.svg,
                line = null;
            if (type == "polyline") {
                line = group.path(
                    "M " + (pos.x - this.defaultSize.width / 2) + " " + (pos.y - this.defaultSize.height / 2) +
                    " L " + pos.x + " " + (pos.y - this.defaultSize.height / 2) + " " +
                    " L " + pos.x + " " + (pos.y + this.defaultSize.height / 2) + " " +
                    " L " + (pos.x + this.defaultSize.width / 2) + " " + (pos.y + this.defaultSize.height / 2)
                );
            } else {
                line = group.path(
                    "M " + (pos.x - this.defaultSize.width / 2) + " " + pos.y +
                    " L " + (pos.x + this.defaultSize.width / 2) + " " + pos.y
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
            this.create({ x: data.centerX, y: data.centerY }, data.value);
            return this;
        },
    });

    var RectView = View.extend({
        tagName: "g",
        className: "svg-rect",
        defaultStyle: {
            fill: "#fff",
            strokeColor: "#333",
        },
        defaultSize: {
            width: 100,
            height: 60,
            radius: 4
        },
        init: function() {
            this.svg = new SVG.G().addClass(this.className);
            this.setElement(this.svg.node);
            this.on({

            }, this);
        },

        events: {},

        create: function(pos, type) {
            var group = this.svg,
                rect = null;
            rect = group.rect(this.defaultSize.width, this.defaultSize.height);
            rect.attr({
                x: pos.x - this.defaultSize.width / 2,
                y: pos.y - this.defaultSize.height / 2,
                fill: this.defaultStyle.fill,
                stroke: this.defaultStyle.strokeColor
            });
            if (type == "round-rect") {
                rect.radius(this.defaultSize.radius);
            }
        },
        render: function() {
            var data = this.model.toJSON();
            this.svg.clear();
            this.create({ x: data.centerX, y: data.centerY }, data.value);
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
            this.setElement(this.svg.node);

            this.on({}, this);

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
            var group = this.svg,
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
            img = group.image(this.getImgUrl(type), this.defaultSize.width, this.defaultSize.height);
            img.attr({
                x: pos.x - this.defaultSize.width / 2,
                y: pos.y - this.defaultSize.height / 2
            });
        },
        render: function() {
            var data = this.model.toJSON();
            this.svg.clear();
            this.create({ x: data.centerX, y: data.centerY }, data.value, data.deviceName);
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