export const updateFooterMeta = () => {
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
