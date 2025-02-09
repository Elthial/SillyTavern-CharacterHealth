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

// Function to animate the health/mana bars with impact effect
function animateBarChange(barId, newValue) {
    const bar = document.getElementById(barId);
    if (!bar) return;
    
    const currentValue = parseFloat(bar.style.width) || 100;
    var difference = Math.abs(currentValue - newValue);
    
    // Flash effect by changing bar color temporarily
    bar.style.transition = "none";
    bar.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
    
    setTimeout(() => {
        bar.style.backgroundColor = "";
        bar.style.transition = "width 1s ease-in-out";
        bar.style.width = `${newValue}%`;
    }, 100);
    
    // Gradually shrink the transition from the impact difference
    let step = difference / 20;
    let interval = setInterval(() => {
        if (difference <= 0) {
            clearInterval(interval);
            return;
        }
        difference -= step;
        bar.style.width = `${newValue + difference}%`;
    }, 50);
    
    setTimeout(() => {
        bar.style.width = `${newValue}%`;
    }, 1000);
}

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

function createCharacterTag(character, context) {
    const safename = character.name.replace(/\s+/g, '_');

    const template = `
        <div class="characterTag">
            <div class="characterTag-Id-container">
                <div class="characterTag-avatar avatar">
                    <img src="/thumbnail?type=avatar&file=${character.avatar}" alt="${character.name}">
                </div>
                <span class="characterTag-name">${character.name}</span>
            </div>
            <div class="characterTag-bar-container">
                <div class="characterTag-health-bar" id="${safename}-health"></div>
            </div>
            <div class="characterTag-bar-container">
                <div class="characterTag-mana-bar" id="${safename}-mana"></div>
            </div>
        </div>
    `;

    if (!context.variables.local.get(`${safename}_health`)) {
        context.variables.local.set(`${safename}_health`, 100);
    }
    if (!context.variables.local.get(`${safename}_mana`)) {
        context.variables.local.set(`${safename}_mana`, 100);
    }

    return template;
}

// Function to update the health UI
function updateCharacterInfo() {
    console.log("[CH] Updating Character Health UI");

    if (updateCharacterInterval) {
        clearInterval(updateCharacterInterval);
        clearInterval(updateInfoInterval);
        updateCharacterInterval = null;
        updateInfoInterval = null;
    }

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
        for (let member of group.members) {
            const character = characters.find(x => x.avatar === member || x.name === member);
            activeCharacters.push(character);
        }
    } else {
        activeCharacters.push(characters[context.characterId]);
    }

    let characterHTML = activeCharacters
      .filter((char) => char)
      .map((char) => createCharacterTag(char, context))
      .join("");

    characterTagContainer.innerHTML += infoHTML;
    characterTagContainer.innerHTML += characterHTML;

    updateCharacterInterval = setInterval(() => {
        activeCharacters.forEach((char) => {
            if (!char) return;
            const safename = char.name.replace(/\s+/g, '_');
            const health = context.variables.local.get(`${safename}_health`) || 100;
            const mana = context.variables.local.get(`${safename}_mana`) || 100;
            animateBarChange(`${safename}-health`, health);
            animateBarChange(`${safename}-mana`, mana);
        });
    }, 1000);
}

eventSource.on(event_types.CHAT_CHANGED, () => updateCharacterInfo());
eventSource.on(event_types.GROUP_UPDATED, () => updateCharacterInfo());
