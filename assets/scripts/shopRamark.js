var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: { //vertical  只是处理icon的节点
		itemPrefab: {
			default: null,
			type: cc.Prefab
		},
		colNum: 1, //一行显示的列数
		maxRow: 6, //当前界面能展示最大数量的行数+另外需要多加载的几行
		itemW: 0, //
		itemH: 0,
		itemSpace: 0,
		itemPadding: 0,
		itemDisplayNum: 0, //界面展示多少个
		type: 0, //商店
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {},

	start() {
		this.fontNum = 2;
		this.backNum = 4; //
		this.itemPadding = 0 //(this.node.width - (this.itemW + this.itemSpace) * this.colNum + this.itemSpace) / 2;

		this.startY = 450; //this.node.y;

		console.log('padding：' + this.itemPadding, this.startY);
	},
	// 加载列表 需要加还原:向下滑动后会丢失第一个节点
	loadData: function (list, flag) { //flag 确认 推荐 0 、套装 1 、组合 2
		this.isLoadFinish = false;
		this.itemsgList = list;
		this.flag = flag;
		this.itemlist = list.messageList;
		list = list.messageList;
		this.isCanScroll = false; //是否长度足够可以滚动
		let childs = this.node.children;
		if (this.node.childrenCount > 0) {
			for (let i = 0; i < childs.length; i++) {
				childs[i].active = false;
			}
		}
		this.curDex = 0;
		this.maxDex = Math.floor((list.length - 1) / this.colNum) * this.colNum;
		for (let i = this.curDex; i < this.curDex + this.colNum * this.maxRow && i < list.length; i++) {
			this.initItemFun(i, childs[i - this.curDex]); //生成当前界面可以生成的最大数量
		}

		if (list.length - this.curDex >= this.colNum * (this.maxRow - 1)) //所要生成的节点数占据到最大限制的最后一行
		{
			if (list.length - this.curDex > this.colNum * this.maxRow) {
				this.isScrollChange = true; //所要生成的节点数>最大限制数量   确认可以滚动
			}
			this.bottomIndex = this.colNum * (this.maxRow - 1); //最后面那个节点对应在父节点中的位置---限制的最大行的第一位索引
		}

		let row = Math.ceil((list.length) / this.colNum); //当期需要加载的最大行数
		let h = this.itemPadding * 2 + (this.itemH + this.itemSpace) * row - this.itemSpace; //减掉了最后一行的空白
		this.node.height = h;
		this.node.y = this.startY;
		this.isLoadFinish = true;
		this.lastIndex = this.curDex;
		this.topIndex = 0; //最前面那个节点对应在父节点中的位置
	},
	initItemFun: function (index, child) {
		if (index > this.itemlist.length - 1) { //超过最大数量
			if (child != null || child != undefined) {
				child.active = false;
			}
			return;
		} else if (index < 0) {
			return;
		}

		let obj = null;
		if (child != null || child != undefined) { //index跟子节点序号不一致
			obj = child; //同一类 可以直接使用
		} else { //没有这个节点
			obj = cc.instantiate(this.itemPrefab); //组合
			obj.parent = this.node;
		}

		obj.active = true;

		let item = obj.getComponent("shopClick");
		item.index = index;
		item.initIconFun(index, this.itemlist[index], this.flag, this.itemsgList); //套装
		let yy = -this.itemPadding - this.itemH / 2 - Math.floor(index / this.colNum) * (this.itemH + this.itemSpace);
		let xx = 0;
		obj.setPosition(xx, yy);
	},
	//滑动的时候更新头尾两行的信息
	//flag：0:向上滑 1：向下滑
	/******************/
	UpdateTwoRowItem(flag) {
		let childs = this.node.children;
		if (flag == 0) { //把最上面的那排移动到最下面
			let imageIndex = childs[this.topIndex].getComponent("shopClick").index + this.colNum * this.maxRow;
			if (imageIndex >= this.itemlist.length) //不进行移动 已经是最底下了
				return;
			for (let i = this.topIndex; i < this.topIndex + this.colNum; i++, imageIndex++) { //加载一行？
				this.initItemFun(imageIndex, childs[i]);
			}

			this.bottomIndex = this.topIndex;
			this.topIndex += this.colNum;
			if (this.topIndex > this.colNum * (this.maxRow - 1)) {
				this.topIndex = 0;
			}
		} else if (flag == 1) { //把最下面的那张移动到最上面
			let imageIndex = childs[this.bottomIndex].getComponent("shopClick").index - this.colNum * this.maxRow;
			if (imageIndex < 0)
				return;
			for (let i = this.bottomIndex; i < this.bottomIndex + this.colNum; i++, imageIndex++) {
				this.initItemFun(imageIndex, childs[i]);
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
		let dex = Math.floor((this.node.y - this.startY) / (this.itemH + this.itemSpace)) * this.colNum; //确认需要加载多少 row*col
		if (dex == this.lastIndex)
			return;
		this.UpdateScrollView(dex);
	},
	UpdateScrollView: function (dex) {
		if (dex < this.lastIndex) {
			// console.log("向下滑动");
			//向下滑动
			if (dex > this.maxDex - (this.backNum + 1) * this.colNum)
				return;

			//把最下面的那张移动到最上面
			this.UpdateTwoRowItem(1);

		} else if (dex > this.lastIndex) {
			// console.log("向上滑动");
			//向上滑动
			if (dex < (this.fontNum + 1) * this.colNum)
				return;
			//把最上面的那排移动到最下面
			this.UpdateTwoRowItem(0);
		}
		this.lastIndex = dex;
	},

	//套装
	//推荐 0  套装 1   组合 2
	//发生多少滑动处理加载资源     加载多少数据合理
	//加载资源  卸载资源
	// update (dt) {},
});