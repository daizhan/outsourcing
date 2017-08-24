define(["jquery", "utils"], function($, Utils) {
    var TextInput = {
        padding: {
            top: 2,
            left: 4
        },
        name: "text-input-popup",
        selector: ".text-input-popup",
        createDom: function(data) {
            var html = '<div class="text-input-popup">\
                            <p class="text-input" contenteditable="true">' + Utils.encodeHtmlAndAttr(data.text || "") + '</p>\
                        </div>';
            $("body").append(html);
            var $p = $(this.selector).find(".text-input"),
                range = document.createRange(),
                sel = window.getSelection();
            range.selectNodeContents($p[0]);
            sel.removeAllRanges();
            sel.addRange(range);
        },
        setPopupPos: function(pos) {
            var $popup = $(this.selector);
            $popup.css({
                left: pos.x - 1 + "px",
                top: pos.y - 1 + "px"
            });
            $popup.find(".text-input").css({
                "padding": this.padding.top + "px " + this.padding.left + "px",
                "min-height": pos.height - this.padding.top * 2,
                "min-width": pos.width - this.padding.left * 2
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
                callback({ text: text, width: $target.width() + self.padding.left * 2, height: $target.height() + self.padding.top * 2 });
                self.clean();
            }
            $popup.find(".text-input").keydown(submitText);
            $popup.find(".text-input").blur(submitText);
            $(document).on("click", self.bindBodyClickEvent);
        },
        bindBodyClickEvent: function(event) {
            var $target = $(event.target);
            if (TextInput.triggerType != "triggerByTarget" && !$target.hasClass(TextInput.name) && !$target.parents(TextInput.selector).length) {
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