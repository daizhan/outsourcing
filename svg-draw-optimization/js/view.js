define(["jquery", "underscore", "backbone", "svg"], function($, _, Backbone, SVG) {
    var View = Backbone.View.extend({
        initialize: function(data) {
            this.baseSvg = data.svg;
            this.svg = null;

            this.listenTo(this.model, "change", this.render);
            this.listenTo(this.model, "destroy", this.remove);
            this.init(data);
        },
        init: function() {},
        create: function(pos, type, parent) {},
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
            this.on({

            }, this);
        },

        events: {
            "dblclick": "showDeviceIdList",
        },
        showDeviceIdList: function(event) {

        },

        getImgUrl: function(type) {
            return "/imgs/" + type + ".svg";
        },
        create: function(pos, type, deviceId) {
            var group = this.svg,
                img = null,
                text = null,
                box = null;
            deviceId = deviceId || "设置设备id";
            text = group.text("" + deviceId)
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
            this.create({ x: data.centerX, y: data.centerY }, data.value, data.deviceId);
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