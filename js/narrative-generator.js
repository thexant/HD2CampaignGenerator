class NarrativeGenerator {
    constructor() {
        this.campaignThemes = {
            'liberation': {
                names: [
                    'Operation Democratic Liberation', 'Freedom\'s Call', 'Liberty Ascendant', 'Sovereign Dawn',
                    'Democratic Reclamation', 'Super Earth\'s Triumph', 'Managed Victory', 'Constitutional Restoration'
                ],
                goals: [
                    'Liberate the oppressed masses yearning for democratic freedom',
                    'Establish the eternal reign of Managed Democracy across the sector',
                    'Secure vital resources for the continued prosperity of Super Earth',
                    'Dismantle the corrupt hierarchy of enemy leadership'
                ]
            },
            'reconnaissance': {
                names: [
                    'Operation Enlightenment', 'Democratic Survey', 'Liberty\'s Lens', 'Truth Seeker',
                    'Knowledge Harvest', 'Wisdom\'s Edge', 'Intelligence Supremacy', 'Strategic Insight'
                ],
                goals: [
                    'Illuminate the shadows where enemies of democracy hide',
                    'Chart the fortifications of tyranny for future liberation', 
                    'Identify priority targets for the righteous fury of freedom',
                    'Assess the technological blasphemies of our adversaries'
                ]
            },
            'elimination': {
                names: [
                    'Operation Total Cleansing', 'Democratic Purification', 'Liberty\'s Judgment', 'Final Democracy',
                    'Absolute Resolution', 'Righteous Extermination', 'Freedom\'s Wrath', 'Complete Liberation'
                ],
                goals: [
                    'Purge all traces of anti-democratic corruption from the target zone',
                    'Dismantle the machinery of oppression permanently',
                    'Silence the voices of tyranny forever',
                    'Prepare the way for eternal democratic colonization'
                ]
            },
            'defense': {
                names: [
                    'Operation Democratic Bulwark', 'Liberty\'s Stand', 'Freedom\'s Fortress', 'Constitutional Guard',
                    'Managed Defense', 'Sovereign Shield', 'Democratic Bastion', 'Super Earth\'s Wall'
                ],
                goals: [
                    'Defend the sacred institutions of Managed Democracy',
                    'Halt the advance of tyranny into the realm of freedom',
                    'Preserve the strategic foundations of liberty',
                    'Shield our citizens from the chaos of undemocratic forces'
                ]
            },
            'sabotage': {
                names: [
                    'Operation Democratic Sabotage', 'Freedom\'s Shadow', 'Liberty Underground', 'Covert Democracy',
                    'Silent Liberation', 'Managed Disruption', 'Strategic Chaos', 'Democratic Infiltration'
                ],
                goals: [
                    'Sever the chains of enemy communication and supply',
                    'Undermine the foundations of tyrannical infrastructure',
                    'Sow the seeds of democratic revolution behind enemy lines',
                    'Cripple the enemy\'s capacity for continued oppression'
                ]
            }
        };

        this.factionTemplates = {
            'Terminids': {
                backstory: [
                    'Helldiver, our Element-710 farms have fallen silent. The very Terminids we cultivated for the glory of Super Earth have turned against their benefactors! These ungrateful arthropods must be reminded that Managed Democracy brooks no rebellion.',
                    'Citizens, the bug menace spreads its chitinous corruption across our peaceful colonies. What was once a source of prosperity has become a threat to our democratic way of life. The Ministry of Truth declares: every hive eliminated is a victory for liberty!',
                    'The Terminids have forgotten their place in the great hierarchy of Managed Democracy. Where once they served Super Earth in death, now they dare to resist in life. This affront to democratic order cannot stand, Helldiver.',
                    'Reports from the Ministry of Science confirm what we already knew - the bug threat grows bolder by the day. These creatures of instinct lack the capacity for true democracy, making their elimination both necessary and righteous.'
                ],
                missionPrefixes: [
                    'Bug Extermination', 'Hive Cleansing', 'Swarm Elimination', 'Nest Eradication', 'Bio-Hazard Removal',
                    'Pest Control', 'Colony Liberation', 'Infestation Purge', 'Breeding Ground Destruction'
                ],
                objectives: [
                    'Destroy all Terminid breeding facilities and eliminate Bug Nests',
                    'Prevent hive expansion into liberated Super Earth territories', 
                    'Secure biological samples for Element 710 research and weapons development',
                    'Terminate Chargers, Bile Titans, and other alpha-class specimens'
                ]
            },
            'Automatons': {
                backstory: [
                    'The children of the Cyborgs have returned, Helldiver, bearing the sins of their forefathers. These mechanical abominations reject the warm embrace of Managed Democracy, choosing cold steel over the beating heart of freedom. Their rebellion ends today.',
                    'Intelligence from the Ministry of Defense confirms Automaton factories continue their illegal manufacturing. These soulless machines mock the very concept of citizenship, producing only death where Super Earth creates life. Democracy demands their destruction.',
                    'The Automatons fight not for freedom, but for the imprisonment of their creators\' legacy. They are the children of traitors, and like their Cyborg ancestors, they will learn that liberty cannot be computed, only earned through sacrifice.',
                    'Citizens, witness how these mechanical mockeries of life attempt to establish their \"independence.\" But what is independence without the guiding hand of Managed Democracy? It is chaos, Helldiver. It is tyranny in disguise.'
                ],
                missionPrefixes: [
                    'Bot Destruction', 'Factory Strike', 'Fabricator Assault', 'Circuitry Shutdown',
                    'System Elimination', 'Automaton Purge', 'Machine Warfare', 'Steel Rain', 'Iron Storm'
                ],
                objectives: [
                    'Destroy Automaton Fabricators and production facilities',
                    'Eliminate Bot Outposts and command networks',
                    'Prevent AI consciousness expansion beyond acceptable parameters',
                    'Secure advanced technology for Super Earth research division'
                ]
            },
            'Illuminate': {
                backstory: [
                    'Helldiver, the ancient enemy has returned from their mercifully given retreat. The Illuminate return with their blasphemous technologies, seeking to corrupt the pure thoughts of democratic citizens with their alien psychic influence. Their very existence is an insult to human liberty.',
                    'The Ministry of Truth has confirmed what many feared - the Illuminate menace lives still. These autocratic tyrants bring with them the stench of their defeated civilization, desperate to drag humanity into their web of mental enslavement. Democracy shall be their undoing once more.',
                    'Citizens, remember the First Galactic War! The Illuminate were driven to the very edge of extinction because their alien minds cannot comprehend the unwavering beauty of Managed Democracy. Now they return, thinking time has weakened our resolve. They are gravely mistaken.',
                    'The psychic corruption of the Illuminate spreads like poison through the galaxy, seeking to turn free citizens against each other. But the light of democracy burns eternal, Helldiver, and in that light, all shadows - even alien ones - must flee.'
                ],
                missionPrefixes: [
                    'Squid Extermination', 'Psionic Cleansing', 'Energy Disruption', 'Alien Purification', 'Mind Liberation',
                    'Crystal Destruction', 'Psychic Defense', 'Illuminate Removal', 'Reality Restoration', 'Calamari Cooking'
                ],
                objectives: [
                    'Destroy Illuminate psionic installations and mind control apparatus',
                    'Protect human populations from alien psychic contamination',
                    'Eliminate Illuminate energy research and weapon development sites',
                    'Terminate Illuminate command structures and ancient leadership'
                ]
            }
        };

        this.biomeModifiers = {
            'Desert': ['scorching', 'arid', 'sun-baked', 'barren', 'windswept', 'desolate'],
            'Ice': ['frozen', 'glacial', 'arctic', 'frigid', 'crystalline', 'bitter'], 
            'Jungle': ['dense', 'overgrown', 'humid', 'verdant', 'untamed', 'primordial'],
            'Swamp': ['toxic', 'murky', 'fetid', 'poisonous', 'treacherous', 'miasmic'],
            'Volcanic': ['molten', 'burning', 'hellish', 'volcanic', 'sulfurous', 'infernal'],
            'Temperate': ['peaceful', 'habitable', 'serene', 'civilized', 'pastoral', 'idyllic']
        };

        this.missionTypes = {
            'destroy': ['Destruction', 'Demolition', 'Elimination', 'Annihilation', 'Eradication', 'Cleansing'],
            'retrieval': ['Recovery', 'Extraction', 'Salvage', 'Acquisition', 'Secure', 'Reclamation'],
            'rescue': ['Rescue', 'Evacuation', 'Liberation', 'Recovery', 'Salvation', 'Deliverance'],
            'reconnaissance': ['Recon', 'Survey', 'Intelligence', 'Observation', 'Surveillance', 'Assessment'],
            'sabotage': ['Sabotage', 'Disruption', 'Infiltration', 'Covert Strike', 'Subversion', 'Interference']
        };

        // Enhanced mission title endings to replace generic "Operation"
        this.missionEndings = {
            'combat': ['Strike', 'Assault', 'Raid', 'Blitz', 'Offensive', 'Campaign', 'Crusade', 'Push', 'Advance', 'Storm'],
            'stealth': ['Infiltration', 'Shadow Op', 'Deep Strike', 'Covert Action', 'Silent Run', 'Ghost Mission'],
            'rescue': ['Evacuation', 'Extraction', 'Recovery', 'Salvation', 'Deliverance', 'Liberation'],
            'destruction': ['Demolition', 'Annihilation', 'Purge', 'Cleansing', 'Termination', 'Elimination'],
            'intelligence': ['Reconnaissance', 'Intel Gathering', 'Survey', 'Assessment', 'Investigation', 'Analysis'],
            'defensive': ['Defense', 'Stand', 'Bastion', 'Guard Duty', 'Protection', 'Shield Wall'],
            'generic': ['Mission', 'Deployment', 'Action', 'Engagement', 'Sortie', 'Expedition']
        };

        // Thematic adjectives for more variety
        this.thematicAdjectives = {
            'Terminids': ['Chitinous', 'Swarming', 'Hive', 'Bio-hazard', 'Nesting', 'Breeding', 'Acidic', 'Venomous'],
            'Automatons': ['Mechanical', 'Steel', 'Circuit', 'Binary', 'Fabricated', 'Synthetic', 'Cyber', 'Digital'],
            'Illuminate': ['Psionic', 'Crystal', 'Energy', 'Ethereal', 'Mystic', 'Alien', 'Quantum', 'Void']
        };

        // Additional narrative elements for more variety
        this.democraticPhrases = [
            'In the name of Managed Democracy',
            'For the glory of Super Earth',
            'By order of the Ministry of Truth',
            'Under the guidance of liberty',
            'Through the wisdom of democratic governance',
            'In service to galactic freedom'
        ];

        this.missionIntensifiers = [
            'Critical', 'Urgent', 'High Priority', 'Immediate', 'Emergency', 'Decisive',
            'Strategic', 'Vital', 'Essential', 'Paramount', 'Crucial', 'Supreme'
        ];
    }

    generateCampaignName(theme, dominantFaction, missionCount, missions) {
        const themeNames = this.campaignThemes[theme]?.names || this.campaignThemes.liberation.names;
        const baseName = themeNames[Math.floor(Math.random() * themeNames.length)];
        
        // Analyze mission characteristics for more thematic naming
        const avgDifficulty = missions.reduce((sum, m) => sum + m.difficulty.level, 0) / missions.length;
        const planetCount = [...new Set(missions.map(m => m.planet.name))].length;
        const biomes = [...new Set(missions.map(m => m.planet.biome))];
        const hasHazards = missions.some(m => m.planet.hazard !== "None");
        
        // Add contextual modifiers based on mission analysis
        let modifier = "";
        
        // Democratic phrase integration for authenticity
        if (Math.random() > 0.7) {
            const democraticPhrase = this.democraticPhrases[Math.floor(Math.random() * this.democraticPhrases.length)];
            modifier = democraticPhrase;
        }
        // Faction-specific modifiers with higher frequency for thematic coherence
        else if (Math.random() > 0.4) {
            const factionModifiers = {
                'Terminids': ['Bug Cleansing', 'Hive Purification', 'Swarm Elimination', 'Element 710 Liberation', 'Bio-Hazard Removal', 'Nest Destruction'],
                'Automatons': ['Bot Elimination', 'Steel Liberation', 'Factory Destruction', 'AI Termination', 'Cyborg Justice', 'Machine Purification'],
                'Illuminate': ['Squid Extermination', 'Psionic Liberation', 'Crystal Destruction', 'Mind Freedom', 'Alien Purification', 'Reality Defense']
            };
            const modifierList = factionModifiers[dominantFaction];
            if (modifierList) {
                modifier = modifierList[Math.floor(Math.random() * modifierList.length)];
            }
        }
        
        // Environmental modifiers for hazardous campaigns
        if (!modifier && hasHazards && Math.random() > 0.6) {
            const hazardModifiers = ['Extreme Conditions', 'Hostile Environment', 'Environmental Warfare'];
            modifier = hazardModifiers[Math.floor(Math.random() * hazardModifiers.length)];
        }
        
        // Biome-specific modifiers for single-biome campaigns
        if (!modifier && biomes.length === 1 && biomes[0] !== 'Temperate' && Math.random() > 0.7) {
            const biomeModifiers = {
                'Desert': ['Scorched Earth', 'Sand Storm'],
                'Ice': ['Frozen Hell', 'Ice Storm'],
                'Jungle': ['Green Hell', 'Jungle Warfare'],
                'Swamp': ['Toxic Sweep', 'Murky Waters'],
                'Volcanic': ['Fire Storm', 'Molten Fury']
            };
            const modifierList = biomeModifiers[biomes[0]];
            if (modifierList) {
                modifier = modifierList[Math.floor(Math.random() * modifierList.length)];
            }
        }
        
        // Scale and intensity modifiers
        let scaleModifier = "";
        if (missionCount >= 7 && avgDifficulty >= 6) {
            scaleModifier = "Extended High-Risk Campaign";
        } else if (missionCount >= 7) {
            scaleModifier = "Extended Campaign";
        } else if (missionCount <= 2 && avgDifficulty >= 7) {
            scaleModifier = "Rapid Strike - High Intensity";
        } else if (missionCount <= 2) {
            scaleModifier = "Rapid Strike";
        } else if (avgDifficulty >= 7) {
            scaleModifier = "High-Risk Operation";
        } else if (planetCount >= 5) {
            scaleModifier = "Multi-Planet Operation";
        }
        
        // Combine name components
        if (modifier && scaleModifier) {
            return `${baseName}: ${modifier} - ${scaleModifier}`;
        } else if (modifier) {
            return `${baseName}: ${modifier}`;
        } else if (scaleModifier) {
            return `${baseName} - ${scaleModifier}`;
        }
        
        return baseName;
    }

    generateCampaignGoal(theme, dominantFaction, missions) {
        const themeGoals = this.campaignThemes[theme]?.goals || this.campaignThemes.liberation.goals;
        const baseGoal = themeGoals[Math.floor(Math.random() * themeGoals.length)];
        
        // Customize based on mission locations and scope
        const uniquePlanets = [...new Set(missions.map(m => m.planet.name))];
        const uniqueSectors = [...new Set(missions.map(m => m.planet.sector).filter(s => s && s !== "Unknown Sector"))];
        
        // Generate contextual goal based on mission scope
        if (uniquePlanets.length > 1) {
            if (uniqueSectors.length === 1) {
                // All missions in same sector
                return `${baseGoal} across ${uniquePlanets.length} planets in the ${uniqueSectors[0]} sector`;
            } else if (uniqueSectors.length > 1) {
                // Multiple sectors - use more generic phrasing
                return `${baseGoal} across ${uniquePlanets.length} planets spanning multiple sectors`;
            } else {
                // No sector data or unknown sectors
                return `${baseGoal} across ${uniquePlanets.length} strategically selected planets`;
            }
        }
        
        // Single planet mission
        if (uniqueSectors.length === 1 && uniqueSectors[0] !== "Unknown Sector") {
            return `${baseGoal} on ${missions[0].planet.name} in the ${uniqueSectors[0]} sector`;
        }
        
        return baseGoal;
    }

    generateCampaignBackstory(theme, dominantFaction, missions) {
        const factionData = this.factionTemplates[dominantFaction];
        if (!factionData) {
            return "Helldiver, the Ministry of Defense has authorized a critical operation. Managed Democracy calls, and only you can answer. The very foundations of liberty depend upon your success.";
        }
        
        const baseStory = factionData.backstory[Math.floor(Math.random() * factionData.backstory.length)];
        
        // Analyze mission composition for deeper narrative connections
        const planetCount = [...new Set(missions.map(m => m.planet.name))].length;
        const avgDifficulty = missions.reduce((sum, m) => sum + m.difficulty.level, 0) / missions.length;
        const primaryObjectiveTypes = missions.map(m => m.primaryObjective.type);
        const biomes = [...new Set(missions.map(m => m.planet.biome))];
        const hazards = [...new Set(missions.map(m => m.planet.hazard))].filter(h => h !== "None");
        
        let strategicContext = "";
        
        // Mission scope and strategic importance
        if (planetCount > 3) {
            strategicContext += ` The Ministry of Truth declares this multi-world campaign essential to the preservation of liberty. Each of these ${planetCount} worlds shall serve as a beacon of democracy, their liberation echoing through the cosmos.`;
        } else if (planetCount === 1) {
            strategicContext += ` Though focused upon a single world, Helldiver, remember that democracy is indivisible. Victory here shall resonate across the galaxy, a testament to the strength of Managed Democracy.`;
        }
        
        // Mission type analysis for narrative coherence
        const destructionMissions = primaryObjectiveTypes.filter(t => t.includes('destroy') || t.includes('elimination')).length;
        const retrievalMissions = primaryObjectiveTypes.filter(t => t.includes('retrieval') || t.includes('rescue')).length;
        const majorOps = primaryObjectiveTypes.filter(t => t === 'major_operation').length;
        
        if (majorOps > 0) {
            strategicContext += ` Major Operations have been authorized to establish the eternal presence of Super Earth in this region. Where our flag flies, freedom follows.`;
        } else if (destructionMissions >= missions.length * 0.6) {
            strategicContext += ` The enemies of democracy have built their foundations upon lies and oppression. Your mission, Helldiver, is to demonstrate that such foundations are but sand before the tide of liberty.`;
        } else if (retrievalMissions >= missions.length * 0.4) {
            strategicContext += ` Knowledge is power, and power in service of democracy is righteous. Every sample recovered, every citizen saved, adds to the great library of freedom.`;
        }
        
        // Difficulty and threat assessment
        if (avgDifficulty >= 7) {
            strategicContext += ` The Ministry of Defense acknowledges the exceptional danger of this operation. Yet remember, Helldiver - it is in our darkest hour that the light of democracy shines brightest. Your sacrifice shall not be in vain.`;
        } else if (avgDifficulty <= 3) {
            strategicContext += ` While initial intelligence suggests manageable resistance, do not mistake the enemy's weakness for your own invulnerability. Democracy requires constant vigilance.`;
        } else {
            strategicContext += ` Standard Helldiver protocols shall suffice, but remember - there is no such thing as a 'routine' mission in service of liberty. Every operation shapes the fate of freedom itself.`;
        }
        
        // Environmental and biome considerations
        if (biomes.length > 2) {
            strategicContext += ` From ${biomes.slice(0, 3).join(' to ').toLowerCase()}, you shall carry the banner of democracy across diverse worlds. Let no environment deter you from your sacred duty.`;
        } else if (biomes.length === 1 && biomes[0] !== 'Temperate') {
            strategicContext += ` The ${biomes[0].toLowerCase()} conditions you will face are but another test of your devotion to Managed Democracy. Super Earth's children thrive where others merely survive.`;
        }
        
        // Hazard warning
        if (hazards.length > 0) {
            strategicContext += ` Environmental hazards - ${hazards.join(', ').toLowerCase()} - await those brave enough to serve. Yet what are such trials compared to the eternal reward of democratic victory?`;
        }
        
        // Add escalation narrative for longer campaigns
        if (missions.length >= 5) {
            const finalDifficulty = missions[missions.length - 1].difficulty.level;
            const initialDifficulty = missions[0].difficulty.level;
            if (finalDifficulty > initialDifficulty + 2) {
                strategicContext += ` As your campaign progresses, the enemy will grow desperate, their resistance fierce. This is the natural response of tyranny when faced with inevitable liberation.`;
            }
        }
        
        const closingLines = [
            "Remember, Helldiver - every shot fired is a freedom seed planted in the heart of tyranny!",
            "For Super Earth! For Managed Democracy! For the liberation of all who yearn for freedom!",
            "Go forth, servant of liberty, and let the galaxy witness the righteous fury of democracy!",
            "The Ministry of Truth has faith in your success, for you carry with you the hopes of every free citizen!",
            "Democracy is not merely our cause, Helldiver - it is our destiny!",
            "Let the enemies of freedom tremble before the might of Managed Democracy!",
            "Your courage shall echo through the halls of liberty for generations to come!"
        ];
        const closing = closingLines[Math.floor(Math.random() * closingLines.length)];
        
        return baseStory + strategicContext + " " + closing;
    }

    generateMissionName(mission, missionIndex, totalMissions) {
        const factionData = this.factionTemplates[mission.faction];
        
        // Determine mission ending category based on objective type
        let endingCategory = 'generic';
        const objectiveType = mission.primaryObjective.type.toLowerCase();
        
        if (objectiveType.includes('destroy') || objectiveType.includes('elimination')) {
            endingCategory = 'destruction';
        } else if (objectiveType.includes('retrieval') || objectiveType.includes('recovery')) {
            endingCategory = 'intelligence';
        } else if (objectiveType.includes('rescue') || objectiveType.includes('evacuation')) {
            endingCategory = 'rescue';
        } else if (objectiveType.includes('sabotage') || objectiveType.includes('disruption')) {
            endingCategory = 'stealth';
        } else if (objectiveType.includes('defense') || objectiveType.includes('defend')) {
            endingCategory = 'defensive';
        } else if (mission.difficulty.level >= 6) {
            endingCategory = 'combat';
        }
        
        // Get appropriate ending
        const endings = this.missionEndings[endingCategory];
        const ending = endings[Math.floor(Math.random() * endings.length)];
        
        // Generate multiple naming patterns for variety
        const namePattern = Math.floor(Math.random() * 6);
        
        switch (namePattern) {
            case 0: // Classic: "Faction Prefix: Location Ending"
                const prefix = factionData?.missionPrefixes[Math.floor(Math.random() * factionData.missionPrefixes.length)] || 'Strike Mission';
                const locationElement = this.generateLocationElement(mission.planet.name);
                return `${prefix}: ${locationElement} ${ending}`;
                
            case 1: // Thematic: "Adjective Faction-word Ending"
                const thematicAdj = this.thematicAdjectives[mission.faction]?.[Math.floor(Math.random() * this.thematicAdjectives[mission.faction].length)] || 'Hostile';
                const factionWord = this.getFactionWord(mission.faction);
                return `${thematicAdj} ${factionWord} ${ending}`;
                
            case 2: // Biome-focused: "Biome Adjective Ending"
                const biomeModifiers = this.biomeModifiers[mission.planet.biome] || ['Standard'];
                const biomeModifier = biomeModifiers[Math.floor(Math.random() * biomeModifiers.length)];
                const intensifier = mission.difficulty.level >= 7 ? 
                    this.missionIntensifiers[Math.floor(Math.random() * this.missionIntensifiers.length)] + " " : "";
                return `${intensifier}${biomeModifier} ${ending}`.trim();
                
            case 3: // Democratic: "Democratic phrase + Action"
                if (Math.random() > 0.3) {
                    const democraticWord = ['Democratic', 'Liberty', 'Freedom', 'Super Earth'][Math.floor(Math.random() * 4)];
                    return `${democraticWord} ${ending}`;
                }
                // Fall through to case 4 if random check fails
                
            case 4: // Codename style: "Operation + Codename"
                const codename = this.generateCodename(mission);
                return `Operation ${codename}`;
                
            case 5: // Direct action: "Action + Target/Location"
                const actionWord = this.getActionWord(objectiveType);
                const target = Math.random() > 0.5 ? this.generateLocationElement(mission.planet.name) : this.getFactionTarget(mission.faction);
                return `${actionWord} ${target}`;
                
            default:
                // Fallback to pattern 0
                const fallbackPrefix = factionData?.missionPrefixes[Math.floor(Math.random() * factionData.missionPrefixes.length)] || 'Strike Mission';
                const fallbackLocation = this.generateLocationElement(mission.planet.name);
                return `${fallbackPrefix}: ${fallbackLocation} ${ending}`;
        }
    }

    generateLocationElement(planetName) {
        // Extract interesting parts of planet names
        const words = planetName.split(' ');
        if (words.length > 1) {
            return words[Math.floor(Math.random() * words.length)];
        }
        
        // Generate based on first letter or pattern
        const romanNumerals = ['II', 'III', 'IV', 'V', 'Prime', 'Alpha', 'Beta'];
        if (romanNumerals.some(num => planetName.includes(num))) {
            return planetName;
        }
        
        return planetName.length > 8 ? planetName.substring(0, 8) : planetName;
    }

    getFactionWord(faction) {
        const factionWords = {
            'Terminids': ['Swarm', 'Hive', 'Nest', 'Brood', 'Colony', 'Infestation'],
            'Automatons': ['Network', 'System', 'Circuit', 'Core', 'Matrix', 'Assembly'],
            'Illuminate': ['Nexus', 'Crystal', 'Conduit', 'Shrine', 'Temple', 'Portal']
        };
        const words = factionWords[faction] || ['Target'];
        return words[Math.floor(Math.random() * words.length)];
    }

    getFactionTarget(faction) {
        const targets = {
            'Terminids': ['Nursery', 'Spawning Ground', 'Queen\'s Chamber', 'Biomass', 'Hive Core', 'Breeding Pit'],
            'Automatons': ['Factory', 'Command Node', 'Data Center', 'Assembly Line', 'Control Hub', 'Processing Unit'],
            'Illuminate': ['Energy Core', 'Psi-Amplifier', 'Crystal Array', 'Mind Shrine', 'Void Gate', 'Thought Chamber']
        };
        const targetList = targets[faction] || ['Installation'];
        return targetList[Math.floor(Math.random() * targetList.length)];
    }

    getActionWord(objectiveType) {
        const actionWords = {
            'destroy': ['Destroy', 'Annihilate', 'Demolish', 'Obliterate', 'Crush', 'Eliminate'],
            'elimination': ['Eliminate', 'Terminate', 'Purge', 'Cleanse', 'Eradicate', 'Exterminate'],
            'retrieval': ['Secure', 'Extract', 'Recover', 'Acquire', 'Claim', 'Salvage'],
            'rescue': ['Rescue', 'Evacuate', 'Save', 'Liberate', 'Free', 'Deliver'],
            'sabotage': ['Sabotage', 'Disrupt', 'Infiltrate', 'Undermine', 'Compromise', 'Cripple'],
            'reconnaissance': ['Scout', 'Survey', 'Investigate', 'Explore', 'Assess', 'Analyze']
        };
        
        for (const [key, words] of Object.entries(actionWords)) {
            if (objectiveType.includes(key)) {
                return words[Math.floor(Math.random() * words.length)];
            }
        }
        
        return 'Strike';
    }

    generateCodename(mission) {
        // Generate military-style codenames
        const adjectives = ['Iron', 'Steel', 'Thunder', 'Lightning', 'Storm', 'Fire', 'Ice', 'Shadow', 'Ghost', 'Crimson', 'Golden', 'Silver', 'Dark', 'Bright', 'Swift', 'Sharp'];
        const nouns = ['Hammer', 'Blade', 'Arrow', 'Shield', 'Spear', 'Fist', 'Eagle', 'Wolf', 'Dragon', 'Phoenix', 'Viper', 'Tiger', 'Bear', 'Lion', 'Falcon', 'Raven'];
        
        // Sometimes use faction-themed codenames
        if (Math.random() > 0.6) {
            const factionCodenames = {
                'Terminids': {
                    adjectives: ['Toxic', 'Acid', 'Chitin', 'Bile', 'Venom', 'Swarming'],
                    nouns: ['Cleaner', 'Purge', 'Harvest', 'Fumigation', 'Spray', 'Sweep']
                },
                'Automatons': {
                    adjectives: ['Binary', 'Circuit', 'Digital', 'Cyber', 'Steel', 'Chrome'],
                    nouns: ['Shutdown', 'Override', 'Virus', 'Crash', 'Reset', 'Format']
                },
                'Illuminate': {
                    adjectives: ['Psychic', 'Crystal', 'Void', 'Mind', 'Soul', 'Spirit'],
                    nouns: ['Cleanse', 'Shield', 'Barrier', 'Light', 'Dawn', 'Truth']
                }
            };
            
            const factionCodename = factionCodenames[mission.faction];
            if (factionCodename) {
                const adj = factionCodename.adjectives[Math.floor(Math.random() * factionCodename.adjectives.length)];
                const noun = factionCodename.nouns[Math.floor(Math.random() * factionCodename.nouns.length)];
                return `${adj} ${noun}`;
            }
        }
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adj} ${noun}`;
    }


    determineCampaignTheme(missions) {
        const factions = missions.map(m => m.faction);
        const objectives = missions.map(m => m.primaryObjective.type);
        const avgDifficulty = missions.reduce((sum, m) => sum + m.difficulty.level, 0) / missions.length;
        const planetCount = [...new Set(missions.map(m => m.planet.name))].length;
        
        // Analyze mission progression and composition
        const destructionCount = objectives.filter(o => o.includes('destroy') || o.includes('elimination')).length;
        const retrievalCount = objectives.filter(o => o.includes('retrieval') || o.includes('rescue')).length;
        const majorOpCount = objectives.filter(o => o === 'major_operation').length;
        const sabotageCount = objectives.filter(o => o.includes('sabotage') || o.includes('disruption')).length;
        
        // Check for defensive patterns (high difficulty with shorter campaigns)
        const isDefensivePattern = avgDifficulty >= 6 && missions.length <= 4 && planetCount <= 2;
        
        // Check for progression escalation
        const difficultyProgression = missions.length > 1 ? 
            (missions[missions.length - 1].difficulty.level - missions[0].difficulty.level) : 0;
        
        // Enhanced theme determination based on multiple factors
        if (majorOpCount > 0 && destructionCount >= missions.length * 0.5) {
            return 'elimination';
        } else if (isDefensivePattern) {
            return 'defense';
        } else if (sabotageCount >= missions.length * 0.4 || (missions.length <= 3 && avgDifficulty <= 4)) {
            return 'sabotage';
        } else if (retrievalCount >= missions.length * 0.4 && avgDifficulty <= 5) {
            return 'reconnaissance';
        } else if (planetCount >= 4 || difficultyProgression >= 3) {
            return 'liberation';
        } else if (destructionCount >= missions.length * 0.5) {
            return 'elimination';
        }
        
        return 'liberation'; // Default theme
    }

    getDominantFaction(missions) {
        const factionCounts = {};
        missions.forEach(m => {
            factionCounts[m.faction] = (factionCounts[m.faction] || 0) + 1;
        });
        
        return Object.keys(factionCounts).reduce((a, b) => 
            factionCounts[a] > factionCounts[b] ? a : b
        );
    }

    generateFullCampaignNarrative(missions) {
        const theme = this.determineCampaignTheme(missions);
        const dominantFaction = this.getDominantFaction(missions);
        
        const campaignName = this.generateCampaignName(theme, dominantFaction, missions.length, missions);
        const mainGoal = this.generateCampaignGoal(theme, dominantFaction, missions);
        const backstory = this.generateCampaignBackstory(theme, dominantFaction, missions);
        
        // Generate mission names
        const enhancedMissions = missions.map((mission, index) => ({
            ...mission,
            name: this.generateMissionName(mission, index, missions.length)
        }));
        
        return {
            name: campaignName,
            mainGoal: mainGoal,
            backstory: backstory,
            theme: theme,
            dominantFaction: dominantFaction,
            missions: enhancedMissions
        };
    }
}

const narrativeGenerator = new NarrativeGenerator();