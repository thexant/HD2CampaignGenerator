/**
 * REAL HELLDIVERS 2 MISSION TYPES TEMPLATE
 * 
 * Fill this template with actual mission types from the game.
 * Missions are organized by:
 * - Faction (Terminids, Automatons, Illuminate)
 * - Environment (planet, city/region)  
 * - Difficulty range
 * 
 * Instructions:
 * 1. Replace "TEMPLATE_MISSION_NAME" with actual mission names from the game
 * 2. Update descriptions with real mission descriptions
 * 3. Adjust difficulty ranges based on when missions actually appear
 * 4. Add/remove missions as needed for each category
 * 5. Uncomment sections as you fill them in
 */

const REAL_MISSION_TYPES = {
    
    // =============================================================================
    // TERMINIDS (BUGS) - PLANET MISSIONS (Non-City)
    // =============================================================================
    TERMINIDS: {
        PLANET: {
            // Difficulty 1-3 (Trivial to Challenging)
            LOW_DIFFICULTY: [
                /*
                {
                    id: "eliminate_bug_holes_easy",
                    name: "TEMPLATE_MISSION_NAME",
                    description: "TEMPLATE_DESCRIPTION", 
                    minDifficulty: 1,
                    maxDifficulty: 3,
                    faction: "Terminids",
                    environment: "planet",
                    type: "primary"
                },
                */
            ],
            
            // Difficulty 4-6 (Hard to Extreme)  
            MID_DIFFICULTY: [
                /*
                {
                    id: "template_mission_id",
                    name: "TEMPLATE_MISSION_NAME",
                    description: "TEMPLATE_DESCRIPTION",
                    minDifficulty: 4, 
                    maxDifficulty: 6,
                    faction: "Terminids",
                    environment: "planet",
                    type: "primary"
                },
                */
            ],
            
            // Difficulty 7-9 (Suicide to Helldive)
            HIGH_DIFFICULTY: [
                /*
                {
                    id: "template_mission_id",
                    name: "TEMPLATE_MISSION_NAME", 
                    description: "TEMPLATE_DESCRIPTION",
                    minDifficulty: 7,
                    maxDifficulty: 9,
                    faction: "Terminids",
                    environment: "planet", 
                    type: "primary"
                },
                */
            ]
        },
        
        // TERMINIDS - CITY/REGION MISSIONS
        CITY: {
            LOW_DIFFICULTY: [
                /*
                {
                    id: "template_city_mission_id",
                    name: "TEMPLATE_CITY_MISSION_NAME",
                    description: "TEMPLATE_CITY_DESCRIPTION",
                    minDifficulty: 1,
                    maxDifficulty: 3,
                    faction: "Terminids",
                    environment: "city",
                    type: "primary"
                },
                */
            ],
            
            MID_DIFFICULTY: [
                // Fill with real city missions for Terminids difficulty 4-6
            ],
            
            HIGH_DIFFICULTY: [
                // Fill with real city missions for Terminids difficulty 7-9
            ]
        }
    },

    // =============================================================================
    // AUTOMATONS (BOTS) - PLANET MISSIONS (Non-City)
    // =============================================================================
    AUTOMATONS: {
        PLANET: {
            LOW_DIFFICULTY: [
                /*
                {
                    id: "eliminate_fabricators_easy",
                    name: "TEMPLATE_MISSION_NAME",
                    description: "TEMPLATE_DESCRIPTION",
                    minDifficulty: 1,
                    maxDifficulty: 3,
                    faction: "Automatons", 
                    environment: "planet",
                    type: "primary"
                },
                */
            ],
            
            MID_DIFFICULTY: [
                // Fill with real planet missions for Automatons difficulty 4-6
            ],
            
            HIGH_DIFFICULTY: [
                // Fill with real planet missions for Automatons difficulty 7-9
            ]
        },
        
        // AUTOMATONS - CITY/REGION MISSIONS  
        CITY: {
            LOW_DIFFICULTY: [
                // Fill with real city missions for Automatons difficulty 1-3
            ],
            
            MID_DIFFICULTY: [
                // Fill with real city missions for Automatons difficulty 4-6
            ],
            
            HIGH_DIFFICULTY: [
                // Fill with real city missions for Automatons difficulty 7-9
            ]
        }
    },

    // =============================================================================
    // ILLUMINATE (SQUIDS) - PLANET MISSIONS (Non-City)
    // =============================================================================
    ILLUMINATE: {
        PLANET: {
            LOW_DIFFICULTY: [
                // Fill with real planet missions for Illuminate difficulty 1-3
            ],
            
            MID_DIFFICULTY: [
                // Fill with real planet missions for Illuminate difficulty 4-6
            ],
            
            HIGH_DIFFICULTY: [
                // Fill with real planet missions for Illuminate difficulty 7-9
            ]
        },
        
        // ILLUMINATE - CITY/REGION MISSIONS
        CITY: {
            LOW_DIFFICULTY: [
                // Fill with real city missions for Illuminate difficulty 1-3
            ],
            
            MID_DIFFICULTY: [
                // Fill with real city missions for Illuminate difficulty 4-6
            ],
            
            HIGH_DIFFICULTY: [
                // Fill with real city missions for Illuminate difficulty 7-9
            ]
        }
    },

    // =============================================================================
    // SECONDARY OBJECTIVES (Available for all factions)
    // =============================================================================
    SECONDARY_OBJECTIVES: {
        // Secondary objectives that work on any planet
        UNIVERSAL: [
            /*
            {
                id: "template_secondary_id",
                name: "TEMPLATE_SECONDARY_NAME",
                description: "TEMPLATE_SECONDARY_DESCRIPTION",
                environment: "any", // "planet", "city", or "any"
                type: "secondary"
            },
            */
        ],
        
        // Secondary objectives specific to cities
        CITY_ONLY: [
            /*
            {
                id: "template_city_secondary_id", 
                name: "TEMPLATE_CITY_SECONDARY_NAME",
                description: "TEMPLATE_CITY_SECONDARY_DESCRIPTION",
                environment: "city",
                type: "secondary"
            },
            */
        ],
        
        // Secondary objectives specific to planets (non-city)
        PLANET_ONLY: [
            /*
            {
                id: "template_planet_secondary_id",
                name: "TEMPLATE_PLANET_SECONDARY_NAME", 
                description: "TEMPLATE_PLANET_SECONDARY_DESCRIPTION",
                environment: "planet",
                type: "secondary"
            },
            */
        ]
    }
};

// =============================================================================
// EXAMPLE ENTRIES (Remove these when filling in real data)
// =============================================================================

/* 
EXAMPLE of how to fill in a real mission:

{
    id: "eliminate_bug_holes",
    name: "Eliminate Bug Holes", 
    description: "Destroy all Terminid nest structures in the area",
    minDifficulty: 1,
    maxDifficulty: 9,
    faction: "Terminids",
    environment: "planet", 
    type: "primary"
},

{
    id: "secure_urban_district", 
    name: "Secure Urban District",
    description: "Clear and hold enemy-occupied city blocks",
    minDifficulty: 4,
    maxDifficulty: 8, 
    faction: "Automatons",
    environment: "city",
    type: "primary"
}
*/

// =============================================================================
// MISSION SELECTION HELPER FUNCTIONS
// =============================================================================

/**
 * Get available missions for a faction, environment, and difficulty
 * @param {string} faction - "Terminids", "Automatons", or "Illuminate"
 * @param {string} environment - "planet" or "city" 
 * @param {number} difficulty - 1-9
 * @returns {Array} Available missions
 */
function getAvailableMissions(faction, environment, difficulty) {
    const factionData = REAL_MISSION_TYPES[faction.toUpperCase()];
    if (!factionData) return [];
    
    const envData = factionData[environment.toUpperCase()];
    if (!envData) return [];
    
    let difficultyCategory;
    if (difficulty <= 3) difficultyCategory = 'LOW_DIFFICULTY';
    else if (difficulty <= 6) difficultyCategory = 'MID_DIFFICULTY'; 
    else difficultyCategory = 'HIGH_DIFFICULTY';
    
    const missions = envData[difficultyCategory] || [];
    
    // Filter by exact difficulty range
    return missions.filter(mission => 
        difficulty >= mission.minDifficulty && 
        difficulty <= mission.maxDifficulty
    );
}

/**
 * Get available secondary objectives for environment
 * @param {string} environment - "planet", "city", or "any"
 * @returns {Array} Available secondary objectives
 */
function getAvailableSecondaryObjectives(environment) {
    const secondaries = REAL_MISSION_TYPES.SECONDARY_OBJECTIVES;
    let available = [...secondaries.UNIVERSAL];
    
    if (environment === 'city') {
        available = available.concat(secondaries.CITY_ONLY);
    } else if (environment === 'planet') {
        available = available.concat(secondaries.PLANET_ONLY);
    }
    
    return available;
}

/**
 * Check if faction has missions available for environment and difficulty
 * @param {string} faction - Faction name
 * @param {string} environment - "planet" or "city"
 * @param {number} difficulty - 1-9 
 * @returns {boolean} True if missions available
 */
function hasMissionsAvailable(faction, environment, difficulty) {
    return getAvailableMissions(faction, environment, difficulty).length > 0;
}

// Export for use in mission generator
// (Uncomment when ready to use)
// const realMissionTypes = REAL_MISSION_TYPES;