module.exports = [
  "$scope",
  "$rootScope",
  function ($scope, $rootScope) {
    $rootScope.location = "/products";
    $rootScope.isWaiting = false;

    // settings
    $scope.settings = {
      hsn: true,
      gst: true,
      bprice: true,
      sprice: true,
      // discount: true,
      barcode: true,
      qty: true,
    };

    // console.log(window.location)

    SettingModule.getSetting("products", (rs) => {
      $scope.settings = rs;
      $scope.$apply();
    });

    $scope.changeSettings = () => {
      SettingModule.updateSettingJson("products", $scope.settings, () => {});
    };

    // end settings

    $scope.clickAddNewCateOption = () => {
      $scope.isEditingProductSetting = true;
    };

    $scope.filter = {
      offset: 0,
      limit: 13,
      searchInput: "",
      isNext: true,
      catagory: null,
    };

    let getProductFromDatabase = () => {
      ProductModule.getProducts($scope.filter, (row) => {
        $scope.products = row;
        // console.log(row);
        if (row.length < $scope.filter.limit) $scope.filter.isNext = false;
        else $scope.filter.isNext = true;

        $scope.$apply();
      });
    };

    getProductFromDatabase();

    $scope.changeFilterData = () => {
      $scope.filter.offset = 0;
      getProductFromDatabase();
    };

    $scope.clickPrev = () => {
      $scope.filter.offset = $scope.filter.offset - $scope.filter.limit;
      getProductFromDatabase();
    };

    $scope.clickNext = () => {
      $scope.filter.offset = $scope.filter.offset + $scope.filter.limit;
      getProductFromDatabase();
    };

    $scope.productCategory = [];

    let getProductCategorys = () => {
      ProductCategoryModule.getProductCategorys((row) => {
        $scope.productCategory = row;

        $scope.$apply();
      });
    };
    getProductCategorys();

    $scope.newCategory = "";
    $scope.newCategoryError = {
      flag: false,
      message: null,
    };

    $scope.clickAddCategory = function () {
      $scope.newCategoryError.flag = false;

      if ($scope.newCategory == null || $scope.newCategory == "") {
        $scope.product_category.newcatename.$invalid = true;
        return;
      }

      ProductCategoryModule.insertProductCategory(
        { name: $scope.newCategory },
        (result) => {
          if (!result.error) {
            $scope.productCategory.push($scope.newCategory);
            $scope.newCategory = "";
          } else {
            $scope.newCategoryError.flag = true;
            $scope.newCategoryError.message = result.error;
          }
          $scope.$apply();
        }
      );
    };

    $scope.isEditingProduct = false;
    $scope.isEditingProductSetting = false;

    $scope.clickClearProduct = () => {
      $scope.newProduct = {
        name: "",
        hsn: "",
        price: 0,
        gst: "0",
        qty: 0,
        bprice: 0,
        category: null,
        // discount: 0,
        barcode: null,
      };

      $scope.error = false;
    };
    $scope.clickClearProduct();

    $scope.products = false;

    $scope.clickSaveProduct = function () {
      if ($scope.newProduct.isUpdate) {
        ProductModule.updateProduct(
          {
            hsn: $scope.newProduct.hsn,
            price: $scope.newProduct.price,
            bprice: $scope.newProduct.bprice,
            gst: $scope.newProduct.gst,
            qty: $scope.newProduct.qty,
            category: $scope.newProduct.category,
            barcode: $scope.newProduct.barcode,
          },
          $scope.newProduct.id,
          (result) => {
            if (!result.error) {
              $scope.products[$scope.newProduct.arrayid] = {
                ...$scope.newProduct,
              };
              $scope.isEditingProduct = false;
              $scope.clickClearProduct();
            } else {
              $scope.error = result.error;
            }
            $scope.$apply();
          }
        );
      } else {
        // validations

        if ($scope.newProduct.category == null) {
          $scope.product_form.category.$invalid = true;

          return;
        } else if (
          $scope.newProduct.name == "" ||
          $scope.newProduct.name == null
        ) {
          $scope.product_form.pname.$invalid = true;

          return;
        }

        if ($scope.newProduct.barcode == "") $scope.newProduct.barcode = null;

        ProductModule.insertProduct($scope.newProduct, (result) => {
          if (!result.error) {
            getProductFromDatabase();
            $scope.clickClearProduct();
            $scope.isEditingProduct = false;
          } else {
            $scope.error = result.error;
          }
          $scope.$apply();
        });
      }
    };

    $scope.clickCancelProduct = () => {
      $scope.isEditingProduct = false;

      $scope.clickClearProduct();
    };

    $scope.deleteProduct = (id) => {
      ProductModule.deleteProduct(id, () => {
        $scope.products.find((o, i) => {
          if (o) {
            if (o.id === id) {
              delete $scope.products[i];
              $scope.$apply();

              return i; // stop searching
            }
          }
        });
      });
    };

    $scope.editProduct = (product) => {
      delete product.$$hashKey;

      $scope.products.find((o, i) => {
        if (o)
          if (o.id === product.id) {
            product.gst = product.gst + "";
            $scope.newProduct = {
              ...product,
              arrayid: i,
              isUpdate: true,
            };
            $scope.isEditingProduct = true;
            return;
          }
      });
    };

    $scope.deleteProductCategory = (name) => {
      $scope.newCategoryError.flag = false;

      ProductCategoryModule.deleteProductCategory(name, (result) => {
        if (!result.error) {
          getProductCategorys();
        } else {
          $scope.newCategoryError.flag = true;
          $scope.newCategoryError.message = result.error;
        }

        $scope.$apply();
      });
    };

    $scope.focusFrist = true;

    const insertBatch = (BatchInsertData) =>
      ProductModule.insertBatchProducts(BatchInsertData, (res) => {
        if (!res.error) {
          alert("File Imported Successfully");
          getProductFromDatabase();
          $scope.$apply();
        } else {
          alert(res.error);
        }
      });

    const insertBatchCategories = (newCats) =>
      ProductCategoryModule.insertBatchCategories(newCats, (data) => {
        getProductCategorys();
        $scope.$apply();
      });

    $scope.csvToArray = (str, delimiter = ",") => {
      const headers = str.slice(0, str.indexOf("\n")).split(delimiter);
      const rows = str.slice(str.indexOf("\n") + 1).split("\n");
      const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
          object[header] = values[index];
          return object;
        }, {});
        return el;
      });
      return arr;
    };

    $scope.importCSVFile = () => {
      const csvFile = document.getElementById("csvFile");
      if (csvFile.value.length < 4) {
        // alert("Please Upload any CSV File");
        return false;
      }
      const input = csvFile.files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const text = e.target.result;
        let jsonData = $scope.csvToArray(text);
        let BatChData = [];
        let newCategories = [];

        jsonData.forEach((item) => {
          let custPartArray = {};
          if (item.Product_Name != "" && item.Category != "") {
            if (
              !$scope.productCategory.includes(item.Category) &&
              !newCategories.includes(item.Category)
            ) {
              newCategories.push(item.Category);
            }
            custPartArray.name = item.Product_Name;
            custPartArray.barcode = item.Barcode;
            custPartArray.hsn = item.HSN;
            custPartArray.price = item.Selling_Price;
            custPartArray.bprice = item.Buying_Price;
            custPartArray.qty = item.Quantity;
            custPartArray.category = item.Category;
            custPartArray.gst = item.GST;
            BatChData.push(custPartArray);
          }
        });

        insertBatch(BatChData);
        if (newCategories.length > 0) {
          //   console.log(newCategories);
          insertBatchCategories(newCategories);
        }
      };

      $scope.isEditingCustomerSetting = false;
      reader.readAsText(input);
    };

    $scope.sampleJsonCSVData = [
      {
        Product_Name: "Samsung M21",
        Barcode: "121212121122321222",
        HSN: "123456",
        Selling_Price: "15000",
        Buying_Price: "13000",
        Quantity: "50",
        Category: "Smartphone",
        GST: "5",
      },
      {
        Product_Name: "Samsung S20",
        Barcode: "221122221122112212",
        HSN: "789456",
        Selling_Price: "120000",
        Buying_Price: "100000",
        Quantity: "25",
        Category: "Smartphone",
        GST: "18",
      },
    ];

    $scope.csvFieldHeaders = Object.keys($scope.sampleJsonCSVData[0]);

    $scope.JsonToCSV = () => {
      var csvStr = $scope.csvFieldHeaders.join(",") + "\n";

      $scope.sampleJsonCSVData.forEach((item) => {
        $scope.csvFieldHeaders.forEach((item2) => {
          csvStr += item[item2] + ",";
        });
        csvStr += "\n";
      });
      return csvStr;
    };

    $scope.demoCsvData = $scope.JsonToCSV();
    $scope.exportCSV = () => {
      var hiddenElement = document.createElement("a");
      hiddenElement.href =
        "data:text/csv;charset=utf-8," + encodeURI($scope.demoCsvData);
      hiddenElement.target = "_blank";
      hiddenElement.download = "Products.csv";
      hiddenElement.click();
    };

    document.addEventListener("keydown", (event) => {
      if (event.ctrlKey && event.key == "n") {
        $scope.isEditingProduct = true;
        $scope.$apply();
        $scope.focusFrist = true;
        $scope.clickClearProduct();
        $scope.$apply();
      }

      if (event.keyCode == "27") {
        $scope.isEditingProduct = false;
        $scope.isEditingProductSetting = false;

        $scope.$apply();
      }
    });
  },
];
