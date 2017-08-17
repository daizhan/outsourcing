(function(window) {
    if (typeof window.D == "undefined") {
        window.D = {};
    }
    var Model = Backbone.Model.extend({

    });
    window.D.Model = Model;

    var LineModel = Model.extend({

    });
    window.D.LineModel = LineModel;

    var RectModel = Model.extend({

    });
    window.D.RectModel = RectModel;

    var DeviceModel = Model.extend({

    });
    window.D.DeviceModel = DeviceModel;
})(window);