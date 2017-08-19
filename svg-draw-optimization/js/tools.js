define(["jquery", "underscore", "backbone", "svg", "templates/tool-tpl"], function($, _, Backbone, SVG, tpl) {
    var toolModel = Backbone.Model.extend({
        defaults: {
            tools: []
        }
    });
    var toolView = Backbone.View.extend({
        type: "tool",
        tagName: "div",
        className: "left-tools",
        initialize: function(data) {
            this.model.set({ tools: data.tools });
            this.on({
                "cancelSelect": this.cancelSelect
            }, this);
        },
        template: _.template(tpl),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        events: {
            "mousedown li": "selectTool",
        },

        // events
        selectTool: function(event) {
            var self = this,
                $target = $(event.currentTarget),
                type = $target.attr("data-type"),
                $selectedTool = $target.siblings(".selected");
            if ($target.hasClass("selected")) {
                return;
            }
            if ($selectedTool.length) {
                $.each($selectedTool, function(index, item) {
                    self.cancelSelect(item.getAttribute("data-type"));
                });
            }
            $target.addClass("selected");
            this.trigger("selectTool", { type: this.type, value: type });
        },
        cancelSelect: function(type) {
            var $target = this.$el.find("li");
            $target.removeClass("selected");
            this.trigger("cancelTool", { type: this.type, value: type });
        }
    });

    return {
        view: toolView,
        model: toolModel
    };
});