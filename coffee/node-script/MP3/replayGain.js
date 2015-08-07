//mp3,aacファイルにReplay Gainを適用する。実行にはaacgainを使用する。
//
//　・モジュール読み込み時に、aacgain.exeをダウンロード
//　・applyGain()でreplay gainを適用
//
var _ReplayGain = (function(){  //jquery closure
// var _ReplayGain = new function(){  //node app

  var exec          = require("child_process").exec;
  var path          = require("path");
  var BinWrapper    = require('bin-wrapper');
  var aac_bin       = new BinWrapper(); //{"skipCheck":true}
  var aacgain_path  = null;
  var trackGain     = 0;

  //ログ出力
  function log(inStr){
    // console.log(inStr);
  }

  //aacgain.exeのダウンロードとパスを取得
  function aacgainDownload(){
    if(!process.platform.match(/win/i)){
        alert("このアプリケーションはWindowsのみ動作します。");
        return;
    }

    aac_bin.src("https://github.com/tee3glob/aacgain/archive/master.zip");
    aac_bin.dest(path.resolve('aacgain'));
    aac_bin.use('win32/aacgain.exe');

    aac_bin.run(['-v'], function (err) {
      if (err) {
        console.log('aacgainのインストールに失敗しました : ' + err);
        aacgain_path = null;
      }else{
        // console.log('Installed to ' + aac_bin.path());
        aacgain_path = aac_bin.path();
      }
    });
  }
  aacgainDownload();


  function applyGain(inReplayGainDB, inFilePath, inCallBackFunc){
      //C:\\Users\\usen V-2\\Documents\\hdd\\mp3Editor\\aacgain\\test

    if(!aacgain_path){
      inCallBackFunc(false , 0, "" , inFilePath);
      return;
    }

    // aacgain.exe -r -c -d 3 nogain.mp3'
    exec('"' + aacgain_path + '" -r -c -d ' + String(inReplayGainDB-89) + ' "'+ inFilePath +'"', function (error, stdout, stderr) {


        var logMes = "";
        var isSuccess = false;

        if(stdout){
            log('[replayGain.js aacgain -r] stdout: \n' + stdout);
            logMes += "\n" + stdout;
            isSuccess = true;
        }
        if(stderr){
            log('[replayGain.js aacgain -r] stderr: \n' + stderr);
            logMes += "\n" + stderr;
            isSuccess = true;
        }

        //エラーが発生した場合
        if (error !== null) {
          log('[replayGain.js aacgain -r] aacgain Exec error: \n' + error);
          logMes += "\n" + error;
          isSuccess = false;

          inCallBackFunc(isSuccess, 0 , logMes ,inFilePath);
          return;

        //処理が成功した場合
        }else{

          //適用値を調べる(stdoutから値を抜き出す)
          exec('"' + aacgain_path + '" -s c ' + ' "'+ inFilePath +'"', function (error, stdout, stderr) {

            if(stdout){
              log('[replayGain.js aacgain -s] stdout: \n' + stdout);
              logMes += "\n" + stdout;
              isSuccess = true;

              //適用値を抜き出す
              trackGain = 0;
              var gainvarSplArr = stdout.split("\n");
              for(var i=0; i<gainvarSplArr.length; i++){
                if(gainvarSplArr[i].match(/Recommended "Track" dB change/i)){
                  trackGain = Number(gainvarSplArr[i].replace(/Recommended "Track" dB change: /i, ""));
                  log("getTrackgain : : " + trackGain);
                }
              }

            }
            if(stderr){
              log('[replayGain.js aacgain -s] stderr: \n' + stderr);
              logMes += "\n" + stderr;
              isSuccess = true;
            }

            //エラーが発生した場合
            if (error !== null) {
              log('[replayGain.js aacgain -s] aacgain Exec error: \n' + error);
              logMes += "\n" + error;
              isSuccess = false;

              inCallBackFunc(isSuccess, 0 , logMes ,inFilePath);
              return;

            //適用値が取得できた場合
            }else{

              inCallBackFunc(isSuccess, 89.0-trackGain, logMes ,inFilePath);
              return;

            }

          });
        }

    });

  }

  return {
    applyGain : function (inReplayGainDB, inFilePath, inCallBackFunc){
      applyGain(inReplayGainDB, inFilePath, inCallBackFunc);
    }
  };


})();    //jQuery Closure
// };          //node.js
