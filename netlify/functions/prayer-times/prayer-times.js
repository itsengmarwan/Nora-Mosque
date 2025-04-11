const XLSX = require('xlsx');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed

    const excelPath = path.join(__dirname, '..', '..', 'Prayer Times.xlsx');

    try {
        const excelBuffer = await fs.readFile(excelPath);
        const workbook = XLSX.read(excelBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let todayPrayers = null;

        for (const row of jsonData) {
            if (row && row[0]) {
                const dateParts = String(row[0]).split('/');
                const day = parseInt(dateParts[0]);
                const month = parseInt(dateParts[1]);

                if (day === currentDay && month === currentMonth) {
                    todayPrayers = {
                        fajr: row[1],
                        sunrise: row[2],
                        dhuhr: row[3],
                        asr: row[4],
                        maghrib: row[5],
                        isha: row[6],
                    };
                    break;
                }
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(todayPrayers),
        };
    } catch (error) {
        console.error('Error reading Excel file:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to load prayer times from Excel' }),
        };
    }
};