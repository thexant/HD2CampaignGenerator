/**
 * City/Region name mappings for Helldivers 2 planets
 * 
 * Structure: 
 * - Key: Planet name (normalized)
 * - Value: Array of city/region objects with index and name
 * 
 * The index corresponds to the region index from the API data
 */

class CityMappings {
    constructor() {
        this.mappings = {
            "choepessa_iv": [
                { index: 0, name: "Hiljaisuus" },
                { index: 1, name: "Kalasatama" },
                { index: 2, name: "Ydinkeskusta" }
            ],
            "fort_union": [
                { index: 0, name: "Otaru's Pledge" },
                { index: 1, name: "Xiamen Anew" },
                { index: 2, name: "Munition" }
            ],
            "volterra": [
                { index: 0, name: "Scarlet Haven" },
                { index: 1, name: "Edward's Grave" },
                { index: 2, name: "Light-of-Liberty" }
            ],
            "veld": [
                { index: 0, name: "Cle Elum Rediviva" },
                { index: 1, name: "Laelia" }
            ],
            "vernen_wells": [
                { index: 0, name: "Anne's Vigil" },
                { index: 1, name: "Benevolence" },
                { index: 2, name: "Blackvein Mines" }
            ],
            "darius_ii": [
                { index: 0, name: "Buju" }
            ],
            "acamar_iv": [
                { index: 0, name: "Democracy Always" },
                { index: 1, name: "Eridani" }
            ],
            "claorell": [
                { index: 0, name: "Majosyri" },
                { index: 1, name: "Quasar" },
                { index: 2, name: "Zenith" }
            ],
            "alta_v": [
                { index: 0, name: "Porte Liberté" },
                { index: 1, name: "Undervatten" }
            ],
            "achernar_secundus": [
                { index: 0, name: "Currency" },
                { index: 1, name: "New Newtonville" },
                { index: 2, name: "Ol' Oldham" }
            ],
            "clasa": [
                { index: 0, name: "Sycamore Gardens" },
                { index: 1, name: "Kodiak Falls" },
                { index: 2, name: "Voting District F-012357" }
            ],
            "lesath": [
                { index: 0, name: "Serenity Summit" },
                { index: 1, name: "Morske Oko" },
                { index: 2, name: "Crystal Slopes" },
                { index: 3, name: "Bucu's Rest" }
            ],
            "achird_iii": [
                { index: 0, name: "Timely" },
                { index: 1, name: "Approval" },
                { index: 2, name: "Old Branch" }
            ],
            "kerth_secundus": [
                { index: 0, name: "Scholar's Moor" },
                { index: 1, name: "Blestrail" },
                { index: 2, name: "Hildoara Central" }
            ],
            "ursica_xi": [
                { index: 0, name: "New Kathmandu" },
                { index: 1, name: "Po's Ravenna" }
            ],
            "aurora_bay": [
                { index: 0, name: "Batu Belig" },
                { index: 1, name: "Eaglemount" }
            ],
            "malevelon_creek": [
                { index: 0, name: "Lifeblood" },
                { index: 1, name: "Requiem" },
                { index: 2, name: "Diver's Rest" }
            ],
            "tarsh": [
                { index: 0, name: "Fortitude" },
                { index: 1, name: "Freedom's Torch" },
                { index: 2, name: "Fearless Hollow" }
            ],
            "martale": [
                { index: 0, name: "Songguo Cun" },
                { index: 1, name: "Xin Fuzhou" }
            ],
            "crucible": [
                { index: 0, name: "Kurri Kurri" },
                { index: 1, name: "Annwn" },
                { index: 2, name: "Agartha" },
                { index: 3, name: "Prominence" }
            ],
            "trandor": [
                { index: 0, name: "Nya Skelleftea" },
                { index: 1, name: "Ödeshögre" },
                { index: 2, name: "Gothenburg III" }
            ],
            "gaellivare": [
                { index: 0, name: "Váhtjer" },
                { index: 1, name: "Malmberget" }
            ],
            "erata_prime": [
                { index: 0, name: "New Da Nang" },
                { index: 1, name: "Pham's Site" },
                { index: 2, name: "Old Chemland" }
            ],
            "matar_bay": [
                { index: 0, name: "Parrhesia" },
                { index: 1, name: "Isegoria" }
            ],
            "vogsojoth": [
                { index: 0, name: "Haerstvik" }
            ],
            "alairt_iii": [
                { index: 0, name: "Greater Storouse" },
                { index: 1, name: "New Storouse" },
                { index: 2, name: "Shed" },
                { index: 3, name: "Free Trade" }
            ],
            "alamak_vii": [
                { index: 0, name: "Kesuma" },
                { index: 1, name: "Ungu" },
                { index: 2, name: "No Compound" },
                { index: 3, name: "Filibuster" }
            ],
            "liberty_ridge": [
                { index: 0, name: "Vanquishment" },
                { index: 1, name: "Freecrest" }
            ],
            "gatria": [
                { index: 0, name: "Altonburg" },
                { index: 1, name: "Ersatz" }
            ],
            "andar": [
                { index: 0, name: "New Tokyo" }
            ],
            "fenmire": [
                { index: 0, name: "Brawfermland" },
                { index: 1, name: "New Aberdeen" },
                { index: 2, name: "Saorsa Glen" }
            ],
            "irulta": [
                { index: 0, name: "Recon Heights" },
                { index: 1, name: "Silo A" },
                { index: 2, name: "Voter's Fallow" }
            ],
            "julheim": [
                { index: 0, name: "Frostown" }
            ],
            "ubanea": [
                { index: 0, name: "Freedom Eternal" },
                { index: 1, name: "Nuova Roma" }
            ],
            "caramoor": [
                { index: 0, name: "Lemuria Rising" },
                { index: 1, name: "Pioneer's Dream" },
                { index: 2, name: "Base Camp 8" }
            ],
            "emorath": [
                { index: 0, name: "Farmhands" },
                { index: 1, name: "Fort Bounty" },
                { index: 2, name: "Futuria" }
            ],
            "valmox": [
                { index: 0, name: "Rebelsgrave" },
                { index: 1, name: "Reformed-by-Truth" },
                { index: 2, name: "Obedience" }
            ],
            "varylia_5": [
                { index: 0, name: "Sequim" }
            ],
            "wasat": [
                { index: 0, name: "Mirage" },
                { index: 1, name: "Drywell" }
            ],
            "popli_ix": [
                { index: 0, name: "Resilience" },
                { index: 1, name: "Hot Gates" }
            ],
            "caph": [
                { index: 0, name: "Eastcleft" },
                { index: 1, name: "Kinabatangan" },
                { index: 2, name: "Downpour" }
            ],
            "vega_bay": [
                { index: 0, name: "Onsen" },
                { index: 1, name: "Giri" },
                { index: 2, name: "Sapporo" }
            ],
            "peacock": [
                { index: 0, name: "Quasar" },
                { index: 1, name: "Syzygy" }
            ],
            "draupnir": [
                { index: 0, name: "Eightrings" },
                { index: 1, name: "Broker's Wealth" }
            ],
            "phact_bay": [
                { index: 0, name: "Old Dove" },
                { index: 1, name: "Brno" },
                { index: 2, name: "New Eagle" }
            ],
            "fenrir_iii": [
                { index: 0, name: "Lokaheim" },
                { index: 1, name: "Pseudotopia" },
                { index: 2, name: "Famewolf Peak" }
            ],
            "mort": [
                { index: 0, name: "Sapphire Lake" }
            ],
            "ingmar": [
                { index: 0, name: "Fort Sanguine" },
                { index: 1, name: "Knight's Honor" },
                { index: 2, name: "Sevenseal" }
            ],
            "polaris_prime": [
                { index: 0, name: "Vilhelmina Dorothea Fredrika" },
                { index: 1, name: "Mogo Plains" },
                { index: 2, name: "Kalasatama Port" }
            ],
            "crimsica": [
                { index: 0, name: "Lil'ome" },
                { index: 1, name: "Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch II" }
            ],
            "oasis": [
                { index: 0, name: "Respite" }
            ],
            "bekvam_iii": [
                { index: 0, name: "Convenience" },
                { index: 1, name: "Firefly Meadows" }
            ],
            "turing": [
                { index: 0, name: "Chatoyant" },
                { index: 1, name: "Carbondale" },
                { index: 2, name: "Periwinkle Mills" }
            ],
            "prasa": [
                { index: 0, name: "Handakas" },
                { index: 1, name: "Haku" }
            ],
            "tien_kwan": [
                { index: 0, name: "Foundry" },
                { index: 1, name: "Steel Resolve" }
            ],
            "mintoria": [
                { index: 0, name: "Seoraksan" },
                { index: 1, name: "Gyeongseong" }
            ],
            "genesis_prime": [
                { index: 0, name: "Mallstrip Nodes" },
                { index: 1, name: "Birth" }
            ]
        };
        
        // Fallback city names by biome type for unmapped planets
        this.fallbackCityNames = {
            "ice": ["Frost Harbor", "Cryo Station", "Ice Citadel", "Frozen Outpost"],
            "desert": ["Sand Fort", "Dune Station", "Solar Outpost", "Heat Base"],
            "jungle": ["Canopy Station", "Vine City", "Green Outpost", "Bio Research"],
            "swamp": ["Marsh Base", "Bog Station", "Wetland Outpost", "Toxic Harbor"],
            "volcanic": ["Lava Station", "Fire Base", "Magma Outpost", "Heat City"],
            "temperate": ["New Haven", "Liberty Base", "Freedom Station", "Demo City"],
            "tundra": ["Frozen Station", "Arctic Base", "Cold Harbor", "Ice Outpost"],
            "default": ["Outpost Alpha", "Station Beta", "Base Gamma", "Fort Delta"]
        };
    }

    /**
     * Get city names for a planet (enhanced for regions)
     * @param {string} planetName - The planet name
     * @param {number} regionCount - Number of regions on the planet
     * @param {string} biome - Planet biome for fallback names
     * @param {Array} activeRegions - Optional array of active region objects with indices
     * @returns {Array} Array of city objects with index and name
     */
    getCitiesForPlanet(planetName, regionCount = 1, biome = "temperate", activeRegions = null) {
        const normalizedName = this.normalizePlanetName(planetName);
        
        // Check if we have explicit mappings for this planet
        if (this.mappings[normalizedName]) {
            const mappedCities = this.mappings[normalizedName];
            
            // If activeRegions provided, filter to only return cities for those specific regions
            if (activeRegions && Array.isArray(activeRegions)) {
                const activeIndices = activeRegions.map(r => r.regionIndex !== undefined ? r.regionIndex : r.index);
                const filteredCities = mappedCities.filter(city => activeIndices.includes(city.index));
                
                // If we have some mapped cities for active regions, return those
                if (filteredCities.length > 0) {
                    // Fill in any missing active regions with fallbacks
                    const missingIndices = activeIndices.filter(index => 
                        !filteredCities.some(city => city.index === index)
                    );
                    
                    if (missingIndices.length > 0) {
                        const fallbacks = missingIndices.map(index => ({
                            index: index,
                            name: this.generateFallbackCityName(normalizedName, biome, index),
                            isGenerated: true
                        }));
                        return [...filteredCities, ...fallbacks].sort((a, b) => a.index - b.index);
                    }
                    
                    return filteredCities.sort((a, b) => a.index - b.index);
                }
            }
            
            // Standard behavior: if we need more cities than mapped, generate fallbacks
            if (regionCount > mappedCities.length) {
                const additional = this.generateFallbackCities(
                    normalizedName, 
                    biome, 
                    regionCount - mappedCities.length,
                    mappedCities.length
                );
                return [...mappedCities, ...additional];
            }
            
            // Return only the needed number of cities
            return mappedCities.slice(0, regionCount);
        }
        
        // No explicit mapping, generate fallback cities
        if (activeRegions && Array.isArray(activeRegions)) {
            return activeRegions.map(region => {
                const regionIndex = region.regionIndex !== undefined ? region.regionIndex : region.index;
                return {
                    index: regionIndex,
                    name: this.generateFallbackCityName(normalizedName, biome, regionIndex),
                    isGenerated: true
                };
            }).sort((a, b) => a.index - b.index);
        }
        
        return this.generateFallbackCities(normalizedName, biome, regionCount, 0);
    }

    /**
     * Generate a single fallback city name
     * @param {string} planetName - The planet name
     * @param {string} biome - Planet biome
     * @param {number} regionIndex - The region index
     * @returns {string} Generated city name
     */
    generateFallbackCityName(planetName, biome, regionIndex) {
        const normalizedBiome = biome.toLowerCase().replace(/\s+/g, '');
        const cityTemplates = this.fallbackCityNames[normalizedBiome] || this.fallbackCityNames.default;
        
        const templateIndex = regionIndex % cityTemplates.length;
        const cityName = cityTemplates[templateIndex];
        
        // Add suffix if region index is higher than available templates
        const suffix = Math.floor(regionIndex / cityTemplates.length) > 0 ? 
            ` ${String.fromCharCode(65 + Math.floor(regionIndex / cityTemplates.length) - 1)}` : '';
        
        return cityName + suffix;
    }

    /**
     * Generate fallback city names for unmapped planets
     * @param {string} planetName - The planet name
     * @param {string} biome - Planet biome
     * @param {number} count - Number of cities to generate
     * @param {number} startIndex - Starting index for city numbering
     * @returns {Array} Array of generated city objects
     */
    generateFallbackCities(planetName, biome, count, startIndex = 0) {
        const normalizedBiome = biome.toLowerCase().replace(/\s+/g, '');
        const cityTemplates = this.fallbackCityNames[normalizedBiome] || this.fallbackCityNames.default;
        
        const cities = [];
        for (let i = 0; i < count; i++) {
            const templateIndex = i % cityTemplates.length;
            const cityName = cityTemplates[templateIndex];
            
            // Add suffix if we need more cities than templates
            const suffix = Math.floor(i / cityTemplates.length) > 0 ? 
                ` ${String.fromCharCode(65 + Math.floor(i / cityTemplates.length))}` : '';
            
            cities.push({
                index: startIndex + i,
                name: cityName + suffix,
                isGenerated: true
            });
        }
        
        return cities;
    }

    /**
     * Normalize planet name for mapping lookup
     * @param {string} planetName - The planet name
     * @returns {string} Normalized planet name
     */
    normalizePlanetName(planetName) {
        return planetName
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '');
    }

    /**
     * Add or update city mapping for a planet
     * @param {string} planetName - The planet name
     * @param {Array} cities - Array of city objects with index and name
     */
    addPlanetMapping(planetName, cities) {
        const normalizedName = this.normalizePlanetName(planetName);
        this.mappings[normalizedName] = cities;
        console.log(`✅ Added city mapping for ${planetName}:`, cities);
    }

    /**
     * Get a random city from a planet (enhanced for regions)
     * @param {string} planetName - The planet name
     * @param {number} regionCount - Number of regions on the planet
     * @param {string} biome - Planet biome for fallback names
     * @param {Array} activeRegions - Optional array of active region objects
     * @returns {Object} Random city object with index and name
     */
    getRandomCityForPlanet(planetName, regionCount = 1, biome = "temperate", activeRegions = null) {
        const cities = this.getCitiesForPlanet(planetName, regionCount, biome, activeRegions);
        if (cities.length === 0) {
            return { index: 0, name: "Unknown Outpost", isGenerated: true };
        }
        
        const randomIndex = Math.floor(Math.random() * cities.length);
        return cities[randomIndex];
    }

    /**
     * Get city name for a specific region index
     * @param {string} planetName - The planet name
     * @param {number} regionIndex - The specific region index
     * @param {string} biome - Planet biome for fallback names
     * @returns {Object} City object with index and name
     */
    getCityForRegion(planetName, regionIndex, biome = "temperate") {
        const normalizedName = this.normalizePlanetName(planetName);
        
        // Check if we have explicit mappings for this planet
        if (this.mappings[normalizedName]) {
            const mappedCity = this.mappings[normalizedName].find(city => city.index === regionIndex);
            if (mappedCity) {
                return mappedCity;
            }
        }
        
        // Generate fallback for this specific region
        return {
            index: regionIndex,
            name: this.generateFallbackCityName(normalizedName, biome, regionIndex),
            isGenerated: true
        };
    }

    /**
     * Get cities for specific active regions
     * @param {string} planetName - The planet name
     * @param {Array} activeRegions - Array of active region objects with regionIndex
     * @param {string} biome - Planet biome for fallback names
     * @returns {Array} Array of city objects for the active regions
     */
    getCitiesForActiveRegions(planetName, activeRegions, biome = "temperate") {
        if (!activeRegions || !Array.isArray(activeRegions) || activeRegions.length === 0) {
            return [];
        }
        
        return activeRegions.map(region => {
            const regionIndex = region.regionIndex !== undefined ? region.regionIndex : region.index;
            return this.getCityForRegion(planetName, regionIndex, biome);
        }).sort((a, b) => a.index - b.index);
    }

    /**
     * Check if a planet has explicit city mappings
     * @param {string} planetName - The planet name
     * @returns {boolean} True if planet has explicit mappings
     */
    hasMappingForPlanet(planetName) {
        const normalizedName = this.normalizePlanetName(planetName);
        return this.mappings.hasOwnProperty(normalizedName);
    }

    /**
     * Get all mapped planet names
     * @returns {Array} Array of planet names with explicit mappings
     */
    getMappedPlanets() {
        return Object.keys(this.mappings);
    }

    /**
     * Export mappings as JSON for backup/sharing
     * @returns {string} JSON string of current mappings
     */
    exportMappings() {
        return JSON.stringify(this.mappings, null, 2);
    }

    /**
     * Import mappings from JSON
     * @param {string} jsonString - JSON string of mappings
     */
    importMappings(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.mappings = { ...this.mappings, ...imported };
            console.log('✅ Imported city mappings:', Object.keys(imported));
        } catch (error) {
            console.error('❌ Failed to import city mappings:', error);
        }
    }
}

// Export for use in other modules
const cityMappings = new CityMappings();
window.cityMappings = cityMappings;