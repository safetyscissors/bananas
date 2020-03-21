

define(function() {
    function post(player, dataType, data) {
        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.open('POST', 'http://localhost/twotris/server/');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(`player=${player}&type=${dataType}&data=${JSON.stringify(data)}`);
        console.log('posted ', dataType);
        return xhr;
    }

    return {
        post: post,
    }
});