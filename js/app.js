class App {
    constructor() {
        this.isInitialized = false;
        this.preferences = this.loadPreferences();
        this.tourMode = true; // Always start with tour mode enabled
        this.currentTour = null;
        this.legaciesMode = false;
        this.characterMode = false;
        this.squadMembers = [];
        this.characterLegacies = []; // For tracking individual character histories
        this.pendingDeathNotes = [];
        this.livesConfig = {
            mode: 'default',
            livesPerCycle: 2,
            missionCycle: 3
        };
        // Background data loading state
        this.backgroundDataLoading = false;
        this.backgroundDataReady = false;
        this.backgroundDataError = null;
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

        // Legacies mode handlers
        this.setupLegaciesModeListeners();

        // Mission reroll handlers use onclick in HTML
    }

    setupPreferenceListeners() {
        const preferenceIds = [
            'campaign-length', 'faction-preference', 'difficulty-preference', 'biome-preference',
            'mission-type-preference', 'target-type-preference', 'tour-length', 'tour-theme', 'tour-faction', 'tour-difficulty', 'tour-faction-preference', 'tour-mission-type-preference', 'tour-planet', 'lives-mode'
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

        // Custom lives inputs
        const customLivesCount = document.getElementById('custom-lives-count');
        const customMissionCycle = document.getElementById('custom-mission-cycle');
        if (customLivesCount) {
            customLivesCount.addEventListener('input', () => {
                this.updateCustomLivesDisplay();
                this.updateCustomLivesExplanation();
                this.savePreferences();
            });
        }
        if (customMissionCycle) {
            customMissionCycle.addEventListener('input', () => {
                this.updateCustomLivesDisplay();
                this.updateCustomLivesExplanation();
                this.savePreferences();
            });
        }

        // Tour theme change handler to show/hide faction selection
        const tourThemeSelect = document.getElementById('tour-theme');
        if (tourThemeSelect) {
            tourThemeSelect.addEventListener('change', (e) => this.handleTourThemeChange(e));
        }

        // Tour faction preference change handler to update planet list
        const tourFactionPreferenceSelect = document.getElementById('tour-faction-preference');
        if (tourFactionPreferenceSelect) {
            tourFactionPreferenceSelect.addEventListener('change', () => {
                const tourTheme = document.getElementById('tour-theme')?.value;
                if (tourTheme === 'single_planet') {
                    this.populatePlanetOptions();
                }
            });
        }

        // Lives mode change handler
        const livesModeSelect = document.getElementById('lives-mode');
        if (livesModeSelect) {
            livesModeSelect.addEventListener('change', (e) => this.handleLivesModeChange(e));
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

    setupLegaciesModeListeners() {
        // Legacies mode checkbox
        const legaciesCheckbox = document.getElementById('legacies-mode-checkbox');
        if (legaciesCheckbox) {
            legaciesCheckbox.addEventListener('change', (e) => this.handleLegaciesModeToggle(e));
        }

        // Character mode checkbox
        const characterCheckbox = document.getElementById('character-mode-checkbox');
        if (characterCheckbox) {
            characterCheckbox.addEventListener('change', (e) => this.handleCharacterModeToggle(e));
        }

        // Death tracking dialog buttons
        const confirmCasualtiesBtn = document.getElementById('confirm-casualties');
        const noCasualtiesBtn = document.getElementById('no-casualties');
        
        if (confirmCasualtiesBtn) {
            confirmCasualtiesBtn.addEventListener('click', () => this.handleConfirmCasualties());
        }
        if (noCasualtiesBtn) {
            noCasualtiesBtn.addEventListener('click', () => this.handleNoCasualties());
        }

        // Death note dialog buttons
        const deathNoteOkBtn = document.getElementById('death-note-ok');
        const deathNoteInput = document.getElementById('death-note-input');
        const deathNoteCount = document.getElementById('death-note-count');

        if (deathNoteOkBtn) {
            deathNoteOkBtn.addEventListener('click', () => this.handleDeathNoteOk());
        }
        if (deathNoteInput && deathNoteCount) {
            deathNoteInput.addEventListener('input', () => {
                deathNoteCount.textContent = deathNoteInput.value.length;
            });
        }

        // Character replacement dialog button and textarea
        const characterReplacementOkBtn = document.getElementById('character-replacement-ok');
        const characterReplacementDeathNote = document.getElementById('character-replacement-death-note');
        const characterReplacementDeathCount = document.getElementById('character-replacement-death-count');
        
        if (characterReplacementOkBtn) {
            characterReplacementOkBtn.addEventListener('click', () => this.handleCharacterReplacementOk());
        }
        if (characterReplacementDeathNote && characterReplacementDeathCount) {
            characterReplacementDeathNote.addEventListener('input', () => {
                characterReplacementDeathCount.textContent = characterReplacementDeathNote.value.length;
            });
        }

        // Legacies completion screen buttons
        const startNewLegaciesTourBtn = document.getElementById('start-new-legacies-tour');
        const returnToCampaignsLegaciesBtn = document.getElementById('return-to-campaigns-legacies');

        if (startNewLegaciesTourBtn) {
            startNewLegaciesTourBtn.addEventListener('click', () => this.handleStartNewTour());
        }
        if (returnToCampaignsLegaciesBtn) {
            returnToCampaignsLegaciesBtn.addEventListener('click', () => this.handleReturnToCampaigns());
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
                this.populatePlanetOptions();
            } else {
                tourPlanetGroup.style.display = 'none';
            }
        }
        
        this.savePreferences();
    }

    async populatePlanetOptions() {
        try {
            const gameData = await apiService.getAllGameData();
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

    handleLegaciesModeToggle(event) {
        this.legaciesMode = event.target.checked;
        const status = document.getElementById('legacies-mode-status');
        const squadNamesGroup = document.getElementById('squad-names-group');
        const livesOptionsGroup = document.getElementById('lives-options-group');
        const customLivesGroup = document.getElementById('custom-lives-group');
        const characterModeToggle = document.getElementById('character-mode-toggle');

        if (this.legaciesMode) {
            status.textContent = 'ON';
            status.classList.add('active');
            squadNamesGroup.style.display = 'block';
            livesOptionsGroup.style.display = 'block';
            characterModeToggle.style.display = 'block';
            
            // Initialize lives mode based on current character mode state
            if (this.characterMode) {
                this.updateLivesModeForCharacterMode();
            } else {
                this.updateLivesModeForLegacyMode();
            }
            
            // Show custom lives options if custom mode is selected
            const livesMode = document.getElementById('lives-mode')?.value;
            if (livesMode === 'custom') {
                customLivesGroup.style.display = 'block';
            }

            // Reset tour if one is active (as per requirements)
            if (this.currentTour) {
                if (confirm('Enabling Legacies Mode will reset your current tour. Continue?')) {
                    this.currentTour = null;
                    this.handleReturnToCampaigns();
                } else {
                    // User cancelled, revert toggle
                    event.target.checked = false;
                    this.legaciesMode = false;
                    status.textContent = 'OFF';
                    status.classList.remove('active');
                    squadNamesGroup.style.display = 'none';
                    livesOptionsGroup.style.display = 'none';
                    customLivesGroup.style.display = 'none';
                    characterModeToggle.style.display = 'none';
                    return;
                }
            }
        } else {
            status.textContent = 'OFF';
            status.classList.remove('active');
            squadNamesGroup.style.display = 'none';
            livesOptionsGroup.style.display = 'none';
            customLivesGroup.style.display = 'none';
            characterModeToggle.style.display = 'none';
            
            // Also disable character mode when legacies mode is disabled
            this.characterMode = false;
            const characterCheckbox = document.getElementById('character-mode-checkbox');
            const characterStatus = document.getElementById('character-mode-status');
            if (characterCheckbox) characterCheckbox.checked = false;
            if (characterStatus) {
                characterStatus.textContent = 'OFF';
                characterStatus.classList.remove('active');
            }

            // Reset tour if one is active (as per requirements)
            if (this.currentTour) {
                if (confirm('Disabling Legacies Mode will reset your current tour. Continue?')) {
                    this.currentTour = null;
                    this.handleReturnToCampaigns();
                } else {
                    // User cancelled, revert toggle
                    event.target.checked = true;
                    this.legaciesMode = true;
                    status.textContent = 'ON';
                    status.classList.add('active');
                    squadNamesGroup.style.display = 'block';
                    livesOptionsGroup.style.display = 'block';
                    characterModeToggle.style.display = 'block';
                    
                    // Initialize lives mode based on current character mode state
                    if (this.characterMode) {
                        this.updateLivesModeForCharacterMode();
                    } else {
                        this.updateLivesModeForLegacyMode();
                    }
                    
                    if (document.getElementById('lives-mode')?.value === 'custom') {
                        customLivesGroup.style.display = 'block';
                    }
                    return;
                }
            }
        }

        this.savePreferences();
    }

    handleCharacterModeToggle(event) {
        this.characterMode = event.target.checked;
        const status = document.getElementById('character-mode-status');
        
        if (this.characterMode) {
            status.textContent = 'ON';
            status.classList.add('active');
            this.updateSquadInputPlaceholders('character');
            this.updateLivesModeForCharacterMode();
        } else {
            status.textContent = 'OFF';
            status.classList.remove('active');
            this.updateSquadInputPlaceholders('squad');
            this.updateLivesModeForLegacyMode();
        }
        
        this.savePreferences();
    }

    updateSquadInputPlaceholders(mode) {
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`squad-member-${i}`);
            if (input) {
                input.placeholder = mode === 'character' 
                    ? `Character Name ${i}` 
                    : `Squad Member ${i}`;
            }
        }
    }

    updateLivesModeForCharacterMode() {
        const livesMode = document.getElementById('lives-mode');
        const livesExplanation = document.getElementById('lives-explanation');
        const customLivesLabel = document.querySelector('label[for="custom-lives-count"]');
        const customMissionLabel = document.querySelector('label[for="custom-mission-cycle"]');
        const customMissionInput = document.getElementById('custom-mission-cycle');
        const customLivesInput = document.getElementById('custom-lives-count');

        if (livesMode) {
            livesMode.innerHTML = `
                <option value="default" selected>Default (3 lives per character)</option>
                <option value="permadeath">Permadeath (1 life per character)</option>
                <option value="custom">Custom lives per character</option>
            `;
            
            // Set to default if not already on a valid option
            if (!['default', 'permadeath', 'custom'].includes(livesMode.value)) {
                livesMode.value = 'default';
            }
        }

        if (livesExplanation) {
            livesExplanation.textContent = 'Each character starts with the specified number of lives. When they die, they are replaced with a new character.';
        }

        if (customLivesLabel) {
            customLivesLabel.textContent = 'Lives per character:';
        }

        if (customMissionLabel && customMissionInput) {
            customMissionLabel.style.display = 'none';
            customMissionInput.style.display = 'none';
            customMissionInput.previousElementSibling.style.display = 'none'; // Hide the label
        }

        if (customLivesInput) {
            customLivesInput.value = '3'; // Set default to 3 for character mode
        }

        // Update custom lives explanation for character mode
        this.updateCustomLivesExplanation();

        // Update lives config with a small delay to ensure DOM is updated
        setTimeout(() => this.updateLivesConfig(), 0);
    }

    updateLivesModeForLegacyMode() {
        const livesMode = document.getElementById('lives-mode');
        const livesExplanation = document.getElementById('lives-explanation');
        const customLivesLabel = document.querySelector('label[for="custom-lives-count"]');
        const customMissionLabel = document.querySelector('label[for="custom-mission-cycle"]');
        const customMissionInput = document.getElementById('custom-mission-cycle');
        const customLivesInput = document.getElementById('custom-lives-count');

        if (livesMode) {
            livesMode.innerHTML = `
                <option value="default" selected>Default (2 lives per 3 missions)</option>
                <option value="permadeath">Perma-death (1 life for entire tour)</option>
                <option value="custom">Customizable</option>
            `;
            
            // Set to default if not already on a valid option
            if (!['default', 'permadeath', 'custom'].includes(livesMode.value)) {
                livesMode.value = 'default';
            }
        }

        if (livesExplanation) {
            livesExplanation.textContent = 'Each player can die once per three missions. Every 3 missions, lives replenish (but do not stack).';
        }

        if (customLivesLabel) {
            customLivesLabel.textContent = 'Lives per cycle:';
        }

        if (customMissionLabel && customMissionInput) {
            customMissionLabel.style.display = 'block';
            customMissionInput.style.display = 'block';
            customMissionInput.previousElementSibling.style.display = 'block'; // Show the label
        }

        if (customLivesInput) {
            customLivesInput.value = '2'; // Set default to 2 for legacy mode
        }

        // Update custom lives explanation for legacy mode
        this.updateCustomLivesExplanation();

        // Update lives config with a small delay to ensure DOM is updated
        setTimeout(() => this.updateLivesConfig(), 0);
    }

    handleLivesModeChange(event) {
        const customLivesGroup = document.getElementById('custom-lives-group');
        const livesExplanation = document.getElementById('lives-explanation');
        
        if (event.target.value === 'custom') {
            customLivesGroup.style.display = 'block';
            if (this.characterMode) {
                livesExplanation.textContent = 'Configure custom lives per character below.';
            } else {
                livesExplanation.textContent = 'Configure your own lives and mission cycle settings below.';
            }
        } else {
            customLivesGroup.style.display = 'none';
            
            if (event.target.value === 'default') {
                if (this.characterMode) {
                    livesExplanation.textContent = 'Each character starts with the specified number of lives. When they die, they are replaced with a new character.';
                } else {
                    livesExplanation.textContent = 'Each player can die once per three missions. Every 3 missions, lives replenish (but do not stack).';
                }
            } else if (event.target.value === 'permadeath') {
                if (this.characterMode) {
                    livesExplanation.textContent = 'Each character has only one life. When they die, they are replaced with a new character.';
                } else {
                    livesExplanation.textContent = 'Each player has only one life for the entire tour. Death marks them as KIA permanently.';
                }
            }
        }
        
        this.updateCustomLivesExplanation();
        this.updateLivesConfig();
        this.savePreferences();
    }

    updateCustomLivesDisplay() {
        const livesCount = document.getElementById('custom-lives-count')?.value || 2;
        const missionCycle = document.getElementById('custom-mission-cycle')?.value || 3;
        
        document.getElementById('lives-display').textContent = livesCount;
        document.getElementById('cycle-display').textContent = missionCycle;
    }

    updateCustomLivesExplanation() {
        const livesDisplay = document.getElementById('lives-display');
        const cycleDisplay = document.getElementById('cycle-display');
        const explanationDiv = document.querySelector('.custom-lives-explanation');
        
        if (!explanationDiv) return;
        
        const livesCount = document.getElementById('custom-lives-count')?.value || (this.characterMode ? '3' : '2');
        
        if (this.characterMode) {
            explanationDiv.innerHTML = `Each character starts with <span id="lives-display">${livesCount}</span> lives.`;
        } else {
            const missionCycle = document.getElementById('custom-mission-cycle')?.value || '3';
            explanationDiv.innerHTML = `Players get <span id="lives-display">${livesCount}</span> lives every <span id="cycle-display">${missionCycle}</span> missions.`;
        }
    }

    updateLivesConfig() {
        const livesMode = document.getElementById('lives-mode')?.value || 'default';
        
        this.livesConfig.mode = livesMode;
        
        if (this.characterMode) {
            // Character Mode: Lives are per-character, not per-cycle
            if (livesMode === 'custom') {
                this.livesConfig.livesPerCycle = parseInt(document.getElementById('custom-lives-count')?.value) || 3;
            } else if (livesMode === 'default') {
                this.livesConfig.livesPerCycle = 3; // Default 3 lives per character
            } else if (livesMode === 'permadeath') {
                this.livesConfig.livesPerCycle = 1; // 1 life per character
            }
            this.livesConfig.missionCycle = 999; // Never replenish in character mode
        } else {
            // Legacy Mode: Traditional lives per mission cycle
            if (livesMode === 'custom') {
                this.livesConfig.livesPerCycle = parseInt(document.getElementById('custom-lives-count')?.value) || 2;
                this.livesConfig.missionCycle = parseInt(document.getElementById('custom-mission-cycle')?.value) || 3;
            } else if (livesMode === 'default') {
                this.livesConfig.livesPerCycle = 2;
                this.livesConfig.missionCycle = 3;
            } else if (livesMode === 'permadeath') {
                this.livesConfig.livesPerCycle = 1;
                this.livesConfig.missionCycle = 999; // Effectively never replenish
            }
        }
    }

    initializeSquadMembers() {
        this.squadMembers = [];
        
        for (let i = 1; i <= 4; i++) {
            const nameInput = document.getElementById(`squad-member-${i}`);
            const name = nameInput?.value.trim();
            
            if (name) {
                this.squadMembers.push({
                    name: name,
                    lives: this.livesConfig.livesPerCycle,
                    maxLives: this.livesConfig.livesPerCycle,
                    deaths: 0,
                    isDead: false,
                    missionsSinceLastReplenish: 0
                });
            }
        }
        
        console.log('Initialized squad members for Legacies mode:', this.squadMembers);
    }

    updateSquadMemberLives(missionIndex) {
        if (!this.legaciesMode || !this.squadMembers.length) return;
        
        // In character mode, lives are per-character and don't replenish
        if (this.characterMode) return;
        
        // Replenish lives if we've completed a cycle
        const cycleMissions = this.livesConfig.missionCycle;
        
        this.squadMembers.forEach(member => {
            if (member.isDead) return; // Dead members don't get life replenishment
            
            member.missionsSinceLastReplenish++;
            
            if (member.missionsSinceLastReplenish >= cycleMissions) {
                member.lives = member.maxLives; // Replenish to full (don't stack)
                member.missionsSinceLastReplenish = 0;
                console.log(`${member.name} lives replenished to ${member.lives}`);
            }
        });
    }

    handleConfirmCasualties() {
        const deathInputs = document.querySelectorAll('#casualty-checkboxes input[type="number"]');
        const tour = this.currentTour;
        const currentMission = tour.missions[tour.currentMissionIndex];
        
        deathInputs.forEach(input => {
            const memberIndex = parseInt(input.dataset.memberIndex);
            let deathCount = parseInt(input.value) || 0;
            const member = this.squadMembers[memberIndex];
            
            // Validate death count
            if (deathCount < 0) deathCount = 0;
            if (deathCount > 50) deathCount = 50;
            
            if (member && !member.isDead && deathCount > 0) {
                // Ensure we don't exceed maximum reasonable deaths that would cause negative lives
                const maxDeathsAllowed = member.lives + 10; // Allow some buffer for multiple deaths
                if (deathCount > maxDeathsAllowed) {
                    console.warn(`Capping death count for ${member.name} from ${deathCount} to ${maxDeathsAllowed} (based on available lives)`);
                    deathCount = maxDeathsAllowed;
                }
                
                // Add the death count from this mission to total deaths
                member.deaths += deathCount;
                member.lives -= deathCount;
                
                console.log(`${member.name} died ${deathCount} time${deathCount > 1 ? 's' : ''} this mission. Total deaths: ${member.deaths}, Lives remaining: ${member.lives}`);
                
                if (member.lives <= 0) {
                    member.isDead = true;
                    
                    // In Character Mode, calculate additional character deaths
                    let additionalCharacterDeaths = 0;
                    if (this.characterMode && member.lives < 0) {
                        // If lives are negative, that means extra characters died
                        additionalCharacterDeaths = Math.abs(member.lives);
                        member.lives = 0; // Set to 0 since they're dead
                    }
                    
                    member.deathMission = {
                        missionNumber: tour.currentMissionIndex + 1,
                        name: currentMission.name,
                        primaryObjective: currentMission.primaryObjective.name || currentMission.primaryObjective.description,
                        difficulty: currentMission.difficulty,
                        planet: currentMission.planet.name,
                        faction: currentMission.faction,
                        missionDeathCount: deathCount, // Store deaths from this specific mission
                        additionalCharacterDeaths: additionalCharacterDeaths, // Additional characters that died this mission
                        additionalCharacterNames: [], // Names of additional characters (to be filled later)
                        additionalCharacterNotes: [], // Notes for additional characters (to be filled later)
                        deathNote: '' // Will be filled in by death note dialog
                    };
                    // Add to pending death notes queue
                    this.pendingDeathNotes.push(member);
                    console.log(`${member.name} is marked as KIA on mission ${member.deathMission.missionNumber}: ${member.deathMission.name} (died ${deathCount} times in final mission, ${additionalCharacterDeaths} additional characters also died)`);
                } else {
                    // If they died but didn't go KIA, we might still want to track mission death counts
                    console.log(`${member.name} survived despite ${deathCount} deaths this mission`);
                }
            }
        });
        
        this.hideDeathTrackingDialog();
        
        // Show death note dialogs for players who died, then proceed
        this.showNextDeathNoteDialog();
    }

    handleNoCasualties() {
        this.hideDeathTrackingDialog();
        this.proceedToNextMission();
    }

    showDeathTrackingDialog() {
        if (!this.legaciesMode || !this.squadMembers.length) {
            this.proceedToNextMission();
            return;
        }

        const dialog = document.getElementById('death-tracking-dialog');
        const checkboxContainer = document.getElementById('casualty-checkboxes');
        
        // Clear existing checkboxes
        checkboxContainer.innerHTML = '';
        
        // Create death counters for living squad members
        const livingMembers = this.squadMembers.filter(member => !member.isDead);
        
        if (livingMembers.length === 0) {
            // No living members, skip dialog
            this.proceedToNextMission();
            return;
        }
        
        livingMembers.forEach((member, index) => {
            const originalIndex = this.squadMembers.indexOf(member);
            
            const container = document.createElement('div');
            container.className = 'casualty-counter';
            
            const label = document.createElement('div');
            label.className = 'casualty-label';
            label.textContent = `${member.name} (Lives: ${member.lives})`;
            
            const counterContainer = document.createElement('div');
            counterContainer.className = 'death-counter-container';
            
            const decrementBtn = document.createElement('button');
            decrementBtn.type = 'button';
            decrementBtn.className = 'death-counter-btn decrement';
            decrementBtn.textContent = '−';
            decrementBtn.onclick = () => {
                const input = counterContainer.querySelector('input');
                const currentValue = parseInt(input.value) || 0;
                if (currentValue > 0) {
                    input.value = currentValue - 1;
                }
            };
            
            const deathInput = document.createElement('input');
            deathInput.type = 'number';
            deathInput.className = 'death-counter-input';
            deathInput.id = `casualty-${originalIndex}`;
            deathInput.value = '0';
            deathInput.min = '0';
            deathInput.max = '50';
            deathInput.dataset.memberIndex = originalIndex;
            
            // Add validation to prevent invalid inputs
            deathInput.addEventListener('input', (e) => {
                let value = parseInt(e.target.value) || 0;
                if (value < 0) value = 0;
                if (value > 50) value = 50;
                e.target.value = value;
            });
            
            const incrementBtn = document.createElement('button');
            incrementBtn.type = 'button';
            incrementBtn.className = 'death-counter-btn increment';
            incrementBtn.textContent = '+';
            incrementBtn.onclick = () => {
                const input = counterContainer.querySelector('input');
                const currentValue = parseInt(input.value) || 0;
                if (currentValue < 50) {
                    input.value = currentValue + 1;
                }
            };
            
            const deathsLabel = document.createElement('span');
            deathsLabel.className = 'deaths-label';
            deathsLabel.textContent = 'deaths this mission';
            
            counterContainer.appendChild(decrementBtn);
            counterContainer.appendChild(deathInput);
            counterContainer.appendChild(incrementBtn);
            
            container.appendChild(label);
            container.appendChild(counterContainer);
            container.appendChild(deathsLabel);
            
            checkboxContainer.appendChild(container);
        });
        
        dialog.style.display = 'block';
    }

    hideDeathTrackingDialog() {
        const dialog = document.getElementById('death-tracking-dialog');
        dialog.style.display = 'none';
    }

    showNextDeathNoteDialog() {
        if (this.pendingDeathNotes.length === 0) {
            // No more death notes to show, proceed to next mission
            this.proceedToNextMission();
            return;
        }

        const member = this.pendingDeathNotes[0]; // Get the first member in queue
        
        // In character mode, show character replacement dialog instead
        if (this.characterMode) {
            this.showCharacterReplacementDialog(member);
            return;
        }

        const modal = document.getElementById('death-note-modal');
        const playerNameElement = document.getElementById('death-note-player-name');
        const deathNoteInput = document.getElementById('death-note-input');
        const deathNoteCount = document.getElementById('death-note-count');

        // Set up the dialog for this player
        playerNameElement.textContent = member.name;
        deathNoteInput.value = '';
        deathNoteCount.textContent = '0';
        
        // Show modal
        modal.style.display = 'flex';
        
        // Focus on the textarea
        setTimeout(() => deathNoteInput.focus(), 100);
    }

    showCharacterReplacementDialog(member) {
        // Use a small delay to ensure DOM is fully ready
        setTimeout(() => {
            const modal = document.getElementById('character-replacement-modal');
            const messageElement = document.getElementById('character-replacement-message');
            const oldNameElement = document.getElementById('character-replacement-old-name');
            const newNameInput = document.getElementById('character-replacement-input');
            const deathNoteTextarea = document.getElementById('character-replacement-death-note');
            const deathNoteCount = document.getElementById('character-replacement-death-count');
            const additionalCharactersSection = document.getElementById('additional-characters-section');
            const additionalCharacterInputs = document.getElementById('additional-character-inputs');

            // Check if all required elements exist
            if (!modal || !messageElement || !newNameInput || !deathNoteTextarea || !deathNoteCount) {
                console.error('Character replacement dialog elements not found. Missing elements:', {
                    modal: !!modal,
                    messageElement: !!messageElement,
                    oldNameElement: !!oldNameElement,
                    newNameInput: !!newNameInput,
                    deathNoteTextarea: !!deathNoteTextarea,
                    deathNoteCount: !!deathNoteCount
                });
                // Skip this character and proceed to next if modal elements are missing
                this.pendingDeathNotes.shift();
                this.showNextDeathNoteDialog();
                return;
            }

            this.showCharacterReplacementDialogInternal(member, {
                modal,
                messageElement,
                oldNameElement,
                newNameInput,
                deathNoteTextarea,
                deathNoteCount,
                additionalCharactersSection,
                additionalCharacterInputs
            });
        }, 10);
    }

    showCharacterReplacementDialogInternal(member, elements) {
        const {
            modal,
            messageElement,
            oldNameElement,
            newNameInput,
            deathNoteTextarea,
            deathNoteCount,
            additionalCharactersSection,
            additionalCharacterInputs
        } = elements;

        // Set up the dialog for character replacement
        if (newNameInput) newNameInput.value = '';
        if (deathNoteTextarea) deathNoteTextarea.value = '';
        if (deathNoteCount) deathNoteCount.textContent = '0';
        
        // Check if additional characters died this mission
        const additionalDeaths = member.deathMission?.additionalCharacterDeaths || 0;
        
        if (additionalDeaths > 0 && additionalCharactersSection && additionalCharacterInputs) {
            // Update message to show multiple deaths
            messageElement.innerHTML = `<strong id="character-replacement-old-name">${member.name}</strong> and <strong>${additionalDeaths}</strong> other character${additionalDeaths > 1 ? 's' : ''} were KIA this mission.`;
            
            // Show additional characters section
            additionalCharactersSection.style.display = 'block';
            
            // Generate input fields for additional character names
            additionalCharacterInputs.innerHTML = '';
            for (let i = 0; i < additionalDeaths; i++) {
                const inputGroup = document.createElement('div');
                inputGroup.className = 'additional-character-input-group';
                inputGroup.style.marginBottom = '10px';
                
                const nameInput = document.createElement('input');
                nameInput.type = 'text';
                nameInput.id = `additional-character-name-${i}`;
                nameInput.placeholder = `Additional character ${i + 1} name (leave blank for auto-generation)`;
                nameInput.maxLength = 30;
                nameInput.style.width = '100%';
                nameInput.style.marginBottom = '5px';
                
                const noteToggle = document.createElement('button');
                noteToggle.type = 'button';
                noteToggle.className = 'note-toggle-btn';
                noteToggle.textContent = 'Add Note';
                noteToggle.style.fontSize = '12px';
                noteToggle.style.padding = '2px 8px';
                noteToggle.style.marginBottom = '5px';
                noteToggle.onclick = () => this.toggleAdditionalCharacterNote(i);
                
                const noteTextarea = document.createElement('textarea');
                noteTextarea.id = `additional-character-note-${i}`;
                noteTextarea.placeholder = 'Optional death note...';
                noteTextarea.maxLength = 200;
                noteTextarea.rows = 2;
                noteTextarea.style.width = '100%';
                noteTextarea.style.display = 'none';
                
                inputGroup.appendChild(nameInput);
                inputGroup.appendChild(noteToggle);
                inputGroup.appendChild(noteTextarea);
                additionalCharacterInputs.appendChild(inputGroup);
            }
        } else {
            // Single character death
            messageElement.innerHTML = `<strong id="character-replacement-old-name">${member.name}</strong> has fallen in battle.`;
            if (additionalCharactersSection) {
                additionalCharactersSection.style.display = 'none';
            }
        }
        
        // Show modal
        if (modal) {
            modal.style.display = 'flex';
        }
        
        // Focus on the death note textarea first
        if (deathNoteTextarea) {
            setTimeout(() => deathNoteTextarea.focus(), 100);
        }
    }

    toggleAdditionalCharacterNote(index) {
        const noteTextarea = document.getElementById(`additional-character-note-${index}`);
        const toggleBtn = document.querySelector(`#additional-character-inputs .additional-character-input-group:nth-child(${index + 1}) .note-toggle-btn`);
        
        if (!noteTextarea || !toggleBtn) {
            console.error(`Additional character note elements not found for index ${index}`);
            return;
        }
        
        if (noteTextarea.style.display === 'none') {
            noteTextarea.style.display = 'block';
            toggleBtn.textContent = 'Hide Note';
        } else {
            noteTextarea.style.display = 'none';
            toggleBtn.textContent = 'Add Note';
        }
    }

    generateRandomHelldiverId() {
        return Math.floor(10000 + Math.random() * 90000).toString();
    }

    handleDeathNoteOk() {
        if (this.pendingDeathNotes.length === 0) return;

        const member = this.pendingDeathNotes.shift(); // Remove first member from queue
        const deathNoteInput = document.getElementById('death-note-input');
        const deathNote = deathNoteInput.value.trim();

        // Save the death note (even if empty)
        if (member.deathMission) {
            member.deathMission.deathNote = deathNote;
        }

        this.hideDeathNoteModal();
        
        // Show next death note dialog or proceed to next mission
        this.showNextDeathNoteDialog();
    }

    handleCharacterReplacementOk() {
        if (this.pendingDeathNotes.length === 0) return;

        const deadMember = this.pendingDeathNotes.shift(); // Remove first member from queue
        const newNameInput = document.getElementById('character-replacement-input');
        const deathNoteTextarea = document.getElementById('character-replacement-death-note');
        const newName = newNameInput.value.trim();
        const deathNote = deathNoteTextarea.value.trim();

        if (!newName) {
            alert('Please enter a name for your new character.');
            return;
        }

        // Save the death note to the death mission (similar to regular death note handling)
        if (deadMember.deathMission) {
            deadMember.deathMission.deathNote = deathNote;
            
            // Process additional character names and notes
            const additionalDeaths = deadMember.deathMission.additionalCharacterDeaths || 0;
            if (additionalDeaths > 0) {
                deadMember.deathMission.additionalCharacterNames = [];
                deadMember.deathMission.additionalCharacterNotes = [];
                
                for (let i = 0; i < additionalDeaths; i++) {
                    const nameInput = document.getElementById(`additional-character-name-${i}`);
                    const noteTextarea = document.getElementById(`additional-character-note-${i}`);
                    
                    let characterName = nameInput ? nameInput.value.trim() : '';
                    if (!characterName) {
                        // Generate random Helldiver ID if name is blank
                        characterName = `Helldiver-${this.generateRandomHelldiverId()}`;
                    }
                    
                    const characterNote = noteTextarea ? noteTextarea.value.trim() : '';
                    
                    deadMember.deathMission.additionalCharacterNames.push(characterName);
                    deadMember.deathMission.additionalCharacterNotes.push(characterNote);
                    
                    // Also add these additional characters to character legacies
                    this.characterLegacies.push({
                        name: characterName,
                        deaths: 1, // Each additional character died once
                        deathMission: {
                            ...deadMember.deathMission,
                            deathNote: characterNote
                        },
                        missionsCompleted: this.currentTour ? this.currentTour.currentMissionIndex : 0
                    });
                }
            }
        }

        // Archive the original dead character to character legacies
        this.characterLegacies.push({
            name: deadMember.name,
            deaths: deadMember.deaths,
            deathMission: deadMember.deathMission,
            missionsCompleted: this.currentTour ? this.currentTour.currentMissionIndex : 0
        });

        // Replace the dead character with the new one
        deadMember.name = newName;
        // Ensure maxLives is set correctly from current configuration
        if (!deadMember.maxLives || deadMember.maxLives <= 0) {
            deadMember.maxLives = this.livesConfig.livesPerCycle;
        }
        deadMember.lives = deadMember.maxLives; // Reset lives for new character
        deadMember.deaths = 0;
        deadMember.isDead = false;
        deadMember.missionsSinceLastReplenish = 0; // Reset mission counter for new character
        delete deadMember.deathMission; // Clear death mission data for the new character

        this.hideCharacterReplacementModal();
        
        // Show next death dialog or proceed to next mission
        this.showNextDeathNoteDialog();
    }

    hideDeathNoteModal() {
        const modal = document.getElementById('death-note-modal');
        modal.style.display = 'none';
    }

    hideCharacterReplacementModal() {
        const modal = document.getElementById('character-replacement-modal');
        modal.style.display = 'none';
    }

    proceedToNextMission() {
        const tour = this.currentTour;
        tour.currentMissionIndex++;
        
        if (tour.currentMissionIndex >= tour.missions.length) {
            // Tour completed!
            this.completeTour();
        } else {
            // Update lives for next mission cycle
            this.updateSquadMemberLives(tour.currentMissionIndex);
            
            // Show briefing for next mission
            this.displayNextMissionBriefing();
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
            legaciesMode: this.legaciesMode,
            characterMode: this.characterMode,
            squadMembers: squadMembers,
            livesMode: document.getElementById('lives-mode')?.value || 'default',
            customLivesCount: parseInt(document.getElementById('custom-lives-count')?.value) || 2,
            customMissionCycle: parseInt(document.getElementById('custom-mission-cycle')?.value) || 3,
            // Tour preferences
            tourLength: document.getElementById('tour-length')?.value || 'regular',
            customTourLength: parseInt(document.getElementById('custom-tour-length-input')?.value) || 6,
            tourTheme: document.getElementById('tour-theme')?.value || 'random',
            tourFaction: document.getElementById('tour-faction')?.value || 'random',
            tourDifficulty: document.getElementById('tour-difficulty')?.value || 'all',
            tourFactionPreference: document.getElementById('tour-faction-preference')?.value || 'any',
            tourMissionTypePreference: document.getElementById('tour-mission-type-preference')?.value || 'either',
            tourPlanet: document.getElementById('tour-planet')?.value || 'random'
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
            
            <div class="mission-actions">
                <button class="reroll-mission-btn" onclick="app.handleMissionReroll(${index})">Re-roll Mission</button>
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
            if (key === 'legaciesMode') {
                this.legaciesMode = this.preferences[key] || false;
                const checkbox = document.getElementById('legacies-mode-checkbox');
                if (checkbox) {
                    checkbox.checked = this.legaciesMode;
                    // Trigger the toggle to show/hide related elements
                    this.handleLegaciesModeToggle({ target: checkbox });
                }
            } else if (key === 'characterMode') {
                this.characterMode = this.preferences[key] || false;
                const checkbox = document.getElementById('character-mode-checkbox');
                if (checkbox) {
                    checkbox.checked = this.characterMode;
                    // Trigger the toggle to update UI elements
                    this.handleCharacterModeToggle({ target: checkbox });
                }
            } else if (key === 'squadMembers') {
                const names = this.preferences[key] || [];
                for (let i = 0; i < 4; i++) {
                    const input = document.getElementById(`squad-member-${i + 1}`);
                    if (input) {
                        input.value = names[i] || '';
                    }
                }
            } else if (key === 'livesMode') {
                const element = document.getElementById('lives-mode');
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                    this.handleLivesModeChange({ target: element });
                }
            } else if (key === 'customLivesCount') {
                const element = document.getElementById('custom-lives-count');
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                }
            } else if (key === 'customMissionCycle') {
                const element = document.getElementById('custom-mission-cycle');
                if (element && this.preferences[key]) {
                    element.value = this.preferences[key];
                }
            } else if (key === 'customTourLength') {
                const element = document.getElementById('custom-tour-length-input');
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

        // Update custom lives display after loading preferences
        this.updateCustomLivesDisplay();
        this.updateLivesConfig();
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
        
        // Initialize squad members if Legacies mode is enabled
        if (this.legaciesMode) {
            // Ensure lives config is up to date before initializing squad members
            this.updateLivesConfig();
            this.initializeSquadMembers();
        }
        
        // Get live game data
        const gameData = await apiService.getAllGameData();
        const planets = gameData.planets;
        
        if (!planets || planets.length === 0) {
            throw new Error('No planet data available');
        }

        // Select campaign theme based on user preference
        const campaignTheme = this.selectCampaignTheme(planets, preferences);
        console.log('Selected campaign theme:', campaignTheme);

        // Determine tour length based on theme
        const tourLength = this.determineTourLength(preferences.tourLength);
        
        // Generate themed missions
        const missions = await this.generateThemedTourMissions(planets, tourLength, preferences, campaignTheme);
        
        if (missions.length === 0) {
            throw new Error('Failed to generate any missions');
        }

        // Generate tour narrative based on theme
        let tourName = this.generateThemedTourName(campaignTheme);
        
        // Add theme-specific info to tour name for debugging
        if (campaignTheme.selectedBiome) {
            tourName += ` (${campaignTheme.selectedBiome})`;
        } else if (campaignTheme.selectedBiomeGroup) {
            tourName += ` (${this.getBiomeGroupName(campaignTheme.selectedBiomeGroup)} Group)`;
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

    selectCampaignTheme(planets, preferences) {
        const enemyPlanets = apiService.getEnemyPlanets(planets);
        const availableFactions = apiService.getAvailableFactions(enemyPlanets);
        
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
                type: 'mission_type_themed',
                name: 'Strategic Operations',
                weight: 15,
                condition: () => filteredPlanets.length >= 3
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
            },
            {
                type: 'liberation_defense',
                name: 'War Front Campaign',
                weight: 10,
                condition: () => filteredPlanets.length >= 4
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
                    'single_planet': 'Single Planet Conquest',
                    'sector_campaign': 'Sector Campaign', 
                    'faction_focused': 'Faction Focus',
                    'mission_type_themed': 'Mission Type Focus',
                    'biome_specific': 'Environmental Focus',
                    'biome_group_themed': 'Biome Group Focus',
                    'liberation_defense': 'War Front Operations'
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
            return 6;
        }

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

        // For mission_type_themed, determine the mission type based on available API data
        if (campaignTheme.type === 'mission_type_themed' && !this.selectedMissionType) {
            const availableTypes = [];
            const hasLiberation = availablePlanets.some(p => !p.isDefense);
            const hasDefense = availablePlanets.some(p => p.isDefense);
            
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
                // Pick planets from same sector
                const sectorsWithMultiple = this.getSectorsWithMultiplePlanets(availablePlanets);
                const selectedSector = sectorsWithMultiple[Math.floor(Math.random() * sectorsWithMultiple.length)];
                const sectorPlanets = availablePlanets.filter(planet => planet.sector === selectedSector);
                
                // Ensure we actually have multiple planets for this sector theme
                if (sectorPlanets.length < 2) {
                    console.warn(`Sector ${selectedSector} only has ${sectorPlanets.length} planet(s), falling back to general planet selection`);
                    return availablePlanets;
                }
                
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
                
            case 'mission_type_themed':
                // Will be filtered later in applyThemeToMission based on selectedMissionType
                return availablePlanets;
                
            case 'liberation_defense':
                // Use all planets since we respect their natural API defense status
                return availablePlanets;
                
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
            'biome_group_themed': [
                'Operation: Environmental Mastery',
                'Campaign: Biome Conquest',
                'Mission: Terrain Domination',
                'Operation: Climate Warfare'
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
            tourPlanet: document.getElementById('tour-planet')?.value || 'random'
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
            'mission_type_themed': [
                `Helldiver. Your tour emphasizes tactical excellence through specialized operations. The Ministry of Defense requires demonstration of specific combat doctrines across multiple battlefields. Your success will validate Strategic Command's operational theories.`,
                `Strategic Command has designed your tour to showcase particular military capabilities. Multiple missions of similar operational focus will prove the effectiveness of concentrated tactical approaches. Begin this demonstration of military excellence on ${mission.planet.name}.`,
                `Your Tour of War represents focused tactical development, Helldiver. Through repeated application of specific operational methods across multiple battlefields, you will perfect the art of Democratic warfare. The first lesson begins on ${mission.planet.name}.`
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
            ],
            'liberation_defense': [
                `Helldiver. Your tour spans the full spectrum of Democratic warfare - from seizing enemy territory to defending liberated ground. Multiple operations will demonstrate that Freedom both advances and endures.`,
                `Super Earth High Command requires proof of tactical versatility. Your Tour of War alternates between offensive liberation and defensive operations, showing that Democracy both conquers and protects. Begin this demonstration of military balance on ${mission.planet.name}.`,
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
        // In Legacies mode, show death tracking dialog first
        if (this.legaciesMode && this.squadMembers.length > 0) {
            this.showDeathTrackingDialog();
        } else {
            // Normal tour mode - proceed directly
            this.proceedToNextMission();
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
            'biome_group_themed': [
                `Biome group mastery advances according to plan, Helldiver. Your tour continues to ${mission.planet.name}, another world within the ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} environmental category. Each operation proves Democracy's adaptability across entire terrain classifications.`,
                `Excellent environmental group adaptation. The next phase brings you to ${mission.planet.name}, where similar biome group conditions will further demonstrate your mastery of ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} environments. Environmental Command observes your systematic conquest of entire biome families.`,
                `Your domination of ${this.getBiomeGroupName(apiService.getBiomeGroup(mission.planet))} terrain types continues to exceed expectations. ${mission.planet.name} represents another world within this environmental category where you will prove that Democracy conquers not just individual biomes, but entire environmental classifications.`
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
        
        // Show appropriate completion screen
        document.getElementById('current-mission-display').style.display = 'none';
        
        if (this.legaciesMode && this.squadMembers.length > 0) {
            // Show Legacies completion screen
            document.getElementById('legacies-completion').style.display = 'block';
            this.updateLegaciesCompletionScreen(tour);
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
            <p><strong>Missions Completed:</strong> ${tour.missions.length}</p>
            <p><strong>Factions Defeated:</strong> ${[...new Set(tour.missions.map(m => m.faction))].join(', ')}</p>
            <p><strong>Average Difficulty:</strong> ${(tour.missions.reduce((sum, m) => sum + m.difficulty.level, 0) / tour.missions.length).toFixed(1)}</p>
        `;
    }

    updateLegaciesCompletionScreen(tour) {
        document.getElementById('legacies-completed-tour-name').textContent = tour.name;
        
        const stats = document.getElementById('legacies-completion-stats');
        stats.innerHTML = `
            <p><strong>Missions Completed:</strong> ${tour.missions.length}</p>
            <p><strong>Factions Defeated:</strong> ${[...new Set(tour.missions.map(m => m.faction))].join(', ')}</p>
            <p><strong>Average Difficulty:</strong> ${(tour.missions.reduce((sum, m) => sum + m.difficulty.level, 0) / tour.missions.length).toFixed(1)}</p>
        `;

        if (this.characterMode) {
            this.updateCharacterModeCompletionScreen(tour);
        } else {
            this.updateLegacyModeCompletionScreen(tour);
        }
    }

    updateCharacterModeCompletionScreen(tour) {
        // Update survivors section with character-specific title
        const survivorsSection = document.querySelector('#survivors-section h3');
        if (survivorsSection) {
            survivorsSection.textContent = 'Surviving Characters';
        }

        const survivorsList = document.getElementById('survivors-list');
        const survivors = this.squadMembers.filter(member => !member.isDead);
        
        if (survivors.length > 0) {
            survivorsList.innerHTML = survivors.map(member => 
                `<div class="survivor-entry">${member.name} (${member.lives} lives remaining)</div>`
            ).join('');
        } else {
            survivorsList.innerHTML = '<div class="no-survivors">No surviving characters - All fallen in battle</div>';
        }

        // Update KIA section with character legacies
        const kiaSection = document.getElementById('kia-section');
        const kiaTitle = document.querySelector('#kia-section h3');
        if (kiaTitle) {
            kiaTitle.textContent = 'Characters Fallen in Battle';
        }

        const kiaList = document.getElementById('kia-list');
        
        if (this.characterLegacies.length > 0) {
            kiaSection.style.display = 'block';
            
            // Group characters by mission for better organization
            const charactersGroupedByMission = {};
            this.characterLegacies.forEach(character => {
                const missionKey = character.deathMission ? 
                    `${character.deathMission.missionNumber}-${character.deathMission.name}` : 
                    'unknown';
                
                if (!charactersGroupedByMission[missionKey]) {
                    charactersGroupedByMission[missionKey] = [];
                }
                charactersGroupedByMission[missionKey].push(character);
            });
            
            let kiaHTML = '';
            
            Object.entries(charactersGroupedByMission).forEach(([missionKey, characters]) => {
                if (missionKey === 'unknown') {
                    // Handle characters without death mission data
                    characters.forEach(character => {
                        kiaHTML += `<div class="kia-entry">
                            <div class="kia-name">${character.name} (KIA after ${character.missionsCompleted} missions)</div>
                        </div>`;
                    });
                    return;
                }
                
                const firstCharacter = characters[0];
                const mission = firstCharacter.deathMission;
                
                if (characters.length === 1) {
                    // Single character death - use existing format
                    let entryHTML = `<div class="kia-entry">
                        <div class="kia-name">${firstCharacter.name} (KIA after ${firstCharacter.missionsCompleted} missions)</div>`;
                    
                    entryHTML += `<div class="kia-details">
                        <strong>Final Mission:</strong> ${mission.name}<br>
                        <strong>Objective:</strong> ${mission.primaryObjective}<br>
                        <strong>Planet:</strong> ${mission.planet} vs ${mission.faction}<br>
                        <strong>Difficulty:</strong> Level ${mission.difficulty.level} - ${mission.difficulty.name}`;
                    
                    // Add mission death count if available
                    if (mission.missionDeathCount && mission.missionDeathCount > 1) {
                        entryHTML += `<br><strong>Deaths in Final Mission:</strong> ${mission.missionDeathCount}`;
                    }
                    
                    // Add death note if it exists
                    if (mission.deathNote && mission.deathNote.trim() !== '') {
                        entryHTML += `<br><strong>Final Moments:</strong> <em>${mission.deathNote}</em>`;
                    }
                    
                    entryHTML += '</div></div>';
                    kiaHTML += entryHTML;
                } else {
                    // Multiple character deaths in same mission - group them
                    let entryHTML = `<div class="kia-entry kia-multiple-deaths">
                        <div class="kia-mission-header">
                            <strong>Mission ${mission.missionNumber}: ${mission.name}</strong><br>
                            <em>${characters.length} characters KIA</em>
                        </div>
                        <div class="kia-details">
                            <strong>Objective:</strong> ${mission.primaryObjective}<br>
                            <strong>Planet:</strong> ${mission.planet} vs ${mission.faction}<br>
                            <strong>Difficulty:</strong> Level ${mission.difficulty.level} - ${mission.difficulty.name}<br>
                            <strong>Characters Lost:</strong><br>
                            <div class="multiple-characters-list">`;
                    
                    characters.forEach(character => {
                        entryHTML += `<div class="character-death-entry">
                            • <strong>${character.name}</strong> (after ${character.missionsCompleted} missions)`;
                        if (character.deathMission.deathNote && character.deathMission.deathNote.trim() !== '') {
                            entryHTML += `<br>  <em>"${character.deathMission.deathNote}"</em>`;
                        }
                        entryHTML += `</div>`;
                    });
                    
                    entryHTML += '</div></div></div>';
                    kiaHTML += entryHTML;
                }
            });
            
            kiaList.innerHTML = kiaHTML;
        } else {
            kiaSection.style.display = 'none';
        }
    }

    updateLegacyModeCompletionScreen(tour) {
        // Reset section titles to original
        const survivorsSection = document.querySelector('#survivors-section h3');
        if (survivorsSection) {
            survivorsSection.textContent = 'Surviving Helldivers';
        }

        const kiaTitle = document.querySelector('#kia-section h3');
        if (kiaTitle) {
            kiaTitle.textContent = 'Helldivers KIA';
        }

        // Update survivors list
        const survivorsList = document.getElementById('survivors-list');
        const survivors = this.squadMembers.filter(member => !member.isDead);
        
        if (survivors.length > 0) {
            survivorsList.innerHTML = survivors.map(member => 
                `<div class="survivor-entry">${member.name}</div>`
            ).join('');
        } else {
            survivorsList.innerHTML = '<div class="no-survivors">No survivors - All Helldivers KIA</div>';
        }

        // Update KIA list
        const kiaList = document.getElementById('kia-list');
        const kiaSection = document.getElementById('kia-section');
        const casualties = this.squadMembers.filter(member => member.isDead);
        
        if (casualties.length > 0) {
            kiaSection.style.display = 'block';
            kiaList.innerHTML = casualties.map(member => {
                let entryHTML = `<div class="kia-entry">
                    <div class="kia-name">${member.name} (Died ${member.deaths} time${member.deaths > 1 ? 's' : ''})</div>`;
                
                if (member.deathMission) {
                    entryHTML += `<div class="kia-details">
                        <strong>KIA on Mission ${member.deathMission.missionNumber}:</strong> ${member.deathMission.name}<br>
                        <strong>Objective:</strong> ${member.deathMission.primaryObjective}<br>
                        <strong>Planet:</strong> ${member.deathMission.planet} vs ${member.deathMission.faction}<br>
                        <strong>Difficulty:</strong> Level ${member.deathMission.difficulty.level} - ${member.deathMission.difficulty.name}`;
                    
                    // Add mission death count if available
                    if (member.deathMission.missionDeathCount && member.deathMission.missionDeathCount > 1) {
                        entryHTML += `<br><strong>Deaths in Final Mission:</strong> ${member.deathMission.missionDeathCount}`;
                    }
                    
                    // Add death note if it exists
                    if (member.deathMission.deathNote && member.deathMission.deathNote.trim() !== '') {
                        entryHTML += `<br><strong>Cause of Death:</strong> <em>${member.deathMission.deathNote}</em>`;
                    }
                    
                    entryHTML += '</div>';
                }
                
                entryHTML += '</div>';
                return entryHTML;
            }).join('');
        } else {
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
        this.pendingDeathNotes = []; // Clear any pending death notes
        document.getElementById('tour-completion').style.display = 'none';
        document.getElementById('tour-failure').style.display = 'none';
        document.getElementById('legacies-completion').style.display = 'none';
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
        this.pendingDeathNotes = []; // Clear any pending death notes
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
        document.getElementById('death-tracking-dialog').style.display = 'none';
        document.getElementById('death-note-modal').style.display = 'none';
        document.getElementById('legacies-completion').style.display = 'none';
        document.getElementById('mission-reroll-dialog').style.display = 'none';
    }

    handleMissionReroll(missionIndex) {
        this.pendingRerollIndex = missionIndex;
        const dialog = document.getElementById('mission-reroll-dialog');
        dialog.style.display = 'block';
    }

    handleConfirmReroll() {
        this.executeMissionReroll(this.pendingRerollIndex);
        const dialog = document.getElementById('mission-reroll-dialog');
        dialog.style.display = 'none';
        this.pendingRerollIndex = null;
    }

    handleCancelReroll() {
        const dialog = document.getElementById('mission-reroll-dialog');
        dialog.style.display = 'none';
        this.pendingRerollIndex = null;
    }

    executeMissionReroll(missionIndex) {
        if (this.tourMode && this.currentTour) {
            // Re-roll current mission in tour mode
            const currentMission = this.currentTour.missions[this.currentTour.currentMissionIndex];
            const rerolledMission = missionGenerator.rerollMissionObjectives(currentMission);
            
            // Update the mission in the tour
            this.currentTour.missions[this.currentTour.currentMissionIndex] = rerolledMission;
            
            // Refresh the mission display
            this.displayCurrentTourMission();
        } else {
            // Re-roll specific mission in campaign mode (if implementing later)
            console.log(`Re-rolling mission ${missionIndex} in campaign mode`);
            // This would require access to the campaign missions array
            // For now, focus on tour mode as requested
        }
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
