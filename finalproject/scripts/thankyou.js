import { updateFooterMeta } from './common.js';

const formatTimestamp = (raw) => {
    if (!raw) return '—';
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.valueOf())) {
        return parsed.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    }
    return raw;
};

const fillSummary = () => {
    const params = new URLSearchParams(window.location.search);
    const map = [
        ['name', 'summary-name'],
        ['email', 'summary-email'],
        ['interest', 'summary-interest'],
        ['goal', 'summary-goal'],
        ['timestamp', 'summary-timestamp']
    ];

    map.forEach(([key, id]) => {
        const field = document.querySelector(`#${id}`);
        if (!field) return;
        const value = params.get(key);
        if (key === 'timestamp') {
            field.textContent = formatTimestamp(value);
        } else {
            field.textContent = value ? value : '—';
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
    updateFooterMeta();
    fillSummary();
});
