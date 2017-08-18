define(["jquery", "underscore", "backbone", "svg"], function($, _, Backbone, SVG) {
    var Model = Backbone.Model.extend({

    });

    var LineModel = Model.extend({

    });

    var RectModel = Model.extend({

    });

    var DeviceModel = Model.extend({

    });

    return {
        base: Model,
        line: LineModel,
        rect: RectModel,
        device: DeviceModel
    }
});