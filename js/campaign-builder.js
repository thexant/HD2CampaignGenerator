class Operation {
    constructor(index = 0) {
        this.id = `operation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.index = index;
        this.name = `Operation ${index + 1}`;
        this.faction = null;
        this.planet = null;
        this.city = null;
        this.difficulty = 5;
        this.enableFallback = true;
        this.briefingText = '';
        this.transitionText = '';
        this.primaryObjectiveTitle = '';
        this.primaryObjectiveDescription = '';
        this.secondaryObjectiveDescription = '';
        this.missions = []; // Array of mission objects with modifiers
        this.isValid = false;
        
        // Initialize missions based on default difficulty
        this.updateMissions();
    }
    
    // Calculate number of missions based on difficulty level
    getMissionCount() {
        if (this.difficulty >= 1 && this.difficulty <= 2) {
            return 1; // Difficulties 1-2: 1 mission
        } else if (this.difficulty >= 3 && this.difficulty <= 4) {
            return 2; // Difficulties 3-4: 2 missions
        } else if (this.difficulty >= 5 && this.difficulty <= 10) {
            return 3; // Difficulties 5+: 3 missions
        }
        return 1; // Fallback
    }
    
    // Update missions array when difficulty changes
    updateMissions() {
        const requiredMissions = this.getMissionCount();
        
        // Add missions if we need more
        while (this.missions.length < requiredMissions) {
            this.missions.push({
                id: `mission_${this.missions.length + 1}`,
                name: `Mission ${this.missions.length + 1}`,
                modifiers: []
            });
        }
        
        // Remove excess missions if we have too many
        while (this.missions.length > requiredMissions) {
            this.missions.pop();
        }
        
        // Update mission names to ensure they're sequential
        this.missions.forEach((mission, index) => {
            mission.id = `mission_${index + 1}`;
            mission.name = `Mission ${index + 1}`;
        });
    }

    validate() {
        this.isValid = !!(this.faction && this.planet && this.difficulty >= 1 && this.difficulty <= 10);
        return this.isValid;
    }

    toJSON() {
        return {
            id: this.id,
            index: this.index,
            name: this.name,
            faction: this.faction,
            planet: this.planet,
            city: this.city,
            difficulty: this.difficulty,
            enableFallback: this.enableFallback,
            briefingText: this.briefingText,
            transitionText: this.transitionText,
            primaryObjectiveTitle: this.primaryObjectiveTitle,
            primaryObjectiveDescription: this.primaryObjectiveDescription,
            secondaryObjectiveDescription: this.secondaryObjectiveDescription,
            missions: this.missions.map(mission => ({
                id: mission.id,
                name: mission.name,
                modifiers: [...mission.modifiers]
            })),
            isValid: this.isValid
        };
    }

    static fromJSON(data) {
        const operation = new Operation(data.index);
        operation.id = data.id;
        operation.name = data.name || `Operation ${data.index + 1}`;
        operation.faction = data.faction;
        operation.planet = data.planet;
        operation.city = data.city;
        operation.difficulty = data.difficulty || 5;
        operation.enableFallback = data.enableFallback !== undefined ? data.enableFallback : true;
        operation.briefingText = data.briefingText || '';
        operation.transitionText = data.transitionText || '';
        operation.primaryObjectiveTitle = data.primaryObjectiveTitle || '';
        operation.primaryObjectiveDescription = data.primaryObjectiveDescription || '';
        operation.secondaryObjectiveDescription = data.secondaryObjectiveDescription || '';
        
        // Handle missions data
        if (data.missions && Array.isArray(data.missions)) {
            operation.missions = data.missions.map(mission => ({
                id: mission.id || 'mission_1',
                name: mission.name || 'Mission 1',
                modifiers: Array.isArray(mission.modifiers) ? [...mission.modifiers] : []
            }));
        } else {
            // If no missions data, initialize based on difficulty
            operation.updateMissions();
        }
        
        operation.validate();
        return operation;
    }
}

class CampaignBuilder {
    constructor() {
        this.campaign = {
            name: '',
            description: '',
            operations: [],
            createdAt: new Date().toISOString(),
            type: 'custom'
        };
        this.availableFactions = [];
        this.availablePlanets = new Map(); // faction -> planets
        this.availableCities = new Map(); // planetId -> cities
        this.isInitialized = false;
        this.isInitializing = false;
        this.draggedOperation = null;
    }

    initialize() {
        if (this.isInitialized) return;
        
        console.log('Initializing Campaign Builder...');
        this.loadAvailableData();
        
        // Force a refresh of modifiers UI after a short delay to ensure scripts are loaded
        setTimeout(() => {
            this.refreshModifiersUI();
        }, 100);
        
        this.isInitialized = true;
        console.log('Campaign Builder initialized successfully');
    }

    loadAvailableData() {
        // Simply use data that's already been fetched by the generator
        // No new API calls needed
        console.log('Campaign Builder using already fetched game data...');
        
        this.gameData = null; // Will be set by the app when generator runs
        this.availableFactions = [];
        this.availablePlanets.clear();
        
        console.log('Campaign Builder ready for data from generator');
    }
    
    setGameData(gameData) {
        // Called by the app to provide already-fetched data
        this.gameData = gameData;
        const planets = gameData.planets;
        
        // Filter to enemy planets only (same as campaign generator)
        const enemyPlanets = apiService.getEnemyPlanets(planets);
        console.log(`Campaign Builder received ${enemyPlanets.length} enemy planets from ${planets.length} total planets`);
        
        // Get available factions from enemy planets
        this.availableFactions = apiService.getAvailableFactions(enemyPlanets);
        console.log('Available factions for Campaign Builder:', this.availableFactions);
        
        // Group enemy planets by faction
        this.availablePlanets.clear();
        this.availableFactions.forEach(faction => {
            const factionPlanets = enemyPlanets.filter(planet => 
                apiService.getCurrentEnemy(planet) === faction
            );
            this.availablePlanets.set(faction, factionPlanets);
            console.log(`${faction}: ${factionPlanets.length} planets (with region data)`);
        });
    }
    

    getAvailableCitiesForPlanet(planet) {
        // Get cities that are actually available (enemy-controlled) from API data
        if (!planet) {
            return [];
        }
        
        // Always get the city mappings for this planet
        const cityMappings = window.cityMappings?.getCities(planet.name) || [];
        if (cityMappings.length === 0) {
            // No cities mapped for this planet
            return [];
        }
        
        // If we have real-time region data, use it to filter cities
        if (planet.availableRegions && planet.availableRegions.length > 0) {
            const availableCities = [];
            
            planet.availableRegions.forEach(region => {
                const cityMapping = cityMappings.find(city => city.index === region.index);
                if (cityMapping) {
                    availableCities.push({
                        index: region.index,
                        name: cityMapping.name,
                        owner: region.owner,
                        health: region.health,
                        maxHealth: region.maxHealth,
                        isAvailable: region.isAvailable !== false // Default to true if not specified
                    });
                }
            });
            
            // If we found cities from API data, return them
            if (availableCities.length > 0) {
                return availableCities;
            }
        }
        
        // Fallback: if no API region data or no matches, show all mapped cities
        // This ensures the builder is always functional even without live API data
        console.log(`Using fallback city data for ${planet.name}: ${cityMappings.length} cities`);
        return cityMappings.map(city => ({
            index: city.index,
            name: city.name,
            owner: null, // Unknown - API data unavailable
            health: null,
            maxHealth: null,
            isAvailable: true // Assume available as fallback
        }));
    }
    
    // Legacy method for compatibility
    getCitiesForPlanet(planetName) {
        // Use the city mappings for static data (fallback)
        if (window.cityMappings) {
            return window.cityMappings.getCities(planetName) || [];
        }
        return [];
    }

    addOperation() {
        const operation = new Operation(this.campaign.operations.length);
        this.campaign.operations.push(operation);
        return operation;
    }

    removeOperation(operationId) {
        const index = this.campaign.operations.findIndex(op => op.id === operationId);
        if (index !== -1) {
            this.campaign.operations.splice(index, 1);
            // Re-index remaining operations
            this.campaign.operations.forEach((op, idx) => {
                op.index = idx;
                if (!op.name.includes('Operation') || op.name === `Operation ${idx}`) {
                    op.name = `Operation ${idx + 1}`;
                }
            });
        }
    }

    moveOperation(fromIndex, toIndex) {
        if (fromIndex >= 0 && fromIndex < this.campaign.operations.length && 
            toIndex >= 0 && toIndex < this.campaign.operations.length) {
            
            const [operation] = this.campaign.operations.splice(fromIndex, 1);
            this.campaign.operations.splice(toIndex, 0, operation);
            
            // Re-index all operations
            this.campaign.operations.forEach((op, idx) => {
                op.index = idx;
                if (!op.name || op.name.match(/^Operation \d+$/)) {
                    op.name = `Operation ${idx + 1}`;
                }
            });
        }
    }

    getOperation(operationId) {
        return this.campaign.operations.find(op => op.id === operationId);
    }

    updateOperation(operationId, updates) {
        const operation = this.getOperation(operationId);
        if (operation) {
            const oldDifficulty = operation.difficulty;
            Object.assign(operation, updates);
            
            // If difficulty changed, update missions
            if (updates.difficulty && updates.difficulty !== oldDifficulty) {
                operation.updateMissions();
            }
            
            operation.validate();
        }
    }

    // Mission management methods
    getMission(operationId, missionId) {
        const operation = this.getOperation(operationId);
        if (operation) {
            return operation.missions.find(mission => mission.id === missionId);
        }
        return null;
    }

    updateMissionModifiers(operationId, missionId, modifiers) {
        const mission = this.getMission(operationId, missionId);
        if (mission) {
            mission.modifiers = Array.isArray(modifiers) ? [...modifiers] : [];
            return true;
        }
        return false;
    }

    addModifierToMission(operationId, missionId, modifier) {
        const mission = this.getMission(operationId, missionId);
        if (mission && !mission.modifiers.includes(modifier)) {
            mission.modifiers.push(modifier);
            return true;
        }
        return false;
    }

    removeModifierFromMission(operationId, missionId, modifier) {
        const mission = this.getMission(operationId, missionId);
        if (mission) {
            const index = mission.modifiers.indexOf(modifier);
            if (index > -1) {
                mission.modifiers.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    // Get available modifiers (from mission-types.js)
    getAvailableModifiers() {
        // Try multiple ways to access the modifiers
        let modifiers = [];
        
        // First try direct access
        if (window.MISSION_TYPES && window.MISSION_TYPES.MODIFIERS) {
            modifiers = window.MISSION_TYPES.MODIFIERS;
        } 
        // Try global scope access
        else if (typeof MISSION_TYPES !== 'undefined' && MISSION_TYPES.MODIFIERS) {
            modifiers = MISSION_TYPES.MODIFIERS;
        }
        // Fallback: wait a moment and try again (async loading issue)
        else if (modifiers.length === 0) {
            console.warn('MISSION_TYPES not available, using fallback modifiers');
            // Return a subset of commonly used modifiers as fallback
            modifiers = [
                { name: "Fire-Based Loadouts", description: "Equip incendiary weapons and stratagems, embrace the cleansing flame of democracy" },
                { name: "Laser-Based Loadouts", description: "Utilize energy weapons and laser-based equipment for precision strikes" },
                { name: "Arc-Based Loadouts", description: "Deploy electrical weapons and arc technology to chain through enemy ranks" },
                { name: "Explosive Ordnance Focus", description: "Maximize use of grenades, mines, and explosive stratagems" },
                { name: "Orbital Support Priority", description: "Rely heavily on orbital stratagems" },
                { name: "Eagle Close Air Support", description: "Rely heavily on Eagle-1 stratagems" },
                { name: "Long Range Engagement", description: "Maintain distance and utilize sniper rifles and long-range support weapons" },
                { name: "Close Quarters Combat", description: "Engage enemies at close range with shotguns, SMGs, and other short-range weapons" },
                { name: "Heavy Weapons Focus", description: "Prioritize support weapons and anti-tank equipment over lighter armaments" },
                { name: "Rapid Deployment", description: "Complete objectives with maximum speed and efficiency, minimize time spent in this mission" }
            ];
        }
        
        console.log('Available modifiers:', modifiers.length, modifiers);
        return modifiers;
    }

    // Force refresh modifiers and update UI
    refreshModifiersUI() {
        // Try to get fresh modifiers
        const modifiers = this.getAvailableModifiers();
        console.log('Refreshing modifiers UI with', modifiers.length, 'modifiers');
        
        // Update all existing operation cards
        this.campaign.operations.forEach(operation => {
            if (window.app && window.app.refreshOperationMissions) {
                window.app.refreshOperationMissions(operation.id);
            }
        });
    }

    // Auto-assign random modifiers to all missions in an operation
    assignRandomModifiers(operationId, modifiersPerMission = 1) {
        const operation = this.getOperation(operationId);
        const availableModifiers = this.getAvailableModifiers();
        
        if (operation && availableModifiers.length > 0) {
            operation.missions.forEach(mission => {
                mission.modifiers = [];
                const shuffled = [...availableModifiers].sort(() => 0.5 - Math.random());
                const count = Math.min(modifiersPerMission, shuffled.length);
                
                for (let i = 0; i < count; i++) {
                    mission.modifiers.push(shuffled[i].name);
                }
            });
            return true;
        }
        return false;
    }

    validateCampaign() {
        const errors = [];
        const warnings = [];

        if (!this.campaign.name.trim()) {
            errors.push('Campaign name is required');
        }

        if (this.campaign.operations.length === 0) {
            errors.push('At least one operation is required');
        }

        this.campaign.operations.forEach((op, index) => {
            if (!op.validate()) {
                errors.push(`Operation ${index + 1} is incomplete`);
            }
        });

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    async getFallbackPlanet(originalPlanet, faction) {
        const factionPlanets = this.availablePlanets.get(faction) || [];
        if (factionPlanets.length === 0) {
            return null;
        }
        
        // Try to find a planet with the same biome
        const originalBiome = apiService.getPlanetBiome(originalPlanet);
        const sameBiomePlanets = factionPlanets.filter(planet => 
            planet.id !== originalPlanet.id && 
            apiService.getPlanetBiome(planet) === originalBiome
        );
        
        if (sameBiomePlanets.length > 0) {
            return sameBiomePlanets[Math.floor(Math.random() * sameBiomePlanets.length)];
        }
        
        // Fallback to any available planet of the same faction
        const otherPlanets = factionPlanets.filter(planet => planet.id !== originalPlanet.id);
        if (otherPlanets.length > 0) {
            return otherPlanets[Math.floor(Math.random() * otherPlanets.length)];
        }
        
        return null;
    }

    async exportCampaign() {
        const validation = this.validateCampaign();
        if (!validation.isValid) {
            throw new Error(`Cannot export invalid campaign: ${validation.errors.join(', ')}`);
        }

        // Convert operations to the format expected by the tour system
        // Now we export individual missions with their modifiers
        const missions = [];
        let missionId = 0;
        
        for (let i = 0; i < this.campaign.operations.length; i++) {
            const operation = this.campaign.operations[i];
            
            // Extract biome and hazard strings using API service methods
            const biome = apiService.getPlanetBiome(operation.planet);
            const hazard = apiService.getPlanetHazard(operation.planet);
            
            // Create missions based on operation's mission array
            if (operation.missions && operation.missions.length > 0) {
                operation.missions.forEach((missionData, missionIndex) => {
                    const mission = {
                        id: missionId++,
                        name: `${operation.name} - ${missionData.name}`,
                        operationName: operation.name,
                        missionIndex: missionIndex,
                        planet: {
                            name: operation.planet.name,
                            sector: operation.planet.sector || "Unknown Sector",
                            biome: biome,
                            hazard: hazard,
                            hazardDescription: hazard !== "None" ? `Environmental hazard: ${hazard}` : "Standard conditions",
                            isDefense: operation.planet.isDefense || false,
                            displayName: operation.planet.displayName || `${operation.planet.name} - ${operation.planet.sector || "Unknown Sector"}`
                        },
                        faction: operation.faction,
                        difficulty: {
                            level: operation.difficulty,
                            name: this.getDifficultyName(operation.difficulty)
                        },
                        city: operation.city,
                        briefing: operation.briefingText || this.generateDefaultBriefing(operation),
                        transitionText: missionIndex === operation.missions.length - 1 ? operation.transitionText || '' : '',
                        enableFallback: operation.enableFallback,
                        customPrimaryTitle: operation.primaryObjectiveTitle,
                        customPrimaryDescription: operation.primaryObjectiveDescription,
                        customSecondaryDescription: operation.secondaryObjectiveDescription,
                        modifiers: [...(missionData.modifiers || [])],
                        isCustom: true
                    };
                    
                    missions.push(mission);
                });
            } else {
                // Fallback for operations without missions data (shouldn't happen with new system)
                const mission = {
                    id: missionId++,
                    name: operation.name,
                    operationName: operation.name,
                    missionIndex: 0,
                    planet: {
                        name: operation.planet.name,
                        sector: operation.planet.sector || "Unknown Sector",
                        biome: biome,
                        hazard: hazard,
                        hazardDescription: hazard !== "None" ? `Environmental hazard: ${hazard}` : "Standard conditions",
                        isDefense: operation.planet.isDefense || false,
                        displayName: operation.planet.displayName || `${operation.planet.name} - ${operation.planet.sector || "Unknown Sector"}`
                    },
                    faction: operation.faction,
                    difficulty: {
                        level: operation.difficulty,
                        name: this.getDifficultyName(operation.difficulty)
                    },
                    city: operation.city,
                    briefing: operation.briefingText || this.generateDefaultBriefing(operation),
                    transitionText: operation.transitionText || '',
                    enableFallback: operation.enableFallback,
                    customPrimaryTitle: operation.primaryObjectiveTitle,
                    customPrimaryDescription: operation.primaryObjectiveDescription,
                    customSecondaryDescription: operation.secondaryObjectiveDescription,
                    modifiers: [],
                    isCustom: true
                };
                
                missions.push(mission);
            }
        }

        // Generate campaign narrative structure
        const campaign = {
            name: this.campaign.name,
            description: this.campaign.description,
            missions: missions,
            metadata: {
                type: 'custom',
                createdAt: this.campaign.createdAt,
                generatedAt: new Date().toISOString(),
                version: '1.0',
                operationCount: this.campaign.operations.length
            }
        };

        return campaign;
    }

    generateDefaultBriefing(operation) {
        const templates = [
            `Helldivers, your mission is to secure ${operation.planet.name} from ${operation.faction} forces. Exercise extreme caution - the enemy has established a strong presence in this sector.`,
            `Operation ${operation.name}: Eliminate ${operation.faction} presence on ${operation.planet.name}. This world is crucial to our strategic objectives in the region.`,
            `Your orders are clear, Helldiver: liberate ${operation.planet.name} from ${operation.faction} occupation. Super Earth is counting on your success.`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    getDifficultyName(level) {
        const difficulties = [
            '', 'Trivial', 'Easy', 'Medium', 'Challenging', 'Hard',
            'Extreme', 'Suicide Mission', 'Impossible', 'Helldive', 'Super Helldive'
        ];
        return difficulties[level] || 'Unknown';
    }

    importCampaign(campaignData) {
        try {
            // Validate import data
            if (!campaignData || typeof campaignData !== 'object') {
                throw new Error('Invalid campaign data');
            }

            // Reset current campaign
            this.campaign = {
                name: campaignData.name || 'Imported Campaign',
                description: campaignData.description || '',
                operations: [],
                createdAt: campaignData.metadata?.createdAt || new Date().toISOString(),
                type: 'custom'
            };

            // Import operations from missions
            if (campaignData.missions && Array.isArray(campaignData.missions)) {
                // Group missions by operation (new format) or treat each as separate operation (legacy format)
                const missionGroups = new Map();
                
                campaignData.missions.forEach(mission => {
                    // Check if this is new format (has operationName and missionIndex)
                    if (mission.operationName !== undefined && mission.missionIndex !== undefined) {
                        // New format: group by operationName
                        if (!missionGroups.has(mission.operationName)) {
                            missionGroups.set(mission.operationName, []);
                        }
                        missionGroups.get(mission.operationName).push(mission);
                    } else {
                        // Legacy format: each mission is its own operation
                        const operationName = mission.name || `Operation ${missionGroups.size + 1}`;
                        missionGroups.set(operationName, [mission]);
                    }
                });
                
                // Create operations from grouped missions
                let operationIndex = 0;
                for (const [operationName, missions] of missionGroups) {
                    const firstMission = missions[0];
                    const operation = new Operation(operationIndex++);
                    
                    // Set operation properties from first mission
                    operation.name = operationName;
                    operation.faction = firstMission.faction;
                    operation.planet = firstMission.planet;
                    operation.city = firstMission.city || null;
                    operation.difficulty = firstMission.difficulty?.level || firstMission.difficulty || 5;
                    operation.enableFallback = firstMission.enableFallback !== undefined ? firstMission.enableFallback : true;
                    operation.briefingText = firstMission.briefing || '';
                    operation.primaryObjectiveTitle = firstMission.customPrimaryTitle || '';
                    operation.primaryObjectiveDescription = firstMission.customPrimaryDescription || '';
                    operation.secondaryObjectiveDescription = firstMission.customSecondaryDescription || '';
                    
                    // Find transition text from the last mission in this operation
                    const lastMission = missions[missions.length - 1];
                    operation.transitionText = lastMission.transitionText || '';
                    
                    // Import mission data with modifiers
                    operation.missions = missions.map((mission, mIndex) => ({
                        id: `mission_${mIndex + 1}`,
                        name: `Mission ${mIndex + 1}`,
                        modifiers: Array.isArray(mission.modifiers) ? [...mission.modifiers] : []
                    }));
                    
                    operation.validate();
                    this.campaign.operations.push(operation);
                }
            }

            console.log(`Imported campaign "${this.campaign.name}" with ${this.campaign.operations.length} operations`);
            return true;
        } catch (error) {
            console.error('Failed to import campaign:', error);
            throw error;
        }
    }

    reset() {
        this.campaign = {
            name: '',
            description: '',
            operations: [],
            createdAt: new Date().toISOString(),
            type: 'custom'
        };
    }

    // Drag and drop functionality
    startDrag(operationId) {
        this.draggedOperation = operationId;
    }

    endDrag() {
        this.draggedOperation = null;
    }

    dropOperation(targetOperationId) {
        if (!this.draggedOperation || this.draggedOperation === targetOperationId) {
            return false;
        }

        const fromIndex = this.campaign.operations.findIndex(op => op.id === this.draggedOperation);
        const toIndex = this.campaign.operations.findIndex(op => op.id === targetOperationId);
        
        if (fromIndex !== -1 && toIndex !== -1) {
            this.moveOperation(fromIndex, toIndex);
            return true;
        }
        
        return false;
    }
}

// Global instance
var campaignBuilder = new CampaignBuilder();