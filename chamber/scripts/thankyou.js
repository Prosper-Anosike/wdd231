const updateFooterMeta = () => {
    const yearField = document.querySelector('#currentyear');
    const modifiedField = document.querySelector('#lastModified');
    const now = new Date();
    if (yearField) {
        yearField.textContent = String(now.getFullYear());
    }
    if (modifiedField) {
        const modifiedDate = new Date(document.lastModified);
        if (!Number.isNaN(modifiedDate.valueOf())) {
            modifiedField.textContent = `Last updated ${modifiedDate.toLocaleString('en-US', {
                dateStyle: 'long',
                timeStyle: 'short'
            })}`;
        } else {
            modifiedField.textContent = `Last updated ${document.lastModified}`;
        }
    }
};

const mapSummaryField = (key, value) => {
    const output = document.querySelector(`#summary-${key}`);
    if (!output) return;
    output.textContent = value || '—';
};

const formatTimestamp = (raw) => {
    if (!raw) return '—';
    const date = new Date(raw);
    if (!Number.isNaN(date.valueOf())) {
        return date.toLocaleString('en-US', {
            dateStyle: 'full',
            timeStyle: 'short'
        });
    }
    return raw;
};

const populateSummary = () => {
    const params = new URLSearchParams(window.location.search);
    mapSummaryField('firstName', params.get('firstName'));
    mapSummaryField('lastName', params.get('lastName'));
    mapSummaryField('email', params.get('email'));
    mapSummaryField('phone', params.get('phone'));
    mapSummaryField('organization', params.get('organization'));
    mapSummaryField('timestamp', formatTimestamp(params.get('timestamp')));
};

document.addEventListener('DOMContentLoaded', () => {
    updateFooterMeta();
    populateSummary();
});
