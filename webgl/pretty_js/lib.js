/* ==================================
MY OWN PERSONAL SET OF LIBRARY SCRIPT
===================================== */

//gets the contents of a function, eg: function functionName(){/* ...contents... */}
function getFuncStr(functionName){
	var functionContent = '';
	//if this function exists
	if(window.hasOwnProperty(functionName)){
		//get code inside the function object
		functionContent = window[functionName];
		functionContent = functionContent.toString();
		//strip off the function string
		var startCode = '{/*';var endCode = '*/}';
		//safari tries to be helpful by inserting a ';' at the end of the function code if there is not already a ';'
		if (functionContent.lastIndexOf(endCode) == -1) {endCode='*/;}';}
		//strip off everything left of, and including startCode
		functionContent = functionContent.substring(functionContent.indexOf(startCode) + startCode.length);
		//strip off everything right of, and including endCode
		functionContent = functionContent.substring(0, functionContent.lastIndexOf(endCode));
		functionContent = functionContent.trim();
	}
	return functionContent;
}
//fire an event once instead of multiple successive times
var do_once_timeout;
function do_once(func){
	clearTimeout(do_once_timeout);
	do_once_timeout=setTimeout(function(){
		func();
	},225);
}
//make-shift window resize event
function window_resize(func){
	//if nothing assigned to resize event yet
	if(window.onresize==undefined){
		//set the window resize handler
		window.onresize=func;
	}else{
		//resize event already set... get the existing resize event
		var existing=window.onresize;
		//append to the onresize event
		window.onresize=function(){
			//fire the existing function, then fire the new function
			existing(); func();
		};
	}
}
//remove class method
function removeClass(el,classStr){
	var removed=false;
	//if element exists
	if(el!=undefined){
		if(classStr!=undefined&&typeof classStr==='string'){
			if(el.classList){
				if(el.classList.remove){
					el.classList.remove(classStr);
					removed=true;
				}
			}
			if(!removed){
				//*** fall back way of removing class
			}
		}
	}
	return el;
}
//add class method
function addClass(el,classStr){
	var added=false;
	//if element exists
	if(el!=undefined){
		if(classStr!=undefined&&typeof classStr==='string'){
			if(el.classList){
				if(el.classList.add){
					el.classList.add(classStr);
					added=true;
				}
			}
			if(!added){
				//*** fall back way of adding class
			}
		}
	}
	return el;
}
//has class method
function hasClass(el,classStr){
	var has=false; var useContains=false;
	//if element exists
	if(el!=undefined){
		if(classStr!=undefined&&typeof classStr==='string'){
			if(el.classList){
				if(el.classList.contains){
					has=el.classList.contains(classStr);
					useContains=true;
				}
			}
			if(!useContains){
				//fall back way of checking class
				var elClass=el.className;
				//if the class name contains the given classStr
				if(elClass.indexOf(classStr)!==-1){
					//for each class item
					var classArray=elClass.split(' ');
					for(var c=0;c<classArray.length;c++){
						//if this class name isn't empty
						var aClass=classArray[c]; aClass=aClass.trim();
						if(aClass.length>0){
							//if this class is the target class
							if(aClass===classStr){
								//yes, has class. Stop looking
								has=true;
								break;
							}
						}
					}
				}
			}
		}
	}
	return has;
}
//is tag method
function isTag(el,tag){
	var is=false;
	//if element exists
	if(el!=undefined){
		if(el.tagName){
			if(tag!=undefined&&typeof tag==='string'){
				tag=tag.toLowerCase();
				if(el.tagName.toLowerCase()===tag){
					is=true;
				}
			}
		}
	}
	return is;
}
//add inline style function
function css(el,attr,val){
	if(el.style){
		if(el.style.hasOwnProperty(attr)){
			el.style[attr]=val;
		}
	}
	return el;
}
//pass a canvas wrap or number to get the array item canvas data for that number
function getCanvasData(wrap){
	var data;
	if(document.body.hasOwnProperty('glCanvasList')){
		if(typeof wrap==='number'){
			if(document.body.glCanvasList.length>=wrap){
				if(wrap>0){
					data=document.body.glCanvasList[wrap-1];
				}
			}
		}else{
			if(wrap.hasOwnProperty('canvasId')){
	      var id=wrap.canvasId;
	      if(document.body.glCanvasList.length>=id){
					data=document.body.glCanvasList[id-1];
				}
			}
		}
	}
	return data;
}
