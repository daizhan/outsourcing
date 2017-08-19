define(function() {
    var html = '<% if (tools.length) { %>\
                    <ul>\
                        <% _.each(tools, function(item){ %>\
                            <li class="<%- item.type %>" draggable="false" data-type="<%- item.type %>">\
                                <p title="<%- item.name %>"></p>\
                            </li>\
                        <% }); %>\
                    </ul>\
                <% } %>';
    return html;
});