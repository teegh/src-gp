//---------------------------
// ファイルを非同期で読み取り,ファイルパスなどを含む配列を返す。
//---------------------------
var _FileRead = (function(){

    var fs              = require("fs");
    var path            = require("path");
    var async           = require("async");
    var readExtName     = [];               //読み込みたいファイルの拡張子
    var retFileArr      = [];

    //---------------------------
    // ファイルの再帰的な読み込み
    //---------------------------
    var readFileCnt;
    var waitFileCnt;
    var filePath_temp;
    var fileMTitme;
    var fileName;
    var logmes;
    var callback_Function;
    var readStatusClearTimer;


    //ファイルを開く
    function fileListWalk(fileObj,callback) {

        waitFileCnt--;

        //展開元のディレクトリが空だった場合、何も処理せずタスクを終える。
        if(fileObj.file == "noneFile"){
            //待機しているQueが0だった場合、トランザクションや監視リストのKVS保存などを実行。
            if(waitFileCnt == 0){
                // _DirUpdateWatch.setKVS_DirList();
                // _WebSQL_ctr.transaction_start(callback);
            //コールバックを呼び出して処理を終える。
            }else{
                callback();
            }
            return;
        }

         //ディレクトリの処理。ディレクトリ以下のファイルを展開して再帰処理
        if (fs.statSync(fileObj.dir + "/" + fileObj.file).isDirectory()) {
            dirW(fileObj.dir + "/" + fileObj.file, callback_Function, callback);
        //ファイルの処理
        } else {

            //ファイルの読み取り。ファイル名とパスをトランザクション・バッファに追加。
            readFileCnt++;

            //ファイルの読み込み。拡張子により、読み込みを許可するか否か決める
            if(isReadPermission(fileObj.file)){
                filePath_temp = path.join(fileObj.dir, fileObj.file);
                fileMTitme = fs.statSync(filePath_temp).mtime.getTime();
                filename = path.basename(filePath_temp);
                retFileArr.push({"fileName":filename, "filePath":filePath_temp, "fileMTitme":fileMTitme});
            }

            callback();
        }
    }

    //入力されるデータ
    // ・ファイルドロップ 配列 fileオブジェクトの配列files (isDirectory() == true)
    // このクロージャーの設計：fileオブジェクト


    //ディレクトリのを開く。それ以下にあるファイルを取得。
    function dirW(dir,inCallback_Func, inQueCallBack){
        callback_Function   = inCallback_Func;
        var queCallBack     = inQueCallBack;

        for(var j = 0; j < dir.length; j++){

            //ディレクトリだった場合
            if(fs.statSync(dir[j].path).isDirectory()){

                alert("filepath -> " + dir[j].path);

                fs.readdir(dir[j].path, function(err, files) {
                    for (var i = 0; i < files.length; i++) {
                        waitFileCnt++;
                        //コールバックではjを取得できない。jはforループ後の値となる。forでfilelistを処理するのをやめた方がいい？
                        // alert("debug:dir: " + dir.length  + ")" + j + " - " + dir[j]);
                        q.push({"dir":dir[j].path, "file":files[i]}, function(err) {});
                    }
                    //ディレクトリ以下が空だった場合、処理しないがqにタスクだけ入れる(q.drainでイベントを受けとるために必要)
                    if(files.length==0){
                        waitFileCnt++;
                        q.push({"dir":dir[j].path, "file":"noneFile"}, function(err) {});
                    }
                    queCallBack();
                });


            //ファイルだった場合
            }else{

                q.push({
                    dir:dir[j].path.replace(path.basename(dir[j].path),""),
                    file: path.basename(dir[j].path)},
                    function(err) {});
                }
        }
    }


    //---------------------------
    // ASYNC 非同期キュー　逐次処理
    //---------------------------
    var q;
    function initQueue(){
        q = null;
        q = async.queue(function(fileObj, callback) {
            fileListWalk(fileObj, callback);
        }, 1);

        //処理が完了したとき
        q.drain = function() {
            qDrain();
        }
    }

    function qDrain(){
        //　すべて処理が完了した時
        // if(_WebSQL_ctr.getTransactionCnt() == readFileCnt){
            _FileRead.readComplete();
            _FileRead.initVar();
        // }
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
            if("."+readExtName[i] == getExtName(inFile)){
                flg = true;
                break;
            }
        }
        return flg;
    }
    //拡張子を取得
    function getExtName(inFile){
        return path.extname(inFile);
    }



    return {
        //変数の初期化とメモリ開放
        initVar:  function (){

            readFileCnt         = 0;
            waitFileCnt         = 0;
            filePath_temp       = null;
            filePath_temp       = "";
            logmes              = null;
            logmes              = "";
            retFileArr          = [];

            initQueue();
        },

        //ファイルの読み込み実行
        //readExtNameの例 (すべての拡張子を読み込む：readExtName="" , JPEGのみ:readExtName="jpg,JPG" )
        dirWalk: function (dir, readExtName ,inCallback_Func, inQueCallBack) {
            saveReadExtName(readExtName);
            dirW(dir, inCallback_Func, inQueCallBack);
        },

        //読み込み完了時に呼び出す処理(q.drainから実行)
        readComplete: function(){
            callback_Function(retFileArr);
        },

        getFileExtName: function(inFile){
            return getExtName(inFile);
        }

     };

})();