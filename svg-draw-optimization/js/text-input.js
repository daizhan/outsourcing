define(["jquery", "utils"], function($, Utils) {
    var TextInput = {
        name: "text-input-popup",
        selector: ".text-input-popup",
        createDom: function(data) {
            var html = '<div class="text-input-popup">\
                            <p class="text-area" contenteditable="true">' + (data.text || "") + '</p>\
                        </div>';
            $("body").append(html);
            var $p = $(this.selector).find("p"),
                range = document.createRange(),
                sel = window.getSelection();
            range.selectNodeContents($p[0]);
            sel.removeAllRanges();
            sel.addRange(range);
        },
        setPopupPos: function(pos) {
            var $popup = $(this.selector);
            $popup.css({
                left: pos.x + "px",
                top: pos.y + "px"
            });
            $popup.find("p").css({
                "min-height": pos.height,
                "min-width": pos.width
            });
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

            function submitText(event) {
                if (event.type == "keydown" && event.keyCode != 13) {
                    return;
                }
                var $target = $(event.target),
                    text = $target.text();
                callback({ text: text });
                self.clean();
            }
            $popup.find("p").keydown(submitText);
            $popup.find("p").blur(submitText);
            $(document).on("click", self.bindBodyClickEvent);
        },
        bindBodyClickEvent: function(event) {
            var $target = $(event.target);
            if (TextInput.triggerType != "triggerByTarget" && !$target.hasClass(TextInput.name) && !$target.parents(TextInput.name).length) {
                TextInput.clean();
            }
            TextInput.triggerType = "";
        },
        init: function(pos, data, callback, triggerType) {
            this.clean();
            this.triggerType = triggerType;
            this.createDom(data);
            this.setPopupPos(pos);
            this.setEvent(callback);
        }
    };
    return TextInput;
});