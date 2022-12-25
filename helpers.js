import FileSaver from "file-saver";
import exceljs from "exceljs";

const helpers = {
  jsonToExcel: async function ({
    fileName = "export",
    responseGetter,
    listAt,
    columns,
    headers = [],
    sheetName = "Sheet1",
  }) {
    try {
      const response = await responseGetter();

      const workbook = new exceljs.Workbook();

      const items = eval(`response.${listAt}`);
      if (!Array.isArray(items)) {
        throw new Error(
          `Array of items not found at: response.${listAt}. Obtained Response: ` +
            JSON.stringify(response)
        );
      }

      const ignoredKeys = ["password", "createdAt", "updatedAt", "deletedAt"];

      const columnsToUse =
        columns ??
        Object.keys(items[0])
          .map((key) => ({
            header: helpers.camelCaseToTitle(key),
            key: key,
          }))
          .filter((col) => ignoredKeys.indexOf(col.key) === -1);

      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = columnsToUse;

      sheet.addRows(items);
      const autoWidth = (worksheet, minimalWidth = 6) => {
        worksheet.columns.forEach((column) => {
          let maxColumnLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            maxColumnLength = Math.max(
              maxColumnLength,
              minimalWidth,
              cell.value ? cell.value.toString().length : 0
            );
          });
          column.width = maxColumnLength + 2;
        });
      };

      autoWidth(sheet);

      if (headers.length > 0) {
        headers.reverse().forEach((header) => {
          sheet.spliceRows(1, 0, []);
          sheet.getCell("A1").value = header;
          sheet.getCell("A1").alignment = { horizontal: "center" };
          sheet.getCell("A1").font = { bold: true, size: 11 };
          sheet.getRow(1).height = 18;
        });

        for (let i = 1; i <= headers.length; i++) {
          const range =
            sheet.getRow(i).getCell(1).address +
            ":" +
            sheet.getRow(i).getCell(columnsToUse.length).address;
          sheet.mergeCells(range);
        }
      }

      workbook.xlsx.writeBuffer().then(function (data) {
        var blob = new Blob([data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        FileSaver.saveAs(blob, fileName + ".xlsx");
      });
    } catch (e) {
      throw new Error("JSON to Excel Error: " + e);
    }
  },

  print: function (store) {
    if (!store) throw new Error("Store missing");
    store.dispatch("printControl/setIsPrinting", true);
    const tables = document.querySelectorAll(".v-data-table");
    for (let i = 0; i < tables.length; i++) {
      tables[i].style.width = "7in";
      tables[i].querySelectorAll("tr").forEach((tr) => {
        tr.style.height = "auto";
      });
    }
    console.log(tables);
    setTimeout(function () {
      window.print();
      store.dispatch("printControl/setIsPrinting", false);
      for (let i = 0; i < tables.length; i++) {
        tables[i].style.width = "100%";
      }
    }, 1000);
  },

  readFile: function (file) {
    return new Promise(function (resolve, reject) {
      if (!file) reject("File needed");

      const FR = new FileReader();

      FR.addEventListener("load", function (evt) {
        resolve(evt.target.result);
      });

      FR.readAsDataURL(file);
    });
  },

  urlToBase64: function (url) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.onload = function () {
        var reader = new FileReader();
        reader.onloadend = function () {
          resolve(reader.result);
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.open("GET", url);
      xhr.responseType = "blob";
      xhr.send();
    });
  },

  camelCaseToTitle: function (text) {
    const result = text.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  },
};

export default helpers;
