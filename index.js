// Character Health UI Extension for SillyTavern
import { characters, eventSource, event_types } from '../../../../script.js';
import { groups } from '../../../group-chats.js';
import { getContext } from '../../../extensions.js';

// Create main health UI container
const healthUIContainer = document.createElement("div");
healthUIContainer.id = "health-ui";
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
        <div class="healthbar-container" id="healthbar-${character.name}">
            <div class="avatar">
                <img src="/thumbnail?type=avatar&file=${character.avatar}" alt="${character.name}">
            </div>
            <span class="character-name">${character.name}</span>
            <div class="health-bar"><div id="health-${character.name}" style="width: 100%;"></div></div>
            <div class="mana-bar"><div id="mana-${character.name}" style="width: 100%;"></div></div>
        </div>
    `;
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

            const health = context.variables.local.get(`health_${char.name}`) || 100;
            const mana = context.variables.local.get(`mana_${char.name}`) || 100;

            document.getElementById(`health-${char.name}`).style.width = `${health}%`;
            document.getElementById(`mana-${char.name}`).style.width = `${mana}%`;
        });
    }, 1000);

    console.log('[CH] updateBars');
}

// Run on character selection change
eventSource.on(event_types.CHAT_CHANGED, ()=>(updateCharacterInfo()));
eventSource.on(event_types.GROUP_UPDATED, ()=>(updateCharacterInfo()));
