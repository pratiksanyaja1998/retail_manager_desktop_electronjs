var ProductCategoryModule = (function () {
  const TABLENAME = "expanceCategory";

  return {
    getCategorys: (callback) => {
      knex
        .select("name", "id")
        .from(TABLENAME)
        .orderBy("name", "asc")
        .then((result) => {
          category = result.map((item) => {
            return item.name;
          });
          callback(category);
        });
    },

    deleteCategory: (name, callback) => {
      knex("expance")
        .select()
        .where("category", name)
        .then((rows) => {
          if (rows.length > 0) {
            callback({
              error:
                "Please Delete Frist Expance Which Contain " +
                name +
                " Category.",
            });
          } else {
            knex(TABLENAME)
              .where("name", name)
              .del()
              .then((result) => {
                callback(result);
              });
          }
        });
    },

    insertCategory: (category, callback) => {
      knex(TABLENAME)
        .insert(category)
        .then((result) => {
          callback(result);
        })
        .catch((e) => {
          if (e.message.indexOf("UNIQUE") >= 0) {
            callback({ error: "Category Must Unique." });
          }
        });
    },

    insertBatchCategories: (data, callback) => {
      let batchData = [];

      data.forEach((element) => {
        let custObj = {};
        custObj.name = element;
        batchData.push(custObj);
      });

      knex(TABLENAME)
        .insert(batchData)
        .then((res) => {
          callback(res);
        })
        .catch((e) => {
          callback({
            error: "CSV file is not Valid or Duplicate Content Found",
          });
        });
    },
  };
})();

module.exports = ProductCategoryModule;
