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
        count: (function() {
            var count = 0;
            return function(num) {
                if (typeof num != "undefined") {
                    num = num || 0;
                } else {
                    num = 1;
                }
                count += num;
                return count;
            };
        })(),
    }
});