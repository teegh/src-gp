//---------------------------
// ファイルを非同期で読み取り,ファイルパスを含む配列で返す。
//---------------------------
// 使い方
// var callback_onFileReadFn = function (inFileArr){
//     alert("read file length: " + inFileArr.length);
//     //alert("read file path [0]: " + inFileArr[0]);
// };
// _FileRead.read(files,
//     "mp3,MP3",
//     callback_onFileReadFn
// );

var _FileRead = (function(){

    var fs              = require("fs");
    var path            = require("path");
    var async           = require("async");
    var readExtName     = [];               //読み込みたいファイルの拡張子
    var retFileArr      = [];

    //---------------------------
    // ファイルの再帰的な読み込み
    //---------------------------
    var callback_Function;
    var q;

    //ファイルがディレクトリであるか？
    //yes : ディレクトリの中身をqueタスクに追加
    //no : 読み込み処理関数を呼ぶ。
    //callbackはasync(que)のタスクが実行完了した事を伝えるコールバック
    function checkFileIsDirectory(fileObj,callback) {

        if(fileObj.file == "noneFile"){
            // alert("noneFileです");
            callback();
            return;
        }

        if (fs.statSync(fileObj.file).isDirectory()) {

            //ディレクトリの中身を展開し asyncのタスクに追加する。
            fs.readdir(fileObj.file, function(err, files) {
                for (var i = 0; i < files.length; i++) {
                    q.push({"file":path.join(fileObj.file,files[i]) }, function(){} );
                }
                //ディレクトリ以下が空だった場合、処理しないがqにタスクだけ入れる(q.drainでイベントを受けとるために必要)
                if(files.length==0){
                    q.push({"file":"noneFile"}, function(){} );
                }

                callback();     //asyncにqueの実行完了を伝える
            });


        }else{
            readFile(fileObj.file, callback);
        }
    }

    //ファイルの読み込み処理
    function readFile(inFilePath, inCallback){
        // alert(inFilePath);
        if( isReadPermission(inFilePath) )retFileArr.push(inFilePath);
        inCallback();     //asyncにqueの実行完了を伝える
    }


    //---------------------------
    // ASYNC 非同期キュー　逐次処理
    //---------------------------
    function initQueue(){
        q = null;
        q = async.queue(function(fileObj, callback) {
            checkFileIsDirectory(fileObj,callback);
        }, 1);

        //処理が完了したとき
        q.drain = function() {
            qDrain();
        }
    }

    function qDrain(){
        //　すべてqueタスクが完了した時
        // alert("queの終了。初期化とコールバック実行。");
        _FileRead.readComplete();
        _FileRead.initVar();
    }


    //---------------------------------------------------
    // 拡張子の処理
    //---------------------------------------------------
    //読み込みたい拡張子の情報をカンマ区切りから配列に変換する。
    function saveReadExtName(inExtNameString){
        if(inExtNameString == "" || inExtNameString == null){
            readExtName = [];
        }else{
            readExtName = inExtNameString.split(",");
        }
    }
    //ファイルを読み込むかどうかの判定
    function isReadPermission(inFile){
        if(readExtName.length == 0)return true;
        var flg = false;
        for(var i=0; i<readExtName.length; i++){
            if("."+readExtName[i].replace(".","") == getExtName(inFile)){
                flg = true;
                break;
            }
        }
        if(!flg)console.log(inFile);
        return flg;
    }
    //拡張子を取得
    function getExtName(inFile){
        return path.extname( path.normalize(inFile) );
    }
    //初期化
    function initVar_call(){
        readExtName         = [];               //読み込みたいファイルの拡張子
        retFileArr          = [];
        callback_Function   = null;
        q                   = null;

        //queの初期化
        initQueue();
    }



    return {
        //変数の初期化とメモリ開放
        initVar:  function (){
            initVar_call();
        },

        //ファイルの読み込み実行
        //
        //readExtNameの例 (すべての拡張子を読み込む：readExtName="" , JPEGのみ:readExtName="jpg,JPG" )
        read: function (inFileList, readExtName ,inCallback_Func) {
            initVar_call(); //初期化
            callback_Function = inCallback_Func;
            saveReadExtName(readExtName);

            //ファイルリストを展開して、queタスクに追加する。
            for(var i=0; i<inFileList.length; i++){
                q.push({"file":inFileList[i].path}, function() {});
            }
        },

        //読み込み完了時に呼び出す処理(q.drainから実行)
        readComplete: function(){
            callback_Function(retFileArr);
        },

        //ファイルの拡張子を得る
        getFileExtName: function(inFile){
            return getExtName(inFile);
        }

     };

})();