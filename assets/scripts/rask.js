var gameManager = require('GameManager');

cc.Class({
	extends: cc.Component,

	properties: {

	},

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {},

	start() {

	},
	addRaskItem: function () { //每天更新一次任务   任务未完成  已完成  判断全部完成才能获取到奖励
		this.node.getChildByName('coinnum').getChildByName('coinNum').getComponent(cc.Label).string = gameManager.playerData.coins;
		this.node.active = true;
		let raskData = gameManager.GetRaskData()
		if (raskData == undefined || raskData == null || !gameManager.checkIsToday(raskData.time)) { //需要重新生成任务表单
			if (raskData) gameManager.raskData = raskData;
			gameManager.raskData.time = gameManager.GetTodayTime();
			let tempnumlist = gameManager.getRunum(gameManager.raskAllList.length); //获取到一个有三位数的数组
			for (let i = 0; i < tempnumlist.length; i++) { //固定死了就只能选三个出来
				gameManager.raskData.raskList[i].index = tempnumlist[i];
				gameManager.raskData.raskList[i].state = false; //默认false
				let node = this.node.getChildByName('raskNode').children[i];
				node.getChildByName('rask').getComponent(cc.Label).string = gameManager.raskAllList[tempnumlist[i]].title;
				node.getChildByName('go').getComponent(cc.Button).clickEvents[0].customEventData = gameManager.raskAllList[tempnumlist[i]].go;
			}

			gameManager.SetRaskData(gameManager.raskData);
		} else { //有数据缓存且不是今天  
			gameManager.raskData = gameManager.GetRaskData();
			for (let i = 0; i < 3; i++) {
				let node = this.node.getChildByName('raskNode').children[i];
				node.getChildByName('rask').getComponent(cc.Label).string = gameManager.raskAllList[gameManager.raskData.raskList[i].index].title;
				node.getChildByName('go').getComponent(cc.Button).clickEvents[0].customEventData = gameManager.raskAllList[gameManager.raskData.raskList[i].index].go;
				if (gameManager.raskData.raskList[i].state == true) {
					node.getChildByName('ok').active = true;
					node.getChildByName('go').active = false;
				}
			}
			//如果已经领取过了
			let node = this.node.getChildByName('raskNode').getChildByName('getdouble');
			if (raskData.single == 1) {
				node.children[0].color = new cc.Color(222, 222, 222);
				node.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据
			}
			node = this.node.getChildByName('raskNode').getChildByName('get');
			if (raskData.double == 1) {
				node.children[0].color = new cc.Color(222, 222, 222);
				node.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据
			}
		}
	},
	//前往按钮
	goAhead: function (e, flag) { //// 0 签到  1 商城  2 进入游戏  3 视频 4 衣橱  5 打工 6 许愿池
		if (flag == undefined || flag == null) return;
		this.node.active = false;
		let str = null;
		switch (flag) { //还有观看广告和获得服饰没有加
			case 0:
				this.clickSign(); //开启签到弹窗
				str = '签到';
				break;
			case 1: //商城
				str = '商城';
				gameManager.curScene.clickShop(null, 0);
				break;
			case 2: //进入游戏场景---区分当前场景
				str = '进入游戏';
				if (gameManager.curScene == 0)
					gameManager.curScene.GoNextScene();
				break;
			case 3: //查看视频
				str = '看视屏';

				break;
			case 4: //进入衣橱
				str = '衣柜';
				if (gameManager.curScene == 0) {
					gameManager.curScene.clickClothBox(null, 0);
				} else gameManager.curScene.goBack(); //如果是第二场景进入角色保存界面打开衣柜
				break;
			case 5: //打工
				str = '打工';
				break;
			case 6: //许愿池
				str = '许愿池';

				break;
			default:
				break;
		}
		console.log('前往' + flag, str);
	},
	getRask: function (e, flag) {
		if (!gameManager.raskData.isOver) return; //未完成所有任务无法领取
		if (flag == 0) { //普通领取
			//直接领取两百金币
			gameManager.raskData.single = 1;
			gameManager.updatePlayerCoins(gameManager.raskData.coin);
		} else if (flag == 1) { //双倍领取
			gameManager.raskData.double = 1;
			gameManager.updatePlayerCoins(gameManager.raskData.coin * 2);
		}
		this.node.getChildByName('coinnum').getChildByName('coinNum').getComponent(cc.Label).string = gameManager.playerData.coins;

		let node = e.target;
		node.children[0].color = new cc.Color(222, 222, 222);
		node.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据

		gameManager.SetRaskData(gameManager.raskData);
	},
	clickRask: function (e, flag) { //生成任务：十个选三个 完成三个才能获取到奖励
		if (flag == 0) {
			this.addRaskItem();
		} else if (flag == 1) {
			this.node.active = false;
		}
	},
	// update (dt) {},
});