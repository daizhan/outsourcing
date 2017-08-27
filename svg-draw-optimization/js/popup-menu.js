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
                    liHtml += '<li class="' + (item.operate || "") + ' ' + (item.status || "") + '" data-text="' + (item.text || "") + '" data-operate="' + (item.operate || "") + '" data-value="' + (item.value || "") + '"><i></i><span class="text">' + (item.text || "") + '</span><span class="shortcut">' + (item.shortcut || "") + '</span></li>';
                }
            }
            html = '<div class="common-popup-block menu-popup ' + className + '">\
                        <ul>' + liHtml + '</ul>\
                    </div>';
            $("body").append(html);
        },
        setPopupPos: function($target) {
            var $popup = $(this.selector),
                scrollLeft = $(window).scrollLeft(),
                scrollTop = $(window).scrollTop();
            if ($target instanceof $) {
                var offset = $target.offset(),
                    height = $target.height(),
                    gap = 5;
                $popup.css({
                    left: offset.left + "px",
                    top: offset.top + height + gap + "px"
                });
            } else if ($target.type == "contextmenu") {
                $popup.css({
                    left: $target.clientX + scrollLeft + "px",
                    top: $target.clientY + scrollTop + "px"
                });
            } else {
                $popup.css({
                    left: $target.x + scrollLeft + "px",
                    top: $target.y + scrollTop + "px"
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
                    text = $target.attr("data-text"),
                    value = $target.attr("data-value");
                if ($target.hasClass("disabled") || $target.hasClass("separator")) {
                    return;
                }
                callback({ operate: operate, value: value, text: text });
                self.clean();
            });
            $(document).on("click", self.bindBodyClickEvent);
        },
        bindBodyClickEvent: function(event) {
            var $target = $(event.target);
            if (Menu.triggerType != "triggerByTarget" && !$target.hasClass(Menu.name) && !$target.parents(Menu.selector).length) {
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