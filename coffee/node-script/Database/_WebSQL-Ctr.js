//---------------------------
// WebSQLの操作
//---------------------------
//依存：
//websql.js (jquery)
//_LogDom.js
//_RepStrUtil.js

//使う際にはDBの初期化が必要
//(例)　WebSQL_ctr.initDB('myAppSQL', '0.1', 'ファイル名管理データベース',"fileList",["fileName","filePath"]);
//select, insertは必要に応じて入力値やカラム名を指定して実行すること
//

var _WebSQL_ctr = (function() {

    var db;
    var db_tableName;
    var extentionInfo = "";

    //----------------------------
    //　トランザクション　(大量の同じ処理)
    //----------------------------
    var transactionCnt      = 0;    //トランザクションでクエリを実行した回数
    var transactionDoLimit  = 0;    //１回のトランザクションで実行するクエリの回数
    var transactionBuff     = [];   //トランザクションで実行する情報の配列


    function successCall(cb){
        // alert("成功しました。");
    }

    function errorCall(cb){
        alert("エラーが発生しました。[WebSQL-Ctr errorCall]");
    }

    function tra_errorCall(cb){
      alert("エラーが発生しました。[WebSQL-Ctr tra_errorCall]");
    }

    //トランザクションで行う処理
    function tranceFunc(tr){
      transactionBuff.forEach(function(fileInfo) {
        tr.executeSql("INSERT INTO fileList VALUES ( ?, ?, ? )", [ _RepStrUtil.Rep_webSQLjs(fileInfo[0]), _RepStrUtil.Rep_webSQLjs(fileInfo[1]), fileInfo[2] ],
          function() { /*print("INSERT DATA SUCCESS");*/ },
          function() { alert("tracsaction INSERT DATA ERROR"); }
        );
        transactionCnt++;
      });
    }



    //----------------------------
    //少数のいろいろな処理
    //非同期で逐次処理。後続の処理は、db sql完了時のコールバックから実行。
    //----------------------------
    var queBuff         = [];
    var isQueBuff_start = false;
    var que_callBack_Func;

    function queBuff_start(){
        if(!isQueBuff_start && queBuff && queBuff.length > 0){
            isQueBuff_start = true;
            var queTask = queBuff.shift();

            switch(queTask.sql){
                case "deleteWhereLike_filePath":
                    que_delete_WhereLike_FilePath(queTask.whereKey);
                    break;
            }
        }
    }

    function que_delete_WhereLike_FilePath(searchKey){
        db.delete(db_tableName,"WHERE filePath like '"+_RepStrUtil.Rep_webSQLjs(searchKey)+"%'",
        que_successCall, errorCall);
    }

    function que_successCall(cb){

        if(isQueBuff_start && queBuff && queBuff.length == 0){
            //queBuffが空になったらフラグをfalseに。またqueBuff開放も行う
            queBuff             = null;
            queBuff             = [];
            isQueBuff_start     = false;
            que_callBack_Func();            //addQueで保持していたコールバック関数を実行。
            return;
        }

        queBuff_start();
    }






    return {

        //データベースの初期設定　
        initDB: function (databaseName,version,caption,tableName){
            db = new WebSQL(databaseName, version, caption, 1048576)
            var createflg = db.createTable(tableName,["fileName","filePath","mtime"],true);

            db_tableName = tableName;

          // db = new WebSQL('myAppSQL', '0.1', 'ファイル名管理データベース', 1048576)
          // createflg = db.createTable("fileList",[
          //   "fileName",
          //   "filePath"
          // ],true);
        },

        //データベースの削除と初期化
        deleteDB: function(){
            db.dropTable(db_tableName);
            var createflg = db.createTable(db_tableName,["fileName","filePath","mtime"],true);
        },

        //トランザクションを実行
        transaction_start: function (callback){
            var myFunc = callback;
            if(transactionBuff.length == 0){
                myFunc();
                return;
            }

            db.transaction(tranceFunc, tra_errorCall ,function (){
                _LogDom.fileloadStatus('ファイルを読み込み中です...(<span class="strong">' + transactionCnt+"</span>件)");
                transactionBuff = null;
                transactionBuff = [];
                myFunc();
            });
        },

        //データベースを検索
        selectWhereLike: function(searchKey,limitNum,successCallFunc){
            if(searchKey == null || searchKey == undefined || searchKey == "")successCallFunc();

            var keyVar = "";
            for(var i=0; i<searchKey.length; i++){
                if(keyVar != "")keyVar += " AND ";
                keyVar += "fileName like '%"+searchKey[i]+"%'";
            }
            if(searchKey.length > 1)keyVar = "(" + keyVar + ")";
            db.select(db_tableName,
                "WHERE " + keyVar + " ORDER BY fileName LIMIT 0,"+limitNum ,successCallFunc
            );
        },

        //ファイルの更新日が新しいものから順に200件取得。
        selectNewMtime: function(successCallFunc){
            db.select(db_tableName,
                "ORDER BY mtime DESC LIMIT 0,200",successCallFunc
            );
        },

        //非同期の逐次処理　(トランザクションを使うまでもない少数のsql操作)
        //sqlTask 例：
        //{sql:"insert", par:[Par1,Par2,...]}
        //{sql:"deleteWhere", whereKey:"search key"}
        addQue: function(sqlTask,inCallBackFunc){
            que_callBack_Func = inCallBackFunc;         //コールバック関数を保持
            queBuff.push(sqlTask);
            queBuff_start();
        },



        //------------------
        //setter getter
        //------------------
        setTransactionBuff: function(par){
            transactionBuff = null;
            transactionBuff = par;
        },

        getTransactionBuff: function(){
            return transactionBuff;
        },

        pushTransactionBuff: function(obj){
            transactionBuff.push(obj);
        },

        setTransactionDoLimit: function(par){
            transactionDoLimit = null;
            transactionDoLimit = par;
        },

        getTransactionDoLimit: function(){
            return transactionDoLimit;
        },

        setTransactionCnt: function(par){
            transactionCnt = null;
            transactionCnt = par;
        },

        getTransactionCnt: function(par){
            return transactionCnt;
        },

        countUpTransactionCnt: function(){
            transactionCnt++;
        }
    };

})();







//------------
//記述例
//------------
// var db = new WebSQL('sample', '0.1', 'サンプルデータベース', 1048576);

// function successCall(cb){
//     alert("成功しました。");
// }

// function errorCall(cb){
//     alert("失敗しました。");
// }

// 削除
// db.dropTable("test");

// テーブル作成
// var createflg = db.createTable("test",[
//     "name",
//     "age",
//     "option"
// ],true);

// 削除
// db.delete("test","WHERE name='太郎'");

//　追加
// db.insert("test",{
//     name: "太郎",
//     age: 27,
//     option: "特になし"
// },successCall,errorCall);

//　更新
// db.update("test",{
//     age: 28
// },"WHERE name='太郎'",successCall, errorCall);

// 取得
// db.select("test","WHERE name='太郎'",selectCall);

// function selectCall(result) {
//     // console.log("取得しました。");
//     var mes = "";
//     for (var i = 0; i < result.rows.length;i++) {
//         mes += result.rows.item(i).name + " / " + result.rows.item(i).age + "\n";
//     }
//     alert(mes);
// }


//トランザクション
// db.transaction(tranceFunc, errorCall, successCall);

// function tranceFunc(tr){
//     tr.executeSql("SELECT * FROM test", [],
//         function(rt, rs) {
//             // print("SELECT: SUCCESS");
//             var mes = "";
//             for (var i = 0; i < rs.rows.length; i++) {
//                 var row = rs.rows.item(i);
//                 mes += row.name + " / " + row.age + "\n";
//             }
//             alert(mes);
//         },
//         function() { print("SELECT: ERROR"); }
//     );
// }