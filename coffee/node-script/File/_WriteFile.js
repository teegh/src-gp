//---------------------------
// ファイルを書き込む
//---------------------------
var _WriteFile = (function(){//jquery closure

    var fs         = require("fs");
    var mkdirp     = require("mkdirp");
    var getDirName = require("path").dirname;

    //ファイルを保存する。指定先のディレクトリがなければ作成する。
    return {
        //ストリングからファイルを書き出す
        write : function (path, contents, cb) {
          mkdirp(getDirName(path), function (err) {
            if (err) return cb(err);
            fs.writeFile(path, contents, cb);
          })
        },
        //バッファからファイルを書き出す
        writeFromBuffer : function (path, inBuff, cb) {
          mkdirp(getDirName(path), function (err) {
            if (err) return cb(err);
            fs.open(path, "w", function(err,fd){
                if (err) return cb(err);
                fs.write(fd, inBuff, 0, inBuff.length, 0, function(err){
                    if (err) return cb(err);
                    fs.close(fd, function() {
                        // console.log('_WriteFile file closed!');
                        
                        cb(null);
                    });
                });
            });
          })
        }
        
    }
    
})();//jQuery Closure
