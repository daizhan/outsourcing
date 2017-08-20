define(["jquery", "underscore", "backbone", "svg", "model"], function($, _, Backbone, SVG, Model) {
    var Collection = Backbone.Collection.extend({});

    var LineCollection = Collection.extend({
        model: Model.line
    });

    var RectCollection = Collection.extend({
        model: Model.rect
    });

    var DeviceCollection = Collection.extend({
        model: Model.device
    });

    return {
        base: Collection,
        line: LineCollection,
        rect: RectCollection,
        device: DeviceCollection
    }
});