define(["jquery", "utils"], function($, Utils) {
    var ColorPicker = {
        formatColor: function(color) {
            if (color <= 0) {
                color = 0;
            } else if (color >= 255) {
                color = 255;
            }
            color = color.toString(16);
            if (color.length <= 1) {
                color = "0" + color;
            }
            return color;
        },
        initColor: function() {
            var self = this,
                startColor = parseInt("ff", 16),
                endColor = parseInt("00", 16),
                count = 12,
                colors = {
                    whiteBack: [],
                    all: []
                },
                offset = 0,
                color = "";
            offset = Math.floor(startColor / (count - 1));
            for (var i = 0; i < count; i++) {
                if (i == count - 1) {
                    color = this.formatColor(endColor);
                } else {
                    color = this.formatColor(startColor - i * offset);
                }
                colors.whiteBack.push(color + color + color);
            }
            count = 9;
            colorList = ["ff,00,00", "ff,88,00", "ff,ff,00", "88,ff,00", "00,ff,00", "00,ff,88", "00,ff,ff", "00,88,ff", "00,00,ff", "88,00,ff", "ff,00,ff", "ff,00,88"];
            offset = parseInt("33", 16);
            for (var i = 1; i <= count; i++) {
                colorList.forEach(function(value) {
                    value = value.split(",");
                    color = "";
                    offset = parseInt("33", 16) * (Math.ceil(count / 2) - i);
                    value.forEach(function(item) {
                        var num = parseInt(item, 16);
                        if (num == 255 || num == 0) {
                            color += self.formatColor(num + offset);
                        } else {
                            color += self.formatColor(num + parseInt(offset / 2));
                        }
                    });
                    colors.all.push(color);
                });
            }
            return colors;
        },
        createDom: function(colors) {
            var whiteBackHtml = "",
                allHtml = "",
                html = "";
            for (var i = 0, len = colors.whiteBack.length; i < len; i++) {
                whiteBackHtml += "<li class='color-" + colors.whiteBack[i] + "' style='background: #" + colors.whiteBack[i] + ";' data-color='" + colors.whiteBack[i] + "'></li>";
            }
            for (var i = 0, len = colors.all.length; i < len; i++) {
                allHtml += "<li class='color-" + colors.all[i] + "' style='background: #" + colors.all[i] + ";' data-color='" + colors.all[i] + "'></li>";
            }
            html = '<div class="common-popup-block color-picker">\
                            <ul>' + whiteBackHtml + '</ul>\
                            <ul class="recommend-color">' + allHtml + '</ul>\
                            <div class="color-info">\
                                <label for="color">#</label>\
                                <input id="color" type="text" value="" maxlength="6" />\
                                <span class="selected-color"></span>\
                            </div>\
                        </div>';
            $("body").append(html);
        },
        markSelecteColor: function(color) {
            var $popup = $(".color-picker");
            $popup.find(".color-" + color).addClass("selected");
            $popup.find("#color").val(color);
            $popup.find(".selected-color").css("background", "#" + color);
        },
        setPopupPos: function($target) {
            var offset = $target.offset(),
                height = $target.height(),
                $popup = $(".color-picker"),
                gap = 5;
            $popup.css({
                left: offset.left + "px",
                top: offset.top + height + gap + "px"
            });
        },
        clean: function() {
            var $popup = $(".color-picker");
            $popup.remove();
            this.color = "";
            this.triggerType = "";
            $(document).off("click", this.bindBodyClickEvent);
        },
        setEvent: function(callback) {
            var self = this;
            var $popup = $(".color-picker");
            $popup.find("li").hover(
                function() {
                    var $target = $(this),
                        color = $target.attr("data-color");
                    $popup.find("#color").val(color);
                    $popup.find(".selected-color").css("background", "#" + color);
                },
                function() {
                    $popup.find("#color").val(self.color);
                    $popup.find(".selected-color").css("background", "#" + self.color);
                }
            );
            $popup.find("#color").on("input", function() {
                var $target = $(this);
                $popup.find(".selected-color").css("background", "#" + $target.val());
            });
            $popup.find(".selected-color, li").on("click", function() {
                var color = $popup.find("#color").val();
                callback(color);
                self.clean();
            });
            $(document).on("click", self.bindBodyClickEvent);
        },
        bindBodyClickEvent: function(event) {
            var $target = $(event.target);
            if (ColorPicker.triggerType != "triggerByTarget" && !$target.hasClass("color-picker") && !$target.parents(".color-picker").length) {
                ColorPicker.clean();
            }
            ColorPicker.triggerType = "";
        },
        init: function($target, color, callback, triggerType) {
            this.clean();
            this.color = color;
            this.triggerType = triggerType;
            var colors = this.initColor();
            this.createDom(colors);
            this.setPopupPos($target);
            this.markSelecteColor(color);
            this.setEvent(callback);
        }
    }
    return ColorPicker;
});