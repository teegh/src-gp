// ID3v2.3の書き込み
// ID3v2.2, ID3v2.3, ID3v2.4, ID3v1.0, ID3v1.1の読み込みが可能
//
// replayGainを検出する-334Byte目か206Byte目か。
//
//　返り値 : id3
// id3
//
// .fileInfo       ファイルの情報
//   .filePath     ファイルの場所
//   .fileSize     ファイルサイズ
//
// .id3Info        id3の情報
//   .version      ID3バージョン
//   .frameSize    id3の領域サイズ
//   .tags         タグデータ配列
//
// .apeInfo        APEタグの情報(Replaygainなどの情報)
//   .version      APEのバージョン
//   .frameSize    APEの領域サイズ
//   .tags         タグデータ配列
//
// .fileBuffer     id3に注目した、ファイルの各バイナリバッファデータ
//   .id3Header    id3ヘッダー (id3v2.2, 2.3, 2.4のみ)
//   .id3Frame     id3フレーム ( // )
//   .elseFrame    id3の領域以外のデータ
//
// id3の種類と構造
// http://eleken.y-lab.org/report/other/mp3tags.shtml

// 使用例
// _ID3v2_3Reader.read( "./mp3/test/test(utf16le).MP3" , function(id3){console.log(id3)} );

//
// //デスクトップパス取得
// var nodePath = require("path");
// var dir_home = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
// var outpath = nodePath.join(dir_home, "Desktop", "out.mp3");
// nodePath = null;
// dir_home = null;

// _ID3v2_3Writer.writeTag("./mp3/edit test/test.mp3", outpath ,
//     [
//       //はcafé
//       {"tag": "artist", "dat":"三門忠司çafe"},
//       {"tag": "track", "dat":"1"},
//       {"tag": "title", "dat":"title"},
//       {"tag": "album", "dat":"album"},
//       {"tag": "genre", "dat":"genre"},
//       {"tag": "year", "dat":"0000/00/00"},
//       {"tag": "comment", "dat":"コメント欄です","lang":"jpn"},
//       {"tag": "lyric", "dat":"歌詞の欄です","lang":"jpn"}
//       // {"tag": "jacket", "dat":"*****"}
//     ],
//     function (id3){console.log(id3);}
// );


// todo
// バッファの読み込みを一回だけにし、処理速度を速める
// replaygainとid3の読み込み処理を切り分けて、両方とも解析できるようにする。
//
// まずはid3v1

// fs.readで90msの処理時間がかかる。
// 現状、id3v2.3のタグ読み込み時間は100-200ms程度

//fs.readで一つ一つ読み込むのと、一度にバッファを取得し、forで順番にバッファを走査するのとでは、どちらが早い処理となるか？


//---------------------------------------------------
// ID3v2.3でファイルを書き出す
//---------------------------------------------------
// id3v2 writer
var _ID3v2_3Writer = (function(){  //jquery closure
// var _ID3v2_3Writer = new function(){  //node app

  var fs        = require('fs');
  var Buffer    = require('buffer').Buffer;
  var jschardet = require('jschardet');   //npm
  var Iconv     = require('iconv-lite');

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

  //-----------------------------------------
  //ID3フレームのデータを抽出
  function setID3Frame(inID3, inWriteDataObj, inCallBackFn){

    var tagName;
    var wpos;
    var detectResult;
    var iconv;
    var buffer;
    var tagBuffer;
    var tagSizeBuffer;
    var outbuff;

    //後続する処理で利用する変数
    var temp_ID3Size    = 0;
    var temp_writeData  = [];
    var id3FrameBuffer;

    temp_writeData  = [];
    temp_ID3Size    = 0;



    for(var i=0; i<inWriteDataObj.length; i++){
      tagName = _Mp3UtilFunc.getTAG(inWriteDataObj[i].tag);
      if(tagName != "" && tagName != "APIC"){

        wpos = 0;

        //タグの内容
        //入力される文字セットの判定後、asciiかUTF-16LEで入力
        detectResult = jschardet.detect(inWriteDataObj[i].dat); //タグの文字セットを取得


        if(detectResult.encoding == "ascii"){

          //npm iconv-lite
          buffer = Iconv.encode(inWriteDataObj[i].dat, "Shift_JIS");
        }else{

          //npm iconv-lite
          buffer = Iconv.encode(inWriteDataObj[i].dat, "utf16-le");
        }

        //タグ名
        tagBuffer = Iconv.encode(tagName, "ascii");


        //タグサイズとその他の領域のバッファを作成
        //歌詞とコメントの場合
        if(tagName ==　"COMM" || tagName ==　"USLT"){

          tagSizeBuffer = new Buffer( (detectResult.encoding == "ascii" ? 11 : 16));
          tagSizeBuffer.writeUInt32BE( buffer.length + (detectResult.encoding == "ascii" ? 5 : 10) ,0); //タグのフレームサイズ
          tagSizeBuffer[4] = 0;
          tagSizeBuffer[5] = 0;
          tagSizeBuffer[6] = detectResult.encoding == "ascii" ? 0 : 1;  //asciiかutf-16leを判定するコード

          tagSizeBuffer.writeUInt8(inWriteDataObj[i].lang.charCodeAt(0), 7); //j
          tagSizeBuffer.writeUInt8(inWriteDataObj[i].lang.charCodeAt(1), 8); //p
          tagSizeBuffer.writeUInt8(inWriteDataObj[i].lang.charCodeAt(2), 9); //n

          if(detectResult.encoding != "ascii"){  //utf-16leで入力する場合はFF FE 00 00 FF FEを追加
            tagSizeBuffer[10] = 255; //FF
            tagSizeBuffer[11] = 254; //FE
            tagSizeBuffer[12] = 0;   //0
            tagSizeBuffer[13] = 0;   //0
            tagSizeBuffer[14] = 255; //FF
            tagSizeBuffer[15] = 254; //FE
          }else{
            tagSizeBuffer[10] = 0;   //FF
          }

        //コメントと歌詞、ジャケット以外の場合
        }else{

          tagSizeBuffer = new Buffer( (detectResult.encoding == "ascii" ? 7 : 9));
          tagSizeBuffer.writeUInt32BE( buffer.length + 1 + (detectResult.encoding == "ascii" ? 0 : 2) ,0); //タグのフレームサイズ
          tagSizeBuffer[4] = 0;
          tagSizeBuffer[5] = 0;
          tagSizeBuffer[6] = detectResult.encoding == "ascii" ? 0 : 1;  //asciiかutf-16leを判定するコード

          wpos = 7;
          if(detectResult.encoding != "ascii"){  //utf-16leで入力する場合はFFFEを追加
            tagSizeBuffer[wpos+0] = 255; //FF
            tagSizeBuffer[wpos+1] = 254; //FE
            wpos = 8;
          }

        }


        //バッファー結合
        outbuff = new Buffer(buffer.length + tagBuffer.length + tagSizeBuffer.length);
        tagBuffer.copy(outbuff);
        tagSizeBuffer.copy(outbuff, tagBuffer.length);
        buffer.copy(outbuff, tagBuffer.length + tagSizeBuffer.length);


        temp_ID3Size += outbuff.length;

        temp_writeData.push({
          "tag":tagName,
          "buffer":outbuff
        });


      //ジャケット画像の処理
      }else if(tagName ==　"APIC"){

        wpos = 0;

        //---------------------
        //タグの内容と文字セット
        //---------------------
        //入力される文字セットの判定後、asciiかUTF-16LEで入力
        // detectResult = jschardet.detect(inWriteDataObj[i].dat); //タグの文字セットを取得
        detectResult.encoding = "ascii";
        buffer = inWriteDataObj[i].dat;

        //---------------------
        //タグ名
        //---------------------
        tagBuffer = Iconv.encode(tagName, "ascii");

        //長さはmimeタイプの文字より、変わる。jpeg -> image/jpeg,  png -> image/png
        var tagSizeBufferLengthOffset = 0;
        if(inWriteDataObj[i].format == "jpeg"){
          tagSizeBufferLengthOffset = 14;
        }else if(inWriteDataObj[i].format == "png"){
          tagSizeBufferLengthOffset = 13;
        }else{
          //jpeg, png以外の形式では処理を行わない
        }

        if(tagSizeBufferLengthOffset != 0){

          //タグのフレームサイズ
          tagSizeBuffer = new Buffer( 6 + tagSizeBufferLengthOffset );
          tagSizeBuffer.writeUInt32BE( buffer.length + tagSizeBufferLengthOffset , 0); //タグのフレームサイズ


          tagSizeBuffer[4] = 0;
          tagSizeBuffer[5] = 0;
          // tagSizeBuffer[6] = detectResult.encoding == "ascii" ? 0 : 1;  //asciiかutf-16leを判定するコード
          tagSizeBuffer[6] = 0; //文字コード

          //画像ファイルのフォーマット
          var fileFormatBuffer;
          if(inWriteDataObj[i].format == "jpeg"){
            fileFormatBuffer = Iconv.encode("image/jpeg", "ascii");
          }else if(inWriteDataObj[i].format == "png"){
            fileFormatBuffer = Iconv.encode("image/png", "ascii");
          }
          //末尾から3Byte分も0で埋める。
          tagSizeBuffer[tagSizeBuffer.length-3] = 0;
          tagSizeBuffer[tagSizeBuffer.length-2] = 0;
          tagSizeBuffer[tagSizeBuffer.length-1] = 0;

          //tagSizeBufferにバッファー結合
          fileFormatBuffer.copy(tagSizeBuffer, 7);

          //バッファー結合
          outbuff = new Buffer(buffer.length + tagBuffer.length + tagSizeBuffer.length);
          tagBuffer.copy(outbuff);
          tagSizeBuffer.copy(outbuff, tagBuffer.length);
          buffer.copy(outbuff, tagBuffer.length + tagSizeBuffer.length);

          temp_ID3Size += outbuff.length;

          temp_writeData.push({
            "tag":tagName,
            "buffer":outbuff
          });

        }

      }
    }


    // id3のフレーム・データを結合
    id3FrameBuffer = new Buffer(temp_ID3Size);
    pos = 0;
    for(var i=0; i<temp_writeData.length; i++){
      temp_writeData[i].buffer.copy(id3FrameBuffer,pos);
      pos += temp_writeData[i].buffer.length;
    }

    //id3に格納
    inID3.fileBuffer.id3Frame = id3FrameBuffer;


    //開放
    tagName         = null;
    detectResult    = null;
    iconv           = null;
    buffer          = null;
    tagBuffer       = null;
    tagSizeBuffer   = null;
    outbuff         = null;
    temp_writeData  = null;

    //コールバック
    inCallBackFn();
  }

  //-----------------------------------------
  //ID3フレームサイズを計算し、ヘッダーに上書き
  function setID3FrameSize(inID3, inCallBackFn){

    var m1, m2, m3, m4;
    var temp_id3Size_syncSafe = 0;
    var id3HeaderBuffer = new Buffer(10);
    var temp_ID3Size;

    temp_ID3Size = inID3.fileBuffer.id3Frame.length;

    //id3v2のフレームサイズの制限をこえる場合は処理を中止
    if(temp_ID3Size > 268435455){
      inID3.fileBuffer.id3Header = null;
      inCallBackFn();
      return;
    }

    //ID3フレームのサイズ(syncsafe)を計算
    m1 = temp_ID3Size & 0x0000007F;
    m2 = temp_ID3Size & 0x00003F80;
    m3 = temp_ID3Size & 0x001FC000;
    m4 = temp_ID3Size & 0x0FE00000;
    temp_id3Size_syncSafe = m1 + (m2 << 1) + (m3 << 2) + (m4 << 3);

    var id3SizeBuff = new Buffer(4);
    id3SizeBuff.writeUInt32BE(temp_id3Size_syncSafe , 0);
    id3HeaderBuffer[6] = id3SizeBuff[0];
    id3HeaderBuffer[7] = id3SizeBuff[1];
    id3HeaderBuffer[8] = id3SizeBuff[2];
    id3HeaderBuffer[9] = id3SizeBuff[3];

    //ID3ヘッダーのid3バージョンを入れる(ID3)
    id3HeaderBuffer[0] = 73;
    id3HeaderBuffer[1] = 68;
    id3HeaderBuffer[2] = 51;
    id3HeaderBuffer[3] = 3;

    //フラグは0埋め
    id3HeaderBuffer[4] = 0;
    id3HeaderBuffer[5] = 0;


    testBuffer = new Buffer(4);
    testBuffer[0] = id3HeaderBuffer[6];
    testBuffer[1] = id3HeaderBuffer[7];
    testBuffer[2] = id3HeaderBuffer[8];
    testBuffer[3] = id3HeaderBuffer[9];

    inID3.fileBuffer.id3Header = id3HeaderBuffer;


    //コールバック
    inCallBackFn();
  }


  //-----------------------------------------
  //各バッファーの結合後にファイルの書き出し
  function outputMP3(id3HeaderBuffer, id3FrameBuffer, id3ElseFrameBuffer, infilePath, inCallBackFn){
    // バッファの結合
    // http://memo.overknee.info/post/15226149573
    var outbuff = new Buffer(id3HeaderBuffer.length + id3FrameBuffer.length + id3ElseFrameBuffer.length);
    id3HeaderBuffer.copy( outbuff );
    id3FrameBuffer.copy( outbuff , id3HeaderBuffer.length);
    id3ElseFrameBuffer.copy( outbuff , id3HeaderBuffer.length + id3FrameBuffer.length);

    //ファイル書き出し
    fs.writeFile(infilePath, outbuff, function (err) {
      clearVar();
      if (err) throw err;
      // console.log('mp3 file saved!');
      inCallBackFn();
    });

    //メモリ開放
    function clearVar(){
      outbuff = null;
    }
  }

  //-----------------------------------------
  // //id3の書き込み
  // //self.readのコールバック関数で、タグの解析や書き込み処理を行う。
  var writeTag = function (inOpenFile, inOutFile, inWriteDataObj , inCompleteFn){

    var complete_callBackFn = inCompleteFn;

    //ヘッダーを抽出
    _ID3v2_3Reader.read(inOpenFile,
      function(id3){
        //読み込みが完了したら、writeDataObjでタグを書き込む。

        //ヘッダーを抽出　(readメソッドで抽出済)
        // id3.fileBuffer.id3Header
        var writeDataObj        = inWriteDataObj;

        //読み込み元のmp3にジャケット画像が含まれており、また入力値にジャケット画像が含まれていない時、書き出しファイルにも追加する。
        var i=0;
        var isAutoAddJakcet = true;
        for(i=0; i<writeDataObj.length; i++){
          if( writeDataObj[i].tag == "jacket" ){
            isAutoAddJakcet = false;
            break;
          }
        }

        if(isAutoAddJakcet){
          for(i=0; i<id3.id3Info.tags.length; i++){
            if(id3.id3Info.tags[i].NAME == "APIC" || id3.id3Info.tags[i].NAME == "PIC"){

              var imgFormat = "";
              if(id3.id3Info.tags[i].format == "image/jpeg" || id3.id3Info.tags[i].format == "JPEG"){
                imgFormat = "jpeg";
              }else if(id3.id3Info.tags[i].format == "image/png" || id3.id3Info.tags[i].format == "PNG"){
                imgFormat = "png";
              }

              writeDataObj.push({
                "tag": "jacket",
                "dat": id3.id3Info.tags[i].content ,
                "format":imgFormat
              });
            }
          }
        }


        //ファイルを開く
        fs.open(inOpenFile,'r',function(err,fd){
          if(err){
            console.dir(err);
            return;
          }

          var nxFn_setID3Frame = function (){
            console.log("1. elseFrame get Success !!");
            //ID3フレームのデータを抽出
            setID3Frame(id3, writeDataObj, nxFn_setID3FrameSize);
          };

          var nxFn_setID3FrameSize = function (){
            console.log("2. ID3Frame get Success !!");
            //フレームサイズを計算し、ヘッダーフレームに上書き
            setID3FrameSize(id3, nxFn_outputMP3);
          };

          var nxFn_outputMP3 = function (inID3Size, inId3FrameBuffer){

            //id3のフレームサイズを計算し、エラーが発生した場合は処理を終了。
            if(id3.fileBuffer.id3Header == null){
              completeFn_error();
            //正常な場合はファイル書き出し
            }else{
              console.log("3. ID3FrameSize get Success !!");
              // バッファを結合して、ファイルを書き出し
              outputMP3(id3.fileBuffer.id3Header, id3.fileBuffer.id3Frame, id3.fileBuffer.elseFrame, inOutFile, completeFn);
            }
          };

          var completeFn = function(){
            console.log("1 + 2 + 3 writeFile Success !!");
            complete_callBackFn(id3);
          };
          var completeFn_error = function (){
            console.log("id3 write error!!");
            complete_callBackFn(null);
          };

          //---------------------------
          // デバッグ
          //---------------------------
          // id3v1 , id3v2.2 , id3v2.4に対応できるように処理を行う。
          // var nxFn_outputMP3 = function (){
          //   complete_callBackFn(id3);
          // }

         //ID3フレーム以降のデータを抽出　
          setElseFrame(fd ,
              id3 ,
              id3.fileInfo.fileSize - (id3.id3Info.frameSize + id3.fileBuffer.id3Header.length) ,
           id3.id3Info.frameSize + id3.fileBuffer.id3Header.length,
              nxFn_setID3Frame
          );

        });
      }
    );
  }


  return {
    writeTag : function(inOpenFilePath, inWriteFilePath, inWriteData, inCallBackFunc){
      writeTag(inOpenFilePath, inWriteFilePath, inWriteData, inCallBackFunc);
    }
  };


})();    //jQuery Closure
// };          //node.js



















//---------------------------------------------------
// ID3v2.3のリーダー
//---------------------------------------------------
// id3v2 reader
var _ID3v2_3Reader = (function(){  //jquery closure
// var _ID3v2_3Reader = new function(){  //node app

  var fs        = require('fs');
  var Buffer    = require('buffer').Buffer;
  var jschardet = require('jschardet');   //npm
  var Iconv     = require('iconv-lite');

  // // // Credits to esailja //
  // // var self = this;

  var special_tags = {
    // APIC(歌詞)の解析は自前で行う。
    // 'APIC':function(raw){
    //   var frame = {
    //     txt_enc : raw.readUInt8(0)
    //   }
    //   var pos = raw.toString('ascii',1,(raw.length < 24)?raw.length:24).indexOf('\0');
    //   frame.mime = raw.toString('ascii',1,pos+1);
    //   pos += 2;
    //   frame.type = _Mp3UtilFunc.getPicType(raw.readUInt8(pos++)) || 'unknown';
    //   var desc = raw.toString('ascii',pos,pos+64); // Max 64 char comment
    //     var desc_pos = desc.indexOf('\0');
    //   frame.desc = desc.substr(0,desc_pos);
    //   pos +=  desc_pos + 1 ;// /0 is the last character which wont be counted xP
    //   frame.img = fs.writeFileSync('temp.'+frame.mime.split('/')[1],raw.slice(pos,raw.length),'binary'); // Replace the art with unique ID .
    //   return frame;
    // },
    'TRCK':function(raw){
      // return raw.toString('ascii').replace(/\u0000/g,'') * 1;
      return raw.toString('ascii').replace(/\u0000/g,'');
    },
    'TYER':function(raw){
      // return raw.toString('ascii').replace(/\u0000/g,'') *1;
      return raw.toString('ascii').replace(/\u0000/g,'');
    }
  }


  // ID3v2.3のタグ解析
  function parseTags (raw_tags,callback){
    var max = raw_tags.length;
    var pos = 0;
    var isUTF16;
    var buf2;
    var iconv;
    var conv;
    var TAG;
    var parsed_tags = [];

    while( pos < max-10){ //id3のフレームヘッダー(10byte)を除いた領域までループ
      TAG = {
        NAME : raw_tags.toString('ascii',pos,pos+4),
        SIZE : raw_tags.readUInt32BE(pos+4)
      };

      if( special_tags[TAG.NAME] !== undefined){
          TAG.content = special_tags[TAG.NAME](raw_tags.slice(pos+10,pos+10+TAG.SIZE)) || 'FUCK IN COMPLETE THE FUCKING FUNCTION';
      }else{
        TAG.content = raw_tags.toString('utf8',pos+10,pos+10+TAG.SIZE).replace(/\u0000/g,'');


        if(TAG.SIZE != 0){

          // id3v2 3 ではascciまたはUTF-16LEで格納されている。
          // 判定方法は、フレームボディの1バイト目が
          // 00 SHIFT-JIS
          // 01 BOMつきUTF-16
          // 　 → 続く2byteがBOMでFF FEになっていることからリトルエンディアンとなる。
          isUTF16 = false;
          if(TAG.SIZE > 3){

            buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+10, 3);

            //データに1FEが含まれる時、UTF16LEでボディが格納されている
            // if((buf2[0]==1)&&(buf2[1]==255)&&(buf2[2]==254))isUTF16 = true;
            if(buf2[0]==1)isUTF16 = true;       //コメントと歌詞は1FEという構造にならないので1Byte目を注目
          }


          // id3v2.4 のとき  2:UTF-16(ビックエンディアン)と3:UTF-8の文字コードにも対応している。
          // 該当する場合には処理をやめる(まれなので)
          if(buf2[0]==2 || buf2[0]==3){
            TAG.content = "(識別できません)";
          }else{


            //コメントと歌詞のタグ解析
            //3バイト分が言語、SHIFT-JISの場合5バイト目以降、UTF-16LEの場合は10Byte目以降がタグデータとなっている。
            if(TAG.NAME == "COMM" || TAG.NAME == "USLT"){

              //タグデータの言語　を読み取る
              TAG.LANG = raw_tags.toString('ascii', pos+10+1, pos+10+1+3);

              //BOMつきUTF-16の場合の解析
              // UTF-16 -> utf8へ変換
              if(isUTF16){

                //コメントまたは歌詞は末端はターミネータが含まれないので10Byte目以降からTAG.SIZE分読み取る
                TAG.content = raw_tags.toString('utf16le', pos+10+10, pos+10+TAG.SIZE);

              //SHIFT-JISの場合の解析
              // SHIFT-JIS -> utf8 へ変換
              }else{

                //コメントまたは歌詞は末端の1Byteがターミネータが含まれないので、5byte目以降から末端まで読み込む
                //先頭の言語指定1Byteと　末端の1Byteがターミネータとなているので 1+1Byte分無視
                buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+10+5, TAG.SIZE-5);

                //npm iconv-lite
                conv = Iconv.decode( buf2 , "Shift_JIS");
                TAG.content = String(conv);
              }

            //ジャケット画像のタグ解析
            }else if(TAG.NAME == "APIC"){

              TAG.content = "";

              //ファイルのフォーマットを取得(MIME)
              var k=0;
              for(k=0; k<64; k++){
                if(raw_tags[pos+8+3+k] == 0){
                  break;
                }
              }
              TAG.format = raw_tags.toString('ascii', pos+8+3, pos+8+3+k );

              // //説明文の領域は可変なので、nullが示す終端までiをカウントする。
              var i=0;
              for(i=0; i<64; i++){
                if(raw_tags[pos+8+3+k+1+i] == 0){
                  break;
                }
              }

              //画像データを取得
              buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+8+3+k+1+i+2, TAG.SIZE - (1+k+1+i+1+1));
              TAG.content = buf2;

            //コメントと歌詞以外のタグ解析
            }else{

              //BOMつきUTF-16の場合の解析
              // UTF-16 -> utf8へ変換
              if(isUTF16){
                TAG.content = raw_tags.toString('utf16le', pos+10+3, pos+10+TAG.SIZE);

              //SHIFT-JISの場合の解析
              // SHIFT-JIS -> utf8 へ変換
              }else{
                buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+10+1, TAG.SIZE-1 );

                //npm iconv-lite
                conv = Iconv.decode( buf2 , "Shift_JIS");
                TAG.content = String(conv);
              }
            }
          }
        }

        //ID3v2.4 は末端の\n0000を削除する。
        if(TAG.NAME != "APIC")TAG.content = _Mp3UtilFunc.deleteSpace(TAG.content);

      }
      if( _Mp3UtilFunc.getIDv2_3TagCap(TAG.NAME) !== undefined && TAG.NAME !== 'PRIV'){
        parsed_tags.push(TAG);
      }
      pos += (10+TAG.SIZE);
    }
    callback(parsed_tags);
  };



  //id3v2.3としてバッファを解析する
  var callback_readID3v23 = function( inFile, inID3, inBuff, inFd, inMainCallBackFunc){

    var file      = inFile;
    var id3       = inID3;
    var buff      = inBuff;
    var fd        = inFd;
    var file      = id3.fileInfo.filePath;
    var callback  = inMainCallBackFunc;
    var Buffer    = require('buffer').Buffer;
    var fs        = require('fs');


    if( buff.toString('ascii',0,3) != 'ID3'){
      console.log("id3v1としてファイルを開きます。");
      _ID3v1Reader.read(file, callback);  //_ID3v1Readerで処理を行う
      return;
    }

    if( buff[3] == 2 && buff[4] == 0 ){
      console.log("このファイルは id3v2.2規格です。filePath:" + file);
      _ID3v2_2Reader.read(file, callback);
      return;
    }

    if( (buff[3] == 4 || buff[3] == 3) && buff[4] == 0 ){
      if(buff[3] == 4)console.log("id3v2.4として開きます。" );


      // ID3v2.3、ID3v2.4として開く
      // ヘッダーの解析
      id3.id3Info.version       = '2.'+buff.readUInt8(3);
      id3.fileBuffer.id3Header  = buff;
      id3.id3Info.frameSize     = _Mp3UtilFunc.getId3Size_onSyncSafe(buff.slice(6,10));

      if(id3.id3Info.frameSize <= 0){
        console.log("id3v2 3.0 フレームのデータがありません。");
        callback(id3);
        return;
      }

      // ID3フレーム　各タグの解析
      raw_tags = new Buffer(id3.id3Info.frameSize);
      fs.read(fd,raw_tags, 0, id3.id3Info.frameSize, null, function(){
        fs.close(fd,function(){
          parseTags( raw_tags,function(parsed_tags){
            id3.id3Info.tags = parsed_tags;
            onParseTags(inID3, callback , file);
          });
        });
      });

    }else{
      console.log("読み込みできません。このファイルはサポート外の形式です。");
      callback(id3);
      return;
    }
  }

  //タグ解析が完了したら
  function onParseTags(inID3, inCallBackFunc, inFile){

    //replayGainの解析
    _Mp3ReplayGainFunc.readReplayGain(inID3, inFile, inCallBackFunc, callback_onReadReplayGain);
  }

  //replayGainの解析が完了したら
  function callback_onReadReplayGain( inID3, inFile, inMainCallBackFunc){

    inMainCallBackFunc(inID3);
    return;
  }

  return {
    read : function (inMp3FilePath, inCallBackFunc){
      _Mp3UtilFileOpenFunc.openFileAndReadBuff(inMp3FilePath , 10, true, inCallBackFunc, callback_readID3v23);
    }
  };


})();    //jQuery Closure
// };          //node.js


























//---------------------------------------------------------------------------------------------------------------
//id3v2.2 のタグ情報を読み込む。
//---------------------------------------------------------------------------------------------------------------
var _ID3v2_2Reader = (function(){  //jquery
// var _ID3v2_2Reader = new function(){  //node app


  //id3v2.2のid3フレームを解析してタグを読み取る
  function parseTags (raw_tags,callback){
    var max         = raw_tags.length;
    var pos         = 0;
    var isUTF16;
    var buf2;
    var conv;
    var TAG;
    var parsed_tags = [];
    var temp_buffer;
    var tagContentsOffset;
    var i=0;

    var Buffer      = require('buffer').Buffer;
    var Iconv       = require('iconv-lite');

    // ID3v2.2の構造
    //ID3 (49 44 33)で始まる。次の2Byteがタグのバージョン。02 00 (=ID3v2.2.0)となる。次の7から10Byteバイト目がフレームサイズとなる(Syncsafe)。続く6 バイトを読む。前半 3 byte がタグの種類で後半 3 byte がフレームの長さ。

    while( pos < max-10 ){ //id3のフレームヘッダー(10byte)を除いた領域までループ

      temp_buffer       = null;
      temp_buffer       = new Buffer(4);
      temp_buffer[0]    = 0;
      tagContentsOffset = 0;
      raw_tags.copy(temp_buffer, 1, pos+3 , pos+3+3);

      //タグ名とタグサイズを取得
      TAG = {
        NAME : raw_tags.toString('ascii',pos,pos+3),
        SIZE : temp_buffer.readUInt32BE(0)
      };

      //タグの中身を取得
      TAG.content = "";
      if(TAG.SIZE != 0){

        // id3v2 2 ではascciまたはUTF-16LEで格納されている。
        // 判定方法は、フレームボディの1バイト目が
        // 00 SHIFT-JIS
        // 01 BOMつきUTF-16
        // 　 → 続く2byteがBOMでFF FEになっていることからリトルエンディアンとなる。
        isUTF16 = false;
        if(TAG.SIZE > 3){
          buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+6, 3);
          //データに1FEが含まれる時、UTF16LEでボディが格納されている
          // if((buf2[0]==1)&&(buf2[1]==255)&&(buf2[2]==254))isUTF16 = true;
          if(buf2[0]==1)isUTF16 = true; //コメントと歌詞は1FEという構造になっていないので先頭の1Byte目だけ見る。
        }

        //コメントと歌詞のタグ解析　　3バイト分が言語、SHIFT-JISの場合5バイト目以降、UTF-16LEの場合は10Byte目以降がタグデータとなっている。
        //また、末端にはターミネータがない。
        if(TAG.NAME == "COM" || TAG.NAME == "ULT"){

          //タグデータの言語　を読み取る
          TAG.LANG = raw_tags.toString('ascii', pos+6+1, pos+6+1+3);

          //BOMつきUTF-16の場合の解析
          // UTF-16 -> utf8へ変換
          if(isUTF16){

            //コメントまたは歌詞は末端はターミネータが含まれないので10Byte目以降からTAG.SIZE分読み取る
            TAG.content = raw_tags.toString('utf16le', pos+6+10, pos+6+TAG.SIZE);

          //SHIFT-JISの場合の解析
          // SHIFT-JIS -> utf8 へ変換
          }else{

            //コメントまたは歌詞は末端の1Byteがターミネータが含まれないので、5byte目以降から末端まで読み込む
            //先頭の言語指定1Byteと　末端の1Byteがターミネータとなているので 1+1Byte分無視
            buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+6+5, TAG.SIZE-5);

            //npm iconv-lite
            conv = Iconv.decode( buf2 , "Shift_JIS");
            TAG.content = String(conv);
          }

        //ジャケット画像のタグ解析
        }else if(TAG.NAME == "PIC"){

          //フォーマットを取得
          TAG.format = raw_tags.toString('ascii', pos+6+1, pos+6+1+3);

          //説明文の領域は可変なので、nullが示す終端までiをカウントする。
          i=0;
          for(i=0; i<64; i++){
            if(raw_tags[pos+6+1+4+i] == 0){
              break;
            }
          }

          // 画像データを取得
          buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+6+1+4+i+1, TAG.SIZE - (1+4+i+1));

        //コメントと歌詞以外のタグ解析
        }else{

          //BOMつきUTF-16の場合の解析
          // UTF-16 -> utf8へ変換
          if(isUTF16){

            // UTF-16はの先頭の言語設定1Byte分と、FF FE 2Byte分、末端の2Byteがターミネータとなているので 合計3+2Byte分無視
            TAG.content = raw_tags.toString('utf16le', pos+6+3, pos+6+TAG.SIZE-2);

          //SHIFT-JISの場合の解析
          // SHIFT-JIS -> utf8 へ変換
          }else{

            //先頭の言語指定1Byteと　末端の1Byteがターミネータとなているので 1+1Byte分無視
            buf2 = _Mp3UtilFunc.getPartOfBuffer(raw_tags, pos+6+1, TAG.SIZE-1);

            //npm iconv-lite
            conv = Iconv.decode( buf2 , "Shift_JIS");
            conv = _Mp3UtilFunc.deleteSpace(conv);
            TAG.content = String(conv);
          }
        }
      }

      if( TAG.content !== undefined && TAG.content != ""){
        parsed_tags.push(TAG);
      }
      pos += (6+TAG.SIZE);


    }
    callback(parsed_tags);
  };




  //id3v2.2としてバッファを解析する
  var callback_readID3v22 = function( inFile, inID3, inBuff, inFd, inMainCallBackFunc){

    var file      = inFile;
    var id3       = inID3;
    var buff      = inBuff;
    var fd        = inFd;
    var callback  = inMainCallBackFunc;
    var Buffer    = require('buffer').Buffer;
    var fs        = require('fs');

    //id3v2.2以外の企画
    if( buff.toString('ascii',0,3) != "ID3" || buff[3] != 2){
      console.dir("このファイルは id3v2.2以外の規格であるため、開けません。");
      callback(id3);
      return;
    }

    //id3v2.2として解析する
    tempBuff                  = _Mp3UtilFunc.getPartOfBuffer(buff, 6, 4);
    var id3FrameSize          = _Mp3UtilFunc.getId3Size_onSyncSafe(tempBuff);

    //ID3ヘッダーの情報
    id3.id3Info.version       = '2.'+buff[3];
    id3.fileBuffer.id3Header  = buff;
    id3.id3Info.frameSize     = id3FrameSize;

    if(id3.id3Info.frameSize <= 0){
      console.log("id3v2.2 フレームのデータがありません。");
      callback(id3);
      return;
    }

    raw_tags = new Buffer( id3.id3Info.frameSize );
    fs.read(fd, raw_tags, 0, id3.id3Info.frameSize, null, function(){
      fs.close(fd, function(){
        parseTags( raw_tags, function(parsed_tags){
          id3.id3Info.tags = parsed_tags;

          onParseTags(inID3, callback , file);

        });
      });
    });

  }

  //タグ解析が完了したら
  function onParseTags(inID3, inCallBackFunc, inFile){
    //replayGainの解析
    _Mp3ReplayGainFunc.readReplayGain(inID3, inFile, inCallBackFunc, callback_onReadReplayGain);
  }

  //replayGainの解析が完了したら
  function callback_onReadReplayGain( inID3, inFile, inMainCallBackFunc){
    inMainCallBackFunc(inID3);
    return;
  }



  return {
    read : function (inMp3FilePath, inCallBackFunc){
      // read(inMp3FilePath , inCallBackFunc);
      _Mp3UtilFileOpenFunc.openFileAndReadBuff(inMp3FilePath , 10, true, inCallBackFunc, callback_readID3v22);
    }
  };


})();    //jQuery Closure
// };          //node.js






















//---------------------------------------------------------------------------------------------------------------
//id3v1のタグ情報を読み込む。
//---------------------------------------------------------------------------------------------------------------
var _ID3v1Reader = (function(){  //jquery
// var _ID3v1Reader = new function(){  //node app

  //id3v1としてバッファを解析する
  var callback_readID3v1 = function( inFile, inID3, inBuff, inFd, inMainCallBackFunc){

    var file      = inFile;
    var id3       = inID3;
    var buff      = inBuff;
    var callback  = inMainCallBackFunc;
    var Buffer    = require('buffer').Buffer;

    var title   = "";
    var artist  = "";
    var album   = "";
    var year    = "";
    var comment = "";
    var track   = "";
    var genre   = "";

    //id3v1ではない。
    if( buff.toString('ascii',0,3) != "TAG"){
      console.dir("このファイルは id3v1 1.0以外の規格であるため、開けません。");
      callback(id3);
      return;
    }

    id3.id3Info.frameSize   = 128;
    id3.id3Info.tags        = [];

    // 曲名, アーティスト名, アルバム名, 年代 取得
    title   = getTag(buff, 3, 30);
    artist  = getTag(buff, 33, 30);
    album   = getTag(buff, 63, 30);
    year    = getTag(buff, 93, 4);

    // ID3v1.1
    // コメント, トラック 取得
    if(buff[125] == 0){
      comment = getTag(buff, 97, 28);
      track   = getTag(buff, 126, 1);
      id3.id3Info.version = "1.1";

    // ID3v1.0
    // コメント 取得
    }else{
      comment = getTag(buff, 97, 30);
      id3.id3Info.version = "1.0";
    }
    // ジャンル
    if(buff[127] == 255){
      genre = "";
    }else{
      genre = getTag(buff, 127, 1);
    }

    //返り値に格納
    id3.id3Info.tags = [
      {"NAME":"title"   , "content": _Mp3UtilFunc.deleteSpace(title) },
      {"NAME":"artist"  , "content": _Mp3UtilFunc.deleteSpace(artist) },
      {"NAME":"album"   , "content": _Mp3UtilFunc.deleteSpace(album) },
      {"NAME":"year"    , "content": _Mp3UtilFunc.deleteSpace(year) },
      {"NAME":"comment" , "content": _Mp3UtilFunc.deleteSpace(comment) },
      {"NAME":"track"   , "content": track },
      {"NAME":"genre"   , "content": _Mp3UtilFunc.deleteSpace(genre) }
    ];

    //replayGainの解析
    _Mp3ReplayGainFunc.readReplayGain(id3, file, callback, callback_onReadReplayGain);

  }

  //replayGainの解析が完了したら
  function callback_onReadReplayGain( inID3, inFile, inMainCallBackFunc){
    inMainCallBackFunc(inID3);
    return;
  }


  //バッファを文字列に変換
  function getTag(inBuff, inStartBuff, inTagSize){
    var Iconv     = require('iconv-lite');
    var bufftemp  = new Buffer(inTagSize);
    inBuff.copy(bufftemp, 0, inStartBuff , inStartBuff + inTagSize);
    var conv = Iconv.decode( bufftemp , "Shift_JIS");
    bufftemp = null;
    return conv;
  }

  return {
    read : function (inMp3FilePath,inCallBackFunc){
      _Mp3UtilFileOpenFunc.openFileAndReadBuff(inMp3FilePath , 128, false, inCallBackFunc, callback_readID3v1);
    }
  };


})();    //jQuery Closure
// };          //node.js












//---------------------------------------------------
// id3処理に関する共有処理をまとめたクロージャー
//---------------------------------------------------
var _Mp3UtilFunc = (function(){  //jquery closure
// var _Mp3UtilFunc = new function (){

  var fs        = require('fs');
  var Buffer    = require('buffer').Buffer;


  return {

    //inBuff の inStartBuffからinBuffSize分を取得する。
    getPartOfBuffer : function (inBuff, inStartBuff, inBuffSize){
      var bufftemp  = null;
      bufftemp      = new Buffer(inBuffSize);
      inBuff.copy(bufftemp, 0, inStartBuff , inStartBuff + inBuffSize);
      return bufftemp;
    },

    //id3オブジェクトの値初期化
    getID3ObjectInit : function (){
      return {

        "fileInfo" : {
            "filePath"    : "",
            "fileSize"    : 0
        },

        "id3Info" : {
            "version"     : "",
            "frameSize"   : 0,
            "tags"        : []
        },

        "apeInfo" : {
            "version"     : "",
            "frameSize"   : 0,
            "tags"        : []
        },

        "fileBuffer" : {
            "id3Header"         : "",
            "id3Frame"          : "",
            "elseFrame"         : "",
            "writeNewFileData"  : ""
        }
      };
    },

    //syncsafeとなっている4バイトデータから、id3フレームサイズを計算する。
    getId3Size_onSyncSafe : function ( buffer ) {
      var integer = ( ( buffer[0] & 0x7F ) << 21 ) |
        ( ( buffer[1] & 0x7F ) << 14 ) |
        ( ( buffer[2] & 0x7F ) << 7 ) |
        ( buffer[3] & 0x7F );
      return integer;
    },

    //末尾のスペースを取得
    deleteSpace : function(inStr){
      if(!inStr)return "";
      return inStr.replace(/ +$/i, "").replace(/\u0000+$/g,"");
    },

    //一般的な名称から、対応するID3タグ名を返す。
    getTAG : function(inUseTagName){

      if(!inUseTagName)return undefined;
      var tagDic = {
        "track"     : "TRCK" ,
        "albumTrack": "TPOS" ,
        "year"      : "TYER" ,
        "genre"     : "TCON" ,
        "title"     : "TIT2" ,
        "album"     : "TALB" ,
        "artist"    : "TPE1" ,
        "comment"   : "COMM" ,
        "lyric"     : "USLT" ,
        "jacket"    : "APIC"
      }
      return tagDic[inUseTagName];
    },

    //ジャンルを取得
    getGenre : function(inNo){
      var genreArr = ["Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge", "Hip-Hop", "Jazz", "Metal", "New Age", "Oldies", "Other", "Pop", "R&B", "Rap", "Reggae", "Rock", "Techno", "Industrial", "Alternative", "Ska", "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", "Ambient", "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion", "Trance", "Classical", "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel", "Noise", "AlternRock", "Bass", "Soul", "Punk", "Space", "Meditative", "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic", "Darkwave", "Techno-Industrial", "Electronic", "Pop-Folk", "Eurodance", "Dream", "Southern Rock", "Comedy", "Cult", "Gangsta", "Top 40", "Christian Rap", "Pop/Funk", "Jungle", "Native American", "Cabaret", "New Wave", "Psychadelic", "Rave", "Showtunes", "Trailer", "Lo-Fi", "Tribal", "Acid Punk", "Acid Jazz", "Polka", "Retro", "Musical", "Rock & Roll", "Hard Rock", "Folk", "Folk-Rock", "National Folk", "Swing", "Fast Fusion", "Bebob", "Latin", "Revival", "Celtic", "Bluegrass", "Avantgarde", "Gothic Rock", "Progressive Rock", "Psychedelic Rock", "Symphonic Rock", "Slow Rock", "Big Band", "Chorus", "Easy Listening", "Acoustic", "Humour", "Speech", "Chanson", "Opera", "Chamber Music", "Sonata", "Symphony", "Booty Bass", "Primus", "Porn Groove", "Satire", "Slow Jam", "Club", "Tango", "Samba", "Folklore", "Ballad", "Power Ballad", "Rhythmic Soul", "Freestyle", "Duet", "Punk Rock", "Drum Solo", "A capella", "Euro-House", "Dance Hall"];

      if( inNo < 0 || inNo > genreArr.length-1)return "";
      return genreArr[inNo];
    },

    //id3v2.2のPIC、id3v2.3のAPICの種別(PICとAPICは文字コード、フォーマット、種別、説明文、画像データの順番で格納される)
    getPicType : function (index){
      var PIC_TYPE = ["Other","32x32 pixels 'file icon' (PNG only)","Other file icon","Cover (front)","Cover (back)","Leaflet page","Media (e.g. lable side of CD)","Lead artist/lead performer/soloist","Artist/performer","Conductor","Movie/video screen capture","A bright coloured fish","Illustration","Band/artist logotype","Publisher/Studio logotype","Band/Orchestra","Composer","Lyricist/text writer","Recording Location","During recording","During performance"];
      return PIC_TYPE[index];
    },

    // id3v2.3のタグに該当する説明を取得
    getIDv2_3TagCap : function (inTagName){
      if(!inTagName)return undefined;
      var TAGS = {
        "AENC": "Audio encryption",
        "APIC": "Attached picture",
        "COMM": "Comments",
        "COMR": "Commercial frame",
        "ENCR": "Encryption method registration",
        "EQUA": "Equalization",
        "ETCO": "Event timing codes",
        "GEOB": "General encapsulated object",
        "GRID": "Group identification registration",
        "IPLS": "Involved people list",
        "LINK": "Linked information",
        "MCDI": "Music CD identifier",
        "MLLT": "MPEG location lookup table",
        "OWNE": "Ownership frame",
        "PRIV": "Private frame",
        "PCNT": "Play counter",
        "POPM": "Popularimeter",
        "POSS": "Position synchronisation frame",
        "RBUF": "Recommended buffer size",
        "RVAD": "Relative volume adjustment",
        "RVRB": "Reverb",
        "SYLT": "Synchronized lyric/text",
        "SYTC": "Synchronized tempo codes",
        "TALB": "Album",
        "TBPM": "BPM",
        "TCOM": "Composer",
        "TCON": "Genre",
        "TCOP": "Copyright message",
        "TDAT": "Date",
        "TDLY": "Playlist delay",
        "TENC": "Encoded by",
        "TEXT": "Lyricist",
        "TFLT": "File type",
        "TIME": "Time",
        "TIT1": "Content group description",
        "TIT2": "Title",
        "TIT3": "Subtitle",
        "TKEY": "Initial key",
        "TLAN": "Language(s)",
        "TLEN": "Length",
        "TMED": "Media type",
        "TOAL": "Original album",
        "TOFN": "Original filename",
        "TOLY": "Original lyricist",
        "TOPE": "Original artist",
        "TORY": "Original release year",
        "TOWN": "File owner",
        "TPE1": "Artist",
        "TPE2": "Band",
        "TPE3": "Conductor",
        "TPE4": "Interpreted, remixed, or otherwise modified by",
        "TPOS": "Part of a set",
        "TPUB": "Publisher",
        "TRCK": "Track number",
        "TRDA": "Recording dates",
        "TRSN": "Internet radio station name",
        "TRSO": "Internet radio station owner",
        "TSIZ": "Size",
        "TSRC": "ISRC (international standard recording code)",
        "TSSE": "Software/Hardware and settings used for encoding",
        "TYER": "Year",
        "TXXX": "User defined text information frame",
        "UFID": "Unique file identifier",
        "USER": "Terms of use",
        "USLT": "Unsychronized lyric/text transcription",
        "WCOM": "Commercial information",
        "WCOP": "Copyright/Legal information",
        "WOAF": "Official audio file webpage",
        "WOAR": "Official artist/performer webpage",
        "WOAS": "Official audio source webpage",
        "WORS": "Official internet radio station homepage",
        "WPAY": "Payment",
        "WPUB": "Publishers official webpage",
        "WXXX": "User defined URL link frame",

        "TDRC": "id3v4 year"
      }

      return TAGS[inTagName];
    },

  };

})();    //jQuery Closure
// };          //node.js
















//---------------------------------------------------
// ファイル読み込み処理をまとめたクロージャー
//---------------------------------------------------
var _Mp3UtilFileOpenFunc = (function(){  //jquery closure
// var _Mp3UtilFileOpenFunc = new function (){


  //ファイルを開く
  //inFile ：ファイルパス , inReadBuffSize :読み込むバッファサイズ , isReadPositionIsHead :バッファの先頭から読み込むか？(falseなら末尾から読み込み) ,inMainCallBackFunc :メイン関数から渡ってきた、最後に実行するコールバック , inCallBack_onReadBuff: バッファの読み込み後に実行するコールバック
  function openFileAndReadBuff(inFile, inReadBuffSize, isReadPositionIsHead ,inMainCallBackFunc, inCallBack_onReadBuff){

    var file      = inFile;
    var callback  = inMainCallBackFunc;
    var fs        = require('fs');
    var stat;
    var fileSize;
    var id3       = _Mp3UtilFunc.getID3ObjectInit();

    //ファイルサイズを調べる
    stat                  = fs.statSync(file);
    fileSize              = stat.size;
    stat                  = null;
    id3.fileInfo.fileSize = fileSize;
    id3.fileInfo.filePath = inFile;

    //ファイルを開く
    console.dir("ファイルを開きます。filePath:"+file);
    fs.open(file,'r', function(err,fd){

      if(err){
        console.dir("ファイルを開けませんでした。" + err);
        callback(id3);
        return;
      }

      if(fileSize-inReadBuffSize < 0){
        console.dir("ファイルサイズが小さすぎる為、mp3ファイルとして開けません。");
        callback(id3);
        return;
      }



      callback_readBuffer(file, fd, id3, inReadBuffSize, isReadPositionIsHead, callback, inCallBack_onReadBuff);
    });
  }


  //開いたファイルのバッファを読み込む
  function callback_readBuffer(inFile, inFd, inID3, inReadBuffSize, isReadPositionIsHead, inMainCallBackFunc, inCallBack_onReadBuff){

    var file        = inFile;
    var callback    = inMainCallBackFunc;
    var id3         = inID3;
    var Buffer      = require('buffer').Buffer;
    var fs          = require('fs');

    var id3v1Frame  = new Buffer(inReadBuffSize);
    var fileSize    = id3.fileInfo.fileSize;
    var readBuffPosition = isReadPositionIsHead ? 0 : fileSize -inReadBuffSize;


    fs.read(inFd, id3v1Frame, 0, inReadBuffSize, readBuffPosition , function(err, bytesRead, buff){

      if(err){
        console.dir("ファイルのバッファを読み込めませんでした。" + err);
        callback(id3);
        return;
      }

      inCallBack_onReadBuff(file, id3, buff, inFd, callback);
      // callback_readID3v1(id3, buff, callback);
    });
  }


  return {
    openFileAndReadBuff : function (inFile, inReadBuffSize, isReadPositionIsHead ,inMainCallBackFunc, inCallBack_onReadBuff){

      openFileAndReadBuff(inFile, inReadBuffSize, isReadPositionIsHead ,inMainCallBackFunc, inCallBack_onReadBuff);
    }
  };

})();    //jQuery Closure
// };          //node.js




//---------------------------------------------------
// ReplayGainの読み込み処理をまとめたクロージャー
//---------------------------------------------------
var _Mp3ReplayGainFunc = (function(){  //jquery closure
// var _Mp3ReplayGainFunc = new function (){

  var backupID3;            //id3をバックアップ
  var internalCallBackFunc; //このクロージャーの処理が完了したときに呼び出すコールバック

  //バッファを開く
  function readReplayGain(inID3, inFile, inReadBuffSize, isReadPositionIsHead ,inMainCallBackFunc, inInternalCallBackFunc){

    backupID3 = inID3;                              //このクロージャーを通す前に、id3を保存(_Mp3UtilFileOpenFunc.openFileAndReadBuffで初期化されてしまう為)
    internalCallBackFunc = inInternalCallBackFunc;  //このクロージャーの処理が完了したときのコールバック

    _Mp3UtilFileOpenFunc.openFileAndReadBuff(inFile, inReadBuffSize, isReadPositionIsHead ,inMainCallBackFunc, callback_readReplayGain);
  }

  //バッファを解析する。
  function callback_readReplayGain( infile, inID3, inBuff, inFd, inMainCallBackFunc){

    // var id3       = inID3;   //初期化されたid3なので使用しない。backupID3を使用する
    var buff          = inBuff;
    var callback      = inMainCallBackFunc;
    var Buffer        = require('buffer').Buffer;
    var mainCallback  = inMainCallBackFunc;

    //使い回しする変数
    var tagSize       = 0;
    var tagLength     = 0;
    var readPos       = 0;
    var s1;
    var s2;
    var s3;
    var s4;
    var tagName = "";
    var tagData = "";
    var i = 0;

    //APEv1 ,v2　共通のフッターを取得 (32byte)
    if( buff.toString('ascii', buff.length-160, buff.length-160 + 8) == "APETAGEX"){
      readPos = 160;
    }else if(buff.toString('ascii', buff.length-32, buff.length-32 + 8) == "APETAGEX"){
      readPos = 32;
    }else{
      console.log("ReplayGainは検出できませんでした。");
      internalCallBackFunc(backupID3, infile, mainCallback);
      return;
    }

    //APETAGEXのフレームサイズを取得
    s1 = buff[ buff.length-readPos +8 +4 ];
    s2 = buff[ buff.length-readPos +8 +5 ];
    s3 = buff[ buff.length-readPos +8 +6 ];
    s4 = buff[ buff.length-readPos +8 +7 ];
    tagSize = s1 + s2*Math.pow(16,2) + s3*Math.pow(16,4) + s4*Math.pow(16,6);
    backupID3.apeInfo.frameSize = tagSize;

    //APETAGEXデータの先頭位置を取得
    var apetag_head_position =  buff.length-readPos-tagSize;

    //APETAGEXの持っているタグ数を取得
    s1 = buff[ buff.length-readPos +8 +4 +4 ];
    s2 = buff[ buff.length-readPos +8 +4 +5 ];
    s3 = buff[ buff.length-readPos +8 +4 +6 ];
    s4 = buff[ buff.length-readPos +8 +4 +7 ];
    tagLength = s1 + s2*Math.pow(16,2) + s3*Math.pow(16,4) + s4*Math.pow(16,6);

    //APEv2　ヘッダーを取得。(32byte) ない場合はAPEv1となる。(ヘッダーが無いだけで形式は変わらない)
    if( buff.toString('ascii', apetag_head_position, apetag_head_position + 8) == "APETAGEX"){
      readPos = apetag_head_position + 32;
      backupID3.apeInfo.version = "APEv2";
    }else{
      readPos = apetag_head_position;
      backupID3.apeInfo.version = "APEv1";
    }


    // APETAGEXのタグ数だけループ
    for(var n=0; n<tagLength; n++){
      //APEタグを取得
      //タグサイズを取得
      s1 = buff[ readPos ];
      s2 = buff[ readPos +1 ];
      s3 = buff[ readPos +2 ];
      s4 = buff[ readPos +3 ];
      tagSize = s1 + s2*Math.pow(16,2) + s3*Math.pow(16,4) + s4*Math.pow(16,6);

      readPos += 8;
      tagName = "";
      i=0;

      while( buff[readPos+i] != 0 ){
        tagName += buff.toString('ascii', readPos+i , readPos+i+1 );
        i++;
        if(i>100){
          console.log("APEタグが正常に取得できませんでした。");
          break;
        }
      }

      //タグの内容を取得
      tagData = buff.toString('ascii', readPos+i+1 , readPos+i+1 +tagSize );

      // console.log("APE tagName: " + tagName + " / tagData: " + tagData);
      backupID3.apeInfo.tags.push({
        "NAME"    : tagName,
        "SIZE"    : tagSize,
        "content" : tagData
      });

      //次の読み出し位置をセット
      readPos += i+1+tagSize;
    }

    //処理の完了。次の処理を呼び出す。
    internalCallBackFunc(backupID3, infile, mainCallback);
    return;
  }


  return {
    readReplayGain : function (inID3, inFile, inMainCallBackFunc, inInternalCallBackFunc){
      //ファイル内すべてのバッファを開く
      readReplayGain(inID3, inFile, Number(inID3.fileInfo.fileSize), true, inMainCallBackFunc, inInternalCallBackFunc);
    }
  };

})();    //jQuery Closure
// };          //node.js





//---------------------------------------------------------------------------------------------------------
//
// 　メイン実行関数 (nodeから単体実行)
//
//---------------------------------------------------------------------------------------------------------
//
// _ID3v2_3Reader.read( "./mp3/edit test/v2.4.MP3" , function(id3){
// _ID3v2_3Reader.read( "./mp3/edit test/v2.4.MP3" , function(id3){
//   console.log(id3);
//   console.log("tag:");
//   console.log(id3.id3Info.tags);
// });


// _ID3v2_3Writer.writeTag("./mp3/ジャケット画像入り/v2.3.MP3", "./mp3/ジャケット画像入り/v1.0.MP3" ,
//     [
//       {"tag": "track", "dat":"1"},
//       {"tag": "title", "dat":"望郷おとこ笠"},
//       {"tag": "comment", "dat":"コメント欄です","lang":"jpn"},
//       {"tag": "album", "dat":"望郷おとこ笠"},
//       {"tag": "year", "dat":"2015/07/22"},
//       {"tag": "genre", "dat":"演歌男"},
//       {"tag": "artist", "dat":"三門忠司"},
//       {"tag": "lyric", "dat":"歌詞データ","lang":"jpn"}
//       //\r\n：改行
//       // {"tag": "jacket", "dat":"*****", "format":"jpeg"} //"png"
//     ],
//     function (id3){
//       if(id3 == null){
//         console.log("error");
//       }else{
//         console.log(id3);
//       }
//     }
// );

