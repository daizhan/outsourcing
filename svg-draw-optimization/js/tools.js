define(["jquery", "underscore", "backbone", "svg", "templates/tool-tpl"], function($, _, Backbone, SVG, tpl) {
    var toolModel = Backbone.Model.extend({
        defaults: {
            tools: []
        }
    });
    var toolView = Backbone.View.extend({
        preventBodyClear: false,
        type: "tool",
        tagName: "div",
        className: "left-tools",
        initialize: function(data) {
            var self = this;
            this.model.set({ tools: data.tools });
            this.on({
                "selectDone": this.clearItemSelected
            }, this);
            $(document).on("click", function(event) {
                self.bindBodyClickEvent(event);
            });
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
            var $target = $(event.currentTarget),
                type = $target.attr("data-type");
            this.preventBodyClear = true;
            if ($target.hasClass("selected")) {
                return;
            }
            this.clearItemSelected();
            $target.addClass("selected");
            this.trigger("selectTool", { type: this.type, value: type });
        },
        cancelSelect: function(isNotify) {
            if (this.getSelected().length && (typeof isNotify == "undefined" || isNotify)) {
                this.trigger("cancelTool", { type: "", value: "" });
            }
            this.clearItemSelected();
        },
        clearItemSelected: function() {
            var $target = this.$el.find("li");
            $target.removeClass("selected");
        },
        getSelected: function() {
            return this.$el.find("li.selected");
        },
        bindBodyClickEvent: function(event) {
            if (!this.preventBodyClear) {
                this.cancelSelect()
            }
            this.preventBodyClear = false;
        },
    });

    return {
        view: toolView,
        model: toolModel
    };
});