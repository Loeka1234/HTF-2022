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
      _currentClicked: "",

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

        setInterval(() => {
          FlowState.getFlowStreams().then((aFlows) => {
            this.createInteractiveBarChart(aFlows);
            const dToday = new Date();
            this._handleWizard(aFlows);
            this._handleTotalConsumptions();
            this._handleAverageConsumptions();
            this._handleLineGraph(dToday);
            this._handleTileUpdates();
          });
        }, 2000);

        // ADVANCED:
        // When a tile is clicked, a separate window is opened to show extra details.
        // Notice that these details won't refresh automatically.
        // Manipulate the code so that te data in the newly opened window is updated, just like the tiles in the original page.
      },

      _handleTileUpdates: function () {
        switch (this._currentClicked) {
          case "AverageConsumptionToday":
            this._recalculateAverageConsumptionToday();
            break;
          case "AverageConsumptionWeek":
            this._recalculateAverageConsumptionWeek();
            break;
          case "AverageConsumptionMonth":
            this._recalculateAverageConsumptionMonth();
            break;
          case "TotalConsumptionToday":
            this._recalculateTotalConsumptionToday();
            break;
          case "TotalConsumptionWeek":
            this._recalculateTotalConsumptionWeek();
            break;
          case "TotalConsumptionMonth":
            this._recalculateTotalConsumptionMonth();
            break;
        }
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
        // BASIC: Done
        // Only visualize the last 25 values.

        this.FlowState.updateFlow({ flowPoints: aFlowStreams.slice(-25) });
      },

      _handleWizard: function (aFlows) {
        // ADVANCED: Done
        // Get the last data point from aFlows and derive from its flow value if its excessive waste or not.
        // The flowLevels can be found in the flow model via flowState.flow.flowLevels
        // Check method getFlowQuote in the FlowState to see how it should be used.
        this.FlowState.getFlowQuote(
          aFlows[aFlows.length - 1].flow <
            this.FlowState.data.flow.flowLevels.flowLevels.NORMAL
        );
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

        this.FlowState.updateFlow({
          totalConsumptionMonth: this._countConsumption(today, today.getDate()),
        });

        // ADVANCED: Done
        // Calculate the difference in consumption between last month and this month.
        this._handleTotalMonthProgression();
      },

      _handleTotalMonthProgression: function (iTotal) {
        // ADVANCED: Done
        const today = new Date();
        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        const lastMonthEnd = new Date(
          today.getFullYear(),
          lastMonthStart.getMonth(),
          lastMonthStart.getDate()
        );
        const lastMonthTotal = this._countConsumption(
          lastMonthEnd,
          lastMonthStart.getDate()
        );

        const { sValueState, sIndicator } = this._compareConsumption(
          lastMonthTotal,
          iTotal
        );

        // Hint: Calculate consumption of last month using _countConsumption
        // Hint: Use _compareConsumption for your comparisons.
        this.FlowState.updateFlow({
          totalConsumptionMonthPast: lastMonthTotal,
          totalConsumptionMonthValueState: sValueState,
          totalConsumptionMonthIndicator: sIndicator,
        });
      },

      _handleAverageMonth: function () {
        const iTotal = this.FlowState.getProperty("flow").totalConsumptionMonth;
        const today = new Date();
        const month = new Date(today.getFullYear(), today.getMonth(), 0);

        // BASIC: Done
        // Calculate monthly average
        this.FlowState.updateFlow({
          averageConsumptionMonth: iTotal / month.getDate(),
        });

        // ADVANCED: Done
        // Calculate the difference in consumption between last month and this month.
        this._handleAverageMonthProgression();
      },

      _handleAverageMonthProgression: function (iAverage) {
        const today = new Date();
        const lastMonthStart = new Date(
          today.getFullYear(),
          today.getMonth(),
          0
        );
        const lastMonthEnd = new Date(
          today.getFullYear(),
          lastMonthStart.getMonth(),
          lastMonthStart.getDate()
        );
        const lastMonthTotal =
          this._countConsumption(lastMonthEnd, lastMonthStart.getDate()) /
          lastMonthStart.getDate();

        const { sValueState, sIndicator } = this._compareConsumption(
          lastMonthTotal,
          iAverage
        );

        // ADVANCED: Done
        // Hint: Calculate average consumption of last month
        // Hint: Use method _compareConsumption for your calculations.
        this.FlowState.updateFlow({
          averageConsumptionMonthPast: lastMonthTotal,
          averageConsumptionMonthValueState: sValueState,
          averageConsumptionMonthIndicator: sIndicator,
        });
      },

      _handleTotalWeek: function () {
        // BASIC: Done
        // Calculate the total consumption of this week.
        // Hint: Use method _countConsumption
        this.FlowState.updateFlow({
          totalConsumptionWeek: this._countConsumption(new Date(), 7),
        });

        // ADVANCED: Done
        // Calculate the difference in consumption between last week and this week.
        this._handleTotalWeekProgression();
      },

      _handleTotalWeekProgression: function (iTotal) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekTotal = this._countConsumption(lastWeek, 7);

        const { sValueState, sIndicator } = this._compareConsumption(
          lastWeekTotal,
          iTotal
        );
        // ADVANCED: Done
        // Hint: Calculate consumption of last month using _countConsumption
        // Hint: Use _compareConsumption for your comparisons.
        this.FlowState.updateFlow({
          totalConsumptionWeekPast: lastWeekTotal,
          totalConsumptionWeekValueState: sValueState,
          totalConsumptionWeekIndicator: sIndicator,
        });
      },

      _handleAverageWeek: function () {
        const iTotal = this.FlowState.getProperty("flow").totalConsumptionWeek;

        // BASIC: Done
        // Calculate weekly average
        this.FlowState.updateFlow({ averageConsumptionWeek: iTotal / 7 });

        // ADVANCED: Done
        // Calculate the difference in consumption between last week and this week.
        this._handleAverageWeekProgression();
      },

      _handleAverageWeekProgression: function (iAverage) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const lastWeekAverage = this._countConsumption(lastWeek, 7) / 7;

        const { sValueState, sIndicator } = this._compareConsumption(
          lastWeekAverage,
          iAverage
        );
        // ADVANCED: Done
        // Hint: Calculate average consumption of last week
        // Hint: Use method _compareConsumption for your calculations.
        this.FlowState.updateFlow({
          averageConsumptionWeekPast: lastWeekAverage,
          averageConsumptionWeekValueState: sValueState,
          averageConsumptionWeekIndicator: sIndicator,
        });
      },

      _handleTotalToday: function () {
        // BASIC: Done
        // calculate the total consumption of today.
        // Hint: Use method _countConsumption
        this.FlowState.updateFlow({
          totalConsumptionToday: this._countConsumption(new Date(), 1),
        });

        // ADVANCED: Done
        // Calculate the difference in consumption between yesterday and today.
        this._handleTotalTodayProgression();
      },

      _handleTotalTodayProgression: function (iTotal) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayTotal = this._countConsumption(yesterday, 1);

        const { sValueState, sIndicator } = this._compareConsumption(
          yesterdayTotal,
          iTotal
        );
        // ADVANCED: Done
        // Hint: Calculate consumption of last month using _countConsumption
        // Hint: Use _compareConsumption for your comparisons.
        this.FlowState.updateFlow({
          totalConsumptionTodayPast: yesterdayTotal,
          totalConsumptionTodayValueState: sValueState,
          totalConsumptionTodayIndicator: sIndicator,
        });
      },

      _handleAverageToday: function () {
        const iTotal = this.FlowState.getProperty("flow").totalConsumptionToday;
        // BASIC: Done
        // Calculate todays average	consumption
        this.FlowState.updateFlow({ averageConsumptionToday: iTotal / 24 });

        // ADVANCED: Done
        // Calculate the difference in consumption between last week and this week.
        this._handleAverageTodayProgression();
      },

      _handleAverageTodayProgression: function (iAverage) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayAverage = this._countConsumption(yesterday, 1) / 24;

        const { sValueState, sIndicator } = this._compareConsumption(
          yesterdayAverage,
          iAverage
        );

        // Hint: Calculate average consumption of last week
        // Hint: Use method _compareConsumption for your calculations.
        this.FlowState.updateFlow({
          averageConsumptionTodayPast: yesterdayAverage,
          averageConsumptionTodayValueState: sValueState,
          averageConsumptionTodayIndicator: sIndicator,
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

      _recalculateTotalConsumptionMonth: function () {
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

        // BASIC: Done (it will show the consumption of this month if no past month)
        // Calculate the difference between the total consumption of this month and total consumption of last month
        const iDifference =
          oFlowModel.totalConsumptionMonth -
          (oFlowModel.totalConsumptionMonthPast ?? 0);

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
      },

      pressTotalConsumptionMonth: function () {
        this._currentClicked = "TotalConsumptionMonth";
        this._recalculateTotalConsumptionMonth();
        this.onOpenGenericTileDialog();
      },

      _recalculateTotalConsumptionWeek: function () {
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

        // BASIC: Done (Same as with month)
        // Calculate the difference between the total consumption of this week and total consumption of last week
        const iDifference =
          oFlowModel.totalConsumptionWeek -
          (oFlowModel.totalConsumptionWeekPast ?? 0);

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
      },

      pressTotalConsumptionWeek: function () {
        this._currentClicked = "TotalConsumptionWeek";
        this._recalculateTotalConsumptionWeek();
        this.onOpenGenericTileDialog();
      },

      _recalculateTotalConsumptionToday: function () {
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

        // BASIC: Done (Same as with month)
        // Calculate the difference between the total consumption of today and total consumption of yesterday
        const iDifference =
          oFlowModel.totalConsumptionToday -
          (oFlowModel.totalConsumptionTodayPast ?? 0);

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
      },

      pressTotalConsumptionToday: function () {
        this._currentClicked = "TotalConsumptionToday";
        this._recalculateTotalConsumptionToday();
        this.onOpenGenericTileDialog();
      },

      _recalculateAverageConsumptionMonth: function () {
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

        // BASIC: Done (has to be tested)
        // Calculate the difference between the average consumption of this month and average consumption of last month
        const iDifference =
          oFlowModel.averageConsumptionMonth -
          (oFlowModel.averageConsumptionMonthPast ?? 0);

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
      },

      pressAverageConsumptionMonth: function () {
        this._currentClicked = "AverageConsumptionMonth";
        this._recalculateAverageConsumptionMonth();
        this.onOpenGenericTileDialog();
      },

      _recalculateAverageConsumptionWeek: function () {
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

        // BASIC: Done (has to be tested)
        // Calculate the difference between the average consumption of this week and average consumption of last week
        const iDifference =
          oFlowModel.averageConsumptionWeek -
          (oFlowModel.averageConsumptionWeekPast ?? 0);

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
      },

      pressAverageConsumptionWeek: function () {
        this._currentClicked = "AverageConsumptionWeek";
        this._recalculateAverageConsumptionWeek();
        this.onOpenGenericTileDialog();
      },

      _recalculateAverageConsumptionToday: function () {
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

        // BASIC: Done (has to be tested)
        // Calculate the difference between the average consumption of today and average consumption of yesterday
        const iDifference =
          oFlowModel.averageConsumptionToday -
          (oFlowModel.averageConsumptionTodayPast ?? 0);

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
      },

      pressAverageConsumptionToday: function () {
        this._currentClicked = "AverageConsumptionToday";
        this._recalculateAverageConsumptionToday();
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

        // ADVANCED: Done
        // Show something on the screen using the received hint. Be creative!
        this.FlowState.updateFlow({ easter: oFlowHint.message });
      },

      createInteractiveBarChart: function (aFlows) {
        let aFlowBars = [];

        // BASIC: Done
        // Filter the data to only get values of the past week (including today)
        const currentDate = new Date();
        currentDate.setDate(currentDate.getDate() - 7);
        let aFilterFlows = aFlows.filter(
          (f) => new Date(f.datetime).getDate() > currentDate.getDate()
        );

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
