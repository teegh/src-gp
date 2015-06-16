//指定のエリアに対して、ファイルのドロップを受け付ける。
//またドロップされたら、指定された関数で処理を行う。
//[使い方]
// init(inFunc_onDropFile)          //ドロップされた時の処理関数を指定
// cancelDropEvent(inTargetName)    //デフォルトのドラッグファイルのイベントをキャンセル
// addDropUploadEvent(inTargetName) //ドラッグイベントを登録
//cancelDefaultDragEventの代替をつなぐ。

//例
//index.slimに追加
    // _DropFile.cancelDropEvent("#slidingMenu");
    // _DropFile.cancelDropEvent(".navbar");
    // _DropFile.cancelDropEvent(".uiViewWrapper-wrapper");
    // _DropFile.cancelDropEvent(".uiViewWrapper");
    // _DropFile.cancelDropEvent(".uploadContener");

    // //ドラッグイベントの登録
    // _DropFile.cancelDefaultDragEvent("#droppable");
    // _DropFile.addDropUploadEvent("#droppable");


var _DropFile = (function(){

    var currentView = "";
    var path        = require("path");
    var func_onDropFile;                    //ファイルがドロップされた時の処理関数

    // デフォルトイベントをキャンセルするハンドラです。
    var cancelEvent = function(event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
    }

    // デフォルトイベントをキャンセルするハンドラです。
    var cancelDragableEvent = function(event) {
        event.originalEvent.dataTransfer.dropEffect = 'none';
    }

    // ドロップ時のイベントハンドラ
    var handleDroppedFile = function(event) {
        func_onDropFile(event.originalEvent.dataTransfer.files);

        // デフォルトの処理をキャンセルします.
        cancelEvent(event);
        return false;
    }

    // dragenter, dragover イベントのデフォルト処理をキャンセルします.
    function cancelDefaultDragEvent_call(inTargetName){
        $(inTargetName).bind("dradenter", cancelEvent);
        $(inTargetName).bind("dragover", cancelEvent);
    }

    function cancelDragable(inTargetName){
        $(inTargetName).bind("dragover", cancelDragableEvent);
    }

    function addDropUploadEvent_call(inTargetName){
        $(inTargetName).bind("drop", handleDroppedFile);
    }


    return {
        //ファイルドロップされたときの処理関数を設定しておく
        init :function(inFunc_onDropFile){
            func_onDropFile = inFunc_onDropFile;
            // (例)
            // var callback_onDragFile = function (files){
            //     var path = require("path");
            //     for (var i=0; i<files.length; i++){
            //         if( path.extname(files[i].path).match(/.jpg|.jpeg|.JPG|.JPEG/)){
            //             // // 処理
            //             // files[i].path
            //         }
            //     }
            // }
        },

        //指定の部分に対してドロップイベントをキャンセル
        cancelDropEvent: function(inTargetName){
            cancelDefaultDragEvent_call(inTargetName);
            cancelDragable(inTargetName);
        },

        //ドロップ時のイベントハンドラを設定します
        addDropUploadEvent: function(inTargetName){
            addDropUploadEvent_call(inTargetName);
        },

        //
        cancelDefaultDragEvent: function(inTargetName){
            cancelDefaultDragEvent_call(inTargetName);
        }

    };
})();