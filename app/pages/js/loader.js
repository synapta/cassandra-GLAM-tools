function is_touch_device() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
    return window.matchMedia(query).matches;
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

// Load main sidebar
$('#main-sidebar').load('/views/templates/sidebar.html', function() {
  $('#secondary-sidebar').load('/views/templates/secondary-sidebar.html', function() {
    $('.institutions-menu').mouseenter(function() {
      $('#secondary-sidebar').css('left', 'var(--sidebar-width)');
      $(this).css('opacity', '.4');
    }).mouseleave(function() {
      if ($('#secondary-sidebar:hover').length === 0) {
        $('#secondary-sidebar').css('left', '0');
        $('.institutions-menu').css('opacity', '1');
      }
    });
    $('#secondary-sidebar').mouseleave(function() {
      console.log('ue')
      if ($('.institutions-menu:hover').length === 0) {
        $(this).css('left', '0');
        $('.institutions-menu').css('opacity', '1');
      }
    });
  });
});

// Load mobile header bar
$('#mobile-header-bar').load('/views/templates/mobile-header.html', function() {
  // attach event to burger menu
  $('.left.sidebar').first().sidebar('attach events', '#sidebar-toggler', 'show');
  //  no pointer events while menu is open (avoids to trigger click on logo)
  $('.left.sidebar').sidebar('setting', 'onShow', function() {
    $('#mobile-header-bar').addClass('no-pointer-events');
  });
  $('.left.sidebar').sidebar('setting', 'onHidden', function() {
    $('#mobile-header-bar').removeClass('no-pointer-events');
  });
});

// Load mobile sidebar
$('#mobile-sidebar').load('/views/templates/mobile-sidebar.html');


$(function() {
  $('.get-chart-info').click(function() {
    $(this).closest('.chart-preview-inner').css('transform', 'rotateY(180deg)');
  });
  $('.close-chart-info').click(function() {
    $(this).closest('.chart-preview-inner').css('transform', 'rotateY(0deg)');
  });
  $('.chart-preview-back').click(function() {
    $(this).closest('.chart-preview-inner').css('transform', 'rotateY(0deg)');
  });
});
