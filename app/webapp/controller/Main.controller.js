/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageToast",
  ],
  function (BaseController, JSONModel, formatter, ODataModel, MessageToast) {
    "use strict";

    return BaseController.extend("com.flexso.htf2022.controller.Main", {
      formatter: formatter,

      onInit: function () {
        (Date.prototype.addDays = function (days) {
          var date = new Date(this.valueOf());
          date.setDate(date.getDate() + days);
          return date;
        }),
          (this.oModel = this.getOwnerComponent().getModel());
        this.FlowState = this.getOwnerComponent().FlowState;
        this.getView().setModel(this.FlowState.getModel(), "reg");

        this.readData(this.FlowState, this);
      },

      readData: function (FlowState) {
        // BASIC: Done
        // FlowState.getFlowStreams() returns the newest available dataset.
        // The other functions fill the different graphs with data.
        // At the moment, this only happens once at the start of the application.
        // Make it so that every 2 seconds, the graphs will be refreshed with new data.

        setTimeout(() => {
          FlowState.getFlowStreams().then((aFlows) => {
            this.createInteractiveBarChart(aFlows);
            const dToday = new Date();
            this._handleWizard(aFlows);
            this._handleTotalConsumptions();
            this._handleAverageConsumptions();
            this._handleLineGraph(dToday);
          });
        }, 2000);

        // ADVANCED:
        // When a tile is clicked, a separate window is opened to show extra details.
        // Notice that these details won't refresh automatically.
        // Manipulate the code so that te data in the newly opened window is updated, just like the tiles in the original page.
      },

      interactiveBarChartSelectionChanged: function (oEvent) {
        const oBar = oEvent.getParameter("bar");
        this._handleBarSelectedState(oBar);
        this._handleLineGraph(oBar.oBindingContexts.reg.getObject().date);
      },

      _handleBarSelectedState: function (oBar) {
        const flowBars = this.FlowState.getProperty("flow").flowBars;
        let flowBarSelected = false; // default
        flowBars.map((flowBar) => {
          if (this.dateFormatter(flowBar.date) === oBar.getLabel()) {
            flowBarSelected = true;
            flowBar.selected = true;
            this.FlowState.updateFlow({ selectedFlowBar: flowBar });
          } else {
            flowBar.selected = false;
          }
        });
        this.FlowState.updateFlow({ flowBarSelected: flowBarSelected });
      },

      _handleLineGraph: function () {
        const aFlowStreams = this.FlowState.getProperty("flow").FlowStreams;
        // BASIC
        // Only visualize the last 25 values.

        this.FlowState.updateFlow({ flowPoints: aFlowStreams });
      },

      _handleWizard: function (aFlows) {
        // ADVANCED
        // Get the last data point from aFlows and derive from its flow value if its excessive waste or not.
        // The flowLevels can be found in the flow model via flowState.flow.flowLevels
        // Check method getFlowQuote in the FlowState to see how it should be used.
      },

      _handleAverageConsumptions: function () {
        this._handleAverageMonth();
        this._handleAverageWeek();
        this._handleAverageToday();
      },

      _handleTotalConsumptions: function () {
        this._handleTotalMonth();
        this._handleTotalWeek();
        this._handleTotalToday();
      },

      _handleTotalMonth: function () {
        // BASIC: Done
        // Calculate the total consumption of this month.
        // Hint: Use method _countConsumption

        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const month = new Date(today.getFullYear(), today.getMonth(), 0);

        this.FlowState.updateFlow({
          totalConsumptionMonth: this._countConsumption(
            firstDay,
            month.getDate()
          ),
        });

        // ADVANCED
        // Calculate the difference in consumption between last month and this month.
        this._handleTotalMonthProgression();
      },

      _handleTotalMonthProgression: function (iTotal) {
        // ADVANCED
        // Hint: Calculate consumption of last month using _countConsumption
        // Hint: Use _compareConsumption for your comparisons.
        this.FlowState.updateFlow({
          totalConsumptionMonthPast: 0,
          totalConsumptionMonthValueState: "",
          totalConsumptionMonthIndicator: "",
        });
      },

      _handleAverageMonth: function () {
        const today = new Date();
        const daysInMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        ).getDate();

        const iTotal = this.FlowState.getProperty("flow").totalConsumptionMonth;
        // BASIC: Done
        // Calculate monthly average
        this.FlowState.updateFlow({
          averageConsumptionMonth: iTotal / daysInMonth,
        });

        // ADVANCED
        // Calculate the difference in consumption between last month and this month.
        this._handleAverageMonthProgression();
      },

      _handleAverageMonthProgression: function (iAverage) {
        // ADVANCED
        // Hint: Calculate average consumption of last month
        // Hint: Use method _compareConsumption for your calculations.
        this.FlowState.updateFlow({
          averageConsumptionMonthPast: 0,
          averageConsumptionMonthValueState: "",
          averageConsumptionMonthIndicator: "",
        });
      },

      _getFirstDayOfWeek: function (d) {
        // TODO: Refactor this eventually
        d = new Date(d);
        var day = d.getDay(),
          diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
      },

      _handleTotalWeek: function () {
        // BASIC: Done
        // Calculate the total consumption of this week.
        // Hint: Use method _countConsumption
        const today = new Date();
        const startOfWeek = this._getFirstDayOfWeek(today);

        this.FlowState.updateFlow({
          totalConsumptionWeek: this._countConsumption(startOfWeek, 7),
        });

        // ADVANCED
        // Calculate the difference in consumption between last week and this week.
        this._handleTotalWeekProgression();
      },

      _handleTotalWeekProgression: function (iTotal) {
        // ADVANCED
        // Hint: Calculate consumption of last month using _countConsumption
        // Hint: Use _compareConsumption for your comparisons.
        this.FlowState.updateFlow({
          totalConsumptionWeekPast: 0,
          totalConsumptionWeekValueState: "",
          totalConsumptionWeekIndicator: "",
        });
      },

      _handleAverageWeek: function () {
        const iTotal = this.FlowState.getProperty("flow").totalConsumptionWeek;
        // BASIC
        // Calculate weekly average
        this.FlowState.updateFlow({ averageConsumptionWeek: 0 });

        // ADVANCED
        // Calculate the difference in consumption between last week and this week.
        this._handleAverageWeekProgression();
      },

      _handleAverageWeekProgression: function (iAverage) {
        // ADVANCED
        // Hint: Calculate average consumption of last week
        // Hint: Use method _compareConsumption for your calculations.
        this.FlowState.updateFlow({
          averageConsumptionWeekPast: 0,
          averageConsumptionWeekValueState: "",
          averageConsumptionWeekIndicator: "",
        });
      },

      _handleTotalToday: function () {
        // BASIC
        // calculate the total consumption of today.
        // Hint: Use method _countConsumption

        this.FlowState.updateFlow({ totalConsumptionToday: 0 });

        // ADVANCED
        // Calculate the difference in consumption between yesterday and today.
        this._handleTotalTodayProgression();
      },

      _handleTotalTodayProgression: function (iTotal) {
        // ADVANCED
        // Hint: Calculate consumption of last month using _countConsumption
        // Hint: Use _compareConsumption for your comparisons.
        this.FlowState.updateFlow({
          totalConsumptionTodayPast: 0,
          totalConsumptionTodayValueState: "",
          totalConsumptionTodayIndicator: "",
        });
      },

      _handleAverageToday: function () {
        const iTotal = this.FlowState.getProperty("flow").totalConsumptionToday;
        // BASIC
        // Calculate todays average	consumption
        this.FlowState.updateFlow({ averageConsumptionToday: 0 });

        // ADVANCED
        // Calculate the difference in consumption between last week and this week.
        this._handleAverageTodayProgression();
      },

      _handleAverageTodayProgression: function (iAverage) {
        // Hint: Calculate average consumption of last week
        // Hint: Use method _compareConsumption for your calculations.
        this.FlowState.updateFlow({
          averageConsumptionTodayPast: 0,
          averageConsumptionTodayValueState: "",
          averageConsumptionTodayIndicator: "",
        });
      },

      _countConsumption: function (dStartDate, iDuration) {
        // duration in # days
        const dXDaysAgo = dStartDate.addDays(-iDuration);
        const aFlowStreams = this.FlowState.getProperty("flow").FlowStreams;

        let aFlows = aFlowStreams.filter((oFlow) => {
          let iFlowDate = oFlow.datetime;
          return iFlowDate > dXDaysAgo && iFlowDate <= dStartDate;
        });
        return this._calcConsumption(aFlows);
      },

      _compareConsumption: function (iTotalPast, iTotal) {
        let sValueState;
        if (iTotal > iTotalPast * 1.5) {
          // consumption has risen by a lot
          sValueState = "Error";
        } else if (iTotal > iTotalPast) {
          // consumption has risen a bit
          sValueState = "Critical";
        } else {
          // iTotal < iTotalPast // consumption is less than before
          sValueState = "Good";
        }
        let sIndicator;
        switch (sValueState) {
          case "Critical":
          case "Error":
            sIndicator = "Up";
            break;
          case "Good":
            sIndicator = "Down";
            break;
          default:
            sIndicator = "None";
            break;
        }
        return {
          sValueState: sValueState,
          sIndicator: sIndicator,
        };
      },

      pressTotalConsumptionMonth: function () {
        const oFlowModel = this.FlowState.getProperty("flow");
        const dToday = new Date();
        const dPastDate = dToday.addDays(-31);
        const sTimeSpan = `${this.formatDate(dPastDate)} - ${this.formatDate(
          dToday
        )}`;
        const sLastMonth = `${
          oFlowModel.totalConsumptionMonthPast
        } (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitMonth")})`;

        // BASIC
        // Calculate the difference between the total consumption of this month and total consumption of last month
        const iDifference = 0;

        const bState = iDifference > 0;
        const sDifference = `${iDifference.toFixed(2)} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitMonth")})`;
        this.FlowState.updateFlow({
          dialogTileHeader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("totalConsumption"),
          dialogTileSubheader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("thisMonth"),
          dialogTileUnit: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("unitMonth"),
          dialogTileValue: oFlowModel.totalConsumptionMonth,
          dialogTileValueColor: oFlowModel.totalConsumptionMonthValueState,
          dialogTileIndicator: oFlowModel.totalConsumptionMonthIndicator,
          dialogPrevSessionLabel: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("lastMonth"),
          dialogTileTimeSpan: sTimeSpan,
          dialogTileLastMonth: sLastMonth,
          dialogTileDifference: sDifference,
          dialogTileDifferenceState: bState,
        });
        this.onOpenGenericTileDialog();
      },

      pressTotalConsumptionWeek: function () {
        const oFlowModel = this.FlowState.getProperty("flow");
        const dToday = new Date();
        const dPastDate = dToday.addDays(-7);
        const sTimeSpan = `${this.formatDate(dPastDate)} - ${this.formatDate(
          dToday
        )}`;
        const sLastMonth = `${
          oFlowModel.totalConsumptionWeekPast
        } (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitWeek")})`;

        // BASIC
        // Calculate the difference between the total consumption of this week and total consumption of last week
        const iDifference = 0;

        const bState = iDifference > 0;
        const sDifference = `${iDifference.toFixed(2)} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitWeek")})`;
        this.FlowState.updateFlow({
          dialogTileHeader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("totalConsumption"),
          dialogTileSubheader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("thisWeek"),
          dialogTileUnit: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("unitWeek"),
          dialogTileValue: oFlowModel.totalConsumptionWeek,
          dialogTileValueColor: oFlowModel.totalConsumptionWeekValueState,
          dialogTileIndicator: oFlowModel.totalConsumptionWeekIndicator,
          dialogPrevSessionLabel: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("lastWeek"),
          dialogTileTimeSpan: sTimeSpan,
          dialogTileLastMonth: sLastMonth,
          dialogTileDifference: sDifference,
          dialogTileDifferenceState: bState,
        });
        this.onOpenGenericTileDialog();
      },

      pressTotalConsumptionToday: function () {
        const oFlowModel = this.FlowState.getProperty("flow");
        const dToday = new Date();
        const dPastDate = dToday.addDays(-1);
        const sTimeSpan = `${this.formatDate(dPastDate)} - ${this.formatDate(
          dToday
        )}`;
        const sLastMonth = `${
          oFlowModel.totalConsumptionTodayPast
        } (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitDay")})`;

        // BASIC
        // Calculate the difference between the total consumption of today and total consumption of yesterday
        const iDifference = 0;

        const bState = iDifference > 0;
        const sDifference = `${iDifference.toFixed(2)} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitDay")})`;
        this.FlowState.updateFlow({
          dialogTileHeader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("totalConsumption"),
          dialogTileSubheader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("last24Hours"),
          dialogTileUnit: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("unitDay"),
          dialogTileValue: oFlowModel.totalConsumptionToday,
          dialogTileValueColor: oFlowModel.totalConsumptionTodayValueState,
          dialogTileIndicator: oFlowModel.totalConsumptionTodayIndicator,
          dialogPrevSessionLabel: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("yesterday"),
          dialogTileTimeSpan: sTimeSpan,
          dialogTileLastMonth: sLastMonth,
          dialogTileDifference: sDifference,
          dialogTileDifferenceState: bState,
        });
        this.onOpenGenericTileDialog();
      },

      pressAverageConsumptionMonth: function () {
        const oFlowModel = this.FlowState.getProperty("flow");
        const dToday = new Date();
        const dPastDate = dToday.addDays(-31);
        const sTimeSpan = `${this.formatDate(dPastDate)} - ${this.formatDate(
          dToday
        )}`;
        const sLastMonth = `${oFlowModel.averageConsumptionMonthPast.toFixed(
          2
        )} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitDay")})`;

        // BASIC
        // Calculate the difference between the average consumption of this month and average consumption of last month
        const iDifference = 0;

        const bState = iDifference > 0;
        const sDifference = `${iDifference.toFixed(2)} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitDay")})`;
        this.FlowState.updateFlow({
          dialogTileHeader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("averageConsumption"),
          dialogTileSubheader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("thisMonth"),
          dialogTileUnit: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("unitDay"),
          dialogTileValue: oFlowModel.averageConsumptionMonth,
          dialogTileValueColor: oFlowModel.averageConsumptionMonthValueState,
          dialogTileIndicator: oFlowModel.averageConsumptionMonthIndicator,
          dialogPrevSessionLabel: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("lastMonth"),
          dialogTileTimeSpan: sTimeSpan,
          dialogTileLastMonth: sLastMonth,
          dialogTileDifference: sDifference,
          dialogTileDifferenceState: bState,
        });
        this.onOpenGenericTileDialog();
      },

      pressAverageConsumptionWeek: function () {
        const oFlowModel = this.FlowState.getProperty("flow");
        const dToday = new Date();
        const dPastDate = dToday.addDays(-7);
        const sTimeSpan = `${this.formatDate(dPastDate)} - ${this.formatDate(
          dToday
        )}`;
        const sLastMonth = `${oFlowModel.averageConsumptionWeekPast.toFixed(
          2
        )} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitDay")})`;

        // BASIC
        // Calculate the difference between the average consumption of this week and average consumption of last week
        const iDifference =
          oFlowModel.averageConsumptionWeek -
          oFlowModel.averageConsumptionWeekPast;

        const bState = iDifference > 0;
        const sDifference = `${iDifference.toFixed(2)} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitDay")})`;
        this.FlowState.updateFlow({
          dialogTileHeader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("averageConsumption"),
          dialogTileSubheader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("thisWeek"),
          dialogTileUnit: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("unitDay"),
          dialogTileValue: oFlowModel.averageConsumptionWeek,
          dialogTileValueColor: oFlowModel.averageConsumptionWeekValueState,
          dialogTileIndicator: oFlowModel.averageConsumptionWeekIndicator,
          dialogPrevSessionLabel: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("lastWeek"),
          dialogTileTimeSpan: sTimeSpan,
          dialogTileLastMonth: sLastMonth,
          dialogTileDifference: sDifference,
          dialogTileDifferenceState: bState,
        });
        this.onOpenGenericTileDialog();
      },

      pressAverageConsumptionToday: function () {
        const oFlowModel = this.FlowState.getProperty("flow");
        const dToday = new Date();
        const dPastDate = dToday.addDays(-1);
        const sTimeSpan = `${this.formatDate(dPastDate)} - ${this.formatDate(
          dToday
        )}`;
        const sLastMonth = `${oFlowModel.averageConsumptionTodayPast.toFixed(
          2
        )} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitHours")})`;

        // BASIC
        // Calculate the difference between the average consumption of today and average consumption of yesterday
        const iDifference = 0;

        const bState = iDifference > 0;
        const sDifference = `${iDifference.toFixed(2)} (${this.getView()
          .getModel("i18n")
          .getResourceBundle()
          .getText("unitHours")})`;
        this.FlowState.updateFlow({
          dialogTileHeader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("averageConsumption"),
          dialogTileSubheader: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("today"),
          dialogTileUnit: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("unitHours"),
          dialogTileValue: oFlowModel.averageConsumptionToday,
          dialogTileValueColor: oFlowModel.averageConsumptionTodayValueState,
          dialogTileIndicator: oFlowModel.averageConsumptionTodayIndicator,
          dialogPrevSessionLabel: this.getView()
            .getModel("i18n")
            .getResourceBundle()
            .getText("yesterday"),
          dialogTileTimeSpan: sTimeSpan,
          dialogTileLastMonth: sLastMonth,
          dialogTileDifference: sDifference,
          dialogTileDifferenceState: bState,
        });
        this.onOpenGenericTileDialog();
      },

      onOpenGenericTileDialog: function () {
        // create dialog lazily
        if (!this.oGenericTileDialog) {
          this.oGenericTileDialog = this.loadFragment({
            name: "com.flexso.htf2022.view.dialogs.GenericTileDialog",
          });
        }
        this.oGenericTileDialog.then((oDialog) => {
          oDialog.open();
        });
      },

      onCloseGenericTileDialog: function () {
        this.oGenericTileDialog.then((oDialog) => {
          oDialog.close();
        });
      },

      pressDialogTile: async function () {
        const oFlow = this.FlowState.getProperty("flow");
        const sFlowState = oFlow.dialogTileValueColor;
        let oFlowHint = await this.FlowState.getFlowHint(sFlowState);

        // ADVANCED
        // Show something on the screen using the received hint. Be creative!
      },

      createInteractiveBarChart: function (aFlows) {
        let aFlowBars = [];

        // BASIC
        // Filter the data to only get values of the past week (including today)
        let aFilterFlows = [];

        let mMappedFilterFlows = new Map();

        aFilterFlows.forEach((flow) => {
          let date = flow.datetime.toDateString();
          if (!mMappedFilterFlows.has(date)) {
            mMappedFilterFlows.set(date, [flow]);
          } else {
            mMappedFilterFlows.set(date, [
              ...mMappedFilterFlows.get(date),
              flow,
            ]);
          }
        });

        let self = this;
        mMappedFilterFlows.forEach((v, k) => {
          aFlowBars.push({
            // Set new bar
            date: new Date(k),
            consumption: self._calcConsumption(v),
            selected: false, // default unselected
          });
        });

        this.FlowState.updateFlow({ flowBars: aFlowBars });
      },

      _calcConsumption: function (aFlows) {
        let iTotal = 0;
        for (let i = 0; i < aFlows.length; i++) {
          let prev = aFlows[i - 1];
          if (prev) {
            let curr = aFlows[i];
            let currConsumption = (prev.flow + curr.flow) / 2 / 60;
            iTotal += currConsumption;
          }
        }
        return iTotal;
      },

      formatDate: function (dDate) {
        return [
          this.padTo2Digits(dDate.getDate()),
          this.padTo2Digits(dDate.getMonth() + 1),
          dDate.getFullYear(),
        ].join("/");
      },

      padTo2Digits: function (iNum) {
        return iNum.toString().padStart(2, "0");
      },

      flowFormatter: function (flow) {
        if (flow === null) return null;
        return parseFloat((Math.round(flow * 100) / 100).toFixed(2));
      },

      consumptionFormatter: function (flow) {
        if (flow === null) return null;
        return (
          parseFloat((Math.round(flow * 100) / 100).toFixed(2)).toString() + "L"
        );
      },

      timeFormatter: function (date) {
        if (date === null) return null;
        const dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "HH:mm",
        });
        return dateFormat.format(date);
      },

      dateFormatter: function (date) {
        if (date === null) return null;
        const dateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "dd/MM",
        });
        return dateFormat.format(date);
      },
    });
  }
);
