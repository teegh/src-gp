//---------------------------
// ディレクトリの更新日時を監視
//---------------------------
//依存：
//npm install fs
//npm install path
// _KVS.js
// _WebSQL_ctr.js
// _FileRead.js
// _SettingOption.js
var _DirUpdateWatch = (function(){

    var fs = require("fs");
    var path = require("path");

    var dirList;                //監視リスト (モジュール内部保持) KVSにも保持しておき永続化。再起動直後に利用する。
    var reloadTimer = null;     //監視タイマ
    var scanWaitTimer   = null; //監視リストを走査する際の、微小時間待機タイマー(CPU圧迫を防ぐ目的)
    var scanWaitTime = 500;     //上記の待機時間
    var scanCnt      = 50;      //一度にスキャンする回数
    var scanPositon  = 0;       //現在のスキャン位置

    // var reloadSec = 5;          //監視間隔(秒) -> _SettingOption.jsから取得
    var reloadCnt = 0;          //監視実行回数
    var updateList = [];        //変更タスクを格納する配列。一回の監視において、変更が確認された際、実行するタスクをここに追加する。
    var dirList_tmp = [];       //変更がみられない監視リストを一時的にためる配列


    //_SettingOptionで管理している監視時間間隔(分)を取得
    function getReloadTime(){
        return _SettingOption.getWatchTime() - 0;   //数値に変換
    }


    //--------------------------------
    // 一定時間ごとにディレクトリの更新日時の変化を監視
    //--------------------------------
    //タイマー
    function rw_startTimer(){
        rw_stopTimer();
        scanPositon = 0;
        var reloadSec = getReloadTime();
        if(reloadSec == 0)return;
        reloadTimer = setInterval(function(){ rw_timerComp(); }, reloadSec*1000*60);
    }
    function rw_stopTimer(){
        if(!reloadTimer)return;
        clearInterval(reloadTimer);
        reloadTimer = null;
    }
    function rw_timerComp(){
        // _LogDom.debugMes("スキャンします。"+ (new Date()) );
        watchCmd();
    }


    //--------------------------------
    // CPU圧迫を防ぐ目的で、監視リストを走査する際に微小時間待機するタイマー
    //--------------------------------
    //タイマー
    function sw_startTimer(){
        sw_stopTimer();
        scanWaitTimer = setInterval(function(){ sw_timerComp(); }, scanWaitTime);
    }
    function sw_stopTimer(){
        clearInterval(scanWaitTimer);
        scanWaitTimer = null;
    }
    function sw_timerComp(){
        watchCmd();
    }


    // // ------------------------------
    // // 一気にスキャン
    // // ------------------------------
    // //ディレクトリの変更日時を確認
    // function watchCmd(){
    //     if(!dirList || dirList.length == 0) return;

    //     var stat;               //ファイルの情報
    //     var isChange;           //更新日時変更の有無
    //     var isSubDir;           //ディレクトリが、一つ前の処理で変更を検出したディレクトリのサブディレクトリであるか否か
    //     var dirList_tmp = [];   //

    //     //監視リストを走査
    //     for(var i=0; i<dirList.length; i++){
    //         isChange = false;
    //         isSubDir = false;
    //         //ディレクトリが、一つ前の処理で変更を検出したディレクトリのサブディレクトリであるか否か調べる。サブディレクトリなら isChange=true
    //         for(var j=0; j<updateList.length; j++){
    //             if(dirList[i].path.indexOf(updateList[j].path) != -1){
    //                 isSubDir = true;
    //                 break;
    //             }
    //         }
    //         //ディレクトリの更新日時が変更されたか調べる。
    //         //変更があれば
    //         //　・ isChange=true
    //         //　・ updateListにタスクを追加
    //         if(!isSubDir){
    //             try {
    //                 stat = fs.statSync(dirList[i].path);
    //                 if(stat.ctime.getTime() != dirList[i].ctime.getTime()){
    //                     updateList.push({path:dirList[i].path ,state:"delete"});
    //                     updateList.push({path:dirList[i].path ,state:"update"});
    //                     isChange = true;
    //                 }
    //             } catch (e) {
    //                 //ファイルが開けない (=ファイルが削除された と みなす)
    //                 updateList.push({path:dirList[i].path ,state:"delete"});
    //                 isChange = true;
    //             }
    //         }
    //         //以下の条件を満たすディレクトリは、一時監視リストdirList_tmpへ格納
    //         // ・ 更新日時に変更が無かった場合
    //         // ・　親ディレクトリがに変更が見られない場合
    //         if(!isChange && !isSubDir)dirList_tmp.push(dirList[i]);
    //     }

    //     //変更がみられた場合、監視リストを更新。KVSの値も更新する。
    //     if(dirList.length != dirList_tmp.length){
    //         dirList = dirList_tmp;
    //         setKVS_DirListDo();
    //     }

    //     //開放・更新処理
    //     dirList_tmp = null;
    //     stat        = null;
    //     fileDeleteAndReload();
    // }





    //------------------------------
    // 一定間隔を置きながらスキャン (CPU負荷低減)
    //------------------------------
    //ディレクトリの変更日時を確認
    function watchCmd(){
        sw_stopTimer();
        if(!dirList || dirList.length == 0) return;

        var stat;               //ファイルの情報
        var isChange;           //更新日時変更の有無
        var isSubDir;           //ディレクトリが、一つ前の処理で変更を検出したディレクトリのサブディレクトリであるか否か


        //監視リストを走査
        for(var i=scanPositon; i<dirList.length && i<scanPositon+scanCnt; i++){
            isChange = false;
            isSubDir = false;

            // _LogDom.debugMes("["+i+"] "+dirList[i].path);

            //ディレクトリが、一つ前の処理で変更を検出したディレクトリのサブディレクトリであるか否か調べる。サブディレクトリなら isChange=true
            for(var j=0; j<updateList.length; j++){
                if(dirList[i].path.indexOf(updateList[j].path) != -1){
                    isSubDir = true;
                    break;
                }
            }
            //ディレクトリの更新日時が変更されたか調べる。
            //変更があれば
            //　・ isChange=true
            //　・ updateListにタスクを追加
            if(!isSubDir){
                try {
                    stat = fs.statSync(dirList[i].path);
                    if(stat.ctime.getTime() != dirList[i].ctime.getTime()){
                        updateList.push({path:dirList[i].path ,state:"delete"});
                        updateList.push({path:dirList[i].path ,state:"update"});
                        isChange = true;
                    }
                } catch (e) {
                    //ファイルが開けない (=ファイルが削除された と みなす)
                    updateList.push({path:dirList[i].path ,state:"delete"});
                    isChange = true;
                }
            }
            //以下の条件を満たすディレクトリは、一時監視リストdirList_tmpへ格納
            // ・ 更新日時に変更が無かった場合
            // ・　親ディレクトリがに変更が見られない場合
            if(!isChange && !isSubDir)dirList_tmp.push(dirList[i]);
        }



        //解放
        stat        = null;

        scanPositon = i;
        if(scanPositon < dirList.length){
            //dirListをまだ処理していない場合、待機後に続きの処理を行う。
            rw_stopTimer(); //監視開始タイマーは一旦停止。
            sw_startTimer();
        }else{
            //dirListをすべて処理した場合、更新有無チェックを行う
            check_needUpdate();
            // _LogDom.debugMes("スキャンの完了"+ (new Date()) );
        }
    }




    //更新の必要があるか確認
    function check_needUpdate(){

        //------------------------------------------------------------
        // var debugm = "";
        // debugm += "updateList["+updateList.length+"] -> <br>";
        // for(var i=0; i<updateList.length; i++){
        //     debugm += updateList[i].state +" : "+ updateList[i].path + "<br>";
        // }
        // debugm += "<br><br>";
        // debugm += "dirList.length = "+dirList.length + "<br>";
        // debugm += "dirList_tmp.length = "+dirList_tmp.length + "<br>";

        // $(".searchResult").html(debugm);
        //------------------------------------------------------------
        //

        //変更がみられた場合、監視リストを更新。KVSの値も更新する。
        if(dirList.length != dirList_tmp.length){
            dirList = dirList_tmp;
            setKVS_DirListDo();
        }

        //開放・更新処理
        dirList_tmp = null;
        dirList_tmp = [];
        fileDeleteAndReload();
    }





    //更新処理
    //ディレクトリの変更があるものは、削除またはディレクトリを再読み込みする。
    function fileDeleteAndReload(){
        if(!updateList || updateList.length == 0){
            rw_startTimer();
            return;
        }
        rw_stopTimer(); //監視を一旦停止

        var chkTask = updateList.shift();   //変更タスクを取得
        switch(chkTask.state){
            case "delete":
                //ディレクトリが存在しない場合はSQLから削除する
                _WebSQL_ctr.addQue({sql:"deleteWhereLike_filePath",whereKey:path.normalize(chkTask.path)},function(){nextTask();});
                break;
            case "update":
                //ディレクトリの更新日時が変更されたものは、そのディレクトリ以降を再読み込み。
                var readExtName = _SettingOption.getReadExtName();
                _FileRead.dirWalk(chkTask.path,readExtName,function(){nextTask();},function(){});
                break;
        }
    }

    //次の更新処理を実行。全て完了したら、監視を続行する。
    function nextTask(){
        // alert("nextTask()");
        if(updateList.length == 0){
            updateList = null;
            updateList = [];
            rw_startTimer();
        }else{
            fileDeleteAndReload();
        }
    }





    //KVSから監視ファイルリストを取得しておく。リストはモジュール内部で保持。
    function getDirList(){
        _KVS.getValue("dirList",function(err,value){
            dirList = null;
            dirList = [];
            if (err) {
                // alert("取得できません");
            } else {
                dirList = value;
            }
        });
    }

    //内部で保持していた監視リストをKVSに書き込み。
    function setKVS_DirListDo(){
        _KVS.setKVS_func("dirList", dirList, function (err, value){
            //デバッグ用
            // var logvar = "";
            // for(var i=0; i<dirList.length; i++){
            //   logvar += dirList[i].path + "<br>";
            // }
            // if(logvar != "")$(".searchResult").html("<p><b>KVS</b>:<br>"+logvar+"</p>");
        });
    }


    //statWatch_initialManualCallから実行するが、getReloadTime()が0なら実行しない。
    function rw_timerComp_manualCall(){
        var reloadSec = getReloadTime();
        if(reloadSec == 0)return;
        rw_timerComp();
    }

    return {
        //初期化。KVSから監視ファイルリストを取得しておく。リストはモジュール内部で保持。
        init_getWatchList : function(){
            getDirList();
        },
        //監視開始
        startWatch: function (){
            var reloadSec = getReloadTime();
            if(reloadSec == 0){
                rw_stopTimer();
                return;
            }
            rw_startTimer();
        },
        //監視開始 (最初だけ起動時間を指定、その後は通常通り_SettingOptionの値に従う)
        statWatch_initialManualCall : function(initialInterval){
            reloadTimer = setInterval(function(){ rw_timerComp_manualCall(); }, initialInterval*1000*60);
        },
        //監視停止
        stopWatch: function (){
            rw_stopTimer();
        },
        //監視リストの削除
        clear_DirList : function(){
            dirList = null;
            dirList = [];
            setKVS_DirListDo();
        },
        //外部から監視リストを追加できるメソッド。
        //入力されたディレクトリパスを開き、更新日時を取得。モジュール内部で保持する監視リストに追加
        //※但し、KVSには保存しないので、保存する時は別途setKVS_DirListを実行すること。
        push_DirListBuff : function(inDirPath){
            var stat;
            try {
                stat = fs.statSync(inDirPath);
                dirList.push({path: inDirPath, ctime:stat.ctime});
            } catch (e) {
                // alert(e);
            }
        },
        //内部で保持していた監視リストをKVSに書き込み。
        setKVS_DirList : function(){
            setKVS_DirListDo();
        }
    };


})();

