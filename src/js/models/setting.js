var ProductModule = (function () {
  const TABLENAME = "settings";

  return {
    getInvoiceSr: (callback) => {
      knex
        .select()
        .from(TABLENAME)
        .where("name", "insrno")
        .orWhere("name", "insrpre")
        .orWhere("name", "invoicesmsapi")
        .orWhere("name", "currencysymbol")
        .then((result) => {
          callback(result);
        });
    },

    getInvoiceAPIcred: (callback) => {
      knex
        .select()
        .from(TABLENAME)
        .orWhere("name", "invoicesmsapi")
        .then((result) => {
          callback(result[0].data);
        });
    },

    getEmailCred: (callback) => {
      knex
        .select()
        .from(TABLENAME)
        .where("name", "mailuser")
        .orWhere("name", "mailpass")
        .orWhere("name", "mailhost")
        .orWhere("name", "mailport")
        .then((result) => {
          callback(result);
        });
    },

    // after invoice create increments ++
    updateInvoiceSr: (callback) => {
      knex
        .select()
        .from(TABLENAME)
        .where("name", "insrno")
        .then((result) => {
          no = Number(result[0].data);
          no++;
          console.log(no);
          knex(TABLENAME)
            .update({ data: no })
            .where("name", "insrno")
            .then((result) => {
              callback(result);
            });
        });
    },

    getSetting: (name, callback) => {
      knex
        .select("data")
        .from(TABLENAME)
        .where("name", name)
        .then((rows) => {
          // console.log(rows);
          callback(JSON.parse(rows[0].data));
        });
    },

    getCurrencySymbol: ({}, callback) => {
      knex
        .select("data")
        .from(TABLENAME)
        .where("name", "currencysymbol")
        .then((rows) => {
          callback(rows[0]);
        });
    },

    getSingleSetting: (name, callback) => {
      knex
        .select("data")
        .from(TABLENAME)
        .where("name", name)
        .then((rows) => {
          callback(JSON.parse(rows));
        });
    },

    getAllSettings: (name, callback) => {
      knex
        .select("*")
        .from(TABLENAME)
        .then((rows) => {
          callback(rows);
        });
    },

    // for json
    updateSettingJson: (name, data, callback) => {
      knex(TABLENAME)
        .update({ data: JSON.stringify(data) })
        .where("name", name)
        .then((result) => {
          callback(result);
        });
    },

    // no json
    updateSettingData: (row, callback) => {
      // console.log(row);
      knex(TABLENAME)
        .update({ data: row.data })
        .where("name", row.name)
        .then((result) => {
          callback(result);
        });
    },
  };
})();

module.exports = ProductModule;
