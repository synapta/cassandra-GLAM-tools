// Load main sidebar
$('#main-sidebar').load('/views/templates/sidebar.html');

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
