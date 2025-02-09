// Character Health UI Extension for SillyTavern
import { characters, eventSource, event_types } from '../../../../script.js';
import { groups } from '../../../group-chats.js';
import { getContext } from '../../../extensions.js';

let updateInterval = null; // Store interval ID

// Create parent character-tag container
const characterTagContainer = document.createElement("div");
characterTagContainer.className = "characterTagContainer";
document.body.appendChild(characterTagContainer);

//-------------------------------------------------------------------------------------
//Insert the below tags into the parent tag container
//-------------------------------------------------------------------------------------

// Optional info tags
function createinfoTag(text) {
   const infoTag = document.createElement("div");
   infoTag.className = "infoTag";
   infoTag.innerText = text;
   characterTagContainer.appendChild(infoTag);
}

// Function to create character tag
function createCharacterTag(character, context) {

    //Need to correctly handle spaces
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

    // Set STScript variables if not already set
    if (!context.variables.local.get('${safename}_health')) {
        context.variables.local.set('${safename}_health', 100);
    }
    if (!context.variables.local.get('${safename}_mana')) {
        context.variables.local.set('${safename}_mana', 100);
    }

    return template;
}

//-------------------------------------------------------------------------------------

// Function to update the health UI
function updateCharacterInfo() {
    console.log("[CH] Updating Character Health UI");

    // Clear existing interval
    if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
    }

    const context = getContext();

    // Clear existing UI
    characterTagContainer.innerHTML = "";

    if (!context.characterId && !context.groupId)
    {
        console.log('[CH] No chat loaded');
        return;
    }

    // (Optional) Add info tag
    //createInfoTag("Character Status");

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
      .map((char) => createCharacterTag(char, context))
      .join("");

    console.log('[CH] characterHTML');
    console.log(characterHTML);

    // Inject into UI
    characterTagContainer.innerHTML += characterHTML;

    // health/mana variable updates
    updateInterval =setInterval(() => {
        activeCharacters.forEach((char) => {
            if (!char) return;

            //Need to correctly handle spaces
            const safename = char.name.replace(/\s+/g, '_');

            const health = context.variables.local.get(`${safename}_health`) || 100;
            const mana = context.variables.local.get(`${safename}_mana`) || 100;

            console.log('[CH] barHTML');
            console.log(`${safename}-health`);
            console.log(`${safename}-mana`);

            document.getElementById(`${safename}-health`).style.width = `${health}%`;
            document.getElementById(`${safename}-mana`).style.width = `${mana}%`;
        });
    }, 1000);

    console.log('[CH] updateBars');
}

// Run on character selection change
eventSource.on(event_types.CHAT_CHANGED, ()=>(updateCharacterInfo()));
eventSource.on(event_types.GROUP_UPDATED, ()=>(updateCharacterInfo()));
