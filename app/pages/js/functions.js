$(document).ready(function(){
    $.get('/api/glams', function (glams) {
        var photos = $('#photos');
        glams.forEach(function (glam) {
            var a = $('<a>');
            a.attr('href', '/' + glam['name']);
            a.attr('alt', glam['category']);
            photos.append(a);

            var container = $('<div>');
            container.attr('class', 'container');
            a.append(container);

            var img = $('<img>');
            img.attr('src', glam['image']);
            container.append(img);

            var block = $('<div>');
            block.attr('class', 'text-block');
            container.append(block);

            var h4 = $('<h4>');
            h4.text(glam['fullname']);
            block.append(h4);
        });
    });
});
