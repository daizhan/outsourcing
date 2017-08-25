define(function() {
    var html = '<% if (attrCategories.length) { %>\
                    <ul>\
                        <% _.each(attrCategories, function(category){ %>\
                            <li class="attrs <%= category.name %>">\
                                <ul>\
                                    <% _.each(category.attrs, function(attr){ %>\
                                        <% if((["fontSize", "textColor"]).indexOf(attr.name) != -1){ %>\
                                            <li class="separator"></li>\
                                        <% } %>\
                                        <li class="<%= attr.className %>" title="<%= attr.text %>" data-attr="<%= attr.name %>">\
                                            <% if (attr.name == "scale") { %>\
                                                <p class="text-input"><i>页面比例: </i><input type="text" value="<%= attr.value %>%" maxlength="4"></p>\
                                            <% } else if (attr.name == "font") { %>\
                                                <p class="text-show"><%= attr.value %></p>\
                                            <% } else if (attr.name == "fontSize") { %>\
                                                <p class="text-input"><input type="text" value="<%= attr.value %>" maxlength="2"><i>px</i></p>\
                                                <div class="resize-font-size">\
                                                    <span class="big-font-size"></span>\
                                                    <span class="small-font-size"></span>\
                                                </div>\
                                            <% } else if (attr.name == "offset") { %>\
                                                <p>\
                                                    <span>X: <i class="left">123</i>px</span>\
                                                    <span>Y: <i class="top">456</i>px</span>\
                                                </p>\
                                            <% } else if (attr.name == "size") { %>\
                                                <p>\
                                                    <span>W: <i class="width">123</i>px</span>\
                                                    <span>H: <i class="height">456</i>px</span>\
                                                </p>\
                                            <% } else { %>\
                                                <p class="bg-icon"></p>\
                                            <% } %>\
                                        </li>\
                                    <% } %>\
                                </ul>\
                            </li>\
                        <% } %>\
                    </ul>\
                <% } %>';
    return html;
});