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
            let planets;
            
            // If we have themed planets (like Major Order), use those directly
            if (preferences.themedPlanets && preferences.themedPlanets.length > 0) {
                planets = preferences.themedPlanets;
                console.log(`Using ${planets.length} themed planets for campaign generation`);
            } else {
                console.log('Fetching game data from API...');
                const gameData = await apiService.getAllGameData();
                planets = gameData.planets;
                console.log('Received planets data:', planets.length, 'planets');
            }
            
            if (!planets || planets.length === 0) {
                throw new Error('No planet data available');
            }

            const campaignLength = this.determineCampaignLength(preferences.length);
            const missions = await this.generateMissions(planets, campaignLength, preferences);
            
            if (missions.length === 0) {
                throw new Error('Failed to generate any missions');
            }

            
            const campaign = narrativeGenerator.generateFullCampaignNarrative(missions, preferences.customCampaignName);
            
            
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
        const usedPlanets = new Map(); // Track planet usage count instead of just existence
        
        // If planets are already themed/filtered, use them directly, otherwise filter to enemy planets
        const availablePlanets = (preferences.themedPlanets && preferences.themedPlanets.length > 0) 
            ? planets  // planets are already the themed planets from generateCampaign
            : apiService.getEnemyPlanets(planets);
        
        console.log('Available planets for missions:', availablePlanets.length);
        
        if (availablePlanets.length === 0) {
            console.log('All planets data for debugging:', planets.map(p => ({
                name: p.name,
                currentOwner: p.currentOwner,
                enemy: apiService.getCurrentEnemy(p)
            })));
            throw new Error('No planets available for missions');
        }

       
        const factionStrategy = this.determineFactionStrategy(preferences.faction, availablePlanets);
        
        for (let i = 0; i < campaignLength; i++) {
            const planet = this.selectPlanetForMission(
                availablePlanets, 
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
            
            // Add variation to ensure different missions even on same planet
            const missionVariation = {
                ...preferences,
                _missionIndex: i,
                _randomSeed: Math.random() // Add randomization
            };
            
            const mission = missionGenerator.generateMission(planet, i, campaignLength, missionVariation, missions);
            
            
            const adjustedMission = missionGenerator.adjustMissionForBalance(mission, missions, preferences);
            
            missions.push(adjustedMission);
            
            // Always track planet usage to avoid excessive reuse
            const planetUsageCount = usedPlanets.get(planet.id) || 0;
            usedPlanets.set(planet.id, planetUsageCount + 1);
        }
        
        
        const validation = missionGenerator.validateMissionSequence(missions);
        if (!validation.isValid) {
            console.warn('Generated mission sequence may have balance issues', validation);
        }
        
        return missions;
    }

    determineCampaignLength(lengthPreference) {
        if (!lengthPreference || lengthPreference === 'random') {
            return 3 + Math.floor(Math.random() * 5);
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
        
        
        if (availableFactions.includes(factionPreference)) {
            return {
                type: 'single',
                faction: factionPreference
            };
        }
        
        
        const selectedFaction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
        console.warn(`Requested faction "${factionPreference}" not available. Available factions: [${availableFactions.join(', ')}]. Using "${selectedFaction}" instead.`);
        return {
            type: 'single',
            faction: selectedFaction
        };
    }

    selectPlanetForMission(enemyPlanets, usedPlanets, factionStrategy, missionIndex, totalMissions, preferences) {
        let candidatePlanets = enemyPlanets.filter(planet => !usedPlanets.has(planet.id));
        
        
        if (candidatePlanets.length === 0) {
            candidatePlanets = enemyPlanets;
        }
        
        
        if (factionStrategy.type === 'single') {
            candidatePlanets = candidatePlanets.filter(planet => 
                apiService.getCurrentEnemy(planet) === factionStrategy.faction
            );
        } else if (factionStrategy.type === 'mixed') {
            
            if (missionIndex > 0) {
                
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
        
        
        if (preferences.missionType && preferences.missionType !== 'both') {
            const originalCount = candidatePlanets.length;
            if (preferences.missionType === 'liberation') {
                
                candidatePlanets = candidatePlanets.filter(planet => !planet.isDefense);
            } else if (preferences.missionType === 'defense') {
                
                candidatePlanets = candidatePlanets.filter(planet => planet.isDefense);
            }
            
            if (candidatePlanets.length === 0 && originalCount > 0) {
                console.warn(`No ${preferences.missionType} missions currently available. Found ${originalCount} planets but none match the ${preferences.missionType} type.`);
            }
        }
        
        
        
        if (preferences.targetType && preferences.targetType !== 'mixed') {
            if (preferences.targetType === 'cities') {
                
                candidatePlanets = candidatePlanets.filter(planet => 
                    this.planetHasAvailableRegions(planet)
                ).map(planet => ({
                    ...planet,
                    forceCityMission: true
                }));
            } else if (preferences.targetType === 'planets') {
                
                candidatePlanets = candidatePlanets.map(planet => ({
                    ...planet,
                    forceNonCity: true
                }));
            }
        }
        
        
        if (preferences.biome && preferences.biome !== 'random' && preferences.biome !== 'varied') {
            const biomePlanets = candidatePlanets.filter(planet => {
                const biome = apiService.getPlanetBiome(planet);
                return biome === preferences.biome;
            });
            if (biomePlanets.length > 0) {
                candidatePlanets = biomePlanets;
            }
        }
        
        if (candidatePlanets.length === 0) {
            
            const fallbackPlanet = enemyPlanets.filter(p => !usedPlanets.has(p.id))[0] || 
                   enemyPlanets[Math.floor(Math.random() * enemyPlanets.length)];
            
            return fallbackPlanet;
        }
        
       
        if (missionIndex === totalMissions - 1) {
            
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
        
       
        const currentMission = this.currentCampaign.missions[missionIndex];
        const usedPlanets = new Set(this.currentCampaign.missions.map(m => m.planet.id));
        
        
        usedPlanets.delete(currentMission.planet.id);
        
        
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
        
        
        const oldMissions = [...this.currentCampaign.missions];
        oldMissions[missionIndex] = newMission;
        
        const regeneratedNarrative = narrativeGenerator.generateFullCampaignNarrative(oldMissions);
        
        
        this.currentCampaign.missions[missionIndex] = regeneratedNarrative.missions[missionIndex];
        
        return this.currentCampaign;
    }

    validateCampaignViability(preferences, availablePlanets) {
        const errors = [];
        const warnings = [];
        
        
        if (preferences.faction && preferences.faction !== 'random' && preferences.faction !== 'mixed') {
            const availableFactions = apiService.getAvailableFactions(availablePlanets);
            if (!availableFactions.includes(preferences.faction)) {
                errors.push(`Requested faction "${preferences.faction}" is not currently available`);
            }
        }
        
        
        const enemyPlanets = apiService.getEnemyPlanets(availablePlanets);
        const requestedLength = this.determineCampaignLength(preferences.length);
        
        if (enemyPlanets.length === 0) {
            errors.push('No enemy planets available for mission generation');
        } else if (enemyPlanets.length < requestedLength && requestedLength > 10) {
            warnings.push(`Only ${enemyPlanets.length} enemy planets available, some may be repeated in long campaigns`);
        }
        
        
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


var campaignGenerator = new CampaignGenerator();
