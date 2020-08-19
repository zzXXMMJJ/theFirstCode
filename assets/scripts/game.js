var gameManager = require('GameManager');
cc.Class({
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
		recommendNode: { //推荐
			default: null,
			type: cc.Node
		},
		buySuccessNode: { //购买成功
			default: null,
			type: cc.Node
		},
		levelNode: {
			default: null,
			type: cc.Node
		},
		tipSave: { //提示保存-----用通用弹窗好点
			default: null,
			type: cc.Node
		},
		tipSuccess: cc.Node, //提示购买成功
		//sub
		titleScrollView: { //标题栏滚动条  ---衣柜
			default: null,
			type: cc.ScrollView
		},
		titleContent: { //节点父节点
			default: null,
			type: cc.Node
		},
		iconScrollView: { //标题栏滚动条--游戏
			default: null,
			type: cc.ScrollView
		},
		iconContent: { //节点父节点
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
		suitNode: { //套装父节点
			default: null,
			type: cc.Node
		},
		suitScrollView: { //套装滚动条
			default: null,
			type: cc.ScrollView
		},
		suitContent: { //节点父节点
			default: null,
			type: cc.Node
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
		shopNode: {
			default: null,
			type: cc.Node
		}, //商店
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

		levelLabel: cc.Label, //分数
		coinLabel: cc.Label,
		//ui
		btnNode: cc.Node,
		camaraPic: cc.Sprite,
		shotCam1: cc.Camera, //主场景摄像机
		shotCam2: cc.Camera, //打分  摄像机
		savePhotoNode: cc.Node,
		//截图界面的图片节点
		//默认装扮:头发  眉毛 眼睛  嘴巴  衣服 裤子
		// hairfont hairback eyebrow eyes mouth cloth trouser
		refreshPic: cc.SpriteFrame,
		defaultCloth: {
			default: [],
			type: cc.SpriteFrame
		},
	},
	// LIFE-CYCLE CALLBACKS:
	//物品分类：肤色0  眉毛1 眼睛 2嘴巴3  腮红 4头发5  衣服6  裤子7  裙子8 连衣裙9 外套10  袜子11  鞋子12
	//   耳环13 首饰 14 眼镜 15 头饰 16 包包 17  翅膀 18  贴纸 19  --需要记录到角色            背景 套装  组合
	onLoad() { //初始界面显示选择角色的界面

		// 游戏进入后台时触发
		cc.game.on(cc.game.EVENT_HIDE, function () {
			if (gameManager.bgMusicChannel != undefined && !gameManager.isCloseMusic) {
				cc.audioEngine.pause(gameManager.bgMusicChannel);
				console.log("切后台暂停音效");
			}
		}.bind(this));
		// 游戏进入前台时触发
		cc.game.on(cc.game.EVENT_SHOW, function () {
			if (gameManager.bgMusicChannel != undefined && !gameManager.isCloseMusic) {
				cc.audioEngine.resume(gameManager.bgMusicChannel);
			}
		}.bind(this));
		gameManager.curScene = this;
		this.level = 1;
		this.checkChangeIndex = -1;
		this.titleType = -1;

		this.bodyclothList = new Array();

		this.clothBoxIndex = 0;

		this.subIndex = -1;

		// if (gameManager.playerData.roleList.length > 0) {
		setTimeout(() => { //角色信息表
			// this.homeContent.getComponent('verticalRamark').loadData(gameManager.playerData.roleList);
			this.checkSuit();
		}, 300);
		// }

		//金币
		this.coinLabel.string = gameManager.playerData.coins;
		this.picScale = this.camaraPic.node.scaleX;
	},
	onDestroy() {
		gameManager.tmpRoleList = null;
		gameManager.curScene = null;
	},
	start() { //生成默认角色 ：如果是带着数据过来的
		this.tmpRoleListLength = 19;
		if (gameManager.tmpRoleList) {
			this.addDefaultPerson(); //先添加默认
			this.tmpRoleList = gameManager.tmpRoleList; //直接装扮上
			gameManager.tmpRoleList = null;
			this.addClothForPerson();
			this.ischeckChange = true; //从首页进入
		} else {
			this.tmpRoleList = {}; //记录当前角色信息 索引:应该不需要记录背景和贴图  ---不好使用截图  最好使用图片索引 不要使用节点索引   去掉了贴图
			for (let i = 0; i < this.tmpRoleListLength; i++) {
				let obj = {
					'index': -1,
					'active': true
				};
				this.tmpRoleList[gameManager.classifyNameList[i]] = obj;
			}
			//默认调用 角色
			this.person.active = false; //默认界面上没有人物
		}
		// if (gameManager.bgIndex >= 0) {
		// 	let tmpmsgindex = gameManager.getAllHashIndex(20, gameManager.bgIndex);
		// 	// this.node.getComponent(cc.Sprite).spriteFrame=gameManager.haveHash[20].messageList[tmpmsgindex];
		// 	gameManager.LoadImage(20, tmpmsgindex, this.node, gameManager.allItemHash[20].messageList[tmpmsgindex]);
		// 	gameManager.bgIndex = -1;
		// }
		// if (gameManager.stickIndex >= 0) {
		// 	let movenode = cc.instantiate(this.moveItem);
		// 	movenode.parent = this.stickerNode;
		// 	movenode.active = true;
		// 	movenode.x = 150;
		// 	movenode.y = 500;
		// 	let tmpmsgindex = gameManager.getAllHashIndex(19, gameManager.stickIndex);
		// 	console.log('sssdffa' + tmpmsgindex);
		// 	gameManager.LoadImage(19, tmpmsgindex, movenode, gameManager.allItemHash[19].messageList[tmpmsgindex]);
		// 	gameManager.stickIndex = -1;
		// }
	},
	clickCoinNo: function (e, flag) {
		if (flag) { //观看视频广告+50金币

		}
		cc.find('Canvas/tipcoinvedio').active = false;
	},
	clickCoinOk: function (e, flag) {
		if (flag) { //关闭当前其他弹窗（商店、推荐）  前往衣柜 
			if (cc.find('Canvas/shop').active)
				cc.find('Canvas/shop').active = false;
			if (cc.find('Canvas/recommend').active)
				cc.find('Canvas/recommend').active = false;
			cc.find('Canvas/wardrobeNode').active = true;
		}
		cc.find('Canvas/tipSuccess').active = false;
	},
	clickDel: function () { //点击清空按钮
		cc.find('Canvas/tipdel').active = true;
	},
	clickDelcheck: function (e, flag) { //点击清空按钮
		cc.find('Canvas/tipdel').active = false;
		if (flag) {
			this.addDefaultPerson(null, 1);
		}
	},
	addDefaultPerson: function (e, flag) { //添加默认角色装扮
		if (flag == 0 && this.person.active && this.ischeckChange) { //点击了新建按钮
			this.isave = 0; //确认新建
			this.tipSave.active = true;
			return;
		}
		//
		this.checkChangeIndex = this.homeContent.childrenCount;
		console.log('第几次新建：' + this.checkChangeIndex);
		let role = this.person.getChildByName('body'); //其他置空或隐藏
		for (let i = 0; i < role.childrenCount; i++) {
			role.children[i].active = true;
			if (role.children[i].name == 'body' || role.children[i].name == 'hands') {
				console.log(role.children[i].name)
			} else
				role.children[i].getComponent(cc.Sprite).spriteFrame = null;
		}
		//肤色
		role.getChildByName('hands').color = new cc.Color(255, 255, 255);
		role.getChildByName('body').color = new cc.Color(255, 255, 255);

		role.getChildByName('hairfont').getComponent(cc.Sprite).spriteFrame = this.defaultCloth[0];
		role.getChildByName('hairback').getComponent(cc.Sprite).spriteFrame = this.defaultCloth[1];
		role.getChildByName('eyebrow').getComponent(cc.Sprite).spriteFrame = this.defaultCloth[2];
		role.getChildByName('eyes').getComponent(cc.Sprite).spriteFrame = this.defaultCloth[3];
		role.getChildByName('mouth').getComponent(cc.Sprite).spriteFrame = this.defaultCloth[4];
		role.getChildByName('cloth').getComponent(cc.Sprite).spriteFrame = this.defaultCloth[5];
		role.getChildByName('trouser').getComponent(cc.Sprite).spriteFrame = this.defaultCloth[6];

		this.person.active = true;

		//如何根据保存的数据添加人物角色着装	//初始化数据

		//创建默认  重新初始数据
		this.tmpRoleList = {};
		for (let i = 0; i < this.tmpRoleListLength; i++) {
			let obj = {
				'index': -1,
				'active': true
			};
			this.tmpRoleList[gameManager.classifyNameList[i]] = obj;
		}
		if (flag == 1) //如果是手动清空所有装扮的话
			gameManager.tmpRoleList = null;
		//flag  1  还原到初始着装  清空背景 贴图
		this.node.getComponent(cc.Sprite).spriteFrame = this.defaultCloth[7];
		if (this.stickerNode.childrenCount > 0) {
			for (let i = 0; i < this.stickerNode.childrenCount; i++) {
				this.stickerNode.children[i].destroy();
			}
		}
	},
	//如果是套装：根据tmpRoleList直接进入游戏为人物穿上衣服  
	addClothForPerson: function (e, flag) { //游戏内的衣柜   游戏外的衣柜		//this.tmpRoleList
		let role = this.person.getChildByName('body');

		for (let i = 0; i < this.tmpRoleListLength; i++) { //19
			let str = gameManager.classifyNameList[i];
			let index = this.tmpRoleList[gameManager.classifyNameList[i]].index; //有为空的情况
			let active = this.tmpRoleList[gameManager.classifyNameList[i]].active;
			if (i == 0) { //肤色:色值
				if (index >= 0) {
					let tmpmsgindex = gameManager.getAllHashIndex(i, index);
					let colorstr = '#' + gameManager.allItemHash[i].messageList[tmpmsgindex].color;
					role.getChildByName('hands').color = role.getChildByName('body').color.fromHEX(colorstr);
					role.getChildByName('body').color = role.getChildByName('body').color.fromHEX(colorstr);
				}
				role.getChildByName('hands').active = active;
			} else if (i == 5) { //头发：前发、后发
				if (index >= 0) {
					let tmpmsgindex = gameManager.getAllHashIndex(i, index);
					gameManager.LoadImage(i, tmpmsgindex, role.getChildByName('hairfont'), gameManager.allItemHash[i].messageList[tmpmsgindex]); //图片：如果没有的话从服务器加载

					//如果有后发的话
					if (active) gameManager.LoadImage(i, tmpmsgindex, role.getChildByName('hairback'), gameManager.allItemHash[i].messageList[tmpmsgindex].list);
				}
				role.getChildByName('hairback').active = active;
			} else { //需要考虑 衣服 裤子 裙子 连衣裙 外套共存的问题
				if (index >= 0) {
					let tmpmsgindex = gameManager.getAllHashIndex(i, index);
					gameManager.LoadImage(i, tmpmsgindex, role.getChildByName(str), gameManager.allItemHash[i].messageList[tmpmsgindex]);
					role.getChildByName(str).active = active;
				}
			}
			gameManager.tmpRoleList = null;
		}
	},

	openSavetip: function () {
		//在新建角色和退出游戏时提示
		this.tipSave.active = true;
		this.isave = 1; //确认返回
	},
	// closeSaveTip: function () {
	// 	this.tipSave.active = false;

	// },
	//保存:将当前已经存好的数据索引存放进roleList同时生成一个子结点
	isCheckSave: function (e, flag) { //退出  新建
		if (flag == 1) this.saveRole(); //确认保存	
		this.tipSave.active = false; //关闭弹窗
		if (this.isave) {
			this.goBack();
		} else {
			this.addDefaultPerson();
		}
	},
	saveRole: function () {
		if (this.ischeckChange && this.person.active) { //新建角色是否需要
			//如果修改的是之前有的 不需要//如果当前的角色被删除
			if (this.checkChangeIndex >= 0 && gameManager.playerData.roleList[this.checkChangeIndex]) {
				gameManager.playerData.roleList[this.checkChangeIndex] = this.tmpRoleList;
			} else { //如果是当前的只能保存一次
				gameManager.playerData.roleList.push(this.tmpRoleList);
			}
		} else {
			return;
		}

		gameManager.checkFinishOneRask(2); //保存一套装扮

		this.ischeckChange = false;
		// this.ischeckIndex=new Array(4);
		//需要在保存前修改 共有关系
		//如果修改的是之前有的 不需要  如果是当前的只能保存一次

	},
	closeRecommand: function () {
		this.recommendNode.active = false;
		this.recommendNode.getChildByName('ok').active = false;
	},
	goBack: function (e, flag) { //提示是否保存角色
		if (flag && this.person.active && this.ischeckChange) {
			this.tipSave.active = true;
			this.isave = 1; //确认返回
			return;
		}
		//将数据保存到
		gameManager.SetPlayerData(gameManager.playerData); //存储会有问题
		cc.director.loadScene('rolescene');
	},
	getSortList: function (list) { //倒序 
		for (let i = 0; i < list.length; i++) {
			for (let k = 0; k < list.length - 1 - i; k++) {
				let num1 = parseInt(list[k].name);
				let num2 = parseInt(list[k + 1].name);
				if (num1 < num2) {
					let temp = list[k];
					list[k] = list[k + 1];
					list[k + 1] = temp;
				}
			}
		}
	},
	//人物
	addRole: function () { //生成默认的人物：穿着默认服装的小人   title需要关闭
		this.homeNode.active = true;
		this.itemleScrollView.node.active = false;
		this.suitNode.active = false;
		if (this.titleIndex >= 0)
			this.iconContent.children[this.titleIndex].getChildByName('1').active = false;
		//
		this.homeContent.getComponent('verticalRamark').loadData(gameManager.playerData.roleList);
	},
	//套装
	checkSuit: function () { //显示已拥有（默认）、未拥有
		// this.homeNode.active = false;
		this.itemleScrollView.node.active = false;
		this.suitNode.active = true;
		if (this.titleIndex >= 0)
			this.iconContent.children[this.titleIndex].getChildByName('1').active = false;

		this.checkSuitList(null, 0); //默认显示已拥有
	},
	//已拥有  未拥有
	checkSuitList: function (e, flag) {
		let list = new Array();
		this.suitScrollView.node.active = true;
		if (flag == 0) { //已拥有
			let tmpArr = gameManager.allSuitHash.messageList
			for (let i = 0; i < tmpArr.length; i++) {
				if (tmpArr[i].isOver == 1) {
					list.push(tmpArr[i])
				}
			}
			if (list.length <= 0) {
				//显示
				console.log('没有已拥有套装');
				this.suitNode.getChildByName('tip').active = true;
				this.suitScrollView.node.active = false;
			} else {
				this.suitNode.getChildByName('tip').active = false;
				this.suitScrollView.node.active = true;
				setTimeout(() => { //脚本初始化需要时间  如果立即调用 
					this.suitContent.getComponent('verticalRamark').loadData(list); //传信息列表
				}, 300);
			}
		} else if (flag == 1) { //未拥有
			if (this.suitNode.getChildByName('tip').active) { //关闭未拥有提示
				this.suitNode.getChildByName('tip').active = false;
			}

			this.suitScrollView.node.active = true;
			let tmpArr = gameManager.allSuitHash.messageList
			for (let i = 0; i < tmpArr.length; i++) {
				if (tmpArr[i].isOver == 0) {
					list.push(tmpArr[i])
				}
			}
			setTimeout(() => {
				this.suitContent.getComponent('verticalRamark').loadData(list); //传信息列表
			}, 300);
		}
	},
	//退出游戏 保存游戏在保存角色
	test: function (e, index) { //测试按钮是否有效 :关闭其他的显示 生成当前节点的下的图片节点
		let node = e.target;
		if (node.getChildByName('1').active) {
			node.getChildByName('1').active = false;
		} else {
			for (let i = 0; i < node.parent.childrenCount; i++) {
				node.parent.children[i].getChildByName('1').active = false; //关闭其他选中
				//生成相应图片节点
			}
			node.getChildByName('1').active = true;
		}
		//只需要把当前角色数据放入到本地
	},
	//商店
	clickShop: function (e, flag) { //生成商店：推荐  套装   组合
		if (flag == 0) { //开启弹窗
			this.shopNode.active = true;
			gameManager.playerData = gameManager.GetPlayerData() ? gameManager.GetPlayerData() : gameManager.playerData;
			//初始化界面
			let coinode = this.shopNode.getChildByName('bg').getChildByName('coinnum').getChildByName('numbg').getChildByName('coinNum').getComponent(cc.Label);
			coinode.string = gameManager.playerData.coins;
		} else if (flag == 1) { //关闭弹窗
			this.shopNode.active = false;
			gameManager.checkFinishOneRask(3);
		}
	},
	//衣柜
	clickClothBox: function (e, flag) {
		if (flag == 0) {
			this.clothBoxNode.active = true;
		} else if (flag == 1) {
			this.clothBoxNode.active = false;
			gameManager.checkFinishOneRask(6);
		}
	},

	//截图 镜像  保存截图到相册 保存角色  移动 分享  音乐  衣柜  商城  打分
	BtnShare: function () {
		// if (!gameManager.isCloseMusic)
		// 	cc.audioEngine.play(this.clickMusic, false, 0.5);
		if (cc.sys.platform !== cc.sys.WECHAT_GAME) return;
		this.scheduleOnce(function () {
			if (gameManager.channel == "wx") {
				let url = gameManager.getShareTitle();
				wx.shareAppMessage({
					title: url,
					imageUrl: 'images/sharePic.png',
				});
			} else if (gameManager.channel == "qq") {
				qq.shareAppMessage({
					title: "马卡龙少女！",
					imageUrl: 'images/sharePic.png',
				});
			} else if (gameManager.channel == "tt") {
				tt.shareAppMessage({
					success() {
						// console.log('分享视频成功');
					},
					fail(e) {
						console.log('分享视频失败');
					}
				})
			}
		}, 0.2)
	},
	btnCamara: function (e, flag) { //---会变黑---头条有半透明		

		let scrollflag = false;
		//隐藏ui
		this.camaraPic.spriteFrame = null;
		this.personPos = this.person.position;
		this.person.position = cc.v2(0, 0);
		//换一种
		this.camaraPic.node.scaleX = this.picScale; // 0.45; //---确认不修改图片
		this.camaraPic.spriteFrame = this.ScreenShort(flag); //

		//保存到相册
		// camera.active = false;
		//保存到本地 image/png
	},
	//点击相机 进行的截屏操作
	ScreenShort: function (flag) {
		// let targetNode = this.targetNode;
		let tempRenenderTexture = new cc.RenderTexture();
		let gl = cc.game._renderContext;

		tempRenenderTexture.initWithSize(Math.floor(cc.winSize.width), Math.floor(cc.winSize.height), gl.STENCIL_INDEX8); //cc.winSize.width, cc.winSize.height,
		this.shotCam = flag == 0 ? this.shotCam1 : this.shotCam2;
		this.shotCam.targetTexture = tempRenenderTexture;
		this.shotCam.render();
		let height = Math.floor(cc.winSize.height); //Math.floor(this.person.height);
		let width = Math.floor(cc.winSize.width); // Math.floor(this.person.width); 
		let data = tempRenenderTexture.readPixels();

		let canvas = document.createElement('canvas');
		let ctx = canvas.getContext('2d');
		canvas.width = width // Math.floor(cc.winSize.width);
		canvas.height = height //Math.floor(cc.winSize.height);
		//具有指定尺寸的新空白对象 所有像素均为透明黑色 参数为0抛出异常
		let imageData = ctx.createImageData(width, height); //改成全屏 4*720*1280
		//从中心开始渲染
		let ctxStartPosX = 0 //Math.floor((cc.winSize.width - 1) / 2) - Math.floor((this.person.width - 1) / 2) + Math.floor(this.person.position.x);
		let ctxStartPosY = 0 // Math.floor((cc.winSize.height - 1) / 2) - Math.floor((this.person.height - 1) / 2) + Math.floor(this.person.position.y);
		for (let y = 0; y < height; y++) { //1280
			for (let x = 0; x < width; x++) { //720
				let ctxIndex = ((height - 1 - y) * width + x) * 4;
				let dataIndex = (Math.floor(y + ctxStartPosY) * Math.floor(cc.winSize.width) + Math.floor(x + ctxStartPosX)) * 4;
				imageData.data[ctxIndex] = data[dataIndex]; //imagedata种每个像素都包含4个r g b a
				imageData.data[ctxIndex + 1] = data[dataIndex + 1];
				imageData.data[ctxIndex + 2] = data[dataIndex + 2];
				imageData.data[ctxIndex + 3] = data[dataIndex + 3] > 0 ? 255 : 0; //; 
			}
		}
		ctx.putImageData(imageData, 0, 0); //将来自给定ImageData对象的数据绘制到画布上  imageData dx dy

		let tempTex = new cc.Texture2D();
		tempTex.initWithElement(canvas);

		this.person.position = this.personPos;
		this.savePhotoNode.active = true;
		this.tmpCanvas = canvas;
		// this.saveFile(canvas);//直接先保存
		return new cc.SpriteFrame(tempTex);
	},
	closePhoto: function () {
		this.savePhotoNode.active = false;
	},
	saveFile() { //保存图片到用户相册, pic
		let tempTex = this.tmpCanvas;
		if (cc.sys.platform !== cc.sys.WECHAT_GAME) return
		if (gameManager.channel == 'tt') //并且获取到用户权限 
		{
			tempTex.toTempFilePath({
				x: 0,
				y: 0,
				width: tempTex.width,
				height: tempTex.height,
				destWidth: tempTex.width,
				destHeight: tempTex.height,
				success: (res) => {
					this.imageUrl = res.tempFilePath;
					console.log('成功获取到路径');
					tt.saveImageToPhotosAlbum({
						filePath: this.imageUrl,
						success(res) {
							console.log(`saveImageToPhotosAlbum调用成功`);
						},
						fail(res) {
							console.log(`saveImageToPhotosAlbum调用失败`);
						}
					});
				},
				fail: (res) => {
					console.log('截图保存相册获取路径失败');
				},
			})
			// console.log(this.imageUrl);
		} else if (gameManager.channel == 'wx') {
			tempTex.toTempFilePath({
				x: 0,
				y: 0,
				width: tempTex.width,
				height: tempTex.height,
				destWidth: tempTex.width,
				destHeight: tempTex.height,
				success(res) {
					this.imageUrl = res.tempFilePath;
					wx.saveImageToPhotosAlbum({
						filePath: this.imageUrl,
						success(res) {
							console.log(`saveImageToPhotosAlbum调用成功`);
						},
						fail(res) {
							console.log(`saveImageToPhotosAlbum调用失败`);
						}
					});
					console.log('获取临时路径成功');
				}
			})
		} else if (gameManager.channel == 'qq') {
			tempTex.toTempFilePath({
				x: 0,
				y: 0,
				width: tempTex.width,
				height: tempTex.height,
				destWidth: tempTex.width,
				destHeight: tempTex.height,
				success(res) {
					this.imageUrl = res.tempFilePath;
					qq.saveImageToPhotosAlbum({
						filePath: this.imageUrl,
						success(res) {
							console.log(`saveImageToPhotosAlbum调用成功`);
						},
						fail(res) {
							console.log(`saveImageToPhotosAlbum调用失败`);
						}
					});
					console.log('获取临时路径成功');
				}
			})
		}
	},
	clickUpDown: function (e) { //上下
		// 向下移动 353.6
		let that = this;
		//先禁用
		e.target.getComponent(cc.Button).interactable = false;
		if (!this.clickUpDownFlag) {
			// this.btnNode.getChildByName('shop').runAction(cc.moveBy(0.3, cc.v2(0, -353.6)));
			this.btnNode.getChildByName('down').runAction(cc.sequence(cc.moveBy(0.3, cc.v2(0, -353.6)), cc.callFunc(function () {
				that.btnNode.getChildByName('down').scaleY = -1;
				//人物也应该跟着移到中间吧
				that.clickUpDownFlag = 1;
				e.target.getComponent(cc.Button).interactable = true;
			})));
			this.btnNode.getChildByName('delete').runAction(cc.moveBy(0.3, cc.v2(0, -353.6)));
			// this.btnNode.getChildByName('wardrobe').runAction(cc.moveBy(0.3, cc.v2(0, -353.6)));
			this.node.parent.getChildByName('itemSub').runAction(cc.moveBy(0.3, cc.v2(0, -353.6)));
			this.person.runAction(cc.moveBy(0.3, cc.v2(0, -202)));
		} else {
			// this.btnNode.getChildByName('shop').runAction(cc.moveBy(0.3, cc.v2(0, 353.6)));
			this.btnNode.getChildByName('down').runAction(cc.sequence(cc.moveBy(0.3, cc.v2(0, 353.6)), cc.callFunc(function () {
				that.btnNode.getChildByName('down').scaleY = 1;
				//人物也应该跟着移到中间吧
				that.clickUpDownFlag = 0;
				e.target.getComponent(cc.Button).interactable = true;
			})));
			this.btnNode.getChildByName('delete').runAction(cc.moveBy(0.3, cc.v2(0, 353.6)));
			// this.btnNode.getChildByName('wardrobe').runAction(cc.moveBy(0.3, cc.v2(0, 353.6)));
			this.node.parent.getChildByName('itemSub').runAction(cc.moveBy(0.3, cc.v2(0, 353.6)));
			this.person.runAction(cc.moveBy(0.3, cc.v2(0, 202)));
		}
	},
	closeCamara: function () {
		this.savePhoto.active = false;
	},
	mirror: function () { //图片镜像
		this.camaraPic.node.scaleX = -this.camaraPic.node.scaleX;
	},
	//打分系统：发型 5   上衣 6 裤子7 裙子 8 连衣裙 9 外套 10 鞋子 12 包包 17 翅膀 18 头饰 16
	clickLevel: function () { //prilevel  位置 0 ：头发  头饰  1 上衣 外套 包包 连衣裙  2 裤子 裙子 3 翅膀 4 鞋子
		if (this.style) this.style.opacity = 0;
		let levelNameList = [5, 6, 7, 8, 9, 10, 12, 16, 17, 18]; //classifyIndex
		let tmpLevelList = new Array();
		let levelcount = 0;
		// this.tmpRoleList 需要   默认和没有打分项得都提示  装扮不够 提示前往装扮
		for (let item in this.tmpRoleList) {
			for (let i = 0; i < levelNameList.length; i++) {
				if (gameManager.classifyNameList[levelNameList[i]] == item) { //检测打分项
					// console.log('检测现有装扮：' + item); //头发存的是后发的active
					if (this.tmpRoleList[item].index >= 0 && (levelNameList[i] == 5 || this.tmpRoleList[item].active == true)) { //打分项有装扮
						let obj = {
							index: -1,
							level: 0,
							style: ''
						}
						// let tmpmsgindex=gameManager.getAllHashIndex(i,index);
						let tmpindex = this.getListIndex(this.tmpRoleList[item].index, gameManager.allItemHash[levelNameList[i]].messageList);
						obj.level = gameManager.allItemHash[levelNameList[i]].messageList[tmpindex].prilevel;
						obj.index = levelNameList[i];
						obj.style = gameManager.allItemHash[levelNameList[i]].messageList[tmpindex].Pri_attribute;
						levelcount += obj.level; //计算得到的总分
						tmpLevelList.push(obj);
					}
				}
			}
		}
		if (tmpLevelList.length <= 0) {
			//tip提示无法进入打分
			console.log('tip提示无法进入打分');
			cc.find('Canvas/tiplevel').active = true;
		} else {
			//进入打分
			this.levelNode.active = true;
			//初始化人物形象//需要把所有子节点全部复制过去
			let role = this.person.getChildByName('body');
			let body = this.levelNode.getChildByName('person').getChildByName('body');
			for (let m = 0; m < role.childrenCount; m++) {
				if (role.children[m].name == 'body' || role.children[m].name == 'hands') {
					body.children[m].color = role.children[m].color;
					body.children[m].active = role.children[m].active;
				} else {
					body.children[m].active = role.children[m].active;
					body.children[m].getComponent(cc.Sprite).spriteFrame = role.children[m].getComponent(cc.Sprite).spriteFrame;
				}
			}

			let subnode = this.levelNode.getChildByName('sub');
			let num = subnode.getChildByName('num').getComponent(cc.Label);
			let progressBar = subnode.getChildByName('progressBar').getComponent(cc.ProgressBar);
			let star = progressBar.node.getChildByName('star');

			star.x = -306.5; //613 
			num.string = 0;
			progressBar.progress = 0;
			//
			this.tmpLevelList = tmpLevelList;
			this.countlevel = 0; //第几个装扮

			this.levelcount = levelcount; //总分
			console.log('zongfen:' + levelcount);
			this.tmplevel = 0; //当前多少分  用于计算进度条进度

			//开始自动打分
			// star.x+=(613*progressBar.progress);//粒子的位置跟着进度一起运动

			//按顺序自动打分 动画 --》粒子移动-》进度条+粒子移动
			this.playheart();
			//第五个任务 
			gameManager.checkFinishOneRask(5); //完成一次打分
		}
	},
	closeTiplevel: function () {
		cc.find('Canvas/tiplevel').active = false;
	},
	getMaxIndex: function () { //以分数最高的作为风格的确定
		let max = 0;
		let str = '';
		let list = this.tmpLevelList;
		for (let i = 0; i < list.length; i++) {
			if (list[i].level > max) { //得到最高分
				max = list[i].level;
				str = list[i].style;
			}
		}
		console.log('str:' + str);
		return str;
	},
	//执行动作
	playheart: function () { //确定
		let posNode = this.levelNode.getChildByName('pos');
		let effectNode = this.levelNode.getChildByName('effect');
		let item = this.tmpLevelList[this.countlevel];

		//更新分数
		let subnode = this.levelNode.getChildByName('sub');
		let particle = this.levelNode.getChildByName('particle'); //粒子
		let startparticle = this.levelNode.getChildByName('particle'); //粒子
		let num = effectNode.getChildByName('mid').getChildByName('level').getComponent(cc.Label);
		num.string = item.level; //心心上面的分数

		this.tmplevel += item.level;

		if (item.index == 5 || item.index == 16) { //0
			effectNode.position = posNode.children[0].position;
			effectNode.getComponent(cc.Animation).on('finished', this.animFinish, this);
			effectNode.active = true;
			effectNode.getComponent(cc.Animation).play();
		} else if (item.index == 12) { //4
			effectNode.position = posNode.children[4].position;
			effectNode.getComponent(cc.Animation).on('finished', this.animFinish, this);
			effectNode.active = true;
			effectNode.getComponent(cc.Animation).play();
		} else if (item.index == 7 || item.index == 8) { //2
			effectNode.position = posNode.children[2].position;
			effectNode.getComponent(cc.Animation).on('finished', this.animFinish, this);
			effectNode.active = true;
			effectNode.getComponent(cc.Animation).play();
		} else if (item.index == 18) { //3
			effectNode.position = posNode.children[3].position;
			effectNode.getComponent(cc.Animation).on('finished', this.animFinish, this);
			effectNode.active = true;
			effectNode.getComponent(cc.Animation).play();
		} else { //1
			effectNode.position = posNode.children[1].position;
			effectNode.getComponent(cc.Animation).on('finished', this.animFinish, this);
			effectNode.active = true;
			effectNode.getComponent(cc.Animation).play();
		}
		//
		particle.position = effectNode.position;
		startparticle.active = true;
	},
	getListIndex: function (index, list) {
		for (let i = 0; i < list.length; i++) {
			if (list[i].index == index) {
				return i;
			}
		}
	},
	animFinish: function () {
		let that = this;
		console.log('动画组件调用' + this.countlevel, this.tmpLevelList.length);
		this.countlevel++;
		//粒子移动到进度条
		let subnode = this.levelNode.getChildByName('sub');

		let startparticle = this.levelNode.getChildByName('particle'); //粒子
		let progressBar = subnode.getChildByName('progressBar').getComponent(cc.ProgressBar);
		let star = progressBar.node.getChildByName('star');
		let endparticle = progressBar.node.getChildByName('particle');


		// setTimeout(() => {
		startparticle.runAction(cc.sequence(cc.moveTo(1, subnode.position), cc.callFunc(function () {
			startparticle.active = false;
			endparticle.active = true;
			setTimeout(() => {
				endparticle.active = false;
				//修改进度条
				let tmp = progressBar.progress;
				let endtmp = that.tmplevel / that.levelcount;

				let a = Math.round((endtmp - tmp) / 0.01);

				that.schedule(function () {
					progressBar.progress += 0.01;

					let x = (613 * (endtmp - tmp)) / a;
					star.runAction(cc.moveBy((0.5 / a), cc.v2(x, 0)));

				}, (0.5 / a), a); //间隔时间  次数

				//修改总分
				let num = subnode.getChildByName('num').getComponent(cc.Label);
				num.string = that.tmplevel;

				setTimeout(() => {
					if (that.countlevel < that.tmpLevelList.length) {
						that.playheart();
					} else if (that.countlevel == that.tmpLevelList.length) {
						let childstr = that.getMaxIndex();
						that.style = that.levelNode.getChildByName('style').getChildByName(childstr);
						that.style.active = true;
						//结束时显示风格和总分 //打分系统：发型 5   上衣 6 裤子7 裙子 8 连衣裙 9 外套 10 鞋子 12 包包 17 翅膀 18 头饰 16
						style.runAction(cc.fadeIn(3));
						// that.levelNode.getChildByName('num').getComponent(cc.Label).string = that.tmplevel;
						// that.levelNode.getChildByName('num').active = true;
						// that.levelNode.getChildByName('num').runAction(cc.fadeIn(3));
					}
				}, 300);
			}, 500);
		})));
		// }, 500);
	},
	closelevel: function () {
		this.levelNode.active = false;
	},

	update(dt) {

	},
});