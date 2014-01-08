/**
 *  Individual Panel Type Controllers
 *  These controllers will be specified via the panel directive
 */
angular.module("aws.panelControllers", [])
.controller("ScriptCtrl", function($scope, queryService){
	
	// array of column selected
	$scope.selection = []; 
	
	// array of filter types, can either be categorical (true) or continuous (false).
	$scope.filterType = [];
	
	// array of boolean values, true when the column it is possible to apply a filter on the column, 
	// we basically check if the metadata has varType, min, max etc...
	$scope.show = [];
	
	// the slider options for the columns, min, max etc... Array of object, comes from the metadata
	$scope.sliderOptions = [];
	
	// the categorical options for the columns, Array of string Arrays, comes from metadata, 
	// this is provided in the ng-repeat for the select2
	$scope.categoricalOptions = [];
	
	// array of filter values. This is used for the model and is sent to the queryObject, each element is either
	// [min, max] or ["a", "b", "c", etc...]
	$scope.filterValues = [];
	
	// array of booleans, either true of false if we want filtering enabled
	$scope.enabled = [];
	
	$scope.scriptList = queryService.getListOfScripts();
	
	$scope.$watch('scriptSelected', function() {
		if($scope.scriptSelected != undefined) {
			if($scope.scriptSelected != ""){
				queryService.queryObject.scriptSelected = $scope.scriptSelected;
				queryService.getScriptMetadata($scope.scriptSelected);			// reinitialize and apply to model
			}
		}
		// reset these values when the script changes
		$scope.selection = []; 
		$scope.filterType = [];
		$scope.show = [];
		$scope.sliderOptions = [];
		$scope.categoricalOptions = [];
		$scope.filterValues = [];
		$scope.enabled = [];
	});
	
	$scope.$watch(function() {
		return queryService.queryObject.scriptSelected;
	}, function(newVal, oldVal) {
		$scope.scriptSelected = newVal;
		
		// reset these values when the script changes
		$scope.selection = []; 
		$scope.filterType = [];
		$scope.show = [];
		$scope.sliderOptions = [];
		$scope.categoricalOptions = [];
		$scope.filterValues = [];
		$scope.enabled = [];
	});
	
	$scope.$watch(function(){
		return queryService.dataObject.scriptMetadata;
	}, function(newVal, oldVal) {
		if(newVal) {
			$scope.inputs = newVal.inputs;
		}
	});
	
	$scope.columns = [];
	
	$scope.$watch(function(){
		return queryService.queryObject.dataTable;
	}, function(){
			if(queryService.queryObject.hasOwnProperty("dataTable")) {
				if(queryService.queryObject.dataTable.hasOwnProperty("id")) {
					$scope.columns = queryService.getDataColumnsEntitiesFromId(queryService.queryObject.dataTable.id).then(function(result){
						var orderedColumns = {};
						for(var i = 0; i  < result.length; i++) {
							if (result[i].publicMetadata.hasOwnProperty("aws_metadata")) {
								var aws_metadata = angular.fromJson(result[i].publicMetadata.aws_metadata);
								if(aws_metadata.hasOwnProperty("columnType")) {
									var key = aws_metadata.columnType;
									if(!orderedColumns.hasOwnProperty(key)) {
										orderedColumns[key] = [result[i]];
									} else {
										orderedColumns[key].push(result[i]);
									}
								}
							}
						}
						orderedColumns['any'] = result;
						return orderedColumns;
					});
				}
			}
			// reset these values when the data table changes
			$scope.selection = []; 
			$scope.filterType = [];
			$scope.show = [];
			$scope.sliderOptions = [];
			$scope.categoricalOptions = [];
			$scope.filterValues = [];
			$scope.enabled = [];
	}, true);
		
	$scope.$watch('selection', function(){
		queryService.queryObject['FilteredColumnRequest'] = [];
		for(var i = 0; i < $scope.selection.length; i++) {
			queryService.queryObject['FilteredColumnRequest'][i] = {};
			if($scope.selection != undefined) {
				if ($scope.selection[i] != ""){
					var selection = angular.fromJson($scope.selection[i]);
					
					queryService.queryObject['FilteredColumnRequest'][i] = {
																			id : selection,
																			filters : []
																		};

					var column = angular.fromJson($scope.selection[i]);
					
					if(column.publicMetadata.hasOwnProperty("aws_metadata")) {
						var metadata = angular.fromJson(column.publicMetadata.aws_metadata);
						if (metadata.hasOwnProperty("varType")) {
							if (metadata.varType == "continuous") {
								$scope.filterType[i] = "continuous"; // false for continuous, true for categorical
								if(metadata.hasOwnProperty("varRange")) {
									$scope.show[i] = true;
									$scope.sliderOptions[i] = { range:true, min: metadata.varRange[0], max: metadata.varRange[1]};
								}
							} else if (metadata.varType == "categorical") {
								$scope.filterType[i] = "categorical"; // false for continuous, true for categorical
								if(metadata.hasOwnProperty("varValues")) {
									$scope.show[i] = true;
									$scope.categoricalOptions[i] = metadata.varValues;
								}
							}
						}
					} else {
						// disable these when there is no aws_metadata
						$scope.show[i] = false;
						$scope.sliderOptions[i] = [];
						$scope.categoricalOptions[i] = [];
					}
					
				} // end if ""
			} // end if undefined
			if($scope.filterValues != undefined) {
				if(($scope.filterValues != undefined) && $scope.filterValues != "") {
					if($scope.filterValues[i] != undefined) {
						var temp = $.map($scope.filterValues[i],function(item){
							if (angular.fromJson(item).hasOwnProperty("value")) {
								return angular.fromJson(item).value;
							}
							else {
								return angular.fromJson(item);
							}
						});
						
						if ($scope.filterType[i] == "categorical") { 
							queryService.queryObject.FilteredColumnRequest[i].filters = temp;
						} else if ($scope.filterType[i] == "continuous") { // continuous, we want arrays of ranges
							queryService.queryObject.FilteredColumnRequest[i].filters = [temp];
						}
					}
				}
			}
		} // end for
	}, true);

	$scope.$watch('filterValues', function(){
		for(var i = 0; i < $scope.selection.length; i++) {
			if(($scope.filterValues != undefined) && $scope.filterValues != "") {
				if($scope.filterValues[i] != undefined && $scope.filterValues[i] != []) {
					
					var temp = $.map($scope.filterValues[i],function(item){
						if (angular.fromJson(item).hasOwnProperty("value")) {
							return angular.fromJson(item).value;
						}
						else {
							return angular.fromJson(item);
						}					
					});
					
					if ($scope.filterType[i] == "categorical") { 
						queryService.queryObject.FilteredColumnRequest[i].filters = temp;
					} else if ($scope.filterType[i] == "continuous") { // continuous, we want arrays of ranges
						queryService.queryObject.FilteredColumnRequest[i].filters = [temp];
					}
				
				} else {
					if (queryService.queryObject.FilteredColumnRequest[i].hasOwnProperty("id")) {
						queryService.queryObject.FilteredColumnRequest[i].filters = [];
					}
				}
			}
		}
	}, true);
	$scope.$watch('enabled', function(){
		for(var i = 0; i < $scope.selection.length; i++) {
			if(($scope.enabled != undefined) && $scope.enabled != []) {
				if($scope.enabled[i] != undefined && $scope.enabled == true) {
					var temp = $.map($scope.filterValues[i],function(item){
						if (angular.fromJson(item).hasOwnProperty("value")) {
							return angular.fromJson(item).value;
						}
						else {
							return angular.fromJson(item);
						}					
					});
					queryService.queryObject.FilteredColumnRequest[i].filters = temp;
				} else if($scope.enabled[i] == undefined || $scope.enabled[i] == false) {
						if(queryService.queryObject.FilteredColumnRequest[i]) {
							if (queryService.queryObject.FilteredColumnRequest[i].hasOwnProperty("id")) {
								$scope.filterValues[i] = null;
							}
						}
				 }
			} 
		}
	}, true);
})

// MAP TOOL CONTROLLER
.controller("MapToolPanelCtrl", function($scope, queryService){
	
	queryService.queryObject.MapTool = {
											enabled : "false",
											id : "",
											title : "",
											keyType : ""
									   };
	
	queryService.getGeometryDataColumnsEntities();
	$scope.ids = [];
	
	$scope.$watch(function() {
		return queryService.dataObject.geometryColumns;
	}, function () {
		if(queryService.dataObject.hasOwnProperty('geometryColumns')){
			var geometryColumns = queryService.dataObject.geometryColumns;
			for (var i = 0; i < geometryColumns.length; i++) {
				$scope.ids.push(geometryColumns[i].id);
			}
		}
	});

	$scope.$watch('enabled', function() {
		if($scope.enabled != undefined) {
			queryService.queryObject.MapTool.enabled = $scope.enabled;
		}
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.MapTool.enabled;
	}, function() {
		$scope.enabled = queryService.queryObject.MapTool.enabled;
	});
		
	$scope.$watch('selected', function() {
		queryService.queryObject.MapTool.id = $scope.selected;
		queryService.queryObject.MapTool.title = getTitleFromId($scope.selected);
		queryService.queryObject.MapTool.keyType = getKeyTypeFromId($scope.selected);
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.MapTool.id;
	}, function() {
		$scope.id = queryService.queryObject.MapTool.id;	
	});
	
	var getTitleFromId = function(id) {
		id = 1076;
		if(queryService.dataObject.hasOwnProperty("geometryColumns")) {
			for(var i = 0; i < queryService.dataObject.geometryColumns.length; i++) {
				var column = queryService.dataObject.geometryColumns[i];
				if (column.id == id) {
					return column.publicMetadata.title;
				}
			}
		}
	}
	
	var getKeyTypeFromId = function(id) {
		if(queryService.dataObject.hasOwnProperty("geometryColumns")) {
			for(var i = 0; i < queryService.dataObject.geometryColumns.length; i++) {
				var column = queryService.dataObject.geometryColumns[i];
				if (column.id == id) {
					return column.publicMetadata.keyType;
				}
			}
		}
	}
})

// BARCHART CONTROLLER
.controller("BarChartToolPanelCtrl", function($scope, queryService){

	queryService.queryObject.BarChartTool = { 
											 enabled : false,
											 heights : [],
											 sort : "",
											 label : ""
											};

	$scope.options = [];
	
	$scope.$watch(function(){
		return queryService.dataObject.scriptMetadata;
	}, function() {
		if(queryService.dataObject.hasOwnProperty("scriptMetadata")) {
			if(queryService.dataObject.scriptMetadata.hasOwnProperty("outputs")) {
				var outputs = queryService.dataObject.scriptMetadata.outputs;
				for( var i = 0; i < outputs.length; i++) {
					$scope.options.push(outputs[i].param);
				}
			}
		}
	});		
	
	$scope.$watch('enabled', function() {
		if($scope.enabled != undefined) {
			queryService.queryObject.BarChartTool.enabled = $scope.enabled;
		}
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.BarChartTool.enabled;
	}, function() {
		$scope.enabled = queryService.queryObject.BarChartTool.enabled;
	});
	
	$scope.$watch('heights', function() {

		if($scope.heights != undefined) {
			queryService.queryObject.BarChartTool.heights = $scope.heights;
		}
		
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.BarChartTool.heights;
	}, function() {
		$scope.heights = queryService.queryObject.BarChartTool.heights;	
	});

	$scope.$watch('sort', function() {
		if($scope.sort != undefined) {
			queryService.queryObject.BarChartTool.sort = $scope.sort;
		}
		
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.BarChartTool.sort;
	}, function() {
		$scope.sort = queryService.queryObject.BarChartTool.sort;	
	});
	
	$scope.$watch('label', function() {
		if($scope.label != undefined) {
			queryService.queryObject.BarChartTool.label = $scope.label;
		}
		
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.BarChartTool.label;
	}, function() {
		$scope.label = queryService.queryObject.BarChartTool.label;	
	});
	
})

// DATA TABLE CONTROLLER
.controller("DataTablePanelCtrl", function($scope, queryService){
	queryService.queryObject.DataTableTool = { 
											 enabled : false,
											 selected : []
											};

	$scope.options = [];
	
	$scope.$watch(function(){
		return queryService.dataObject.scriptMetadata;
	}, function() {
		if(queryService.dataObject.hasOwnProperty("scriptMetadata")) {
			if(queryService.dataObject.scriptMetadata.hasOwnProperty("outputs")) {
				var outputs = queryService.dataObject.scriptMetadata.outputs;
				for( var i = 0; i < outputs.length; i++) {
					$scope.options.push(outputs[i].param);
				}
			}
		}
	});

	
	$scope.$watch('enabled', function() {
		if($scope.enabled != undefined) {
			queryService.queryObject.DataTableTool.enabled = $scope.enabled;
		}
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.DataTableTool.enabled;
	}, function() {
		$scope.enabled = queryService.queryObject.DataTableTool.enabled;
	});
	
	$scope.$watch('selected', function() {
		if($scope.selected != undefined) {
			queryService.queryObject.DataTableTool.selected = $scope.selected;
		}
		
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.DataTableTool.selected;
	}, function() {
		$scope.selected = queryService.queryObject.DataTableTool.selected;	
	});
})

// SCATTERPLOT CONTROLLER
.controller("ScatterPlotToolPanelCtrl", function($scope, queryService) {
	queryService.queryObject.ScatterPlotTool = { 
											 enabled : false,
											 X : "",
											 Y : "" 
											};

	$scope.options = [];
	
	$scope.$watch(function(){
		return queryService.dataObject.scriptMetadata;
	}, function() {
		if(queryService.dataObject.hasOwnProperty("scriptMetadata")) {
			if(queryService.dataObject.scriptMetadata.hasOwnProperty("outputs")) {
				var outputs = queryService.dataObject.scriptMetadata.outputs;
				for( var i = 0; i < outputs.length; i++) {
					$scope.options.push(outputs[i].param);
				}
			}
		}
	});

	
	$scope.$watch('enabled', function() {
		if($scope.enabled != undefined){
			queryService.queryObject.ScatterPlotTool.enabled = $scope.enabled;
		}
		
	});
	$scope.$watch(function(){
		return queryService.queryObject.ScatterPlotTool.enabled;
	}, function() {
		$scope.enabled = queryService.queryObject.ScatterPlotTool.enabled;	
	});

	

	$scope.$watch('XSelection', function() {
		if($scope.XSelection != undefined){
			queryService.queryObject.ScatterPlotTool.X = $scope.XSelection;
		}
		
	});
	$scope.$watch(function(){
		return queryService.queryObject.ScatterPlotTool.XSelection;
	}, function() {
		$scope.XSelection = queryService.queryObject.ScatterPlotTool.XSelection;	
	});

	

	$scope.$watch('YSelection', function() {
		if($scope.YSelection != undefined){
			queryService.queryObject.ScatterPlotTool.Y = $scope.YSelection;
		}
	});
	$scope.$watch(function(){
		return queryService.queryObject.ScatterPlotTool.YSelection;
	}, function() {
		$scope.YSelection = queryService.queryObject.ScatterPlotTool.YSelection;	
	});
})


// COLOR CONTROLLER
.controller("ColorColumnPanelCtrl", function($scope, queryService){

	queryService.queryObject.ColorColumn = { 
											 enabled : false,
											 selected : ""
											};

	$scope.options = [];
	
	$scope.$watch(function(){
		return queryService.dataObject.scriptMetadata;
	}, function() {
		if(queryService.dataObject.hasOwnProperty("scriptMetadata")) {
			if(queryService.dataObject.scriptMetadata.hasOwnProperty("outputs")) {
				var outputs = queryService.dataObject.scriptMetadata.outputs;
				for( var i = 0; i < outputs.length; i++) {
					$scope.options.push(outputs[i].param);
				}
			}
		}
	});
	
		
	/*** double binding *****/
	$scope.$watch('enabled', function() {
		if($scope.enabled != undefined) {
			queryService.queryObject.ColorColumn.enabled = $scope.enabled;
		}
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.ColorColumn.enabled;
	}, function() {
		$scope.enabled = queryService.queryObject.ColorColumn.enabled;
	});

	$scope.$watch('selected', function() {
		if($scope.selected != undefined) {
			queryService.queryObject.ColorColumn.selected = $scope.selected;
		}
		
	});
	
	$scope.$watch(function(){
		return queryService.queryObject.ColorColumn.selected;
	}, function() {
		$scope.selected = queryService.queryObject.ColorColumn.selected;	
	});
	/**************************/
});