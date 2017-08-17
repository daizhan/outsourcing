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
(function(window) {

    if (typeof window.D == "undefined") {
        window.D = {};
    }

    var attrModel = Backbone.View.extend({

    });
    var attrView = Backbone.View.extend({

    });

    window.D.attrModel = attrModel;
    window.D.attrView = attrView;
})(window);
(function(window) {
    if (typeof window.D == "undefined") {
        window.D = {};
    }
    var Model = Backbone.Model.extend({

    });
    window.D.Model = Model;

    var LineModel = Model.extend({

    });
    window.D.LineModel = LineModel;

    var RectModel = Model.extend({

    });
    window.D.RectModel = RectModel;

    var DeviceModel = Model.extend({

    });
    window.D.DeviceModel = DeviceModel;
})(window);
(function(window) {
    if (typeof window.D == "undefined") {
        window.D = {};
    }

    var View = Backbone.View.extend({

    });
    window.D.View = View;

    var LineView = View.extend({

    });
    window.D.LineView = LineView;

    var RectView = View.extend({

    });
    window.D.RectView = RectView;

    var DeviceView = View.extend({

    });
    window.D.DeviceView = DeviceView;
})(window);
(function() {
    C.layer.topNotify("success", { content: "layer popup test", shade: false, time: 2 });
    $(".color, .full-color, .stroke-color").click(function() {
        var $target = $(this);
        C.ColorPicker.init($target, "000000", function(color) {
            C.layer.topNotify("info", { content: "颜色值: #" + color, shade: false, time: 2 });
        }, "triggerByTarget");
    });
    var data = {
        type: "with-selected",
        menus: [{
                operate: "copy",
                status: "selected",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                operate: "copy",
                status: "disabled",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                type: "separator"
            },
            {
                operate: "cut",
                status: "",
                value: "cut",
                text: "剪切",
                shortcut: "ctrl+x"
            },
            {
                operate: "page",
                status: "",
                value: "paste",
                text: "粘贴",
                shortcut: "ctrl+v"
            }
        ]
    };
    var data1 = {
        type: "",
        menus: [{
                operate: "copy",
                status: "selected",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                operate: "copy",
                status: "disabled",
                value: "",
                text: "复制",
                shortcut: "ctrl+c"
            },
            {
                type: "separator"
            },
            {
                operate: "cut",
                status: "",
                value: "cut",
                text: "剪切",
                shortcut: "ctrl+x"
            },
            {
                operate: "page",
                status: "",
                value: "paste",
                text: "粘贴",
                shortcut: "ctrl+v"
            }
        ]
    };
    $(".border-width, .border-style").click(function(event) {
        var $target = $(this);
        C.Menu.init($target, data, function(operate, value) {
            C.layer.topNotify("info", { content: "operate: " + operate + "<br />value: " + value, shade: false, time: 2 });
        }, "triggerByTarget");
    });
    $(document).contextmenu(function(event) {
        var $target = $(event.target);
        if ($target.hasClass("draw-content")) {
            C.Menu.init(event, data1, function(operate, value) {
                C.layer.topNotify("info", { content: "operate: " + operate + "<br />value: " + value, shade: false, time: 2 });
            });
            return false;
        }
    });

    var deviceHeight = $(".bottom-icons")[0].offsetHeight;
    $(".draw-content").css("margin-bottom", deviceHeight + "px");

    var AppView = D.View.extend({
        initialize: function() {
            this.svg = SVG("svg-wrapper");
            this.render();
        },
        renderGrid: function() {
            var gap = 4,
                box = this.svg.rbox();
            for (var i = 0; i < box.width; i += gap) {
                for (var j = 0; j < box.height; j += gap) {}
            }
        },
        render: function() {
            this.renderGrid();
        }
    });
    var app = null;

    window.Draw = {
        checkData: function(data) {
            return {};
        },
        init: function(data, callback) {
            var validData = this.checkData(data);
            app = new AppView(validData);
        },
        save: function(callback) {
            if (!app) {
                console.log("draw not inited");
                return;
            }
        },
        setEvent: function(eventType, targetType, callback) {
            if (!app) {
                console.log("draw not inited");
                return;
            }
        }
    }
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi5qcyIsImF0dHJzLmpzIiwibW9kZWwuanMiLCJ2aWV3LmpzIiwiZHJhdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbih3aW4pIHtcclxuICAgIHZhciBjb2JqID0ge307XHJcblxyXG4gICAgLyohIGxheWVyIG1vYmlsZSB2Mi4wIOW8ueWxgue7hOS7tuenu+WKqOeJiFxyXG4gICAgICog5omp5bGV5YiX6KGoXHJcbiAgICAgKiAxLiBjbGFzc05hbWUg6YCJ6aG56K6+572u5Zyo5pyA5aSW5bGC5YWD57SgXHJcbiAgICAgKiAyLiDmlrDlop7mlrnms5V0b3BOb3RpZnkg562J5ZCM5LqOIGxheWVyLm9wZW4oe2NsYXNzTmFtZTogXCJ0b3Atbm90aWZ5IHRvcC14eHgtbm90aWZ5XCJ9KSwgeHh4IOS4uuS8oOi/h+i/h+adpW5vdGlmeSDnsbvlnovvvIwg5Y+v5Lul5pivaW5mby9lcnJvci9zdWNjZXNzIOS5i+S4gFxyXG4gICAgICovXHJcbiAgICAoZnVuY3Rpb24oY29iaikge1xyXG5cclxuICAgICAgICBcInVzZSBzdHJpY3RcIjtcclxuXHJcbiAgICAgICAgdmFyIGRvYyA9IGRvY3VtZW50LFxyXG4gICAgICAgICAgICBxdWVyeSA9ICdxdWVyeVNlbGVjdG9yQWxsJyxcclxuICAgICAgICAgICAgY2xhbmFtZSA9ICdnZXRFbGVtZW50c0J5Q2xhc3NOYW1lJyxcclxuICAgICAgICAgICAgUyA9IGZ1bmN0aW9uKHMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBkb2NbcXVlcnldKHMpO1xyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL+m7mOiupOmFjee9rlxyXG4gICAgICAgIHZhciBjb25maWcgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IDAsXHJcbiAgICAgICAgICAgIHNoYWRlOiB0cnVlLFxyXG4gICAgICAgICAgICBzaGFkZUNsb3NlOiB0cnVlLFxyXG4gICAgICAgICAgICBmaXhlZDogdHJ1ZSxcclxuICAgICAgICAgICAgYW5pbTogJ3NjYWxlJyAvL+m7mOiupOWKqOeUu+exu+Wei1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHZhciByZWFkeSA9IHtcclxuICAgICAgICAgICAgZXh0ZW5kOiBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAgICAgICAgIHZhciBuZXdvYmogPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNvbmZpZykpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBvYmopIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXdvYmpbaV0gPSBvYmpbaV07XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3b2JqO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0aW1lcjoge30sXHJcbiAgICAgICAgICAgIGVuZDoge31cclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICAvL+eCueinpuS6i+S7tlxyXG4gICAgICAgIHJlYWR5LnRvdWNoID0gZnVuY3Rpb24oZWxlbSwgZm4pIHtcclxuICAgICAgICAgICAgZWxlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgICAgIGZuLmNhbGwodGhpcywgZSk7XHJcbiAgICAgICAgICAgIH0sIGZhbHNlKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgaW5kZXggPSAwLFxyXG4gICAgICAgICAgICBjbGFzc3MgPSBbJ2xheXVpLW0tbGF5ZXInXSxcclxuICAgICAgICAgICAgTGF5ZXIgPSBmdW5jdGlvbihvcHRpb25zKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB0aGF0LmNvbmZpZyA9IHJlYWR5LmV4dGVuZChvcHRpb25zKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGF0LmNvbmZpZy5jbGFzc05hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNvbmZpZy5jbGFzc05hbWUgPSBbY2xhc3NzWzBdLCB0aGF0LmNvbmZpZy5jbGFzc05hbWVdO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGF0LmNvbmZpZy5jbGFzc05hbWUgPSBjbGFzc3M7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB0aGF0LnZpZXcoKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgTGF5ZXIucHJvdG90eXBlLnZpZXcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgY29uZmlnID0gdGhhdC5jb25maWcsXHJcbiAgICAgICAgICAgICAgICBsYXllcmJveCA9IGRvYy5jcmVhdGVFbGVtZW50KCdkaXYnKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuaWQgPSBsYXllcmJveC5pZCA9IGNsYXNzc1swXSArIGluZGV4O1xyXG4gICAgICAgICAgICBsYXllcmJveC5zZXRBdHRyaWJ1dGUoJ2NsYXNzJywgdGhhdC5jb25maWcuY2xhc3NOYW1lLmpvaW4oXCIgXCIpICsgJyAnICsgY2xhc3NzWzBdICsgKGNvbmZpZy50eXBlIHx8IDApKTtcclxuICAgICAgICAgICAgbGF5ZXJib3guc2V0QXR0cmlidXRlKCdpbmRleCcsIGluZGV4KTtcclxuXHJcbiAgICAgICAgICAgIC8v5qCH6aKY5Yy65Z+fXHJcbiAgICAgICAgICAgIHZhciB0aXRsZSA9IChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0aXR5cGUgPSB0eXBlb2YgY29uZmlnLnRpdGxlID09PSAnb2JqZWN0JztcclxuICAgICAgICAgICAgICAgIHJldHVybiBjb25maWcudGl0bGUgP1xyXG4gICAgICAgICAgICAgICAgICAgICc8aDMgc3R5bGU9XCInICsgKHRpdHlwZSA/IGNvbmZpZy50aXRsZVsxXSA6ICcnKSArICdcIj4nICsgKHRpdHlwZSA/IGNvbmZpZy50aXRsZVswXSA6IGNvbmZpZy50aXRsZSkgKyAnPC9oMz4nIDpcclxuICAgICAgICAgICAgICAgICAgICAnJztcclxuICAgICAgICAgICAgfSgpKTtcclxuXHJcbiAgICAgICAgICAgIC8v5oyJ6ZKu5Yy65Z+fXHJcbiAgICAgICAgICAgIHZhciBidXR0b24gPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgY29uZmlnLmJ0biA9PT0gJ3N0cmluZycgJiYgKGNvbmZpZy5idG4gPSBbY29uZmlnLmJ0bl0pO1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ0bnMgPSAoY29uZmlnLmJ0biB8fCBbXSkubGVuZ3RoLFxyXG4gICAgICAgICAgICAgICAgICAgIGJ0bmRvbTtcclxuICAgICAgICAgICAgICAgIGlmIChidG5zID09PSAwIHx8ICFjb25maWcuYnRuKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICcnO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYnRuZG9tID0gJzxzcGFuIHllcyB0eXBlPVwiMVwiPicgKyBjb25maWcuYnRuWzBdICsgJzwvc3Bhbj4nXHJcbiAgICAgICAgICAgICAgICBpZiAoYnRucyA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGJ0bmRvbSA9ICc8c3BhbiBubyB0eXBlPVwiMFwiPicgKyBjb25maWcuYnRuWzFdICsgJzwvc3Bhbj4nICsgYnRuZG9tO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuICc8ZGl2IGNsYXNzPVwibGF5dWktbS1sYXllcmJ0blwiPicgKyBidG5kb20gKyAnPC9kaXY+JztcclxuICAgICAgICAgICAgfSgpKTtcclxuXHJcbiAgICAgICAgICAgIGlmICghY29uZmlnLmZpeGVkKSB7XHJcbiAgICAgICAgICAgICAgICBjb25maWcudG9wID0gY29uZmlnLmhhc093blByb3BlcnR5KCd0b3AnKSA/IGNvbmZpZy50b3AgOiAxMDA7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuc3R5bGUgPSBjb25maWcuc3R5bGUgfHwgJyc7XHJcbiAgICAgICAgICAgICAgICBjb25maWcuc3R5bGUgKz0gJyB0b3A6JyArIChkb2MuYm9keS5zY3JvbGxUb3AgKyBjb25maWcudG9wKSArICdweCc7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChjb25maWcudHlwZSA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLmNvbnRlbnQgPSAnPGk+PC9pPjxpIGNsYXNzPVwibGF5dWktbS1sYXllcmxvYWRcIj48L2k+PGk+PC9pPjxwPicgKyAoY29uZmlnLmNvbnRlbnQgfHwgJycpICsgJzwvcD4nO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29uZmlnLnNraW4pIGNvbmZpZy5hbmltID0gJ3VwJztcclxuICAgICAgICAgICAgaWYgKGNvbmZpZy5za2luID09PSAnbXNnJykgY29uZmlnLnNoYWRlID0gZmFsc2U7XHJcblxyXG4gICAgICAgICAgICBsYXllcmJveC5pbm5lckhUTUwgPSAoY29uZmlnLnNoYWRlID8gJzxkaXYgJyArICh0eXBlb2YgY29uZmlnLnNoYWRlID09PSAnc3RyaW5nJyA/ICdzdHlsZT1cIicgKyBjb25maWcuc2hhZGUgKyAnXCInIDogJycpICsgJyBjbGFzcz1cImxheXVpLW0tbGF5ZXJzaGFkZVwiPjwvZGl2PicgOiAnJykgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJsYXl1aS1tLWxheWVybWFpblwiICcgKyAoIWNvbmZpZy5maXhlZCA/ICdzdHlsZT1cInBvc2l0aW9uOnN0YXRpYztcIicgOiAnJykgKyAnPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJsYXl1aS1tLWxheWVyc2VjdGlvblwiPicgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJsYXl1aS1tLWxheWVyY2hpbGQgJyArIChjb25maWcuc2tpbiA/ICdsYXl1aS1tLWxheWVyLScgKyBjb25maWcuc2tpbiArICcgJyA6ICcnKSArICcgJyArIChjb25maWcuYW5pbSA/ICdsYXl1aS1tLWFuaW0tJyArIGNvbmZpZy5hbmltIDogJycpICsgJ1wiICcgKyAoY29uZmlnLnN0eWxlID8gJ3N0eWxlPVwiJyArIGNvbmZpZy5zdHlsZSArICdcIicgOiAnJykgKyAnPicgK1xyXG4gICAgICAgICAgICAgICAgdGl0bGUgK1xyXG4gICAgICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJsYXl1aS1tLWxheWVyY29udFwiPicgKyBjb25maWcuY29udGVudCArICc8L2Rpdj4nICtcclxuICAgICAgICAgICAgICAgIGJ1dHRvbiArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICAnPC9kaXY+JztcclxuXHJcbiAgICAgICAgICAgIGlmICghY29uZmlnLnR5cGUgfHwgY29uZmlnLnR5cGUgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkaWFsb2dzID0gZG9jW2NsYW5hbWVdKGNsYXNzc1swXSArIGNvbmZpZy50eXBlKSxcclxuICAgICAgICAgICAgICAgICAgICBkaWFsZW4gPSBkaWFsb2dzLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGlmIChkaWFsZW4gPj0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvYmoubGF5ZXIuY2xvc2UoZGlhbG9nc1swXS5nZXRBdHRyaWJ1dGUoJ2luZGV4JykpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobGF5ZXJib3gpO1xyXG4gICAgICAgICAgICB2YXIgZWxlbSA9IHRoYXQuZWxlbSA9IFMoJyMnICsgdGhhdC5pZClbMF07XHJcbiAgICAgICAgICAgIGNvbmZpZy5zdWNjZXNzICYmIGNvbmZpZy5zdWNjZXNzKGVsZW0pO1xyXG5cclxuICAgICAgICAgICAgdGhhdC5pbmRleCA9IGluZGV4Kys7XHJcbiAgICAgICAgICAgIHRoYXQuYWN0aW9uKGNvbmZpZywgZWxlbSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgTGF5ZXIucHJvdG90eXBlLmFjdGlvbiA9IGZ1bmN0aW9uKGNvbmZpZywgZWxlbSkge1xyXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XHJcblxyXG4gICAgICAgICAgICAvL+iHquWKqOWFs+mXrVxyXG4gICAgICAgICAgICBpZiAoY29uZmlnLnRpbWUpIHtcclxuICAgICAgICAgICAgICAgIHJlYWR5LnRpbWVyW3RoYXQuaW5kZXhdID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2JqLmxheWVyLmNsb3NlKHRoYXQuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfSwgY29uZmlnLnRpbWUgKiAxMDAwKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/noa7orqTlj5bmtohcclxuICAgICAgICAgICAgdmFyIGJ0biA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHR5cGUgPSB0aGlzLmdldEF0dHJpYnV0ZSgndHlwZScpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGUgPT0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZy5ubyAmJiBjb25maWcubm8oKTtcclxuICAgICAgICAgICAgICAgICAgICBjb2JqLmxheWVyLmNsb3NlKHRoYXQuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcueWVzID8gY29uZmlnLnllcyh0aGF0LmluZGV4KSA6IGNvYmoubGF5ZXIuY2xvc2UodGhhdC5pbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIGlmIChjb25maWcuYnRuKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYnRucyA9IGVsZW1bY2xhbmFtZV0oJ2xheXVpLW0tbGF5ZXJidG4nKVswXS5jaGlsZHJlbixcclxuICAgICAgICAgICAgICAgICAgICBidG5sZW4gPSBidG5zLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBidG5sZW47IGlpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICByZWFkeS50b3VjaChidG5zW2lpXSwgYnRuKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy/ngrnpga7nvanlhbPpl61cclxuICAgICAgICAgICAgaWYgKGNvbmZpZy5zaGFkZSAmJiBjb25maWcuc2hhZGVDbG9zZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNoYWRlID0gZWxlbVtjbGFuYW1lXSgnbGF5dWktbS1sYXllcnNoYWRlJylbMF07XHJcbiAgICAgICAgICAgICAgICByZWFkeS50b3VjaChzaGFkZSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29iai5sYXllci5jbG9zZSh0aGF0LmluZGV4LCBjb25maWcuZW5kKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBjb25maWcuZW5kICYmIChyZWFkeS5lbmRbdGhhdC5pbmRleF0gPSBjb25maWcuZW5kKTtcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBjb2JqLmxheWVyID0ge1xyXG4gICAgICAgICAgICB2OiAnMi4wJyxcclxuICAgICAgICAgICAgaW5kZXg6IGluZGV4LFxyXG5cclxuICAgICAgICAgICAgLy/moLjlv4Pmlrnms5VcclxuICAgICAgICAgICAgb3BlbjogZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgdmFyIG8gPSBuZXcgTGF5ZXIob3B0aW9ucyB8fCB7fSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gby5pbmRleDtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIHRvcE5vdGlmeTogZnVuY3Rpb24obm90aWZ5VHlwZSwgb3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgb3B0aW9ucy5jbGFzc05hbWUgPSBcInRvcC1ub3RpZnkgdG9wLVwiICsgbm90aWZ5VHlwZSArIFwiLW5vdGlmeVwiO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vcGVuKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICB9LFxyXG5cclxuICAgICAgICAgICAgY2xvc2U6IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaWJveCA9IFMoJyMnICsgY2xhc3NzWzBdICsgaW5kZXgpWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKCFpYm94KSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBpYm94LmlubmVySFRNTCA9ICcnO1xyXG4gICAgICAgICAgICAgICAgZG9jLmJvZHkucmVtb3ZlQ2hpbGQoaWJveCk7XHJcbiAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQocmVhZHkudGltZXJbaW5kZXhdKTtcclxuICAgICAgICAgICAgICAgIGRlbGV0ZSByZWFkeS50aW1lcltpbmRleF07XHJcbiAgICAgICAgICAgICAgICB0eXBlb2YgcmVhZHkuZW5kW2luZGV4XSA9PT0gJ2Z1bmN0aW9uJyAmJiByZWFkeS5lbmRbaW5kZXhdKCk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVhZHkuZW5kW2luZGV4XTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIC8v5YWz6Zet5omA5pyJbGF5ZXLlsYJcclxuICAgICAgICAgICAgY2xvc2VBbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJveHMgPSBkb2NbY2xhbmFtZV0oY2xhc3NzWzBdKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBib3hzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29iai5sYXllci5jbG9zZSgoYm94c1swXS5nZXRBdHRyaWJ1dGUoJ2luZGV4JykgfCAwKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfSkoY29iaik7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBjb2xvciBwaWNrZXJcclxuICAgICAqL1xyXG4gICAgKGZ1bmN0aW9uKGNvYmopIHtcclxuICAgICAgICBjb2JqLkNvbG9yUGlja2VyID0ge1xyXG4gICAgICAgICAgICBmb3JtYXRDb2xvcjogZnVuY3Rpb24oY29sb3IpIHtcclxuICAgICAgICAgICAgICAgIGlmIChjb2xvciA8PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3IgPSAwO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xvciA+PSAyNTUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2xvciA9IDI1NTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbG9yID0gY29sb3IudG9TdHJpbmcoMTYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvbG9yLmxlbmd0aCA8PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3IgPSBcIjBcIiArIGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbml0Q29sb3I6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0Q29sb3IgPSBwYXJzZUludChcImZmXCIsIDE2KSxcclxuICAgICAgICAgICAgICAgICAgICBlbmRDb2xvciA9IHBhcnNlSW50KFwiMDBcIiwgMTYpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ID0gMTIsXHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3JzID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB3aGl0ZUJhY2s6IFtdLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhbGw6IFtdXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBvZmZzZXQgPSAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IE1hdGguZmxvb3Ioc3RhcnRDb2xvciAvIChjb3VudCAtIDEpKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IGNvdW50IC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvciA9IHRoaXMuZm9ybWF0Q29sb3IoZW5kQ29sb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yID0gdGhpcy5mb3JtYXRDb2xvcihzdGFydENvbG9yIC0gaSAqIG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9ycy53aGl0ZUJhY2sucHVzaChjb2xvciArIGNvbG9yICsgY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY291bnQgPSA5O1xyXG4gICAgICAgICAgICAgICAgY29sb3JMaXN0ID0gW1wiZmYsMDAsMDBcIiwgXCJmZiw4OCwwMFwiLCBcImZmLGZmLDAwXCIsIFwiODgsZmYsMDBcIiwgXCIwMCxmZiwwMFwiLCBcIjAwLGZmLDg4XCIsIFwiMDAsZmYsZmZcIiwgXCIwMCw4OCxmZlwiLCBcIjAwLDAwLGZmXCIsIFwiODgsMDAsZmZcIiwgXCJmZiwwMCxmZlwiLCBcImZmLDAwLDg4XCJdO1xyXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gcGFyc2VJbnQoXCIzM1wiLCAxNik7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBjb3VudDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3JMaXN0LmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZS5zcGxpdChcIixcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gcGFyc2VJbnQoXCIzM1wiLCAxNikgKiAoTWF0aC5jZWlsKGNvdW50IC8gMikgLSBpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbnVtID0gcGFyc2VJbnQoaXRlbSwgMTYpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG51bSA9PSAyNTUgfHwgbnVtID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvciArPSBzZWxmLmZvcm1hdENvbG9yKG51bSArIG9mZnNldCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yICs9IHNlbGYuZm9ybWF0Q29sb3IobnVtICsgcGFyc2VJbnQob2Zmc2V0IC8gMikpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3JzLmFsbC5wdXNoKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcnM7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNyZWF0ZURvbTogZnVuY3Rpb24oY29sb3JzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgd2hpdGVCYWNrSHRtbCA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgYWxsSHRtbCA9IFwiXCIsXHJcbiAgICAgICAgICAgICAgICAgICAgaHRtbCA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY29sb3JzLndoaXRlQmFjay5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHdoaXRlQmFja0h0bWwgKz0gXCI8bGkgY2xhc3M9J2NvbG9yLVwiICsgY29sb3JzLndoaXRlQmFja1tpXSArIFwiJyBzdHlsZT0nYmFja2dyb3VuZDogI1wiICsgY29sb3JzLndoaXRlQmFja1tpXSArIFwiOycgZGF0YS1jb2xvcj0nXCIgKyBjb2xvcnMud2hpdGVCYWNrW2ldICsgXCInPjwvbGk+XCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY29sb3JzLmFsbC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGFsbEh0bWwgKz0gXCI8bGkgY2xhc3M9J2NvbG9yLVwiICsgY29sb3JzLmFsbFtpXSArIFwiJyBzdHlsZT0nYmFja2dyb3VuZDogI1wiICsgY29sb3JzLmFsbFtpXSArIFwiOycgZGF0YS1jb2xvcj0nXCIgKyBjb2xvcnMuYWxsW2ldICsgXCInPjwvbGk+XCI7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBodG1sID0gJzxkaXYgY2xhc3M9XCJjb21tb24tcG9wdXAtYmxvY2sgY29sb3ItcGlja2VyXCI+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bD4nICsgd2hpdGVCYWNrSHRtbCArICc8L3VsPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWwgY2xhc3M9XCJyZWNvbW1lbmQtY29sb3JcIj4nICsgYWxsSHRtbCArICc8L3VsPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY29sb3ItaW5mb1wiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxhYmVsIGZvcj1cImNvbG9yXCI+IzwvbGFiZWw+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW5wdXQgaWQ9XCJjb2xvclwiIHR5cGU9XCJ0ZXh0XCIgdmFsdWU9XCJcIiBtYXhsZW5ndGg9XCI2XCIgLz5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwic2VsZWN0ZWQtY29sb3JcIj48L3NwYW4+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2Pic7XHJcbiAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5hcHBlbmQoaHRtbCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG1hcmtTZWxlY3RlQ29sb3I6IGZ1bmN0aW9uKGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBvcHVwID0gJChcIi5jb2xvci1waWNrZXJcIik7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAuZmluZChcIi5jb2xvci1cIiArIGNvbG9yKS5hZGRDbGFzcyhcInNlbGVjdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIjY29sb3JcIikudmFsKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwiLnNlbGVjdGVkLWNvbG9yXCIpLmNzcyhcImJhY2tncm91bmRcIiwgXCIjXCIgKyBjb2xvcik7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldFBvcHVwUG9zOiBmdW5jdGlvbigkdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHRhcmdldC5vZmZzZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSAkdGFyZ2V0LmhlaWdodCgpLFxyXG4gICAgICAgICAgICAgICAgICAgICRwb3B1cCA9ICQoXCIuY29sb3ItcGlja2VyXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgIGdhcCA9IDU7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICBsZWZ0OiBvZmZzZXQubGVmdCArIFwicHhcIixcclxuICAgICAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3AgKyBoZWlnaHQgKyBnYXAgKyBcInB4XCJcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjbGVhbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBvcHVwID0gJChcIi5jb2xvci1waWNrZXJcIik7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlclR5cGUgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikub2ZmKFwiY2xpY2tcIiwgdGhpcy5iaW5kQm9keUNsaWNrRXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXRFdmVudDogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAgICAgICAgIHZhciAkcG9wdXAgPSAkKFwiLmNvbG9yLXBpY2tlclwiKTtcclxuICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwibGlcIikuaG92ZXIoXHJcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yID0gJHRhcmdldC5hdHRyKFwiZGF0YS1jb2xvclwiKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIjY29sb3JcIikudmFsKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIuc2VsZWN0ZWQtY29sb3JcIikuY3NzKFwiYmFja2dyb3VuZFwiLCBcIiNcIiArIGNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcG9wdXAuZmluZChcIiNjb2xvclwiKS52YWwoc2VsZi5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwiLnNlbGVjdGVkLWNvbG9yXCIpLmNzcyhcImJhY2tncm91bmRcIiwgXCIjXCIgKyBzZWxmLmNvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIjY29sb3JcIikub24oXCJpbnB1dFwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIuc2VsZWN0ZWQtY29sb3JcIikuY3NzKFwiYmFja2dyb3VuZFwiLCBcIiNcIiArICR0YXJnZXQudmFsKCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAuZmluZChcIi5zZWxlY3RlZC1jb2xvciwgbGlcIikub24oXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgY29sb3IgPSAkcG9wdXAuZmluZChcIiNjb2xvclwiKS52YWwoKTtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhjb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jbGVhbigpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5vbihcImNsaWNrXCIsIHNlbGYuYmluZEJvZHlDbGlja0V2ZW50KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYmluZEJvZHlDbGlja0V2ZW50OiBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKGV2ZW50LnRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29iai5Db2xvclBpY2tlci50cmlnZ2VyVHlwZSAhPSBcInRyaWdnZXJCeVRhcmdldFwiICYmICEkdGFyZ2V0Lmhhc0NsYXNzKFwiY29sb3ItcGlja2VyXCIpICYmICEkdGFyZ2V0LnBhcmVudHMoXCIuY29sb3ItcGlja2VyXCIpLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvYmouQ29sb3JQaWNrZXIuY2xlYW4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvYmouQ29sb3JQaWNrZXIudHJpZ2dlclR5cGUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbigkdGFyZ2V0LCBjb2xvciwgY2FsbGJhY2ssIHRyaWdnZXJUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsZWFuKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNvbG9yID0gY29sb3I7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJUeXBlID0gdHJpZ2dlclR5cGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgY29sb3JzID0gdGhpcy5pbml0Q29sb3IoKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRG9tKGNvbG9ycyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvcHVwUG9zKCR0YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5tYXJrU2VsZWN0ZUNvbG9yKGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXZlbnQoY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSkoY29iaik7XHJcblxyXG4gICAgKGZ1bmN0aW9uKGNvYmopIHtcclxuICAgICAgICBjb2JqLk1lbnUgPSB7XHJcbiAgICAgICAgICAgIG5hbWU6IFwibWVudS1wb3B1cFwiLFxyXG4gICAgICAgICAgICBzZWxlY3RvcjogXCIubWVudS1wb3B1cFwiLFxyXG4gICAgICAgICAgICBjcmVhdGVEb206IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBsaUh0bWwgPSBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IGRhdGEudHlwZSB8fCBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW07XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gZGF0YS5tZW51cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0gPSBkYXRhLm1lbnVzW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gXCJzZXBhcmF0b3JcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaUh0bWwgKz0gJzxsaSBjbGFzcz1cInNlcGFyYXRvclwiPjwvbGk+JztcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsaUh0bWwgKz0gJzxsaSBjbGFzcz1cIicgKyBpdGVtLm9wZXJhdGUgKyAnICcgKyBpdGVtLnN0YXR1cyArICdcIiBkYXRhLW9wZXJhdGU9XCInICsgaXRlbS5vcGVyYXRlICsgJ1wiIGRhdGEtdmFsdWU9XCInICsgaXRlbS52YWx1ZSArICdcIj48aT48L2k+PHNwYW4+JyArIGl0ZW0udGV4dCArICc8L3NwYW4+PHNwYW4gY2xhc3M9XCJzaG9ydGN1dFwiPicgKyBpdGVtLnNob3J0Y3V0ICsgJzwvc3Bhbj48L2xpPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiY29tbW9uLXBvcHVwLWJsb2NrIG1lbnUtcG9wdXAgJyArIGNsYXNzTmFtZSArICdcIj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsPicgKyBsaUh0bWwgKyAnPC91bD5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXRQb3B1cFBvczogZnVuY3Rpb24oJHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwb3B1cCA9ICQodGhpcy5zZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHRhcmdldCBpbnN0YW5jZW9mICQpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gJHRhcmdldC5vZmZzZXQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gJHRhcmdldC5oZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ2FwID0gNTtcclxuICAgICAgICAgICAgICAgICAgICAkcG9wdXAuY3NzKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogb2Zmc2V0LnRvcCArIGhlaWdodCArIGdhcCArIFwicHhcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8g5bqU6K+l5Lyg6YCS5LiA5Liq5LqL5Lu25a+56LGhXHJcbiAgICAgICAgICAgICAgICAgICAgJHBvcHVwLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6ICR0YXJnZXQuY2xpZW50WCArIFwicHhcIixcclxuICAgICAgICAgICAgICAgICAgICAgICAgdG9wOiAkdGFyZ2V0LmNsaWVudFkgKyBcInB4XCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2xlYW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwb3B1cCA9ICQodGhpcy5zZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJUeXBlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLm9mZihcImNsaWNrXCIsIHRoaXMuYmluZEJvZHlDbGlja0V2ZW50KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0RXZlbnQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBvcHVwID0gJCh0aGlzLnNlbGVjdG9yKTtcclxuICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwibGlcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRlID0gJHRhcmdldC5hdHRyKFwiZGF0YS1vcGVyYXRlXCIpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9ICR0YXJnZXQuYXR0cihcImRhdGEtdmFsdWVcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoXCJkaXNhYmxlZFwiKSB8fCAkdGFyZ2V0Lmhhc0NsYXNzKFwic2VwYXJhdG9yXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sob3BlcmF0ZSwgdmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2xlYW4oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikub24oXCJjbGlja1wiLCBzZWxmLmJpbmRCb2R5Q2xpY2tFdmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJpbmRCb2R5Q2xpY2tFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvYmouTWVudS50cmlnZ2VyVHlwZSAhPSBcInRyaWdnZXJCeVRhcmdldFwiICYmICEkdGFyZ2V0Lmhhc0NsYXNzKGNvYmouTWVudS5uYW1lKSAmJiAhJHRhcmdldC5wYXJlbnRzKGNvYmouTWVudS5uYW1lKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2JqLk1lbnUuY2xlYW4oKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvYmouTWVudS50cmlnZ2VyVHlwZSA9IFwiXCI7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGluaXQ6IGZ1bmN0aW9uKCR0YXJnZXQsIGRhdGEsIGNhbGxiYWNrLCB0cmlnZ2VyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyVHlwZSA9IHRyaWdnZXJUeXBlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jcmVhdGVEb20oZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBvcHVwUG9zKCR0YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFdmVudChjYWxsYmFjayk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfSkoY29iaik7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiB1dGlsc1xyXG4gICAgICovXHJcbiAgICAoZnVuY3Rpb24oY29iaikge1xyXG4gICAgICAgIGNvYmoudXRpbHMgPSB7XHJcbiAgICAgICAgICAgIGVuY29kZUh0bWxBdHRyOiBmdW5jdGlvbihhdHRyKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gYXR0ci5yZXBsYWNlKC8nfFwiL2csIGZ1bmN0aW9uKG1hdGNoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoID09ICdcIicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiJnF1b3Q7XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiYjMzk7XCI7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5jb2RlSHRtbDogZnVuY3Rpb24oaHRtbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuICQoXCI8ZGl2PjwvZGl2PlwiKS50ZXh0KGh0bWwpLmh0bWwoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW5jb2RlSHRtbEFuZEF0dHI6IGZ1bmN0aW9uKGNvbnRlbnQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVuY29kZUh0bWxBbmRBdHRyKCQoXCI8ZGl2PjwvZGl2PlwiKS50ZXh0KGNvbnRlbnQpLmh0bWwoKSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfVxyXG4gICAgfSkoY29iaik7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBDID09PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgd2luLkMgPSBjb2JqO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIk5hbWUgY29uZmxpY3QhIHVzZSBfQyBpbnN0ZWFkLiBcIik7XHJcbiAgICAgICAgd2luLl9DID0gY29iajtcclxuICAgIH1cclxufSkod2luZG93KTsiLCIoZnVuY3Rpb24od2luZG93KSB7XHJcblxyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cuRCA9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgd2luZG93LkQgPSB7fTtcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYXR0ck1vZGVsID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgdmFyIGF0dHJWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIHdpbmRvdy5ELmF0dHJNb2RlbCA9IGF0dHJNb2RlbDtcclxuICAgIHdpbmRvdy5ELmF0dHJWaWV3ID0gYXR0clZpZXc7XHJcbn0pKHdpbmRvdyk7IiwiKGZ1bmN0aW9uKHdpbmRvdykge1xyXG4gICAgaWYgKHR5cGVvZiB3aW5kb3cuRCA9PSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgd2luZG93LkQgPSB7fTtcclxuICAgIH1cclxuICAgIHZhciBNb2RlbCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XHJcblxyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuRC5Nb2RlbCA9IE1vZGVsO1xyXG5cclxuICAgIHZhciBMaW5lTW9kZWwgPSBNb2RlbC5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgd2luZG93LkQuTGluZU1vZGVsID0gTGluZU1vZGVsO1xyXG5cclxuICAgIHZhciBSZWN0TW9kZWwgPSBNb2RlbC5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgd2luZG93LkQuUmVjdE1vZGVsID0gUmVjdE1vZGVsO1xyXG5cclxuICAgIHZhciBEZXZpY2VNb2RlbCA9IE1vZGVsLmV4dGVuZCh7XHJcblxyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuRC5EZXZpY2VNb2RlbCA9IERldmljZU1vZGVsO1xyXG59KSh3aW5kb3cpOyIsIihmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93LkQgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHdpbmRvdy5EID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIFZpZXcgPSBCYWNrYm9uZS5WaWV3LmV4dGVuZCh7XHJcblxyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuRC5WaWV3ID0gVmlldztcclxuXHJcbiAgICB2YXIgTGluZVZpZXcgPSBWaWV3LmV4dGVuZCh7XHJcblxyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuRC5MaW5lVmlldyA9IExpbmVWaWV3O1xyXG5cclxuICAgIHZhciBSZWN0VmlldyA9IFZpZXcuZXh0ZW5kKHtcclxuXHJcbiAgICB9KTtcclxuICAgIHdpbmRvdy5ELlJlY3RWaWV3ID0gUmVjdFZpZXc7XHJcblxyXG4gICAgdmFyIERldmljZVZpZXcgPSBWaWV3LmV4dGVuZCh7XHJcblxyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuRC5EZXZpY2VWaWV3ID0gRGV2aWNlVmlldztcclxufSkod2luZG93KTsiLCIoZnVuY3Rpb24oKSB7XHJcbiAgICBDLmxheWVyLnRvcE5vdGlmeShcInN1Y2Nlc3NcIiwgeyBjb250ZW50OiBcImxheWVyIHBvcHVwIHRlc3RcIiwgc2hhZGU6IGZhbHNlLCB0aW1lOiAyIH0pO1xyXG4gICAgJChcIi5jb2xvciwgLmZ1bGwtY29sb3IsIC5zdHJva2UtY29sb3JcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKHRoaXMpO1xyXG4gICAgICAgIEMuQ29sb3JQaWNrZXIuaW5pdCgkdGFyZ2V0LCBcIjAwMDAwMFwiLCBmdW5jdGlvbihjb2xvcikge1xyXG4gICAgICAgICAgICBDLmxheWVyLnRvcE5vdGlmeShcImluZm9cIiwgeyBjb250ZW50OiBcIuminOiJsuWAvDogI1wiICsgY29sb3IsIHNoYWRlOiBmYWxzZSwgdGltZTogMiB9KTtcclxuICAgICAgICB9LCBcInRyaWdnZXJCeVRhcmdldFwiKTtcclxuICAgIH0pO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdHlwZTogXCJ3aXRoLXNlbGVjdGVkXCIsXHJcbiAgICAgICAgbWVudXM6IFt7XHJcbiAgICAgICAgICAgICAgICBvcGVyYXRlOiBcImNvcHlcIixcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJzZWxlY3RlZFwiLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIuWkjeWItlwiLFxyXG4gICAgICAgICAgICAgICAgc2hvcnRjdXQ6IFwiY3RybCtjXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb3BlcmF0ZTogXCJjb3B5XCIsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwiZGlzYWJsZWRcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCLlpI3liLZcIixcclxuICAgICAgICAgICAgICAgIHNob3J0Y3V0OiBcImN0cmwrY1wiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwic2VwYXJhdG9yXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb3BlcmF0ZTogXCJjdXRcIixcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcImN1dFwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCLliarliIdcIixcclxuICAgICAgICAgICAgICAgIHNob3J0Y3V0OiBcImN0cmwreFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wZXJhdGU6IFwicGFnZVwiLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwicGFzdGVcIixcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwi57KY6LS0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG9ydGN1dDogXCJjdHJsK3ZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuICAgIHZhciBkYXRhMSA9IHtcclxuICAgICAgICB0eXBlOiBcIlwiLFxyXG4gICAgICAgIG1lbnVzOiBbe1xyXG4gICAgICAgICAgICAgICAgb3BlcmF0ZTogXCJjb3B5XCIsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwic2VsZWN0ZWRcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCLlpI3liLZcIixcclxuICAgICAgICAgICAgICAgIHNob3J0Y3V0OiBcImN0cmwrY1wiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wZXJhdGU6IFwiY29weVwiLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcImRpc2FibGVkXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIixcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwi5aSN5Yi2XCIsXHJcbiAgICAgICAgICAgICAgICBzaG9ydGN1dDogXCJjdHJsK2NcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcInNlcGFyYXRvclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wZXJhdGU6IFwiY3V0XCIsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJjdXRcIixcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwi5Ymq5YiHXCIsXHJcbiAgICAgICAgICAgICAgICBzaG9ydGN1dDogXCJjdHJsK3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvcGVyYXRlOiBcInBhZ2VcIixcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcInBhc3RlXCIsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIueymOi0tFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvcnRjdXQ6IFwiY3RybCt2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH07XHJcbiAgICAkKFwiLmJvcmRlci13aWR0aCwgLmJvcmRlci1zdHlsZVwiKS5jbGljayhmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKTtcclxuICAgICAgICBDLk1lbnUuaW5pdCgkdGFyZ2V0LCBkYXRhLCBmdW5jdGlvbihvcGVyYXRlLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBDLmxheWVyLnRvcE5vdGlmeShcImluZm9cIiwgeyBjb250ZW50OiBcIm9wZXJhdGU6IFwiICsgb3BlcmF0ZSArIFwiPGJyIC8+dmFsdWU6IFwiICsgdmFsdWUsIHNoYWRlOiBmYWxzZSwgdGltZTogMiB9KTtcclxuICAgICAgICB9LCBcInRyaWdnZXJCeVRhcmdldFwiKTtcclxuICAgIH0pO1xyXG4gICAgJChkb2N1bWVudCkuY29udGV4dG1lbnUoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcclxuICAgICAgICBpZiAoJHRhcmdldC5oYXNDbGFzcyhcImRyYXctY29udGVudFwiKSkge1xyXG4gICAgICAgICAgICBDLk1lbnUuaW5pdChldmVudCwgZGF0YTEsIGZ1bmN0aW9uKG9wZXJhdGUsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBDLmxheWVyLnRvcE5vdGlmeShcImluZm9cIiwgeyBjb250ZW50OiBcIm9wZXJhdGU6IFwiICsgb3BlcmF0ZSArIFwiPGJyIC8+dmFsdWU6IFwiICsgdmFsdWUsIHNoYWRlOiBmYWxzZSwgdGltZTogMiB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZGV2aWNlSGVpZ2h0ID0gJChcIi5ib3R0b20taWNvbnNcIilbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgJChcIi5kcmF3LWNvbnRlbnRcIikuY3NzKFwibWFyZ2luLWJvdHRvbVwiLCBkZXZpY2VIZWlnaHQgKyBcInB4XCIpO1xyXG5cclxuICAgIHZhciBBcHBWaWV3ID0gRC5WaWV3LmV4dGVuZCh7XHJcbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc3ZnID0gU1ZHKFwic3ZnLXdyYXBwZXJcIik7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW5kZXJHcmlkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGdhcCA9IDQsXHJcbiAgICAgICAgICAgICAgICBib3ggPSB0aGlzLnN2Zy5yYm94KCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYm94LndpZHRoOyBpICs9IGdhcCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBib3guaGVpZ2h0OyBqICs9IGdhcCkge31cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJHcmlkKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICB2YXIgYXBwID0gbnVsbDtcclxuXHJcbiAgICB3aW5kb3cuRHJhdyA9IHtcclxuICAgICAgICBjaGVja0RhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdmFyIHZhbGlkRGF0YSA9IHRoaXMuY2hlY2tEYXRhKGRhdGEpO1xyXG4gICAgICAgICAgICBhcHAgPSBuZXcgQXBwVmlldyh2YWxpZERhdGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaWYgKCFhcHApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZHJhdyBub3QgaW5pdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRFdmVudDogZnVuY3Rpb24oZXZlbnRUeXBlLCB0YXJnZXRUeXBlLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAoIWFwcCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkcmF3IG5vdCBpbml0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pKCk7Il19
