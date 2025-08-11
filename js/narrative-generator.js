class NarrativeGenerator {
    constructor() {
        this.campaignThemes = {
            'liberation': {
                names: [
                    'Operation Democratic Liberation', 'Freedom\'s Call', 'Liberty Ascendant', 'Sovereign Dawn',
                    'Democratic Reclamation', 'Super Earth\'s Triumph', 'Managed Victory', 'Constitutional Restoration',
                    'Operation Valiant Expansion', 'Operation Swift Liberation', 'Operation Legitimate Reclamation', 'The Democratic Advance',
                    'Operation Enduring Freedom', 'Operation Righteous Enclosure', 'Operation Strategic Liberation', 'The Great Reclamation',
                    'Operation Democratic Consolidation', 'Operation Managed Pacification', 'Operation Constitutional Order', 'The Liberty Initiative',
                    'Operation Citizen Protection', 'Operation Territorial Expansion', 'Operation Strategic Advance', 'The Freedom Campaign',
                    'Operation Democratic Establishment', 'Operation Sector Liberation', 'Operation Planetary Reclamation', 'The Constitutional Drive'
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
                    'Knowledge Harvest', 'Wisdom\'s Edge', 'Intelligence Supremacy', 'Strategic Insight',
                    'Operation Swift Assessment', 'Operation Legitimate Survey', 'The Intelligence Initiative', 'Operation Strategic Reconnaissance',
                    'Operation Valiant Discovery', 'Database Acquisition Campaign', 'The Research Initiative', 'Operation Sector Analysis',
                    'Operation Democratic Intelligence', 'The Truth Campaign', 'Operation Territorial Survey', 'Strategic Assessment Drive',
                    'Operation Intelligence Gathering', 'The Discovery Initiative', 'Operation Planetary Assessment', 'Sector Intelligence Campaign'
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
                    'Absolute Resolution', 'Righteous Extermination', 'Freedom\'s Wrath', 'Complete Liberation',
                    'Operation Swift Disassembly', 'Operation Valiant Termination', 'The Final Campaign', 'Operation Strategic Elimination',
                    'Operation Complete Pacification', 'Operation Legitimate Termination', 'The Extermination Initiative', 'Operation Total Victory',
                    'Operation Enduring Peace', 'The Final Solution', 'Operation Democratic Conclusion', 'Strategic Termination Campaign',
                    'Operation Sector Cleansing', 'The Elimination Drive', 'Operation Planetary Purification', 'Total Victory Initiative'
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
                    'Managed Defense', 'Sovereign Shield', 'Democratic Bastion', 'Super Earth\'s Wall',
                    'Operation Valiant Defense', 'Operation Strategic Hold', 'The Defensive Initiative', 'Operation Sector Defense',
                    'Hold the Line Campaign', 'Operation Legitimate Defense', 'The Protection Initiative', 'Halt the Advance',
                    'Operation Enduring Shield', 'The Defensive Drive', 'Operation Territorial Protection', 'Strategic Defense Campaign',
                    'Operation Citizen Shield', 'The Guardian Initiative', 'Operation Planetary Defense', 'Sector Protection Drive'
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
                    'Silent Liberation', 'Managed Disruption', 'Strategic Chaos', 'Democratic Infiltration',
                    'Operation Swift Disruption', 'Operation Legitimate Sabotage', 'The Covert Initiative', 'Operation Strategic Interference',
                    'Operation Valiant Infiltration', 'Decommission Campaign', 'The Disruption Initiative', 'Operation Silent Strike',
                    'Operation Stealth Operations', 'The Sabotage Drive', 'Operation Covert Action', 'Strategic Disruption Campaign',
                    'Operation Shadow Strike', 'The Infiltration Initiative', 'Operation Underground Action', 'Covert Operations Drive'
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
                    'PRIORITY ALERT - Helldiver, our Element-710 facilities have gone dark across the sector. The Terminid populations we once managed for Super Earth\'s prosperity have broken containment protocols. These creatures of pure instinct threaten the democratic order we have worked generations to establish.',
                    'STRATEGIC BULLETIN - Citizens, the insectoid menace expands beyond acceptable parameters. What began as controlled cultivation has become an existential threat to our colonies. The Ministry of Science confirms these organisms lack democratic reasoning, making decisive action both warranted and necessary.',
                    'OPERATIONAL DIRECTIVE - The Terminids operate on biological imperatives incompatible with civilized society. Their hive structures represent a form of totalitarian organization that stands opposed to individual liberty. This biological tyranny must be curtailed before it spreads further.',
                    'DEFENSE ADVISORY - Intelligence reports indicate accelerating Terminid expansion across multiple world systems. These creatures follow only genetic programming, creating a natural hierarchy that contradicts the principles of Managed Democracy. Immediate intervention is required to preserve our way of life.',
                    'COMMAND BRIEFING - The Terminid threat grows more coordinated with each passing cycle. Their swarm mentality represents everything Super Earth stands against - mindless conformity over individual thought, biological determinism over democratic choice. The time for half-measures has passed.'
                ],
                missionPrefixes: [
                    'Bug Extermination', 'Hive Cleansing', 'Swarm Elimination', 'Nest Eradication', 'Bio-Hazard Removal',
                    'Pest Control', 'Colony Liberation', 'Infestation Purge', 'Breeding Ground Destruction',
                    'Tyranny Suppression', 'Annexation Prevention', 'Invasion Halt', 'Consumption Control',
                    'Breeding Disruption', 'Colony Reclamation', 'Territorial Defense', 'Expansion Prevention'
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
                    'TACTICAL ASSESSMENT - Helldiver, the Automaton threat has evolved beyond initial projections. These mechanical entities, remnants of the Cyborg conflict, have established unauthorized manufacturing capabilities. Their rigid hierarchical systems directly oppose the flexible governance of Managed Democracy.',
                    'INTELLIGENCE REPORT - Automaton production facilities operate without democratic oversight across multiple sectors. These artificial constructs follow predetermined algorithms rather than reasoned debate, representing a fundamental challenge to citizen participation in governance. Immediate dismantling is recommended.',
                    'OPERATIONAL ANALYSIS - The Automatons pursue expansion through calculated efficiency rather than democratic consensus. Their networked decision-making eliminates individual agency, creating a system antithetical to personal liberty. This mechanical collectivism must be countered with human resolve.',
                    'STRATEGIC EVALUATION - Citizens should understand that Automaton independence movements threaten the collaborative nature of democratic society. These entities mistake isolation for autonomy, failing to recognize that true freedom requires community participation and shared responsibility.',
                    'COMMAND ASSESSMENT - Automaton forces demonstrate concerning coordination capabilities that bypass traditional diplomatic channels. Their rejection of negotiation in favor of programmed responses makes peaceful resolution unlikely. Military intervention remains the most viable solution to preserve democratic stability.'
                ],
                missionPrefixes: [
                    'Bot Destruction', 'Factory Strike', 'Fabricator Assault', 'Circuitry Shutdown',
                    'System Elimination', 'Automaton Purge', 'Machine Warfare', 'Steel Rain', 'Iron Storm',
                    'Socialist Suppression', 'Programming Override', 'Industrial Disruption', 'Network Termination',
                    'Production Halt', 'Algorithm Corruption', 'Manufacturing Shutdown', 'Systematic Elimination'
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
                    'XENOLOGICAL ALERT - Helldiver, long-range sensors have detected the return of Illuminate forces to contested space. These entities employ psychic manipulation technologies that interfere with standard democratic processes. Their influence operations represent a direct threat to citizen autonomy and free thought.',
                    'MINISTRY ADVISORY - Historical records confirm the Illuminate previously attempted large-scale mental conditioning programs against human populations. Their advanced energy manipulation capabilities enable coercive influence over democratic decision-making. Renewed vigilance is essential to preserve cognitive liberty.',
                    'RESEARCH BULLETIN - Illuminate technology operates on principles fundamentally incompatible with transparent governance. Their psychic networks bypass normal communication channels, creating undemocratic hierarchies of mental influence. This alien approach to organization threatens the foundation of consensual government.',
                    'STRATEGIC WARNING - Citizens should be aware that Illuminate presence affects local mental clarity and decision-making capacity. Their energy field manipulations can compromise the rational thought processes essential to democratic participation. Maintaining distance from their installations is strongly recommended.',
                    'XENOLOGICAL ASSESSMENT - The Illuminate represent a form of consciousness-based authoritarianism that operates through mental coercion rather than physical force. Their return suggests renewed attempts to establish psychic dominion over free-thinking populations. Resistance to their influence remains humanity\'s highest priority.'
                ],
                missionPrefixes: [
                    'Squid Extermination', 'Psionic Cleansing', 'Energy Disruption', 'Alien Purification', 'Mind Liberation',
                    'Crystal Destruction', 'Psychic Defense', 'Illuminate Removal', 'Reality Restoration', 'Calamari Cooking',
                    'Mental Freedom', 'Cognitive Defense', 'Influence Disruption', 'Psychic Containment',
                    'Neural Protection', 'Consciousness Liberation', 'Mind Shield Operations', 'Thought Defense'
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
            'Desert': ['scorching', 'arid', 'sun-baked', 'barren', 'windswept', 'desolate', 'irradiated', 'sun-scorched', 'thermal', 'desiccated', 'hostile', 'exposed'],
            'Ice': ['frozen', 'glacial', 'arctic', 'frigid', 'crystalline', 'bitter', 'sub-zero', 'permafrost', 'icebound', 'polar', 'cryogenic', 'frost-locked'], 
            'Jungle': ['dense', 'overgrown', 'humid', 'verdant', 'untamed', 'primordial', 'canopied', 'tangled', 'biodiverse', 'undergrowth', 'tropical', 'lush'],
            'Swamp': ['toxic', 'murky', 'fetid', 'poisonous', 'treacherous', 'miasmic', 'acidic', 'contaminated', 'bog-ridden', 'marsh-covered', 'putrid', 'hazardous'],
            'Volcanic': ['molten', 'burning', 'hellish', 'volcanic', 'sulfurous', 'infernal', 'magmatic', 'lava-swept', 'pyroclastic', 'seismic', 'unstable', 'superheated'],
            'Temperate': ['peaceful', 'habitable', 'serene', 'civilized', 'pastoral', 'idyllic', 'terraformed', 'colonized', 'developed', 'settled', 'democratic', 'liberated']
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
            'Terminids': ['Chitinous', 'Swarming', 'Hive', 'Bio-hazard', 'Nesting', 'Breeding', 'Acidic', 'Venomous', 'Organic', 'Infested', 'Spawning', 'Cellular', 'Biological', 'Parasitic'],
            'Automatons': ['Mechanical', 'Steel', 'Circuit', 'Binary', 'Fabricated', 'Synthetic', 'Cyber', 'Digital', 'Networked', 'Automated', 'Algorithmic', 'Calculated', 'Processed', 'Systematic'],
            'Illuminate': ['Psionic', 'Crystal', 'Energy', 'Ethereal', 'Mystic', 'Alien', 'Quantum', 'Void', 'Psychic', 'Neural', 'Mental', 'Cognitive', 'Telepathic', 'Dimensional']
        };

        // Additional narrative elements for more variety
        this.democraticPhrases = [
            'In the name of Managed Democracy',
            'For the glory of Super Earth',
            'By order of the Ministry of Truth',
            'Under the guidance of liberty',
            'Through the wisdom of democratic governance',
            'In service to galactic freedom',
            'By decree of the Ministry of Defense',
            'Under the auspices of constitutional order',
            'Through the authority of democratic will',
            'In pursuit of universal liberty',
            'By mandate of the people\'s democracy',
            'Under the banner of managed freedom',
            'Through the righteousness of Super Earth',
            'In defense of democratic principles',
            'By the grace of constitutional liberty',
            'Under the protection of democratic law',
            'Through the power of citizen solidarity',
            'In service of humanity\'s destiny',
            'By the will of democratic governance',
            'Under the sacred trust of freedom'
        ];

        this.missionIntensifiers = [
            'Critical', 'Urgent', 'High Priority', 'Immediate', 'Emergency', 'Decisive',
            'Strategic', 'Vital', 'Essential', 'Paramount', 'Crucial', 'Supreme',
            'Priority', 'Tactical', 'Operational', 'Advanced', 'Rapid', 'Special',
            'Elite', 'Primary', 'Secondary', 'Final', 'Ultimate', 'Maximum',
            'Sector-Wide', 'Containment', 'Quarantine', 'Frontier', 'Liberation', 'Democratic'
        ];

        // Strategic context descriptors
        this.strategicContexts = [
            'staging ground', 'containment zone', 'quarantine sector', 'liberation front',
            'democratic territory', 'frontier region', 'strategic sector', 'operational zone',
            'contested space', 'buffer zone', 'defensive line', 'forward position',
            'supply corridor', 'command sector', 'intelligence hub', 'tactical zone'
        ];
    }

    generateCampaignName(theme, dominantFaction, missionCount, missions, customName = null) {
        // If a custom name is provided, use it directly
        if (customName && customName.trim()) {
            return customName.trim();
        }

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
            'destroy': ['Destroy', 'Annihilate', 'Demolish', 'Obliterate', 'Crush', 'Eliminate', 'Dismantle', 'Expunge', 'Purge'],
            'elimination': ['Eliminate', 'Terminate', 'Purge', 'Cleanse', 'Eradicate', 'Exterminate', 'Neutralize', 'Expel', 'Remove'],
            'retrieval': ['Secure', 'Extract', 'Recover', 'Acquire', 'Claim', 'Salvage', 'Obtain', 'Capture', 'Retrieve'],
            'rescue': ['Rescue', 'Evacuate', 'Save', 'Liberate', 'Free', 'Deliver', 'Extract', 'Recover', 'Emancipate'],
            'sabotage': ['Sabotage', 'Disrupt', 'Infiltrate', 'Undermine', 'Compromise', 'Cripple', 'Interrupt', 'Impair', 'Disable'],
            'reconnaissance': ['Scout', 'Survey', 'Investigate', 'Explore', 'Assess', 'Analyze', 'Examine', 'Monitor', 'Observe']
        };
        
        for (const [key, words] of Object.entries(actionWords)) {
            if (objectiveType.includes(key)) {
                return words[Math.floor(Math.random() * words.length)];
            }
        }
        
        return 'Strike';
    }

    generateCodename(mission) {
        // Generate military-style codenames inspired by HELLDIVERS themes
        const adjectives = ['Iron', 'Steel', 'Thunder', 'Lightning', 'Storm', 'Fire', 'Ice', 'Shadow', 'Ghost', 'Crimson', 'Golden', 'Silver', 'Dark', 'Bright', 'Swift', 'Sharp', 'Valiant', 'Strategic', 'Tactical', 'Democratic', 'Liberty', 'Freedom'];
        const nouns = ['Hammer', 'Blade', 'Arrow', 'Shield', 'Spear', 'Fist', 'Eagle', 'Wolf', 'Dragon', 'Phoenix', 'Viper', 'Tiger', 'Bear', 'Lion', 'Falcon', 'Raven', 'Strike', 'Drive', 'Initiative', 'Campaign', 'Advance', 'Expansion'];
        
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

    getUniqueNameSuffix() {
        const suffixes = [
            'Alpha', 'Beta', 'Prime', 'Secondary', 'Extended', 'Revised', 
            'Phase II', 'Redux', 'Advanced', 'Continued', 'Final'
        ];
        return suffixes[Math.floor(Math.random() * suffixes.length)];
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

    generateFullCampaignNarrative(missions, customName = null) {
        const theme = this.determineCampaignTheme(missions);
        const dominantFaction = this.getDominantFaction(missions);
        
        const campaignName = this.generateCampaignName(theme, dominantFaction, missions.length, missions, customName);
        const mainGoal = this.generateCampaignGoal(theme, dominantFaction, missions);
        const backstory = this.generateCampaignBackstory(theme, dominantFaction, missions);
        
        // Generate mission names with uniqueness tracking
        const usedNames = new Set();
        const enhancedMissions = missions.map((mission, index) => {
            let generatedName = this.generateMissionName(mission, index, missions.length);
            let attempt = 0;
            
            // Ensure name is unique by adding suffixes if needed
            while (usedNames.has(generatedName) && attempt < 10) {
                attempt++;
                generatedName = this.generateMissionName(mission, index, missions.length) + ` ${this.getUniqueNameSuffix()}`;
            }
            
            usedNames.add(generatedName);
            
            return {
                ...mission,
                name: generatedName
            };
        });
        
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