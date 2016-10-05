var clientId = <Your Client ID>;
var apiKey = <Your API Key>;
var scopes = 'https://www.googleapis.com/auth/plus.me';
var google = false;


// Use a button to handle authentication the first time.
function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    checkAuth();
    //var x = setTimeout(checkAuth, 1000);
}

function checkAuth() {
    gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: true }, handleAuthResult);
}


function handleAuthResult(authResult) {

    if (authResult && !authResult.error) {
        makeApiCall();
    } 
}

function handleAuthClick(event) {
    //startWait();
    gapi.auth.authorize({ client_id: clientId, scope: scopes, immediate: false }, handleAuthResult);

    return false;
}

// Load the API and make an API call.  Display the results on the screen.
function makeApiCall() {
    gapi.client.load('plus', 'v1', function () {
        var request = gapi.client.plus.people.get({
            'userId': 'me'
        });

        request.execute(function (resp) {
            //Do Stuff
            //You have access to user id, name, display name, gender, emails, etc.
            //For more info visit https://developers.google.com/+/api/latest/people#resource
        });
    });
}

$(function () {
    var authorizeButton = document.getElementById('googlelogin');
    authorizeButton.onclick = handleAuthClick;
})