//---------------------------
// Flickrの操作
//---------------------------
//依存：
//flickrapi
var _FL = (function(){

  //node-webkitで起こる標準出力のエラーを吸収してくれる
  var Readable = require("stream").Readable;
  var util = require("util");

  util.inherits(MyStream, Readable);
  function MyStream(opt) {
    Readable.call(this, opt);
  }
  MyStream.prototype._read = function() {};
  // hook in our stream
  process.__defineGetter__("stdin", function() {
    if (process.__stdin) return process.__stdin;
    process.__stdin = new MyStream();
    return process.__stdin;
  });

  // process.stdin.resume();
  // process.stdin.setEncoding('utf8');
  // // 標準入力がくると発生するイベント
  // process.stdin.on('data', function (chunk) {
  //     chunk.trim().split('\n').forEach(function(line) {
  //         // 1行ずつ表示
  //         console.log('>' + line);
  //     });
  // });
  // // EOFがくると発生するイベント
  // process.stdin.on('end', function () {
  // });


  var Flickr = require("flickrapi");
  var flickrOptions;



  //flickrから指定時刻以降のデータを取得
  function getThumbCall(inMinDate, inCallFunc, inPer_page, inPage){

    Flickr.authenticate(flickrOptions, function(error, flickr) {
      //[get photo]
      //unix timstamp -> http://url-c.com/tc/
      var apiOptions = {
        min_date:inMinDate,
        per_page :inPer_page, //max500
        page:inPage
      };
      flickr.photos.recentlyUpdated(apiOptions, function(err, result) {
        if(err) {
          // return console.error(error);
          inCallFunc("");
        }else{

          if(result && result.photos.total){
            inCallFunc(result.photos.photo);
          }else{
            inCallFunc("");
          }
        }
      });
    });
  }



  //タイトルを変更
  function editTitleCall(inPhotoId, inTitle, inCallFunc){

    Flickr.authenticate(flickrOptions, function(error, flickr) {

      //[get photo]
      //unix timstamp -> http://url-c.com/tc/
      var apiOptions = {
        photo_id:inPhotoId,
        title : inTitle
      };
      flickr.photos.setMeta(apiOptions, function(err, result) {
        if(err) {
          // return console.error(error);
          inCallFunc(false);
        }else{
          inCallFunc(true);
        }
      });

    //   // console.log(flickr);
    });
  }


  function deleteCall(inPhotoId, inCallFunc){
    Flickr.authenticate(flickrOptions, function(error, flickr) {
        //[upload]
        var apiOptions = {
          photo_id:inPhotoId
        };

        flickr.photos.delete(apiOptions, function(err) {
          if(err) {
            // return console.error(error);
            inCallFunc(false);
          }else{
            inCallFunc(true);
          }
        });
    });
  }

  //アップロード
  function uploadCall(inPhotoOptionObj, inCallFunc){
    Flickr.authenticate(flickrOptions, function(error, flickr) {

        //angular の値を配列に変換
        var uploadArr = [];
        for(var i=0; i<inPhotoOptionObj.length; i++){
          uploadArr.push({
            "title" : inPhotoOptionObj[i].title,
            "tags" : inPhotoOptionObj[i].tags,
            "photo" : inPhotoOptionObj[i].photo
          });
        }

        //[upload]
        var apiOptions = {
          "photos": uploadArr
        };

        // var debugStr = "";
        // for(var i=0; i<inPhotoOptionObj.length; i++){
        //   debugStr += " / " + inPhotoOptionObj[i].photo;
        // }
          //(例)photos:
          // [
          //   {
          //     title: "test",
          //     tags: "happy",
          //     photo: __dirname + "/test.jpg"
          //   },
          //   {
          //     title: "test2",
          //     tags: "secondary",
          //     photo: __dirname + "/test.jpg"
          //   }
          // ]

        Flickr.upload(apiOptions, flickrOptions, function(err, result) {
          if(err) {
            // return console.error(error);
            inCallFunc(false);
          }else{
            inCallFunc(true);
          }
        });
    });
  }


  return {
    init: function (inFlickrOptions){
      flickrOptions = inFlickrOptions;
      //example
      // {
      //   api_key: "****",
      //   secret: "****",
      //   permissions: "delete",
      //   user_id: "****@N05",
      //   access_token: '***-****',
      //   access_token_secret: '*****'
      // };
    },
    getThumb: function (inMinDate, inCallFunc, inPer_page, inPage){
      getThumbCall(inMinDate, inCallFunc, inPer_page, inPage);
    },
    editTitle: function (inPhotoId, inTitle, inCallFunc){
      editTitleCall(inPhotoId, inTitle, inCallFunc);
    },
    deletePhoto: function (inPhotoId, inCallFunc){
      deleteCall(inPhotoId, inCallFunc);
    },
    upload : function (inPhotoOptionObj, inCallFunc){
      uploadCall(inPhotoOptionObj, inCallFunc);
    }
  };


})();

