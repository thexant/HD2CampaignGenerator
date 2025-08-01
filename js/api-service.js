class ApiService {
    constructor() {
        this.baseUrls = {
            // Using CORS proxy to access the APIs
            corsProxy: 'https://api.allorigins.win/get?url=',
            planets: 'https://helldiverstrainingmanual.com/api/v1/planets',
            warStatus: 'https://helldiverstrainingmanual.com/api/v1/war/status',
            warCampaign: 'https://helldiverstrainingmanual.com/api/v1/war/campaign',
            warInfo: 'https://helldiverstrainingmanual.com/api/v1/war/info',
            companionApi: 'https://helldiverscompanion.com/api/hell-divers-2-api/get-all-api-data'
        };
        this.cache = {
            planets: { data: null, timestamp: 0 },
            warStatus: { data: null, timestamp: 0 },
            warCampaign: { data: null, timestamp: 0 },
            warInfo: { data: null, timestamp: 0 },
            companionData: { data: null, timestamp: 0 },
            duration: 5 * 60 * 1000 // 5 minutes
        };
        
        this.autoRefresh = {
            enabled: true,
            interval: 3 * 60 * 1000,
            timers: new Map(),
            callbacks: new Map()
        };
        
        this.hasInitialData = false;
        this.fallbackPlanets = [
            {
                id: 1,
                name: "Super Earth",
                sector: "Sol",
                biome: { name: "Temperate", description: "Earth-like conditions" },
                hazards: [{ name: "None", description: "No environmental hazards" }],
                currentOwner: 1, // Super Earth
                liberation: 100,
                health: 1000000,
                maxHealth: 1000000,
                disabled: false
            },
            {
                id: 2,
                name: "Malevelon Creek",
                sector: "Severin",
                biome: { name: "Tundra", description: "Frozen wastelands" },
                hazards: [{ name: "Extreme Cold", description: "Sub-zero temperatures" }],
                currentOwner: 2,
                liberation: 45,
                health: 750000,
                maxHealth: 1000000,
                disabled: false
            },
            {
                id: 3,
                name: "Terminid Prime",
                sector: "Cygnus",
                biome: { name: "Jungle", description: "Dense alien vegetation" },
                hazards: [{ name: "Acid Rain", description: "Corrosive precipitation" }],
                currentOwner: 3,
                liberation: 67,
                health: 850000,
                maxHealth: 1000000,
                disabled: false
            },
            {
                id: 4,
                name: "Draupnir",
                sector: "Automaton Sector",
                biome: { name: "Ice", description: "Frozen industrial wasteland" },
                hazards: [{ name: "Ion Storms", description: "Electromagnetic interference" }],
                currentOwner: 2,
                liberation: 23,
                health: 600000,
                maxHealth: 1000000,
                disabled: false
            },
            {
                id: 5,
                name: "Fenrir III",
                sector: "Terminid Sector",
                biome: { name: "Desert", description: "Arid bug-infested wasteland" },
                hazards: [{ name: "Extreme Heat", description: "Scorching temperatures" }],
                currentOwner: 3, 
                liberation: 78,
                health: 890000,
                maxHealth: 1000000,
                disabled: false
            }
        ];
        
        this.factionMap = {
            1: "Humans", 
            2: "Terminids", 
            3: "Automatons", 
            4: "Illuminate", 
            "humans": "Humans",
            "automatons": "Automatons", 
            "terminids": "Terminids",
            "illuminate": "Illuminate",
            "illuminates": "Illuminate",
            "bugs": "Terminids",
            "bots": "Automatons",
            "squids": "Illuminate"
        };
        


        this.biomeMap = {
            "crimsonmoor": "Ionic Crimson",
            "desolate": "Scorched Moor", 
            "canyon": "Rocky Canyons",
            "toxic": "Acidic Badlands",
			"winter": "Icy Glaciers",
			"temperate": "Tundra",
			"jungle": "Volcanic Jungle",
			"rainforest": "Ionic Jungle",
			"swamp": "Deadlands",
			"undergrowth": "Swamp",
			"mesa": "Desert Dunes",
            "highlands": "Highlands",
			"ethereal": "Ethereal Jungle",
			"desert": "Desert Cliffs",
			"morass": "Dark Swamp",

            "unknown": "Unknown",
            "": "Unknown"
        };
        

        this.planetBiomeOverrides = {
            "Bore Rock": { name: "Swamp", description: "Dense swampland with thick undergrowth" },
            "Pherkad Secundus": { name: "Swamp", description: "Dense swampland with thick undergrowth" },
            "Alamak VII": { name: "Ethereal", description: "This world teems with ethereal, boundless, and peculiar plant life that spreads silent and uninterrupted across its entire surface" }
        };
        
        // Biome Group Mapping - Maps individual biomes to broader biome families for campaign themes
        this.biomeToGroupMap = {
            // Sandy group - Desert and rocky environments
            "Desert Cliffs": "Sandy",
            "Desert Dunes": "Sandy", 
            "Rocky Canyons": "Sandy",
            "Acidic Badlands": "Sandy",
			"Moon": "Sandy",
            // Moor group - Moorland and highland environments  
            "Ionic Crimson": "Moor",
            "Scorched Moor": "Moor",
            "Highlands": "Moor",
            "Tundra": "Moor",
            // Arctic group - Cold and frozen environments
            "Icy Glaciers": "Arctic",
            "Icemoss": "Arctic",
            
            // Primordial group - Jungle and ancient forest environments
            "Ionic Jungle": "Primordial",
            "Volcanic Jungle": "Primordial", 
            "Ethereal Jungle": "Primordial",
            "Ethereal": "Primordial", // For manual overrides like Alamak VII
            
            // Swamp group - Wetland and toxic environments
            "Swamp": "Swamp",
            "Dark Swamp": "Swamp",
            "Deadlands": "Swamp",
            
            // Fallback for unknown biomes
            "Unknown": "Unknown"
        };
    }

    async fetchPlanetsData(forceRefresh = false) {
        return this.fetchPlanetsDataInternal(forceRefresh);
    }

    async fetchPlanetsDataInternal(forceRefresh = false) {
        try {
            const now = Date.now();
            if (!forceRefresh && this.cache.planets.data && (now - this.cache.planets.timestamp) < this.cache.duration) {
                console.log('Using cached planets data');
                return this.cache.planets.data;
            }

            console.log('Fetching fresh planets data from API...');
            const proxiedUrl = this.baseUrls.corsProxy + encodeURIComponent(this.baseUrls.planets);
            console.log('Proxied API URL:', proxiedUrl);
            
            const response = await this.fetchWithRetry(proxiedUrl, 3);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
            }
            
            const proxyResponse = await response.json();
            console.log('✅ PROXY SUCCESS! Proxy response:', proxyResponse);
            

            const rawData = JSON.parse(proxyResponse.contents);
            console.log('✅ API SUCCESS! Raw API response type:', typeof rawData);
            console.log('✅ Raw API response sample keys:', Object.keys(rawData).slice(0, 5));
            console.log('✅ Sample planet data:', Object.values(rawData)[0]);
            
            const allBiomes = new Set();
            Object.values(rawData).forEach(planet => {
                if (planet.biome && planet.biome.slug) {
                    allBiomes.add(planet.biome.slug);
                }
            });
            console.log('🌍 All biomes found in API:', Array.from(allBiomes).sort());

            const planetsArray = Object.values(rawData).map((planet, index) => {
                console.log(`Processing planet ${planet.name}:`, {
                    biome: planet.biome,
                    environmentals: planet.environmentals,
                    current_owner: planet.current_owner
                });
                
                const biomeOverride = this.planetBiomeOverrides[planet.name];
                let biomeData;
                
                if (biomeOverride) {
                    console.log(`🔧 Using biome override for ${planet.name}: ${biomeOverride.name}`);
                    biomeData = biomeOverride;
                } else if (planet.biome) {
                    biomeData = {
                        name: this.getBiomeDisplayName(planet.biome.slug || planet.biome.name || "unknown"),
                        description: planet.biome.description || "Unknown biome type"
                    };
                } else {
                    biomeData = { name: "Unknown", description: "Unknown biome type" };
                }
                
                return {
                    id: index,
                    name: planet.name,
                    sector: planet.sector,
                    biome: biomeData,
                    hazards: planet.environmentals && planet.environmentals.length > 0 ? 
                        planet.environmentals.map(env => ({
                            name: env.name || env,
                            description: env.description || env.name || env
                        })) : [{ name: "None", description: "No environmental hazards" }],
                    currentOwner: planet.current_owner || planet.owner || 1,
                    liberation: planet.liberation || 0,
                    health: planet.health || 1000000,
                    maxHealth: planet.max_health || planet.maxHealth || 1000000,
                    disabled: planet.disabled || false
                };
            });
            
            this.cache.planets.data = planetsArray;
            this.cache.planets.timestamp = now;
            
            if (!this.hasInitialData) {
                this.hasInitialData = true;
                this.initializeAutoRefresh();
            } else if (!this.autoRefresh.timers.has('planets')) {
                this.startAutoRefresh('planets', this.fetchPlanetsDataInternal);
            }
            
            console.log(`✅ SUCCESS! Fetched ${planetsArray.length} REAL planets from API`);
            console.log('✅ Sample converted planet:', planetsArray[0]);
            return planetsArray;
            
        } catch (error) {
            console.error('❌ PLANETS API FAILED:', error);
            console.error('❌ Error details:', error.message);
            console.error('❌ Using fallback data instead');
            return this.fallbackPlanets;
        }
    }


    async fetchWarStatusData(forceRefresh = false) {
        return this.fetchWarStatusDataInternal(forceRefresh);
    }

    async fetchWarStatusDataInternal(forceRefresh = false) {
        try {
            const now = Date.now();
            if (!forceRefresh && this.cache.warStatus.data && (now - this.cache.warStatus.timestamp) < this.cache.duration) {
                console.log('Using cached war status data');
                return this.cache.warStatus.data;
            }

            console.log('Fetching fresh war status data from API...');
            const proxiedUrl = this.baseUrls.corsProxy + encodeURIComponent(this.baseUrls.warStatus);
            console.log('Proxied war status URL:', proxiedUrl);
            
            const response = await this.fetchWithRetry(proxiedUrl, 3);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const proxyResponse = await response.json();
            const data = JSON.parse(proxyResponse.contents);
            
            this.cache.warStatus.data = data;
            this.cache.warStatus.timestamp = now;
            
            if (this.autoRefresh.enabled && !this.autoRefresh.timers.has('warStatus')) {
                this.startAutoRefresh('warStatus', this.fetchWarStatusDataInternal);
            }
            
            console.log('✅ Fetched war status data from API:', data);
            return data;
            
        } catch (error) {
            console.warn('War status API fetch failed:', error.message);
            return null;
        }
    }

    async fetchWarCampaignData(forceRefresh = false) {
        return this.fetchWarCampaignDataInternal(forceRefresh);
    }

    async fetchWarCampaignDataInternal(forceRefresh = false) {
        try {
            const now = Date.now();
            if (!forceRefresh && this.cache.warCampaign.data && (now - this.cache.warCampaign.timestamp) < this.cache.duration) {
                console.log('Using cached war campaign data');
                return this.cache.warCampaign.data;
            }

            console.log('Fetching fresh war campaign data from API...');
            const proxiedUrl = this.baseUrls.corsProxy + encodeURIComponent(this.baseUrls.warCampaign);
            console.log('Proxied war campaign URL:', proxiedUrl);
            
            const response = await this.fetchWithRetry(proxiedUrl, 3);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const proxyResponse = await response.json();
            const data = JSON.parse(proxyResponse.contents);
            
            this.cache.warCampaign.data = data;
            this.cache.warCampaign.timestamp = now;
            
            if (this.autoRefresh.enabled && !this.autoRefresh.timers.has('warCampaign')) {
                this.startAutoRefresh('warCampaign', this.fetchWarCampaignDataInternal);
            }
            
            console.log('✅ Fetched war campaign data from API:', data);
            return data;
            
        } catch (error) {
            console.warn('War campaign API fetch failed:', error.message);
            return null;
        }
    }

    async fetchCompanionData(forceRefresh = false) {
        return this.fetchCompanionDataInternal(forceRefresh);
    }

    async fetchCompanionDataInternal(forceRefresh = false) {
        try {
            const now = Date.now();
            if (!forceRefresh && this.cache.companionData.data && (now - this.cache.companionData.timestamp) < this.cache.duration) {
                console.log('Using cached companion data');
                return this.cache.companionData.data;
            }

            console.log('Fetching fresh companion data with regions...');
            
            try {
                console.log('Attempting direct fetch to companion API...');
                const directResponse = await fetch(this.baseUrls.companionApi, {
                    headers: {
                        'X-Super-Client': 'HD2-Campaign-Generator',
                        'X-Super-Contact': 'helldivers2-campaign-tool'
                    }
                });
                
                if (directResponse.ok) {
                    const data = await directResponse.json();
                    this.cache.companionData.data = data;
                    this.cache.companionData.timestamp = now;
                    
                    if (this.autoRefresh.enabled && !this.autoRefresh.timers.has('companionData')) {
                        this.startAutoRefresh('companionData', this.fetchCompanionDataInternal);
                    }
                    
                    console.log('✅ Fetched companion data directly:', Object.keys(data).slice(0, 5));
                    return data;
                }
            } catch (directError) {
                console.log('Direct fetch failed, trying proxy...');
            }
            
            const proxiedUrl = this.baseUrls.corsProxy + encodeURIComponent(this.baseUrls.companionApi);
            console.log('Proxied companion URL:', proxiedUrl);
            
            const response = await this.fetchWithRetry(proxiedUrl, 2);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const proxyResponse = await response.json();
            const data = JSON.parse(proxyResponse.contents);
            
            this.cache.companionData.data = data;
            this.cache.companionData.timestamp = now;
            
            if (this.autoRefresh.enabled && !this.autoRefresh.timers.has('companionData')) {
                this.startAutoRefresh('companionData', this.fetchCompanionDataInternal);
            }
            
            console.log('✅ Fetched companion data with regions:', Object.keys(data).slice(0, 5));
            return data;
            
        } catch (error) {
            console.warn('Companion API fetch failed (both direct and proxy):', error.message);
            console.log('⚠️ Region data will not be available - missions will use planet surface only');
            return null;
        }
    }

    capitalizeWords(str) {
        if (!str) return '';
        return str.split(/[-_\s]/).map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    }

    getBiomeDisplayName(biomeSlug) {
        if (!biomeSlug) return 'Unknown';
        
        const normalizedSlug = biomeSlug.toLowerCase().replace(/[\s\-_]/g, '');
        
        if (this.biomeMap[normalizedSlug]) {
            return this.biomeMap[normalizedSlug];
        }
        
        if (this.biomeMap[biomeSlug.toLowerCase()]) {
            return this.biomeMap[biomeSlug.toLowerCase()];
        }
        
        return this.capitalizeWords(biomeSlug);
    }

    async fetchWithRetry(url, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const isProxy = url.includes('allorigins.win');
                const options = isProxy ? {} : {
                    headers: {
                        'X-Super-Client': 'HD2-Campaign-Generator',
                        'X-Super-Contact': 'helldivers2-campaign-tool'
                    }
                };
                
                const response = await fetch(url, options);
                if (response.ok) return response;
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            } catch (error) {
                console.warn(`Fetch attempt ${i + 1} failed for ${url}:`, error.message);
                if (i === maxRetries - 1) throw error;
                await this.delay(1000 * (i + 1));
            }
        }
    }

    validatePlanetsData(data) {
        return true;
    }

    getRandomPlanet(planets, factionFilter = null) {
        let availablePlanets = this.getEnemyPlanets(planets);
        
        if (factionFilter && factionFilter !== 'random' && factionFilter !== 'mixed') {
            availablePlanets = availablePlanets.filter(planet => 
                this.getCurrentEnemy(planet) === factionFilter
            );
        }
        
        if (availablePlanets.length === 0) {
            availablePlanets = this.getEnemyPlanets(planets);
        }
        
        if (availablePlanets.length === 0) {
            console.warn('No enemy planets available, using fallback data');
            return this.fallbackPlanets.find(p => p.currentOwner !== 1); 
        }
        
        const randomIndex = Math.floor(Math.random() * availablePlanets.length);
        return availablePlanets[randomIndex];
    }

    getPlanetsByFaction(planets, faction) {
        return planets.filter(planet => 
            !planet.disabled && this.getCurrentEnemy(planet) === faction
        );
    }

    getCurrentEnemy(planet) {
        const ownerId = planet.currentOwner;
        let factionName;
        
        if (typeof ownerId === 'string') {
            factionName = this.factionMap[ownerId.toLowerCase()] || this.capitalizeWords(ownerId);
        } else {
            factionName = this.factionMap[ownerId] || "Unknown";
        }
        
        if (factionName === "Humans" || factionName === "Unknown") {
            return null;
        }
        
        return factionName;
    }

    getFactionName(factionId) {
        if (typeof factionId === 'string') {
            return this.factionMap[factionId.toLowerCase()] || this.capitalizeWords(factionId);
        }
        return this.factionMap[factionId] || "Unknown";
    }

    getEnemyPlanets(planets) {
        const enemyPlanets = planets.filter(planet => {
            const enemy = this.getCurrentEnemy(planet);
            return enemy && enemy !== "Humans" && !planet.disabled;
        });
        
        console.log(`Found ${enemyPlanets.length} enemy planets from ${planets.length} total planets`);
        

        if (enemyPlanets.length === 0) {
            console.log('⚠️ No enemy planets found in main data, but war is ongoing!');
            console.log('Looking for planets that are not Super Earth or Earth colonies...');
            
            const nonHumanPlanets = planets.filter(planet => {
                return planet.name !== "Super Earth" && 
                       !planet.name.toLowerCase().includes("earth") &&
                       !planet.name.toLowerCase().includes("sol") &&
                       !planet.disabled;
            });
            
            console.log(`Found ${nonHumanPlanets.length} non-human planets to use for campaigns`);
            
            const assignedPlanets = nonHumanPlanets.slice(0, Math.min(30, nonHumanPlanets.length)).map((planet, index) => {
                const factionOptions = [2, 3, 4];
                const assignedFaction = factionOptions[index % factionOptions.length];
                
                return {
                    ...planet,
                    currentOwner: assignedFaction,
                    isGeneratedEnemy: true,
                    liberation: Math.floor(Math.random() * 100),
                };
            });
            
            console.log(`✅ Assigned factions to ${assignedPlanets.length} planets for active war`);
            console.log('Sample assigned planets:', assignedPlanets.slice(0, 3).map(p => ({
                name: p.name,
                faction: this.getFactionName(p.currentOwner)
            })));
            
            return assignedPlanets;
        }
        
        return enemyPlanets;
    }


    getPlanetsWithAvailableRegions(planets) {
        return planets.filter(planet => {
            const enemy = this.getCurrentEnemy(planet);
            if (!enemy || enemy === "Humans" || planet.disabled) {
                return false;
            }
            
            return planet.availableRegions && planet.availableRegions.length > 0;
        });
    }


    async getPlanetsWithActiveRegions(warStatusData = null) {
        if (!warStatusData) {
            warStatusData = await this.fetchWarStatusData();
        }
        
        if (!warStatusData || !warStatusData.planetRegions) {
            console.warn('No planet regions data available');
            return [];
        }

        const planetRegionsMap = new Map();
        warStatusData.planetRegions.forEach(region => {
            if (!planetRegionsMap.has(region.planetIndex)) {
                planetRegionsMap.set(region.planetIndex, []);
            }
            planetRegionsMap.get(region.planetIndex).push(region);
        });

        const planets = await this.fetchPlanetsData();
        const planetsWithActiveRegions = [];

        planetRegionsMap.forEach((regions, planetIndex) => {
            const planet = planets.find(p => p.id === planetIndex);
            if (!planet) return;

            const activeRegions = regions.filter(region => 
                region.owner !== 1 && 
                region.isAvailable === true &&
                region.health > 0
            );

            if (activeRegions.length > 0) {
                const enhancedPlanet = {
                    ...planet,
                    activeRegions: activeRegions.map(region => ({
                        regionIndex: region.regionIndex,
                        owner: region.owner,
                        ownerFaction: this.getFactionName(region.owner),
                        health: region.health,
                        maxHealth: region.maxHealth || 1000000,
                        healthPercentage: region.maxHealth ? Math.round((region.health / region.maxHealth) * 100) : 0,
                        regenerationPerSecond: region.regenerationPerSecond || 0,
                        availabilityFactor: region.availabilityFactor || 1,
                        isAvailable: region.isAvailable,
                        players: region.players || 0
                    })),
                    totalActiveRegions: activeRegions.length,
                    planetIndex: planetIndex
                };
                
                planetsWithActiveRegions.push(enhancedPlanet);
            }
        });

        console.log(`✅ Found ${planetsWithActiveRegions.length} planets with active regions`);
        planetsWithActiveRegions.forEach(planet => {
            console.log(`📍 ${planet.name}: ${planet.totalActiveRegions} active regions (${planet.activeRegions.map(r => r.ownerFaction).join(', ')})`);
        });

        return planetsWithActiveRegions;
    }

    async getPlanetActiveRegions(planetIndex, warStatusData = null) {
        if (!warStatusData) {
            warStatusData = await this.fetchWarStatusData();
        }
        
        if (!warStatusData || !warStatusData.planetRegions) {
            return [];
        }

        const planetRegions = warStatusData.planetRegions.filter(region => 
            region.planetIndex === planetIndex &&
            region.owner !== 1 &&
            region.isAvailable === true &&
            region.health > 0
        );

        return planetRegions.map(region => ({
            regionIndex: region.regionIndex,
            owner: region.owner,
            ownerFaction: this.getFactionName(region.owner),
            health: region.health,
            maxHealth: region.maxHealth || 1000000,
            healthPercentage: region.maxHealth ? Math.round((region.health / region.maxHealth) * 100) : 0,
            regenerationPerSecond: region.regenerationPerSecond || 0,
            availabilityFactor: region.availabilityFactor || 1,
            isAvailable: region.isAvailable,
            players: region.players || 0
        }));
    }


    async getPlanetsByFactionRegions(factionName, warStatusData = null) {
        const planetsWithActiveRegions = await this.getPlanetsWithActiveRegions(warStatusData);
        
        return planetsWithActiveRegions.filter(planet => 
            planet.activeRegions.some(region => region.ownerFaction === factionName)
        );
    }


    async getRandomPlanetWithRegions(factionFilter = null) {
        const planetsWithActiveRegions = await this.getPlanetsWithActiveRegions();
        
        if (planetsWithActiveRegions.length === 0) {
            console.warn('No planets with active regions found, falling back to regular enemy planets');
            const planets = await this.fetchPlanetsData();
            return this.getRandomPlanet(planets, factionFilter);
        }

        let availablePlanets = planetsWithActiveRegions;
        
        if (factionFilter && factionFilter !== 'random' && factionFilter !== 'mixed') {
            availablePlanets = planetsWithActiveRegions.filter(planet => 
                planet.activeRegions.some(region => region.ownerFaction === factionFilter)
            );
        }
        
        if (availablePlanets.length === 0) {
            console.warn(`No planets with ${factionFilter} regions found, using any available planets with regions`);
            availablePlanets = planetsWithActiveRegions;
        }
        
        const randomIndex = Math.floor(Math.random() * availablePlanets.length);
        const selectedPlanet = availablePlanets[randomIndex];
        
        console.log(`✅ Selected planet with regions: ${selectedPlanet.name} (${selectedPlanet.totalActiveRegions} active regions)`);
        return selectedPlanet;
    }


    getRandomAvailableRegion(planet) {
        if (planet.activeRegions && planet.activeRegions.length > 0) {
            const randomIndex = Math.floor(Math.random() * planet.activeRegions.length);
            const selectedRegion = planet.activeRegions[randomIndex];
            console.log(`✅ Selected region ${selectedRegion.regionIndex} controlled by ${selectedRegion.ownerFaction} (${selectedRegion.healthPercentage}% health)`);
            return selectedRegion;
        }
        
        if (planet.availableRegions && planet.availableRegions.length > 0) {
            const randomIndex = Math.floor(Math.random() * planet.availableRegions.length);
            return planet.availableRegions[randomIndex];
        }
        
        return null;
    }

    getPlanetHazard(planet) {
        if (planet.hazards && planet.hazards.length > 0) {
            return planet.hazards[0].name;
        }
        return "None";
    }

    getPlanetBiome(planet) {
        if (planet.biome && planet.biome.name && planet.biome.name !== "Unknown") {
            return planet.biome.name;
        }
        
        if (planet.hazards && planet.hazards.length > 0) {
            const hazard = planet.hazards[0].name;
            const biomeFromHazard = this.getBiomeFromHazard(hazard);
            if (biomeFromHazard !== "Unknown") {
                return this.getBiomeDisplayName(biomeFromHazard);
            }
        }
        
        const name = planet.name.toLowerCase();
        if (name.includes('ice') || name.includes('frost') || name.includes('cryo')) {
            return "Ice World";
        } else if (name.includes('desert') || name.includes('sand') || name.includes('dune')) {
            return "Desert";
        } else if (name.includes('jungle') || name.includes('forest') || name.includes('verde')) {
            return "Jungle";
        } else if (name.includes('swamp') || name.includes('marsh') || name.includes('bog')) {
            return "Swamp";
        } else if (name.includes('volcanic') || name.includes('fire') || name.includes('magma')) {
            return "Volcanic";
        }
        
        return "Temperate";
    }

    getBiomeGroup(planet) {
        const biomeName = this.getPlanetBiome(planet);
        return this.biomeToGroupMap[biomeName] || null;
    }

    getPlanetsInBiomeGroup(planets, biomeGroup) {
        return planets.filter(planet => {
            const planetBiomeGroup = this.getBiomeGroup(planet);
            return planetBiomeGroup === biomeGroup;
        });
    }

    getBiomeGroupsWithMultiplePlanets(planets) {
        const biomeGroupCounts = {};
        planets.forEach(planet => {
            const biomeGroup = this.getBiomeGroup(planet);
            if (biomeGroup) {
                biomeGroupCounts[biomeGroup] = (biomeGroupCounts[biomeGroup] || 0) + 1;
            }
        });
        return Object.keys(biomeGroupCounts).filter(group => biomeGroupCounts[group] >= 2);
    }

    getBiomeFromHazard(hazard) {
        const biomeMap = {
            "Extreme Cold": "Ice",
            "Extreme Heat": "Desert", 
            "Acid Rain": "Swamp",
            "Ion Storms": "Volcanic",
            "Meteor Showers": "Barren",
            "Sandstorms": "Desert",
            "None": "Temperate"
        };
        return biomeMap[hazard] || "Unknown";
    }

    getAvailableFactions(planets) {
        const factions = new Set();
        planets.forEach(planet => {
            if (!planet.disabled) {
                const enemy = this.getCurrentEnemy(planet);
                if (enemy && enemy !== "Humans") {
                    factions.add(enemy);
                }
            }
        });
        return Array.from(factions).filter(f => f !== null);
    }

    async getAllGameData(forceRefresh = false) {
        const [planets, warStatus, warCampaign, companionData] = await Promise.all([
            this.fetchPlanetsData(forceRefresh),
            this.fetchWarStatusData(forceRefresh),
            this.fetchWarCampaignData(forceRefresh),
            this.fetchCompanionData(forceRefresh)
        ]);
        
        console.log('War campaign data:', warCampaign);
        
        if (warStatus && warStatus.planets) {
            const statusMap = new Map();
            warStatus.planets.forEach(planet => {
                statusMap.set(planet.index, planet);
            });
            
            planets.forEach(planet => {
                const status = statusMap.get(planet.id);
                if (status) {
                    planet.currentOwner = status.owner;
                    planet.liberation = status.liberation;
                    planet.health = status.health;
                    planet.maxHealth = status.maxHealth;
                }
            });
        }
        
        if (companionData && companionData.planets_data) {
            console.log('Processing companion data for regions...');
            
            companionData.planets_data.forEach((planetData, index) => {
                let planet = planets.find(p => p.id === index || p.name === planetData.name);
                if (planet && planetData.regions) {
                    planet.regions = planetData.regions.map(region => ({
                        index: region.index,
                        owner: region.owner,
                        health: region.health,
                        maxHealth: region.max_health,
                        size: region.region_size,
                        isAvailable: region.owner !== 1
                    }));
                    planet.availableRegions = planet.regions.filter(r => r.isAvailable);
                    
                    console.log(`✅ Planet ${planet.name} has ${planet.regions.length} regions, ${planet.availableRegions.length} available`);
                }
            });
        } else {
            console.log('⚠️ Companion data not available, using war status data for regions...');
            
            if (warStatus && warStatus.planetRegions) {
                console.log('Processing war status regions as fallback...');
                
                const planetRegionsMap = new Map();
                warStatus.planetRegions.forEach(region => {
                    if (!planetRegionsMap.has(region.planetIndex)) {
                        planetRegionsMap.set(region.planetIndex, []);
                    }
                    planetRegionsMap.get(region.planetIndex).push(region);
                });
                
                planetRegionsMap.forEach((regions, planetIndex) => {
                    const planet = planets.find(p => p.id === planetIndex);
                    if (planet) {
                        planet.regions = regions.map(region => ({
                            index: region.regionIndex,
                            owner: region.owner,
                            health: region.health,
                            maxHealth: region.maxHealth || 1000000,
                            size: 1, 
                            isAvailable: region.owner !== 1 && region.isAvailable
                        }));
                        planet.availableRegions = planet.regions.filter(r => r.isAvailable);
                        
                        if (planet.availableRegions.length > 0) {
                            console.log(`✅ Planet ${planet.name} has ${planet.regions.length} regions (from war status), ${planet.availableRegions.length} available`);
                        }
                    }
                });
            }
        }
        
        if (warCampaign && Array.isArray(warCampaign)) {
            console.log('Processing war campaign data for active planets...');
            console.log('Campaign data structure:', warCampaign[0]);
            
            warCampaign.forEach((campaign, index) => {
                console.log(`Campaign ${index}:`, campaign);
                
                let planet = planets.find(p => p.name === campaign.name);
                if (!planet && campaign.planetIndex !== undefined) {
                    planet = planets.find(p => p.id === campaign.planetIndex);
                }
                
                if (planet) {
                    const factionId = campaign.faction || campaign.enemyFaction || campaign.enemy || 2;
                    planet.currentOwner = factionId;
                    planet.liberation = campaign.liberation || campaign.percentage || 0;
                    planet.isActiveCampaign = true;
                    
                    planet.isDefense = campaign.defense || false;
                    
                    const statusText = planet.isDefense ? "DEFENSE" : "LIBERATION";
                    console.log(`✅ Active campaign planet: ${planet.name} controlled by faction ${factionId} (${this.getFactionName(factionId)}) - ${statusText}`);
                } else {
                    console.warn('Could not find planet for campaign:', campaign);
                }
            });
        }
        
        return { planets, warStatus, warCampaign, companionData };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    clearCache() {
        this.cache.planets.data = null;
        this.cache.planets.timestamp = 0;
        this.cache.warStatus.data = null;
        this.cache.warStatus.timestamp = 0;
        this.cache.warCampaign.data = null;
        this.cache.warCampaign.timestamp = 0;
        this.cache.warInfo.data = null;
        this.cache.warInfo.timestamp = 0;
        this.cache.companionData.data = null;
        this.cache.companionData.timestamp = 0;
        console.log('🗑️ Cache cleared - will fetch fresh data');
    }

    startAutoRefresh(dataType, fetchMethod) {
        if (!this.autoRefresh.enabled) return;
        
        this.stopAutoRefresh(dataType);
        
        const timer = setInterval(async () => {
            try {
                console.log(`🔄 Auto-refreshing ${dataType} data...`);
                const freshData = await fetchMethod.call(this, true);
                
                const callbacks = this.autoRefresh.callbacks.get(dataType);
                if (callbacks && callbacks.length > 0) {
                    callbacks.forEach(callback => {
                        try {
                            callback(freshData, dataType);
                        } catch (error) {
                            console.error(`Error in auto-refresh callback for ${dataType}:`, error);
                        }
                    });
                }
                
                console.log(`✅ Auto-refresh completed for ${dataType}`);
            } catch (error) {
                console.warn(`⚠️ Auto-refresh failed for ${dataType}:`, error.message);
            }
        }, this.autoRefresh.interval);
        
        this.autoRefresh.timers.set(dataType, timer);
        console.log(`🚗 Auto-refresh started for ${dataType} (every ${this.autoRefresh.interval / 1000}s)`);
    }
    
    stopAutoRefresh(dataType) {
        const timer = this.autoRefresh.timers.get(dataType);
        if (timer) {
            clearInterval(timer);
            this.autoRefresh.timers.delete(dataType);
            console.log(`⏹️ Auto-refresh stopped for ${dataType}`);
        }
    }
    
    stopAllAutoRefresh() {
        this.autoRefresh.timers.forEach((timer, dataType) => {
            clearInterval(timer);
            console.log(`⏹️ Auto-refresh stopped for ${dataType}`);
        });
        this.autoRefresh.timers.clear();
        this.autoRefresh.callbacks.clear();
        console.log('🛑 All auto-refresh timers stopped');
    }
    
    onAutoRefresh(dataType, callback) {
        if (!this.autoRefresh.callbacks.has(dataType)) {
            this.autoRefresh.callbacks.set(dataType, []);
        }
        this.autoRefresh.callbacks.get(dataType).push(callback);
    }
    
    offAutoRefresh(dataType, callback) {
        const callbacks = this.autoRefresh.callbacks.get(dataType);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index !== -1) {
                callbacks.splice(index, 1);
            }
        }
    }
    
    setAutoRefreshEnabled(enabled) {
        this.autoRefresh.enabled = enabled;
        if (!enabled) {
            this.stopAllAutoRefresh();
        } else if (this.hasInitialData) {
            this.initializeAutoRefresh();
        }
        console.log(`🔄 Auto-refresh ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    setAutoRefreshInterval(intervalMs) {
        this.autoRefresh.interval = intervalMs;
        if (this.autoRefresh.enabled && this.hasInitialData) {
            this.stopAllAutoRefresh();
            this.initializeAutoRefresh();
        }
        console.log(`⏰ Auto-refresh interval set to ${intervalMs / 1000}s`);
    }
    
    initializeAutoRefresh() {
        if (!this.autoRefresh.enabled) return;
        
        if (this.cache.planets.data) {
            this.startAutoRefresh('planets', this.fetchPlanetsDataInternal);
        }
        if (this.cache.warStatus.data) {
            this.startAutoRefresh('warStatus', this.fetchWarStatusDataInternal);
        }
        if (this.cache.warCampaign.data) {
            this.startAutoRefresh('warCampaign', this.fetchWarCampaignDataInternal);
        }
        if (this.cache.companionData.data) {
            this.startAutoRefresh('companionData', this.fetchCompanionDataInternal);
        }
    }
    
    destroy() {
        this.stopAllAutoRefresh();
        console.log('📤 ApiService destroyed - all timers cleared');
    }
}

const apiService = new ApiService();
