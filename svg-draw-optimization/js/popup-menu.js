define(["jquery", "utils"], function($, Utils) {
    var Menu = {
        name: "menu-popup",
        selector: ".menu-popup",
        createDom: function(data) {
            var liHtml = "",
                html = "",
                className = data.type || "",
                item;
            for (var i = 0, len = data.menus.length; i < len; i++) {
                item = data.menus[i];
                if (item.type == "separator") {
                    liHtml += '<li class="separator"></li>';
                } else {
                    liHtml += '<li class="' + item.operate + ' ' + item.status + '" data-operate="' + item.operate + '" data-value="' + item.value + '"><i></i><span>' + item.text + '</span><span class="shortcut">' + item.shortcut + '</span></li>';
                }
            }
            html = '<div class="common-popup-block menu-popup ' + className + '">\
                        <ul>' + liHtml + '</ul>\
                    </div>';
            $("body").append(html);
        },
        setPopupPos: function($target) {
            var $popup = $(this.selector);
            if ($target instanceof $) {
                var offset = $target.offset(),
                    height = $target.height(),
                    gap = 5;
                $popup.css({
                    left: offset.left + "px",
                    top: offset.top + height + gap + "px"
                });
            } else { // 应该传递一个事件对象
                $popup.css({
                    left: $target.clientX + "px",
                    top: $target.clientY + "px"
                });
            }
        },
        clean: function() {
            var $popup = $(this.selector);
            $popup.remove();
            this.triggerType = "";
            $(document).off("click", this.bindBodyClickEvent);
        },
        setEvent: function(callback) {
            var self = this;
            var $popup = $(this.selector);
            $popup.find("li").click(function() {
                var $target = $(this),
                    operate = $target.attr("data-operate"),
                    value = $target.attr("data-value");
                if ($target.hasClass("disabled") || $target.hasClass("separator")) {
                    return;
                }
                callback(operate, value);
                self.clean();
            });
            $(document).on("click", self.bindBodyClickEvent);
        },
        bindBodyClickEvent: function(event) {
            var $target = $(event.target);
            if (Menu.triggerType != "triggerByTarget" && !$target.hasClass(Menu.name) && !$target.parents(Menu.name).length) {
                Menu.clean();
            }
            Menu.triggerType = "";
        },
        init: function($target, data, callback, triggerType) {
            this.clean();
            this.triggerType = triggerType;
            this.createDom(data);
            this.setPopupPos($target);
            this.setEvent(callback);
        }
    };
    return Menu;
});