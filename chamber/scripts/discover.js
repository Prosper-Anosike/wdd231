import { places } from '../data/discover.mjs';

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

const updateVisitMessage = () => {
    const messageField = document.querySelector('#visit-message');
    if (!messageField) return;
    const key = 'discover-last-visit';
    const now = Date.now();
    const stored = localStorage.getItem(key);
    if (!stored) {
        messageField.textContent = 'Welcome! Let us know if you have any questions.';
        localStorage.setItem(key, String(now));
        return;
    }
    const lastVisit = Number(stored);
    const diffDays = Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24));
    if (diffDays < 1) {
        messageField.textContent = 'Back so soon! Awesome!';
    } else if (diffDays === 1) {
        messageField.textContent = 'You last visited 1 day ago.';
    } else {
        messageField.textContent = `You last visited ${diffDays} days ago.`;
    }
    localStorage.setItem(key, String(now));
};

const renderCards = () => {
    const grid = document.querySelector('#discover-grid');
    if (!grid) return;
    const fragment = document.createDocumentFragment();
    places.forEach((place, index) => {
        const card = document.createElement('article');
        card.className = `discover-card area-${index + 1}`;

        const title = document.createElement('h2');
        title.textContent = place.title;

        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = place.image;
        img.alt = place.title;
        img.loading = 'lazy';
        figure.appendChild(img);

        const address = document.createElement('address');
        address.textContent = place.address;

        const description = document.createElement('p');
        description.textContent = place.description;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button-outline';
        button.textContent = 'Learn more';

        card.appendChild(title);
        card.appendChild(figure);
        card.appendChild(address);
        card.appendChild(description);
        card.appendChild(button);
        fragment.appendChild(card);
    });
    grid.appendChild(fragment);
};

document.addEventListener('DOMContentLoaded', () => {
    updateFooterMeta();
    updateVisitMessage();
    renderCards();
});
