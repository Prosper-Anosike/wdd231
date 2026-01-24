const levelLabels = {
    1: 'Member',
    2: 'Silver',
    3: 'Gold'
};

const coordinates = {
    lat: 9.0765,
    lon: 7.3986
};

const PLACEHOLDER_VALUES = new Set([
    'YOUR_OPENWEATHERMAP_KEY',
    'REPLACE_WITH_KEY',
    'ADD_KEY_HERE'
]);

const sanitizeKey = (raw) => {
    if (!raw) return '';
    const trimmed = raw.trim();
    if (trimmed.length < 10) return '';
    const normalized = trimmed.toUpperCase();
    if (PLACEHOLDER_VALUES.has(normalized)) return '';
    return trimmed;
};

const getWeatherApiKey = () => {
    if (window.OPENWEATHERMAP_KEY) {
        return sanitizeKey(String(window.OPENWEATHERMAP_KEY));
    }
    const metaTag = document.querySelector('meta[name="weather-api-key"]');
    return sanitizeKey(metaTag ? metaTag.content : '');
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

const formatWind = (speedInMetersPerSecond) => {
    if (typeof speedInMetersPerSecond !== 'number') return '-- km/h';
    return `${Math.round(speedInMetersPerSecond * 3.6)} km/h`;
};

const capitalize = (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
};

const setWeatherAlert = (message, isError = false) => {
    const alertField = document.querySelector('#weather-alert');
    if (!alertField) return;
    alertField.textContent = message;
    alertField.dataset.state = isError ? 'error' : 'info';
};

const renderCurrentWeather = (data) => {
    const tempField = document.querySelector('#weather-temp');
    const descField = document.querySelector('#weather-description');
    const humidityField = document.querySelector('#weather-humidity');
    const windField = document.querySelector('#weather-wind');
    const feelsField = document.querySelector('#weather-feels');
    const updatedField = document.querySelector('#weather-updated');
    const iconField = document.querySelector('#weather-icon');

    if (!data || !tempField || !descField || !humidityField || !windField || !feelsField) {
        return;
    }

    const weather = Array.isArray(data.weather) ? data.weather[0] : null;
    const description = weather ? capitalize(weather.description) : 'Current conditions';

    tempField.textContent = `${Math.round(data.main.temp)}°C`;
    descField.textContent = description;
    humidityField.textContent = `${data.main.humidity}%`;
    feelsField.textContent = `${Math.round(data.main.feels_like)}°C`;
    windField.textContent = formatWind(data.wind?.speed);

    if (updatedField) {
        const updated = new Date(data.dt * 1000);
        updatedField.textContent = `Updated ${updated.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
        })}`;
    }

    if (iconField && weather?.icon) {
        iconField.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
        iconField.alt = description;
        iconField.hidden = false;
    }
};

const buildForecastCard = (entry) => {
    const card = document.createElement('article');
    card.className = 'forecast-card';
    const date = new Date(entry.dt * 1000);
    const dayLabel = date.toLocaleDateString('en-US', {
        weekday: 'short'
    });
    const temp = Math.round(entry.main.temp);
    const description = capitalize(entry.weather?.[0]?.description ?? 'Forecast');

    card.innerHTML = `
        <p class="day">${dayLabel}</p>
        <p class="temp">${temp}°C</p>
        <p class="summary">${description}</p>
    `;
    return card;
};

const pickNextThreeDays = (list) => {
    if (!Array.isArray(list)) return [];
    const now = new Date();
    const middayEntries = list.filter((entry) => {
        const date = new Date(entry.dt * 1000);
        return date.getHours() === 12 && date > now;
    });
    const selected = middayEntries.slice(0, 3);
    if (selected.length === 3) {
        return selected;
    }
    const fallback = list.filter((entry) => new Date(entry.dt * 1000) > now).slice(0, 3);
    return fallback;
};

const renderForecast = (list) => {
    const container = document.querySelector('#weather-forecast');
    if (!container) return;
    container.innerHTML = '';
    const entries = pickNextThreeDays(list);
    if (!entries.length) {
        container.innerHTML = '<p class="forecast-empty">Forecast data unavailable right now.</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    entries.forEach((entry) => {
        fragment.appendChild(buildForecastCard(entry));
    });
    container.appendChild(fragment);
};

const describeError = async (response) => {
    try {
        const data = await response.json();
        if (data?.message) {
            return `${response.status} ${response.statusText || ''} · ${data.message}`.trim();
        }
    } catch (error) {
        // ignore parsing errors and fall back to default text
    }
    return `${response.status} ${response.statusText || 'Unknown error'}`;
};

const loadWeather = async () => {
    const apiKey = getWeatherApiKey();
    if (!apiKey) {
        setWeatherAlert('Add your OpenWeatherMap API key to the meta[name="weather-api-key"] tag to load live data.', true);
        return;
    }
    setWeatherAlert('Loading weather data...');
    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=metric&appid=${apiKey}`;
        const [weatherRes, forecastRes] = await Promise.all([
            fetch(weatherUrl),
            fetch(forecastUrl)
        ]);
        if (!weatherRes.ok || !forecastRes.ok) {
            const summary = !weatherRes.ok ? await describeError(weatherRes) : await describeError(forecastRes);
            throw new Error(summary);
        }
        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();
        renderCurrentWeather(weatherData);
        renderForecast(forecastData.list);
        setWeatherAlert('');
    } catch (error) {
        console.error('Weather load failed', error);
        const message = error instanceof Error && error.message ? error.message : 'Unable to load weather updates. Please retry shortly.';
        setWeatherAlert(message, true);
    }
};

const formatPhoneHref = (phone) => (phone ? phone.replace(/[^+\d]/g, '') : '');

const createSpotlightCard = (member) => {
    const card = document.createElement('article');
    card.className = 'spotlight-card';
    const badge = levelLabels[member.membershipLevel] || 'Member';
    const location = [member.address, member.city, member.state].filter(Boolean).join(', ');

    const header = document.createElement('div');
    header.className = 'spotlight-header';

    const logo = document.createElement('img');
    logo.src = member.image;
    logo.alt = member.imageAlt || `${member.name} logo`;
    logo.loading = 'lazy';
    header.appendChild(logo);

    const headerCopy = document.createElement('div');
    const membership = document.createElement('p');
    membership.className = 'membership';
    membership.textContent = `${badge} member`;
    const title = document.createElement('h3');
    title.textContent = member.name;
    headerCopy.appendChild(membership);
    headerCopy.appendChild(title);
    header.appendChild(headerCopy);

    const description = document.createElement('p');
    description.className = 'spotlight-description';
    description.textContent = member.description || '';

    const metaList = document.createElement('ul');
    metaList.className = 'spotlight-meta';

    if (location) {
        const locationItem = document.createElement('li');
        locationItem.textContent = location;
        metaList.appendChild(locationItem);
    }

    if (member.phone) {
        const phoneItem = document.createElement('li');
        const phoneLink = document.createElement('a');
        phoneLink.href = `tel:${formatPhoneHref(member.phone)}`;
        phoneLink.textContent = member.phone;
        phoneItem.appendChild(phoneLink);
        metaList.appendChild(phoneItem);
    }

    if (member.website) {
        const siteItem = document.createElement('li');
        const siteLink = document.createElement('a');
        siteLink.href = member.website;
        siteLink.target = '_blank';
        siteLink.rel = 'noopener noreferrer';
        siteLink.textContent = member.website.replace(/^https?:\/\//, '');
        siteItem.appendChild(siteLink);
        metaList.appendChild(siteItem);
    }

    card.appendChild(header);
    card.appendChild(description);
    if (metaList.children.length) {
        card.appendChild(metaList);
    }

    if (member.website) {
        const button = document.createElement('a');
        button.href = member.website;
        button.target = '_blank';
        button.rel = 'noopener noreferrer';
        button.className = 'btn-secondary';
        button.textContent = 'Visit website';
        card.appendChild(button);
    }

    return card;
};

const sampleMembers = (members) => {
    const eligible = members.filter((member) => member.membershipLevel >= 2);
    if (!eligible.length) return [];
    const count = eligible.length === 2 ? 2 : Math.min(eligible.length, Math.random() > 0.5 ? 3 : 2);
    for (let i = eligible.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }
    return eligible.slice(0, count);
};

const loadSpotlights = async () => {
    const container = document.querySelector('#spotlight-container');
    if (!container) return;
    container.innerHTML = '<p class="spotlight-status">Loading spotlights...</p>';
    try {
        const response = await fetch('data/members.json');
        if (!response.ok) {
            throw new Error('Spotlight request failed');
        }
        const data = await response.json();
        const members = Array.isArray(data.members) ? data.members : [];
        const picks = sampleMembers(members);
        if (!picks.length) {
            container.innerHTML = '<p class="spotlight-status">No featured members to display yet.</p>';
            return;
        }
        const fragment = document.createDocumentFragment();
        picks.forEach((member) => {
            fragment.appendChild(createSpotlightCard(member));
        });
        container.innerHTML = '';
        container.appendChild(fragment);
    } catch (error) {
        console.error('Spotlight load failed', error);
        container.innerHTML = '<p class="spotlight-status">Unable to load spotlight members right now.</p>';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    updateFooterMeta();
    loadWeather();
    loadSpotlights();
});
