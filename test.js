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
	var keys = Object.keys(isupData).sort();
	for(var i=0;i<keys.length;i++){
		var key=keys[i];
		description=isupData[key]._description;
		addOptions(select,key,"("+key+")"+description);
	}
	select.size=40;
}

var selectParam = function(obj){
	var paramHex=obj.value;

	var selectIds=[];
	for(var option in obj.options){
		if(obj[option].selected){
			selectIds.push(obj[option].value);
		}
	}

	var subField=document.getElementById("subField");
	subField.textContent="";

	var i=0;
	for(var idx=0;idx<selectIds.length;idx++){
		paramHex=selectIds[idx];
		var sigField=document.createElement("div");
		sigField.textContent=null;
	
		var delBt=document.createElement("input");
		var btP=document.createElement("p");
		btP.className="right";

		delBt.type="button";
		delBt.value="x";
		btP.appendChild(delBt);
		delBt.onclick=function(){delButtonEvent(this);};
		delBt.onmouseover=function(){delMouseOver(this);};
		delBt.onmouseout=function(){delMouseOut(this);};
		
		sigField.appendChild(btP);

		
		sigField.value=paramHex;
		sigField.className="idLength";
		sigField.id="sigField"+(i++);

		var selPrm = isupData[paramHex];
		var unitField=undefined;

		if(selPrm._description!=undefined){
			var label=document.createElement("label");
			label.textContent=selPrm._description+":";
			label.className="bold";
			sigField.appendChild(label);
		}
		subField.appendChild(sigField);
		
		//設定項目が一つの場合
	    for(var key in selPrm){
			if(key!="_description" && key!="_add"){
				if(unitField==undefined){
	    			unitField=document.createElement("div");
					unitField.className="unit";
					sigField.appendChild(unitField);


				//	var delUnitBt=document.createElement("input");
				//	var btUnitP=document.createElement("p");
				//	btUnitP.className="right";

				//	delUnitBt.type="button";
				//	delUnitBt.value="x";
				//	btUnitP.appendChild(delUnitBt);
				//	
				//	unitField.appendChild(btUnitP);
				}
				addMenu(selPrm[key],paramHex+","+key,unitField);
			}
			else if(key=="_add"){
				addAddButton(selPrm[key],selPrm[key]._description,paramHex+","+key,sigField);
				var field=document.createElement("p");
				var line=document.createElement("hr");
				field.appendChild(line);
				sigField.appendChild(field);
			}
		}
	}
}   	
    	
var addOptions = function(sel,val,text){
		len=sel.length++;
		sel.options[len].value=val;
		sel.options[len].text=text;
}

var addMenu = function(target,paramId,subField){
	var field=document.createElement("p");

	if(target._description!=undefined){
		var label=document.createElement("label");
		label.textContent=target._description+":";
		field.appendChild(label);
	}

	if(target._input){
		var inputObj=document.createElement("input");
		inputObj.type="text";
		inputObj.id=paramId;
		field.appendChild(inputObj);
	}else{
		var selectObj=document.createElement("select");
		field.appendChild(selectObj);
		selectObj.id=paramId;
		var keys = Object.keys(target._values).sort();
		for(var i=0;i<keys.length;i++){
			var key2=keys[i];
			addOptions(selectObj,key2,"(0x"+key2+")"+target._values[key2]);
		}
	}
	subField.appendChild(field);
}
var addAddButton = function(target,rootDescription,id,subField,pivotid){
	var field=document.createElement("p");
	
	if(target._description!=undefined){
		var label=document.createElement("label");
		label.textContent=rootDescription+":";
		field.appendChild(label);
	}
	
	subField.appendChild(field);

	var childLabel=document.createElement("select");
	var addButton=document.createElement("input");
	var delButton=document.createElement("input");
	addButton.type="button";
	delButton.type="hidden";
	addButton.value="+";
	addButton.id=id+"_add";
	addButton.onclick=function(){addButtonEvent(this,subField,childLabel);};

	subField.appendChild(childLabel);
	subField.appendChild(addButton);
	subField.appendChild(delButton);
	for(key in target){
		if(key.match("^_.*$")) continue;
		addOptions(childLabel,id+","+key,target[key]._description);
	}

}
var delButtonEvent = function(obj){
	var div=obj.parentNode.parentNode;
	div.parentNode.removeChild(div);
}
var delMouseOver = function(obj){
	var div=obj.parentNode.parentNode;
	div.style.backgroundColor = "#fff8f8";
}
var delMouseOut = function(obj){
	var div=obj.parentNode.parentNode;
	div.style.backgroundColor = null;
}

var addButtonEvent = function(obj,subField,select){
	var ids= select.value.split(",");
	var newid="";
	var target=isupData;
	for(var i=0;i<ids.length;i++){
		var key=ids[i];
		if(i+1>=ids.length){
			key=key.split("_")[0];
			//console.log(key);
			target=target[key];
			if(newid!="") newid+=","
			newid+=key;
			type=target._type;

			var unitField=undefined;
			for(var key2 in target){
				if(key2=="_add"){
					var field=document.createElement("div");

					var delBt=document.createElement("input");
					var btP=document.createElement("p");
					btP.className="right";

					delBt.type="button";
					delBt.value="x";
					btP.appendChild(delBt);
					delBt.onclick=function(){delButtonEvent(this,field);};
					delBt.onmouseover=function(){delMouseOver(this);};
					delBt.onmouseout=function(){delMouseOut(this);};
					
					field.appendChild(btP);

					if(target[key2]._type!="noIdLength"){
						field.className="idLength";
					}else if(target[key2]._type=="length"){
						field.className="length";
					}else{
						field.className="noLength";
					}
					field.value=key;
					subField.appendChild(field);
					addAddButton(target[key2],target._description,newid+",_add",field);
				}else if(!key2.match("^_.*$")){
					if(unitField==undefined){
						unitField=document.createElement("div");
						unitField.className="unit";

						var delBt=document.createElement("input");
						var btP=document.createElement("p");
						btP.className="right";
						delBt.type="button";
						delBt.value="x";
						btP.appendChild(delBt);
						delBt.onclick=function(){delButtonEvent(this);};
						delBt.onmouseover=function(){delMouseOver(this);};
						delBt.onmouseout=function(){delMouseOut(this);};
						unitField.appendChild(btP);

						if(type=="idLength"){
							//console.log(target);
							var lengthField=document.createElement("div");
							var lengthLabel=document.createElement("label");
							lengthField.className="idLength";
							lengthField.value=key;
							lengthLabel.textContent=target._description+":";


							var delBt2=document.createElement("input");
							var btP2=document.createElement("p");
							btP2.className="right";

							delBt2.type="button";
							delBt2.value="x";
							btP2.appendChild(delBt2);
							delBt2.onclick=function(){delButtonEvent(this);};
							delBt2.onmouseover=function(){delMouseOver(this);};
							delBt2.onmouseout=function(){delMouseOut(this);};
							lengthField.appendChild(btP2);

							lengthField.appendChild(lengthLabel);
							lengthField.appendChild(unitField);

							subField.appendChild(lengthField);
						}else{
							subField.appendChild(unitField);
						}
					}
					addMenu(target[key2],newid+","+key2,unitField);
				}else{
				}
			}
		}else{
			target=target[key];
			if(newid!="") newid+=","
			newid+=key;
		}
	}
	
	
}
var getSubResult = function(tag){
	var divClass=tag.className;
	var divId=tag.value;
	var childlen=tag.childNodes;
	var result="";

	if(divClass=="idLength" || divClass=="length" || divClass=="noLength"){
		for(var i=0;i<childlen.length;i++){
			var tag=childlen[i];
			if(tag.tagName.search("^[dD][iI][vV]$")!=-1){
				result+=getSubResult(tag);
			}
		}
		
		if(divClass=="length" || divClass=="idLength"){
			//console.log("aaaa");
			result=zeroPadding(dec2hex(result.length/2),2)+result;
		}
		if(divClass=="idLength"){
			result=zeroPadding(divId,2)+result;
		}

	}else if(divClass=="unit"){
		result=createUnitSignal(tag);
	}

	//console.log(result);

	return result;
}

var createUnitSignal = function(tag){
	var binStr="";
	var childlen=tag.childNodes;

	for(var i=0;i<childlen.length;i++){
		//div tag
		var div=childlen[i];
		//input,select etc...(Label:INPUT)なので末尾だけ取得
		var part=div.childNodes[div.childNodes.length-1];

		// + -ボタンあるやつを除去
		if(part.id=="" || div.childNodes.length > 2) continue;

		// select,inputのIDを取得
		var id=childlen[i].childNodes[childlen[i].childNodes.length-1].id;
		// idのカンマ区切りを分割
		var idArray=id.split(",");

		//設定値を取得
		var val=childlen[i].childNodes[childlen[i].childNodes.length-1].value;
		paramNo=idArray[0];
		
		// 構造体のrootを取得
		var target=isupData;
		// splitしたidでどの要素か特定
		for(var j=0;j<idArray.length;j++){
			target=target[idArray[j]];
		}

		var offset=target._offset;

		if(target._type=="num"){
			var newval="";

			//奇数なら偶数になるように0で埋める
			if(val.length%2!=0) val=val+"0";

			//bigendianになるように並び替え
			for(c in val){
				var newlen=newval.length;
				if(c%2==0){
					newval=newval+val[c];
				}else{
					newval=newval.substr(0,newlen-1)+val[c]+newval.substr(newlen-1,1);
				}
			}

			//hex文字列をバイナリ文字列に変換する
			for(c in newval){
				var digit=zeroPadding(hex2bin(newval[c]),4);
				binStr+=digit;
			}

		}else if(target._type=="raw"){
			var newval="";
			if(val.length%2!=0) val=val+"0";
			for(c in val){
				newval=newval+val[c];
			}
			for(c in newval){
				var digit=zeroPadding(hex2bin(newval[c]),4);
				binStr+=digit;
			}
		}else if(target._type=="bin"){
			var x=offset[0];
			var y=offset[1];
			var l=offset[2];

			for(var j=binStr.length;j<x+y*8+l;j++){
				binStr+="0";
			}

			var binVal;
			binVal=zeroPadding(dec2bin(val),l);

			binStr=binStr.substr(0,x+y*8)+binVal+binStr.substr(x+y*8+l,binStr.length-x+y*8+l);
		}else{
			var x=offset[0];
			var y=offset[1];
			var l=offset[2];
			
			if(l==-1){
				l=val.length;
			}

			for(var j=binStr.length;j<x+y*8+l;j++){
				binStr+="0";
			}

			//0埋めする
			binVal=zeroPadding(hex2bin(val),l);
			
			//offsetの指示に従い間に埋め込む、置き換える
			binStr=binStr.substr(0,x+y*8)+binVal+binStr.substr(x+y*8+l,binStr.length-x+y*8+l);
			//console.log(x+","+y+","+l);
		}
	}

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

	return result;
}

var createSignal = function(){
	var result1=document.getElementById("result1");
	var result2=document.getElementById("result2");
	var field=document.getElementById("subField");
	var childlen=field.childNodes;
	var result="";

	for(var i=0;i<childlen.length;i++)
	//	console.log(childlen[i]);
		result+=getSubResult(childlen[i]);
	
	// 信号単体を出力
	result1.value=result.slice(-(result.length-4));
	// パラメータ番号とパラメータレングスをつけて出力
	result2.value=result;
	result1.size=result2.value.length*1.5;
	result2.size=result2.value.length*1.5;
}

var zeroPadding = function(str,len){
	for(var i=0;i<len;i++) str=0+str;
	return str.slice(-len);
}

var hex2bin = function(str){
	return Number("0x"+str).toString(2);
}
var dec2bin = function(num){
	return Number(num).toString(2);
}
var dec2hex = function(num){
	return Number(num).toString(16);
}
