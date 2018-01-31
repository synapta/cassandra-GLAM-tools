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

function setTotalMediaNum() {
  	var db = window.location.href.toString().split('/')[3];
  	var jsonurl= "/api/"+db+"/totalMediaNum";

  	$.getJSON(jsonurl, function(d) {
  	    $('#totalMediaNum').text(formatter(d.num));
  	});
}

function setCategory() {
  	var db = window.location.href.toString().split('/')[3];
  	var jsonurl = "/api/"+db+"/rootcategory";

  	$.getJSON(jsonurl, function(d) {
      	$('#cat_url').text(decodeURIComponent(d.id).replace(/_/g," "));
      	$("#cat_url").attr("href", "https://commons.wikimedia.org/wiki/Category:"+d.id);
      	$("#cat_url").attr("title", decodeURIComponent(d.id).replace(/_/g," "));
  	});
}
