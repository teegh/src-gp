//---------------------------
// ファイルの再帰的読み込み,データベースに入力
//---------------------------
//依存：
//npm install fs
//npm install path
//npm install async
//_MainUIController _controller.js(main)
//_WebSQL-Ctr.js
//_LogDom.js
//_ProcessTimeINST.js
//_DirUpdateWatch.js
//_SettingOption.js
var _FileRead = (function(){

    var fs          = require("fs");    //
    var path        = require("path");  //
    var async       = require("async"); //
    var readExtName = [];               //読み込みたいファイルの拡張子

    //---------------------------
    // ファイルの再帰的な読み込み
    //---------------------------
    var readFileCnt;
    var waitFileCnt;
    var filePath_temp;
    var fileMTitme;
    var logmes;
    var callback_Function;
    var readStatusClearTimer;

    function fileListWalk(fileObj,callback) {

        waitFileCnt--;

        //展開元のディレクトリが空だった場合、何も処理せずタスクを終える。
        if(fileObj.file == "noneFile"){
            //待機しているQueが0だった場合、トランザクションや監視リストのKVS保存などを実行。
            if(waitFileCnt == 0){
                _DirUpdateWatch.setKVS_DirList();
                _WebSQL_ctr.transaction_start(callback);
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
                filePath_temp = path.join(fileObj.dir,fileObj.file);
                fileMTitme = fs.statSync(filePath_temp).mtime.getTime();
                _WebSQL_ctr.pushTransactionBuff([path.basename(filePath_temp), filePath_temp, fileMTitme]);
                // path.extname(fileObj.file);
            }else{
                _WebSQL_ctr.countUpTransactionCnt();
            }

            //読み込みファイルが一定数を超えたらトランザクションを実行。
            if(_WebSQL_ctr.getTransactionBuff().length >= _WebSQL_ctr.getTransactionDoLimit()){
                _WebSQL_ctr.transaction_start(callback);
            }else{
                //一定数は超えていないが、すべてのファイルを展開した時にトランザクションを実行
                if(waitFileCnt == 0){;
                    _DirUpdateWatch.setKVS_DirList();
                    _WebSQL_ctr.transaction_start(callback);
                //コールバックを呼び出して処理を終える。
                }else{
                    callback();
                }
            }
        }
    }

    function dirW(dir,inCallback_Func, inQueCallBack){
        callback_Function = inCallback_Func;
        var queCallBack = inQueCallBack;
        _DirUpdateWatch.push_DirListBuff(dir);
        fs.readdir(dir, function(err, files) {
            for (var i = 0; i < files.length; i++) {
                waitFileCnt++;
                q.push({dir:dir,file:files[i]}, function(err) {});
            }
            //ディレクトリ以下が空だった場合、処理しないがqにタスクだけ入れる(q.drainでイベントを受けとるために必要)
            if(files.length==0){
                waitFileCnt++;
                q.push({dir:dir,file:"noneFile"}, function(err) {});
            }
            queCallBack();
        });
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

        q.drain = function() {
            qDrain();
        }
    }

    function qDrain(){
        if(_WebSQL_ctr.getTransactionCnt() == readFileCnt){
            _FileRead.readComplete();
            _FileRead.initVar();
        }
    }

    //読み込みたい拡張子の情報をカンマ区切りから配列に変換する。
    function saveReadExtName(inExtNameString){
        if(inExtNameString == "" || inExtNameString == null){
            readExtName = [];
        }else{
            readExtName = inExtNameString.split(",");
        }
    }

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

    function getExtName(inFile){
        return path.extname(inFile);
    }


    return {
        //変数の初期化とメモリ開放
        initVar:  function (){

            _WebSQL_ctr.setTransactionBuff([]);
            _WebSQL_ctr.setTransactionCnt(0);
            _WebSQL_ctr.setTransactionDoLimit(100);

            readFileCnt         = 0;
            waitFileCnt         = 0;
            filePath_temp       = null;
            filePath_temp       = "";
            logmes              = null;
            logmes              = "";

            initQueue();
        },

        //ファイルの読み込み実行
        //readExtNameの例 (すべての拡張子を読み込む：readExtName="" , JPEGのみ:readExtName="jpg,JPG" )
        dirWalk: function (dir, readExtName ,inCallback_Func, inQueCallBack) {
            saveReadExtName(readExtName);
            _LogDom.displayed_fileloadStatus(); //読み込み状況を表示
            _MainUIController.disabledBtn();  //ボタンを無効に
            _ProcessTimeINST.startTimerINSTL();
            _DirUpdateWatch.stopWatch();    //読み込み中は監視を停止
            dirW(dir,inCallback_Func, inQueCallBack);
        },

        //読み込み完了時に呼び出す処理(q.drainから実行)
        readComplete: function(){

            //更新日時順で最新のファイルリストを取得してangularモデルで保持しておく。
            var successFunc = function(result) {
                var mes = "";
                var path_tmp = "";
                var fileName_tmp = "";
                var ctime_tmp = "";
                var listArr = [];

                for (var i = 0; i < result.rows.length; i++) {

                    fileName_tmp = _RepStrUtil.deRep_webSQLjs(result.rows.item(i).fileName);
                    path_tmp = _RepStrUtil.deRep_webSQLjs(result.rows.item(i).filePath);
                    ctime_tmp = new Date(result.rows.item(i).mtime);

                    listArr.push({
                        "fileName" : fileName_tmp,
                        "filePath" : path_tmp,
                        "mtime" : ctime_tmp
                    });
                }

                _SettingOption.setNewFileList(listArr);
            };
            _WebSQL_ctr.selectNewMtime(successFunc);


            //読み込みステータス
            var processTimeArr = _ProcessTimeINST.getTimerINSTL();
            _LogDom.fileloadStatus('読み込みが完了しました (<span class="strong">' + _WebSQL_ctr.getTransactionCnt()+"</span>件 - 読込時間："+processTimeArr[1]+")");
            _LogDom.removeFileloadStatus();
            var nowDate = new Date();
            _SettingOption.setUpdateTime(nowDate);
            callback_Function();

            //ボタン制御　ボタンを有効に
            _MainUIController.abledBtn();

        },

        getFileExtName: function(inFile){
            return getExtName(inFile);
        }

     };

})();