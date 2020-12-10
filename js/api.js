var API = window.API = {
	webPath			: "http://192.168.1.246:8080/jyapp/",
	//webPath			: "http://10.1.12.76:9999/",
	//webPath			: "http://10.1.1.102:8080/jyapp/",
	//webPath			: "http://192.168.1.160:9998/jyapp/",
	//webPath			: "http://192.168.1.26:9998/jyapp/",
	//webPath			: "http://192.168.0.102:9999/",
	//webPath			: "http://192.168.2.193:9999/jyapp/",
	version         :"test",//demo:静态，prod:正式，test:测试
	env:'soap',//只支持web-service(soap)或者json
	urls: {
		login		: "anon/login!login.action",
		resrce		: "roleresrceperm!queryResrceTree.action"
	},
	modules: { 
		 
	},
	data: {
		resrce: [] 
	},
	components : {
		article : {}
	},
	funcs: {
		getUrlParams: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.search.substr(1).match(reg);
			if (r != null) {
				return (r[2]);
			}
			return null;
		}
	},
	CONSTANTS: {
		bsCode: "bsCode",	//登录用户编码
		bsName: "bsName",	//登录用户名
		appWork:"appWork",	//登录用户所属工厂
		appDept:"appDept",	//登录用户所属部门
		appPlannerGroups:"appPlannerGroups"	//登录用户所属计划员组 多个以“,”隔开
	}
};


/** 
 * 时间对象的格式化 
 */
Date.prototype.format = function(format) {
	 
	/* format="yyyy-MM-dd hh:mm:ss"; */
	 
	var o = {
		"M+" : this.getMonth() + 1,
		"d+" : this.getDate(),
		"h+" : this.getHours(),
		"m+" : this.getMinutes(),
		"s+" : this.getSeconds(),
		"q+" : Math.floor((this.getMonth() + 3) / 3),
		"S" : this.getMilliseconds()
	}

	if (/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	}

	for ( var k in o) {
		if (new RegExp("(" + k + ")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k]
					: ("00" + o[k]).substr(("" + o[k]).length));
		}
	}
	return format;
};
//判断浏览器是手机还是电脑
function API_GetbrType(){
	  var sUserAgent = navigator.userAgent.toLowerCase();
	    var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
	    var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
	    var bIsMidp = sUserAgent.match(/midp/i) == "midp";
	    var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
	    var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
	    var bIsAndroid = sUserAgent.match(/android/i) == "android";
	    var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
	    var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
	   // if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ){
	   if (!(bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) ){
	        return 0; //PC
	    }else{
	    	return 1; //手机
	    	}
}

//判断登录会话是否成功，成功返回1，失败返回0
function API_getLogin(){
		//判断会话
		var r=0;
		var params={"UID": localStorage.UID};
		var url = API.webPath + "anon/web/kmLogin!doLogin_check.action";
				//当session丢失但localStorage没有丢失时，模拟登录一次
				//var params={"kmUser.bsCode": usr, "kmUser.bsPassword":password};
				$.ajax({
			            //cache: false,
			            async: false,   
			            dataType: 'json', 
			            type: 'post',
			            url: url,
			            data : params,
			            success: function (msg)
			            { 
			            	if (msg.status == "SUCCESS") {
								//登录成功  
								r=1;//验证成功
							}else{
								r=0;//账号密码验证失败
							}
			            },
				        error:function(msg){
				        	r=-1;//"最痛苦的事情莫过于没有网络！"
				        }
			        });

		return r;
  }

//登录，成功返回1，失败返回0
function API_Login(user,pwd){
		//判断会话
		var r=0;
		var usr=user;
		var password=pwd;
		var url = API.webPath + "anon/web/kmLogin!doLogin.action";
		
	
			 //如果存在本地会话则校验登录信息
			if (usr){
				//当session丢失但localStorage没有丢失时，模拟登录一次
				var params={"kmUser.bsCode": usr, "kmUser.bsPassword":password};
				  $.ajax({
			            //cache: false,
			            async: false,   
			            dataType: 'json', 
			            type: 'post',
			            url: url,
			            data : params,
			            success: function (msg)
			            { 
			            	if (msg.status == "SUCCESS") {
			            		localStorage.setItem("bsCode", msg.data.bsCode);
		    					localStorage.setItem("bsName", msg.data.bsName);
		    					localStorage.setItem("bsPassword", pwd);//电话
		    				    sessionStorage.setItem("bsCode", msg.data.bsCode); //存一个session会话
		    					if(msg.data.appDept){
		           					localStorage.setItem("appWork", msg.data.appWork.bsCode);// 工厂代码
		           					localStorage.setItem("appWorkPk", msg.data.pkWork);   //工厂描述
		           					localStorage.setItem("appDept", msg.data.appDept.bsCode); //部门代码
		           					localStorage.setItem("appDeptPk", msg.data.pkDept);  //部门描述
		    					}
		    					
								r=1;//与0和1区别  这个要单独重新推送消息
							}else{
								
			    				//alert(msg.jsonMessage);
								r=0;
							}
			            }
				  
			        });
				 
			}else{
				r=-1;
			}
		return r;
  }


	//淡入淡出效果插件  add by YJY 2015-8-19 
	function lighttips( id, tips, time){
		if(tips){
			$("#"+id).find("p").html(tips);
		}  
		  $("#"+id).fadeIn();
		  $("#"+id).fadeOut(time);
	}
	
	//动态加载JS，css
	function loadjscssfile(filename,filetype){

	    if(filetype == "js"){
	        var fileref = document.createElement('script');
	        fileref.setAttribute("type","text/javascript");
	        fileref.setAttribute("src",filename);
	    }else if(filetype == "css"){
	    
	        var fileref = document.createElement('link');
	        fileref.setAttribute("rel","stylesheet");
	        fileref.setAttribute("type","text/css");
	        fileref.setAttribute("href",filename);
	    }
	   if(typeof fileref != "undefined"){
	        document.getElementsByTagName("head")[0].appendChild(fileref);
	    }
	    
	}

	  //取URL参数
	  function getUrlParam(name) {
	      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	      var r = window.location.search.substr(1).match(reg);  //匹配目标参数
	      if (r != null) return unescape(r[2]); return null; //返回参数值
	  }
	
	//localStorage存储数据的方法
	function api_localStorageSave(objname,obj){
		var str = JSON.stringify(obj); 
		//存入 
		localStorage.setItem(objname,str)
		sessionStorage.objname = str;
	}
	function api_localStorageGet(objname){
		//读取 
		str = localStorage.getItem(objname);
		//重新转换为对象 
		obj = JSON.parse(str);
		return obj;
	}
	//获取IOS站点路径http://ip:端口/PMAPP/web/
	function api_getWebPath() {
	    var curWwwPath ="http://"+ window.location.host+"/PMAPP/web/";	
	    return curWwwPath;
	}
	//获取IOS站点路径http://ip:端口/PMAPP/web/
	function api_getiWebPath() {
	    var curWwwPath ="http://"+ window.location.host+"/PMAPP/iweb/";	
	    return curWwwPath;
	}
	//20190808-fyx-获取url的参数
	function GetQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if(r != null) return unescape(r[2]);
		return null;
	}
	var _mask=mui.createMask();//遮罩层 
	//20190808-fyx-封装mui.ajax()
			;!function (window) {
	    window.aj = {};
	
	    aj.get = function (url, data, success) {
	        ajax("get", API.webPath +url, data, success);
	    };
	
	    aj.post = function (url, data, success) {
			
			var urlA = api_localStorageGet("webPath") + url;
	
	        ajax("post", urlA, data, success);
	    };
	
	
	    function ajax(type, url, data, success) {
	        /* $.ajax({
	            'type': type,
	            'url': url,
	            'data': data,
	            'dataType': "json",
	            'cache': false,
	            'async': true,
	            'success': success,
	            'contentType': 'application/json;charset=utf-8',
	            'beforeSend': function () {
	                index = layer.msg('加载中', {
	                    icon: 16,
	                    shade: 0.01
	                });
	            },
	            'complete': function () {
	                layer.close(index);
	            }
	        }); */
			mui.ajax( url, { 
				data: data,
				dataType: 'json',
				type: 'POST',
				timeout: 20000,
				headers: {},
				success: success,
				error: function(xhr, type, errorThrown) {
					mui.alert('服务器连接超时，请稍后再试');
				},
				beforeSend: function () {
					plus.nativeUI.showWaiting("处理中，请等待...");
				    _mask.show();//显示遮罩层
					//transWaiting()
				},
				complete: function () {
					plus.nativeUI.closeWaiting();
				    _mask.close();//关闭遮罩层
				}
			})
	    }
	}(window);
	//20191129-fyx-封装ajax调用webservice的方法
	function jQueryWeb(url,data,complete){
		//console.log(JSON.stringify(data));
		$.ajax({
			type: "POST",
			url: "http://192.168.1.160:8888/Service.asmx/"+url,
			data: data,
			dataType: "xml",
			complete: complete,
			beforeSend: function (request) {
				 _mask.show();//显示遮罩层
					request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"); 
					request.setRequestHeader("SOAPAction", "http://ecifWebservice/service"); 
				}, 
			success: function (result) {
				//console.log(JSON.stringify(result))
				_mask.close();//关闭遮罩层
				}, 
			error: function (request, errorInfo) {
				console.log(JSON.stringify(request))
				_mask.close();//关闭遮罩层
				alert("errorInfo = "+errorInfo); 
			} });
	}
	function doPost(url,data,complete1,complete2){
		if(API.env == 'soap'){
			jQueryWeb(url,data,complete1)
		}else{
			aj.post(url,data,complete2)
		}
	}
	//20191129-fyx-封装打开新页面的方法
	function OpenWindow(id,url,extras){
		mui.openWindow({
			id: id,
			url: url,
			styles: {
				top: '0px', //新页面顶部位置 
				bottom: '0px', //新页面底部位置 
				//width: newpage - width, //新页面宽度，默认为100% 
				//height: newpage - height, //新页面高度，默认为100% ...... 
			},
			extras:extras,
			show: { //控制打开页面的类型
				autoShow: true,
				//页面loaded事件发生后自动显示，默认为true 
				aniShow: 'slide-in-right', //页面显示动画，默认为”slide-in-right“；  页面出现的方式 左右上下
				duration: '100' //页面动画持续时间，Android平台默认100毫秒，iOS平台默认200毫秒； 
			},
			waiting: { // 控制 弹出转圈框的信息
				autoShow: true, //自动显示等待框，默认为true 
				title: '加载中', //等待对话框上显示的提示内容 
				options: {
					width: '300px', //等待框背景区域宽度，默认根据内容自动计算合适宽度 
					height: '100px', //等待框背景区域高度，默认根据内容自动计算合适高度 ...... 
				}
			}
		});
	}