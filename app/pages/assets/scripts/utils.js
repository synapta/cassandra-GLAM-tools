//Format numbers with dots
function formatter (value) {
	return value.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, '.');
}

//Format high numbers with strings
function nFormatter(num) {
	if (num >= 1000000000) {
		return formatter((num / 1000000000).toFixed(1).replace(/\.0$/, '')) + 'B';
	}
	if (num >= 1000000) {
		return formatter((num / 1000000).toFixed(1).replace(/\.0$/, '')) + 'M';
	}
	if (num >= 1000) {
		return formatter((num / 1000).toFixed(1).replace(/\.0$/, '')) + 'K';
	}
	return formatter(num.toFixed(1).replace(/\.0$/, ''));
}

function setCategory() {
	var db = window.location.href.toString().split('/')[3];
	var subcat = window.location.href.toString().split('/')[5];
	var page = window.location.href.toString().split('/')[4];
	var jsonurl = "/api/" + db;
	
	$.getJSON(jsonurl, function(d) {
		if (page && page === "search"){
			subcat = d.category;
		}
		$('#totalMediaNum').text(formatter(d.files));
		$('#cat_url').text(decodeURIComponent(subcat ? subcat :d.category).replace("Category:",""));
		$("#cat_url").attr("href", "https://commons.wikimedia.org/wiki/"+(subcat ? subcat :d.category));
		$("#cat_url").attr("title", decodeURIComponent((subcat ? subcat :d.category)).replace(/[_-]/g," "));
		$(".glamName").text(d.fullname);
		$('#cover').css('background-image', 'url(' + d.image + ')');
	});
	
	//XXX needed for correct urls
	// var baseUrl = window.location.href + "/";
	// console.log(baseUrl)
	// baseUrl = baseUrl.replace(/\/\/$/,"/");
	// $("#basebase").attr("href", baseUrl);
	// console.log($("#basebase").attr("href"))
}

function how_to_read(){
	box = $(".how_to_read");
	
	$("#how_to_read_button").click(function() {
		box.toggleClass("show");
	});
}

function switch_page() {
	var baseurl = document.location.href;
	var h = baseurl.split("/")
	var h_1 = h[h.length-1]
	var home = baseurl.replace(h_1,"");
	
	$('#switch_page').change(function() {
		var page = $(this).val();
		var url = home + page;
		
		if (url != '') {
			window.location = url;
		}
		return false;
	});
}
function fixedEncodeURIComponent(str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16);
	});
}

function searchFiles(force) {
	let search = $("#searchFilesInput").val();
	if(event && event.keyCode === 13){
		force = true;
	}
	if (force){
		if (search.length >= 3){
			let db = window.location.href.split("/")[3];
			search = search.replace(/\s/g,"_");
			console.log(search)
			window.location.href = "/"+db+"/search/"+search;
		} else {
			$('#searchFilesInputForm').popover('show');
		}
	}
}

// Check if object if empty
function isEmpty(obj) {
	return Object.keys(obj).length <= 0;
}

String.prototype.hashCode = function() {
	var hash = 0, i, chr;
	if (this.length === 0) return hash;
	for (i = 0; i < this.length; i++) {
		chr   = this.charCodeAt(i);
		hash  = ((hash << 5) - hash) + chr;
		hash |= 0; // Convert to 32bit integer
	}
	return hash;
};

function cleanImageName(name) {
	// clean special characters in order to use image name as element ID
	return name.replace(/jpg/i, "").replace(/png/i, "").replace(/tif/i, "").replace(/[{()}]/g, "").replace(/\./g,"").replace(/\,/g,"").replace(/&/g,"").replace(/'/g,"").replace(/"/g,"");
}

function getPageFromElementIdx(element_idx, items_in_page) {
	// calc in which page is an element with a given index
	return Math.floor((element_idx - 1) / items_in_page);
}

var isMobile = {
	Android: function() {
		var m = navigator.userAgent.match(/Android/i);
		if (m === null) {
			return false;
		} else {
			return true;
		}
	},
	BlackBerry: function() {
		var m = navigator.userAgent.match(/BlackBerry/i);
		if (m === null) {
			return false;
		} else {
			return true;
		}
	},
	iOS: function() {
		var m = navigator.userAgent.match(/iPhone|iPad|iPod/i);
		if (m === null) {
			return false;
		} else {
			return true;
		}
	},
	Opera: function() {
		var m = navigator.userAgent.match(/Opera Mini/i);
		if (m === null) {
			return false;
		} else {
			return true;
		}
	},
	Windows: function() {
		var m = navigator.userAgent.match(/IEMobile/i);
		if (m === null) {
			return false;
		} else {
			return true;
		}
	},
	any: function() {
		return (this.Android() || this.BlackBerry() || this.iOS() || this.Opera() || this.Windows());
	}
}

// Trick to improve the visualization
var fixDataViz = function (data, field) {
	if (data.length > 1) {
		data.shift();
		let dateDelta = moment(data[data.length - 1][field]).utc(true).diff(moment(data[data.length - 2][field]));
		data.push(Object.assign({}, data[data.length - 1]));
		data[data.length - 1][field] = moment(data[data.length - 1][field]).utc(true).add(dateDelta);
	}
	return data;
}

function sortNodes(d,order) {
	const glam = window.location.href.toString().split('/')[3];
	if (order === "desc_order"){
		d.nodes.sort( function(a,b) {
			return b.files - a.files;
		});
	}
	else if (order === "asc_order") {
		d.nodes.sort( function(a,b) {
			return a.files - b.files;
		});
	}
	if (order === "by_name"){
		d.nodes.sort( function(a,b) {
			let res = a.group - b.group;
			if(res === 0)
				res = b.files-a.files;
			return res;
		});
	}
	
	for (let i = 0; i < d.nodes.length; i++) {
		d.nodes[i].name = d.nodes[i].id.replace(/_/g," ");
		d.nodes[i].files = nFormatter(d.nodes[i].files);
		d.nodes[i].id_encoded = d.nodes[i].id.hashCode();
		d.nodes[i].url = '/'+glam+'/category-network/'+d.nodes[i].id;
		d.nodes[i].urlUnused = '/'+glam+'/category-network/'+d.nodes[i].id+'/unused';
	}
}