var gameManager = require('GameManager');

cc.Class({
	extends: cc.Component,

	properties: { //小的

	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		// this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
	},

	start() {

	},

	initIconFun: function (index, list, allList, refreshFlag) {
		this.index = index;
		this.lockFlag = 0;
		this.list = list;
		this.allList = allList;

		let str = "";
		if (refreshFlag && this.index == 0) {
			this.node.getChildByName('pic').getComponent(cc.Sprite).spriteFrame = gameManager.curScene.refreshPic;
			this.node.getChildByName('lock').active = false;
			this.node.getChildByName('select').active = false;
			return;
		}
		//加载icon
		gameManager.LoadIconImage(list.classifyIndex, list.index, this.node.getChildByName('pic'), allList.messageList[index - 1])

		if (list.lock == 1) {
			if (list.isOver == 1) {
				this.node.getChildByName('lock').active = false;
			} else {
				this.node.getChildByName('lock').active = true;
			}
		} else this.node.getChildByName('lock').active = false;

		this.node.getChildByName('select').active = false;
	},
	onTouchStart: function (event) {
		let pos = event.touch.getLocation();
		this.beginpos = pos;
	},
	onTouchEnd: function (event) { //需要保存数据
		let pos = event.touch.getLocation();
		if (Math.abs(this.beginpos.x - pos.x) < 0.05 && Math.abs(this.beginpos.y - pos.y) <= 0.5) { //确认点击到
			//是否需要解锁  看视频


			//关闭其他选中
			if (gameManager.curScene.smallSelectFlag >= 0) {
				for (let i = 0; i < this.node.parent.childrenCount; i++) {
					let tmp = this.node.parent.children[i].getComponent('itemsmallClick').index;
					if (tmp == gameManager.curScene.smallSelectFlag) {
						this.node.parent.children[i].getChildByName('select').active = false;
					}
				}
			}
			//选中
			this.node.getChildByName('select').active = true;
			gameManager.curScene.smallSelectFlag = this.index;
			//添加一个确认改变的flag 

			let classifyIndex = this.list.classifyIndex;
			//把衣服穿到人物身上
			let bodyParent = gameManager.curScene.person.getChildByName('body');
			if (classifyIndex == 0) { //肤色
				if (this.index == 0) {
					bodyParent.getChildByName('hands').color = new cc.Color(255, 255, 255);
					bodyParent.getChildByName('body').color = new cc.Color(255, 255, 255);
				} else {
					let str = '#' + this.list.color
					bodyParent.getChildByName('body').color = bodyParent.getChildByName('body').color.fromHEX(str);
					bodyParent.getChildByName('hands').color = bodyParent.getChildByName('body').color.fromHEX(str);
				}
			} else if (classifyIndex == 5) { //头发 --前发 后发
				if (this.index == 0) {
					bodyParent.getChildByName('hairback').active = true;
					bodyParent.getChildByName('hairfont').getComponent(cc.Sprite).spriteFrame = gameManager.curScene.defaultCloth[0];
					bodyParent.getChildByName('hairback').getComponent(cc.Sprite).spriteFrame = gameManager.curScene.defaultCloth[1];
				} else {
					gameManager.LoadImage(classifyIndex, this.list.index, bodyParent.getChildByName('hairfont'), this.allList.messageList[this.index - 1]);
					if (this.allList.messageList[this.index - 1].list) {
						bodyParent.getChildByName('hairback').active = true;
						gameManager.LoadImage(classifyIndex, this.list.index, bodyParent.getChildByName('hairback'), this.allList.messageList[this.index - 1].list, 1);
					} else {
						bodyParent.getChildByName('hairback').active = false;
						bodyParent.getChildByName('hairback').getComponent(cc.Sprite).spriteFrame = null;
					}
					gameManager.curScene.tmpRoleList[gameManager.classifyNameList[classifyIndex]].active = bodyParent.getChildByName('hairback').active; //记录后发的显隐						
				}
			} else if (classifyIndex == 6 || classifyIndex == 7 || classifyIndex == 8 || classifyIndex == 9 || classifyIndex == 10) {
				let node = bodyParent.getChildByName(gameManager.classifyNameList[classifyIndex]);
				node.active = true; //连衣裙 9  隐藏 上衣  裤子  裙子  外套

				if (this.index == 0) { //还原按钮
					if (classifyIndex == 6 || classifyIndex == 7) { //衣服裤子有默认
						node.getComponent(cc.Sprite).spriteFrame = gameManager.curScene.defaultCloth[classifyIndex - 1]; //默认 5 6
					} else {
						if (classifyIndex == 8 || classifyIndex == 9) { //只有裙子和连衣裙不能共有
							let tmpclassify = classifyIndex == 8 ? 9 : 8;
							if (gameManager.curScene.tmpRoleList[gameManager.classifyNameList[tmpclassify]].active == false &&
								gameManager.curScene.tmpRoleList[gameManager.classifyNameList[tmpclassify]].index >= 0) { //隐藏
								bodyParent.getChildByName(gameManager.classifyNameList[tmpclassify]).active = true;
								gameManager.curScene.tmpRoleList[gameManager.classifyNameList[tmpclassify]].active = true;
							}
						}
						node.getComponent(cc.Sprite).spriteFrame = null;
					}
				} else {
					gameManager.LoadImage(classifyIndex, this.list.index, node, this.allList.messageList[this.index - 1]);
					if (classifyIndex == 8 || classifyIndex == 9) { //只有裙子和连衣裙不能共有
						let tmpclassify = classifyIndex == 8 ? 9 : 8;
						if (gameManager.curScene.tmpRoleList[gameManager.classifyNameList[tmpclassify]].active &&
							gameManager.curScene.tmpRoleList[gameManager.classifyNameList[tmpclassify]].index >= 0) { //隐藏
							bodyParent.getChildByName(gameManager.classifyNameList[tmpclassify]).active = false;
							gameManager.curScene.tmpRoleList[gameManager.classifyNameList[tmpclassify]].active = false;
						}
					}
				}
				if (bodyParent.getChildByName(gameManager.classifyNameList[10]).active == false) //如果没有外套就显示手
					bodyParent.getChildByName('hands').active = true;

				gameManager.curScene.tmpRoleList[gameManager.classifyNameList[classifyIndex]].active = node.active;
			} else if (classifyIndex == 19) { //贴图
				if (this.index == 0) {
					let node = gameManager.curScene.stickerNode;
					if (node.childrenCount > 0)
						for (let i = 0; i < node.childrenCount; i++) {
							node.children[i].destroy();
						}
				} else {
					let node = cc.instantiate(gameManager.curScene.moveItem);
					node.parent = gameManager.curScene.stickerNode;
					node.active = true;
					node.x = 150;
					node.y = 500;
					gameManager.LoadImage(classifyIndex, this.list.index, node, this.allList.messageList[this.index - 1]);
				}
			} else if (classifyIndex == 20) { //背景
				if (this.index == 0) {
					gameManager.curScene.node.getComponent(cc.Sprite).spriteFrame = gameManager.curScene.defaultCloth[7]
				} else {
					gameManager.LoadImage(classifyIndex, this.list.index, gameManager.curScene.node, this.allList.messageList[this.index - 1]);
				}
			} else {
				let node = bodyParent.getChildByName(gameManager.classifyNameList[classifyIndex]);
				if (classifyIndex == 1 || classifyIndex == 2 || classifyIndex == 3) { // 眉毛 1 眼睛 2 嘴巴 3
					if (this.index == 0) {
						node.getComponent(cc.Sprite).spriteFrame = gameManager.curScene.defaultCloth[classifyIndex + 1];
					} else {
						gameManager.LoadImage(classifyIndex, this.list.index, node, this.allList.messageList[this.index - 1]);
					}
				} else { //
					if (this.index == 0) { //腮红  袜子 鞋子 首饰 眼镜  头饰 包包 翅膀
						node.getComponent(cc.Sprite).spriteFrame = null;
						node.active = false;

					} else {
						node.active = true;
						gameManager.LoadImage(classifyIndex, this.list.index, node, this.allList.messageList[this.index - 1]);
					}
				}
				gameManager.curScene.tmpRoleList[gameManager.classifyNameList[classifyIndex]].active = node.active;
			}

			gameManager.curScene.tmpRoleList[gameManager.classifyNameList[0]].active = bodyParent.getChildByName('hands').active;
			//需要在保存前 修改身体列表
			if (classifyIndex < gameManager.curScene.tmpRoleListLength) { //19
				console.log('水水发发：' + this.list.index, this.index);
				if (this.index == 0) {
					gameManager.curScene.tmpRoleList[gameManager.classifyNameList[classifyIndex]].index = -1;
				} else
					gameManager.curScene.tmpRoleList[gameManager.classifyNameList[classifyIndex]].index = this.list.index; // this.index;//0 应该是还原吧
				gameManager.curScene.ischeckChange = true; //开启提示弹窗的标签
			}
		}
	},

	// update (dt) {},
});