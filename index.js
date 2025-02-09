// Character Health UI Extension for SillyTavern
import { characters, eventSource, event_types } from '../../../../script.js';
import { groups } from '../../../group-chats.js';
import { getContext } from '../../../extensions.js';

// Create main health UI container
const healthUIContainer = document.createElement("div");
healthUIContainer.id = "character-health-UI";
document.body.appendChild(healthUIContainer);

// Optional info bar
function createInfoBar(text) {
   const infoBar = document.createElement("div");
   infoBar.className = "info-bar";
   infoBar.innerText = text;
   healthUIContainer.appendChild(infoBar);
}

// Function to create a health bar entry
function createHealthBar(character) {
    const template = `
        <div class="character-bar-container" id="characterbar-${character.name}">
            <div class="avatar">
                <img src="/thumbnail?type=avatar&file=${character.avatar}" alt="${character.name}">
            </div>
            <span class="character-name">${character.name}</span>
            <div class="health-bar"><div id="${character.name}-health" style="width: 100%;"></div></div>
            <div class="mana-bar"><div id="${character.name}-mana" style="width: 100%;"></div></div>
        </div>
    `;

    const context = getContext();

    // Set STScript variables if not already set
    if (!context.variables.local.get('${character.name}_health')) {
        context.variables.local.set('${character.name}_health', 100);
    }
    if (!context.variables.local.get('${character.name}_mana')) {
        context.variables.local.set('${character.name}_mana', 100);
    }

    return template;
}

// Function to update the health UI
function updateCharacterInfo() {
    console.log("[CH] Updating Character Health UI");

    const context = getContext();

    // Clear existing UI
    healthUIContainer.innerHTML = "";

    if (!context.characterId && !context.groupId)
    {
        console.log('[CH] No chat loaded');
        return;
    }

    // (Optional) Add info bar
    createInfoBar("Character Status");

    const GroupId = context.groupId;
    console.log("[CH] GroupId: " + GroupId);

    console.log('[CH] Context');
    console.log(context);
    console.log('[CH] Groups');
    console.log(groups)

    // Get active group/characters
    let activeCharacters = [];

    const group = context.groups[context.groupId];
    console.log('[CH] activeGroup');
    console.log(group)

    //  if (group) {
    //    for (let member of group.members) {
    //      const character = characters.find(x => x.avatar === member || x.name === member);
    //      activeCharacters.push(character);
    //    }
    //  } else {
          activeCharacters.push(characters[context.characterId]);
    //  }

    console.log('[CH] activeCharacters');
    console.log(activeCharacters);

    // Populate health bars
    let characterHTML = activeCharacters
      .filter((char) => char) // Filter out undefined characters
      .map((char) => createHealthBar(char))
      .join("");

    console.log('[CH] characterHTML');
    console.log(characterHTML);

    // Inject into UI
    healthUIContainer.innerHTML += characterHTML;

    // Set health/mana updates
    setInterval(() => {
        characters.forEach((char) => {
            if (!char) return;

            const health = context.variables.local.get(`${char.name}_health`) || 100;
            const mana = context.variables.local.get(`${char.name}_mana`) || 100;

            console.log('[CH] barHTML');
            console.log(`${char.name}-health`);
            console.log(`${char.name}-mana`);

            document.getElementById(`${char.name}-health`).style.width = `${health}%`;
            document.getElementById(`${char.name}-mana`).style.width = `${mana}%`;
        });
    }, 1000);

    console.log('[CH] updateBars');
}

// Run on character selection change
eventSource.on(event_types.CHAT_CHANGED, ()=>(updateCharacterInfo()));
eventSource.on(event_types.GROUP_UPDATED, ()=>(updateCharacterInfo()));
