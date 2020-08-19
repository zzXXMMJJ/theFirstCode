var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: {
		colNum: 6,
		maxRow: 7, //显示的行数+上下各两行   7行
		item: cc.Prefab,
		itemW: 100,
		itemH: 100,
		itemSpaceX: 25,
		itemSpaceY: 30,
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		this.fontNum = 2;
		this.backNum = 4;
		this.itemPadding = (this.node.width - (this.itemW + this.itemSpaceX) * this.colNum + this.itemSpaceX) / 2; //
		this.startY = this.node.y;
		this.isLoadFinish = false;
	},

	start() {}, //网格 套装 3*2   单品 5*4
	//只有滑动展示  没有点击效果  悬浮在上面
	loadData: function (flag) { //gameManager.haveHash 0-20
		let list = gameManager.haveHash[flag].messageList;
		this.flag = flag;
		this.msgList = list;
		//套装 21  单品（肤色、眉毛、）  0-20
		this.isCanScroll = false;
		let childs = this.node.children;
		if (childs.length > 0) {
			for (let i = 0; i < childs.length; i++) {
				childs[i].active = false;
			}
		}
		if (list.length <= 0) { //如果没有已拥有
			gameManager.curScene.clothtip.active = true;
			return;
		}
		gameManager.curScene.clothtip.active = false;
		this.curDex = 0;
		this.maxDex = Math.floor((list.length - 1) / this.colNum) * this.colNum;
		for (let i = this.curDex; i < this.curDex + this.colNum * this.maxRow && i < list.length; i++) {
			this.InitItemMsg(i, childs[i - this.curDex]);
		}

		if (list.length - this.curDex >= this.colNum * (this.maxRow - 1)) {
			if (list.length - this.curDex > this.colNum * this.maxRow) {
				this.isScrollChange = true;
			}
			this.bottomIndex = this.colNum * (this.maxRow - 1);
		}

		let row = Math.ceil(list.length / this.colNum);
		let h = this.itemPadding * 2 + (this.itemH + this.itemSpaceY) * row - this.itemSpaceY;
		this.node.height = h;
		this.node.y = this.startY;
		this.isLoadFinish = true;
		this.lastIndex = this.curDex;
		this.topIndex = 0;
	},
	InitItemMsg(index, child) //图片对应的index
	{
		if (index > this.msgList.length - 1) {
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
			obj = cc.instantiate(this.item);
			obj.parent = this.node;
		}

		obj.active = true;

		let item = obj.getComponent("wardrobeClick");
		item.index = index;

		item.InitMsg(index, this.msgList[index], gameManager.haveHash[this.flag]);

		let yy = -this.itemPadding - this.itemH / 2 - Math.floor(index / this.colNum) * (this.itemH + this.itemSpaceY);
		let xx = -this.node.width / 2 + this.itemPadding + this.itemW / 2 + index % this.colNum * (this.itemW + this.itemSpaceX);
		obj.setPosition(xx, yy);

	},
	/******************/
	//滑动的时候更新头尾两行的信息
	//flag：0:向上滑 1：向下滑
	/******************/
	UpdateTwoRowItem(flag) {
		let childs = this.node.children;
		if (flag == 0) { //把最上面的那排移动到最下面
			let imageIndex = childs[this.topIndex].getComponent("SecondItem").index + this.colNum * this.maxRow;
			if (imageIndex >= this.msgList.length) //不进行移动 已经是最底下了
				return;
			for (let i = this.topIndex; i < this.topIndex + this.colNum; i++, imageIndex++) { //加载一行？
				this.InitItemMsg(imageIndex, childs[i]);
			}

			this.bottomIndex = this.topIndex;
			this.topIndex += this.colNum;
			if (this.topIndex > this.colNum * (this.maxRow - 1)) {
				this.topIndex = 0;
			}
		} else if (flag == 1) { //把最下面的那张移动到最上面
			let imageIndex = childs[this.bottomIndex].getComponent("SecondItem").index - this.colNum * this.maxRow;
			if (imageIndex < 0)
				return;
			for (let i = this.bottomIndex; i < this.bottomIndex + this.colNum; i++, imageIndex++) {
				this.InitItemMsg(imageIndex, childs[i]);
			}

			this.topIndex = this.bottomIndex;
			this.bottomIndex -= this.colNum;
			if (this.bottomIndex < 0) {
				this.bottomIndex = this.colNum * (this.maxRow - 1);
			}
		}
	},

	/******************/
	//清掉滑动条的信息
	/******************/
	ClearData() {
		this.node.height = 0;
		let child = this.node.children;
		for (let i = 0; i < this.node.childrenCount; i++) {
			child[i].active = false;
		}
	},

	/******************/
	//滑动条滑动的事件处理
	/******************/
	OnScrollRectScrolled: function () {
		if (this.isLoadFinish == false || this.isScrollChange == false)
			return;
		if (this.node.y < this.startY)
			return;
		let dex = Math.floor((this.node.y - this.startY) / (this.itemH + this.itemSpaceY)) * this.colNum; //确认需要加载多少 row*col
		// console.log('滚动条事件：' + this.node.y, '  dex:' + dex, '  lastIndex:' + this.lastIndex);
		if (dex == this.lastIndex)
			return;
		this.UpdateScrollView(dex);
	},
	UpdateScrollView: function (dex) {
		if (dex < this.lastIndex) {
			// console.log("向下滑动" + this.maxDex - (this.backNum + 1) * this.colNum, dex);
			//向下滑动
			if (dex > this.maxDex - (this.backNum + 1) * this.colNum)
				return;

			//把最下面的那张移动到最上面
			this.UpdateTwoRowItem(1);

		} else if (dex > this.lastIndex) {
			// console.log("向上滑动:" + (this.fontNum + 1) * this.colNum, dex);
			//向上滑动
			if (dex < (this.fontNum + 1) * this.colNum)
				return;
			//把最上面的那排移动到最下面
			this.UpdateTwoRowItem(0);
		}
		this.lastIndex = dex;
	},

	// update (dt) {},
});