//複数の要素を選択状態(cssの見た変更)にする制御

//Shiftやctrlを押しながらクリック(mousedown)を行った時の複数選択動作もサポート
//addBehavior()とenableKey()で事前に初期設定しておく必要あり。

//[htmlの記述例]
//選択要素とする要素の例：
//　a.dragConfilm#result0
//　a.dragConfilm#result1
//　...
//　a.dragConfilm#resultn
//選択状態の要素には.selectedItemが追加される。

//依存
//_DragFile.js (ドラッグ処理を行うならば)
var _MultiSelect = (function() {
    //---------------------------------
    // 選択状態の制御
    //---------------------------------
    var _sel_st_id = 0;      //基準となる選択状態の項目id番号
    var _selected_Arr = [];  //選択状態となっているid　を管理する配列
    var _isEnable_shiftKey = true;  //shiftキーの制御を有効にする
    var _isEnable_ctrlKey = true;  //ctrlキーの制御を有効にする


    //制御する要素を指定する。
    function addBehaviorDo(inTargetElement){
        $(document).on("mousedown", inTargetElement, function(){
            // $(".debugTemp2").html("クリック時のキーイベント： C:" + _KeyDown.isPress_ctrl() + " / S:" + _KeyDown.isPress_shift() + " / Code:" + _KeyDown.pressKey());

            var sel_id = $(this).attr("id").replace("result","") - 0 ;  //選択された項目のid 数値に型変換
            var testMEs = "";

            //選択状態の判定
            if(_isEnable_shiftKey && _KeyDown.isPress_shift() && !_KeyDown.isPress_ctrl()){
                //shift押
                unSelected(_selected_Arr);
                testMEs = sequentialNumber(sel_id,_sel_st_id).toString();
                selected(sequentialNumber(sel_id,_sel_st_id));
            }else if(_isEnable_ctrlKey && !_KeyDown.isPress_shift() && _KeyDown.isPress_ctrl()){
                //ctrl押
                _sel_st_id = sel_id;
                state_inverce([sel_id]);
            }else if(!_KeyDown.isPress_shift() && !_KeyDown.isPress_ctrl()){
                //通常クリック　(shift・ctrl離)
                _sel_st_id = sel_id;
                unSelected(_selected_Arr);
                selected([sel_id]);
            }else{
                //上記以外
                _sel_st_id = sel_id;
                unSelected(_selected_Arr);
                selected([sel_id]);
            }

            //選択されているid番号の配列を_DragFileに保存。ドラッグ処理で使う。
            _DragFile.setDragFile(_selected_Arr);
        });
    }

    //指定された２つの値から連番を生成する。返り値は配列
    function sequentialNumber(inNum1,inNum2){
        var num1 = inNum1 - 0;  //文字列であっても数値に型変換
        var num2 = inNum2 - 0;

        var stN, edN;
        var retNum = [];
        //大小の並び替え
        if(num1 < num2){
            stN = num1;
            edN = num2;
        }else{
            stN = num2;
            edN = num1;
        }

        for(var i=stN; i<=edN; i++){
            retNum.push(i);
        }
        return retNum;
    }

    //-------------------
    //選択状態のコントロール
    //-------------------

    //選択状態にする。
    function selected(id_Arr){
        for(var i=0; i<id_Arr.length; i++){
            $("#result"+id_Arr[i]).addClass('selectedItem');
            _selected_Arr.push(id_Arr[i]);
        }
    }
    //状態を解除する。
    function unSelected(id_Arr){
        var removeTarArr = [];  //in_Arrを複製
        for(var i=0; i<id_Arr.length; i++){
            removeTarArr.push(id_Arr[i]);
        }
        //_selected_Arrからin_Arrに一致する内容を削除
        for(i=0; i<removeTarArr.length; i++){
            $("#result"+removeTarArr[i]).removeClass('selectedItem');
            var spliceNum = arr_index(_selected_Arr,removeTarArr[i]);
            if(spliceNum != -1)_selected_Arr.splice(spliceNum,1);
        }
    }

    //選択状態を反転させる
    function state_inverce(id_Arr){
        for(var i=0; i<id_Arr.length; i++){
            var spliceNum = arr_index(_selected_Arr,id_Arr[i]);
            if(spliceNum != -1){
                unSelected([id_Arr[i]]);
            }else{
                selected([id_Arr[i]]);
            }
        }
    }

    //配列中から一致する値が何番目の要素にあるか検索。無ければ-1を返す
    function arr_index(arr, val){
        for (var i=0; i<arr.length; i++) {
            if (arr[i] === val){
                return i;
            }
        }
        return -1;
    }



    return {
        //(初期設定)制御する要素を指定する。例：inTargetElement = "a.dragConfilm"
        addBehavior: function(inTargetElement){
            addBehaviorDo(inTargetElement);
        },
        //各キーの制御を有効にするかを変更(デフォルトでは全て有効)
        enableKey: function(shiftKey,ctrlKey){
            _isEnable_shiftKey = shiftKey;
            _isEnable_ctrlKey = ctrlKey;
        }
    };





})();


