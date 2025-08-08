class App {
    constructor() {
        this.isInitialized = false;
        this.preferences = this.loadPreferences();
        this.tourMode = true; // Always start with tour mode enabled
        this.currentTour = null;
        this.statsMode = false;
        this.squadMembers = [];
        // Per-mission tracking for multi-user group progression
        this.missionHistory = []; // Track squad composition and stats per individual mission
        this.currentMissionInOperation = 0; // Track which mission within the current operation (0-indexed)
        this.currentAbsoluteMissionIndex = 0; // Track absolute mission index for imported campaigns
        this.currentMissionSquad = []; // Track squad composition for the mission currently being played
        this.squadManagementInProgress = false; // Prevent duplicate squad management dialogs
        // Background data loading state
        this.backgroundDataLoading = false;
        this.backgroundDataReady = false;
        this.backgroundDataError = null;
        this.init();
    }

    // Check if the current tour is an imported campaign with flat mission structure
    isImportedCampaign() {
        return this.currentTour && 
               this.currentTour.metadata && 
               (this.currentTour.metadata.isImportedCampaign || this.currentTour.metadata.type === 'custom');
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

        // Campaign Builder button
        const campaignBuilderBtn = document.getElementById('campaign-builder');
        if (campaignBuilderBtn) {
            campaignBuilderBtn.addEventListener('click', () => this.handleShowCampaignBuilder());
        }

        const viewResultsBtn = document.getElementById('view-results');
        if (viewResultsBtn) {
            viewResultsBtn.addEventListener('click', () => this.handleShowResultsViewer());
        }

        // Campaign Builder navigation
        this.setupCampaignBuilderListeners();
        
        // Results Viewer navigation
        this.setupResultsViewerListeners();

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

        // Stats mode handlers
        this.setupStatsModeListeners();

    }

    setupPreferenceListeners() {
        const preferenceIds = [
            'campaign-length', 'faction-preference', 'difficulty-preference', 'biome-preference',
            'mission-type-preference', 'target-type-preference', 'tour-length', 'tour-theme', 'tour-faction', 'tour-difficulty', 'tour-faction-preference', 'tour-mission-type-preference', 'tour-planet'
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

        // Custom tour length input
        const customTourInput = document.getElementById('custom-tour-length-input');
        if (customTourInput) {
            customTourInput.addEventListener('input', () => this.savePreferences());
        }

        // Tour length dropdown special handling
        const tourLengthSelect = document.getElementById('tour-length');
        if (tourLengthSelect) {
            tourLengthSelect.addEventListener('change', (e) => this.handleTourLengthChange(e));
        }

        // Squad member name inputs
        for (let i = 1; i <= 4; i++) {
            const squadInput = document.getElementById(`squad-member-${i}`);
            if (squadInput) {
                squadInput.addEventListener('input', () => this.savePreferences());
            }
        }

        // Custom campaign name input
        const customCampaignNameInput = document.getElementById('custom-campaign-name');
        if (customCampaignNameInput) {
            customCampaignNameInput.addEventListener('input', () => this.savePreferences());
        }


        // Tour theme change handler to show/hide faction selection
        const tourThemeSelect = document.getElementById('tour-theme');
        if (tourThemeSelect) {
            tourThemeSelect.addEventListener('change', (e) => this.handleTourThemeChange(e));
        }

        // Tour faction preference change handler to update planet and sector lists
        const tourFactionPreferenceSelect = document.getElementById('tour-faction-preference');
        if (tourFactionPreferenceSelect) {
            tourFactionPreferenceSelect.addEventListener('change', () => {
                const tourTheme = document.getElementById('tour-theme')?.value;
                if (tourTheme === 'single_planet') {
                    this.populateTourPlanetOptions();
                } else if (tourTheme === 'sector_campaign') {
                    this.populateSectorOptions();
                }
            });
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

        // Export/Import tour buttons
        const exportTourBtn = document.getElementById('export-tour');
        if (exportTourBtn) {
            exportTourBtn.addEventListener('click', () => this.handleExportTour());
        }

        const exportCampaignFromTourBtn = document.getElementById('export-campaign-from-tour');
        if (exportCampaignFromTourBtn) {
            exportCampaignFromTourBtn.addEventListener('click', () => this.handleExportCampaignFromTour());
        }

        const importTourBtn = document.getElementById('import-tour');
        if (importTourBtn) {
            importTourBtn.addEventListener('click', () => this.handleImportTour());
        }

        const importTourFile = document.getElementById('import-tour-file');
        if (importTourFile) {
            importTourFile.addEventListener('change', () => this.importTour(importTourFile));
        }

        // Unified import campaign button (handles both tours and campaigns)
        const importCampaignMainBtn = document.getElementById('import-campaign-main');
        if (importCampaignMainBtn) {
            importCampaignMainBtn.addEventListener('click', () => this.handleImportCampaignMain());
        }

        const importCampaignMainFile = document.getElementById('import-campaign-main-file');
        if (importCampaignMainFile) {
            importCampaignMainFile.addEventListener('change', () => this.handleUnifiedImport(importCampaignMainFile));
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

    setupStatsModeListeners() {
        // Stats mode checkbox
        const statsCheckbox = document.getElementById('stats-mode-checkbox');
        if (statsCheckbox) {
            statsCheckbox.addEventListener('change', (e) => this.handleStatsModeToggle(e));
        }


        // Stats tracking dialog buttons
        const confirmStatsBtn = document.getElementById('confirm-stats');
        const skipStatsBtn = document.getElementById('skip-stats');
        
        if (confirmStatsBtn) {
            confirmStatsBtn.addEventListener('click', () => this.handleConfirmStats());
        }
        if (skipStatsBtn) {
            skipStatsBtn.addEventListener('click', () => this.handleSkipStats());
        }



        // Stats completion screen buttons
        const exportResultsBtn = document.getElementById('export-results');
        const startNewStatsTourBtn = document.getElementById('start-new-stats-tour');
        const returnToCampaignsStatsBtn = document.getElementById('return-to-campaigns-stats');

        if (exportResultsBtn) {
            exportResultsBtn.addEventListener('click', () => this.handleExportResults());
        }
        if (startNewStatsTourBtn) {
            startNewStatsTourBtn.addEventListener('click', () => this.handleStartNewTour());
        }
        if (returnToCampaignsStatsBtn) {
            returnToCampaignsStatsBtn.addEventListener('click', () => this.handleReturnToCampaigns());
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
        
        // Tour-specific elements to show/hide
        const tourThemeGroup = document.getElementById('tour-theme-group');
        const tourFactionGroup = document.getElementById('tour-faction-group');
        const tourDifficultyGroup = document.getElementById('tour-difficulty-group');
        const tourFactionPreferenceGroup = document.getElementById('tour-faction-preference-group');
        const tourMissionTypePreferenceGroup = document.getElementById('tour-mission-type-preference-group');

        if (this.tourMode) {
            status.textContent = 'ON';
            status.classList.add('active');
            campaignLengthGroup.style.display = 'none';
            tourLengthGroup.style.display = 'block';
            generateBtn.style.display = 'none';
            startTourBtn.style.display = 'inline-block';

            // Show tour-specific elements
            if (tourThemeGroup) tourThemeGroup.style.display = 'block';
            if (tourDifficultyGroup) tourDifficultyGroup.style.display = 'block';
            if (tourFactionPreferenceGroup) tourFactionPreferenceGroup.style.display = 'block';
            if (tourMissionTypePreferenceGroup) tourMissionTypePreferenceGroup.style.display = 'block';
            // Faction group visibility is handled by handleTourThemeChange

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

            // Hide tour-specific elements
            if (tourThemeGroup) tourThemeGroup.style.display = 'none';
            if (tourFactionGroup) tourFactionGroup.style.display = 'none';
            if (tourDifficultyGroup) tourDifficultyGroup.style.display = 'none';
            if (tourFactionPreferenceGroup) tourFactionPreferenceGroup.style.display = 'none';
            if (tourMissionTypePreferenceGroup) tourMissionTypePreferenceGroup.style.display = 'none';

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

    handleTourLengthChange(event) {
        const customTourLengthGroup = document.getElementById('custom-tour-length-group');
        if (customTourLengthGroup) {
            if (event.target.value === 'custom') {
                customTourLengthGroup.style.display = 'block';
            } else {
                customTourLengthGroup.style.display = 'none';
            }
        }
        this.savePreferences();
    }

    handleTourThemeChange(event) {
        const tourFactionGroup = document.getElementById('tour-faction-group');
        const tourPlanetGroup = document.getElementById('tour-planet-group');
        const tourSectorGroup = document.getElementById('tour-sector-group');
        const majorOrderInfoGroup = document.getElementById('major-order-info-group');
        const customFiltersGroup = document.getElementById('custom-filters-group');
        
        if (tourFactionGroup) {
            if (event.target.value === 'faction_focused') {
                tourFactionGroup.style.display = 'block';
            } else {
                tourFactionGroup.style.display = 'none';
            }
        }
        
        if (tourPlanetGroup) {
            if (event.target.value === 'single_planet') {
                tourPlanetGroup.style.display = 'block';
                this.populateTourPlanetOptions();
            } else {
                tourPlanetGroup.style.display = 'none';
            }
        }
        
        if (tourSectorGroup) {
            if (event.target.value === 'sector_campaign') {
                tourSectorGroup.style.display = 'block';
                this.populateSectorOptions();
            } else {
                tourSectorGroup.style.display = 'none';
            }
        }
        
        if (majorOrderInfoGroup) {
            if (event.target.value === 'major_order') {
                majorOrderInfoGroup.style.display = 'block';
                this.loadMajorOrderInfo();
            } else {
                majorOrderInfoGroup.style.display = 'none';
            }
        }
        
        if (customFiltersGroup) {
            if (event.target.value === 'custom') {
                customFiltersGroup.style.display = 'block';
                this.populateCustomFilters();
                this.setupCustomFilterListeners();
            } else {
                customFiltersGroup.style.display = 'none';
            }
        }
        
        this.savePreferences();
    }

    async populateTourPlanetOptions() {
        try {
            const gameData = await apiService.getAllGameData();
            this.lastGameData = gameData; // Store for campaign builder
            const planets = gameData.planets;
            
            const enemyPlanets = apiService.getEnemyPlanets(planets);
            
            // Filter by faction preference if specified
            const factionPreference = document.getElementById('tour-faction-preference')?.value;
            let availablePlanets = enemyPlanets;
            
            if (factionPreference && factionPreference !== 'any') {
                availablePlanets = enemyPlanets.filter(planet => 
                    apiService.getCurrentEnemy(planet) === factionPreference
                );
            }
            
            // Sort planets alphabetically
            availablePlanets.sort((a, b) => a.name.localeCompare(b.name));
            
            console.log(`Found ${availablePlanets.length} accessible planets for planet theme dropdown`);
            
            const planetSelect = document.getElementById('tour-planet');
            if (planetSelect) {
                // Clear existing options except the first one
                planetSelect.innerHTML = '<option value="random">Random Available Planet</option>';
                
                // Add planet options
                availablePlanets.forEach(planet => {
                    const option = document.createElement('option');
                    option.value = planet.id;
                    const faction = apiService.getCurrentEnemy(planet);
                    option.textContent = `${planet.name} (${faction})`;
                    planetSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error populating planet options:', error);
        }
    }

    async populateSectorOptions() {
        try {
            const gameData = await apiService.getAllGameData();
            this.lastGameData = gameData; // Store for consistency
            const planets = gameData.planets;
            
            // Get faction preference
            const factionPreference = document.getElementById('tour-faction-preference')?.value || 'any';
            
            // Get sectors filtered by faction and capturable status
            const availableSectors = apiService.getSectorsFilteredByFactionAndCapturable(planets, factionPreference);
            const sectorCounts = apiService.getSectorPlanetCounts(planets, availableSectors);
            
            console.log(`Found ${availableSectors.length} sectors for faction ${factionPreference}:`, availableSectors);
            
            // Sort sectors alphabetically
            availableSectors.sort((a, b) => a.localeCompare(b));
            
            const sectorSelect = document.getElementById('tour-sector');
            if (sectorSelect) {
                // Clear existing options except the first one
                sectorSelect.innerHTML = '<option value="random">Any Available Sector</option>';
                
                // Add sector options with planet counts
                availableSectors.forEach(sector => {
                    const option = document.createElement('option');
                    option.value = sector;
                    const planetCount = sectorCounts[sector] || 0;
                    option.textContent = `${sector} (${planetCount} planet${planetCount !== 1 ? 's' : ''})`;
                    sectorSelect.appendChild(option);
                });
                
                sectorSelect.disabled = false;
                console.log(`Populated sector options: ${availableSectors.length} sectors available`);
            }
            
        } catch (error) {
            console.error('Error populating sector options:', error);
        }
    }

    async loadMajorOrderInfo() {
        try {
            const titleElement = document.getElementById('major-order-title');
            const briefingElement = document.getElementById('major-order-briefing');
            const statusElement = document.getElementById('major-order-status');
            
            titleElement.textContent = 'Loading Major Order...';
            briefingElement.textContent = '';
            statusElement.textContent = '';
            
            const majorOrderDetails = await apiService.getMajorOrderDetails();
            
            if (majorOrderDetails) {
                titleElement.textContent = majorOrderDetails.title || 'MAJOR ORDER';
                briefingElement.textContent = majorOrderDetails.briefing || 'No briefing available';
                
                const planets = await apiService.getMajorOrderPlanets();
                let statusText = '';
                
                if (planets.length > 0) {
                    statusText = `Active on ${planets.length} planet${planets.length !== 1 ? 's' : ''}: `;
                    statusText += planets.slice(0, 3).map(p => p.name).join(', ');
                    if (planets.length > 3) {
                        statusText += ` and ${planets.length - 3} more`;
                    }
                } else if (majorOrderDetails.factions && majorOrderDetails.factions.length > 0) {
                    statusText = `Target faction${majorOrderDetails.factions.length !== 1 ? 's' : ''}: ${majorOrderDetails.factions.join(', ')}`;
                } else {
                    statusText = 'No specific targets identified';
                }
                
                if (majorOrderDetails.expiresIn > 0) {
                    const hours = Math.floor(majorOrderDetails.expiresIn / 3600);
                    const days = Math.floor(hours / 24);
                    if (days > 0) {
                        statusText += ` | Expires in ${days} day${days !== 1 ? 's' : ''}`;
                    } else {
                        statusText += ` | Expires in ${hours} hour${hours !== 1 ? 's' : ''}`;
                    }
                }
                
                statusElement.textContent = statusText;
            } else {
                titleElement.textContent = 'No Active Major Order';
                briefingElement.textContent = 'There is currently no active Major Order. Check back later or select a different tour theme.';
                statusElement.textContent = '';
            }
        } catch (error) {
            console.error('Failed to load Major Order info:', error);
            const titleElement = document.getElementById('major-order-title');
            const briefingElement = document.getElementById('major-order-briefing');
            titleElement.textContent = 'Failed to Load Major Order';
            briefingElement.textContent = 'Unable to fetch Major Order data. Please try again later.';
        }
    }

    handleStatsModeToggle(event) {
        this.statsMode = event.target.checked;
        const status = document.getElementById('stats-mode-status');
        const squadNamesGroup = document.getElementById('squad-names-group');

        if (this.statsMode) {
            status.textContent = 'ON';
            status.classList.add('active');
            squadNamesGroup.style.display = 'block';

            // Reset tour if one is active (as per requirements)
            if (this.currentTour) {
                if (confirm('Enabling Stats Mode will reset your current tour. Continue?')) {
                    this.currentTour = null;
                    this.handleReturnToCampaigns();
                } else {
                    // User cancelled, revert toggle
                    event.target.checked = false;
                    this.statsMode = false;
                    status.textContent = 'OFF';
                    status.classList.remove('active');
                    squadNamesGroup.style.display = 'none';
                    return;
                }
            }
        } else {
            status.textContent = 'OFF';
            status.classList.remove('active');
            squadNamesGroup.style.display = 'none';

            // Reset tour if one is active (as per requirements)
            if (this.currentTour) {
                if (confirm('Disabling Stats Mode will reset your current tour. Continue?')) {
                    this.currentTour = null;
                    this.handleReturnToCampaigns();
                } else {
                    // User cancelled, revert toggle
                    event.target.checked = true;
                    this.statsMode = true;
                    status.textContent = 'ON';
                    status.classList.add('active');
                    squadNamesGroup.style.display = 'block';
                    return;
                }
            }
        }

        this.savePreferences();
    }


    updateSquadInputPlaceholders() {
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`squad-member-${i}`);
            if (input) {
                input.placeholder = `Squad Member ${i}`;
            }
        }
    }




    initializeSquadMembers() {
        this.squadMembers = [];
        this.currentMissionSquad = []; // Reset mission squad tracking
        
        for (let i = 1; i <= 4; i++) {
            const nameInput = document.getElementById(`squad-member-${i}`);
            const name = nameInput?.value.trim();
            
            if (name) {
                this.squadMembers.push({
                    name: name,
                    kills: {
                        total: 0,
                        byFaction: {
                            "Terminids": 0,
                            "Automatons": 0,
                            "Illuminate": 0
                        }
                    },
                    samples: 0,
                    deaths: 0,
                    missionsCompleted: 0,
                    status: 'active' // active, inactive, departed
                });
            }
        }
        
        // Initialize mission history
        this.missionHistory = [];
        this.currentMissionInOperation = 0;
        
        console.log('Initialized squad members for Stats mode:', this.squadMembers);
    }

    // Show squad management dialog before each mission
    showSquadManagementDialog() {
        if (!this.statsMode) {
            return Promise.resolve(true);
        }

        // Prevent duplicate calls
        if (this.squadManagementInProgress) {
            console.warn('Squad management dialog already in progress, skipping duplicate call');
            return Promise.resolve(true);
        }

        this.squadManagementInProgress = true;

        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'squad-management-dialog';
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;

            const tour = this.currentTour;
            const operationIndex = tour.currentMissionIndex;
            const currentOperation = tour.missions[operationIndex];
            const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
            const missionInOp = this.currentMissionInOperation + 1;

            dialog.innerHTML = `
                <div style="background: #1a1a1a; color: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%;">
                    <div style="text-align: center; margin-bottom: 1.5rem;">
                        <h3>Squad Management</h3>
                        <p>Operation ${operationIndex + 1}, Mission ${missionInOp} of ${missionsInThisOperation}</p>
                        <p style="color: #cccccc; font-size: 0.9rem;">Configure who's participating in this mission</p>
                    </div>
                    <div id="squad-management-list" style="margin-bottom: 1.5rem;">
                        <!-- Squad member list will be populated here -->
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <button id="add-new-member-btn" style="background: #4CAF50; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">Add New Member</button>
                        <input type="text" id="new-member-name" placeholder="Enter player name" style="padding: 0.5rem; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: white; display: none;" maxlength="30">
                    </div>
                    <div style="text-align: center;">
                        <button id="proceed-with-squad" style="background: #2196F3; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer; margin-right: 0.5rem;">Proceed</button>
                        <button id="cancel-squad-management" style="background: #666; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 4px; cursor: pointer;">Cancel</button>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);
            this.populateSquadManagementList();

            // Event listeners
            document.getElementById('add-new-member-btn').addEventListener('click', () => {
                const input = document.getElementById('new-member-name');
                const btn = document.getElementById('add-new-member-btn');
                if (input.style.display === 'none') {
                    input.style.display = 'inline-block';
                    input.focus();
                    btn.textContent = 'Add';
                } else {
                    console.log('Attempting to add new squad member:', input.value.trim());
                    const success = this.addNewSquadMember(input.value.trim());
                    console.log('Add member result:', success);
                    if (success) {
                        input.value = '';
                        input.style.display = 'none';
                        btn.textContent = 'Add New Member';
                        this.populateSquadManagementList();
                        console.log('Squad management list repopulated after adding member');
                    } else {
                        // Keep input visible for user to correct
                        input.focus();
                        input.select();
                    }
                }
            });

            document.getElementById('proceed-with-squad').addEventListener('click', () => {
                this.squadManagementInProgress = false;
                document.body.removeChild(dialog);
                resolve(true);
            });

            document.getElementById('cancel-squad-management').addEventListener('click', () => {
                this.squadManagementInProgress = false;
                document.body.removeChild(dialog);
                resolve(false);
            });

            document.getElementById('new-member-name').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    document.getElementById('add-new-member-btn').click();
                }
            });
        });
    }

    populateSquadManagementList() {
        const container = document.getElementById('squad-management-list');
        if (!container) return;

        container.innerHTML = '';
        
        // Sort squad members: active first, then inactive, then departed
        const sortedMembers = [...this.squadMembers].sort((a, b) => {
            const statusOrder = { 'active': 0, 'departed': 1 };
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) return statusDiff;
            // If same status, sort alphabetically by name
            return a.name.localeCompare(b.name);
        });
        
        sortedMembers.forEach((member, sortedIndex) => {
            const memberDiv = document.createElement('div');
            memberDiv.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0.75rem;
                margin-bottom: 0.5rem;
                background: #2a2a2a;
                border-radius: 4px;
                border-left: 4px solid ${member.status === 'active' ? '#4CAF50' : '#666'};
            `;

            memberDiv.innerHTML = `
                <div style="flex: 1;">
                    <strong>${member.name}</strong>
                    <small style="color: #999; margin-left: 0.5rem;">(${member.missionsCompleted} missions)</small>
                </div>
                <div>
                    <select data-member-name="${member.name}" style="background: #1a1a1a; color: white; border: 1px solid #555; border-radius: 4px; padding: 0.25rem;">
                        <option value="active" ${member.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="departed" ${member.status === 'departed' ? 'selected' : ''}>Left Squad</option>
                    </select>
                </div>
            `;

            const select = memberDiv.querySelector('select');
            // Remove any existing event listeners to prevent duplicates
            const selectClone = select.cloneNode(true);
            select.parentNode.replaceChild(selectClone, select);
            
            selectClone.addEventListener('change', (e) => {
                const memberName = e.target.dataset.memberName;
                const memberObject = this.squadMembers.find(m => m.name === memberName);
                if (memberObject) {
                    memberObject.status = e.target.value;
                    this.populateSquadManagementList(); // Refresh to update colors and sorting
                }
            });

            container.appendChild(memberDiv);
        });
    }

    addNewSquadMember(name) {
        // Validate name and check for duplicates
        if (!name || !name.trim()) {
            console.warn('Cannot add squad member: empty name');
            return false;
        }
        
        const trimmedName = name.trim();
        const existingMember = this.squadMembers.find(m => m.name === trimmedName);
        
        if (existingMember) {
            if (existingMember.status === 'departed') {
                // Reactivate the existing departed member
                existingMember.status = 'active';
                console.log(`Reactivated returning squad member: "${trimmedName}"`);
                return true;
            } else {
                // Member is already active
                console.warn(`Cannot add squad member: "${trimmedName}" is already active`);
                return false;
            }
        }
        
        // Add new member with unique ID for better tracking
        this.squadMembers.push({
            id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: trimmedName,
            kills: {
                total: 0,
                byFaction: {
                    "Terminids": 0,
                    "Automatons": 0,
                    "Illuminate": 0
                }
            },
            samples: 0,
            deaths: 0,
            missionsCompleted: 0,
            status: 'active'
        });
        
        console.log(`Added new squad member: "${trimmedName}"`);
        return true;
    }

    getActiveSquadMembers() {
        const activeMembers = this.squadMembers.filter(member => member.status === 'active');
        console.log('getActiveSquadMembers called - all members:', this.squadMembers.map(m => ({name: m.name, status: m.status})));
        console.log('getActiveSquadMembers called - active members:', activeMembers.map(m => m.name));
        return activeMembers;
    }

    // Helper method to get comprehensive mission stats from history
    getMissionHistoryStats() {
        if (!this.missionHistory.length) return null;
        
        const stats = {
            totalMissionsPlayed: this.missionHistory.length,
            operationsPlayed: [...new Set(this.missionHistory.map(m => m.operationIndex))].length,
            squadEvolution: [],
            participationRates: {},
            missionBreakdown: []
        };
        
        // Track squad evolution
        let lastSquad = [];
        this.missionHistory.forEach((mission, index) => {
            const currentSquad = mission.squadComposition.map(m => m.name).sort();
            if (JSON.stringify(currentSquad) !== JSON.stringify(lastSquad)) {
                stats.squadEvolution.push({
                    missionIndex: index,
                    operationIndex: mission.operationIndex,
                    missionInOperation: mission.missionInOperation,
                    squad: currentSquad,
                    timestamp: mission.timestamp
                });
                lastSquad = currentSquad;
            }
        });
        
        // Calculate participation rates
        const allPlayers = [...new Set(this.missionHistory.flatMap(m => m.squadComposition.map(s => s.name)))];
        allPlayers.forEach(player => {
            const participated = this.missionHistory.filter(m => m.squadComposition.some(s => s.name === player));
            stats.participationRates[player] = {
                missionsParticipated: participated.length,
                participationRate: (participated.length / this.missionHistory.length * 100).toFixed(1) + '%'
            };
        });
        
        // Mission breakdown with squad info
        stats.missionBreakdown = this.missionHistory.map(mission => ({
            operationIndex: mission.operationIndex + 1,
            missionInOperation: mission.missionInOperation + 1,
            squad: mission.squadComposition.map(s => s.name),
            planet: mission.planet,
            faction: mission.faction,
            timestamp: mission.timestamp
        }));
        
        return stats;
    }


    handleConfirmStats() {
        const statsInputs = document.querySelectorAll('#stats-inputs-container .stats-input');
        const tour = this.currentTour;
        const currentOperation = tour.missions[tour.currentMissionIndex];
        
        // Collect stats per squad member for this mission
        const missionStats = {};
        const activeMembers = this.getActiveSquadMembers();
        
        statsInputs.forEach(input => {
            const memberIndex = parseInt(input.dataset.memberIndex);
            const statType = input.dataset.statType;
            let value = parseInt(input.value) || 0;
            
            // Validate input values
            if (statType === 'kills' && value < 0) value = 0;
            if (statType === 'kills' && value > 9999) value = 9999;
            if (statType === 'samples' && value < 0) value = 0;
            if (statType === 'samples' && value > 999) value = 999;
            if (statType === 'deaths' && value < 0) value = 0;
            if (statType === 'deaths' && value > 50) value = 50;
            
            if (!missionStats[memberIndex]) {
                missionStats[memberIndex] = {
                    kills: 0,
                    samples: 0,
                    deaths: 0
                };
            }
            
            missionStats[memberIndex][statType] = value;
        });
        
        // Save mission to history
        const missionRecord = {
            operationIndex: tour.currentMissionIndex,
            missionInOperation: this.currentMissionInOperation,
            squadComposition: activeMembers.map(member => ({
                name: member.name,
                status: member.status
            })),
            stats: missionStats,
            faction: currentOperation.faction,
            planet: currentOperation.planet?.name || 'Unknown',
            missionType: currentOperation.missionType || 'Unknown',
            timestamp: new Date().toISOString()
        };
        
        this.missionHistory.push(missionRecord);
        
        // Apply stats to squad members
        Object.keys(missionStats).forEach(memberIndex => {
            const member = this.squadMembers[parseInt(memberIndex)];
            const stats = missionStats[memberIndex];
            
            if (member && member.status === 'active') {
                // Update kills (total and by faction)
                member.kills.total += stats.kills;
                if (currentOperation.faction && stats.kills > 0) {
                    member.kills.byFaction[currentOperation.faction] += stats.kills;
                }
                
                // Update samples
                member.samples += stats.samples;
                
                // Update deaths
                if (stats.deaths > 0) {
                    member.deaths += stats.deaths;
                    console.log(`${member.name} died ${stats.deaths} time${stats.deaths > 1 ? 's' : ''} this mission. Total deaths: ${member.deaths}`);
                }
                
                // Update missions completed (only for active members)
                member.missionsCompleted++;
                
                console.log(`Updated stats for ${member.name}:`, {
                    kills: member.kills.total,
                    samples: member.samples,
                    deaths: member.deaths,
                    missionsCompleted: member.missionsCompleted
                });
            }
        });
        
        this.hideStatsTrackingDialog();
        
        // Show squad management for next mission (unless it's the very last mission)
        this.handlePostStatsSquadManagement();
    }

    handleSkipStats() {
        // Increment missions completed for all members
        this.squadMembers.forEach(member => {
            member.missionsCompleted++;
        });
        
        this.hideStatsTrackingDialog();
        
        // Show squad management for next mission (unless it's the very last mission)
        this.handlePostStatsSquadManagement();
    }

    async handlePostStatsSquadManagement() {
        const tour = this.currentTour;
        const currentOperation = tour.missions[tour.currentMissionIndex];
        const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
        const isLastMissionInOperation = this.currentMissionInOperation >= missionsInThisOperation - 1;
        const isLastOperationInTour = tour.currentMissionIndex >= tour.missions.length - 1;
        
        // Show squad management dialog unless this is the very last mission of the entire tour
        const isVeryLastMission = isLastMissionInOperation && isLastOperationInTour;
        
        if (!isVeryLastMission) {
            // First increment mission indices to point to the NEXT mission
            this.incrementMissionIndices();
            
            // Now show squad management for the upcoming mission
            const proceed = await this.showSquadManagementDialog();
            if (!proceed) return;
            
            // Capture squad composition after squad management is complete (deep copy)
            this.currentMissionSquad = this.getActiveSquadMembers().map(member => ({...member}));
            console.log('Squad captured after squad management:', this.currentMissionSquad.map(m => m.name));
            
            // Display the mission
            this.displayMissionAfterSquadManagement();
        } else {
            // No squad management needed, just proceed normally
            this.proceedToNextMission();
        }
    }

    // Helper function to increment mission indices without display logic
    incrementMissionIndices() {
        const tour = this.currentTour;
        
        if (this.isImportedCampaign()) {
            // For imported campaigns, advance absolute mission index
            this.currentAbsoluteMissionIndex++;
            
            // Update operation tracking based on the mission's operationName
            const currentMission = tour.missions[this.currentAbsoluteMissionIndex];
            const previousMission = tour.missions[this.currentAbsoluteMissionIndex - 1];
            
            if (currentMission && previousMission) {
                // Check if we moved to a new operation
                if (currentMission.operationName !== previousMission.operationName) {
                    tour.currentMissionIndex++;
                    this.currentMissionInOperation = 0;
                } else {
                    this.currentMissionInOperation++;
                }
            }
        } else {
            // Original logic for generated campaigns
            // Check if we need to move to next mission within operation or next operation
            this.currentMissionInOperation++;
            
            // Get current operation's difficulty to determine how many missions it should have
            const currentOperation = tour.missions[tour.currentMissionIndex];
            const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
            
            if (this.currentMissionInOperation >= missionsInThisOperation) {
                // Move to next operation
                this.currentMissionInOperation = 0;
                tour.currentMissionIndex++;
            }
        }
    }

    // Helper function to display mission after squad management
    displayMissionAfterSquadManagement() {
        const tour = this.currentTour;
        
        // Check if tour is completed based on campaign type
        const isCompleted = this.isImportedCampaign() ? 
            this.currentAbsoluteMissionIndex >= tour.missions.length :
            tour.currentMissionIndex >= tour.missions.length;
            
        if (isCompleted) {
            // Tour completed!
            this.completeTour();
            return;
        }
        
        // Update dual progress indicators
        this.updateDualProgressIndicators(tour, true);
        
        // Check if we moved to a new operation
        if (this.currentMissionInOperation === 0) {
            // Show briefing for next operation
            this.displayNextMissionBriefing();
        } else {
            // Still missions remaining in current operation
            this.displayCurrentTourMission();
        }
    }

    // Legacy method for compatibility
    handleConfirmCasualties() {
        this.handleConfirmStats();
    }

    handleNoCasualties() {
        this.hideDeathTrackingDialog();
        this.proceedToNextMission();
    }

    showStatsTrackingDialog() {
        if (!this.statsMode || !this.squadMembers.length) {
            this.proceedToNextMission();
            return;
        }

        // Update current mission squad to include any newly added members
        this.currentMissionSquad = this.getActiveSquadMembers().map(member => ({...member}));

        const dialog = document.getElementById('stats-tracking-dialog');
        const statsContainer = document.getElementById('stats-inputs-container');
        const tour = this.currentTour;
        
        // Update dialog title to show current mission context
        const title = document.getElementById('stats-dialog-title');
        const description = document.getElementById('stats-dialog-description');
        if (title) {
            const currentOperation = tour.missions[tour.currentMissionIndex];
            const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
            title.textContent = `Operation ${tour.currentMissionIndex + 1}, Mission ${this.currentMissionInOperation + 1} of ${missionsInThisOperation}: Statistics`;
        }
        if (description) {
            description.textContent = `Enter statistics for each squad member during this mission (leave blank to skip):`;
        }
        
        // Clear existing inputs
        statsContainer.innerHTML = '';
        
        // Generate stats inputs for the current operation
        this.generateStatsInputs(statsContainer);
        
        dialog.style.display = 'block';
    }

    generateStatsInputs(container) {
        const tour = this.currentTour;
        const currentOperation = tour.missions[tour.currentMissionIndex];
        const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
        const missionInOp = this.currentMissionInOperation + 1;
        
        // Only show stats for squad members who participated in this mission
        const activeMembers = this.currentMissionSquad.length > 0 ? this.currentMissionSquad : this.getActiveSquadMembers();
        console.log('Stats dialog - currentMissionSquad:', this.currentMissionSquad.map(m => m.name));
        console.log('Stats dialog - current active members:', this.getActiveSquadMembers().map(m => m.name));
        console.log('Stats dialog - using members:', activeMembers.map(m => m.name));
        
        // Create stats input for each active squad member
        activeMembers.forEach((member, memberIndex) => {
            // Create member section
            const memberSection = document.createElement('div');
            memberSection.className = 'member-stats-section';
            
            const memberHeader = document.createElement('h4');
            memberHeader.className = 'member-stats-header';
            memberHeader.textContent = member.name;
            memberSection.appendChild(memberHeader);
            
            // Create stats inputs for this single mission only
            const missionDiv = document.createElement('div');
            missionDiv.className = 'mission-stats';
            
            const missionHeader = document.createElement('h5');
            missionHeader.className = 'mission-stats-header';
            missionHeader.textContent = `Operation ${tour.currentMissionIndex + 1}, Mission ${missionInOp}`;
            missionDiv.appendChild(missionHeader);
            
            const statsGrid = document.createElement('div');
            statsGrid.className = 'stats-input-grid';
            
            // Store the actual squad member index for this active member
            const actualMemberIndex = this.squadMembers.findIndex(m => m.name === member.name);
            
            // Kills input
            const killsLabel = document.createElement('label');
            killsLabel.textContent = 'Kills:';
            const killsInput = document.createElement('input');
            killsInput.type = 'number';
            killsInput.className = 'stats-input kills-input';
            killsInput.placeholder = '0';
            killsInput.min = '0';
            killsInput.max = '9999';
            killsInput.dataset.memberIndex = actualMemberIndex;
            killsInput.dataset.statType = 'kills';
            
            // Samples input
            const samplesLabel = document.createElement('label');
            samplesLabel.textContent = 'Samples:';
            const samplesInput = document.createElement('input');
            samplesInput.type = 'number';
            samplesInput.className = 'stats-input samples-input';
            samplesInput.placeholder = '0';
            samplesInput.min = '0';
            samplesInput.max = '999';
            samplesInput.dataset.memberIndex = actualMemberIndex;
            samplesInput.dataset.statType = 'samples';
            
            // Deaths input
            const deathsLabel = document.createElement('label');
            deathsLabel.textContent = 'Deaths:';
            const deathsInput = document.createElement('input');
            deathsInput.type = 'number';
            deathsInput.className = 'stats-input deaths-input';
            deathsInput.placeholder = '0';
            deathsInput.min = '0';
            deathsInput.max = '50';
            deathsInput.dataset.memberIndex = actualMemberIndex;
            deathsInput.dataset.statType = 'deaths';
            
            // Add inputs to grid
            statsGrid.appendChild(killsLabel);
            statsGrid.appendChild(killsInput);
            statsGrid.appendChild(samplesLabel);
            statsGrid.appendChild(samplesInput);
            statsGrid.appendChild(deathsLabel);
            statsGrid.appendChild(deathsInput);
            
            missionDiv.appendChild(statsGrid);
            memberSection.appendChild(missionDiv);
            
            container.appendChild(memberSection);
        });
    }

    hideStatsTrackingDialog() {
        const dialog = document.getElementById('stats-tracking-dialog');
        dialog.style.display = 'none';
    }

    // Legacy method for compatibility
    hideDeathTrackingDialog() {
        this.hideStatsTrackingDialog();
    }



    proceedToNextMission() {
        const tour = this.currentTour;
        
        // Check if we need to move to next mission within operation or next operation
        this.currentMissionInOperation++;
        
        // Get current operation's difficulty to determine how many missions it should have
        const currentOperation = tour.missions[tour.currentMissionIndex];
        const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
        
        if (this.currentMissionInOperation >= missionsInThisOperation) {
            // Move to next operation
            this.currentMissionInOperation = 0;
            const completedOperationIndex = tour.currentMissionIndex;
            tour.currentMissionIndex++;
            
            if (tour.currentMissionIndex >= tour.missions.length) {
                // Tour completed!
                this.completeTour();
                return;
            }
            
            // Update dual progress indicators for new operation
            this.updateDualProgressIndicators(tour, true);
            
            // Show briefing for next operation
            this.displayNextMissionBriefing();
        } else {
            // Still missions remaining in current operation, update progress and show next mission
            this.updateDualProgressIndicators(tour, true);
            this.displayCurrentTourMission();
        }
    }


    displayTransitionBriefing(transitionText) {
        // Show transition text in briefing format
        const briefingSection = document.getElementById('democracy-briefing');
        const briefingContent = document.getElementById('briefing-content');
        const currentMissionDisplay = document.getElementById('current-mission-display');
        
        briefingContent.innerHTML = transitionText;
        briefingSection.style.display = 'block';
        currentMissionDisplay.style.display = 'none';
        
        // Change the acknowledge button to "Continue to Next Mission"
        const acknowledgeBriefingBtn = document.getElementById('acknowledge-briefing');
        if (acknowledgeBriefingBtn) {
            acknowledgeBriefingBtn.textContent = 'Continue to Next Mission';
            // Store original handler and add temporary one
            acknowledgeBriefingBtn._originalHandler = acknowledgeBriefingBtn.onclick;
            acknowledgeBriefingBtn.onclick = () => {
                // Restore original button text and handler
                acknowledgeBriefingBtn.textContent = 'Acknowledged, Sir!';
                acknowledgeBriefingBtn.onclick = acknowledgeBriefingBtn._originalHandler;
                // Now show the next mission briefing
                this.displayNextMissionBriefing();
            };
        }
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
            
            // For themed campaigns (like Major Order), get the themed planets
            if (preferences.tourTheme && preferences.tourTheme !== 'random') {
                const gameData = await apiService.getAllGameData();
                this.lastGameData = gameData; // Store for campaign builder
                const campaignTheme = await this.selectCampaignTheme(gameData.planets, preferences);
                
                if (campaignTheme && campaignTheme.planets) {
                    preferences.themedPlanets = campaignTheme.planets;
                    console.log(`Using ${campaignTheme.planets.length} themed planets for ${campaignTheme.type} campaign`);
                }
            }
            
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
        const squadMembers = [];
        for (let i = 1; i <= 4; i++) {
            const name = document.getElementById(`squad-member-${i}`)?.value.trim() || '';
            if (name) squadMembers.push(name);
        }

        return {
            length: document.getElementById('campaign-length')?.value || 'random',
            faction: document.getElementById('faction-preference')?.value || 'random',
            difficulty: document.getElementById('difficulty-preference')?.value || 'random',
            biome: document.getElementById('biome-preference')?.value || 'random',
            missionType: document.getElementById('mission-type-preference')?.value || 'both',
            targetType: document.getElementById('target-type-preference')?.value || 'mixed',
            statsMode: this.statsMode,
            squadMembers: squadMembers,
            // Custom campaign name
            customCampaignName: document.getElementById('custom-campaign-name')?.value?.trim() || '',
            // Tour preferences
            tourLength: document.getElementById('tour-length')?.value || 'regular',
            customTourLength: parseInt(document.getElementById('custom-tour-length-input')?.value) || 6,
            tourTheme: document.getElementById('tour-theme')?.value || 'random',
            tourFaction: document.getElementById('tour-faction')?.value || 'random',
            tourDifficulty: document.getElementById('tour-difficulty')?.value || 'all',
            tourFactionPreference: document.getElementById('tour-faction-preference')?.value || 'any',
            tourMissionTypePreference: document.getElementById('tour-mission-type-preference')?.value || 'either',
            tourPlanet: document.getElementById('tour-planet')?.value || 'random',
            tourSector: document.getElementById('tour-sector')?.value || 'random',
            // Custom theme filters
            customPlanets: this.getSelectedCustomFilters('planet'),
            customSectors: this.getSelectedCustomFilters('sector'),
            customFactions: this.getSelectedCustomFilters('faction')
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

        const descriptionElement = document.getElementById('campaign-description');
        if (descriptionElement) {
            if (campaign.description && campaign.description.trim()) {
                descriptionElement.textContent = campaign.description;
                descriptionElement.style.display = 'block';
            } else {
                descriptionElement.style.display = 'none';
            }
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

    createMissionCard(mission, index, missionKey = null) {
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
                    <div class="detail-value">${mission.isDefense ? 'Defense Operation' : 'Liberation Operation'}</div>
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
                <h4>Primary Objective: ${mission.customPrimaryTitle || mission.primaryObjective.name || 'Unknown'}</h4>
                <ul>
                    <li>${mission.customPrimaryDescription || mission.primaryObjective.description}</li>
                </ul>
                
                <h4>Secondary Objectives</h4>
                <ul>
                    ${mission.customSecondaryDescription ? 
                        mission.customSecondaryDescription.split('\n').map(line => line.trim()).filter(line => line).map(line => `<li>${line}</li>`).join('') : 
                        mission.secondaryObjectives.map(obj => `<li>${obj.description}</li>`).join('')
                    }
                </ul>
                
                ${(missionKey && mission.missionModifiers && mission.missionModifiers[missionKey]) ? `
                <h4>Mission Modifier</h4>
                <div class="mission-modifier">
                    <strong>${mission.missionModifiers[missionKey].name}:</strong> ${mission.missionModifiers[missionKey].description}
                </div>
                ` : (mission.modifier ? `
                <h4>Operation Modifier</h4>
                <div class="mission-modifier">
                    <strong>${mission.modifier.name}:</strong> ${mission.modifier.description}
                </div>
                ` : '')}
                
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

    showLoading(customMessage) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'block';
            
            // Update loading message if custom message is provided
            if (customMessage) {
                const loadingText = loading.querySelector('p');
                if (loadingText) {
                    loadingText.textContent = customMessage;
                }
            }
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
            
            // Restore default loading message
            const loadingText = loading.querySelector('p');
            if (loadingText) {
                loadingText.textContent = 'Fetching live galactic war data...';
            }
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
            if (key === 'statsMode') {
                this.statsMode = this.preferences[key] || false;
                const checkbox = document.getElementById('stats-mode-checkbox');
                if (checkbox) {
                    checkbox.checked = this.statsMode;
                    // Trigger the toggle to show/hide related elements
                    this.handleStatsModeToggle({ target: checkbox });
                }
            } else if (key === 'squadMembers') {
                const names = this.preferences[key] || [];
                for (let i = 0; i < 4; i++) {
                    const input = document.getElementById(`squad-member-${i + 1}`);
                    if (input) {
                        input.value = names[i] || '';
                    }
                }
            } else if (key === 'customTourLength') {
                const element = document.getElementById('custom-tour-length-input');
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                }
            } else if (key === 'customCampaignName') {
                const element = document.getElementById('custom-campaign-name');
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                }
            } else if (key === 'tourLength') {
                const element = document.getElementById('tour-length');
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                    // Trigger change event for custom tour length
                    element.dispatchEvent(new Event('change'));
                }
            } else if (key.startsWith('custom')) {
                // Handle custom filter preferences
                this.applyCustomFilterPreferences(key, this.preferences[key]);
            } else if (key.startsWith('tour')) {
                // Handle other tour preferences
                const elementId = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                const element = document.getElementById(elementId);
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                }
            } else {
                const element = document.getElementById(`${key === 'length' ? 'campaign-length' : key + '-preference'}`);
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                    
                    // Trigger change event for custom length
                    if (key === 'length') {
                        element.dispatchEvent(new Event('change'));
                    }
                }
            }
        });

    }

    // Initialize preferences when DOM is ready
    initializePreferences() {
        this.applyPreferences();
        this.loadPreferencesVisibility();
        this.initializePermanentTourMode();
        // Start background data loading
        this.initializeBackgroundDataLoading();
    }
    
    initializePermanentTourMode() {
        // Force tour mode to be enabled and properly displayed
        const tourCheckbox = document.getElementById('tour-mode-checkbox');
        if (tourCheckbox) {
            tourCheckbox.checked = true;
        }
        
        // Force the UI to match permanent tour mode
        this.handleTourModeToggle({ target: { checked: true } });
        
        // Initialize tour theme visibility based on current selection
        const tourThemeSelect = document.getElementById('tour-theme');
        if (tourThemeSelect) {
            this.handleTourThemeChange({ target: tourThemeSelect });
        }
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

    // Background Data Loading
    async initializeBackgroundDataLoading() {
        if (this.backgroundDataLoading || this.backgroundDataReady) {
            return; // Already loading or loaded
        }

        this.backgroundDataLoading = true;
        this.backgroundDataReady = false;
        this.backgroundDataError = null;

        // Show loading indicator
        const indicator = document.getElementById('background-loading-indicator');
        if (indicator) {
            indicator.style.display = 'inline-block';
        }

        try {
            console.log('🔄 Starting background data loading...');
            await apiService.getAllGameData();
            this.backgroundDataReady = true;
            console.log('✅ Background data loading completed successfully');
        } catch (error) {
            this.backgroundDataError = error;
            console.warn('⚠️ Background data loading failed:', error.message);
            // Don't show error to user - this is silent background loading
        } finally {
            this.backgroundDataLoading = false;
            
            // Hide loading indicator
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    // Tour of War Methods
    async handleStartTour() {
        try {
            // Check if background data is ready
            if (!this.backgroundDataReady) {
                // Show loading screen since data isn't ready yet
                this.showLoading();
                
                if (this.backgroundDataLoading) {
                    // Background loading is in progress, wait for it
                    console.log('⏳ Waiting for background data loading to complete...');
                    while (this.backgroundDataLoading) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                } else if (this.backgroundDataError) {
                    // Background loading failed, retry now
                    console.log('🔄 Background loading failed, retrying now...');
                    await this.initializeBackgroundDataLoading();
                } else {
                    // Background loading hasn't started, start it now
                    console.log('🔄 Starting data loading now...');
                    await this.initializeBackgroundDataLoading();
                }
            }
            
            this.hideError();
            
            const tourPreferences = this.getTourPreferences();
            console.log('Tour preferences:', tourPreferences);
            
            // Validate custom theme selections before generating tour
            if (tourPreferences.tourTheme === 'custom') {
                const hasValidCustomSelection = this.validateCustomFilters();
                if (!hasValidCustomSelection) {
                    throw new Error('Custom theme requires at least one specific filter selection. Please select planets, sectors, or factions before starting your tour.');
                }
            }
            
            const tour = await this.generateTour(tourPreferences);
            
            if (tour) {
                this.currentTour = tour;
                // Reset tracking variables for new tour
                this.currentMissionInOperation = 0;
                this.currentAbsoluteMissionIndex = 0;
                
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
        
        // Initialize squad members if Stats mode is enabled
        if (this.statsMode) {
            this.initializeSquadMembers();
        }
        
        // Get live game data
        const gameData = await apiService.getAllGameData();
        this.lastGameData = gameData; // Store for campaign builder
        const planets = gameData.planets;
        
        if (!planets || planets.length === 0) {
            throw new Error('No planet data available');
        }

        // Select campaign theme based on user preference
        const campaignTheme = await this.selectCampaignTheme(planets, preferences);
        console.log('Selected campaign theme:', campaignTheme);

        // Determine tour length based on theme
        const tourLength = this.determineTourLength(preferences.tourLength);
        
        // Generate themed missions
        const missions = await this.generateThemedTourMissions(planets, tourLength, preferences, campaignTheme);
        
        if (missions.length === 0) {
            throw new Error('Failed to generate any missions');
        }

        // Generate tour narrative based on theme
        let tourName;
        
        // Check if user provided custom campaign name
        const customName = preferences.customCampaignName?.trim();
        if (customName) {
            tourName = customName;
        } else {
            tourName = this.generateThemedTourName(campaignTheme);
            
            // Add theme-specific info to tour name for debugging
            if (campaignTheme.selectedBiome) {
                tourName += ` (${campaignTheme.selectedBiome})`;
            } else if (campaignTheme.selectedBiomeGroup) {
                tourName += ` (${this.getBiomeGroupName(campaignTheme.selectedBiomeGroup)} Group)`;
            }
        }
        
        const tour = {
            name: tourName,
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

    async selectCampaignTheme(planets, preferences) {
        const enemyPlanets = apiService.getEnemyPlanets(planets);
        const availableFactions = apiService.getAvailableFactions(enemyPlanets);
        
        // Handle Major Order theme first
        if (preferences.tourTheme === 'major_order') {
            const majorOrderDetails = await apiService.getMajorOrderDetails();
            const majorOrderPlanets = await apiService.getMajorOrderPlanets();
            
            if (majorOrderDetails && majorOrderPlanets.length > 0) {
                return {
                    type: 'major_order',
                    name: 'Major Order Campaign',
                    majorOrderDetails: majorOrderDetails,
                    planets: majorOrderPlanets,
                    weight: 100
                };
            } else {
                throw new Error('Major Order theme is not currently available. No active Major Order or no eligible planets found. Please select a different theme.');
            }
        }

        // Handle Custom theme with priority filtering
        if (preferences.tourTheme === 'custom') {
            console.log('Processing custom theme with preferences:', preferences);
            
            // Validate that at least one filter is set
            const hasCustomSelections = 
                (preferences.customPlanets && preferences.customPlanets.length > 0 && !preferences.customPlanets.every(p => p === 'all')) ||
                (preferences.customSectors && preferences.customSectors.length > 0 && !preferences.customSectors.every(s => s === 'all')) ||
                (preferences.customFactions && preferences.customFactions.length > 0 && !preferences.customFactions.every(f => f === 'all'));
                
            if (!hasCustomSelections) {
                throw new Error('Custom theme requires at least one specific filter selection (planets, sectors, or factions). Please make your selections and try again.');
            }
            
            const customThemedPlanets = this.selectCustomThemedPlanets(enemyPlanets, preferences);
            
            if (customThemedPlanets.length === 0) {
                throw new Error('Custom theme configuration resulted in no available planets. Please adjust your filter selections.');
            }
            
            console.log(`Custom theme selected ${customThemedPlanets.length} planets:`, customThemedPlanets.map(p => p.name));
            
            return {
                type: 'custom',
                name: 'Custom Campaign',
                planets: customThemedPlanets,
                weight: 100,
                customFilters: {
                    planets: preferences.customPlanets || [],
                    sectors: preferences.customSectors || [],
                    factions: preferences.customFactions || []
                }
            };
        }
        
        // Filter planets by faction preference if specified
        let filteredPlanets = enemyPlanets;
        if (preferences.tourFactionPreference && preferences.tourFactionPreference !== 'any') {
            filteredPlanets = enemyPlanets.filter(planet => 
                apiService.getCurrentEnemy(planet) === preferences.tourFactionPreference
            );
        }
        
        // Define campaign themes with their availability conditions
        const themes = [
            {
                type: 'single_planet',
                name: 'Planetary Conquest',
                weight: 20,
                condition: () => filteredPlanets.length >= 1
            },
            {
                type: 'sector_campaign', 
                name: 'Sector Liberation',
                weight: 15,
                condition: () => this.getSectorsWithMultiplePlanets(filteredPlanets).length > 0
            },
            {
                type: 'faction_focused',
                name: 'Faction Elimination',
                weight: 25,
                condition: () => {
                    if (preferences.tourTheme === 'faction_focused' && preferences.tourFaction !== 'random') {
                        // Check if the specific faction is available
                        return availableFactions.includes(preferences.tourFaction);
                    }
                    // For faction focused themes, we need at least one planet
                    return filteredPlanets.length >= 1;
                }
            },
            {
                type: 'biome_specific',
                name: 'Environmental Campaign',
                weight: 15,
                condition: () => this.getBiomesWithMultiplePlanets(filteredPlanets).length > 0
            },
            {
                type: 'biome_group_themed',
                name: 'Biome Mastery Campaign',
                weight: 20,
                condition: () => apiService.getBiomeGroupsWithMultiplePlanets(filteredPlanets).length > 0
            }
        ];

        // If user selected a specific theme (not random), try to use it
        if (preferences.tourTheme && preferences.tourTheme !== 'random') {
            const requestedTheme = themes.find(theme => theme.type === preferences.tourTheme);
            if (requestedTheme && requestedTheme.condition()) {
                const selectedTheme = { ...requestedTheme };
                
                // For faction_focused theme, store the user's faction preference
                if (preferences.tourTheme === 'faction_focused' && preferences.tourFaction !== 'random') {
                    selectedTheme.selectedFaction = preferences.tourFaction;
                }
                
                // If user has a faction preference and theme is faction-focused, use that preference
                if (selectedTheme.type === 'faction_focused' && preferences.tourFactionPreference && preferences.tourFactionPreference !== 'any') {
                    selectedTheme.selectedFaction = preferences.tourFactionPreference;
                }
                
                return selectedTheme;
            } else {
                // Theme not available, throw an error to inform user
                const themeNames = {
                    'major_order': 'Major Order',
                    'single_planet': 'Single Planet Conquest',
                    'sector_campaign': 'Sector Campaign', 
                    'faction_focused': 'Faction Focus',
                    'biome_specific': 'Environmental Focus',
                    'biome_group_themed': 'Biome Group Focus',
                    'custom': 'Custom Theme'
                };
                
                const themeName = themeNames[preferences.tourTheme] || preferences.tourTheme;
                
                if (preferences.tourTheme === 'faction_focused' && preferences.tourFaction !== 'random') {
                    throw new Error(`${themeName} theme with ${preferences.tourFaction} faction is not currently available. No ${preferences.tourFaction} planets found in the current galactic war state.`);
                } else {
                    throw new Error(`${themeName} theme is not currently available based on the current galactic war state.`);
                }
            }
        }

        // Random theme selection (original logic)
        let availableThemes = themes.filter(theme => theme.condition());
        
        // If user selected a specific faction preference, boost weights for single-faction themes
        if (preferences.tourFactionPreference && preferences.tourFactionPreference !== 'any') {
            availableThemes = availableThemes.map(theme => {
                // These themes work well with single faction preference
                if (['single_planet', 'sector_campaign', 'faction_focused', 'biome_specific', 'biome_group_themed'].includes(theme.type)) {
                    return { ...theme, weight: theme.weight * 1.5 };
                }
                return theme;
            });
        }
        
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
                const selectedTheme = { ...theme };
                
                // If faction_focused theme is selected and user has faction preference, use it
                if (selectedTheme.type === 'faction_focused' && preferences.tourFactionPreference && preferences.tourFactionPreference !== 'any') {
                    selectedTheme.selectedFaction = preferences.tourFactionPreference;
                }
                
                return selectedTheme;
            }
        }
        
        const fallbackTheme = { ...availableThemes[0] };
        
        // Apply faction preference to fallback theme if applicable
        if (fallbackTheme.type === 'faction_focused' && preferences.tourFactionPreference && preferences.tourFactionPreference !== 'any') {
            fallbackTheme.selectedFaction = preferences.tourFactionPreference;
        }
        
        return fallbackTheme;
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

    async populateCustomFilters() {
        try {
            const gameData = await apiService.getAllGameData();
            this.lastGameData = gameData;
            const planets = gameData.planets;
            
            const enemyPlanets = apiService.getEnemyPlanets(planets);
            
            this.populateCustomPlanetsFilter(enemyPlanets);
            this.populateCustomSectorsFilter(enemyPlanets);
            
            console.log(`Populated custom filters with ${enemyPlanets.length} available planets`);
            
        } catch (error) {
            console.error('Error populating custom filters:', error);
        }
    }

    populateCustomPlanetsFilter(planets) {
        const planetsContainer = document.getElementById('custom-planets-container');
        if (!planetsContainer) return;

        // Keep the "Any Available Planet" option and clear the rest
        const existingOptions = planetsContainer.querySelectorAll('.checkbox-item:not(:first-child)');
        existingOptions.forEach(option => option.remove());

        // Sort planets alphabetically
        const sortedPlanets = [...planets].sort((a, b) => a.name.localeCompare(b.name));

        // Add planet checkboxes
        sortedPlanets.forEach(planet => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const faction = apiService.getCurrentEnemy(planet);
            const checkboxId = `custom-planet-${planet.id}`;
            
            checkboxItem.innerHTML = `
                <input type="checkbox" id="${checkboxId}" value="${planet.id}" data-name="${planet.name}" data-faction="${faction}" data-sector="${planet.sector}">
                <label for="${checkboxId}">${planet.name} (${faction} - ${planet.sector})</label>
            `;
            
            planetsContainer.appendChild(checkboxItem);
        });
    }

    populateCustomSectorsFilter(planets) {
        const sectorsContainer = document.getElementById('custom-sectors-container');
        if (!sectorsContainer) return;

        // Keep the "Any Available Sector" option and clear the rest
        const existingOptions = sectorsContainer.querySelectorAll('.checkbox-item:not(:first-child)');
        existingOptions.forEach(option => option.remove());

        // Get unique sectors with planet counts
        const sectorCounts = {};
        const sectorFactions = {};

        planets.forEach(planet => {
            const sector = planet.sector || 'Unknown Sector';
            const faction = apiService.getCurrentEnemy(planet);
            
            sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
            
            if (!sectorFactions[sector]) {
                sectorFactions[sector] = new Set();
            }
            sectorFactions[sector].add(faction);
        });

        // Sort sectors alphabetically
        const sortedSectors = Object.keys(sectorCounts).sort((a, b) => a.localeCompare(b));

        // Add sector checkboxes
        sortedSectors.forEach(sector => {
            const checkboxItem = document.createElement('div');
            checkboxItem.className = 'checkbox-item';
            
            const planetCount = sectorCounts[sector];
            const factions = Array.from(sectorFactions[sector]).join(', ');
            const checkboxId = `custom-sector-${sector.replace(/\s+/g, '-').toLowerCase()}`;
            
            checkboxItem.innerHTML = `
                <input type="checkbox" id="${checkboxId}" value="${sector}" data-factions="${factions}">
                <label for="${checkboxId}">${sector} (${planetCount} planet${planetCount !== 1 ? 's' : ''} - ${factions})</label>
            `;
            
            sectorsContainer.appendChild(checkboxItem);
        });
    }

    setupCustomFilterListeners() {
        // Add event listeners for all custom filter checkboxes
        const planetsContainer = document.getElementById('custom-planets-container');
        const sectorsContainer = document.getElementById('custom-sectors-container');
        const factionsContainer = document.getElementById('custom-factions-container');

        if (planetsContainer) {
            planetsContainer.addEventListener('change', (e) => {
                this.handleCustomFilterChange(e, 'planet');
            });
        }

        if (sectorsContainer) {
            sectorsContainer.addEventListener('change', (e) => {
                this.handleCustomFilterChange(e, 'sector');
            });
        }

        if (factionsContainer) {
            factionsContainer.addEventListener('change', (e) => {
                this.handleCustomFilterChange(e, 'faction');
            });
        }
    }

    handleCustomFilterChange(event, filterType) {
        const checkbox = event.target;
        if (checkbox.type !== 'checkbox') return;

        const isAllOption = checkbox.value === 'all';
        const container = checkbox.closest('.checkbox-container');
        
        if (isAllOption) {
            // If "All" option is checked/unchecked, update all other checkboxes in the same container
            const otherCheckboxes = container.querySelectorAll('input[type="checkbox"]:not([value="all"])');
            otherCheckboxes.forEach(cb => {
                cb.checked = false;
                cb.disabled = checkbox.checked;
            });
        } else {
            // If a specific option is checked, uncheck the "All" option
            const allCheckbox = container.querySelector('input[value="all"]');
            if (allCheckbox) {
                allCheckbox.checked = false;
            }
        }

        // Update cascading filters based on priority system
        this.updateCascadingFilters();
        this.validateCustomFilters();
        this.savePreferences();
    }

    updateCascadingFilters() {
        // Planets > Sectors > Factions priority system
        const selectedPlanets = this.getSelectedCustomFilters('planet');
        const selectedSectors = this.getSelectedCustomFilters('sector');
        const selectedFactions = this.getSelectedCustomFilters('faction');

        // If specific planets are selected, filter sectors and update display
        if (selectedPlanets.length > 0 && !selectedPlanets.includes('all')) {
            this.updateSectorFiltersByPlanets(selectedPlanets);
        }
        
        // If sectors are selected (and no specific planets), filter planet display
        else if (selectedSectors.length > 0 && !selectedSectors.includes('all')) {
            this.updatePlanetFiltersBySectors(selectedSectors);
        }
        
        // If factions are selected (and no specific planets/sectors), filter both
        else if (selectedFactions.length > 0 && !selectedFactions.includes('all')) {
            this.updatePlanetFiltersByFactions(selectedFactions);
            this.updateSectorFiltersByFactions(selectedFactions);
        }
    }

    getSelectedCustomFilters(filterType) {
        const container = document.getElementById(`custom-${filterType}s-container`);
        if (!container) {
            console.warn(`Custom ${filterType} container not found`);
            return [];
        }

        const checkedBoxes = container.querySelectorAll('input[type="checkbox"]:checked');
        const selected = Array.from(checkedBoxes).map(cb => cb.value);
        console.log(`Selected custom ${filterType}s:`, selected);
        return selected;
    }

    updateSectorFiltersByPlanets(selectedPlanetIds) {
        if (!this.lastGameData) return;
        
        const planets = apiService.getEnemyPlanets(this.lastGameData.planets);
        const relevantSectors = new Set();
        
        selectedPlanetIds.forEach(planetId => {
            const planet = planets.find(p => p.id.toString() === planetId);
            if (planet) {
                relevantSectors.add(planet.sector);
            }
        });

        // Dim irrelevant sector options
        const sectorsContainer = document.getElementById('custom-sectors-container');
        const sectorCheckboxes = sectorsContainer.querySelectorAll('input[type="checkbox"]:not([value="all"])');
        
        sectorCheckboxes.forEach(checkbox => {
            const isRelevant = relevantSectors.has(checkbox.value);
            checkbox.parentElement.style.opacity = isRelevant ? '1' : '0.5';
            if (!isRelevant) {
                checkbox.checked = false;
            }
        });
    }

    updatePlanetFiltersBySectors(selectedSectors) {
        if (!this.lastGameData) return;
        
        const planets = apiService.getEnemyPlanets(this.lastGameData.planets);
        
        // Dim irrelevant planet options
        const planetsContainer = document.getElementById('custom-planets-container');
        const planetCheckboxes = planetsContainer.querySelectorAll('input[type="checkbox"]:not([value="all"])');
        
        planetCheckboxes.forEach(checkbox => {
            const planetSector = checkbox.dataset.sector;
            const isRelevant = selectedSectors.includes(planetSector);
            checkbox.parentElement.style.opacity = isRelevant ? '1' : '0.5';
            if (!isRelevant) {
                checkbox.checked = false;
            }
        });
    }

    updatePlanetFiltersByFactions(selectedFactions) {
        // Dim irrelevant planet options
        const planetsContainer = document.getElementById('custom-planets-container');
        const planetCheckboxes = planetsContainer.querySelectorAll('input[type="checkbox"]:not([value="all"])');
        
        planetCheckboxes.forEach(checkbox => {
            const planetFaction = checkbox.dataset.faction;
            const isRelevant = selectedFactions.includes(planetFaction);
            checkbox.parentElement.style.opacity = isRelevant ? '1' : '0.5';
            if (!isRelevant) {
                checkbox.checked = false;
            }
        });
    }

    updateSectorFiltersByFactions(selectedFactions) {
        // Dim irrelevant sector options based on faction presence
        const sectorsContainer = document.getElementById('custom-sectors-container');
        const sectorCheckboxes = sectorsContainer.querySelectorAll('input[type="checkbox"]:not([value="all"])');
        
        sectorCheckboxes.forEach(checkbox => {
            const sectorFactions = (checkbox.dataset.factions || '').split(', ');
            const hasRelevantFaction = sectorFactions.some(faction => selectedFactions.includes(faction));
            checkbox.parentElement.style.opacity = hasRelevantFaction ? '1' : '0.5';
            if (!hasRelevantFaction) {
                checkbox.checked = false;
            }
        });
    }

    validateCustomFilters() {
        const selectedPlanets = this.getSelectedCustomFilters('planet');
        const selectedSectors = this.getSelectedCustomFilters('sector');
        const selectedFactions = this.getSelectedCustomFilters('faction');

        const validationElement = document.getElementById('custom-filter-validation');
        
        // Check if at least one filter is selected (excluding "all" options)
        const hasSpecificSelections = 
            (selectedPlanets.length > 0 && !selectedPlanets.every(p => p === 'all')) ||
            (selectedSectors.length > 0 && !selectedSectors.every(s => s === 'all')) ||
            (selectedFactions.length > 0 && !selectedFactions.every(f => f === 'all'));

        if (validationElement) {
            if (hasSpecificSelections) {
                validationElement.style.display = 'none';
            } else {
                validationElement.style.display = 'block';
            }
        }

        return hasSpecificSelections;
    }

    applyCustomFilterPreferences(key, savedValues) {
        if (!Array.isArray(savedValues) || savedValues.length === 0) return;

        const filterType = key.replace('custom', '').toLowerCase();
        const container = document.getElementById(`custom-${filterType}-container`);
        
        if (!container) return;

        // Apply saved selections
        savedValues.forEach(value => {
            const checkbox = container.querySelector(`input[value="${value}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });

        // Update cascade and validation after applying preferences
        setTimeout(() => {
            this.updateCascadingFilters();
            this.validateCustomFilters();
        }, 100);
    }

    selectCustomThemedPlanets(allEnemyPlanets, preferences) {
        const selectedPlanets = preferences.customPlanets || [];
        const selectedSectors = preferences.customSectors || [];
        const selectedFactions = preferences.customFactions || [];

        console.log('Custom theme filters:', { selectedPlanets, selectedSectors, selectedFactions });

        // Priority system: Planets (highest) > Sectors (medium) > Factions (lowest)
        
        // Priority 1: If specific planets are selected, use only those
        if (selectedPlanets.length > 0 && !selectedPlanets.includes('all')) {
            const specificPlanets = allEnemyPlanets.filter(planet => 
                selectedPlanets.includes(planet.id.toString())
            );
            console.log(`Custom theme: Using ${specificPlanets.length} specific planets (Priority 1)`);
            return specificPlanets;
        }

        // Priority 2: If no specific planets but sectors are selected, filter by sectors
        if (selectedSectors.length > 0 && !selectedSectors.includes('all')) {
            let sectorFilteredPlanets = allEnemyPlanets.filter(planet => 
                selectedSectors.includes(planet.sector)
            );

            // Apply faction filter if also specified
            if (selectedFactions.length > 0 && !selectedFactions.includes('all')) {
                sectorFilteredPlanets = sectorFilteredPlanets.filter(planet => 
                    selectedFactions.includes(apiService.getCurrentEnemy(planet))
                );
            }
            
            console.log(`Custom theme: Using ${sectorFilteredPlanets.length} planets from selected sectors (Priority 2)`);
            return sectorFilteredPlanets;
        }

        // Priority 3: If only factions are selected (or "all" for planets/sectors), filter by factions
        if (selectedFactions.length > 0 && !selectedFactions.includes('all')) {
            const factionFilteredPlanets = allEnemyPlanets.filter(planet => 
                selectedFactions.includes(apiService.getCurrentEnemy(planet))
            );
            console.log(`Custom theme: Using ${factionFilteredPlanets.length} planets from selected factions (Priority 3)`);
            return factionFilteredPlanets;
        }

        // Fallback: If all filters are set to "all" or no filters selected, return all planets
        console.log(`Custom theme: No specific filters selected, using all ${allEnemyPlanets.length} available planets`);
        return allEnemyPlanets;
    }

    determineTourLength(tourLengthPreference) {
        // Handle custom tour length
        if (tourLengthPreference === 'custom') {
            const customTourLengthInput = document.getElementById('custom-tour-length-input');
            if (customTourLengthInput) {
                const customLength = parseInt(customTourLengthInput.value);
                if (customLength && customLength >= 1) {
                    return customLength;
                }
            }
            // Fallback to regular if custom input is invalid
            return 5;
        }

        const tourLengths = {
            'quick': { min: 1, max: 1 },
            'short': { min: 2, max: 3 },
            'regular': { min: 4, max: 6 },
            'long': { min: 7, max: 9 },
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

        // Filter planets by faction preference if specified
        let availablePlanets = enemyPlanets;
        if (preferences.tourFactionPreference && preferences.tourFactionPreference !== 'any') {
            availablePlanets = enemyPlanets.filter(planet => 
                apiService.getCurrentEnemy(planet) === preferences.tourFactionPreference
            );
            
            if (availablePlanets.length === 0) {
                throw new Error(`No planets available for ${preferences.tourFactionPreference} faction`);
            }
        }

        // Filter planets by mission type preference if specified
        if (preferences.tourMissionTypePreference && preferences.tourMissionTypePreference !== 'either') {
            const originalPlanetCount = availablePlanets.length;
            
            if (preferences.tourMissionTypePreference === 'liberation') {
                availablePlanets = availablePlanets.filter(planet => !planet.isDefense);
            } else if (preferences.tourMissionTypePreference === 'defense') {
                availablePlanets = availablePlanets.filter(planet => planet.isDefense);
            }
            
            // If no planets match the mission type filter, fall back to original available planets
            if (availablePlanets.length === 0) {
                console.warn(`No ${preferences.tourMissionTypePreference} missions available with current filters, falling back to mixed mission types`);
                availablePlanets = originalPlanetCount > 0 ? 
                    (preferences.tourFactionPreference && preferences.tourFactionPreference !== 'any' ? 
                        enemyPlanets.filter(planet => apiService.getCurrentEnemy(planet) === preferences.tourFactionPreference) : 
                        enemyPlanets) : 
                    enemyPlanets;
            }
        }


        // Get themed planet selection based on campaign theme
        const themedPlanets = this.selectThemedPlanets(availablePlanets, campaignTheme, tourLength, preferences);
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
            const scaledDifficulty = this.calculateScaledDifficulty(i, tourLength, preferences.tourDifficulty);
            
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

    selectThemedPlanets(availablePlanets, campaignTheme, tourLength, preferences) {
        switch (campaignTheme.type) {
            case 'major_order':
                // Use Major Order planets (already sorted by player count)
                return campaignTheme.planets || [];

            case 'custom':
                // Use pre-filtered custom themed planets
                return campaignTheme.planets || [];
                
            case 'single_planet':
                // Pick one planet for all missions (varying between planet/city)
                let singlePlanet;
                
                // Check if user selected a specific planet
                if (preferences && preferences.tourPlanet && preferences.tourPlanet !== 'random') {
                    // Find the selected planet by ID
                    singlePlanet = availablePlanets.find(planet => planet.id.toString() === preferences.tourPlanet);
                    
                    // If not found in filtered planets, try all enemy planets (in case filtering was too restrictive)
                    if (!singlePlanet) {
                        console.warn(`Selected planet not found in filtered list, searching all enemy planets`);
                        // We need to get the enemy planets here - this requires passing them or getting them again
                        // For now, fallback to random selection from available planets
                        singlePlanet = availablePlanets[Math.floor(Math.random() * availablePlanets.length)];
                    }
                } else {
                    // Random selection
                    singlePlanet = availablePlanets[Math.floor(Math.random() * availablePlanets.length)];
                }
                
                return Array(tourLength).fill(singlePlanet);
                
            case 'sector_campaign':
                // Pick planets from same sector, filtered by faction preference
                const factionPreference = preferences.tourFactionPreference || 'any';
                console.log(`Sector campaign: Using faction preference "${factionPreference}"`);
                
                // Get sectors filtered by both faction and capturable status
                const availableSectors = apiService.getSectorsFilteredByFactionAndCapturable(availablePlanets, factionPreference);
                console.log(`Available sectors for faction ${factionPreference}:`, availableSectors);
                
                if (availableSectors.length === 0) {
                    console.warn('No sectors available for the selected faction, falling back to general planet selection');
                    return availablePlanets;
                }
                
                // Check if user selected a specific sector
                let selectedSector;
                const userSelectedSector = preferences.tourSector || campaignTheme.selectedSector;
                if (userSelectedSector && userSelectedSector !== 'random') {
                    selectedSector = userSelectedSector;
                    console.log(`Using user-selected sector: ${selectedSector}`);
                } else {
                    // Random sector selection from available ones
                    selectedSector = availableSectors[Math.floor(Math.random() * availableSectors.length)];
                    console.log(`Randomly selected sector: ${selectedSector}`);
                }
                
                const sectorPlanets = availablePlanets.filter(planet => planet.sector === selectedSector);
                
                // Ensure we actually have planets for this sector theme
                if (sectorPlanets.length === 0) {
                    console.warn(`Sector ${selectedSector} has no available planets, falling back to general planet selection`);
                    return availablePlanets;
                }
                
                console.log(`Sector ${selectedSector} has ${sectorPlanets.length} available planets`);
                campaignTheme.selectedSector = selectedSector; // Store for narrative generation
                return sectorPlanets;
                
            case 'faction_focused':
                // Pick planets of same faction
                let selectedFaction;
                if (campaignTheme.selectedFaction) {
                    // Use user's faction preference
                    selectedFaction = campaignTheme.selectedFaction;
                } else {
                    // Random faction selection from available planets (respecting faction preference)
                    const availableFactions = apiService.getAvailableFactions(availablePlanets);
                    selectedFaction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
                }
                return availablePlanets.filter(planet => apiService.getCurrentEnemy(planet) === selectedFaction);
                
            case 'biome_specific':
                // Pick planets of same biome
                const biomesWithMultiple = this.getBiomesWithMultiplePlanets(availablePlanets);
                const selectedBiome = biomesWithMultiple[Math.floor(Math.random() * biomesWithMultiple.length)];
                campaignTheme.selectedBiome = selectedBiome; // Store for debugging
                return availablePlanets.filter(planet => apiService.getPlanetBiome(planet) === selectedBiome);
                
            case 'biome_group_themed':
                // Pick planets from same biome group (Sandy, Moor, Arctic, Primordial, Swamp)
                const biomeGroupsWithMultiple = apiService.getBiomeGroupsWithMultiplePlanets(availablePlanets);
                const selectedBiomeGroup = biomeGroupsWithMultiple[Math.floor(Math.random() * biomeGroupsWithMultiple.length)];
                campaignTheme.selectedBiomeGroup = selectedBiomeGroup; // Store for debugging
                return apiService.getPlanetsInBiomeGroup(availablePlanets, selectedBiomeGroup);
                
            default:
                return availablePlanets;
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

    calculateScaledDifficulty(missionIndex, totalMissions, difficultyPreference = 'all') {
        // Handle random difficulty selection
        if (difficultyPreference === 'random') {
            const options = ['easy', 'medium', 'hard', 'all'];
            difficultyPreference = options[Math.floor(Math.random() * options.length)];
        }

        // Define difficulty ranges
        const difficultyRanges = {
            'easy': { min: 1, max: 4 },
            'medium': { min: 3, max: 6 },
            'hard': { min: 6, max: 10 },
            'all': { min: 1, max: 10 }
        };

        const range = difficultyRanges[difficultyPreference] || difficultyRanges['all'];
        
        // Linear scaling within the selected range
        const progress = missionIndex / (totalMissions - 1);
        
        // Base difficulty scales from min to max within range
        const baseDifficulty = Math.round(range.min + progress * (range.max - range.min));
        
        // Random variation (smaller for constrained ranges)
        const rangeSize = range.max - range.min;
        const maxVariation = Math.max(1, Math.floor(rangeSize * 0.25)); // 25% of range size
        const variation = Math.floor(Math.random() * (maxVariation * 2 + 1)) - maxVariation;
        
        // Final difficulty with bounds
        const finalDifficulty = baseDifficulty + variation;
        return Math.max(range.min, Math.min(range.max, finalDifficulty));
    }

    getDifficultyName(level) {
        const names = {
            1: 'Trivial', 2: 'Easy', 3: 'Medium', 4: 'Challenging',
            5: 'Hard', 6: 'Extreme', 7: 'Suicide Mission',
            8: 'Impossible', 9: 'Helldive', 10: 'Super Helldive'
        };
        return names[level] || 'Unknown';
    }

    getMissionsPerOperation(difficulty) {
        // Based on Helldivers 2 actual structure:
        // Difficulty 1-2: 1 mission per operation
        // Difficulty 3-4: 2 missions per operation  
        // Difficulty 5-10: 3 missions per operation
        if (difficulty <= 2) return 1;
        if (difficulty <= 4) return 2;
        return 3;
    }

    generateMissionModifier() {
        // 20% chance to include a modifier per mission
        if (Math.random() < 0.2) {
            const modifiers = MISSION_TYPES.MODIFIERS;
            const randomIndex = Math.floor(Math.random() * modifiers.length);
            return modifiers[randomIndex];
        }
        return null;
    }

    updateDualProgressIndicators(tour, animated = true) {
        // Get the actual mission index and current operation for display
        const actualMissionIndex = this.isImportedCampaign() ? this.currentAbsoluteMissionIndex : tour.currentMissionIndex;
        const currentOperation = tour.missions[actualMissionIndex] || tour.missions[tour.currentMissionIndex];
        
        // For imported campaigns, calculate missions in operation from the mission's metadata
        let missionsInThisOperation;
        if (this.isImportedCampaign() && currentOperation) {
            // Count missions with the same operation name
            const currentOpName = currentOperation.operationName;
            missionsInThisOperation = tour.missions.filter(m => m.operationName === currentOpName).length;
        } else {
            missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
        }
        
        // Update campaign level progress
        const campaignProgressFill = document.getElementById('campaign-progress-fill');
        const currentMissionNumber = document.getElementById('current-mission-number');
        const totalMissions = document.getElementById('total-missions');
        
        // Update operation level progress  
        const operationProgressFill = document.getElementById('operation-progress-fill');
        const currentMissionInOperationEl = document.getElementById('current-mission-in-operation');
        const totalMissionsInOperation = document.getElementById('total-missions-in-operation');
        
        if (campaignProgressFill && currentMissionNumber && totalMissions) {
            // Calculate campaign progress percentage based on actual mission progress
            const campaignProgress = this.isImportedCampaign() ? 
                (this.currentAbsoluteMissionIndex / tour.missions.length) * 100 :
                (tour.currentMissionIndex / tour.missions.length) * 100;
            
            // Update text - show actual mission number for imported campaigns
            currentMissionNumber.textContent = this.isImportedCampaign() ? 
                this.currentAbsoluteMissionIndex + 1 :
                tour.currentMissionIndex + 1;
            totalMissions.textContent = tour.missions.length;
            
            // Animate progress bar if requested
            if (animated) {
                this.animateProgressBar(campaignProgressFill, campaignProgress);
            } else {
                campaignProgressFill.style.width = campaignProgress + '%';
            }
        }
        
        if (operationProgressFill && currentMissionInOperationEl && totalMissionsInOperation) {
            // Calculate operation progress percentage  
            const operationProgress = ((this.currentMissionInOperation + 1) / missionsInThisOperation) * 100;
            
            // Update text
            currentMissionInOperationEl.textContent = this.currentMissionInOperation + 1;
            totalMissionsInOperation.textContent = missionsInThisOperation;
            
            // Animate progress bar if requested
            if (animated) {
                this.animateProgressBar(operationProgressFill, operationProgress);
            } else {
                operationProgressFill.style.width = operationProgress + '%';
            }
        }
    }
    
    animateProgressBar(progressFill, targetPercentage) {
        // Add shimmer animation class
        progressFill.classList.add('animating');
        
        // Update progress bar width with CSS transition
        progressFill.style.width = targetPercentage + '%';
        
        // Remove shimmer animation after transition completes
        setTimeout(() => {
            progressFill.classList.remove('animating');
        }, 1000);
    }
    
    animateMissionProgression(isOperationComplete = false) {
        const missionContainer = document.getElementById('current-mission-container');
        const progressTexts = document.querySelectorAll('.progress-text');
        
        // Add progression animation to mission container
        missionContainer.classList.add('mission-progressing');
        
        // Add updating animation to progress texts
        progressTexts.forEach(text => text.classList.add('updating'));
        
        // Apply operation complete animation if this completes an operation
        if (isOperationComplete) {
            missionContainer.classList.add('operation-complete');
        }
        
        // Clean up animations after they complete
        setTimeout(() => {
            missionContainer.classList.remove('mission-progressing', 'operation-complete');
            progressTexts.forEach(text => text.classList.remove('updating'));
        }, 1500);
    }

    planetHasAvailableRegions(planet) {
        return (planet.availableRegions && planet.availableRegions.length > 0) ||
               (planet.activeRegions && planet.activeRegions.length > 0) ||
               (planet.regions && planet.regions.filter(r => r.isAvailable).length > 0);
    }

    generateThemedTourName(campaignTheme) {
        const themeNames = {
            'major_order': [
                'Major Order: Priority Objectives',
                'Major Order: Strategic Deployment',
                'Major Order: Critical Operations',
                'Major Order: Command Directive'
            ],
            'single_planet': [
                'Operation: Planetary Conquest',
                'Campaign: World Cleansing', 
                'Operation: Total Liberation',
                'Operation: Planetary Domination'
            ],
            'sector_campaign': [
                'Operation: Sector Liberation',
                'Campaign: Regional Control',
                'Operation: Sector Cleansing',
                'Operation: Zone Domination'
            ],
            'faction_focused': [
                'Operation: Species Elimination',
                'Campaign: Faction Purge',
                'Operation: Enemy Eradication',
                'Operation: Threat Neutralization'
            ],
            'biome_specific': [
                'Operation: Environmental Adaptation',
                'Campaign: Terrain Mastery',
                'Operation: Climate Conquest',
                'Operation: Biome Domination'
            ],
            'biome_group_themed': [
                'Operation: Environmental Mastery',
                'Campaign: Biome Conquest',
                'Operation: Terrain Domination',
                'Operation: Climate Warfare'
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

    getBiomeGroupName(biomeGroup) {
        const biomeGroupNames = {
            'Sandy': 'Sandy',
            'Moor': 'Moor',
            'Arctic': 'Arctic',
            'Primordial': 'Primordial',
            'Swamp': 'Swamp',
            'Unknown': 'Mixed'
        };
        
        return biomeGroupNames[biomeGroup] || biomeGroup || 'Mixed';
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
            tourLength: document.getElementById('tour-length')?.value || 'regular',
            customTourLength: parseInt(document.getElementById('custom-tour-length-input')?.value) || 6,
            tourTheme: document.getElementById('tour-theme')?.value || 'random',
            tourFaction: document.getElementById('tour-faction')?.value || 'random',
            tourDifficulty: document.getElementById('tour-difficulty')?.value || 'all',
            tourFactionPreference: document.getElementById('tour-faction-preference')?.value || 'any',
            tourMissionTypePreference: document.getElementById('tour-mission-type-preference')?.value || 'either',
            tourPlanet: document.getElementById('tour-planet')?.value || 'random',
            tourSector: document.getElementById('tour-sector')?.value || 'random',
            // Custom theme filters
            customPlanets: this.getSelectedCustomFilters('planet'),
            customSectors: this.getSelectedCustomFilters('sector'),
            customFactions: this.getSelectedCustomFilters('faction')
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
        
        // For imported campaigns, check if the first mission has custom briefing text
        if (tour.metadata?.isImportedCampaign && mission.briefing && mission.briefing.trim()) {
            return mission.briefing;
        }
        
        const factionName = this.getSingularFactionName(mission.faction);
        const campaignTheme = tour.theme;
        
        const themeBriefings = {
            'major_order': [
                `Helldiver. High Command has issued a Major Order: "${campaignTheme.majorOrderDetails?.title || 'Priority Objectives'}". ${campaignTheme.majorOrderDetails?.briefing || 'Your Tour of War directly supports the current community-wide objectives. Every mission you complete brings Super Earth closer to achieving this critical goal.'}`,
                `The Ministry of Defense requires immediate action on the current Major Order. Your tour will focus on high-priority targets across ${tour.missions.length} critical operations. The entire Helldiver corps is mobilizing for this objective - you are part of something greater.`,
                `Major Order received, Helldiver. Your Tour of War aligns with Super Earth's most urgent strategic needs. ${campaignTheme.planets?.length > 0 ? `Operations span ${campaignTheme.planets.length} priority target${campaignTheme.planets.length !== 1 ? 's' : ''}, with heaviest enemy presence on ${campaignTheme.planets[0].name}.` : 'Multiple priority targets await your attention.'} Democracy demands immediate action.`
            ],
            'single_planet': [
                `Helldiver. Your tour focuses entirely on ${mission.planet.name}. This world has become a festering wound in Democracy's flesh, and you will be the surgical blade that excises the ${factionName} infection. Multiple operations across both planetary surface and urban centers will demonstrate the thoroughness of Managed Democracy and weaken the invaders grip on this world.`,
                `The Ministry of Defense has identified ${mission.planet.name} as a critical strategic target. Your Tour of War will systematically dismantle every ${factionName} stronghold on this world, from wilderness outposts to any metropolitan centers. Your success will allow SEAF to establish a foothold here.`,
                `${mission.planet.name} requires liberation, Helldiver. Your tour will span the entire world - surface installations, urban sectors, and everything between. The ${factionName} presence will fear your sustained, methodical operations. Success will ensure essential wartime infrastructure can be deployed to the planet to aid in its capture.`
            ],
            'sector_campaign': [
                `Helldiver. ${this.isEntireSectorCampaign(tour) ? 'The entire' : 'The'} ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'} has fallen to ${factionName} influence. Your Tour of War will sweep across multiple worlds in this sector, establishing Democratic control through decisive military action. This is regional warfare at its most crucial.`,
                `The Ministry of Truth reports widespread ${factionName} contamination throughout the ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'}. Your tour will strike world after world, demonstrating that no corner of the galaxy can hide from Democracy's reach. You will begin with ${mission.planet.name}. Drive the invaders out of this sector.`,
                `Super Earth High Command designates the ${mission.planet.sector.includes('Sector') ? mission.planet.sector : mission.planet.sector + ' Sector'} as a High Priority for liberation. Your Tour of War represents a ${this.isEntireSectorCampaign(tour) ? 'sector-wide' : 'regional'} cleansing operation. Multiple planets await your attention, starting with the ${factionName} stronghold on ${mission.planet.name}. Your successes will weaken the enemy grip on this sector.`
            ],
            'faction_focused': [
                `Helldiver. Your tour represents a concentrated strike against the ${factionName} across multiple battlefields. The Ministry of Defense has determined that focused pressure on this specific threat will yield maximum strategic advantage. Show them the full might of Democracy.`,
                `A series of strikes against the ${factionName} threat has been ordered by Super Earth High Command. Your Tour of War will pursue them across multiple worlds, demonstrating that Managed Democracy relentlessly pursues her enemies. You will begin this campaign of focused elimination on the world of ${mission.planet.name}.`,
                `Your tour targets ${factionName} forces wherever they may be found. Multiple operations against this singular threat will prove that Democracy's wrath, when focused, becomes an unstoppable force. Your hunt begins on ${mission.planet.name}, show no mercy to the invaders.`
            ],
            'biome_specific': [
                `Helldiver. Your tour will test Democracy's adaptability across similar environmental conditions. The Ministry of Science requires data on combat effectiveness in ${apiService.getPlanetBiome(mission.planet).toLowerCase()} environments. Multiple operations in these conditions will prove that the Will of Freedom adapts to any climate.`,
                `Super Earth High Command has selected you for specialized terrain operations. Your tour will span multiple worlds sharing similar biomes, demonstrating that Democracy thrives in any ecosystem. The ${factionName} will learn that no environment provides sanctuary from Freedom.`,
                `Your Tour of War focuses on mastering combat in ${apiService.getPlanetBiome(mission.planet).toLowerCase()} conditions. Multiple operations across similar terrain will prove that Managed Democracy conquers not just enemies, but the very planets they hide upon.`
            ],
            'biome_group_themed': [
                `Helldiver. Your tour will demonstrate mastery across ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} environments. You will be the proof that Democracy adapts to any region. Multiple operations through similar conditions will show that no environment can resist Freedom's advance.`,
                `The Ministry of Science has selected you for specialized biome group operations. Your tour spans multiple worlds within the ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} environmental category, proving that Managed Democracy conquers entire classes of terrain. The ${factionName} will learn that no environmental offers protection from Democracy's Judgement.`,
                `Your Tour of War represents complete environmental mastery, Helldiver. Through operations across ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} worlds, you will prove that Democracy adapts not just to individual planets, but to entire biome families. No environmental category can hide our enemies from Justice.`
            ]
        };

        const briefings = themeBriefings[campaignTheme.type] || themeBriefings['single_planet'];
        return briefings[Math.floor(Math.random() * briefings.length)];
    }

    handleAcknowledgeBriefing() {
        // Hide briefing, show current mission
        document.getElementById('democracy-briefing').style.display = 'none';
        document.getElementById('current-mission-display').style.display = 'block';
        
        // Squad members are already configured during tour setup, no need to ask again for first mission
        // Display current mission directly
        this.displayCurrentTourMission();
    }

    async displayCurrentTourMission() {
        const tour = this.currentTour;
        
        // For imported campaigns, use absolute mission index; for generated campaigns, use currentMissionIndex
        const missionIndex = this.isImportedCampaign() ? this.currentAbsoluteMissionIndex : tour.currentMissionIndex;
        const mission = tour.missions[missionIndex];
        
        console.log(`Displaying mission at index ${missionIndex} (absolute: ${this.currentAbsoluteMissionIndex}, operation: ${tour.currentMissionIndex}):`, mission);
        
        // Capture the squad composition at the start of this mission (deep copy)
        this.currentMissionSquad = this.getActiveSquadMembers().map(member => ({...member}));
        
        // Validate mission structure for imported tours
        if (!mission) {
            console.error('Mission is null or undefined');
            return;
        }
        
        // Check required mission properties
        const requiredProps = ['name', 'planet', 'difficulty', 'faction'];
        const missingProps = requiredProps.filter(prop => !mission[prop]);
        if (missingProps.length > 0) {
            console.error('Missing mission properties:', missingProps, mission);
        }
        
        // Check if this mission needs regeneration due to war state changes
        if (mission.needsRegeneration && mission.isImported) {
            await this.regenerateImportedMission(mission);
        }
        
        // Enhance imported mission data if it's missing required properties
        if (mission.isCustom && !mission.primaryObjective) {
            this.enhanceImportedMission(mission, tour.currentMissionIndex);
        }
        
        // Update tour info
        document.getElementById('tour-name').textContent = tour.name;
        document.getElementById('current-mission-number').textContent = tour.currentMissionIndex + 1;
        document.getElementById('total-missions').textContent = tour.missions.length;
        
        // Update dual progress indicators (without animation for initial display)
        this.updateDualProgressIndicators(tour, false);
        
        // Handle tour description for imported campaigns
        const tourDescriptionElement = document.getElementById('tour-description');
        if (tour.metadata && tour.metadata.isImportedCampaign && tour.metadata.originalCampaignData && tour.metadata.originalCampaignData.description) {
            tourDescriptionElement.textContent = tour.metadata.originalCampaignData.description;
            tourDescriptionElement.style.display = 'block';
        } else {
            tourDescriptionElement.style.display = 'none';
        }
        
        // Generate mission-specific modifier (20% chance per mission)
        const missionKey = `${tour.currentMissionIndex}_${this.currentMissionInOperation}`;
        if (!mission.missionModifiers) {
            mission.missionModifiers = {};
        }
        if (!mission.missionModifiers[missionKey]) {
            mission.missionModifiers[missionKey] = this.generateMissionModifier();
        }
        
        // Display mission
        const container = document.getElementById('current-mission-container');
        container.innerHTML = '';
        
        const missionCard = this.createMissionCard(mission, tour.currentMissionIndex, missionKey);
        container.appendChild(missionCard);
        
        // Show action buttons
        const missionCompleteBtn = document.getElementById('mission-complete');
        const missionFailedBtn = document.getElementById('mission-failed');
        
        if (missionCompleteBtn && missionFailedBtn) {
            missionCompleteBtn.style.display = 'inline-block';
            missionFailedBtn.style.display = 'inline-block';
            
            // Update button text to reflect current mission progress
            const currentOperation = tour.missions[tour.currentMissionIndex];
            const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
            const missionInOp = this.currentMissionInOperation + 1;
            const isLastMissionInOperation = this.currentMissionInOperation >= missionsInThisOperation - 1;
            
            if (isLastMissionInOperation) {
                missionCompleteBtn.textContent = `Operation Complete - Progress Tour`;
            } else {
                missionCompleteBtn.textContent = `Mission ${missionInOp} of ${missionsInThisOperation} Complete - Next Mission`;
            }
            
            console.log('Mission action buttons made visible');
        } else {
            console.error('Mission action buttons not found:', { missionCompleteBtn, missionFailedBtn });
        }
        
        // Show/hide campaign export button based on whether this is an imported campaign
        const exportCampaignBtn = document.getElementById('export-campaign-from-tour');
        if (exportCampaignBtn) {
            if (this.currentTour.metadata?.isImportedCampaign) {
                exportCampaignBtn.style.display = 'inline-block';
            } else {
                exportCampaignBtn.style.display = 'none';
            }
        }
    }

    enhanceImportedMission(mission, missionIndex) {
        console.log('Enhancing imported mission data:', mission);
        
        // Add mission number
        mission.number = `${missionIndex + 1}`;
        
        // Add missing planet properties if not present
        if (mission.planet && !mission.planet.biome) {
            mission.planet.biome = 'Unknown';
            mission.planet.hazard = 'Unknown';
            mission.planet.sector = mission.planet.sector || 'Unknown Sector';
        }
        
        // Add default objectives if missing
        if (!mission.primaryObjective) {
            mission.primaryObjective = {
                name: 'Liberation Operation',
                description: 'Eliminate enemy presence and secure the area for Democratic forces.'
            };
        }
        
        if (!mission.secondaryObjectives) {
            mission.secondaryObjectives = [
                { description: 'Minimize civilian casualties' },
                { description: 'Collect strategic samples' }
            ];
        }
        
        // Set defense flag (assume liberation by default)
        if (mission.isDefense === undefined) {
            mission.isDefense = false;
        }
        
        // Add modifier if specified in briefing
        if (mission.briefing && !mission.modifier) {
            // Extract any modifier information from briefing if possible
            mission.modifier = null; // Default to no modifier
        }
        
        console.log('Enhanced mission:', mission);
    }

    updateStatsModeUI() {
        console.log('Updating stats mode UI, statsMode:', this.statsMode, 'squadMembers:', this.squadMembers);
        
        // If stats mode is enabled, make sure UI elements are properly configured
        if (this.statsMode) {
            const status = document.getElementById('stats-mode-status');
            const checkbox = document.getElementById('stats-mode-checkbox');
            const squadNamesGroup = document.getElementById('squad-names-group');
            
            if (status) {
                status.textContent = 'ON';
                status.classList.add('active');
            }
            
            if (checkbox) {
                checkbox.checked = true;
            }
            
            if (squadNamesGroup) {
                squadNamesGroup.style.display = 'block';
            }
            
            // Initialize squad members if they don't exist
            if (!this.squadMembers || this.squadMembers.length === 0) {
                this.initializeSquadMembers();
            }
            
            console.log('Stats mode UI updated successfully');
        }
    }

    async showSquadNameEntryDialog() {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'squad-name-dialog';
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            `;
            
            const dialogContent = document.createElement('div');
            dialogContent.style.cssText = `
                background: #1a1a1a;
                border: 2px solid #ff6b6b;
                border-radius: 8px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                color: white;
            `;
            
            dialogContent.innerHTML = `
                <h3 style="color: #ff6b6b; margin-bottom: 1rem;">Squad Member Names</h3>
                <p style="margin-bottom: 1.5rem; color: #cccccc;">Enter the names of your squad members (up to 4). Leave blank for any unused slots:</p>
                
                <div style="display: grid; gap: 0.5rem; margin-bottom: 1.5rem;">
                    <input type="text" id="dialog-squad-member-1" placeholder="Squad Member 1" style="padding: 0.5rem; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: white;">
                    <input type="text" id="dialog-squad-member-2" placeholder="Squad Member 2" style="padding: 0.5rem; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: white;">
                    <input type="text" id="dialog-squad-member-3" placeholder="Squad Member 3" style="padding: 0.5rem; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: white;">
                    <input type="text" id="dialog-squad-member-4" placeholder="Squad Member 4" style="padding: 0.5rem; border: 1px solid #555; border-radius: 4px; background: #2a2a2a; color: white;">
                </div>
                
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button id="dialog-cancel" style="padding: 0.5rem 1rem; background: #666; border: none; border-radius: 4px; color: white; cursor: pointer;">Skip Stats</button>
                    <button id="dialog-confirm" style="padding: 0.5rem 1rem; background: #ff6b6b; border: none; border-radius: 4px; color: white; cursor: pointer;">Confirm</button>
                </div>
            `;
            
            dialog.appendChild(dialogContent);
            document.body.appendChild(dialog);
            
            // Focus first input
            setTimeout(() => {
                const firstInput = document.getElementById('dialog-squad-member-1');
                if (firstInput) firstInput.focus();
            }, 100);
            
            // Handle confirm
            const confirmBtn = document.getElementById('dialog-confirm');
            const cancelBtn = document.getElementById('dialog-cancel');
            
            const handleConfirm = () => {
                const names = [];
                for (let i = 1; i <= 4; i++) {
                    const input = document.getElementById(`dialog-squad-member-${i}`);
                    if (input && input.value.trim()) {
                        names.push(input.value.trim());
                    }
                }
                document.body.removeChild(dialog);
                resolve(names);
            };
            
            const handleCancel = () => {
                document.body.removeChild(dialog);
                resolve([]);
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            cancelBtn.addEventListener('click', handleCancel);
            
            // Handle Enter key
            dialogContent.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleConfirm();
                }
            });
            
            // Handle Escape key
            dialog.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    handleCancel();
                }
            });
        });
    }

    async handleMissionComplete() {
        // Check if completing this mission completes the operation
        const tour = this.currentTour;
        const currentOperation = tour.missions[tour.currentMissionIndex];
        const missionsInThisOperation = this.getMissionsPerOperation(currentOperation.difficulty.level);
        const isOperationComplete = (this.currentMissionInOperation + 1) >= missionsInThisOperation;
        
        // Animate mission progression
        this.animateMissionProgression(isOperationComplete);
        
        // In Stats mode, show stats dialog first
        if (this.statsMode) {
            // Show stats dialog for the completed mission
            this.showStatsTrackingDialog();
        } else {
            // Normal tour mode - proceed directly with a small delay to show animation
            setTimeout(() => {
                this.proceedToNextMission();
            }, 500);
        }
    }

    handleMissionFailed() {
        this.failTour();
    }

    async displayNextMissionBriefing() {
        const tour = this.currentTour;
        const mission = tour.missions[tour.currentMissionIndex];
        
        // Squad management is handled after stats entry, not here
        
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
        // For imported campaigns, check if the mission has custom briefing text
        if (this.currentTour.metadata?.isImportedCampaign && mission.briefing && mission.briefing.trim()) {
            return mission.briefing;
        }
        
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
            'biome_specific': [
                `Environmental mastery proceeds successfully across similar terrain conditions. Your tour continues to ${mission.planet.name}, where the same environmental challenges await conquest. Perfect your adaptation to these specific conditions, Helldiver.`,
                `Excellent terrain adaptation, Helldiver. The next phase of environmental operations brings you to ${mission.planet.name}, where similar biome conditions will further test Democracy's environmental supremacy. No climate can resist Freedom.`,
                `Your mastery of ${apiService.getPlanetBiome(mission.planet).toLowerCase()} combat continues to impress Environmental Command. ${mission.planet.name} offers similar conditions where you will further demonstrate that Democracy adapts to any world.`
            ],
            'biome_group_themed': [
                `Biome group mastery advances according to plan, Helldiver. Your tour continues to ${mission.planet.name}, another world within the ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} environmental category. Each operation proves Democracy's adaptability across entire terrain classifications.`,
                `Excellent environmental group adaptation. The next phase brings you to ${mission.planet.name}, where similar biome group conditions will further demonstrate your mastery of ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} environments. Environmental Command observes your systematic conquest of entire biome families.`,
                `Your domination of ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} terrain types continues to exceed expectations. ${mission.planet.name} represents another world within this environmental category where you will prove that Democracy conquers not just individual biomes, but entire environmental classifications.`
            ]
        };

        const briefings = themeProgressBriefings[campaignTheme.type] || themeProgressBriefings['single_planet'];
        return briefings[Math.floor(Math.random() * briefings.length)];
    }

    completeTour() {
        const tour = this.currentTour;
        tour.completed = true;
        
        // Show appropriate completion screen
        document.getElementById('current-mission-display').style.display = 'none';
        
        if (this.statsMode && this.squadMembers.length > 0) {
            // Show Stats completion screen
            document.getElementById('stats-completion').style.display = 'block';
            this.updateStatsCompletionScreen(tour);
        } else {
            // Show normal completion screen
            document.getElementById('tour-completion').style.display = 'block';
            this.updateNormalCompletionScreen(tour);
        }
    }

    updateNormalCompletionScreen(tour) {
        document.getElementById('completed-tour-name').textContent = tour.name;
        
        const stats = document.getElementById('completion-stats');
        stats.innerHTML = `
            <p><strong>Operations Completed:</strong> ${tour.missions.length}</p>
            <p><strong>Factions Defeated:</strong> ${[...new Set(tour.missions.map(m => m.faction))].join(', ')}</p>
            <p><strong>Average Difficulty:</strong> ${(tour.missions.reduce((sum, m) => sum + m.difficulty.level, 0) / tour.missions.length).toFixed(1)}</p>
        `;
    }

    // Helper function to format numbers with commas
    formatNumber(num) {
        return num.toLocaleString();
    }

    updateStatsCompletionScreen(tour) {
        document.getElementById('stats-completed-tour-name').textContent = tour.name;
        
        // Calculate aggregate stats
        const aggregateStats = {
            totalKills: 0,
            totalSamples: 0,
            totalDeaths: 0,
            totalMissions: 0,
            factionKills: {
                "Terminids": 0,
                "Automatons": 0,
                "Illuminate": 0
            }
        };
        
        // Sum up all squad member stats
        this.squadMembers.forEach(member => {
            aggregateStats.totalKills += member.kills.total;
            aggregateStats.totalSamples += member.samples;
            aggregateStats.totalDeaths += member.deaths;
            aggregateStats.totalMissions += member.missionsCompleted;
            
            // Add faction kills
            Object.keys(member.kills.byFaction).forEach(faction => {
                aggregateStats.factionKills[faction] += member.kills.byFaction[faction];
            });
        });

        const stats = document.getElementById('stats-completion-stats');
        let statsHTML = `
            <div class="completion-overview">
                <h3>📊 Tour of War Complete</h3>
                <div class="basic-stats">
                    <p><strong>Operations Completed:</strong> ${tour.missions.length}</p>
                    <p><strong>Factions Defeated:</strong> ${[...new Set(tour.missions.map(m => m.faction))].join(', ')}</p>
                    <p><strong>Average Difficulty:</strong> ${(tour.missions.reduce((sum, m) => sum + m.difficulty.level, 0) / tour.missions.length).toFixed(1)}</p>
                </div>
            </div>
            
            <div class="team-statistics">
                <h3>🎯 Overall Team Statistics</h3>
                <div class="team-stats-grid">
                    <div class="stat-card kills-card">
                        <div class="stat-icon">⚔️</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatNumber(aggregateStats.totalKills)}</div>
                            <div class="stat-label">Total Kills</div>
                        </div>
                    </div>
                    <div class="stat-card samples-card">
                        <div class="stat-icon">💎</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatNumber(aggregateStats.totalSamples)}</div>
                            <div class="stat-label">Samples Collected</div>
                        </div>
                    </div>
                    <div class="stat-card deaths-card">
                        <div class="stat-icon">💀</div>
                        <div class="stat-content">
                            <div class="stat-value">${this.formatNumber(aggregateStats.totalDeaths)}</div>
                            <div class="stat-label">Total Deaths</div>
                        </div>
                    </div>
                    <div class="stat-card operations-card">
                        <div class="stat-icon">🎖️</div>
                        <div class="stat-content">
                            <div class="stat-value">${tour.missions.length}</div>
                            <div class="stat-label">Operations</div>
                        </div>
                    </div>
                </div>`;

        // Show faction-specific kills if any
        const activeFactions = Object.keys(aggregateStats.factionKills).filter(faction => aggregateStats.factionKills[faction] > 0);
        if (activeFactions.length > 0) {
            statsHTML += '<div class="faction-breakdown"><h4>Kills by Faction</h4><div class="faction-stats">';
            activeFactions.forEach(faction => {
                const factionIcon = faction === 'Terminids' ? '🐛' : faction === 'Automatons' ? '🤖' : '🦑';
                statsHTML += `<div class="faction-stat">
                    <span class="faction-icon">${factionIcon}</span>
                    <span class="faction-name">${faction}:</span>
                    <span class="faction-kills">${this.formatNumber(aggregateStats.factionKills[faction])}</span>
                </div>`;
            });
            statsHTML += '</div></div>';
        }
        
        statsHTML += '</div>';

        // Generate Leaderboards
        statsHTML += this.generateLeaderboards();

        // Generate Per-Player Summaries
        statsHTML += this.generatePerPlayerSummaries();
        
        // Generate Mission History Summary if available
        const historyStats = this.getMissionHistoryStats();
        if (historyStats) {
            statsHTML += this.generateMissionHistorySummary(historyStats);
        }
        
        stats.innerHTML = statsHTML;

        this.updateDetailedStatsCompletionScreen(tour);
    }

    generateLeaderboards() {
        if (this.squadMembers.length === 0) return '';

        // Calculate leaderboard data
        const topKiller = [...this.squadMembers].sort((a, b) => b.kills.total - a.kills.total)[0];
        const sampleHunter = [...this.squadMembers].sort((a, b) => b.samples - a.samples)[0];
        
        // Most durable: fewest deaths among players who completed multiple operations
        const eligibleForDurable = this.squadMembers.filter(member => member.missionsCompleted > 1);
        const mostDurable = eligibleForDurable.length > 0 ? 
            [...eligibleForDurable].sort((a, b) => a.deaths - b.deaths)[0] : null;
        
        // Overall MVP: kills + samples - deaths (weighted formula)
        const mvp = [...this.squadMembers].sort((a, b) => {
            const scoreA = a.kills.total + a.samples - (a.deaths * 2);
            const scoreB = b.kills.total + b.samples - (b.deaths * 2);
            return scoreB - scoreA;
        })[0];

        let leaderboardHTML = `
            <div class="leaderboards">
                <h3>🏆 Leaderboards</h3>
                <div class="leaderboard-grid">
                    <div class="leaderboard-card top-killer">
                        <div class="leaderboard-icon">🔥</div>
                        <div class="leaderboard-title">Top Killer</div>
                        <div class="leaderboard-player">${topKiller.name}</div>
                        <div class="leaderboard-value">${this.formatNumber(topKiller.kills.total)} kills</div>
                    </div>
                    
                    <div class="leaderboard-card sample-hunter">
                        <div class="leaderboard-icon">💎</div>
                        <div class="leaderboard-title">Sample Hunter</div>
                        <div class="leaderboard-player">${sampleHunter.name}</div>
                        <div class="leaderboard-value">${this.formatNumber(sampleHunter.samples)} samples</div>
                    </div>`;

        if (mostDurable) {
            leaderboardHTML += `
                    <div class="leaderboard-card most-durable">
                        <div class="leaderboard-icon">🛡️</div>
                        <div class="leaderboard-title">Most Durable</div>
                        <div class="leaderboard-player">${mostDurable.name}</div>
                        <div class="leaderboard-value">${mostDurable.deaths} deaths</div>
                    </div>`;
        }

        leaderboardHTML += `
                    <div class="leaderboard-card overall-mvp">
                        <div class="leaderboard-icon">🌟</div>
                        <div class="leaderboard-title">Most Free Helldiver</div>
                        <div class="leaderboard-player">${mvp.name}</div>
                        <div class="leaderboard-value">${this.formatNumber(mvp.kills.total + mvp.samples - (mvp.deaths * 2))} score</div>
                    </div>
                </div>
            </div>`;

        return leaderboardHTML;
    }

    generatePerPlayerSummaries() {
        if (this.squadMembers.length === 0) return '';

        let summariesHTML = `
            <div class="per-player-summaries">
                <h3>👥 Individual Performance Records</h3>
                <div class="player-summaries-grid">`;

        // Sort players by performance score
        const sortedMembers = [...this.squadMembers].sort((a, b) => {
            const scoreA = a.kills.total + a.samples - a.deaths;
            const scoreB = b.kills.total + b.samples - b.deaths;
            return scoreB - scoreA;
        });

        sortedMembers.forEach(member => {
            const statusClass = 'survived';

            let factionBreakdown = '';
            const memberFactionKills = Object.keys(member.kills.byFaction).filter(faction => member.kills.byFaction[faction] > 0);
            if (memberFactionKills.length > 0) {
                factionBreakdown = '<div class="faction-kills">';
                memberFactionKills.forEach(faction => {
                    const factionIcon = faction === 'Terminids' ? '🐛' : faction === 'Automatons' ? '🤖' : '🦑';
                    factionBreakdown += `<div class="faction-kill-stat">
                        <span class="faction-icon">${factionIcon}</span>
                        <span>${faction}: ${this.formatNumber(member.kills.byFaction[faction])}</span>
                    </div>`;
                });
                factionBreakdown += '</div>';
            }

            summariesHTML += `
                <div class="player-summary-card ${statusClass}">
                    <div class="player-header">
                        <div class="player-name">${member.name}</div>
                    </div>
                    <div class="player-stats">
                        <div class="primary-stats">
                            <div class="stat-item">
                                <span class="stat-icon">⚔️</span>
                                <span class="stat-text">Total Kills: <strong>${this.formatNumber(member.kills.total)}</strong></span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">💎</span>
                                <span class="stat-text">Samples: <strong>${this.formatNumber(member.samples)}</strong></span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">💀</span>
                                <span class="stat-text">Deaths: <strong>${member.deaths}</strong></span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">🎖️</span>
                                <span class="stat-text">Operations: <strong>${member.missionsCompleted}</strong></span>
                            </div>
                        </div>
                        ${factionBreakdown}
                    </div>`;


            summariesHTML += '</div>';
        });

        summariesHTML += `
                </div>
            </div>`;

        return summariesHTML;
    }

    generateMissionHistorySummary(historyStats) {
        if (!historyStats) return '';
        
        let summaryHTML = `
            <div class="mission-history-summary">
                <h4>Squad Evolution</h4>
                <div class="history-stats">
                    <p><strong>Total Missions:</strong> ${historyStats.totalMissionsPlayed}</p>
                    <p><strong>Operations:</strong> ${historyStats.operationsPlayed}</p>
                    <p><strong>Squad Changes:</strong> ${historyStats.squadEvolution.length}</p>
                </div>
        `;
        
        if (historyStats.squadEvolution.length > 1) {
            summaryHTML += '<h5>Squad Timeline</h5><div class="squad-timeline">';
            historyStats.squadEvolution.forEach((change, index) => {
                summaryHTML += `
                    <div class="timeline-entry">
                        <strong>Op ${change.operationIndex + 1}, Mission ${change.missionInOperation + 1}:</strong> 
                        ${change.squad.join(', ')}
                    </div>
                `;
            });
            summaryHTML += '</div>';
        }
        
        // Participation rates
        summaryHTML += '<h5>Participation Rates</h5><div class="participation-rates">';
        Object.entries(historyStats.participationRates).forEach(([player, stats]) => {
            summaryHTML += `
                <div class="participation-entry">
                    <strong>${player}:</strong> ${stats.missionsParticipated}/${historyStats.totalMissionsPlayed} missions (${stats.participationRate})
                </div>
            `;
        });
        summaryHTML += '</div></div>';
        
        return summaryHTML;
    }


    updateDetailedStatsCompletionScreen(tour) {
        
        // Hide KIA section since we no longer track KIA
        const kiaSection = document.getElementById('kia-section');
        if (kiaSection) {
            kiaSection.style.display = 'none';
        }
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
            <p><strong>Operations Completed:</strong> ${tour.currentMissionIndex} of ${tour.missions.length}</p>
            <p><strong>Failed Operation:</strong> ${tour.missions[tour.currentMissionIndex]?.name || 'Unknown'}</p>
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
        document.getElementById('stats-completion').style.display = 'none';
        document.getElementById('death-note-modal').style.display = 'none';
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
        
        // Ensure only tour elements are visible, hide all other preferences
        const campaignLengthGroup = document.getElementById('campaign-length-group');
        const tourLengthGroup = document.getElementById('tour-length-group');
        const tourThemeGroup = document.getElementById('tour-theme-group');
        const tourFactionGroup = document.getElementById('tour-faction-group');
        const tourDifficultyGroup = document.getElementById('tour-difficulty-group');
        const tourFactionPreferenceGroup = document.getElementById('tour-faction-preference-group');
        const generateBtn = document.getElementById('generate-campaign');
        const startTourBtn = document.getElementById('start-tour');
        
        if (campaignLengthGroup) campaignLengthGroup.style.display = 'none';
        if (tourLengthGroup) tourLengthGroup.style.display = 'block';
        if (tourThemeGroup) tourThemeGroup.style.display = 'block';
        if (tourDifficultyGroup) tourDifficultyGroup.style.display = 'block';
        if (tourFactionPreferenceGroup) tourFactionPreferenceGroup.style.display = 'block';
        // Faction group visibility is handled by current theme selection
        if (tourFactionGroup) {
            const tourThemeSelect = document.getElementById('tour-theme');
            if (tourThemeSelect && tourThemeSelect.value === 'faction_focused') {
                tourFactionGroup.style.display = 'block';
            } else {
                tourFactionGroup.style.display = 'none';
            }
        }
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
        document.getElementById('stats-tracking-dialog').style.display = 'none';
        document.getElementById('death-note-modal').style.display = 'none';
        document.getElementById('stats-completion').style.display = 'none';
    }

    getSquadMemberNames() {
        const names = [];
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`squad-member-${i}`);
            if (input) {
                names.push(input.value.trim());
            }
        }
        return names;
    }

    enableStatsMode() {
        this.statsMode = true;
        const status = document.getElementById('stats-mode-status');
        const checkbox = document.getElementById('stats-mode-checkbox');
        const squadNamesGroup = document.getElementById('squad-names-group');

        if (checkbox) {
            checkbox.checked = true;
        }
        
        if (status) {
            status.textContent = 'ON';
            status.classList.add('active');
        }

        if (squadNamesGroup) {
            squadNamesGroup.style.display = 'block';
        }
    }

    initializeSquadStats() {
        const squadNames = this.getSquadMemberNames().filter(name => name.length > 0);
        if (squadNames.length === 0) {
            return null;
        }

        const squadStats = {};
        squadNames.forEach(name => {
            squadStats[name] = {
                totalKills: 0,
                totalSamples: 0,
                totalDeaths: 0,
                missionsCompleted: 0,
                missionStats: []
            };
        });

        return squadStats;
    }

    restoreAppState(appState) {
        // Restore stats mode
        if (appState.statsMode !== undefined) {
            this.statsMode = appState.statsMode;
            const checkbox = document.getElementById('stats-mode-checkbox');
            const status = document.getElementById('stats-mode-status');
            const squadNamesGroup = document.getElementById('squad-names-group');
            
            if (checkbox) {
                checkbox.checked = this.statsMode;
            }
            
            if (status) {
                status.textContent = this.statsMode ? 'ON' : 'OFF';
                if (this.statsMode) {
                    status.classList.add('active');
                } else {
                    status.classList.remove('active');
                }
            }
            
            if (squadNamesGroup) {
                squadNamesGroup.style.display = this.statsMode ? 'block' : 'none';
            }
        }

        // Restore squad member names
        if (appState.squadMemberNames && Array.isArray(appState.squadMemberNames)) {
            for (let i = 0; i < 4; i++) {
                const input = document.getElementById(`squad-member-${i + 1}`);
                if (input) {
                    input.value = appState.squadMemberNames[i] || '';
                }
            }
        }

        // Restore squad member stats data
        if (appState.squadMembers && Array.isArray(appState.squadMembers)) {
            this.squadMembers = appState.squadMembers;
        }
        
        // Sync squadMembers with current squad member names to include newly added players
        if (this.statsMode) {
            const currentSquadNames = this.getSquadMemberNames().filter(name => name.length > 0);
            
            // Initialize squadMembers array if it doesn't exist
            if (!this.squadMembers) {
                this.squadMembers = [];
            }
            
            // Add any new players that exist in squad names but not in squadMembers
            currentSquadNames.forEach(name => {
                const existingMember = this.squadMembers.find(member => member.name === name);
                if (!existingMember) {
                    this.squadMembers.push({
                        name: name,
                        status: 'active',
                        totalKills: 0,
                        totalSamples: 0,
                        totalDeaths: 0,
                        missionsCompleted: 0,
                        missionStats: []
                    });
                }
            });
            
            // Remove players that no longer exist in squad names
            this.squadMembers = this.squadMembers.filter(member => 
                currentSquadNames.includes(member.name)
            );
        }
        
        // Restore mission history
        if (appState.missionHistory && Array.isArray(appState.missionHistory)) {
            this.missionHistory = appState.missionHistory;
        }
        
        // Restore current mission in operation
        if (appState.currentMissionInOperation !== undefined) {
            this.currentMissionInOperation = appState.currentMissionInOperation;
        }
        
        // Restore current absolute mission index (for imported campaigns)
        if (appState.currentAbsoluteMissionIndex !== undefined) {
            this.currentAbsoluteMissionIndex = appState.currentAbsoluteMissionIndex;
        }
    }

    // Campaign Export/Import functionality
    exportTour() {
        if (!this.currentTour) {
            alert('No active tour to export.');
            return;
        }

        const exportData = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            tourData: {
                name: this.currentTour.name,
                theme: this.currentTour.theme,
                currentMissionIndex: this.currentTour.currentMissionIndex || 0,
                missions: this.currentTour.missions,
                metadata: this.currentTour.metadata,
                failed: this.currentTour.failed || false,
                completed: this.currentTour.completed || false,
                stats: this.currentTour.stats || null,
                squadStats: this.currentTour.squadStats || null
            },
            appState: {
                statsMode: this.statsMode,
                squadMembers: this.squadMembers ? JSON.parse(JSON.stringify(this.squadMembers)) : [],
                squadMemberNames: this.getSquadMemberNames(),
                missionHistory: this.missionHistory ? JSON.parse(JSON.stringify(this.missionHistory)) : [],
                currentMissionInOperation: this.currentMissionInOperation || 0,
                currentAbsoluteMissionIndex: this.currentAbsoluteMissionIndex || 0
            }
        };

        // If this tour was imported from a campaign, also include the original campaign data
        // This allows users to re-export the campaign structure separately
        if (this.currentTour.metadata?.isImportedCampaign) {
            const originalCampaignData = this.currentTour.missions[0]?.originalCampaignData;
            if (originalCampaignData) {
                exportData.originalCampaign = {
                    name: originalCampaignData.name,
                    description: originalCampaignData.description,
                    type: originalCampaignData.type,
                    missions: this.currentTour.missions.map(mission => ({
                        id: mission.id,
                        name: mission.name,
                        planet: mission.originalPlanet || mission.planet,
                        faction: mission.originalFaction || mission.faction,
                        difficulty: mission.difficulty,
                        city: mission.city,
                        briefing: mission.briefing,
                        transitionText: mission.transitionText,
                        enableFallback: mission.enableFallback !== undefined ? mission.enableFallback : true,
                        isCustom: true
                    })),
                    metadata: {
                        ...this.currentTour.metadata,
                        type: originalCampaignData.type,
                        exportedFromTour: true,
                        exportedAt: new Date().toISOString()
                    }
                };
            }
        }

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.currentTour.name.replace(/[^a-z0-9]/gi, '_')}_tour_export.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
    }

    exportResults() {
        if (!this.currentTour || !this.currentTour.completed || !this.statsMode || !this.squadMembers || this.squadMembers.length === 0) {
            alert('No completed tour results to export.');
            return;
        }

        // Calculate aggregate stats for export
        const totalMissionsPlayed = this.missionHistory.length;
        const totalOperationsPlayed = [...new Set(this.missionHistory.map(m => m.operationIndex))].length;
        
        const aggregateStats = {
            totalKills: 0,
            totalSamples: 0,
            totalDeaths: 0,
            totalMissions: totalMissionsPlayed,
            totalOperations: totalOperationsPlayed,
            factionKills: {
                "Terminids": 0,
                "Automatons": 0,
                "Illuminate": 0
            }
        };

        const squadMemberStats = {};

        // Initialize and populate squad member stats from this.squadMembers
        this.squadMembers.forEach(member => {
            if (member.name) {
                squadMemberStats[member.name] = {
                    kills: member.kills.total || 0,
                    deaths: member.deaths || 0,
                    samples: member.samples || 0,
                    factionKills: {
                        "Terminids": member.kills.byFaction.Terminids || 0,
                        "Automatons": member.kills.byFaction.Automatons || 0,
                        "Illuminate": member.kills.byFaction.Illuminate || 0
                    }
                };

                // Add to aggregate stats
                aggregateStats.totalKills += squadMemberStats[member.name].kills;
                aggregateStats.totalDeaths += squadMemberStats[member.name].deaths;
                aggregateStats.totalSamples += squadMemberStats[member.name].samples;

                // Add faction-specific kills to aggregate
                Object.keys(aggregateStats.factionKills).forEach(faction => {
                    aggregateStats.factionKills[faction] += squadMemberStats[member.name].factionKills[faction];
                });
            }
        });

        // Find MVP
        let mvpPlayer = null;
        let mvpScore = -1;
        Object.entries(squadMemberStats).forEach(([memberName, stats]) => {
            const score = stats.kills * 3 + stats.samples * 2 - stats.deaths * 5;
            if (score > mvpScore) {
                mvpScore = score;
                mvpPlayer = memberName;
            }
        });

        const exportData = {
            version: "1.0",
            type: "results",
            exportedAt: new Date().toISOString(),
            tourData: {
                name: this.currentTour.name,
                theme: this.currentTour.theme,
                completedAt: new Date().toISOString(),
                operationsCompleted: totalOperationsPlayed,
                factions: [...new Set(this.missionHistory.map(m => m.faction))],
                planets: [...new Set(this.missionHistory.map(m => m.planet))],
                difficulties: [...new Set(this.currentTour.missions.map(m => m.difficulty))],
                biomes: [...new Set(this.currentTour.missions.map(m => m.biome).filter(b => b))]
            },
            squadStats: {
                aggregateStats: aggregateStats,
                memberStats: squadMemberStats,
                mvp: {
                    player: mvpPlayer,
                    score: mvpScore
                }
            },
            missionHistory: this.missionHistory ? JSON.parse(JSON.stringify(this.missionHistory)) : []
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${this.currentTour.name.replace(/[^a-z0-9]/gi, '_')}_results.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        
        alert('Results exported successfully!');
    }

    handleExportResults() {
        this.exportResults();
    }

    importTour(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Validate import data structure
                if (!importData.version || !importData.tourData) {
                    throw new Error('Invalid tour export file format');
                }

                if (!importData.tourData.missions || !importData.tourData.name) {
                    throw new Error('Tour export file is missing required data');
                }

                // Restore app state (stats mode and squad members)
                if (importData.appState) {
                    console.log('Restoring app state:', importData.appState);
                    this.restoreAppState(importData.appState);
                    console.log('Stats mode after restore:', this.statsMode);
                }

                // Restore tour state
                this.currentTour = {
                    name: importData.tourData.name,
                    theme: importData.tourData.theme,
                    currentMissionIndex: importData.tourData.currentMissionIndex || 0,
                    missions: importData.tourData.missions,
                    metadata: importData.tourData.metadata,
                    failed: importData.tourData.failed || false,
                    completed: importData.tourData.completed || false,
                    stats: importData.tourData.stats || null,
                    squadStats: importData.tourData.squadStats || null
                };

                // If tour is completed or failed, show appropriate screen
                if (this.currentTour.completed) {
                    document.getElementById('current-mission-display').style.display = 'none';
                    document.getElementById('tour-completion').style.display = 'block';
                    // Update completion screen with tour data
                    if (this.statsMode && this.currentTour.squadStats) {
                        this.updateStatsCompletionScreen(this.currentTour);
                    } else {
                        this.updateNormalCompletionScreen(this.currentTour);
                    }
                } else if (this.currentTour.failed) {
                    document.getElementById('current-mission-display').style.display = 'none';
                    document.getElementById('tour-failure').style.display = 'block';
                    // Update failure screen with tour data
                    document.getElementById('failed-tour-name').textContent = this.currentTour.name;
                    const stats = document.getElementById('failure-stats');
                    stats.innerHTML = `
                        <p><strong>Operations Completed:</strong> ${this.currentTour.currentMissionIndex} of ${this.currentTour.missions.length}</p>
                        <p><strong>Failed Operation:</strong> ${this.currentTour.missions[this.currentTour.currentMissionIndex]?.name || 'Unknown'}</p>
                        <p><strong>Location:</strong> ${this.currentTour.missions[this.currentTour.currentMissionIndex]?.planet.name || 'Unknown'}</p>
                    `;
                } else {
                    // Resume active tour - show current mission
                    console.log(`Resuming active tour "${this.currentTour.name}" at mission ${this.currentTour.currentMissionIndex + 1} of ${this.currentTour.missions.length}`);
                    document.getElementById('democracy-briefing').style.display = 'none';
                    document.getElementById('current-mission-display').style.display = 'block';
                    this.displayCurrentTourMission();
                }

                // Hide preferences and show tour display
                document.getElementById('preferences-content').style.display = 'none';
                document.getElementById('tour-display').style.display = 'block';
                
                // Hide the start tour button since a tour is now active
                const startTourBtn = document.getElementById('start-tour');
                if (startTourBtn) {
                    startTourBtn.style.display = 'none';
                }
                
                // Show campaign display section if it's hidden
                const campaignDisplay = document.getElementById('campaign-display');
                if (campaignDisplay) {
                    campaignDisplay.style.display = 'none';
                }
                
                // Ensure stats mode UI is properly set up if stats mode is enabled
                this.updateStatsModeUI();
                
                alert(`Tour "${this.currentTour.name}" imported successfully!`);
                
            } catch (error) {
                alert(`Failed to import tour: ${error.message}`);
                console.error('Tour import error:', error);
            }
            
            // Clear the file input
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    }

    importCampaign(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const campaignData = JSON.parse(e.target.result);
                
                // Validate campaign data structure
                if (!campaignData.name || !campaignData.missions || !Array.isArray(campaignData.missions)) {
                    throw new Error('Invalid campaign file format');
                }

                if (campaignData.missions.length === 0) {
                    throw new Error('Campaign contains no operations');
                }

                // Show stats mode selection dialog
                const enableStats = await this.showStatsModeSelectionDialog(campaignData);
                
                // Set up stats mode if selected
                if (enableStats) {
                    this.enableStatsMode();
                    
                    // This is a raw campaign file (not a saved tour), so prompt for new squad member names
                    console.log('Prompting for squad names for new stats mode on campaign import');
                    const squadNames = await this.showSquadNameEntryDialog();
                    if (squadNames && squadNames.length > 0) {
                        this.squadMembers = squadNames.map(name => ({
                            name: name.trim(),
                            kills: {
                                total: 0,
                                byFaction: {
                                    "Terminids": 0,
                                    "Automatons": 0,
                                    "Illuminate": 0
                                }
                            },
                            samples: 0,
                            deaths: 0,
                            missionsCompleted: 0
                        })).filter(member => member.name.length > 0);
                        console.log('Initialized squad members:', this.squadMembers);
                    }
                }

                // Convert campaign data to tour format
                const tour = {
                    name: campaignData.name,
                    theme: campaignData.metadata?.theme || 'imported_campaign',
                    currentMissionIndex: 0,
                    missions: campaignData.missions.map((mission, index) => ({
                        ...mission,
                        id: index,
                        isImported: true,
                        originalCampaignData: {
                            name: campaignData.name,
                            description: campaignData.description,
                            type: campaignData.metadata?.type || 'custom'
                        }
                    })),
                    metadata: {
                        ...campaignData.metadata,
                        importedAt: new Date().toISOString(),
                        isImportedCampaign: true,
                        originalType: campaignData.metadata?.type || 'custom'
                    },
                    failed: false,
                    completed: false,
                    stats: enableStats ? {} : null,
                    squadStats: enableStats ? this.initializeSquadStats() : null
                };

                // Validate imported missions against current war state
                await this.validateImportedCampaign(tour);

                this.currentTour = tour;
                // Reset tracking variables for imported tour
                this.currentMissionInOperation = 0;
                this.currentAbsoluteMissionIndex = 0;

                // Show the first briefing
                this.showDemocracyBriefing();
                
                alert(`Campaign "${campaignData.name}" imported successfully! ${enableStats ? 'Stats mode enabled.' : ''}`);
                
            } catch (error) {
                alert(`Failed to import campaign: ${error.message}`);
                console.error('Campaign import error:', error);
            }
            
            // Clear the file input
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    }

    async showStatsModeSelectionDialog(campaignData) {
        return new Promise((resolve) => {
            // Create modal dialog
            const modal = document.createElement('div');
            modal.className = 'stats-selection-modal';
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.8); z-index: 1000;
                display: flex; align-items: center; justify-content: center;
            `;
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.cssText = `
                background: #1a1a1a; border: 2px solid #ffd700;
                border-radius: 8px; padding: 2rem; max-width: 500px;
                color: #ffffff; text-align: center;
            `;
            
            modalContent.innerHTML = `
                <h3 style="color: #ffd700; margin-bottom: 1rem;">Import Campaign: ${campaignData.name}</h3>
                <p style="margin-bottom: 1rem;">This campaign contains ${campaignData.missions.length} operations.</p>
                <p style="margin-bottom: 2rem;">Would you like to enable <strong>Stats Mode</strong> to track squad member statistics throughout this campaign?</p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="enable-stats-btn" style="
                        background: #4CAF50; color: white; padding: 0.75rem 1.5rem;
                        border: none; border-radius: 4px; cursor: pointer; font-weight: bold;
                    ">Enable Stats Mode</button>
                    <button id="skip-stats-btn" style="
                        background: #666; color: white; padding: 0.75rem 1.5rem;
                        border: none; border-radius: 4px; cursor: pointer;
                    ">Start Without Stats</button>
                </div>
            `;
            
            modal.appendChild(modalContent);
            document.body.appendChild(modal);
            
            // Handle button clicks
            document.getElementById('enable-stats-btn').onclick = () => {
                document.body.removeChild(modal);
                resolve(true);
            };
            
            document.getElementById('skip-stats-btn').onclick = () => {
                document.body.removeChild(modal);
                resolve(false);
            };
        });
    }

    async validateImportedCampaign(tour) {
        // This method will check if planets/factions are still available
        // and mark missions for regeneration if needed
        try {
            // Make sure we have current war data
            if (!this.backgroundDataReady) {
                await this.ensureBackgroundDataLoaded();
            }
            
            let validationWarnings = [];
            
            for (let i = 0; i < tour.missions.length; i++) {
                const mission = tour.missions[i];
                
                // Resolve "any" selections to specific planets/cities
                await this.resolveAnySelections(mission);
                
                // Check if planet is still available for the faction
                if (mission.planet && mission.faction) {
                    const currentEnemy = apiService.getCurrentEnemy(mission.planet);
                    if (currentEnemy !== mission.faction) {
                        mission.needsRegeneration = true;
                        mission.originalPlanet = { ...mission.planet };
                        mission.originalFaction = mission.faction;
                        validationWarnings.push(`Operation ${i + 1}: ${mission.planet.name} is no longer controlled by ${mission.faction}`);
                    }
                }
            }
            
            if (validationWarnings.length > 0) {
                const warningMessage = `Some operations may need to be updated due to changes in the galactic war:\n\n${validationWarnings.join('\n')}\n\nThese will be automatically updated when you reach them to maintain campaign playability.`;
                alert(warningMessage);
            }
            
        } catch (error) {
            console.warn('Could not validate campaign against current war state:', error);
            // Campaign can still be imported, but without validation
        }
    }

    async resolveAnySelections(mission) {
        // Resolve "any" planet selection
        if (mission.planet === 'any' && mission.faction) {
            try {
                const availablePlanets = apiService.getEnemyPlanets(apiService.lastWarData?.planets || []);
                const factionPlanets = availablePlanets.filter(planet => 
                    apiService.getCurrentEnemy(planet) === mission.faction &&
                    planet.liberation < 100
                );
                
                if (factionPlanets.length > 0) {
                    // Select random planet for the faction
                    const selectedPlanet = factionPlanets[Math.floor(Math.random() * factionPlanets.length)];
                    mission.planet = selectedPlanet;
                    console.log(`Resolved "any" planet to: ${selectedPlanet.name} for faction ${mission.faction}`);
                } else {
                    console.warn(`No available planets found for faction ${mission.faction}, keeping "any" selection`);
                }
            } catch (error) {
                console.error('Failed to resolve "any" planet selection:', error);
            }
        }
        
        // Resolve "any" city selection
        if (mission.city === 'any' && mission.planet && mission.planet !== 'any') {
            try {
                // Check if planet has available regions/cities
                const hasRegions = mission.planet.availableRegions?.length > 0 || 
                                 mission.planet.activeRegions?.length > 0 ||
                                 (mission.planet.regions && mission.planet.regions.filter(r => r.isAvailable).length > 0);
                
                if (hasRegions && window.cityMappings) {
                    const regionCount = mission.planet.availableRegions ? mission.planet.availableRegions.length : 
                                      mission.planet.activeRegions ? mission.planet.activeRegions.length :
                                      mission.planet.regions ? mission.planet.regions.filter(r => r.isAvailable).length : 1;
                    
                    const cities = window.cityMappings.getCitiesForPlanet(mission.planet.name, regionCount);
                    
                    if (cities.length > 0) {
                        // 50/50 chance between city and surface mission
                        if (Math.random() < 0.5) {
                            // Select a random city
                            const selectedCity = cities[Math.floor(Math.random() * cities.length)];
                            mission.city = selectedCity.index;
                            console.log(`Resolved "any" city to: ${selectedCity.name} on ${mission.planet.name}`);
                        } else {
                            // Use surface mission
                            mission.city = '';
                            console.log(`Resolved "any" city to: Surface mission on ${mission.planet.name}`);
                        }
                    } else {
                        // No cities available, default to surface
                        mission.city = '';
                        console.log(`No cities available on ${mission.planet.name}, defaulting to surface mission`);
                    }
                } else {
                    // No regions available, default to surface
                    mission.city = '';
                    console.log(`No regions available on ${mission.planet.name}, defaulting to surface mission`);
                }
            } catch (error) {
                console.error('Failed to resolve "any" city selection:', error);
                mission.city = ''; // Default to surface on error
            }
        }
    }

    async regenerateImportedMission(mission) {
        try {
            console.log(`Regenerating mission: ${mission.name} (${mission.originalFaction} on ${mission.originalPlanet?.name})`);
            
            // Ensure we have fresh war data
            if (!this.backgroundDataReady) {
                await this.ensureBackgroundDataLoaded();
            }
            
            // Try to find a suitable replacement planet for the same faction
            const availablePlanets = apiService.getEnemyPlanets(apiService.lastWarData?.planets || []);
            const factionPlanets = availablePlanets.filter(planet => 
                apiService.getCurrentEnemy(planet) === mission.originalFaction
            );
            
            if (factionPlanets.length > 0) {
                // Try to find a planet with the same biome as the original
                const originalBiome = apiService.getPlanetBiome(mission.originalPlanet);
                let replacementPlanet = factionPlanets.find(planet => 
                    apiService.getPlanetBiome(planet) === originalBiome
                );
                
                // If no same-biome planet found, use any available planet of the same faction
                if (!replacementPlanet) {
                    replacementPlanet = factionPlanets[Math.floor(Math.random() * factionPlanets.length)];
                }
                
                // Update the mission
                mission.planet = replacementPlanet;
                mission.faction = mission.originalFaction;
                mission.city = null; // Clear city selection as it may not be valid for new planet
                mission.needsRegeneration = false;
                
                console.log(`Mission regenerated: ${mission.originalFaction} on ${replacementPlanet.name} (${apiService.getPlanetBiome(replacementPlanet)} biome)`);
                
                // Show notification to user
                const notification = `Operation ${mission.name} updated: Now targeting ${replacementPlanet.name} instead of ${mission.originalPlanet?.name} due to changes in the galactic war.`;
                this.showMissionRegenerationNotification(notification);
                
            } else {
                // No planets available for original faction, try to find alternative faction
                const availableFactions = apiService.getAvailableFactions(availablePlanets);
                if (availableFactions.length > 0) {
                    const newFaction = availableFactions[Math.floor(Math.random() * availableFactions.length)];
                    const newFactionPlanets = availablePlanets.filter(planet => 
                        apiService.getCurrentEnemy(planet) === newFaction
                    );
                    
                    const newPlanet = newFactionPlanets[Math.floor(Math.random() * newFactionPlanets.length)];
                    
                    mission.planet = newPlanet;
                    mission.faction = newFaction;
                    mission.city = null;
                    mission.needsRegeneration = false;
                    
                    console.log(`Mission regenerated with new faction: ${newFaction} on ${newPlanet.name}`);
                    
                    const notification = `Operation ${mission.name} updated: Target changed to ${newFaction} on ${newPlanet.name} due to strategic changes in the galactic war.`;
                    this.showMissionRegenerationNotification(notification);
                } else {
                    console.error('No suitable planets found for mission regeneration');
                    // Keep original mission data but mark as potentially unavailable
                    mission.needsRegeneration = false;
                    mission.regenerationFailed = true;
                }
            }
            
        } catch (error) {
            console.error('Failed to regenerate mission:', error);
            mission.needsRegeneration = false;
            mission.regenerationFailed = true;
        }
    }

    showMissionRegenerationNotification(message) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 1001;
            background: #2196F3; color: white; padding: 1rem;
            border-radius: 4px; max-width: 300px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-size: 0.9rem; line-height: 1.4;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    handleExportTour() {
        this.exportTour();
    }

    handleExportCampaignFromTour() {
        if (!this.currentTour) {
            alert('No active tour to export campaign from.');
            return;
        }

        if (!this.currentTour.metadata?.isImportedCampaign) {
            alert('This tour was not imported from a campaign. Use "Export Tour" instead.');
            return;
        }

        const originalCampaignData = this.currentTour.missions[0]?.originalCampaignData;
        if (!originalCampaignData) {
            alert('Original campaign data not available.');
            return;
        }

        // Create the campaign export data
        const campaignExport = {
            name: originalCampaignData.name,
            description: originalCampaignData.description,
            missions: this.currentTour.missions.map(mission => ({
                id: mission.id,
                name: mission.name,
                planet: mission.originalPlanet || mission.planet,
                faction: mission.originalFaction || mission.faction,
                difficulty: mission.difficulty,
                city: mission.city,
                briefing: mission.briefing,
                transitionText: mission.transitionText,
                enableFallback: mission.enableFallback !== undefined ? mission.enableFallback : true,
                isCustom: true
            })),
            metadata: {
                type: originalCampaignData.type,
                createdAt: this.currentTour.metadata.createdAt || new Date().toISOString(),
                exportedFromTour: true,
                exportedAt: new Date().toISOString(),
                version: '1.0',
                operationCount: this.currentTour.missions.length
            }
        };

        this.downloadJSON(campaignExport, `${originalCampaignData.name.replace(/[^a-z0-9]/gi, '_')}_campaign.json`);
    }

    handleImportTour() {
        const fileInput = document.getElementById('import-tour-file');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleImportCampaignMain() {
        const fileInput = document.getElementById('import-campaign-main-file');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleUnifiedImport(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Detect file type based on structure
                if (importData.version && importData.tourData) {
                    // This is a tour file - has version and tourData wrapper
                    console.log('Detected tour file, importing as tour');
                    this.importTourData(importData, fileInput);
                } else if (importData.name && importData.missions && Array.isArray(importData.missions)) {
                    // This is a campaign file - has direct name and missions
                    console.log('Detected campaign file, importing as campaign');
                    this.importCampaignData(importData, fileInput);
                } else {
                    throw new Error('Unrecognized file format. Please ensure you are importing a valid tour or campaign file.');
                }
                
            } catch (error) {
                alert(`Failed to import file: ${error.message}`);
                console.error('Import error:', error);
            }
            
            // Clear the file input
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    }

    importTourData(importData, fileInput) {
        try {
            // Validate import data structure
            if (!importData.version || !importData.tourData) {
                throw new Error('Invalid tour export file format');
            }

            if (!importData.tourData.missions || !importData.tourData.name) {
                throw new Error('Tour export file is missing required data');
            }

            // Use existing importTour logic but with parsed data
            // Restore app state (stats mode and squad members)
            if (importData.appState) {
                console.log('Saved tour detected - restoring existing stats and squad data');
                console.log('Restoring app state:', importData.appState);
                this.restoreAppState(importData.appState);
                console.log('Stats mode after restore:', this.statsMode);
                console.log('Squad members after restore:', this.squadMembers);
            }

            // Restore tour state
            this.currentTour = {
                name: importData.tourData.name,
                theme: importData.tourData.theme,
                currentMissionIndex: importData.tourData.currentMissionIndex || 0,
                missions: importData.tourData.missions,
                metadata: importData.tourData.metadata,
                failed: importData.tourData.failed || false,
                completed: importData.tourData.completed || false,
                stats: importData.tourData.stats || null,
                squadStats: importData.tourData.squadStats || null
            };

            // If tour is completed or failed, show appropriate screen
            if (this.currentTour.completed) {
                document.getElementById('current-mission-display').style.display = 'none';
                document.getElementById('tour-completion').style.display = 'block';
                // Update completion screen with tour data
                if (this.statsMode && this.currentTour.squadStats) {
                    this.updateStatsCompletionScreen(this.currentTour);
                } else {
                    this.updateNormalCompletionScreen(this.currentTour);
                }
            } else if (this.currentTour.failed) {
                document.getElementById('current-mission-display').style.display = 'none';
                document.getElementById('tour-failure').style.display = 'block';
                // Update failure screen with tour data
                document.getElementById('failed-tour-name').textContent = this.currentTour.name;
                const stats = document.getElementById('failure-stats');
                stats.innerHTML = `
                    <p><strong>Operations Completed:</strong> ${this.currentTour.currentMissionIndex} of ${this.currentTour.missions.length}</p>
                    <p><strong>Failed Operation:</strong> ${this.currentTour.missions[this.currentTour.currentMissionIndex]?.name || 'Unknown'}</p>
                    <p><strong>Location:</strong> ${this.currentTour.missions[this.currentTour.currentMissionIndex]?.planet.name || 'Unknown'}</p>
                `;
            } else {
                // Resume active tour - show current mission
                console.log(`Resuming active tour "${this.currentTour.name}" at mission ${this.currentTour.currentMissionIndex + 1} of ${this.currentTour.missions.length}`);
                document.getElementById('democracy-briefing').style.display = 'none';
                document.getElementById('current-mission-display').style.display = 'block';
                this.displayCurrentTourMission();
            }

            // Hide preferences and show tour display
            document.getElementById('preferences-content').style.display = 'none';
            document.getElementById('tour-display').style.display = 'block';
            
            // Hide the start tour button since a tour is now active
            const startTourBtn = document.getElementById('start-tour');
            if (startTourBtn) {
                startTourBtn.style.display = 'none';
            }
            
            // Show campaign display section if it's hidden
            const campaignDisplay = document.getElementById('campaign-display');
            if (campaignDisplay) {
                campaignDisplay.style.display = 'none';
            }
            
            // Ensure stats mode UI is properly set up if stats mode is enabled
            this.updateStatsModeUI();
            
            alert(`Tour "${this.currentTour.name}" imported successfully!`);
            
        } catch (error) {
            alert(`Failed to import tour: ${error.message}`);
            console.error('Tour import error:', error);
        }
    }

    async importCampaignData(campaignData, fileInput) {
        try {
            // Validate campaign data structure
            if (!campaignData.name || !campaignData.missions || !Array.isArray(campaignData.missions)) {
                throw new Error('Invalid campaign file format');
            }

            if (campaignData.missions.length === 0) {
                throw new Error('Campaign contains no operations');
            }

            // Show stats mode selection dialog
            const enableStats = await this.showStatsModeSelectionDialog(campaignData);
            
            // Set up stats mode if selected
            if (enableStats) {
                this.enableStatsMode();
                
                // This is a raw campaign file (not a saved tour), so prompt for new squad member names
                const squadNames = await this.showSquadNameEntryDialog();
                if (squadNames && squadNames.length > 0) {
                    this.squadMembers = squadNames.map(name => ({
                        name: name.trim(),
                        kills: {
                            total: 0,
                            byFaction: {
                                "Terminids": 0,
                                "Automatons": 0,
                                "Illuminate": 0
                            }
                        },
                        samples: 0,
                        deaths: 0,
                        missionsCompleted: 0,
                        status: 'active'
                    })).filter(member => member.name.length > 0);
                }
            }

            // Convert campaign data to tour format
            const tour = {
                name: campaignData.name,
                theme: campaignData.metadata?.theme || 'imported_campaign',
                currentMissionIndex: 0,
                missions: campaignData.missions.map((mission, index) => ({
                    ...mission,
                    id: mission.id || `mission_${index + 1}`
                })),
                metadata: {
                    isImportedCampaign: true,
                    originalCampaignData: campaignData
                },
                failed: false,
                completed: false,
                stats: enableStats ? {
                    totalKills: 0,
                    totalSamples: 0,
                    totalDeaths: 0,
                    operationsCompleted: 0,
                    operationsFailed: 0
                } : null,
                squadStats: enableStats ? this.initializeSquadStats() : null
            };

            // Validate that missions have required data (will regenerate missing planet data)
            await this.validateImportedCampaign(tour);

            // Set as current tour
            this.currentTour = tour;
            // Reset tracking variables for imported tour
            this.currentMissionInOperation = 0;
            this.currentAbsoluteMissionIndex = 0;

            // Show briefing for imported campaign
            this.displayTourBriefing(tour);

            // Hide preferences and show tour display
            document.getElementById('preferences-content').style.display = 'none';
            document.getElementById('tour-display').style.display = 'block';
            
            alert(`Campaign "${campaignData.name}" imported and converted to tour successfully!`);
            
        } catch (error) {
            alert(`Failed to import campaign: ${error.message}`);
            console.error('Campaign import error:', error);
        }
    }

    // Campaign Builder Methods
    setupCampaignBuilderListeners() {
        // Back to generator button
        const backBtn = document.getElementById('back-to-generator');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.handleBackToGenerator());
        }

        // Add operation button
        const addOperationBtn = document.getElementById('add-operation-btn');
        if (addOperationBtn) {
            addOperationBtn.addEventListener('click', () => this.handleAddOperation());
        }

        // Campaign metadata inputs
        const nameInput = document.getElementById('campaign-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => this.handleCampaignMetadataChange('name', e.target.value));
        }

        const descInput = document.getElementById('campaign-description-input');
        if (descInput) {
            descInput.addEventListener('input', (e) => this.handleCampaignMetadataChange('description', e.target.value));
        }

        // Builder action buttons
        const previewBtn = document.getElementById('preview-campaign');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => this.handlePreviewCampaign());
        }

        const exportBtn = document.getElementById('export-custom-campaign');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.handleExportCustomCampaign());
        }

        const importBtn = document.getElementById('import-custom-campaign');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.handleImportCustomCampaign());
        }

        const importFile = document.getElementById('import-custom-file');
        if (importFile) {
            importFile.addEventListener('change', (e) => this.handleCustomFileImport(e));
        }

        const resetBtn = document.getElementById('reset-builder');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.handleResetBuilder());
        }

        // Preview modal buttons
        const closePreview = document.getElementById('close-preview');
        const closePreview2 = document.getElementById('close-preview-2');
        if (closePreview) {
            closePreview.addEventListener('click', () => this.handleClosePreview());
        }
        if (closePreview2) {
            closePreview2.addEventListener('click', () => this.handleClosePreview());
        }

        const startCustomTour = document.getElementById('start-custom-tour');
        if (startCustomTour) {
            startCustomTour.addEventListener('click', () => this.handleStartCustomTour());
        }
    }

    async handleShowCampaignBuilder() {
        try {
            console.log('Opening Campaign Builder...');
            
            // Check if API data is available before allowing the builder to open
            if (!apiService.hasInitialData && !this.lastGameData) {
                console.log('No API data available, fetching data first...');
                
                // Show loading state
                this.showLoading('Loading galactic war data for Campaign Builder...');
                
                try {
                    // Fetch data first
                    const gameData = await apiService.getAllGameData();
                    this.lastGameData = gameData;
                    
                    // Hide loading state
                    this.hideLoading();
                } catch (dataError) {
                    console.error('Failed to fetch API data for Campaign Builder:', dataError);
                    this.hideLoading();
                    this.showError('Cannot open Campaign Builder: Failed to load galactic war data. Please try again.');
                    return;
                }
            }
            
            // Hide current sections
            document.getElementById('campaign-display').style.display = 'none';
            document.getElementById('tour-display').style.display = 'none';
            document.querySelector('.generator-controls').style.display = 'none';
            
            // Show campaign builder
            document.getElementById('campaign-builder-section').style.display = 'block';
            
            // Initialize campaign builder  
            campaignBuilder.initialize();
            
            // If we have game data from a previous generation, use it
            if (this.lastGameData) {
                campaignBuilder.setGameData(this.lastGameData);
            } else {
                // This should not happen anymore due to the check above, but keep as fallback
                const gameData = await apiService.getAllGameData();
                this.lastGameData = gameData;
                campaignBuilder.setGameData(gameData);
            }
            
            // Refresh UI after initialization is complete
            this.refreshBuilderUI();
            
        } catch (error) {
            console.error('Failed to show Campaign Builder:', error);
            document.getElementById('campaign-builder-section').style.display = 'none';
            document.querySelector('.generator-controls').style.display = 'block';
            this.showError('Failed to initialize Campaign Builder. Please try again.');
        }
    }

    handleBackToGenerator() {
        // Show generator controls
        document.querySelector('.generator-controls').style.display = 'block';
        
        // Hide campaign builder
        document.getElementById('campaign-builder-section').style.display = 'none';
        
        // Hide other sections
        document.getElementById('campaign-display').style.display = 'none';
        document.getElementById('tour-display').style.display = 'none';
    }

    async handleAddOperation() {
        const operation = campaignBuilder.addOperation();
        this.renderOperation(operation);
        this.updateValidationStatus();
    }

    handleCampaignMetadataChange(field, value) {
        campaignBuilder.campaign[field] = value;
        this.updateValidationStatus();
    }

    renderOperation(operation) {
        const container = document.getElementById('operations-container');
        
        // Check if operation already exists in DOM to prevent duplicates
        const existingElement = container.querySelector(`[data-operation-id="${operation.id}"]`);
        if (existingElement) {
            // Replace existing element instead of duplicating
            const newOperationElement = this.createOperationElement(operation);
            existingElement.replaceWith(newOperationElement);
        } else {
            // Add new element
            const operationElement = this.createOperationElement(operation);
            container.appendChild(operationElement);
        }
        
        // Ensure modifiers are properly loaded for this operation
        setTimeout(() => {
            console.log('Checking modifiers for new operation...');
            const modifiers = campaignBuilder.getAvailableModifiers();
            if (modifiers.length === 0) {
                console.warn('No modifiers available, trying to refresh...');
                campaignBuilder.refreshModifiersUI();
            }
        }, 50);
    }

    createOperationElement(operation) {
        const div = document.createElement('div');
        div.className = 'operation-card';
        div.dataset.operationId = operation.id;
        div.draggable = true;
        
        div.innerHTML = `
            <div class="operation-header">
                <div class="operation-title">
                    <input type="text" class="operation-name-input" value="${operation.name}" 
                           data-operation-id="${operation.id}" data-field="name" maxlength="50">
                    <button class="delete-operation-btn" data-operation-id="${operation.id}">×</button>
                </div>
                <div class="operation-status ${operation.isValid ? 'valid' : 'invalid'}">
                    ${operation.isValid ? '✓' : '!'}
                </div>
            </div>
            
            <div class="operation-content">
                <div class="operation-row">
                    <div class="operation-field">
                        <label>Faction:</label>
                        <select class="operation-faction-select" data-operation-id="${operation.id}" data-field="faction">
                            <option value="">Select faction...</option>
                        </select>
                    </div>
                    
                    <div class="operation-field">
                        <label>Planet:</label>
                        <select class="operation-planet-select" data-operation-id="${operation.id}" data-field="planet" disabled>
                            <option value="">Select planet...</option>
                        </select>
                    </div>
                    
                    <div class="operation-field">
                        <label>Difficulty:</label>
                        <select class="operation-difficulty-select" data-operation-id="${operation.id}" data-field="difficulty">
                            ${this.generateDifficultyOptions(operation.difficulty)}
                        </select>
                    </div>
                </div>
                
                <div class="operation-row">
                    <div class="operation-field">
                        <label>City/Region:</label>
                        <select class="operation-city-select" data-operation-id="${operation.id}" data-field="city" disabled>
                            <option value="">Surface mission</option>
                        </select>
                    </div>
                    
                    <div class="operation-field">
                        <label class="fallback-label">
                            <input type="checkbox" class="operation-fallback-checkbox" 
                                   data-operation-id="${operation.id}" data-field="enableFallback" 
                                   ${operation.enableFallback ? 'checked' : ''}>
                            Enable Fallback
                        </label>
                        <small>Auto-select similar planet if unavailable</small>
                    </div>
                </div>
                
                <div class="operation-narrative">
                    <div class="narrative-field">
                        <label>Briefing Text:</label>
                        <textarea class="operation-briefing-textarea" data-operation-id="${operation.id}" 
                                  data-field="briefingText" rows="3" 
                                  placeholder="Custom briefing for this operation...">${operation.briefingText}</textarea>
                    </div>
                    
                    <div class="narrative-field">
                        <label>Transition Text:</label>
                        <textarea class="operation-transition-textarea" data-operation-id="${operation.id}" 
                                  data-field="transitionText" rows="2" 
                                  placeholder="Text between this and next operation...">${operation.transitionText}</textarea>
                    </div>
                </div>
                
                <div class="operation-missions">
                    <div class="missions-header">
                        <label>Mission Modifiers:</label>
                        <button type="button" class="randomize-modifiers-btn" data-operation-id="${operation.id}">🎲 Random</button>
                    </div>
                    <div class="missions-list" data-operation-id="${operation.id}">
                        ${this.renderMissionsList(operation)}
                    </div>
                </div>
                
                <div class="operation-objectives">
                    <div class="objective-field">
                        <label>Primary Objective Title:</label>
                        <input type="text" class="operation-primary-title-input" data-operation-id="${operation.id}" 
                               data-field="primaryObjectiveTitle" maxlength="100"
                               placeholder="Leave empty to use generated objective" value="${operation.primaryObjectiveTitle || ''}">
                    </div>
                    
                    <div class="objective-field">
                        <label>Primary Objective Description:</label>
                        <textarea class="operation-primary-description-textarea" data-operation-id="${operation.id}" 
                                  data-field="primaryObjectiveDescription" rows="2" 
                                  placeholder="Leave empty to use generated objective">${operation.primaryObjectiveDescription || ''}</textarea>
                    </div>
                    
                    <div class="objective-field">
                        <label>Secondary Objectives Description:</label>
                        <textarea class="operation-secondary-description-textarea" data-operation-id="${operation.id}" 
                                  data-field="secondaryObjectiveDescription" rows="2" 
                                  placeholder="Leave empty to use generated objectives">${operation.secondaryObjectiveDescription || ''}</textarea>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for this operation
        this.setupOperationListeners(div, operation);
        
        return div;
    }

    generateDifficultyOptions(selectedDifficulty) {
        const difficulties = [
            { value: 1, name: 'Trivial' },
            { value: 2, name: 'Easy' },
            { value: 3, name: 'Medium' },
            { value: 4, name: 'Challenging' },
            { value: 5, name: 'Hard' },
            { value: 6, name: 'Extreme' },
            { value: 7, name: 'Suicide Mission' },
            { value: 8, name: 'Impossible' },
            { value: 9, name: 'Helldive' },
            { value: 10, name: 'Super Helldive' }
        ];

        return difficulties.map(diff => 
            `<option value="${diff.value}" ${diff.value === selectedDifficulty ? 'selected' : ''}>
                ${diff.value} - ${diff.name}
            </option>`
        ).join('');
    }

    renderMissionsList(operation) {
        if (!operation.missions || operation.missions.length === 0) {
            return '<div class="no-missions">No missions (select difficulty first)</div>';
        }

        const availableModifiers = campaignBuilder.getAvailableModifiers();
        console.log('renderMissionsList - availableModifiers:', availableModifiers);
        
        if (availableModifiers.length === 0) {
            return '<div class="no-missions">No modifiers available - check console for errors</div>';
        }
        
        return operation.missions.map(mission => {
            const modifierCheckboxes = availableModifiers.map(modifier => {
                const isChecked = mission.modifiers.includes(modifier.name);
                return `
                    <label class="modifier-checkbox">
                        <input type="checkbox" 
                               data-operation-id="${operation.id}" 
                               data-mission-id="${mission.id}" 
                               data-modifier="${modifier.name}" 
                               ${isChecked ? 'checked' : ''}>
                        <span class="modifier-name">${modifier.name}</span>
                        <span class="modifier-description">${modifier.description}</span>
                    </label>
                `;
            }).join('');

            const modifierCount = mission.modifiers.length;
            const modifierSummary = modifierCount > 0 ? 
                `${modifierCount} modifier${modifierCount !== 1 ? 's' : ''}` : 
                'No modifiers';

            return `
                <div class="mission-card" data-mission-id="${mission.id}">
                    <div class="mission-header">
                        <h4>${mission.name}</h4>
                        <span class="modifier-count">${modifierSummary}</span>
                        <button type="button" class="toggle-modifiers-btn" data-mission-id="${mission.id}">
                            <span class="toggle-icon">▶</span>
                        </button>
                    </div>
                    <div class="mission-modifiers" data-mission-id="${mission.id}" style="display: none;">
                        <div class="modifier-grid">
                            ${modifierCheckboxes}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    async setupOperationListeners(operationElement, operation) {
        // Setup all listeners for operation controls
        const operationId = operation.id;
        
        try {
            // Name input
            const nameInput = operationElement.querySelector('.operation-name-input');
            nameInput.addEventListener('input', (e) => this.handleOperationChange(operationId, 'name', e.target.value));
            
            // Delete button
            const deleteBtn = operationElement.querySelector('.delete-operation-btn');
            deleteBtn.addEventListener('click', () => this.handleDeleteOperation(operationId));
            
            // Faction select - populate synchronously to avoid loops
            const factionSelect = operationElement.querySelector('.operation-faction-select');
            this.populateFactionOptionsSync(factionSelect);
            if (operation.faction) factionSelect.value = operation.faction;
            factionSelect.addEventListener('change', (e) => this.handleFactionChange(operationId, e.target.value));
            
            // Planet select
            const planetSelect = operationElement.querySelector('.operation-planet-select');
            if (operation.faction) {
                this.populatePlanetOptionsSync(planetSelect, operation.faction);
                if (operation.planet) {
                    planetSelect.value = operation.planet ? operation.planet.id : '';
                }
            }
            planetSelect.addEventListener('change', (e) => this.handlePlanetChange(operationId, e.target.value));
            
            // Difficulty select
            const difficultySelect = operationElement.querySelector('.operation-difficulty-select');
            difficultySelect.addEventListener('change', (e) => this.handleOperationChange(operationId, 'difficulty', parseInt(e.target.value)));
            
            // City select
            const citySelect = operationElement.querySelector('.operation-city-select');
            if (operation.planet) {
                // Don't populate cities immediately to avoid API loop
                citySelect.disabled = false;
            }
            citySelect.addEventListener('change', (e) => this.handleCityChange(operationId, e.target.value));
            
            // Fallback checkbox
            const fallbackCheck = operationElement.querySelector('.operation-fallback-checkbox');
            fallbackCheck.addEventListener('change', (e) => this.handleOperationChange(operationId, 'enableFallback', e.target.checked));
            
            // Narrative textareas
            const briefingText = operationElement.querySelector('.operation-briefing-textarea');
            briefingText.addEventListener('input', (e) => this.handleOperationChange(operationId, 'briefingText', e.target.value));
            
            const transitionText = operationElement.querySelector('.operation-transition-textarea');
            transitionText.addEventListener('input', (e) => this.handleOperationChange(operationId, 'transitionText', e.target.value));
            
            // Objective inputs
            const primaryTitleInput = operationElement.querySelector('.operation-primary-title-input');
            primaryTitleInput.addEventListener('input', (e) => this.handleOperationChange(operationId, 'primaryObjectiveTitle', e.target.value));
            
            const primaryDescriptionText = operationElement.querySelector('.operation-primary-description-textarea');
            primaryDescriptionText.addEventListener('input', (e) => this.handleOperationChange(operationId, 'primaryObjectiveDescription', e.target.value));
            
            const secondaryDescriptionText = operationElement.querySelector('.operation-secondary-description-textarea');
            secondaryDescriptionText.addEventListener('input', (e) => this.handleOperationChange(operationId, 'secondaryObjectiveDescription', e.target.value));
            
            // Mission modifier controls
            const randomizeBtn = operationElement.querySelector('.randomize-modifiers-btn');
            if (randomizeBtn) {
                randomizeBtn.addEventListener('click', () => this.handleRandomizeModifiers(operationId));
            }
            
            // Toggle modifier sections
            const toggleButtons = operationElement.querySelectorAll('.toggle-modifiers-btn');
            toggleButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const missionId = btn.dataset.missionId;
                    this.toggleMissionModifiers(operationId, missionId);
                });
            });
            
            // Modifier checkboxes
            const modifierCheckboxes = operationElement.querySelectorAll('.modifier-checkbox input[type="checkbox"]');
            modifierCheckboxes.forEach(checkbox => {
                checkbox.addEventListener('change', (e) => {
                    const missionId = e.target.dataset.missionId;
                    const modifier = e.target.dataset.modifier;
                    const isChecked = e.target.checked;
                    this.handleModifierChange(operationId, missionId, modifier, isChecked);
                });
            });
            
            // Drag and drop
            operationElement.addEventListener('dragstart', (e) => this.handleDragStart(e, operationId));
            operationElement.addEventListener('dragover', (e) => this.handleDragOver(e));
            operationElement.addEventListener('drop', (e) => this.handleDrop(e, operationId));
        } catch (error) {
            console.error('Error setting up operation listeners:', error);
        }
    }

    populateFactionOptionsSync(selectElement) {
        // Just use the same hardcoded factions as the working generator
        const factions = ['Terminids', 'Automatons', 'Illuminate'];
        selectElement.innerHTML = '<option value="">Select faction...</option>';
        factions.forEach(faction => {
            const option = document.createElement('option');
            option.value = faction;
            option.textContent = faction;
            selectElement.appendChild(option);
        });
    }

    async populateFactionOptions(selectElement) {
        try {
            const factions = await apiService.getAvailableFactionsAsync();
            selectElement.innerHTML = '<option value="">Select faction...</option>';
            factions.forEach(faction => {
                const option = document.createElement('option');
                option.value = faction;
                option.textContent = faction;
                selectElement.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to populate faction options:', error);
        }
    }

    async populatePlanetOptionsSync(selectElement, faction) {
        try {
            // Use EXACT same logic as working populatePlanetOptions
            const gameData = await apiService.getAllGameData();
            const planets = gameData.planets;
            const enemyPlanets = apiService.getEnemyPlanets(planets);
            
            // Filter by the specified faction (same logic as working method)
            let availablePlanets = enemyPlanets;
            if (faction && faction !== 'any') {
                availablePlanets = enemyPlanets.filter(planet => 
                    apiService.getCurrentEnemy(planet) === faction &&
                    (planet.liberation < 100) // Only show planets that aren't fully liberated
                );
            }
            
            // Sort planets alphabetically
            availablePlanets.sort((a, b) => a.name.localeCompare(b.name));
            
            console.log(`CAMPAIGN BUILDER DEBUG: Found ${availablePlanets.length} planets for faction ${faction}:`);
            availablePlanets.forEach(planet => {
                console.log(`- ${planet.name}: liberation=${planet.liberation}%, owner=${planet.currentOwner}, disabled=${planet.disabled}, hasRegions=${planet.availableRegions?.length || 0}`);
            });
            
            selectElement.innerHTML = '<option value="">Select planet...</option>';
            
            // Add "Any" option for dynamic planet selection
            const anyOption = document.createElement('option');
            anyOption.value = 'any';
            anyOption.textContent = 'Any Available Planet';
            selectElement.appendChild(anyOption);
            
            availablePlanets.forEach(planet => {
                const option = document.createElement('option');
                option.value = planet.id;
                const faction = apiService.getCurrentEnemy(planet);
                option.textContent = `${planet.name} (${faction})`;
                selectElement.appendChild(option);
            });
            selectElement.disabled = false;
        } catch (error) {
            console.error('Failed to populate planet options:', error);
            selectElement.disabled = true;
        }
    }

    async populatePlanetOptions(selectElement, faction) {
        try {
            const planets = apiService.getPlanetsByFactionForBuilder(faction);
            selectElement.innerHTML = '<option value="">Select planet...</option>';
            planets.forEach(planet => {
                const option = document.createElement('option');
                option.value = planet.id;
                option.textContent = `${planet.name} (${planet.biome.name})`;
                selectElement.appendChild(option);
            });
            selectElement.disabled = false;
        } catch (error) {
            console.error('Failed to populate planet options:', error);
            selectElement.disabled = true;
        }
    }

    async populateCityOptions(selectElement, planetId) {
        try {
            // Get fresh data like the working generator methods do
            const gameData = await apiService.getAllGameData();
            const planets = gameData.planets;
            const planet = planets.find(p => p.id == planetId);
            
            if (!planet) {
                selectElement.innerHTML = '<option value="">Surface mission</option>';
                selectElement.disabled = true;
                return;
            }
            
            // Check if planet has available regions (EXACT same logic as campaign generator)
            const hasRegions = (planet.availableRegions && planet.availableRegions.length > 0) ||
                              (planet.activeRegions && planet.activeRegions.length > 0) ||
                              (planet.regions && planet.regions.filter(r => r.isAvailable).length > 0);
            
            console.log(`CITY DEBUG for ${planet.name}:`);
            console.log(`- availableRegions: ${planet.availableRegions?.length || 0}`);
            console.log(`- activeRegions: ${planet.activeRegions?.length || 0}`);
            console.log(`- regions with isAvailable: ${planet.regions?.filter(r => r.isAvailable).length || 0}`);
            console.log(`- hasRegions: ${hasRegions}`);
            console.log(`- cityMappings available: ${!!window.cityMappings}`);
            
            selectElement.innerHTML = '<option value="">Surface mission</option>';
            
            // Add "Any" option for dynamic city/surface selection
            const anyOption = document.createElement('option');
            anyOption.value = 'any';
            anyOption.textContent = 'Any Available (City or Surface)';
            selectElement.appendChild(anyOption);
            
            if (hasRegions && window.cityMappings) {
                // Use the EXACT same approach as the working generator
                const regionCount = planet.availableRegions ? planet.availableRegions.length : 
                                  planet.activeRegions ? planet.activeRegions.length :
                                  planet.regions ? planet.regions.filter(r => r.isAvailable).length : 1;
                const cities = window.cityMappings.getCitiesForPlanet(planet.name, regionCount);
                console.log(`- Found ${cities.length} city mappings for ${planet.name} with regionCount=${regionCount}`);
                if (cities.length > 0) {
                    cities.forEach(city => {
                        const option = document.createElement('option');
                        option.value = city.index;
                        option.textContent = city.name;
                        selectElement.appendChild(option);
                    });
                }
            }
            
            selectElement.disabled = false;
        } catch (error) {
            console.error('Failed to populate city options:', error);
            selectElement.disabled = true;
        }
    }

    handleOperationChange(operationId, field, value) {
        campaignBuilder.updateOperation(operationId, { [field]: value });
        
        // If difficulty changed, refresh the missions UI
        if (field === 'difficulty') {
            this.refreshOperationMissions(operationId);
        }
        
        this.updateOperationStatus(operationId);
        this.updateValidationStatus();
    }

    async handleFactionChange(operationId, faction) {
        const operation = campaignBuilder.getOperation(operationId);
        if (operation) {
            operation.faction = faction;
            operation.planet = null; // Reset planet when faction changes
            operation.city = null; // Reset city when faction changes
            operation.validate();
            
            // Update UI
            const operationElement = document.querySelector(`[data-operation-id="${operationId}"]`);
            const planetSelect = operationElement.querySelector('.operation-planet-select');
            const citySelect = operationElement.querySelector('.operation-city-select');
            
            if (faction) {
                await this.populatePlanetOptionsSync(planetSelect, faction);
            } else {
                planetSelect.innerHTML = '<option value="">Select planet...</option>';
                planetSelect.disabled = true;
            }
            
            citySelect.innerHTML = '<option value="">Surface mission</option>';
            citySelect.disabled = true;
            
            this.updateOperationStatus(operationId);
            this.updateValidationStatus();
        }
    }

    async handlePlanetChange(operationId, planetId) {
        const operation = campaignBuilder.getOperation(operationId);
        if (operation && planetId) {
            // Use cached planets from campaign builder to avoid API call
            let planet = null;
            for (const [faction, planets] of campaignBuilder.availablePlanets) {
                planet = planets.find(p => p.id == planetId);
                if (planet) break;
            }
            
            if (!planet) {
                console.warn(`Planet with ID ${planetId} not found in cached data`);
                return;
            }
            
            operation.planet = planet;
            operation.city = null; // Reset city when planet changes
            operation.validate();
            
            // Update city options using the working city population method
            const operationElement = document.querySelector(`[data-operation-id="${operationId}"]`);
            const citySelect = operationElement.querySelector('.operation-city-select');
            
            // Use the same method that works for city population
            await this.populateCityOptions(citySelect, planetId);
            
            this.updateOperationStatus(operationId);
            this.updateValidationStatus();
        }
    }

    handleCityChange(operationId, cityId) {
        const operation = campaignBuilder.getOperation(operationId);
        if (operation) {
            if (cityId) {
                // Find city in available cities using planet data and city index
                const availableCities = campaignBuilder.getAvailableCitiesForPlanet(operation.planet);
                operation.city = availableCities.find(c => c.index == cityId);
                console.log(`Selected city: ${operation.city?.name || 'Not found'} on ${operation.planet.name}`);
            } else {
                operation.city = null;
            }
            operation.validate();
            this.updateOperationStatus(operationId);
            this.updateValidationStatus();
        }
    }

    handleDeleteOperation(operationId) {
        campaignBuilder.removeOperation(operationId);
        const operationElement = document.querySelector(`[data-operation-id="${operationId}"]`);
        if (operationElement) {
            operationElement.remove();
        }
        this.updateValidationStatus();
    }

    updateOperationStatus(operationId) {
        const operation = campaignBuilder.getOperation(operationId);
        const operationElement = document.querySelector(`[data-operation-id="${operationId}"]`);
        if (operation && operationElement) {
            const statusElement = operationElement.querySelector('.operation-status');
            statusElement.className = `operation-status ${operation.isValid ? 'valid' : 'invalid'}`;
            statusElement.textContent = operation.isValid ? '✓' : '!';
        }
    }

    updateValidationStatus() {
        const validation = campaignBuilder.validateCampaign();
        const validationElement = document.getElementById('builder-validation');
        
        if (validation.errors.length > 0 || validation.warnings.length > 0) {
            validationElement.style.display = 'block';
            validationElement.innerHTML = `
                ${validation.errors.length > 0 ? `
                    <div class="validation-errors">
                        <strong>Errors:</strong>
                        <ul>${validation.errors.map(error => `<li>${error}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                ${validation.warnings.length > 0 ? `
                    <div class="validation-warnings">
                        <strong>Warnings:</strong>
                        <ul>${validation.warnings.map(warning => `<li>${warning}</li>`).join('')}</ul>
                    </div>
                ` : ''}
            `;
        } else {
            validationElement.style.display = 'none';
        }
    }

    // Mission modifier handlers
    handleRandomizeModifiers(operationId) {
        const success = campaignBuilder.assignRandomModifiers(operationId, 1);
        if (success) {
            this.refreshOperationMissions(operationId);
        }
    }

    handleModifierChange(operationId, missionId, modifier, isChecked) {
        if (isChecked) {
            campaignBuilder.addModifierToMission(operationId, missionId, modifier);
        } else {
            campaignBuilder.removeModifierFromMission(operationId, missionId, modifier);
        }
        this.updateMissionModifierCount(operationId, missionId);
    }

    toggleMissionModifiers(operationId, missionId) {
        const modifiersSection = document.querySelector(`[data-operation-id="${operationId}"] .mission-modifiers[data-mission-id="${missionId}"]`);
        const toggleIcon = document.querySelector(`[data-operation-id="${operationId}"] .toggle-modifiers-btn[data-mission-id="${missionId}"] .toggle-icon`);
        
        if (modifiersSection && toggleIcon) {
            const isVisible = modifiersSection.style.display !== 'none';
            modifiersSection.style.display = isVisible ? 'none' : 'block';
            toggleIcon.textContent = isVisible ? '▶' : '▼';
        }
    }

    updateMissionModifierCount(operationId, missionId) {
        const mission = campaignBuilder.getMission(operationId, missionId);
        if (mission) {
            const countElement = document.querySelector(`[data-operation-id="${operationId}"] .mission-card[data-mission-id="${missionId}"] .modifier-count`);
            if (countElement) {
                const modifierCount = mission.modifiers.length;
                const modifierSummary = modifierCount > 0 ? 
                    `${modifierCount} modifier${modifierCount !== 1 ? 's' : ''}` : 
                    'No modifiers';
                countElement.textContent = modifierSummary;
            }
        }
    }

    refreshOperationMissions(operationId) {
        const operation = campaignBuilder.getOperation(operationId);
        if (operation) {
            const missionsListElement = document.querySelector(`[data-operation-id="${operationId}"] .missions-list`);
            if (missionsListElement) {
                missionsListElement.innerHTML = this.renderMissionsList(operation);
                // Re-attach event listeners for the new elements
                const operationElement = document.querySelector(`[data-operation-id="${operationId}"]`);
                this.setupMissionListeners(operationElement, operation);
            }
        }
    }

    setupMissionListeners(operationElement, operation) {
        const operationId = operation.id;
        
        // Toggle modifier sections
        const toggleButtons = operationElement.querySelectorAll('.toggle-modifiers-btn');
        toggleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const missionId = btn.dataset.missionId;
                this.toggleMissionModifiers(operationId, missionId);
            });
        });
        
        // Modifier checkboxes
        const modifierCheckboxes = operationElement.querySelectorAll('.modifier-checkbox input[type="checkbox"]');
        modifierCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const missionId = e.target.dataset.missionId;
                const modifier = e.target.dataset.modifier;
                const isChecked = e.target.checked;
                this.handleModifierChange(operationId, missionId, modifier, isChecked);
            });
        });
    }

    refreshBuilderUI() {
        // Safety check: ensure campaign builder is initialized
        if (!campaignBuilder || !campaignBuilder.campaign) {
            console.error('Campaign builder not properly initialized');
            return;
        }
        
        // Update campaign metadata with validation
        const nameInput = document.getElementById('campaign-name-input');
        const descInput = document.getElementById('campaign-description-input');
        
        if (nameInput) {
            nameInput.value = campaignBuilder.campaign.name || '';
        }
        if (descInput) {
            descInput.value = campaignBuilder.campaign.description || '';
        }
        
        // Clear and rebuild operations
        const container = document.getElementById('operations-container');
        if (!container) {
            console.error('Operations container not found');
            return;
        }
        
        container.innerHTML = '';
        
        // Validate operations array before processing
        if (!Array.isArray(campaignBuilder.campaign.operations)) {
            console.error('Campaign operations is not a valid array');
            campaignBuilder.campaign.operations = [];
        }
        
        // Re-index operations to ensure consistency
        campaignBuilder.campaign.operations.forEach((operation, index) => {
            if (operation.index !== index) {
                console.log(`Fixing operation index: ${operation.index} -> ${index}`);
                operation.index = index;
            }
            this.renderOperation(operation);
        });
        
        this.updateValidationStatus();
        
        console.log(`Campaign builder UI refreshed with ${campaignBuilder.campaign.operations.length} operations`);
    }

    async handlePreviewCampaign() {
        try {
            const campaign = await campaignBuilder.exportCampaign();
            this.showCampaignPreview(campaign);
        } catch (error) {
            console.error('Failed to preview campaign:', error);
            this.showError(error.message);
        }
    }

    showCampaignPreview(campaign) {
        const modal = document.getElementById('builder-preview-modal');
        const content = document.getElementById('preview-content');
        
        content.innerHTML = `
            <div class="preview-campaign">
                <h4>${campaign.name}</h4>
                <p class="preview-description">${campaign.description}</p>
                <div class="preview-operations">
                    ${campaign.missions.map((mission, index) => `
                        <div class="preview-operation">
                            <h5>Operation ${index + 1}: ${mission.name}</h5>
                            <div class="preview-details">
                                <span class="preview-faction">Enemy: ${mission.faction}</span>
                                <span class="preview-planet">Planet: ${mission.planet.name}</span>
                                <span class="preview-difficulty">Difficulty: ${mission.difficulty.level} - ${mission.difficulty.name}</span>
                                ${mission.city ? `<span class="preview-city">Target: ${mission.city.name}</span>` : ''}
                                ${mission.enableFallback ? '<span class="preview-fallback">✓ Fallback enabled</span>' : ''}
                            </div>
                            ${mission.briefing ? `<p class="preview-briefing">${mission.briefing}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
    }

    handleClosePreview() {
        document.getElementById('builder-preview-modal').style.display = 'none';
    }

    async handleStartCustomTour() {
        try {
            const campaign = await campaignBuilder.exportCampaign();
            
            // Check if stats mode should be enabled
            const enableStats = confirm('Would you like to enable Stats Mode for this custom campaign? This will track squad member statistics throughout the tour.');
            
            if (enableStats) {
                this.statsMode = true;
                this.showStatsSetup(() => {
                    this.startTourFromCampaign(campaign);
                });
            } else {
                this.startTourFromCampaign(campaign);
            }
            
        } catch (error) {
            console.error('Failed to start custom tour:', error);
            this.showError(error.message);
        }
    }

    startTourFromCampaign(campaign) {
        // Convert campaign to tour format and start
        this.currentTour = {
            ...campaign,
            currentMissionIndex: 0,
            isCustomCampaign: true
        };
        
        // Close preview and builder
        this.handleClosePreview();
        this.handleBackToGenerator();
        
        // Start the tour
        this.showCurrentMission();
    }

    async handleExportCustomCampaign() {
        try {
            const campaign = await campaignBuilder.exportCampaign();
            this.downloadJSON(campaign, `${campaign.name.replace(/[^a-z0-9]/gi, '_')}_campaign.json`);
        } catch (error) {
            console.error('Failed to export campaign:', error);
            this.showError(error.message);
        }
    }

    handleImportCustomCampaign() {
        document.getElementById('import-custom-file').click();
    }

    handleCustomFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const campaignData = JSON.parse(e.target.result);
                campaignBuilder.importCampaign(campaignData);
                this.refreshBuilderUI();
                this.showSuccess('Campaign imported successfully!');
            } catch (error) {
                console.error('Failed to import campaign:', error);
                this.showError('Failed to import campaign. Please check the file format.');
            }
        };
        reader.readAsText(file);
        
        // Clear the input
        event.target.value = '';
    }

    handleResetBuilder() {
        if (confirm('Are you sure you want to reset the campaign builder? All current progress will be lost.')) {
            campaignBuilder.reset();
            this.refreshBuilderUI();
        }
    }

    // Drag and drop handlers
    handleDragStart(e, operationId) {
        campaignBuilder.startDrag(operationId);
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    handleDrop(e, targetOperationId) {
        e.preventDefault();
        const draggedElement = document.querySelector('[style*="opacity: 0.5"]');
        if (draggedElement) {
            draggedElement.style.opacity = '';
        }
        
        if (campaignBuilder.dropOperation(targetOperationId)) {
            this.refreshBuilderUI();
        }
        
        campaignBuilder.endDrag();
    }

    // Utility methods for Campaign Builder
    showError(message) {
        const errorSection = document.getElementById('error');
        const errorMessage = document.getElementById('error-message');
        if (errorSection && errorMessage) {
            errorMessage.textContent = message;
            errorSection.style.display = 'block';
            setTimeout(() => {
                errorSection.style.display = 'none';
            }, 5000);
        } else {
            alert('Error: ' + message);
        }
    }

    showSuccess(message) {
        // Create a temporary success notification
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 10000;
            font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Results Viewer Methods
    setupResultsViewerListeners() {
        // Back to generator button
        const backToGeneratorBtn = document.getElementById('back-to-generator-results');
        if (backToGeneratorBtn) {
            backToGeneratorBtn.addEventListener('click', () => this.handleBackToGeneratorFromResults());
        }

        // Import buttons
        const importSingleBtn = document.getElementById('import-single-results');
        if (importSingleBtn) {
            importSingleBtn.addEventListener('click', () => this.handleImportSingleResults());
        }

        const importMultipleBtn = document.getElementById('import-multiple-results');
        if (importMultipleBtn) {
            importMultipleBtn.addEventListener('click', () => this.handleImportMultipleResults());
        }

        // File inputs
        const importSingleFile = document.getElementById('import-single-results-file');
        if (importSingleFile) {
            importSingleFile.addEventListener('change', () => this.importSingleResults(importSingleFile));
        }

        const importMultipleFile = document.getElementById('import-multiple-results-file');
        if (importMultipleFile) {
            importMultipleFile.addEventListener('change', () => this.importMultipleResults(importMultipleFile));
        }

        // Mode selector buttons
        const singleViewBtn = document.getElementById('single-view-mode');
        if (singleViewBtn) {
            singleViewBtn.addEventListener('click', () => this.switchToSingleView());
        }

        const comparisonViewBtn = document.getElementById('comparison-view-mode');
        if (comparisonViewBtn) {
            comparisonViewBtn.addEventListener('click', () => this.switchToComparisonView());
        }

        // Group management
        const clearAllGroupsBtn = document.getElementById('clear-all-groups');
        if (clearAllGroupsBtn) {
            clearAllGroupsBtn.addEventListener('click', () => this.clearAllGroups());
        }

        // Group name modal
        const confirmGroupNameBtn = document.getElementById('confirm-group-name');
        if (confirmGroupNameBtn) {
            confirmGroupNameBtn.addEventListener('click', () => this.confirmGroupName());
        }

        const cancelGroupNameBtn = document.getElementById('cancel-group-name');
        if (cancelGroupNameBtn) {
            cancelGroupNameBtn.addEventListener('click', () => this.cancelGroupName());
        }

        const groupNameInput = document.getElementById('group-name-input');
        if (groupNameInput) {
            groupNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.confirmGroupName();
                }
            });
        }
    }

    handleShowResultsViewer() {
        // Hide other sections
        document.querySelector('.generator-controls').style.display = 'none';
        document.getElementById('campaign-display').style.display = 'none';
        document.getElementById('tour-display').style.display = 'none';
        document.getElementById('campaign-builder-section').style.display = 'none';
        
        // Show results viewer
        document.getElementById('results-viewer-section').style.display = 'block';

        // Initialize results viewer state
        this.resultsGroups = [];
        this.currentSingleResult = null;
        this.pendingFiles = null;
    }

    handleBackToGeneratorFromResults() {
        // Show generator controls
        document.querySelector('.generator-controls').style.display = 'block';
        
        // Hide results viewer
        document.getElementById('results-viewer-section').style.display = 'none';
        
        // Hide other sections
        document.getElementById('campaign-display').style.display = 'none';
        document.getElementById('tour-display').style.display = 'none';
        document.getElementById('campaign-builder-section').style.display = 'none';

        // Clear results viewer state
        this.resultsGroups = [];
        this.currentSingleResult = null;
        this.pendingFiles = null;
        document.getElementById('results-display-section').style.display = 'none';
    }

    handleImportSingleResults() {
        const fileInput = document.getElementById('import-single-results-file');
        if (fileInput) {
            fileInput.click();
        }
    }

    handleImportMultipleResults() {
        const fileInput = document.getElementById('import-multiple-results-file');
        if (fileInput) {
            fileInput.click();
        }
    }

    importSingleResults(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const resultData = JSON.parse(e.target.result);
                
                // Validate result data structure
                if (!resultData.version || resultData.type !== 'results' || !resultData.tourData || !resultData.squadStats) {
                    throw new Error('Invalid results file format');
                }

                this.currentSingleResult = resultData;
                this.displaySingleResult(resultData);
                
                // Show results display section and switch to single view
                document.getElementById('results-display-section').style.display = 'block';
                this.switchToSingleView();
                
                alert('Results imported successfully!');
                
            } catch (error) {
                alert(`Failed to import results: ${error.message}`);
                console.error('Results import error:', error);
            }
            
            // Clear file input
            fileInput.value = '';
        };
        
        reader.readAsText(file);
    }

    importMultipleResults(fileInput) {
        const files = Array.from(fileInput.files);
        if (files.length === 0) return;

        this.pendingFiles = [];

        let processedFiles = 0;
        const validResults = [];

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const resultData = JSON.parse(e.target.result);
                    
                    // Validate result data structure
                    if (!resultData.version || resultData.type !== 'results' || !resultData.tourData || !resultData.squadStats) {
                        throw new Error(`Invalid results file format: ${file.name}`);
                    }

                    validResults.push(resultData);
                    
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    alert(`Failed to import ${file.name}: ${error.message}`);
                }
                
                processedFiles++;
                
                // When all files are processed
                if (processedFiles === files.length) {
                    if (validResults.length > 0) {
                        this.pendingFiles = validResults;
                        this.showGroupNameModal();
                    } else {
                        alert('No valid results files were found.');
                    }
                }
            };
            
            reader.readAsText(file);
        });

        // Clear file input
        fileInput.value = '';
    }

    showGroupNameModal() {
        document.getElementById('group-name-modal').style.display = 'flex';
        document.getElementById('group-name-input').focus();
    }

    confirmGroupName() {
        const groupNameInput = document.getElementById('group-name-input');
        const groupName = groupNameInput.value.trim();
        
        if (!groupName) {
            alert('Please enter a group name.');
            return;
        }

        if (!this.pendingFiles || this.pendingFiles.length === 0) {
            alert('No files to add to group.');
            this.cancelGroupName();
            return;
        }

        // Add the group
        this.resultsGroups.push({
            name: groupName,
            results: this.pendingFiles
        });

        // Clear pending files and hide modal
        this.pendingFiles = null;
        this.hideGroupNameModal();
        
        // Show results display section and switch to comparison view
        document.getElementById('results-display-section').style.display = 'block';
        this.switchToComparisonView();
        this.updateGroupList();
        this.updateComparisonView();
        
        alert(`Group "${groupName}" added successfully!`);
    }

    cancelGroupName() {
        this.pendingFiles = null;
        this.hideGroupNameModal();
    }

    hideGroupNameModal() {
        document.getElementById('group-name-modal').style.display = 'none';
        document.getElementById('group-name-input').value = '';
    }

    switchToSingleView() {
        // Update mode buttons
        document.getElementById('single-view-mode').classList.add('active');
        document.getElementById('comparison-view-mode').classList.remove('active');
        
        // Show single view, hide comparison view
        document.getElementById('single-result-view').style.display = 'block';
        document.getElementById('comparison-view').style.display = 'none';
    }

    switchToComparisonView() {
        // Update mode buttons
        document.getElementById('single-view-mode').classList.remove('active');
        document.getElementById('comparison-view-mode').classList.add('active');
        
        // Show comparison view, hide single view
        document.getElementById('single-result-view').style.display = 'none';
        document.getElementById('comparison-view').style.display = 'block';
    }

    displaySingleResult(resultData) {
        // Update result name
        document.getElementById('single-result-name').textContent = resultData.tourData.name;
        
        // Update metadata
        const metadataElement = document.getElementById('single-result-metadata');
        metadataElement.innerHTML = `
            <div class="metadata-item">
                <strong>Operations:</strong> ${resultData.tourData.operationsCompleted}
            </div>
            <div class="metadata-item">
                <strong>Factions:</strong> ${resultData.tourData.factions.join(', ')}
            </div>
            <div class="metadata-item">
                <strong>Planets:</strong> ${resultData.tourData.planets.length} planets
            </div>
            <div class="metadata-item">
                <strong>Theme:</strong> ${resultData.tourData.theme || 'Random'}
            </div>
        `;
        
        // Update stats
        const statsElement = document.getElementById('single-result-stats');
        const aggregateStats = resultData.squadStats.aggregateStats;
        const memberStats = resultData.squadStats.memberStats;
        const mvp = resultData.squadStats.mvp;
        
        // Calculate additional metrics
        const kdRatio = aggregateStats.totalDeaths > 0 ? (aggregateStats.totalKills / aggregateStats.totalDeaths).toFixed(2) : aggregateStats.totalKills.toFixed(2);
        const killsPerOp = (aggregateStats.totalKills / resultData.tourData.operationsCompleted).toFixed(1);
        const samplesPerOp = (aggregateStats.totalSamples / resultData.tourData.operationsCompleted).toFixed(1);
        
        let statsHTML = `
            <!-- Summary Cards -->
            <div class="summary-cards">
                <div class="summary-card kills-card">
                    <div class="card-icon">⚔️</div>
                    <div class="card-content">
                        <div class="card-value">${aggregateStats.totalKills}</div>
                        <div class="card-label">Total Kills</div>
                        <div class="card-subtitle">${killsPerOp} per operation</div>
                    </div>
                </div>
                <div class="summary-card samples-card">
                    <div class="card-icon">🧪</div>
                    <div class="card-content">
                        <div class="card-value">${aggregateStats.totalSamples}</div>
                        <div class="card-label">Total Samples</div>
                        <div class="card-subtitle">${samplesPerOp} per operation</div>
                    </div>
                </div>
                <div class="summary-card deaths-card">
                    <div class="card-icon">💀</div>
                    <div class="card-content">
                        <div class="card-value">${aggregateStats.totalDeaths}</div>
                        <div class="card-label">Total Deaths</div>
                        <div class="card-subtitle">K/D: ${kdRatio}</div>
                    </div>
                </div>
            </div>
            
            <div class="stats-section faction-stats">
                <h4>🎯 Faction Kills Breakdown</h4>
                <div class="faction-bars">
                    <div class="faction-bar">
                        <div class="faction-info">
                            <span class="faction-name">🐛 Terminids</span>
                            <span class="faction-value">${aggregateStats.factionKills.Terminids}</span>
                        </div>
                        <div class="faction-progress">
                            <div class="faction-fill terminids" style="width: ${(aggregateStats.factionKills.Terminids / aggregateStats.totalKills * 100).toFixed(1)}%"></div>
                        </div>
                    </div>
                    <div class="faction-bar">
                        <div class="faction-info">
                            <span class="faction-name">🤖 Automatons</span>
                            <span class="faction-value">${aggregateStats.factionKills.Automatons}</span>
                        </div>
                        <div class="faction-progress">
                            <div class="faction-fill automatons" style="width: ${(aggregateStats.factionKills.Automatons / aggregateStats.totalKills * 100).toFixed(1)}%"></div>
                        </div>
                    </div>
                    <div class="faction-bar">
                        <div class="faction-info">
                            <span class="faction-name">👁️ Illuminate</span>
                            <span class="faction-value">${aggregateStats.factionKills.Illuminate}</span>
                        </div>
                        <div class="faction-progress">
                            <div class="faction-fill illuminate" style="width: ${(aggregateStats.factionKills.Illuminate / aggregateStats.totalKills * 100).toFixed(1)}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if (mvp.player) {
            statsHTML += `
                <div class="stats-section mvp-section">
                    <h4>🏆 Most Free Helldiver</h4>
                    <div class="mvp-display">
                        <div class="mvp-trophy">🏆</div>
                        <div class="mvp-info">
                            <div class="mvp-name">${mvp.player}</div>
                            <div class="mvp-score">Score: ${Math.round(mvp.score)}</div>
                            <div class="mvp-subtitle">Outstanding performance in the name of Managed Democracy!</div>
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Add individual member stats
        statsHTML += `<div class="member-stats-grid">`;
        Object.entries(memberStats).forEach(([memberName, stats]) => {
            const memberKD = stats.deaths > 0 ? (stats.kills / stats.deaths).toFixed(2) : stats.kills.toFixed(2);
            const memberScore = stats.kills * 3 + stats.samples * 2 - stats.deaths * 5;
            const isMVP = memberName === mvp.player;
            
            statsHTML += `
                <div class="member-card ${isMVP ? 'mvp-member' : ''}">
                    <div class="member-header">
                        <h5>${isMVP ? '👑 ' : ''}${memberName}</h5>
                        ${isMVP ? '<span class="mvp-badge">MVP</span>' : ''}
                    </div>
                    <div class="member-stats">
                        <div class="member-stat">
                            <span class="stat-icon">⚔️</span>
                            <span class="stat-number">${stats.kills}</span>
                            <span class="stat-text">Kills</span>
                        </div>
                        <div class="member-stat">
                            <span class="stat-icon">💀</span>
                            <span class="stat-number">${stats.deaths}</span>
                            <span class="stat-text">Deaths</span>
                        </div>
                        <div class="member-stat">
                            <span class="stat-icon">🧪</span>
                            <span class="stat-number">${stats.samples}</span>
                            <span class="stat-text">Samples</span>
                        </div>
                    </div>
                    <div class="member-metrics">
                        <span class="metric">K/D: ${memberKD}</span>
                        <span class="metric">Score: ${memberScore}</span>
                    </div>
                </div>
            `;
        });
        statsHTML += `</div>`;
        
        statsElement.innerHTML = statsHTML;
    }

    updateGroupList() {
        const groupListElement = document.getElementById('group-list');
        
        if (this.resultsGroups.length === 0) {
            groupListElement.innerHTML = '<p style="color: rgba(255,255,255,0.6);">No groups loaded</p>';
            return;
        }
        
        let groupsHTML = '';
        this.resultsGroups.forEach((group, index) => {
            groupsHTML += `
                <div class="group-tag">
                    <span>${group.name} (${group.results.length} results)</span>
                    <button class="remove-group" onclick="app.removeGroup(${index})" title="Remove group">×</button>
                </div>
            `;
        });
        
        groupListElement.innerHTML = groupsHTML;
    }

    removeGroup(index) {
        if (index >= 0 && index < this.resultsGroups.length) {
            const removedGroup = this.resultsGroups.splice(index, 1)[0];
            this.updateGroupList();
            this.updateComparisonView();
            alert(`Group "${removedGroup.name}" removed.`);
        }
    }

    clearAllGroups() {
        if (this.resultsGroups.length === 0) {
            return;
        }
        
        if (confirm('Are you sure you want to clear all groups? This cannot be undone.')) {
            this.resultsGroups = [];
            this.updateGroupList();
            this.updateComparisonView();
            alert('All groups cleared.');
        }
    }

    updateComparisonView() {
        const comparisonStatsElement = document.getElementById('comparison-stats');
        
        if (this.resultsGroups.length === 0) {
            comparisonStatsElement.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.6);">Import multiple results to compare groups</p>';
            return;
        }
        
        // Calculate aggregated stats for each group
        const groupStats = this.resultsGroups.map(group => {
            const aggregated = {
                name: group.name,
                totalKills: 0,
                totalDeaths: 0,
                totalSamples: 0,
                totalOperations: 0,
                totalResults: group.results.length,
                factionKills: { Terminids: 0, Automatons: 0, Illuminate: 0 }
            };
            
            group.results.forEach(result => {
                const stats = result.squadStats.aggregateStats;
                aggregated.totalKills += stats.totalKills || 0;
                aggregated.totalDeaths += stats.totalDeaths || 0;
                aggregated.totalSamples += stats.totalSamples || 0;
                aggregated.totalOperations += result.tourData.operationsCompleted || 0;
                
                Object.keys(aggregated.factionKills).forEach(faction => {
                    aggregated.factionKills[faction] += stats.factionKills[faction] || 0;
                });
            });
            
            // Calculate group score: (kills * 3 + samples * 2 - deaths * 5) / operations
            aggregated.score = aggregated.totalOperations > 0 ? 
                (aggregated.totalKills * 3 + aggregated.totalSamples * 2 - aggregated.totalDeaths * 5) / aggregated.totalOperations : 0;
            
            return aggregated;
        });
        
        // Sort groups by score (highest first) and add rankings
        groupStats.sort((a, b) => b.score - a.score);
        groupStats.forEach((group, index) => {
            group.rank = index + 1;
            group.rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        });
        
        // Generate ranking summary
        let summaryHTML = '';
        if (groupStats.length >= 2) {
            summaryHTML = `
                <div class="ranking-summary">
                    <h4>🏆 Top 3</h4>
                    <div class="ranking-podium">
                        ${groupStats.slice(0, 3).map((group, index) => `
                            <div class="podium-position position-${index + 1}">
                                <div class="podium-rank">${group.rankIcon}</div>
                                <div class="podium-name">${group.name}</div>
                                <div class="podium-score">${group.score.toFixed(1)}</div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="ranking-explanation">
                        <small>Scoring: (Kills × 3 + Samples × 2 - Deaths × 5) ÷ Operations</small>
                    </div>
                </div>
            `;
        }
        
        // Generate comparison table
        let tableHTML = `
            ${summaryHTML}
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Group</th>
                        <th>Score</th>
                        <th>Results</th>
                        <th>Operations</th>
                        <th>Total Kills</th>
                        <th>Total Deaths</th>
                        <th>Total Samples</th>
                        <th>Terminids</th>
                        <th>Automatons</th>
                        <th>Illuminate</th>
                        <th>K/D Ratio</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        groupStats.forEach(stats => {
            const kdRatio = stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills.toFixed(2);
            const scoreDisplay = stats.score.toFixed(1);
            const rankClass = stats.rank <= 3 ? 'top-rank' : '';
            
            tableHTML += `
                <tr class="${rankClass}">
                    <td class="rank-cell"><span class="rank-icon">${stats.rankIcon}</span></td>
                    <td><strong>${stats.name}</strong></td>
                    <td class="score-cell"><strong>${scoreDisplay}</strong></td>
                    <td>${stats.totalResults}</td>
                    <td>${stats.totalOperations}</td>
                    <td>${stats.totalKills}</td>
                    <td>${stats.totalDeaths}</td>
                    <td>${stats.totalSamples}</td>
                    <td>${stats.factionKills.Terminids}</td>
                    <td>${stats.factionKills.Automatons}</td>
                    <td>${stats.factionKills.Illuminate}</td>
                    <td>${kdRatio}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                </tbody>
            </table>
        `;
        
        comparisonStatsElement.innerHTML = tableHTML;
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
