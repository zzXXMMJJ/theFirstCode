var gameManager = require('GameManager');

cc.Class({
	extends: cc.Component,

	properties: {
		coinLabel: cc.Label,
		contentNode: cc.Node,
		personScaleWidth: 1,
		personScaleHeight: 1,
	},
	//
	// LIFE-CYCLE CALLBACKS:

	onLoad() {

		gameManager.curScene.selectList = new Array(3); //选中标签
		for (let i = 0; i < 3; i++) {
			gameManager.curScene.selectList[i] = -1;
		}
		//默认生成推荐 
		setTimeout(() => {
			this.checkAlbum(null, 0);
		}, 300);
	},

	start() {

	},
	checkAlbum: function (e, flag) { //推荐 0  套装 1 组合 2
		let that = this;
		let node = null;
		if (e) {
			node = e.target;
			if (node.getChildByName('1').active) return;
			for (let i = 1; i < node.parent.childrenCount; i++) { //按钮界面显示
				if (flag == (i - 1)) {
					node.parent.children[i].getChildByName('1').active = true;
				} else {
					node.parent.children[i].getChildByName('1').active = false;
				}
			}
		}

		let list = null;
		flag = parseInt(flag);
		switch (flag) {
			case 0: //确认数组
				list = gameManager.recommendHash; //9
				break;
			case 1:
				list = gameManager.shopSuitHash; //6
				break;
			case 2:
				list = gameManager.shopGroupHash; //4
				break;
			default:
				console.log('flag不知道是什么:' + flag);
				break;
		}
		for (let i = 0; i < 3; i++) {
			gameManager.curScene.selectList[i] = -1;
		}
		let shopItemRamark = this.contentNode.getComponent('shopRamark');
		shopItemRamark.loadData(list, flag);
	},

	// update (dt) {},
});