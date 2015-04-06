//---------------------------
// Flickrの操作
//---------------------------
//依存：
//flickrapi
var _Flickr = (function(){

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
  function getThumbCall(inMinDate, inCallFunc){

    Flickr.authenticate(flickrOptions, function(error, flickr) {

      //[get photo]
      //unix timstamp -> http://url-c.com/tc/
      var apiOptions = {
        min_date:inMinDate,
        per_page :500,
        page:1
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
        //[upload]
        var apiOptions = {
          "photos": inPhotoOptionObj
        };

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
    getThumb: function (inMinDate, inCallFunc){
      getThumbCall(inMinDate, inCallFunc);
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


//記述例

// Flickr.authenticate(flickrOptions, function(error, flickr) {
//     //   //[upload]
//     //   //   var apiOptions = {
//     //   //   photos: [{
//     //   //     title: "test",
//     //   //     tags: "happy",
//     //   //     photo: __dirname + "/test.jpg"
//     //   //   },{
//     //   //     title: "test2",
//     //   //     tags: "secondary",
//     //   //     photo: __dirname + "/test.jpg"
//     //   //   }]
//     //   // };
//     //   // Flickr.upload(apiOptions, flickrOptions, function(err, result) {
//     //   //   if(err) {
//     //   //     return console.error(error);
//     //   //   }
//     //   //   console.log("photos uploaded", result);
//     //   // });

//       //[get photo]
//       //unix timstamp -> http://url-c.com/tc/
//       var apiOptions = {
//         min_date:"1388502000",
//         per_page :500,
//         page:1
//       };
//       flickr.photos.recentlyUpdated(apiOptions, function(err, result) {
//         if(err) {
//           // return console.error(error);
//         }

//         var insertHTML_str = "";
//         var modalHTML_str = "";
//         if(result && result.photos.total){
//           result.photos.photo.forEach(function(inP){
//             insertHTML_str += '<div class="col-xs-4">';
//             insertHTML_str += '<!--<a href="https://www.flickr.com/photos/'+flickrOptions.user_id+"/"+inP.id+'" title="'+inP.title+'">-->';
//             insertHTML_str += '<img src="https://farm'+inP.farm+'.staticflickr.com/'+inP.server+'/'+inP.id+'_'+inP.secret+'_z.jpg'+'" alt="'+inP.title+'">';
//             insertHTML_str += "<!--</a>-->";

//             //title & edit btn
//             insertHTML_str += '<div><p>'+inP.title+'</p></div>';
//             insertHTML_str += '<div><button class="btn btn-default btn-sm" type="button" data-toggle="modal" data-target="#myModal'+inP.id+'"><i class="fa fa-edit fa-fw"></i>&nbsp;編集</button></div>';

//             //(開発中)情報の編集を行うモーダル (Angulerを使うとよいか？)
//             modalHTML_str += '<div class="modal fade" id="myModal'+inP.id+'" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
//             modalHTML_str += '  <div class="modal-dialog" style="margin-top:100px;">';
//             modalHTML_str += '    <div class="modal-content">';
//             modalHTML_str += '      <div class="modal-header">';
//             modalHTML_str += '        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>';
//             modalHTML_str += '        <h4 class="modal-title" id="myModalLabel">Modal title</h4>';
//             modalHTML_str += '      </div>';
//             modalHTML_str += '      <div class="modal-body">';
//             modalHTML_str += '      </div>';
//             modalHTML_str += '      <div class="modal-footer">';
//             modalHTML_str += '        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>';
//             modalHTML_str += '        <button type="button" class="btn btn-primary">Save changes</button>';
//             modalHTML_str += '      </div>';
//             modalHTML_str += '    </div>';
//             modalHTML_str += '  </div>';
//             modalHTML_str += '</div>';

//             insertHTML_str += '</div>'+"\n";

//           });
//           // console.log(insertHTML_str);
//           $(".testimg").html(insertHTML_str);
//           $(".editModal").html(modalHTML_str);
//         }
//       });

//     //   // console.log(flickr);
//     });