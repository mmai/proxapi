
//A public API mock
var limit = 5;
var callCount = 0;

function resetCount(){
  callCount = 0;
  setTimeout(resetCount, 3000);
}
resetCount();

module.exports = {
  get: function (name, page, callback){
    var error = null;
    var nameInfos, nextpage;
    var response = {
      code:"200 OK"
    };

    var infos = {
      'john': ["a", "b", "c", "d"],
      'toto': ["x", "y", "z"]
    };

    var data = "";
    if (callCount++ > limit){
      error = "Limit reached";
      response.code = "500";
    } else {
      nameInfos = infos[name];
      if (!nameInfos){
        error = name + " not found";
      } else {
        nextpage = page + 1;
        if (nextpage > nameInfos.length - 1) nextpage = -1;
        data = {
          nextpage: nextpage,
          info: nameInfos[page]
        };
      }
    }
    callback(error, data, response);
  }
} ;
