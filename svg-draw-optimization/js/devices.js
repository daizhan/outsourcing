define(["jquery", "underscore", "backbone", "svg", "templates/device-tpl", "common"], function($, _, Backbone, SVG, tpl, C) {
    var deviceModel = Backbone.Model.extend({
        defaults: {
            devices: []
        }
    });
    var deviceView = Backbone.View.extend({
        preventBodyClear: false,
        type: "device",
        tagName: "div",
        className: "bottom-icons",
        initialize: function(data) {
            var self = this;
            this.model.set({ devices: data.devices });
            this.on({
                "selectDone": this.clearItemSelected,
                "setSelected": this.selectDevice
            }, this);

            this.listenTo(Backbone, "showDeviceIdList", this.showDeviceIdList);
            this.listenTo(Backbone, "updateDeviceIdStatus", this.updateDeviceIdStatus);
        },
        template: _.template(tpl),
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },
        // events
        selectDevice: function(options) {
            var $target = $(options.event.target),
                type = "";
            if ($target.parents("li").length) {
                $target = $target.parents("li");
            } else if ($target[0].tagName == "li"){
                // just the device
            } else { // not click on device
                return ;
            }
            type = $target.attr("data-type");
            if ($target.hasClass("selected")) {
                return;
            }
            this.clearItemSelected();
            $target.addClass("selected");
            this.trigger("selectDevice", { type: this.type, value: type });
        },
        clearItemSelected: function() {
            var $target = this.$el.find("li");
            $target.removeClass("selected");
        },
        getSelected: function() {
            return this.$el.find("li.selected");
        },
        getAvailableList: function(type) {
            var devices = this.model.get("devices"),
                idList = [],
                availables = [];
            for (var i = 0, len = devices.length; i < len; i++) {
                if (devices[i].type == type) {
                    idList = devices[i].devices;
                }
            }
            for (var i = 0, len = idList.length; i < len; i++) {
                if (idList[i].available) {
                    availables.push(idList[i]);
                }
            }
            return availables;
        },

        setDeviceIdStatus: function(type, id, status) {
            var devices = this.model.get("devices"),
                idList = [],
                availables = [];
            for (var i = 0, len = devices.length; i < len; i++) {
                if (devices[i].type == type) {
                    idList = devices[i].devices;
                }
            }
            for (var i = 0, len = idList.length; i < len; i++) {
                if (idList[i].id == id) {
                    idList[i].available = status;
                }
            }
            this.model.set("devices", devices);
        },
        updateDeviceIdStatus: function(options) {
            this.setDeviceIdStatus(options.type, options.id, options.status);
        },

        showDeviceIdList: function(data) {
            var availables = this.getAvailableList(data.type),
                listData = [],
                self = this;
            if (!availables.length) {
                C.layer.topNotify("error", { content: "该类设备下已经没有设备可以绑定", shade: false, time: 2 });
                return;
            }
            for (var i = 0, len = availables.length; i < len; i++) {
                listData.push({
                    operate: "setId",
                    value: availables[i].id,
                    text: availables[i].name
                });
            }
            C.popupMenu.init(data.pos, { menus: listData }, function(menu) {
                self.setDeviceIdStatus(data.type, menu.value, false);
                Backbone.trigger(menu.operate, { deviceId: menu.value, deviceName: menu.text, viewId: data.id });
            });
        },
    });

    return {
        view: deviceView,
        model: deviceModel
    };
});