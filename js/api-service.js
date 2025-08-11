class ApiService {
    constructor() {
        this.baseUrls = {
            // Using CORS proxy to access the APIs
            corsProxy: 'https://api.allorigins.win/get?url=',
            planets: 'https://helldiverstrainingmanual.com/api/v1/planets',
            warStatus: 'https://helldiverstrainingmanual.com/api/v1/war/status',
            warCampaign: 'https://helldiverstrainingmanual.com/api/v1/war/campaign',
            warInfo: 'https://helldiverstrainingmanual.com/api/v1/war/info',
            majorOrders: 'https://helldiverstrainingmanual.com/api/v1/war/major-orders',
            companionApi: 'https://helldiverscompanion.com/api/hell-divers-2-api/get-all-api-data'
        };
        this.cache = {
            planets: { data: null, timestamp: 0 },
            warStatus: { data: null, timestamp: 0 },
            warCampaign: { data: null, timestamp: 0 },
            warInfo: { data: null, timestamp: 0 },
            majorOrders: { data: null, timestamp: 0 },
            companionData: { data: null, timestamp: 0 },
            duration: 5 * 60 * 1000 // 5 minutes
        };
        
        this.autoRefresh = {
            enabled: true,
            interval: 5 * 60 * 1000, // 5 minutes
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
            
            console.log('✅ Fetched war status data from API');
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

    async fetchMajorOrderData(forceRefresh = false) {
        return this.fetchMajorOrderDataInternal(forceRefresh);
    }

    async fetchMajorOrderDataInternal(forceRefresh = false) {
        try {
            const now = Date.now();
            if (!forceRefresh && this.cache.majorOrders.data && (now - this.cache.majorOrders.timestamp) < this.cache.duration) {
                console.log('Using cached major order data');
                return this.cache.majorOrders.data;
            }

            console.log('Fetching fresh major order data from API...');
            const proxiedUrl = this.baseUrls.corsProxy + encodeURIComponent(this.baseUrls.majorOrders);
            console.log('Proxied major order URL:', proxiedUrl);
            
            const response = await this.fetchWithRetry(proxiedUrl, 3);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const proxyResponse = await response.json();
            const data = JSON.parse(proxyResponse.contents);
            
            this.cache.majorOrders.data = data;
            this.cache.majorOrders.timestamp = now;
            
            if (this.autoRefresh.enabled && !this.autoRefresh.timers.has('majorOrders')) {
                this.startAutoRefresh('majorOrders', this.fetchMajorOrderDataInternal);
            }
            
            console.log('✅ Fetched major order data from API:', data);
            return data;
            
        } catch (error) {
            console.warn('Major order API fetch failed:', error.message);
            return null;
        }
    }

    async getMajorOrderDetails() {
        console.log('🚀 getMajorOrderDetails() called');
        
        const majorOrderData = await this.fetchMajorOrderData();
        const companionData = await this.fetchCompanionData();
        
        console.log('📡 MAJOR ORDER API DEBUG:');
        console.log('majorOrderData:', majorOrderData);
        console.log('companionData:', companionData);
        console.log('companionData.assignment:', companionData?.assignment);
        
        if (!majorOrderData && !companionData?.assignment) {
            console.log('❌ RETURNING NULL - NO MAJOR ORDER DATA');
            return null;
        }
        
        // Try to get Major Order from companion API first (more reliable)
        if (companionData?.assignment) {
            console.log('✅ Using companion API for Major Order');
            const assignment = companionData.assignment;
            
            const details = {
                title: assignment.setting?.overrideTitle || 'MAJOR ORDER',
                briefing: assignment.setting?.overrideBrief || assignment.briefing || '',
                tasks: assignment.tasks || [],
                reward: assignment.reward || { amount: 0 },
                expiresIn: assignment.expiresIn || 0,
                planetIndices: [],
                factions: []
            };
            
            // Extract factions from the briefing text
            const briefingText = details.briefing.toLowerCase();
            if (briefingText.includes('terminid') || briefingText.includes('bug')) {
                details.factions.push('Terminids');
            }
            if (briefingText.includes('automaton') || briefingText.includes('bot') || briefingText.includes('robot')) {
                details.factions.push('Automatons');
            }
            if (briefingText.includes('illuminate') || briefingText.includes('squid')) {
                details.factions.push('Illuminate');
            }
            
            // Extract planet indices from liberation tasks only (task type 3)
            if (assignment.tasks) {
                assignment.tasks.forEach(task => {
                    // Only check task type 3 (liberation tasks) where planet index is at values[2]
                    if (task.type === 3 && task.values && task.values.length > 2) {
                        const planetIndex = task.values[2];
                        if (typeof planetIndex === 'number' && planetIndex >= 0 && !details.planetIndices.includes(planetIndex)) {
                            console.log(`Found potential planet index: ${planetIndex} from task type 3`);
                            details.planetIndices.push(planetIndex);
                        }
                    }
                });
            }
            
            // Always try to extract sector name from briefing (regardless of planet indices)
            console.log('🔍 DEBUGGING SECTOR EXTRACTION:');
            console.log('📝 Briefing text:', JSON.stringify(details.briefing));
            console.log('📝 Briefing length:', details.briefing?.length);
            console.log('📝 Briefing type:', typeof details.briefing);
            
            // Test the regex against the known text
            const knownText = "Liberate the Nanos Sector, and destroy Automaton Conscripts with the Railcannon Stratagem to further secure New Aspiration City.";
            const testMatch = knownText.match(/(?:liberate\s+(?:the\s+)?)?(\w+)\s+sector/i);
            console.log('✅ Test regex against known text:', testMatch ? `Found "${testMatch[1]}"` : 'NO MATCH');
            
            if (!details.briefing) {
                console.log('❌ Briefing is empty/undefined');
                return details;
            }
            
            // Pattern 1: "Liberate the Nanos Sector" or "Nanos Sector"
            let sectorMatch = details.briefing.match(/(?:liberate\s+(?:the\s+)?)?(\w+)\s+sector/i);
            console.log('🎯 Pattern 1 result:', sectorMatch ? `Found "${sectorMatch[1]}"` : 'NO MATCH');
            
            if (!sectorMatch) {
                // Pattern 2: "in the Nanos sector" 
                sectorMatch = details.briefing.match(/in\s+(?:the\s+)?(\w+)\s+sector/i);
                console.log('🎯 Pattern 2 result:', sectorMatch ? `Found "${sectorMatch[1]}"` : 'NO MATCH');
            }
            
            if (!sectorMatch) {
                // Pattern 3: Just look for any word before "sector"
                sectorMatch = details.briefing.match(/(\w+)\s+sector/i);
                console.log('🎯 Pattern 3 result:', sectorMatch ? `Found "${sectorMatch[1]}"` : 'NO MATCH');
            }
            
            if (sectorMatch) {
                details.targetSector = sectorMatch[1];
                console.log(`✅ SECTOR EXTRACTED: "${details.targetSector}"`);
            } else {
                console.log('❌ NO SECTOR FOUND IN BRIEFING');
            }
            
            return details;
        }
        
        // Fallback to major order endpoint
        if (majorOrderData && majorOrderData.length > 0) {
            console.log('✅ Using major-orders endpoint for Major Order');
            const order = majorOrderData[0];
            console.log('📋 Raw major order data:', order);
            
            const briefing = order.setting?.overrideBrief || order.briefing || order.setting?.taskDescription || '';
            console.log('📝 Extracted briefing:', briefing);
            
            const details = {
                title: order.setting?.overrideTitle || 'MAJOR ORDER',
                briefing: briefing,
                tasks: order.tasks || [],
                reward: order.reward || { amount: 0 },
                expiresIn: order.expiresIn || 0,
                planetIndices: [],
                factions: []
            };
            
            // Extract factions from the briefing text
            const briefingText = details.briefing.toLowerCase();
            if (briefingText.includes('terminid') || briefingText.includes('bug')) {
                details.factions.push('Terminids');
            }
            if (briefingText.includes('automaton') || briefingText.includes('bot') || briefingText.includes('robot')) {
                details.factions.push('Automatons');
            }
            if (briefingText.includes('illuminate') || briefingText.includes('squid')) {
                details.factions.push('Illuminate');
            }
            
            // Extract planet indices from liberation tasks
            if (order.tasks) {
                order.tasks.forEach(task => {
                    if (task.type === 3 && task.values && task.values.length > 2) {
                        const planetIndex = task.values[2];
                        if (typeof planetIndex === 'number' && !details.planetIndices.includes(planetIndex)) {
                            console.log(`Found potential planet index: ${planetIndex} from task type 3`);
                            details.planetIndices.push(planetIndex);
                        }
                    }
                });
            }
            
            // Always try to extract sector name from briefing (regardless of planet indices)
            try {
                console.log('🔍 DEBUGGING SECTOR EXTRACTION (major-orders endpoint):');
                console.log('📝 Briefing text:', JSON.stringify(details.briefing));
                
                if (details.briefing) {
                    // Pattern 1: "Liberate the Nanos Sector" or "Nanos Sector"
                    let sectorMatch = details.briefing.match(/(?:liberate\s+(?:the\s+)?)?(\w+)\s+sector/i);
                    console.log('🎯 Pattern 1 result:', sectorMatch ? `Found "${sectorMatch[1]}"` : 'NO MATCH');
                    
                    if (!sectorMatch) {
                        // Pattern 2: "in the Nanos sector" 
                        sectorMatch = details.briefing.match(/in\s+(?:the\s+)?(\w+)\s+sector/i);
                        console.log('🎯 Pattern 2 result:', sectorMatch ? `Found "${sectorMatch[1]}"` : 'NO MATCH');
                    }
                    
                    if (!sectorMatch) {
                        // Pattern 3: Just look for any word before "sector"
                        sectorMatch = details.briefing.match(/(\w+)\s+sector/i);
                        console.log('🎯 Pattern 3 result:', sectorMatch ? `Found "${sectorMatch[1]}"` : 'NO MATCH');
                    }
                    
                    if (sectorMatch) {
                        details.targetSector = sectorMatch[1];
                        console.log(`✅ SECTOR EXTRACTED: "${details.targetSector}"`);
                    } else {
                        console.log('❌ NO SECTOR FOUND IN BRIEFING');
                    }
                } else {
                    console.log('❌ Briefing is empty/undefined');
                }
            } catch (error) {
                console.error('❌ Error in sector extraction:', error);
            }
            
            return details;
        }
        
        return null;
    }

    async getMajorOrderPlanets() {
        const majorOrderDetails = await this.getMajorOrderDetails();
        if (!majorOrderDetails) {
            return [];
        }
        
        // Use exactly the same approach as the working campaign generator
        const gameData = await this.getAllGameData();
        const allPlanets = gameData.planets;
        
        // First priority: Use specific planet indices from Major Order tasks
        if (majorOrderDetails.planetIndices && majorOrderDetails.planetIndices.length > 0) {
            const targetPlanets = majorOrderDetails.planetIndices
                .map(index => allPlanets.find(planet => planet.id === index))
                .filter(planet => planet && this.getCurrentEnemy(planet)) // Only include enemy planets
                .filter(Boolean);
            
            // Only use planet indices if they result in valid enemy planets
            if (targetPlanets.length > 0) {
                console.log(`Found ${targetPlanets.length} Major Order target planets:`, targetPlanets.map(p => p.name));
                // Sort by player count (highest first) to prioritize active battlefronts
                targetPlanets.sort((a, b) => (b.players || 0) - (a.players || 0));
                return targetPlanets;
            } else {
                console.log('Planet indices found but none mapped to valid enemy planets, falling back to sector/faction filtering');
            }
        }
        
        // Second priority: Use sector filtering if no specific planets found
        const enemyPlanets = this.getEnemyPlanets(allPlanets);
        let majorOrderPlanets = enemyPlanets;
        
        console.log(`Major Order Details:`, {
            targetSector: majorOrderDetails.targetSector,
            factions: majorOrderDetails.factions,
            planetIndices: majorOrderDetails.planetIndices
        });
        
        if (majorOrderDetails.targetSector) {
            console.log(`Attempting sector filtering for: "${majorOrderDetails.targetSector}"`);
            console.log('Sample enemy planet sectors:', enemyPlanets.slice(0, 5).map(p => ({
                name: p.name,
                sector: p.sector
            })));
            
            const sectorPlanets = enemyPlanets.filter(planet => {
                if (!planet.sector) return false;
                
                const planetSector = planet.sector.toLowerCase();
                const targetSector = majorOrderDetails.targetSector.toLowerCase();
                
                // Try multiple matching strategies
                const exactMatch = planetSector === targetSector;
                const includesMatch = planetSector.includes(targetSector);
                const reverseIncludesMatch = targetSector.includes(planetSector);
                
                const match = exactMatch || includesMatch || reverseIncludesMatch;
                
                if (match) {
                    console.log(`Sector match found: "${planet.name}" in "${planet.sector}" matches "${majorOrderDetails.targetSector}"`);
                }
                
                return match;
            });
            
            if (sectorPlanets.length > 0) {
                majorOrderPlanets = sectorPlanets;
                console.log(`✅ Found ${sectorPlanets.length} planets in ${majorOrderDetails.targetSector} sector`);
            } else {
                console.log(`❌ No planets found in ${majorOrderDetails.targetSector} sector, falling back to faction filtering`);
            }
        }
        
        // Third priority: filter by faction (separate if statement so it can be fallback)
        if (majorOrderPlanets === enemyPlanets && majorOrderDetails.factions && majorOrderDetails.factions.length > 0) {
            console.log(`Using faction filtering for: ${majorOrderDetails.factions[0]}`);
            const factionPlanets = enemyPlanets.filter(planet => 
                this.getCurrentEnemy(planet) === majorOrderDetails.factions[0]
            );
            if (factionPlanets.length > 0) {
                majorOrderPlanets = factionPlanets;
                console.log(`Found ${majorOrderPlanets.length} planets for faction: ${majorOrderDetails.factions[0]}`);
            }
        }
        
        // Sort by player count (highest first) to prioritize active battlefronts
        majorOrderPlanets.sort((a, b) => (b.players || 0) - (a.players || 0));
        
        return majorOrderPlanets;
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
        const ownerId = planet.currentOwner || planet.owner;
        let factionName;
        
        if (typeof ownerId === 'string') {
            factionName = this.factionMap[ownerId.toLowerCase()] || this.capitalizeWords(ownerId);
        } else {
            factionName = this.factionMap[ownerId] || "Unknown";
        }
        
        if (factionName === "Humans" || factionName === "Unknown" || ownerId === 1) {
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
            const isAccessible = planet.isActiveCampaign === true;
            return enemy && enemy !== "Humans" && !planet.disabled && isAccessible;
        });
        
        console.log(`Found ${enemyPlanets.length} accessible enemy planets from ${planets.length} total planets`);
        

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
                    isActiveCampaign: true, // Mark fallback planets as accessible
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
        
        // Check both possible field names for war status planets
        const warStatusPlanets = warStatus?.planets || warStatus?.planetStatus;
        
        if (warStatus && warStatusPlanets) {
            const statusMap = new Map();
            warStatusPlanets.forEach(planet => {
                statusMap.set(planet.index, planet);
            });
            
            planets.forEach(planet => {
                const status = statusMap.get(planet.id);
                if (status) {
                    planet.currentOwner = status.owner;
                    planet.liberation = status.liberation;
                    planet.health = status.health;
                    planet.maxHealth = status.maxHealth;
                    planet.players = status.players || 0;
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
        this.cache.majorOrders.data = null;
        this.cache.majorOrders.timestamp = 0;
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
        if (this.cache.majorOrders.data) {
            this.startAutoRefresh('majorOrders', this.fetchMajorOrderDataInternal);
        }
        if (this.cache.companionData.data) {
            this.startAutoRefresh('companionData', this.fetchCompanionDataInternal);
        }
    }
    
    // Campaign Builder specific methods
    getPlanetsByFactionForBuilder(faction) {
        // Get planets for a specific faction for campaign builder
        const allPlanets = this.cache.planets.data || this.fallbackPlanets;
        return this.getPlanetsByFaction(allPlanets, faction);
    }

    async getAvailableFactionsAsync() {
        const gameData = await this.getAllGameData();
        return this.getAvailableFactions(gameData.planets);
    }

    async getPlanetActiveRegionsById(planetId) {
        const warStatusData = await this.fetchWarStatusData();
        return await this.getPlanetActiveRegions(planetId, warStatusData);
    }

    async getRandomFallbackPlanet(originalPlanet, faction) {
        const gameData = await this.getAllGameData();
        const factionPlanets = this.getPlanetsByFaction(gameData.planets, faction);
        
        if (factionPlanets.length === 0) {
            return null;
        }
        
        // Try to find a planet with the same biome group
        const originalBiomeGroup = this.getBiomeGroup(originalPlanet);
        if (originalBiomeGroup) {
            const sameBiomeGroupPlanets = factionPlanets.filter(planet => 
                planet.id !== originalPlanet.id && 
                this.getBiomeGroup(planet) === originalBiomeGroup
            );
            
            if (sameBiomeGroupPlanets.length > 0) {
                return sameBiomeGroupPlanets[Math.floor(Math.random() * sameBiomeGroupPlanets.length)];
            }
        }
        
        // Try same biome name
        const originalBiome = this.getPlanetBiome(originalPlanet);
        const sameBiomePlanets = factionPlanets.filter(planet => 
            planet.id !== originalPlanet.id && 
            this.getPlanetBiome(planet) === originalBiome
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

    async validatePlanetAvailability(planetId, faction) {
        const gameData = await this.getAllGameData();
        const planet = gameData.planets.find(p => p.id === planetId);
        
        if (!planet) {
            return { isAvailable: false, reason: 'Planet not found' };
        }
        
        if (planet.disabled) {
            return { isAvailable: false, reason: 'Planet is disabled' };
        }
        
        const currentEnemy = this.getCurrentEnemy(planet);
        if (currentEnemy !== faction) {
            return { 
                isAvailable: false, 
                reason: `Planet is controlled by ${currentEnemy || 'Humans'}, not ${faction}` 
            };
        }
        
        return { isAvailable: true, planet: planet };
    }

    async getCitiesForPlanet(planetId) {
        try {
            // First try to get regions from companion data
            const companionData = await this.fetchCompanionData();
            if (companionData && companionData.planets_data && companionData.planets_data[planetId]) {
                const planetData = companionData.planets_data[planetId];
                if (planetData.regions) {
                    return planetData.regions
                        .filter(region => region.owner !== 1) // Only enemy-controlled regions
                        .map(region => ({
                            id: region.index,
                            name: `Region ${region.index}`,
                            owner: region.owner,
                            ownerFaction: this.getFactionName(region.owner),
                            health: region.health,
                            maxHealth: region.max_health,
                            isAvailable: region.owner !== 1
                        }));
                }
            }
            
            // Fallback to war status data
            const regions = await this.getPlanetActiveRegions(planetId);
            return regions.map(region => ({
                id: region.regionIndex,
                name: `Region ${region.regionIndex}`,
                owner: region.owner,
                ownerFaction: region.ownerFaction,
                health: region.health,
                maxHealth: region.maxHealth,
                isAvailable: region.isAvailable
            }));
        } catch (error) {
            console.warn(`Failed to get cities for planet ${planetId}:`, error);
            return [];
        }
    }

    // Helper method to get all planets with their current status
    async getAllPlanetsWithStatus() {
        const gameData = await this.getAllGameData();
        return gameData.planets.map(planet => ({
            ...planet,
            enemy: this.getCurrentEnemy(planet),
            biome: this.getPlanetBiome(planet),
            biomeGroup: this.getBiomeGroup(planet)
        }));
    }

    // Sector-specific filtering methods for enhanced sector campaign selection
    getSectorsByFaction(planets, faction) {
        if (!faction || faction === 'any' || faction === 'random') {
            return this.getSectorsWithCapturablePlanets(planets);
        }
        
        const factionPlanets = planets.filter(planet => this.getCurrentEnemy(planet) === faction);
        const sectorCounts = {};
        
        factionPlanets.forEach(planet => {
            const sector = planet.sector || 'Unknown';
            if (sector !== 'Unknown') {
                sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
            }
        });
        
        // Return sectors that have at least one planet with the specified faction
        return Object.keys(sectorCounts).filter(sector => sectorCounts[sector] >= 1);
    }

    getSectorsWithCapturablePlanets(planets) {
        const enemyPlanets = this.getEnemyPlanets(planets);
        const sectorCounts = {};
        
        enemyPlanets.forEach(planet => {
            const sector = planet.sector || 'Unknown';
            if (sector !== 'Unknown') {
                sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
            }
        });
        
        // Return sectors that have at least one capturable planet
        return Object.keys(sectorCounts);
    }

    getSectorPlanetCounts(planets, sectors = null) {
        const targetSectors = sectors || this.getSectorsWithCapturablePlanets(planets);
        const enemyPlanets = this.getEnemyPlanets(planets);
        const sectorCounts = {};
        
        targetSectors.forEach(sector => {
            sectorCounts[sector] = 0;
        });
        
        enemyPlanets.forEach(planet => {
            const sector = planet.sector || 'Unknown';
            if (targetSectors.includes(sector)) {
                sectorCounts[sector] = (sectorCounts[sector] || 0) + 1;
            }
        });
        
        return sectorCounts;
    }

    getSectorsFilteredByFactionAndCapturable(planets, faction) {
        const capturableSectors = this.getSectorsWithCapturablePlanets(planets);
        
        if (!faction || faction === 'any' || faction === 'random') {
            return capturableSectors;
        }
        
        const factionSectors = this.getSectorsByFaction(planets, faction);
        
        // Return intersection - sectors that have both capturable planets AND the specified faction
        return capturableSectors.filter(sector => factionSectors.includes(sector));
    }

    destroy() {
        this.stopAllAutoRefresh();
        console.log('📤 ApiService destroyed - all timers cleared');
    }
}

const apiService = new ApiService();
