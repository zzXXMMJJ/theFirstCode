var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: {
		progressbar: cc.ProgressBar,
		star: cc.Node,
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		if (cc.sys.platform == cc.sys.DESKTOP_BROWSER) {
			this.loadFinish = true;
		}
		if (cc.sys.platform != cc.sys.DESKTOP_BROWSER && (gameManager.channel == 'wx' || gameManager.channel == 'qq')) {
			if (gameManager.channel == 'wx') {
				this.loadSub() //分包加载--第二个分包
			}
			this.loadSub() //分包加载---第一个分包
		}
		gameManager.loadJson(); //加载json
		gameManager.loadFromRemote();
		if (gameManager.GetPlayerData()) {
			gameManager.playerData = gameManager.GetPlayerData();
		} 
	},

	start() {
		this.progressbar.progress = 0;
		// this.list = gameManager.cratelist();
		this.nextToSCene();
		let curTime = new Date();
		// console.log('时间：' + curTime);
	},
	loadSub: function (name) {
		let self = this;
		//加载分包:分包内不能含当前场景的资源
		if (gameManager.channel == 'wx' || gameManager.channel == 'qq' && cc.sys.platform !== cc.sys.DESKTOP_BROWSER) {
			//加载第一个分包
			cc.loader.downloader.loadSubpackage(name.toString(), function (err) {
				if (err) {
					console.log('加载第一个分包失败:' + err);
					return;
				}
				self.loadFinish = true;
				console.log('第一个分包加载成功');
			});
		}
	},
	nextToSCene: function () {
		if (gameManager.finish1 && gameManager.finish2 && gameManager.finish3 && gameManager.loadFinish) {

			let tmp = 1 - this.progressbar.progress;
			let a = Math.round(tmp / 0.01);

			this.schedule(function () {
				this.progressbar.progress += 0.01;

				let x = (453 * tmp) / a;
				this.star.runAction(cc.moveBy((0.5 / a), cc.v2(x, 0)));

			}, (0.5 / a), a); //间隔时间  次数

			setTimeout(() => {
				cc.director.loadScene('mainmenu');
			}, 550);
			return;
		}
		if (this.progressbar.progress < 0.9) {
			this.progressbar.progress += 0.01;
			let x = 453 / 100; //-226
			this.star.runAction(cc.moveBy((0.5 / 100), cc.v2(x, 0)));
		}

		this.scheduleOnce(function () {
			this.nextToSCene()
		}, 0.1);
	}
	// update (dt) {},
});