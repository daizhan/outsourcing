define(["jquery", "underscore", "backbone", "svg"], function($, _, Backbone, SVG) {
    var Model = Backbone.Model.extend({
        defaults: function() {
            return {
                id: 0,
                // 左上角
                x: 0,
                y: 0,
                // 中心点
                centerX: 0,
                centerY: 0,
                // 类型(tool 和 device)和值
                type: "",
                value: "",
                width: 0,
                height: 0,
                zIndex: 0,

                deviceId: "",

                text: "",
                font: "",
                fontSize: 0,
                fontStyle: "",

                borderWidth: 0,
                borderStyle: "",
                strokeColor: "",
                fullColor: "",

                rotate: 0,

                parentId: "",
                children: []
            }
        },

        sync: function(mothod, model, options) {
            model.set("id", model.cid);
            options.success({});
        },

    });

    var LineModel = Model.extend({
        defaults: function() {
            var defaults_parent = _.result(Model.prototype, 'defaults'),
                defaults_self = {};
            return _.defaults(defaults_self, defaults_parent);
        },
    });

    var RectModel = Model.extend({});

    var DeviceModel = Model.extend({});

    return {
        base: Model,
        line: LineModel,
        rect: RectModel,
        device: DeviceModel
    }
});