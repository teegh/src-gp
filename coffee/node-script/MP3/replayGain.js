//mp3,aacファイルにReplay Gainを適用する。実行にはaacgainを使用する。
//
//　・モジュール読み込み時に、aacgain.exeをダウンロード
//　・applyGain()でreplay gainを適用
//　・ファイルパスにunicodeが含まれるとaacgain.exeでは実行できない(Can't open ***.mp3 for reading)
//　　-> 一時的にファイル名を変更し、aacgainを適用。
//
var _ReplayGain = (function(){  //jquery closure
// var _ReplayGain = new function(){  //node app

  var BinWrapper    = require('bin-wrapper');

  var exec          = require("child_process").exec;
  var fs            = require('fs');
  var path          = require("path");
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


  //----------------------------
  // ファイル名の一時的な変更
  //----------------------------
  var beforeFileName;
  var tempFileName;
  function replace_tempFileName(inFilePath){
    //ファイル名を一旦変更 unixtimeをファイル名とする。
    var fname = path.normalize(inFilePath);
    var fBaseName = path.basename(inFilePath);
    var timeStamp = ((new Date()).getTime() % 86400000 ).toString(26)

    beforeFileName = fname;
    // tempFileName = fname.replace(fBaseName,"") + String(parseInt((new Date())/1000)) + path.extname(inFilePath);

    tempFileName = fname.replace(fBaseName,"") + "TMP" +timeStamp + path.extname(inFilePath);

    log("[REPLACE TMP] ");
    log(" ->OLD: "+beforeFileName);
    log(" ->NEW: "+tempFileName);
    log("[CHECK LENGTH] ");
    log(" ->LENGTH: "+tempFileName.length + "(" + (tempFileName.length < 256) + ")");

    //Windowsのファイルパス長256を超える場合、パスを返さない
    if(tempFileName.length >= 256)return null;

    fs.renameSync(beforeFileName,tempFileName);
    return tempFileName;

  }
  function replace_beforeFileName(){
    fs.renameSync(tempFileName,beforeFileName);
  }


  //----------------------------
  // replay gainの適用
  //----------------------------
  function applyGain(inReplayGainDB, inFilePath, inCallBackFunc){
      //C:\\Users\\usen V-2\\Documents\\hdd\\mp3Editor\\aacgain\\test

    if(!aacgain_path){
      inCallBackFunc(false , 0, "" , inFilePath);
      return;
    }

    var tmpFilePath = replace_tempFileName(inFilePath);
    if(!tmpFilePath){
      inCallBackFunc(false , 0, "ファイルパス名が長すぎるため、MP3Gainを適用できませんでした。" , inFilePath);
      return;
    }

    // aacgain.exe -r -c -d 3 nogain.mp3'
    exec('"' + aacgain_path + '" -r -c -d ' + String(inReplayGainDB-89) + ' "'+ tmpFilePath +'"', function (error, stdout, stderr) {


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

          //ファイル名を元に戻す
          replace_beforeFileName();

          log('[replayGain.js aacgain -r] aacgain Exec error: \n' + error);
          logMes += "\n" + error;
          isSuccess = false;

          inCallBackFunc(isSuccess, 0 , logMes ,inFilePath);
          return;

        //処理が成功した場合
        }else{

          //適用値を調べる(stdoutから値を抜き出す)
          exec('"' + aacgain_path + '" -s c ' + ' "'+ tmpFilePath +'"', function (error, stdout, stderr) {

            //ファイル名を元に戻す
            replace_beforeFileName();

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
