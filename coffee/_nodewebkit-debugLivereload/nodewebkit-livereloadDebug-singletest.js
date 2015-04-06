// node-webkit用のlivereload。
// div.debugNodeWebkit-LivereloadMessageに更新までの残り時間を表示
var _gulp = require('gulp');
var _reloadTimer = undefined;
var _maxCnt   = 3;
var _nowCnt = _maxCnt;

function timerComp(){
  window.location.reload();
}


function startTimer(){
  clearTimeout(_reloadTimer);
  _reloadTimer = setTimeout("timerCountUp()",1000);
  $(".debugNodeWebkit-LivereloadMessage").text("livereload: "+_nowCnt+" sec");
}


function timerCountUp(){
  _nowCnt--;
  $(".debugLivereload").text("livereload: "+_nowCnt+" sec");
  if(_nowCnt > 0){
    startTimer();
  }else{
    timerComp();
  }
}


_gulp.task('reload', function () {
  if (window.location){
    _nowCnt = _maxCnt;
    startTimer();
  }
});

_gulp.watch(['./src/coffee/**/*','test.html'], ['reload']);