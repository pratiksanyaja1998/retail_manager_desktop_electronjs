var knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "./store.sqlite",
  },
  useNullAsDefault: true,
});

const nodemailer = require("nodemailer");

const path = require("path");
const RES_ROOT = path.join(__dirname, "../../");
var fs = require("fs");
var electron = require("electron");
const ipc = electron.ipcRenderer;
const { dialog } = require("electron").remote;

const InvoiceModule = require("./js/models/invoice");
const TemplateModule = require("./js/models/template");
const SettingModule = require("./js/models/setting");
const CustomerModule = require("./js/models/customer");
const ProductModule = require("./js/models/product");
const ExpanceModule = require("./js/models/expance");
const OverViewModule = require("./js/models/overview");
const ProductCategoryModule = require("./js/models/productCate");

PrintApp = angular.module("PrintApp", ["ngRoute"]);

PrintApp.config(function ($routeProvider) {
  $routeProvider
    .when("/invoice/:id", {
      templateUrl: "template/invoicePrinter.html",
      controller: "invoiceController",
    })
    .when("/customer", {
      templateUrl: "template/customerPrinter.html",
      controller: "customerController",
    })
    .when("/products", {
      templateUrl: "template/productsPrinter.html",
      controller: "productsController",
    })
    .when("/income-expance", {
      templateUrl: "template/incomeExpancePrinter.html",
      controller: "IncomeExpanceController",
    })
    .when("/settings", {
      templateUrl: "template/printerSettings.html",
      controller: "settingsController",
    });
});

PrintApp.run(function ($rootScope, $location, $window) {
  $rootScope.pageSizeList = ["A4", "A5"];
  $rootScope.pageSize = "A4";
});

PrintApp.controller("invoiceController", [
  "$scope",
  "$rootScope",
  "$routeParams",
  function ($scope, $rootScope, $routeParams) {
    function getNumberToWords(s) {
      var th = ["", "thousand", "million", "billion", "trillion"];
      var dg = [
        "zero",
        "one",
        "two",
        "three",
        "four",
        "five",
        "six",
        "seven",
        "eight",
        "nine",
      ];
      var tn = [
        "ten",
        "eleven",
        "twelve",
        "thirteen",
        "fourteen",
        "fifteen",
        "sixteen",
        "seventeen",
        "eighteen",
        "nineteen",
      ];
      var tw = [
        "twenty",
        "thirty",
        "forty",
        "fifty",
        "sixty",
        "seventy",
        "eighty",
        "ninety",
      ];

      s = s.toString();
      s = s.replace(/[\, ]/g, "");
      if (s != parseFloat(s)) return "not a number";
      var x = s.indexOf(".");
      if (x == -1) x = s.length;
      if (x > 15) return "too big";
      var n = s.split("");
      var str = "";
      var sk = 0;
      for (var i = 0; i < x; i++) {
        if ((x - i) % 3 == 2) {
          if (n[i] == "1") {
            str += tn[Number(n[i + 1])] + " ";
            i++;
            sk = 1;
          } else if (n[i] != 0) {
            str += tw[n[i] - 2] + " ";
            sk = 1;
          }
        } else if (n[i] != 0) {
          // 0235
          str += dg[n[i]] + " ";
          if ((x - i) % 3 == 0) str += "hundred ";
          sk = 1;
        }
        if ((x - i) % 3 == 1) {
          if (sk) str += th[(x - i - 1) / 3] + " ";
          sk = 0;
        }
      }

      if (x != s.length) {
        var y = s.length;
        str += "point ";
        for (var i = x + 1; i < y; i++) str += dg[n[i]] + " ";
      }
      return str.replace(/\s+/g, " ");
    }

    $scope.newTemplateName = "";

    SettingModule.getSetting("storeInfo", (data) => {
      $scope.storeInfo = data;
    });




    SettingModule.getInvoiceAPIcred((data) => {
      $scope.invoicesmskey = data;
    });

    SettingModule.getEmailCred((result) => {
      $scope.mailuser = result[0].data;
      $scope.mailpass = result[1].data;
      $scope.mailhost = result[2].data;
      $scope.mailport = result[3].data;
    });

    InvoiceModule.getInvoiceWithProduct($routeParams.id, (result) => {
      $scope.invoiceData = {
        invoice: {
          ...result.invoice,
          totalInWord: getNumberToWords(result.invoice.total),
        },
        invoiceProducts: result.invoiceProducts,
      };

      console.log($scope.invoiceData);

      $scope.$apply();
    });

    TemplateModule.getTemplates((template) => {
      $scope.templates = template;
      $scope.template = $scope.templates[0];
      $scope.$apply();
    });

    $scope.print = () => {
      PrintPDF(
        $scope.invoiceData.invoice.yyyy +
        "-" +
        $scope.invoiceData.invoice.mm +
        "-" +
        $scope.invoiceData.invoice.srno +
        ".pdf"
      );
    };

    $scope.showMailLoader = true;

    SettingModule.getSetting("UserID", (data) => {
      $scope.UniqueUID = data;
    });

    $scope.shareOnEmail = async () => {
      let generatedPDF =
        $scope.invoiceData.invoice.yyyy +
        "-" +
        $scope.invoiceData.invoice.mm +
        "-" +
        $scope.invoiceData.invoice.srno +
        ".pdf";
      SavePDF(generatedPDF);

      $scope.showMailLoader = false;

      let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: $scope.mailuser,
          pass: $scope.mailpass,
        },
      });

      let info = await transporter.sendMail({
        from: '"Store Admin " <' + $scope.mailuser + ">",
        to: $scope.invoiceData.invoice.email,
        subject: "Invoice Mail ✔",
        text: "Here's your Invoice ",
        attachments: [
          {
            filename: generatedPDF,
            path: __dirname + "/assets/invoices/" + generatedPDF,
            cid: "myPDF.pdf",
          },
        ],
      });

      mixpanel.track("Email Invoice Generated", {
        user: $scope.UniqueUID
      });


      if (info) {
        $scope.showMailLoader = !$scope.showMailLoader;
        $scope.$apply();
        alert("Invoice sent to the Email address successfully");
      }
    };


    $scope.shareOnSMS = async () => {

      let generatedPDF =
        $scope.invoiceData.invoice.yyyy +
        "-" +
        $scope.invoiceData.invoice.mm +
        "-" +
        $scope.invoiceData.invoice.srno +
        ".pdf";
      SavePDF(generatedPDF);

      let formData = new FormData();
      let fileupload = document.getElementById('sharePdfFile');
      formData.append("file", fileupload.files[0]);
      let reqdata = {
        mobile_no: $scope.invoiceData.invoice.phno,
        email: $scope.invoiceData.invoice.email,
        srno: $scope.invoiceData.invoice.srno,
        storeName: $scope.storeInfo.storename,
        storeEmail: $scope.storeInfo.email,
        storeMobile: $scope.storeInfo.phno,
        invoicesmskey: $scope.invoicesmskey,
      }
      formData.append("invoice", JSON.stringify(reqdata));
      await fetch('http://localhost/php/spyhunteritsolution/api/retail/storeInvoice.php', {
        method: "POST",
        body: formData
      });
      alert('The file has been uploaded successfully.');
    }
  },
]);

PrintApp.controller("customerController", [
  "$scope",
  "$rootScope",
  "$routeParams",
  function ($scope, $rootScope, $routeParams) {
    SettingModule.getSetting("storeInfo", (data) => {
      $scope.storeInfo = data;
    });

    var today = new Date();

    $scope.filter = {
      offset: 0,
      limit: 10,
      searchInput: "",
      isNext: true,
      mm: today.getMonth() + 1,
      yyyy: today.getFullYear(),
    };

    $scope.print = () => {
      PrintPDF(
        $scope.filter.yyyy +
        "-" +
        $scope.filter.mm +
        "-" +
        "reportsCustomer.pdf"
      );
    };

    $scope.customer = null;

    $scope.getCustomerRepoToDatabase = (callback) => {
      knex("customer")
        .select("*")
        .orderBy("name", "asc")
        .where("name", "like", "%" + $scope.filter.searchInput + "%")
        .orWhere("phno", "like", "%" + $scope.filter.searchInput + "%")
        .orWhere("gstin", "like", "%" + $scope.filter.searchInput + "%")
        .limit($scope.filter.limit)
        .offset($scope.filter.offset)

        .then((customerRows) => {
          $scope.customer = customerRows;

          if (customerRows.length < $scope.filter.limit)
            $scope.filter.isNext = false;
          else $scope.filter.isNext = true;

          $scope.$apply();

          if (isFunction(callback)) callback();
        });
    };

    $scope.getCustomerRepoToDatabase(() => {
      $scope.generateReports();
    });

    $scope.reports = false;

    $scope.generateReports = () => {
      // get customer invoice
      Promise.all(
        $scope.customer.map((customer) => {
          return knex
            .select("*")
            .from("invoice")
            .where("customer", customer.id)
            .andWhere("mm", $scope.filter.mm)
            .andWhere("yyyy", $scope.filter.yyyy)
            .then((invoiceRows) => {
              return { customer: customer, invoice: invoiceRows };
            });
        })
      ).then((res) => {
        $scope.reports = res;
        $scope.$apply();
      });
    };

    $scope.clickPrev = () => {
      $scope.filter.offset = $scope.filter.offset - $scope.filter.limit;
      $scope.getCustomerRepoToDatabase(() => $scope.generateReports());
    };

    $scope.clickNext = () => {
      $scope.filter.offset = $scope.filter.offset + $scope.filter.limit;
      $scope.getCustomerRepoToDatabase(() => $scope.generateReports());
    };
  },
]);

PrintApp.controller("productsController", [
  "$scope",
  "$rootScope",
  "$routeParams",
  function ($scope, $rootScope, $routeParams) {
    SettingModule.getSetting("storeInfo", (data) => {
      $scope.storeInfo = data;
    });

    $scope.productCategory = false;

    ProductCategoryModule.getProductCategorys((row) => {
      $scope.productCategory = row;

      $scope.$apply();
    });

    var today = new Date();

    $scope.filter = {
      offset: 0,
      limit: 10,
      searchInput: "",
      isNext: true,
      catagory: null,
      mm: today.getMonth() + 1,
      yyyy: today.getFullYear(),
    };

    $scope.print = () => {
      PrintPDF(
        $scope.filter.yyyy +
        "-" +
        $scope.filter.mm +
        "-" +
        "reportsProducts.pdf"
      );
    };

    $scope.products = false;

    $scope.getProductsRepoToDatabase = (callback) => {
      knex("products")
        .select("*")
        .where((builder) => {
          builder.where("name", "like", "%" + $scope.filter.searchInput + "%");
          if ($scope.filter.catagory != null) {
            builder.andWhere("category", $scope.filter.catagory);
          }
        })
        .orderBy("name", "asc")
        .limit($scope.filter.limit)
        .offset($scope.filter.offset)
        .then((rows) => {
          $scope.products = rows;

          if (rows.length < $scope.filter.limit) $scope.filter.isNext = false;
          else $scope.filter.isNext = true;

          $scope.$apply();

          if (isFunction(callback)) callback();
        });
    };

    $scope.getProductsRepoToDatabase(() => {
      $scope.generateReports();
    });

    $scope.reports = false;

    $scope.generateReports = () => {
      // get customer invoice
      Promise.all(
        $scope.products.map((product) => {
          return knex
            .select(
              "invoiceProducts.qty",
              "invoiceProducts.price",
              "invoice.srno",
              "invoice.name",
              "invoice.phno"
            )
            .from("invoiceProducts")
            .where("invoiceProducts.products", product.id)
            .andWhere("invoice.mm", $scope.filter.mm)
            .andWhere("invoice.yyyy", $scope.filter.yyyy)
            .join("invoice", "invoiceProducts.invoice", "invoice.id")
            .then((invoiceProducts) => {
              return { product: product, inInvoice: invoiceProducts };
            });
        })
      ).then((result) => {
        $scope.reports = result;
        $scope.$apply();
      });
    };

    $scope.clickPrev = () => {
      $scope.filter.offset = $scope.filter.offset - $scope.filter.limit;
      $scope.getProductsRepoToDatabase(() => $scope.generateReports());
    };

    $scope.clickNext = () => {
      $scope.filter.offset = $scope.filter.offset + $scope.filter.limit;
      $scope.getProductsRepoToDatabase(() => $scope.generateReports());
    };
  },
]);

PrintApp.controller("IncomeExpanceController", [
  "$scope",
  "$rootScope",
  "$routeParams",
  function ($scope, $rootScope, $routeParams) {
    SettingModule.getSetting("storeInfo", (data) => {
      $scope.storeInfo = data;
    });

    var today = new Date();

    $scope.filter = {
      offset: 0,
      limit: 5,
      isNext: true,
      catagory: null,
      searchInput: "",
      mm: today.getMonth() + 1,
      yyyy: today.getFullYear(),
    };

    $scope.print = () => {
      PrintPDF(
        $scope.filter.yyyy +
        "-" +
        $scope.filter.mm +
        "-" +
        "reportsIncomeExpance.pdf"
      );
    };

    $scope.reports = {
      income: [],
      expance: [],
    };

    $scope.generateReports = () => {
      ExpanceModule.getExpance($scope.filter, (result) => {
        $scope.reports.expance = result;
        $scope.$apply();
      });

      InvoiceModule.getInvoices($scope.filter, (result) => {
        $scope.reports.income = result;
        $scope.$apply();
      });

      OverViewModule.getOverView($scope.filter.mm, $scope.filter.yyyy, (rs) => {
        $scope.overView = rs[0];

        $scope.$apply();
      });
    };

    $scope.generateReports();

    $scope.clickPrev = () => {
      $scope.filter.offset = $scope.filter.offset - $scope.filter.limit;
      $scope.generateReports();
    };

    $scope.clickNext = () => {
      $scope.filter.offset = $scope.filter.offset + $scope.filter.limit;
      $scope.generateReports();
    };
  },
]);

PrintApp.controller("settingsController", [
  "$scope",
  "$rootScope",
  "$routeParams",
  function ($scope, $rootScope, $routeParams) {
    $scope.InvoiceTempResError = null;
    $scope.newTemplateName = "";

    function selectAndSaveFile(saveLocation, callback) {
      dialog.showOpenDialog((fileNames) => {
        if (fileNames === undefined) {
          callback("Please Select File .");
          return;
        }

        fs.readFile(fileNames[0], (err, data) => {
          if (err) {
            callback("Error In File Reading. Try Again.");

            return;
          }

          fs.writeFile(
            saveLocation == false
              ? path.join(RES_ROOT, fileNames[0].split("/").pop())
              : saveLocation,
            data,
            (err) => {
              if (err) {
                callback("Error In File Writing. Try Again.");
              } else {
                callback(true);
              }
            }
          );
        });
      });
    }

    $scope.clickAddTemplate = () => {
      if ($scope.newTemplateName == "") {
        $scope.tempalte_form.name.$invalid = true;
        return;
      }

      selectAndSaveFile(
        path.join(RES_ROOT, $scope.newTemplateName + ".html"),
        (message) => {
          if (message == true) {
            newTemplate = {
              name: $scope.newTemplateName,
              url: path.join(RES_ROOT, $scope.newTemplateName + ".html"),
            };

            TemplateModule.insertTemplate(newTemplate, () => {
              $scope.InvoiceTempResError = "Template Successfully Added.";
              $scope.$apply();
            });
          } else {
            $scope.InvoiceTempResError = message;
          }
          $scope.$apply();
        }
      );
    };

    $scope.clickAddTemplateResource = () => {
      selectAndSaveFile(false, (message) => {
        $scope.InvoiceTempResError = message;
        $scope.$apply();
      });
    };
    // how to use resource
    // use ng-src  ={{RES_ROOT/filename}}
  },
]);

function isFunction(functionToCheck) {
  return (
    functionToCheck && {}.toString.call(functionToCheck) === "[object Function]"
  );
}

function PrintPDF(path) {
  ipc.send("print", { path: path });
}

function SavePDF(path) {
  ipc.send("save", { path: path });
}

function logger(message, data) {
  console.log(
    "==================================================================================="
  );
  console.log(message);
  console.log(
    "==================================================================================="
  );
  console.log(data);
  console.log(
    "-----------------------------------------------------------------------------------"
  );
}
