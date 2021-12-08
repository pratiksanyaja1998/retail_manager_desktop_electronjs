var CustomerModule = (function () {
  return {
    getCustomers: (filter, callback) => {
      knex
        .select("*")
        .from("customer")
        .orderBy("name", "asc")
        .where("name", "like", "%" + filter.searchInput + "%")
        .orWhere("phno", "like", "%" + filter.searchInput + "%")
        .orWhere("gstin", "like", "%" + filter.searchInput + "%")
        .limit(filter.limit)
        .offset(filter.offset)
        .then((result) => {
          callback(result);
        });
    },

    deleteCustomer: (id, callback) => {
      knex("customer")
        .where("id", id)
        .del()
        .then((result) => {
          callback(result);
        });
    },

    insertCustomer: (customer, callback) => {
      knex("customer")
        .insert(customer)
        .then((result) => {
          callback(result);
        })
        .catch(function (e) {
          if (e.message.indexOf("UNIQUE") >= 0) {
            callback({
              error:
                "Customer Already Exists. Name Or Mobile Number Must Be Unique.",
            });
          }
        });
    },

    insertBatchCustomer: (data, callback) => {
      knex("customer")
        .insert(data)
        .then((res) => {
          callback(res);
        })
        .catch((e) => {
          callback({
            error: "CSV file is not Valid or Duplicate Content Found",
          });
        });
    },

    updateCustomer: (customer, id, callback) => {
      knex("customer")
        .update(customer)
        .where("id", id)
        .then((result) => {
          callback(result);
        })
        .catch(function (e) {
          if (e.message.indexOf("UNIQUE") >= 0) {
            callback({
              error:
                "Customer Already Exists. Name Or Mobile Number Must Be Unique.",
            });
          }
        });
    },
  };
})();

module.exports = CustomerModule;

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
