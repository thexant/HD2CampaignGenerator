class MissionGenerator {
    constructor() {
        this.missionTypes = MISSION_TYPES;
        this.difficulties = DIFFICULTY_LEVELS;
        this.factionInfo = FACTION_INFO;
        this.hazardInfo = PLANET_HAZARDS;
        this.modifiers = MISSION_TYPES.MODIFIERS;
        // Check if real mission types are available
        this.useRealMissions = typeof realMissionTypes !== 'undefined' && realMissionTypes;
    }

    generateMission(planet, missionIndex, totalMissions, preferences = {}, previousMissions = []) {
        const faction = apiService.getCurrentEnemy(planet);
        const hazard = apiService.getPlanetHazard(planet);
        const biome = apiService.getPlanetBiome(planet);
        
        const difficulty = this.selectDifficulty(preferences.difficulty, missionIndex, totalMissions, preferences.isTourMode, previousMissions);
        
        // For tour mode, use the theme-enhanced planet properties
        let finalPlanet = planet;
        if (preferences.isTourMode && preferences.campaignTheme) {
            finalPlanet = { ...planet };
            // The theme-specific properties were already applied in app.js applyThemeToMission
            // Just ensure we respect them here
        }
        
        // Try to get a city/region for this mission first (respect force settings)
        let forceCityMission = null;
        if (finalPlanet.forceNonCity) {
            forceCityMission = false;
        } else if (finalPlanet.forceCityMission) {
            forceCityMission = true;
        }
        
        const selectedRegion = this.selectRegionForMission(finalPlanet, biome, forceCityMission);
        const environment = selectedRegion ? "city" : "planet";
        
        // For operations-based system, create generic operation objective
        const primaryObjective = this.createOperationObjective(difficulty.level, environment, finalPlanet.isDefense);
        const secondaryObjectives = this.selectSecondaryObjectives(2 + Math.floor(Math.random() * 2), environment, finalPlanet.isDefense, difficulty.level);
        
        const mission = {
            number: missionIndex + 1,
            name: primaryObjective.name || `Operation ${missionIndex + 1}`,
            planet: {
                name: finalPlanet.name,
                sector: finalPlanet.sector || "Unknown Sector",
                biome: biome,
                hazard: hazard,
                hazardDescription: this.hazardInfo[hazard]?.description || "Standard conditions",
                isDefense: finalPlanet.isDefense || false
            },
            faction: faction,
            difficulty: difficulty,
            primaryObjective: primaryObjective,
            secondaryObjectives: secondaryObjectives,
            isDefense: finalPlanet.isDefense || false
        };
        
        // Add region/city information if available and update planet name for consistent formatting
        if (selectedRegion && selectedRegion.cityName) {
            mission.location = {
                type: "city",
                name: selectedRegion.cityName,
                regionIndex: selectedRegion.regionIndex,
                isGenerated: selectedRegion.isGenerated || false
            };
            // Update planet name to include city: "City - Planet - System Sector"
            const sectorName = mission.planet.sector.includes('Sector') ? mission.planet.sector : `${mission.planet.sector} Sector`;
            mission.planet.displayName = `${selectedRegion.cityName} - ${finalPlanet.name} - ${sectorName}`;
        } else {
            // Standard format: "Planet - System Sector"
            const sectorName = mission.planet.sector.includes('Sector') ? mission.planet.sector : `${mission.planet.sector} Sector`;
            mission.planet.displayName = `${finalPlanet.name} - ${sectorName}`;
        }
        
        return mission;
    }

    createOperationObjective(difficulty, environment, isDefense = false) {
        const operationType = isDefense ? "Defense" : "Liberation";
        const locationText = environment === "city" ? "urban sectors" : "contested territory";
        
        // Generate thematic operation descriptions
        const descriptions = this.getThematicOperationDescription(difficulty, operationType, environment);
        
        return {
            id: `operation_difficulty_${difficulty}`,
            name: descriptions.name,
            description: descriptions.description,
            type: "operation",
            difficulty: difficulty,
            environment: environment,
            isDefense: isDefense
        };
    }

    getThematicOperationDescription(difficulty, operationType, environment) {
        const isCity = environment === "city";
        const difficultyNames = {
            1: "Trivial", 2: "Easy", 3: "Medium", 4: "Challenging", 5: "Hard",
            6: "Extreme", 7: "Suicide Mission", 8: "Impossible", 9: "Helldive", 10: "Super Helldive"
        };
        
        const difficultyName = difficultyNames[difficulty] || `Difficulty ${difficulty}`;
        
        if (operationType === "Defense") {
            const defenseDescriptions = [
                "Hold the line against overwhelming enemy forces. Democracy depends on your unwavering resolve.",
                "Defend critical Super Earth assets from enemy assault. Failure is not an option, Helldiver.",
                "Repel the enemy offensive and maintain our strategic position. Show them the strength of Managed Democracy.",
                "Stand firm against the tide of tyranny. Every second you hold is a victory for freedom.",
                "Protect our liberated territory from enemy recapture. Liberty's light must not be extinguished."
            ];
            return {
                name: `${difficultyName} Defense Operation`,
                description: defenseDescriptions[Math.floor(Math.random() * defenseDescriptions.length)]
            };
        } else {
            const liberationDescriptions = [
                "Reclaim this Super Earth colony from enemy occupation. Show these invaders that our worlds belong to Democracy.",
                "Drive the enemy forces from our rightful territory and restore Super Earth's sovereign rule.",
                "Liberate our colonists from the tyrannical grip of alien oppressors. Bring our people home to freedom.",
                "Take back what was stolen from Super Earth. Every liberated world strengthens Managed Democracy.",
                "Retake this conquered territory and reestablish the righteous order of Super Earth civilization."
            ];
            return {
                name: `${difficultyName} Liberation Operation`,
                description: liberationDescriptions[Math.floor(Math.random() * liberationDescriptions.length)]
            };
        }
    }

    selectModifier() {
        // 20% chance to include a modifier
        if (Math.random() < 0.2) {
            const randomIndex = Math.floor(Math.random() * this.modifiers.length);
            return this.modifiers[randomIndex];
        }
        return null;
    }

    selectDifficulty(preference, missionIndex, totalMissions, isTourMode = false, previousMissions = []) {
        // If a specific difficulty level is passed (number), use it directly
        if (typeof preference === 'number' && preference >= 1 && preference <= 10) {
            return this.difficulties.find(d => d.level === preference);
        }
        
        // Tour of War mode uses its own scaling logic only for multi-operation campaigns and if no specific difficulty is provided
        if (isTourMode && totalMissions > 1 && (typeof preference !== 'number')) {
            return this.calculateTourDifficulty(missionIndex, totalMissions, previousMissions);
        }
        
        if (preference === 'fixed') {
            const fixedLevel = 3 + Math.floor(Math.random() * 4); // 3-6
            return this.difficulties.find(d => d.level === fixedLevel);
        }
        
        if (preference === '1-3') {
            const level = 1 + Math.floor(Math.random() * 3);
            return this.difficulties.find(d => d.level === level);
        }
        
        if (preference === '4-6') {
            const level = 4 + Math.floor(Math.random() * 3);
            return this.difficulties.find(d => d.level === level);
        }
        
        if (preference === '7-10') {
            const level = 7 + Math.floor(Math.random() * 4);
            return this.difficulties.find(d => d.level === level);
        }
        
        // Default escalating difficulty for regular campaigns
        let baseLevel;
        if (totalMissions <= 3) {
            baseLevel = 2 + Math.floor(missionIndex * 2);
        } else {
            baseLevel = 1 + Math.floor((missionIndex / (totalMissions - 1)) * 6);
        }
        
        // Add some randomness
        const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const finalLevel = Math.max(1, Math.min(10, baseLevel + variation));
        
        return this.difficulties.find(d => d.level === finalLevel);
    }

    calculateTourDifficulty(missionIndex, totalMissions, previousMissions = []) {
        // Determine tour type based on length
        let tourType;
        if (totalMissions <= 4) {
            tourType = 'short';
        } else if (totalMissions <= 8) {
            tourType = 'medium';
        } else {
            tourType = 'legendary';
        }
        
        // Calculate progress through the tour (0 to 1)
        const progress = totalMissions > 1 ? missionIndex / (totalMissions - 1) : 0;
        
        // STRICT NO-REGRESSION ENFORCEMENT: Always maintain or increase difficulty
        // Get the absolute minimum difficulty based on previous missions
        let absoluteMinimum = 1;
        if (previousMissions.length > 0) {
            absoluteMinimum = previousMissions[previousMissions.length - 1].difficulty.level;
        }
        
        // Calculate base difficulty using progression curve
        // Less time in 1-3 (quick/easy), more time in 4-6 and 7-10 (engaging content)
        let baseDifficulty;
        
        if (progress <= 0.15) {
            // Very quick ramp through 1-3 (first 15% of tour)
            const earlyProgress = progress / 0.15;
            baseDifficulty = 1 + (earlyProgress * 2); // 1 to 3
        } else if (progress <= 0.55) {
            // Moderate pace through 4-6 (next 40% of tour)
            const midProgress = (progress - 0.15) / 0.4;
            baseDifficulty = 3 + (midProgress * 3); // 3 to 6
        } else {
            // Extended time in high difficulties 7-10 (final 45% of tour)
            const lateProgress = (progress - 0.55) / 0.45;
            const maxDiff = tourType === 'short' ? 8 : tourType === 'medium' ? 9 : 10;
            baseDifficulty = 6 + (lateProgress * (maxDiff - 6)); // 6 to maxDiff
        }
        
        // Round to get integer difficulty
        let targetDifficulty = Math.round(baseDifficulty);
        
        // Guaranteed minimum progression baseline (independent of curve)
        const progressionMinimum = Math.max(
            1,
            Math.floor(1 + (missionIndex / totalMissions) * 7) // Ensures consistent upward trajectory
        );
        
        // Final difficulty must be at least the absolute minimum (previous mission) 
        // AND meet the progression baseline
        let finalDifficulty = Math.max(
            absoluteMinimum,           // Never go below previous mission
            progressionMinimum,       // Maintain steady progression
            targetDifficulty          // Achieve curve target if possible
        );
        
        // Tour-specific difficulty spikes (only upward)
        const progressionPattern = tourType === 'legendary' ? 'jumping' : 
                                  (tourType === 'medium' && Math.random() < 0.4) ? 'jumping' : 'stable';
        
        if (progressionPattern === 'jumping' && Math.random() < 0.25 && missionIndex > 0) {
            // Only allow upward spikes that don't violate progression
            const spikeChance = Math.random();
            if (spikeChance < 0.7) { // 70% chance for +1 spike
                finalDifficulty = Math.min(10, finalDifficulty + 1);
            } else if (spikeChance < 0.9) { // 20% chance for +2 spike
                finalDifficulty = Math.min(10, finalDifficulty + 2);
            }
            // 10% chance for no spike
        }
        
        // Ensure strong finish for longer tours
        if (missionIndex >= totalMissions - 2) {
            const minFinalDiff = tourType === 'short' ? 6 : tourType === 'medium' ? 8 : 9;
            finalDifficulty = Math.max(finalDifficulty, minFinalDiff);
        }
        
        // Absolute bounds check
        finalDifficulty = Math.max(1, Math.min(10, finalDifficulty));
        
        // VALIDATION: Ensure no regression occurred
        if (previousMissions.length > 0) {
            const lastDifficulty = previousMissions[previousMissions.length - 1].difficulty.level;
            if (finalDifficulty < lastDifficulty) {
                console.error(`REGRESSION DETECTED! Mission ${missionIndex + 1} difficulty ${finalDifficulty} < previous ${lastDifficulty}. Correcting...`);
                finalDifficulty = lastDifficulty;
            }
        }
        
        console.log(`Tour: ${tourType} (${totalMissions}), Mission ${missionIndex + 1}, Progress: ${Math.round(progress * 100)}%, Difficulty: ${finalDifficulty}${previousMissions.length > 0 ? ` (prev: ${previousMissions[previousMissions.length - 1].difficulty.level})` : ''}`);
        
        return this.difficulties.find(d => d.level === finalDifficulty);
    }

    selectPrimaryObjective(faction, missionIndex, totalMissions, difficulty, environment, isDefense = false) {
        // Try to use real mission data if available
        if (this.useRealMissions && typeof getAvailableMissions === 'function') {
            const realMissions = getAvailableMissions(faction, environment, difficulty, isDefense);
            if (realMissions.length > 0) {
                console.log(`Using real mission data: ${realMissions.length} missions available for ${faction} ${environment} difficulty ${difficulty} ${isDefense ? '(DEFENSE)' : '(LIBERATION)'}`);
                return realMissions[Math.floor(Math.random() * realMissions.length)];
            } else {
                console.log(`No real missions found for ${faction} ${environment} difficulty ${difficulty} ${isDefense ? '(DEFENSE)' : '(LIBERATION)'}, falling back to template missions`);
            }
        }
        
        // Get available missions using new filtering system
        const availableObjectives = this.getFilteredMissions(faction, environment, difficulty, isDefense);
        
        if (availableObjectives.length === 0) {
            console.warn(`No missions available for ${faction} on ${environment} difficulty ${difficulty} ${isDefense ? '(DEFENSE)' : '(LIBERATION)'}`);
            // Fallback to any mission for this faction
            const fallbackMissions = this.missionTypes.PRIMARY_OBJECTIVES.filter(obj => 
                obj.faction && obj.faction.includes(faction)
            );
            if (fallbackMissions.length > 0) {
                return fallbackMissions[Math.floor(Math.random() * fallbackMissions.length)];
            }
            
            // Ultimate fallback - return the first available mission
            console.error(`No fallback missions found for ${faction}, using first available mission`);
            return this.missionTypes.PRIMARY_OBJECTIVES[0];
        }
        
        return availableObjectives[Math.floor(Math.random() * availableObjectives.length)];
    }

    /**
     * Filter missions based on faction, environment, difficulty, and operation type
     */
    getFilteredMissions(faction, environment, difficulty, isDefense = false) {
        const operationType = isDefense ? 'defense' : 'liberation';
        
        // All missions are now in the single PRIMARY_OBJECTIVES array
        const allMissions = this.missionTypes.PRIMARY_OBJECTIVES;
        
        return allMissions.filter(mission => {
            // Check if mission has the new structure
            if (!mission.faction || !mission.operationType || !mission.environments) {
                // Handle old structure missions as fallback
                return this.legacyMissionFilter(mission, faction, environment, difficulty, isDefense);
            }
            
            // Check faction
            if (!mission.faction.includes(faction)) {
                return false;
            }
            
            // Check operation type
            if (!mission.operationType.includes(operationType)) {
                return false;
            }
            
            // Check environment and difficulty
            const envConfig = mission.environments[environment];
            if (!envConfig) {
                return false;
            }
            
            // Check difficulty range for this environment
            return difficulty >= envConfig.minDifficulty && difficulty <= envConfig.maxDifficulty;
        });
    }

    /**
     * Legacy filter for old mission structure (backward compatibility)
     */
    legacyMissionFilter(mission, faction, environment, difficulty, isDefense) {
        // Handle old faction format (string or array)
        const missionFactions = Array.isArray(mission.faction) ? mission.faction : 
                               typeof mission.faction === 'string' ? mission.faction.split(', ') : [];
        
        if (!missionFactions.includes(faction)) {
            return false;
        }
        
        // Handle old environment format
        const missionEnvironments = Array.isArray(mission.environment) ? mission.environment : [mission.environment];
        if (!missionEnvironments.includes(environment)) {
            return false;
        }
        
        // Handle old difficulty format
        if (mission.minDifficulty && mission.maxDifficulty) {
            return difficulty >= mission.minDifficulty && difficulty <= mission.maxDifficulty;
        }
        
        return true;
    }

    selectRegionForMission(planet, biome, forceCityMission = null) {
        // Check if planet has available regions
        const hasRegions = (planet.availableRegions && planet.availableRegions.length > 0) ||
                          (planet.activeRegions && planet.activeRegions.length > 0) ||
                          (planet.regions && planet.regions.filter(r => r.isAvailable).length > 0);
        
        if (!hasRegions) {
            return null; // No regions available on this planet
        }
        
        // If forceCityMission is explicitly set, use that. Otherwise, 50/50 chance for city mission
        let shouldSelectCity;
        if (forceCityMission !== null) {
            shouldSelectCity = forceCityMission;
        } else {
            shouldSelectCity = Math.random() < 0.5;
        }
        
        if (!shouldSelectCity) {
            console.log(`Mission will be on planet surface (non-city)`);
            return null; // Not selecting a city for this mission
        }
        
        // Try to get an available region from the API data first
        const availableRegion = apiService.getRandomAvailableRegion(planet);
        
        if (availableRegion) {
            // Get city name from our mapping
            const regionCount = planet.availableRegions ? planet.availableRegions.length : 
                              planet.activeRegions ? planet.activeRegions.length :
                              planet.regions ? planet.regions.filter(r => r.isAvailable).length : 1;
            const cityInfo = cityMappings.getRandomCityForPlanet(planet.name, regionCount, biome);
            
            // Find the city that matches this region index, or use a fallback
            let selectedCity = cityInfo;
            if (regionCount > 1) {
                const cities = cityMappings.getCitiesForPlanet(planet.name, regionCount, biome);
                const matchingCity = cities.find(city => city.index === (availableRegion.regionIndex || availableRegion.index));
                if (matchingCity) {
                    selectedCity = matchingCity;
                }
            }
            
            console.log(`Mission will be in city: ${selectedCity.name}`);
            return {
                regionIndex: availableRegion.regionIndex || availableRegion.index,
                cityName: selectedCity.name,
                isGenerated: selectedCity.isGenerated || false,
                regionSize: availableRegion.size || availableRegion.regionSize
            };
        }
        
        return null; // No city/region for this mission
    }

    selectSecondaryObjectives(count = 3, environment = "planet", isDefense = false, difficulty = 1) {
        let available = [];
        
        // Try to use real secondary objectives if available
        if (this.useRealMissions && typeof getAvailableSecondaryObjectives === 'function') {
            available = getAvailableSecondaryObjectives(environment, isDefense);
            if (available.length > 0) {
                console.log(`Using real secondary objectives: ${available.length} available for ${environment} ${isDefense ? '(DEFENSE)' : '(LIBERATION)'}`);
            }
        }
        
        // Fallback to template secondary objectives
        if (available.length === 0) {
            if (isDefense) {
                // Use defense-specific secondary objectives
                available = this.missionTypes.DEFENSE_SECONDARY_OBJECTIVES.filter(obj => 
                    obj.environment.includes(environment) || obj.environment.includes("planet")
                );
                
                // If no defense secondaries match environment, use all defense secondaries
                if (available.length === 0) {
                    available = [...this.missionTypes.DEFENSE_SECONDARY_OBJECTIVES];
                }
                
                console.log(`Using DEFENSE secondary objectives: ${available.length} available for ${environment}`);
            } else {
                // Use standard secondary objectives
                if (environment === "city") {
                    // Try city secondaries first
                    available = this.missionTypes.CITY_SECONDARY_OBJECTIVES || [];
                    
                    // Fallback to general secondaries if no city-specific ones
                    if (available.length === 0) {
                        available = [...this.missionTypes.SECONDARY_OBJECTIVES];
                    }
                } else {
                    available = [...this.missionTypes.SECONDARY_OBJECTIVES];
                }
                
                console.log(`Using LIBERATION secondary objectives: ${available.length} available for ${environment}`);
            }
        }
        
        // Filter objectives based on difficulty
        available = this.filterSecondaryObjectivesByDifficulty(available, difficulty);
        
        const selected = [];
        const availableCopy = [...available]; // Don't modify original array
        
        for (let i = 0; i < Math.min(count, availableCopy.length); i++) {
            const randomIndex = Math.floor(Math.random() * availableCopy.length);
            const objective = availableCopy.splice(randomIndex, 1)[0];
            
            // Use getDescription function if available, otherwise use default description
            if (objective.getDescription) {
                objective.description = objective.getDescription(difficulty);
            }
            
            selected.push(objective);
        }
        
        return selected;
    }

    filterSecondaryObjectivesByDifficulty(objectives, difficulty) {
        return objectives.filter(obj => {
            // Sample collection objectives are difficulty-dependent
            if (obj.id === 'collect_rare_samples' && difficulty < 4) {
                return false; // Rare samples only spawn at difficulty 4+
            }
            if (obj.id === 'collect_super_samples' && difficulty < 6) {
                return false; // Super samples only spawn at difficulty 6+
            }
            
            // Some objectives are too demanding for low difficulties
            if (difficulty < 3) {
                if (obj.id === 'perfect_accuracy' || obj.id === 'stratagem_conservation') {
                    return false;
                }
            }
            
            // Some objectives are more appropriate for higher difficulties
            if (difficulty >= 7) {
                if (obj.id === 'stealth_approach') {
                    return false; // Stealth is nearly impossible at high difficulties
                }
            }
            
            return true;
        });
    }



    validateMissionSequence(missions) {
        // Check for faction variety if mixed preference
        const factions = missions.map(m => m.faction);
        const uniqueFactions = [...new Set(factions)];
        
        // Check for escalating difficulty
        const difficulties = missions.map(m => m.difficulty.level);
        
        // Check for varied objective types
        const objectiveTypes = missions.map(m => m.primaryObjective ? m.primaryObjective.id : 'unknown');
        const uniqueTypes = [...new Set(objectiveTypes)];
        
        // CRITICAL: Validate no difficulty regression occurred
        const difficultyRegressions = this.validateNoDifficultyRegression(difficulties);
        
        return {
            isValid: difficultyRegressions.length === 0,
            factionVariety: uniqueFactions.length / missions.length,
            difficultyProgression: this.calculateProgression(difficulties),
            objectiveVariety: uniqueTypes.length / missions.length,
            difficultyRegressions: difficultyRegressions
        };
    }

    validateNoDifficultyRegression(difficulties) {
        const regressions = [];
        
        for (let i = 1; i < difficulties.length; i++) {
            if (difficulties[i] < difficulties[i-1]) {
                regressions.push({
                    missionIndex: i,
                    currentDifficulty: difficulties[i],
                    previousDifficulty: difficulties[i-1],
                    message: `Mission ${i + 1} difficulty ${difficulties[i]} is lower than Mission ${i} difficulty ${difficulties[i-1]}`
                });
            }
        }
        
        return regressions;
    }

    calculateProgression(values) {
        if (values.length < 2) return 1;
        
        let increasing = 0;
        for (let i = 1; i < values.length; i++) {
            if (values[i] >= values[i-1]) increasing++;
        }
        
        return increasing / (values.length - 1);
    }

    adjustMissionForBalance(mission, previousMissions, preferences) {
        // Avoid too many consecutive high-difficulty missions
        if (previousMissions.length >= 2) {
            const lastTwo = previousMissions.slice(-2);
            const avgDifficulty = lastTwo.reduce((sum, m) => sum + m.difficulty.level, 0) / 2;
            
            if (avgDifficulty >= 7 && mission.difficulty.level >= 7) {
                mission.difficulty = this.difficulties.find(d => d.level === Math.max(1, mission.difficulty.level - 2));
            }
        }
        
        // Ensure faction variety for mixed campaigns
        if (preferences.faction === 'mixed' && previousMissions.length > 0) {
            const lastFaction = previousMissions[previousMissions.length - 1].faction;
            if (mission.faction === lastFaction && previousMissions.length >= 2) {
                const factions = apiService.getAvailableFactions([]); // Will need planets data
                const otherFactions = factions.filter(f => f !== lastFaction);
                if (otherFactions.length > 0) {
                    // Would need to regenerate with different planet
                    console.log('Should regenerate mission with different faction');
                }
            }
        }
        
        return mission;
    }

}

// Initialize missionGenerator as a global variable to avoid lexical declaration issues
var missionGenerator = new MissionGenerator();