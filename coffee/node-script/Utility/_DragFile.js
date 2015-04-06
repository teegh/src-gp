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
    var dragFiles = [];
    var fileDetails = [];


    function dragFunc(par) {
        return function(ev) {
            ev.dataTransfer.setData("DownloadURL",fileDetails[par]);
        }
    }

    return {
        addListener: function(fileCnt){

            //イベント開放 メモリ開放
            var i = 0;
            if(dragFiles.length > 0){
                for(i = 0; i < dragFiles.length; i++){
                    dragFiles[i].removeEventListener("dragstart",dragFunc(i),false);
                }
                alert(dragFiles.length + "件開放しました。");
                dragFiles = null;
                dragFiles = [];
                fileDetails = null;
                fileDetails = [];
            }


            for(i = 0; i < fileCnt; i++){
                dragFiles[i]= document.getElementById("dragout"+i);

                if(typeof dragFiles[i].dataset === "undefined") {
                    // Grab it the old way
                    fileDetails[i] = dragFiles[i].getAttribute("data-downloadurl");
                } else {
                    fileDetails[i] = dragFiles[i].dataset.downloadurl;
                }

                dragFiles[i].addEventListener("dragstart",dragFunc(i),false);
            }
        }
    };

})();