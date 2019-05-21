
$(document).ready(function() {
  $.get('/api/glams', function (glams) {
    var photos = $('#photos');
    if (glams.length > 0) {
      $.get('/views/templates/glam-homepage.tpl', function(tpl) {
        var template = Handlebars.compile(tpl);
        glams.forEach(function (glam, idx) {
          let obj = {};
          obj.url = '/' + glam['name'];
          obj.category = glam['category'];
          obj.image_url = glam['image'];
          obj.title = glam['fullname'];

          switch (idx % 3) {
            case 0:
              // console.log(idx, ' first col');
              $('#photos-1').append(template(obj));
              break;
            case 1:
              // console.log(idx, ' snd col');
              $('#photos-2').append(template(obj));
              break;
            case 2:
              // console.log(idx, ' thirs col');
              $('#photos-3').append(template(obj));
              break;
          }
        });
      });
    } else {
      $('#photos-2').html('<div class="w-100 text-center my-5"><h1>No available GLAMs</h1></div>');
    }
  });
});
