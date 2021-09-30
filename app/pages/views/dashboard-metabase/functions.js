const glam = window.location.href.toString().split("/")[3];
let SUBCATEGORY;

function setCategoryCb(category) {
  SUBCATEGORY = category;
}

$(document).ready(function () {
  const baseurl = document.location.href;
  let h = baseurl.split("/");
  let cat = h[5];
  if (cat) {
    const newUrl = h.slice(0, 5).join("/");
    if (newUrl) {
      window.location = newUrl;
    }
  }
  setCategory(setCategoryCb);
  $("#download_dashboard_link").attr("href", "/api/" + glam + "/dashboard/download");
  $.getJSON("/api/" + glam + "/dashboard", function (res) {
    const iframe = document.getElementById("dashboard-metabase");
    iframe.src = res.iframeUrl;
  });
});
