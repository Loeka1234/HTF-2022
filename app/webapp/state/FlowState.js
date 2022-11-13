sap.ui.define([
    "./BaseState",
    "../model/Flow",
], function (BaseState, Flow) {
    "use strict";
    var FlowState = BaseState.extend("com.flexso.htf2022.state.FlowState", {
        constructor: function (opt) {
            this.resourceModel = opt.resourceModel;
            this.service = opt.service;
            this.data = {
                flow: new Flow({ resourceModel: this.resourceModel })
            };
            BaseState.call(this);
        },

        getFlowStreams: function(){
            return new Promise((resolve, reject) => {
				this.getService().getFlowStreams().then((oResult)=>{
                    const aFlows = this._saveFlows(oResult);
                    resolve(aFlows);
                }).catch((oError)=>{
                    reject(oError);
                });
			});
        },
        getFlowHint: function(sFlowState){
            return new Promise((resolve, reject) => {
				this.getService().getFlowHints().then((aResults)=>{
                    let aFiltered = aResults.filter((oResult) => oResult.state === sFlowState);
                    let oHint = aFiltered[Math.floor(Math.random() * aFiltered.length)];
                    this.updateFlow({oHint: oHint});
                    resolve(oHint);
                }).catch((oError)=>{
                    reject(oError);
                });
			});
        },

        getFlowQuote: function(bIsGood){
            return new Promise((resolve, reject) => {
				this.getService().getFlowQuotes(bIsGood).then((aResults)=>{
                    let bFilterVal = bIsGood ? "GOOD" : "BAD";
                    let aFiltered = aResults.filter((oResult) => oResult.type === bFilterVal);
                    let oQuote = aFiltered[Math.floor(Math.random() * aFiltered.length)];
                    if ( !this.getProperty("flow").oQuote ) {
                        this.updateFlow({oQuote: oQuote});
                    }
                    if ( this.getProperty("flow").oQuote && this.getProperty("flow").oQuote.type !== oQuote.type ) {
                        this.updateFlow({oQuote: oQuote});
                    } 
                    resolve(oQuote);
                }).catch((oError)=>{
                    reject(oError);
                });
			});
        },

        _saveFlows: function(aFlows){
            let aParsedFlows;
            if(aFlows){
                aParsedFlows = this._parseFlows(aFlows);
                this.updateFlow({FlowStreams: aParsedFlows});
            }
            return aParsedFlows;
        },
        _parseFlows: function(aFlows){
            aFlows.forEach((oFlow) => {
                oFlow.flow = parseFloat(oFlow.flow);
                oFlow.datetime = new Date(oFlow.datetime);
            });
            return aFlows;
        },
        updateFlow: function (oFlow) {
            this.getProperty("flow").updateFlow(oFlow);
            this.updateModel();
        },
        getFlowJSON: function(){
            return this.getProperty("flow").getJSON();
        },
        getService: function () {
            return this.service;
        }
    });
    return FlowState;
});