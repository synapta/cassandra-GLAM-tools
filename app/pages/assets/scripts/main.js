function how_to_read() {
  button = $("#how_to_read_button");
  box = $(".how_to_read");

  $("#how_to_read_button").click(function () {
    box.toggleClass("show");
    console.log("click");
  });
  console.log("no_click");
}

$(document).ready(function () {
  how_to_read();
  console.log("main");
});
