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
        initialize: function(data) {
            this.svg = SVG("svg-wrapper").size("100%", "100%");
            this.bg = null;
            this.render();
        },
        renderGrid: function() {
            var gap = 12,
                box = this.svg.rbox(),
                start, end,
                shadowColor = "#ccc",
                deepColor = "#999",
                lineWidth = 1,
                path,
                max = Math.max(box.width, box.height);
            if (this.bg) {
                this.bg.clear();
            } else {
                this.bg = this.svg.group();
            }
            console.log(this.bg);
            for (i = 0; i <= max; i += gap) {
                if (i <= box.height) { // 横线
                    path = this.bg.path("M " + 0 + " " + i + " L " + box.width + " " + i);
                    if ((i / gap) % 4) {
                        path.stroke({ color: shadowColor });
                    } else {
                        path.stroke({ color: deepColor });
                    }
                    path.transform({ y: 0.5 });
                }
                if (i <= box.width) { // 竖线
                    path = this.bg.path("M " + i + " " + 0 + " L " + i + " " + box.height);
                    if ((i / gap) % 4) {
                        path.stroke({ color: shadowColor, width: lineWidth });
                    } else {
                        path.stroke({ color: deepColor, width: lineWidth });
                    }
                    path.transform({ x: 0.5 });
                }
            }
        },
        render: function() {
            this.renderGrid();

            // this.renderAttr();
            // this.renderTools();
            // this.renderDevices();
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

    Draw.init({
            el: ".outer-wrapper"
        },
        function() {
            C.layer.topNotify("success", { content: "draw inited", shade: false, time: 2 });
        });
})();
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvbW1vbi5qcyIsImF0dHJzLmpzIiwibW9kZWwuanMiLCJ2aWV3LmpzIiwiZHJhdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNWNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24od2luKSB7XHJcbiAgICB2YXIgY29iaiA9IHt9O1xyXG5cclxuICAgIC8qISBsYXllciBtb2JpbGUgdjIuMCDlvLnlsYLnu4Tku7bnp7vliqjniYhcclxuICAgICAqIOaJqeWxleWIl+ihqFxyXG4gICAgICogMS4gY2xhc3NOYW1lIOmAiemhueiuvue9ruWcqOacgOWkluWxguWFg+e0oFxyXG4gICAgICogMi4g5paw5aKe5pa55rOVdG9wTm90aWZ5IOetieWQjOS6jiBsYXllci5vcGVuKHtjbGFzc05hbWU6IFwidG9wLW5vdGlmeSB0b3AteHh4LW5vdGlmeVwifSksIHh4eCDkuLrkvKDov4fov4fmnaVub3RpZnkg57G75Z6L77yMIOWPr+S7peaYr2luZm8vZXJyb3Ivc3VjY2VzcyDkuYvkuIBcclxuICAgICAqL1xyXG4gICAgKGZ1bmN0aW9uKGNvYmopIHtcclxuXHJcbiAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XHJcblxyXG4gICAgICAgIHZhciBkb2MgPSBkb2N1bWVudCxcclxuICAgICAgICAgICAgcXVlcnkgPSAncXVlcnlTZWxlY3RvckFsbCcsXHJcbiAgICAgICAgICAgIGNsYW5hbWUgPSAnZ2V0RWxlbWVudHNCeUNsYXNzTmFtZScsXHJcbiAgICAgICAgICAgIFMgPSBmdW5jdGlvbihzKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9jW3F1ZXJ5XShzKTtcclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy/pu5jorqTphY3nva5cclxuICAgICAgICB2YXIgY29uZmlnID0ge1xyXG4gICAgICAgICAgICB0eXBlOiAwLFxyXG4gICAgICAgICAgICBzaGFkZTogdHJ1ZSxcclxuICAgICAgICAgICAgc2hhZGVDbG9zZTogdHJ1ZSxcclxuICAgICAgICAgICAgZml4ZWQ6IHRydWUsXHJcbiAgICAgICAgICAgIGFuaW06ICdzY2FsZScgLy/pu5jorqTliqjnlLvnsbvlnotcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICB2YXIgcmVhZHkgPSB7XHJcbiAgICAgICAgICAgIGV4dGVuZDogZnVuY3Rpb24ob2JqKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3b2JqID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjb25maWcpKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gb2JqKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3b2JqW2ldID0gb2JqW2ldO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ld29iajtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGltZXI6IHt9LFxyXG4gICAgICAgICAgICBlbmQ6IHt9XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgLy/ngrnop6bkuovku7ZcclxuICAgICAgICByZWFkeS50b3VjaCA9IGZ1bmN0aW9uKGVsZW0sIGZuKSB7XHJcbiAgICAgICAgICAgIGVsZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGUpO1xyXG4gICAgICAgICAgICB9LCBmYWxzZSk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdmFyIGluZGV4ID0gMCxcclxuICAgICAgICAgICAgY2xhc3NzID0gWydsYXl1aS1tLWxheWVyJ10sXHJcbiAgICAgICAgICAgIExheWVyID0gZnVuY3Rpb24ob3B0aW9ucykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdGhhdC5jb25maWcgPSByZWFkeS5leHRlbmQob3B0aW9ucyk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5jb25maWcuY2xhc3NOYW1lKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWcuY2xhc3NOYW1lID0gW2NsYXNzc1swXSwgdGhhdC5jb25maWcuY2xhc3NOYW1lXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jb25maWcuY2xhc3NOYW1lID0gY2xhc3NzO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgdGhhdC52aWV3KCk7XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgIExheWVyLnByb3RvdHlwZS52aWV3ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGNvbmZpZyA9IHRoYXQuY29uZmlnLFxyXG4gICAgICAgICAgICAgICAgbGF5ZXJib3ggPSBkb2MuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblxyXG4gICAgICAgICAgICB0aGF0LmlkID0gbGF5ZXJib3guaWQgPSBjbGFzc3NbMF0gKyBpbmRleDtcclxuICAgICAgICAgICAgbGF5ZXJib3guc2V0QXR0cmlidXRlKCdjbGFzcycsIHRoYXQuY29uZmlnLmNsYXNzTmFtZS5qb2luKFwiIFwiKSArICcgJyArIGNsYXNzc1swXSArIChjb25maWcudHlwZSB8fCAwKSk7XHJcbiAgICAgICAgICAgIGxheWVyYm94LnNldEF0dHJpYnV0ZSgnaW5kZXgnLCBpbmRleCk7XHJcblxyXG4gICAgICAgICAgICAvL+agh+mimOWMuuWfn1xyXG4gICAgICAgICAgICB2YXIgdGl0bGUgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGl0eXBlID0gdHlwZW9mIGNvbmZpZy50aXRsZSA9PT0gJ29iamVjdCc7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29uZmlnLnRpdGxlID9cclxuICAgICAgICAgICAgICAgICAgICAnPGgzIHN0eWxlPVwiJyArICh0aXR5cGUgPyBjb25maWcudGl0bGVbMV0gOiAnJykgKyAnXCI+JyArICh0aXR5cGUgPyBjb25maWcudGl0bGVbMF0gOiBjb25maWcudGl0bGUpICsgJzwvaDM+JyA6XHJcbiAgICAgICAgICAgICAgICAgICAgJyc7XHJcbiAgICAgICAgICAgIH0oKSk7XHJcblxyXG4gICAgICAgICAgICAvL+aMiemSruWMuuWfn1xyXG4gICAgICAgICAgICB2YXIgYnV0dG9uID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdHlwZW9mIGNvbmZpZy5idG4gPT09ICdzdHJpbmcnICYmIChjb25maWcuYnRuID0gW2NvbmZpZy5idG5dKTtcclxuICAgICAgICAgICAgICAgIHZhciBidG5zID0gKGNvbmZpZy5idG4gfHwgW10pLmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBidG5kb207XHJcbiAgICAgICAgICAgICAgICBpZiAoYnRucyA9PT0gMCB8fCAhY29uZmlnLmJ0bikge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJ0bmRvbSA9ICc8c3BhbiB5ZXMgdHlwZT1cIjFcIj4nICsgY29uZmlnLmJ0blswXSArICc8L3NwYW4+J1xyXG4gICAgICAgICAgICAgICAgaWYgKGJ0bnMgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBidG5kb20gPSAnPHNwYW4gbm8gdHlwZT1cIjBcIj4nICsgY29uZmlnLmJ0blsxXSArICc8L3NwYW4+JyArIGJ0bmRvbTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImxheXVpLW0tbGF5ZXJidG5cIj4nICsgYnRuZG9tICsgJzwvZGl2Pic7XHJcbiAgICAgICAgICAgIH0oKSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWNvbmZpZy5maXhlZCkge1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLnRvcCA9IGNvbmZpZy5oYXNPd25Qcm9wZXJ0eSgndG9wJykgPyBjb25maWcudG9wIDogMTAwO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLnN0eWxlID0gY29uZmlnLnN0eWxlIHx8ICcnO1xyXG4gICAgICAgICAgICAgICAgY29uZmlnLnN0eWxlICs9ICcgdG9wOicgKyAoZG9jLmJvZHkuc2Nyb2xsVG9wICsgY29uZmlnLnRvcCkgKyAncHgnO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoY29uZmlnLnR5cGUgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGNvbmZpZy5jb250ZW50ID0gJzxpPjwvaT48aSBjbGFzcz1cImxheXVpLW0tbGF5ZXJsb2FkXCI+PC9pPjxpPjwvaT48cD4nICsgKGNvbmZpZy5jb250ZW50IHx8ICcnKSArICc8L3A+JztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGNvbmZpZy5za2luKSBjb25maWcuYW5pbSA9ICd1cCc7XHJcbiAgICAgICAgICAgIGlmIChjb25maWcuc2tpbiA9PT0gJ21zZycpIGNvbmZpZy5zaGFkZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICAgICAgbGF5ZXJib3guaW5uZXJIVE1MID0gKGNvbmZpZy5zaGFkZSA/ICc8ZGl2ICcgKyAodHlwZW9mIGNvbmZpZy5zaGFkZSA9PT0gJ3N0cmluZycgPyAnc3R5bGU9XCInICsgY29uZmlnLnNoYWRlICsgJ1wiJyA6ICcnKSArICcgY2xhc3M9XCJsYXl1aS1tLWxheWVyc2hhZGVcIj48L2Rpdj4nIDogJycpICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibGF5dWktbS1sYXllcm1haW5cIiAnICsgKCFjb25maWcuZml4ZWQgPyAnc3R5bGU9XCJwb3NpdGlvbjpzdGF0aWM7XCInIDogJycpICsgJz4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibGF5dWktbS1sYXllcnNlY3Rpb25cIj4nICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibGF5dWktbS1sYXllcmNoaWxkICcgKyAoY29uZmlnLnNraW4gPyAnbGF5dWktbS1sYXllci0nICsgY29uZmlnLnNraW4gKyAnICcgOiAnJykgKyAnICcgKyAoY29uZmlnLmFuaW0gPyAnbGF5dWktbS1hbmltLScgKyBjb25maWcuYW5pbSA6ICcnKSArICdcIiAnICsgKGNvbmZpZy5zdHlsZSA/ICdzdHlsZT1cIicgKyBjb25maWcuc3R5bGUgKyAnXCInIDogJycpICsgJz4nICtcclxuICAgICAgICAgICAgICAgIHRpdGxlICtcclxuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwibGF5dWktbS1sYXllcmNvbnRcIj4nICsgY29uZmlnLmNvbnRlbnQgKyAnPC9kaXY+JyArXHJcbiAgICAgICAgICAgICAgICBidXR0b24gK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2PicgK1xyXG4gICAgICAgICAgICAgICAgJzwvZGl2Pic7XHJcblxyXG4gICAgICAgICAgICBpZiAoIWNvbmZpZy50eXBlIHx8IGNvbmZpZy50eXBlID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGlhbG9ncyA9IGRvY1tjbGFuYW1lXShjbGFzc3NbMF0gKyBjb25maWcudHlwZSksXHJcbiAgICAgICAgICAgICAgICAgICAgZGlhbGVuID0gZGlhbG9ncy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGlhbGVuID49IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2JqLmxheWVyLmNsb3NlKGRpYWxvZ3NbMF0uZ2V0QXR0cmlidXRlKCdpbmRleCcpKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxheWVyYm94KTtcclxuICAgICAgICAgICAgdmFyIGVsZW0gPSB0aGF0LmVsZW0gPSBTKCcjJyArIHRoYXQuaWQpWzBdO1xyXG4gICAgICAgICAgICBjb25maWcuc3VjY2VzcyAmJiBjb25maWcuc3VjY2VzcyhlbGVtKTtcclxuXHJcbiAgICAgICAgICAgIHRoYXQuaW5kZXggPSBpbmRleCsrO1xyXG4gICAgICAgICAgICB0aGF0LmFjdGlvbihjb25maWcsIGVsZW0pO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIExheWVyLnByb3RvdHlwZS5hY3Rpb24gPSBmdW5jdGlvbihjb25maWcsIGVsZW0pIHtcclxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy/oh6rliqjlhbPpl61cclxuICAgICAgICAgICAgaWYgKGNvbmZpZy50aW1lKSB7XHJcbiAgICAgICAgICAgICAgICByZWFkeS50aW1lclt0aGF0LmluZGV4XSA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29iai5sYXllci5jbG9zZSh0aGF0LmluZGV4KTtcclxuICAgICAgICAgICAgICAgIH0sIGNvbmZpZy50aW1lICogMTAwMCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8v56Gu6K6k5Y+W5raIXHJcbiAgICAgICAgICAgIHZhciBidG4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0eXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcclxuICAgICAgICAgICAgICAgIGlmICh0eXBlID09IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25maWcubm8gJiYgY29uZmlnLm5vKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29iai5sYXllci5jbG9zZSh0aGF0LmluZGV4KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnLnllcyA/IGNvbmZpZy55ZXModGhhdC5pbmRleCkgOiBjb2JqLmxheWVyLmNsb3NlKHRoYXQuaW5kZXgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBpZiAoY29uZmlnLmJ0bikge1xyXG4gICAgICAgICAgICAgICAgdmFyIGJ0bnMgPSBlbGVtW2NsYW5hbWVdKCdsYXl1aS1tLWxheWVyYnRuJylbMF0uY2hpbGRyZW4sXHJcbiAgICAgICAgICAgICAgICAgICAgYnRubGVuID0gYnRucy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgYnRubGVuOyBpaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVhZHkudG91Y2goYnRuc1tpaV0sIGJ0bik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8v54K56YGu572p5YWz6ZetXHJcbiAgICAgICAgICAgIGlmIChjb25maWcuc2hhZGUgJiYgY29uZmlnLnNoYWRlQ2xvc2UpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzaGFkZSA9IGVsZW1bY2xhbmFtZV0oJ2xheXVpLW0tbGF5ZXJzaGFkZScpWzBdO1xyXG4gICAgICAgICAgICAgICAgcmVhZHkudG91Y2goc2hhZGUsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvYmoubGF5ZXIuY2xvc2UodGhhdC5pbmRleCwgY29uZmlnLmVuZCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgY29uZmlnLmVuZCAmJiAocmVhZHkuZW5kW3RoYXQuaW5kZXhdID0gY29uZmlnLmVuZCk7XHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgY29iai5sYXllciA9IHtcclxuICAgICAgICAgICAgdjogJzIuMCcsXHJcbiAgICAgICAgICAgIGluZGV4OiBpbmRleCxcclxuXHJcbiAgICAgICAgICAgIC8v5qC45b+D5pa55rOVXHJcbiAgICAgICAgICAgIG9wZW46IGZ1bmN0aW9uKG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvID0gbmV3IExheWVyKG9wdGlvbnMgfHwge30pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG8uaW5kZXg7XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICB0b3BOb3RpZnk6IGZ1bmN0aW9uKG5vdGlmeVR5cGUsIG9wdGlvbnMpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuY2xhc3NOYW1lID0gXCJ0b3Atbm90aWZ5IHRvcC1cIiArIG5vdGlmeVR5cGUgKyBcIi1ub3RpZnlcIjtcclxuICAgICAgICAgICAgICAgIHRoaXMub3BlbihvcHRpb25zKTtcclxuICAgICAgICAgICAgfSxcclxuXHJcbiAgICAgICAgICAgIGNsb3NlOiBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGlib3ggPSBTKCcjJyArIGNsYXNzc1swXSArIGluZGV4KVswXTtcclxuICAgICAgICAgICAgICAgIGlmICghaWJveCkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgaWJveC5pbm5lckhUTUwgPSAnJztcclxuICAgICAgICAgICAgICAgIGRvYy5ib2R5LnJlbW92ZUNoaWxkKGlib3gpO1xyXG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHJlYWR5LnRpbWVyW2luZGV4XSk7XHJcbiAgICAgICAgICAgICAgICBkZWxldGUgcmVhZHkudGltZXJbaW5kZXhdO1xyXG4gICAgICAgICAgICAgICAgdHlwZW9mIHJlYWR5LmVuZFtpbmRleF0gPT09ICdmdW5jdGlvbicgJiYgcmVhZHkuZW5kW2luZGV4XSgpO1xyXG4gICAgICAgICAgICAgICAgZGVsZXRlIHJlYWR5LmVuZFtpbmRleF07XHJcbiAgICAgICAgICAgIH0sXHJcblxyXG4gICAgICAgICAgICAvL+WFs+mXreaJgOaciWxheWVy5bGCXHJcbiAgICAgICAgICAgIGNsb3NlQWxsOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBib3hzID0gZG9jW2NsYW5hbWVdKGNsYXNzc1swXSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYm94cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvYmoubGF5ZXIuY2xvc2UoKGJveHNbMF0uZ2V0QXR0cmlidXRlKCdpbmRleCcpIHwgMCkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pKGNvYmopO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogY29sb3IgcGlja2VyXHJcbiAgICAgKi9cclxuICAgIChmdW5jdGlvbihjb2JqKSB7XHJcbiAgICAgICAgY29iai5Db2xvclBpY2tlciA9IHtcclxuICAgICAgICAgICAgZm9ybWF0Q29sb3I6IGZ1bmN0aW9uKGNvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY29sb3IgPD0gMCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yID0gMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY29sb3IgPj0gMjU1KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29sb3IgPSAyNTU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb2xvciA9IGNvbG9yLnRvU3RyaW5nKDE2KTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2xvci5sZW5ndGggPD0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yID0gXCIwXCIgKyBjb2xvcjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjb2xvcjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5pdENvbG9yOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcyxcclxuICAgICAgICAgICAgICAgICAgICBzdGFydENvbG9yID0gcGFyc2VJbnQoXCJmZlwiLCAxNiksXHJcbiAgICAgICAgICAgICAgICAgICAgZW5kQ29sb3IgPSBwYXJzZUludChcIjAwXCIsIDE2KSxcclxuICAgICAgICAgICAgICAgICAgICBjb3VudCA9IDEyLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9ycyA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgd2hpdGVCYWNrOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWxsOiBbXVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0ID0gMCxcclxuICAgICAgICAgICAgICAgICAgICBjb2xvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBNYXRoLmZsb29yKHN0YXJ0Q29sb3IgLyAoY291bnQgLSAxKSk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvdW50OyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PSBjb3VudCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sb3IgPSB0aGlzLmZvcm1hdENvbG9yKGVuZENvbG9yKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvciA9IHRoaXMuZm9ybWF0Q29sb3Ioc3RhcnRDb2xvciAtIGkgKiBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb2xvcnMud2hpdGVCYWNrLnB1c2goY29sb3IgKyBjb2xvciArIGNvbG9yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvdW50ID0gOTtcclxuICAgICAgICAgICAgICAgIGNvbG9yTGlzdCA9IFtcImZmLDAwLDAwXCIsIFwiZmYsODgsMDBcIiwgXCJmZixmZiwwMFwiLCBcIjg4LGZmLDAwXCIsIFwiMDAsZmYsMDBcIiwgXCIwMCxmZiw4OFwiLCBcIjAwLGZmLGZmXCIsIFwiMDAsODgsZmZcIiwgXCIwMCwwMCxmZlwiLCBcIjg4LDAwLGZmXCIsIFwiZmYsMDAsZmZcIiwgXCJmZiwwMCw4OFwiXTtcclxuICAgICAgICAgICAgICAgIG9mZnNldCA9IHBhcnNlSW50KFwiMzNcIiwgMTYpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gY291bnQ7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yTGlzdC5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gdmFsdWUuc3BsaXQoXCIsXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9mZnNldCA9IHBhcnNlSW50KFwiMzNcIiwgMTYpICogKE1hdGguY2VpbChjb3VudCAvIDIpIC0gaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG51bSA9IHBhcnNlSW50KGl0ZW0sIDE2KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChudW0gPT0gMjU1IHx8IG51bSA9PSAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sb3IgKz0gc2VsZi5mb3JtYXRDb2xvcihudW0gKyBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvciArPSBzZWxmLmZvcm1hdENvbG9yKG51bSArIHBhcnNlSW50KG9mZnNldCAvIDIpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9ycy5hbGwucHVzaChjb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sb3JzO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjcmVhdGVEb206IGZ1bmN0aW9uKGNvbG9ycykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHdoaXRlQmFja0h0bWwgPSBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGFsbEh0bWwgPSBcIlwiLFxyXG4gICAgICAgICAgICAgICAgICAgIGh0bWwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvbG9ycy53aGl0ZUJhY2subGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICB3aGl0ZUJhY2tIdG1sICs9IFwiPGxpIGNsYXNzPSdjb2xvci1cIiArIGNvbG9ycy53aGl0ZUJhY2tbaV0gKyBcIicgc3R5bGU9J2JhY2tncm91bmQ6ICNcIiArIGNvbG9ycy53aGl0ZUJhY2tbaV0gKyBcIjsnIGRhdGEtY29sb3I9J1wiICsgY29sb3JzLndoaXRlQmFja1tpXSArIFwiJz48L2xpPlwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvbG9ycy5hbGwubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBhbGxIdG1sICs9IFwiPGxpIGNsYXNzPSdjb2xvci1cIiArIGNvbG9ycy5hbGxbaV0gKyBcIicgc3R5bGU9J2JhY2tncm91bmQ6ICNcIiArIGNvbG9ycy5hbGxbaV0gKyBcIjsnIGRhdGEtY29sb3I9J1wiICsgY29sb3JzLmFsbFtpXSArIFwiJz48L2xpPlwiO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaHRtbCA9ICc8ZGl2IGNsYXNzPVwiY29tbW9uLXBvcHVwLWJsb2NrIGNvbG9yLXBpY2tlclwiPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8dWw+JyArIHdoaXRlQmFja0h0bWwgKyAnPC91bD5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwicmVjb21tZW5kLWNvbG9yXCI+JyArIGFsbEh0bWwgKyAnPC91bD5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbG9yLWluZm9cIj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsYWJlbCBmb3I9XCJjb2xvclwiPiM8L2xhYmVsPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGlucHV0IGlkPVwiY29sb3JcIiB0eXBlPVwidGV4dFwiIHZhbHVlPVwiXCIgbWF4bGVuZ3RoPVwiNlwiIC8+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cInNlbGVjdGVkLWNvbG9yXCI+PC9zcGFuPlxcXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cXFxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj4nO1xyXG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikuYXBwZW5kKGh0bWwpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBtYXJrU2VsZWN0ZUNvbG9yOiBmdW5jdGlvbihjb2xvcikge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwb3B1cCA9ICQoXCIuY29sb3ItcGlja2VyXCIpO1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIuY29sb3ItXCIgKyBjb2xvcikuYWRkQ2xhc3MoXCJzZWxlY3RlZFwiKTtcclxuICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwiI2NvbG9yXCIpLnZhbChjb2xvcik7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAuZmluZChcIi5zZWxlY3RlZC1jb2xvclwiKS5jc3MoXCJiYWNrZ3JvdW5kXCIsIFwiI1wiICsgY29sb3IpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXRQb3B1cFBvczogZnVuY3Rpb24oJHRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICR0YXJnZXQub2Zmc2V0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gJHRhcmdldC5oZWlnaHQoKSxcclxuICAgICAgICAgICAgICAgICAgICAkcG9wdXAgPSAkKFwiLmNvbG9yLXBpY2tlclwiKSxcclxuICAgICAgICAgICAgICAgICAgICBnYXAgPSA1O1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgbGVmdDogb2Zmc2V0LmxlZnQgKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgdG9wOiBvZmZzZXQudG9wICsgaGVpZ2h0ICsgZ2FwICsgXCJweFwiXHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2xlYW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgdmFyICRwb3B1cCA9ICQoXCIuY29sb3ItcGlja2VyXCIpO1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvciA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJUeXBlID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLm9mZihcImNsaWNrXCIsIHRoaXMuYmluZEJvZHlDbGlja0V2ZW50KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0RXZlbnQ6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHBvcHVwID0gJChcIi5jb2xvci1waWNrZXJcIik7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAuZmluZChcImxpXCIpLmhvdmVyKFxyXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQodGhpcyksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xvciA9ICR0YXJnZXQuYXR0cihcImRhdGEtY29sb3JcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwiI2NvbG9yXCIpLnZhbChjb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwiLnNlbGVjdGVkLWNvbG9yXCIpLmNzcyhcImJhY2tncm91bmRcIiwgXCIjXCIgKyBjb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIjY29sb3JcIikudmFsKHNlbGYuY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkcG9wdXAuZmluZChcIi5zZWxlY3RlZC1jb2xvclwiKS5jc3MoXCJiYWNrZ3JvdW5kXCIsIFwiI1wiICsgc2VsZi5jb2xvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwiI2NvbG9yXCIpLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyICR0YXJnZXQgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgICAgICAgICAgICRwb3B1cC5maW5kKFwiLnNlbGVjdGVkLWNvbG9yXCIpLmNzcyhcImJhY2tncm91bmRcIiwgXCIjXCIgKyAkdGFyZ2V0LnZhbCgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwLmZpbmQoXCIuc2VsZWN0ZWQtY29sb3IsIGxpXCIpLm9uKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbG9yID0gJHBvcHVwLmZpbmQoXCIjY29sb3JcIikudmFsKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soY29sb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2xlYW4oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgJChcImJvZHlcIikub24oXCJjbGlja1wiLCBzZWxmLmJpbmRCb2R5Q2xpY2tFdmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGJpbmRCb2R5Q2xpY2tFdmVudDogZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJChldmVudC50YXJnZXQpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNvYmouQ29sb3JQaWNrZXIudHJpZ2dlclR5cGUgIT0gXCJ0cmlnZ2VyQnlUYXJnZXRcIiAmJiAhJHRhcmdldC5oYXNDbGFzcyhcImNvbG9yLXBpY2tlclwiKSAmJiAhJHRhcmdldC5wYXJlbnRzKFwiLmNvbG9yLXBpY2tlclwiKS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb2JqLkNvbG9yUGlja2VyLmNsZWFuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb2JqLkNvbG9yUGlja2VyLnRyaWdnZXJUeXBlID0gXCJcIjtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgaW5pdDogZnVuY3Rpb24oJHRhcmdldCwgY29sb3IsIGNhbGxiYWNrLCB0cmlnZ2VyVHlwZSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhbigpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jb2xvciA9IGNvbG9yO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyVHlwZSA9IHRyaWdnZXJUeXBlO1xyXG4gICAgICAgICAgICAgICAgdmFyIGNvbG9ycyA9IHRoaXMuaW5pdENvbG9yKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZURvbShjb2xvcnMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQb3B1cFBvcygkdGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMubWFya1NlbGVjdGVDb2xvcihjb2xvcik7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNldEV2ZW50KGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0pKGNvYmopO1xyXG5cclxuICAgIChmdW5jdGlvbihjb2JqKSB7XHJcbiAgICAgICAgY29iai5NZW51ID0ge1xyXG4gICAgICAgICAgICBuYW1lOiBcIm1lbnUtcG9wdXBcIixcclxuICAgICAgICAgICAgc2VsZWN0b3I6IFwiLm1lbnUtcG9wdXBcIixcclxuICAgICAgICAgICAgY3JlYXRlRG9tOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbGlIdG1sID0gXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBodG1sID0gXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSBkYXRhLnR5cGUgfHwgXCJcIixcclxuICAgICAgICAgICAgICAgICAgICBpdGVtO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGRhdGEubWVudXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICAgICBpdGVtID0gZGF0YS5tZW51c1tpXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09IFwic2VwYXJhdG9yXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlIdG1sICs9ICc8bGkgY2xhc3M9XCJzZXBhcmF0b3JcIj48L2xpPic7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGlIdG1sICs9ICc8bGkgY2xhc3M9XCInICsgaXRlbS5vcGVyYXRlICsgJyAnICsgaXRlbS5zdGF0dXMgKyAnXCIgZGF0YS1vcGVyYXRlPVwiJyArIGl0ZW0ub3BlcmF0ZSArICdcIiBkYXRhLXZhbHVlPVwiJyArIGl0ZW0udmFsdWUgKyAnXCI+PGk+PC9pPjxzcGFuPicgKyBpdGVtLnRleHQgKyAnPC9zcGFuPjxzcGFuIGNsYXNzPVwic2hvcnRjdXRcIj4nICsgaXRlbS5zaG9ydGN1dCArICc8L3NwYW4+PC9saT4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGh0bWwgPSAnPGRpdiBjbGFzcz1cImNvbW1vbi1wb3B1cC1ibG9jayBtZW51LXBvcHVwICcgKyBjbGFzc05hbWUgKyAnXCI+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDx1bD4nICsgbGlIdG1sICsgJzwvdWw+XFxcclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+JztcclxuICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLmFwcGVuZChodG1sKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0UG9wdXBQb3M6IGZ1bmN0aW9uKCR0YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcG9wdXAgPSAkKHRoaXMuc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCR0YXJnZXQgaW5zdGFuY2VvZiAkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldCA9ICR0YXJnZXQub2Zmc2V0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGhlaWdodCA9ICR0YXJnZXQuaGVpZ2h0KCksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGdhcCA9IDU7XHJcbiAgICAgICAgICAgICAgICAgICAgJHBvcHVwLmNzcyh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxlZnQ6IG9mZnNldC5sZWZ0ICsgXCJweFwiLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0b3A6IG9mZnNldC50b3AgKyBoZWlnaHQgKyBnYXAgKyBcInB4XCJcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIOW6lOivpeS8oOmAkuS4gOS4quS6i+S7tuWvueixoVxyXG4gICAgICAgICAgICAgICAgICAgICRwb3B1cC5jc3Moe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsZWZ0OiAkdGFyZ2V0LmNsaWVudFggKyBcInB4XCIsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvcDogJHRhcmdldC5jbGllbnRZICsgXCJweFwiXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNsZWFuOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciAkcG9wdXAgPSAkKHRoaXMuc2VsZWN0b3IpO1xyXG4gICAgICAgICAgICAgICAgJHBvcHVwLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyVHlwZSA9IFwiXCI7XHJcbiAgICAgICAgICAgICAgICAkKFwiYm9keVwiKS5vZmYoXCJjbGlja1wiLCB0aGlzLmJpbmRCb2R5Q2xpY2tFdmVudCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldEV2ZW50OiBmdW5jdGlvbihjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgICAgICAgICAgdmFyICRwb3B1cCA9ICQodGhpcy5zZWxlY3Rvcik7XHJcbiAgICAgICAgICAgICAgICAkcG9wdXAuZmluZChcImxpXCIpLmNsaWNrKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0ZSA9ICR0YXJnZXQuYXR0cihcImRhdGEtb3BlcmF0ZVwiKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSAkdGFyZ2V0LmF0dHIoXCJkYXRhLXZhbHVlXCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKFwiZGlzYWJsZWRcIikgfHwgJHRhcmdldC5oYXNDbGFzcyhcInNlcGFyYXRvclwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG9wZXJhdGUsIHZhbHVlKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmNsZWFuKCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICQoXCJib2R5XCIpLm9uKFwiY2xpY2tcIiwgc2VsZi5iaW5kQm9keUNsaWNrRXZlbnQpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiaW5kQm9keUNsaWNrRXZlbnQ6IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIGlmIChjb2JqLk1lbnUudHJpZ2dlclR5cGUgIT0gXCJ0cmlnZ2VyQnlUYXJnZXRcIiAmJiAhJHRhcmdldC5oYXNDbGFzcyhjb2JqLk1lbnUubmFtZSkgJiYgISR0YXJnZXQucGFyZW50cyhjb2JqLk1lbnUubmFtZSkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29iai5NZW51LmNsZWFuKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb2JqLk1lbnUudHJpZ2dlclR5cGUgPSBcIlwiO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbml0OiBmdW5jdGlvbigkdGFyZ2V0LCBkYXRhLCBjYWxsYmFjaywgdHJpZ2dlclR5cGUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2xlYW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlclR5cGUgPSB0cmlnZ2VyVHlwZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY3JlYXRlRG9tKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQb3B1cFBvcygkdGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RXZlbnQoY2FsbGJhY2spO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pKGNvYmopO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogdXRpbHNcclxuICAgICAqL1xyXG4gICAgKGZ1bmN0aW9uKGNvYmopIHtcclxuICAgICAgICBjb2JqLnV0aWxzID0ge1xyXG4gICAgICAgICAgICBlbmNvZGVIdG1sQXR0cjogZnVuY3Rpb24oYXR0cikge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGF0dHIucmVwbGFjZSgvJ3xcIi9nLCBmdW5jdGlvbihtYXRjaCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaCA9PSAnXCInKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIiZxdW90O1wiO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCImIzM5O1wiO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuY29kZUh0bWw6IGZ1bmN0aW9uKGh0bWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiAkKFwiPGRpdj48L2Rpdj5cIikudGV4dChodG1sKS5odG1sKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVuY29kZUh0bWxBbmRBdHRyOiBmdW5jdGlvbihjb250ZW50KSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5lbmNvZGVIdG1sQW5kQXR0cigkKFwiPGRpdj48L2Rpdj5cIikudGV4dChjb250ZW50KS5odG1sKCkpO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH1cclxuICAgIH0pKGNvYmopO1xyXG5cclxuICAgIGlmICh0eXBlb2YgQyA9PT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHdpbi5DID0gY29iajtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJOYW1lIGNvbmZsaWN0ISB1c2UgX0MgaW5zdGVhZC4gXCIpO1xyXG4gICAgICAgIHdpbi5fQyA9IGNvYmo7XHJcbiAgICB9XHJcbn0pKHdpbmRvdyk7IiwiKGZ1bmN0aW9uKHdpbmRvdykge1xyXG5cclxuICAgIGlmICh0eXBlb2Ygd2luZG93LkQgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHdpbmRvdy5EID0ge307XHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGF0dHJNb2RlbCA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHJcbiAgICB9KTtcclxuICAgIHZhciBhdHRyVmlldyA9IEJhY2tib25lLlZpZXcuZXh0ZW5kKHtcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICB3aW5kb3cuRC5hdHRyTW9kZWwgPSBhdHRyTW9kZWw7XHJcbiAgICB3aW5kb3cuRC5hdHRyVmlldyA9IGF0dHJWaWV3O1xyXG59KSh3aW5kb3cpOyIsIihmdW5jdGlvbih3aW5kb3cpIHtcclxuICAgIGlmICh0eXBlb2Ygd2luZG93LkQgPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAgIHdpbmRvdy5EID0ge307XHJcbiAgICB9XHJcbiAgICB2YXIgTW9kZWwgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgd2luZG93LkQuTW9kZWwgPSBNb2RlbDtcclxuXHJcbiAgICB2YXIgTGluZU1vZGVsID0gTW9kZWwuZXh0ZW5kKHtcclxuXHJcbiAgICB9KTtcclxuICAgIHdpbmRvdy5ELkxpbmVNb2RlbCA9IExpbmVNb2RlbDtcclxuXHJcbiAgICB2YXIgUmVjdE1vZGVsID0gTW9kZWwuZXh0ZW5kKHtcclxuXHJcbiAgICB9KTtcclxuICAgIHdpbmRvdy5ELlJlY3RNb2RlbCA9IFJlY3RNb2RlbDtcclxuXHJcbiAgICB2YXIgRGV2aWNlTW9kZWwgPSBNb2RlbC5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgd2luZG93LkQuRGV2aWNlTW9kZWwgPSBEZXZpY2VNb2RlbDtcclxufSkod2luZG93KTsiLCIoZnVuY3Rpb24od2luZG93KSB7XHJcbiAgICBpZiAodHlwZW9mIHdpbmRvdy5EID09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICB3aW5kb3cuRCA9IHt9O1xyXG4gICAgfVxyXG5cclxuICAgIHZhciBWaWV3ID0gQmFja2JvbmUuVmlldy5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgd2luZG93LkQuVmlldyA9IFZpZXc7XHJcblxyXG4gICAgdmFyIExpbmVWaWV3ID0gVmlldy5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgd2luZG93LkQuTGluZVZpZXcgPSBMaW5lVmlldztcclxuXHJcbiAgICB2YXIgUmVjdFZpZXcgPSBWaWV3LmV4dGVuZCh7XHJcblxyXG4gICAgfSk7XHJcbiAgICB3aW5kb3cuRC5SZWN0VmlldyA9IFJlY3RWaWV3O1xyXG5cclxuICAgIHZhciBEZXZpY2VWaWV3ID0gVmlldy5leHRlbmQoe1xyXG5cclxuICAgIH0pO1xyXG4gICAgd2luZG93LkQuRGV2aWNlVmlldyA9IERldmljZVZpZXc7XHJcbn0pKHdpbmRvdyk7IiwiKGZ1bmN0aW9uKCkge1xyXG4gICAgJChcIi5jb2xvciwgLmZ1bGwtY29sb3IsIC5zdHJva2UtY29sb3JcIikuY2xpY2soZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKHRoaXMpO1xyXG4gICAgICAgIEMuQ29sb3JQaWNrZXIuaW5pdCgkdGFyZ2V0LCBcIjAwMDAwMFwiLCBmdW5jdGlvbihjb2xvcikge1xyXG4gICAgICAgICAgICBDLmxheWVyLnRvcE5vdGlmeShcImluZm9cIiwgeyBjb250ZW50OiBcIuminOiJsuWAvDogI1wiICsgY29sb3IsIHNoYWRlOiBmYWxzZSwgdGltZTogMiB9KTtcclxuICAgICAgICB9LCBcInRyaWdnZXJCeVRhcmdldFwiKTtcclxuICAgIH0pO1xyXG4gICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgdHlwZTogXCJ3aXRoLXNlbGVjdGVkXCIsXHJcbiAgICAgICAgbWVudXM6IFt7XHJcbiAgICAgICAgICAgICAgICBvcGVyYXRlOiBcImNvcHlcIixcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJzZWxlY3RlZFwiLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIuWkjeWItlwiLFxyXG4gICAgICAgICAgICAgICAgc2hvcnRjdXQ6IFwiY3RybCtjXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb3BlcmF0ZTogXCJjb3B5XCIsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwiZGlzYWJsZWRcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCLlpI3liLZcIixcclxuICAgICAgICAgICAgICAgIHNob3J0Y3V0OiBcImN0cmwrY1wiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHR5cGU6IFwic2VwYXJhdG9yXCJcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgb3BlcmF0ZTogXCJjdXRcIixcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcImN1dFwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCLliarliIdcIixcclxuICAgICAgICAgICAgICAgIHNob3J0Y3V0OiBcImN0cmwreFwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wZXJhdGU6IFwicGFnZVwiLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdmFsdWU6IFwicGFzdGVcIixcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwi57KY6LS0XCIsXHJcbiAgICAgICAgICAgICAgICBzaG9ydGN1dDogXCJjdHJsK3ZcIlxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgXVxyXG4gICAgfTtcclxuICAgIHZhciBkYXRhMSA9IHtcclxuICAgICAgICB0eXBlOiBcIlwiLFxyXG4gICAgICAgIG1lbnVzOiBbe1xyXG4gICAgICAgICAgICAgICAgb3BlcmF0ZTogXCJjb3B5XCIsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwic2VsZWN0ZWRcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxyXG4gICAgICAgICAgICAgICAgdGV4dDogXCLlpI3liLZcIixcclxuICAgICAgICAgICAgICAgIHNob3J0Y3V0OiBcImN0cmwrY1wiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wZXJhdGU6IFwiY29weVwiLFxyXG4gICAgICAgICAgICAgICAgc3RhdHVzOiBcImRpc2FibGVkXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJcIixcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwi5aSN5Yi2XCIsXHJcbiAgICAgICAgICAgICAgICBzaG9ydGN1dDogXCJjdHJsK2NcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICB0eXBlOiBcInNlcGFyYXRvclwiXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIG9wZXJhdGU6IFwiY3V0XCIsXHJcbiAgICAgICAgICAgICAgICBzdGF0dXM6IFwiXCIsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogXCJjdXRcIixcclxuICAgICAgICAgICAgICAgIHRleHQ6IFwi5Ymq5YiHXCIsXHJcbiAgICAgICAgICAgICAgICBzaG9ydGN1dDogXCJjdHJsK3hcIlxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBvcGVyYXRlOiBcInBhZ2VcIixcclxuICAgICAgICAgICAgICAgIHN0YXR1czogXCJcIixcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBcInBhc3RlXCIsXHJcbiAgICAgICAgICAgICAgICB0ZXh0OiBcIueymOi0tFwiLFxyXG4gICAgICAgICAgICAgICAgc2hvcnRjdXQ6IFwiY3RybCt2XCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIF1cclxuICAgIH07XHJcbiAgICAkKFwiLmJvcmRlci13aWR0aCwgLmJvcmRlci1zdHlsZVwiKS5jbGljayhmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIHZhciAkdGFyZ2V0ID0gJCh0aGlzKTtcclxuICAgICAgICBDLk1lbnUuaW5pdCgkdGFyZ2V0LCBkYXRhLCBmdW5jdGlvbihvcGVyYXRlLCB2YWx1ZSkge1xyXG4gICAgICAgICAgICBDLmxheWVyLnRvcE5vdGlmeShcImluZm9cIiwgeyBjb250ZW50OiBcIm9wZXJhdGU6IFwiICsgb3BlcmF0ZSArIFwiPGJyIC8+dmFsdWU6IFwiICsgdmFsdWUsIHNoYWRlOiBmYWxzZSwgdGltZTogMiB9KTtcclxuICAgICAgICB9LCBcInRyaWdnZXJCeVRhcmdldFwiKTtcclxuICAgIH0pO1xyXG4gICAgJChkb2N1bWVudCkuY29udGV4dG1lbnUoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICB2YXIgJHRhcmdldCA9ICQoZXZlbnQudGFyZ2V0KTtcclxuICAgICAgICBpZiAoJHRhcmdldC5oYXNDbGFzcyhcImRyYXctY29udGVudFwiKSkge1xyXG4gICAgICAgICAgICBDLk1lbnUuaW5pdChldmVudCwgZGF0YTEsIGZ1bmN0aW9uKG9wZXJhdGUsIHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICBDLmxheWVyLnRvcE5vdGlmeShcImluZm9cIiwgeyBjb250ZW50OiBcIm9wZXJhdGU6IFwiICsgb3BlcmF0ZSArIFwiPGJyIC8+dmFsdWU6IFwiICsgdmFsdWUsIHNoYWRlOiBmYWxzZSwgdGltZTogMiB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgZGV2aWNlSGVpZ2h0ID0gJChcIi5ib3R0b20taWNvbnNcIilbMF0ub2Zmc2V0SGVpZ2h0O1xyXG4gICAgJChcIi5kcmF3LWNvbnRlbnRcIikuY3NzKFwibWFyZ2luLWJvdHRvbVwiLCBkZXZpY2VIZWlnaHQgKyBcInB4XCIpO1xyXG5cclxuICAgIHZhciBBcHBWaWV3ID0gRC5WaWV3LmV4dGVuZCh7XHJcbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICB0aGlzLnN2ZyA9IFNWRyhcInN2Zy13cmFwcGVyXCIpLnNpemUoXCIxMDAlXCIsIFwiMTAwJVwiKTtcclxuICAgICAgICAgICAgdGhpcy5iZyA9IG51bGw7XHJcbiAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZW5kZXJHcmlkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIGdhcCA9IDEyLFxyXG4gICAgICAgICAgICAgICAgYm94ID0gdGhpcy5zdmcucmJveCgpLFxyXG4gICAgICAgICAgICAgICAgc3RhcnQsIGVuZCxcclxuICAgICAgICAgICAgICAgIHNoYWRvd0NvbG9yID0gXCIjY2NjXCIsXHJcbiAgICAgICAgICAgICAgICBkZWVwQ29sb3IgPSBcIiM5OTlcIixcclxuICAgICAgICAgICAgICAgIGxpbmVXaWR0aCA9IDEsXHJcbiAgICAgICAgICAgICAgICBwYXRoLFxyXG4gICAgICAgICAgICAgICAgbWF4ID0gTWF0aC5tYXgoYm94LndpZHRoLCBib3guaGVpZ2h0KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuYmcpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmcuY2xlYXIoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuYmcgPSB0aGlzLnN2Zy5ncm91cCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRoaXMuYmcpO1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDw9IG1heDsgaSArPSBnYXApIHtcclxuICAgICAgICAgICAgICAgIGlmIChpIDw9IGJveC5oZWlnaHQpIHsgLy8g5qiq57q/XHJcbiAgICAgICAgICAgICAgICAgICAgcGF0aCA9IHRoaXMuYmcucGF0aChcIk0gXCIgKyAwICsgXCIgXCIgKyBpICsgXCIgTCBcIiArIGJveC53aWR0aCArIFwiIFwiICsgaSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKChpIC8gZ2FwKSAlIDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5zdHJva2UoeyBjb2xvcjogc2hhZG93Q29sb3IgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5zdHJva2UoeyBjb2xvcjogZGVlcENvbG9yIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwYXRoLnRyYW5zZm9ybSh7IHk6IDAuNSB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChpIDw9IGJveC53aWR0aCkgeyAvLyDnq5bnur9cclxuICAgICAgICAgICAgICAgICAgICBwYXRoID0gdGhpcy5iZy5wYXRoKFwiTSBcIiArIGkgKyBcIiBcIiArIDAgKyBcIiBMIFwiICsgaSArIFwiIFwiICsgYm94LmhlaWdodCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKChpIC8gZ2FwKSAlIDQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5zdHJva2UoeyBjb2xvcjogc2hhZG93Q29sb3IsIHdpZHRoOiBsaW5lV2lkdGggfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcGF0aC5zdHJva2UoeyBjb2xvcjogZGVlcENvbG9yLCB3aWR0aDogbGluZVdpZHRoIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBwYXRoLnRyYW5zZm9ybSh7IHg6IDAuNSB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdGhpcy5yZW5kZXJHcmlkKCk7XHJcblxyXG4gICAgICAgICAgICAvLyB0aGlzLnJlbmRlckF0dHIoKTtcclxuICAgICAgICAgICAgLy8gdGhpcy5yZW5kZXJUb29scygpO1xyXG4gICAgICAgICAgICAvLyB0aGlzLnJlbmRlckRldmljZXMoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgfSk7XHJcbiAgICB2YXIgYXBwID0gbnVsbDtcclxuXHJcbiAgICB3aW5kb3cuRHJhdyA9IHtcclxuICAgICAgICBjaGVja0RhdGE6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHt9O1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5pdDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdmFyIHZhbGlkRGF0YSA9IHRoaXMuY2hlY2tEYXRhKGRhdGEpO1xyXG4gICAgICAgICAgICBhcHAgPSBuZXcgQXBwVmlldyh2YWxpZERhdGEpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2F2ZTogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgaWYgKCFhcHApIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiZHJhdyBub3QgaW5pdGVkXCIpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRFdmVudDogZnVuY3Rpb24oZXZlbnRUeXBlLCB0YXJnZXRUeXBlLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBpZiAoIWFwcCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJkcmF3IG5vdCBpbml0ZWRcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgRHJhdy5pbml0KHtcclxuICAgICAgICAgICAgZWw6IFwiLm91dGVyLXdyYXBwZXJcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIEMubGF5ZXIudG9wTm90aWZ5KFwic3VjY2Vzc1wiLCB7IGNvbnRlbnQ6IFwiZHJhdyBpbml0ZWRcIiwgc2hhZGU6IGZhbHNlLCB0aW1lOiAyIH0pO1xyXG4gICAgICAgIH0pO1xyXG59KSgpOyJdfQ==
