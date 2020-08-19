var gameManager=require('GameManager');
cc.Class({
    extends: cc.Component,

    properties: {
		bannerAd: { default: null, visible: false },
		videoAd: { default: null, visible: false },
		interstitialAd: { default: null, visible: false },
		appbox: { default: null, visible: false },
		screenWidth: { default: 0, visible: false },
		screenHight: { default: 0, visible: false },
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },
	ShowBanner: function (flag) {
		if (cc.sys.platform === cc.sys.DESKTOP_BROWSER) return;
		if (this.bannerAd != null) { this.bannerAd.destroy(); }
		let that = this;
		if (gameManager.channel == 'qq' || gameManager.channel == 'wx' || gameManager.channel == 'tt') {
			if (gameManager.channel == 'wx') {
				console.log('bannerid:' + gameManager.bannerid);
				let phone = wx.getSystemInfoSync();
				let w = phone.screenWidth / 2;
				let h = phone.screenHeight;
				this.bannerAd = wx.createBannerAd({
					adUnitId: gameManager.bannerid,
					style: {
						width: 300,
						top: 0,
						left: 0
					}
				});
				this.bannerAd.onResize(function () {
					console.log('banneronresize:' + that.bannerAd.style.realWidth);
					that.bannerAd.style.left = w - that.bannerAd.style.realWidth / 2 + 0.1;
					that.bannerAd.style.top = h - that.bannerAd.style.realHeight + 0.1;
				});
			} else if (gameManager.channel == 'qq') {
				if (this.bannerAd != null) {
					this.bannerAd.offLoad();
					this.bannerAd.offError();
					this.bannerAd.offResize();
					this.bannerAd.destroy();
				}

				let phone = qq.getSystemInfoSync();
				if (phone.brand == 'iphone') {
					gameManager.isIphone = true;
				}
				let w = phone.screenWidth / 2;
				let h = phone.screenHight;
				this.bannerAd = qq.createBannerAd({
					adUnitId: 'bannerId',
					style: {
						width: 300,
						top: 0,
						left: 0
					}
				});
				this.bannerAd.onResize(function () {
					that.bannerAd.left = w - that.bannerAd.style.realWidth / 2 + 0.1;
					that.bannerAd.style.top = h - that.bannerAd.style.realHeight + 0.1;
				})
			} else if (gameManager.channel == 'tt') {
				const {
					windowWidth,
					windowHeight,
				} = tt.getSystemInfoSync();
				var targetBannerAdWidth = 200;
				this.bannerAd = tt.createBannerAd({
					adUnitId: 'qdcmbilcmfj2b2hldd',
					style: {
						width: targetBannerAdWidth,
						top: windowHeight - (targetBannerAdWidth / 16 * 9),
					}
				});
				this.bannerAd.style.left = (windowWidth - targetBannerAdWidth) / 2;

				this.bannerAd.onResize(size => {
					// console.log(size.width, size.height);
					// 如果一开始设置的 banner 宽度超过了系统限制，可以在此处加以调整
					if (targetBannerAdWidth != size.width) {
						targetBannerAdWidth = size.width;
						that.bannerAd.style.left = (windowWidth - size.width) / 2;
						if (gameManager.isXiGua) {
							that.bannerAd.style.top = windowHeight - (targetBannerAdWidth / 16 * 9);
						}
						else {
							that.bannerAd.style.top = windowHeight - size.height;
						}
					}
				});
			}
			this.bannerAd.onLoad(function () {
				that.bannerAd.show();
				console.log('显示banner')
				if (gameManager.channel !== 'tt')
					gameManager.decorateit && gameManager.decorateit.AdaptScreen(true) 
			});
			this.bannerAd.onError(function (err) {//添加banner屏幕适配
				console.log(err);
				if (gameManager.channel !== 'tt')
					gameManager.decorateit && gameManager.decorateit.AdaptScreen(false)
			});
			this.bannerAd.onError(err => {
				console.log(err);
				if (gameManager.channel !== 'tt')
					gameManager.decorateit && gameManager.decorateit.AdaptScreen(false)
			});
		}
	},
	HideBanner: function () {
		if (this.bannerAd != null) {
			if (gameManager.channel == 'qq') {
				this.bannerAd.offLoad();
				this.bannerAd.offError();
				this.bannerAd.offResize();
			}
			this.bannerAd.destroy();
			this.bannerAd = null;
		}
	},
	InitAppBox: function () {//qq
		if (cc.sys.platform === cc.sys.DESKTOP_BROWSER) return;
		if (gameManager.isShowAppBox == false) return;
		this.appbox = qq.createAppBox({
			adUnitId: 'appboxID'
		});
		let that = this;
		this.appbox && this.appbox.load();
		this.appbox.onClose(function () {
			that.appbox && that.appbox.load();
		});
	},
	ShowAppBox: function () {
		if (cc.sys.platform === cc.sys.DESKTOP_BROWSER)
			return;
		console.log(gameManager.isShowAppBox);
		if (gameManager.isShowAppBox == false)
			return;
		if (this.appbox == null) {
			this.InitAppBox();
			return;
		}
		let that = this;
		this.appbox && this.appbox.show().catch(err => {
			that.appbox.load();
		});
	},
	isCanShowAppBox: function () {
		var ret = false;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			var current_version = qq.getSystemInfoSync().SDKVersion;
			if (this.compareVersion(current_version, "1.7.0") === -1) {
				console.log('=====版本不够1.7.0，AppBox不能用')
			} else {
				ret = true;
			}
		}
		return ret;
	},

	isCanShowVideo: function () {
		var ret = false;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			var current_version = wx.getSystemInfoSync().SDKVersion;
			if (this.compareVersion(current_version, "2.0.4") === -1) {
				console.log('=====版本不够2.0.4，视频广告不能用')
			} else {
				ret = true;
			}
		}
		return ret;
	},
	isCanShowInterstitial: function () {
		var ret = false;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			let current_version = 0;
			let minVersion = 0;
			let appName = "";
			if (gameManager.channel == "wx") {
				current_version = wx.getSystemInfoSync().SDKVersion;
				minVersion = "2.6.0";
			}
			else if (gameManager.channel == "tt") {
				current_version = tt.getSystemInfoSync().version;
				appName = tt.getSystemInfoSync().appName;
				minVersion = "7.6.6";
			}
			if (gameManager.channel == "tt" && appName != "Toutiao") {
				console.log('插屏只有头条支持')
			}
			else if (this.compareVersion(current_version, minVersion) === -1) {
				console.log('=====版本不够' + minVersion + '，插屏广告不能用')
			} else {
				ret = true;
			}
		}
		return ret;
	},
	compareVersion: function (v1, v2) {//比较版本
		v1 = v1.split('.');
		v2 = v2.split('.');
		var len = Math.max(v1.length, v2.length);
		while (v1.length < len) {
			v1.push('0');
		}
		while (v2.length < len) {
			v2.push('0');
		}
		for (var i = 0; i < len; i++) {
			var num1 = parseInt(v1[i]);
			var num2 = parseInt(v2[i]);
			if (num1 > num2) {
				return 1;
			} else if (num1 < num2) {
				return -1;
			}
		}
		return 0;
	},
	InitInterstitial: function () {
		if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
		if (this.isCanShowInterstitial() == false) {
			return;
		}
		this.interstitialAd = null;
		if (gameManager.channel == 'tt') {
			// this.interstitialAd = null;
			if (this.interstitialAd) {
				this.interstitialAd.destroy();
				this.interstitialAd = null;
			}
			// 创建插屏广告实例，提前初始化
			// let isToutiaio = tt.getSystemInfoSync().appName === "Toutiao";
			// 插屏广告仅今日头条安卓客户端支持

			this.interstitialAd = tt.createInterstitialAd({
				adUnitId: '9fpjf5hjf5f7s20ckl'
			});
			let that = this;
			this.interstitialAd.onError(err => {
				console.log("显示插屏onError" + err);
				that.isInitLoadFail = true;
			});
			this.interstitialAd.onLoad(function () {
				that.isInitLoadFail = false;
			});
			this.interstitialAd.onClose(function () {
				that.isInitLoadFail = true;
				// that.interstitialAd.load();//加载插屏广告
				that.InitInterstitial();
			});
		} else if (gameManager.channel == 'wx') {// 创建插屏广告实例，提前初始化
			// console.log('initid:' + gameManager.initid);
			this.interstitialAd = wx.createInterstitialAd({
				adUnitId: gameManager.initid,
			});
			let that = this;
			this.interstitialAd.onError(err => {
				console.log("显示插屏onError:" + err);
				that.isInitLoadFail = true;
			});
			this.interstitialAd.onLoad(function () {
				that.isInitLoadFail = false;
			});
			this.interstitialAd.onClose(function () {
				that.isInitLoadFail = true;
				that.interstitialAd.load();//加载插屏广告
			});
		}
	},
	ShowInterstitial: function (type) {//1
		if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) return;
		if (this.isCanShowInterstitial() == false)//版本不够无法显示
		{
			if (type != -1)
				this.ShowVideo();
			return;
		}
		let that = this;
		if (this.interstitialAd) {
			this.interstitialAd.show()
				.then(() => {
					if (type != -1) {//播放成功并且需要奖励的时候
					}
				})
				.catch(err => {
					console.log('广告组件出现问题', err);
					if (type != -1) {
						this.ShowVideo();
					}
					that.interstitialAd.load()
						.then(() => {
							// console.log('手动加载成功');
						});
				});
		} else {
			if (type != -1) {
				this.ShowVideo();
			}
			this.InitInterstitial();
		}
	},
	InitVideo: function () {
		if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) { return; }
		if (this.videoAd != null) return;
		if (gameManager.channel == "wx" || gameManager.channel == "qq" || gameManager.channel == "tt") {
			if (gameManager.channel == "wx") {
				if (this.isCanShowVideo() == false) {
					return;
				}
				// console.log('videoid:' + gameManager.videoid);
				this.videoAd = wx.createRewardedVideoAd({
					adUnitId: gameManager.videoid
				});
			} else if (gameManager.channel == "qq") {
				this.videoAd = qq.createRewardedVideoAd({ adUnitId: '8e3eb31f1469f9d65d153219d59676c0' });
			} else {
				this.videoAd = tt.createRewardedVideoAd({ adUnitId: '9059a071k86830a164' });
				// console.log('加载视频广告');
			}
			let that = this;
			this.videoAd.onError(function (err) {
				that.isVideoLoad = false;
				console.log('加载视频广告:报错:' + err);
			});
			this.videoAd.onLoad(function (err) {
				that.isVideoLoad = true;
				console.log('加载视频广告:加载' + err);
			});
			this.videoAd.onClose(function (res) {
				// console.log('关闭视频广告');
				that.isVideoLoad = false;
				if (!gameManager.isCloseMusic) {
					if (gameManager.bgMusicChannel !== undefined) {
						cc.audioEngine.pause(gameManager.bgMusicChannel);
						cc.audioEngine.resume(gameManager.bgMusicChannel);
					}
				}
				if (res && res.isEnded || res === undefined) {//播放结束获取奖励
					// console.log('正常播放广告关闭视频广告');
					gameManager.curScene && gameManager.curScene.GetReward(0);
				}
				else {
					// 播放中途退出，不下发游戏奖励
					console.log('中途退出');
				}
			}.bind(this));
		}
	},
	ShowVideo: function () {
		if (cc.sys.platform !== cc.sys.WECHAT_GAME) {//便于浏览器测试 直接获取到奖励
			if (gameManager.curScene) { gameManager.curScene.GetReward(1); gameManager.curScene.videoFailRemind.active = true; }
			return;
		}
		let that = this;
		if (gameManager.channel == "wx" || gameManager.channel == "qq" || gameManager.channel == "tt") {
			if (gameManager.channel == "wx") {
				if (!this.isCanShowVideo()) {
					gameManager.curScene && gameManager.curScene.GetReward(1);//假解锁
					//自动解锁
					return;
				}
			}
			if (this.videoAd == null) {//播放不成功  显示弹窗

				console.log('视频广告为空，重新加载')

				this.InitVideo();//重新获取视频广告

				if (gameManager.curScene) {
					gameManager.curScene.videoFailRemind.active = true;
				}

				if (gameManager.isHasAd && gameManager.isShowBanner == false) {
					gameManager.adsManager.ShowBanner(-1);
				}
				// this.InitVideo();
				return;
			}
			this.videoAd.show()
				.then(() => {
					console.log('广告显示成功');
				})
				.catch(err => {
					console.log('广告组件出现问题', err);
					if (gameManager.curScene) {
						// gameManager.curScene.GetReward(0);
						gameManager.curScene.videoFailRemind.active = true;
					}

					if (gameManager.isHasAd && gameManager.isShowBanner == false) {//&& gameManager.bannerFlag
						gameManager.adsManager.ShowBanner(-1);
					}
					// 可以手动加载一次
					that.videoAd.load()
						.then(() => {
							console.log('手动加载成功');
						});
				});
		}

	}
    // update (dt) {},
});
