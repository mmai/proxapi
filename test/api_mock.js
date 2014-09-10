
//A public API mock
var limit = 5;
var call_count = 0;

function resetCount(){
  call_count = 0;
  setTimeout(resetCount, 2000);
}
resetCount();

module.exports = {
  get: function (nom, prenom, callback){
    var error = null;
    var response = {
      code:"200 OK"
    };
    var data = "";
    if (call_count++ > limit){
      error = "Limit reached";
      response.code = "500";
    } else {
      // console.log(call_count);
      data = 'hello ' + nom +" "+prenom;
    }
    callback(error, data, response);
  }
} ;
