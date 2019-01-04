/**
 * Created by hanqilin on 16/12/12.
 */

/*依赖
 * jquery.js
 * web-storage-cache.min.js
 */


// 全局变量
var AppID;
// 测试环境
var condition = 'dev'; //开发控制 dev   product release
var wxAutoAuth = false;//微信自动授权控制开关 【预发布暂时没有服务号可用，暂时关闭】
switch (condition) {
    // 正式环境
    case 'product':
        // $.baseUrl = 'http//s.baifaduobao.com/';
        AppID = 'wx38760e710ad07a76';
        break;
    case 'dev':
        // $.baseUrl = 'http://101.201.121.93:8182/';
        AppID = 'wx38760e710ad07a76'; //百发夺宝
        break;
}

var publicParams = {
    "uuid": "", // 用户设备唯一码
    "app_major_ver": 1, // App主版本号
    "app_minor_ver": 5, // App次版本号
    "app_revision_ver": 0, // App修正版本号
    "platform": 3, // 客户端平台，使用enum Partner;
    "channel": 'bfh5'
};

// jQ工具方法x
var common = (function () {

    // 获取url参数 by name
    var getQueryString = function (name) {

        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = decodeURIComponent(window.location.search.substr(1)).match(reg);
        if (r != null) {
            if (arguments.length > 1) {
                return r[2]
            }
            return r[2]
        }
        return null;

    };


// 操作store 用于保存信息
    var wsCache = new WebStorageCache({
        // [可选] 'localStorage', 'sessionStorage', window.localStorage, window.sessionStorage
        //        或者其他实现了 [Storage API] 的storage实例.
        //        默认 'localStorage'.
        // 魅族不兼容 sessionStorage
        storage: 'localStorage',
        // [可选]  类型Number，公共超时事件设置。默认无限大
        exp: Infinity
    });
    if (!wsCache.isSupported()) {
        alert('您的浏览器版本过低，请用现代浏览器');
        location.href = 'http://mktll.qq.com/';
        return;
    }


// 构建 请求参数  默认 md5 签名
    var buildData = function (params, isMd5) {


    };


    return {
        getQueryString: getQueryString,
        wsCache: wsCache,
        buildData: buildData,
        setTitle: function (t) {

            var $body = $('body');
            document.title = t;
            // hack在微信等webview中无法修改document.title的情况
            var $iframe = $('<iframe style="display:none;" src="' + window.location.protocol + '//m.baidu.com/favicon.ico"></iframe>').on('load', function () {
                setTimeout(function () {
                    $iframe.off('load').remove()
                }, 0)
            }).appendTo($body)

        },
    }

})();
// $.extend(common);
// 定义一个混合对象
var mixin = {
    data: function () {
        return {

        }
    },
    created: function () {

    },
    methods: {

    },
    computed: {

    }
};


if (typeof Vue !== 'undefined') {
    Vue.config.devtools = true
    // vue 扩展
// vue-resource fromData 方式
    Vue.http.options.emulateJSON = true;
    Vue.http.interceptors.push(function (request, next) {

        // 请求时间戳
        var and = /\?/.test(request.url) ? '&' : '?';
        request.url = request.url + and + 't=' + new Date().getTime();

// continue to next interceptor
        next(function (response) {
            var self = this;
            switch (response.status) {
                case(400):
                   self.$toast('400')
                    break;
                case(200):
                    // 参数无效
                    self.$toast('200')
                    break;
            }
        });

    });


// 组件
    /*倒计时*/
    Vue.component('my-countdown', {
        // 选项
        template: '<div class="countdown" style="display: inline">' +
        '<span class="text" :style="{ backgroundColor: bgColor, color: color }" v-if="showHover">{{hour}}</span>' +
        '<span :style="{ color: bgColor }" v-if="showHover">:</span>' +
        '<span class="text" :style="{ backgroundColor: bgColor, color: color }">{{minute}}</span>' +
        '<span :style="{ color: color }">:</span><span class="text" :style="{ backgroundColor: bgColor, color: color }">{{second}}</span>' +
        '<span :style="{ color: color }">:</span><span :style="{ backgroundColor: bgColor, color: color }" v-if="showHm">{{hm}}</span>' +
        '</div>',
        props: {
            date: {
                default: new Date().getTime()
            },
            point: {
                default: '#f61d4b'
            },
            bgColor: {
                default: 'inherit'
            },
            color: {
                default: '#FFFFFF'
            },
            showHm: {
                default: false
            },
            showHover: {
                default: true
            }
        },
        data: function () {
            return {
                hour: '00',
                minute: '00',
                second: '00',
                hm: '00',
                count: this.date - new Date().getTime(),
                interval: null,
                difference: 0
            }
        },
        mounted: function () {
            this.start()
        },
        methods: {
            pad: function (num, n) {
                var len = num.toString().length;
                while (len < n) {
                    num = "0" + num;
                    len++;
                }
                return num;
            },
            start: function () {
                var self = this;
                if (this.count <= 0) {
                    return;
                }
                var func = function () {
                    self.count = self.date - new Date().getTime() + self.difference - 10;
                    if (self.count <= 0) {
                        self.second = '00';
                        clearInterval(self.interval);
                        self.timeDown();
                        return
                    }
                    self.hour = parseInt(self.count / (60 * 60 * 1000)) + '';
                    if (self.hour < 10) {
                        self.hour = '0' + self.hour
                    }
                    var n = self.count % (60 * 60 * 1000);
                    self.minute = parseInt(n / (60 * 1000)) + '';
                    if (self.minute < 10) {
                        self.minute = '0' + self.minute
                    }
                    var n2 = n % (60 * 1000);
                    self.second = parseInt(n2 / 1000) + '';
                    if (self.second < 10) {
                        self.second = '0' + self.second
                    }
                    self.hm = self.pad((self.count % 1000).toString().substring(0, 2), 2);
                };
                func();
                this.interval = setInterval(func, 10)

            },
            timeDown: function () {
                this.$emit('increment')
            }
        },
        created: function () {

            var postData = $.buildData({
                cmd: "GetServerNowTime",
                params: {
                    "uid": this.uid,
                }
            });
            return this.$http.post($.baseUrl, postData).then(function (response) {
                var resData = $.decryptToJson(response.body);
                // 成功
                if (resData.status == 0) {
                    this.difference = new Date().getTime() - new Date(resData.protocol.server_now_time).getTime();
                } else {
                    console.log('错误status：' + $.rs[resData.status]);
                }
            });
        },


    });
}
/**
 * Copyright
 * http://jaywcjlove.github.io
 */

(function (window) {
    /**
     * [format 日期格式化]
     * @param  {[type]} format ["YYYY年MM月dd日hh小时mm分ss秒"]
     * @return {[type]}        [string]
     */
    Date.prototype.format = function (format) {
        var o = {
            "M+": this.getMonth() + 1, //month
            "d+": this.getDate(), //day
            "h+": this.getHours(), //hour
            "m+": this.getMinutes(), //minute
            "s+": this.getSeconds(), //second
            "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
            "S": this.getMilliseconds() //millisecond
        }
        if (/(y+)/.test(format))
            format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (var k in o)
            if (new RegExp("(" + k + ")").test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        return format;
    }
    /**
     * [ago 多少小时前、多少分钟前、多少秒前]
     * @return {[type]} [string]
     */
    Date.prototype.ago = function () {
        if (!arguments.length) return '';
        var arg = arguments,
            now = this.getTime(),
            past = !isNaN(arg[0]) ? arg[0] : new Date(arg[0]).getTime(),
            diffValue = now - past,
            result = '',
            minute = 1000 * 60,
            hour = minute * 60,
            day = hour * 24,
            halfamonth = day * 15,
            month = day * 30,
            year = month * 12,

            _year = diffValue / year,
            _month = diffValue / month,
            _week = diffValue / (7 * day),
            _day = diffValue / day,
            _hour = diffValue / hour,
            _min = diffValue / minute;

        if (_year >= 1) result = parseInt(_year) + "年前";
        else if (_month >= 1) result = parseInt(_month) + "个月前";
        else if (_week >= 1) result = parseInt(_week) + "周前";
        else if (_day >= 1) result = parseInt(_day) + "天前";
        else if (_hour >= 1) result = parseInt(_hour) + "个小时前";
        else if (_min >= 1) result = parseInt(_min) + "分钟前";
        else result = "刚刚";
        return result;
    }
    /**
     * [TZC 解决因时区变更，导致显示服务器时间不准确 time Zone Converter]
     * @param {[type]} timeZone [时区]
     */
    Date.prototype.TZC = function (timeZone) {
        var new_date = new Date(),
            old_date = this.getTime();
        return (isNaN(timeZone) && !timeZone) ? this : new Date(old_date + new_date.getTimezoneOffset() * 60 * 1000 + timeZone * 60 * 60 * 1000);
    }
    /**
     * [toHHMMSS 超过分钟以分钟为单位，超过小时以小时为单位]
     * @param  {[type]} format ["123112".toHHMMSS('hh时mm分ss秒')]
     * @return {[type]} [number]
     */
    String.prototype.toHHMMSS = function (format) {
        var str = this.replace(/^\s\s*/, ''), hour, minute, second, o;
        if (!str.length && str.length > 0) return '';
        str = parseInt(str)

        hour = parseInt(str / 3600)
        minute = parseInt(str / 60)
        if (minute >= 60) minute = minute % 60
        second = str % 60;
        o = {
            "h+": hour,
            "m+": minute,
            "s+": second
        }
        for (var k in o) {
            if (new RegExp("(" + k + ")").test(format)) {
                if (RegExp.$1 == "hh" && hour > 99) {
                    format = format.replace('hh', hour)
                } else {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length))
                }
            }
        }
        ;
        return format
    }
})(window);

