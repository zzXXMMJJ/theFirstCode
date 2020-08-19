var gameManager = require('GameManager');
cc.Class({
	extends: cc.Component,

	properties: {
		type: 0,
	},

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {},

	start() {
		let slider = this.getComponent(cc.Slider);
		let progressbar = this.getComponent(cc.ProgressBar);

		if (slider == null || progressbar == null) {
			return;
		}

		progressbar.progress = slider.progress;

		let self = this;
		slider.node.on('slide', function (event) { //滑动
			progressbar.progress = slider.progress;
			//改变音量大小
			if (this.type == 0) {//背景音乐 根据进度调节音量 volume
				
			} else if (this.type == 1) {//其他音效  音量

			}
		}, this);

		//调节音乐和音量
	},
	// update (dt) {},
});