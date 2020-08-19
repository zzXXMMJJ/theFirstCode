var gameManager = require('GameManager');

cc.Class({
	extends: cc.Component,

	properties: { //
		index: 0,
		personScaleWidth: 0,
		personScaleHeight: 0
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
	},

	start() {},

	initIconFun: function (index, msg, flag, allList) { //初始化商店卡片
		this.index = index; //节点索引跟图片索引没有对上

		let that = this;
		this.flag = flag;
		this.allmsgList = allList; //总数组 包含texture和message的总数组
		this.msgList = msg; //直接存储当前 this.allmsgList.messageList[index]
		let str = "";
		let node = null;
		if (msg.classifyIndex == 21) //套装
		{
			//套装msg
			node = this.node.getChildByName('suit');
			node.active = true;
			this.node.getChildByName('group').active = false;
			let tmp = this.getIndex(this.msgList.index, this.msgList.classifyIndex, this.allmsgList.messageList)
			this.LoadImage(msg.classifyIndex, msg.index, node.getChildByName('person'), allList.messageList[tmp]); //当前索引不是
			// node.getChildByName('person').scale = gameManager.getScaleNum(node.getChildByName('person'), that.personScaleWidth, that.personScaleHeight);
			node.getChildByName('person').scale = 1;
			node.flag = 0;
		} else {
			this.node.getChildByName('suit').active = false;
			node = this.node.getChildByName('group');
			node.active = true;
			node.flag = 1;
		}
		this.tmpNode = node;
		node.getChildByName('name').getComponent(cc.Label).string = msg.name;

		let tmplist = new Array();
		let tmpIndexList = new Array();
		for (let i = 0; i < msg.list.length; i++) {
			if (msg.list[i].isShow == 1) { //把在上面展示的单品列出来
				tmplist.push(msg.list[i]);
				tmpIndexList.push(i);
			}
		}

		let sub = node.getChildByName('partNode').children;
		for (let i = 0; i < 6; i++) { //里面的单品 最多显示6件
			if (i > tmplist.length - 1) { //如果没有6件的话
				sub[i].active = false;
			} else {
				sub[i].active = true;
				sub[i].getChildByName('thing').active = true;
				//获取到列表 把图片存进去
				this.LoadIconImage(tmplist[i].classifyIndex, tmplist[i].index, sub[i].getChildByName('thing'), msg.list[tmpIndexList[i]]);

				sub[i].getChildByName('thing').scale = 1 // gameManager.getScaleNum(sub[i].getChildByName('thing'), sub[i].width, sub[i].height);
			}
		}
		if (msg.isOver == 1) {
			node.getChildByName('get').active = false;
			node.getChildByName('ok').active = true; //显示已拥有
		} else {
			node.getChildByName('ok').active = false;
			node.getChildByName('get').active = true;

			node.getChildByName('get').getChildByName('coin').active = true;
			node.getChildByName('get').getChildByName('coin').getComponent(cc.Label).string = msg.isDiscount > 0 ? Math.round(msg.coin * msg.isDiscount) : msg.coin; //原价
			node.getChildByName('get').getChildByName('discount').active = false;
			if (flag == 0) { //只有推荐里有打折
				node.getChildByName('get').getChildByName('discount').active = true;
				node.getChildByName('get').getChildByName('discount').getComponent(cc.Label).string = msg.coin; //折后价
			}
		}
		//按钮事件
		let clickEventHandler = new cc.Component.EventHandler();
		clickEventHandler.target = that.node;
		clickEventHandler.component = "shopClick";
		clickEventHandler.handler = "getFun";
		clickEventHandler.customEventData = index;
		node.getChildByName('get').getComponent(cc.Button).clickEvents.push(clickEventHandler);

		//选中
		if (gameManager.curScene.selectList[flag] == index) {
			node.getChildByName('select').active = true;
		} else {
			node.getChildByName('select').active = false;
		}
	},

	/**************************/
	//加载本地或者服务器上的图片
	/**************************/
	LoadImage: function (classifyIndex, index, node, curList) { //这里只有icon和套装的效果图
		if (curList.pic) {
			node.getComponent(cc.Sprite).spriteFrame = curList.pic;
			return;
		}
		let str = null;
		if (classifyIndex == 21) { //套装的完整图 
			str = ObjectNume.httpUrl + gameManager.getUrl(classifyIndex, index);
			cc.loader.load(str, (err, res) => {
				if (err) return console.log('加载图片失败');
				node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
				curList.pic = new cc.SpriteFrame(res);
				gameManager.updateListData(classifyIndex, index, curList); //-----------------------
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
		if (curList.icon) {
			node.getComponent(cc.Sprite).spriteFrame = curList.icon;
			return;
		}
		let url = '';
		let isload = false;
		if (classifyIndex == 0 || (classifyIndex >= 4 && classifyIndex <= 14) || (classifyIndex >= 16 && classifyIndex <= 18) || classifyIndex == 20) { //肤色 14
			//本地 
			isload = true;
		} else { //其他20
			isload = false; //直接读取服务器的效果图
		}
		// console.log('index:' + classifyIndex, index, isload);
		if (isload) { //本地
			url = this.getUrl(classifyIndex, index, isload);
			// console.log('本地 ' + url);
			cc.loader.loadRes(url, cc.SpriteFrame, (err, res) => {
				if (err) return console.log('加载图片失败' + err);
				node.getComponent(cc.Sprite).spriteFrame = res;
				curList.icon = res; //存图
				gameManager.updateListData(classifyIndex, index, curList); //--------------------需要修改
			})
		} else { //服务器
			url = this.getUrl(classifyIndex, index, isload);
			// console.log('远程 ' + url);
			cc.loader.load(url, (err, res) => { //加载服务器icon
				if (err) return console.log('加载图片失败' + err);
				node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
				curList.icon = new cc.SpriteFrame(res);
				gameManager.updateListData(classifyIndex, index, curList);
			});
		}
	},

	getFun: function (e, index) { //购买按钮 套装组合-----------这个index无法定位到  
		let node = e.target;
		console.log('getFun index：' + index);

		for (let i = 0; i < this.node.parent.childrenCount; i++) {
			if (this.node.parent.children[i].active && this.node.parent.children[i].getComponent('shopClick').index == this.index) {
				let tmp = this.getIndex(this.msgList.index, this.msgList.classifyIndex, this.allmsgList.messageList)
				let coin = this.flag == 0 ? Math.round(this.allmsgList.messageList[tmp].coin * this.allmsgList.messageList[tmp].isDiscount) : this.allmsgList.messageList[tmp].coin;
				if (gameManager.updatePlayerCoins(-coin)) {
					//购买成功:东西要放入对应数据列表：allItemHash  shopGroupHash recommendHash  showSingleHash  haveHash---有一个提示弹窗
					console.log('购买成功' + coin, this.msgList.name);

					this.allmsgList.messageList[tmp].isOver = 1; //套装及单品都放入已拥有
					if (this.allmsgList.messageList[tmp].list) {
						for (let k = 0; k < this.allmsgList.messageList[tmp].list.length; k++) {
							this.allmsgList.messageList[tmp].list[k].isOver = 1;
						}
					}
					//更新总库
					this.updateShopdata();

					//更新界面显示的金币
					gameManager.curScene.coinode.string = gameManager.playerData.coins;

					//界面变成已购买
					this.tmpNode.getChildByName('get').active = false;
					this.tmpNode.getChildByName('ok').active = true; //显示已拥有
					//弹出提示购买成功界面---进入衣柜
					// gameManager.curScene.parent.getChildByName('tipSuccess').active=true;
					cc.find('Canvas/tipSuccess').active = true;
				} else {
					// gameManager.curScene.parent.getChildByName('tipcoinvedio').active=true;
					cc.find('Canvas/tipcoinvedio').active = true;
					console.log('金币不足 购买失败' + coin, this.msgList.name)
				}
			}
		}
	},
	getIndex: function (index, classifyIndex, list) {
		for (let i = 0; i < list.length; i++) {
			if (list[i].classifyIndex == classifyIndex && list[i].index == index) {
				return i;
			}
		}
	},
	//套装组合购买后总库的数据更新:只限套装和组合
	updateShopdata: function () {
		let tmpmsgindex = gameManager.getAllHashIndex(this.msgList.classifyIndex, this.msgList.index);
		gameManager.allItemHash[this.msgList.classifyIndex].messageList[tmpmsgindex].isOver = 1;
		gameManager.addTohadList(this.msgList.classifyIndex, this.msgList.index)
		let list = gameManager.allItemHash[this.msgList.classifyIndex].messageList[tmpmsgindex].list;

		if (list.length > 0)
			for (let i = 0; i < list.length; i++) {
				list[i].isOver = 1;
				gameManager.addTohadList(list[i].classifyIndex, list[i].index);
			}

		gameManager.allToPartList(1); //重新分组

		//提示是否前往衣橱查看
	},
	onTouchStart(event) {
		let pos = event.touch.getLocation();
		this.lastPosition = pos;
	},
	onTouchMove(event) {

	},
	onTouchEnd(event) { //确认点击事件---确认选中

		let pos = event.touch.getLocation();
		if (Math.abs(this.lastPosition.x - pos.x) <= 0.05 && Math.abs(this.lastPosition.y - pos.y) <= 0.05) {
			//如果金币足够 放入已拥有 isOver=true allItemHash haveHash showSingleHash  金币不够 提示弹窗
			//确认选中
			this.tmpNode.getChildByName('select').active = true;
			if (gameManager.curScene.selectList[this.flag] >= 0) //没办法定位到之前选中的节点
				for (let i = 0; i < this.node.parent.childrenCount; i++) {
					if (this.node.parent.children[i].active && this.node.parent.children[i].getComponent('shopClick').index == gameManager.curScene.selectList[this.flag]) {
						if (this.node.parent.children[i].children[0].getChildByName('select').active) { //suit
							this.node.parent.children[i].children[0].getChildByName('select').active = false;
						} else if (this.node.parent.children[i].children[1].getChildByName('select').active) { //group
							// console.log('关掉的是哪个：' + i, 'flag:' + this.node.parent.children[i].flag);
							this.node.parent.children[i].children[1].getChildByName('select').active = false;
						}
					}
				}
			// this.node.parent.children[gameManager.curScene.selectList[this.flag]].getChildByName('select').active = false;
			gameManager.curScene.selectList[this.flag] = this.index;
		}
	},
	// update (dt) {},
});