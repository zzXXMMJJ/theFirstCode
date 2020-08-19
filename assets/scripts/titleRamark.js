var gameManager = require('GameManager');
cc.Class({ //一次性生成的
	extends: cc.Component,

	properties: {
		type: 0, //标题两类 衣柜  游戏内
		titleItem: cc.Prefab,
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		// console.log('ssss:' + this.type);

		this.loadtitlePic(); //在这里调用 不切换场景不会再调用
	},

	start() {

	},
	checkIndex: function (i) {
		this.classlist = [6, 7, 8, 9, 10, 12, 17];
		for (let m = 0; m < this.classlist.length; m++) {
			if (i == this.classlist[m]) {
				return true;
			}
		}
		return false;
	},
	InitTitle: function () { //加载标题icon
		let flag = this.type;
		let tmplength = this.node.childrenCount;
		if (this.node.childrenCount > 0) { //
			for (let i = 0; i < this.node.childrenCount; i++)
				this.node.children[i].destroy();
		} //异步销毁
		console.log('ssss:' + this.type);
		//衣柜 6 7 8 9 10 12  17
		//游戏  0-18
		//角色19 20
		for (let i = 0; i < gameManager.titleList.length; i++) {
			if (flag == 0) {
				if (gameManager.curScene.level == 1) { //游戏
					if (i > 18) continue;
				} else if (gameManager.curScene.level == 2) { //角色
					if (i != 19 && i != 20) continue;
				}
			} else if (flag == 1) { //衣柜
				if (!this.checkIndex(i)) continue;
			}

			let node = cc.instantiate(this.titleItem);
			node.index = i;
			node.type = flag; //
			node.getComponent(cc.Sprite).spriteFrame = gameManager.titleList[i][0];
			node.getChildByName('1').getComponent(cc.Sprite).spriteFrame = gameManager.titleList[i][1];
			node.active = true;
			node.parent = this.node;
			node.getChildByName('1').active = false;
			//如果是衣柜 第一个应该是打开的
			if (flag == 1) {
				if (i == 6) {
					this.node.children[tmplength].getChildByName('1').active = true;
					//调用生成显示默认子节点方法
					gameManager.curScene.titleIndex = 6;
				}
			}
		}

	},
	loadtitlePic: function () { //存于本地的标题资源
		let that = this;
		if (gameManager.titleList && gameManager.titleList.length > 0) {
			that.InitTitle();
			return;
		}
		let str = 'title';
		gameManager.titleList = new Array();
		cc.loader.loadResDir(str, cc.SpriteFrame, (err, res) => { //加载本地资源需要重新排序
			if (err) return console.log(err);
			for (let m = 0; m < res.length / 2; m++) {
				gameManager.titleList[m] = new Array();
			}
			for (let i = 0; i < res.length; i++) {
				for (let m = 0; m < res.length / 2; m++) {
					if (parseInt(res[i].name.substr(0, 2)) == m) {
						if (parseInt(res[i].name.substr(3, 1)) == 0) {
							gameManager.titleList[m][1] = res[i]; //选中
						} else if (parseInt(res[i].name.substr(3, 1)) == 1) {
							gameManager.titleList[m][0] = res[i]; //未选中
						}
					}
				}
			}
			that.InitTitle();
		});
	}
	// update (dt) {},
});