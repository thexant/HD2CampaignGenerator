class App {
    constructor() {
        this.isInitialized = false;
        this.preferences = this.loadPreferences();
        this.tourMode = true; // Always start with tour mode enabled
        this.currentTour = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEventListeners());
        } else {
            this.setupEventListeners();
        }
        
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Main generation button
        const generateBtn = document.getElementById('generate-campaign');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.handleGenerateCampaign());
        }

        // Regenerate button
        const regenerateBtn = document.getElementById('regenerate-campaign');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.handleRegenerateCampaign());
        }

        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => this.handleGenerateCampaign());
        }

        // Custom length toggle
        const campaignLengthSelect = document.getElementById('campaign-length');
        if (campaignLengthSelect) {
            campaignLengthSelect.addEventListener('change', (e) => this.handleLengthChange(e));
        }

        // Preferences toggle
        const toggleBtn = document.getElementById('toggle-preferences');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.handleTogglePreferences());
        }

        // Preference change handlers
        this.setupPreferenceListeners();

        // Tour mode handlers
        this.setupTourModeListeners();
    }

    setupPreferenceListeners() {
        const preferenceIds = [
            'campaign-length', 'faction-preference', 'difficulty-preference', 'biome-preference',
            'mission-type-preference', 'target-type-preference'
        ];

        preferenceIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.savePreferences());
            }
        });

        // Custom length input
        const customInput = document.getElementById('custom-length-input');
        if (customInput) {
            customInput.addEventListener('input', () => this.savePreferences());
        }
    }

    setupTourModeListeners() {
        // Tour mode checkbox
        const tourCheckbox = document.getElementById('tour-mode-checkbox');
        if (tourCheckbox) {
            tourCheckbox.addEventListener('change', (e) => this.handleTourModeToggle(e));
        }

        // Start tour button
        const startTourBtn = document.getElementById('start-tour');
        if (startTourBtn) {
            startTourBtn.addEventListener('click', () => this.handleStartTour());
        }

        // Mission progress buttons
        const missionCompleteBtn = document.getElementById('mission-complete');
        if (missionCompleteBtn) {
            missionCompleteBtn.addEventListener('click', () => this.handleMissionComplete());
        }

        const missionFailedBtn = document.getElementById('mission-failed');
        if (missionFailedBtn) {
            missionFailedBtn.addEventListener('click', () => this.handleMissionFailed());
        }

        // Tour management buttons
        const abandonTourBtn = document.getElementById('abandon-tour');
        if (abandonTourBtn) {
            abandonTourBtn.addEventListener('click', () => this.handleAbandonTour());
        }

        // Briefing acknowledgment
        const acknowledgeBriefingBtn = document.getElementById('acknowledge-briefing');
        if (acknowledgeBriefingBtn) {
            acknowledgeBriefingBtn.addEventListener('click', () => this.handleAcknowledgeBriefing());
        }

        // Completion screen buttons
        const startNewTourBtn = document.getElementById('start-new-tour');
        const retryTourBtn = document.getElementById('retry-tour');
        const returnToCampaignsBtn = document.getElementById('return-to-campaigns');
        const returnToCampaignsFailedBtn = document.getElementById('return-to-campaigns-failed');

        if (startNewTourBtn) {
            startNewTourBtn.addEventListener('click', () => this.handleStartNewTour());
        }
        if (retryTourBtn) {
            retryTourBtn.addEventListener('click', () => this.handleRetryTour());
        }
        if (returnToCampaignsBtn) {
            returnToCampaignsBtn.addEventListener('click', () => this.handleReturnToCampaigns());
        }
        if (returnToCampaignsFailedBtn) {
            returnToCampaignsFailedBtn.addEventListener('click', () => this.handleReturnToCampaigns());
        }
    }

    handleTourModeToggle(event) {
        this.tourMode = event.target.checked;
        const status = document.getElementById('tour-mode-status');
        const campaignLengthGroup = document.getElementById('campaign-length-group');
        const tourLengthGroup = document.getElementById('tour-length-group');
        const generateBtn = document.getElementById('generate-campaign');
        const startTourBtn = document.getElementById('start-tour');

        // Hide/show other preference groups when in tour mode
        const preferencesToHide = [
            'faction-preference', 'difficulty-preference', 'biome-preference', 
            'mission-type-preference', 'target-type-preference', 'custom-length-group'
        ].map(id => document.getElementById(id)?.closest('.preference-group'));

        if (this.tourMode) {
            status.textContent = 'ON';
            status.classList.add('active');
            campaignLengthGroup.style.display = 'none';
            tourLengthGroup.style.display = 'block';
            generateBtn.style.display = 'none';
            startTourBtn.style.display = 'inline-block';

            // Hide other preference groups
            preferencesToHide.forEach(group => {
                if (group) group.style.display = 'none';
            });
        } else {
            status.textContent = 'OFF';
            status.classList.remove('active');
            campaignLengthGroup.style.display = 'block';
            tourLengthGroup.style.display = 'none';
            generateBtn.style.display = 'inline-block';
            startTourBtn.style.display = 'none';

            // Show other preference groups
            preferencesToHide.forEach(group => {
                if (group) group.style.display = 'block';
            });
        }

        this.savePreferences();
    }

    handleLengthChange(event) {
        const customLengthGroup = document.getElementById('custom-length-group');
        if (customLengthGroup) {
            if (event.target.value === 'custom') {
                customLengthGroup.style.display = 'block';
            } else {
                customLengthGroup.style.display = 'none';
            }
        }
        this.savePreferences();
    }

    handleTogglePreferences() {
        const preferencesContent = document.getElementById('preferences-content');
        const toggleBtn = document.getElementById('toggle-preferences');
        
        if (preferencesContent && toggleBtn) {
            const isCollapsed = preferencesContent.classList.contains('collapsed');
            
            if (isCollapsed) {
                preferencesContent.classList.remove('collapsed');
                toggleBtn.textContent = 'Hide Preferences';
                toggleBtn.setAttribute('aria-expanded', 'true');
            } else {
                preferencesContent.classList.add('collapsed');
                toggleBtn.textContent = 'Show Preferences';
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
            
            // Save the preference state
            localStorage.setItem('hd2-preferences-visible', !isCollapsed);
        }
    }

    async handleGenerateCampaign() {
        try {
            this.showLoading();
            this.hideError();
            
            console.log('Starting campaign generation...');
            const preferences = this.getPreferences();
            console.log('User preferences:', preferences);
            
            const campaign = await campaignGenerator.generateCampaign(preferences);
            
            if (campaign) {
                console.log('Campaign generated successfully:', campaign);
                this.displayCampaign(campaign);
                this.hideLoading();
                this.showRegenerateButton();
            } else {
                throw new Error('Failed to generate campaign');
            }
            
        } catch (error) {
            console.error('Campaign generation error:', error);
            this.hideLoading();
            this.showError(error.message);
        }
    }

    async handleRegenerateCampaign() {
        try {
            this.showLoading();
            this.hideError();
            
            const campaign = await campaignGenerator.regenerateCampaign(true);
            
            if (campaign) {
                this.displayCampaign(campaign);
                this.hideLoading();
            } else {
                throw new Error('Failed to regenerate campaign');
            }
            
        } catch (error) {
            console.error('Campaign regeneration error:', error);
            this.hideLoading();
            this.showError(error.message);
        }
    }

    getPreferences() {
        return {
            length: document.getElementById('campaign-length')?.value || 'random',
            faction: document.getElementById('faction-preference')?.value || 'random',
            difficulty: document.getElementById('difficulty-preference')?.value || 'random',
            biome: document.getElementById('biome-preference')?.value || 'random',
            missionType: document.getElementById('mission-type-preference')?.value || 'both',
            targetType: document.getElementById('target-type-preference')?.value || 'mixed'
        };
    }

    displayCampaign(campaign) {
        // Update campaign header
        this.updateCampaignHeader(campaign);
        
        // Display missions
        this.displayMissions(campaign.missions);
        
        // Show the campaign display
        const campaignDisplay = document.getElementById('campaign-display');
        if (campaignDisplay) {
            campaignDisplay.style.display = 'block';
        }
    }

    updateCampaignHeader(campaign) {
        const nameElement = document.getElementById('campaign-name');
        if (nameElement) {
            nameElement.textContent = campaign.name;
        }

        const goalElement = document.getElementById('campaign-main-goal');
        if (goalElement) {
            goalElement.textContent = `Main Goal: ${campaign.mainGoal}`;
        }

        const backstoryElement = document.getElementById('campaign-backstory');
        if (backstoryElement) {
            backstoryElement.textContent = campaign.backstory;
        }
    }

    displayMissions(missions) {
        const container = document.getElementById('missions-container');
        if (!container) return;

        container.innerHTML = '';

        missions.forEach((mission, index) => {
            const missionCard = this.createMissionCard(mission, index);
            container.appendChild(missionCard);
        });
    }

    createMissionCard(mission, index) {
        const card = document.createElement('div');
        card.className = 'mission-card';
        
        card.innerHTML = `
            <div class="mission-header">
                <div class="mission-number">${mission.number}</div>
                <div class="mission-title">
                    <h3>${mission.name}</h3>
                    <p>${this.formatMissionLocation(mission)}</p>
                    ${mission.isDefense ? '<span class="defense-badge">DEFENSE</span>' : '<span class="liberation-badge">LIBERATION</span>'}
                </div>
                <div class="mission-difficulty">
                    Level ${mission.difficulty.level} - ${mission.difficulty.name}
                </div>
            </div>
            
            <div class="mission-details">
                <div class="detail-item">
                    <div class="detail-label">Operation Type</div>
                    <div class="detail-value">${mission.isDefense ? 'Defense Mission' : 'Liberation Mission'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Location</div>
                    <div class="detail-value">${this.formatDetailedLocation(mission)}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Enemy Faction</div>
                    <div class="detail-value">${mission.faction}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Biome</div>
                    <div class="detail-value">${mission.planet.biome}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Hazard</div>
                    <div class="detail-value">${mission.planet.hazard}</div>
                </div>
            </div>
            
            <div class="mission-objectives">
                <h4>Primary Objective: ${mission.primaryObjective.name || 'Unknown'}</h4>
                <ul>
                    <li>${mission.primaryObjective.description}</li>
                </ul>
                
                <h4>Secondary Objectives</h4>
                <ul>
                    ${mission.secondaryObjectives.map(obj => `<li>${obj.description}</li>`).join('')}
                </ul>
                
                ${mission.modifier ? `
                <h4>Mission Modifier</h4>
                <div class="mission-modifier">
                    <strong>${mission.modifier.name}:</strong> ${mission.modifier.description}
                </div>
                ` : ''}
                
            </div>
        `;

        return card;
    }

    formatMissionLocation(mission) {
        // Use the consistent displayName from mission generator
        if (mission.planet.displayName) {
            return mission.planet.displayName;
        }
        
        // Fallback to manual formatting if displayName not available
        const sectorName = mission.planet.sector.includes('Sector') ? mission.planet.sector : `${mission.planet.sector} Sector`;
        if (mission.location && mission.location.name) {
            return `${mission.location.name} - ${mission.planet.name} - ${sectorName}`;
        }
        return `${mission.planet.name} - ${sectorName}`;
    }

    formatDetailedLocation(mission) {
        // Use the consistent displayName from mission generator
        if (mission.planet.displayName) {
            const generatedIndicator = (mission.location && mission.location.isGenerated) ? ' *' : '';
            return mission.planet.displayName + generatedIndicator;
        }
        
        // Fallback to manual formatting if displayName not available
        let location;
        const sectorName = mission.planet.sector.includes('Sector') ? mission.planet.sector : `${mission.planet.sector} Sector`;
        
        if (mission.location && mission.location.name) {
            const generatedIndicator = mission.location.isGenerated ? ' *' : '';
            location = `${mission.location.name} - ${mission.planet.name}${generatedIndicator}`;
        } else {
            location = mission.planet.name;
        }
        
        if (mission.planet.sector && mission.planet.sector !== "Unknown Sector") {
            location += ` - ${sectorName}`;
        }
        
        return location;
    }

    showLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'block';
        }
        
        const campaignDisplay = document.getElementById('campaign-display');
        if (campaignDisplay) {
            campaignDisplay.style.display = 'none';
        }
    }

    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError(message) {
        const errorSection = document.getElementById('error');
        const errorMessage = document.getElementById('error-message');
        
        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.style.display = 'block';
        }
        
        const campaignDisplay = document.getElementById('campaign-display');
        if (campaignDisplay) {
            campaignDisplay.style.display = 'none';
        }
    }

    hideError() {
        const errorSection = document.getElementById('error');
        if (errorSection) {
            errorSection.style.display = 'none';
        }
    }

    showRegenerateButton() {
        const regenerateBtn = document.getElementById('regenerate-campaign');
        if (regenerateBtn) {
            regenerateBtn.style.display = 'inline-block';
        }
    }

    savePreferences() {
        const preferences = this.getPreferences();
        localStorage.setItem('hd2-campaign-preferences', JSON.stringify(preferences));
        this.preferences = preferences;
    }

    loadPreferences() {
        try {
            const saved = localStorage.getItem('hd2-campaign-preferences');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load preferences:', error);
            return {};
        }
    }

    applyPreferences() {
        // Apply saved preferences to form elements
        Object.keys(this.preferences).forEach(key => {
            const element = document.getElementById(`${key === 'length' ? 'campaign-length' : key + '-preference'}`);
            if (element && this.preferences[key]) {
                element.value = this.preferences[key];
                
                // Trigger change event for custom length
                if (key === 'length') {
                    element.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    // Initialize preferences when DOM is ready
    initializePreferences() {
        this.applyPreferences();
        this.loadPreferencesVisibility();
        this.initializePermanentTourMode();
    }
    
    initializePermanentTourMode() {
        // Force tour mode to be enabled and properly displayed
        const tourCheckbox = document.getElementById('tour-mode-checkbox');
        if (tourCheckbox) {
            tourCheckbox.checked = true;
        }
        
        // Force the UI to match permanent tour mode
        this.handleTourModeToggle({ target: { checked: true } });
    }

    loadPreferencesVisibility() {
        const isVisible = localStorage.getItem('hd2-preferences-visible');
        if (isVisible === 'false') {
            // Hide preferences on load if they were hidden
            const preferencesContent = document.getElementById('preferences-content');
            const toggleBtn = document.getElementById('toggle-preferences');
            
            if (preferencesContent && toggleBtn) {
                preferencesContent.classList.add('collapsed');
                toggleBtn.textContent = 'Show Preferences';
                toggleBtn.setAttribute('aria-expanded', 'false');
            }
        }
    }

    // Tour of War Methods
    async handleStartTour() {
        try {
            this.showLoading();
            this.hideError();
            
            const tourPreferences = this.getTourPreferences();
            const tour = await this.generateTour(tourPreferences);
            
            if (tour) {
                this.currentTour = tour;
                this.displayTourBriefing(tour);
                this.hideLoading();
            } else {
                throw new Error('Failed to generate tour');
            }
            
        } catch (error) {
            console.error('Tour generation error:', error);
            this.hideLoading();
            this.showError(error.message);
        }
    }

    async generateTour(preferences) {
        // Reset tour-specific state
        this.selectedMissionType = null;
        
        // Get live game data
        const gameData = await apiService.getAllGameData();
        const planets = gameData.planets;
        
        if (!planets || planets.length === 0) {
            throw new Error('No planet data available');
        }

        // Randomly select a campaign theme
        const campaignTheme = this.selectCampaignTheme(planets);
        console.log('Selected campaign theme:', campaignTheme);

        // Determine tour length based on theme
        const tourLength = this.determineTourLength(preferences.tourLength);
        
        // Generate themed missions
        const missions = await this.generateThemedTourMissions(planets, tourLength, preferences, campaignTheme);
        
        if (missions.length === 0) {
            throw new Error('Failed to generate any missions');
        }

        // Generate tour narrative based on theme
        const tour = {
            name: this.generateThemedTourName(campaignTheme),
            theme: campaignTheme,
            missions: missions,
            currentMissionIndex: 0,
            completed: false,
            failed: false,
            metadata: {
                generatedAt: new Date().toISOString(),
                preferences: preferences,
                totalMissions: missions.length,
                campaignTheme: campaignTheme
            }
        };

        return tour;
    }

    selectCampaignTheme(planets) {
        const enemyPlanets = apiService.getEnemyPlanets(planets);
        const availableFactions = apiService.getAvailableFactions(enemyPlanets);
        
        // Define campaign themes with their availability conditions
        const themes = [
            {
                type: 'single_planet',
                name: 'Planetary Conquest',
                weight: 20,
                condition: () => enemyPlanets.length >= 1
            },
            {
                type: 'sector_campaign', 
                name: 'Sector Liberation',
                weight: 15,
                condition: () => this.getSectorsWithMultiplePlanets(enemyPlanets).length > 0
            },
            {
                type: 'faction_focused',
                name: 'Faction Elimination',
                weight: 25,
                condition: () => availableFactions.length >= 1
            },
            {
                type: 'mission_type_themed',
                name: 'Strategic Operations',
                weight: 15,
                condition: () => enemyPlanets.length >= 3
            },
            {
                type: 'biome_specific',
                name: 'Environmental Campaign',
                weight: 15,
                condition: () => this.getBiomesWithMultiplePlanets(enemyPlanets).length > 0
            },
            {
                type: 'liberation_defense',
                name: 'War Front Campaign',
                weight: 10,
                condition: () => enemyPlanets.length >= 4
            }
        ];

        // Filter themes based on availability
        const availableThemes = themes.filter(theme => theme.condition());
        
        if (availableThemes.length === 0) {
            // Fallback to single planet theme
            return {
                type: 'single_planet',
                name: 'Planetary Conquest',
                weight: 100
            };
        }

        // Weighted random selection
        const totalWeight = availableThemes.reduce((sum, theme) => sum + theme.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const theme of availableThemes) {
            random -= theme.weight;
            if (random <= 0) {
                return theme;
            }
        }
        
        return availableThemes[0]; // Fallback
    }

    getSectorsWithMultiplePlanets(planets) {
        const sectorCounts = {};
        planets.forEach(planet => {
            const sector = planet.sector || 'Unknown';
            sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
        });
        return Object.keys(sectorCounts).filter(sector => sectorCounts[sector] >= 2);
    }

    getBiomesWithMultiplePlanets(planets) {
        const biomeCounts = {};
        planets.forEach(planet => {
            const biome = apiService.getPlanetBiome(planet) || 'Unknown';
            biomeCounts[biome] = (biomeCounts[biome] || 0) + 1;
        });
        return Object.keys(biomeCounts).filter(biome => biomeCounts[biome] >= 2);
    }

    determineTourLength(tourLengthPreference) {
        const tourLengths = {
            'quick': { min: 2, max: 3 },
            'short': { min: 4, max: 5 },
            'regular': { min: 6, max: 8 },
            'long': { min: 8, max: 10 },
            'legendary': { min: 10, max: 12 }
        };

        const range = tourLengths[tourLengthPreference] || tourLengths.regular;
        return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
    }

    async generateThemedTourMissions(planets, tourLength, preferences, campaignTheme) {
        const missions = [];
        const usedPlanets = new Set();
        const enemyPlanets = apiService.getEnemyPlanets(planets);

        if (enemyPlanets.length === 0) {
            throw new Error('No enemy planets available for missions');
        }

        // For mission_type_themed, determine the mission type based on available API data
        if (campaignTheme.type === 'mission_type_themed' && !this.selectedMissionType) {
            const availableTypes = [];
            const hasLiberation = enemyPlanets.some(p => !p.isDefense);
            const hasDefense = enemyPlanets.some(p => p.isDefense);
            
            if (hasLiberation) availableTypes.push('liberation');
            if (hasDefense) availableTypes.push('defense');
            
            if (availableTypes.length === 0) {
                // Fallback if no specific types available
                this.selectedMissionType = 'liberation';
            } else {
                this.selectedMissionType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            }
            console.log(`Mission type theme: Selected "${this.selectedMissionType}" based on available API data`);
        }

        // Get themed planet selection based on campaign theme
        const themedPlanets = this.selectThemedPlanets(enemyPlanets, campaignTheme, tourLength);
        console.log(`Theme "${campaignTheme.type}" provided ${themedPlanets.length} planets for ${tourLength} missions`);
        
        for (let i = 0; i < tourLength; i++) {
            // Select planet based on theme
            const planet = this.selectPlanetForTheme(themedPlanets, campaignTheme, i, usedPlanets);
            
            if (!planet) {
                console.warn(`Could not find suitable planet for themed mission ${i + 1}`);
                continue;
            }

            console.log(`Mission ${i + 1}: Selected planet ${planet.name} (${apiService.getCurrentEnemy(planet)}) - Original status: ${planet.isDefense ? 'DEFENSE' : 'LIBERATION'}`);

            // Apply theme-specific mission properties
            this.applyThemeToMission(planet, campaignTheme, i, tourLength);

            // Calculate scaled difficulty (starts easier, gets harder)
            const scaledDifficulty = this.calculateScaledDifficulty(i, tourLength);
            
            const mission = missionGenerator.generateMission(planet, i, tourLength, {
                difficulty: scaledDifficulty,
                isTourMode: true,
                campaignTheme: campaignTheme
            }, missions);

            // Override difficulty with scaled value (the mission generator should handle this, but ensure it's set)
            mission.difficulty = {
                level: scaledDifficulty,
                name: this.getDifficultyName(scaledDifficulty)
            };

            missions.push(mission);
            
            // Track used planets for themes that don't want repeats
            if (this.shouldAvoidRepeats(campaignTheme) && themedPlanets.length > tourLength) {
                usedPlanets.add(planet.id);
            }
        }

        return missions;
    }

    selectThemedPlanets(enemyPlanets, campaignTheme, tourLength) {
        switch (campaignTheme.type) {
            case 'single_planet':
                // Pick one planet for all missions (varying between planet/city)
                const singlePlanet = enemyPlanets[Math.floor(Math.random() * enemyPlanets.length)];
                return Array(tourLength).fill(singlePlanet);
                
            case 'sector_campaign':
                // Pick planets from same sector
                const sectorsWithMultiple = this.getSectorsWithMultiplePlanets(enemyPlanets);
                const selectedSector = sectorsWithMultiple[Math.floor(Math.random() * sectorsWithMultiple.length)];
                const sectorPlanets = enemyPlanets.filter(planet => planet.sector === selectedSector);
                
                // Ensure we actually have multiple planets for this sector theme
                if (sectorPlanets.length < 2) {
                    console.warn(`Sector ${selectedSector} only has ${sectorPlanets.length} planet(s), falling back to general planet selection`);
                    return enemyPlanets;
                }
                
                return sectorPlanets;
                
            case 'faction_focused':
                // Pick planets of same faction
                const availableFactions = apiService.getAvailableFactions(enemyPlanets);
                const selectedFaction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
                return enemyPlanets.filter(planet => apiService.getCurrentEnemy(planet) === selectedFaction);
                
            case 'biome_specific':
                // Pick planets of same biome
                const biomesWithMultiple = this.getBiomesWithMultiplePlanets(enemyPlanets);
                const selectedBiome = biomesWithMultiple[Math.floor(Math.random() * biomesWithMultiple.length)];
                return enemyPlanets.filter(planet => apiService.getPlanetBiome(planet) === selectedBiome);
                
            case 'mission_type_themed':
                // Will be filtered later in applyThemeToMission based on selectedMissionType
                return enemyPlanets;
                
            case 'liberation_defense':
                // Use all planets since we respect their natural API defense status
                return enemyPlanets;
                
            default:
                return enemyPlanets;
        }
    }

    selectPlanetForTheme(themedPlanets, campaignTheme, missionIndex, usedPlanets) {
        let candidatePlanets = themedPlanets.filter(planet => !usedPlanets.has(planet.id));
        
        if (candidatePlanets.length === 0) {
            candidatePlanets = themedPlanets; // Allow reuse if needed
        }

        if (campaignTheme.type === 'single_planet') {
            return candidatePlanets[0]; // Always the same planet
        }

        // For mission_type_themed, filter by the selected mission type using API data
        if (campaignTheme.type === 'mission_type_themed' && this.selectedMissionType) {
            const wantDefense = this.selectedMissionType === 'defense';
            const typedPlanets = candidatePlanets.filter(planet => planet.isDefense === wantDefense);
            
            if (typedPlanets.length > 0) {
                candidatePlanets = typedPlanets;
                console.log(`Mission type theme: Found ${candidatePlanets.length} planets with ${this.selectedMissionType} status from API`);
            } else {
                console.warn(`Mission type theme: No planets found with ${this.selectedMissionType} status from API, using any available planets`);
            }
        }

        return candidatePlanets[Math.floor(Math.random() * candidatePlanets.length)];
    }

    applyThemeToMission(planet, campaignTheme, missionIndex, totalMissions) {
        console.log(`Applying theme "${campaignTheme.type}" to mission ${missionIndex + 1} on planet ${planet.name}`);
        
        // Store original defense status from API data
        const originalDefenseStatus = planet.isDefense;
        
        switch (campaignTheme.type) {
            case 'single_planet':
                // Alternate between planet and city missions if possible
                if (this.planetHasAvailableRegions(planet)) {
                    planet.forceCityMission = missionIndex % 2 === 1;
                    planet.forceNonCity = missionIndex % 2 === 0;
                    console.log(`Single planet theme: Mission ${missionIndex + 1} will be ${planet.forceCityMission ? 'city' : 'planet surface'}`);
                }
                // Always use the API's accurate defense status
                planet.isDefense = originalDefenseStatus;
                break;
                
            case 'mission_type_themed':
                // Focus on planets that match the selected mission type from API data
                if (!this.selectedMissionType) {
                    // For mission_type_themed, selection is already done in selectThemedPlanets
                    // This is a fallback in case it wasn't set properly
                    this.selectedMissionType = 'liberation';
                    console.log(`Mission type theme: Fallback to "${this.selectedMissionType}"`);
                }
                // Respect the API's accurate defense status - only use planets that match the theme
                console.log(`Mission type theme: Using API defense status (${planet.isDefense ? 'DEFENSE' : 'LIBERATION'})`);
                break;
                
            case 'liberation_defense':
                // Respect API data - don't override the natural defense status
                console.log(`Liberation/Defense theme: Using API defense status (${planet.isDefense ? 'DEFENSE' : 'LIBERATION'})`);
                break;
                
            case 'sector_campaign':
            case 'faction_focused': 
            case 'biome_specific':
            default:
                // All other themes respect the API's accurate defense status
                planet.isDefense = originalDefenseStatus;
                console.log(`${campaignTheme.type} theme: Using API defense status (${planet.isDefense ? 'DEFENSE' : 'LIBERATION'})`);
                break;
        }
        
        console.log(`Theme application complete: Planet ${planet.name} - Mission type: ${planet.isDefense ? 'DEFENSE' : 'LIBERATION'}`);
    }

    shouldAvoidRepeats(campaignTheme) {
        return campaignTheme.type !== 'single_planet';
    }

    calculateScaledDifficulty(missionIndex, totalMissions) {
        // Simple approach: linear scaling with random variation
        // Scale from roughly 1-2 at start to roughly 7-10 at end, regardless of length
        const progress = missionIndex / (totalMissions - 1);
        
        // Base difficulty increases from 2 to 8 (leaving room for variation)
        const baseDifficulty = Math.round(2 + progress * 6);
        
        // Random variation gets larger as tour progresses
        const maxVariation = Math.floor(1 + progress * 2); // 1 to 3
        const variation = Math.floor(Math.random() * (maxVariation * 2 + 1)) - maxVariation;
        
        // Final difficulty with bounds
        const finalDifficulty = baseDifficulty + variation;
        return Math.max(1, Math.min(10, finalDifficulty));
    }

    getDifficultyName(level) {
        const names = {
            1: 'Trivial', 2: 'Easy', 3: 'Medium', 4: 'Challenging',
            5: 'Hard', 6: 'Extreme', 7: 'Suicide Mission',
            8: 'Impossible', 9: 'Helldive', 10: 'Super Helldive'
        };
        return names[level] || 'Unknown';
    }

    planetHasAvailableRegions(planet) {
        return (planet.availableRegions && planet.availableRegions.length > 0) ||
               (planet.activeRegions && planet.activeRegions.length > 0) ||
               (planet.regions && planet.regions.filter(r => r.isAvailable).length > 0);
    }

    generateThemedTourName(campaignTheme) {
        const themeNames = {
            'single_planet': [
                'Operation: Planetary Conquest',
                'Campaign: World Cleansing', 
                'Mission: Total Liberation',
                'Operation: Planetary Domination'
            ],
            'sector_campaign': [
                'Operation: Sector Liberation',
                'Campaign: Regional Control',
                'Mission: Sector Cleansing',
                'Operation: Zone Domination'
            ],
            'faction_focused': [
                'Operation: Species Elimination',
                'Campaign: Faction Purge',
                'Mission: Enemy Eradication',
                'Operation: Threat Neutralization'
            ],
            'mission_type_themed': [
                'Operation: Strategic Objectives',
                'Campaign: Tactical Supremacy',
                'Mission: Military Excellence',
                'Operation: Combat Mastery'
            ],
            'biome_specific': [
                'Operation: Environmental Adaptation',
                'Campaign: Terrain Mastery',
                'Mission: Climate Conquest',
                'Operation: Biome Domination'
            ],
            'liberation_defense': [
                'Operation: War Front',
                'Campaign: Battle Lines',
                'Mission: Front Defense',
                'Operation: Strategic Warfare'
            ]
        };

        const names = themeNames[campaignTheme.type] || themeNames['single_planet'];
        return names[Math.floor(Math.random() * names.length)];
    }

    getSingularFactionName(factionName) {
        const factionMap = {
            'Terminids': 'Terminid',
            'Automatons': 'Automaton',
            'Illuminate': 'Illuminate'
        };
        
        return factionMap[factionName] || factionName;
    }

    isEntireSectorCampaign(tour) {
        // Check if the tour truly covers the entire sector by checking if we have missions 
        // on multiple planets in the same sector and the sector theme was selected
        if (tour.theme.type !== 'sector_campaign') {
            return false;
        }
        
        const uniquePlanets = new Set(tour.missions.map(m => m.planet.name));
        const sectors = new Set(tour.missions.map(m => m.planet.sector));
        
        // If we have multiple planets from the same sector, it's more likely to be "entire"
        // But we should be conservative - only use "entire" if we have 3+ planets
        return uniquePlanets.size >= 3 && sectors.size === 1;
    }

    getTourPreferences() {
        return {
            tourLength: document.getElementById('tour-length')?.value || 'regular'
            // Note: Other preferences are now determined automatically by campaign theme
        };
    }

    displayTourBriefing(tour) {
        const briefing = this.generateInitialBriefing(tour);
        
        // Hide campaign display, show tour display
        document.getElementById('campaign-display').style.display = 'none';
        document.getElementById('tour-display').style.display = 'block';
        
        // Show briefing
        const briefingSection = document.getElementById('democracy-briefing');
        const briefingContent = document.getElementById('briefing-content');
        const currentMissionDisplay = document.getElementById('current-mission-display');
        
        briefingContent.innerHTML = briefing;
        briefingSection.style.display = 'block';
        currentMissionDisplay.style.display = 'none';
    }

    generateInitialBriefing(tour) {
        const mission = tour.missions[0];
        const factionName = this.getSingularFactionName(mission.faction);
        const campaignTheme = tour.theme;
        
        const themeBriefings = {
            'single_planet': [
                `Helldiver. Your tour focuses entirely on ${mission.planet.name}. This world has become a festering wound in Democracy's flesh, and you will be the surgical blade that excises the ${factionName} infection. Multiple operations across both planetary surface and urban centers will demonstrate the thoroughness of Managed Democracy.`,
                `The Ministry of Defense has identified ${mission.planet.name} as a critical strategic target. Your Tour of War will systematically dismantle every ${factionName} stronghold on this world, from wilderness outposts to metropolitan centers. Leave no stone unturned, Helldiver.`,
                `${mission.planet.name} requires total liberation, Helldiver. Your tour will span the entire world - surface installations, urban sectors, and everything between. The ${factionName} presence will be completely eradicated through sustained, methodical operations.`
            ],
            'sector_campaign': [
                `Helldiver. ${this.isEntireSectorCampaign(tour) ? 'The entire' : 'The'} ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'} has fallen to ${factionName} influence. Your Tour of War will sweep across multiple worlds in this sector, establishing Democratic control through decisive military action. This is regional warfare at its most crucial.`,
                `The Ministry of Truth reports widespread ${factionName} contamination throughout the ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'}. Your tour will liberate world after world, demonstrating that no corner of space can hide from Democracy's reach. Begin with ${mission.planet.name}.`,
                `Strategic Command designates the ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'} as Priority Alpha for liberation. Your Tour of War represents a ${this.isEntireSectorCampaign(tour) ? 'sector-wide' : 'regional'} cleansing operation. Multiple planets await your attention, starting with the ${factionName} stronghold on ${mission.planet.name}.`
            ],
            'faction_focused': [
                `Helldiver. Your tour represents a concentrated strike against the ${factionName} across multiple battlefields. The Ministry of Defense has determined that focused pressure on this specific threat will yield maximum strategic advantage. Show them that Democracy singles out its enemies for special attention.`,
                `The ${factionName} have earned particular scrutiny from Super Earth Command. Your Tour of War will pursue them across multiple worlds, demonstrating that Managed Democracy never forgets its enemies. Begin this campaign of focused elimination on ${mission.planet.name}.`,
                `Your tour specifically targets ${factionName} forces wherever they may be found. Multiple operations against this singular threat will prove that Democracy's wrath, once focused, becomes an unstoppable force. The hunt begins on ${mission.planet.name}.`
            ],
            'mission_type_themed': [
                `Helldiver. Your tour emphasizes tactical excellence through specialized operations. The Ministry of Defense requires demonstration of specific combat doctrines across multiple battlefields. Your success will validate Strategic Command's operational theories.`,
                `Strategic Command has designed your tour to showcase particular military capabilities. Multiple missions of similar operational focus will prove the effectiveness of concentrated tactical approaches. Begin this demonstration of military excellence on ${mission.planet.name}.`,
                `Your Tour of War represents focused tactical development, Helldiver. Through repeated application of specific operational methods across multiple battlefields, you will perfect the art of Democratic warfare. The first lesson begins on ${mission.planet.name}.`
            ],
            'biome_specific': [
                `Helldiver. Your tour will test Democracy's adaptability across similar environmental conditions. The Ministry of Science requires data on combat effectiveness in ${apiService.getPlanetBiome(mission.planet).toLowerCase()} environments. Multiple operations in these conditions will prove that Freedom adapts to any climate.`,
                `Environmental Command has selected you for specialized terrain operations. Your tour will span multiple worlds sharing similar biomes, demonstrating that Democracy thrives in any ecosystem. The ${factionName} will learn that no environment provides sanctuary from Freedom.`,
                `Your Tour of War focuses on mastering combat in ${apiService.getPlanetBiome(mission.planet).toLowerCase()} conditions. Multiple operations across similar terrain will prove that Managed Democracy conquers not just enemies, but the very planets they hide upon.`
            ],
            'liberation_defense': [
                `Helldiver. Your tour spans the full spectrum of Democratic warfare - from seizing enemy territory to defending liberated ground. Multiple operations will demonstrate that Freedom both advances and endures. The war front awaits your leadership.`,
                `Strategic Command requires proof of tactical versatility. Your Tour of War alternates between offensive liberation and defensive operations, showing that Democracy both conquers and protects. Begin this demonstration of military balance on ${mission.planet.name}.`,
                `Your tour represents the complete cycle of Democratic warfare. Through alternating liberation and defense operations, you will prove that Freedom both expands and consolidates its gains. The balance of war begins on ${mission.planet.name}.`
            ]
        };

        const briefings = themeBriefings[campaignTheme.type] || themeBriefings['single_planet'];
        return briefings[Math.floor(Math.random() * briefings.length)];
    }

    handleAcknowledgeBriefing() {
        // Hide briefing, show current mission
        document.getElementById('democracy-briefing').style.display = 'none';
        document.getElementById('current-mission-display').style.display = 'block';
        
        // Display current mission
        this.displayCurrentTourMission();
    }

    displayCurrentTourMission() {
        const tour = this.currentTour;
        const mission = tour.missions[tour.currentMissionIndex];
        
        // Update tour info
        document.getElementById('tour-name').textContent = tour.name;
        document.getElementById('current-mission-number').textContent = tour.currentMissionIndex + 1;
        document.getElementById('total-missions').textContent = tour.missions.length;
        
        // Display mission
        const container = document.getElementById('current-mission-container');
        container.innerHTML = '';
        
        const missionCard = this.createMissionCard(mission, tour.currentMissionIndex);
        container.appendChild(missionCard);
        
        // Show action buttons
        document.getElementById('mission-complete').style.display = 'inline-block';
        document.getElementById('mission-failed').style.display = 'inline-block';
    }

    handleMissionComplete() {
        const tour = this.currentTour;
        tour.currentMissionIndex++;
        
        if (tour.currentMissionIndex >= tour.missions.length) {
            // Tour completed!
            this.completeTour();
        } else {
            // Show briefing for next mission
            this.displayNextMissionBriefing();
        }
    }

    handleMissionFailed() {
        this.failTour();
    }

    displayNextMissionBriefing() {
        const tour = this.currentTour;
        const mission = tour.missions[tour.currentMissionIndex];
        const briefing = this.generateNextMissionBriefing(mission, tour.currentMissionIndex);
        
        // Show briefing
        const briefingSection = document.getElementById('democracy-briefing');
        const briefingContent = document.getElementById('briefing-content');
        const currentMissionDisplay = document.getElementById('current-mission-display');
        
        briefingContent.innerHTML = briefing;
        briefingSection.style.display = 'block';
        currentMissionDisplay.style.display = 'none';
    }

    generateNextMissionBriefing(mission, missionIndex) {
        const factionName = this.getSingularFactionName(mission.faction);
        const campaignTheme = this.currentTour.theme;
        
        const themeProgressBriefings = {
            'single_planet': [
                `Your previous operation has weakened the ${factionName} grip on ${mission.planet.name}, but the world still bleeds. Continue your systematic conquest of this planet, Helldiver. Each district liberated, each stronghold destroyed, brings total planetary victory closer.`,
                `Phase ${missionIndex + 1} of planetary liberation begins now. The ${factionName} infestation on ${mission.planet.name} retreats deeper with each of your victories. Continue this methodical cleansing until not one enemy remains on this world.`,
                `Excellent progress on ${mission.planet.name}, Helldiver. Your tour continues to squeeze the ${factionName} presence from every corner of this world. The next phase of operations will further tighten Democracy's grip on this strategic planet.`
            ],
            'sector_campaign': [
                `Regional liberation proceeds according to plan. Your tour now advances to ${mission.planet.name}, another world poisoned by ${factionName} presence. ${this.isEntireSectorCampaign(this.currentTour) ? 'The entire' : 'The'} ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'} will fall under Democratic control through your systematic efforts.`,
                `The ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'} cleansing operation continues. Each world you liberate demonstrates to the surviving ${factionName} forces that no planet in this sector offers sanctuary. ${mission.planet.name} awaits your attention.`,
                `${this.isEntireSectorCampaign(this.currentTour) ? 'Sector-wide' : 'Regional'} victory advances with each mission, Helldiver. The ${factionName} influence across the ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'} crumbles before Democracy's methodical advance. ${mission.planet.name} represents the next stage in total regional liberation.`
            ],
            'faction_focused': [
                `The hunt for ${factionName} continues across multiple battlefields. Your tour now brings you to ${mission.planet.name}, where these particular enemies have established another nest of tyranny. Show them that Democracy's pursuit is relentless.`,
                `Excellent work against ${factionName} forces, Helldiver. Your focused campaign continues on ${mission.planet.name}, where more of these specific enemies await elimination. Each operation brings the complete eradication of this threat closer.`,
                `The ${factionName} flee before your advancing tour, but Democracy's reach extends across all worlds. ${mission.planet.name} harbors more of these targets. Continue this focused elimination campaign until none remain.`
            ],
            'mission_type_themed': [
                `Your tactical demonstration continues to exceed expectations. The next phase brings you to ${mission.planet.name}, where similar operational methods will further validate Strategic Command's doctrines. Perfect your techniques, Helldiver.`,
                `Operational excellence continues across multiple battlefields. Your tour advances to ${mission.planet.name}, where repeated application of proven tactics will demonstrate the superiority of focused military doctrine. Continue this tactical mastery.`,
                `Strategic Command observes your operational consistency with approval. ${mission.planet.name} provides the next testing ground for these specialized tactics. Your methodical approach proves Democracy's military superiority.`
            ],
            'biome_specific': [
                `Environmental mastery proceeds successfully across similar terrain conditions. Your tour continues to ${mission.planet.name}, where the same environmental challenges await conquest. Perfect your adaptation to these specific conditions, Helldiver.`,
                `Excellent terrain adaptation, Helldiver. The next phase of environmental operations brings you to ${mission.planet.name}, where similar biome conditions will further test Democracy's environmental supremacy. No climate can resist Freedom.`,
                `Your mastery of ${apiService.getPlanetBiome(mission.planet).toLowerCase()} combat continues to impress Environmental Command. ${mission.planet.name} offers similar conditions where you will further demonstrate that Democracy adapts to any world.`
            ],
            'liberation_defense': [
                `The cycle of Democratic warfare continues, Helldiver. Your tour now brings you to ${mission.planet.name} for the next phase of balanced operations. Whether seizing ground or holding it, you demonstrate Freedom's complete tactical spectrum.`,
                `Operational balance defines true military mastery. Your tour advances to ${mission.planet.name}, where the next phase of liberation or defense operations will further prove Democracy's tactical versatility. The war front evolves with your success.`,
                `Your demonstration of tactical completeness continues across multiple battlefields. ${mission.planet.name} awaits the next phase of operations, whether advancing Freedom's borders or consolidating its gains. Both are equally vital to Democracy.`
            ]
        };

        const briefings = themeProgressBriefings[campaignTheme.type] || themeProgressBriefings['single_planet'];
        return briefings[Math.floor(Math.random() * briefings.length)];
    }

    completeTour() {
        const tour = this.currentTour;
        tour.completed = true;
        
        // Show completion screen
        document.getElementById('current-mission-display').style.display = 'none';
        document.getElementById('tour-completion').style.display = 'block';
        
        // Update completion screen
        document.getElementById('completed-tour-name').textContent = tour.name;
        
        const stats = document.getElementById('completion-stats');
        stats.innerHTML = `
            <p><strong>Missions Completed:</strong> ${tour.missions.length}</p>
            <p><strong>Factions Defeated:</strong> ${[...new Set(tour.missions.map(m => m.faction))].join(', ')}</p>
            <p><strong>Average Difficulty:</strong> ${(tour.missions.reduce((sum, m) => sum + m.difficulty.level, 0) / tour.missions.length).toFixed(1)}</p>
        `;
    }

    failTour() {
        const tour = this.currentTour;
        tour.failed = true;
        
        // Show failure screen
        document.getElementById('current-mission-display').style.display = 'none';
        document.getElementById('tour-failure').style.display = 'block';
        
        // Update failure screen
        document.getElementById('failed-tour-name').textContent = tour.name;
        
        const stats = document.getElementById('failure-stats');
        stats.innerHTML = `
            <p><strong>Missions Completed:</strong> ${tour.currentMissionIndex} of ${tour.missions.length}</p>
            <p><strong>Failed Mission:</strong> ${tour.missions[tour.currentMissionIndex]?.name || 'Unknown'}</p>
            <p><strong>Location:</strong> ${tour.missions[tour.currentMissionIndex]?.planet.name || 'Unknown'}</p>
        `;
    }

    handleAbandonTour() {
        if (confirm('Are you sure you want to abandon your Tour of War? This will end your current tour.')) {
            this.currentTour = null;
            this.handleReturnToCampaigns();
        }
    }

    handleStartNewTour() {
        this.currentTour = null;
        document.getElementById('tour-completion').style.display = 'none';
        document.getElementById('tour-failure').style.display = 'none';
        this.handleStartTour();
    }

    handleRetryTour() {
        const preferences = this.currentTour.metadata.preferences;
        this.currentTour = null;
        document.getElementById('tour-failure').style.display = 'none';
        this.generateTour(preferences).then(tour => {
            this.currentTour = tour;
            this.displayTourBriefing(tour);
        });
    }

    handleReturnToCampaigns() {
        this.currentTour = null;
        // DO NOT disable tour mode - keep it always on
        this.tourMode = true;
        
        // Keep tour mode checkbox checked and maintain state
        const tourCheckbox = document.getElementById('tour-mode-checkbox');
        if (tourCheckbox) {
            tourCheckbox.checked = true;
        }
        
        // Ensure only tour length is visible, hide all other preferences
        const campaignLengthGroup = document.getElementById('campaign-length-group');
        const tourLengthGroup = document.getElementById('tour-length-group');
        const generateBtn = document.getElementById('generate-campaign');
        const startTourBtn = document.getElementById('start-tour');
        
        if (campaignLengthGroup) campaignLengthGroup.style.display = 'none';
        if (tourLengthGroup) tourLengthGroup.style.display = 'block';
        if (generateBtn) generateBtn.style.display = 'none';
        if (startTourBtn) startTourBtn.style.display = 'inline-block';
        
        // Hide all other preference groups
        const preferencesToHide = [
            'faction-preference', 'difficulty-preference', 'biome-preference', 
            'mission-type-preference', 'target-type-preference', 'custom-length-group'
        ].map(id => document.getElementById(id)?.closest('.preference-group'));
        
        preferencesToHide.forEach(group => {
            if (group) group.style.display = 'none';
        });
        
        // Hide tour display screens
        document.getElementById('tour-display').style.display = 'none';
        document.getElementById('democracy-briefing').style.display = 'none';
        document.getElementById('tour-completion').style.display = 'none';
        document.getElementById('tour-failure').style.display = 'none';
    }
}

// Initialize the app
const app = new App();

// Apply preferences after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.initializePreferences();
    console.log('HELLDIVERS 2 Campaign Generator initialized');
    console.log('For Super Earth! For Democracy!');
});