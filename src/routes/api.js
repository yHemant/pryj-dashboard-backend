import express from 'express';
import pool from '../config/db.js';
import multer from 'multer';
import { parseExcelBuffer } from '../utils/excelParser.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/hqs', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT DISTINCT cli_hq FROM cli_performance ORDER BY cli_hq');
        res.json(rows.map(r => r.cli_hq));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/clis', async (req, res) => {
    try {
        const { hq } = req.query;
        const { rows } = await pool.query('SELECT DISTINCT cli_id, cli_name FROM cli_performance WHERE cli_hq = $1 ORDER BY cli_name', [hq]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/performance', async (req, res) => {
    try {
        const { cli_id, start_date, end_date } = req.query;
        let query = 'SELECT * FROM cli_performance WHERE cli_id = $1';
        const params = [cli_id];
        if (start_date && end_date) {
            query += ' AND month >= $2 AND month <= $3';
            params.push(start_date, end_date);
        }
        query += ' ORDER BY month ASC';
        const { rows } = await pool.query(query, params);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) res.json({ success: true, token: 'admin_session_valid' });
    else res.status(401).json({ error: 'Invalid password' });
});

router.post('/admin/preview', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const parsedData = parseExcelBuffer(req.file.buffer);
        res.json({ totalRows: parsedData.length, preview: parsedData.slice(0, 5) });
    } catch (err) { res.status(500).json({ error: 'Excel parsing failed: ' + err.message }); }
});

router.post('/admin/upload', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const client = await pool.connect();
    try {
        const data = parseExcelBuffer(req.file.buffer);
        await client.query('BEGIN');
        
        const upsertQuery = `
            INSERT INTO cli_performance (
                month, cli_id, cli_name, cli_hq, day_fp_freight, day_fp_coaching, day_fp_other,
                night_fp_freight, night_fp_coaching, night_fp_other, dfc_fp, pct_dfc_fp,
                total_duty_hrs, total_fp_hrs, night_duty_hrs, night_fp_hrs, ambush_checks,
                ipams_ambush_check, leave_days, abnormality_reported, grading_due, counseling_due,
                fp_due, full_beat_fp_due, lp_fp, fp_detail_filled, lp_attribute, alp_attribute, due_lp, due_alp
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 
                $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
            ) ON CONFLICT (month, cli_id) DO UPDATE SET
                cli_name = EXCLUDED.cli_name, cli_hq = EXCLUDED.cli_hq, day_fp_freight = EXCLUDED.day_fp_freight,
                day_fp_coaching = EXCLUDED.day_fp_coaching, day_fp_other = EXCLUDED.day_fp_other,
                night_fp_freight = EXCLUDED.night_fp_freight, night_fp_coaching = EXCLUDED.night_fp_coaching,
                night_fp_other = EXCLUDED.night_fp_other, dfc_fp = EXCLUDED.dfc_fp, pct_dfc_fp = EXCLUDED.pct_dfc_fp,
                total_duty_hrs = EXCLUDED.total_duty_hrs, total_fp_hrs = EXCLUDED.total_fp_hrs,
                night_duty_hrs = EXCLUDED.night_duty_hrs, night_fp_hrs = EXCLUDED.night_fp_hrs,
                ambush_checks = EXCLUDED.ambush_checks, ipams_ambush_check = EXCLUDED.ipams_ambush_check,
                leave_days = EXCLUDED.leave_days, abnormality_reported = EXCLUDED.abnormality_reported,
                grading_due = EXCLUDED.grading_due, counseling_due = EXCLUDED.counseling_due, fp_due = EXCLUDED.fp_due,
                full_beat_fp_due = EXCLUDED.full_beat_fp_due, lp_fp = EXCLUDED.lp_fp,
                fp_detail_filled = EXCLUDED.fp_detail_filled, lp_attribute = EXCLUDED.lp_attribute,
                alp_attribute = EXCLUDED.alp_attribute, due_lp = EXCLUDED.due_lp, due_alp = EXCLUDED.due_alp;
        `;
        
        let processedCount = 0;
        for (const row of data) {
            await client.query(upsertQuery, [
                row.month, row.cli_id, row.cli_name, row.cli_hq, row.day_fp_freight, row.day_fp_coaching, row.day_fp_other,
                row.night_fp_freight, row.night_fp_coaching, row.night_fp_other, row.dfc_fp, row.pct_dfc_fp,
                row.total_duty_hrs, row.total_fp_hrs, row.night_duty_hrs, row.night_fp_hrs, row.ambush_checks,
                row.ipams_ambush_check, row.leave_days, row.abnormality_reported, row.grading_due, row.counseling_due,
                row.fp_due, row.full_beat_fp_due, row.lp_fp, row.fp_detail_filled, row.lp_attribute, row.alp_attribute,
                row.due_lp, row.due_alp
            ]);
            processedCount++;
        }
        await client.query('COMMIT');
        res.json({ success: true, processedCount });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

export default router;