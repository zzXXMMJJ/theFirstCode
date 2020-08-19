var gameManager=require('GameManager');

cc.Class({
    extends: cc.Component,

    properties: {
		//弹窗的父节点    签到
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
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

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

		this.node.active = true;
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
		// this.coinLabel.string = gameManager.playerData.coins;
		//更新签到
		this.node.getChildByName('coinnum').getChildByName('coinNum').getComponent(cc.Label).string = gameManager.playerData.coins;

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
		this.node.active = false;
	},
    // update (dt) {},
});
