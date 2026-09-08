export const timeToDecimal = (timeVal) => {
    if (timeVal === undefined || timeVal === null || timeVal === '') return 0;
    
    // If Excel gave us a serial number for time (fraction of a 24-hour day)
    // E.g., 0.5 = 12:00:00 PM = 12.0 hours
    if (typeof timeVal === 'number') {
        // Multiply by 24 to get total decimal hours
        return parseFloat((timeVal * 24).toFixed(2));
    }

    // If Excel gave us a formatted string like "14:30" or "14:30:00"
    const timeStr = timeVal.toString().trim();
    const parts = timeStr.split(':');
    
    if (parts.length >= 2) {
        const hours = parseInt(parts[0] || '0', 10);
        const minutes = parseInt(parts[1] || '0', 10);
        const seconds = parseInt(parts[2] || '0', 10);
        
        if (!isNaN(hours) && !isNaN(minutes)) {
             return parseFloat((hours + (minutes / 60) + (seconds / 3600)).toFixed(2));
        }
    }
    
    // Fallback if it's already a regular number string like "14.5"
    const parsed = parseFloat(timeStr);
    return isNaN(parsed) ? 0 : parsed;
};

export const parseNumber = (val) => {
    if (val === undefined || val === null || val === '') return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
};

export const formatDate = (dateVal) => {
    if (!dateVal) return '1970-01-01';
    
    // If Excel stored it as a serial number (days since Jan 1, 1900)
    if (typeof dateVal === 'number') {
        const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000) + 43200000);
        const y = date.getUTCFullYear();
        const m = String(date.getUTCMonth() + 1).padStart(2, '0');
        const d = String(date.getUTCDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    
    // If it's a standard Date object or string
    try {
        if (dateVal instanceof Date) {
            const y = dateVal.getFullYear();
            const m = String(dateVal.getMonth() + 1).padStart(2, '0');
            const d = String(dateVal.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        const d = new Date(dateVal);
        if (!isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
    } catch (e) {
        return '1970-01-01';
    }
    
    return '1970-01-01';
};