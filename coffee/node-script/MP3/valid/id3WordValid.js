//---------------------------------------------------
// ID3タグの内容を判定する。
//---------------------------------------------------
// id3v2 writer
var _ID3WordValid = (function(){  //jquery closure
// var _ID3WordValid = new function(){  //node app

  //-----------------------------------------
  //ID3フレーム以降のデータを抽出
  function setElseFrame(fd, inID3, inElseFrameSize, inStartPosition, inCallBackFn){

    var elseFrame;

    elseFrame = new Buffer(inElseFrameSize);  //バッファを作成
    fs.read(fd, elseFrame, 0, inElseFrameSize, inStartPosition, function(err,bytesRead,buff){

      //ID3以降のフレームを変数id3に保持
      inID3.fileBuffer.elseFrame = elseFrame;

      inCallBackFn();
    });
  }

  return {
    writeTag : function(inOpenFilePath, inWriteFilePath, inWriteData, inCallBackFunc){
      writeTag(inOpenFilePath, inWriteFilePath, inWriteData, inCallBackFunc);
    }
  };


})();    //jQuery Closure
// };          //node.js