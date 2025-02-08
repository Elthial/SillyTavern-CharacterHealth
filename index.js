// Character Health UI Extension for SillyTavern
import { getContext } from '../../../extensions.js';

const context = getContext();

// Create a UI container
const healthUIContainer = document.createElement("div");
healthUIContainer.style.id="healthUIContainer"
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
	console.log('[CH] updateCharacterInfo');
	console.log(context);
    console.log('[CH] List Characters');
    console.log(context.characters);
    const character = context.characters[context.characterId];
	
	console.log('[CH] CharacterInfo: ' + character);
    if (!character)
    {
        console.log('[CH] Early exit');
        return;
    } 

    console.log('[CH] Character name: ' + characterName);
    // Character name
    let characterName = character.name || "Unknown";
    
    // Character thumbnail
    let characterImage = character.avatar || "";
    
    // Clear existing UI
    healthUIContainer.innerHTML = "";

    log('Create character image');
    // Create character image
    const img = document.createElement("img");
    img.src = characterImage;
    img.style.width = "50px";
    img.style.height = "50px";
    img.style.borderRadius = "5px";

    log('Create name text');
    // Create name text
    const nameText = document.createElement("span");
    nameText.innerText = characterName;
    nameText.style.fontSize = "16px";
    nameText.style.fontWeight = "bold";

    log('Create health bar');
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

    log('Create mana bar');
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

    log('Append elements');
    // Append elements
    healthUIContainer.appendChild(img);
    healthUIContainer.appendChild(nameText);
    healthUIContainer.appendChild(healthBarContainer);
    healthUIContainer.appendChild(manaBarContainer);

    // Update health and mana dynamically
    function updateBars() {
        const health = context.getVariable("character_health") || 100;
        const mana = context.getVariable("character_mana") || 100;

        healthBar.style.width = `${health}%`;
        manaBar.style.width = `${mana}%`;
    }

    // Set STScript variables if not already set
    if (!context.getVariable("character_health")) {
        context.setVariable("character_health", 100);
    }
    if (!context.getVariable("character_mana")) {
        context.setVariable("character_mana", 100);
    }

    // Update bars every second
    setInterval(updateBars, 1000);
}

// Run on character selection change
context.eventSource.on("CHAT_CHANGED", ()=>{
    updateCharacterInfo();
}); 
updateCharacterInfo();