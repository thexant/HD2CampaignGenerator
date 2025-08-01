const MISSION_TYPES = {
    PRIMARY_OBJECTIVES: [
		{
			id: "terminate_illegal_broadcast",
			name: "Terminate Illegal Broadcast",
			description: "Helldivers are authorized to Terminate Illegal Broadcast towers in their mission area. Traitorous humans have set up a Broadcast Station that actively spreads anti-democratic propaganda and is considered a high priority when spotted in the field.",
			faction: ["Automatons", "Terminids"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 1, maxDifficulty: 2 }
			},
			type: "primary"
		},
		{
			id: "activate_fuel_pumps",
			name: "Activate Fuel Pumps",
			description: "Helldivers must Activate Fuel Pumps in this region.",
			faction: ["Terminids"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 1, maxDifficulty: 2 }
			},
			type: "primary"
		},
		{
			id: "upload_escape_pod_data",
			name: "Upload Escape Pod Data",
			description: "A crashed escape pod in the region contains valuable data.",
			faction: ["Terminids", "Automatons"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 1, maxDifficulty: 2 }
			},
			type: "primary"
		},
		{
			id: "spread_democracy",
			name: "Spread Democracy",
			description: "We must show the galaxy that even in the face of oppression, Freedom remains defiant. Infiltrate behind enemy lines and raise our Flag as an unassailable beacon of Liberty.",
			faction: ["Terminids", "Automatons"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 1, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "conduct_geological_survey",
			name: "Conduct Geological Survey",
			description: "In this region, orbital bombardment has exposed seams of what appear to be rare and valuable mineral ores. We cannot let the enemy exploit them before the planet is liberated. Get down there and collect soil sample data, to confirm if the material is worth extracting.",
			minDifficulty: 3,
			maxDifficulty: 10,
			faction: ["Terminids", "Automatons"],
			environment: "planet",
			type: "primary"
		},
		{
			id: "launch_icbm",
			name: "Launch ICBM",
			description: "Enemy forces are amassing in this region. They must be destroyed. This dormant ICBM silo is beyond their range of detection; launch a devastating strike before they can mount a defense.",
			faction: ["Automatons", "Terminids"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 3, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "retrieve_valuable_data",
			name: "Retrieve Valuable Data",
			description: "An SEAF research station has been captured, and the brave scientific staff slaughtered. Get to the station, download the reseach database, and upload it to the Super Earth mainframe using the nearby Satellite Uplink Station.",
			minDifficulty: 2,
			maxDifficulty: 10,
			faction: ["Terminids", "Automatons"],
			environment: "planet",
			type: "primary"
		},
		{
			id: "search_and_destroy",
			name: "Search and Destroy",
			description: "The Automatons have gained ground in this region, constructing a vast network of Fabricators which allow them to replicate extremely rapidly. We have detected a narrow window of maintenance, giving us a chance to strike at their facilities. Destroy all that you can.",
			faction: "Automatons",
			environments: {
				planet: { minDifficulty: 3, maxDifficulty: 10 },
				city: { minDifficulty: 3, maxDifficulty: 10 }
			},
			type: "primary"
		},		
		{
			id: "destroy_bug_hives",
			name: "Destroy Bug Hives",
			description: "A vast network of underground hives has allowed the Terminids in this region to become entrenched, breeding and swelling in number. Fortunately, this hive has just gone into a brief hibernation. Infiltrate, and destroy all you can before the Terminids return to full strength.",
			faction: "Terminids",
			environments: {
				planet: { minDifficulty: 2, maxDifficulty: 10 },
				city: { minDifficulty: 3, maxDifficulty: 10 }
			},
			type: "primary"
		},
			
		{
			id: "eliminate_brood_commanders",
			name: "Eliminate Brood Commanders",
			description: "We have received reports from this region of Brood Commanders exhibiting dangerous new mutations. Find and eliminate them before they can breed.",
			minDifficulty: 1,
			maxDifficulty: 2,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},		
		{
			id: "eliminate_chargers",
			name: "Eliminate Chargers",
			description: "SEAF in this region have reported sightings of Chargers exhibiting dangerous new mutations. These specimen must be eliminated before their mutant strain spreads.",
			minDifficulty: 3,
			maxDifficulty: 3,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},		
		{
			id: "eliminate_impaler",
			name: "Eliminate Impaler",
			description: "Tectonic disturbances indicate the presence of an Impaler in this area.",
			minDifficulty: 5,
			maxDifficulty: 5,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},
		{
			id: "eliminate_bile_titans",
			name: "Eliminate Bile Titans",
			description: "We have received reports of the presence of Bile Titans in this region, posing a considerable threat to our operations. Any specimen encountered must be eliminated before it has a chance to breed.",
			minDifficulty: 4,
			maxDifficulty: 5,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},
		{
			id: "activate_e710_pumps",
			name: "Activate E-710 Pumps",
			description: "The extractors over this massive repository of E-710 have ceased functioning and must be re-activated.",
			minDifficulty: 2,
			maxDifficulty: 3,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},
		{
			id: "purge_hatcheries",
			name: "Purge Hatcheries",
			description: "To curb Terminid population growth, we must strike at their vile hatcheries. Find and destroy all Terminid eggs in the area before the enemy has a chance to react.",
			minDifficulty: 2,
			maxDifficulty: 10,
			faction: "Terminids",
			environments: {
				planet: { minDifficulty: 2, maxDifficulty: 10 },
				city: { minDifficulty: 2, maxDifficulty: 10 }
			},
			type: "primary"
		},	
		{
			id: "enable_e710_extraction",
			name: "Enable E-710 Extraction",
			description: "There are crucial E-710 reserves in this area needed to fuel our continued war effort. Navigate the Terminid swarm, reactivate the pumps, and transfer the fuel to the waiting transport shuttles.",
			minDifficulty: 4,
			maxDifficulty: 10,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},
		{
			id: "nuke_nursery",
			name: "Nuke Nursery",
			description: "A massive Terminid Nursery has been discovered here, crawling with millions of freshly-hatched larvae, mere weeks from ravenous adulthood. They must be wiped out, before they reach maturation and kill innocent human children. Terminid Nurseries consist of one or more Nursery Chambers. Use the Hive Breaker Drill to deliver a nuclear extermination device to each one.",
			minDifficulty: 4,
			maxDifficulty: 10,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},
		{
			id: "destroy_transmission_network",
			name: "Destroy Transmission Network",
			description: "The antenna responsible for the local Automaton Transmission Stream is thought to be located here.",
			minDifficulty: 2,
			maxDifficulty: 3,
			faction: "Automatons",
			environment: "planet",
			type: "primary"
		},
		{
			id: "eliminate_devastators",
			name: "Eliminate Devastators",
			description: "The Automaton Legion relies on its strict hierarchical structure; remove the leaders, and the ranks will fall easily. We believe there are Devastators present in the region. Find them, and destroy them.",
			minDifficulty: 1,
			maxDifficulty: 2,
			faction: "Automatons",
			environment: "planet",
			type: "primary"
		},
		{
			id: "eliminate_automaton_hulks",
			name: "Eliminate Automaton Hulks",
			description: "We have received credible reports of brutal Automaton Hulks in the region. Destroying them would weaken the Automaton command structure. Locate the Hulks, and eliminate them.",
			minDifficulty: 3,
			maxDifficulty: 3,
			faction: "Automatons",
			environment: "planet",
			type: "primary"
		},
		{
			id: "eliminate_automaton_factory_strider",
			name: "Eliminate Automaton Factory Strider",
			description: "Orbital infrared scans have detected the waste heat of an Automaton Factory Strider in this region. If it is allowed to persist, the planet will be overrun with mechanical monstrosities before long. End it.",
			minDifficulty: 4,
			maxDifficulty: 6,
			faction: "Automatons",
			environment: "planet",
			type: "primary"
		},
		{
			id: "sabotage_supply_bases",
			name: "Sabotage Supply Bases",
			description: "Planetary scanning has revealed a number of Automaton supply bases, hidden deep behind their defensive lines. Infiltrate quickly and destroy their stockpiles before they can mount a concerted defense.",
			minDifficulty: 4,
			maxDifficulty: 5,
			faction: "Automatons",
			environment: "planet",
			type: "primary"
		},
		{
			id: "sabotage_air_base",
			name: "Sabotage Air Base",
			description: "A large Automaton air base in this region is conducting frequent troop deployments by Dropship---a tactical advantage we cannot allow. Deploy behind enemy lines and destroy their Dropships and the air base's infrastructure.",
			faction: ["Automatons"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 3, maxDifficulty: 10 },
				city: { minDifficulty: 3, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "eradicate_automaton_forces",
			name: "Eradicate Automaton Forces",
			description: "Planetary scanning has identified a vast assemblage of Automaton troops in this region. This may be in preparation for an offensive on nearby Super Earth installation. You must reduce their numbers---kill as many bots as you can.",
			minDifficulty: 2,
			maxDifficulty: 10,
			faction: "Automatons",
			environment: "planet",
			type: "primary"
		},
		{
			id: "restore_air_quality",
			name: "Restore Air Quality",
			description: "Destroy Spore Spewers to allow our citizens to breathe freely.",
			minDifficulty: 1,
			maxDifficulty: 10,
			faction: "Terminids",
			environment: "city",
			type: "primary"
		},
		{
			id: "Cleanse Infested District",
			name: "Cleanse Infested District",
			description: "Destroy Shrieker infested towers to cleanse this area of would be parasites.",
			minDifficulty: 1,
			maxDifficulty: 10,
			faction: "Terminids",
			environment: "city",
			type: "primary"
		},
		{
			id: "eradicate_terminid_swarm",
			name: "Eradicate Terminid Swarm",
			description: "A massive Terminid swarm is gathering in this region. Left unchecked, it threatens to explode out of control. Kill as many Terminids as you can to thin their numbers.",
			minDifficulty: 2,
			maxDifficulty: 10,
			faction: "Terminids",
			environment: "planet",
			type: "primary"
		},
		{
			id: "destroy_command_bunkers",
			name: "Destroy Command Bunkers",
			description: "We have identified a number of heavily-guarded bunkers in this region. We suspect they contain Command Nodes central to linking in to the Automaton Transmission Stream. Destroy the bunkers, and cut the bots off from the flow of information.",
			faction: ["Automatons"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 5, maxDifficulty: 10 },
				city: { minDifficulty: 5, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "neutralize_orbital_defenses",
			name: "Neutralize Orbital Defenses",
			description: "The Automatons are using large Orbital Cannons in this area to bombard our Super Destroyers. We cannot allow our Aerospace superiority to be challenged. Deploy to the area and destroy any active Orbital Cannons.",
			minDifficulty: 4,
			maxDifficulty: 10,
			faction: "Automatons",
			environment: "planet",
			type: "primary"
		},
		{
			id: "evacuate_colonists",
			name: "Evacuate Colonists",
			description: "Colonists who escaped Illuminate abduction and mind control—likely the most patriotic and steadfast of their demographic—are trapped in emergency shelters. The enemy is closing in; without rescue, they are doomed. Transport ships are inbound, but the evacuation zone is under enemy control. The Helldivers are the colonists' only hope.",
			faction: ["Illuminate"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 1, maxDifficulty: 10 },
				city: { minDifficulty: 1, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "emergency_evacuation",
			name: "Emergency Evacuation",
			description: "Evacuate civillians trapped deep within the Terminid Horde.",
			minDifficulty: 3,
			maxDifficulty: 10,
			faction: "Terminids",
			environment: "city",
			type: "primary"
		},
		{
			id: "retrieve_recon_craft_intel",
			name: "Retrieve Recon Craft Intel",
			description: "An SEAF reconnaissance plane was shot down over this occupied colony. Its top-secret intel must be recovered immediately, before it can be destroyed by the enemy.",
			faction: ["Illuminate"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 1, maxDifficulty: 10 },
				city: { minDifficulty: 1, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "free_colony",
			name: "Free Colony",
			description: "The Illuminate have invaded this colony, turning its citizens into Voteless hordes. They have raised uncanny, malevolent monoliths that generate some kind of exotic energy fields. We know neither their function nor their true nature—that is why we must destroy them. We must cast off their occupation. Deploy to the colony, tear down the invaders' structures, and raise the flag of Super Earth once more.",
			minDifficulty: 1,
			maxDifficulty: 10,
			faction: "Illuminate",
			environment: "planet",
			type: "primary"
		},
		{
			id: "blitz_destroy_illuminate_warp_ships",
			name: "Blitz: Destroy Illuminate Warp Ships",
			description: "Illuminate Warp ships are docked in this area. These ships are critical to the Illuminate invasion, used for all terrestrial military functions including personnel abduction and combatant deployment. While the ships are grounded, they are vulnerable. Find them and destroy them.",
			minDifficulty: 3,
			maxDifficulty: 10,
			faction: "Illuminate",
			environment: ["planet", "city"],
			type: "primary"
		},
		{
			id: "destroy_harvesters",
			name: "Destroy Harvesters",
			description: "Illuminate Harvesters patrol this colony, enforcing the zealous rule of their masters. The unnatural, spindly constructs must be destroyed, so that Freedom can return.",
			faction: ["Illuminate"],
			operationType: ["liberation", "defense"],
			environments: {
				planet: { minDifficulty: 3, maxDifficulty: 3 },
				city: { minDifficulty: 3, maxDifficulty: 3 }
			},
			type: "primary"
		},
		// City-specific missions (moved from CITY_PRIMARY_OBJECTIVES)
		{
			id: "sabotage_supply_bases_city",
			name: "Sabotage Supply Bases",
			description: "Planetary scanning has revealed a number of Automaton supply bases, hidden deep behind their defensive lines. Infiltrate quickly and destroy their stockpiles before they can mount a concerted defense.",
			faction: ["Automatons"],
			operationType: ["liberation"],
			environments: {
				planet: { minDifficulty: 4, maxDifficulty: 5 },
				city: { minDifficulty: 1, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "free_the_city",
			name: "Free The City",
			description: "This Sector is Occupied by Illuminate Invaders. It must be freed.",
			faction: ["Illuminate"],
			operationType: ["liberation", "defense"],
			environments: {
				city: { minDifficulty: 1, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "repel_invasion_fleet",
			name: "Repel Invasion Fleet",
			description: "Radar has identified a fleet of Illuminate invasion ships descending upon this sector from close orbit. They intend to seize control of the area in an aerial blitz. You are the last line of defence. Destroy all enemy ships as quickly as possible.",
			faction: ["Illuminate"],
			operationType: ["liberation", "defense"],
			environments: {
				city: { minDifficulty: 3, maxDifficulty: 10 }
			},
			type: "primary"
		},
		{
			id: "take_down_overship",
			name: "Take Down Overship",
			description: "The Overship is the command-and-control nexus of Illuminate forces in this sector. Its oppressive presence must be destroyed. A Planetary Defense Cannon in this area can penetrate its shields. Activate the Cannon and use it to bring down the Overship.",
			faction: ["Illuminate"],
			operationType: ["liberation", "defense"],
			environments: {
				city: { minDifficulty: 1, maxDifficulty: 10 }
			},
			type: "primary"
		},
		// Defense-specific missions (moved from DEFENSE_PRIMARY_OBJECTIVES)
		{
			id: "evacuate_high_value_assets",
			name: "Evacuate High Value Assets",
			description: "The enemy is closing in on a cache of high-value assets that have been sequestered since the first Galactic War. We cannot allow them to be captured. The enemy will be alerted to your position as soon as the evacuation process is initiated. Defend the site until all assets have been safely transported off-planet.",
			faction: ["Terminids", "Automatons", "Illuminate"],
			operationType: ["defense"],
			environments: {
				planet: { minDifficulty: 5, maxDifficulty: 10 },
				city: { minDifficulty: 5, maxDifficulty: 10 }
			},
			type: "primary"
		}
    ],


    SECONDARY_OBJECTIVES: [
        {
            id: "collect_common_samples",
            name: "Collect Common Samples",
            description: "Collect at least {10-20} Common Samples",
            getDescription: (difficulty = 1) => {
                const baseAmount = Math.min(8 + difficulty * 2, 20);
                const variation = Math.floor(Math.random() * 5);
                return `Collect at least ${baseAmount + variation} Common Samples`;
            }
        },
        {
            id: "collect_rare_samples", 
            name: "Collect Rare Samples",
            description: "Collect at least {4-12} Rare Samples",
            getDescription: (difficulty = 4) => {
                const baseAmount = Math.min(2 + (difficulty - 3) * 2, 12);
                const variation = Math.floor(Math.random() * 3);
                return `Collect at least ${baseAmount + variation} Rare Samples`;
            }
        },
        {
            id: "collect_super_samples",
            name: "Collect Super Samples", 
            description: "Collect at least {2-6} Super Samples",
            getDescription: (difficulty = 6) => {
                const baseAmount = Math.min(1 + (difficulty - 5), 6);
                const variation = Math.floor(Math.random() * 2);
                return `Collect at least ${baseAmount + variation} Super Samples`;
            }
        },
        {
            id: "complete_side_objectives",
            name: "Complete Side Objectives",
            description: "Complete all optional objectives encountered during the mission"
        },
        {
            id: "extract_all_helldivers",
            name: "Extract All Helldivers",
            description: "All Helldivers must extract"
        },
        {
            id: "low_casualty_mission",
            name: "Low Casualty Mission",
            description: "Complete mission with fewer than {2-4} deaths per Helldiver",
            getDescription: () => `Complete mission with fewer than ${2 + Math.floor(Math.random() * 3)} deaths per Helldiver`
        },
        {
            id: "time_limit_completion",
            name: "Time Limit Completion", 
            description: "Complete the mission with {12-20} or more minutes remaining",
            getDescription: () => `Complete the mission with ${12 + Math.floor(Math.random() * 9)} or more minutes remaining`
        },
        {
            id: "fast_extraction",
            name: "Fast Extraction",
            description: "Reach extraction zone within {3-7} minutes of completing final objective",
            getDescription: () => `Reach extraction zone within ${3 + Math.floor(Math.random() * 5)} minutes of completing final objective`
        },
        {
            id: "stratagem_conservation",
            name: "Stratagem Conservation",
            description: "Call in fewer than {15-25} stratagems total per Helldiver",
            getDescription: () => `Use fewer than ${15 + Math.floor(Math.random() * 11)} stratagem call-ins total per Helldiver`
        },
        {
            id: "stealth_approach",
            name: "Stealth Approach", 
            description: "Complete first objective without triggering enemy patrols"
        },
        {
            id: "perfect_accuracy",
            name: "Perfect Accuracy",
            description: "Complete mission with {75-85}% or higher accuracy rating",
            getDescription: () => `Complete mission with ${75 + Math.floor(Math.random() * 11)}% or higher accuracy rating`
        },
        {
            id: "team_coordination", 
            name: "Team Coordination",
            description: "No friendly fire incidents throughout the mission"
        }
    ],

    DEFENSE_SECONDARY_OBJECTIVES: [
        {
            id: "zero_asset_damage",
            name: "Zero Asset Damage",
            description: "Prevent all critical assets from taking any damage",
            environment: ["planet", "city"]
        },
        {
            id: "eliminate_wave_commanders",
            name: "Eliminate Wave Commanders",
            description: "Kill at least {4-8} enemy commanders during the defense",
            getDescription: () => `Kill at least ${4 + Math.floor(Math.random() * 5)} enemy commanders during the defense`,
            environment: ["planet", "city"]
        },
        {
            id: "minimal_defense_casualties",
            name: "Minimal Defense Casualties",
            description: "Complete defense with fewer than {1-3} deaths per Helldiver",
            getDescription: () => `Complete defense with fewer than ${1 + Math.floor(Math.random() * 3)} deaths per Helldiver`,
            environment: ["planet", "city"]
        },
        {
            id: "maintain_perimeter_integrity",
            name: "Maintain Perimeter Integrity",
            description: "No enemies breach the inner defensive perimeter",
            environment: ["planet", "city"]
        },
        {
            id: "efficient_stratagem_defense",
            name: "Efficient Stratagem Defense",
            description: "Use fewer than {12-20} offensive stratagems during entire defense",
            getDescription: () => `Use fewer than ${12 + Math.floor(Math.random() * 9)} offensive stratagems during entire defense`,
            environment: ["planet", "city"]
        },
        {
            id: "rapid_threat_elimination",
            name: "Rapid Threat Elimination",
            description: "Eliminate all heavy units within {20-40} seconds of detection",
            getDescription: () => `Eliminate all heavy units within ${20 + Math.floor(Math.random() * 21)} seconds of detection`,
            environment: ["planet", "city"]
        },
        {
            id: "defensive_coordination",
            name: "Defensive Coordination", 
            description: "All Helldivers stay within {40-60}m of defensive objective at all times",
            getDescription: () => `All Helldivers stay within ${40 + Math.floor(Math.random() * 21)}m of defensive objective at all times`,
            environment: ["planet", "city"]
        },
        {
            id: "ammunition_conservation",
            name: "Ammunition Conservation",
            description: "Complete defense using only primary weapons (no support weapons)",
            environment: ["planet", "city"]
        },
        {
            id: "early_warning_system",
            name: "Early Warning System",
            description: "Spot and call out all incoming enemy waves {8-15}+ seconds before contact",
            getDescription: () => `Spot and call out all incoming enemy waves ${8 + Math.floor(Math.random() * 8)}+ seconds before contact`,
            environment: ["planet", "city"]
        }
    ],

    MODIFIERS: [
        {
            name: "Utilize EXOSUIT Mechs",
            description: "Helldivers should prioritize using Exo-45 Patriot or Exo-49 Emancipator mechs during this operation"
        },
        {
            name: "Use FRV for Transport",
            description: "Helldivers should utilize Fast Reconnaissance Vehicles for movement and tactical positioning"
        },
        {
            name: "Fire-Based Loadouts",
            description: "Equip incendiary weapons and stratagems - embrace the cleansing flame of democracy"
        },
        {
            name: "Laser-Based Loadouts",
            description: "Utilize energy weapons and laser-based equipment for precision strikes"
        },
        {
            name: "Arc-Based Loadouts",
            description: "Deploy electrical weapons and arc technology to chain through enemy ranks"
        },
        {
            name: "Gas-Based Loadouts",
            description: "Employ chemical weapons and toxic stratagems to deny enemy positions"
        },
        {
            name: "Plasma-Based Loadouts",
            description: "Harness plasma technology for devastating area-of-effect capabilities"
        },
        {
            name: "Explosive Ordnance Focus",
            description: "Maximize use of grenades, mines, and explosive stratagems"
        },
        {
            name: "Stealth Infiltration",
            description: "Minimize enemy detection through careful movement and strategic positioning"
        },
        {
            name: "Orbital Support Priority",
            description: "Rely heavily on orbital stratagems"
        },
		{
            name: "Eagle Close Air Support",
            description: "Rely heavily on Eagle-1 stratagems"
        },
        {
            name: "Long Range Engagement",
            description: "Maintain distance and utilize sniper rifles and long-range support weapons"
        },
        {
            name: "Close Quarters Combat",
            description: "Engage enemies at close range with shotguns, SMGs, and other short-range weapons."
        },
        {
            name: "Ceremonial Armor",
            description: "Equip ceremonial armor - this mission will be recorded and propagandized for Super Earth"
        },
        {
            name: "Standard Issue Only",
            description: "Use only basic, standard-issue equipment to demonstrate Helldiver resilience"
        },
        {
            name: "Heavy Weapons Focus",
            description: "Prioritize support weapons and anti-tank equipment over lighter armaments"
        },
        {
            name: "Rapid Deployment",
            description: "Complete objectives with maximum speed and efficiency"
        },
        {
            name: "Defensive Positioning",
            description: "Utilize defense stratagems such as emplacements, mines and turrets throughout the mission"
        },
        {
            name: "Minimum Stratagems",
            description: "Complete the mission using as few stratagem deployments as possible"
        },
		{
            name: "Melee Combat",
            description: "Kill as many enemies as possible using melee combat"
        },
        {
            name: "Liberation Documentation",
            description: "Document enemy positions and tactics for future liberation efforts"
        }
    ]
};

/**
 * Helper function to add a mission with all variants
 * @param {Object} missionData - Base mission data
 * @param {Object} variants - Environment and operation type variants
 * 
 * Example usage:
 * addMissionVariant({
 *     id: "example_mission",
 *     name: "Example Mission",
 *     description: "An example mission",
 *     faction: ["Automatons", "Terminids"]
 * }, {
 *     liberation: {
 *         planet: { minDifficulty: 1, maxDifficulty: 5 },
 *         city: { minDifficulty: 2, maxDifficulty: 6 }
 *     },
 *     defense: {
 *         planet: { minDifficulty: 3, maxDifficulty: 8 },
 *         city: { minDifficulty: 4, maxDifficulty: 9 }
 *     }
 * })
 */
function addMissionVariant(missionData, variants) {
    const operationTypes = Object.keys(variants);
    const environments = {};
    
    // Collect all environments from all operation types
    operationTypes.forEach(opType => {
        Object.keys(variants[opType]).forEach(env => {
            if (!environments[env]) {
                environments[env] = variants[opType][env];
            }
        });
    });
    
    const mission = {
        ...missionData,
        operationType: operationTypes,
        environments: environments,
        type: "primary"
    };
    
    MISSION_TYPES.PRIMARY_OBJECTIVES.push(mission);
    return mission;
}

/**
 * Helper function to add a simple mission that works in both liberation and defense
 * @param {Object} missionData - Mission data including faction, name, description
 * @param {Object} difficulties - Difficulty ranges by environment
 * 
 * Example:
 * addSimpleMission({
 *     id: "simple_mission",
 *     name: "Simple Mission", 
 *     description: "A simple mission",
 *     faction: ["Terminids"]
 * }, {
 *     planet: { minDifficulty: 1, maxDifficulty: 9 },
 *     city: { minDifficulty: 2, maxDifficulty: 8 }
 * })
 */
function addSimpleMission(missionData, difficulties) {
    return addMissionVariant(missionData, {
        liberation: difficulties,
        defense: difficulties
    });
}

/**
 * Helper function to add a mission that only works on planets (not cities)
 */
function addPlanetOnlyMission(missionData, minDifficulty = 1, maxDifficulty = 10) {
    return addMissionVariant(missionData, {
        liberation: {
            planet: { minDifficulty, maxDifficulty }
        },
        defense: {
            planet: { minDifficulty, maxDifficulty }
        }
    });
}

/**
 * Helper function to add a mission that only works in cities
 */
function addCityOnlyMission(missionData, minDifficulty = 1, maxDifficulty = 10) {
    return addMissionVariant(missionData, {
        liberation: {
            city: { minDifficulty, maxDifficulty }
        },
        defense: {
            city: { minDifficulty, maxDifficulty }
        }
    });
}

/**
 * Helper function to add a defense-only mission
 */
function addDefenseOnlyMission(missionData, difficulties) {
    return addMissionVariant(missionData, {
        defense: difficulties
    });
}

/**
 * Validation functions for mission data
 */
const MissionValidator = {
    /**
     * Validate a mission object has correct structure
     */
    validateMission(mission) {
        const errors = [];
        
        if (!mission.id) errors.push("Mission missing required field: id");
        if (!mission.name) errors.push("Mission missing required field: name");
        if (!mission.description) errors.push("Mission missing required field: description");
        if (!mission.faction || !Array.isArray(mission.faction)) {
            errors.push("Mission missing or invalid faction array");
        }
        if (!mission.operationType || !Array.isArray(mission.operationType)) {
            errors.push("Mission missing or invalid operationType array");
        }
        if (!mission.environments || typeof mission.environments !== 'object') {
            errors.push("Mission missing or invalid environments object");
        }
        
        // Validate environments
        if (mission.environments) {
            Object.entries(mission.environments).forEach(([env, config]) => {
                if (!config.minDifficulty || !config.maxDifficulty) {
                    errors.push(`Environment ${env} missing difficulty range`);
                }
                if (config.minDifficulty > config.maxDifficulty) {
                    errors.push(`Environment ${env} has invalid difficulty range`);
                }
                if (config.minDifficulty < 1 || config.maxDifficulty > 10) {
                    errors.push(`Environment ${env} has difficulty outside valid range (1-10)`);
                }
            });
        }
        
        return errors;
    },
    
    /**
     * Check if missions are available for given constraints
     */
    checkAvailability(faction, environment, difficulty, operationType) {
        const available = MISSION_TYPES.PRIMARY_OBJECTIVES.filter(mission => {
            if (mission.faction && !mission.faction.includes(faction)) return false;
            if (mission.operationType && !mission.operationType.includes(operationType)) return false;
            if (mission.environments && !mission.environments[environment]) return false;
            if (mission.environments && mission.environments[environment]) {
                const envConfig = mission.environments[environment];
                if (difficulty < envConfig.minDifficulty || difficulty > envConfig.maxDifficulty) return false;
            }
            return true;
        });
        
        return {
            available: available.length > 0,
            count: available.length,
            missions: available
        };
    },
    
    /**
     * Get gaps in mission coverage
     */
    findGaps() {
        const factions = ["Terminids", "Automatons", "Illuminate"];
        const environments = ["planet", "city"];
        const operationTypes = ["liberation", "defense"];
        const gaps = [];
        
        factions.forEach(faction => {
            environments.forEach(environment => {
                operationTypes.forEach(operationType => {
                    for (let difficulty = 1; difficulty <= 10; difficulty++) {
                        const result = this.checkAvailability(faction, environment, difficulty, operationType);
                        if (!result.available) {
                            gaps.push({
                                faction,
                                environment,
                                difficulty,
                                operationType
                            });
                        }
                    }
                });
            });
        });
        
        return gaps;
    },
    
    /**
     * Validate all missions in the system
     */
    validateAllMissions() {
        const results = {
            valid: [],
            invalid: [],
            totalErrors: 0
        };
        
        MISSION_TYPES.PRIMARY_OBJECTIVES.forEach(mission => {
            const errors = this.validateMission(mission);
            if (errors.length > 0) {
                results.invalid.push({ mission: mission.id, errors });
                results.totalErrors += errors.length;
            } else {
                results.valid.push(mission.id);
            }
        });
        
        return results;
    }
};

// Examples of using helper functions with real mission data:

/* Example usage patterns:

// Convert a planet-only mission from your original data:
addPlanetOnlyMission({
    id: "destroy_bug_hives",
    name: "Destroy Bug Hives", 
    description: "A vast network of underground hives has allowed the Terminids in this region to become entrenched, breeding and swelling in number.",
    faction: ["Terminids"]
}, 2, 10); // Your original minDifficulty: 2, maxDifficulty: 10

// Convert a mission that works on both planet and city:
addSimpleMission({
    id: "sabotage_air_base",
    name: "Sabotage Air Base",
    description: "A large Automaton air base in this region is conducting frequent troop deployments by Dropship.",
    faction: ["Automatons"]
}, {
    planet: { minDifficulty: 3, maxDifficulty: 10 },
    city: { minDifficulty: 3, maxDifficulty: 10 }
}); // Your original: both environments, 3-10 difficulty

// Convert a city-only mission:
addCityOnlyMission({
    id: "free_the_city", 
    name: "Free The City",
    description: "This Sector is Occupied by Illuminate Invaders. It must be freed.",
    faction: ["Illuminate"]
}, 1, 10); // Your original city mission: 1-10 difficulty

*/

const DIFFICULTY_LEVELS = [
    { level: 1, name: "Trivial", description: "Light resistance, minimal threats" },
    { level: 2, name: "Easy", description: "Basic enemy presence" },
    { level: 3, name: "Medium", description: "Moderate opposition expected" },
    { level: 4, name: "Challenging", description: "Significant enemy activity" },
    { level: 5, name: "Hard", description: "Heavy resistance anticipated" },
    { level: 6, name: "Extreme", description: "Extreme danger, elite enemies" },
    { level: 7, name: "Suicide Mission", description: "Overwhelming enemy forces" },
    { level: 8, name: "Impossible", description: "Near-certain casualty rates" },
    { level: 9, name: "Helldive", description: "Maximum threat level, heroes only" },
    { level: 10, name: "Super Helldive", description: "Ultimate test of democracy, only the most elite helldivers survive" }
];

const FACTION_INFO = {
    "Terminids": {
        name: "Terminids",
        description: "Bio-engineered insectoid species",
        threat: "Swarm tactics, biological warfare",
        primaryColor: "#8B4513",
        secondaryColor: "#DAA520"
    },
    "Automatons": {
        name: "Automatons", 
        description: "Advanced robotic forces",
        threat: "Heavy armor, coordinated attacks",
        primaryColor: "#FF4500",
        secondaryColor: "#DC143C"
    },
    "Illuminate": {
        name: "Illuminate",
        description: "Mysterious energy-wielding entities",
        threat: "Psychic abilities, energy weapons",
        primaryColor: "#4169E1",
        secondaryColor: "#00CED1"
    }
};

const PLANET_HAZARDS = {
    "Extreme Cold": {
        name: "Extreme Cold",
        description: "Sub-zero temperatures, reduced visibility",
        biome: "Ice World",
        effect: "Slower movement, ice-based obstacles"
    },
    "Extreme Heat": {
        name: "Extreme Heat", 
        description: "Scorching temperatures, heat damage",
        biome: "Desert World",
        effect: "Heat damage over time, reduced stamina"
    },
    "Acid Rain": {
        name: "Acid Rain",
        description: "Corrosive precipitation",
        biome: "Swamp World", 
        effect: "Periodic acid damage to equipment"
    },
    "Ion Storms": {
        name: "Ion Storms",
        description: "Electromagnetic interference",
        biome: "Volcanic World",
        effect: "Stratagem interference, electrical hazards"
    },
    "Meteor Showers": {
        name: "Meteor Showers",
        description: "Incoming space debris",
        biome: "Barren World",
        effect: "Random explosive impacts"
    },
    "Sandstorms": {
        name: "Sandstorms",
        description: "Reduced visibility, equipment fouling",
        biome: "Desert World",
        effect: "Limited radar, slower movement"
    },
    "None": {
        name: "None",
        description: "Standard atmospheric conditions",
        biome: "Temperate World",
        effect: "No additional hazards"
    }
};
