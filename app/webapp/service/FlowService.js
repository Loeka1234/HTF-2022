/* global axios: true */
sap.ui.define([
    "sap/ui/base/Object",
    "../libs/axios.min"
], function (Object, axiosjs) {
    "use strict";

    var FlowService = Object.extend("com.waterleau.hu.optimizinghuprocess.state.FlowService", {
        constructor: function (model) {
            Object.call(this);
            this.model = model;
            this.serviceUrl = this.model.sServiceUrl;

            axios.defaults.headers.common['Content-Type'] = "application/json";
            axios.defaults.headers.common['Accept'] = "application/json";
        },
        getFlowStreams: function () {
            return axios.get(`${this.serviceUrl}\/FlowStream`).then((oResult) => {
                return oResult.data.d.results;
            });
        },
        getFlowHints: function () {
            return axios.get(`${this.serviceUrl}\/FlowHint`).then((oResult) => {
                return oResult.data.d.results;
            });
        },
        getFlowQuotes: function () {
            return axios.get(`${this.serviceUrl}\/GandalfQuote`).then((oResult) => {
                return oResult.data.d.results;
            });

        }
    });
    return FlowService;
});