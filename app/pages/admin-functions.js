// // Create NEW glam
$(function() {
  $('#create-new-glam-button').click(function(e) {
    if (validateGlam()) {
      e.preventDefault();
      let glamData = {
        "name": $('#glamID').val(),
        "fullname": $('#glamFullName').val(),
        "category": $('#glamCategory').val(),
        "image": $('#featuredImageURL').val(),
        "password": $('#glamPassword').val()
      };

      $.ajax({
        type: "POST",
        url:'/api/admin/glams',
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify(glamData),
        success: function(data) {
          $('#wrong-glam').fadeOut(200);
          $('#new-glam-form').fadeOut(200, function() {
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
});

function validateGlam() {
  if ($('#glamID').val() === "") return false;
  if ($('#glamFullName').val() === "") return false;
  if ($('#glamCategory').val() === "") return false;
  if ($('#featuredImageURL').val() === "") return false;
  return true;
}
