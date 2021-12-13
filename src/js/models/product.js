var ProductModule = (function () {
  return {
    getProducts: (filter, callback) => {
      knex
        .select()
        .from("products")
        .orderBy("id", "asc")
        .where((builder) => {
          builder.where("name", "like", "%" + filter.searchInput + "%");
          if (filter.catagory != null) {
            // console.log(filter.catagory);
            builder.andWhere("category", filter.catagory);
          }
        })
        .limit(filter.limit)
        .offset(filter.offset)
        .then((result) => {
          callback(result);
        });
    },

    deleteProduct: (id, callback) => {
      knex("products")
        .where("id", id)
        .del()
        .then((result) => {
          callback(result);
        });
    },

    insertProduct: (product, callback) => {
      knex("products")
        .insert(product)
        .then((result) => {
          callback(result);
        })
        .catch(function (e) {
          if (e.message.indexOf("UNIQUE") >= 0) {
            callback({
              error:
                "Items Already Exists. Items Name And Barcode Must Unique.",
            });
          }
        });
    },

    insertBatchProducts: (data, callback) => {
      knex("products")
        .insert(data)
        .then((res) => {
          callback(res);
        })
        .catch((e) => {
          if (e.message.indexOf("UNIQUE") >= 0) {
            callback({
              error:
                "Items Already Exists. Items Name And Barcode Must Unique.",
            });
          }
        });
    },

    updateProduct: (product, id, callback) => {
      knex("products")
        .update(product)
        .where("id", id)
        .then((result) => {
          callback(result);
        })
        .catch(function (e) {
          if (e.message.indexOf("UNIQUE") >= 0) {
            callback({
              error:
                "Items Already Exists. Items Name And Barcode Must Unique.",
            });
          }
        });
    },
  };
})();

module.exports = ProductModule;

// var MyObject = function() {

//     // This is private because it is not being return
//     var _privateFunction = function(param1, param2) {
//         ...
//         return;
//     }

//     var function1 = function(param1, callback) {
//         ...
//         callback(err, results);
//     }

//     var function2 = function(param1, param2, callback) {
//         ...
//         callback(err, results);
//     }

//     return {
//         function1: function1
//        ,function2: function2
//     }
// }();

// module.exports = MyObject;
