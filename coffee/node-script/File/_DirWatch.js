//---------------------------
// ＜作成中＞　：　ディレクトリ内のファイル変更を監視
// 挙動は数秒間に一度　ファイル一つ一つを確認するので、瞬間でCPUをかなり使う。
// 親のディレクトリの変更日時だけの監視で良いなら_DirUpdateWatch.jsを使うこと。
//---------------------------
//依存：
//npm install watch
//npm install path
// /_webSQL-Ctr.js
//
var DirWatch = (function(){

    var fs = require("fs");
    var path = require("path");
    var watch = require("watch");

    var targetDir = "";



    //イベントで取得できるファイルパスがディレクトリの場合もある。
    //その対策は？
    //
    //removedイベントの場合はパスの拡張子がない場合、ディレクトリとみなし、db.delete where like "パス%"で 削除する。
    // new fileイベントの場合はディレクトリか否かをfs.statSync().isDirectory();で判別。ディレクトリなら再帰読み込みを行う。
    //
    // watchは２階層深いディレクトリを配置すると、その先の変更を監視できない。
    // 例： A　というディレクトリがある。
    // Aに A-1/A-2を入れる。
    // watchはA-1を検知。
    // A-2にtest.fileを入れる。
    // watchは検知しない。
    // -> ディレクトリに対して新たにwatchTreeを実行
    //
    // 監視するファイル数が多いほど、監視開始までの時間がかかる。
    // 負荷を検証する必要あり？
    // 歌詞ディレクトリのサイズだと5秒周期でcpu 100%を振り切ってしまう。
    //
    // -> ディレクトリからファイル数を数える。ファイル数の変化を一定期間毎に監視できないか？
    // -> 今回の件としてはファイル数の増減だけ分かれば十分。
    // -> ファイル読み込み時にkvsへディレクトリパスのみ記録するエリアを用意。

    var reloadTimer = undefined;
    var maxCnt = 3;
    var nowCnt = maxCnt;

    function rw_timerComp(){
        watchCmd(targetDir);
    }

    function rw_timerCountUp(){
        nowCnt--;
        if(nowCnt > 0){
            rw_startTimer();
        }else{
            rw_timerComp();
        }
    }
    function rw_startTimer(){
        clearTimeout(reloadTimer);
        reloadTimer = setTimeout(rw_timerCountUp(),1000);
    }

    function rewatch(){
        nowCnt = maxCnt;
        rw_startTimer();
    }


    function watchCmd(inTargetDir){
        ProcessTimeINST.startTimerINSTL();
        watch.unwatchTree(inTargetDir);
        watch.watchTree(inTargetDir, function (f, curr, prev) {
            if (typeof f == "object" && prev === null && curr === null) {
              // alert("Finished walking the tree");

                var processArr = ProcessTimeINST.getTimerINSTL();
                alert("監視を開始しました。"+processArr[0]);

            } else if (prev === null) {
                //alert("f is a new file\n"+f);
                var isDir = fs.statSync(path.normalize(f)).isDirectory();
                if(isDir){
                    // alert("dir: "+ path.normalize(f));
                    rewatch();
                }
                WebSQL_ctr.addQue({sql:"insert", par:[path.basename(f),path.normalize(f)]});
            } else if (curr.nlink === 0) {
                //alert("f was removed\n"+f);
                var extName = path.extname(path.normalize(f));
                // if(extName == "")alert("dir: "+ path.normalize(f));
                WebSQL_ctr.addQue({sql:"deleteWhere", whereKey:path.normalize(f)});
            } else {
              // alert("f was changed\n"+f);
            }
        });
    }

    return {
        startWatch: function (inTargetDir){
            targetDir = inTargetDir;
            watchCmd(inTargetDir);
        },
        stopWatch: function (inTargetDir){
            watch.unwatchTree(inTargetDir);
        }
    };


})();

