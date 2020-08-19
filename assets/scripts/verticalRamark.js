var gameManager = require('GameManager');
cc.Class({ //修改方案 不需要游戏场景中展示角色 另外移除背景和贴图在当前界面的展示
	extends: cc.Component,

	properties: { //horizontal 需要处理角色 、套装（已拥有、未拥有） 同样大小

		itemPre: {
			default: null,
			type: cc.Prefab
		}, //预制节点
		itemW: 0,
		itemG: 0,
		itemSpace: 0,
		itemPadding: 0,
		maxCol: 7,
		type: 0,
	},

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {},

	start() {
		this.fontNum = 2;
		this.backNum = 4;

		// this.itemPadding=0;
		this.startX = this.node.x;
		// console.log('startx:' + this.startX);
	},
	loadData: function (list) { //信息列表   已拥有  未拥有 
		this.isLoadFinish = false;
		this.itemsgList = list;
		this.itemList = list;
		// console.log('长度：' + list.length);
		this.isCanScroll = false;
		let childs = this.node.children;
		if (childs.length > 0) {
			for (let i = 0; i < childs.length; i++) {
				childs[i].active = false;
			}
		}
		this.curDex = 0;
		this.maxDex = list.length - 1;
		for (let i = this.curDex; i < this.curDex + this.maxCol && i < list.length; i++) {
			this.initItemFun(i, childs[i - this.curDex]);
		}

		if (list.length - this.curDex >= (this.maxCol - 1)) {
			if (list.length - this.curDex > this.maxCol) {
				this.isCanScroll = true;
			}
			this.bottomIndex = this.maxCol - 1;
		}
		let col = Math.ceil(list.length);
		let w = this.itemPadding * 2 + (this.itemW + this.itemSpace) * col - this.itemSpace;
		this.node.width = w;
		this.node.x = this.startX;

		this.isLoadFinish = true;
		this.lastIndex = this.curDex;
		this.topIndex = 0;

	},
	initItemFun: function (index, child) {
		if (index > this.itemList.length - 1) {
			if (child != null || child != undefined) {
				child.active = false;
			}
			return;
		} else if (index < 0) {
			return;
		}
		let obj = null;
		if (child != null || child != undefined) {
			obj = child;
		} else {
			obj = cc.instantiate(this.itemPre);
			obj.parent = this.node;
		}
		obj.active = true;

		let item = obj.getComponent('verticalClick');
		item.index = index;

		item.initIconFun(index, this.itemList[index], this.itemsgList, this.type); //调用

		let yy = 0;
		let xx = this.itemPadding + this.itemW / 2 + index * (this.itemW + this.itemSpace);
		console.log('index:' + index, xx, yy);
		obj.setPosition(xx, yy);
	},
	UpdateColItem: function (flag) {
		let childs = this.node.children;
		if (flag == 0) {
			let imageIndex = childs[this.topIndex].getComponent('verticalClick').index + this.maxCol;
			if (imageIndex >= this.itemList.length) return;
			for (let i = this.topIndex; i < this.topIndex + 1; i++, imageIndex++) {
				this.initItemFun(imageIndex, childs[i]);
				// console.log('updateColItem 0');
			}
			this.bottomIndex = this.topIndex;
			this.topIndex += 1;
			if (this.topIndex > (this.maxCol - 1)) {
				this.topIndex = 0;
			}
		} else if (flag == 1) {
			let imageIndex = childs[this.bottomIndex].getComponent('verticalClick').index - this.maxCol;
			if (imageIndex < 0) return;
			for (let i = this.bottomIndex; i < this.bottomIndex + 1; i++, imageIndex++) {
				this.initItemFun(imageIndex, childs[i]);
				// console.log('updateColItem 1');
			}

			this.topIndex = this.bottomIndex;
			this.bottomIndex -= 1;
			if (this.bottomIndex < 0) {
				this.bottomIndex = this.maxCol - 1;
			}
		}
	},
	ClearData: function () {
		this.node.width = 0;
		let childs = this.node.children;
		for (let i = 0; i < childs.length; i++) {
			childs[i].active = false;
		}
	},
	OnScrollRectScrolled: function () {

		if (this.isLoadFinish == false || this.isCanScroll == false) return;

		if (this.node.x > this.startX) return; //滑到最左边

		let dex = Math.floor((this.startX - this.node.x) / (this.itemW + this.itemSpace));

		if (dex == this.lastIndex) return;

		this.UpdateScrollView(dex);
	},
	UpdateScrollView: function (dex) {
		if (dex < this.lastIndex) {
			// console.log('UpdateScrollView  ' + dex, this.maxDex, this.maxDex - (this.backNum + 1))
			if (dex > this.maxDex - (this.backNum + 1)) return;
			this.UpdateColItem(1);
		} else if (dex > this.lastIndex) {
			// console.log('UpdateScrollView dex ' + dex, this.fontNum + 1);
			if (dex < this.fontNum + 1) return;
			this.UpdateColItem(0);
		}
		this.lastIndex = dex;
	},

	// update (dt) {},
});