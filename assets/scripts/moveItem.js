var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: {

	},

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {},

	start() {
		this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
		this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
		this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
	},
	onTouchStart: function (event) {
		let pos = event.touch.getLocation();
		this.beginpos = this.node.parent.convertToNodeSpaceAR(pos);
	},
	onTouchMove: function (event) { //移动该节点
		let pos = event.touch.getLocation();
		pos = this.node.parent.convertToNodeSpaceAR(pos);
		if (pos.sub(this.beginpos).mag() > 10) {

			this.node.position = pos;
			// console.log('pos:' + pos);
		}
	},
	onTouchEnd: function (event) {
		let pos = event.touch.getLocation();

	},
	// update (dt) {},
});