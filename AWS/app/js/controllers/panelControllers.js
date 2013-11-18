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
				queryService.queryObject['scriptSelected'] = $scope.scriptSelected;
				$scope.inputs = queryService.getScriptMetadata($scope.scriptSelected).then(function(result){			// reinitialize and apply to model
					$scope.scriptType = result.scriptType;
					queryService.queryObject['scriptType'] = result.scriptType;
					return result.inputs;
				});
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
				if($scope.scriptSelected != undefined) {
					if($scope.scriptSelected != ""){
						queryService.queryObject['scriptSelected'] = $scope.scriptSelected;
						$scope.inputs = queryService.getScriptMetadata($scope.scriptSelected).then(function(result){			// reinitialize and apply to model
							return result.inputs;
						});
					}
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
																			id : selection.id,
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
.controller("MapToolPanelCtrl", function($scope, queryService){
	
	$scope.options = queryService.getGeometryDataColumnsEntities();

	$scope.$watch('enabled', function() {
		if ($scope.enabled == true) {
			queryService.queryObject['MapTool'] = {};
			if($scope.selection != "") {
				var metadata = angular.fromJson($scope.selection);
				if(metadata != "" && metadata != undefined) {
					if ($scope.enabled) {	
						queryService.queryObject['MapTool'] = {
								id : metadata.id,
								title : metadata.publicMetadata.title,
								keyType : metadata.publicMetadata.keyType
						};
					}
				}
			}
		} else {
			delete queryService.queryObject['MapTool'];
			$scope.selection = "";
		}
		
	});
	
	$scope.$watch('selection', function() {
		if($scope.selection != "") {
			var metadata = angular.fromJson($scope.selection);
			if(metadata != "" && metadata != undefined) {
				if ($scope.enabled) {	
					queryService.queryObject['MapTool'] = {
							weaveEntityId : metadata.id,
							title : metadata.publicMetadata.title,
							keyType : metadata.publicMetadata.keyType
					};
				}
			}
		}
	});
	
})

.controller("BarChartToolPanelCtrl", function($scope, queryService){

	$scope.$watch(function(){
		return queryService.queryObject.scriptSelected;
	}, function() {
		if (queryService.queryObject.hasOwnProperty('scriptSelected')) {
			$scope.options = queryService.getScriptMetadata(queryService.queryObject.scriptSelected).then(function(result){
				return result.outputs;
			});
		}
	});
	$scope.$watch('enabled', function() {
		queryService.queryObject['BarChartTool'] = {};
		if ($scope.enabled == true) {
			if($scope.sortSelection != "" && $scope.sortSelection != undefined) {
					queryService.queryObject['BarChartTool']['sort'] = angular.fromJson($scope.sortSelection).param;
			}
			if($scope.heightSelection != "" && $scope.heightSelection != undefined) {
				queryService.queryObject['BarChartTool']['heights'] =  $.map($scope.heightSelection, function(item){
					return angular.fromJson(item).param;
				});
			}
			if($scope.labelSelection != "" && $scope.labelSelection != undefined) {
				queryService.queryObject['BarChartTool']['label'] = angular.fromJson($scope.labelSelection).param;
			}
		} else {
			delete queryService.queryObject['BarChartTool'];
			$scope.sortSelection = "";
			$scope.heightSelection = "";
			$scope.labelSelection = "";
		}
		
	});
	
	$scope.$watch('sortSelection', function() {
		if($scope.sortSelection != "" && $scope.sortSelection != undefined) {
			if ($scope.enabled) {	
				queryService.queryObject['BarChartTool']['sort'] = angular.fromJson($scope.sortSelection).param;
			}
		}
	});
	
	$scope.$watch('heightSelection', function() {
		if($scope.heightSelection != "" && $scope.heightSelection != undefined) {
			if ($scope.enabled) {	
				queryService.queryObject['BarChartTool']['heights'] =  $.map($scope.heightSelection, function(item){
					return angular.fromJson(item).param;
				});
			}
		}
	});
	
	$scope.$watch('labelSelection', function() {
		if($scope.labelSelection != "" && $scope.labelSelection != undefined) {
			if ($scope.enabled) {	
				queryService.queryObject['BarChartTool']['label'] = angular.fromJson($scope.labelSelection).param;
			}
		}
	});
})
.controller("DataTablePanelCtrl", function($scope, queryService){
	$scope.$watch(function(){
		return queryService.queryObject.scriptSelected;
	}, function() {
		if (queryService.queryObject.hasOwnProperty('scriptSelected')) {
			$scope.options = queryService.getScriptMetadata(queryService.queryObject.scriptSelected).then(function(result){
				return result.outputs;
			});
		}
	});

	$scope.$watch('enabled', function() {
		queryService.queryObject['DataTable'] = {};
		if ($scope.enabled == true) {
			if($scope.selection != "" && $scope.selection != undefined) {
				queryService.queryObject['DataTable']['columns'] =  $.map($scope.selection, function(item){
					return angular.fromJson(item).param;
				});
			}
		} else {
			delete queryService.queryObject['DataTable'];
			$scope.selection = "";
		}
	});
	
	$scope.$watch('selection', function() {
		if($scope.selection != "" && $scope.selection != undefined) {
			queryService.queryObject['DataTable']['columns'] =  $.map($scope.selection, function(item){
				return angular.fromJson(item).param;
			});
		}
	});
})
.controller("ScatterPlotToolPanelCtrl", function($scope, queryService) {
	$scope.$watch(function(){
		return queryService.queryObject.scriptSelected;
	}, function() {
		if (queryService.queryObject.hasOwnProperty('scriptSelected')) {
			$scope.options = queryService.getScriptMetadata(queryService.queryObject.scriptSelected).then(function(result){
				return result.outputs;
			});
		}
	});

	$scope.$watch('enabled', function() {
		queryService.queryObject['ScatterPlotTool'] = {};
		if ($scope.enabled == true) {
			if($scope.XSelection != "" && $scope.XSelection != undefined) {
					queryService.queryObject['ScatterPlotTool']['X'] = angular.fromJson($scope.XSelection).param;
			}
			if($scope.YSelection != "" && $scope.YSelection != undefined) {
				queryService.queryObject['ScatterPlotTool']['Y'] = angular.fromJson($scope.YSelection).param;
			}
		} else {
			delete queryService.queryObject['ScatterPlotTool'];
			$scope.XSelection = "";
			$scope.YSelection = "";
		}
		
	});
	
	$scope.$watch('XSelection', function() {
		if($scope.XSelection != "" && $scope.XSelection != undefined) {
			if ($scope.enabled) {	
				queryService.queryObject['ScatterPlotTool']['X'] = angular.fromJson($scope.XSelection).param;
			}
		}
	});
	
	$scope.$watch('YSelection', function() {
		if($scope.YSelection != "" && $scope.YSelection != undefined) {
			if ($scope.enabled) {	
				queryService.queryObject['ScatterPlotTool']['Y'] = angular.fromJson($scope.YSelection).param;
			}
		}
	});
})
.controller("ColorColumnPanelCtrl", function($scope, queryService){

	$scope.$watch(function(){
		return queryService.queryObject.scriptSelected;
	}, function() {
		if (queryService.queryObject.hasOwnProperty('scriptSelected')) {
			$scope.options = queryService.getScriptMetadata(queryService.queryObject.scriptSelected).then(function(result){
				return result.outputs;
			});
		}
	});
	
	$scope.$watch('enabled', function() {
		queryService.queryObject['ColorColumn'] = "";
		if ($scope.enabled == true) {
			if($scope.selection != "" && $scope.selection != undefined) {
					queryService.queryObject['ColorColumn'] = angular.fromJson($scope.selection).param;
			}
		} else {
			delete queryService.queryObject['ColorColumn'];
			$scope.selection = "";
		}
	});
	
	$scope.$watch('selection', function() {
		if($scope.selection != "" && $scope.selection != undefined) {
			if ($scope.enabled) {	
				queryService.queryObject['ColorColumn'] = angular.fromJson($scope.selection).param;
			}
		}
	});
});