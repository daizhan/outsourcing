define(["jquery", "underscore", "backbone", "svg"], function($, _, Backbone, SVG) {
    var View = Backbone.View.extend({

    });

    var LineView = View.extend({

    });

    var RectView = View.extend({

    });

    var DeviceView = View.extend({

    });

    return {
        base: View,
        line: LineView,
        rect: RectView,
        device: DeviceView
    }
});