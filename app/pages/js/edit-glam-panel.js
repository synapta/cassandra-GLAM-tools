var PWD_EDITED = false;

// Edit glam
$(function() {
  var id = window.location.href.toString().split('/')[5];

  $.getJSON('/api/admin/glams/' + id, function(data) {
    $('#glamID').val(data.name);
    $('#glamFullName').val(data.fullname);
    $('#glamCategory').val(data.category.replace("Category:", ""));
    $('#featuredImageURL').val(data.image);
  });


  $('#edit-glam-button').click(function(e) {
    if (validateGlam()) {
      e.preventDefault();
      let glamData = {
        "name": $('#glamID').val(),
        "fullname": $('#glamFullName').val(),
        "category": $('#glamCategory').val(),
        "image": $('#featuredImageURL').val()
      };

      if (PWD_EDITED) {
        glamData.password = $('#glamPassword').val();
      }
      
      $.ajax({
        type: "PUT",
        url:'/api/admin/glams/' + id,
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(glamData),
        success: function(data) {
          $('#wrong-glam').fadeOut(200);
          $('#edit-glam-form').fadeOut(200, function() {
            $('#success-glam').fadeIn(200);
          });
        },
        error: function(err) {
          $('#wrong-glam').hide();
          $('#wrong-glam').fadeIn(200);
        }
      });
    }
  });

  $('#edit-password-button').click(function(e) {
    e.preventDefault();
    if ($('#password-field').is(':visible')) {
      $('#password-field').fadeOut(400);
      PWD_EDITED = false;
      $(this).text('§[admin.edit-password]§').removeClass('btn-warning').addClass('btn-danger');
    } else {
      $('#password-field').fadeIn(400);
      PWD_EDITED = true;
      $(this).text('§[admin.keep-password]§').removeClass('btn-danger').addClass('btn-warning');
    }
  });
});

function validateGlam() {
  if ($('#glamID').val() === "") return false;
  if ($('#glamFullName').val() === "") return false;
  if ($('#glamCategory').val() === "") return false;
  if ($('#featuredImageURL').val() === "") return false;
  return true;
}
