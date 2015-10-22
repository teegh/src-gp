//ファイルの復号化と暗号化 (promise対応だが、部分的に同期処理となっている)
//cipher.updateを非同期に処理できるのであれば作り変える。
// _WriteFile.jsを使う
var _CryptAsync = (function(){//jquery closure

    ////http://lollyrock.com/articles/nodejs-encryption/
    var fs  = require("fs");
    var Promise = require('bluebird');
    
    // Nodejs encryption with CTR
    var crypto = require('crypto'),
        algorithm = 'aes-256-ctr',      //デフォルトの暗号化方式
        password = 'password';

    fs     = Promise.promisifyAll(fs);
    crypto = Promise.promisifyAll(crypto);

    //入力されたバッファーを暗号化
    function encrypt(buffer){
        _ProcessTimeINST.startTimerINSTL();
        var cipher = crypto.createCipher(algorithm,password);
        //cipher.updateが同期処理となり、他の処理を止めてしまう
        var crypted = Buffer.concat([cipher.update(buffer),cipher.final()]);
        return crypted;
    }
    
    //入力されたバッファーを復号化
    function decrypt(buffer){
        var decipher = crypto.createDecipher(algorithm,password)
        var dec = Buffer.concat([decipher.update(buffer) , decipher.final()]);
        return dec;
    }

    //入力されたバッファをもとにファイルを書き出す
    function fileSaveContents( filename , inBuff , inCallBackFunc){
        var fd = fs.openSync(filename, "w");
        fs.writeSync(fd, inBuff, 0, inBuff.length, 0);
        fs.closeSync(fd);
        inCallBackFunc();
    };

    //入力されたファイルを暗号化
    function encryptFromFilePath(inFilePath, inDestFile , inCallBackFunc){
        fs.readFileAsync(inFilePath).then(function (data) {
            var hw = encrypt(data);
            fileSaveContents(inDestFile, hw , inCallBackFunc);
            // console.log("_CryptAsync close complete!!");
        });
    }
    
    //入力されたファイルを復号化し、ファイルに書き込み
    function decryptFromFilePath(inFilePath, inDestFile , inCallBackFunc){
        fs.readFileAsync(inFilePath).then(function (data) {
            var dhw = decrypt(data);
            fileSaveContents(inDestFile, dhw , inCallBackFunc);
            // console.log("decrypt complete!!");
        });
    }
    
    //入力されたファイルを復号化し、バッファとして返す
    function decryptBuffFromFilePath(inFilePath, inCallBackFunc){
        fs.readFileAsync(inFilePath).then(function (data) {
            var dhw = decrypt(data);
            inCallBackFunc(dhw);
        });
    }
    

    //入力されたファイルを暗号化
    function encryptFile(inFilePath, inDestFile , inCallBackFunc){
        Promise.resolve()
        .then(function(){
            return Promise.all([
                new Promise(function(fulfilled, rejected){
                    setTimeout(function() {
                        encryptFromFilePath(inFilePath,inDestFile,function(){
                            fulfilled();
                        });
                    }, 100);
                })
            ]);
        }).then(function(){
            return new Promise(function(fulfilled, rejected){
                // console.log("_CryptAsync encrypto callback!!");
                inCallBackFunc();
                fulfilled();
            });
        });
    }
    
    //入力されたファイルを復号化
    function decryptFile(inFilePath, inDestFile , inCallBackFunc){
        Promise.resolve()
        .then(function(){
            return Promise.all([
                new Promise(function(fulfilled, rejected){
                    setTimeout(function() {
                        decryptFromFilePath(inFilePath,inDestFile,function(){
                            fulfilled();
                        });
                    }, 100);
                })
            ]);
        }).then(function(){
            return new Promise(function(fulfilled, rejected){
                // console.log("_CryptAsync encrypto callback!!");
                inCallBackFunc();
                fulfilled();
            });
        });
    }
    
    //入力されたファイルを復号化し、コールバックにバッファを返す
    function decryptFileToBuffer(inFilePath, inCallBackFunc){
        Promise.resolve()
        .then(function(){
            return Promise.all([
                new Promise(function(fulfilled, rejected){
                    setTimeout(function() {
                        decryptBuffFromFilePath(inFilePath,function(inBuff){
                            inCallBackFunc(inBuff);
                            fulfilled();
                        });
                    }, 100);
                })
            ]);
        });
    }
    
    
    return {
        //設定
        setting : function(inPassword, inAlgorithm){
            algorithm = inAlgorithm;
            password = inPassword;
        },
        //入力されたファイルを暗号化
        encryptFile : function(inFilePath, inDestFile , inCallBackFunc){
            encryptFile(inFilePath, inDestFile , inCallBackFunc);
        },
        //入力されたファイルを復号化
        decryptFile : function(inFilePath, inDestFile , inCallBackFunc){
            decryptFile(inFilePath, inDestFile , inCallBackFunc);
        },
        //入力されたファイルを復号化し、コールバックにバッファを返す
        decryptFileToBuffer : function(inFilePath, inCallBackFunc){
            decryptFileToBuffer(inFilePath, inCallBackFunc);
        }
        
    };
    
})();//jQuery Closure