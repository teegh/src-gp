//ID3v2 2.3のタグ読み込みと書き込み
//他のバージョンも最低限読み込めるようにする。

var _ID3Reader = new (function(){

  var fs        = require('fs');
  var Buffer    = require('buffer').Buffer;
  var Iconv     = require('iconv').Iconv; //npm
  var jschardet = require('jschardet');   //npm

  // Credits to esailja //
  var self = this;

  var PIC_TYPE = ["Other","32x32 pixels 'file icon' (PNG only)","Other file icon","Cover (front)","Cover (back)","Leaflet page","Media (e.g. lable side of CD)","Lead artist/lead performer/soloist","Artist/performer","Conductor","Movie/video screen capture","A bright coloured fish","Illustration","Band/artist logotype","Publisher/Studio logotype","Band/Orchestra","Composer","Lyricist/text writer","Recording Location","During recording","During performance"];
  var GENRES = ["Blues","Classic Rock","Country","Dance","Disco","Funk","Grunge","Hip-Hop","Jazz","Metal","New Age","Oldies","Other","Pop","R&B","Rap","Reggae","Rock","Techno","Industrial","Alternative","Ska","Death Metal","Pranks","Soundtrack","Euro-Techno","Ambient","Trip-Hop","Vocal","Jazz+Funk","Fusion","Trance","Classical","Instrumental","Acid","House","Game","Sound Clip","Gospel","Noise","AlternRock","Bass","Soul","Punk","Space","Meditative","Instrumental Pop","Instrumental Rock","Ethnic","Gothic","Darkwave","Techno-Industrial","Electronic","Pop-Folk","Eurodance","Dream","Southern Rock","Comedy","Cult","Gangsta","Top 40","Christian Rap","Pop/Funk","Jungle","Native American","Cabaret","New Wave","Psychadelic","Rave","Showtunes","Trailer","Lo-Fi","Tribal","Acid Punk","Acid Jazz","Polka","Retro","Musical","Rock & Roll","Hard Rock","Folk","Folk-Rock","National Folk","Swing","Fast Fusion","Bebob","Latin","Revival","Celtic","Bluegrass","Avantgarde","Gothic Rock","Progressive Rock","Psychedelic Rock","Symphonic Rock","Slow Rock","Big Band","Chorus","Easy Listening","Acoustic","Humour","Speech","Chanson","Opera","Chamber Music","Sonata","Symphony","Booty Bass","Primus","Porn Groove","Satire","Slow Jam","Club","Tango","Samba","Folklore","Ballad","Power Ballad","Rhythmic Soul","Freestyle","Duet","Punk Rock","Drum Solo","A capella","Euro-House","Dance Hall"];
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
    "WXXX": "User defined URL link frame"
  };
  //syncsafe値からid3フレームサイズを取得
  function id3Size( buffer ) {
    var integer = ( ( buffer[0] & 0x7F ) << 21 ) |
        ( ( buffer[1] & 0x7F ) << 14 ) |
        ( ( buffer[2] & 0x7F ) << 7 ) |
        ( buffer[3] & 0x7F );
    return integer;
  }

  var special_tags = {
    'APIC':function(raw){
      var frame = {
        txt_enc : raw.readUInt8(0)
      }
      var pos = raw.toString('ascii',1,(raw.length < 24)?raw.length:24).indexOf('\0');
      frame.mime = raw.toString('ascii',1,pos+1);
      pos += 2;
      frame.type = PIC_TYPE[raw.readUInt8(pos++)] || 'unknown';
      var desc = raw.toString('ascii',pos,pos+64); // Max 64 char comment
        var desc_pos = desc.indexOf('\0');
      frame.desc = desc.substr(0,desc_pos);
      pos +=  desc_pos + 1 ;// /0 is the last character which wont be counted xP
      frame.img = fs.writeFileSync('temp.'+frame.mime.split('/')[1],raw.slice(pos,raw.length),'binary'); // Replace the art with unique ID .
      return frame;
    },
    'TRCK':function(raw){
      // return raw.toString('ascii').replace(/\u0000/g,'') * 1;
      return raw.toString('ascii').replace(/\u0000/g,'');
    },
    'TYER':function(raw){
      // return raw.toString('ascii').replace(/\u0000/g,'') *1;
      return raw.toString('ascii').replace(/\u0000/g,'');
    }
  }
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
            buf2 = new Buffer(3);
            raw_tags.copy(buf2, 0, pos+10 , pos+10+3);
            //データに1FEが含まれる時、UTF16LEでボディが格納されている
            if((buf2[0]==1)&&(buf2[1]==255)&&(buf2[2]==254))isUTF16 = true;
          }

          //BOMつきUTF-16の場合の解析
          // UTF-16 -> utf8へ変換
          if(isUTF16){
            TAG.content = raw_tags.toString('utf16le', pos+10+3, pos+10+TAG.SIZE);

          //SHIFT-JISの場合の解析
          // SHIFT-JIS -> utf8 へ変換
          }else{
            buf2 = new Buffer(TAG.SIZE-1);
            raw_tags.copy(buf2, 0, pos+10+1 , pos+10+TAG.SIZE);

            iconv = new Iconv('SHIFT_JIS', 'UTF-8');
            conv = iconv.convert(buf2);
            TAG.content = String(conv);
          }

          //コメントと歌詞は3バイト分が言語、4バイト目が0x00となっている。
          if(TAG.NAME == "COMM" || TAG.NAME == "USLT"){
            TAG.LANG = TAG.content.slice(0,3);
            TAG.content = TAG.content.slice(4);
          }
        }


      }
      if( TAGS[TAG.NAME] !== undefined && TAG.NAME !== 'PRIV'){
        parsed_tags.push(TAG);
      }
      pos += (10+TAG.SIZE);
    }
    callback(parsed_tags);
  };

  //一般的な名称から、対応するID3タグ名を返す。
  function getTAG(inUseTagName){
    var tagDic = [
      {useTagName:"track",tagName:"TRCK"},
      {useTagName:"albumTrack",tagName:"TPOS"},
      {useTagName:"year",tagName:"TYER"},
      {useTagName:"genre",tagName:"TCON"},
      {useTagName:"title",tagName:"TIT2"},
      {useTagName:"album",tagName:"TALB"},
      {useTagName:"artist",tagName:"TPE1"},
      {useTagName:"comment",tagName:"COMM"},
      {useTagName:"lyric",tagName:"USLT"},
      {useTagName:"jacketImage",tagName:"APIC"}
    ];
    for(var i=0; i<tagDic.length; i++){
      if(tagDic[i].useTagName == inUseTagName){
        return tagDic[i].tagName;
      }
    }
    return "";
  }
  /*
   * @API - PUBLIC
  */






  //---------------------------------------------------
  // タグ解析
  //---------------------------------------------------

  //ID3フレーム以降のデータを抽出
  function setElseFrame(fd, inID3, inElseFrameSize, inStartPosition, inCallBackFn){

    var elseFrame;

    elseFrame = new Buffer(inElseFrameSize);  //バッファを作成
    fs.read(fd, elseFrame, 0, inElseFrameSize, inStartPosition, function(err,bytesRead,buff){

      //ID3以降のフレームを変数id3に保持
      inID3.elseFrame = {
        "size" : inElseFrameSize ,
        "binary" : elseFrame
      };

      inCallBackFn();
    });
  }


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
      tagName = getTAG(inWriteDataObj[i].tag);
      if(tagName != ""){

        wpos = 0;

        //タグの内容
        //入力される文字セットの判定後、asciiかUTF-16LEで入力
        detectResult = jschardet.detect(inWriteDataObj[i].dat); //タグの文字セットを取得

        if(detectResult.encoding == "ascii"){
          iconv = new Iconv('utf-8', 'SHIFT_JIS');
          buffer = iconv.convert(inWriteDataObj[i].dat);
        }else{
          iconv = new Iconv('utf-8', 'UTF-16LE');
          buffer = iconv.convert(inWriteDataObj[i].dat);
        }

        //タグ名
        iconv = new Iconv('ascii', 'ascii');
        tagBuffer = iconv.convert(tagName);

        //タグサイズとその他の領域
        tagSizeBuffer = new Buffer((detectResult.encoding == "ascii" ? 7 : 9) + (tagName ==　"COMM" || tagName ==　"USLT" ? 4 : 0) );
        tagSizeBuffer.writeUInt32BE(buffer.length+1 + (detectResult.encoding == "ascii" ? 0 : 2) + (tagName ==　"COMM" || tagName ==　"USLT" ? 4 : 0) ,0); //タグのフレームサイズ
        tagSizeBuffer[4] = 0;
        tagSizeBuffer[5] = 0;
        tagSizeBuffer[6] = detectResult.encoding == "ascii" ? 0 : 1;  //asciiかutf-16leを判定するコード

        wpos = 6;
        if(detectResult.encoding != "ascii"){  //utf-16leで入力する場合はFFFEを追加
          tagSizeBuffer[wpos+1] = 255; //FF
          tagSizeBuffer[wpos+2] = 254; //FE
          wpos = 8;
        }
        //コメントや歌詞については、言語名を入れる。
        if(tagName ==　"COMM" || tagName ==　"USLT"){

          //言語名を入れる　文字列をasciiコードに変換し、数値を8bitに書き込む
          tagSizeBuffer.writeUInt8(inWriteDataObj[i].lang.charCodeAt(0), wpos + 1);
          tagSizeBuffer.writeUInt8(inWriteDataObj[i].lang.charCodeAt(1), wpos + 2);
          tagSizeBuffer.writeUInt8(inWriteDataObj[i].lang.charCodeAt(2), wpos + 3);

          tagSizeBuffer[wpos + 4] = 0x00; //.
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
    inID3.id3Frame = {
      "size" : temp_ID3Size,
      "binary" : id3FrameBuffer
    };

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



  //ID3フレームサイズを計算し、ヘッダーに上書き
  function setID3FrameFize(inID3, inCallBackFn){

    var m1, m2, m3, m4;
    var temp_id3Size_syncSafe;
    var id3HeaderBuffer;
    var temp_ID3Size;

    temp_ID3Size = inID3.id3Frame.size;

    //ID3フレームのサイズ(syncsafe)を計算
    id3SizeBuffer = new Buffer(4);

    m1 = temp_ID3Size & 0x0000007F;
    m2 = temp_ID3Size & 0x00003F80;
    m3 = temp_ID3Size & 0x001FC000;
    m4 = temp_ID3Size & 0x0FE00000;
    temp_id3Size_syncSafe = m1 + (m2 << 1) + (m3 << 2) + (m4 << 3);

    id3SizeBuffer.writeUInt32BE(temp_id3Size_syncSafe , 0);

    id3HeaderBuffer = new Buffer(10);
    inID3.head.binary.copy(id3HeaderBuffer,0);
    id3SizeBuffer.copy(id3HeaderBuffer,6);

    inID3.binary = id3HeaderBuffer;

    //コールバック
    inCallBackFn();
  }



  //各バッファーの結合後にファイルの書き出し
  function outputMP3(id3HeaderBuffer, id3FrameBuffer, id3ElseFrameBuffer, infilePath, inCallBackFn){
    //バッファの結合
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




  //id3の読み込み
  self.read = function (file,_callback){
    var callback = _callback;

    var id3 = {};
    var header ;
    var stat;
    var fileSize;
    var raw_tags;

    //ファイルを開く
    fs.open(file,'r',function(err,fd){
      if(err){
        console.dir(err);
        return;
      }
      id3       = {};
      header    = new Buffer(10);
      stat      = fs.statSync(file);
      fileSize  = stat.size;
      stat      = null;

      fs.read(fd,header,0,10,0,function(err,bytesRead,buff){
        if( buff.toString('ascii',0,3) != 'ID3'){
          console.log("このファイルは id3v2 ではありません。");
          return;
        }
        if( !(buff[3] == 3 && buff[4] == 0)){
          console.log("このファイルは id3v2 3.0 以外のID3規格であるため、開けません。");
          return;
        }

        //開いたmp3ファイルのサイズ
        id3.body = {
          size:fileSize
        };

        //ID3ヘッダーの情報
        id3.head = {
          ver:'2.'+buff.readUInt8(3)+'.'+buff.readUInt8(4), //ID3バージョン
          size:10,                                          //ID3フレームのサイズ
          binary: buff                                      //ID3のデータ
        };
        id3.id3Frame ={
          size : id3Size(buff.slice(6,10))
        };

        //ID3フレーム　各タグの解析
        if(id3.id3Frame.size > 0){
          raw_tags = new Buffer(id3.id3Frame.size);
          fs.read(fd,raw_tags,0,id3.id3Frame.size,null,function(){
            fs.close(fd,function(){
              parseTags( raw_tags,function(parsed_tags){
                id3.tags = parsed_tags;
                callback(id3);
              });
            });
          });
        }else{
          console.log("id3v2 3.0 フレームのデータがありません。");
          return;
        }


      });
    });
  }




  //id3の書き込み
  //self.readのコールバック関数で、タグの解析や書き込み処理を行う。
  self.writeTag = function (inOpenFile, inOutFile, writeDataObj , inCompleteFn){

    var complete_callBackFn = inCompleteFn;

    //ヘッダーを抽出
    self.read(inOpenFile,
      function(id3){
        //読み込みが完了したら、writeDataObjでタグを書き込む。

        //ヘッダーを抽出　(readメソッドで抽出済)
        // id3.head.binary

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
            setID3FrameFize(id3, nxFn_outputMP3);
          }

          var nxFn_outputMP3 = function (inID3Size, inId3FrameBuffer){
            console.log("3. ID3FrameSize get Success !!");
            // バッファを結合して、ファイルを書き出し
            outputMP3(id3.head.binary, id3.id3Frame.binary, id3.elseFrame.binary, inOutFile, completeFn);
          }

          var completeFn = function(){
            console.log("1 + 2 +3 writeFile Success !!");
            complete_callBackFn(id3);
          }

          //ID3フレーム以降のデータを抽出
          setElseFrame(fd ,
              id3 ,
              id3.body.size - (id3.id3Frame.size + id3.head.size) ,
              id3.id3Frame.size + id3.head.size ,
              nxFn_setID3Frame);
        });


      }
    );
  }


  return {
    read : function (inMp3FilePath, inCallBackFunc){
      self.read(inMp3FilePath , inCallBackFunc);
    },
    writeTag : function(inOpenFilePath, inWriteFilePath, inWriteData, inCallBackFunc){
      self.writeTag(inOpenFilePath, inWriteFilePath, inWriteData, inCallBackFunc);
    }
  };


})();




// 使用例
_ID3Reader.read( "./mp3/edit test/test.mp3" , function(id3){console.log(id3)} );

// //デスクトップパス取得
// var nodePath = require("path");
// var dir_home = process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];
// var outpath = nodePath.join(dir_home, "Desktop", "out.mp3");
// nodePath = null;
// dir_home = null;

// _ID3Reader.writeTag("./mp3/edit test/test.mp3", outpath ,
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
//       // {"tag": "jacketImage", "dat":"*****"}
//     ],
//     function (id3){console.log(id3);}
// );