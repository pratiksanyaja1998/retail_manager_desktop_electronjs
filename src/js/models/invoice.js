var InvoiceModule = (function () {
  const OverViewModule = require("./overview");
  const SettingsModule = require("./setting");
  const TABLENAME = "invoice";

  return {
    getInvoices: (filter, callback) => {
      knex
        .select()
        .from(TABLENAME)
        .orderBy("dd", "asc")
        .where((builder) => {
          builder
            .where("srno", "like", "%" + filter.searchInput + "%")
            .orWhere("phno", "like", "%" + filter.searchInput + "%")
            .orWhere("name", "like", "%" + filter.searchInput + "%");
        })
        .andWhere("mm", filter.mm)
        .andWhere("yyyy", filter.yyyy)
        .limit(filter.limit)
        .offset(filter.offset)
        .then((result) => {
          callback(result);
        });
    },

    getInvoiceWithProduct: (id, callback) => {
      var invoiceData = {
        invoice: null,
        invoiceProducts: null,
      };

      knex
        .select("*")
        .from("invoice")
        .where("id", id)
        .then((rows) => {
          invoiceData.invoice = rows[0];
          knex
            .select("*")
            .from("invoiceProducts")
            .where("invoice", id)
            .then((rows) => {
              invoiceData.invoiceProducts = rows;
              callback(invoiceData);
            });
        });
    },

    deleteInvoice: (invoice, callback) => {
      knex
        .select(["total", "yyyy", "mm"])
        .from("invoice")
        .where("id", invoice.id)
        .then((result) => {
          OverViewModule.updateOverView(
            "-",
            {
              name: "income",
              mm: result[0].mm,
              yyyy: result[0].yyyy,
              data: result[0].total,
            },
            (result) => {
              knex("invoice")
                .where("id", invoice.id)
                .del()
                .then((result) => {
                  knex("invoiceProducts")
                    .where("invoice", invoice.id)
                    .del()
                    .then((result) => {
                      callback(result);
                    });
                });
            }
          );
        });
    },

    // save invoice
    insertInvoice: (invoice, callback) => {
      var invoiceProductHaveProductEntry = [];
      var productUpdateCounter = 0;
      var invoiceid = null;

      var updateProductQty = (callback) => {
        if (productUpdateCounter < invoiceProductHaveProductEntry.length) {
          knex("products")
            .update({
              qty: knex.raw(
                "?? -" +
                  invoiceProductHaveProductEntry[productUpdateCounter].qty,
                ["qty"]
              ),
            })
            .where(
              "id",
              invoiceProductHaveProductEntry[productUpdateCounter].products
            )
            .then((result) => {
              productUpdateCounter++;
              // console.log("st 3")
              updateProductQty(callback);
            });
        } else {
          callback();
        }
      };

      knex("invoice")
        .insert(invoice.invoice)
        .then((result) => {
          invoiceid = result[0];
          invoice.invoiceProducts.map((item, index) => {
            // add invoice id ref
            invoice.invoiceProducts[index].invoice = invoiceid;

            // filter entry in products table
            if (item.products) {
              invoiceProductHaveProductEntry.push({ ...item });
            }
          });

          knex("invoiceProducts")
            .insert(invoice.invoiceProducts)
            .then((result) => {
              updateProductQty(() => {
                OverViewModule.updateOverView(
                  "+",
                  {
                    name: "income",
                    data: invoice.invoice.total,
                    mm: invoice.invoice.mm,
                    yyyy: invoice.invoice.yyyy,
                  },
                  (result) => {
                    SettingsModule.updateInvoiceSr(() => {
                      callback({ invoiceid: invoiceid });
                    });
                  }
                );
              });
            });
        });
    },

    // new
    showInvoice: (id) => clickOpenPrint("invoice/" + id),
  };
})();

module.exports = InvoiceModule;
