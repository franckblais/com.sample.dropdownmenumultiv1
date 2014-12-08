sap.designstudio.sdk.Component.subclass("com.sap.sample.dropdownmulti.Dpv1", function() {

	var that 						= this;
	
	/*
	 * Properties defined in Contribution
	 */
	
	var data 						= null;
	var _propSelChar				= "";
	var _propSingleRootNodeName 	= null;
	var _propAddSingleRootNode  	= null;
	var _propClickedElemKey			= null;
	var _propCss					= "";
	var _propResetButton			= "";
	
	/*
	 * Constants
	 */
	
	var c_ResetButton_NODISP 		= "no"
	var c_ResetButton_LEFT 			= "Left"
	var c_ResetButton_RIGHT 		= "Right"
	
	/*
	 * Others
	 */
	
	//Strings
	var div_id 						= null;
	
	//Objects
	var elemSelected				= null;
	var elemJqSelParents			= [];
	var _rendered					= false;
	var elemStyleJq					= null;
	
	//obsolete
	var meta_data 					= null;
	var tContent    				= [];
	
	/* ***********************
	 * METHODS				 *
	 * ***********************/
	this.init = function() {
		div_id = "#" + this.$()[0].id;
	};
	
	this.removeEscapeChars = function(stringValue) {
		return stringValue.replace(/\\/g, "");
	};
	
	this.appendCss = function() {
		elemStyleJq		= $("<style> " + this.removeEscapeChars(_propCss) + "</style>");
		
		if (!this.getRender()) {
			$('head').append(elemStyleJq);
		}
	};
	
	this.setRendered= function(value) {
		_rendered = value;
	}
	
	this.getRender = function() {
		return _rendered;
	}
	
	this.afterUpdate = function() {
		
		if (!this.getRender()) {
			this.$().empty();
//			this.appendCss();
			this.updateDisplay();
			this.updateSelection(elemSelected);
			this.setRendered(true);
		}	
	};
	
	this.clearSelection = function() {
		_propClickedElemKey = "";
		
		$("#selected-menu-item").attr("id","");
		$(".selected-menu-parents").removeClass("selected-menu-parents");
		
		elemSelected 		= null;
		elemJqSelParents 	= null;
	}
	
	this.updateSelection = function(pSelectedItem) {
		if (pSelectedItem == undefined) {
			//Do nothing
			return;
		}
		
//		Remove the previous selections
		if (!!elemSelected) {
			this.clearSelection();
		}
		
		if (!!pSelectedItem) {
//			Set the selected item (DOM)
			elemSelected = pSelectedItem;
			_propClickedElemKey = elemSelected.attributes.getNamedItem("valuekey").nodeValue;
			
//			Transform the selected item to JQuery object
			var jqElemSelected = jQuery(elemSelected);
			
//			Get the first LI Parent
			var jQElemSelectedLI = jqElemSelected.parent("LI");
			
			
//			Set the ID of the LI parents to selected
			$(jqElemSelected).attr("id", "selected-menu-item");
			
			//$("a[valuekey='" + _propClickedElemKey + "']").attr("id","");
			
//			Get the LI parents in a table
			elemJqSelParents = jQElemSelectedLI.parents("LI");
			
//			For each, set the ID to selected parent.
//			Stop until finding a parent with the tag NAV
			elemJqSelParents.each(function() {
//				Check he has a direct parent with a UL = NAV
				if ($( this ).parent("UL").parent().prop("tagName") == "NAV") {
					return false;
				}
				
				
//				var firstChild = $( this ).children().first();
//				$(firstChild).attr("id", "selected-menu-parents");
				
				var allA = $( this ).find("a[firstLink='true']");
				if (!!allA) {
					var firstA = jQuery($(allA)[0]);
					$(firstA).addClass("selected-menu-parents");
				}
			});
				
//			if (!!elemSelected)
//				document.getElementsByName(elemSelected.name) [0].id = "";
//				//elemSelected.parentElement.id 	= "";
			
//			document.getElementsByName(source.name) [0].id = "selected-menu-item";
			//source.parentElement.id 		= "selected-menu-item"

			
			//console.dir(_propClickedElemKey);
			
//			Update the style of the parents
			
			
			
//			jqElemSelected.parents("LI").id = "selected-menu-parents";
//			var jQCurParentElem = null;
//			do {
//				jQCurParentElem = jqElemSelected.closest("LI");
//			} while ();
			
		} else {
			//reset the selection
			elemSelected = null;
			elemJqSelParents = null;
		}
	};
	
	function actionOnReset(e) {
		if (!!elemSelected)
			//document.getElementsByName(elemSelected.name) [0].id = "";
			elemSelected.id = "";
		
		this.clearSelection();
		elemSelected 		= null;
		_propClickedElemKey = null;
		
		that.firePropertiesChanged(["clickedElemKey"]);
		that.fireEvent("onReset");
	}
	
	function actionOnClick(e) {
		//console.dir("actionOnClick");
		console.dir(e);
		
		var source = e.target;
		
		that.updateSelection(source);
		that.firePropertiesChanged(["clickedElemKey"]);
		that.fireEvent("onClick");
	}
	
	this.updateDisplay = function() {
		var string_tmp = "";
		
		//this.$().append($('<p>selChar :' + selChar + '</p>'));
		
		console.dir(data);
		
		var rootUL		= null;
		
		for(var i=0;i<data.dimensions.length;i++){
			var dim = data.dimensions[i];
			
			if (dim.key == _propSelChar) {
				
				//this.$().append($('<p>Found :' + dim.text + '</p>'));
				//Should parse and display the member as list
//				
				var firstParent = true;
				var curParent 	= null;
				var curNode     = null;
				
				var rootNav		= document.createElement("NAV");
				rootNav.id 		= "primary_nav_wrap";
				rootUL		= document.createElement("UL");
				
				rootNav.appendChild(rootUL);
				
				if (_propAddSingleRootNode) {
					var newLI 	= this.createLIText(_propSingleRootNodeName);
					var newUL	= document.createElement("UL");
					newLI.appendChild(newUL);
					
					rootUL.appendChild(newLI);
					
					rootUL = newUL;
				};
				
				var trackPile	= [];
				
				//keep track of the UL parents all the time
				trackPile.push(rootUL);
				
				curParent		= rootUL;
				
				var curLevel	= 0;
				var lastLevel	= 0;
//				
				for(var j=0;j<dim.members.length;j++){
					var mem = dim.members[j];
					
					lastLevel = curLevel;
					
					if (mem.hasOwnProperty('level')) {
						curLevel = mem.level;
					}
					else {
						curLevel = 0;
					}
					
					if (curLevel == lastLevel) {
						// on the same level, add a LI, no pile modification
						curNode = this.createLI(mem);
					} else if (curLevel > lastLevel) {
						//We have gone one level under
						//should pile, create a LI and a UL inside
						
						var newUL	= document.createElement("UL");
						curNode.appendChild(newUL);
						
						trackPile.push(curParent);
						
						curParent 	= newUL;
						curNode = this.createLI(mem);
					} else if (curLevel < lastLevel) {
						//went back some level before
						//need to depile
						var nbPop 	= lastLevel - curLevel;
						var curPop 	= 0;
						do {
							curParent = trackPile.pop();
							curPop++;
						} while (curPop < nbPop);
						
						curNode = this.createLI(mem);
					}
					curParent.appendChild(curNode);
				};
				
				var jqResButton = null;
				if (_propResetButton != c_ResetButton_NODISP) {
					jqResButton = jQuery(this.createLIText("X"));
					jqResButton.click(actionOnReset);
				}
				
				
				var rootULJq = jQuery(rootNav.firstChild);
				if (!!jqResButton) {
					switch (_propResetButton) {
						case c_ResetButton_LEFT:
							rootULJq.prepend(jqResButton);
							break;
						case c_ResetButton_RIGHT:
							rootULJq.append(jqResButton);
							break;
					};
				}
				
				//this.$().addContent(tContent);
				this.$().append(rootNav);
			}
		}
		
		this.setRendered(true);
	}
	
	this.createLI = function(mem) {
		//mem is a member of a dimension
		var node 		= document.createElement("LI");
		var link		= document.createElement("A");
		
		//node.click(actionOnClick);
		
		
		//link.id = div_id + mem.key;
		//link.setAttribute("HREF", "#");
		
		link.setAttribute("valuekey", mem.key);
		link.setAttribute("firstLink", "true");
		link.name = div_id + mem.key + "LI";
		
		if (mem.key == _propClickedElemKey) {
			link.id = "selected-menu-item";
		}
		
		var linkJQ = jQuery(link);
		linkJQ.click(actionOnClick);
		
		link = linkJQ.get()[0];
		
		var lvl = 0;
		
		if (mem.hasOwnProperty('level')) {
			lvl = mem.level;
		}
		var text 		= document.createTextNode(mem.text);
		
		link.appendChild(text);
		node.appendChild(link);
		
		return node;
	}
	this.createLIText = function(text) {
		//mem is a member of a dimension
		var node 		= document.createElement("LI");
		var link		= document.createElement("A");
		
		
		//link.id = div_id + text;
		link.setAttribute("HREF", "#");
		
		var nodeText 		= document.createTextNode(text);
		
		link.appendChild(nodeText);
		node.appendChild(link);
		
		return node;
	}
	
	this.data = function(value) {
		if (value === undefined) {
			return data;
		} else {
			data = value;
			return this;
		}
		
		this.setRendered(false);
	};
	
	/*
	 * Return the content of the dimension tables from an array converted in a JSON String
	 * - Called in the Property page
	 */
	this.getDimensions = function() {
		if (data) {
			return JSON.stringify(data.dimensions);
		}
	};
	
	
	/*
	 * This is the getter/Setter of selChar.
	 * It can be called at 2 places:
	 * 	- When you go in the design studio standard property page and update it
	 *  - When you call the that.firePropertiesChanged(["selChar"]);
	 *  
	 * The property has to be declared in both:
	 *  - contribution.xml
	 *  - preferably you component (this file)
	 */
	
	this.selChar = function(value) {	
		if (value === undefined) {
			return _propSelChar;
		} else {
			_propSelChar = value;
			return this;
		}
		
		this.setRendered(false);
	};
	
	this.addSingleRootNode = function(value) {	
		if (value === undefined) {
			return _propAddSingleRootNode;
		} else {
			_propAddSingleRootNode = value;
			return this;
		}
		
		this.setRendered(false);
	};
	
	this.singleRootNodeName = function(value) {	
		if (value === undefined) {
			return _propSingleRootNodeName;
		} else {
			_propSingleRootNodeName = value;
			return this;
		}
		
		this.setRendered(false);
	};
	
	this.clickedElemKey = function(value) {	
		if (value === undefined) {
			return _propClickedElemKey;
		} else {
			_propClickedElemKey = value;
			return this;
		}
	};
	
	this.css = function(value) {
		if (value === undefined) {
			return _propCss;
		} else {
			_propCss = value;
			return this;
		}
		this.setRendered(false);
	};
	
	this.resetButton = function(value) {	
		if (value === undefined) {
			return _propResetButton;
		} else {
			_propResetButton = value;
			return this;
		}
		this.setRendered(false);
	};
	
	function findDimensionIndexByName(dimName) {
		var dimensions = data.dimensions;
		var dimIndex = -1;
		for (var i = 0; i < dimensions.length; i++) {
			var dimNameToCompare = dimensions[i].key;
			if (dimName == dimNameToCompare) {
				dimIndex = i;
				break;
			};
		}
		return dimIndex;
	}
});
