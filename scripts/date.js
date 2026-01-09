// Dynamic date and last modified functionality

document.addEventListener('DOMContentLoaded', () => {
    // Set current year in footer
    const currentYearElement = document.getElementById('currentyear');
    if (currentYearElement) {
        const currentYear = new Date().getFullYear();
        currentYearElement.textContent = currentYear;
    }

    // Set last modified date in footer
    const lastModifiedElement = document.getElementById('lastModified');
    if (lastModifiedElement) {
        const lastModified = document.lastModified;
        lastModifiedElement.textContent = `Last Modification: ${lastModified}`;
    }
});
