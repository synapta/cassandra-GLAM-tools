function is_touch_device() {
  var prefixes = " -webkit- -moz- -o- -ms- ".split(" ");
  var mq = function (query) {
    return window.matchMedia(query).matches;
  };

  if ("ontouchstart" in window || (window.DocumentTouch && document instanceof DocumentTouch)) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ["(", prefixes.join("touch-enabled),("), "heartz", ")"].join("");
  return mq(query);
}
// Load main sidebar
$("#main-sidebar").load("/views/templates/sidebar.html", function () {
  $.getJSON("/api/admin/settings", function (res) {
    if (res) {
      if (res.ownerUrl) {
        document.getElementById("owner-logo-url").href = res.ownerUrl;
      } else {
        document.getElementById("owner-logo-url").href = "https://www.wikimedia.ch/";
      }
      if (res.ownerName) {
        document.getElementById("owner-logo-url").title = res.ownerName;
      } else {
        document.getElementById("owner-logo-url").title = "Wikimedia";
      }
    }
  });

  // Load secondary sidebar
  $("#secondary-sidebar").load("/views/templates/secondary-sidebar.html", function () {
    renderChangeLang();

    // Fill GLAMS list
    $.get("/api/glams", function (glams) {
      if (glams.length > 0) {
        glams.forEach(function (g) {
          // create list element with link
          var list_element = $("<li>");
          let a = $("<a>");
          // set attrs
          a.html(g["fullname"]);
          a.attr("href", "/" + g["name"]);
          a.attr("alt", g["category"]);
          // append
          list_element.append(a);
          $("#secondary-sidebar > .institutions-list").append(list_element);
        });
      }
    });
    // Set mouse handler
    $(".institutions-menu")
      .mouseenter(function () {
        $("#secondary-sidebar").css("left", "var(--sidebar-width)");
        $(this).css("opacity", ".4");
      })
      .mouseleave(function () {
        if ($("#secondary-sidebar:hover").length === 0) {
          $("#secondary-sidebar").css("left", "0");
          $(".institutions-menu").css("opacity", "1");
        }
      });
    // Set mouse handlers
    $("#secondary-sidebar").mouseleave(function () {
      if ($(".institutions-menu:hover").length === 0) {
        $(this).css("left", "0");
        $(".institutions-menu").css("opacity", "1");
      }
    });
  });

  document.getElementById("owner-logo-image").src = "/assets/owner-logo.svg";

  document.getElementById("owner-logo-image").onerror = function () {
    document.getElementById("owner-logo-image").src = "/assets/img/owner-logo-default.svg";
  };
});

// Load mobile header bar
$("#mobile-header-bar").load("/views/templates/mobile-header.html", function () {
  // attach event to burger menu
  $(".left.sidebar").first().sidebar("attach events", "#sidebar-toggler", "show");
  //  no pointer events while menu is open (avoids to trigger click on logo)
  $(".left.sidebar").sidebar("setting", "onShow", function () {
    $("#mobile-header-bar").addClass("no-pointer-events");
  });
  $(".left.sidebar").sidebar("setting", "onHidden", function () {
    $("#mobile-header-bar").removeClass("no-pointer-events");
  });
});

// Load mobile sidebar
$("#mobile-sidebar").load("/views/templates/mobile-sidebar.html");

$(function () {
  $(".get-chart-info").click(function () {
    $(this).closest(".chart-preview-inner").css("transform", "rotateY(180deg)");
  });
  $(".close-chart-info").click(function () {
    $(this).closest(".chart-preview-inner").css("transform", "rotateY(0deg)");
  });
  $(".chart-preview-back").click(function () {
    $(this).closest(".chart-preview-inner").css("transform", "rotateY(0deg)");
  });
});
