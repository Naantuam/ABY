import * as XLSX from "xlsx";

/**
 * Reads an Excel file and converts it to a JSON array of objects.
 *
 * @param {File} file - The file to read.
 * @param {Array<string>} expectedHeadersRegex - Array of regex string patterns for validating columns.
 * @returns {Promise<Array<Object>>} A promise resolving to the parsed data.
 */
export const importFromExcel = (file, expectedHeadersRegex = []) => {
    // 1. File Extension Validation
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        return Promise.reject(
            new Error("Only Excel format documents (.xlsx, .xls) are acceptable to be uploaded.")
        );
    }

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

                // 2. Headings Regex Validation
                if (expectedHeadersRegex.length > 0) {
                    if (json.length === 0) {
                        throw new Error("The uploaded Excel document has no data rows.");
                    }
                    const actualHeaders = Object.keys(json[0]);
                    
                    for (const pattern of expectedHeadersRegex) {
                        const regex = new RegExp(pattern, "i");
                        const matched = actualHeaders.some(header => regex.test(header));
                        if (!matched) {
                            throw new Error(`Missing expected heading matching pattern: "${pattern}"`);
                        }
                    }
                }
                
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

