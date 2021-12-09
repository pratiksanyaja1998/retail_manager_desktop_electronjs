exports.up = function (knex, Promise) {
  const Settings = [
    { name: "storeInfo", data: null },
    { name: "version", data: "1.0" },
    { name: "insrno", data: 1 },
    { name: "insrpre", data: "SROO" },
    { name: "invoicesmsapi", data: "XrhyK25Niw4-3amrJULQYoVTm9vgPvNfLdQvZHmgL" },
    { name: "mailuser", data: "rohit.spyhunteritsolution@gmail.com" },
    { name: "mailpass", data: "Trypurpose@123" },
    { name: "mailhost", data: "smtp.gmail.com" },
    { name: "mailport", data: "587" },

    {
      name: "customer",
      data: JSON.stringify({
        phno: true,
        gstin: true,
        dadr: true,
        badr: true,
        email: true,
      }),
    },
    {
      name: "products",
      data: JSON.stringify({
        hsn: true,
        gst: true,
        bprice: true,
        sprice: true,
        // discount: true,
        barcode: true,
        qty: true,
        productName: "Product",
      }),
    },
    {
      name: "invoice",
      data: JSON.stringify({
        cname: true,
        phno: true,
        total: true,
        gst: false,
        discount: false,
      }),
    },
    {
      name: "invoiceForm",
      data: JSON.stringify({
        paymethod: true,
        discription: true,
        tprchage: true,
        fullother: true,
        qty: true,

        gstInProductWise: true,

        hsn: true,
        dadr: true,
        badr: true,
        gstin: true,
        phno: true,
        email: true,
        fullcustomer: true,
      }),
    },
  ];

  const Templates = [
    { name: "Default", url: "./template/invoiceTemplate/default.html" },
    { name: "Responsive", url: "./template/invoiceTemplate/withImage.html" },
    { name: "FixSizeA4", url: "./template/invoiceTemplate/fixSizeA4.html" },
  ];

  return Promise.all([
    knex.schema.createTable("customer", function (table) {
      table.increments("id").primary();
      table.string("name").unique().notNullable();
      table.string("phno").unique();
      table.string("gstin");
      table.string("email");
      table.string("info");
      table.string("barea");
      table.string("bcity");
      table.integer("bpincode");
      table.string("bstate");
      table.boolean("isb_d");
      table.string("darea");
      table.string("dcity");
      table.integer("dpincode");
      table.string("dstate");
    }),

    knex.schema.createTable("products", function (table) {
      table.increments("id").primary();
      table.string("name").unique().notNullable();
      table.integer("gst");
      table.float("qty");
      table.float("price"); //for selling
      table.float("bprice");
      table.string("category").notNullable();
      table.string("hsn");
      table.string("barcode").unique();
    }),

    knex.schema.createTable("expance", function (table) {
      table.increments("id").primary();
      table.string("description");
      table.string("refno").notNullable();
      table.float("price"); //
      table.string("category").notNullable();
      table.integer("dd").notNullable();
      table.integer("mm").notNullable();
      table.integer("yyyy").notNullable();
    }),

    knex.schema.createTable("invoice", function (table) {
      table.increments("id").primary();
      table.string("srno").notNullable().unique();
      table.integer("customer").references("id").inTable("customer");
      table.string("name");
      table.string("phno");
      table.string("email");
      table.string("gstin");
      table.string("barea");
      table.string("bcity");
      table.integer("bpincode");
      table.string("bstate");
      table.boolean("isb_d");
      table.string("billno"); //for texttile chalan no
      // table.string('duedate');//payment date
      table.timestamp("created_at").defaultTo(knex.fn.now());
      table.string("darea");
      table.string("dcity");
      table.integer("dpincode");
      table.string("dstate");
      table.string("gsttype");
      table.integer("gst");
      table.float("total"); //final

      table.float("discount");
      table.string("desciption");
      table.integer("tprchage");
      table.string("paymentMethrd");
      table.integer("dd").notNullable();
      table.integer("mm").notNullable();
      table.integer("yyyy").notNullable();
    }),

    knex.schema.createTable("invoiceProducts", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.integer("gst");
      table.float("qty");
      table.float("total"); //final

      table.integer("price"); //rate
      table.string("category");
      table.string("hsn");
      table.string("barcode");
      table.integer("products").references("id").inTable("products");
      table.integer("invoice").references("id").inTable("invoice");
    }),

    knex.schema.createTable("productCategory", function (table) {
      table.increments("id").primary();
      table.string("name").unique().notNullable();
    }),

    knex.schema.createTable("expanceCategory", function (table) {
      table.increments("id").primary();
      table.string("name").unique().notNullable();
    }),

    knex.schema.createTable("overview", function (table) {
      table.increments("id").primary();
      table.float("income");
      table.float("expance");
      table.integer("mm");
      table.integer("yyyy");
      table.unique(["mm", "yyyy"]);
    }),

    knex.schema
      .createTable("settings", function (table) {
        table.increments("id").primary();
        table.string("name");
        table.string("data");
      })
      .then(() => {
        knex("settings")
          .insert(Settings)
          .then(() => { });
      }),

    knex.schema
      .createTable("template", function (table) {
        table.increments("id").primary();
        table.string("name").unique();
        table.string("url");
      })
      .then(() => {
        knex("template")
          .insert(Templates)
          .then(() => { });
      }),
  ]);
};

exports.down = function (knex, Promise) {
  return Promise.all([]);
};
