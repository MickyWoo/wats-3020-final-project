let choiceList = ['p1'];
let currentPage = null;
let state = {};


function closeScreen() {
    document.getElementById("startButton").style.display = "none";
    document.getElementById("startScreen").style.display = "none";
    audioController.startMusic();
}

function getCurrentPage(slug) {
    let newPage = storyData[slug];
    return newPage;
}

function recordChoice(slug) {
    choiceList.push(slug);
}

function undoChoice() {
    choiceList.pop();
    let slug = choiceList[choiceList.length - 1];
    return slug;
}

// sound function that i considered,found via: https://www.w3schools.com/graphics/game_sound.asp 

class AudioController {
    constructor() {
        this.bgMusic = new Audio('Music/2019-01-02_-_8_Bit_Menu_-_David_Renda_-_FesliyanStudios.com.mp3');
        this.atkSound = new Audio('Music/Sword-www.fesliyanstudios.com.mp3')
        this.healSound = new Audio('Music/HealingPokemonSound.mp3');
        this.bgMusic.volume = 0.5;
        this.bgMusic.loop = true;
    }
    startMusic() {
        this.bgMusic.play();
    }
    stopMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    heal() {
        this.healSound.play();
    }
    gameOver() {
        this.stopMusic();
        this.gameOverSound.play();
    }
    dmgSound() {
        this.atkSound.play();
    }
}

let audioController = new AudioController; // to be able to call upon constructor needs to set the variable after the constructor 


let pageContent = document.getElementById('story-text');
let choicesUL = document.querySelector('#choices');
let applyImage = document.getElementById('image');

state = {};


let maxHealth = document.querySelector('.health-bar-text')
let currentHealth = 100;

function healthAnimation() {
    $(".health-bar").animate({
        'width': currentHealth + '%' // so it needs the % to keep the health animation relative to the health bar px set.
    }, 700);
    $(".health-bar-red").animate({
        'width': currentHealth + '%'
    }, 900);
}

function displayNewHealth() {
    maxHealth.innerHTML = currentHealth;
}

function applyHealing(heal) {
    if (heal > 0) {
        alert("you healed for " + heal + " health");
        audioController.heal();
        currentHealth = currentHealth + heal;

        displayNewHealth();
        healthAnimation();
        checkMaxHealth();
    }
}

function checkMaxHealth() {
    if (currentHealth > 100) {
        resetHealth();
    }
}

function applyDamage(dmg) {
    if (dmg > 0) {
        alert("You took " + dmg + " damage");
        audioController.dmgSound();
        currentHealth = currentHealth - dmg;

        healthAnimation();
        displayNewHealth();

    } else if (currentHealth <= 0) {
        let slug = "p1"

        changePage(slug);
        resetHealth();
    }
}


function resetHealth() {
    currentHealth = 100;
    maxHealth.innerHTML = currentHealth;
    healthAnimation();
}

state = {};

function updatePage(newPage) {
    pageContent.innerHTML = newPage.text;
    applyImage.setAttribute('src', newPage.imageSrc);

    choicesUL.innerHTML = ""; // resets choices 

    for (let choice of newPage.choices) {

        //checks the setStates for display of hidden options 
        if (choice.requiredState === undefined || choice.requiredState(state)) {
            let newLI = document.createElement('li');

            newLI.innerHTML = choice.text;
            newLI.setAttribute('data-slug', choice.link);
            choicesUL.appendChild(newLI);


            newLI.addEventListener('click', () => {
                state = Object.assign(state, choice.setState);
                applyDamage(choice.dmg);
                applyHealing(choice.heal)
                changePage(choice.link);
            });
        }
    }

}


function changePage(slug) {
    if (slug == "p1") {
        resetHealth();
    }
    recordChoice(slug);
    let currentPage = getCurrentPage(slug);
    updatePage(currentPage);
}


var storyData = {

    title: "The Legend of Vox Machina - A Grog Spin Off",
    p1: {
        text: `Your name is Grog.... Grroooog StrongJaw. You are just waking up...`,

        imageSrc: `images/frontPage.jpg`,

        choices: [{
            text: `Time to hunt breakfast`,
            link: 'p2'
        }, {
            text: `Stay in Bed`,
            link: 'storyEnd'
        }]
    },
    storyEnd: {
        text: `You have Choose Poorly. please try again
                <br><br>
                The End.`,
        choices: [{
            text: `Play again?`,
            link: 'p1'
        }]
    },
    p2: {
        imageSrc: `images/Axe.jpeg`,
        text: `Before heading out the door you reach over the and `,

        choices: [{
            text: `Go for the axe!`,
            setState: {
                axe: true,
                sword: false
            },
            link: 'p3',

        }, {
            text: `Decide it's not worth the risk and go back to bed.`,
            link: 'storyEnd',
            dmg: 100
        }, {
            text: `Go for the Sword!`,
            setState: {
                sword: true,
                axe: false
            },
            link: `p3`,

        }]
    },
    p3: {
        imageSrc: `images/Bear.jpeg`,
        text: `As you reach deep in the forest you see a wild bear and her cubs`,
        choices: [{
            text: `Go stealthly and grab a bear cub`,
            link: 'p4a',
            dmg: 35
        }, {
            imageSrc: `images/Axe.jpeg`,
            text: `use your Axe!`,

            requiredState: (currentState) => currentState.axe,
            dmg: 5,
            link: `p4b`
        }, {
            imageSrc: `images/sword.jpg`,
            text: `use your Sword!`,

            requiredState: (currentState) => currentState.sword,
            dmg: 6,
            link: `p4b`

        }, {

            text: `move along in search for a different source of food`,
            link: 'p4'
        }]
    },
    p4a: {
        imageSrc: `images/Bear.jpeg`,
        text: `As best as you tried, you rolled a 1 and barbarians arn't very stealthy so the mama bear catchs you trying to 
                sneak away with one of her cubs and claws at you 
                <br><br>
                for 35 DMG`,
        choices: [{
            text: `Drop the cub and run away`,
            link: 'p4'
        }, {
            text: `Try and escape with the cub`,
            link: 'storyEnd',
            dmg: 100
        }, {
            text: `Stay and fight`,
            link: 'p4b'
        }]
    },
    p4b: {
        imageSrc: `images/Bear.jpeg`,
        text: `With some damage taken you go into a "Rage" and continue the fight taking less damage`,

        choices: [{
            text: `use your Axe`,
            link: 'p4c',
            requiredState: (currentState) => currentState.axe,
            dmg: 2
        }, {
            text: `punch the bear`,
            link: 'p4c',
            dmg: 5
        }, {
            text: `use your Sword`,
            link: 'p4c',
            requiredState: (currentState) => currentState.sword,
            dmg: 3,
        }]
    },
    p4c: {
        imageSrc: `images/Bear.jpeg`,
        text: `You take some damage during the fight but you finish off the bear,`,

        choices: [{
            text: `Skin Just bear`,
            link: 'p4',
            setState: {
                meat: 1
            }
        }, {
            text: `Skin the bear and its cubs,`,
            link: 'p4',
            setState: {
                meat: 3
            },

        }, {
            text: `Realizing you made orphan cubs, you leave and search for another source of food`,
            link: 'p4',

        }]
    },

    p4: {
        imageSrc: `images\crows.jpg`,
        text: `A few moments after the encounter, you hear a Loud and terrifying Roar. You see birds fly off in fear.`,
        choices: [{
            text: `Investigate the noise`,
            link: 'p5'
        }, {
            text: `Head in a different direction`,
            link: 'p5b',
        }, {
            text: 'go home and cook your breakfast',
            link: 'p9',
            // arrow function / annoyamous fucntion 
            /* 
            fucntion  requiredState(){
                currentState.bearMeat===3
            }
            pull in current state which is currentState.bearmeant and check if === to 3
            and its not so it returns FALSE 
            (currentState.bearMeat === 3) >>> is a function that you can put in anything functionn you want 

            */
            requiredState: (currentState) => (currentState.meat === 3),
        }]
    },
    p5: {

        imageSrc: ` images/Forest.jpg`,
        text: `As you venture to the source of the noise, 
        crossing deep into the forest you come across broken tree branches that widen into 
        Trees splintered in half, and a few figures in the distance surrounding something larger. `,
        choices: [{
            text: `Observe from a distance`,
            link: 'p5a'
        }, {
            text: `Get closer and see what is going on`,
            link: 'p5b'
        }, {
            text: `Skip on your merry way to the figures.`,
            link: 'p5c',
            dmg: 15
        }]
    },
    p5a: {
        imageSrc: ` images/Forest.jpg`,
        text: `As you try and peer forward and depict the figures you cant quite make out who they are.`,
        choices: [{
            text: `More forward`,
            link: 'p5b'
        }, {
            text: `Circle to the RIGHT`,
            link: 'p5a1'
        }, {
            text: `Circle to the LEFT`,
            link: 'p5a2'
        }]
    },
    p5a1: {
        text: `As your Circle around the Right, you notice large gashes in the surrounding.`,
        choices: [{
            text: `You think "oh boy" and edge forward to see the figures`,
            link: 'p5b'
        }]
    },
    p5a2: {
        imageSrc: `images/dragon scale.png`,
        text: `As you cirle around the LEFT, you notice large gashes in the surrounding, and what seems to be a Dragon Scale!!!`,
        choices: [{
            text: `You think, oh Crap!, and edge forward enough to see the figures`,
            link: 'p5b'
        }]
    },

    p5b: {
        imageSrc: `images/pack of wolves.png`,
        text: `As you move closer, you start to see who the figures are, They seem to be a pack of wolfs feasting on what looks to be a.... Giant Lizard`,
        choices: [{
            text: `Take a closer Look`,
            link: 'p5b1',
            dmg: 20,
        }, {
            text: `Turn around and go back home`,
            link: 'p6'
        }]
    },
    p5b1: {
        imageSrc: `images/pack of wolves.png`,
        text: `You moved too close that you catch one of the wolfs attention keeping watch, you Fend all 6 Wolfs off, 
                but take 20 dmg in the fight
                    you relize that the Giant Lizard has large gashes that are much too big for the wolfs, implying that a Larger monster is Near by`,
        choices: [{
            text: `Turn around and go back`,
            link: 'p6'
        }]
    },

    p5c: {
        imageSrc: `images/hole.jpg`,
        text: `As your Skip on your Merry way toward the figures, you Slip on a rock and incidently fall down a Hole. As you tumble down 
                you take 10 pts of falling dmg. As you get up you notice a small path foward `,
        choices: [{
            text: `Move along the path`,
            link: 'p5c1',
            heal: 25
        }, {
            text: `Climb back up`,
            link: 'p5'
        }]
    },
    p5c1: {
        imageSrc: `images\Fountain.jpg`,
        text: `Moving forward you find a life fountain, and gain 25 health`,
        choices: [{
            text: `Move along the path`,
            link: 'p5c2'
        }, {
            text: `Turn back`,
            link: 'p5'
        }]
    },
    p5c2: {
        imageSrc: `images/giant lizard.jpg`,
        text: `You reach the end of the path, but when you look up you see a crack leading toward the surface, and poke your head out. 
                What you realize, is that you had traveled underneath in a straight path toward the Figures you were trying to identify.
                which happen to be a pack of wolfs feasting on what looks to be a.... Giant Lizard
                And you See that the Giant Lizard has large gashes that are much too big for the wolfs, implying that a Larger monster is Near by.`,
        choices: [{
            text: `Turn back and head home`,
            link: 'p6'
        }]
    },
    p6: {
        imageSrc: `images/Dragon silhouette.jpg`,
        text: `As you head back, you hear the roar again, but overhead and as you look up you see a faint silhouette of a creature with wings quickly flying by.
        The the Probblem is, it was flying in the direction of your hometown.  `,
        choices: [{
            text: `Sprint back as fast as you can`,
            link: 'p7a'
        }, {
            text: `Keep a steady yet quicken pace back`,
            link: 'p7'
        }]
    },
    p7a: {
        imageSrc: `images/Village onfire.jpg`,
        text: `You return to your hometown engulfed in Flames and are able to tend to some villagers that were in dire situations `,
        choices: [{
            text: `Look for other survivors`,
            link: 'p8a',
            setState: {
                potion: true
            }
        }, {
            text: `Check on your house.`,
            link: 'p8b'
        }, {
            text: `follow the path of destruction`,
            link: 'p8c'
        }]
    },

    p7: {
        imageSrc: `images/Village onfire.jpg`,
        text: `You return to your hometown engulfed in Flames, bodies burning, Realizing you should have gotten back faster.`,
        choices: [{
            text: `Check on your Ale Reserves!!!`,
            link: 'p9',
        }]
    },
    p8a: {
        imageSrc: `images/Potion.jpg`,
        text: `You find some other people in need of help and they return the favor with a Lesser Potion `,
        choices: [{
            text: `Check on your house.`,
            link: 'p8b'
        }]
    },
    p8b: {
        imageSrc: `images/Village onfire.jpg`,
        text: `As you reach your home, it is engulfed in flames `,
        choices: [{
            text: `Try to Run in see what you can save`,
            link: 'p8b1',
            dmg: 10
        }, {
            text: `Look around the back entrance`,
            link: 'p8b2'
        }]
    },
    p8b1: {
        imageSrc: `images/Village onfire.jpg`,
        text: `You run in and hurt by the flames, use a perception check on what is salvagable   `,
        choices: [{
            text: `You grab the one item you could before the house collapse, Your Titan Stone Knuckles`,
            link: 'p9',
            setState: {
                titanStoneKnuckles: true
            }
        }]
    },
    p8b2: {
        imageSrc: `images/Village onfire.jpg`,
        text: `As you reach the back entrance, the house collapse and everthing burns to the ground `,
        choices: [{
            text: `Check on your Ale Reserves!!!`,
            link: 'p9',
        }]
    },
    p8c: {
        imageSrc: `images/Thordak.jpg`,
        text: `As you tread carefully following the path of destruction, you Find unfathomable. The Red Dragon himself - Thordak: the Cinder King!!!`,
        choices: [{
            text: `hide behind some broken rubble`,
            link: 'p9a'
        }, {
            text: `Charge at Thordak`,
            link: 'p9b'
        }, {
            text: `Yell "Thordaaaak!!!" to get his attention.`,
            link: 'p9c',
            requiredState: (currentState) => currentState.titanStoneKnuckles,

        }]
    },

    p9: {
        imageSrc: `images/Broken barels.jpg`,
        text: `As you head around, you see that your Ale reserves have been Destroyed, you wail in disbelief and now you must find this evil who 
                destroyed your Beloved ALE!!! `,
        choices: [{
            text: `go into a frenzied Rage and follow the path of destruction`,
            link: 'p8c',
        }]
    },
    p9a: {
        imageSrc: `images/Thordak.jpg`,
        text: `You think, this is IMPOSSIBLE as you remember Vax Killing the dragon years ago.`,
        choices: [{
            text: `Take a peak and check its really Thordak! `,
            link: 'p9a'
        }, {
            text: `Your Raging, you have no fear and think its just a look-a-like`,
            link: 'p9b'
        }, {
            text: `You think to yourself, I need to heal up before heading into this fight and Use the Potion`,
            link: 'p9b',
            requiredState: (currentState) => currentState.potion,
            heal: 15
        }]
    },
    p9b: {
        imageSrc: `images/Thordak.jpg`,
        text: `Charging forward you take out your weapon and `,
        choices: [{
            text: `Throw your weapon at its wing`,
            link: 'p10'
        }, {
            text: `Run up and attack Recklessly`,
            link: 'p10',
            dmg: 50
        }, {
            text: `Dash! Right under Thordak`,
            link: 'p10'
        }]
    },
    p9c: {
        imageSrc: `images/titan stone.jpg`,
        text: `You say "remember ME?! as you smash your Titan Stone Knuckles together and Enlarge in size`,
        choices: [{
            text: `Grab some bolders and throw them`,
            link: 'p10'
        }, {
            text: `Charge at Thordak`,
            link: 'p10',
            dmg: 50
        }, {
            text: `Clap your hand together to Disrupt Thordak`,
            link: 'p10a'
        }]
    },
    p10: {
        imageSrc: `images/End Screen of pt1.jpg`,
        text: `This Ends Part 1 of the side story, as I continue to create a better storyboard. I'll try my best to update this and get better.
    <br><br>
    Normal Ending....
    `,
        choices: [{
            text: `Play Again?`,
            link: 'p1'
        }]
    },
    p10a: {
        imageSrc: `images/Pike-neclace.webp`,
        text: `You Disrupt Thodak just long enough to Land a good Punch, The attack staggers the dragon
    <br><br>
    A little Shiny Glint falls down you catch it, you recognize it as a "necklace of Sarenrae " the SAME one PIKE always carries around!!!`,
        choices: [{
            text: `Try and grab Thordak and bring him down`,
            link: 'p10b'
        }, {
            text: `Use an Action Surge and Attack AGAIN!`,
            link: 'p10b'
        }]
    },

    p10b: {
        imageSrc: `images/End Screen of pt1.jpg`,
        text: `The Dragon regains its stance and then a louder Roar echos across the land. Thordak takes Flight and Heads East, You Try and grasp or pin him down, but he slips your Fingers.
    <br><br>
    You realize now, this is more serious than you imagined, as Pike is in danger as you hold the necklace of Sarenrae tightly in your hands. You have a long journey ahead of you.
    <br><br>
    Secret Ending`,
        choices: [{
            text: `Play Again?`,
            link: `p1`,
        }]
    },
};


let title = document.querySelector('#story-title');
title.innerHTML = storyData.title;


function addEventListeners() {
    let choices = document.querySelectorAll('#choices li');
    for (choice of choices) {
        choice.addEventListener('click', function (e) {
            console.log(`Moving to page: ${e.target.dataset.slug}`);
            changePage(e.target.dataset.slug);
        })
    }
}

let undo = document.querySelector('#undo');
undo.addEventListener('click', function (e) {
    console.log('Undoing last choice.');
    let slug = undoChoice();
    currentPage = getCurrentPage(slug);
    updatePage(currentPage);
})

currentPage = storyData.p1;

updatePage(currentPage);

/* save and load button 
create variable of items i want to save ie: health, current page, and state{}: items holding 
*/
function saveGame() {
    let save = {
        health: currentHealth,
        page: choiceList[choiceList.length - 1], // saving the most recent page, its choice list because updatePage function calls upon choicelist. / When i set it as currentPage the variable is set as p1 at line 361
        items: state
        // make have object for boss health.....
    };
    alert("Your game has been saved!");

    localStorage.setItem("save", JSON.stringify(save));
}

function loadGame() {
    let saveData = JSON.parse(localStorage.getItem("save"));

    if (saveData != null && saveData != undefined) {

        currentHealth = saveData.health;
        maxHealth.innerHTML = currentHealth; // i needed to set the health for display since i only carries the variable over into currentHealth again
        state = saveData.items
        currentPage = getCurrentPage(saveData.page); // I have to set it equal to current page like how i normally do in the story pages
        updatePage(currentPage); // so then i can updatePage Normally using the original function set UP that i made, throwing currentpage in as "input"

    }
}