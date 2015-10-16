//---------------------------
// ファイルを書き込む
//---------------------------
var _WriteFile = (function(){//jquery closure

    var fs         = require("fs");
    var mkdirp     = require("mkdirp");

    //ファイルを保存する。指定先のディレクトリがなければ作成する。
    return {
        write : function (path, contents, cb) {
          mkdirp(getDirName(path), function (err) {
            if (err) return cb(err)
            fs.writeFile(path, contents, cb)
          })
        }
    }
    
})();//jQuery Closure