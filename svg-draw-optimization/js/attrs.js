define(["jquery", "underscore", "backbone", "svg", "templates/attr-tpl", "common"], function($, _, Backbone, SVG, tpl, C) {
    var attrModel = Backbone.Model.extend({
        defaults: function(){
            return {
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
                    value: 0,
                    default: 100,
                    available: true,
                    list: [
                        200, 150, 125, 110, 100, 90, 75, 50, 25
                    ],
                    text: "缩放",
                },
                font: {
                    className: "font-family",
                    value: "",
                    default: "Microsoft Yahei",
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
                    value: 0,
                    default: 14,
                    available: false,
                    text: "字体大小",
                    max: 72,
                    min: 10
                },
                textColor: {
                    className: "color",
                    value: "",
                    default: "333",
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
                        {value: "arrange-left", text: "左对齐"},
                        {value: "arrange-right", text: "右对齐"},
                        {value: "arrange-top", text: "顶对齐"},
                        {value: "arrange-bottom", text: "底对齐"},
                        {value: "arrange-center", text: "水平居中"},
                        {value: "arrange-middle", text: "垂直居中"},
                        {value: "arrange-center-middle", text: "水平垂直居中"},
                        {value: "arrange-h", text: "水平分布"},
                        {value: "arrange-v", text: "垂直分布"}
                    ],
                    className: "arrange-left",
                    default: "arrange-left",
                    available: false,
                    text: "对齐",
                },
                fillColor: {
                    className: "fill-color",
                    value: "",
                    default: "fff",
                    available: false,
                    text: "填充色",
                },
                borderColor: {
                    className: "stroke-color",
                    value: "",
                    default: "666",
                    available: false,
                    text: "边框色",
                },
                borderStyle: {
                    className: "border-style",
                    value: "",
                    default: "solid",
                    list: [
                        { value: "solid", text: ""},
                        { value: "dashed", text: ""},
                        { value: "dot", text: ""}
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
                    default: 1,
                    available: false,
                    text: "边框宽度",
                },
                startArrow: {
                    className: "line-start",
                    value: "",
                    list: [
                        { value: "line-no-arrow", text: "直线"},
                        { value: "line-with-arrow", text: "实心箭头"}
                    ],
                    default: "line-no-arrow",
                    available: false,
                    text: "起点类型",
                },
                endArrow: {
                    className: "line-end",
                    default: "line-with-arrow",
                    value: "",
                    list: [
                        { value: "line-no-arrow", text: "直线"},
                        { value: "line-with-arrow", text: "实心箭头"}
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
                viewId: 0,
            };
        },
        sync: function(mothod, model, options) {
            model.set("id", model.cid);
            options.success({});
        },
    });
    var attrView = Backbone.View.extend({
        commonAttrs: [
            "redo", "undo", "formatBrush", "scale", "moveUp", "moveDown", "copy", "cut", "paste", "delete", "pos", "size"
        ],
        selectedAttrs: [
            "formatBrush", "moveUp", "moveDown", "copy", "cut", "delete"
        ],
        svgElemDisabledAttrs: {
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
                attrs: ["pos", "size"]
            }
        ],
        tagName: "div",
        className: "top-attrs",
        initialize: function() {
            var self = this;

            this.listenTo(this.model, "sync", this.render);
            this.listenTo(Backbone, "showTypeAttr", this.showTypeAttr);
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
                    className.push("has-value with-arrow");
                }
                if (attr == "fontSize") {
                    className.push("no-padding");
                } else if (attr == "startArrow" || attr == "endArrow") {
                    className.push(attrData.value || attrData.default);
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
                            value: attrData.value || attrData.default,
                            className: self.getAttrClassName(attr, attrData)
                        };
                        category.attrs.push(data);
                    }
                });
                if (category.attrs.length) {
                    data.push(category);
                }
            });
            return {attrCategories: data};
        },
        render: function() {
            this.$el.html(this.template(this.formatData()));
            return this;
        },
        events: {
            "click .attrs li": "showAttrItems",

            "keydown .scale input": "manualSetScale",
            "focus .scale input": "manualSetScale",

            "click .font-size span": "modifyFontSize",
            "keydown .font-size input": "manualSetFontSize",
            "focus .font-size input": "manualSetFontSize",
        },

        // events
        showTypeAttr: function(options){
            if (typeof options == "undefined") {
                this.model.save(this.model.defaults());
                return;
            }
            var self = this,
                disabledAttr = this.svgElemDisabledAttrs[options.type],
                modelData = this.model.toJSON();
            if (!disabledAttr) {
                disabledAttr = [];
            }
            _.each(modelData, function(attr, key){
                if (disabledAttr.indexOf(key) != -1) {
                    attr.available = false;
                    attr.value = "";
                } else if (self.selectedAttrs.indexOf(key) != -1) {
                    attr.available = true;
                } else if (self.commonAttrs.indexOf(key) == -1) {
                    attr.available = true;
                }
            });
            this.model.save(modelData);
        },
        setAttr: function(options) {
            var attr = this.model.get(options.name),
                data = {},
                value = options.value;
            if (options.check) {
                value = this[options.check](options.value);
            }
            attr.value = value;
            data[options.name] = attr;
            this.model.save(attr);
            Backbone.trigger("set" + options.name[0].toUpperCase() + options.name.slice(1), { value: value });
        },
        getProperFontSizeValue: function(value){
            var fontSize = this.model.get("fontSize"),
                value = parseInt(value, 10);
            if (!value) {
                value = fontSize.default;
            } else if (value <fontSize.min) {
                value = fontSize.min;
            } else if (value > fontSize.max) {
                value = fontSize.max;
            }
            return value;
        },
        manualSetFontSize: function(event) {
            if (event.type == "focus" || event.type == "focusin") {
                event.target.select();
            } else if (event.keyCode == 13) {
                var value = event.target.value;
                this.setAttr({
                    name: "fontSize",
                    value: value,
                    check: "getProperFontSizeValue"
                });
                event.target.blur();
            }
        },
        modifyFontSize: function(event){
            var fontSize = this.model.get("fontSize"),
                $target = $(event.target),
                value = fontSize.value || fontSize.default;
            if ($target.hasClass("big-font-size")) {
                value += 1;
            } else {
                value -= 1;
            }
            this.setAttr({
                name: "fontSize",
                value: value,
                check: "getProperFontSizeValue"
            });
        },
        getProperScaleValue: function(value){
            var scale = this.model.get("scale"),
                value = parseInt(value);
            if (!value) {
                value = scale.default;
            }
            if (value > scale.list[0]) {
                value = scale.list[0];
            } else if (value < scale.list[scale.list.length - 1]) {
                value = scale.list[scale.list.length - 1];
            }
            return value;
        },
        manualSetScale: function(event){
            if (event.type == "focus" || event.type == "focusin") {
                event.target.select();
            } else if (event.keyCode == 13) {
                var value = event.target.value;
                this.setAttr({
                    name: "scale",
                    value: value,
                    check: "getProperScaleValue"
                });
                event.target.blur();
            }
        },
        showScaleItems: function($target){
            var self = this,
                scale = this.model.get("scale"),
                data = {
                    type: "with-selected no-icon",
                    menus: []
                };
            scale.list.forEach(function(item){
                var isSelected = false,
                    selectedValue = scale.value || scale.default;
                if (item == selectedValue) {
                    isSelected = true;
                }
                data.menus.push({
                    operate: "setScale",
                    status: isSelected ? "selected" : "",
                    value: item,
                    text: item + "%",
                    shortcut: ""
                });
            });
            C.popupMenu.init($target, data, function(data){
                self.setAttr({
                    name: "scale",
                    value: data.value,
                    check: "getProperScaleValue"
                });
            }, "triggerByTarget");
        },
        showFontItems: function($target){
            var self = this,
            font = this.model.get("font"),
            data = {
                type: "with-selected no-icon",
                menus: []
            };
            font.list.forEach(function(item){
                var isSelected = false,
                    selectedValue = font.value || font.default;
                if (item == selectedValue) {
                    isSelected = true;
                }
                data.menus.push({
                    operate: "setFont",
                    status: isSelected ? "selected" : "",
                    value: item,
                    text: item,
                    shortcut: ""
                });
            });
            C.popupMenu.init($target, data, function(data){
                self.setAttr({ name: "font", value: data.value });
            }, "triggerByTarget"); 
        },
        showColorItems: function($target, attr){
            var self = this,
                color = this.model.get(attr),
                value = color.value || color.default;
            C.colorPicker.init($target, value, function(color) {
                self.setAttr({ name: attr, value: color });
            }, "triggerByTarget");
        },
        showLineArrowItems: function($target, attrName){
            var self = this,
                attr = this.model.get(attrName),
                data = {
                    type: "with-selected " + attr.className,
                    menus: []
                };
            attr.list.forEach(function(item){
                var isSelected = false,
                    selectedValue = attr.value || attr.default;
                if (item.value == selectedValue) {
                    isSelected = true;
                }
                data.menus.push({
                    operate: item.value,
                    status: isSelected ? "selected" : "",
                    value: item.value,
                    text: item.text,
                    shortcut: ""
                });
            });
            C.popupMenu.init($target, data, function(data){
                self.setAttr({ name: attrName, value: data.value });
            }, "triggerByTarget");
        },
        showBorderWidthItems: function($target){
            var self = this,
            attr = this.model.get("borderWidth"),
            data = {
                type: "with-selected no-icon",
                menus: []
            };
            attr.list.forEach(function(item){
                var isSelected = false,
                    selectedValue = attr.value || attr.default;
                if (item == selectedValue) {
                    isSelected = true;
                }
                data.menus.push({
                    operate: "setBorderWidth",
                    status: isSelected ? "selected" : "",
                    value: item,
                    text: item + "px",
                    shortcut: ""
                });
            });
            C.popupMenu.init($target, data, function(data){
                self.setAttr({ name: "borderWidth", value: data.value });
            }, "triggerByTarget");
        },
        showBorderStyleItems: function($target){
            var self = this,
            attr = this.model.get("borderStyle"),
            data = {
                type: "with-selected no-icon set-border-style",
                menus: []
            };
            attr.list.forEach(function(item){
                var isSelected = false,
                    selectedValue = attr.value || attr.default;
                if (item.value == selectedValue) {
                    isSelected = true;
                }
                data.menus.push({
                    operate: "setBorderStyle",
                    status: isSelected ? "selected" : "",
                    value: item.value,
                    text: item.text,
                    shortcut: ""
                });
            });
            C.popupMenu.init($target, data, function(data){
                self.setAttr({ name: "borderStyle", value: data.value });
            }, "triggerByTarget");
        },
        showArrangeItems: function($target){
            var self = this,
            attr = this.model.get("arrange"),
            data = {
                type: "with-selected no-icon",
                menus: []
            };
            attr.list.forEach(function(item){
                var isSelected = false,
                    selectedValue = attr.value || attr.default;
                if (item.value == selectedValue) {
                    isSelected = true;
                }
                data.menus.push({
                    operate: "setArrange",
                    status: isSelected ? "selected" : "",
                    value: item.value,
                    text: item.text,
                    shortcut: ""
                });
            });
            C.popupMenu.init($target, data, function(data){
                self.setAttr({ name: "arrange", value: data.value });
            }, "triggerByTarget");
        },
        showAttrItems: function(event){
            var $target = $(event.currentTarget),
                attr = $target.attr("data-attr");
            if ($target.hasClass("disabled")) {
                return;
            }
            if (attr == "scale") {
                if (event.target.nodeName != "INPUT") {
                    this.showScaleItems($target);
                }
            } else if (attr == "font"){
                this.showFontItems($target);
            } else if ((["textColor", "fillColor", "borderColor"]).indexOf(attr) != -1){
                this.showColorItems($target, attr);
            } else if (attr == "startArrow" || attr == "endArrow"){
                this.showLineArrowItems($target, attr);
            } else if (attr == "borderStyle"){
                this.showBorderStyleItems($target);
            } else if (attr == "borderWidth"){
                this.showBorderWidthItems($target);
            } else if (attr == "arrange"){
                this.showArrangeItems($target);
            } else {
            }
        },
    });

    return {
        view: attrView,
        model: attrModel
    }
});