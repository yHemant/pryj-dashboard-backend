import * as xlsx from 'xlsx';
import { timeToDecimal, parseNumber, formatDate } from './timeConverter.js';

export const parseExcelBuffer = (buffer) => {
    const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // Assuming Row 1 is headers, Row 2 is subheaders, Row 3+ is data
    const dataRows = rawData.slice(2).filter(row => row.length > 0 && row[1]); // Ensure row exists and has CLI ID
    
    return dataRows.map(row => ({
        month: formatDate(row[0]),
        cli_id: row[1]?.toString().trim() || 'UNKNOWN',
        cli_name: row[2]?.toString().trim() || 'UNKNOWN',
        cli_hq: row[3]?.toString().trim() || 'UNKNOWN',
        day_fp_freight: parseNumber(row[4]),
        day_fp_coaching: parseNumber(row[5]),
        day_fp_other: parseNumber(row[6]),
        night_fp_freight: parseNumber(row[7]),
        night_fp_coaching: parseNumber(row[8]),
        night_fp_other: parseNumber(row[9]),
        dfc_fp: parseNumber(row[10]),
        pct_dfc_fp: parseNumber(row[11]),
        total_duty_hrs: timeToDecimal(row[12]),
        total_fp_hrs: timeToDecimal(row[13]),
        night_duty_hrs: timeToDecimal(row[14]),
        night_fp_hrs: timeToDecimal(row[15]),
        ambush_checks: parseNumber(row[16]),
        ipams_ambush_check: parseNumber(row[17]),
        leave_days: parseNumber(row[18]),
        abnormality_reported: parseNumber(row[19]),
        grading_due: parseNumber(row[20]),
        counseling_due: parseNumber(row[21]),
        fp_due: parseNumber(row[22]),
        full_beat_fp_due: parseNumber(row[23]),
        lp_fp: parseNumber(row[24]),
        fp_detail_filled: parseNumber(row[25]),
        lp_attribute: parseNumber(row[26]),
        alp_attribute: parseNumber(row[27]),
        due_lp: parseNumber(row[28]),
        due_alp: parseNumber(row[29])
    }));
};