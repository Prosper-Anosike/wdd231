import { updateFooterMeta } from './common.js';

const STORAGE_KEY = 'tph-interest';

const loadPreference = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const select = document.querySelector('#interest');
    if (select) {
        select.value = saved;
    }
};

const bindPreference = () => {
    const select = document.querySelector('#interest');
    if (!select) return;
    select.addEventListener('change', () => {
        // localStorage keeps the selected interest for returning visitors.
        localStorage.setItem(STORAGE_KEY, select.value);
    });
};

const setTimestamp = () => {
    const field = document.querySelector('#timestamp');
    if (field) {
        field.value = new Date().toISOString();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    updateFooterMeta();
    loadPreference();
    bindPreference();
    setTimestamp();
});
