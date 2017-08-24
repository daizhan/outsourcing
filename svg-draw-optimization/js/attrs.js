define(["jquery", "underscore", "backbone", "svg"], function($, _, Backbone, SVG) {
    var attrModel = Backbone.View.extend({
        defaults: {
            undo: {
                value: "",
                available: false,
            },
            redo: {
                value: "",
                available: false,
            },
            formatBrush: {
                value: "",
                available: false,
            },
            scale: {
                value: "",
                available: false,
            },
            font: {
                value: "",
                list: [],
                available: false,
            },
            fontSize: {
                value: "",
                available: false,
            },
            textColor: {
                value: "",
                available: false,
            },
            textBold: {
                value: "",
                available: false,
            },
            textItalic: {
                value: "",
                available: false,
            },
            arrange: {
                value: "",
                list: [],
                available: false,
            },
            fillColor: {
                value: "",
                available: false,
            },
            borderColor: {
                value: "",
                available: false,
            },
            borderStyle: {
                value: "",
                list: [],
                available: false,
            },
            borderWidth: {
                value: "",
                list: [],
                available: false,
            },
            startArrow: {
                value: "",
                list: [],
                available: false,
            },
            endArrow: {
                value: "",
                list: [],
                available: false,
            },
            moveUp: {
                value: "",
                available: false,
            },
            moveDown: {
                value: "",
                available: false,
            },
            copy: {
                value: "",
                available: false,
            },
            cut: {
                value: "",
                available: false,
            },
            paste: {
                value: "",
                available: false,
            },
            delete: {
                value: "",
                available: false,
            },
            pos: {
                x: "",
                y: "",
                available: false
            },
            size: {
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
        }
    });

    return {
        attrView: attrView,
        attrModel: attrModel
    }
});