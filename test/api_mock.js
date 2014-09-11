
//A public API mock
var limit = 5;
var call_count = 0;

function resetCount(){
  call_count = 0;
  setTimeout(resetCount, 3000);
}
resetCount();

module.exports = {
  get: function (name, page, callback){
    var error = null;
    var name_infos, nextpage;
    var response = {
      code:"200 OK"
    };

    var infos = {
      'john': ["a", "b", "c", "d"],
      'toto': ["x", "y", "z"]
    };

    var data = "";
    if (call_count++ > limit){
      error = "Limit reached";
      response.code = "500";
    } else {
      name_infos = infos[name];
      if (!name_infos){
        error = name + " not found";
      } else {
        nextpage = page + 1;
        if (nextpage > name_infos.length - 1) nextpage = -1;
        data = {
          nextpage: nextpage,
          info: name_infos[page]
        };
      }
    }
    callback(error, data, response);
  }
} ;
