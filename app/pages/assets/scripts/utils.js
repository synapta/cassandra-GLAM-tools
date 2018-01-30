//Format numbers with dots
function formatter (value) {
    return value.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, '.');
}

//Format high numbers with strings
function nFormatter(num) {
    if (num >= 1000000000) {
        return formatter((num / 1000000000).toFixed(1).replace(/\.0$/, '')) + 'B';
    }
    if (num >= 1000000) {
        return formatter((num / 1000000).toFixed(1).replace(/\.0$/, '')) + 'M';
    }
    if (num >= 1000) {
        return formatter((num / 1000).toFixed(1).replace(/\.0$/, '')) + 'K';
    }
    return formatter(num.toFixed(1).replace(/\.0$/, ''));
}
