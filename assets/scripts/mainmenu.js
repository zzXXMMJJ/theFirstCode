var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: {
		tipSuccess: cc.Node, //提示购买成功
		signNode: {
			default: null,
			type: cc.Node
		}, //弹窗的父节点    签到
		signContent: {
			default: null,
			type: cc.Node
		},
		signPrefabfirst: {
			default: null,
			type: cc.Prefab
		}, //签到的前6天
		signPrefabsecond: {
			default: null,
			type: cc.Prefab
		}, //签到的第七天
		dressPre: {
			default: null,
			type: cc.Prefab
		}, //签到套装显示
		singleget: {
			default: null,
			type: cc.Node
		},
		doubelget: {
			default: null,
			type: cc.Node
		},
		//UI
		shopNode: {
			default: null,
			type: cc.Node
		}, //商店
		wishingNode: {
			default: null,
			type: cc.Node
		}, //许愿池
		raskNode: {
			default: null,
			type: cc.Node
		}, //任务池
		clothBoxNode: {
			default: null,
			type: cc.Node
		}, //衣柜
		clothBoxSingleContent: {
			default: null,
			type: cc.Node
		},
		clothNext: {
			default: null,
			type: cc.Node
		},
		clothtip:{
			default:null,
			type:cc.Node
		},
		titleContent: { //节点父节点
			default: null,
			type: cc.Node
		},
		settingNode: {
			default: null,
			type: cc.Node
		},
		//金币
		coinLabel: {
			default: null,
			type: cc.Label
		},
		coinode: { //商店的金币
			default: null,
			type: cc.Label
		},
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		gameManager.curScene = this;

		// 游戏进入后台时触发
		cc.game.on(cc.game.EVENT_HIDE, function () {
			if (gameManager.bgMusicChannel != undefined && !gameManager.isCloseMusic) {
				cc.audioEngine.pause(gameManager.bgMusicChannel);
				console.log("切后台暂停音效");
			}
		}.bind(this));
		// 游戏进入前台时触发
		cc.game.on(cc.game.EVENT_SHOW, function () {
			if (gameManager.bgMusicChannel != undefined && !gameManager.isCloseMusic) {
				cc.audioEngine.resume(gameManager.bgMusicChannel);
			}
		}.bind(this));

		this.titleType = 0;
		this.level = 0;
		this.addRaskItem();
		// this.signList = [30, 50, 100, 150, 200, 250, 200];//签到的金币数量  默认第七天领取一个套装

		this.tempCoinnum = 0;
		//初始化界面
		this.coinLabel.string = gameManager.playerData.coins;

		//选取套装 总池  选出来的套装池  从总池排除掉选出来的套装 随机获取其中  
		gameManager.allToPartList();
		gameManager.ishad();
	},
	start() {
		// this.shopNode.getComponent('shop').checkAlbum(null, 0);

		if (!gameManager.isCloseMusic) { //音效是开着的
			if (gameManager.bgMusicChannel == undefined) { //没有播放
				//播放音效
				gameManager.bgMusicChannel = cc.audioEngine.play(gameManager.bgMusic, true, 0.5);
			}
			this.settingNode.children[0].active = true; //播放
			this.settingNode.children[1].active = false;
		} else {
			this.settingNode.children[0].active = false; //播放
			this.settingNode.children[1].active = true;
		}
	},
	clickCoinNo: function (e, flag) {
		if (flag) { //观看视频广告

		}
		cc.find('Canvas/tipcoinvedio').active = false;
	},
	clickCoinOk: function (e, flag) {
		if (flag) { //观看视频广告

		}
		cc.find('Canvas/tipSuccess').active = false;
	},
	onDestroy() {
		gameManager.curScene = null;
	},
	//重写签到
	addSignItem: function () { //添加界面UI  第七套
		// 天数  金币数  套装样式
		for (let i = 0; i < 8; i++) { //有八个子节点
			let node = null;
			if (i < 7) {
				if (i == 6) {
					node = cc.instantiate(this.signPrefabsecond);
				} else {
					node = cc.instantiate(this.signPrefabfirst);
				}
				if (!node) {
					console.log('节点不存在' + node);
					return
				};
				node.active = true;
				node.parent = this.signContent;
				let noNode = node.getChildByName('no');
				let okNode = node.getChildByName('ok');
				noNode.getChildByName('day').getComponent(cc.Label).string = i + 1;
				noNode.getChildByName('coin').getChildByName('num').getComponent(cc.Label).string = gameManager.signAllList[i].coin;
				okNode.getChildByName('day').getComponent(cc.Label).string = i + 1;
				okNode.getChildByName('coin').getChildByName('num').getComponent(cc.Label).string = gameManager.signAllList[i].coin;
				if (this.signFlag - 1 < i) {
					noNode.active = true;
					okNode.active = false;
				} else {
					noNode.active = false;
					okNode.active = true;
				}
			} else { //qunzi
				node = cc.instantiate(this.dressPre);
				node.active = true;
				node.parent = this.signContent;

				let tmplist = gameManager.signData.picIndex >= 0 ? gameManager.signSuitHash.messageList[gameManager.signData.picIndex] : null;
				if (!tmplist) return console.log('没有签到套装需要加载');
				if (tmplist.pic) {
					node.getChildByName('cloth').getComponent(cc.Sprite).spriteFrame = tmplist.pic
				} else {
					let str = ObjectNume.httpUrl + gameManager.getUrl(tmplist.classifyIndex, tmplist.index);
					cc.loader.load(str, (err, res) => {
						if (err) return console.log('加载签到图片失败' + err);
						node.getChildByName('cloth').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
						//存入数据库
						tmplist.pic = new cc.SpriteFrame(res);
						//更新总库
						gameManager.updateListData(tmplist.classifyIndex, tmplist.index, tmplist);
					})
				}
			}
		}
		// }
	},
	clickSign: function () { //打开签到弹窗
		if (gameManager.GetSignData()) {
			gameManager.signData = gameManager.GetSignData()
		} else {
			gameManager.signData = gameManager.signData;
		}
		console.log("签到数据显示：");
		this.signFlag = gameManager.signData.dayIndex == undefined ? 0 : gameManager.signData.dayIndex;
		console.log("确认之前有签到数据：" + gameManager.signData, this.signFlag);
		if (this.signContent.childrenCount > 0) { //如果每次都生成的话 直接暴力清除之前的节点
			for (let i = 0; i < this.signContent.childrenCount; i++) {
				this.signContent.children[i].destroy();
			}
		}
		if (gameManager.signData.time) { //初始化
			if (gameManager.checkIsToday(gameManager.signData.time)) { //如果是今天
				if (gameManager.signData.single == 1) {
					this.singleget.children[0].color = new cc.Color(222, 222, 222);
					this.singleget.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据
				}
				if (gameManager.signData.double == 1) {
					this.doubelget.children[0].color = new cc.Color(222, 222, 222);
					this.doubelget.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据
				}
			} else { //不是今天的话
				if (this.signFlag == 7) { //第八天

					this.signFlag = 0;
					//重新获取套装
					gameManager.signData.picIndex = this.getSignSuitIndex();
				}

				gameManager.signData.single = 0;
				gameManager.signData.double = 0;
				// this.singleget.children[0].color = new cc.Color(255, 255, 255); //测试
				// this.singleget.getComponent(cc.Button).interactable = true;
				// this.doubelget.children[0].color = new cc.Color(255, 255, 255);
				// this.doubelget.getComponent(cc.Button).interactable = true;
			}
		} else {
			if (gameManager.signData.picIndex == undefined) { //在开始还没有数据
				gameManager.signData.picIndex = this.getSignSuitIndex();
			}
		}
		this.addSignItem();

		this.signNode.active = true;
	},
	getSignSuitIndex: function () { //获取到随机套装的索引
		// gameManager.signSuitHash
		if (gameManager.signSuitHash.messageList.length > 0) {
			let tmpList = new Array();
			for (let i = 0; i < gameManager.signSuitHash.messageList.length; i++) {
				if (gameManager.signSuitHash.messageList[i].isOver == 0) { //为拥有
					tmpList.push(gameManager.signSuitHash.messageList[i]);
				}
			}

			let num = Math.floor(Math.round() * tmpList.length);
			for (let i = 0; i < gameManager.signSuitHash.messageList.length; i++) {
				for (let j = 0; j < tmpList.length; j++) {
					if (tmpList[j].index == gameManager.signSuitHash.messageList[i].index) {
						return i;
					}
				}
			}
		} else {
			console.log('签到套装索引获取失败 getSignSuitIndex');
			return -1;
		}
	},
	checkTime: function (flag) { //判断是否可以领取签到 领取签到时间 并注册进去
		let todayTime = gameManager.GetTodayTime();
		if (gameManager.signData.time && gameManager.signData.dayIndex >= 0) {
			let isCanGetReward = gameManager.checkIsToday(gameManager.signData.time);
			if (!isCanGetReward) { //可以领取 
				//判断是否大于七天
				//获取奖励处理
				let num = this.signFlag - 1;
				if (gameManager.signData.single !== 1 || gameManager.signData.double !== 1) {
					this.signContent.children[this.signFlag].getChildByName('ok').active = true;
					num = this.signFlag;
				}
				if (flag == 0) {
					gameManager.updatePlayerCoins(gameManager.signAllList[num].coin); //更新玩家金币
				} else if (flag == 1) {
					gameManager.updatePlayerCoins(gameManager.signAllList[num].coin * 2); //更新玩家金币
				}
				if (this.signFlag == 6) { //第七天获取套装作为奖励
					// console.log('第七天获取奖励');
					gameManager.signSuitHash.messageList[gameManager.signData.picIndex].isOver = 1;
					//添加到已拥有  单品添加到对应
					let list = gameManager.signSuitHash.messageList[gameManager.signData.picIndex];

					let tmpmsgindex = gameManager.getAllHashIndex(list.classifyIndex, list.index);
					gameManager.allItemHash[list.classifyIndex].messageList[tmpmsgindex].isOver = 1;
					gameManager.addTohadList(list.classifyIndex, list.index);
					list = list.list;
					for (let i = 0; i < list.length; i++) {
						list[i].isOver = 1;
						let tmpmsgindex = gameManager.getAllHashIndex(list[i].classifyIndex, list[i].index);
						gameManager.allItemHash[list[i].classifyIndex].messageList[tmpmsgindex].isOver = 1;
						gameManager.addTohadList(list[i].classifyIndex, list[i].index);
					}
					//暴力重新分组
					gameManager.allToPartList(1);
				}
				if (gameManager.signData.single !== 1 || gameManager.signData.double !== 1) {
					if (this.signFlag < 7) gameManager.signData.dayIndex = ++this.signFlag;
					gameManager.signData.time = todayTime;
				}
				console.log('sajdfa ling qu signflag:' + this.signFlag);
				//第七天获取套装作为奖励
			} else { //是当天 
				if (gameManager.signData.single == 1 && gameManager.signData.double == 1) {
					if (flag == 0) {
						gameManager.updatePlayerCoins(gameManager.signAllList[this.signFlag - 1].coin); //更新玩家金币
					} else if (flag == 1) {
						gameManager.updatePlayerCoins(gameManager.signAllList[this.signFlag - 1].coin * 2); //更新玩家金币
					}
				}
				console.log('saffasdf  wu fa ling  qu ' + flag);
			}
		} else { //之前没有存过  确定当前日期为第一天   可以领取
			//获取奖励处理
			this.signContent.children[0].getChildByName('ok').active = true;

			if (flag == 0) {
				gameManager.updatePlayerCoins(gameManager.signAllList[this.signFlag].coin); //更新玩家金币
			} else if (flag == 1) {
				gameManager.updatePlayerCoins(gameManager.signAllList[this.signFlag].coin * 2); //更新玩家金币
			}
			if (gameManager.signData.single !== 1 || gameManager.signData.double !== 1) {
				gameManager.signData.time = todayTime;
				gameManager.signData.dayIndex = ++this.signFlag;
			}
			console.log('ling qu');
		}
		this.coinLabel.string = gameManager.playerData.coins;
		//更新签到
		this.signNode.getChildByName('coinnum').getChildByName('coinNum').getComponent(cc.Label).string = gameManager.playerData.coins;

		gameManager.SetSignData(gameManager.signData);
	},
	signGet: function (e, flag) { //普通领取  看视频双倍领取  领取之后应该有提示无法再领取或者把按钮置灰
		let node = e.target;
		if (flag == 0) { //普通领取
			gameManager.signData.single = 1;
			// this.checkTime();
		} else if (flag == 1) { //看视频双倍领取:是否有次数限制 
			// gameManager.updatePlayerCoins(this.tempCoinnum * 2); //如果在签到的当时没有看视频双倍领取  后面还可以吗  领取后按钮是否需要变动（或其他提示）
			// this.tempCoinnum = 0;
			// this.coinLabel.string = gameManager.playerData.coins;
			gameManager.signData.double = 1;
			// gameManager.SetSignData(gameManager.signData); //看完视频再存
		}
		this.checkTime(flag);
		node.children[0].color = new cc.Color(222, 222, 222);
		node.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据
		//有领取就算成功了吧
		gameManager.checkFinishOneRask(0);
	},
	//签到 许愿池  商城  打工系统
	signColse: function () {
		this.signNode.active = false;
	},
	//商店  shop:推荐、套装、组合 金币显示  设置
	addShopItem: function () { //需要重新

	},
	addRaskItem: function () { //每天更新一次任务   任务未完成  已完成  判断全部完成才能获取到奖励
		let raskData = gameManager.GetRaskData()
		if (raskData == undefined || raskData == null || !gameManager.checkIsToday(raskData.time)) { //需要重新生成任务表单
			if (raskData) gameManager.raskData = raskData;
			gameManager.raskData.time = gameManager.GetTodayTime();
			let tempnumlist = gameManager.getRunum(gameManager.raskAllList.length); //获取到一个有三位数的数组
			for (let i = 0; i < tempnumlist.length; i++) { //固定死了就只能选三个出来
				gameManager.raskData.raskList[i].index = tempnumlist[i];
				gameManager.raskData.raskList[i].state = false; //默认false
				let node = this.raskNode.getChildByName('raskNode').children[i];
				node.getChildByName('rask').getComponent(cc.Label).string = gameManager.raskAllList[tempnumlist[i]].title;
				node.getChildByName('go').getComponent(cc.Button).clickEvents[0].customEventData = gameManager.raskAllList[tempnumlist[i]].go;
			}

			gameManager.SetRaskData(gameManager.raskData);
		} else { //有数据缓存且不是今天  
			gameManager.raskData = gameManager.GetRaskData();
			for (let i = 0; i < 3; i++) {
				let node = this.raskNode.getChildByName('raskNode').children[i];
				node.getChildByName('rask').getComponent(cc.Label).string = gameManager.raskAllList[gameManager.raskData.raskList[i].index].title;
				node.getChildByName('go').getComponent(cc.Button).clickEvents[0].customEventData = gameManager.raskAllList[gameManager.raskData.raskList[i].index].go;
				if (gameManager.raskData.raskList[i].state == true) {
					node.getChildByName('ok').active = true;
					node.getChildByName('go').active = false;
				}
			}
			//如果已经领取过了
			let node = this.raskNode.getChildByName('raskNode').getChildByName('getdouble');
			if (raskData.single == 1) {
				node.children[0].color = new cc.Color(222, 222, 222);
				node.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据
			}
			node = this.raskNode.getChildByName('raskNode').getChildByName('get');
			if (raskData.double == 1) {
				node.children[0].color = new cc.Color(222, 222, 222);
				node.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据
			}
		}
	},
	goAhead: function (e, flag) { //// 0 签到  1 商城  2 进入游戏  3 视频 4 衣橱  5 打工 6 许愿池
		if (flag == undefined || flag == null) return;
		this.raskNode.active = false;
		let str = null;
		switch (flag) { //还有观看广告和获得服饰没有加
			case 0:
				this.clickSign(); //开启签到弹窗
				str = '签到';
				break;
			case 1: //商城
				str = '商城';
				this.clickShop(null, 0);
				break;
			case 2: //进入游戏场景
				str = '进入游戏';
				this.GoNextScene();
				break;
			case 3: //查看视频
				str = '看视屏';

				break;
			case 4: //进入衣橱
				str = '衣柜';
				this.clickClothBox(null, 0);
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
		this.raskNode.getChildByName('coinnum').getChildByName('coinNum').getComponent(cc.Label).string = gameManager.playerData.coins;

		let node = e.target;
		node.children[0].color = new cc.Color(222, 222, 222);
		node.getComponent(cc.Button).interactable = false; //领取结束后禁用该数据

		gameManager.SetRaskData(gameManager.raskData);
	},
	//UI
	clickShop: function (e, flag) { //生成商店：推荐  套装   组合
		if (flag == 0) { //开启弹窗
			this.shopNode.active = true;
			//初始化界面 
			let coinode = this.shopNode.getChildByName('bg').getChildByName('coinnum').getChildByName('numbg').getChildByName('coinNum').getComponent(cc.Label);
			coinode.string = gameManager.playerData.coins;
		} else if (flag == 1) { //关闭弹窗
			this.shopNode.active = false;
			gameManager.checkFinishOneRask(3);
		}
	},
	clickWishing: function (e, flag) { //生成许愿池：
		if (flag == 0) {
			this.wishingNode.active = true;
		} else if (flag == 1) {
			this.wishingNode.active = false;
		}
	},
	clickRask: function (e, flag) { //生成任务：十个选三个 完成三个才能获取到奖励
		if (flag == 0) {
			this.addRaskItem();
			this.raskNode.getChildByName('coinnum').getChildByName('coinNum').getComponent(cc.Label).string = gameManager.playerData.coins;
			this.raskNode.active = true;
		} else if (flag == 1) {
			this.raskNode.active = false;
		}
	},
	clickClothBox: function (e, flag) {
		if (flag == 0) {
			this.clothBoxNode.active = true;
			//需要调用套装生成
		} else if (flag == 1) {
			this.clothBoxNode.active = false;
			gameManager.checkFinishOneRask(6);
		}
	},
	coinAdd: function () { //完成签到  完成每日任务  看广告  
		//看视频直接获取金币
		// gameManager.adsManager.ShowVideo();
		console.log('看视频获得金币'); //应该需要
	},
	GoNextScene: function () { //进入下一场景
		//将数据保存到
		gameManager.SetPlayerData(gameManager.playerData);
		cc.director.loadScene('game');
	},
	clickSetting: function (e) { //音乐开关
		if (gameManager.isCloseMusic) { //音乐已关闭 执行打开音乐
			if (gameManager.bgMusicChannel == undefined) {
				//播放音效
				gameManager.bgMusicChannel = cc.audioEngine.play(gameManager.bgMusic, true, 0.5)
			}
			gameManager.isCloseMusic = false;
			e.target.children[1].active = false;
			e.target.children[0].active = true;
			gameManager.SetMusicFlag(0);
		} else { //音乐已打开 执行关闭音乐
			if (gameManager.bgMusicChannel !== undefined) {
				cc.audioEngine.stop(gameManager.bgMusicChannel);
				gameManager.bgMusicChannel = undefined;
			}
			gameManager.isCloseMusic = true;
			e.target.children[1].active = true;
			e.target.children[0].active = false;
			gameManager.SetMusicFlag(1);
		}
		// if (flag == 0) {//滚动进度条
		// 	this.settingNode.active = true;
		// } else if (flag == 1) {
		// 	this.settingNode.active = false;
		// }
	},
	update(dt) {
		
	},
});