// Character Health UI Extension for SillyTavern
import { characters, eventSource, event_types } from '../../../../script.js';
import { groups } from '../../../group-chats.js';
import { getContext } from '../../../extensions.js';

// Store interval ID
let updateCharacterInterval = null;
let updateInfoInterval = null;

// Create parent character-tag container
const characterTagContainer = document.createElement("div");
characterTagContainer.className = "characterTagContainer";
document.body.appendChild(characterTagContainer);

//#########################################################################
// Bar animations
//#########################################################################

//#########################################################################

// Function to animate bars with impact effect
function animateBarChange(barId, newValue) {
    const barContainer = document.getElementById(barId)?.parentElement;
    if (!barContainer) return;

    let bar = document.getElementById(barId);
    let shadowBar = barContainer.querySelector(`.${barId}-shadow`);

    if (!shadowBar) {
        shadowBar = document.createElement("div");
        shadowBar.className = `${barId}-shadow characterTag-bar-shadow`;
        shadowBar.style.width = bar.style.width;
        barContainer.appendChild(shadowBar);
    }

    const currentValue = parseFloat(bar.style.width) || 100;
    if (newValue >= currentValue) {
        bar.style.width = `${newValue}%`;
        shadowBar.style.width = `${newValue}%`;
        return;
    }

    shadowBar.style.width = `${currentValue}%`;

    // Flash effect
    bar.classList.add("characterTag-bar-flash");

    setTimeout(() => {
        bar.classList.remove("characterTag-bar-flash");
        bar.style.width = `${newValue}%`;
    }, 100);

    setTimeout(() => {
        shadowBar.style.width = `${newValue}%`;
    }, 1000);
}



//#########################################################################



// Function to create a simple info tag displaying day, date, and time
function createInfoTag() {
    const now = new Date();

    const template = `
        <div class="infoTag">
            <div class="infoTag-Id-container">
                <div class="infoTag-avatar avatar">
                    <i class="far fa-clock fa-3x"></i>
                </div>
                <div class="infoTag-bar-container">
                    <div class="infoTag-calendar" id="infoTag-calendar">${now.toDateString()}</div>
                    <div class="infoTag-clock" id="infoTag-clock">${now.toLocaleTimeString()}</div>
                </div>
            </div>
        </div>
    `;

    updateInfoInterval = setInterval(() => {
        const now = new Date();
        document.getElementById(`infoTag-calendar`).innerText = now.toDateString();
        document.getElementById(`infoTag-clock`).innerText = now.toLocaleTimeString();
    }, 1000);

    return template;
}

function createCharacterTag(character, barTypes, context) {
    const safename = character.name.replace(/\s+/g, '_');
    const barsHTML = barTypes.map(type => `
        <div class="characterTag-bar-container">
            <div class="characterTag-${type}-bar characterTag-bar" id="${safename}-${type}"></div>
        </div>
    `).join('');

    const template = `
        <div class="characterTag">
            <div class="characterTag-Id-container">
                <div class="characterTag-avatar avatar">
                    <img src="/thumbnail?type=avatar&file=${character.avatar}" alt="${character.name}">
                </div>
                <span class="characterTag-name">${character.name}</span>
            </div>
            ${barsHTML}
        </div>
    `;

    //Need to populate the default value on init
    barTypes.forEach(type => {
        if (!context.variables.local.get(`${safename}_${type}`)) {
            context.variables.local.set(`${safename}_${type}`, 100);
        }
    });

    return template;
}

// Function to update the health UI
function updateCharacterInfo() {
    console.log("[CH] Updating Character Tag UI");

    if (updateCharacterInterval) {
        clearInterval(updateCharacterInterval);
        clearInterval(updateInfoInterval);
        updateCharacterInterval = null;
        updateInfoInterval = null;
    }

    // Define bar types
    const barTypes = ["health", "mana"];

    const context = getContext();
    characterTagContainer.innerHTML = "";

    if (!context.characterId && !context.groupId) {
        console.log('[CH] No chat loaded');
        return;
    }

    let infoHTML = createInfoTag();

    let activeCharacters = [];
    const group = groups.find(g => g.id === context.groupId);

    if (group) {
        activeCharacters = group.members.map(member =>
            characters.find(x => x.avatar === member || x.name === member)
        ).filter(Boolean);
    } else {
        activeCharacters.push(characters[context.characterId]);
    }

    let characterHTML = activeCharacters
        .map(char => createCharacterTag(char, barTypes, context))
        .join("");

    characterTagContainer.innerHTML += infoHTML;
    characterTagContainer.innerHTML += characterHTML;

    updateCharacterInterval = setInterval(() => {
        activeCharacters.forEach((char) => {
            if (!char) return;
            const safename = char.name.replace(/\s+/g, '_');
            barTypes.forEach(type => {
                const value = context.variables.local.get(`${safename}_${type}`) || 100;
                animateBarChange(`${safename}-${type}`, value);
            });
        });
    }, 1000);
}

eventSource.on(event_types.CHAT_CHANGED, () => updateCharacterInfo());
eventSource.on(event_types.GROUP_UPDATED, () => updateCharacterInfo());
