document.addEventListener('DOMContentLoaded', () => {
    const memberContainer = document.querySelector('#member-container');
    const viewButtons = document.querySelectorAll('.view-toggle');
    const DEFAULT_VIEW = 'grid';
    const levelLabels = {
        1: 'Member',
        2: 'Silver',
        3: 'Gold'
    };

    const setStatus = (message) => {
        if (!memberContainer) return;
        memberContainer.innerHTML = '';
        const status = document.createElement('p');
        status.className = 'directory-status';
        status.textContent = message;
        memberContainer.appendChild(status);
    };

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

    const formatPhoneHref = (phone) => phone ? phone.replace(/[^+\d]/g, '') : '';

    const createMetaItem = (label, content) => {
        const li = document.createElement('li');
        const strong = document.createElement('span');
        strong.textContent = label;
        li.appendChild(strong);
        if (content instanceof Node) {
            li.appendChild(content);
        } else if (content) {
            li.appendChild(document.createTextNode(content));
        }
        return li;
    };

    const createMemberCard = (member) => {
        const card = document.createElement('article');
        card.className = 'member-card';
        if (typeof member.membershipLevel !== 'undefined') {
            card.dataset.level = String(member.membershipLevel);
        }
        card.setAttribute('aria-label', member.name);

        const hero = document.createElement('div');
        hero.className = 'member-hero';

        const logo = document.createElement('img');
        logo.src = member.image;
        logo.alt = member.imageAlt || `${member.name} wordmark`;
        logo.loading = 'lazy';
        hero.appendChild(logo);

        const identity = document.createElement('div');
        identity.className = 'member-identity';

        if (typeof member.membershipLevel !== 'undefined') {
            const level = document.createElement('p');
            level.className = 'level';
            level.textContent = `${levelLabels[member.membershipLevel] || 'Member'} member`;
            identity.appendChild(level);
        }

        const title = document.createElement('h3');
        title.textContent = member.name;
        identity.appendChild(title);

        const regionPieces = [];
        const cityState = [member.city, member.state].filter(Boolean).join(', ');
        if (cityState) {
            regionPieces.push(cityState);
        }
        if (member.founded) {
            regionPieces.push(`Est. ${member.founded}`);
        }
        if (regionPieces.length) {
            const region = document.createElement('p');
            region.textContent = regionPieces.join(' • ');
            identity.appendChild(region);
        }

        hero.appendChild(identity);
        card.appendChild(hero);

        const details = document.createElement('div');
        details.className = 'member-details';

        if (member.description) {
            const description = document.createElement('p');
            description.className = 'description';
            description.textContent = member.description;
            details.appendChild(description);
        }

        const metaList = document.createElement('ul');
        metaList.className = 'member-meta';
        const addressParts = [member.address, member.city, member.state, member.postal].filter(Boolean).join(', ');
        if (addressParts) {
            metaList.appendChild(createMetaItem('Address:', addressParts));
        }

        if (member.phone) {
            const phoneLink = document.createElement('a');
            phoneLink.href = `tel:${formatPhoneHref(member.phone)}`;
            phoneLink.textContent = member.phone;
            metaList.appendChild(createMetaItem('Phone:', phoneLink));
        }

        if (member.website) {
            const siteLink = document.createElement('a');
            siteLink.href = member.website;
            siteLink.target = '_blank';
            siteLink.rel = 'noopener noreferrer';
            siteLink.textContent = member.website.replace(/^https?:\/\//, '');
            metaList.appendChild(createMetaItem('Website:', siteLink));
        }

        if (metaList.children.length) {
            details.appendChild(metaList);
        }

        if (Array.isArray(member.services) && member.services.length) {
            const servicesList = document.createElement('ul');
            servicesList.className = 'member-services';
            servicesList.setAttribute('aria-label', 'Highlighted services');
            member.services.forEach((service) => {
                const li = document.createElement('li');
                li.textContent = service;
                servicesList.appendChild(li);
            });
            details.appendChild(servicesList);
        }

        const actions = document.createElement('div');
        actions.className = 'member-actions';

        if (member.website) {
            const visitLink = document.createElement('a');
            visitLink.href = member.website;
            visitLink.target = '_blank';
            visitLink.rel = 'noopener noreferrer';
            visitLink.className = 'button-primary';
            visitLink.textContent = 'Visit site';
            actions.appendChild(visitLink);
        }

        if (member.phone) {
            const callLink = document.createElement('a');
            callLink.href = `tel:${formatPhoneHref(member.phone)}`;
            callLink.className = 'button-ghost';
            callLink.textContent = 'Call office';
            actions.appendChild(callLink);
        }

        if (actions.children.length) {
            details.appendChild(actions);
        }

        card.appendChild(details);
        return card;
    };

    const renderMembers = (members) => {
        if (!memberContainer) return;
        if (!Array.isArray(members) || !members.length) {
            setStatus('No members are published yet. Please check back soon.');
            return;
        }
        memberContainer.innerHTML = '';
        const fragment = document.createDocumentFragment();
        members.forEach((member) => {
            fragment.appendChild(createMemberCard(member));
        });
        memberContainer.appendChild(fragment);
    };

    const setView = (view) => {
        if (!memberContainer) return;
        memberContainer.classList.toggle('grid-view', view === 'grid');
        memberContainer.classList.toggle('list-view', view === 'list');
        viewButtons.forEach((button) => {
            const isActive = button.dataset.view === view;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-pressed', String(isActive));
        });
    };

    const loadMembers = async () => {
        if (!memberContainer) return;
        setStatus('Loading member directory...');
        try {
            const response = await fetch('data/members.json');
            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }
            const data = await response.json();
            renderMembers(data.members);
        } catch (error) {
            console.error('Directory load failed', error);
            setStatus('Unable to load the directory right now. Please refresh or try again later.');
        }
    };

    viewButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            if (view) {
                setView(view);
            }
        });
    });

    setView(DEFAULT_VIEW);
    updateFooterMeta();
    loadMembers();
});
