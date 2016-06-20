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
	var subField=document.getElementById("subField");
	var result=[document.getElementById("result1"),document.getElementById("result2")];
	subField.textContent=null;
	result[0].value="";
	result[1].value="";
	result[0].size=20;
	result[1].size=20;

	//設定項目が一つの場合
	var selPrm = isupData[obj.value];
	if(selPrm._values != undefined || selPrm._input){
		var field=document.createElement("p");
		if(selPrm._input){
			var inputObj=document.createElement("input");
			inputObj.type="text";
			inputObj.id=obj.value;
			field.appendChild(inputObj);
		}
		else{
			var selectObj=document.createElement("select");
			field.appendChild(selectObj);
			selectObj.id=obj.value;
//			for(key in selPrm._values){
			var keys = Object.keys(selPrm._values).sort();
			for(var i=0;i<keys.length;i++){
				var key=keys[i];
				addOptions(selectObj,key,"("+key+")"+selPrm._values[key],subField);
			}
		}
		subField.appendChild(field);
	}
	//設定項目が１つ以上の場合
	else{
		for(var key in selPrm){
			if(key!="_description" && key!="_add"){
				addMenu(selPrm[key],paramHex+","+key,subField);
			}
			else if(key=="_add"){
				addAddButton(selPrm[key],selPrm[key]._description,paramHex+","+key,subField);
				var field=document.createElement("p");
				var line=document.createElement("hr");
				field.appendChild(line);
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

var addMenu = function(target,paramId,subField){
	var field=document.createElement("p");
	var label=document.createElement("label");

	field.appendChild(label);
	label.textContent=target._description+":";
	if(target._input || target._type=="pivot"){
		var inputObj=document.createElement("input");
		if(target._type=="pivot")	inputObj.type="hidden";
		else						inputObj.type="text";
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
	var label=document.createElement("label");
	field.appendChild(label);
	label.textContent=rootDescription+":";
	if(pivotid!=undefined){
		var hidden=document.createElement("input");
		hidden.type="hidden";
		hidden.id=pivotid;
		field.appendChild(hidden);
	}
	subField.appendChild(field);
	for(key in target){
		if(key.match("^_.*$")) continue;
		var childField=document.createElement("p");
		var childLabel=document.createElement("label");
		var addButton=document.createElement("input");
		var delButton=document.createElement("input");
	
		childField.appendChild(childLabel);
		childField.appendChild(addButton);
		childField.appendChild(delButton);
		childLabel.textContent=target[key]._description+":";
		addButton.id=id+","+key+"_add";
		addButton.onclick=function(){addButtonEvent(this,subField);};
		delButton.id=id+","+key+"_del";
		addButton.type="button";
		delButton.type="button";
		addButton.value="+";
		delButton.value="-";
		subField.appendChild(childField);
		
	}

}
var addButtonEvent = function(obj,subField){
	var ids=obj.id.split(",");

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
			for(key in target){
				if(key=="_add"){
					var field=document.createElement("div");
					subField.appendChild(field);
					if(type=="pivot")
						addAddButton(target[key],target._description,newid+",_add",field,newid);
					else
						addAddButton(target[key],target._description,newid+",_add",field);
				}else if(!key.match("^_.*$")){
					addMenu(target[key],newid+","+key,subField);
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
var createSignal = function(){
	var result1=document.getElementById("result1");
	var result2=document.getElementById("result2");
	var field=document.getElementById("subField");
	var childlen=field.childNodes;
	var binStr="";
	var paramNo="";
	var pivotFlag=true;
	var pivotMem={};
	var pivotLabelMem={};
	var pivotAry=[];
	var multiOffset=0;
	var preLen=0;

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

		var val=childlen[i].childNodes[childlen[i].childNodes.length-1].value;
		paramNo=idArray[0];
//		pivotFlag=isupData[paramNo]._type=="pivot";
		
		// 構造体のrootを取得
		var target=isupData;
		// splitしたidでどの要素か特定
		for(var j=0;j<idArray.length;j++){
			target=target[idArray[j]];
		}
	//	var res;
	//	if(res=/^.*_idx([0-9]+)$/g.exec(idArray[idArray.length-1])){
	//		console.log(res[1]);
	//	}
		if(pivotMem[id]==undefined && target._type!="pivot"){
			pivotMem[id]=0;
			var preIDPrnt=""+((""+pivotAry[pivotAry.length-1]).split(",").slice(0,-1));
			var crtIDPrnt=""+(id.split(",").slice(0,-1));
			if(pivotAry.length==0 || preIDPrnt!=crtIDPrnt)
				multiOffset=((binStr.length)/8);
			pivotAry.push(id);
		}else{
			pivotMem[id]++;
			//console.log("A:"+binStr);
			if(pivotMem[pivotAry[0]]!=pivotMem[pivotAry[1]]){
				//console.log(binStr.length);
				multiOffset=((binStr.length)/8);
				//console.log(multiOffset);
			}
		}
		
		preLen=binStr.length;
		
		var offset=target._offset;

		if(target._type=="num"){
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
		}else if(target._type=="raw"){
			var newval="";
			if(val.length%2!=0) val=val+"0";
			for(c in val){
				newval=newval+val[c];
			}
			for(c in newval){
				var digit=("0000"+Number("0x"+newval[c]).toString(2)).slice(-4);
				binStr+=digit;
			}
		}else if(target._type=="bin"){
			var x=offset[0];
			var y=offset[1]+multiOffset;
			var l=offset[2];

			for(var j=binStr.length;j<x+y*8+l;j++){
				binStr+="0";
			}

			var binVal=("00000000"+Number(val).toString(2)).slice(-l);

//			console.log(val);
//			console.log(val.toString(2));
//			console.log(binVal);
			binStr=binStr.substr(0,x+y*8)+binVal+binStr.substr(x+y*8+l,binStr.length-x+y*8+l);
		}else if(target._type=="pivot"){
			binStr=calcPivotElement(pivotLabelMem,binStr);
			//console.log(binStr);
			pivotLabelMem=[idArray[idArray.length-1],binStr.length];
		}else{
			var x=offset[0];
			var y=offset[1]+multiOffset;
			var l=offset[2];
			console.log("***:"+x+","+y+","+l+","+multiOffset+","+id);
			
			if(l==-1){
				l=val.length;
			}

			for(var j=binStr.length;j<x+y*8+l;j++){
				binStr+="0";
			}

			//0埋めする
			binVal=("00000000"+Number("0x"+val).toString(2)).slice(l*-1);
			
			//offsetの指示に従い間に埋め込む、置き換える
			binStr=binStr.substr(0,x+y*8)+binVal+binStr.substr(x+y*8+l,binStr.length-x+y*8+l);
			//console.log(x+","+y+","+l);
		}
		//console.log("A:"+binStr);
///		if(preLen!=binStr.length && pivotAry.length==0){
///			console.log(preLen);
///			//console.log(binStr.length);
///			multiOffset=((binStr.length)/8);
///		//	console.log(multiOffset);
///		}
	}
	//console.log(binStr);
	binStr=calcPivotElement(pivotLabelMem,binStr);

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
	result1.size=result2.value.length*1.5;
	result2.size=result2.value.length*1.5;
}

var calcPivotElement =function(pivotLabelMem,binStr){
	if(pivotLabelMem.length==2){
		var insertId=("00000000"+Number("0x"+pivotLabelMem[0]).toString(2)).slice(-8);
		var insertPos=pivotLabelMem[1]
		var insertLen=parseInt((binStr.length-insertPos)/8);
		var insertLenBin=("00000000"+insertLen.toString(2)).slice(-8);
		//console.log(binStr);
		//console.log(binStr.substr(0,insertPos));
		//console.log(insertLen);
		//console.log(insertPos);
		//console.log(insertId);
		//console.log(insertLenBin);
		binStr=binStr.substr(0,insertPos)+
			   insertId+
			   insertLenBin+
			   binStr.substr(insertPos,binStr.length-insertPos);
		//console.log(binStr);
	}
	return binStr;

}
