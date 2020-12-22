const glam = window.location.href.toString().split('/')[3];
let SUBCATEGORY;

function setCategoryCb(category) {
	SUBCATEGORY = category;
}

$(document).ready(function() {
	setCategory(setCategoryCb);
	$.getJSON('/api/' + glam + '/dashboard', function (res) {
		const iframe = document.getElementById('dashboard-metabase');
		iframe.src = res.iframeUrl;
		console.log(res.iframeUrl)
	});
});
