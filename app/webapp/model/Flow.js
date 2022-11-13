sap.ui.define([
	"./BaseObject"
], function (BaseObject) {
	"use strict";
	return BaseObject.extend("com.flexso.htf2022.model.Flow", {
		constructor: function (data) {
			BaseObject.call(this, data);
			this.resourceModel = data.resourceModel;
			this.flowId = '';
			this.FlowStreams; // Raw flows
			this.flowBars;
			this.flowBarSelected = false;
			this.flowLevels =  { 
                flowLevels : { LOW: 12, NORMAL: 14, HIGH: 16}, // L/min
                consumptionLevels: { LOW: 2, NORMAL: 3, HIGH: 4} // total consumption / day
            };
		},
		saveToHistory: function () {
			this.history = this.getJSONForHistory();
		},
		recoverHistory: function () {
			if (this.history) {
				this.copyFieldsToThis(this.history, ["type", "exists"]);
				this.options = JSON.parse(JSON.stringify(this.history.options));
				this.typeOptions = JSON.parse(JSON.stringify(this.history.typeOptions));
			}
		},
		getNameByKey: function (listname, key) {
			return this[listname] && this[listname].find(item => item.key === key);
		},
		// getJSON: function () {
		// 	return {};
		// },
		updateFlow: function(oFlow){
			for(const entry of Object.entries(oFlow)){
				this[entry[0]] = entry[1]
			}
		}
	});
});