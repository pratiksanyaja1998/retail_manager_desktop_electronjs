var dataModule = (function () {
  const TABLENAME = "expance";
  var OverViewModule = require("./overview");

  return {
    getExpance: (filter, callback) => {
      knex
        .select()
        .from(TABLENAME)
        .orderBy("dd", "asc")
        .where((builder) => {
          builder
            .where("refno", "like", "%" + filter.searchInput + "%")
            .andWhere("mm", filter.mm)
            .andWhere("yyyy", filter.yyyy);
          if (filter.catagory != null) {
            builder.andWhere("category", filter.catagory);
          }
        })
        .limit(filter.limit)
        .offset(filter.offset)
        .then((result) => {
          callback(result);
        });
    },

    deleteExpance: (expance, callback) => {
      knex(TABLENAME)
        .where("id", expance.id)
        .del()
        .then((result) => {
          OverViewModule.updateOverView(
            "-",
            {
              name: "expance",
              mm: expance.mm,
              yyyy: expance.yyyy,
              data: expance.price,
            },
            (result) => {
              callback(result);
            }
          );
        });
    },

    insertExpance: (data, callback) => {
      knex(TABLENAME)
        .insert(data)
        .then((result) => {
          OverViewModule.updateOverView(
            "+",
            {
              name: "expance",
              data: data.price,
              mm: data.mm,
              yyyy: data.yyyy,
            },
            (ovres) => {
              callback(result);
            }
          );
        });
    },

    insertBatchExpense: (data, callback) => {

      knex(TABLENAME)
        .insert(data)
        .then((res) => {
          callback(res);
        })
        .catch((e) => {
          console.log(e.message)
          callback({
            error: "CSV file is not Valid or Duplicate Content Found",
          });
        });
    },

    updateExpance: (data, id, callback) => {
      knex(TABLENAME)
        .update(data)
        .where("id", id)
        .then((result) => {
          callback(result);
        });
    },
  };
})();

module.exports = dataModule;
