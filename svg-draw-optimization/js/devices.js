define(["jquery", "underscore", "backbone", "svg", "templates/device-tpl"], function($, _, Backbone, SVG, tpl) {
    var deviceModel = Backbone.Model.extend({
        defaults: {
            devices: []
        }
    });
    var deviceView = Backbone.View.extend({
        preventBodyClear: false,
        type: "device",
        tagName: "div",
        className: "bottom-icons",
        initialize: function(data) {
            var self = this;
            this.model.set({ devices: data.devices });
            this.on({
                "cancelSelect": this.cancelSelect
            }, this);
            $(document).on("click, mouseup", function(event) {
                self.bindBodyClickEvent(event);
            });
        },
        template: _.template(tpl),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        events: {
            "mousedown li": "selectDevice",
        },

        // events
        selectDevice: function(event) {
            var $target = $(event.currentTarget),
                type = $target.attr("data-type");
            if ($target.hasClass("selected")) {
                return;
            }
            this.preventBodyClear = true;
            this.cancelSelect(false)
            $target.addClass("selected");
            this.trigger("selectDevice", { type: this.type, value: type });
        },
        cancelSelect: function(isNotify) {
            var $target = this.$el.find("li");
            $target.removeClass("selected");
            if (typeof isNotify == "undefined" || isNotify) {
                this.trigger("cancelDevice", { type: "", value: "" });
            }
        },
        getSelected: function() {
            return this.$el.find("li.selected");
        },
        bindBodyClickEvent: function(event) {
            var $selected = this.getSelected();
            if (!this.preventBodyClear) {
                this.cancelSelect()
            }
            this.preventBodyClear = false;
        },
    });

    return {
        view: deviceView,
        model: deviceModel
    };
});