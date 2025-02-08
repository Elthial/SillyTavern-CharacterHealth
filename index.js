import { useState, useEffect } from "react";
import { getContext } from "../../extensions.js";

export default function CharacterHealthBar() {
    const [character, setCharacter] = useState({ name: "Unknown", avatar: "" });
    const [health, setHealth] = useState(100);
    const [mana, setMana] = useState(100);

    useEffect(() => {
        const context = getContext();
        const activeCharacter = context.characters?.find(c => c.active);
        
        if (activeCharacter) {
            setCharacter({ name: activeCharacter.name, avatar: activeCharacter.avatar });
        }

        // Fetch health and mana from STScript variables
        const fetchVariables = async () => {
            const healthVar = await context.runSTScript(`/getvar health`);
            const manaVar = await context.runSTScript(`/getvar mana`);
            setHealth(Number(healthVar) || 100);
            setMana(Number(manaVar) || 100);
        };

        fetchVariables();
    }, []);

    const updateVariable = async (key, value, setter) => {
        await getContext().runSTScript(`/setvar key=${key} value=${value}`);
        setter(value);
    };

    return (
        <div className="bg-gray-900 p-4 rounded-xl shadow-lg flex items-center space-x-4 w-80">
            <div className="flex flex-col flex-grow">
                <span className="text-white font-bold text-lg">{character.name}</span>
                
                {/* Health Bar */}
                <div className="relative w-full bg-red-700 rounded-full h-4 mt-1">
                    <div className="absolute top-0 left-0 h-full bg-red-500 rounded-full transition-all"
                         style={{ width: `${health}%` }} />
                </div>
                <span className="text-sm text-gray-300">Health: {health}%</span>

                {/* Mana Bar */}
                <div className="relative w-full bg-blue-700 rounded-full h-4 mt-1">
                    <div className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all"
                         style={{ width: `${mana}%` }} />
                </div>
                <span className="text-sm text-gray-300">Mana: {mana}%</span>
            </div>

            {/* Character Thumbnail */}
            <img src={character.avatar} alt="Character Avatar" className="w-12 h-12 rounded-full object-cover border border-gray-500" />
        </div>
    );
}
