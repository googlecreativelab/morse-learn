"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, cb) {
  db.createTable(
    "progress_log",
    {
      columns: {
        id: { type: "int", autoIncrement: true, primaryKey: true },
        userIdentifier: { type: "string", notNull: true },
        progressDump: { type: "string", notNull: true },
        progressPercent: { type: "int", notNull: true },
        timePlayed: { type: "int", notNull: true },
        dateCreated: { type: "timestamp", notNull: true },
        visualHints: { type: "boolean", notNull: true },
        speechHints: { type: "boolean", notNull: true },
        sound: { type: "boolean", notNull: true },
        settingsDump: { type: "string", notNull: true },
      },
      ifNotExists: true,
    },
    cb
  );
};

exports.down = function (db,cb) {
  db.dropTable(
    "progress_log",
    {
      ifNotExists: true,
    },
    cb
  );
};

exports._meta = {
  version: 1,
};
