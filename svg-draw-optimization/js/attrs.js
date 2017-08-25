define(["jquery", "underscore", "backbone", "svg", "templates/attr-tpl"], function($, _, Backbone, SVG, tpl) {
    var attrModel = Backbone.View.extend({
        defaults: {
            undo: {
                className: "undo",
                value: "",
                available: false,
                text: "撤销",
            },
            redo: {
                value: "",
                className: "redo",
                available: false,
                text: "恢复",
            },
            formatBrush: {
                className: "format-brush",
                value: "",
                available: false,
                text: "格式刷",
            },
            scale: {
                className: "scale",
                value: "",
                available: false,
                list: [
                    200, 150, 125, 110, 100, 90, 75, 50, 25
                ],
                text: "缩放",
            },
            font: {
                className: "font-family",
                value: "",
                list: [
                    "Helvetica Neue",
                    "Helvetica",
                    "Arial",
                    "PingFang SC",
                    "Hiragino Sans GB",
                    "WenQuanYi Micro Hei",
                    "Microsoft Yahei",
                    "sans-serif"
                ],
                available: false,
                text: "字体",
            },
            fontSize: {
                className: "font-size",
                value: "",
                available: false,
                text: "字体大小",
            },
            textColor: {
                className: "color",
                value: "",
                available: false,
                text: "字体颜色",
            },
            textBold: {
                className: "bold",
                value: "",
                available: false,
                text: "加粗",
            },
            textItalic: {
                className: "italic",
                value: "",
                available: false,
                text: "斜体",
            },
            arrange: {
                value: "",
                list: [
                    "arrange-left",
                    "arrange-center",
                    "arrange-right",
                    "arrange-top",
                    "arrange-bottom",
                    "arrange-middle",
                    "arrange-middle",
                    "arrange-middle",
                ],
                available: false,
                text: "对齐",
            },
            fillColor: {
                className: "fill-color",
                value: "",
                available: false,
                text: "填充色",
            },
            borderColor: {
                className: "stroke-color",
                value: "",
                available: false,
                text: "边框色",
            },
            borderStyle: {
                className: "border-style",
                value: "",
                list: [
                    "solid", "dashed", "dot"
                ],
                available: false,
                text: "边框类型",
            },
            borderWidth: {
                className: "border-width",
                value: "",
                list: [
                    1, 2, 3, 4, 5, 6, 8, 10
                ],
                available: false,
                text: "边框宽度",
            },
            startArrow: {
                className: "line-start",
                value: "",
                list: [
                    "line-no-arrow", "line-with-arrow"
                ],
                available: false,
                text: "起点类型",
            },
            endArrow: {
                className: "line-end",
                value: "",
                list: [
                    "line-no-arrow", "line-with-arrow"
                ],
                available: false,
                text: "终点类型",
            },
            moveUp: {
                className: "move-up",
                value: "",
                available: false,
                text: "上移一层",
            },
            moveDown: {
                className: "move-down",
                value: "",
                available: false,
                text: "下移一层",
            },
            copy: {
                className: "copy",
                value: "",
                available: false,
                text: "复制",
            },
            cut: {
                className: "cut",
                value: "",
                available: false,
                text: "剪切",
            },
            paste: {
                className: "paste",
                value: "",
                available: false,
                text: "粘贴",
            },
            delete: {
                className: "delete",
                value: "",
                available: false,
                text: "删除",
            },
            pos: {
                className: "offset",
                x: "",
                y: "",
                available: false,
            },
            size: {
                className: "size",
                h: "",
                w: "",
                available: false
            },
        }
    });
    var attrView = Backbone.View.extend({
        svgElemDisabledAtts: {
            line: ["font", "fontSize", "textColor", "textBold", "textItalic", "arrange", "fillColor", "size"],
            rect: ["startArrow", "endArrow"],
            device: ["fillColor", "borderColor", "borderStyle", "borderWidth", "startArrow", "endArrow"]
        },
        categories: [{
                name: "recovery",
                attrs: ["undo", "redo", "formatBrush", "scale"]
            },
            {
                name: "font",
                attrs: ["font", "fontSize", "textColor", "textBold", "textItalic", "arrange"]
            },
            {
                name: "format",
                attrs: ["fillColor", "borderColor", "borderWidth", "borderStyle", "startArrow", "endArrow"]
            },
            {
                name: "cascade",
                attrs: ["moveUp", "moveDown"]
            },
            {
                name: "copy-paste",
                attrs: ["copy", "paste", "cut", "delete"]
            },
            {
                name: "pos",
                attrs: ["offset", "size"]
            }
        ],
        tagName: "div",
        className: "top-attrs",
        initialize: function() {
            var self = this;
            this.on({}, this);
        },
        template: _.template(tpl),
        getAttrClassName: function(attr, attrData) {
            var className = [];
            if (typeof attrData == "undefined") {
                var modelData = this.model.toJSON();
                attrData = modelData[attr];
            }
            if (attrData) {
                className.push(attrData.available ? "enable" : "disabled");
                if (attrData.list) {
                    className.push("with-arrow");
                }
                if ((["textColor", "fillColor", "borderColor"]).indexOf(attr) != -1) {
                    className.push("has-value");
                }
                if (attr == "fontSize") {
                    className.push("no-padding");
                }
                className.push(attrData.className);
            }
            return className.join(" ");
        },
        formatData: function() {
            var self = this,
                modelData = this.model.toJSON(),
                data = [];
            this.categories.forEach(function(item) {
                var category = {
                    name: item.name,
                    attrs: []
                };
                item.attrs.forEach(function(attr) {
                    var attrData = modelData[attr],
                        data = null;
                    if (attrData) {
                        data = {
                            text: attrData.text,
                            name: attr,
                            value: attrData.value,
                            className: self.getAttrClassName(attr, attrData)
                        };
                        category.attrs.push(data);
                    }
                });
                if (category.attrs.length) {
                    data.push(category);
                }
            });
            return data;
        },
        render: function() {
            this.$el.html(this.template(this.formatData()));
            return this;
        },
        events: {
            "mousedown li": "selectTool",
        },

        // events
    });

    return {
        attrView: attrView,
        attrModel: attrModel
    }
});