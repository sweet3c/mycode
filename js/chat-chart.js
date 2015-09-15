var emaoChart = new emaoChart();
var tmp = $("#chartData").val() || "{}";
var chartData = new Function("return " + tmp)() || {};

// 按天统计
var dayOpt = getDayData(chartData);
// 按周统计
var weekOpt = getWeekData(chartData);
// 按月统计
var monthOpt = getMonthData(chartData);

function applyChart(opt){
	emaoChart.init(opt);
}

function getDayData(chartData){
	/**
	 * title:标题
	 * subtitle:副标题
	 * idName: 统计图在页面中的容器id
	 * type: 显示统计图类型, 如线形图(line),柱形图(bar)
	 *
	 */
	var res = {
		title : "",
		subtitle : "",
		idName : 'chatGraph',
		'type' : 'line',
		dataZoom : false,
		series_x : [],
		series_data_name : [],
		series_data : [],
		multiLine : true,
		legend : true
	};
	var title = chartData['title'] || '';
	var xLine = chartData['xLine'] || [];
	var xData = [];
	var xDataName = [];
	for(var key in chartData['data']) {
		xDataName.push(key);
		xData.push(chartData['data'][key]);
	}

	res['title'] = title;
	res['series_x'] = xLine;
	res['series_data_name'] = xDataName;
	res['series_data'] = xData;

	return res;
}

function getWeekData(chartData){
	var res = {
		title : "",
		subtitle : "",
		idName : 'chatGraph',
		'type' : 'line',
		dataZoom : false,
		series_x : [],
		series_data_name : [],
		series_data : [],
		multiLine : true,
		legend : true
	};
	var title = chartData['title'] || '';
	var xLine = chartData['xLine'] || [];
	var xData = [];
	var xDataName = [];
	var weekObj = {};
	var dataObj = {};
	for (var key in xLine) {
		var week = getWeekIndex(xLine[key]);
		var tmp = new Date(xLine[key]).getFullYear() + '年第' + week + '周';
		if (typeof weekObj[tmp] === "undefined") {
			weekObj[tmp] = {};
			weekObj[tmp]['start'] = xLine[key];
			weekObj[tmp]['end'] = xLine[key];
		}
		weekObj[tmp]['end'] = xLine[key];
	}
	for (var key in xLine) {
		var week = getWeekIndex(xLine[key]);
		var tmp = new Date(xLine[key]).getFullYear() + '年第' + week + '周';
		week = weekObj[tmp]['start'] + '~' + weekObj[tmp]['end'];
		for (var k in chartData['data']) {
			dataObj[k] = dataObj[k] || {};
			dataObj[k][week] = dataObj[k][week] || 0;
			dataObj[k][week] += chartData['data'][k][key];
		}
	}

	xLine = [];
	for (var key in weekObj) {
		xLine.push(weekObj[key]['start'] + '~' + weekObj[key]['end']);
	}

	var i = 0;
	for (var key in dataObj) {
		xDataName.push(key);
		xData[i] = [];
		for (var k in dataObj[key]) {
			xData[i].push(dataObj[key][k]);
		}
		i++;
	}

	res['title'] = title;
	res['series_x'] = xLine;
	res['series_data_name'] = xDataName;
	res['series_data'] = xData;

	return res;
}

function getMonthData(chartData){
	var res = {
		title : "",
		subtitle : "",
		idName : 'chatGraph',
		'type' : 'line',
		dataZoom : false,
		series_x : [],
		series_data_name : [],
		series_data : [],
		multiLine : true,
		legend : true
	};
	var title = chartData['title'] || '';
	var xLine = chartData['xLine'] || [];
	var xData = [];
	var xDataName = [];
	var monthObj = {};
	var dataObj = {};
	for (var key in xLine) {
		var tmp = new Date(xLine[key]);
		var month = tmp.getFullYear() + '年' + (tmp.getMonth() + 1) + '月';
		monthObj[month] = 1;
		for (var k in chartData['data']) {
			dataObj[k] = dataObj[k] || {};
			dataObj[k][month] = dataObj[k][month] || 0;
			dataObj[k][month] += chartData['data'][k][key];
		}
	}

	xLine = [];
	for (var key in monthObj) {
		xLine.push(key);
	}

	var i = 0;
	for (var key in dataObj) {
		xDataName.push(key);
		xData[i] = [];
		for (var k in dataObj[key]) {
			xData[i].push(dataObj[key][k]);
		}
		i++;
	}

	res['title'] = title;
	res['series_x'] = xLine;
	res['series_data_name'] = xDataName;
	res['series_data'] = xData;

	return res;
}

function getWeekIndex(dateStr) {
	var dateobj = new Date(dateStr);
	var firstDay = getFirstWeekBegDay(dateobj.getFullYear());
	if (dateobj < firstDay) {
		firstDay = getFirstWeekBegDay(dateobj.getFullYear() - 1);
	}
	d = Math.floor((dateobj.valueOf() - firstDay.valueOf()) / 86400000);
	return Math.floor(d / 7) + 1;
}
function getFirstWeekBegDay(year) {
	var tempdate = new Date(year, 0, 1);
	var temp = tempdate.getDay();
	if (temp == 1) {
		return tempdate;
	}
	temp = temp == 0 ? 7 : temp;
	tempdate = tempdate.setDate(tempdate.getDate() + (8 - temp));
	return new Date(tempdate);
}

$(function(){
	$(document).on('click', '[attr=chartDay]', function(){
		applyChart(dayOpt);
	});
	$(document).on('click', '[attr=chartWeek]', function(){
		applyChart(weekOpt);
	});
	$(document).on('click', '[attr=chartMonth]', function(){
		applyChart(monthOpt);
	});
	applyChart(dayOpt);
});