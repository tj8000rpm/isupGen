var isupData;

var init = function(){
	var httpObj = null;
	httpObj = new XMLHttpRequest();
	httpObj.open("get", "./isup-param.json", true);
	httpObj.onload = function(){
		isupData = JSON.parse(this.responseText);
		htmlInitation();
	}
	httpObj.send(null);
}

var htmlInitation = function(){
	var select=document.getElementById("paramaters");
	for(key in isupData){
		description=isupData[key].description;
		addOptions(select,key,"("+key+")"+description);
	}
	select.size=select.length+5;
}

var selectParam = function(obj){
	var paramHex=obj.value;
	var subField=document.getElementById("subField");
	var result=[document.getElementById("result1"),document.getElementById("result2")];
	subField.textContent=null;
	result[0].value="";
	result[1].value="";

	//設定項目が一つの場合
	var selPrm = isupData[obj.value];
	if(selPrm.values != undefined || selPrm.input){
		var field=document.createElement("div");
		if(selPrm.input){
			var inputObj=document.createElement("input");
			inputObj.type="text";
			inputObj.id=obj.value;
			field.appendChild(inputObj);
		}
		else{
			var selectObj=document.createElement("select");
			field.appendChild(selectObj);
			selectObj.id=obj.value;
			for(key in selPrm.values){
				addOptions(selectObj,key,"("+key+")"+selPrm.values[key]);
			}
		}
		subField.appendChild(field);
	}
	//設定項目が１つ以上の場合
	else{
		for(key in selPrm){
			if(key!="description"){
				var field=document.createElement("div");
				var label=document.createElement("label");

				field.appendChild(label);
				label.textContent=selPrm[key].description+":";
				var settedId=paramHex+","+key;
				if(selPrm[key].input){
					var inputObj=document.createElement("input");
					inputObj.type="text";
					inputObj.id=settedId;
					field.appendChild(inputObj);
				}else{
					var selectObj=document.createElement("select");
					field.appendChild(selectObj);
					selectObj.id=settedId;
					for(key2 in selPrm[key].values){
						addOptions(selectObj,key2,"("+key2+")"+selPrm[key].values[key2]);
					}
				}
				subField.appendChild(field);
			}
		}
	}
}

var addOptions = function(sel,val,text){
	len=sel.length++;
	sel.options[len].value=val;
	sel.options[len].text=text;
}

var createSignal = function(){
	var result1=document.getElementById("result1");
	var result2=document.getElementById("result2");
	var field=document.getElementById("subField");
	var childlen=field.childNodes;
	var binStr="";
	var paramNo="";
	for(var i=0;i<childlen.length;i++){
		var id=childlen[i].childNodes[childlen[i].childNodes.length-1].id;
		var prm=id.split(",")[0];
		var pos=id.split(",")[1];
		var val=childlen[i].childNodes[childlen[i].childNodes.length-1].value;
		paramNo=prm;
		
		var target;
		if(pos==undefined)	target=isupData[prm];
		else				target=isupData[prm][pos];

		if(target.type=="num"){
			var newval="";
			if(val.length%2!=0) val=val+"0";
			for(c in val){
				var newlen=newval.length;
				if(c%2==0){
					newval=newval+val[c];
				}else{
					newval=newval.substr(0,newlen-1)+val[c]+newval.substr(newlen-1,1);
				}
			}
			for(c in newval){
				var digit=("0000"+Number("0x"+newval[c]).toString(2)).slice(-4);
				binStr+=digit;
			}
		}else{
			var offset=target.offset;
			var x=offset[0];
			var y=offset[1];
			var l=offset[2];
			
			if(l==-1){
				l=val.length;
			}

			for(var j=binStr.length;j<x+y*8+l;j++){
				binStr+="0";
			}

			binVal=("00000000"+Number("0x"+val).toString(2)).slice(l*-1);

			binStr=binStr.substr(0,x+y*8)+binVal+binStr.substr(x+y*8+l,binStr.length-x+y*8+l);
			//console.log(x+","+y+","+l);
		}
	}
	//console.log(binStr);

	// 2進数表記で長さが8の倍数になるまで0埋
	while(binStr.length%8!=0){
		binStr=binStr+"0";
	}
	// ２進数を16進数に変換
	var result="";
	for(var i=0;i<binStr.length;i+=4){
		result+=parseInt(binStr.substr(i,4),2).toString(16);
	}
	//parseInt(binStr,2).toString(16);

	// 16進数表記で0で２進数表記の際のビット数と同じになるまで0埋め
	while(result.length<binStr.length/4){
		result="0"+result;
	}
	//console.log(result);
	// 信号単体を出力
	result1.value=result;
	// パラメータ番号とパラメータレングスをつけて出力
	result2.value=paramNo+("0"+(result.length/2).toString(16)).slice(-2)+result;
}
