(function(win) {
    var cobj = {};

    /*! layer mobile v2.0 弹层组件移动版
     * 扩展列表
     * 1. className 选项设置在最外层元素
     * 2. 新增方法topNotify 等同于 layer.open({className: "top-notify top-xxx-notify"}), xxx 为传过过来notify 类型， 可以是info/error/success 之一
     */
    (function(cobj) {

        "use strict";

        var doc = document,
            query = 'querySelectorAll',
            claname = 'getElementsByClassName',
            S = function(s) {
                return doc[query](s);
            };

        //默认配置
        var config = {
            type: 0,
            shade: true,
            shadeClose: true,
            fixed: true,
            anim: 'scale' //默认动画类型
        };

        var ready = {
            extend: function(obj) {
                var newobj = JSON.parse(JSON.stringify(config));
                for (var i in obj) {
                    newobj[i] = obj[i];
                }
                return newobj;
            },
            timer: {},
            end: {}
        };

        //点触事件
        ready.touch = function(elem, fn) {
            elem.addEventListener('click', function(e) {
                fn.call(this, e);
            }, false);
        };

        var index = 0,
            classs = ['layui-m-layer'],
            Layer = function(options) {
                var that = this;
                that.config = ready.extend(options);
                if (that.config.className) {
                    that.config.className = [classs[0], that.config.className];
                } else {
                    that.config.className = classs;
                }
                that.view();
            };

        Layer.prototype.view = function() {
            var that = this,
                config = that.config,
                layerbox = doc.createElement('div');

            that.id = layerbox.id = classs[0] + index;
            layerbox.setAttribute('class', that.config.className.join(" ") + ' ' + classs[0] + (config.type || 0));
            layerbox.setAttribute('index', index);

            //标题区域
            var title = (function() {
                var titype = typeof config.title === 'object';
                return config.title ?
                    '<h3 style="' + (titype ? config.title[1] : '') + '">' + (titype ? config.title[0] : config.title) + '</h3>' :
                    '';
            }());

            //按钮区域
            var button = (function() {
                typeof config.btn === 'string' && (config.btn = [config.btn]);
                var btns = (config.btn || []).length,
                    btndom;
                if (btns === 0 || !config.btn) {
                    return '';
                }
                btndom = '<span yes type="1">' + config.btn[0] + '</span>'
                if (btns === 2) {
                    btndom = '<span no type="0">' + config.btn[1] + '</span>' + btndom;
                }
                return '<div class="layui-m-layerbtn">' + btndom + '</div>';
            }());

            if (!config.fixed) {
                config.top = config.hasOwnProperty('top') ? config.top : 100;
                config.style = config.style || '';
                config.style += ' top:' + (doc.body.scrollTop + config.top) + 'px';
            }

            if (config.type === 2) {
                config.content = '<i></i><i class="layui-m-layerload"></i><i></i><p>' + (config.content || '') + '</p>';
            }

            if (config.skin) config.anim = 'up';
            if (config.skin === 'msg') config.shade = false;

            layerbox.innerHTML = (config.shade ? '<div ' + (typeof config.shade === 'string' ? 'style="' + config.shade + '"' : '') + ' class="layui-m-layershade"></div>' : '') +
                '<div class="layui-m-layermain" ' + (!config.fixed ? 'style="position:static;"' : '') + '>' +
                '<div class="layui-m-layersection">' +
                '<div class="layui-m-layerchild ' + (config.skin ? 'layui-m-layer-' + config.skin + ' ' : '') + ' ' + (config.anim ? 'layui-m-anim-' + config.anim : '') + '" ' + (config.style ? 'style="' + config.style + '"' : '') + '>' +
                title +
                '<div class="layui-m-layercont">' + config.content + '</div>' +
                button +
                '</div>' +
                '</div>' +
                '</div>';

            if (!config.type || config.type === 2) {
                var dialogs = doc[claname](classs[0] + config.type),
                    dialen = dialogs.length;
                if (dialen >= 1) {
                    cobj.layer.close(dialogs[0].getAttribute('index'))
                }
            }

            document.body.appendChild(layerbox);
            var elem = that.elem = S('#' + that.id)[0];
            config.success && config.success(elem);

            that.index = index++;
            that.action(config, elem);
        };

        Layer.prototype.action = function(config, elem) {
            var that = this;

            //自动关闭
            if (config.time) {
                ready.timer[that.index] = setTimeout(function() {
                    cobj.layer.close(that.index);
                }, config.time * 1000);
            }

            //确认取消
            var btn = function() {
                var type = this.getAttribute('type');
                if (type == 0) {
                    config.no && config.no();
                    cobj.layer.close(that.index);
                } else {
                    config.yes ? config.yes(that.index) : cobj.layer.close(that.index);
                }
            };
            if (config.btn) {
                var btns = elem[claname]('layui-m-layerbtn')[0].children,
                    btnlen = btns.length;
                for (var ii = 0; ii < btnlen; ii++) {
                    ready.touch(btns[ii], btn);
                }
            }

            //点遮罩关闭
            if (config.shade && config.shadeClose) {
                var shade = elem[claname]('layui-m-layershade')[0];
                ready.touch(shade, function() {
                    cobj.layer.close(that.index, config.end);
                });
            }

            config.end && (ready.end[that.index] = config.end);
        };

        cobj.layer = {
            v: '2.0',
            index: index,

            //核心方法
            open: function(options) {
                var o = new Layer(options || {});
                return o.index;
            },

            topNotify: function(notifyType, options) {
                options.className = "top-notify top-" + notifyType + "-notify";
                this.open(options);
            },

            close: function(index) {
                var ibox = S('#' + classs[0] + index)[0];
                if (!ibox) return;
                ibox.innerHTML = '';
                doc.body.removeChild(ibox);
                clearTimeout(ready.timer[index]);
                delete ready.timer[index];
                typeof ready.end[index] === 'function' && ready.end[index]();
                delete ready.end[index];
            },

            //关闭所有layer层
            closeAll: function() {
                var boxs = doc[claname](classs[0]);
                for (var i = 0, len = boxs.length; i < len; i++) {
                    cobj.layer.close((boxs[0].getAttribute('index') | 0));
                }
            }
        };
    })(cobj);

    /**
     * color picker
     */
    (function(cobj) {
        cobj.ColorPicker = {
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
                $("body").off("click", this.bindBodyClickEvent);
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
                $("body").on("click", self.bindBodyClickEvent);
            },
            bindBodyClickEvent: function(event) {
                var $target = $(event.target);
                if (cobj.ColorPicker.triggerType != "triggerByTarget" && !$target.hasClass("color-picker") && !$target.parents(".color-picker").length) {
                    cobj.ColorPicker.clean();
                }
                cobj.ColorPicker.triggerType = "";
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
    })(cobj);

    (function(cobj) {
        cobj.Menu = {
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
                $("body").off("click", this.bindBodyClickEvent);
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
                $("body").on("click", self.bindBodyClickEvent);
            },
            bindBodyClickEvent: function(event) {
                var $target = $(event.target);
                if (cobj.Menu.triggerType != "triggerByTarget" && !$target.hasClass(cobj.Menu.name) && !$target.parents(cobj.Menu.name).length) {
                    cobj.Menu.clean();
                }
                cobj.Menu.triggerType = "";
            },
            init: function($target, data, callback, triggerType) {
                this.clean();
                this.triggerType = triggerType;
                this.createDom(data);
                this.setPopupPos($target);
                this.setEvent(callback);
            }
        };
    })(cobj);

    /**
     * utils
     */
    (function(cobj) {
        cobj.utils = {
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
    })(cobj);

    if (typeof C === "undefined") {
        win.C = cobj;
    } else {
        console.log("Name conflict! use _C instead. ");
        win._C = cobj;
    }
})(window);