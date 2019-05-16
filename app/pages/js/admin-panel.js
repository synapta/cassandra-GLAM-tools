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
      let running = 0;
      let paused = 0;
      let failed = 0;
      let pending = 0;
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
          switch (obj.status) {
            case "running":
              running++;
              obj.command = "pause";
              obj.paused = false;
              break;
            case "pending":
              pending++;
              obj.command = "pause";
              obj.paused = false;
              break;
            case "paused":
              paused++;
              obj.command = "restart";
              obj.paused = true;
              break;
            case "failed":
              failed++;
              obj.command = "retry";
              obj.paused = true;
              break;
          }
          // if (isEven(idx)) {
          //   $('#glams-list-left').append(template(obj));
          // } else {
          //   $('#glams-list-right').append(template(obj));
          // }
          $('#glams-list-unique').append(template(obj));
        });
        // Display counts
        $('#total-glams').html(items.length);
        $('#running-glams').html(running);
        $('#pending-glams').html(pending);
        $('#paused-glams').html(paused);
        $('#failed-glams').html(failed);
        if (is_touch_device()) {
          console.log('touch screen');
          // show always
          $('.glam-controls').fadeIn();
        } else {
          // show on hover
          $('.glam-block').mouseenter( function() {
            $(this).find('.glam-controls').fadeIn(200);
          }).mouseleave( function() {
            $(this).find('.glam-controls').fadeOut(100);
          });
        }
        // on click pause/unpause
        $('.glam-block > .glam-controls.command').click(function() {
          let pause = !$(this).data('glampaused');
          $.ajax({
            type: "PUT",
            url:'/api/admin/glams/' + $(this).data('glamid'),
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({paused: pause}),
            success: function(data) {
              location.reload();
            },
            error: function(err) {
              alert('Something went wrong!');
              $(this).removeClass('disabled');
            }
          });
          $(this).addClass('disabled');
        });
      });
    } else {
      $('#glams-list').html('<div class="w-100 text-center my-5"><h1>No available GLAMs</h1></div>');
    }
  });
  // filter functions
  $('.glam-filter').click(function() {
    let id = this.id.replace('-glams', '');
    filterGlams(id);
  });
});

function isEven(number) {
  return number % 2 === 0;
}

function filterGlams(id) {
  let $btn = $('#' + id + '-btn');
  console.log($btn);
  $('.filt-btn').removeClass('active-btn');
  switch (id) {
    case 'total':
      $('.glam-block').fadeIn();
      break;
    case 'running':
      $('.glam-block.pending').fadeOut(500, function() {
        $('.glam-block.running').fadeIn(300);
      });
      $('.glam-block.paused').fadeOut(400);
      $('.glam-block.failed').fadeOut(400);
      break;
    case 'pending':
      $('.glam-block.running').fadeOut(500, function() {
        $('.glam-block.pending').fadeIn(300);
      });
      $('.glam-block.paused').fadeOut(400);
      $('.glam-block.failed').fadeOut(400);
      break;
    case 'paused':
      $('.glam-block.running').fadeOut(500, function() {
        $('.glam-block.paused').fadeIn(300);
      });
      $('.glam-block.pending').fadeOut(400);
      $('.glam-block.failed').fadeOut(400);
      break;
    case 'failed':
      $('.glam-block.running').fadeOut(500, function() {
        $('.glam-block.failed').fadeIn(300);
      });
      $('.glam-block.pending').fadeOut(400);
      $('.glam-block.paused').fadeOut(400);
      break;
  }
  $btn.addClass('active-btn');
}
