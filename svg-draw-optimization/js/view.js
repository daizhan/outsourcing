(function(window) {
    if (typeof window.D == "undefined") {
        window.D = {};
    }

    var View = Backbone.View.extend({

    });
    window.D.View = View;

    var LineView = View.extend({

    });
    window.D.LineView = LineView;

    var RectView = View.extend({

    });
    window.D.RectView = RectView;

    var DeviceView = View.extend({

    });
    window.D.DeviceView = DeviceView;
})(window);