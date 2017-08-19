define(function() {
    var html = '<% if (devices.length) { %>\
                    <ul>\
                        <% _.each(devices, function(item){ %>\
                            <li draggable="false" data-type="<%- item.type %>">\
                                <img draggable="false" src="<%= item.src %>">\
                                <p><%- item.name %></p>\
                            </li>\
                        <% }); %>\
                    </ul>\
                <% } %>';
    return html;
});