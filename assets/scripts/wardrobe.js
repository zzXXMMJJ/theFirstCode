var gameManager = require('GameManager');
cc.Class({ //修改方案只需要展示  上衣、裤子、下裙、连衣裙、鞋子、包包、头饰
	extends: cc.Component,

	properties: {
		btnSingle: {
			default: null,
			type: cc.Node
		},
		btnSuit: {
			default: null,
			type: cc.Node
		},
		singleNode: {
			default: null,
			type: cc.Node
		},
		suitNode: {
			default: null,
			type: cc.Node
		},
		suitContent: {
			default: null,
			type: cc.Node
		},
		singleContent: {
			default: null,
			type: cc.Node
		}
	},

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {},

	start() {
		this.checkAlbum(null, 0); //默认显示套装
		console.log('衣柜调用方法');
	},
	//gameManager.haveHash 已拥有   列表
	checkAlbum: function (e, flag) { //套装  单品
		if (flag == 0) { //套装	gameManager.haveHash[21]
			this.btnSingle.getChildByName('1').active = false;
			this.btnSuit.getChildByName('1').active = true; //更改按钮状态 套装

			this.singleNode.active = false;
			this.suitNode.active = true; //确认是单品

			setTimeout(() => {
				this.suitContent.getComponent('wardrobeRamark').loadData(21);
			}, 300);

		} else if (flag == 1) { //单品:19
			this.btnSingle.getChildByName('1').active = true;
			this.btnSuit.getChildByName('1').active = false;

			this.singleNode.active = true;
			this.suitNode.active = false; //确认是套装

			setTimeout(() => {
				gameManager.curScene.titleContent.getComponent('titleRamark').type = 1;
				gameManager.curScene.titleContent.getComponent('titleRamark').loadtitlePic(); //重新生成标题
				this.singleContent.getComponent('wardrobeRamark').loadData(6); //调用默认的肤色
			}, 300);
		}
		gameManager.curScene.clothNext.active = false;
	},
	goShop: function () { //前往商城
		this.node.active = false;
		gameManager.curScene.clickShop(null, 0);
	},
	//立即装扮
	nextScene: function (e, flag) {
		//区分第一场景和第二场景  第二场景需要询问是否保存当前装扮
		//换上现在选中的装扮  
		this.node.active = false;
		if (flag == 0) { //确认选中的物品   首页 ---新建游戏人物
			gameManager.curScene.GoNextScene();
			// gameManager.curScene.ischeckChange = true;
		} else { //游戏内  
			// if (gameManager.curScene.person.active && gameManager.curScene.ischeckChange) { //询问是否保存当前装扮
			// 	if (gameManager.curScene.tipSave.active == false) { //----还没有做界面
			// 		gameManager.curScene.tipSave.active = true;
			// 		return;
			// 	}
			// 	gameManager.curScene.tmpRoleList = gameManager.tmpRoleList;
			// 	gameManager.tmpRoleList = null;
			// 	console.log('列表是否被清空：' + gameManager.curScene.tmpRoleList, gameManager.tmpRoleList);
			// 	gameManager.curScene.addClothForPerson();
			// 	gameManager.curScene.ischeckChange = true;
			// } else { //直接新建 调用装扮
			if (gameManager.curScene.person.active == false) { //如果当前场景没有人 就新建  有人 直接换上装扮
				gameManager.curScene.addDefaultPerson();
			}
			gameManager.curScene.tmpRoleList = gameManager.tmpRoleList;
			// gameManager.tmpRoleList = null;
			gameManager.curScene.addClothForPerson();
			gameManager.curScene.ischeckChange = true;
			// }
			e.target.active = false;
			//背景和贴图
		}


	},
	// update (dt) {},
});