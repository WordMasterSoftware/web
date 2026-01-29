import * as XLSX from 'xlsx';

/**
 * Reads an Excel file and extracts words from the first sheet.
 * @param {File} file - The uploaded Excel file.
 * @returns {Promise<string[]>} - A promise that resolves to an array of words.
 */
export const parseExcelWords = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = evt.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON array
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extract words
        const words = [];
        jsonData.forEach((row) => {
          if (Array.isArray(row)) {
            row.forEach((cell) => {
              if (cell && typeof cell === 'string') {
                words.push(cell);
              } else if (cell && typeof cell === 'number') {
                words.push(String(cell));
              }
            });
          }
        });
        resolve(words);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
