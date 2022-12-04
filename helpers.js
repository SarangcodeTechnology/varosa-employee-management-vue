import xlsx from "json-as-xlsx";

const helpers = {
  jsonToExcel: async function ({
    fileName = 'export',
    responseGetter,
    listAt,
    sheetName = "Sheet1",
  }) {
    try {
      const response = await responseGetter();
      const items = eval(`response.${listAt}`);
      if (!Array.isArray(items)){
        throw new Error(
          `Array of items not found at: response.${listAt}. Obtained Response: ` + 
          JSON.stringify(response)
        );
      }

      const columns = Object.keys(items[0]).map(key => ({
        label: key,
        value: key,
      }))

      const rawData = [{
        sheet: sheetName,
        columns,
        content: items,
      }] ;

      const setttings = {
        fileName,
        extraLength: 3,
        writeMode: 'writeFile',
        writeOptions : {},
        RTL: true,
      } ;

      xlsx(rawData, setttings);

    } catch (e) {
      throw new Error("JSON to Excel Error: " + e);
    }
  },
};

export default helpers;
