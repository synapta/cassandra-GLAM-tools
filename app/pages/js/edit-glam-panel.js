// // Create NEW glam
$(function() {
  var id = window.location.href.toString().split('/')[5];
  // console.log(id);
  $.getJSON('/api/admin/glams/' + id, function(data) {
    console.log(data);
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
        "image": $('#featuredImageURL').val(),
        "password": $('#glamPassword').val()
      };

      $.ajax({
        type: "PUT",
        url:'/api/admin/glams/' + id,
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
