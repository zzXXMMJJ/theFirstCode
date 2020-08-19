window.ObjectNume = { //存储路径：服务器路径  预制路径
	prefab_shop_suit: 'prefab/item_suit',
	prefab_shop_group: 'prefab/item_group',
	prefab_title: 'prefab/shop/item_title',

	httpUrl: 'https://makalong-1300278118.cos.ap-chengdu.myqcloud.com/', //1/pic/002.png
};

module.exports = {
	channel: 'tt',
	isHasAd: false,
	unLockPictureFlag: 2,
	isCloseMusic: false, //是否关闭音效
	adsManager: null,
	bgMusic: null,
	isToutiao: true,
	isStart: true,
	isShowAppBox: false,

	isNew: 0, //是否有添加线上资源更新

	bannerid: null, //在线开关
	initid: null,
	videoid: null,

	recorder: null, //录屏相关处理
	pickId: 1,
	recorderFlag: false,

	httpUrl: '', //服务器地址

	//用来装图片的容器  数据  图片
	allItemHash: [], //总容器
	wishingHash: [], //许愿池
	haveWishingHash: [],
	tuijianHash: [],
	//大厅展示角色
	//需要记录玩家当天看视频数量 //
	playerData: {
		coins: 200,
		roleList: [], //玩家数据肯定要存入本地的
		clothList: [], //玩家已拥有
		curRoleIndex: 0,
		signTime: "2020-6-29"
	},
	// 金币数量   衣柜：玩家已经拥有的部件及套装列表  创建角色列表  角色数据信息 大厅展示角色 //上次进入游戏的日期
	//存储玩家数据
	SetPlayerData: function (value) {
		cc.sys.localStorage.setItem('PlayerData', JSON.stringify(value));
	},
	GetPlayerData: function () {
		let str = cc.sys.localStorage.getItem('PlayerData');
		if (str)
			str = JSON.parse(str);
		return str;
	},
	updatePlayerCoins: function (num) { //更新玩家金币
		if (num >= 0) { //收入
			this.playerData.coins += num;
		} else { //支出
			if (this.playerData.coins + num < 0) { //金币不足 无法购买该物品
				return false;
			} else { //成功买入该物品
				this.playerData.coins += num;
			}
		}
		return true; //不知道能不能行
	},
	// 0 签到  1 商城  2 进入游戏  3 视频 4 衣橱  5 打工 6 许愿池//3个
	raskAllList: [], // raskAllList: ['完成签到', '获得一件服饰', '保存1套装扮', '打开商城逛逛', '观看1个广告', '完成1次打分', '打开衣橱逛逛', '观看3个广告'],//从十个列表中取三个
	raskData: {
		coin: 200,
		raskList: [{
			'index': 0,
			'state': false
		}, {
			'index': 0,
			'state': false
		}, {
			'index': 0,
			'state': false
		}],
		time: undefined,
		isOver: false,
		single: 0,
		double: 0
	},
	//存储任务数据
	SetRaskData: function (value) { //确认是否需要更新每日任务
		cc.sys.localStorage.setItem('RaskData', JSON.stringify(value));
	},
	GetRaskData: function () {
		let str = cc.sys.localStorage.getItem('RaskData');
		if (str)
			str = JSON.parse(str);
		return str;
	},
	checkFinishOneRask: function (num) {
		let flag = false;
		for (let i = 0; i < this.raskData.raskList.length; i++) {
			if (this.raskData.raskList[i].index == num) {
				this.raskData.raskList[i].state = true; //该任务已完成
			}
			if (this.raskData.raskList[i].state == false) {
				flag = true;
			}
		}
		if (flag == false) { //全部完成可以领取
			this.raskData.isOver = true;
		}
		this.SetRaskData(this.raskData);
	},

	//存储签到数据//已经到了第几天
	signData: { //默认
		time: undefined,
		dayIndex: undefined,
		clothIndex: undefined,
		single: 0,
		double: 0,
		picIndex: undefined
	},
	SetSignData: function (value) {
		cc.sys.localStorage.setItem('SignData', JSON.stringify(value))
	},
	GetSignData: function () {
		let str = cc.sys.localStorage.getItem('SignData');
		if (str)
			str = JSON.parse(str);
		return str;
	},

	//是否开启音乐
	SetMusicFlag: function (value) { //存取音乐
		cc.sys.localStorage.setItem('MusicFlag', value);
	},
	GetMusicFlag: function () {
		return cc.sys.localStorage.getItem('MusicFlag');
	},

	//是否已解锁
	GetClickItemLockFlag: function (name) { //是否解锁
		return cc.sys.localStorage.getItem(name);
	},
	SetClickItemLockFlag: function (name, value) { //1
		cc.sys.localStorage.setItem(name, value);
	},

	//以下 通用方法
	changeName: function (str) { //简约 帅气 性感 华丽 甜美 古风 组合  n r sr ssr
		let temp = '';
		if (str === 'jy') {
			temp = '简约'
		} else if (str === 'sq') {
			temp = '帅气'
		} else if (str === 'xg') {
			temp = '性感'
		} else if (str === 'hl') {
			temp = '华丽'
		} else if (str === 'tm') {
			temp = '甜美'
		} else if (str === 'gf') {
			temp = '古风'
		} else {
			console.log('没有该名称哦');
		}
		return temp;
	},

	getRunum: function (count) { //获取多个不重复的随机数 10  3
		let numlist = new Array()
		let tempList = new Array(count);
		for (let i = 0; i < tempList.length; i++) {
			tempList[i] = i;
		}
		//
		for (let i = 0; i < 3; i++) {
			let num = Math.floor(Math.random() * 10); //0-9
			if (tempList[num] == null) {
				i--;
				continue;
			}
			numlist[i] = tempList[num];
			tempList[num] = null;
		}
		console.log('snafjnf   :' + numlist);
		return numlist;
	},

	GetNowTime: function () { //录屏
		var now = new Date();
		now = now.getTime();
		return now; //ms为单位
	},

	GetTodayTime: function () { //获取今日日期
		let curTime = new Date();
		let year = curTime.getFullYear();
		let month = curTime.getMonth() + 1;
		let day = curTime.getDate();

		let timestr = year + "-" + month + "-" + day;
		// console.log('得到的今日日期：' + timestr);
		return timestr;
	},
	checkIsToday: function (time) { //确认拿到的日期是不是今天的
		if (time == undefined || time == null) return false;
		let todayTime = this.GetTodayTime(); //'2020-7-6'  //测试
		let arr = todayTime.split('-'); //截取出来应该是长度为三的数组  年月日
		let temparr = time.split('-');
		for (let i = 0; i < 3; i++) {
			if (arr[i] === temparr[i]) {} else {
				return false; //只要有不同的就不是今天
			}
		}
		// console.log('确认是今日');
		return true; //确认是今天
	},

	normallist: ['classifyIndex', 'index', 'suitIndex', 'groupIndex', 'isWish', 'Pri_attribute', 'primary', 'prilevel', 'Sub_attribute', 'subordinate', 'sublevel', 'lock', 'isOver', 'isShow', 'color', 'name', 'coin', 'point', 'isDiscount'],
	changelist: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's'],
	convertTypeName_single: function (msg, flag) {
		let curNamelist = flag == 1 ? this.changelist : this.normallist;
		let convertNamelist = flag == 1 ? this.normallist : this.changelist;
		let tmpmsg = {};
		for (let item in msg) {
			let index = this.getstrIndex(item, curNamelist);
			tmpmsg[convertNamelist[index]] = msg[item];
		}
		return tmpmsg;
	},
	getstrIndex: function (str, tmp) {
		for (let i = 0; i < tmp.length; i++) {
			if (str == tmp[i]) {
				return i;
			}
		}
	},
	loadJson: function () { //
		let that = this;
		let url = 'rask';
		cc.loader.loadRes(url, function (err, res) {
			if (err) return console.log('json加载报错' + err);
			that.raskAllList = res.json.body;
			that.finish1 = true;
		});
		url = 'sign';
		cc.loader.loadRes(url, function (err, res) {
			if (err) return console.log('json加载报错' + err);
			that.signAllList = res.json.body;
			that.finish2 = true;
		});

		url = 'coatindex'; //coatIndex.json
		cc.loader.loadRes(url, function (err, res) {
			if (err) return console.log('json加载报错' + err);
			that.coatIndex = res.json.body;
			that.finish3 = true;
		});
	},
	//按顺序排好的  hash对应 数据和图片
	classifyList: ['肤色', '眉毛', '眼睛', '嘴巴', '腮红', '头发', '衣服', '裤子',
		'裙子', '连衣裙', '外套', '袜子', '鞋子', '耳环', '首饰', '眼镜', '头饰', '包包', '翅膀', '贴纸', '背景', '套装', '组合'
	],

	classifyNameList: ['skincolor', 'eyebrow', 'eyes', 'mouth', 'blush', 'hair', 'cloth', 'trouser', 'skirt',
		'dress', 'coat', 'socks', 'shoes', 'earing', 'jewelry', 'glasses', 'headwear', 'bag', 'wing', 'sticker', 'bg', 'suit', 'group'
	], //                0           1           2         3       4        5      6 		7			8
	//		9		10		11		12			13		14			15			16		17		18		19			20		21		22


	skincolorList: ['FFF4EC', 'FFF9F1', 'FFEDE8', 'FAE5FF', 'FFE3D6', 'F3F9FF', 'FFFEF1', 'FFE5E4', 'C9AFA5', 'C9B5A5', 'FEFFEA', 'E1D6C7', 'E1CEC7', 'E3F5FF'],
	//"classifyIndex":5,"index":0,"suitIndex":"-1","groupIndex":"-1","isWish":0,"Pri_attribute":"tm",
	//"primary":"r","prilevel":85,"Sub_attribute":"hl","subordinate":"n","sublevel":55,"lock":1,"isOver":0,"isShow":0
	urlList: [], //对应的服务器地址
	createlist: function () {
		let list = {};
		list.messageList = new Array();
		return list;
	},

	getThethings: function (type, index) { //获取到物品:套装 单品 组合 更新数据
		if (this.playerData.clothList == undefined) {
			this.playerData.clothList = new Array(22); //玩家已拥有数组
			for (let i = 0; i < this.playerData.clothList.length; i++) {
				this.playerData.clothList[i] = this.createlist();
				this.playerData.clothList[i].messageList = this.haveHash[i].messageList;
			}
		}
	},
	loadFromRemote: function () { //新添加了icon图标  只有第一次进入游戏或者有上新才读取服务器
		let that = this;
		that.allItemHash = new Array(that.classifyList.length);
		this.loadCount = 0;
		for (let i = 0; i < that.allItemHash.length; i++) {
			that.allItemHash[i] = this.createlist();
			that.loadit(i);
		}
	},
	getUrl: function (classifyIndex, index, flag) { //服务器的效果图路径
		index += 1;
		index = parseInt(index / 100) > 0 ? index : (parseInt(index / 10) > 0 ? ('0' + index) : ('00' + index));
		if (classifyIndex === 5) { //如果是头发  有前发 _0 和后发 _1
			index += (flag ? '_1' : '_0');
		}
		return (classifyIndex < 10 ? ('0' + classifyIndex) : classifyIndex) + '_' + this.classifyNameList[classifyIndex] + '/pic/' + index + '.png';
	},
	loadit: function (i) {
		let that = this;
		let url = ObjectNume.httpUrl + (i < 10 ? ('0' + i) : i) + '_' + that.classifyNameList[i] + '/message.json';
		cc.loader.load(url, function (err, res) { //如果有数据插入需要放到最前面
			if (err) return console.log('加载json失败：' + err);
			let data = res.body;
			if (i == 5) {
				for (let m = 0; m < data.length; m++) {
					let tmp = data[m];
					if (that.allItemHash[i].messageList[tmp.b]) {
						if (that.allItemHash[i].messageList[tmp.b].list == undefined) that.allItemHash[i].messageList[tmp.b].list = new Array();
						tmp = that.convertTypeName_single(tmp, 1)
						that.allItemHash[i].messageList[tmp.index].list = tmp; //后发
					} else {
						tmp = that.convertTypeName_single(tmp, 1)
						that.allItemHash[i].messageList[tmp.index] = tmp; //前发
					}
				}
			} else {
				for (let item in data) {
					let msg = that.convertTypeName_single(data[item], 1)
					data[item] = msg;
				}

				that.allItemHash[i].messageList = data; //读取到所有数据了----------------------------------总库
			}
			that.loadCount++;
			if (that.loadCount >= 22) {
				that.loadFinish = true;
			}
		});
	},
	// FFF4EC,FFF9F1,FFEDE8,FAE5FF,FFE3D6,F3F9FF,FFFEF1,FFE5E4,C9AFA5,C9B5A5,FEFFEA,E1D6C7,E1CEC7,E3F5FF  肤色色值
	allToPartList: function (flag) { //肤色：读取相关色号  头发：前发 后发  背景：色号+图片   icon+effect message.json   //对比数据时需要重新归类 已拥有、单品显示  套装、组合已拥有需要放入单品展示、套装展示
		//不能重复读取数据
		if (!flag && this.signSuitHash) return console.log('已经读取过数据');
		if (flag) { //清空所有列表
			this.allGroupHash = undefined;
			this.allSuitHash = undefined
			this.wishSingleHash = undefined
			this.suitHash = undefined
			this.groupHash = undefined
			this.showSingleHash = undefined
			this.haveHash = undefined
			this.recommendHash = undefined
			this.shopGroupHash = undefined
			this.shopSuitHash = undefined
			this.signSuitHash = undefined
			this.wishSuitHash = undefined
		}
		for (let i = 0; i < this.allItemHash.length; i++) {
			let data = this.allItemHash[i].messageList;
			let length = this.allItemHash.length;
			//遍历单品 确认分类
			if (i == length - 1) { //组合
				if (this.allGroupHash == undefined) {
					this.allGroupHash = this.createlist();
				}
				this.allGroupHash.messageList = data;
			} else if (i == length - 2) { //套装
				if (this.allSuitHash == undefined) {
					this.allSuitHash = this.createlist();
				}
				this.allSuitHash.messageList = data;
			} else if (i < this.allItemHash.length - 2) { //没有考虑  背景和肤色

				for (let m = 0; m < data.length; m++) {
					let tmp = data[m];
					if (tmp.isWish == 1) { //许愿池里的单品
						if (this.wishSingleHash == undefined) {
							this.wishSingleHash = this.createlist();
						}
						this.wishSingleHash.messageList.push(tmp); //是特有m === 5 ? data[m] :

						if (tmp.isOver == 1) { //单品 已拥有
							this.haveHash[i].messageList.push(tmp);
							this.showSingleHash[i].messageList.push(tmp);
						}
					} else if (tmp.suitIndex >= 0) { //套装里的单品
						if (this.suitHash == undefined) {
							this.suitHash = this.createlist();
						}
						if (this.suitHash.messageList[tmp.suitIndex] == undefined) {
							this.suitHash.messageList[tmp.suitIndex] = new Array();
						}
						this.suitHash.messageList[tmp.suitIndex].push(tmp); //m === 5 ? data[m] :

						if (tmp.isOver == 1) { //单品 已拥有
							this.haveHash[i].messageList.push(tmp);
							this.showSingleHash[i].messageList.push(tmp);
						}
					} else if (tmp.groupIndex >= 0) { //组合里的单品
						if (this.groupHash == undefined) {
							this.groupHash = this.createlist();
						}
						if (this.groupHash.messageList[tmp.groupIndex] == undefined) {
							this.groupHash.messageList[tmp.groupIndex] = new Array();
						}
						this.groupHash.messageList[tmp.groupIndex].push(tmp); //m === 5 ? data[m] :

						if (tmp.isOver == 1) { //单品 已拥有
							this.haveHash[i].messageList.push(tmp);
							this.showSingleHash[i].messageList.push(tmp);
						}
					} else { //只是单品:
						if (this.showSingleHash == undefined) {
							this.showSingleHash = new Array(21); //玩家要显示的单品数组
							for (let i = 0; i < this.showSingleHash.length; i++) {
								this.showSingleHash[i] = this.createlist();
							}
						}
						this.showSingleHash[i].messageList.push(tmp); //可以直接在显示栏中显示：解锁和未解锁 m === 5 ? data[m] :
						if (tmp.lock == undefined || tmp.lock == 0) { //不需要解锁的直接加入已拥有
							if (this.haveHash == undefined) {
								this.haveHash = new Array(23); //玩家已拥有数组
								for (let i = 0; i < this.haveHash.length; i++) {
									this.haveHash[i] = this.createlist();
								}
							}
							this.haveHash[i].messageList.push(tmp);
						}
					}
				}
			}
		}
		for (let i = 0; i < this.allGroupHash.messageList.length; i++) { //把单品存入总库---组合
			let data = this.allGroupHash.messageList[i]

			//已拥有  组合
			if (data.isOver == 1) { //22
				this.haveHash[22].messageList.push(data);
			}
			let tempdata = this.groupHash.messageList[i];
			if (data.index == tempdata[0].groupIndex) {
				if (this.allGroupHash.messageList[i].list == undefined) this.allGroupHash.messageList[i].list = new Array();
				this.allGroupHash.messageList[i].list = tempdata; //--------------------------------------组合
			}
			if (data.isDiscount > 0) { //推荐里面的组合
				if (this.recommendHash == undefined) {
					this.recommendHash = this.createlist();
				}
				this.recommendHash.messageList.push(data);
			} else { //区分出商店里 推荐  组合
				if (this.shopGroupHash == undefined) {
					this.shopGroupHash = this.createlist();
				}
				this.shopGroupHash.messageList.push(data);
			}
		}

		for (let i = 0; i < this.allSuitHash.messageList.length; i++) { //把单品存入总库---套装
			let data = this.allSuitHash.messageList[i];
			let tempdata = this.suitHash.messageList[i];
			if (data.index == tempdata[0].suitIndex) {
				if (this.allSuitHash.messageList[i].list == undefined) this.allSuitHash.messageList[i].list = new Array();
				this.allSuitHash.messageList[i].list = tempdata; //--------------------------------------套装
			}
			//已拥有  套装
			if (data.isOver == 1) { //21
				this.haveHash[21].messageList.push(data);
			}
		}

		for (let i = 0; i < this.allSuitHash.messageList.length; i++) { //区分套装的去处 
			let data = this.allSuitHash.messageList[i];
			if (data.point == 0) { //商店
				if (data.isDiscount > 0) { //推荐里面的套装
					this.recommendHash.messageList.push(data);
				} else {
					if (this.shopSuitHash == undefined) {
						this.shopSuitHash = this.createlist();
					}
					this.shopSuitHash.messageList.push(data);
				}
			} else if (data.point == 1) { //签到
				if (this.signSuitHash == undefined) {
					this.signSuitHash = this.createlist();
				}

				this.signSuitHash.messageList.push(data);
			} else if (data.point == 2) { //许愿池
				if (this.wishSuitHash == undefined) {
					this.wishSuitHash = this.createlist();
				}
				this.wishSuitHash.messageList.push(data);
			}
		}
		//如果已拥有:列表也要刷新

		this.sortByCoin(this.recommendHash.messageList); //数据成功读取到---推荐
		this.sortByCoin(this.shopSuitHash.messageList); //套装
		this.sortByCoin(this.shopGroupHash.messageList); //组合


		//数据更新 存入本地
		// this.playerData.allItemHash = this.allItemHash;
	},
	ishad: function () { //根据玩家本地数据已拥有更新数据库
		let hadlist = this.playerData.clothList;
		if (hadlist && hadlist.length > 0) {
			for (let i = 0; i < hadlist.length; i++) { //classifyIndex
				let tmplist = hadlist[i]
				if (tmplist.length > 0)
					for (let j = 0; j < tmplist.length; j++) {
						let index = this.getAllHashIndex(i, hadlist[i][j]);
						if (index >= 0) {
							this.allItemHash[i].messageList[index].isOver = 1;
						}
					}
			}
			this.allToPartList(1); //重新刷新项目数据
			console.log('后续有添加已拥有');
		}
	},
	addTohadList: function (classifyIndex, index) { //如果物品已拥有
		if (this.playerData.clothList.length <= 0) {
			for (let i = 0; i < 23; i++) {
				this.playerData.clothList[i] = new Array();
			}
		}
		this.playerData.clothList[classifyIndex].push(index);
	},
	updateListData: function (classifyIndex, index, list) { //强制更新所有数据--获取到图片插入数据
		// this.allItemHash[classifyIndex].messageList[index] = list;
		// this.allToPartList(1);//如果不刷新呢
	},
	sortByCoin: function (list) { //按物品的折后价进行第一件是最贵的套装 后从低到高排序
		// let list = this.recommendHash.messageList;
		for (let i = 0; i < list.length; i++) { //先全部从低到高排序
			for (let j = 0; j < list.length - 1 - i; j++) {
				let num1 = Math.round(list[j].coin * (list[j].isDiscount > 0 ? list[j].isDiscount : 1));
				let num2 = Math.round(list[j + 1].coin * (list[j].isDiscount > 0 ? list[j].isDiscount : 1)); //四舍五入
				if (num1 > num2) {
					let temp = list[j];
					list[j] = list[j + 1];
					list[j + 1] = temp;
				}
			}
		}
		//将价位最高的套装放到第一位
		let temp = list.pop();
		list.unshift(temp); //unshift() 方法无法在 Internet Explorer 中正确地工作！
	},
	//为人物装扮上：
	copyObj: function (list) { //不想改变原有数组--浅拷贝
		let tmplist = {};
		for (let item in list) { //in只使用名字
			tmplist[item] = {};
			for (let obj in list[item]) {
				tmplist[item][obj] = list[item][obj];
			}
		}
		return tmplist;
	},
	getAllHashIndex: function (classifyIndex, index) { //新增index不会对应
		let list = this.allItemHash[classifyIndex].messageList;
		for (let i = 0; i < list.length; i++) {
			if (index == list[i].index) {
				return i;
			}
		}
		console.log('总库中没有这个索引');
		return -1;
	},
	getIndex: function (index, list) { //根据当前索引获取
		for (let i = 0; i < list.length; i++) {
			if (list[i].index == index) {
				return i;
			}
		}
	},
	getScaleNum: function (node, width, height) { //承载图片的节点 限制图片的显示节点的宽高
		let scale1 = (width - 20) / node.width; //预留空白位置上下10
		let scale2 = (height - 20) / node.height;
		let scale = scale1 < scale2 ? scale1 : scale2;
		return scale;
	},

	checkCoatIndex: function (index) { //需要隐藏手的外套索引json
		for (let i = 0; i < this.coatIndex.length; i++) {
			if (this.coatIndex[i] == index) {
				return false;
			}
		}
		return true;
	},
	/**************************/
	//加载本地或者服务器上的图片
	/**************************/
	LoadImage: function (classifyIndex, index, node, curList, flag) { //这里只有icon和套装的效果图
		if (curList.pic) {
			if (classifyIndex == 10) { //1 14 16  32 34--需要隐藏手的外套索引 
				node.parent.getChildByName('hands').active = this.checkCoatIndex(index); //true;
			}
			node.getComponent(cc.Sprite).spriteFrame = curList.pic;
			return;
		}
		let that = this;
		let str = null;
		if (classifyIndex < 21) {
			//服务器 icon的路径应该会不同
			//外套的33和2要隐藏手臂
			str = ObjectNume.httpUrl + this.getUrl(classifyIndex, index, flag); //5
			cc.loader.load(str, (err, res) => {
				if (err) return console.log('加载图片失败');
				if (classifyIndex == 10) {
					node.parent.getChildByName('hands').active = this.checkCoatIndex(index); // true;
				}
				node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
				curList.pic = new cc.SpriteFrame(res);
				that.updateListData(classifyIndex, index, curList);
			});
		} else if (classifyIndex == 21) { //套装的完整图 
			str = ObjectNume.httpUrl + this.getUrl(classifyIndex, index);
			// console.log('确认图片和索引：' + classifyIndex, index, str);
			cc.loader.load(str, (err, res) => {
				if (err) return console.log('加载图片失败');
				node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
				curList.pic = new cc.SpriteFrame(res);
				that.updateListData(classifyIndex, index, curList);
			});
		}
	},
	getIconUrl: function (classifyIndex, index, flag) {
		if (flag) { //本地
			index += 1;
			index = parseInt(index / 100) > 0 ? index : (parseInt(index / 10) > 0 ? ('0' + index) : ('00' + index));
			return 'icon/' + (classifyIndex < 10 ? ('0' + classifyIndex) : classifyIndex) + '_' + this.classifyNameList[classifyIndex] + '/' + index;
		} else {
			//直接使用效果图作为icon
			return ObjectNume.httpUrl + this.getUrl(classifyIndex, index);
		}
	},
	LoadIconImage: function (classifyIndex, index, node, curList) { //加载icon图
		// console.log('LoadIconImage：' + curList);
		let that = this;
		let url = '';
		let isload = false;
		if (classifyIndex == 0 || (classifyIndex >= 4 && classifyIndex <= 14) || (classifyIndex >= 16 && classifyIndex <= 18) || classifyIndex == 20) { //肤色 14
			//本地 
			isload = true;
		} else { //其他20
			isload = false; //直接读取服务器的效果图
		}
		if (curList.icon) {
			node.getComponent(cc.Sprite).spriteFrame = curList.icon;
			if (isload) {
				node.scale = 1;
			} else {
				let scaleNum = this.getScaleNum(node, node.parent.width, node.parent.height);
				node.scale = scaleNum;
			}
			return;
		}
		if (isload) { //本地
			url = this.getIconUrl(classifyIndex, index, isload);
			// console.log('本地 ' + url);
			cc.loader.loadRes(url, cc.SpriteFrame, (err, res) => {
				if (err) return console.log('加载图片失败' + err);
				node.getComponent(cc.Sprite).spriteFrame = res;
				curList.icon = res; //存图
				node.scale = 1;
				that.updateListData(classifyIndex, index, curList);
			})
		} else { //服务器
			url = this.getIconUrl(classifyIndex, index, isload);
			// console.log('远程 ' + url);
			cc.loader.load(url, (err, res) => { //加载服务器icon
				if (err) return console.log('加载图片失败' + err);
				node.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
				curList.icon = new cc.SpriteFrame(res);
				//要考虑缩放

				let scaleNum = this.getScaleNum(node, node.parent.width, node.parent.height); //衣柜显示不正确
				if (classifyIndex == 19) scaleNum += 0.1; //贴图
				node.scale = scaleNum;
				that.updateListData(classifyIndex, index, curList);
			});
		}
	},

	RecordInitHandle(startFunc, stopFunc, flag) {
		if (flag == undefined)
			flag = true;
		if (cc.sys.platform == cc.sys.DESKTOP_BROWSER || this.channel != "tt")
			return;
		if (this.recorder == null) {
			this.recorder = tt.getGameRecorderManager();
		}
		this.recorder.onStart(function (res) {
			this.pickId = 1;
			this.recorderFlag = true;
			this.startRecordTime = this.GetNowTime();
			startFunc();
		}.bind(this));
		this.recorder.onError(function (res) {
			console.log(res);
			this.recorderFlag = false;
			startFunc();
		}.bind(this));
		this.recorder.onStop(function (res) {
			if (this.pickId != 0) {
				this.videoPath = res.videoPath;
			}
			this.recorderFlag = false;
			stopFunc();
		}.bind(this));

		//默认进入场景即在录屏中
		if (flag == true) {
			if (this.recorderFlag == false) { //结束之后重新开始 60秒
				this.recorder.start({
					duration: 120,
				});
			} else {
				startFunc(); //更新ui
			}
		}
	},
	//录屏点击事件的处理
	RecordHandle() {
		if (this.recorderFlag == false) {
			this.recorder.start({
				duration: 120,
			});
		} else {
			if (this.GetNowTime() - this.startRecordTime < 3000) {
				//录屏失败：录屏时长低于3秒
				this.pickId = 0;
			}
			this.recorder.stop();
		}
	},

	AddMoreGame: function (leftnum, topnum) {
		if (cc.sys.platform != cc.sys.DESKTOP_BROWSER && this.channel == "tt") { //推广 more game
			if (this.moreBtn) {
				this.moreBtn.destroy();
			}
			if (this.isStart) {
				this.isStart = false;
				let obj = tt.getSystemInfoSync();
				// console.log(obj);
				if (this.isCanShowMoreGame() == false) {
					this.isToutiao = false;
				}
				console.log("flag=" + this.isToutiao); //105 164   5 400
				if (this.isToutiao) { //121  129
					let btn = tt.createMoreGamesButton({
						type: "image",
						image: "images/moregame.png",
						style: {
							left: leftnum,
							top: topnum,
							width: 52,
							height: 54,
							lineHeight: 40,
							backgroundColor: "#000000",
							textColor: "#ff0000",
							textAlign: "center",
							fontSize: 16,
							borderRadius: 4,
							borderWidth: 0,
							borderColor: '#ffffff'
						},
						appLaunchOptions: [{
								appId: "tt91d8e7650ef264b9"
							},
							{
								appId: "tta24ed4f33d64587c"
							},
							{
								appId: "tte06796da7f4d2dba"
							},
							{
								appId: "tt767300cee959af40"
							},
							{
								appId: "tt010b77b69e21fdc2"
							},
							{
								appId: "tt222e5493bd0409ba"
							},
							{
								appId: "ttb134c7892e1e9388"
							},
							{
								appId: "tt9e80e83d01aa7ac3"
							},
							{
								appId: "tt667e10c3f954bf4c"
							},
							{
								appId: "tt62ab1416fd815236"
							}
							// {...}
						],
						onNavigateToMiniGame(res) {
							console.log("跳转其他小游戏", res)
						}
					});

					btn.onTap(() => {
						console.log("点击更多游戏")
					});
					btn.show();
					this.moreBtn = btn;
					console.log('btn:' + this.moreBtn);
				}
			} else {
				if (this.isToutiao) {
					this.moreBtn.show();
				}
			}
		}
	},
	isCanShowMoreGame: function () {
		var ret = false;
		if (cc.sys.platform === cc.sys.WECHAT_GAME) {
			var current_version = tt.getSystemInfoSync().SDKVersion;

			let phone = tt.getSystemInfoSync();

			if (this.compareVersion(current_version, "1.23.0") === -1) {
				console.log('版本过低小游戏互推不能用');
			} else {
				console.log('苹果手机需要隐藏互推：' + phone.platform.toLowerCase());
				if (phone.platform.toLowerCase() == 'ios') { // cc.sys.OS_IOS
					// console.log('苹果手机需要隐藏互推：' + phone.platform.toLowerCase());
				} else {
					ret = true;
				}
			}
		}
		return ret;
	},
	destroyMoreGame: function () {
		this.isStart = true;
		this.isToutiao = true;
	},
	compareVersion: function (v1, v2) { //比较版本
		v1 = v1.split('.');
		v2 = v2.split('.');
		var len = Math.max(v1.length, v2.length);
		while (v1.length < len) {
			v1.push('0');
		}
		while (v2.length < len) {
			v2.push('0');
		}
		for (var i = 0; i < len; i++) {
			var num1 = parseInt(v1[i]);
			var num2 = parseInt(v2[i]);
			if (num1 > num2) {
				return 1;
			} else if (num1 < num2) {
				return -1;
			}
		}
		return 0;
	},
	onQQShare: function () {
		//QQ分享的话
		if (cc.sys.platform != cc.sys.DESKTOP_BROWSER && this.channel == "qq") {
			qq.showShareMenu({
				showShareItems: ['qq', 'qzone', 'wechatFriends', 'wechatMoment']
			});
			qq.onShareAppMessage(() => ({
				imageUrl: 'images/sharePic.png'
			}));
		}
	},

};