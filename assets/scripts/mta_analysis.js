var MTA_CONFIG = { //埋点   无需改动
	app_id: "",
	event_id: "",
	api_base: "https://pingtas.qq.com/pingd", //要添加到域名
	prefix: "_mta_",
	version: "1.3.5",
	stat_share_app: !1,
	stat_pull_down_fresh: !1,
	stat_reach_bottom: !1
};

function getNetworkType(a) {
	if (cc.sys.WECHAT_GAME == cc.sys.platform) {
		wx.getNetworkType({
			success: function success(b) {
				a(b.networkType);
			}
		});
	} else {
		a("Unknown");
	}
}

function getSystemInfo() {
	if (cc.sys.WECHAT_GAME == cc.sys.platform) {
		var a = wx.getSystemInfoSync();
		return {
			adt: encodeURIComponent(a.model),
			scl: a.pixelRatio,
			scr: a.windowWidth + "x" + a.windowHeight,
			lg: a.language,
			fl: a.version,
			jv: encodeURIComponent(a.system),
			tz: encodeURIComponent(a.platform)
		};
	} else {
		return {
			adt: "unknown",
			scl: "unknown",
			scr: "unknown",
			lg: "unknown",
			fl: "unknown",
			jv: "unknown",
			tz: "unknown",
		}
	}
}

function getUID() {
	try {
		return cc.sys.localStorage.getItem(MTA_CONFIG.prefix + "auid")
	} catch (a) {}
}

function setUID() {
	try {
		var a = getRandom();
		cc.sys.localStorage.setItem(MTA_CONFIG.prefix + "auid", a);
		return a
	} catch (b) {}
}

function getSID() {
	try {
		return cc.sys.localStorage.getItem(MTA_CONFIG.prefix + "ssid")
	} catch (a) {}
}

function setSID() {
	try {
		var a = "s" + getRandom();
		cc.sys.localStorage.setItem(MTA_CONFIG.prefix + "ssid", a);
		return a
	} catch (b) {}
}

function getRandom(a) {
	for (var b = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], c = 10; 1 < c; c--) {
		var d = Math.floor(10 * Math.random()),
			e = b[d];
		b[d] = b[c - 1];
		b[c - 1] = e
	}
	for (c = d = 0; 5 > c; c++) d = 10 * d + b[c];
	return (a || "") + (d + "" + +new Date)
}

function getPagePath() {
	try {
		var
			b = "/";
		return b
	} catch (c) {
		console.log("get current page path error:" + c)
	}
}

function getMainInfo() {
	var a = {
		dm: "wechat.apps.xx",
		url: getPagePath(),
		pvi: "",
		si: "",
		ty: 0
	};
	a.pvi = function () {
		var b = getUID();
		b || (b = setUID(), a.ty = 1);
		return b
	}();
	a.si = function () {
		var a = getSID();
		a || (a = setSID());
		return a
	}();
	return a
}

function getBasicInfo() {
	var a = getSystemInfo();
	getNetworkType(function (a) {
		try {
			cc.sys.localStorage.setItem(MTA_CONFIG.prefix + "ntdata", a)
		} catch (c) {}
	});
	a.ct = cc.sys.localStorage.getItem(MTA_CONFIG.prefix + "ntdata") || "4g";
	return a
}

function getExtentInfo() {
	var a = MTA.Data.userInfo;
	var b = [],
		c;
	for (c in a) a.hasOwnProperty(c) && b.push(c + "=" + a[c]);
	a = b.join(";");
	return {
		r2: MTA_CONFIG.app_id,
		r4: "wx",
		ext: "v=" + MTA_CONFIG.version + (null !== a && "" !== a ? ";ui=" + encodeURIComponent(a) : "")
	}
}

function request(obj) {
	if (cc.sys.platform == cc.sys.WECHAT_GAME) {
		wx.request(obj);
	} else {
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status < 400)) {
				var response = xhr.responseText;
				// console.log(response);
			}
		};

		// console.log(obj.url);
		xhr.open("GET", obj.url, true);
		xhr.send();
	}
}
var MTA = {
	App: {
		init: function (a) {
			"appID" in a && (MTA_CONFIG.app_id = a.appID);
			"eventID" in a && (MTA_CONFIG.event_id = a.eventID);
			"statShareApp" in a && (MTA_CONFIG.stat_share_app = a.statShareApp);
			"statPullDownFresh" in a && (MTA_CONFIG.stat_pull_down_fresh = a.statPullDownFresh);
			"statReachBottom" in a && (MTA_CONFIG.stat_reach_bottom = a.statReachBottom);
			setSID();
			"lauchOpts" in a && (MTA.Data.lanchInfo = a.lauchOpts, MTA.Data.lanchInfo.landing = 1)
		}
	},
	Page: {
		init: function () {
			var a = {
				onShow: true,
				__route__: "pages/index/index"
			};
			a.onShow &&
				! function () {
					var b = a.onShow;
					a.onShow = function () {
						MTA.Page.stat();
						b.call(this, arguments)
					}
				}();
			MTA.Page.stat();
			MTA_CONFIG.stat_pull_down_fresh && a.onPullDownRefresh && ! function () {
				var b = a.onPullDownRefresh;
				a.onPullDownRefresh = function () {
					MTA.Event.stat(MTA_CONFIG.prefix + "pulldownfresh", {
						url: a.__route__
					});
					b.call(this, arguments)
				}
			}();
			MTA_CONFIG.stat_reach_bottom && a.onReachBottom && ! function () {
				var b = a.onReachBottom;
				a.onReachBottom = function () {
					MTA.Event.stat(MTA_CONFIG.prefix + "reachbottom", {
						url: a.__route__
					});
					b.call(this, arguments)
				}
			}();
			MTA_CONFIG.stat_share_app && a.onShareAppMessage && ! function () {
				var b = a.onShareAppMessage;
				a.onShareAppMessage = function () {
					MTA.Event.stat(MTA_CONFIG.prefix + "shareapp", {
						url: a.__route__
					});
					return b.call(this, arguments)
				}
			}()
		},
		stat: function () {
			if ("" != MTA_CONFIG.app_id) {
				var a = [],
					b = getExtentInfo(),
					c = [getMainInfo(), b, getBasicInfo()];
				MTA.Data.lanchInfo && (c.push({
						ht: MTA.Data.lanchInfo.scene,
						rdm: "/",
						rurl: MTA.Data.lanchInfo.path
					}), MTA.Data.lanchInfo.query && MTA.Data.lanchInfo.query._mta_ref_id && c.push({
						rarg: MTA.Data.lanchInfo.query._mta_ref_id
					}),
					1 == MTA.Data.lanchInfo.landing && (b.ext += ";lp=1", MTA.Data.lanchInfo.landing = 0));
				c.push({
					rand: +new Date
				});
				b = 0;
				for (var d = c.length; b < d; b++)
					for (var e in c[b]) c[b].hasOwnProperty(e) && a.push(e + "=" + ("undefined" == typeof c[b][e] ? "" : c[b][e]));

				request({
					url: MTA_CONFIG.api_base + "?" + a.join("&").toLowerCase()
				})
			}
		}
	},
	Event: {
		stat: function (a, b) {
			if ("" != MTA_CONFIG.event_id) {
				var c = [],
					d = getMainInfo(),
					e = getExtentInfo();
				d.dm = "wxapps.click";
				d.url = a;
				e.r2 = MTA_CONFIG.event_id;
				var f = "undefined" === typeof b ? {} : b;
				var k = [],
					g;
				for (g in f) f.hasOwnProperty(g) &&
					k.push(encodeURIComponent(g) + "=" + encodeURIComponent(f[g]));
				f = k.join(";");
				e.r5 = f;
				f = 0;
				d = [d, e, getBasicInfo(), {
					rand: +new Date
				}];

				for (e = d.length; f < e; f++)
					for (var h in d[f])
						d[f].hasOwnProperty(h) && c.push(h + "=" + ("undefined" == typeof d[f][h] ? "" : d[f][h]));

				request({
					url: MTA_CONFIG.api_base + "?" + c.join("&").toLowerCase()
				})
			}
		}
	},
	Data: {
		userInfo: null,
		lanchInfo: null
	}
};
module.exports = MTA;