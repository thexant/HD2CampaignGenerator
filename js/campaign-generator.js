class CampaignGenerator {
    constructor() {
        this.isGenerating = false;
        this.currentCampaign = null;
    }

    async generateCampaign(preferences = {}) {
        if (this.isGenerating) {
            console.warn('Campaign generation already in progress');
            return null;
        }

        this.isGenerating = true;
        
        try {
            // Get live game data
            console.log('Fetching game data from API...');
            const gameData = await apiService.getAllGameData();
            const planets = gameData.planets;
            
            console.log('Received planets data:', planets.length, 'planets');
            console.log('Sample planet:', planets[0]);
            
            if (!planets || planets.length === 0) {
                throw new Error('No planet data available');
            }

            // Determine campaign length
            const campaignLength = this.determineCampaignLength(preferences.length);
            
            // Generate missions
            const missions = await this.generateMissions(planets, campaignLength, preferences);
            
            if (missions.length === 0) {
                throw new Error('Failed to generate any missions');
            }

            // Generate narrative
            const campaign = narrativeGenerator.generateFullCampaignNarrative(missions);
            
            // Add metadata
            campaign.metadata = {
                generatedAt: new Date().toISOString(),
                preferences: preferences,
                planetData: {
                    totalPlanets: planets.length,
                    availableFactions: apiService.getAvailableFactions(planets)
                }
            };
            
            this.currentCampaign = campaign;
            return campaign;
            
        } catch (error) {
            console.error('Campaign generation failed:', error);
            throw error;
        } finally {
            this.isGenerating = false;
        }
    }

    async generateMissions(planets, campaignLength, preferences) {
        const missions = [];
        const usedPlanets = new Set();
        
        // Get available enemy planets
        const enemyPlanets = apiService.getEnemyPlanets(planets);
        
        console.log('Enemy planets found:', enemyPlanets.length);
        console.log('Sample enemy planet:', enemyPlanets[0]);
        
        if (enemyPlanets.length === 0) {
            console.log('All planets data for debugging:', planets.map(p => ({
                name: p.name,
                currentOwner: p.currentOwner,
                enemy: apiService.getCurrentEnemy(p)
            })));
            throw new Error('No enemy planets available for missions');
        }

        // Determine faction strategy
        const factionStrategy = this.determineFactionStrategy(preferences.faction, enemyPlanets);
        
        for (let i = 0; i < campaignLength; i++) {
            const planet = this.selectPlanetForMission(
                enemyPlanets, 
                usedPlanets, 
                factionStrategy, 
                i, 
                campaignLength, 
                preferences
            );
            
            if (!planet) {
                console.warn(`Could not find suitable planet for mission ${i + 1}`);
                continue;
            }
            
            const mission = missionGenerator.generateMission(planet, i, campaignLength, preferences, missions);
            
            // Apply balance adjustments
            const adjustedMission = missionGenerator.adjustMissionForBalance(mission, missions, preferences);
            
            missions.push(adjustedMission);
            
            // Track used planets (unless we're allowing repeats for small planet pools)
            if (enemyPlanets.length > campaignLength) {
                usedPlanets.add(planet.id);
            }
        }
        
        // Validate mission sequence
        const validation = missionGenerator.validateMissionSequence(missions);
        if (!validation.isValid) {
            console.warn('Generated mission sequence may have balance issues', validation);
        }
        
        return missions;
    }

    determineCampaignLength(lengthPreference) {
        if (!lengthPreference || lengthPreference === 'random') {
            return 3 + Math.floor(Math.random() * 5); // 3-7 missions
        }
        
        if (lengthPreference === 'custom') {
            const customInput = document.getElementById('custom-length-input');
            const customLength = parseInt(customInput?.value || '5');
            return Math.max(1, Math.min(50, customLength));
        }
        
        const length = parseInt(lengthPreference);
        return isNaN(length) ? 5 : Math.max(1, Math.min(50, length));
    }

    determineFactionStrategy(factionPreference, availablePlanets) {
        const availableFactions = apiService.getAvailableFactions(availablePlanets);
        
        if (!factionPreference || factionPreference === 'random') {
            // Pick a random single faction
            return {
                type: 'single',
                faction: availableFactions[Math.floor(Math.random() * availableFactions.length)]
            };
        }
        
        if (factionPreference === 'mixed') {
            return {
                type: 'mixed',
                factions: availableFactions
            };
        }
        
        // Specific faction requested
        if (availableFactions.includes(factionPreference)) {
            return {
                type: 'single',
                faction: factionPreference
            };
        }
        
        // Fallback if requested faction not available
        const selectedFaction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
        console.warn(`Requested faction "${factionPreference}" not available. Available factions: [${availableFactions.join(', ')}]. Using "${selectedFaction}" instead.`);
        return {
            type: 'single',
            faction: selectedFaction
        };
    }

    selectPlanetForMission(enemyPlanets, usedPlanets, factionStrategy, missionIndex, totalMissions, preferences) {
        let candidatePlanets = enemyPlanets.filter(planet => !usedPlanets.has(planet.id));
        
        // If we've used all planets and need more missions, allow reuse
        if (candidatePlanets.length === 0) {
            candidatePlanets = enemyPlanets;
        }
        
        // Filter by faction strategy
        if (factionStrategy.type === 'single') {
            candidatePlanets = candidatePlanets.filter(planet => 
                apiService.getCurrentEnemy(planet) === factionStrategy.faction
            );
        } else if (factionStrategy.type === 'mixed') {
            // For mixed campaigns, try to alternate factions
            if (missionIndex > 0) {
                // Try to get a different faction than the previous mission
                const previousFaction = arguments[5]?.lastFaction;
                if (previousFaction) {
                    const differentFactionPlanets = candidatePlanets.filter(planet =>
                        apiService.getCurrentEnemy(planet) !== previousFaction
                    );
                    if (differentFactionPlanets.length > 0) {
                        candidatePlanets = differentFactionPlanets;
                    }
                }
            }
        }
        
        // Apply mission type filter (liberation/defense/both) - FILTER, don't override
        if (preferences.missionType && preferences.missionType !== 'both') {
            const originalCount = candidatePlanets.length;
            if (preferences.missionType === 'liberation') {
                // Only keep planets that are actually under liberation (not defense)
                candidatePlanets = candidatePlanets.filter(planet => !planet.isDefense);
            } else if (preferences.missionType === 'defense') {
                // Only keep planets that are actually under defense
                candidatePlanets = candidatePlanets.filter(planet => planet.isDefense);
            }
            
            if (candidatePlanets.length === 0 && originalCount > 0) {
                console.warn(`No ${preferences.missionType} missions currently available. Found ${originalCount} planets but none match the ${preferences.missionType} type.`);
            }
        }
        // For 'both' or no preference, keep all planets with their real status - no changes needed
        
        // Apply target type filter (planets/cities/mixed)
        if (preferences.targetType && preferences.targetType !== 'mixed') {
            if (preferences.targetType === 'cities') {
                // Filter to planets that have regions/cities available and force city missions
                candidatePlanets = candidatePlanets.filter(planet => 
                    this.planetHasAvailableRegions(planet)
                ).map(planet => ({
                    ...planet,
                    forceCityMission: true
                }));
            } else if (preferences.targetType === 'planets') {
                // Ensure we don't force city missions for these planets
                candidatePlanets = candidatePlanets.map(planet => ({
                    ...planet,
                    forceNonCity: true
                }));
            }
        }
        
        // Apply biome preferences if specified
        if (preferences.biome && preferences.biome !== 'random' && preferences.biome !== 'varied') {
            const biomePlanets = candidatePlanets.filter(planet => {
                const biome = apiService.getPlanetBiome(planet).toLowerCase();
                return biome.includes(preferences.biome.toLowerCase());
            });
            if (biomePlanets.length > 0) {
                candidatePlanets = biomePlanets;
            }
        }
        
        if (candidatePlanets.length === 0) {
            // Fallback: return any unused planet or random planet with their real status
            const fallbackPlanet = enemyPlanets.filter(p => !usedPlanets.has(p.id))[0] || 
                   enemyPlanets[Math.floor(Math.random() * enemyPlanets.length)];
            // Return the planet as-is with its real status from the API
            return fallbackPlanet;
        }
        
        // For final mission, prefer planets with major operation potential
        if (missionIndex === totalMissions - 1) {
            // Could add logic to prefer certain planet types for climactic missions
        }
        
        return candidatePlanets[Math.floor(Math.random() * candidatePlanets.length)];
    }

    planetHasAvailableRegions(planet) {
        // Check if planet has available regions for city missions
        return (planet.availableRegions && planet.availableRegions.length > 0) ||
               (planet.activeRegions && planet.activeRegions.length > 0) ||
               (planet.regions && planet.regions.filter(r => r.isAvailable).length > 0) ||
               // Fallback: assume some planets have cities based on name patterns
               this.isPlanetLikelyToHaveCities(planet);
    }

    isPlanetLikelyToHaveCities(planet) {
        // Simple heuristic to determine if a planet might have cities
        const cityKeywords = ['prime', 'major', 'central', 'capital', 'metro', 'city', 'urban'];
        const planetName = planet.name.toLowerCase();
        return cityKeywords.some(keyword => planetName.includes(keyword));
    }

    async regenerateCampaign(preserveSettings = true) {
        if (!this.currentCampaign) {
            throw new Error('No campaign to regenerate');
        }
        
        const preferences = preserveSettings ? this.currentCampaign.metadata.preferences : {};
        return await this.generateCampaign(preferences);
    }

    async regenerateMission(missionIndex, newRequirements = {}) {
        if (!this.currentCampaign || !this.currentCampaign.missions[missionIndex]) {
            throw new Error('Invalid mission to regenerate');
        }
        
        const gameData = await apiService.getAllGameData();
        const planets = gameData.planets;
        const enemyPlanets = apiService.getEnemyPlanets(planets);
        
        // Get current mission preferences
        const currentMission = this.currentCampaign.missions[missionIndex];
        const usedPlanets = new Set(this.currentCampaign.missions.map(m => m.planet.id));
        
        // Remove current planet from used set to allow replacement
        usedPlanets.delete(currentMission.planet.id);
        
        // Select new planet based on requirements
        let candidatePlanets = enemyPlanets.filter(planet => !usedPlanets.has(planet.id));
        
        if (newRequirements.faction) {
            candidatePlanets = candidatePlanets.filter(planet =>
                apiService.getCurrentEnemy(planet) === newRequirements.faction
            );
        }
        
        if (candidatePlanets.length === 0) {
            candidatePlanets = enemyPlanets;
        }
        
        const newPlanet = candidatePlanets[Math.floor(Math.random() * candidatePlanets.length)];
        const newMission = missionGenerator.generateMission(
            newPlanet, 
            missionIndex, 
            this.currentCampaign.missions.length,
            { ...this.currentCampaign.metadata.preferences, ...newRequirements }
        );
        
        // Update mission with new narrative
        const oldMissions = [...this.currentCampaign.missions];
        oldMissions[missionIndex] = newMission;
        
        const regeneratedNarrative = narrativeGenerator.generateFullCampaignNarrative(oldMissions);
        
        // Update current campaign
        this.currentCampaign.missions[missionIndex] = regeneratedNarrative.missions[missionIndex];
        
        return this.currentCampaign;
    }

    validateCampaignViability(preferences, availablePlanets) {
        const errors = [];
        const warnings = [];
        
        // Check if requested faction is available
        if (preferences.faction && preferences.faction !== 'random' && preferences.faction !== 'mixed') {
            const availableFactions = apiService.getAvailableFactions(availablePlanets);
            if (!availableFactions.includes(preferences.faction)) {
                errors.push(`Requested faction "${preferences.faction}" is not currently available`);
            }
        }
        
        // Check if enough planets are available
        const enemyPlanets = apiService.getEnemyPlanets(availablePlanets);
        const requestedLength = this.determineCampaignLength(preferences.length);
        
        if (enemyPlanets.length === 0) {
            errors.push('No enemy planets available for mission generation');
        } else if (enemyPlanets.length < requestedLength && requestedLength > 10) {
            warnings.push(`Only ${enemyPlanets.length} enemy planets available, some may be repeated in long campaigns`);
        }
        
        // Check biome availability
        if (preferences.biome && preferences.biome !== 'random' && preferences.biome !== 'varied') {
            const biomeMatches = enemyPlanets.filter(planet => {
                const biome = apiService.getPlanetBiome(planet).toLowerCase();
                return biome.includes(preferences.biome.toLowerCase());
            });
            
            if (biomeMatches.length === 0) {
                warnings.push(`No planets with "${preferences.biome}" biome currently available`);
            }
        }
        
        return { errors, warnings, isViable: errors.length === 0 };
    }

    getCampaignSummary() {
        if (!this.currentCampaign) {
            return null;
        }
        
        const missions = this.currentCampaign.missions;
        const factions = [...new Set(missions.map(m => m.faction))];
        const avgDifficulty = missions.reduce((sum, m) => sum + m.difficulty.level, 0) / missions.length;
        
        return {
            name: this.currentCampaign.name,
            missionCount: missions.length,
            factions: factions,
            averageDifficulty: Math.round(avgDifficulty * 10) / 10,
            theme: this.currentCampaign.theme,
            generatedAt: this.currentCampaign.metadata.generatedAt
        };
    }
}

// Initialize campaignGenerator as a global variable to avoid lexical declaration issues
var campaignGenerator = new CampaignGenerator();