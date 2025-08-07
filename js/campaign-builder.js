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
        this.isValid = false;
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
            Object.assign(operation, updates);
            operation.validate();
        }
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
        const missions = [];
        
        for (let i = 0; i < this.campaign.operations.length; i++) {
            const operation = this.campaign.operations[i];
            
            // Create mission object compatible with existing system
            const mission = {
                id: i,
                name: operation.name,
                planet: operation.planet,
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
                isCustom: true
            };
            
            missions.push(mission);
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
                campaignData.missions.forEach((mission, index) => {
                    const operation = new Operation(index);
                    operation.name = mission.name || `Operation ${index + 1}`;
                    operation.faction = mission.faction;
                    operation.planet = mission.planet;
                    operation.city = mission.city || null;
                    operation.difficulty = mission.difficulty?.level || mission.difficulty || 5;
                    operation.enableFallback = mission.enableFallback !== undefined ? mission.enableFallback : true;
                    operation.briefingText = mission.briefing || '';
                    operation.transitionText = mission.transitionText || '';
                    operation.primaryObjectiveTitle = mission.customPrimaryTitle || '';
                    operation.primaryObjectiveDescription = mission.customPrimaryDescription || '';
                    operation.secondaryObjectiveDescription = mission.customSecondaryDescription || '';
                    operation.validate();
                    
                    this.campaign.operations.push(operation);
                });
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