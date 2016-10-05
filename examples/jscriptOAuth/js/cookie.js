function setCookie(szName, szValue, szExpires, szPath, szDomain, bSecure) {

    var szCookieText = escape(szName) + '=' + escape(szValue);

    szCookieText += (szExpires ? '; EXPIRES=' + szExpires.toGMTString() : '');

    szCookieText += (szPath ? '; PATH=' + szPath : '/');

    szCookieText += (szDomain ? '; DOMAIN=' + szDomain : '');

    szCookieText += (bSecure ? '; SECURE' : '');

    document.cookie = szCookieText;
}

function getCookie(szName) {

    var szValue = null;

    if (document.cookie)	   //only if exists
    {
        var arr = document.cookie.split((escape(szName) + '='));

        if (2 <= arr.length) {
            var arr2 = arr[1].split(';');

            szValue = unescape(arr2[0]);
        }
    }
    return szValue;
}

function deleteCookie(szName) {

    var tmp = getCookie(szName);

    if (tmp) {
        //alert(tmp);
        setCookie(szName, tmp, (new Date(1)));
    }

}
