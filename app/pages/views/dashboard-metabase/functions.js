const glam = window.location.href.toString().split('/')[3];
let SUBCATEGORY;

function setCategoryCb(category) {
	SUBCATEGORY = category;
}

$(document).ready(function() {
	setCategory(setCategoryCb);
	let iframeUrl = "";
	$.getJSON('/api/metabase', function (res) {
		const iframe = document.getElementById('dashboard-metabase');
		console.log(res);
		iframe.src = res.iframeUrl;
		console.log(res.iframeUrl)
	});
});
