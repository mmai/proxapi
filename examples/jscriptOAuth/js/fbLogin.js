
var appID = <Your app ID>;

function fbLogin() {
    var path = 'https://www.facebook.com/dialog/oauth?';
    var queryParams = ['client_id=' + appID,
    'redirect_uri=' + window.location,
    'response_type=token'];
    var query = queryParams.join('&');
    var url = path + query;
    window.location.replace(url);
}

function checkFbHashLogin() {

    if (window.location.hash.length > 3) {
        var hash = window.location.hash.substring(1);
        if(hash.split('=')[0] == 'access_token')
        {
            var path = "https://graph.facebook.com/me?";
            var queryParams = [hash, 'callback=displayUser'];
            var query = queryParams.join('&');
            var url = path + query;

            //use jsonp to call the graph
            var script = document.createElement('script');
            script.src = url;
            document.body.appendChild(script);
        }
       
    }
}

function displayUser(user) {
    setTimeout(function () { }, 1000);
    if (user.id != null && user.id != "undefined") {
        //Do Stuff
        //You have access to user id, name, username, gender etc.
        //For more info visit https://developers.facebook.com/docs/reference/login/public-profile-and-friend-list/
    }
    else {
        alert('user error');
    }
}



$(function () {

    checkFbHashLogin();

    $('#fbLogin').click(function () {
        fbLogin();
    });
})