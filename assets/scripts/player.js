var gameManager = require('GameManager');
cc.Class({ //只用来更新角色数据  以及处理拖动角色 
	extends: cc.Component,

	properties: {

	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchBegin, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
	},

	start() {
		
	},

	onTouchBegin: function (touch) {
		let pos = touch.touch.getLocation();
		this.beginpos = pos;
	},
	onTouchMove: function (touch) { //确认移动人物位置
		let pos = touch.touch.getLocation();
		if (this.node.parent == undefined) {} else {
			if (Math.abs(pos.x - this.beginpos.x) > 5 || Math.abs(pos.y - this.beginpos.y) > 5) {
				let pos1 = this.node.parent.convertToNodeSpaceAR(pos);
				this.node.position = pos1;
			}
		}
	},

	// update (dt) {},
});