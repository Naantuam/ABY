import * as XLSX from "xlsx";

/**
 * Reads an Excel file and converts it to a JSON array of objects.
 *
 * @param {File} file - The file to read.
 * @returns {Promise<Array<Object>>} A promise resolving to the parsed data.
 */
export const importFromExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                
                // Assuming the first sheet is the one we want to import
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convert to JSON
                const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
                resolve(json);
            } catch (err) {
                reject(err);
            }
        };

        reader.onerror = (err) => {
            reject(err);
        };

        reader.readAsArrayBuffer(file);
    });
};
