//ID3のタグネームをわかり易い名前にパースする

//入力例
// [
//    {"NAME":"TPE1","SIZE":7,"content":"星野源"},
//    {"NAME":"TALB","SIZE":4,"content":"SUN"},
//    {"NAME":"TIT2","SIZE":10,"content":"MOON Sick"},
//    {"NAME":"TRCK","SIZE":2,"content":"1"},
//    {"NAME":"TYER","SIZE":11,"content":"2015/05/27"},
//    {"NAME":"TCON","SIZE":8,"content":"J-POP男"}
//
// ]
// 出力例
// {
//  artist: "星野源",
//  album: "SUN",
//  title: "MOON Sick",
//  track: "1",
//  year: "2015/05/27",
//  genre: "J-POP男"
// }
var _ID3TagParser = (function(){  //jquery closure
// var _ID3Reader = new function(){  //node app

  function parseID3Tag_cmd(inTagArr){
    var retObj = {};

    retObj.artist = "";
    retObj.album = "";
    retObj.title = "";
    retObj.track = "";
    retObj.year = "";
    retObj.genre = "";
    retObj.comment = "";
    retObj.lyric = "";
    retObj.jacket = "";

    for(var i=0; i<inTagArr.length; i++){
      if(inTagArr[i].NAME == "TPE1" || inTagArr[i].NAME == "artist"){
        retObj.artist = inTagArr[i].content;
      }else if(inTagArr[i].NAME == "TALB" || inTagArr[i].NAME == "album"){
        retObj.album = inTagArr[i].content;
      }else if(inTagArr[i].NAME == "TIT2" || inTagArr[i].NAME == "title"){
        retObj.title = inTagArr[i].content;
      }else if(inTagArr[i].NAME == "TRCK" || inTagArr[i].NAME == "track"){
        retObj.track = inTagArr[i].content;
      }else if(inTagArr[i].NAME == "TYER" || inTagArr[i].NAME == "year"){
        retObj.year = inTagArr[i].content;
      }else if(inTagArr[i].NAME == "TCON" || inTagArr[i].NAME == "genre"){
        retObj.genre = inTagArr[i].content;
      }else if(inTagArr[i].NAME == "COMM" || inTagArr[i].NAME == "comment"){
        retObj.genre = inTagArr[i].content;
      }else if(inTagArr[i].NAME == "USLT" || inTagArr[i].NAME == "lyric"){
        retObj.genre = inTagArr[i].content;
      }
    }

    return retObj;
  }

  return {
    parseID3Tag : function (inTagArr){
      return parseID3Tag_cmd(inTagArr);
    }
  };


})();    //jQuery Closure
// };          //node.js
