//リンクからファイルドラッグを行える
// htmlは以下のような構造となっている事が前提
// for (i = 0; i < result.rows.length; i++) {
//   mes += '<div>';
//   mes += '<a href="'+path+'" id="dragout'+i+'" class="dragme" draggable="true" ';
//   mes += 'data-downloadurl="application/octet-stream:'+fileName+':'+path+'">';
//   mes += fileName + '</a>';
//   mes += '</div>';
// }




var _DragFile = (function() {
    var _dragFiles = [];
    var _fileDetails = [];
    var _selected_Arr = [];


    //---------------------------------
    // ドラッグ内容をセット
    //---------------------------------

    return {
        //ドラッグで渡すファイルを指定する。ドラッグするdomにmousedownイベントを登録。そのイベント処理から当メソッドを呼び出す
        setDragFile:function(inFileArr){
            _selected_Arr = inFileArr;
        },
        //ドラッグ開始。domにondragstart="_DragFile.testAert(event);"追加すること。
        startDragFile:function(ev){
            //http://alphasis.info/2014/03/javascript-dom-event-ondrag/
            //事前にドラッグしたいファイルを当クロージャーのsetDragFileで保存しておく必要がある。

            //選択されているファイルをセット。
            //(dataTransfer.setDataの仕様で単体のファイルしかドラッグできない)
            if(_selected_Arr != null){
                for(i = 0; i < _selected_Arr.length; i++){
                    _fileDetails[i] = $("#result"+_selected_Arr[i]).attr("dragData-url");
                    try{
                        ev.dataTransfer.setData("DownloadURL",_fileDetails[i]);
                    }catch(e){
                        alert("error:"+e);
                    }
                }
            }
        }
        //別のドラッグ処理。id=dragout1...nを持つdomに対して、ドラッグイベントを登録
        // addListener: function(fileCnt){

        //     //イベント開放 メモリ開放
        //     var i = 0;
        //     if(_dragFiles.length > 0){
        //         for(i = 0; i < _dragFiles.length; i++){
        //             _dragFiles[i].removeEventListener("dragstart",dragFunc(i),false);
        //         }
        //         _dragFiles = null;
        //         _dragFiles = [];
        //         _fileDetails = null;
        //         _fileDetails = [];
        //     }

        //     //生成されるタグ数に応じてドラッグイベントを登録
        //     for(i = 0; i < fileCnt; i++){
        //         _dragFiles[i]= document.getElementById("dragout"+i);

        //         if(typeof _dragFiles[i].dataset === "undefined") {
        //             // Grab it the old way
        //             _fileDetails[i] = _dragFiles[i].getAttribute("data-downloadurl");
        //         } else {
        //             _fileDetails[i] = _dragFiles[i].dataset.downloadurl;
        //         }

        //         _dragFiles[i].addEventListener("dragstart",dragFunc(i),false);
        //     }
        // }
    };

})();