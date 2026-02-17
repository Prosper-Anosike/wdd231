import { updateFooterMeta } from './common.js';

const DATA_URL = './data/roles.json';
const STORAGE_KEY = 'tph-filter';

const state = {
    roles: [],
    filter: 'all'
};

const setFilter = (value) => {
    state.filter = value;
    // localStorage stores the selected track between visits.
    localStorage.setItem(STORAGE_KEY, value);
};

const getFilteredRoles = () => {
    if (state.filter === 'all') return state.roles;
    return state.roles.filter((role) => role.track === state.filter);
};

const renderRoles = () => {
    const grid = document.querySelector('#roles-grid');
    if (!grid) return;

    const roles = getFilteredRoles();
    if (!roles.length) {
        grid.innerHTML = '<p class="status">No roles match this track right now.</p>';
        return;
    }

    const cards = roles
        .map(
            (role) => `
            <article class="role-card">
                <figure class="role-figure">
                    <img src="${role.image}" alt="${role.imageAlt}" loading="lazy" decoding="async">
                </figure>
                <h3>${role.title}</h3>
                <p class="role-meta"><span>${role.track}</span> · <span>${role.level}</span></p>
                <p class="role-summary">${role.summary}</p>
                <ul>
                    <li><strong>Time to entry:</strong> ${role.timeToEntry}</li>
                    <li><strong>Salary range:</strong> ${role.salaryRange}</li>
                </ul>
                <button type="button" class="button-outline" data-role="${role.id}">View details</button>
            </article>
        `
        )
        .join('');

    grid.innerHTML = cards;
};

const updateFilterButtons = () => {
    const buttons = document.querySelectorAll('[data-track]');
    buttons.forEach((button) => {
        const isActive = button.dataset.track === state.filter;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
};

const populateModal = (role) => {
    const modal = document.querySelector('#role-modal');
    if (!modal) return;
    modal.querySelector('[data-modal-title]').textContent = role.title;
    modal.querySelector('[data-modal-track]').textContent = role.track;
    modal.querySelector('[data-modal-level]').textContent = role.level;
    modal.querySelector('[data-modal-summary]').textContent = role.summary;
    const modalImage = modal.querySelector('[data-modal-image]');
    if (modalImage) {
        modalImage.src = role.image;
        modalImage.alt = role.imageAlt;
    }
    modal.querySelector('[data-modal-skills]').textContent = role.skills.join(', ');
    modal.querySelector('[data-modal-tools]').textContent = role.tools.join(', ');
    modal.querySelector('[data-modal-time]').textContent = role.timeToEntry;
    modal.querySelector('[data-modal-salary]').textContent = role.salaryRange;
};

const openModal = (roleId) => {
    const role = state.roles.find((item) => item.id === roleId);
    if (!role) return;
    populateModal(role);
    const modal = document.querySelector('#role-modal');
    if (modal && typeof modal.showModal === 'function') {
        modal.showModal();
    }
};

const bindModal = () => {
    const modal = document.querySelector('#role-modal');
    const closeButton = document.querySelector('#close-modal');
    const grid = document.querySelector('#roles-grid');

    if (grid) {
        grid.addEventListener('click', (event) => {
            const target = event.target.closest('[data-role]');
            if (!target) return;
            openModal(target.dataset.role);
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal?.close();
        });
    }

    if (modal) {
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.close();
            }
        });
    }
};

const bindFilters = () => {
    const buttons = document.querySelectorAll('[data-track]');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const value = button.dataset.track || 'all';
            setFilter(value);
            updateFilterButtons();
            renderRoles();
        });
    });
};

const loadRoles = async () => {
    const status = document.querySelector('#roles-status');
    if (status) {
        status.textContent = 'Loading roles...';
    }

    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) {
            throw new Error(`Request failed: ${response.status}`);
        }
        const data = await response.json();
        state.roles = Array.isArray(data.roles) ? data.roles : [];
        if (!state.roles.length) {
            throw new Error('No role data available.');
        }
        if (status) {
            status.textContent = '';
        }
        renderRoles();
    } catch (error) {
        console.error('Role load failed', error);
        if (status) {
            status.textContent = 'Unable to load roles right now. Please refresh later.';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        state.filter = stored;
    }
    updateFooterMeta();
    updateFilterButtons();
    bindFilters();
    bindModal();
    loadRoles();
});
