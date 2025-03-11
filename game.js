// Game state
const gameState = {
    player: {
        name: "",
        destination: "",
        startingPoint: ""
    },
    crew: [
        { name: "You", status: "active" },
        { name: "Moonbeam", status: "active" },
        { name: "Chakra", status: "active" },
        { name: "Starlight", status: "active" }
    ],
    resources: {
        gas: 100,
        cash: 500,
        snacks: 50
    },
    progress: {
        day: 1,
        distanceTraveled: 0,
        totalDistance: 0
    },
    gameOver: false,
    specialEvents: {
        mississippiCrossing: false
    },
    // Track recent decisions for contextual game over messages
    recentDecisions: [],
    // Flag to track when transitioning to Snack Dash
    transitioningToSnackDash: false
};

// Constants
const TRAVEL_GAS_CONSUMPTION = 10;
const TRAVEL_SNACK_CONSUMPTION = 3;
const TRAVEL_DISTANCE_PER_DAY = 100;
const REST_SNACK_CONSUMPTION = 2;
const REST_CASH_COST = 20;
const MISSISSIPPI_MILESTONE = 2000; // Mississippi River at 2000 miles

// Distance between locations (miles)
const DISTANCES = {
    "portland-new-york": 2900,
    "portland-chicago": 2100,
    "san-francisco-new-york": 2900,
    "san-francisco-chicago": 2200,
    "los-angeles-new-york": 2800,
    "los-angeles-chicago": 2000
};

// Random game over explanations
const RANDOM_GAME_OVERS = [
    "Game over! A rogue moose toppled your van. Better luck next time.",
    "Game over! Your VW bus was abducted by aliens conducting research on 'hipster migration patterns.'",
    "Game over! The ghost of Jack Kerouac possessed your GPS and led you straight into a ravine.",
    "Game over! Your crew started a kombucha brewery in the back of the van, and the fermentation explosion was catastrophic.",
    "Game over! You stopped at a roadside psychic who cursed your journey after you refused to buy healing crystals."
];

// Decision-related game over explanations
const DECISION_GAME_OVERS = {
    "rest": [
        "Game over! You rested too long and your van was overrun by a swarm of murder hornets.",
        "Game over! While resting, your crew accidentally joined a cult that worships vintage vehicles."
    ],
    "travel": [
        "Game over! Your GPS rerouted you through an abandoned movie set where a horror film was still being filmed.",
        "Game over! You drove straight into a time vortex and ended up in the 1970s with no way back."
    ],
    "shop": [
        "Game over! The gas station attendant turned out to be a serial killer who targets people who buy beef jerky.",
        "Game over! The 'discount snacks' you purchased were actually experimental military rations that cause hallucinations."
    ],
    "check_crew": [
        "Game over! Your crew mutinied after you checked on them one too many times.",
        "Game over! While checking on your crew, you discovered they had all been replaced by pod people."
    ]
};

// Random events
const RANDOM_EVENTS = [
    {
        title: "Flat Tire!",
        description: "Your VW bus got a flat tire. What do you want to do?",
        choices: [
            {
                text: "Fix it yourself (Save cash, lose time)",
                effect: () => {
                    gameState.progress.day += 1;
                    updateGameDisplay();
                    return "You fixed the tire yourself. It took a full day, but at least you didn't spend any money.";
                }
            },
            {
                text: "Pay for roadside assistance ($50)",
                effect: () => {
                    if (gameState.resources.cash >= 50) {
                        gameState.resources.cash -= 50;
                        updateGameDisplay();
                        return "The mechanic fixed your tire quickly. You lost $50 but saved time.";
                    } else {
                        gameState.progress.day += 1;
                        updateGameDisplay();
                        return "You don't have enough cash! You had to fix it yourself anyway, losing a day.";
                    }
                }
            }
        ]
    },
    {
        title: "Tesla Pileup Roadblock!",
        description: "Highway closed for a Tesla pileup. All those self-driving cars somehow crashed into each other.",
        choices: [
            {
                text: "Wait it out (3 days)",
                effect: () => {
                    gameState.progress.day += 3;
                    gameState.resources.snacks -= 6;
                    if (gameState.resources.snacks < 0) gameState.resources.snacks = 0;
                    updateGameDisplay();
                    return "You waited for three days while they cleared the road. At least you got to see some spectacular EV fires.";
                }
            },
            {
                text: "Detour through a MAGA rally",
                effect: () => {
                    if (Math.random() > 0.5) {
                        gameState.progress.day += 1;
                        gameState.resources.gas -= 15;
                        if (gameState.resources.gas < 0) gameState.resources.gas = 0;
                        updateGameDisplay();
                        return "You navigated through a sea of red hats. Your VW bus with its 'Coexist' bumper sticker got some interesting looks.";
                    } else {
                        gameState.progress.day += 1;
                        gameState.resources.cash -= 40;
                        if (gameState.resources.cash < 0) gameState.resources.cash = 0;
                        updateGameDisplay();
                        return "Someone keyed your VW bus. It cost $40 to fix the 'Eat the Rich' sticker they damaged.";
                    }
                }
            }
        ]
    },
    {
        title: "Hipster Food Truck!",
        description: "You found an artisanal food truck in the middle of nowhere. The prices are ridiculous, but the food smells amazing.",
        choices: [
            {
                text: "Splurge on avocado toast and kombucha ($30)",
                effect: () => {
                    if (gameState.resources.cash >= 30) {
                        gameState.resources.cash -= 30;
                        gameState.resources.snacks += 15;
                        updateGameDisplay();
                        return "Overpriced? Yes. Delicious? Also yes. Your crew's morale improves!";
                    } else {
                        return "You can't afford it. Your crew gives you judgmental looks as you drive away.";
                    }
                }
            },
            {
                text: "Keep driving (save money)",
                effect: () => {
                    return "You resist temptation and keep driving. Your stomach growls in protest.";
                }
            }
        ]
    },
    {
        title: "Climate Change Flash Flood!",
        description: "A sudden flash flood from climate change hits the road. Your bus is leaking and water is getting in!",
        choices: [
            {
                text: "Try to drive through it",
                effect: () => {
                    if (Math.random() > 0.7) {
                        gameState.resources.snacks -= 10;
                        if (gameState.resources.snacks < 0) gameState.resources.snacks = 0;
                        updateGameDisplay();
                        return "You made it through, but lost a snack box to mold. At least you didn't have to hear another crew member say 'This never happened when I was a kid.'";
                    } else {
                        gameState.progress.day += 2;
                        gameState.resources.cash -= 60;
                        if (gameState.resources.cash < 0) gameState.resources.cash = 0;
                        updateGameDisplay();
                        return "Your bus got stuck! It took two days and $60 to get towed out. Your crew spent the whole time debating carbon taxes.";
                    }
                }
            },
            {
                text: "Find higher ground and wait it out",
                effect: () => {
                    gameState.progress.day += 1;
                    updateGameDisplay();
                    return "You parked on a hill and waited out the flood. One of your crew members used the opportunity to record a climate change TikTok that got zero views.";
                }
            }
        ]
    },
    {
        title: "Viral TikTok Opportunity!",
        description: "One of your crew members spots the perfect backdrop for a TikTok dance.",
        choices: [
            {
                text: "Stop and film (lose time, potential cash)",
                effect: () => {
                    const randomCash = Math.floor(Math.random() * 100);
                    const goesViral = Math.random() > 0.7;
                    
                    if (goesViral) {
                        gameState.resources.cash += randomCash;
                        updateGameDisplay();
                        return `The TikTok went viral! You earned $${randomCash} from the brand deal that followed.`;
                    } else {
                        gameState.progress.day += 1;
                        updateGameDisplay();
                        return "The TikTok flopped. You wasted a day for nothing.";
                    }
                }
            },
            {
                text: "Keep driving (save time)",
                effect: () => {
                    const randomCrewIndex = Math.floor(Math.random() * gameState.crew.length);
                    const crewMember = gameState.crew[randomCrewIndex];
                    
                    if (Math.random() > 0.8) {
                        gameState.crew[randomCrewIndex] = {
                            name: crewMember.name,
                            status: "Upset (missed TikTok opportunity)"
                        };
                        updateCrewList();
                        return `${crewMember.name} is upset about missing their chance at TikTok fame.`;
                    } else {
                        return "You keep driving. Social media fame is temporary, but reaching your destination is forever.";
                    }
                }
            }
        ]
    },
    {
        title: "Shady Mechanic Encounter",
        description: "A shady-looking mechanic offers to tune up your VW bus. He wants $50 or your last box of kale chips.",
        choices: [
            {
                text: "Pay $50 for the tune-up",
                effect: () => {
                    if (gameState.resources.cash >= 50) {
                        gameState.resources.cash -= 50;
                        
                        if (Math.random() > 0.4) {
                            gameState.resources.gas += 20;
                            if (gameState.resources.gas > 100) gameState.resources.gas = 100;
                            updateGameDisplay();
                            return "Surprisingly, he did a great job! Your bus is running more efficiently now.";
                        } else {
                            gameState.progress.day += 2;
                            updateGameDisplay();
                            return "He broke something! It took two days to fix what he messed up. Never trust a mechanic who says 'I know a shortcut.'";
                        }
                    } else {
                        return "You don't have enough cash, and he refuses to take your credit card. 'Cash only, city slicker!'";
                    }
                }
            },
            {
                text: "Give him your kale chips",
                effect: () => {
                    gameState.resources.snacks -= 5;
                    if (gameState.resources.snacks < 0) gameState.resources.snacks = 0;
                    
                    if (Math.random() > 0.6) {
                        gameState.resources.gas += 30;
                        if (gameState.resources.gas > 100) gameState.resources.gas = 100;
                        updateGameDisplay();
                        return "He loved the kale chips! Said they reminded him of his days as a Silicon Valley engineer before he 'got out of the rat race.' Your bus is running better now.";
                    } else {
                        updateGameDisplay();
                        return "He took your kale chips, ate one, made a disgusted face, and walked away without touching your bus. What a waste.";
                    }
                }
            },
            {
                text: "Decline and drive away",
                effect: () => {
                    return "You politely decline and drive away. The mechanic shouts something about 'coastal elites' as you leave.";
                }
            }
        ]
    },
    {
        title: "Wi-Fi Oasis!",
        description: "You found a cafe with actual high-speed internet! First time in weeks!",
        choices: [
            {
                text: "Stop and catch up on Netflix (lose time, improve morale)",
                effect: () => {
                    gameState.progress.day += 1;
                    
                    // Improve crew morale
                    gameState.crew.forEach((member, index) => {
                        if (member.status && member.status.includes("Upset")) {
                            gameState.crew[index] = {
                                name: member.name,
                                status: "Happy"
                            };
                        }
                    });
                    
                    updateGameDisplay();
                    updateCrewList();
                    return "Everyone binged their favorite shows and caught up on social media. Morale improved!";
                }
            },
            {
                text: "Just check emails quickly and leave (save time)",
                effect: () => {
                    return "You check your emails quickly and get back on the road. Efficiency over entertainment.";
                }
            }
        ]
    },
    {
        title: "No Signal in Idaho",
        description: "You've hit a complete dead zone. No cell service, no Wi-Fi, nothing. One of your crew members is having withdrawal symptoms.",
        choices: [
            {
                text: "Let them livestream anyway (waste battery)",
                effect: () => {
                    const randomCrewIndex = Math.floor(Math.random() * gameState.crew.length);
                    const crewMember = gameState.crew[randomCrewIndex];
                    
                    gameState.resources.gas -= 20; // Using gas as a proxy for battery
                    if (gameState.resources.gas < 0) gameState.resources.gas = 0;
                    updateGameDisplay();
                    
                    return `${crewMember.name} livestreamed to absolutely no one for hours. Your bus battery dropped 20%, and they still think they're going to be an influencer.`;
                }
            },
            {
                text: "Enforce a digital detox",
                effect: () => {
                    const randomCrewIndex = Math.floor(Math.random() * gameState.crew.length);
                    const crewMember = gameState.crew[randomCrewIndex];
                    
                    if (Math.random() > 0.5) {
                        gameState.crew[randomCrewIndex] = {
                            name: crewMember.name,
                            status: "Upset (digital withdrawal)"
                        };
                        updateCrewList();
                        return `${crewMember.name} is having serious withdrawal and keeps checking their phone every 30 seconds. They're now upset with you.`;
                    } else {
                        gameState.crew[randomCrewIndex] = {
                            name: crewMember.name,
                            status: "Surprisingly relaxed"
                        };
                        updateCrewList();
                        return `Surprisingly, ${crewMember.name} discovered they actually enjoy looking at real scenery instead of Instagram. They seem more relaxed now.`;
                    }
                }
            }
        ]
    },
    {
        title: "Strange Roadside Attraction",
        description: "You spot a sign for 'World's Largest Artisanal Sourdough Starter Museum'",
        choices: [
            {
                text: "Visit the attraction ($10 per person)",
                effect: () => {
                    const totalCost = 10 * (gameState.crew.length + 1);
                    
                    if (gameState.resources.cash >= totalCost) {
                        gameState.resources.cash -= totalCost;
                        gameState.progress.day += 1;
                        updateGameDisplay();
                        return "It was... exactly what it claimed to be. At least you got some Instagram-worthy photos.";
                    } else {
                        return "You can't afford tickets for everyone. You drive past as your crew stares longingly at the giant bread sculpture.";
                    }
                }
            },
            {
                text: "Keep driving (save time and money)",
                effect: () => {
                    // Small chance of a crew member being upset about missing the attraction
                    if (Math.random() > 0.8) {
                        const randomCrewIndex = Math.floor(Math.random() * gameState.crew.length);
                        gameState.crew[randomCrewIndex] = {
                            name: gameState.crew[randomCrewIndex].name,
                            status: "Disappointed (missed attraction)"
                        };
                        updateCrewList();
                        return "You've seen enough weird roadside attractions in your time out west. Onward! Though " + gameState.crew[randomCrewIndex].name + " really wanted to see the giant bread sculpture.";
                    } else {
                        return "You've seen enough weird roadside attractions in your time out west. Onward!";
                    }
                }
            }
        ]
    },
    {
        title: "Gas Station Dilemma",
        description: "You're running low on gas, but the only station for miles is charging double the normal price!",
        choices: [
            {
                text: "Pay the premium price (lose extra cash)",
                effect: () => {
                    const gasCost = 50;
                    
                    if (gameState.resources.cash >= gasCost) {
                        gameState.resources.cash -= gasCost;
                        gameState.resources.gas = 100;
                        updateGameDisplay();
                        return "You reluctantly pay the outrageous price. At least your tank is full now.";
                    } else {
                        const affordableGas = Math.floor(gameState.resources.cash / (gasCost/100));
                        gameState.resources.gas += affordableGas;
                        gameState.resources.cash = 0;
                        updateGameDisplay();
                        return `You could only afford to fill up ${affordableGas}% of your tank. Better find more cash soon.`;
                    }
                }
            },
            {
                text: "Risk driving to the next town (might run out of gas)",
                effect: () => {
                    if (Math.random() > 0.6) {
                        gameState.resources.gas = 0;
                        gameState.progress.day += 2;
                        updateGameDisplay();
                        
                        // Make a random crew member upset about the situation
                        const randomCrewIndex = Math.floor(Math.random() * gameState.crew.length);
                        gameState.crew[randomCrewIndex] = {
                            name: gameState.crew[randomCrewIndex].name,
                            status: "Stranded and angry"
                        };
                        updateCrewList();
                        
                        return "You ran out of gas! It took two days to get help and get back on the road. Everyone is frustrated, especially " + gameState.crew[randomCrewIndex].name + ".";
                    } else {
                        return "You made it to the next town and found gas at a reasonable price. Good gamble!";
                    }
                }
            }
        ]
    },
    {
        title: "Pit Stop Dilemma",
        description: "Gas station has $5/gallon fuel or sketchy 'herbal energy shots.' Buy gas, shots, or risk it?",
        choices: [
            {
                text: "Buy overpriced gas ($5/gallon)",
                effect: () => {
                    const gasCost = 60; // More expensive than usual
                    
                    if (gameState.resources.cash >= gasCost) {
                        gameState.resources.cash -= gasCost;
                        gameState.resources.gas = 100;
                        updateGameDisplay();
                        return "You paid through the nose, but at least you know what you're getting. Your tank is full.";
                    } else {
                        const affordableGas = Math.floor(gameState.resources.cash / (gasCost/100));
                        gameState.resources.gas += affordableGas;
                        gameState.resources.cash = 0;
                        updateGameDisplay();
                        return `You could only afford to fill up ${affordableGas}% of your tank at these ridiculous prices.`;
                    }
                }
            },
            {
                text: "Try the 'herbal energy shots' for the bus",
                effect: () => {
                    const shotCost = 20;
                    
                    if (gameState.resources.cash >= shotCost) {
                        gameState.resources.cash -= shotCost;
                        
                        if (Math.random() > 0.5) {
                            gameState.resources.gas += 40;
                            if (gameState.resources.gas > 100) gameState.resources.gas = 100;
                            updateGameDisplay();
                            return "Surprisingly, the sketchy herbal concoction works! Your bus is running on... something. You're not sure you want to know what.";
                        } else {
                            gameState.resources.gas -= 10;
                            if (gameState.resources.gas < 0) gameState.resources.gas = 0;
                            updateGameDisplay();
                            return "Bad idea! Your bus sputtered and coughed after you poured that stuff in. You lost fuel and money.";
                        }
                    } else {
                        return "You can't afford even the sketchy option. The gas station attendant gives you a pitying look.";
                    }
                }
            },
            {
                text: "Risk it and keep driving",
                effect: () => {
                    if (Math.random() > 0.7) {
                        gameState.resources.gas = 0;
                        gameState.progress.day += 1;
                        updateGameDisplay();
                        
                        // Make a random crew member upset about the situation
                        const randomCrewIndex = Math.floor(Math.random() * gameState.crew.length);
                        gameState.crew[randomCrewIndex] = {
                            name: gameState.crew[randomCrewIndex].name,
                            status: "Frustrated and tired"
                        };
                        updateCrewList();
                        
                        return "You ran out of gas! Now you're stranded and will have to wait for help. " + gameState.crew[randomCrewIndex].name + " is particularly annoyed with your decision.";
                    } else {
                        return "You managed to make it to the next town where gas prices are normal. Your anxiety was through the roof the whole time though.";
                    }
                }
            }
        ]
    },
    {
        title: "Trade Offer",
        description: (crewMember) => {
            // Get a random active crew member for the trade item
            const activeMembers = gameState.crew.filter(m => !m.status || !m.status.includes("Departed"));
            const randomMember = activeMembers[Math.floor(Math.random() * activeMembers.length)];
            return `A trucker wants your vape for 2 gallons of gas. Accept or counter with ${randomMember.name}'s special stash?`;
        },
        choices: [
            {
                text: "Trade the vape for gas",
                effect: () => {
                    gameState.resources.gas += 20;
                    if (gameState.resources.gas > 100) gameState.resources.gas = 100;
                    updateGameDisplay();
                    
                    const randomCrewIndex = Math.floor(Math.random() * gameState.crew.length);
                    const crewMember = gameState.crew[randomCrewIndex];
                    
                    if (Math.random() > 0.7) {
                        gameState.crew[randomCrewIndex] = {
                            name: crewMember.name,
                            status: "Upset (lost vape)"
                        };
                        updateCrewList();
                        return `You got some gas, but ${crewMember.name} is upset about losing their vape. They keep asking if anyone has a spare.`;
                    } else {
                        return "Fair trade! You got some gas, and the trucker got a vape. Everyone's happy... except maybe your lungs.";
                    }
                }
            },
            {
                text: (crewMember) => `Counter with special stash`,
                effect: () => {
                    // Get a random active crew member for the trade
                    const activeMembers = gameState.crew.filter(m => !m.status || !m.status.includes("Departed"));
                    const randomIndex = gameState.crew.indexOf(activeMembers[Math.floor(Math.random() * activeMembers.length)]);
                    
                    gameState.resources.gas += 40;
                    if (gameState.resources.gas > 100) gameState.resources.gas = 100;
                    
                    if (randomIndex !== -1) {
                        gameState.crew[randomIndex] = {
                            name: gameState.crew[randomIndex].name,
                            status: "Upset (lost stash)"
                        };
                        updateCrewList();
                        return `The trucker was VERY happy with this trade. You got twice the gas, but ${gameState.crew[randomIndex].name} is not speaking to you now.`;
                    } else {
                        return "The trucker was VERY happy with this trade. You got twice the gas!";
                    }
                }
            }
        ]
    },
    {
        title: "Music Drama",
        generateDescription: () => {
            // Get two random active crew members for the music dispute
            const activeMembers = gameState.crew.filter(m => !m.status || !m.status.includes("Departed"));
            if (activeMembers.length < 2) return "The aux cord sits unused in the quiet bus.";
            
            const [member1, member2] = activeMembers
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);
                
            return {
                text: `${member1.name} fights ${member2.name} over the aux cord. Side with ${member1.name} (better playlist), ${member2.name} (morale boost), or let them duke it out (risk injury)?`,
                member1: member1,
                member2: member2
            };
        },
        choices: [
            {
                getText: (eventData) => `Side with ${eventData.member1.name} (better playlist)`,
                effect: (eventData) => {
                    if (!eventData.member1 || !eventData.member2) return "The dispute resolves itself in the silence.";
                    
                    // Make the second member upset
                    const loserIndex = gameState.crew.indexOf(eventData.member2);
                    if (loserIndex !== -1) {
                        gameState.crew[loserIndex] = {
                            name: eventData.member2.name,
                            status: "Upset (lost aux privileges)"
                        };
                        updateCrewList();
                        return `${eventData.member1.name}'s playlist is objectively better, but ${eventData.member2.name} is now sulking in the back of the bus.`;
                    } else {
                        return "The music plays on, but tension remains in the air.";
                    }
                }
            },
            {
                getText: (eventData) => `Side with ${eventData.member2.name} (morale boost)`,
                effect: (eventData) => {
                    if (!eventData.member1 || !eventData.member2) return "The music plays on in the quiet bus.";
                    
                    // Improve crew morale
                    gameState.crew.forEach((member, index) => {
                        if (member.status && member.status.includes("Upset")) {
                            gameState.crew[index] = {
                                name: member.name,
                                status: "good"
                            };
                        }
                    });
                    updateCrewList();
                    
                    // Make the first member upset
                    const loserIndex = gameState.crew.indexOf(eventData.member1);
                    if (loserIndex !== -1) {
                        gameState.crew[loserIndex] = {
                            name: eventData.member1.name,
                            status: "Upset (aux cord drama)"
                        };
                        updateCrewList();
                        return `${eventData.member2.name}'s playlist has everyone except ${eventData.member1.name} dancing in their seats. The vibes are immaculate.`;
                    } else {
                        return "The music brings everyone together, even if the taste is questionable.";
                    }
                }
            },
            {
                text: "Let them duke it out",
                effect: (eventData) => {
                    if (Math.random() > 0.7) {
                        if (!eventData.member1 || !eventData.member2) return "The silence is deafening.";
                        
                        // Randomly choose one of the two members to get injured
                        const unluckyMember = Math.random() > 0.5 ? eventData.member1 : eventData.member2;
                        const injuredIndex = gameState.crew.indexOf(unluckyMember);
                        
                        gameState.crew[injuredIndex] = {
                            name: unluckyMember.name,
                            status: "Injured (aux cord battle)"
                        };
                        updateCrewList();
                        return `Bad call! ${unluckyMember.name} got injured in the scuffle. Now no one gets the aux cord, and you're stuck listening to static.`;
                    } else {
                        return "They eventually worked it out and agreed to alternate playlists. Democracy in action!";
                    }
                }
            }
        ]
    }
];

// Crew events
const CREW_EVENTS = [
    {
        title: "Homesick Crew Member",
        description: (crewMember) => `${crewMember.name} is feeling homesick and considering leaving the journey.`,
        choices: [
            {
                text: "Try to convince them to stay",
                effect: (crewMemberIndex) => {
                    if (Math.random() > 0.5) {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Staying, but homesick"
                        };
                        updateCrewList();
                        return `${gameState.crew[crewMemberIndex].name} decided to stay, but they're still homesick.`;
                    } else {
                        const departingMember = gameState.crew[crewMemberIndex].name;
                        gameState.crew[crewMemberIndex] = {
                            name: departingMember,
                            status: "Departed (peaced-out)"
                        };
                        updateCrewList();
                        return `Despite your efforts, ${departingMember} decided to leave. They caught a bus back west.`;
                    }
                }
            },
            {
                text: "Let them go",
                effect: (crewMemberIndex) => {
                    const departingMember = gameState.crew[crewMemberIndex].name;
                    gameState.crew[crewMemberIndex] = {
                        name: departingMember,
                        status: "Departed (peaced-out)"
                    };
                    updateCrewList();
                    return `You bid farewell to ${departingMember}. The journey continues with one less active crew member.`;
                }
            }
        ]
    },
    {
        title: "Food Poisoning!",
        description: (crewMember) => `${crewMember.name} got food poisoning from that sketchy gas station burrito.`,
        choices: [
            {
                text: "Stop and rest for a day",
                effect: (crewMemberIndex) => {
                    gameState.progress.day += 1;
                    gameState.crew[crewMemberIndex] = {
                        name: gameState.crew[crewMemberIndex].name,
                        status: "Recovering"
                    };
                    updateGameDisplay();
                    updateCrewList();
                    return `You stopped for a day to let ${gameState.crew[crewMemberIndex].name} recover.`;
                }
            },
            {
                text: "Keep driving (they'll have to tough it out)",
                effect: (crewMemberIndex) => {
                    if (Math.random() > 0.7) {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Sick and upset"
                        };
                        updateCrewList();
                        return `${gameState.crew[crewMemberIndex].name} is now both sick AND upset with you. Great leadership.`;
                    } else {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Digestive distress"
                        };
                        updateCrewList();
                        return `${gameState.crew[crewMemberIndex].name} toughed it out, but they're not doing great. The journey continues, with frequent bathroom stops.`;
                    }
                }
            }
        ]
    },
    {
        title: "COVID-25!",
        description: (crewMember) => {
            // Get a random active crew member for the herbal remedy
            const activeMembers = gameState.crew.filter(m => 
                (!m.status || !m.status.includes("Departed")) && 
                m.name !== crewMember.name
            );
            const healer = activeMembers.length > 0 ? 
                activeMembers[Math.floor(Math.random() * activeMembers.length)] : 
                {name: "someone"};
            
            return `${crewMember.name} caught the latest strain at a Coachella pop-up. Bed rest or try ${healer.name}'s herbal remedy?`;
        },
        choices: [
            {
                text: "Enforce bed rest for a day",
                effect: (crewMemberIndex) => {
                    gameState.progress.day += 1;
                    gameState.crew[crewMemberIndex] = {
                        name: gameState.crew[crewMemberIndex].name,
                        status: "Recovering from COVID-25"
                    };
                    updateGameDisplay();
                    updateCrewList();
                    return `You stopped for a day to let ${gameState.crew[crewMemberIndex].name} recover. They're wearing three masks now.`;
                }
            },
            {
                text: (crewMember) => {
                    const activeMembers = gameState.crew.filter(m => 
                        (!m.status || !m.status.includes("Departed")) && 
                        m.name !== crewMember.name
                    );
                    const healer = activeMembers.length > 0 ? 
                        activeMembers[Math.floor(Math.random() * activeMembers.length)] : 
                        {name: "someone"};
                    return `Try ${healer.name}'s herbal remedy`;
                },
                effect: (crewMemberIndex) => {
                    const activeMembers = gameState.crew.filter(m => 
                        (!m.status || !m.status.includes("Departed")) && 
                        m.name !== gameState.crew[crewMemberIndex].name
                    );
                    const healer = activeMembers.length > 0 ? 
                        activeMembers[Math.floor(Math.random() * activeMembers.length)] : 
                        {name: "someone"};
                    
                    if (Math.random() > 0.6) {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Miraculously cured"
                        };
                        updateCrewList();
                        return `Somehow, ${healer.name}'s concoction worked! ${gameState.crew[crewMemberIndex].name} is feeling better already. ${healer.name} is now insufferable about their 'medical knowledge'.`;
                    } else {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Worse (remedy reaction)"
                        };
                        gameState.progress.day += 2;
                        updateGameDisplay();
                        updateCrewList();
                        return `Bad move! ${gameState.crew[crewMemberIndex].name} had an allergic reaction to the remedy. Now you're delayed even more.`;
                    }
                }
            }
        ]
    },
    {
        title: "Screen Fatigue",
        description: (crewMember) => `${crewMember.name}'s eyes are glitching from 12 hours of coding. Rest them or push on (risk breakdown)?`,
        choices: [
            {
                text: "Force a digital detox day",
                effect: (crewMemberIndex) => {
                    gameState.progress.day += 1;
                    gameState.crew[crewMemberIndex] = {
                        name: gameState.crew[crewMemberIndex].name,
                        status: "Refreshed"
                    };
                    updateGameDisplay();
                    updateCrewList();
                    return `You confiscated all screens from ${gameState.crew[crewMemberIndex].name} for 24 hours. They're actually talking to people now!`;
                }
            },
            {
                text: "Let them keep coding (the project deadline is soon)",
                effect: (crewMemberIndex) => {
                    if (Math.random() > 0.7) {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Mental breakdown"
                        };
                        gameState.progress.day += 3;
                        updateGameDisplay();
                        updateCrewList();
                        return `${gameState.crew[crewMemberIndex].name} had a complete breakdown! They're now ranting about 'JavaScript promises' and 'undefined is a function'. You lost 3 days dealing with this.`;
                    } else {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Tired but productive"
                        };
                        gameState.resources.cash += 50;
                        updateGameDisplay();
                        updateCrewList();
                        return `${gameState.crew[crewMemberIndex].name} finished their project and got paid! They contributed $50 to the group fund, but they could really use some rest soon.`;
                    }
                }
            }
        ]
    },
    {
        title: "Vape Lung",
        description: (crewMember) => `${crewMember.name}'s coughing up clouds. Ban vaping (morale hit) or let them puff (health risk)?`,
        choices: [
            {
                text: "Ban vaping in the bus",
                effect: (crewMemberIndex) => {
                    // Make multiple crew members upset, but only active ones
                    let upsetCount = 0;
                    gameState.crew.forEach((member, index) => {
                        if (Math.random() > 0.5 && 
                            index !== crewMemberIndex && 
                            (!member.status || !member.status.includes("Departed"))) {
                            gameState.crew[index] = {
                                name: member.name,
                                status: "Upset (vape ban)"
                            };
                            upsetCount++;
                        }
                    });
                    
                    gameState.crew[crewMemberIndex] = {
                        name: gameState.crew[crewMemberIndex].name,
                        status: "Recovering from vape lung"
                    };
                    
                    updateCrewList();
                    
                    if (upsetCount > 0) {
                        return `You banned vaping for everyone's health. ${gameState.crew[crewMemberIndex].name} is recovering, but ${upsetCount} other crew members are upset about the new rule.`;
                    } else {
                        return `You banned vaping for everyone's health. ${gameState.crew[crewMemberIndex].name} is recovering, and surprisingly, no one else seems to mind.`;
                    }
                }
            },
            {
                text: "Let them keep vaping",
                effect: (crewMemberIndex) => {
                    if (Math.random() > 0.6) {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Severe vape lung"
                        };
                        gameState.progress.day += 2;
                        updateGameDisplay();
                        updateCrewList();
                        return `${gameState.crew[crewMemberIndex].name}'s condition got worse! You had to stop at an urgent care clinic, losing 2 days.`;
                    } else {
                        gameState.crew[crewMemberIndex] = {
                            name: gameState.crew[crewMemberIndex].name,
                            status: "Mild vape lung"
                        };
                        updateCrewList();
                        return `${gameState.crew[crewMemberIndex].name} keeps vaping but switches to a 'cleaner' brand. The bus now permanently smells like artificial mango, and their cough isn't getting better.`;
                    }
                }
            }
        ]
    },
    {
        title: "Kombucha Gut",
        description: (crewMember) => `${crewMember.name} overfermented the batch. Party's got the runs—lose a day or push through?`,
        choices: [
            {
                text: "Stop at a motel for recovery",
                effect: (crewMemberIndex) => {
                    gameState.progress.day += 1;
                    gameState.resources.cash -= 40;
                    if (gameState.resources.cash < 0) gameState.resources.cash = 0;
                    
                    // Heal multiple crew members, but only active ones
                    gameState.crew.forEach((member, index) => {
                        if (member.status && 
                            !member.status.includes("Departed") && 
                            (member.status.includes("Sick") || index === crewMemberIndex)) {
                            gameState.crew[index] = {
                                name: member.name,
                                status: "Recovered"
                            };
                        }
                    });
                    
                    updateGameDisplay();
                    updateCrewList();
                    return `You spent $40 on a motel with multiple bathrooms. Everyone's feeling better after a day of rest, and ${gameState.crew[crewMemberIndex].name} has been banned from kombucha duty.`;
                }
            },
            {
                text: "Push through (frequent bathroom stops)",
                effect: (crewMemberIndex) => {
                    // Count active crew members
                    const activeCrew = gameState.crew.filter(member => 
                        !member.status || !member.status.includes("Departed")
                    );
                    const affectedCount = Math.floor(Math.random() * activeCrew.length) + 1;
                    let affected = 0;
                    
                    // Only affect active crew members
                    gameState.crew.forEach((member, index) => {
                        if (affected < affectedCount && 
                            (!member.status || !member.status.includes("Departed")) && 
                            Math.random() > 0.5) {
                            gameState.crew[index] = {
                                name: member.name,
                                status: "Digestive distress"
                            };
                            affected++;
                        }
                    });
                    
                    gameState.progress.distanceTraveled -= 20;
                    if (gameState.progress.distanceTraveled < 0) gameState.progress.distanceTraveled = 0;
                    
                    updateGameDisplay();
                    updateCrewList();
                    return `You tried to keep driving, but the constant bathroom breaks actually set you back 20 miles. Now ${affected} crew members are sick. The bus smells terrible.`;
                }
            }
        ]
    }
];

// Global animation ID for the main game
let animationId = null;

// Game screens object
let screens;

// Initialize the game when the page loads
function initGame() {
    // Initialize screens object
    screens = {
        title: document.getElementById('title-screen'),
        instructions: document.getElementById('instructions-screen'),
        setup: document.getElementById('setup-screen'),
        mainGame: document.getElementById('main-game-screen'),
        gameOver: document.getElementById('game-over-screen'),
        mississippiGame: document.getElementById('mississippi-game-screen'),
        snackDash: document.getElementById('snack-dash-screen')
    };
    
    // Make sure the title screen is shown first
    showScreen(screens.title);
    
    // Initialize audio for mobile
    initAudioForMobile();
    
    // Set up event listeners
    document.getElementById('start-button').addEventListener('click', () => {
        showScreen(screens.setup);
    });

    document.getElementById('instructions-button').addEventListener('click', () => {
        showScreen(screens.instructions);
    });

    document.getElementById('back-to-title').addEventListener('click', () => {
        showScreen(screens.title);
    });

    document.getElementById('begin-journey').addEventListener('click', startJourney);
    document.getElementById('travel-button').addEventListener('click', travel);
    document.getElementById('rest-button').addEventListener('click', rest);
    document.getElementById('shop-button').addEventListener('click', shop);
    document.getElementById('check-crew-button').addEventListener('click', checkCrew);
    document.getElementById('play-again').addEventListener('click', () => {
        location.reload(); // Reload the page to restart the game
    });
    
    // Add debug event listener - double click on the distance display to trigger Mississippi
    document.getElementById('distance-traveled').addEventListener('dblclick', () => {
        console.log("Debug: Manually triggering Mississippi River crossing");
        if (!gameState.specialEvents.mississippiCrossing) {
            triggerMississippiCrossing();
        } else {
            console.log("Mississippi crossing already triggered");
        }
    });
}

// Initialize audio for mobile devices
function initAudioForMobile() {
    // Create a function to unlock audio
    const unlockAudio = () => {
        console.log('Unlocking audio...');
        // Create a silent audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create and play a silent sound to unlock audio
        const silentSound = audioContext.createBuffer(1, 1, 22050);
        const source = audioContext.createBufferSource();
        source.buffer = silentSound;
        source.connect(audioContext.destination);
        source.start(0);
        
        // Try to play both audio elements briefly
        const engineSound = document.getElementById('engine-sound');
        const shopMusic = document.getElementById('shop-music');
        
        if (engineSound) {
            engineSound.volume = 0;
            engineSound.play().then(() => {
                engineSound.pause();
                engineSound.volume = 0.5;
                console.log('Engine sound unlocked');
            }).catch(e => console.log('Could not unlock engine sound:', e));
        }
        
        if (shopMusic) {
            shopMusic.volume = 0;
            shopMusic.play().then(() => {
                shopMusic.pause();
                shopMusic.volume = 0.5;
                console.log('Shop music unlocked');
            }).catch(e => console.log('Could not unlock shop music:', e));
        }
        
        // Remove the event listeners once audio is unlocked
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
    };
    
    // Add event listeners to unlock audio on user interaction
    document.addEventListener('click', unlockAudio);
    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
}

// Run initialization when the page loads
window.addEventListener('DOMContentLoaded', initGame);

// Game Functions
function showScreen(screen) {
    // Hide all screens
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(s => s.classList.remove('active'));
    
    // Show the requested screen
    screen.classList.add('active');
}

// Preload game audio
function preloadAudio() {
    const engineSound = document.getElementById('engine-sound');
    console.log('Preloading engine sound...');
    
    return new Promise((resolve) => {
        engineSound.load();  // Force reload
        engineSound.volume = 0.5;  // Set volume to 50%
        
        if (engineSound.readyState >= 2) {
            console.log('Engine sound already loaded');
            resolve();
        } else {
            engineSound.addEventListener('canplay', () => {
                console.log('Engine sound loaded');
                resolve();
            }, { once: true });
        }
    });
}

function startJourney() {
    // Get player name and destination from the form
    const playerName = document.getElementById('player-name').value || 'Player';
    const destination = document.getElementById('destination').value;
    const startingPoint = document.getElementById('starting-point').value;
    
    // Increment the global play count
    if (typeof incrementPlayCount === 'function') {
        incrementPlayCount().catch(error => {
            console.error('Failed to increment play count:', error);
        });
    }
    
    // Get crew members from the form
    const crewInputs = document.querySelectorAll('.crew-member');
    const crewMembers = [];
    
    crewInputs.forEach(input => {
        const name = input.value.trim();
        if (name) {
            crewMembers.push({
                name: name,
                status: 'good',
                departed: false
            });
        }
    });
    
    // Ensure at least one crew member
    if (crewMembers.length === 0) {
        crewMembers.push({
            name: 'Buddy',
            status: 'good',
            departed: false
        });
    }
    
    // Set up initial game state
    gameState.player.name = playerName;
    gameState.player.destination = destination;
    gameState.player.startingPoint = startingPoint;
    gameState.crew = crewMembers;
    gameState.progress.day = 1;
    gameState.resources.gas = 100;
    gameState.resources.cash = 500;
    gameState.resources.snacks = 50;
    gameState.progress.distanceTraveled = 0;
    gameState.recentDecisions = [];
    
    // Normalize the route key to match the DISTANCES object format
    const normalizedStartingPoint = startingPoint.toLowerCase();
    const normalizedDestination = destination.toLowerCase();
    const routeKey = `${normalizedStartingPoint}-${normalizedDestination}`;
    
    // Set total distance based on route
    if (DISTANCES[routeKey]) {
        gameState.progress.totalDistance = DISTANCES[routeKey];
    } else {
        console.error(`Unknown route: ${routeKey}`);
        gameState.progress.totalDistance = 3000; // Default fallback
    }
    
    // Reset special events
    gameState.specialEvents = {
        mississippiCrossing: false,
        snackDash: false
    };
    
    // Show the main game screen
    showScreen(screens.mainGame);
    
    // Update the display
    updateGameDisplay();
    
    // Start the graphics
    startGraphics();
}

function updateGameDisplay() {
    // Update status bar
    document.getElementById('day-count').textContent = gameState.progress.day;
    document.getElementById('gas-level').textContent = gameState.resources.gas;
    document.getElementById('cash-amount').textContent = gameState.resources.cash;
    document.getElementById('snack-amount').textContent = gameState.resources.snacks;
    document.getElementById('distance-traveled').textContent = gameState.progress.distanceTraveled;
    document.getElementById('total-distance').textContent = gameState.progress.totalDistance;
    
    // Check for special events
    checkSpecialEvents();
    
    // Check for game over conditions
    checkGameOverConditions();
}

function updateCrewList() {
    const crewList = document.getElementById('crew-list');
    crewList.innerHTML = '';
    
    if (gameState.crew.length === 0) {
        const li = document.createElement('li');
        li.textContent = "All crew members have left or... worse.";
        crewList.appendChild(li);
    } else {
        gameState.crew.forEach(member => {
            const li = document.createElement('li');
            li.textContent = `${member.name} - ${member.status || "good"}`;
            crewList.appendChild(li);
        });
    }
}

function travel() {
    // Track this decision
    trackDecision("travel");
    
    // Check if enough resources
    if (gameState.resources.gas < TRAVEL_GAS_CONSUMPTION) {
        showMessage("Not enough gas to travel! Find a way to refill.");
        return;
    }
    
    if (gameState.resources.snacks < TRAVEL_SNACK_CONSUMPTION) {
        showMessage("Not enough snacks for the journey! Your crew needs food.");
        return;
    }
    
    // Consume resources
    gameState.resources.gas -= TRAVEL_GAS_CONSUMPTION;
    gameState.resources.snacks -= TRAVEL_SNACK_CONSUMPTION;
    
    // Progress
    gameState.progress.day += 1;
    const previousDistance = gameState.progress.distanceTraveled;
    
    // Calculate new distance and check for milestone crossings
    const newDistance = previousDistance + TRAVEL_DISTANCE_PER_DAY;
    console.log(`Travel: Distance increasing from ${previousDistance} to ${newDistance} miles`);
    
    // Update the distance
    gameState.progress.distanceTraveled = newDistance;
    
    // Update display - this will also check for special events
    updateGameDisplay();
    
    // Check if we've reached or exceeded the destination
    if (gameState.progress.distanceTraveled >= gameState.progress.totalDistance) {
        // Cap distance at total
        gameState.progress.distanceTraveled = gameState.progress.totalDistance;
        console.log(`Distance capped at total: ${gameState.progress.distanceTraveled} miles.`);
        
        // Update display again after capping
        updateGameDisplay();
        
        // Start bus movement animation
        startBusMovement();
        
        // End the game with success after a short delay to show the animation
        console.log("Destination reached! Ending game with success after animation.");
        setTimeout(() => {
            if (!gameState.gameOver) {
                console.log("Now triggering success end game");
                gameState.gameOver = true;
                endGame("success");
            }
        }, 1500); // Wait 1.5 seconds for the animation to play
        
        return;
    }
    
    // Start bus movement animation
    startBusMovement();
    
    // Check for deaths if we haven't rested
    checkCrewDeaths();
    
    // Random event chance (40%)
    if (Math.random() < 0.4) {
        triggerRandomEvent();
    } else {
        showMessage("You traveled safely for a day. The open road stretches before you.");
    }
}

function rest() {
    // Track this decision
    trackDecision("rest");
    
    // Check if enough resources
    if (gameState.resources.cash < REST_CASH_COST) {
        showMessage("Not enough cash to rest! Find a way to earn some money.");
        return;
    }
    
    // Consume resources
    gameState.resources.snacks -= REST_SNACK_CONSUMPTION;
    gameState.resources.cash -= REST_CASH_COST;
    
    // Progress day
    gameState.progress.day += 1;
    
    // Improve crew health (only for non-departed members)
    gameState.crew.forEach((member, index) => {
        if (member.status && 
            !member.status.includes("Departed") && 
            (member.status.includes("Sick") || member.status.includes("Tired"))) {
            gameState.crew[index] = {
                name: member.name,
                status: "good"
            };
        }
    });
    
    // Update display
    updateGameDisplay();
    updateCrewList();
    
    showMessage("Your crew rested for the day. Everyone's feeling better!");
}

function shop() {
    // Track this decision
    trackDecision("shop");
    
    // Play shop music
    const shopMusic = document.getElementById('shop-music');
    if (shopMusic) {
        shopMusic.currentTime = 0;
        shopMusic.volume = 0.5;
        
        // Check if audio is loaded and play with error handling
        if (shopMusic.readyState >= 2) {
            console.log('Shop music is loaded, playing...');
            const playPromise = shopMusic.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing shop music:', error);
                });
            }
        } else {
            console.log('Shop music not loaded, waiting for canplay event...');
            shopMusic.addEventListener('canplay', () => {
                console.log('Shop music now loaded, playing...');
                shopMusic.play().catch(error => {
                    console.error('Error playing shop music after load:', error);
                });
            }, { once: true });
        }
    }
    
    // Create shop popup
    const popup = document.getElementById('event-popup');
    const title = document.getElementById('event-title');
    const description = document.getElementById('event-description');
    const choices = document.getElementById('event-choices');
    
    title.textContent = "Roadside Shop";
    
    // Function to update the shop description with current cash
    const updateShopDescription = () => {
        description.textContent = `You have $${gameState.resources.cash} available to spend.`;
    };
    
    updateShopDescription();
    choices.innerHTML = '';
    
    // Shop options
    const options = [
        {
            text: "Buy Gas - $40 (Fills 50%)",
            effect: () => {
                if (gameState.resources.cash >= 40) {
                    gameState.resources.cash -= 40;
                    gameState.resources.gas += 50;
                    if (gameState.resources.gas > 100) {
                        gameState.resources.gas = 100;
                    }
                    updateGameDisplay();
                    updateShopDescription();
                    return "You filled up your gas tank.";
                } else {
                    return "You don't have enough cash!";
                }
            }
        },
        {
            text: "Snack Dash - $30",
            effect: () => {
                if (gameState.resources.cash >= 30) {
                    gameState.resources.cash -= 30;
                    updateGameDisplay();
                    updateShopDescription();
                    // Set flag before hiding popup
                    gameState.transitioningToSnackDash = true;
                    hidePopup();
                    startSnackDash();
                    return "";
                } else {
                    return "You don't have enough cash!";
                }
            }
        },
        {
            text: "Odd Jobs - Gain $50 (Takes 1 day)",
            effect: () => {
                gameState.resources.cash += 50;
                gameState.progress.day += 1;
                updateGameDisplay();
                updateShopDescription();
                return "You spent the day doing odd jobs and earned some cash.";
            }
        },
        {
            text: "Leave Shop",
            effect: () => {
                return "You decided to leave the shop.";
            }
        }
    ];
    
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option.text;
        button.addEventListener('click', () => {
            const result = option.effect();
            
            // Only hide popup if "Leave Shop" was clicked or Snack Dash was started
            if (option.text === "Leave Shop" || option.text === "Snack Dash - $30") {
                if (option.text === "Leave Shop") {
                    hidePopup();
                    showMessage(result);
                }
                // For Snack Dash, the popup is already hidden in the effect function
            } else {
                // Show message within the shop popup
                const messageElement = document.createElement('p');
                messageElement.textContent = result;
                messageElement.className = 'shop-message';
                messageElement.style.color = '#4CAF50';
                messageElement.style.fontWeight = 'bold';
                messageElement.style.margin = '10px 0';
                
                // Remove any previous messages
                const oldMessages = choices.querySelectorAll('.shop-message');
                oldMessages.forEach(msg => msg.remove());
                
                // Add the new message before the buttons
                choices.insertBefore(messageElement, choices.firstChild);
                
                // Auto-remove message after 3 seconds
                setTimeout(() => {
                    if (messageElement.parentNode === choices) {
                        messageElement.remove();
                    }
                }, 3000);
            }
        });
        choices.appendChild(button);
    });
    
    // Show popup
    popup.style.display = 'flex';
}

function checkCrew() {
    // Track this decision
    trackDecision("check_crew");
    
    if (gameState.crew.length === 0) {
        showMessage("You have no crew members left!");
        return;
    }
    
    // Random crew event (30% chance)
    if (Math.random() < 0.3) {
        triggerCrewEvent();
    } else {
        showMessage("Your crew seems to be doing ok. No new issues to report.");
    }
}

function triggerRandomEvent() {
    const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
    
    // Make the bus wobble for certain events
    if (event.title.includes("Flat Tire") || 
        event.title.includes("Climate Change") || 
        event.title.includes("Tesla Pileup")) {
        wobbleBus();
    }
    
    showEvent(event);
}

function triggerCrewEvent() {
    // Filter out departed crew members
    const activeCrewIndices = gameState.crew
        .map((member, index) => ({ member, index }))
        .filter(({ member }) => !member.status || !member.status.includes("Departed"))
        .map(({ index }) => index);

    // If no active crew members, return
    if (activeCrewIndices.length === 0) {
        showMessage("All crew members have departed!");
        return;
    }

    const event = CREW_EVENTS[Math.floor(Math.random() * CREW_EVENTS.length)];
    // Randomly select from active crew members only
    const crewMemberIndex = activeCrewIndices[Math.floor(Math.random() * activeCrewIndices.length)];
    const crewMember = gameState.crew[crewMemberIndex];
    
    // Create custom event with crew member info
    const customEvent = {
        title: event.title,
        description: event.description(crewMember),
        choices: event.choices.map(choice => ({
            text: choice.text,
            effect: () => choice.effect(crewMemberIndex)
        }))
    };
    
    showEvent(customEvent);
}

// Show an event with choices
function showEvent(event) {
    const popup = document.getElementById('event-popup');
    const title = document.getElementById('event-title');
    const description = document.getElementById('event-description');
    const choices = document.getElementById('event-choices');
    
    // Clear previous choices
    choices.innerHTML = '';
    
    // Set title
    title.textContent = event.title;
    
    // Handle dynamic description generation
    let eventData = null;
    if (event.generateDescription) {
        eventData = event.generateDescription();
        description.textContent = eventData.text;
    } else {
        description.textContent = typeof event.description === 'function' ? 
            event.description(event.crewMember) : event.description;
    }
    
    // Create choice buttons
    event.choices.forEach(choice => {
        const button = document.createElement('button');
        
        // Handle dynamic text generation for choices
        if (choice.getText) {
            button.textContent = choice.getText(eventData);
        } else {
            button.textContent = typeof choice.text === 'function' ? 
                choice.text(event.crewMember) : choice.text;
        }
        
        button.addEventListener('click', () => {
            const result = choice.effect(eventData || event.crewMemberIndex);
            hidePopup();
            showMessage(result);
        });
        
        choices.appendChild(button);
    });
    
    // Show the popup
    popup.style.display = 'flex';
}

// Hide the event popup
function hidePopup() {
    const popup = document.getElementById('event-popup');
    popup.style.display = 'none';
    
    // Stop shop music if it's playing (only when leaving the shop, not when starting Snack Dash)
    const shopMusic = document.getElementById('shop-music');
    if (shopMusic && !gameState.transitioningToSnackDash) {
        shopMusic.pause();
    }
    
    // Reset the flag after checking it
    if (gameState.transitioningToSnackDash) {
        gameState.transitioningToSnackDash = false;
    }
}

// Show a message to the player
function showMessage(message) {
    // Update the scene description text
    document.getElementById('current-scene').textContent = message;
}

function checkGameOverConditions() {
    // Check if player has reached their destination
    if (gameState.progress.distanceTraveled >= gameState.progress.totalDistance) {
        endGame("success");
        return;
    }
    
    // Check if all crew members are gone
    const activeCrewCount = gameState.crew.filter(member => 
        !member.status || !member.status.includes("Departed")
    ).length;
    
    if (activeCrewCount === 0) {
        endGame("no_crew");
        return;
    }
    
    // Check if out of resources
    if (gameState.resources.gas <= 0) {
        endGame("out_of_gas");
        return;
    }
    
    if (gameState.resources.cash <= 0 && gameState.resources.snacks <= 0) {
        endGame("no_resources");
        return;
    }
}

// End the game and show the game over screen
function endGame(reason) {
    console.log(`endGame called with reason: ${reason}`);
    
    // Stop any ongoing animations
    cancelAnimationFrame(animationId);
    
    // Show the game over screen
    console.log(`Showing game over screen: ${screens.gameOver.id}`);
    showScreen(screens.gameOver);
    
    // Set the game over message based on the reason
    let message = "";
    let title = "Game Over";
    
    switch (reason) {
        case "success":
            title = "You Made It!";
            message = `After ${gameState.progress.day} days on the road, you've successfully escaped the West Coast and returned to civilization. Your Instagram is full of epic road trip photos, and you've got stories for days.`;
            break;
        case "player_death":
            title = "You Didn't Make It";
            const player = gameState.crew.find(member => member.isPlayer);
            message = `After ${gameState.progress.day} days on the road and ${gameState.progress.distanceTraveled} miles traveled, ${player.name} has left this mortal coil. Should've rested when you had the chance!`;
            break;
        case "gas":
            message = "You ran out of gas in the middle of nowhere. Game over!";
            break;
        case "snacks":
            message = "Your crew starved without snacks. Game over!";
            break;
        case "crew":
            message = "All your crew members have abandoned you. Game over!";
            break;
        case "mississippi":
            // Message is set in failMississippiCrossing function
            break;
        default:
            // Use a random explanation or one related to recent decisions
            message = getRandomGameOverExplanation();
    }
    
    // Only set the message if it's not already set (for mississippi case)
    if (reason !== "mississippi") {
        console.log(`Setting title: "${title}" and message: "${message}"`);
        document.getElementById('game-over-title').textContent = title;
        document.getElementById('game-over-message').textContent = message;
    }
    
    // Display stats
    document.getElementById('final-days').textContent = gameState.progress.day;
    document.getElementById('final-distance').textContent = gameState.progress.distanceTraveled;
    document.getElementById('surviving-crew').textContent = gameState.crew.filter(member => !member.status || !member.status.includes("Departed")).length;
    
    // Add restart button functionality
    document.getElementById('play-again').onclick = function() {
        location.reload(); // Reload the page to restart the game
    };
}

// Function to get a random game over explanation
function getRandomGameOverExplanation() {
    // 60% chance to use a decision-related explanation if we have recent decisions
    if (gameState.recentDecisions.length > 0 && Math.random() < 0.6) {
        // Get the most recent decision
        const recentDecision = gameState.recentDecisions[0];
        
        // Get explanations for this decision type
        const explanations = DECISION_GAME_OVERS[recentDecision];
        
        // If we have explanations for this decision type, pick a random one
        if (explanations && explanations.length > 0) {
            return explanations[Math.floor(Math.random() * explanations.length)];
        }
    }
    
    // Otherwise, use a random general explanation
    return RANDOM_GAME_OVERS[Math.floor(Math.random() * RANDOM_GAME_OVERS.length)];
}

// Graphics
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const PIXEL_SIZE = 4;
const GREEN_COLOR = '#0f0';
const DARK_GREEN_COLOR = '#080';
const BLACK_COLOR = '#000';

// VW Bus sprite (20x10 pixels)
const vwBusSprite = [
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1,1,0],
    [0,1,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0]
];

// Spare tire sprite (to be drawn on the back of the bus)
const spareTireSprite = [
    [0,1,1,0],
    [1,1,1,1],
    [1,0,0,1],
    [1,0,0,1],
    [1,1,1,1],
    [0,1,1,0]
];

// Fuel icon sprite (gas pump)
const fuelIconSprite = [
    [0,1,1,1,0],
    [0,1,0,1,0],
    [1,1,0,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0],
    [0,0,1,0,0]
];

// Tree sprite
const treeSprite = [
    [0,0,1,0,0],
    [0,1,1,1,0],
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0]
];

// Sun sprite
const sunSprite = [
    [0,1,1,1,0],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [1,1,1,1,1],
    [0,1,1,1,0]
];

// Cloud sprite
const cloudSprite = [
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0]
];

// Cloud tracking
let clouds = [];
const MAX_CLOUDS = 2;
const CLOUD_SPEED = 0.1;  // Reduced from 0.2 to 0.1 for 50% slower movement

// Initialize clouds
function initClouds() {
    clouds = [];
    for (let i = 0; i < MAX_CLOUDS; i++) {
        clouds.push({
            x: Math.random() * canvas.width / PIXEL_SIZE,
            y: 3 + Math.random() * 5, // Random height near sun
            speed: CLOUD_SPEED * (0.8 + Math.random() * 0.4) // Slight speed variation
        });
    }
}

// Update cloud positions
function updateClouds() {
    clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -cloudSprite[0].length) {
            cloud.x = canvas.width / PIXEL_SIZE;
            cloud.y = 3 + Math.random() * 5;
        }
    });
}

// Landscape elements
const mountains = [
    [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0]
];

const flatland = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const cityscape = [
    [0,1,0,0,0,1,1,0,0,1,0,0,1,1,0,0],
    [0,1,0,0,0,1,1,0,0,1,1,0,1,1,0,0],
    [0,1,0,0,0,1,1,0,0,1,1,0,1,1,0,0],
    [0,1,1,1,0,1,1,0,0,1,1,0,1,1,0,0],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Animation variables
let animationFrame = 0;
let busPosition = 0;
let landscapeOffset = 0;
let currentLandscape = flatland;
let busWobble = false;
let busWobbleCounter = 0;
let isBusMoving = false;
let busMovementDuration = 0;
let busMovementSpeed = 2;

// Tree tracking
let treePositions = [];
const TREE_SPACING = 200; // Increased spacing between trees
const MAX_TREES = 3; // Reduced number of visible trees

// Landscape type tracking
const LANDSCAPE_TYPES = {
    MOUNTAINS: 'mountains',
    TREES: 'trees',
    FLATLAND: 'flatland'
};
let currentLandscapeType = LANDSCAPE_TYPES.MOUNTAINS;

// Initialize trees
function initTrees() {
    treePositions = [];
    for (let i = 0; i < MAX_TREES; i++) {
        treePositions.push({
            x: Math.floor(Math.random() * canvas.width / PIXEL_SIZE),
            offset: i * TREE_SPACING
        });
    }
}

// Update tree positions during travel
function updateTrees() {
    if (isBusMoving && currentLandscape === flatland) {
        treePositions.forEach((tree, index) => {
            // Move tree with landscape
            tree.offset = (tree.offset + busMovementSpeed) % (MAX_TREES * TREE_SPACING);
            
            // If tree moves off screen, reset it to the far right
            if (tree.offset > (MAX_TREES - 1) * TREE_SPACING) {
                tree.offset = 0;
                tree.x = Math.floor(Math.random() * 12); // Random position within segment
            }
        });
    }
}

// Draw a pixel
function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
}

// Draw the VW bus
function drawVWBus(x, y, wobble = false) {
    // Draw main bus body
    for (let row = 0; row < vwBusSprite.length; row++) {
        for (let col = 0; col < vwBusSprite[row].length; col++) {
            if (vwBusSprite[row][col] === 1) {
                // Apply wobble effect if needed
                let wobbleOffset = 0;
                
                if (wobble && row > 8) {
                    wobbleOffset = Math.sin(busWobbleCounter * 0.5) * 2;
                } else if (isBusMoving && row > 8) {
                    // Slight wobble when moving
                    wobbleOffset = Math.sin(busMovementDuration * 0.3) * 1;
                }
                
                drawPixel(x + col, y + row + wobbleOffset, GREEN_COLOR);
            }
        }
    }
    
    // Draw spare tire on the back
    for (let row = 0; row < spareTireSprite.length; row++) {
        for (let col = 0; col < spareTireSprite[row].length; col++) {
            if (spareTireSprite[row][col] === 1) {
                // Apply wobble to spare tire too
                let wobbleOffset = 0;
                
                if (wobble) {
                    wobbleOffset = Math.sin(busWobbleCounter * 0.5) * 1.5;
                } else if (isBusMoving) {
                    wobbleOffset = Math.sin(busMovementDuration * 0.3) * 0.8;
                }
                
                drawPixel(x + vwBusSprite[0].length - 3 + col, y + 2 + row + wobbleOffset, GREEN_COLOR);
            }
        }
    }
    
    // Draw VW logo on front
    drawPixel(x + 3, y + 3, GREEN_COLOR);
    drawPixel(x + 3, y + 4, GREEN_COLOR);
    drawPixel(x + 3, y + 5, GREEN_COLOR);
    drawPixel(x + 2, y + 4, GREEN_COLOR);
    drawPixel(x + 4, y + 4, GREEN_COLOR);
    
    // Draw headlights
    drawPixel(x + 1, y + 6, '#ff0'); // Yellow headlight
    
    // Draw peace sign or bumper sticker
    drawPixel(x + vwBusSprite[0].length - 8, y + vwBusSprite.length - 3, '#0f0');
    drawPixel(x + vwBusSprite[0].length - 7, y + vwBusSprite.length - 3, '#0f0');
    drawPixel(x + vwBusSprite[0].length - 6, y + vwBusSprite.length - 3, '#0f0');
    
    // Draw exhaust when moving
    if (isBusMoving) {
        const exhaustIntensity = Math.sin(busMovementDuration * 0.5) * 0.5 + 0.5; // Value between 0 and 1
        const exhaustColor = `rgba(0, ${Math.floor(255 * exhaustIntensity)}, 0, ${exhaustIntensity})`;
        
        // Draw exhaust particles
        drawPixel(x, y + 7, exhaustColor);
        if (busMovementDuration % 4 < 2) {
            drawPixel(x - 1, y + 7, exhaustColor);
        }
        if (busMovementDuration % 6 < 3) {
            drawPixel(x - 2, y + 7, exhaustColor);
        }
    }
}

// Draw landscape
function drawLandscape(offset) {
    const repetitions = Math.ceil(canvas.width / (PIXEL_SIZE * 16)) + 1;
    
    // Draw dashed lane markers
    const laneY = 35;
    ctx.fillStyle = GREEN_COLOR;
    for (let i = 0; i < repetitions * 2; i++) {
        const markerX = (i * 20 - (offset % 40));
        if (i % 2 === 0) {
            ctx.fillRect(markerX * PIXEL_SIZE, laneY * PIXEL_SIZE, 10 * PIXEL_SIZE, PIXEL_SIZE);
        }
    }
    
    // Draw sun (fixed position in upper right)
    const sunX = canvas.width / PIXEL_SIZE - 10;
    const sunY = 3;
    for (let row = 0; row < sunSprite.length; row++) {
        for (let col = 0; col < sunSprite[row].length; col++) {
            if (sunSprite[row][col] === 1) {
                drawPixel(sunX + col, sunY + row, '#ff0'); // Yellow sun
            }
        }
    }
    
    // Draw clouds
    clouds.forEach(cloud => {
        const cloudX = Math.floor(cloud.x);
        const cloudY = Math.floor(cloud.y);
        
        // Determine if cloud is in front of sun
        const isInFrontOfSun = 
            cloudX + cloudSprite[0].length > sunX && 
            cloudX < sunX + sunSprite[0].length &&
            cloudY + cloudSprite.length > sunY &&
            cloudY < sunY + sunSprite.length;
        
        // Draw cloud with appropriate color
        for (let row = 0; row < cloudSprite.length; row++) {
            for (let col = 0; col < cloudSprite[row].length; col++) {
                if (cloudSprite[row][col] === 1) {
                    if (isInFrontOfSun) {
                        // Darker cloud when in front of sun
                        drawPixel(cloudX + col, cloudY + row, '#0a0');
                    } else {
                        // Normal cloud color
                        drawPixel(cloudX + col, cloudY + row, '#0f0');
                    }
                }
            }
        }
    });
    
    // Draw landscape elements based on current type
    for (let i = 0; i < repetitions; i++) {
        const startX = i * 16 - (offset % 16);
        
        if (currentLandscapeType === LANDSCAPE_TYPES.MOUNTAINS) {
            // Draw mountains above the bus
            for (let row = 0; row < mountains.length; row++) {
                for (let col = 0; col < mountains[row].length; col++) {
                    if (mountains[row][col] === 1) {
                        drawPixel(startX + col, 5 + row, DARK_GREEN_COLOR);
                    }
                }
            }
        } else if (currentLandscapeType === LANDSCAPE_TYPES.TREES) {
            // Draw trees at their tracked positions
            treePositions.forEach(tree => {
                const treeScreenX = tree.x + Math.floor((startX * 16 - tree.offset) / 16);
                if (treeScreenX >= 0 && treeScreenX < canvas.width / PIXEL_SIZE) {
                    for (let row = 0; row < treeSprite.length; row++) {
                        for (let col = 0; col < treeSprite[row].length; col++) {
                            if (treeSprite[row][col] === 1) {
                                drawPixel(treeScreenX + col, 15 + row, DARK_GREEN_COLOR);
                            }
                        }
                    }
                }
            });
        } else if (currentLandscapeType === LANDSCAPE_TYPES.FLATLAND) {
            // Draw horizon line
            for (let col = 0; col < 16; col++) {
                drawPixel(startX + col, 15, DARK_GREEN_COLOR);
            }
        }
        
        // Draw ground
        for (let col = 0; col < 16; col++) {
            drawPixel(startX + col, 36, DARK_GREEN_COLOR);
        }
    }
}

// Draw crew members as small sprites
function drawCrewMembers() {
    if (gameState.crew.length === 0) return;
    
    for (let i = 0; i < Math.min(gameState.crew.length, 3); i++) {
        // Draw a simple stick figure
        // Position them inside the bus windows
        const xPos = busPosition + 7 + i * 4;
        const yPos = 22;
        
        drawPixel(xPos, yPos, GREEN_COLOR);  // Head
        drawPixel(xPos, yPos + 1, GREEN_COLOR);  // Body
        
        // Special effects based on status
        if (gameState.crew[i].status) {
            if (gameState.crew[i].status.includes("digital")) {
                // Phone glow
                drawPixel(xPos + 1, yPos + 1, '#0ff');
            } else if (gameState.crew[i].status.includes("Sick")) {
                // Sick effect
                drawPixel(xPos, yPos - 1, '#0f0');
            } else if (gameState.crew[i].status.includes("Upset")) {
                // Upset effect - angry face
                drawPixel(xPos - 1, yPos - 1, '#0f0');
            }
        }
    }
}

// Draw resource bars
function drawResourceBars() {
    // Draw fuel icon
    for (let row = 0; row < fuelIconSprite.length; row++) {
        for (let col = 0; col < fuelIconSprite[row].length; col++) {
            if (fuelIconSprite[row][col] === 1) {
                drawPixel(5 + col, 5 + row, GREEN_COLOR);
            }
        }
    }
    
    // Gas bar
    ctx.fillStyle = BLACK_COLOR;
    ctx.fillRect(12 * PIXEL_SIZE, 5 * PIXEL_SIZE, 30 * PIXEL_SIZE, 3 * PIXEL_SIZE);
    
    ctx.fillStyle = GREEN_COLOR;
    const gasWidth = Math.floor(gameState.resources.gas / 100 * 30);
    ctx.fillRect(12 * PIXEL_SIZE, 5 * PIXEL_SIZE, gasWidth * PIXEL_SIZE, 3 * PIXEL_SIZE);
}

// Update the graphics
function updateGraphics() {
    // Clear canvas
    ctx.fillStyle = BLACK_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update trees if moving
    updateTrees();
    
    // Update clouds
    updateClouds();
    
    // Draw landscape
    drawLandscape(landscapeOffset);
    
    // Draw VW bus
    drawVWBus(busPosition, 20, busWobble);
    
    // Draw crew members
    drawCrewMembers();
    
    // Draw resource bars
    drawResourceBars();
    
    // Update animation variables
    animationFrame++;
    
    // Handle bus movement animation
    if (isBusMoving) {
        busMovementDuration++;
        
        // Move the landscape for scrolling effect
        landscapeOffset += busMovementSpeed;
        
        // Stop the animation after a certain duration
        if (busMovementDuration > 60) { // About 1 second at 60fps
            isBusMoving = false;
            busMovementDuration = 0;
        }
    }
    
    // Update bus position
    if (busPosition < 20) {
        busPosition += 0.5;
    }
    
    // Update bus wobble if active
    if (busWobble) {
        busWobbleCounter += 0.2;
        if (busWobbleCounter > 20) {
            busWobble = false;
            busWobbleCounter = 0;
        }
    }
    
    // Update landscape based on progress
    const progress = gameState.progress.distanceTraveled / gameState.progress.totalDistance;
    
    // Define landscape transition points
    if (progress < 0.2) {
        if (currentLandscapeType !== LANDSCAPE_TYPES.MOUNTAINS) {
            currentLandscapeType = LANDSCAPE_TYPES.MOUNTAINS;
        }
    } else if (progress < 0.35) {
        if (currentLandscapeType !== LANDSCAPE_TYPES.TREES) {
            currentLandscapeType = LANDSCAPE_TYPES.TREES;
            initTrees();
        }
    } else if (progress < 0.5) {
        if (currentLandscapeType !== LANDSCAPE_TYPES.FLATLAND) {
            currentLandscapeType = LANDSCAPE_TYPES.FLATLAND;
        }
    } else if (progress < 0.65) {
        if (currentLandscapeType !== LANDSCAPE_TYPES.TREES) {
            currentLandscapeType = LANDSCAPE_TYPES.TREES;
            initTrees();
        }
    } else if (progress < 0.8) {
        if (currentLandscapeType !== LANDSCAPE_TYPES.FLATLAND) {
            currentLandscapeType = LANDSCAPE_TYPES.FLATLAND;
        }
    } else {
        if (currentLandscapeType !== LANDSCAPE_TYPES.MOUNTAINS) {
            currentLandscapeType = LANDSCAPE_TYPES.MOUNTAINS;
        }
    }
    
    // Request next frame if game is not over
    if (!gameState.gameOver) {
        animationId = requestAnimationFrame(updateGraphics);
    }
}

// Start the animation when the game begins
function startGraphics() {
    // Cancel any existing animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    busPosition = 0;
    landscapeOffset = 0;
    currentLandscapeType = LANDSCAPE_TYPES.MOUNTAINS;
    initTrees(); // Initialize trees at start
    initClouds(); // Initialize clouds at start
    animationId = requestAnimationFrame(updateGraphics);
}

// Make the bus wobble (for breakdowns, flat tires, etc.)
function wobbleBus() {
    busWobble = true;
    busWobbleCounter = 0;
}

// Start bus movement animation
function startBusMovement() {
    isBusMoving = true;
    busMovementDuration = 0;
    
    // Add visual effect to travel button
    const travelButton = document.getElementById('travel-button');
    travelButton.classList.add('active-travel');
    
    // Play engine sound
    const engineSound = document.getElementById('engine-sound');
    console.log('Attempting to play engine sound...');
    
    if (engineSound) {
        engineSound.currentTime = 0;
        engineSound.volume = 0.5;
        
        // Check if audio is loaded and play with error handling
        if (engineSound.readyState >= 2) {
            console.log('Audio is loaded, playing...');
            const playPromise = engineSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Error playing audio:', error);
                    // If autoplay was prevented, we'll show a message on mobile
                    if (error.name === 'NotAllowedError' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                        console.log('Autoplay prevented on mobile device');
                    }
                });
            }
        } else {
            console.log('Audio not loaded, waiting for canplay event...');
            engineSound.addEventListener('canplay', () => {
                console.log('Audio now loaded, playing...');
                const playPromise = engineSound.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.error('Error playing audio after load:', error);
                        // If autoplay was prevented, we'll show a message on mobile
                        if (error.name === 'NotAllowedError' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                            console.log('Autoplay prevented on mobile device');
                        }
                    });
                }
            }, { once: true });
        }
    } else {
        console.error('Engine sound element not found');
    }
    
    // Remove the class after animation completes
    setTimeout(() => {
        travelButton.classList.remove('active-travel');
    }, 1000); // Match with animation duration
}

// Check for special events based on game progress
function checkSpecialEvents() {
    // Define the Mississippi River milestone range
    const mississippiRange = 100; // Trigger within 100 miles
    
    // Initialize specialEvents if it doesn't exist
    if (!gameState.specialEvents) {
        gameState.specialEvents = {};
        console.log("Initialized specialEvents object");
    }
    
    // Log current distance and Mississippi crossing status
    console.log(`Current distance: ${gameState.progress.distanceTraveled} miles`);
    console.log(`Total distance: ${gameState.progress.totalDistance} miles`);
    console.log(`Mississippi crossing triggered: ${gameState.specialEvents.mississippiCrossing}`);
    
    // Calculate the percentage of the journey completed
    const journeyPercentage = (gameState.progress.distanceTraveled / gameState.progress.totalDistance) * 100;
    console.log(`Journey percentage: ${journeyPercentage.toFixed(2)}%`);
    
    // Check if we're approaching the Mississippi River
    // Either by specific distance or by journey percentage (65-75%)
    const isNearMississippi = 
        (gameState.progress.distanceTraveled >= (MISSISSIPPI_MILESTONE - mississippiRange) && 
         gameState.progress.distanceTraveled <= (MISSISSIPPI_MILESTONE + mississippiRange)) ||
        (journeyPercentage >= 65 && journeyPercentage <= 75);
                             
    console.log(`Is near Mississippi (${MISSISSIPPI_MILESTONE - mississippiRange} to ${MISSISSIPPI_MILESTONE + mississippiRange} miles or 65-75% of journey): ${isNearMississippi}`);
    
    if (!gameState.specialEvents.mississippiCrossing && isNearMississippi) {
        console.log("Triggering Mississippi River crossing event");
        // Trigger the Mississippi River crossing event
        triggerMississippiCrossing();
    }
}

// Trigger the Mississippi River crossing event
function triggerMississippiCrossing() {
    console.log("triggerMississippiCrossing called");
    // Create the event
    const event = {
        title: "Mississippi River Crossing",
        description: "You've reached the mighty Mississippi River! This is a major milestone on your journey. You need to find a way across this massive river to continue your trip east.",
        choices: [
            {
                text: "Drive across the busy 6-lane bridge",
                effect: () => {
                    startMississippiMinigame('bridge');
                    return "You decide to brave the busy 6-lane bridge. Get ready to dodge traffic!";
                }
            },
            {
                text: "Pilot a one-car ferry across the river",
                effect: () => {
                    startMississippiMinigame('ferry');
                    return "You choose to pilot a ferry across the mighty Mississippi. Watch out for obstacles!";
                }
            },
            {
                text: "Try to drive across a 'shallow' part of the river",
                effect: () => {
                    startMississippiMinigame('shallow');
                    return "You attempt to drive through a 'shallow' part of the Mississippi. Hope your VW bus can handle it!";
                }
            }
        ]
    };
    
    // Mark this event as triggered
    gameState.specialEvents.mississippiCrossing = true;
    
    // Show the event
    showEvent(event);
}

// Mississippi River Crossing Mini-game
let mississippiGame = {
    canvas: null,
    ctx: null,
    mode: 'bridge', // 'bridge', 'ferry', or 'shallow'
    player: {
        x: 50,
        y: 200,
        width: 40,
        height: 20,
        speed: 5,
        health: 100
    },
    obstacles: [],
    background: {
        offset: 0,
        speed: 1
    },
    progress: 0,
    maxProgress: 100,
    isActive: false,
    keys: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    lastFrameTime: 0,
    animationId: null
};

// Start the Mississippi River crossing mini-game
function startMississippiMinigame(mode) {
    // Show the mini-game screen
    showScreen(screens.mississippiGame);
    
    // Initialize the game
    mississippiGame.canvas = document.getElementById('mississippi-canvas');
    mississippiGame.ctx = mississippiGame.canvas.getContext('2d');
    
    // Set canvas size to match its display size
    mississippiGame.canvas.width = mississippiGame.canvas.clientWidth;
    mississippiGame.canvas.height = mississippiGame.canvas.clientHeight;
    
    mississippiGame.mode = mode;
    mississippiGame.isActive = false; // Start inactive until player presses start
    mississippiGame.progress = 0;
    mississippiGame.player.health = 100;
    mississippiGame.player.x = 50;
    mississippiGame.player.y = mississippiGame.canvas.height / 2;
    mississippiGame.obstacles = [];
    mississippiGame.background.offset = 0;
    mississippiGame.touchActive = false;
    mississippiGame.touchTarget = { x: 0, y: 0 };
    
    // Set up instructions based on mode
    const instructionsElement = document.getElementById('mississippi-instructions');
    switch (mode) {
        case 'bridge':
            instructionsElement.textContent = "Navigate through traffic on the busy 6-lane bridge. Avoid cars! Use arrow keys, buttons, or touch the screen to move.";
            break;
        case 'ferry':
            instructionsElement.textContent = "Pilot your ferry across the river. Avoid rocks and boats! Use arrow keys, buttons, or touch the screen to move.";
            break;
        case 'shallow':
            instructionsElement.textContent = "Drive carefully through the 'shallow' part. Don't get swept away! Use arrow keys, buttons, or touch the screen to move.";
            break;
    }
    
    // Show the start button
    const startButton = document.getElementById('mississippi-start');
    startButton.style.display = 'block';
    
    // Draw the initial scene
    drawMississippiScene();
    
    // Add start button event listener
    startButton.addEventListener('click', startMississippiGame);
    
    // Add window resize handler
    window.addEventListener('resize', handleMississippiResize);
}

// Function to actually start the Mississippi game after pressing start
function startMississippiGame() {
    // Hide the start button
    document.getElementById('mississippi-start').style.display = 'none';
    
    // Set the game to active
    mississippiGame.isActive = true;
    
    // Set up event listeners for keyboard controls
    window.addEventListener('keydown', handleMississippiKeyDown);
    window.addEventListener('keyup', handleMississippiKeyUp);
    
    // Set up event listeners for button controls
    document.getElementById('mississippi-up').addEventListener('mousedown', () => mississippiGame.keys.up = true);
    document.getElementById('mississippi-up').addEventListener('mouseup', () => mississippiGame.keys.up = false);
    document.getElementById('mississippi-down').addEventListener('mousedown', () => mississippiGame.keys.down = true);
    document.getElementById('mississippi-down').addEventListener('mouseup', () => mississippiGame.keys.down = false);
    document.getElementById('mississippi-left').addEventListener('mousedown', () => mississippiGame.keys.left = true);
    document.getElementById('mississippi-left').addEventListener('mouseup', () => mississippiGame.keys.left = false);
    document.getElementById('mississippi-right').addEventListener('mousedown', () => mississippiGame.keys.right = true);
    document.getElementById('mississippi-right').addEventListener('mouseup', () => mississippiGame.keys.right = false);
    
    // Touch events for mobile
    document.getElementById('mississippi-up').addEventListener('touchstart', (e) => { e.preventDefault(); mississippiGame.keys.up = true; });
    document.getElementById('mississippi-up').addEventListener('touchend', () => mississippiGame.keys.up = false);
    document.getElementById('mississippi-down').addEventListener('touchstart', (e) => { e.preventDefault(); mississippiGame.keys.down = true; });
    document.getElementById('mississippi-down').addEventListener('touchend', () => mississippiGame.keys.down = false);
    document.getElementById('mississippi-left').addEventListener('touchstart', (e) => { e.preventDefault(); mississippiGame.keys.left = true; });
    document.getElementById('mississippi-left').addEventListener('touchend', () => mississippiGame.keys.left = false);
    document.getElementById('mississippi-right').addEventListener('touchstart', (e) => { e.preventDefault(); mississippiGame.keys.right = true; });
    document.getElementById('mississippi-right').addEventListener('touchend', () => mississippiGame.keys.right = false);
    
    // Add touch controls for direct player movement
    mississippiGame.canvas.addEventListener('touchstart', handleMississippiTouchStart);
    mississippiGame.canvas.addEventListener('touchmove', handleMississippiTouchMove);
    mississippiGame.canvas.addEventListener('touchend', handleMississippiTouchEnd);
    
    // Start the game loop
    mississippiGame.lastFrameTime = performance.now();
    mississippiGame.animationId = requestAnimationFrame(updateMississippiGame);
}

// Handle touch start for direct player movement
function handleMississippiTouchStart(e) {
    e.preventDefault();
    if (!mississippiGame.isActive) return;
    
    mississippiGame.touchActive = true;
    
    // Get touch position relative to canvas
    const touch = e.touches[0];
    const rect = mississippiGame.canvas.getBoundingClientRect();
    const scaleX = mississippiGame.canvas.width / rect.width;
    const scaleY = mississippiGame.canvas.height / rect.height;
    
    mississippiGame.touchTarget.x = (touch.clientX - rect.left) * scaleX;
    mississippiGame.touchTarget.y = (touch.clientY - rect.top) * scaleY;
}

// Handle touch move for direct player movement
function handleMississippiTouchMove(e) {
    e.preventDefault();
    if (!mississippiGame.isActive || !mississippiGame.touchActive) return;
    
    // Get touch position relative to canvas
    const touch = e.touches[0];
    const rect = mississippiGame.canvas.getBoundingClientRect();
    const scaleX = mississippiGame.canvas.width / rect.width;
    const scaleY = mississippiGame.canvas.height / rect.height;
    
    mississippiGame.touchTarget.x = (touch.clientX - rect.left) * scaleX;
    mississippiGame.touchTarget.y = (touch.clientY - rect.top) * scaleY;
}

// Handle touch end for direct player movement
function handleMississippiTouchEnd(e) {
    e.preventDefault();
    mississippiGame.touchActive = false;
}

// Handle window resize for Mississippi game
function handleMississippiResize() {
    if (!mississippiGame.canvas) return;
    
    // Save current game state
    const wasActive = mississippiGame.isActive;
    
    // Pause the game if it's active
    if (wasActive) {
        mississippiGame.isActive = false;
        cancelAnimationFrame(mississippiGame.animationId);
    }
    
    // Resize canvas
    mississippiGame.canvas.width = mississippiGame.canvas.clientWidth;
    mississippiGame.canvas.height = mississippiGame.canvas.clientHeight;
    
    // Adjust player position if needed
    if (mississippiGame.player.y > mississippiGame.canvas.height - mississippiGame.player.height) {
        mississippiGame.player.y = mississippiGame.canvas.height - mississippiGame.player.height;
    }
    
    // Redraw the game
    drawMississippiScene();
    
    // Resume the game if it was active
    if (wasActive) {
        mississippiGame.isActive = true;
        mississippiGame.lastFrameTime = performance.now();
        mississippiGame.animationId = requestAnimationFrame(updateMississippiGame);
    }
}

// Handle keyboard input for the mini-game
function handleMississippiKeyDown(e) {
    if (!mississippiGame.isActive) return;
    
    switch (e.key) {
        case 'ArrowUp':
            mississippiGame.keys.up = true;
            break;
        case 'ArrowDown':
            mississippiGame.keys.down = true;
            break;
        case 'ArrowLeft':
            mississippiGame.keys.left = true;
            break;
        case 'ArrowRight':
            mississippiGame.keys.right = true;
            break;
    }
}

function handleMississippiKeyUp(e) {
    if (!mississippiGame.isActive) return;
    
    switch (e.key) {
        case 'ArrowUp':
            mississippiGame.keys.up = false;
            break;
        case 'ArrowDown':
            mississippiGame.keys.down = false;
            break;
        case 'ArrowLeft':
            mississippiGame.keys.left = false;
            break;
        case 'ArrowRight':
            mississippiGame.keys.right = false;
            break;
    }
}

// Update the mini-game state
function updateMississippiGame(timestamp) {
    if (!mississippiGame.isActive) return;
    
    // Calculate delta time for smooth animation
    const deltaTime = timestamp - mississippiGame.lastFrameTime;
    mississippiGame.lastFrameTime = timestamp;
    
    // Clear the canvas
    mississippiGame.ctx.fillStyle = '#000';
    mississippiGame.ctx.fillRect(0, 0, mississippiGame.canvas.width, mississippiGame.canvas.height);
    
    // Update player position based on keyboard/button input
    if (mississippiGame.keys.up) {
        mississippiGame.player.y -= mississippiGame.player.speed;
    }
    if (mississippiGame.keys.down) {
        mississippiGame.player.y += mississippiGame.player.speed;
    }
    if (mississippiGame.keys.left) {
        mississippiGame.player.x -= mississippiGame.player.speed;
    }
    if (mississippiGame.keys.right) {
        mississippiGame.player.x += mississippiGame.player.speed;
    }
    
    // Update player position based on touch input
    if (mississippiGame.touchActive) {
        // Calculate direction to move towards touch target
        const dx = mississippiGame.touchTarget.x - (mississippiGame.player.x + mississippiGame.player.width / 2);
        const dy = mississippiGame.touchTarget.y - (mississippiGame.player.y + mississippiGame.player.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Only move if the touch target is not too close
        if (distance > mississippiGame.player.speed) {
            // Normalize direction and apply speed
            const moveX = (dx / distance) * mississippiGame.player.speed;
            const moveY = (dy / distance) * mississippiGame.player.speed;
            
            mississippiGame.player.x += moveX;
            mississippiGame.player.y += moveY;
        }
    }
    
    // Keep player within bounds
    mississippiGame.player.x = Math.max(0, Math.min(mississippiGame.canvas.width - mississippiGame.player.width, mississippiGame.player.x));
    mississippiGame.player.y = Math.max(0, Math.min(mississippiGame.canvas.height - mississippiGame.player.height, mississippiGame.player.y));
    
    // Update background
    updateMississippiBackground();
    
    // Update obstacles
    updateMississippiObstacles(deltaTime);
    
    // Draw the scene
    drawMississippiScene();
    
    // Check for collisions
    checkMississippiCollisions();
    
    // Check if player has reached the right side of the screen
    if (mississippiGame.player.x >= mississippiGame.canvas.width - mississippiGame.player.width - 25) {
        completeMississippiCrossing();
        return;
    }
    
    // Update progress bar based on horizontal position
    mississippiGame.progress = (mississippiGame.player.x / (mississippiGame.canvas.width - mississippiGame.player.width)) * 100;
    updateMississippiUI();
    
    // Continue the game loop
    mississippiGame.animationId = requestAnimationFrame(updateMississippiGame);
}

// Update the background based on the crossing mode
function updateMississippiBackground() {
    mississippiGame.background.offset += mississippiGame.background.speed;
    
    // Draw the river or bridge background
    mississippiGame.ctx.fillStyle = '#0f0';
    
    if (mississippiGame.mode === 'bridge') {
        // Draw bridge lanes
        for (let i = 0; i < 6; i++) {
            const laneY = i * 60 + 40;
            mississippiGame.ctx.fillRect(0, laneY, mississippiGame.canvas.width, 40);
        }
        
        // Draw lane markings
        mississippiGame.ctx.fillStyle = '#000';
        for (let i = 0; i < 6; i++) {
            const laneY = i * 60 + 40;
            
            // Dashed lines
            for (let x = (mississippiGame.background.offset % 40); x < mississippiGame.canvas.width; x += 40) {
                mississippiGame.ctx.fillRect(x, laneY + 20, 20, 2);
            }
        }
    } else {
        // Draw river
        mississippiGame.ctx.fillStyle = '#030';
        mississippiGame.ctx.fillRect(0, 0, mississippiGame.canvas.width, mississippiGame.canvas.height);
        
        // Draw current lines
        mississippiGame.ctx.fillStyle = '#0f0';
        for (let i = 0; i < 10; i++) {
            const y = (i * 40 + mississippiGame.background.offset) % mississippiGame.canvas.height;
            for (let x = 0; x < mississippiGame.canvas.width; x += 100) {
                mississippiGame.ctx.fillRect(x, y, 60, 2);
            }
        }
        
        // Draw shores
        mississippiGame.ctx.fillStyle = '#050';
        mississippiGame.ctx.fillRect(0, 0, 20, mississippiGame.canvas.height); // Left shore
        mississippiGame.ctx.fillRect(mississippiGame.canvas.width - 20, 0, 20, mississippiGame.canvas.height); // Right shore
    }
}

// Update and manage obstacles
function updateMississippiObstacles(deltaTime) {
    // Spawn new obstacles randomly
    if (Math.random() < 0.02) {
        spawnMississippiObstacle();
    }
    
    // Update existing obstacles
    for (let i = mississippiGame.obstacles.length - 1; i >= 0; i--) {
        const obstacle = mississippiGame.obstacles[i];
        
        // Move the obstacle
        if (mississippiGame.mode === 'bridge') {
            // Cars move horizontally
            obstacle.x += obstacle.speed * deltaTime * 0.1;
        } else {
            // River obstacles move with the current
            obstacle.y += obstacle.speed * deltaTime * 0.1;
            
            // Add some horizontal drift for river obstacles
            if (mississippiGame.mode === 'shallow') {
                obstacle.x += Math.sin(obstacle.y * 0.01) * 2;
            }
        }
        
        // Remove obstacles that are off-screen
        if ((mississippiGame.mode === 'bridge' && (obstacle.x > mississippiGame.canvas.width || obstacle.x < -obstacle.width)) ||
            (mississippiGame.mode !== 'bridge' && obstacle.y > mississippiGame.canvas.height)) {
            mississippiGame.obstacles.splice(i, 1);
        }
    }
}

// Spawn a new obstacle based on the crossing mode
function spawnMississippiObstacle() {
    let obstacle = {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        speed: 0,
        type: ''
    };
    
    if (mississippiGame.mode === 'bridge') {
        // Spawn a car
        obstacle.width = 60;
        obstacle.height = 30;
        obstacle.type = 'car';
        
        // Determine which lane to spawn in
        const lane = Math.floor(Math.random() * 6);
        obstacle.y = lane * 60 + 45; // Center in lane
        
        // Determine direction (odd lanes go right, even lanes go left)
        if (lane % 2 === 0) {
            obstacle.x = mississippiGame.canvas.width;
            obstacle.speed = -Math.random() * 3 - 2; // Negative speed (moving left)
        } else {
            obstacle.x = -obstacle.width;
            obstacle.speed = Math.random() * 3 + 2; // Positive speed (moving right)
        }
    } else if (mississippiGame.mode === 'ferry') {
        // Spawn river obstacles (rocks, sternwheelers, pleasure boats)
        const obstacleTypes = ['rock', 'sternwheeler', 'pleasureBoat'];
        obstacle.type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        switch (obstacle.type) {
            case 'rock':
                obstacle.width = 30;
                obstacle.height = 30;
                break;
            case 'sternwheeler':
                obstacle.width = 80;
                obstacle.height = 40;
                break;
            case 'pleasureBoat':
                obstacle.width = 50;
                obstacle.height = 25;
                break;
        }
        
        obstacle.x = Math.random() * (mississippiGame.canvas.width - 100) + 50;
        obstacle.y = -obstacle.height;
        obstacle.speed = Math.random() * 2 + 1;
    } else if (mississippiGame.mode === 'shallow') {
        // Spawn current obstacles (logs, whirlpools)
        const obstacleTypes = ['log', 'whirlpool'];
        obstacle.type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        
        switch (obstacle.type) {
            case 'log':
                obstacle.width = 100;
                obstacle.height = 20;
                break;
            case 'whirlpool':
                obstacle.width = 40;
                obstacle.height = 40;
                break;
        }
        
        obstacle.x = Math.random() * (mississippiGame.canvas.width - 100) + 50;
        obstacle.y = -obstacle.height;
        obstacle.speed = Math.random() * 3 + 2;
    }
    
    mississippiGame.obstacles.push(obstacle);
}

// Draw the game scene
function drawMississippiScene() {
    // Draw obstacles
    mississippiGame.ctx.fillStyle = '#0f0';
    for (const obstacle of mississippiGame.obstacles) {
        mississippiGame.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Add details based on obstacle type
        if (obstacle.type === 'car') {
            // Draw car windows
            mississippiGame.ctx.fillStyle = '#000';
            mississippiGame.ctx.fillRect(obstacle.x + obstacle.width * 0.2, obstacle.y + 5, obstacle.width * 0.3, obstacle.height - 10);
            mississippiGame.ctx.fillStyle = '#0f0';
        } else if (obstacle.type === 'sternwheeler') {
            // Draw sternwheel
            mississippiGame.ctx.fillStyle = '#000';
            mississippiGame.ctx.fillRect(obstacle.x + obstacle.width - 15, obstacle.y + 5, 10, obstacle.height - 10);
            mississippiGame.ctx.fillStyle = '#0f0';
        } else if (obstacle.type === 'pleasureBoat') {
            // Draw erratic movement lines
            mississippiGame.ctx.fillStyle = '#000';
            mississippiGame.ctx.fillRect(obstacle.x + obstacle.width - 10, obstacle.y + obstacle.height, 20, 5);
            mississippiGame.ctx.fillStyle = '#0f0';
        } else if (obstacle.type === 'whirlpool') {
            // Draw spiral
            mississippiGame.ctx.fillStyle = '#000';
            mississippiGame.ctx.beginPath();
            mississippiGame.ctx.arc(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height/2, 10, 0, Math.PI * 2);
            mississippiGame.ctx.fill();
            mississippiGame.ctx.fillStyle = '#0f0';
        }
    }
    
    // Draw player (VW bus)
    drawMississippiPlayer();
    
    // Draw shores for ferry and shallow modes
    if (mississippiGame.mode !== 'bridge') {
        mississippiGame.ctx.fillStyle = '#050';
        mississippiGame.ctx.fillRect(0, 0, 20, mississippiGame.canvas.height); // Left shore
        mississippiGame.ctx.fillRect(mississippiGame.canvas.width - 20, 0, 20, mississippiGame.canvas.height); // Right shore
    }
}

// Draw the player (VW bus)
function drawMississippiPlayer() {
    const { x, y, width, height } = mississippiGame.player;
    
    // Draw the VW bus in green
    mississippiGame.ctx.fillStyle = '#0f0';
    mississippiGame.ctx.fillRect(x, y, width, height);
    
    // Draw windows
    mississippiGame.ctx.fillStyle = '#000';
    mississippiGame.ctx.fillRect(x + 5, y + 5, 10, 5); // Front window
    mississippiGame.ctx.fillRect(x + 20, y + 5, 10, 5); // Back window
    
    // Draw wheels
    mississippiGame.ctx.fillRect(x + 5, y + height, 5, 3); // Front wheel
    mississippiGame.ctx.fillRect(x + width - 10, y + height, 5, 3); // Back wheel
    
    // Reset fill style
    mississippiGame.ctx.fillStyle = '#0f0';
}

// Check for collisions between player and obstacles
function checkMississippiCollisions() {
    for (const obstacle of mississippiGame.obstacles) {
        if (isColliding(mississippiGame.player, obstacle)) {
            // End game immediately on collision
            failMississippiCrossing();
            return;
        }
    }
}

// Check if two rectangles are colliding
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Flash the player to indicate damage
function flashPlayer() {
    // Flash effect
    const originalFill = mississippiGame.ctx.fillStyle;
    mississippiGame.ctx.fillStyle = '#f00';
    mississippiGame.ctx.fillRect(
        mississippiGame.player.x, 
        mississippiGame.player.y, 
        mississippiGame.player.width, 
        mississippiGame.player.height
    );
    mississippiGame.ctx.fillStyle = originalFill;
    
    // Reset after a short delay
    setTimeout(() => {
        if (mississippiGame.isActive) {
            drawMississippiScene();
        }
    }, 100);
}

// Update the UI elements (health and progress bars)
function updateMississippiUI() {
    document.getElementById('mississippi-health').style.width = `${mississippiGame.player.health}%`;
    document.getElementById('mississippi-progress').style.width = `${mississippiGame.progress}%`;
}

// Successfully complete the river crossing
function completeMississippiCrossing() {
    // Stop the game loop
    cancelAnimationFrame(mississippiGame.animationId);
    mississippiGame.isActive = false;
    
    // Remove event listeners
    window.removeEventListener('keydown', handleMississippiKeyDown);
    window.removeEventListener('keyup', handleMississippiKeyUp);
    window.removeEventListener('resize', handleMississippiResize);
    
    // Remove touch event listeners
    mississippiGame.canvas.removeEventListener('touchstart', handleMississippiTouchStart);
    mississippiGame.canvas.removeEventListener('touchmove', handleMississippiTouchMove);
    mississippiGame.canvas.removeEventListener('touchend', handleMississippiTouchEnd);
    
    // Return to the main game
    showScreen(screens.mainGame);
    
    // Show success message
    let successMessage = "";
    switch (mississippiGame.mode) {
        case 'bridge':
            successMessage = "You successfully navigated the busy bridge! Your VW bus weaved through traffic like a pro.";
            break;
        case 'ferry':
            successMessage = "You piloted the ferry across the Mississippi! The river pilots tip their hats to your navigation skills.";
            break;
        case 'shallow':
            successMessage = "You made it across the 'shallow' part! Your VW bus is soaked, but you're on the other side now.";
            break;
    }
    
    // Mark the Mississippi as crossed in the game state
    gameState.specialEvents.mississippiCrossing = true;
    
    // Add some distance to ensure we're past the Mississippi
    if (gameState.progress.distanceTraveled < MISSISSIPPI_MILESTONE) {
        gameState.progress.distanceTraveled = MISSISSIPPI_MILESTONE;
    }
    
    showMessage(successMessage);
    
    // Award bonus based on remaining health
    const healthBonus = Math.floor(mississippiGame.player.health / 20); // 0-5 bonus
    if (healthBonus > 0) {
        gameState.resources.snacks += healthBonus * 5;
        gameState.resources.cash += healthBonus * 10;
        updateGameDisplay();
    }
    
    // Restart the main game graphics
    startGraphics();
}

// Fail the river crossing
function failMississippiCrossing() {
    // Stop the game loop and animations
    cancelAnimationFrame(mississippiGame.animationId);
    mississippiGame.isActive = false;
    
    // Remove event listeners
    window.removeEventListener('keydown', handleMississippiKeyDown);
    window.removeEventListener('keyup', handleMississippiKeyUp);
    window.removeEventListener('resize', handleMississippiResize);
    
    // Remove touch event listeners
    mississippiGame.canvas.removeEventListener('touchstart', handleMississippiTouchStart);
    mississippiGame.canvas.removeEventListener('touchmove', handleMississippiTouchMove);
    mississippiGame.canvas.removeEventListener('touchend', handleMississippiTouchEnd);
    
    // Remove touch/click event listeners from control buttons
    const buttons = ['up', 'down', 'left', 'right'];
    buttons.forEach(direction => {
        const button = document.getElementById(`mississippi-${direction}`);
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Reset game state
    mississippiGame.keys = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    // Show game over with appropriate message
    let failureMessage = "";
    switch (mississippiGame.mode) {
        case 'bridge':
            failureMessage = "Your VW bus was totaled in a multi-car pileup on the bridge. Game over!";
            break;
        case 'ferry':
            failureMessage = "Your ferry capsized in the mighty Mississippi. You should have taken the bridge! Game over!";
            break;
        case 'shallow':
            failureMessage = "Turns out the Mississippi isn't shallow at all. Your VW bus was swept away by the current. Game over!";
            break;
    }
    
    // End the game
    gameState.gameOver = true;
    
    // Set custom game over message
    document.getElementById('game-over-title').textContent = "Game Over at the Mississippi";
    document.getElementById('game-over-message').textContent = failureMessage;
    
    // Display stats
    document.getElementById('final-days').textContent = gameState.progress.day;
    document.getElementById('final-distance').textContent = gameState.progress.distanceTraveled;
    document.getElementById('surviving-crew').textContent = gameState.crew.filter(member => !member.status || !member.status.includes("Departed")).length;
    
    // Clear any remaining obstacles
    mississippiGame.obstacles = [];
    
    // Show the game over screen
    showScreen(screens.gameOver);
    
    // Call endGame to ensure proper cleanup
    endGame("mississippi");
}

// Add death check function
function checkCrewDeaths() {
    gameState.crew.forEach((member, index) => {
        if (member.status && 
            (member.status.includes("Sick") || 
             member.status.includes("Injured") || 
             member.status.includes("Worse") || 
             member.status.includes("Severe") || 
             member.status.includes("Mental breakdown") ||
             member.status.includes("Digestive distress"))) {
            
            // 20% chance of death if not healthy and didn't rest
            if (Math.random() < 0.2) {
                const deathReasons = [
                    `${member.name} tried to cure their illness with crystals and essential oils. It didn't work.`,
                    `${member.name} insisted their immune system was "built different." Narrator: It wasn't.`,
                    `${member.name} left to "find themselves" at a desert meditation retreat. They found coyotes instead.`,
                    `${member.name} tried to heal their vape lung with more vaping. Bold strategy.`,
                    `${member.name} attempted to treat their condition with a TikTok medical trend. #RIP`,
                    `${member.name} decided to "raw dog the air" without a mask. It went poorly.`,
                    `${member.name} chose to "realign their chakras" instead of taking medicine. Their chakras are now permanently aligned.`,
                    `${member.name} insisted it was "just allergies." It wasn't.`,
                    `${member.name} tried to cure themselves by doing a 72-hour juice cleanse. They're now one with the kale.`,
                    `${member.name} attempted to treat themselves with DIY kombucha. The SCOBY had other plans.`
                ];

                const deathMessage = deathReasons[Math.floor(Math.random() * deathReasons.length)];
                
                if (member.isPlayer) {
                    // Game over if the player dies
                    gameState.gameOver = true;
                    endGame("player_death");
                } else {
                    // Update crew member status instead of removing them
                    gameState.crew[index] = {
                        name: member.name,
                        status: "Departed (RIP)"
                    };
                    showMessage(deathMessage);
                }
            }
        }
    });
}

// Snack Dash Mini-game
let snackDashState = {
    canvas: null,
    ctx: null,
    player: {
        x: 0,
        y: 0,
        width: 30,
        height: 30,
        speed: 3,
        direction: { x: 0, y: 0 },
        moving: false
    },
    snacks: [],
    walls: [],
    gameActive: false,
    snacksCollected: 0,
    animationId: null,
    lastTimestamp: 0
};

function startSnackDash() {
    // Show the Snack Dash screen
    showScreen(screens.snackDash);
    
    // Initialize the game
    initSnackDash();
    
    // Add event listeners for keyboard controls
    window.addEventListener('keydown', handleSnackDashKeyDown);
    window.addEventListener('keyup', handleSnackDashKeyUp);
    
    // Add event listeners for touch controls
    document.getElementById('snack-dash-start').addEventListener('click', startSnackDashGame);
    document.getElementById('snack-dash-up').addEventListener('mousedown', () => snackDashState.player.direction.y = -1);
    document.getElementById('snack-dash-up').addEventListener('mouseup', () => snackDashState.player.direction.y = 0);
    document.getElementById('snack-dash-down').addEventListener('mousedown', () => snackDashState.player.direction.y = 1);
    document.getElementById('snack-dash-down').addEventListener('mouseup', () => snackDashState.player.direction.y = 0);
    document.getElementById('snack-dash-left').addEventListener('mousedown', () => snackDashState.player.direction.x = -1);
    document.getElementById('snack-dash-left').addEventListener('mouseup', () => snackDashState.player.direction.x = 0);
    document.getElementById('snack-dash-right').addEventListener('mousedown', () => snackDashState.player.direction.x = 1);
    document.getElementById('snack-dash-right').addEventListener('mouseup', () => snackDashState.player.direction.x = 0);
    
    // Touch events for mobile
    document.getElementById('snack-dash-start').addEventListener('touchstart', (e) => { e.preventDefault(); startSnackDashGame(); });
    document.getElementById('snack-dash-up').addEventListener('touchstart', (e) => { e.preventDefault(); snackDashState.player.direction.y = -1; });
    document.getElementById('snack-dash-up').addEventListener('touchend', () => snackDashState.player.direction.y = 0);
    document.getElementById('snack-dash-down').addEventListener('touchstart', (e) => { e.preventDefault(); snackDashState.player.direction.y = 1; });
    document.getElementById('snack-dash-down').addEventListener('touchend', () => snackDashState.player.direction.y = 0);
    document.getElementById('snack-dash-left').addEventListener('touchstart', (e) => { e.preventDefault(); snackDashState.player.direction.x = -1; });
    document.getElementById('snack-dash-left').addEventListener('touchend', () => snackDashState.player.direction.x = 0);
    document.getElementById('snack-dash-right').addEventListener('touchstart', (e) => { e.preventDefault(); snackDashState.player.direction.x = 1; });
    document.getElementById('snack-dash-right').addEventListener('touchend', () => snackDashState.player.direction.x = 0);
}

// Function to start the Snack Dash game (extracted for reuse)
function startSnackDashGame() {
    if (!snackDashState.gameActive) {
        // Start the game
        snackDashState.gameActive = true;
        snackDashState.lastTimestamp = performance.now();
        updateSnackDashGame();
        
        // Update instructions
        document.getElementById('snack-dash-instructions').textContent = 
            "Use arrow keys or control buttons to navigate through the aisles and collect snacks!";
    }
}

function initSnackDash() {
    // Reset game state
    snackDashState.canvas = document.getElementById('snack-dash-canvas');
    snackDashState.ctx = snackDashState.canvas.getContext('2d');
    
    // Set canvas size to match its display size
    snackDashState.canvas.width = snackDashState.canvas.clientWidth;
    snackDashState.canvas.height = snackDashState.canvas.clientHeight;
    
    snackDashState.player = {
        x: 20, // Start just inside the entrance
        y: 250,
        width: 30,
        height: 30,
        speed: 3,
        direction: { x: 0, y: 0 },
        moving: false
    };
    snackDashState.snacks = [];
    snackDashState.walls = [];
    snackDashState.gameActive = false;
    snackDashState.snacksCollected = 0;
    snackDashState.allSnacksCollected = false;
    snackDashState.doorPosition = { x: 0, y: 230, width: 10, height: 70 }; // Door position
    
    // Update the snacks collected display
    document.getElementById('snacks-collected').textContent = '0';
    
    // Reset instruction and status messages
    document.getElementById('snack-dash-instructions').textContent = 
        "Press SPACE or tap START to begin. Use arrow keys or control buttons to navigate through the aisles and collect snacks!";
    document.getElementById('snack-dash-status').textContent = 
        "Collect all 3 snacks to win the maximum prize!";
    
    // Create the store layout (walls)
    createStoreLayout();
    
    // Place snacks in random positions
    placeSnacks();
    
    // Draw the initial game state
    drawSnackDashGame();
    
    // Add window resize handler
    window.addEventListener('resize', handleSnackDashResize);
}

// Handle window resize for Snack Dash
function handleSnackDashResize() {
    if (!snackDashState.canvas) return;
    
    // Save current game state
    const wasActive = snackDashState.gameActive;
    
    // Pause the game if it's active
    if (wasActive) {
        snackDashState.gameActive = false;
        cancelAnimationFrame(snackDashState.animationId);
    }
    
    // Resize canvas
    snackDashState.canvas.width = snackDashState.canvas.clientWidth;
    snackDashState.canvas.height = snackDashState.canvas.clientHeight;
    
    // Recreate the store layout
    createStoreLayout();
    
    // Adjust player position if needed
    if (snackDashState.player.x > snackDashState.canvas.width - snackDashState.player.width) {
        snackDashState.player.x = snackDashState.canvas.width - snackDashState.player.width - 10;
    }
    if (snackDashState.player.y > snackDashState.canvas.height - snackDashState.player.height) {
        snackDashState.player.y = snackDashState.canvas.height - snackDashState.player.height - 10;
    }
    
    // Redraw the game
    drawSnackDashGame();
    
    // Resume the game if it was active
    if (wasActive) {
        snackDashState.gameActive = true;
        snackDashState.lastTimestamp = performance.now();
        updateSnackDashGame();
    }
}

function createStoreLayout() {
    const canvas = snackDashState.canvas;
    
    // Outer walls with a door on the left
    snackDashState.walls.push(
        { x: 0, y: 0, width: canvas.width, height: 10 }, // Top
        { x: 0, y: canvas.height - 10, width: canvas.width, height: 10 }, // Bottom
        { x: 0, y: 0, width: 10, height: snackDashState.doorPosition.y }, // Left wall above door
        { x: 0, y: snackDashState.doorPosition.y + snackDashState.doorPosition.height, 
          width: 10, height: canvas.height - (snackDashState.doorPosition.y + snackDashState.doorPosition.height) }, // Left wall below door
        { x: canvas.width - 10, y: 0, width: 10, height: canvas.height } // Right
    );
    
    // Aisle walls - create 4 aisles, but move them further from the left edge
    const aisleWidth = 20;
    const firstAisleX = 100; // Move first aisle further from left edge
    const aisleSpacing = (canvas.width - firstAisleX - 50) / 3; // Space between aisles
    const aisleLength = canvas.height - 150; // Leave space at top and bottom
    
    for (let i = 0; i < 3; i++) {
        const x = firstAisleX + aisleSpacing * i;
        snackDashState.walls.push(
            { x: x, y: 50, width: aisleWidth, height: aisleLength }
        );
    }
}

function placeSnacks() {
    // Place 3 snacks in random positions
    for (let i = 0; i < 3; i++) {
        let validPosition = false;
        let snack;
        
        // Keep trying until we find a valid position
        while (!validPosition) {
            // Random position within the canvas
            const x = Math.floor(Math.random() * (snackDashState.canvas.width - 80)) + 40;
            const y = Math.floor(Math.random() * (snackDashState.canvas.height - 120)) + 60;
            
            snack = { x, y, width: 20, height: 20, collected: false };
            
            // Check if the snack is not colliding with any walls
            validPosition = !snackDashState.walls.some(wall => isColliding(snack, wall));
            
            // Also check it's not too close to the player's starting position
            const distToPlayer = Math.sqrt(
                Math.pow(snack.x - snackDashState.player.x, 2) + 
                Math.pow(snack.y - snackDashState.player.y, 2)
            );
            
            if (distToPlayer < 100) {
                validPosition = false;
            }
        }
        
        snackDashState.snacks.push(snack);
    }
}

function handleSnackDashKeyDown(e) {
    if (!snackDashState.gameActive && e.code === 'Space') {
        startSnackDashGame();
    }
    
    if (snackDashState.gameActive) {
        switch (e.code) {
            case 'ArrowUp':
                snackDashState.player.direction.y = -1;
                break;
            case 'ArrowDown':
                snackDashState.player.direction.y = 1;
                break;
            case 'ArrowLeft':
                snackDashState.player.direction.x = -1;
                break;
            case 'ArrowRight':
                snackDashState.player.direction.x = 1;
                break;
        }
    }
}

function handleSnackDashKeyUp(e) {
    if (snackDashState.gameActive) {
        switch (e.code) {
            case 'ArrowUp':
            case 'ArrowDown':
                snackDashState.player.direction.y = 0;
                break;
            case 'ArrowLeft':
            case 'ArrowRight':
                snackDashState.player.direction.x = 0;
                break;
        }
    }
}

function updateSnackDashGame(timestamp) {
    if (!snackDashState.gameActive) return;
    
    // Calculate delta time
    const deltaTime = timestamp - snackDashState.lastTimestamp;
    snackDashState.lastTimestamp = timestamp;
    
    // Move player
    const newPlayerX = snackDashState.player.x + snackDashState.player.direction.x * snackDashState.player.speed;
    const newPlayerY = snackDashState.player.y + snackDashState.player.direction.y * snackDashState.player.speed;
    
    // Create a potential new player position
    const newPlayerPos = {
        x: newPlayerX,
        y: newPlayerY,
        width: snackDashState.player.width,
        height: snackDashState.player.height
    };
    
    // Check for wall collisions
    const collidingWithWall = snackDashState.walls.some(wall => isColliding(newPlayerPos, wall));
    
    // Only update position if not colliding with a wall
    if (!collidingWithWall) {
        snackDashState.player.x = newPlayerX;
        snackDashState.player.y = newPlayerY;
    } else {
        // Game over if player hits a wall
        endSnackDash(false);
        return;
    }
    
    // Check for snack collection
    snackDashState.snacks.forEach((snack, index) => {
        if (!snack.collected && isColliding(snackDashState.player, snack)) {
            snack.collected = true;
            snackDashState.snacksCollected++;
            
            // Update the display
            document.getElementById('snacks-collected').textContent = snackDashState.snacksCollected;
            
            // Check if all snacks are collected
            if (snackDashState.snacksCollected === 3) {
                snackDashState.allSnacksCollected = true;
                document.getElementById('snack-dash-instructions').textContent = 
                    "All snacks collected! Now head back to the exit door on the left!";
            }
        }
    });
    
    // Check if player has collected all snacks and is exiting through the door
    if (snackDashState.allSnacksCollected && 
        snackDashState.player.x <= 10 && 
        snackDashState.player.y >= snackDashState.doorPosition.y && 
        snackDashState.player.y <= snackDashState.doorPosition.y + snackDashState.doorPosition.height - snackDashState.player.height) {
        // Player has exited through the door with all snacks
        endSnackDash(true, true);
        return;
    }
    
    // Check if player is exiting through the door without all snacks
    if (!snackDashState.allSnacksCollected && 
        snackDashState.player.x <= 10 && 
        snackDashState.player.y >= snackDashState.doorPosition.y && 
        snackDashState.player.y <= snackDashState.doorPosition.y + snackDashState.doorPosition.height - snackDashState.player.height) {
        // Player is exiting early
        endSnackDash(true, false);
        return;
    }
    
    // Draw the game
    drawSnackDashGame();
    
    // Continue the game loop
    snackDashState.animationId = requestAnimationFrame(updateSnackDashGame);
}

function drawSnackDashGame() {
    const ctx = snackDashState.ctx;
    
    // Clear the canvas
    ctx.clearRect(0, 0, snackDashState.canvas.width, snackDashState.canvas.height);
    
    // Draw the store floor
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, snackDashState.canvas.width, snackDashState.canvas.height);
    
    // Draw the walls
    ctx.fillStyle = '#333';
    snackDashState.walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
    
    // Draw the door
    ctx.fillStyle = '#8B4513'; // Brown color for the door
    ctx.fillRect(
        snackDashState.doorPosition.x, 
        snackDashState.doorPosition.y, 
        snackDashState.doorPosition.width, 
        snackDashState.doorPosition.height
    );
    
    // Add door handle
    ctx.fillStyle = '#FFD700'; // Gold color for the handle
    ctx.beginPath();
    ctx.arc(snackDashState.doorPosition.x + 7, snackDashState.doorPosition.y + 35, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw "EXIT" sign above the door
    ctx.fillStyle = '#FF0000'; // Red color for EXIT sign
    ctx.font = '12px Arial';
    ctx.fillText('EXIT', 15, snackDashState.doorPosition.y - 5);
    
    // Draw the snacks
    snackDashState.snacks.forEach(snack => {
        if (!snack.collected) {
            ctx.fillStyle = '#FF9800';
            ctx.beginPath();
            ctx.arc(snack.x + snack.width/2, snack.y + snack.height/2, snack.width/2, 0, Math.PI * 2);
            ctx.fill();
            
            // Add some details to make it look like a snack
            ctx.fillStyle = '#FFF';
            ctx.beginPath();
            ctx.arc(snack.x + snack.width/2 - 3, snack.y + snack.height/2 - 3, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    // Draw the player (shopping cart)
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(snackDashState.player.x, snackDashState.player.y, 
                 snackDashState.player.width, snackDashState.player.height);
    
    // Add cart details
    ctx.fillStyle = '#333';
    // Cart handle
    ctx.fillRect(
        snackDashState.player.x + snackDashState.player.width - 5, 
        snackDashState.player.y - 10, 
        5, 
        10
    );
    // Wheels
    ctx.beginPath();
    ctx.arc(snackDashState.player.x + 5, snackDashState.player.y + snackDashState.player.height, 4, 0, Math.PI * 2);
    ctx.arc(snackDashState.player.x + snackDashState.player.width - 5, snackDashState.player.y + snackDashState.player.height, 4, 0, Math.PI * 2);
    ctx.fill();
}

function endSnackDash(success, perfectExit = false) {
    // Stop the game
    snackDashState.gameActive = false;
    cancelAnimationFrame(snackDashState.animationId);
    
    // Stop shop music
    const shopMusic = document.getElementById('shop-music');
    if (shopMusic) {
        shopMusic.pause();
    }
    
    // Remove event listeners
    window.removeEventListener('keydown', handleSnackDashKeyDown);
    window.removeEventListener('keyup', handleSnackDashKeyUp);
    window.removeEventListener('resize', handleSnackDashResize);
    
    // Remove touch/click event listeners from control buttons
    const buttons = ['start', 'up', 'down', 'left', 'right'];
    buttons.forEach(direction => {
        const button = document.getElementById(`snack-dash-${direction}`);
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
    });
    
    // Calculate snacks earned based on how many were collected
    let snacksEarned = snackDashState.snacksCollected * 10;
    let statusMessage = "";
    
    // Show celebration screen if all snacks were collected
    if (snackDashState.snacksCollected === 3) {
        // Show the celebration popup
        const celebrationPopup = document.getElementById('snack-celebration');
        celebrationPopup.style.display = 'flex';
        
        // Draw the popcorn graphic
        drawPopcornGraphic();
        
        // Add event listener to the continue button
        document.getElementById('celebration-continue').addEventListener('click', () => {
            celebrationPopup.style.display = 'none';
            showScreen(screens.mainGame);
            showMessage(`SNACK CHAMPION! You collected all snacks and earned ${snacksEarned} snacks!`);
        }, { once: true });
        
        // Add the snacks to the player's inventory
        gameState.resources.snacks += snacksEarned;
        updateGameDisplay();
        
        return; // Exit early as we're handling the return to main game in the button click
    } else if (success) {
        statusMessage = `You made it out with ${snackDashState.snacksCollected} snacks and earned ${snacksEarned} snacks!`;
    } else {
        statusMessage = `Game over! You collected ${snackDashState.snacksCollected} snacks and earned ${snacksEarned} snacks.`;
    }
    
    // Update the status message
    document.getElementById('snack-dash-status').textContent = statusMessage;
    
    // Add the snacks to the player's inventory
    gameState.resources.snacks += snacksEarned;
    updateGameDisplay();
    
    // Return to the main game after a short delay
    setTimeout(() => {
        showScreen(screens.mainGame);
        showMessage(statusMessage);
    }, 2000);
}

function drawPopcornGraphic() {
    const canvas = document.getElementById('popcorn-canvas');
    const ctx = canvas.getContext('2d');
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw popcorn bag
    ctx.fillStyle = '#FF0000'; // Red bag
    ctx.beginPath();
    ctx.moveTo(50, 50);
    ctx.lineTo(150, 50);
    ctx.lineTo(170, 220);
    ctx.lineTo(30, 220);
    ctx.closePath();
    ctx.fill();
    
    // Draw bag stripes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(60, 80);
    ctx.lineTo(140, 80);
    ctx.lineTo(145, 110);
    ctx.lineTo(55, 110);
    ctx.closePath();
    ctx.fill();
    
    // Draw "BLAST-O-BUTTER" text
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BLAST-O-BUTTER', 100, 150);
    
    // Draw popcorn pieces spilling out
    const popcornColors = ['#FFFACD', '#FFF8DC', '#FFEBCD'];
    
    // Draw popcorn pieces
    for (let i = 0; i < 30; i++) {
        const x = 70 + Math.random() * 60;
        const y = 30 + Math.random() * 60;
        const size = 8 + Math.random() * 10;
        
        ctx.fillStyle = popcornColors[Math.floor(Math.random() * popcornColors.length)];
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Add some butter spots
        if (Math.random() > 0.7) {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(x + size/4, y - size/4, size / 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Helper function to track recent decisions
function trackDecision(decision) {
    // Add the decision to the beginning of the array
    gameState.recentDecisions.unshift(decision);
    
    // Keep only the 5 most recent decisions
    if (gameState.recentDecisions.length > 5) {
        gameState.recentDecisions.pop();
    }
    
    console.log("Recent decisions:", gameState.recentDecisions);
}