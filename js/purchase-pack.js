/**
 * @ 購入パック
 */
(function initPurchase($) {
	$.Purchase_Pack = function () {
		this._init();
	};

	$.Purchase_Pack.prototype = {
		_init: function () {
			$("[id^='text']").css("border","1px solid #7F9DB9");
			$("[id^='text']").css("background-color","#ffffff");
			this._check_flg = true;
			this._ischeck = true;
			this._focus_id = "";
			this._error_msg = {};
			this._pack_flg = {
				_01 : 'A',
				_02 : 'B',
				_03 : 'C'
			};
			this._textarea_id_obj = {
				// 法定整備
				_01_02 : '_01_05',  // href_id : textarea_id
				_02_02 : '_02_05',
				_03_02 : '_03_05',

				// 保証コメント
				_01_03 : '_01_02',
				_02_03 : '_02_02',
				_03_03 : '_03_02',

				_01_04 : '_01_03',
				_02_04 : '_02_03',
				_03_04 : '_03_03',

				// 画像コメント
				_01_05 : '_01_04',
				_02_05 : '_02_04',
				_03_05 : '_03_04'
			};
			this._boilerplate_flg = {
				_01 : 11, // 事前登録パック
				_02 : 6,  // 法定整備コメント
				_03 : 7,  // 保証コメント
				_04 : 20, // 装備内容
				_05 : 10  // 画像コメント
			};
			var _car_data = {};
			$.each($(":hidden[id]"),function (i,n) {
				eval("_car_data." + $(n).attr("id") + "=" + "'" + $(n).val() + "'");
			});
			this._car_data = _car_data;
			//this._seibi_select_obj = $("#select_01_01,#select_02_01,#select_03_01");
			this._seibi_select_obj = $("#select_01_01,#select_02_01,#select_03_01");
			this._inspect_select_obj = $("#select_01_02,#select_02_02,#select_03_02");
			this._clear_pack_btns = $("#clear_01_pack,#clear_02_pack,#clear_03_pack");
			this._inspect_radio_obj = $(":radio").filter(function(index) {var reg = /^radio_\d{2}_((?:03)|(?:04))/; return reg.test(this.id);});
			this._href_obj = $("a[id^='href_']");
			this._service_select_obj = $("select").filter(function() {return /^select_\d{2}_04/.test(this.id);});
			this._clear_pack();
			this._inspect_radio_ctrl();
			this._inspect_ctrl();
			this._seibi_select_crtl();
			this._boilerplate_ctrl();
			this._radio_ctrl();  // add by ZJ 2012.07.23
			this._seibi_select_obj.change();
			this._inspect_select_obj.change();
			this._service_select_ctrl(this._service_select_obj);
			this._service_select_obj.change()
			this._before_packs();
			this._check_msg_id = "checkmsg";
			this._textarea_obj = $("[id^='textarea_']");
			this._text_obj = $("[id^='text_']");
			this._seibi_checkbox_ctrl();
			this._inspect_checkbox_ctrl();
			this._textarea_check(this._textarea_obj);
			this._text_check(this._text_obj);
			$("[id^='text']:enabled").blur();
			$(":checkbox:checked").filter(function(){return /checkbox_\d{2}_0[12]/.test(this.id);}).click().attr("checked",true);
			this._check_flg = true;
			this._ischeck = false;
		},
		// 入力リセット
		_clear_pack : function () {
			$this = this;
			$this._clear_pack_btns.click( function () {
				$this._ischeck = true;
				var select_btn = this.id.match(/^clear_(\d{2}).+/)[1];
				var _pack_obj = $(":radio[id^='radio_" + select_btn +"'],textarea[id^='textarea_" + select_btn +"'],:checkbox[id^='checkbox_" + select_btn +"_03'],input[id^='text_" + select_btn +"'],select[id^='select_" + select_btn +"']");
				// パック名
				$("[id^='textarea_" + select_btn +"']").attr("value","").blur();
				// 事前登録パック
				$("#select_" + select_btn + "_03").val("0");
				$("#select_" + select_btn + "_01").val($this._car_data.seibi_flg).change();
				// 整備費用
				$("#text_" + select_btn + "_02:enabled").val($this._car_data.seibi_price_num);
				$("#textarea_" + select_btn + "_05:enabled").val($this._car_data.seibi_comment);  // add by ZJ 2012.08.07
				$("#text_" + select_btn + "_03").val("");
				// 保証費用
				$("#text_" + select_btn + "_01").attr("value",$this._car_data.total_price).blur();

				var p_flg = {
					_0 : '0',
					_1 : '1',
					_2 : '',
					_3 : '1'
				};
				$("#select_" + select_btn + "_02").val(eval("p_flg._" + $this._car_data.hosyou_flg)).change();

				$("[id^='radio_" + select_btn + "_03']:enabled").attr("checked",function () {
					if ($(this).attr('name').match(/.+\[\d\]\[(\w+)\]/)[1] == 'hosyou_kigen_flg') {
						if ($this._car_data.hosyou_kigen_flg == '1') {
							return true;
						} else {
							return false;
						}
					} else {
						if ($(this).attr("value") === $this._car_data.hosyou_kikan_flg && $this._car_data.hosyou_kikan_flg !== '0') {
							return true;
						} else {
							return false;
						}
					}
				}).filter(":checked").click();

				$("#text_" + select_btn + "_06_01:enabled").val(Math.floor(toNum($this._car_data.hosyou_kikan_num) / 12));
				$("#text_" + select_btn + "_06_02:enabled").val(toNum($this._car_data.hosyou_kikan_num)%12);
				var year,month;
				if (toNum($this._car_data.hosyou_kigen_num_month)%12 == 0) {
					year = toNum($this._car_data.hosyou_kigen_num_year) + Math.floor(toNum($this._car_data.hosyou_kigen_num_month)/12) - 1;
					month = 12;
				} else {
					year = toNum($this._car_data.hosyou_kigen_num_year) + Math.floor(toNum($this._car_data.hosyou_kigen_num_month)/12);
					month = toNum($this._car_data.hosyou_kigen_num_month)%12;
				}
				year = $this._car_data.hosyou_kigen_num_year || '';
				month = $this._car_data.hosyou_kigen_num_month  || '';
				$("#text_" + select_btn + "_07_01:enabled").val(year);
				$("#text_" + select_btn + "_07_02:enabled").val(month);

				$("[id^='radio_"+ select_btn + "_04']:enabled").attr("checked", function () {
					if ($(this).val() === $this._car_data.hosyou_kyori_flg) {
						return true;
					} else {
						return false;
					}
				}).filter(":checked").click();
				$("#text_" + select_btn + "_04:enabled").attr("value",$this._car_data.hosyou_kyori_num).blur();
				$("#textarea_" + select_btn + "_02:enabled").val($this._car_data.hosyou_comment);  // add by ZJ 2012.08.07

				var _option = {
					option_values : "p_option",
					option_web : "p_option_web",
					option_values_2 : "p_option_values_2"
				};
				// 装備内容
				// <select>  ナビ    TV    アルミホイール  ctrl
				$("[id^='select_" + select_btn + "_04']").removeAttr("name").find("option").attr("selected", function () {
					if ($(this).attr("flg_name")) {
						var _option_name = $(this).attr("flg_name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[1];
						var _option_index = $(this).attr("flg_name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[2] - 1;
						if (eval("$this._car_data." + eval("_option." + _option_name)).charAt(_option_index) == '1') {
							return true;
						} else {
							return false;
						}
					}
				}).change();
				$("[id^='checkbox_" + select_btn + "_03']").attr("checked",function () {
					var _option_name = $(this).attr("name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[1];
					var _option_index = $(this).attr("name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[2] - 1;
					if (eval("$this._car_data." + eval("_option." + _option_name)).charAt(_option_index) == '1') {
						$(this).click();
						return true;
					} else {
						return false;
					}
				});
				$("[id^='text_" + select_btn + "_05']").val("").blur();
				setDelPic(select_btn.substr(1,1));
				$("#radio_" + select_btn + "_02_02").attr("checked",true);
				$("[id^='boilerplate_" + select_btn + "']").remove();
				$("[id^='href_" + select_btn + "']").css("display",function() {
					if ($("#textarea" + eval("$this._textarea_id_obj." + this.id.substr(this.id.indexOf("_")))).attr("disabled")) {
						return "none";
					} else {
						return "inline-block";
					}
				});
				$("[id^='text_" + select_btn +"']:enabled,[id^='textarea_" + select_btn +"']:enabled").blur();
				$(":checkbox").filter(function(){return eval("/checkbox_"+ select_btn + "_0[12]/.test(this.id)");}).attr("checked",true).click().attr("checked",true);
				$this._check_flg = true;
				$this._ischeck = false;

				return false;
			});
		},

		_price_assure_state : function (select_btn, value) {
			$this = this;
			var price_assure_obj = $(":radio[id^='radio_" + select_btn + "_03']").add($(":radio[id^='radio_" + select_btn + "_04']")).add($("input[id^='text_" + select_btn + "_06']")).add($("input[id^='text_" + select_btn + "_04']")).add($("input[id^='text_" + select_btn + "_03']")).add($("input[id^='text_" + select_btn + "_07']")).add($("textarea[id^='textarea_" + select_btn + "_02']"));

			if (value == "0" || value == "") {
				price_assure_obj.filter(":radio").attr("checked",false).attr("disabled",true);
				price_assure_obj.filter("input[id^='text_']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
				price_assure_obj.filter("textarea").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
				$("#boilerplate_" + select_btn + "_03").remove();
				$("#href_" + select_btn + "_03").css("display","none");
			} else if (value == "1") {
				price_assure_obj.filter(":radio[id^='radio_" + select_btn + "_04']").attr("checked",function(index){
					return $(this).attr("checked");
				}).attr("disabled",false);
				price_assure_obj.filter(":radio[id^='radio_" + select_btn + "_03']").attr("checked",function(index){
					return $(this).attr("checked");
				}).attr("disabled",false);
				$("#radio_" + select_btn + "_03_01").attr("name","p_data[" + select_btn.substr(1,1) + "][hosyou_kikan_flg]");
				$("#radio_" + select_btn + "_03_03").attr("disabled",false);  // modified by ZJ 2012.07.23

				price_assure_obj.filter("input[id^='text_" + select_btn + "_06']").attr("value",function(index) {
					if ($("#radio_" + select_btn + "_03_02").attr("checked")) {
						return $(this).attr("value");
					} else {
						return "";
					}
				}).attr("disabled",function(index) {
					if ($("#radio_" + select_btn + "_03_02").attr("checked")) {
						return false;
					} else {
						return true;
					}
				}).css("background-color",function(index) {
					if ($("#radio_" + select_btn + "_03_02").attr("checked")) {
						return "#FFFFFF";
					} else {
						return "#EBEBE4";
					}

				});

				price_assure_obj.filter("input[id^='text_" + select_btn + "_07']").attr("value",function() {
					if ($("#radio_" + select_btn + "_03_03").attr("checked")) {
						return $(this).attr("value");
					} else {
						return "";
					}
				}).attr("disabled",function() {
					if ($("#radio_" + select_btn + "_03_03").attr("checked")) {
						return false;
					} else {
						return true;
					}
				}).css("background-color",function(index) {
					if ($("#radio_" + select_btn + "_03_03").attr("checked")) {
						return "#FFFFFF";
					} else {
						return "#EBEBE4";
					}
				});
				price_assure_obj.filter("textarea").attr("disabled",false).css("background-color","#FFFFFF");
				// modified by ZJ 2012.07.23 ->
				price_assure_obj.filter("input[id^='text_" + select_btn + "_04']").attr("value",function() {
					if ($("#radio_" + select_btn + "_04_02").attr("checked")) {
						return $(this).attr("value");
					} else {
						return "";
					}
				}).attr("disabled",function() {
					if ($("#radio_" + select_btn + "_04_02").attr("checked")) {
						return false;
					} else {
						return true;
					}
				}).css("background-color",function(index) {
					if ($("#radio_" + select_btn + "_04_02").attr("checked")) {
						return "#FFFFFF";
					} else {
						return "#EBEBE4";
					}
				});
				// modified by ZJ 2012.07.23 <-

				if ($("[id^='radio_" + select_btn + "_03']:checked").length != 1) {
					var str = "期間\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || "radio_" + select_btn + "_03_01";
				}
				if ($("[id^='radio_" + select_btn + "_04']:checked").length != 1) {
					var str = "距離\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || "radio_" + select_btn + "_04_01";
				}
				$("#boilerplate_" + select_btn + "_03").remove();
				$("#href_" + select_btn + "_03").css("display","inline-block").removeAttr("dis");
			} else if (value == '2') {
				price_assure_obj.filter(":radio").attr("checked",false).attr("disabled",true);
				price_assure_obj.filter("input[id^='text_']").filter(function () {
					if(this.id == 'text_' + select_btn + '_03') {
						return false;
					} else {
						return true;
					}
				}).attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
				price_assure_obj.filter("input[id^='text_" + select_btn + "_03']").attr("value",function () {
					return this.value;
				}).attr("disabled",false).css("background-color","#FFFFFF");

				if ($("[id^='text_" + select_btn + "_03']").val() == '') {
					var str = "期間\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
				}
			} else if (value == "3") {
				price_assure_obj.filter(":radio[id^='radio_" + select_btn + "_04']").attr("checked",function(){
					return $(this).attr("checked");
				}).attr("disabled",false);

				price_assure_obj.filter(":radio[id^='radio_" + select_btn + "_03']").attr("checked",function(){
					return $(this).attr("checked");
				}).attr("disabled",false);

				$("#radio_" + select_btn + "_03_01").attr("name","p_data[" + select_btn.substr(1,1) + "][hosyou_kigen_flg]");
				$("#radio_" + select_btn + "_03_02").attr("checked",false).attr("disabled",true);
				$("#radio_" + select_btn + "_03_04").attr("checked",false).attr("disabled",true);
				price_assure_obj.filter("input[id^='text_" + select_btn + "_06']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
				price_assure_obj.filter("input[id^='text_" + select_btn + "_03']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");

				price_assure_obj.filter("input[id^='text_" + select_btn + "_04']").attr("value",function() {
					if ($("#radio_" + select_btn + "_04_02").attr("checked")) {
						return $(this).attr("value");
					} else {
						return "";
					}
				}).attr("disabled",function() {
					if ($("#radio_" + select_btn + "_04_02").attr("checked")) {
						return false;
					} else {
						return true;
					}
				}).css("background-color",function(index) {
					if ($("#radio_" + select_btn + "_04_02").attr("checked")) {
						return "#FFFFFF";
					} else {
						return "#EBEBE4";
					}
				});

				price_assure_obj.filter("input[id^='text_" + select_btn + "_07']").attr("value",function() {
					if ($("#radio_" + select_btn + "_03_03").attr("checked")) {
						return $(this).attr("value");
					} else {
						return "";
					}
				}).attr("disabled",function() {
					if ($("#radio_" + select_btn + "_03_03").attr("checked")) {
						return false;
					} else {
						return true;
					}
				}).css("background-color",function(index) {
					if ($("#radio_" + select_btn + "_03_03").attr("checked")) {
						return "#FFFFFF";
					} else {
						return "#EBEBE4";
					}
				});
				if ($("[id^='radio_" + select_btn + "_03']:checked").length != 1) {
					var str = "期間\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || "radio_" + select_btn + "_03_01";;
				}
				if ($("[id^='radio_" + select_btn + "_04']:checked").length != 1) {
					var str = "距離\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || "radio_" + select_btn + "_04_01";;
				}

			}
		},

		//期間 text ctrl
		_price_assure_radio : function (radio_btn_pack, radio_btn_proj, radio_btn_index) {
			if (radio_btn_proj == '03') {
				if (radio_btn_index == '01' || radio_btn_index == '04') {
					$("input[id^='text_" + radio_btn_pack + "_06']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
					$("input[id^='text_" + radio_btn_pack + "_07']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
				} else if (radio_btn_index == '02') {
					$("input[id^='text_" + radio_btn_pack + "_06']").attr("disabled",false).css("background-color","#ffeeee");
					$("input[id^='text_" + radio_btn_pack + "_07']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
				} else if (radio_btn_index == '03') {
					$("input[id^='text_" + radio_btn_pack + "_06']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
					$("input[id^='text_" + radio_btn_pack + "_07']").attr("disabled",false).css("background-color","#ffeeee");
				}
			} else if (radio_btn_proj == '04') {
				if (radio_btn_index == '01' || radio_btn_index == '03') {
					$("input[id='text_" + radio_btn_pack + "_04']").attr("value","").attr("disabled",true).css("background-color","#EBEBE4");
				} else if (radio_btn_index == '02') {
					$("input[id='text_" + radio_btn_pack + "_04']").attr("disabled",false).css("background-color","#ffeeee");
				}
			}
		},

		_inspect_ctrl : function () {
			$this = this;
			$this._inspect_select_obj.change( function () {
				var select_btn = this.id.match(/select_(\d{2}).+/)[1];
				$this._price_assure_state(select_btn, this.value);
			});
		},

		_inspect_radio_ctrl : function () {
			$this = this;
			$this._inspect_radio_obj.click( function () {
				var radio_btn_id = $(this).attr("id").match(/radio_(\d{2})_(\d{2})_(\d{2})/);
				var radio_btn_pack = radio_btn_id[1];
				var radio_btn_proj = radio_btn_id[2];
				var radio_btn_index = radio_btn_id[3];
				$this._price_assure_radio(radio_btn_pack, radio_btn_proj, radio_btn_index);
			});
		},

		_seibi : function (select_btn, value) {

			if (value == "0" || value == "") {
				$("#text_" + select_btn + "_02").attr("value","").attr("disabled",true).css({"background-color":"#EBEBE4"});
				$("#textarea_" + select_btn + "_05").attr("value","").blur().attr("disabled",true).css({"background-color":"#EBEBE4"});
				$("#boilerplate_" + select_btn + "_02").remove();
				$("#href_" + select_btn + "_02").css("display","none");
			} else if (value == "1") {
				$("#text_" + select_btn + "_02").attr("value","").attr("disabled",true).css({"background-color":"#EBEBE4"});
				$("#textarea_" + select_btn + "_05").attr("value",function () { return $(this).val();}).attr("disabled",false).css({"background-color":"#FFFFFF"});
				$("#href_" + select_btn + "_02").css("display","inline-block").removeAttr("dis");
			} else if (value == "2") {
				$("#text_" + select_btn + "_02").attr("value",function () { return $(this).val();}).attr("disabled",false).css({"background-color":"#FFFFFF"});
				$("#textarea_" + select_btn + "_05").attr("value",function () { return $(this).val();}).attr("disabled",false).css({"background-color":"#FFFFFF"});
				$("#href_" + select_btn + "_02").css("display","inline-block").removeAttr("dis");
			}


		},

		_seibi_select_crtl : function() {
			$this = this;
			$this._seibi_select_obj.change( function () {
				var select_btn = this.id.match(/select_(\d{2}).+/)[1];
				$this._seibi(select_btn, this.value);
			});
		},

		//法定整備  基本支払総額と同じ  checkbox ctrl
		_seibi_checkbox_ctrl : function () {
			var obj = $("#checkbox_01_01,#checkbox_02_01,#checkbox_03_01");
			obj.click(function () {
				var checkbox_id = this.id;
				var select_btn = checkbox_id.match(/checkbox_(\d{2}).+/)[1];

				if ($(this).attr("checked")) {
					$("#select_" + select_btn + "_01").val($this._car_data.seibi_flg).change().attr("disabled",true);
					// 整備費用
					$("#text_" + select_btn + "_02:enabled").val($this._car_data.seibi_price_num).attr("disabled",true);
					$("#textarea_" + select_btn + "_05:enabled").val($this._car_data.seibi_comment).blur().attr("disabled",true);
					$("#boilerplate_" + select_btn + "_02").remove();
					$("#href_" + select_btn + "_02").css("display","none");
				} else {
					$("#select_" + select_btn + "_01").val($this._car_data.seibi_flg).change().attr("disabled",false);
				}
			});
		},

		//保証 基本支払総額と同じ  checkbox ctrl
		_inspect_checkbox_ctrl : function () {
			var obj = $("#checkbox_01_02,#checkbox_02_02,#checkbox_03_02");
			obj.click(function () {
				var checkbox_id = this.id;
				var select_btn = checkbox_id.match(/checkbox_(\d{2}).+/)[1];
				var p_flg = {
					_0 : '0',
					_1 : '1',
					_2 : '',
					_3 : '1'
				};

				if ($(this).attr("checked")) {
					$("#select_" + select_btn + "_02").val(eval("p_flg._" + $this._car_data.hosyou_flg)).change().attr("disabled",true);

					$("[id^='radio_" + select_btn + "_03']:enabled").attr("checked",function () {
						if ($(this).attr('name').match(/.+\[\d\]\[(\w+)\]/)[1] == 'hosyou_kigen_flg') {
							if ($this._car_data.hosyou_kigen_flg == '1') {
								return true;
							} else {
								return false;
							}
						} else {
							if ($(this).attr("value") === $this._car_data.hosyou_kikan_flg && $this._car_data.hosyou_kikan_flg !== '0') {
								return true;
							} else {
								return false;
							}
						}
					}).attr("disabled",true).filter(":checked").click();

					$("#text_" + select_btn + "_06_01:enabled").val(Math.floor(toNum($this._car_data.hosyou_kikan_num) / 12)).blur().attr("disabled",true);
					$("#text_" + select_btn + "_06_02:enabled").val(toNum($this._car_data.hosyou_kikan_num)%12).blur().attr("disabled",true);
					var year,month;
					if (toNum($this._car_data.hosyou_kigen_num_month)%12 == 0) {
						year = toNum($this._car_data.hosyou_kigen_num_year) + Math.floor(toNum($this._car_data.hosyou_kigen_num_month)/12) - 1;
						month = 12;
					} else {
						year = toNum($this._car_data.hosyou_kigen_num_year) + Math.floor(toNum($this._car_data.hosyou_kigen_num_month)/12);
						month = toNum($this._car_data.hosyou_kigen_num_month)%12;
					}
					year = $this._car_data.hosyou_kigen_num_year || '';
					month = $this._car_data.hosyou_kigen_num_month  || '';
					$("#text_" + select_btn + "_07_01:enabled").val(year).blur().attr("disabled",true);
					$("#text_" + select_btn + "_07_02:enabled").val(month).blur().attr("disabled",true);

					$("[id^='radio_"+ select_btn + "_04']:enabled").attr("checked", function () {
						if ($(this).val() === $this._car_data.hosyou_kyori_flg) {
							return true;
						} else {
							return false;
						}
					}).attr("disabled",true).filter(":checked").click();
					$("#text_" + select_btn + "_04:enabled").attr("value",$this._car_data.hosyou_kyori_num).blur().attr("disabled",true);
					$("#textarea_" + select_btn + "_02:enabled").val($this._car_data.hosyou_comment).blur().attr("disabled",true);
					$("#boilerplate_" + select_btn + "_03").remove();
					$("#href_" + select_btn + "_03").css("display","none");
				} else {
					$("#select_" + select_btn + "_02").val(eval("p_flg._" + $this._car_data.hosyou_flg)).change().attr("disabled",false);
				}
			});
		},

		// add by ZJ 2012.07.23 ->
		_radio_ctrl : function () {
			var obj =  $(":radio").filter(function() {return /^radio_\d{2}_03/.test(this.id);});
			obj.click(function () {
				var radio_id = this.id;
				var select_btn = radio_id.match(/radio_(\d{2}).+/)[1];
				obj.filter(function () {
					if (this.id.match(/radio_(\d{2}).+/)[1] == select_btn) {
						return true;
					} else {
						return false;
					}
				}).attr("checked",function () {
					if (this.id == radio_id) {
						return $(this).attr("checked");
					} else {
						return false;
					}
				});
			});
		},
		// add by ZJ 2012.07.23 <-

		_service_select_ctrl : function (obj) {
			obj.change(function () {
				var name = $(this).find("option:selected").attr("flg_name") || "";
				$(this).attr("name", name);
			});
		},

		// ============= check part ================

		_isCR : function (val) {
			val = val || "";
			var idx1 = val.indexOf("\n");
			return (idx1 != -1);
		},

		_count_surplus_chars : function (obj, max_chars) {
			return max_chars - obj.length;
		},

		_textarea_check : function (obj) {
			$this = this;
			obj.focus(function () {
				$(this).css("background-color","#ffeeee");
			});

			obj.blur(function () {
				var nenshiki_flg = $("#nenshiki_flg").val(); // add by jiangcq 20120817
				$(this).css("background-color","#ffffff");
				var checkmsg_id = $this._check_msg_id + this.id.substr(this.id.indexOf('_'));
				var max_chars = $(this).attr("maxlength");
				var comment_flg = this.id.match(/textarea_\d{2}(_\d{2})/)[1];
				var select_btn = this.id.match(/textarea_(\d{2}).+/)[1];
				var comment_flg_obj = {
					_01 : 'plan_name',        // パック名
					_03 : 'service_comment',  // 装備内容
					_02 : 'hosyou_comment',   // 保証備考
					_04 : 'image_caption',
					_05 : 'seibi_comment'     // 法定整備
				};
				var comment_name = {
					_01 : 'パック名',
					_03 : '装備内容',
					_02 : '保証備考',
					_04 : '画像',
					_05 : '法定整備'
				};

				$(this).val(hanToZen($(this).val().trim(), false, false));
				var checkmsg = $this._count_surplus_chars($(this).val(), max_chars);
				if (checkmsg < 0) {
					$(this).css("background-color","#ffeeee");
					$("#" + checkmsg_id).text(checkmsg).css("color","red");
					if(!$this._ischeck) {
						alert(max_chars + "文字以内で入力して下さい");
					}
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					var str = eval("comment_name." + comment_flg) + "文字を超えました\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
				} else {
					$("#" + checkmsg_id).text(checkmsg).css("color","#000000");
				}

				if ($this._isCR($(this).val())) {
					alert("改行はご使用出来ません。");
					//var str = "改行はご使用出来ません。";
					//eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					$this._check_flg &= false;
					$(this).focus();
					$this._focus_id = $this._focus_id || this.id;
				}
				//$(this).val(zenToHanPrice($(this).val()));
				//$(this).val(hanToZen($(this).val().trim().substr(0,$(this).attr("maxlength")), true, false));

				// 画像
				if (comment_flg == "_04" && $(this).val() != '') {
					var src = $("#pic_path_" + toNum(select_btn)).attr("src");
					var file_name = src.substr(src.lastIndexOf('/') + 1);
					if (file_name == 'no_photo.gif') {
						$(this).val("");
						$(this).blur();
						if(!$this._ischeck) {
							alert("画像がないので、コメントが登録できません。");
						}
						return false;
					}
				}
				// パック名
				if (comment_flg == "_01" && $(this).val() == '' && $("[id^='radio_" + select_btn + "_02']:checked").val() == '0') {
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					var str = "パック名\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					return false;
				}

				if (eval("comment_flg_obj." + comment_flg)) {
					if ($this._check_flg && !onBlurNGCheck(eval("comment_flg_obj." + comment_flg), $(this).val(), nenshiki_flg)) {
						//if (!onBlurNGCheck(eval("comment_flg_obj." + comment_flg), $(this).val())) { // modify by jiangcq 20120817
						$(this).css("background-color","#ffeeee");
						$this._check_flg &= false;
						$this._focus_id = $this._focus_id || this.id;
						if (!$this._ischeck) {
							$this._check_flg = true;
						}
					}
				}

			});

			obj.keydown(function () {
				var checkmsg = $this._count_surplus_chars($(this).val(), $(this).attr("maxlength"));
				$this._str = $(this).val();

			});
			obj.keyup(function () {
				var checkmsg_id = $this._check_msg_id + this.id.substr(this.id.indexOf('_'));
				var checkmsg = $this._count_surplus_chars($(this).val(), $(this).attr("maxlength"));
				$("#" + checkmsg_id).text(checkmsg);
				if (checkmsg < 0) {
					$("#" + checkmsg_id).css("color","red");
					if ($(this).val().length - $this._str.length > 0) {
						$(this).val($this._str);
					}
					var checkmsg = $this._count_surplus_chars($(this).val(), $(this).attr("maxlength"));
					$("#" + checkmsg_id).text(checkmsg);
				} else {
					$("#" + checkmsg_id).text(checkmsg).css("color","#000000");
				}

			});
		},

		_text_check : function (obj) {
			$this = this;
			obj.focus(function () {
				$(this).css("background-color","#ffeeee");
			});
			// 整備費用
			obj.filter(function () {
				var reg = /^text_\d{2}_0[2]/;
				return reg.test(this.id);
			}).blur(function () {
				$(this).val(zenToHanPrice($(this).val()));
				var value = $(this).val() * 1;
				var reg = /^\+?[1-9][0-9]*$/;
				var select_btn = this.id.match(/text_(\d{2}).+/)[1];
				if ($this._ischeck && $("[id^='radio_" + select_btn + "_02']:checked").val() == '1') {
					return false;
				}

				if (isNaN(value) || value < 1) {
					$(this).css("background-color","#ffeeee");
					if ($(this).val() != '' && !$this._ischeck) {
						alert("に0より大きい整数を入力してください。");
					}
					$(this).val("");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					var str = "整備費用\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
				} else {
					$(this).val(value.toFixed());
					$(this).css("background-color","#ffffff");
				}
			});
			// 保証費用
			obj.filter(function () {
				var reg = /^text_\d{2}_0[3]/;
				return reg.test(this.id);
			}).blur(function () {
				$(this).val(zenToHanPrice($(this).val()));
				var value = $(this).val() * 1;
				var select_btn = this.id.match(/text_(\d{2}).+/)[1];
				if ($this._ischeck && $("[id^='radio_" + select_btn + "_02']:checked").val() == '1') {
					return false;
				}

				if (isNaN(value)) {
					$(this).css("background-color","#ffeeee");
					if ($(this).val() != '' && !$this._ischeck) {
						alert("に0より大きい整数を入力してください。");
					}
					$(this).val("");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					var str = "保証費用\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
				} else {
					$(this).val(value.toFixed());
					$(this).css("background-color","#ffffff");
				}
			});
			// 支払総額
			obj.filter(function () {
				var reg = /^text_\d{2}_01/;
				return reg.test(this.id);
			}).blur(function () {
				var select_btn = this.id.match(/text_(\d{2}).+/)[1];
				//if ($this._ischeck && $("[id^='radio_" + select_btn + "_02']:checked").val() == '1') {
				//return false;
				//}
				var value = zenToHanPrice($(this).val()) * 1;
				var p_seibi_price = $("#text_" + select_btn + "_02").val() * 1 || 0; // 整備費用
				var p_hosyou_price = $("#text_" + select_btn + "_03").val() * 1 || 0; // 保証費用
				var total_price = toNum($("#total_price").val()).mul(10000);
				if (!$this._car_data.seibi_price_num) {
					$this._car_data.seibi_price_num = 0;
				} else {
					$this._car_data.seibi_price_num *= 1;
				}

				if ($(this).val() === '') {
					$(this).css({"background-color":"#ffeeee","color":"black"});
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					var str = "支払総額(税込)\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					if (!$this._ischeck) {
						alert(eval("$this._pack_flg._" + select_btn) + "パックの支払総額(税込):\r\n半角数字と半角小数点のみ入力して下さい。\r\n整数は4桁まで、小数点以下は1桁までです。");
					}
				} else if (!isNaN(value) && value.toFixed(1).mul(10000) >= total_price && value.toFixed(1) < 10000) {
					$(this).val(value.toFixed(1)).css({"background-color":"#ffffff","color":"black"});
				} else if (!isNaN(value) && value.toFixed(1).mul(10000) < total_price && value.toFixed(1) >= 0) {
					$(this).val(value.toFixed(1)).css({"background-color":"#ffffff","color":"red"});
					if (!$this._ischeck) {
						//alert(eval("$this._pack_flg._" + select_btn) + "支払総額(税込):\r\n基本支払総額以上の金額を入力して下さい。");
					}
				} else {
					$(this).css({"background-color":"#ffeeee","color":"black"});
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					var str = "支払総額(税込)\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					if (!$this._ischeck) {
						alert(eval("$this._pack_flg._" + select_btn) + "パックの支払総額(税込):\r\n半角数字と半角小数点のみ入力して下さい。\r\n整数は4桁まで、小数点以下は1桁までです。");
					}
					//$(this).val("");
				}

			});

			// 距離
			obj.filter(function () {
				var reg = /^text_\d{2}_04/;
				return reg.test(this.id);
			}).blur(function () {
				var select_btn = this.id.match(/text_(\d{2}).+/)[1];
				var value = zenToHanPrice($(this).val());

				if (!isNaN(value * 1) && value != '' && ((value * 1).toFixed(0) > 999) && ((value * 1).toFixed(0) < 1000000)) {
					$(this).css("background-color","#ffffff").val((value * 1).toFixed(0));
				} else {
					$(this).css("background-color","#ffeeee");
					if ($this._ischeck && $("[id^='radio_" + select_btn + "_02']:checked").val() == '1') {
						$this._check_flg &= false;
						$this._focus_id = $this._focus_id || this.id;
						var str = "距離\r\n";
						eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					}
					if (!$this._ischeck && value != '') {
						alert("保証走行に1000より大きい整数を入力してください。");
					}
					$(this).val("");
				}
			});
			// その他整備・サービス内容
			obj.filter(function () {
				var reg = /^text_\d{2}_05/;
				return reg.test(this.id);
			}).blur(function () {
				var select_btn = this.id.match(/text_(\d{2}).+/)[1];
				var nenshiki_flg = $("#nenshiki_flg").val(); // add by jiangcq 20120817
				$(this).val(hanToZen($(this).val().trim(), false , false));
				var checkmsg_id = $this._check_msg_id + this.id.substr(this.id.indexOf('_'));
				var checkmsg = $this._count_surplus_chars($(this).val(), $(this).attr("maxlength"));
				if (checkmsg < 0) {
					$("#" + checkmsg_id).css("color","red").text($(this).val().length);
					var max_chars = $(this).attr("maxlength");
					$(this).css("background-color","#ffeeee");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					var str = "その他整備・サービス内容\r\n";
					eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
					if(!$this._ischeck) {
						alert(max_chars + "文字以内で入力して下さい");
					}
				} else {
					$("#" + checkmsg_id).css("color","#000000").text($(this).val().length);
					$(this).css("background-color","#ffffff");
				}
				if ($this._check_flg && !onBlurNGCheck('service', $(this).val(), nenshiki_flg)) {
					$(this).css("background-color","#ffeeee");
					$this._check_flg &= false;
					$this._focus_id = $this._focus_id || this.id;
					if (!$this._ischeck) {
						$this._check_flg = true;
					}
				}
			}).keyup(function () {
				var checkmsg_id = $this._check_msg_id + this.id.substr(this.id.indexOf('_'));
				var checkmsg = $this._count_surplus_chars($(this).val(), $(this).attr("maxlength"));
				if (checkmsg < 0) {
					$("#" + checkmsg_id).css("color","red").text($(this).val().length);
				} else {
					$("#" + checkmsg_id).css("color","#000000").text($(this).val().length);
				}
			});
			// 保証期間
			obj.filter(function () {
				var reg = /^text_\d{2}_0[6]/;
				return reg.test(this.id);
			}).blur(function () {
				var select_btn = this.id.match(/text_(\d{2}).+/)[1];
				if ($this._ischeck && $("[id^='radio_" + select_btn + "_02']:checked").val() == '1' && $(this).attr("disabled")) {
					return false;
				}
				$(this).val(zenToHanPrice($(this).val().trim(), true , false));
				var value = $(this).val() * 1;
				if (isNaN(value)) {
					$(this).val("");
					$(this).css("background-color","#ffeeee");
					if (!$this._ischeck) {
						alert("保証期限が正しい入力してください。例：平成XX年XX月");
						return false;
					}
				}

				var id = this.id.substr(this.id.lastIndexOf('_'));
				if (id == '_01') {
					if ($(this).val() == '') {
						$(this).val("0");
						$(this).css("background-color","#ffffff");
					} else if (value.toFixed() < 0 || value.toFixed() > 99) {
						$(this).css("background-color","#ffeeee");
						if (!$this._ischeck) {
							alert("保証期間\r\nが正しい入力してください。");
						}
						$this._check_flg &= false;
						$this._focus_id = $this._focus_id || this.id;
						var str = "保証期間の年\r\n";
						eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
						return false;
					} else {
						$(this).val(value.toFixed()).css("background-color","#ffffff");
					}

				} else if (id == '_02') {
					if ($(this).val() == '') {
						$(this).val("0");
						$(this).css("background-color","#ffffff");
					} else if (value.toFixed() < 0 || value.toFixed() > 11) {
						$(this).css("background-color","#ffeeee");
						if (!$this._ischeck) {
							alert("保証期間の月は０より大きい、12より小さい。");
							return false;
						}
						var str = "保証期間の月\r\n";
						eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
						$this._check_flg &= false;
						$this._focus_id = $this._focus_id || this.id;
						return false;

					} else {
						$(this).val(value.toFixed()).css("background-color","#ffffff");
					}

					if ($this._ischeck && $this._check_flg) {
						var total_month = $("#text_" + select_btn + "_06_01").val() * 12 + $("#text_" + select_btn + "_06_02").val() * 1;
						if (isNaN(total_month) || total_month < 1) {
							var str = "保証期間の総月数は1より小さい\r\n";
							eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
							$this._check_flg &= false;
							$this._focus_id = $this._focus_id || this.id;
							return false;
						}
					}
				}

			});
			// 保証期限
			obj.filter(function () {
				var reg = /^text_\d{2}_0[7]/;
				return reg.test(this.id);
			}).blur(function () {
				var select_btn = this.id.match(/text_(\d{2}).+/)[1];
				if ($this._ischeck && $("[id^='radio_" + select_btn + "_02']:checked").val() == '1' && $(this).attr("disabled")) {
					return false;
				}
				$(this).val(zenToHanPrice($(this).val().trim(), true , false));
				var value = $(this).val() * 1;
				if (isNaN(value)) {
					$(this).css("background-color","#ffeeee");
					//$this._check_flg &= false;
					if (!$this._ischeck) {
						$(this).val("");
						alert("保証期限が正しい入力してください。例：平成XX年XX月");
						return false;
					}
				}

				var id = this.id.substr(this.id.lastIndexOf('_'));
				if (id == '_01') {
					if (value.toFixed() < 1 || value.toFixed() > 99) {
						$(this).css("background-color","#ffeeee");

						var str = "保証期限の年\r\n";
						eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
						$this._check_flg &= false;
						$this._focus_id = $this._focus_id || this.id;
						if ($(this).val() != '' && !$this._ischeck) {
							alert("保証期限が正しい入力してください。例：平成XX年XX月");
						}
					} else {
						$(this).attr("value",value.toFixed()).css("background-color","#ffffff");
					}
				} else if (id == '_02') {
					if (value.toFixed() < 1 || value.toFixed() > 12) {
						$(this).css("background-color","#ffeeee");
						var str = "保証期限の月\r\n";
						eval("$this._error_msg." + eval("$this._pack_flg._" + select_btn) + " += str");
						$this._check_flg &= false;
						$this._focus_id = $this._focus_id || this.id;
						if ($(this).val() != '' && !$this._ischeck) {
							alert("保証期限が正しい入力してください。例：平成XX年XX月");
						}
					} else {
						$(this).attr("value",value.toFixed()).css("background-color","#ffffff");
					}
				}

			});

			// commit check
			$("#submit_btn").click(function () {
				if (this._ischeck) {
					return false;
				}
				$this._check_flg = true;
				$this._ischeck = true;
				$this._focus_id = "";
				$this._error_msg.A = "";
				$this._error_msg.B = "";
				$this._error_msg.C = "";
				$this._seibi_select_obj.filter(":enabled").change();
				$this._inspect_select_obj.filter(":enabled").change();
				$("[id^='text']:enabled").blur();

				if($this._check_flg) {
					$this._ischeck = false;
					goPurchaseCon('0');
				} else {
					var str = "ご提出のメッセージは正しくありません。\r\n";
					var s = "";
					if ($this._error_msg.A != '') {
						s += "Aパック:\r\n" + $this._error_msg.A;
					}
					if ($this._error_msg.B != '') {
						s += "Bパック:\r\n" + $this._error_msg.B;
					}
					if ($this._error_msg.C != '') {
						s += "Cパック:\r\n" + $this._error_msg.C;
					}
					if (s != "") {
						alert(str + s);
					}
					$("#" + $this._focus_id).focus();
					$this._check_flg = true;
					$this._ischeck = false;
					return false;
				}
				$this._ischeck = false;
			});
		},

		//  boilerplate  定型文
		_boilerplate_ctrl : function () {
			$this = this;
			$this._href_obj.click(function () {
				if ($(this).attr("dis")) {
					return false;
				} else {
					$(this).attr("dis",'1');
				}
				var id = this.id.substr(this.id.indexOf('_'));
				var select_btn = this.id.match(/href_(\d{2}).+/)[1];
				if ($("#textarea" + eval("$this._textarea_id_obj." + id)).attr("disabled")) {
					return false;
				}
				var flg = this.id.substr(this.id.lastIndexOf('_'));
				var _url = "/php/car/car_entry/tpltxt_ajax.php";
				var _data = {
					client_id : $("#client_id").val(),
					flg : 2,
					tpl_flg : eval("$this._boilerplate_flg." + flg)
				};
				if (!_data.tpl_flg) {
					return false;
				}


				_fnSuccess = function(data_val) {
					var select_html_obj = $(data_val).find("select");
					select_html_obj.attr("id","boilerplate" + id).css("margin","0px 5px 0px 0px").removeAttr("onchange").change(function () {
						if (this.value == '0') {
							return false;
						}
						var _data2 = _data;
						_data2.flg = 3;
						_data2.sub_id = this.value;
						_fnSuccess2 = function(data_r) {
							data_r = data_r.replace(/&#12316;/g, "～");
							// 2012.11.27 mod 画像comment更新 by ryc
							//var str = $("#textarea" + eval("$this._textarea_id_obj." + id)).val() + data_r;
							var str = $("#textarea" + eval("$this._textarea_id_obj." + id)).val();
							var checkmsg = $this._count_surplus_chars(str, $("#textarea" + eval("$this._textarea_id_obj." + id)).attr("maxlength"));
							if (checkmsg < 0) {
								var max_chars = $("#textarea" + eval("$this._textarea_id_obj." + id)).attr("maxlength");
								alert(max_chars + "文字以内で入力して下さい");
							} else {
								// 2012.11.27 mod 画像comment更新 by ryc
								//$("#textarea" + eval("$this._textarea_id_obj." + id)).val($("#textarea" + eval("$this._textarea_id_obj." + id)).val() + data_r).blur();
								$("#textarea" + eval("$this._textarea_id_obj." + id)).val(data_r).blur();
							}
						};
						$this._ajax(_url, $.param(_data2), _fnSuccess2);
					});

					$("#href" + id).after(select_html_obj[0]).css("display","none").removeAttr("dis");
				};
				$this._ajax(_url, $.param(_data), _fnSuccess);
			});
		},

		//事前登録パック
		_before_packs : function () {
			$this = this;
			var _url = "/php/car/purchase_pack/purchase_ajax.php";
			var _data = {
				client_id : $("#client_id").val(),
				// 2012.11.19 add 購入パック設定画像登録 by ryc start
				sess_id : $(":input[name=PHPSESSID]").val(),
				stock_id : $("#stock_id").val(),
				// 2012.11.19 add 購入パック設定画像登録 by ryc end
				tpl_flg : 11
			};

			$("#select_01_03,#select_02_03,#select_03_03").change(function () {
				if (this.value == '0') {
					return false;
				}
				var select_btn = this.id.match(/select_(\d{2}).+/)[1];
				_data.sub_id = this.value;
				_data.purchase_flg = 1; // 1 detail
				// 2012.11.19 add 購入パック設定画像登録 by ryc
				_data.fileIndex = toNum(select_btn);
				_fnSuccess = function(data_r) {
					$this._ischeck = true;
					data_r = $.parseJSON(data_r)
					// 事前登録パック
					var _option = {
						option_values : "p_option_values",
						option_web : "option_values_web",
						option_values_2 : "option_values_2"
					};
					var _option_car = {
						option_values : "p_option",
						option_web : "p_option_web",
						option_values_2 : "p_option_values_2"
					};
					// 事前登録パック
					$("#textarea_" + select_btn + "_01").val(data_r.plan_name).blur();

					// 事前登録にて法定整備が未選択・未入力の場合は、 基本情報をそのまま残し、
					// 選択されていれば、事前登録内容を適用  でお願い致します。
					$("#checkbox_" + select_btn + "_01").attr("checked",function () {
						if (data_r.seibi_same_flg == '1') {
							return true;
						} else {
							return false;
						}
					}).click().attr("checked",function () {
						if (data_r.seibi_same_flg == '1') {
							return true;
						} else {
							return false;
						}
					});
					$("#select_" + select_btn + "_01:enabled").attr("value", function () {
						if (data_r.p_seibi_flg !== '') {
							var flg = data_r.p_seibi_flg;
						} else {
							var flg = $this._car_data.seibi_flg;
						}
						return flg;
					}).change();
					$("#text_" + select_btn + "_02:enabled").attr("value", function () {
						if ($this._car_data.seibi_price_num == 0) {
							return "";
						} else {
							return $this._car_data.seibi_price_num;
						}
					});
					$("#textarea_" + select_btn + "_05:enabled").attr("value", function () {
						if (data_r.seibi_comment.replace(/&#12316;/g, "～") == '') {
							var str = $this._car_data.seibi_comment;
						} else {
							var str = data_r.seibi_comment.replace(/&#12316;/g, "～");
						}
						return str;
					}).blur();
					var select_value;
					var car_flg = {
						__ : 2,
						_0_ : 4,
						_3_1 : 6,
						_1_1 : 6,
						_1_9 : 8,
						_0_0 : 3.5,
						_2_0 : 4
					};
					var master_flg = {
						__ : 1,
						_0_ : 3,
						_0_0 : 3,
						_1_1 : 5,
						_1_9 : 7,
						_2_ : 9
					};
					var flg_ki = {
						_1 : 'hosyou_kikan_flg',
						_2 : 'hosyou_kikan_flg',
						_3 : 'hosyou_kigen_flg',
						_0 : 'hosyou_kikan_flg',
						_ : 'hosyou_kikan_flg'
					};
					/*
					 $("#select_" + select_btn + "_02").attr("value",function () {
					 var flg = eval("car_flg._" + $this._car_data.hosyou_flg + "_" + eval("$this._car_data." + eval("flg_ki._" + $this._car_data.hosyou_flg))) > eval("master_flg._" + data_r.hosyou_flg + "_" + eval("data_r." + eval("flg_ki._" + data_r.hosyou_flg))) ? $this._car_data.hosyou_flg : data_r.hosyou_flg;
					 return flg;
					 }).change();
					 */

					$("#checkbox_" + select_btn + "_02").attr("checked",function () {
						if (data_r.hosyou_same_flg == '1') {
							return true;
						} else {
							return false;
						}
					}).click().attr("checked",function () {
						if (data_r.hosyou_same_flg == '1') {
							return true;
						} else {
							return false;
						}
					});
					var p_flg = {
						_0 : '0',
						_1 : '1',
						_2 : '',
						_3 : '1'
					};

					var from_data = "";  // use the data from 事前 pack or base pack
					$("#select_" + select_btn + "_02:enabled").attr("value", function () {
						if (data_r.hosyou_flg !== '') {
							var flg = eval("p_flg._" + data_r.hosyou_flg);
							from_data = "data_r";  // base pack
						} else {
							var flg = eval("p_flg._" + $this._car_data.hosyou_flg);
							from_data = "$this._car_data";  // 事前 pack
						}
						return flg;
					}).change();

					var radio_name = $("#radio_" + select_btn + "_03_01").attr("name").match(/.+\[\d\]\[(\w+)\]/)[1];

					$("[id^='radio_" + select_btn + "_03']:enabled").attr("checked",function () {
						//var flg =  eval("car_flg._" + $this._car_data.hosyou_flg + "_" + eval("$this._car_data." + eval("flg_ki._" + $this._car_data.hosyou_flg))) > eval("master_flg._" + data_r.hosyou_flg + "_" + eval("data_r." + eval("flg_ki._" + data_r.hosyou_flg))) ? eval("$this._car_data." + radio_name) : eval("data_r." + radio_name);
						//var flg = eval("data_r." + radio_name);  // delete by ZJ  2012.07.23
						//modified by ZJ 2012.07.23 ->
						if ($(this).attr('name').match(/.+\[\d\]\[(\w+)\]/)[1] == 'hosyou_kigen_flg') {
							if (eval(from_data + ".hosyou_kigen_flg") == '1') {
								return true;
							} else {
								return false;
							}
						} else {
							if ($(this).attr("value") === eval(from_data + ".hosyou_kikan_flg")) {
								return true;
							} else {
								return false;
							}
						}
						//modified by ZJ 2012.07.23 <-
					}).filter(":checked").click();

					$("#text_" + select_btn + "_03:enabled").val(data_r.hosyou_price).blur();

					var car_kyori = {
						_0 : 2,
						_9 : 6,
						_1 : 4
					};
					var master_kyori = {
						_0 : 1,
						_1 : 3,
						_9 : 5
					};

					$("[id^='radio_" + select_btn + "_04']:enabled").attr("checked",function () {
						//var flg = eval("car_kyori._" + $this._car_data.hosyou_kyori_flg) > eval("master_kyori._" + data_r.hosyou_kyori_flg) ? $this._car_data.hosyou_kyori_flg : data_r.hosyou_kyori_flg;
						var flg = eval(from_data + ".hosyou_kyori_flg");
						if ($(this).attr("value") === flg) {
							return true;
						} else {
							return false;
						}
					}).filter(":checked").click();

					$("#text_" + select_btn + "_04:enabled").attr("value",toNum(data_r.p_hosyou_kyori).add($this._car_data.hosyou_kyori_num)).blur();
					//$("#text_" + select_btn + "_04:enabled").val(toNum(data_r.p_hosyou_kyori)).blur();

					var total_month = toNum(data_r.p_hosyou_kikan.split("-")[0]) * 12 + toNum(data_r.p_hosyou_kikan.split("-")[1]) * 1;
					$("#text_" + select_btn + "_06_01:enabled").val(Math.floor((toNum($this._car_data.hosyou_kikan_num) + total_month) / 12)).blur();
					$("#text_" + select_btn + "_06_02:enabled").val((toNum($this._car_data.hosyou_kikan_num) + total_month)%12).blur();
					//$("#text_" + select_btn + "_06_01:enabled").val(Math.floor(total_month / 12)).blur();
					//$("#text_" + select_btn + "_06_02:enabled").val(total_month % 12).blur();
					var year,month;
					if ((total_month + toNum($this._car_data.hosyou_kigen_num_month))%12 == 0) {
						year = toNum($this._car_data.hosyou_kigen_num_year) + Math.floor((toNum($this._car_data.hosyou_kigen_num_month) + total_month)/12) - 1;
						month = 12;
					} else {
						year = toNum($this._car_data.hosyou_kigen_num_year) + Math.floor((toNum($this._car_data.hosyou_kigen_num_month) + total_month)/12);
						month = (total_month + toNum($this._car_data.hosyou_kigen_num_month))%12;
					}
					if (from_data == "data_r") {
						year = toNum(data_r.p_hosyou_kigen.split("-")[0]);
						month = toNum(data_r.p_hosyou_kigen.split("-")[1]);
					} else {
						year = $this._car_data.hosyou_kigen_num_year || '';
						month = $this._car_data.hosyou_kigen_num_month  || '';
					}
					$("#text_" + select_btn + "_07_01:enabled").val(year).blur();  // modified by ZJ 2012.07.23
					$("#text_" + select_btn + "_07_02:enabled").val(month).blur();  // modified by ZJ 2012.07.23

					$("#textarea_" + select_btn + "_02:enabled").attr("value", function () {
						if (data_r.hosyou_comment.replace(/&#12316;/g, "～") == '') {
							var str = $this._car_data.hosyou_comment;
						} else {
							var str = data_r.hosyou_comment.replace(/&#12316;/g, "～");
						}
						return str;
					}).blur();
					//  装備内容 <select>  ナビ    TV    アルミホイール  ctrl
					$("[id^='select_" + select_btn + "_04']").removeAttr("name").find("option").attr("selected", function () {
						if ($(this).attr("flg_name")) {
							var _option_name = $(this).attr("flg_name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[1];
							var _option_index = $(this).attr("flg_name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[2] - 1;
							if (eval("data_r." + eval("_option." + _option_name)).charAt(_option_index) == '1') {
								return true;
							} else {
								return false;
							}
						}

					}).change();

					$.each($("[id^='select_" + select_btn + "_04']"), function (i, n) {
						if ($(n).val() == '') {  // 選択して下さい
							$(n).find("option").attr("selected", function () {
								if ($(this).attr("flg_name")) {
									var _option_name = $(this).attr("flg_name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[1];
									var _option_index = $(this).attr("flg_name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[2] - 1;
									if (eval("$this._car_data." + eval("_option_car." + _option_name)).charAt(_option_index) == '1') {
										return true;
									} else {
										return false;
									}
								}
							});
							$(n).change();
						}
					});

					$("[id^='checkbox_" + select_btn + "_03']").attr("checked",function () {
						var _option_name = $(this).attr("name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[1];
						var _option_index = $(this).attr("name").match(/.+\[\d\]\[(\w+)\]\[(\d+)\]/)[2] - 1;

						if (eval("$this._car_data." + eval("_option_car." + _option_name)).charAt(_option_index) == '1' || eval("data_r." + eval("_option." + _option_name)).charAt(_option_index) == '1') {
							$(this).click();
							return true;
						} else {
							return false;
						}
					});


					$("[id^='text_" + select_btn + "_05']").attr("value",function(index) {
						return eval("data_r.service" + (index + 1)).replace(/&#12316;/g, "～");
					}).blur();

					$("#textarea_" + select_btn + "_03").val(data_r.service_comment.replace(/&#12316;/g, "～")).blur();
					$("[id^='text_" + select_btn + "_01']").val(toNum($("#total_price").val()).add(toNum(data_r.sagaku_price)).toFixed(1)).blur();
					// 2012.11.19 add 購入パック設定画像登録 by ZJ start
					if (data_r.image_name != '' && data_r.res_copy != '') {
						$("#img_name_" + toNum(select_btn)).val(data_r.res_copy + "?" + (new Date()).valueOf());
						$("#pic_path_" + toNum(select_btn)).attr("src", $("#img_name_" + toNum(select_btn)).val());
						$("#img_" + toNum(select_btn)).val("1");
						$("#textarea_" + select_btn + "_04").val(data_r.image_caption);
					} else {
						$("#img_name_" + toNum(select_btn)).val('/img/purchase_pack/no_photo.gif');
						$("#pic_path_" + toNum(select_btn)).attr("src" , "/img/purchase_pack/no_photo.gif");
						document.getElementById("img_" + toNum(select_btn)).value = '2';
						$("#textarea_" + select_btn + "_04").val('').blur();
					}
					if (data_r.image_name != '' && "" != data_r.image_caption) {
						$("#textarea_" + select_btn + "_04").val(data_r.image_caption.replace(/&#12316;/g, "～")).blur();
					}
					// 2012.11.19 add 購入パック設定画像登録 by ZJ end

					$this._check_flg = true;
					$this._ischeck = false;
				};
				$this._ajax(_url, $.param(_data), _fnSuccess);
			});

		},

		_ajax : function(url,data,fnSuccess){
			$.ajax({
				type: "POST",
				data: data,
				url: url,
				success: fnSuccess
			});
		}

	};

})(jQuery);

$(document).ready(function() {
	new $.Purchase_Pack();
});


