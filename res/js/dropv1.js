sap.designstudio.sdk.Component.subclass("com.sample.dropdownmenumultiv1.Dpv1", function() {

	var that 						= this;
	
	/*
	 * Properties defined in Contribution.xml
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
	
	var c_ResetButton_NODISP 		= "None";
	var c_ResetButton_LEFT 			= "Left";
	var c_ResetButton_RIGHT 		= "Right";
	var c_DebugFlag					= true;
	
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
		
		this.appendCss();
	};
	
	this.removeEscapeChars = function(stringValue) {
		return stringValue.replace(/\\/g, "");
	};
	
	this.appendCss = function() {
		elemStyleJq		= $("<style> " + this.removeEscapeChars(_propCss) + "</style>");
		
		$('head').append(elemStyleJq);
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
		elemJqSelParents 	= [];
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
			
//			Get the LI parents in a table
			elemJqSelParents = jQElemSelectedLI.parents("LI");
			
//			For each, set the ID to selected parent.
//			Stop until finding a parent with the tag NAV
			elemJqSelParents.each(function() {
//				Check he has a direct parent with a UL = NAV
//				if yes, stop the algorithm
				if ($( this ).parent("UL").parent().prop("tagName") == "NAV") {
					return false;
				}
				
//				Update all the parents with a CSS class to display the path
//				to the selected node
				var allA = $( this ).find("a[firstLink='true']");
				if (!!allA) {
					var firstA = jQuery($(allA)[0]);
					$(firstA).addClass("selected-menu-parents");
				}
			});
		}
	};
	
	function actionOnReset(e) {

//		Clear the current selection internally
		that.clearSelection();
		
//		Fire the different event to call the reset script
		that.firePropertiesChanged(["clickedElemKey"]);
		that.fireEvent("onReset");
	}
	
	function actionOnClick(e) {		
		that.updateSelection(e.target);
		that.firePropertiesChanged(["clickedElemKey"]);
		that.fireEvent("onClick");
	}

	/*
	 * Method updateDisplay
	 * 
	 * Will update all the display and redraw the menu, using UL, LI and A
	 */
	this.updateDisplay = function() {

		this.debugConsoleDir(data, "this.updateDisplay / var data");
		
		var rootUL		= null;
		
//		Look for the selected dimension
		for(var i=0;i<data.dimensions.length;i++){
			var dim = data.dimensions[i];
			
			if (dim.key == _propSelChar) {
				
				//this.$().append($('<p>Found :' + dim.text + '</p>'));
				//Should parse and display the member as list
//				
				var curParent 	= null;
				var curNode     = null;
				
//				Create the first node as NAV
				var rootNav		= document.createElement("NAV");
//				Set the ID for CSS purpose
//				Please note that a correct HTML document should only have one occurence of an ID
//				Therefore, if several dropdown menus are added in the document, the HTML would not be striclty correct.
				rootNav.id 		= "primary_nav_wrap";
				
//				Createt the first UL section
				rootUL		= document.createElement("UL");
				
				rootNav.appendChild(rootUL);
				
				/*
				 * If the user wanted to add a false first root node, we have to add it
				 */
				if (_propAddSingleRootNode) {
					var newLI 	= this.createLIText(_propSingleRootNodeName);
					var newUL	= document.createElement("UL");
					newLI.appendChild(newUL);
					
					rootUL.appendChild(newLI);
					
					rootUL = newUL;
				};
				
//				This table if a LIFO pile and will be used to track the parents
				var trackPile	= [];
				
				//keep track of the UL parents all the time
				trackPile.push(rootUL);
				
				curParent		= rootUL;
				
				var curLevel	= 0;
				var lastLevel	= 0;
				
//				Loop at each member of the hierarchy
				for(var j=0;j<dim.members.length;j++){
					var mem = dim.members[j];
					
//					Keep track of the last level
					lastLevel = curLevel;
					
//					The first node do not have a level property, therefore = 0
					if (mem.hasOwnProperty('level')) {
						curLevel = mem.level;
					}
					else {
						curLevel = 0;
					}
					
					if (curLevel == lastLevel) {
						// on the same level, add a LI, no pile modification
//						Only need to create a new LI, after the IF
					} else if (curLevel > lastLevel) {
						//We have gone one level under
						//should pile, create a LI and a UL inside
						
						var newUL	= document.createElement("UL");
						curNode.appendChild(newUL);
						
						trackPile.push(curParent);
						
						curParent 	= newUL;
						
					} else if (curLevel < lastLevel) {
						//went back some level before
						//need to depile
						var nbPop 	= lastLevel - curLevel;
						var curPop 	= 0;
						do {
							curParent = trackPile.pop();
							curPop++;
						} while (curPop < nbPop);
					}
					
					curNode = this.createLI(mem);
					curParent.appendChild(curNode);
				};
				
				var jqResButton = null;
				if (_propResetButton != c_ResetButton_NODISP) {
//					Create a JQuery element to make it easier to call a onClick method
					jqResButton = jQuery(this.createLIText("X"));
					jqResButton.click(actionOnReset);
				}
				
				if (!!jqResButton) {
					var rootULJq = jQuery(rootNav.firstChild);
//					Depending on where the root node should be added, get the first child and Prepand or append
					switch (_propResetButton) {
						case c_ResetButton_LEFT:
							rootULJq.prepend(jqResButton);
							break;
						case c_ResetButton_RIGHT:
							rootULJq.append(jqResButton);
							break;
					};
				}
				
//				Append the list to the HTML
				this.$().append(rootNav);
			}
		}
		
		this.setRendered(true);
	}
	
	this.createLI = function(mem) {
		//mem is a member of a dimension
		var node 		= document.createElement("LI");
		node.className = node.className + " submenu";
		var link		= document.createElement("A");
		
		
//		Keep track of the internal value. Will be retrieved when clicked
		link.setAttribute("valuekey", mem.key);
//		Add this attribute to be easily found with JQyery
		link.setAttribute("firstLink", "true");
//		link.name = div_id + mem.key + "LI";
		
//		Create a JQyery element to add the onClick event
		var linkJQ = jQuery(link);
		linkJQ.click(actionOnClick);
		
//		Get back the DOM element
		link = linkJQ.get()[0];
		
		var textTmp  = mem.text;
		var sepIndex = textTmp.indexOf("|");
		if (sepIndex >= 0) {
			sepIndex++;
			textTmp = textTmp.substring(sepIndex, textTmp.length);
		}
		var textNode 		= document.createTextNode(textTmp);
		
		link.appendChild(textNode);
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
	 * --- GETTER SETTER for DS properties !
	 */
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
	
	/*
	 * ---- Utilities Method
	 */
	
	this.debugConsoleDir = function(object, title) {
		if (c_DebugFlag) {
			if (title != undefined)
				console.dir(title);
			
			console.dir(object);
		}
	}
	
	this.debugAlert = function(text) {
		if (c_DebugFlag) {
			alert(text);
		}
	}
});
