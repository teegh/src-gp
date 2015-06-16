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




  var _apiOptions_gtThmb;
  var temp_photos = [];


  //一部を取得
  //指定した日時以降のデータのうち、指定したページの指定した数のリストを取得
  function getThumbCall(inMinDate, inCallFunc, inPer_page, inPage){

    Flickr.authenticate(flickrOptions, function(error, flickr) {
      //[get photo]
      //unix timstamp -> http://url-c.com/tc/
      var _apiOptions_gtThmb = {
        min_date:inMinDate,
        per_page :inPer_page, //max500
        page:inPage
      };
      flickr.photos.recentlyUpdated(_apiOptions_gtThmb, function(err, result) {
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


  //すべてを取得
  //--------------------------------------------------------------------
  //指定した日時以降のデータのうち、すべてを取得
  function getThumbAllCall(inCallFunc){

    Flickr.authenticate(flickrOptions, function(error, flickr) {

        if(error != null){
          inCallFunc("");
        }else{
          flickr.photos.recentlyUpdated(_apiOptions_gtThmb, function(err, result) {

            if(err) {
              // return console.error(error);
              inCallFunc("");
            }else{
              // console.log("[getFl] photos.total:"+result.photos.total + " page:"+result.photos.page +"/"+result.photos.pages);
              if(result && result.photos.total){

                //一時的な配列に保持
                 for(var i=0; i<result.photos.photo.length; i++){
                    temp_photos.push(result.photos.photo[i]);
                  }

                //すべての処理が完了したら、コールバックを実行し処理を終了。
                if(result.photos.page == result.photos.pages){
                  inCallFunc(temp_photos);

                //残りのページがあれば続きの処理を行う
                }else{
                  apiOption_pageCountUp();
                  getFlThumbCall_reCall(inCallFunc);
                }
              }else{
                inCallFunc("");
              }

            }
          });
        }

    });

  }

  //再び実行
  function getFlThumbCall_reCall(inCallFunc){
    getThumbAllCall(inCallFunc);
  }


  //getThumbAllCall の apiに通信する際の初期化
  function initVar_gtthmb(inMinDate, inPer_page, inPage){
    temp_photos = null;
    temp_photos = [];
    _apiOptions_gtThmb = {
      min_date: inMinDate,
      per_page :inPer_page,
      page: inPage
    };
  }

  //getThumbAllCallの　次のページを取得
  function apiOption_pageCountUp(){
    var temp_min_date = _apiOptions_gtThmb.min_date;
    var temp_per_page = _apiOptions_gtThmb.per_page;
    var temp_page     = _apiOptions_gtThmb.page;

    _apiOptions_gtThmb = {
      min_date: temp_min_date,
      per_page : temp_per_page,
      page: temp_page + 1
    };
  }
  //--------------------------------------------------------------------




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
    //指定した日時以降のデータのうち、指定したページの指定した数のリストを取得
    //unix timstamp -> http://url-c.com/tc/
    getThumb: function (inMinDate, inCallFunc, inPer_page, inPage){
      getThumbCall(inMinDate, inCallFunc, inPer_page, inPage);
    },
    //指定した日時以降のデータのうち、すべてを取得
    //unix timstamp -> http://url-c.com/tc/
    getThumbAll: function (inMinDate, inCallFunc, inPer_page, inPage){
      initVar_gtthmb(inMinDate, inPer_page, inPage);
      getThumbAllCall(inCallFunc);
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

