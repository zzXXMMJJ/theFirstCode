var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: {

	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() { //判断是衣柜还是游戏内 确认调用方法
		this.lastPosition = cc.v2(0, 0);
		this.moveFlag = false;
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
	},
	start() {
		// console.log('yigui:' + this.index);
	},
	InitMsg: function (index, list, allList) { //套装还是单品

		// if (list.classifyIndex == 21) {//套装 } else {//单品}
		this.index = index;
		this.allList = allList;
		this.list = list;
		let tmp = this.getIndex(this.list.index, this.allList.messageList);
		gameManager.LoadIconImage(list.classifyIndex, list.index, this.node.getChildByName('pic'), allList.messageList[tmp]);
		// this.node.getChildByName('pic').getComponent(cc.Sprite).spriteFrame = null; //加载icon图片 风格 
		this.node.getChildByName('z').active = false;
		this.node.getChildByName('z').getComponent(cc.Label).string = '';
		if (this.node.getChildByName('select')) //套装没加
			this.node.getChildByName('select').active = false;

		if (list.classifyIndex > 4 && list.classifyIndex !== 19 && list.classifyIndex !== 20) //面部妆容 贴图和背景没有主属性风格
			this.node.getChildByName('z').getComponent(cc.Label).string = gameManager.changeName(list.Pri_attribute);
	},
	//添加选中框
	onTouchStart: function (event) {
		let pos = event.touch.getLocation();
		this.beginPos = pos;
	},
	onTouchMove: function (event) { //悬浮到该节点显示风格移开就隐藏
		let pos = event.touch.getLocation();
	},
	onTouchEnd: function (event) { //进入游戏界面并为人物穿上该衣服
		let childs = this.node.parent.children;

		if (childs.length > 0) {
			for (let i = 0; i < childs.length; i++) {
				if (childs[i].active && childs[i].getComponent('wardrobeClick').index == this.index) {
					if (this.node.getChildByName('select'))
						childs[i].getChildByName('select').active = true;
					childs[i].getChildByName('z').active = true;
					//显示进入游戏界面的按钮
					console.log('进来几次：' + i);

					let tmp = this.getIndex(this.list.index, this.allList.messageList);
					this.convertToData(tmp, this.allList.messageList);

					gameManager.curScene.clothNext.active = true; //是否需要自动隐藏
				} else {
					childs[i].getChildByName('select').active = false;
					childs[i].getChildByName('z').active = false;
				}
			}
		}
	},
	convertToData: function (index, allList) {
		//初始化角色列表
		this.tmpRoleListLength = 19;
		if (gameManager.curScene.level == 0 || (gameManager.curScene.level == 1 && gameManager.curScene.person.active == false)) { //当前需要新建人物  如果第一个界面  或者第二个界面但是没有人物角色
			gameManager.tmpRoleList = {}; //记录当前角色信息
			for (let i = 0; i < this.tmpRoleListLength; i++) {
				let obj = {
					'index': -1,
					'active': true
				};
				gameManager.tmpRoleList[gameManager.classifyNameList[i]] = obj;
			}
		} else { //如果第二个界面有人物
			gameManager.tmpRoleList = gameManager.curScene.tmpRoleList;
		}
		//单品 、套装
		let msglist = allList[index];
		if (msglist.classifyIndex == 21) {
			if (msglist.list && msglist.list.length > 0) {
				let list = msglist.list;
				for (let i = 0; i < list.length; i++) {
					gameManager.tmpRoleList[gameManager.classifyNameList[list[i].classifyIndex]].index = list[i].index;
					//外套 头发
					if (list[i].classifyIndex == 5) {
						if (list[i].list) { //有后发
							gameManager.tmpRoleList[gameManager.classifyNameList[list[i].classifyIndex]].active = true;
						} else {
							gameManager.tmpRoleList[gameManager.classifyNameList[list[i].classifyIndex]].active = false;
						}
					} else if (list[i].classifyIndex == 10) { //手存到肤色里
						gameManager.tmpRoleList[gameManager.classifyNameList[0]].active = gameManager.checkCoatIndex(list[i].index);
					}
				}
			}
		} else if (msglist.classifyIndex == 19 || msglist.classifyIndex == 20) { //背景和贴图除外
			if (gameManager.curScene.level == 1) { //就在当前场景的话直接换上
				if (msglist.classifyIndex == 20) {
					let tmpmsgindex = gameManager.getAllHashIndex(20, msglist.index);
					gameManager.LoadImage(20, tmpmsgindex, gameManager.curScene.node, gameManager.allItemHash[20].messageList[tmpmsgindex]);
				}
				if (msglist.classifyIndex == 19) {
					let movenode = cc.instantiate(gameManager.curScene.moveItem);
					movenode.parent = gameManager.curScene.stickerNode;
					movenode.active = true;
					movenode.x = 150;
					movenode.y = 500;
					let tmpmsgindex = gameManager.getAllHashIndex(19, msglist.index);
					gameManager.LoadImage(19, tmpmsgindex, movenode, gameManager.allItemHash[19].messageList[tmpmsgindex]);
				}
			} else {
				if (msglist.classifyIndex == 20)
					gameManager.bgIndex = msglist.index;
				if (msglist.classifyIndex == 19)
					gameManager.stickIndex = msglist.index;
			}
		} else {
			//外套 头发
			if (msglist.classifyIndex == 5) {
				if (msglist.list) { //有后发
					gameManager.tmpRoleList[gameManager.classifyNameList[msglist.classifyIndex]].active = true;
				} else {
					gameManager.tmpRoleList[gameManager.classifyNameList[msglist.classifyIndex]].active = false;
				}
			} else if (msglist.classifyIndex == 10) {
				gameManager.tmpRoleList[gameManager.classifyNameList[0]].active = gameManager.checkCoatIndex(msglist.index);
				gameManager.tmpRoleList[gameManager.classifyNameList[msglist.classifyIndex]].active = true;
			}

			gameManager.tmpRoleList[gameManager.classifyNameList[msglist.classifyIndex]].index = msglist.index;
		}
		// console.log('衣柜人物角色信息: ' + gameManager.tmpRoleList);
	},
	getIndex: function (index, list) {
		for (let i = 0; i < list.length; i++) {
			if (list[i].index == index) {
				return i;
			}
		}
	},

	// update (dt) {},
});