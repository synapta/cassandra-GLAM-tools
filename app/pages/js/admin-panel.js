$(function() {
  // Help
  $('#admin-help').mouseenter(function() {
    $('#glam-legend').stop().fadeIn(200);
  }).mouseleave(function() {
    $('#glam-legend').stop().fadeOut(200);
  });
  // Get data
  $.getJSON('/api/admin/glams', function(items) {
    if (items.length > 0) {
      $.get('/views/templates/glam-preview.tpl', function(tpl) {
        var template = Handlebars.compile(tpl);
        items.forEach(function(el, idx) {
          // create object
          let obj = {};
          obj.glamID = el.name;
          obj.glamFullName = el.fullname;
          obj.image_url = el.image;
          obj.glamCategory = el.category.replace("Category:", "");
          if (el.lastrun !== null) {
            obj.lastrun = moment(el.lastrun).format("MMM Do YY");
          }
          obj.status = el.status;
          // if (el.paused) {
          //   obj.paused = true;
          //   obj.status = "paused";
          // }
          // if (el.lastrun === null) {
          //   obj.draft = true;
          //   obj.status = "draft";
          // } else if (!el.paused) {
          //   obj.status = "active";
          // }
          // console.log(obj);
          // render
          if (isEven(idx)) {
            $('#glams-list-left').append(template(obj));
          } else {
            $('#glams-list-right').append(template(obj));
          }
        });
        // on hover
        $('.glam-block').mouseenter( function() {
          $(this).find('.glam-controls-overlay').fadeIn(200);
          $(this).find('.glam-controls').fadeIn(200);
        }).mouseleave( function() {
          $(this).find('.glam-controls-overlay').fadeOut(100);
          $(this).find('.glam-controls').fadeOut(100);
        });
      });
    } else {
      // no glams
    }
  });
});

function isEven(number) {
  return number % 2 === 0;
}
