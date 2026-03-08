import * as XLSX from "xlsx";

/**
 * Exports an array of objects to an Excel file.
 *
 * @param {Array<Object>} data - The data to export. Each object represents a row.
 * @param {string} fileName - The name of the file to be downloaded (without extension).
 */
export const exportToExcel = (data, fileName) => {
    if (!data || data.length === 0) {
        alert("No data available to export.");
        return;
    }

    // Convert the JSON data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Generate the Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
