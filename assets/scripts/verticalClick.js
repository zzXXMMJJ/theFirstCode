var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: { //横向滚动条：角色滚动条、

	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
	},

	start() {

	},
	initIconFun: function (index, msg, allList, type) { //套装   角色
		this.index = index;
		this.allList = allList;
		this.msgList = msg;
		this.type = type;
		if (type == 0) { //角色  不能用截图
			let role = this.node.getChildByName('pic').getChildByName('person').getChildByName('body');

			for (let i = 0; i < gameManager.curScene.tmpRoleListLength; i++) { //gameManager.allItemHash   总库//20
				let str = gameManager.classifyNameList[i]; // 
				let tmpindex = msg[gameManager.classifyNameList[i]].index;
				let active = msg[gameManager.classifyNameList[i]].active;
				//是-1直接进入下一个 
				if (i == 0) { //肤色:色值
					role.getChildByName('hands').active = active;
					if (tmpindex >= 0) {
						let tmpmsgindex = gameManager.getAllHashIndex(i, tmpindex);
						let colorstr = '#' + gameManager.allItemHash[i].messageList[tmpmsgindex].color;
						role.getChildByName('hands').color = role.getChildByName('body').color.fromHEX(colorstr);
						role.getChildByName('body').color = role.getChildByName('body').color.fromHEX(colorstr);
					}
				} else if (i == 5) { //头发：前发、后发
					role.getChildByName('hairback').active = active;
					role.getChildByName('hairfont').active = true;
					if (tmpindex >= 0) {
						let tmpmsgindex = gameManager.getAllHashIndex(i, tmpindex);
						gameManager.LoadImage(i, tmpmsgindex, role.getChildByName('hairfont'), gameManager.allItemHash[i].messageList[tmpmsgindex]); //图片：如果没有的话从服务器加载					
						if (gameManager.allItemHash[i].messageList[tmpmsgindex].list) //如果有后发的话
							gameManager.LoadImage(i, tmpmsgindex, role.getChildByName('hairback'), gameManager.allItemHash[i].messageList[tmpmsgindex].list);
					}
				} else {
					// role.getChildByName('hairfont').getComponent(cc.Sprite).spriteFrame = gameManager.allItemHash[i].messageList[index].pic;
					if (tmpindex >= 0) {
						let tmpmsgindex = gameManager.getAllHashIndex(i, tmpindex);
						gameManager.LoadImage(i, tmpmsgindex, role.getChildByName(str), gameManager.allItemHash[i].messageList[tmpmsgindex]);
					}
					role.getChildByName(str).active = active;
				}
			}
		} else if (type == 1) { //套装
			let tmpmsgindex = gameManager.getAllHashIndex(msg.classifyIndex, msg.index);
			gameManager.LoadImage(msg.classifyIndex, tmpmsgindex, this.node.getChildByName('pic'), gameManager.allSuitHash.messageList[tmpmsgindex]);
			//套装 点击效果 已拥有 需要给人物穿上套装  未拥有 显示推荐弹窗
		}
	},
	onTouchStart: function (touch) {
		let pos = touch.touch.getLocation();
	},
	onTouchMove: function (touch) {
		let pos = touch.touch.getLocation();
	},
	onTouchEnd: function (touch) {
		let pos = touch.touch.getLocation();
		if (this.type == 0) { //角色
			//点击穿上装扮 提示是否保存----编辑

		} else if (this.type == 1) { //套装
			//已拥有(点击穿上装扮 提示是否保存) 、未拥有（提示推荐弹窗）
			for (let i = 0; i < this.node.parent.childrenCount; i++) {
				if (this.node.parent.children[i].active && this.node.parent.children[i].getComponent('verticalClick').index == this.index) {
					if (this.msgList.isOver == 1) {
						//将服饰转换成角色列表----跟衣柜的套装一样
						if (gameManager.curScene.person.active == false) {
							this.tmpRoleList = {};
							for (let i = 0; i < gameManager.curScene.tmpRoleListLength; i++) {
								let obj = {
									'index': -1,
									'active': true
								};
								this.tmpRoleList[gameManager.classifyNameList[i]] = obj;
							}
							gameManager.curScene.addDefaultPerson();
						} else {
							this.tmpRoleList = gameManager.curScene.tmpRoleList;
						}
						if (this.msgList.list && this.msgList.list.length > 0) {
							let list = this.msgList.list;
							for (let i = 0; i < list.length; i++) {
								this.tmpRoleList[gameManager.classifyNameList[list[i].classifyIndex]].index = list[i].index;
								//外套 头发
								if (list[i].classifyIndex == 5) {
									if (list[i].list) { //有后发
										this.tmpRoleList[gameManager.classifyNameList[list[i].classifyIndex]].active = true;
									} else {
										this.tmpRoleList[gameManager.classifyNameList[list[i].classifyIndex]].active = false;
									}
								} else if (list[i].classifyIndex == 10) { //手存到肤色里
									this.tmpRoleList[gameManager.classifyNameList[0]].active = gameManager.checkCoatIndex(list[i].index);
								}
							}
						}
						//
						gameManager.curScene.tmpRoleList = this.tmpRoleList;
						this.tmpRoleList = null;
						gameManager.curScene.addClothForPerson();
						gameManager.curScene.ischeckChange = true;
					} else { //未拥有
						let node = gameManager.curScene.recommendNode;
						let msgindex = this.getIndex(this.msgList.index, this.allList);
						node.getChildByName('pic').getComponent(cc.Sprite).spriteFrame = this.allList[msgindex].pic;
						// node.getChildByName('pic').scale = gameManager.getScaleNum(node, node.parent.width, node.parent.height)
						console.log(this.msgList.list.length); //5  6
						let node_up = node.getChildByName('up');
						let node_down = node.getChildByName('down');
						let length = this.msgList.list.length >= 6 ? 6 : this.msgList.list.length;
						for (let k = 0; k < length; k++) { //可以显示八个  最只显示6个  可能显示5、6个icon
							if (k < 4) {
								let tmplist = this.allList[msgindex].list[k]; //前四个
								gameManager.LoadIconImage(tmplist.classifyIndex, tmplist.index, node_up.children[k].getChildByName('pic'), tmplist);
							} else {
								if (length < 6) {
									node_down.children[1].active = false; //显示五个
								} else node_down.children[1].active = true; //显示6个
								let tmplist = this.allList[msgindex].list[k];
								gameManager.LoadIconImage(tmplist.classifyIndex, tmplist.index, node_down.children[k - 4].getChildByName('pic'), tmplist);
							}
						}
						//如果不是商店中的
						if (this.allList[msgindex].point == 0) {
							node.getChildByName('get').active = true;
							if (this.msgList.isDiscount > 0) {
								node.getChildByName('get').getChildByName('discount').active = true;
								node.getChildByName('get').getChildByName('discount').getComponent(cc.Label).string = this.msgList.coin;
							} else {
								node.getChildByName('get').getChildByName('discount').active = false;
							}
							node.getChildByName('get').getChildByName('coin').getComponent(cc.Label).string = this.msgList.isDiscount <= 0 ? this.msgList.coin : Math.round(this.msgList.coin * this.msgList.isDiscount);

							//按钮事件	//添加按钮事件
							let clickEventHandler = new cc.Component.EventHandler();
							clickEventHandler.target = this.node;
							clickEventHandler.component = "verticalClick";
							clickEventHandler.handler = "getFun";
							clickEventHandler.customEventData = msgindex;
							node.getChildByName('get').getComponent(cc.Button).clickEvents.push(clickEventHandler);
						} else { //限定  无法购买
							node.getChildByName('get').active = false;
						}

						node.active = true;
					}
				}
			}
		}
	},
	getFun: function (e, index) { //购买按钮 套装组合
		let node = gameManager.curScene.recommendNode;
		let coin = this.allList[index].isDiscount >= 0 ? Math.round(this.allList[index].coin * this.allList[index].isDiscount) : this.allList[index].coin;
		if (gameManager.updatePlayerCoins(-coin)) {
			//购买成功:东西要放入对应数据列表：allItemHash  shopGroupHash recommendHash  showSingleHash  haveHash---有一个提示弹窗
			console.log('购买成功' + coin, this.msgList.name);

			this.allList[index].isOver = 1; //套装及单品都放入已拥有
			if (this.allList[index].list) {
				for (let k = 0; k < this.allList[index].list.length; k++) {
					this.allList[index].list[k].isOver = 1;
				}
			}
			//更新总库
			this.updateShopdata();

			//更新界面显示的金币
			gameManager.curScene.coinLabel.string = gameManager.playerData.coins;

			//界面变成已购买
			node.getChildByName('get').active = false;
			node.getChildByName('ok').active = true; //显示已拥有
			//弹出提示购买成功界面
			console.log('zenme会刷新所有:' + index)
		} else {
			console.log('金币不足 购买失败' + coin, this.msgList.name)
		}
	},
	//套装组合购买后总库的数据更新:只限套装和组合
	updateShopdata: function () {
		let tmpmsgindex = gameManager.getAllHashIndex(this.msgList.classifyIndex, this.msgList.index);
		gameManager.allItemHash[this.msgList.classifyIndex].messageList[tmpmsgindex].isOver = 1;
		gameManager.addTohadList(this.msgList.classifyIndex, this.msgList.index);
		let list = gameManager.allItemHash[this.msgList.classifyIndex].messageList[tmpmsgindex].list;
		if (list.length > 0)
			for (let i = 0; i < list.length; i++) {
				list[i].isOver = 1;
				gameManager.addTohadList(list[i].classifyIndex, list[i].index);
			}

		gameManager.allToPartList(1); //重新分组
		//提示是否前往衣橱查看
	},
	getIndex: function (index, list) {
		for (let i = 0; i < list.length; i++) {
			if (list[i].index == index) {
				return i;
			}
		}
	},
	delBtnFun: function (e, flag) { //删除
		for (let i = 0; i < this.node.parent.childrenCount; i++) {
			if (this.node.parent.children[i].active && this.node.parent.children[i].getComponent('verticalClick').index == this.index) {
				gameManager.playerData.roleList.splice(i, 1);
			}
		}
		this.node.parent.getComponent('verticalRamark').loadData(gameManager.playerData.roleList);
	},
	drawBtnFun: function (e, flag) { //编辑:给人物换上衣服  //点击完编辑  未保存 列表里都会发生改变

		for (let i = 0; i < this.node.parent.childrenCount; i++) {
			if (this.node.parent.children[i].active && this.node.parent.children[i].getComponent('verticalClick').index == this.index) {

				gameManager.curScene.tmpRoleList = this.copyObj(gameManager.playerData.roleList[i]);

				gameManager.curScene.checkChangeIndex = i; //当前正在修改哪一个角色 如果保存 插入到角色数据中
				//需要把所有子节点全部复制过去
				gameManager.curScene.person.active = true;
				let role = this.node.parent.children[i].getChildByName('pic').getChildByName('person').getChildByName('body');
				let body = gameManager.curScene.person.getChildByName('body');
				for (let m = 0; m < role.childrenCount; m++) {
					if (role.children[m].name == 'body' || role.children[m].name == 'hands') {
						body.children[m].color = role.children[m].color;
						body.children[m].active = role.children[m].active;
					} else {
						body.children[m].active = role.children[m].active;
						body.children[m].getComponent(cc.Sprite).spriteFrame = role.children[m].getComponent(cc.Sprite).spriteFrame;
					}
				}
			}
		}
	},
	//购买

	//为人物装扮上：
	copyObj: function (list) { //不想改变原有数组--浅拷贝
		let tmplist = {};
		for (let item in list) { //in只使用名字
			tmplist[item] = {};
			for (let obj in list[item]) {
				tmplist[item][obj] = list[item][obj];
			}
		}
		return tmplist;
	},
	//从商店拷过来的  后续在改
	LoadImage: function (classifyIndex, index, node, curList) { //这里只有icon和套装的效果图
		if (curList.pic) {
			node.getComponent(cc.Sprite).spriteFrame = curList.pic;
			return;
		}
		let str = null;

		//gameManager.updateListData(classifyIndex, index, curList);
		if (classifyIndex == 21) { //套装的完整图 
			str = ObjectNume.httpUrl + gameManager.getUrl(classifyIndex, index);
			// console.log('确认图片和索引：' + classifyIndex, index, str);
			cc.loader.load(str, (err, res) => {
				if (err) return console.log('加载图片失败');
				node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
			});
		}
	},
	getUrl: function (classifyIndex, index, flag) {
		index += 1;
		index = parseInt(index / 100) > 0 ? index : (parseInt(index / 10) > 0 ? ('0' + index) : ('00' + index));
		if (flag) { //本地
			return 'icon/' + (classifyIndex < 10 ? ('0' + classifyIndex) : classifyIndex) + '_' + gameManager.classifyNameList[classifyIndex] + '/' + index;
		} else {
			return ObjectNume.httpUrl + (classifyIndex < 10 ? ('0' + classifyIndex) : classifyIndex) + '_' + gameManager.classifyNameList[classifyIndex] + '/icon/' + index + '.png';
		}
	},
	LoadIconImage: function (classifyIndex, index, node, curList) { //加载icon图
		if (curList.pic) {
			node.getComponent(cc.Sprite).spriteFrame = curList.pic;
			return;
		}
		let url = '';
		let isload = false;
		if (classifyIndex == 0) { //肤色 14
			if (index <= 13) { //本地
				isload = true;
			}
		} else if (classifyIndex == 4) { //腮红 16
			if (index <= 16) { //本地
				isload = true;
			}
		} else { //其他20
			if (index <= 20) { //本地
				isload = true;
			}
		}
		// console.log('index:' + classifyIndex, index, isload);
		if (isload) { //本地
			url = this.getUrl(classifyIndex, index, isload);
			// console.log('本地 ' + url);
			cc.loader.loadRes(url, cc.SpriteFrame, (err, res) => {
				if (err) return console.log('加载图片失败' + err);
				node.getComponent(cc.Sprite).spriteFrame = res;
				curList.pic = res; //存图

			})
		} else { //服务器
			url = this.getUrl(classifyIndex, index, isload);
			// console.log('远程 ' + url);
			cc.loader.load(url, (err, res) => { //加载服务器icon
				if (err) return console.log('加载图片失败' + err);
				node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);

				curList.pic = new cc.SpriteFrame(res);
			})
		}
	},
	// update (dt) {},
});