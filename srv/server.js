"use strict";

const cds = require("@sap/cds");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const cors = require("cors");

cds.on("bootstrap", app => {
    app.use(proxy());
    app.use(cors());
});

module.exports = cds.server;