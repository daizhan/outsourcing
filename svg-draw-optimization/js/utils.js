define(["jquery"], function($) {
    return {
        encodeHtmlAttr: function(attr) {
            return attr.replace(/'|"/g, function(match) {
                if (match == '"') {
                    return "&quot;";
                }
                return "&#39;";
            });
        },
        encodeHtml: function(html) {
            return $("<div></div>").text(html).html();
        },
        encodeHtmlAndAttr: function(content) {
            return this.encodeHtmlAndAttr($("<div></div>").text(content).html());
        },
    }
});