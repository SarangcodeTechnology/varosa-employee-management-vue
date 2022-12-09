import xlsx from "json-as-xlsx";

const helpers = {
  jsonToExcel: async function ({
    fileName = "export",
    responseGetter,
    listAt,
    sheetName = "Sheet1",
  }) {
    try {
      const response = await responseGetter();
      const items = eval(`response.${listAt}`);
      if (!Array.isArray(items)) {
        throw new Error(
          `Array of items not found at: response.${listAt}. Obtained Response: ` +
            JSON.stringify(response)
        );
      }

      const columns = Object.keys(items[0]).map((key) => ({
        label: key,
        value: key,
      }));

      const rawData = [
        {
          sheet: sheetName,
          columns,
          content: items,
        },
      ];

      const setttings = {
        fileName,
        extraLength: 3,
        writeMode: "writeFile",
        writeOptions: {},
        RTL: true,
      };

      xlsx(rawData, setttings);
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
};

export default helpers;
