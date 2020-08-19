var gameManager = require('GameManager');

cc.Class({ //单独做出来的  人物角色界面  单独处理背景和贴图 另外 人物可以移动 镜像 缩放  场景中有衣柜
	extends: cc.Component,

	properties: {
		person: { //人物父节点
			default: null,
			type: cc.Node
		},
		stickerNode: { //贴图父节点
			default: null,
			type: cc.Node
		},
		moveItem: { //挂载了移动脚本的预制
			default: null,
			type: cc.Prefab
		},
		homeNode: { //角色父节点
			default: null,
			type: cc.Node
		},
		homeScrollView: { //角色滚动条
			default: null,
			type: cc.ScrollView
		},
		homeContent: {
			default: null,
			type: cc.Node
		},
		itemleScrollView: { //单品滚动条
			default: null,
			type: cc.ScrollView
		},
		itemleContent: { //节点父节点
			default: null,
			type: cc.Node
		},
		clothBoxNode: { //衣柜
			default: null,
			type: cc.Node
		}, //衣柜
		clothNext: {
			default: null,
			type: cc.Node
		},
		clothBoxSingleContent: {
			default: null,
			type: cc.Node
		}, //衣柜单品滚动条的节点父亲
		titleScrollView: { //标题栏滚动条  ---衣柜
			default: null,
			type: cc.ScrollView
		},
		titleContent: { //节点父节点
			default: null,
			type: cc.Node
		},
		clothtip: {
			default: null,
			type: cc.Node
		},
		refreshPic: cc.SpriteFrame,
		defaultCloth: {
			default: [],
			type: cc.SpriteFrame
		},
	},

	// LIFE-CYCLE CALLBACKS:

	onLoad() {
		gameManager.curScene = this;
		this.level = 2;
	},

	start() {
		this.tmpRoleListLength = 19;
		if (gameManager.playerData.roleList.length > 0) {
			setTimeout(() => { //角色信息表
				this.homeContent.getComponent('verticalRamark').loadData(gameManager.playerData.roleList);
			}, 300);
		}


		// if (this.homeContent.active)
		// 	this.homeContent.getComponent('verticalRamark').loadData(gameManager.playerData.roleList);
	},
	//人物
	addRole: function () { //生成默认的人物：穿着默认服装的小人   title需要关闭
		this.homeNode.active = true;
		this.itemleScrollView.node.active = false;
		if (this.titleIndex >= 0)
			this.iconContent.children[this.titleIndex].getChildByName('1').active = false;
		//
		this.homeContent.getComponent('verticalRamark').loadData(gameManager.playerData.roleList);
	},
	clickClothBox: function (e, flag) {
		if (flag == 0) {
			this.clothBoxNode.active = true;
		} else if (flag == 1) {
			this.clothBoxNode.active = false;
			gameManager.checkFinishOneRask(6);
		}
	},
	goback: function () {
		//将数据保存到
		gameManager.SetPlayerData(gameManager.playerData); //存储会有问题
		cc.director.loadScene('mainmenu');
	}
	// update (dt) {},
});