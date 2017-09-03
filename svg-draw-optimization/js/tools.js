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
                "selectDone": this.clearItemSelected,
                "setSelected": this.selectTool
            }, this);
        },
        template: _.template(tpl),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        // events
        selectTool: function(options) {
            var $target = $(options.event.target),
                type = "";
            if ($target.parents("li").length) {
                $target = $target.parents("li");
            } else if ($target[0].tagName == "li"){
                // just the tool
            } else { // not click on tool
                return ;
            }
            type = $target.attr("data-type");
            this.clearItemSelected();
            $target.addClass("selected");
            this.trigger("selectTool", { type: this.type, value: type });
        },
        clearItemSelected: function() {
            var $target = this.$el.find("li");
            $target.removeClass("selected");
        },
        getSelected: function() {
            return this.$el.find("li.selected");
        },
    });

    return {
        view: toolView,
        model: toolModel
    };
});