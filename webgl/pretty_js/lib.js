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
//function used to grab vertext shader program strings from function bodies
function vshader(name){
  return getFuncStr('vertex_shader_'+name);
}
//function used to grab fragment shader program strings from function bodies
function fshader(name){
  return getFuncStr('fragment_shader_'+name);
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
	return el;
}
//add class method
function addClass(el,classStr){
	var added=false;
	//if element exists
	if(el!=undefined){
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
	return el;
}
