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
      	$('#cat_url').text(decodeURIComponent(d.category).replace("Category:",""));
      	$("#cat_url").attr("href", "https://commons.wikimedia.org/wiki/"+d.category);
      	$("#cat_url").attr("title", decodeURIComponent(d.category));
        $(".glamName").text(d.name);
  	});
}

function how_to_read(){
  	box = $(".how_to_read");

  	$("#how_to_read_button").click(function(){
  		  box.toggleClass("show");
  	});
};

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
