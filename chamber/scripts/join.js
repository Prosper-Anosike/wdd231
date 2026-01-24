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

const setTimestamp = () => {
    const field = document.querySelector('#timestamp');
    if (!field) return;
    field.value = new Date().toISOString();
};

const bindModals = () => {
    const triggers = document.querySelectorAll('.modal-trigger');
    const closeButtons = document.querySelectorAll('.modal-close');

    triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modal;
            if (!modalId) return;
            const modal = document.querySelector(`#${modalId}`);
            if (modal && typeof modal.showModal === 'function') {
                modal.showModal();
            }
        });
    });

    closeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const modal = button.closest('dialog');
            if (modal) {
                modal.close();
            }
        });
    });

    document.querySelectorAll('dialog.membership-modal').forEach((modal) => {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', () => {
    updateFooterMeta();
    setTimestamp();
    bindModals();
});
