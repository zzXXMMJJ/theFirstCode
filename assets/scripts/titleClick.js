var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: {

	},

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {},

	start() {

		// gameManager.curScene.titleType = -1;
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
	},
	onTouchStart: function (touch) {
		let pos = touch.touch.getLocation();
		this.beginpos = pos;

	},
	onTouchMove: function (touch) {
		let pos = touch.touch.getLocation();
	},
	onTouchEnd: function (touch) {
		let pos = touch.touch.getLocation();
		if (Math.abs(this.beginpos.x - pos.x) < 0.05 && Math.abs(this.beginpos.y - pos.y) < 0.05) {

			this.btnScale(this.node);

			//游戏中用到的标题
			if (this.node.type == 1) { //衣柜
				if (gameManager.curScene.clothBoxIndex != undefined) {
					gameManager.curScene.titleIndex = gameManager.curScene.clothBoxIndex;
				}
			} else if (this.node.type == 0) { //套装
				if (gameManager.curScene.subIndex != undefined) {
					gameManager.curScene.titleIndex = gameManager.curScene.subIndex;
				}
			}

			if (gameManager.curScene.titleIndex >= 0)
				for (let i = 0; i < this.node.parent.childrenCount; i++) {
					if (gameManager.curScene.titleIndex == this.node.parent.children[i].index)
						this.node.parent.children[i].getChildByName('1').active = false;
				}

			if (this.node.getChildByName('1').active == false) {
				this.node.getChildByName('1').active = true;
				//调用相应的生成子节点的方法 关闭其他选项
				if (this.node.type == 1) { //衣柜--游戏里也有衣柜
					console.log('clothbox index:' + this.node.index, this.node.type);
					gameManager.curScene.clothBoxSingleContent.getComponent('wardrobeRamark').loadData(this.node.index);

					if (gameManager.curScene.level > 0)
						gameManager.curScene.clothBoxIndex = this.node.index; //衣柜标题

					//衣柜的立即编辑 
					gameManager.curScene.clothNext.active = false;
					gameManager.clothAllList = null;

				} else if (this.node.type == 0) { //游戏内部
					if (!gameManager.curScene.itemleScrollView.node.active) { //开启滚动条
						gameManager.curScene.homeNode.active = false;
						gameManager.curScene.itemleScrollView.node.active = true;
						if (gameManager.curScene.level == 1)
							gameManager.curScene.suitNode.active = false;
					}
					//确认列表//索引 
					if (gameManager.curScene.checkTileFlag)
						gameManager.curScene.itemleContent.getComponent('itemsmallRamark').loadData(gameManager.showSingleHash[this.node.index]);
					if (gameManager.curScene.level > 0)
						gameManager.curScene.subIndex = this.node.index; //游戏标题
				}

			}
			gameManager.curScene.titleIndex = this.node.index;

		}
	},
	btnScale: function (node) {
		if (node.getActionByTag(1)) return;
		let act = cc.sequence(cc.scaleTo(0.05, 1.1), cc.delayTime(0.1), cc.scaleTo(0.05, 1))
		act.setTag(1);
		node.runAction(act);
	},
	// update (dt) {},
});