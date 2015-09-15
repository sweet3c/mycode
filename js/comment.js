/**
 * 评论JS
 * @au ZJ090
 */
var Comment_Enum_Channel = {
	ALL : 0, //只能用于查询
	NEWS : 1, //新闻
	CAR : 2, //车型
	BBS : 3 //社区
};
var Comment_Enum_ObjType = {
	ALL : 0, //只能用于查询
	//资讯
	NEWS : 1, //新闻
	NEWS_TOPIC : 14, //话题大爆炸
	NEWS_SALON : 15, //沙龙荟
	DWPC : 25, //多w品车
	VKRP : 26, //V客锐评
	//车型
	CAR_BRAND_NEWS : 2, //品牌新闻
	CAR_BRAND_PHOTO : 3, //品牌相册
	CAR_BRAND_ACTIVITY : 4, //品牌活动
	CAR_SERIE_REVIEW : 13, //车系评测
	CAR_AUTO : 6,
	CAR_SELECT_TOPIC : 5, //选车专题
	CAR_PRAISE : 7, //口碑
	//社区
	BBS_FOOTMARK : 8, //足迹
	BBS_FURTHER_ASK : 9, //问答追问
	BBS_RAIDERS : 10, //攻略
	BBS_ARENA : 11, //擂台
	BBS_GROUP : 12, //小组
    TOPIC : 16 //活动
};

(function initComment($) {
	$._comment = function (param) {
		this._init(param);
	};
	$._comment.prototype = {
		// 初始化
		_init: function (param) {
			this._url = 'http://www.emao.com/index.php?r=comment/commentopt/';
			this._channel = param.channel || 0;
			this._obj_type = param.obj_type || 0;
			this._obj_id = param.obj_id || 0;
			this._per_page = param.per_page || ''; //每页的条数 默认是空 由服务端决定
			this._least_word = param.least_word || 5; // 评论最少的字数  默认是 5 个
			this._more_mode = param.more_mode || 'page'; // 更多评论的加载方式 默认瀑布流（page falls 可选）
			this._comment_callback = param.comment_callback || this._comment_str;  // 对评论内容 的回调函数
			this._add_comment_callback = param.add_comment_callback || this._add_comment_str; // 添加评论时 对内容的回调函数
			this._reply_comment_callback = param.reply_comment_callback || this._reply_str; // 回复里  对回复的内容的回调函数
			this._user_id =  0;
			this._user_info = {};
			this._cur_page = 1; // 默认是第一页
			this._author_id = param.author_id || 0;
			this._comment_max_length = param.comment_max_length || 300;

			this._page();
			this._add_comment();
			this._reply();
			this._support();
			this._del();
			this._falls_comment();
			this._init_interface();
		},
		_set_userinfo : function(user_info) {
			this._user_id = user_info['id'] || 0;
			this._user_info = user_info;
		},
		// 跨域ajax封装
		_ajax : function(url,data,fnSuccess, fnErr){
			$.ajax({
				data: data,
				url: url,
				dataType: 'jsonp',
				success: fnSuccess, // 回调函数
				error: fnErr || function() {
					alert_msg({msg:'请求超时'});
				}
			});
		},
		// 获取评论的内容 默认是
		_get_comment : function (cur_page) {
			var that = this;
			var cur_page = cur_page || this._cur_page;
			var _fun_success = function(result) {
				var data = result;
				that._set_userinfo(data['user_info']); // 设置用户信息
				if (that._more_mode == 'falls') {
					$("#comments").append(that._make_comments(data['comments']));
					that._cur_page++;
				} else {
					$("#comments").html(that._make_comments(data['comments']));
				}

				var page_html = that._more_mode == 'page' ? data['pages_html'] : '<a id="more_comment" class="see-more" href="javascript:;">更多>></a>';
				$("#pages").html(page_html);
				$("#publish_comment").html(that._publish_html());
				that._emotions();
				that._renderEmotion();
			};
			this._ajax(that._url + 'commentajax',
				{cur_page:cur_page, obj_id:that._obj_id, channel:that._channel,obj_type:that._obj_type},
				_fun_success
			);
		},
		// 拼 评论的HTML 结构
		_make_comments : function (comments) {
			var str = '';
			var default_nickname = '一猫车友';
			var default_user_url = 'http://s.emao.net/images/common/uc_user_avatar.png';
			for(var key in comments) {
				$("#comment_" + comments[key]['id']).remove();
				str += '<dl class="list-wrap d-com-info comment_' + comments[key]['id'] + '" id="comment_' + comments[key]['id'] + '">';
				str += '<dt class="list-img">';
				str += '<a href="http://i.emao.com/' + comments[key]['userId'] +  '/main/" target="_blank" ><img src="' + (comments[key]['user_info']['header_img_url'] || default_user_url) + '"/></a>';
				str += '</dt>';
				str += '<dd>';
				str += '<div class="username"><strong class="name"><a href="http://i.emao.com/' + comments[key]['userId'] + '/main/" target="_blank">' + (comments[key]['user_info']['nickname'] || default_nickname) + '</a></strong></div>'
				str += '<div id="commentContent_'+comments[key]['id']+'">' + (comments[key]['replyUserId'] > 0 ? '回复<span class="name"><a href="http://i.emao.com/' + comments[key]['replyUserId'] + '/main/" target="_blank">@' + (comments[key]['reply_user_info']['nickname'] || default_nickname) + '</a></span>:' : '') + this._comment_callback(comments[key]['content']) + '</div>';

				//专题选车要判断是否有车系信息
				if (comments[key]['serieInfo']) {
					str += "<div class='show-pic'>";
					str += "<div class='show-lt'><a href='http://auto.emao.com/" + comments[key]['serieInfo']['id'] + "/' target='_blank'><img src='http://img.emao.net/" + comments[key]['serieInfo']['cover'] + "/114'></a></div>";
					str += "<div class='show-rt'><a href='http://auto.emao.com/" + comments[key]['serieInfo']['id'] + "/' target='_blank'>" + comments[key]['serieInfo']['serieName'] + "</a>";
					str += "<i>" + comments[key]['serieInfo']['minPrice'] + "-" + comments[key]['serieInfo']['maxPrice'] + "万</i></div></div>";
				}

				str += '<div class="cite">';
				str += '<span>' + comments[key]['addTime'] + '</span>';
				str += '<ul class="com-handle">';
				str += '' + ((comments[key]['user_info']['id'] || '') === this._user_id ? '<li><a href="javascript:void(0);" id="del_comment_' + comments[key]['id'] + '" class="ss">删除</a></li><li>|</li>' : '');
				str += '<li class="reply"><a href="javascript:void(0);">回复</a></li>';
				str += '<li>|</li>';
				str += '<li><a href="javascript:void(0);"' + (comments[key]['supported'] == '1' ? '' : (' id="support_' + comments[key]['id'] + '"')) + '><i class="support' + (comments[key]['supported'] == '1' ? ' cur' : '') + '"></i> <b><lable id="support_num_' + comments[key]['id'] + '">' + comments[key]['supportNum'] + '</label></b></a></li>';
				str += '</ul>';
				str += '</div>';
				str += '<div class="gd comment_' + comments[key]['id'] + '">';
				str += '<div class="login">';
				str += '<p>请<a href="javascript:commentLoginLayerPop()">登录</a>后才可以发表评论，或<a href="javascript:commentRegisterLayerPop()">快速注册</a></p>';
				str += '</div>';
				str += '<textarea id="comment_text_' + comments[key]['id'] +'" class="com-box" placeholder="快来发表评论吧..."></textarea>';
				str += '<div class="btn-wrap com-btn review" id="commentEmDiv2_'+ comments[key]['id'] +'">';
				str += '<button class="btn btn-primary btn-sm btns" type="button" id="reply_' + comments[key]['id'] + '">发表评论</button>';
				str += '<div class="share-box emotion" id="commentEmDiv_'+ comments[key]['id'] +'" ><i></i><span>表情</span></div>'
				str += '<div class="num"><em>0</em>/300</div>';
				str += '</div>';
				str += '</div>';
				str += '</dd>';
				str += '</dl>';
			}
			return str;
		},
		// 翻页
		_page : function () {
			var that = this;
			$(document).on('click', "#pages a", function() {
				var page = $(this).attr('href');
				if(!isNaN(page)) {
					that._get_comment(page);
				}
				return false;
			});
		},
		// 添加评论
		_add_comment : function () {
			var that = this;
			$(document).on ('click', "#add_comment", function(){
				//禁用状态下不可点击
				if($(this).hasClass('btns')) {
					return;
				}
				var commentStr = "#comment_text_"+ that._user_id;
				var comment = that._add_comment_callback($(commentStr).val());
				$(commentStr).val(comment);
				/*if (comment.length < that._least_word) {
					that._show_msg(commentStr, false);
					return;
				}*/
				var _fun_success = function(result) {
					that._hide_msg('com-mod');
					var data = result;
					if(data['code'] == 0){
						$("#comments").prepend(that._make_comments(data['data']));
						$(commentStr).val("").keyup();
						that._emotions();
						that._renderEmotion();
						$('body, html').animate({scrollTop: $('#comments').offset().top - 50});
					}else{
						that._hide_msg('com-mod');
						alert_msg({msg:data['msg']});
					}
				};
				var _fun_error = function () {
					that._hide_msg('com-mod');
					alert_msg({msg:'请求超时'});
				};
				var commentData = {comment:comment,obj_id:that._obj_id, channel:that._channel,obj_type:that._obj_type,'author_id':that._author_id};
				if (that._obj_type == 5) {
					var serieId = parseInt($.trim($('#serieId2').val()));
					if (!serieId) {
						serieId = 0;
					}
					commentData.serieId = serieId;
				}
				that._ajax(that._url + 'addcomment',
					commentData,
					_fun_success,
					_fun_error
				);
			});
		},
		// 回复评论
		_reply : function () {
			var that = this;
			$(document).on('click', "[id^=reply_]", function(){
				//禁用状态下不可点击
				if($(this).hasClass('btns')) {
					return;
				}
				var obj_id = this.id.split('_')[1];
				var comment = that._reply_comment_callback($("#comment_text_" + obj_id).val());
				$("#comment_text_" + obj_id).val(comment);
				/*if (comment.length < that._least_word) {
					that._show_msg('comment_text_' + obj_id, false);
					return;
				}*/

				var _fun_success = function(result) {
					that._hide_msg('comment_' + obj_id);
					var data = result;
					if(data['code'] == 0){
						$("#comments").prepend(that._make_comments(data['data']));
						$("#comment_text_" + obj_id).val("").keyup();
						that._emotions();
						that._renderEmotion();
						$("#comment_" + obj_id + " .reply").click();
						$('body, html').animate({scrollTop: $('#comments').offset().top - 50});
					}else{
						that._hide_msg('comment_' + obj_id);
						alert_msg({msg:data['msg']});
					}
				};
				var _fun_error = function () {
					that._hide_msg('comment_' + obj_id);
					alert_msg({msg:'请求超时'});
				};
				that._ajax(that._url + 'replycomment',
					{comment:comment,obj_id:obj_id, channel:that._channel,obj_type:that._obj_type,'author_id':that._author_id,'article_id':that._obj_id},
					_fun_success,
					_fun_error
				);
			});
		},
		// 支持评论
		_support : function () {
			var that = this;
			$(document).on('click', "a[id^=support_]", function() {
				var _that = this;
				var obj_id = this.id.split('_')[1];
				if(!obj_id) {
					return;
				}

				var _fun_success = function(result) {
					var data = result;
					if(data['code'] == 0){
						$("#support_num_" + obj_id).text($("#support_num_" + obj_id).text() * 1 + 1);
						$(_that).find('i').addClass('cur');
						// 加1的动画
						$('<span class="funcs-score">+1</span>').css({
							position: 'absolute',
							left: '20px',
							top: '-5px',
							color: 'javascript:;f39d26'
						}).appendTo($(_that).find('i').parent());

						$('.com-handle').find('.funcs-score').animate({
							top: '-30px',
							opacity: 1
						}, 500, function(){
							$(this).remove();
						});

						$(_that).removeAttr('id');
					}else{
						alert_msg({msg:data['msg']});
					}
				};
				that._ajax(that._url + 'supportcomment',
					{obj_id:obj_id, channel:that._channel,obj_type:that._obj_type},
					_fun_success
				);
			});
		},
		// 删除评论
		_del : function () {
			var that = this;
			$(document).on('click', "a[id^=del_comment_]", function() {
				var obj_id = this.id.split('_')[2];
				if(!obj_id) {
					return;
				}
				var r = confirm('确定要删除该评内容吗？');
				if (!r) {
					return;
				}
				var _fun_success = function(result) {
					var data = result;
					if(data['code'] == 0){
						$("#comment_" + obj_id).fadeOut("normal",function(){
							$("#comment_" + obj_id).remove();
							alert_msg({msg:"删除成功"});
						});
					}else{
						alert_msg({msg:data['msg']});
					}
				};
				that._ajax(that._url + 'delcomment',
					{obj_id:obj_id, channel:that._channel,obj_type:that._obj_type},
					_fun_success
				);
			});
		},
		// 拼接 提交评论的HTML
		_publish_html : function () {
			var nickname = this._user_info['nickname'] || '一猫车友';
			var user_url = this._user_id > 0 ? this._user_info['header_img_url'] : 'http://s.emao.net/images/common/uc_user_avatar.png';

			var str = '';
			str += '<dl class="list-wrap d-com-info">';
			str += '<dt class="list-img">';
			str += '<img src="' + user_url + '"/>';
			str += '</dt>';
			str += '<dd>';
			str += '<div class="com-username">' + nickname + '</div>';
			str += '<div class="login"' + (this._user_id > 0 ? ' style="display:none;"' : '') + '>';
			str += '<p>请<a href="javascript:commentLoginLayerPop()">登录</a>后才可以发表评论，或<a href="javascript:commentRegisterLayerPop()">快速注册</a></p>';
			str += '</div>';
			str += '<textarea id="comment_text_'+this._user_id+'" class="com-box" placeholder="快来发表评论吧..."' + (this._user_id > 0 ? ' style="display:block;"' : '') + '></textarea>';
			str += '<div class="btn-wrap com-btn review" id="commentEmDiv2_'+this._user_id+'">';
			str += '<div class="share-box">';
			str += '<div class="jiathis_style" style="display: none;">';
			str += '<span class="jiathis_txt">同步到：</span>';
			str += '<a class="jiathis_button_icons_4"></a>';
			str += '<a class="jiathis_button_icons_3"></a>';
			str += '<a class="jiathis_button_icons_2"></a>';
			str += '<a class="jiathis_button_icons_9"></a>';
			str += '<a href="http://www.jiathis.com/share" class="jiathis jiathis_txt jtico jtico_jiathis" target="_blank"></a>';
			str += '</div>';
			str += '</div>';
			str += '<div class="share-box emotion" id="commentEmDiv_'+this._user_id+'"'+ (this._user_id > 0 ? ' style="display:block;"' : '') +'><i></i><span>表情</span></div>',
			str += '<button class="btn btn-primary btn-sm' + (this._user_id > 0 ? '' : ' btns') + '" type="button" id="add_comment">发表评论</button>';
			str += '<div class="num"' + (this._user_id > 0 ? ' style="display:block;"' : '') + '><em>0</em>/300</div>';
			str += '</div>';
			str += '</dd>';
			str += '</dl>';

			return str;
		},
		_falls_comment : function () {
			var that = this;
			$(document).on('click', '#more_comment', function () {
				that._get_comment(this._cur_page);
			});
		},
		_comment_str : function(comment) {
			return comment.trim();
		},
		_add_comment_str : function(comment) {
			return comment.trim();
		},
		_reply_str : function(comment) {
			return comment.trim();
		},
		// 初始化界面
		_init_interface : function() {
			var that = this;
			if (that._user_id > 0) {
				$('.login').hide();
				$('.com-box').show();
				$('.share-box').show();
				$('.num').show();
				$('.btn-primary').removeClass('btns');
			}
			if($('.com-btn button').hasClass('btns')){
				$('.com-btn button').attr('disabled','disabled');
			}else{
				$('.com-btn button').attr('disabled',false);
			}
			$(document).on('keyup','.list-wrap .com-box',function(){
				that._check_word(this);
			});
			$(document).on('keyup','.gd .com-box',function(){
				that._check_word(this);
			});

			$(document).on('click','.reply',function(){
				if(that._user_id > 0){
					$('.login').hide();
					$('.com-box').show();
					$('.share-box').show();
					$('.num').show();
					$('.btn-primary').removeClass('btns');
				}
				var text = $(this).find('a').text();
				if(text == '回复'){
					$(this).find('a').text('收起').parents('dl').siblings().find('.reply a').text('回复');
					$(this).parents('dl').find('.gd').show().siblings().parents('dl').siblings().find('.gd').hide();
				}else{
					$(this).parents('dl').find('.gd').hide();
					$(this).find('a').text('回复');
				}
			})
		},
		// 检查内容长度
		_check_word : function(text) {
			var text_length = text.value.length;
			var p = $(text).parents('dd').find('.btn-wrap em');
			if(text_length <= this._comment_max_length){
				p.text(text_length);
				if(text_length >= this._comment_max_length){
					$(text).parents('dd').css({'color':'#fb7d54'})
				};
			}else{
				text.value = text.value.substring(0, this._comment_max_length);
			};
		},
		// 文本框上的提示信息
		_show_msg : function(obj, flag) {
			var maxw = $('#' + obj).width();
			var parent = $('#' + obj).parent();
			parent.find('.login,.login p').css({'width':maxw+'px'});

			if(flag){
				parent.find('.login').css({
					'display':'block',
					'position':'absolute',
					'opacity':'0.5',
					'z-index':'99',
					'border':'none',
					'background':'#fff'
				});
				parent.find('.login p').html('<img src="http://s.emao.net/images/news/load_icon.jpg">正在发表回复...').addClass('load').removeClass('cols');
				return true;
			}else{
				parent.find('.login').css({
					'display':'block',
					'position':'absolute',
					'z-index':'99',
					'border':'1px solid #fb7d54',
					'background':'#ffeeea'

				});
				parent.find('.login p').html('评论不能低于' + this._least_word + '个中文字符').addClass('cols').removeClass('load');
				setTimeout(function(){
					parent.find('.login').css({
						'display':'none'

					});
				}, 2000);
				return false;
			}
		},
		//
		_hide_msg : function (obj) {
			$('.' + obj + ' .login').hide();
			$('.' + obj + ' .com-box').val('');
			$('.' + obj + ' .num em').text('0');
		},
		_emotions : function() {
			$("div[id*='commentEmDiv_']").each(function(){
				var commentBlockId = $(this).attr("id").replace(/[^0-9]/ig,"");
				$('#commentEmDiv_'+commentBlockId).jqfaceedit({txtAreaObj:$('#comment_text_'+commentBlockId),containerObj:$('#commentEmDiv2_'+commentBlockId),textareaid:'comment_text_'+commentBlockId,top:25,left:-27});
			});

		},
		_renderEmotion : function(){
			$("div[id*='commentContent_']").each(function(){
				$(this).emotionsToHtml();
			});
		}
	};
})(jQuery);
function commentLoginLayerPop()
{
	window.location.href = "http://passport.emao.com/login";
	return;
	if (typeof loginLayerPop == 'function') {
		loginLayerPop();
	} else {
		jQuery.ajax({
			type: 'GET',
			url: 'http://s.emao.net/js/login.js',
			data: {},
			dataType: 'script',
			cache: true,
			success: function () {
				loginLayerPop();
			}
		});
	}
}
function commentRegisterLayerPop()
{
	window.location.href = "http://passport.emao.com/register";
	return;
	if (typeof registerLayerPop == 'function') {
		registerLayerPop();
	} else {
		jQuery.ajax({
			type: 'GET',
			url: 'http://s.emao.net/js/login.js',
			data: {},
			dataType: 'script',
			cache: true,
			success: function () {
				registerLayerPop();
			}
		});
	}
}
