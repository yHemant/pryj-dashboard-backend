export const timeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    if (typeof timeStr === 'number') return timeStr; // Excel serial numbers
    const parts = timeStr.toString().split(':');
    if (parts.length === 3) {
        const hours = parseInt(parts[0] || '0', 10);
        const minutes = parseInt(parts[1] || '0', 10);
        const seconds = parseInt(parts[2] || '0', 10);
        return parseFloat((hours + (minutes / 60) + (seconds / 3600)).toFixed(2));
    }
    return isNaN(parseFloat(timeStr)) ? 0 : parseFloat(timeStr);
};

export const parseNumber = (val) => {
    if (!val) return 0;
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
};

export const formatDate = (dateVal) => {
    if (!dateVal) return '1970-01-01';
    if (typeof dateVal === 'number') {
        const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
        return date.toISOString().split('T')[0];
    }
    return new Date(dateVal).toISOString().split('T')[0];
};