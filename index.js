// Character Health UI Extension for SillyTavern
import { characters, eventSource, event_types } from '../../../../script.js';
import { getContext } from '../../../extensions.js';

// Create a UI container
const healthUIContainer = document.createElement("div");
healthUIContainer.id="healthUIContainer"
healthUIContainer.style.position = "absolute";
healthUIContainer.style.top = "10px";
healthUIContainer.style.left = "10px";
healthUIContainer.style.padding = "10px";
healthUIContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
healthUIContainer.style.borderRadius = "8px";
healthUIContainer.style.color = "#fff";
healthUIContainer.style.display = "flex";
healthUIContainer.style.alignItems = "center";
healthUIContainer.style.gap = "10px";
document.body.appendChild(healthUIContainer);

// Get active character details
function updateCharacterInfo() {

    const context = getContext();
    const character = characters[context.characterId];

    if (!character)
    {
        console.log('[CH] Early exit');
        return;
    }


    // Character name
    let characterName = character.name || "Unknown";
    console.log('[CH] Character name: ' + characterName);

    // Character thumbnail
    let characterImage = character.avatar || "";

    // Clear existing UI
    healthUIContainer.innerHTML = "";

 
    // Create character image
    const avatarDiv = document.createElement("div");
    avatarDiv.classList.add("avatar"); // Add the class to match `.avatar img`
    const img = document.createElement("img");
    img.id="avatar_load_preview"
    img.src = `/thumbnail?type=avatar&file=${characterImage}`;
    avatarDiv.appendChild(img); // Append img inside the div

    // Create name text
    const nameText = document.createElement("span");
    nameText.innerText = characterName;
    nameText.style.fontSize = "16px";
    nameText.style.fontWeight = "bold";

    // Create health bar
    const healthBarContainer = document.createElement("div");
    healthBarContainer.style.width = "150px";
    healthBarContainer.style.height = "10px";
    healthBarContainer.style.backgroundColor = "#444";
    healthBarContainer.style.borderRadius = "5px";
    healthBarContainer.style.overflow = "hidden";

    const healthBar = document.createElement("div");
    healthBar.style.width = "100%";
    healthBar.style.height = "100%";
    healthBar.style.backgroundColor = "red";

    healthBarContainer.appendChild(healthBar);

    // Create mana bar
    const manaBarContainer = document.createElement("div");
    manaBarContainer.style.width = "150px";
    manaBarContainer.style.height = "10px";
    manaBarContainer.style.backgroundColor = "#444";
    manaBarContainer.style.borderRadius = "5px";
    manaBarContainer.style.overflow = "hidden";

    const manaBar = document.createElement("div");
    manaBar.style.width = "100%";
    manaBar.style.height = "100%";
    manaBar.style.backgroundColor = "blue";

    manaBarContainer.appendChild(manaBar);

    // Append elements
    healthUIContainer.appendChild(avatarDiv);
    healthUIContainer.appendChild(nameText);
    healthUIContainer.appendChild(healthBarContainer);
    healthUIContainer.appendChild(manaBarContainer);

    // Update health and mana dynamically
    function updateBars() {    
        const health = context.variables.local.get("character_health") || 100;
        const mana = context.variables.local.get("character_mana") || 100;
        healthBar.style.width = `${health}%`;
        manaBar.style.width = `${mana}%`;
    }

  
    // Set STScript variables if not already set
    if (!context.variables.local.get("character_health")) {
        context.variables.local.set("character_health", 100);
    }
    if (!context.variables.local.get("character_mana")) {
        context.variables.local.set("character_mana", 100);
    }

    // Update bars every second
    setInterval(updateBars, 1000);

    console.log('[CH] updateBars');
}

// Run on character selection change
eventSource.on(event_types.CHAT_CHANGED, ()=>(updateCharacterInfo(),null));
eventSource.on(event_types.GROUP_UPDATED, ()=>(updateCharacterInfo(),null));
