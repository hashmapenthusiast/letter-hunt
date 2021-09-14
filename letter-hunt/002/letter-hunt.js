window.onload = function (event) {



    //QUERY SELECTORS
    const CAPS_LOCK_INDICATOR = document.querySelector('#capsLock');

    //CEHCK BOXES
    const LOWERCASE_CHECKBOX = document.querySelector('#lowercaseCheckbox');
    const UPPERCASE_CHECKBOX = document.querySelector('#uppercaseCheckbox');
    const NUMBER_CHECKBOX = document.querySelector('#numberCheckbox');
    const SPECIAL_CHECKBOX = document.querySelector('#specialCheckbox');
    //GROUPED FOR EVENT LISTENERS
    const CHECKBOXES = [
        LOWERCASE_CHECKBOX, UPPERCASE_CHECKBOX, NUMBER_CHECKBOX, SPECIAL_CHECKBOX
    ]

    //GAME LETTER
    const GAME_LETTER = document.querySelector('#find-letter');

    //SCORE TABLES
    const LOWERCASE_STATS = document.querySelector('#lowercaseStats');
    const UPPERCASE_STATS = document.querySelector('#uppercaseStats');
    const NUMBER_STATS = document.querySelector('#numberStats');
    const SPECIAL_STATS = document.querySelector('#specialStats');

    //make the CSS nicer dynamically changes the cells to be the same size as the largest one
    const score_grid_box = function () {
        let boxes = Array.from(document.querySelectorAll('td'));
        let widths = boxes.map(box => box.offsetWidth);
        let heights = boxes.map(box => box.offsetHeight);
        let maxWidth = Math.max(...widths);
        let maxHeight = Math.max(...heights);
        // console.log(`largest box (${maxWidth},${maxHeight})`);
        // console.log(document.styleSheets[0])
        let rules = document.styleSheets[0];
        // console.log('rules is a rule list', rules instanceof CSSStyleSheet)
        // console.log('rules.length', rules.cssRules.length)
        rules.insertRule(`td {min-width:${maxWidth}px; min-height:${maxHeight}px}`, rules.cssRules.length)
        // console.log('rules.length', rules.cssRules.length)

    }


    //DATA HOLDERS
    const LOWERCASE_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const UPPERCASE_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const NUMBER_CHARACTERS = '0123456789'.split('');
    const SPECIAL_CHARCATERS = '~`!@#$%^&*()-_=+[{]}\\|;:\'",<.>/? '.split(''); //how layed out on the keyboard
    const REMAPPED_SPECIAL_CHARACTERS = SPECIAL_CHARCATERS
        .map(elem => elem.charCodeAt(0))
        .sort((a, b) => a - b)
        .map(elem => String.fromCharCode(elem));
    const VALID_CHARACTERS = LOWERCASE_CHARACTERS
        .concat(UPPERCASE_CHARACTERS)
        .concat(NUMBER_CHARACTERS)
        .concat(REMAPPED_SPECIAL_CHARACTERS);

    // HASHTABLE FOR PROGRAM
    const HUNTED_LETTERS = [
        LOWERCASE_CHARACTERS,
        UPPERCASE_CHARACTERS,
        NUMBER_CHARACTERS,
        REMAPPED_SPECIAL_CHARACTERS
    ];

    const CHARACTER_CONTROL = {}
    const displayGenerator = function (c) {
        if (c === ' ') {
            return 'space';
        }
        return c;
    }
    const selectorGenerator = function (c) {
        if (c === ' ') {
            return 'space';
        }
        if (REMAPPED_SPECIAL_CHARACTERS.indexOf(c) !== -1) {
            return `\\${c}`;
        }
        return c;
    }
    VALID_CHARACTERS.forEach(e => {
        CHARACTER_CONTROL[e] = {
            "display": displayGenerator(e),
            "selector": selectorGenerator(e),
            "key": e
        };
    })
    console.log(REMAPPED_SPECIAL_CHARACTERS)
    console.log(CHARACTER_CONTROL);

    /**
     * Creates a table with the character on the left and a score setting on the right
     * @param {HTMLNode} target table targeted by the function
     * @param {String[]} data dataset intended to build the table
     */
    function generateTableStats(target, data) {
        for (let i = 0; i < data.length; i++) {
            let tempCharacter = CHARACTER_CONTROL[data[i]].display;
            let row = document.createElement('tr');
            let leftCell = document.createElement('td');
            let rightCell = document.createElement('td');
            leftCell.innerHTML = tempCharacter;
            rightCell.innerHTML = 0;
            rightCell.id = `count-${tempCharacter}`;
            rightCell.dataset.value = 0
            row.appendChild(leftCell);
            row.appendChild(rightCell);
            target.appendChild(row);
        };
    }

    //build the score tables dynamically
    generateTableStats(LOWERCASE_STATS, LOWERCASE_CHARACTERS);
    generateTableStats(UPPERCASE_STATS, UPPERCASE_CHARACTERS);
    generateTableStats(NUMBER_STATS, NUMBER_CHARACTERS);
    generateTableStats(SPECIAL_STATS, REMAPPED_SPECIAL_CHARACTERS);
    score_grid_box()

    /**
     * pulls a random letter out of a set of characters and returns it without a duplicate being possible
     * @param {String[]} DATASET the set of charcters passed from the caller
     * @param {String} previousCharacter passes the previous character so it cannot be selected twice in a row
     * @returns a character from the requested dataset
     */
    const randomCharacter = function (DATASET, previousCharacter) {

        //ensure the dataset is an array
        if (!Array.isArray(DATASET)) {
            console.error(DATASET);
            throw Error('random character dataset not found');
        }


        //TODO 011 add a check to make sure the dataset is not empty or contains 1 element
        if (DATASET.length < 2) {
            throw Error('not enough data in the set size <2');
        }

        //safety check if there is no character
        if (previousCharacter === undefined) {
            return DATASET[Math.floor(Math.random() * DATASET.length)]
        }
        previousCharacter = previousCharacter[0];

        //check if the previous character is in the dataset and removes it if it is
        if (DATASET.indexOf(previousCharacter[0]) !== -1) {
            //remove that data point and has the new list
            hash = DATASET.filter(data => data !== previousCharacter[0]);
            //return the datapoint
            return hash[Math.floor(Math.random() * hash.length)];
        }
        return DATASET[Math.floor(Math.random() * DATASET.length)];

    }

    //this controls the state of the game
    let state = [
        LOWERCASE_CHECKBOX.checked,
        UPPERCASE_CHECKBOX.checked,
        NUMBER_CHECKBOX.checked,
        SPECIAL_CHECKBOX.checked
    ];

    /**
     * This checks the state of the checkboxes 
     * @returns boolean[] 
     */
    const checkCheckboxState = function () {
        state = [
            LOWERCASE_CHECKBOX.checked,
            UPPERCASE_CHECKBOX.checked,
            NUMBER_CHECKBOX.checked,
            SPECIAL_CHECKBOX.checked
        ];

        // if all the states are off turn one back on
        if (state.indexOf(true) === -1) {
            //get a random number from 0-3
            let pickbox = Math.floor(Math.random() * 4);
            CHECKBOXES[pickbox].checked = true
            state[pickbox] = true;
        }
        // console.log(`state=>${state}`);

        return state;
    };

    /**
     * changes the boolean into a map
     * @param {boolean[]} checkboxState 
     * @returns int[]
     */
    const hashCheckboxState = function (checkboxState) {
        let hash = [], counter = 0;
        for (let i = 0; i < checkboxState.length; i++) {
            if (checkboxState[i]) {
                hash[counter] = i;
                counter++;
            }
        }
        // console.log(`hash=>${hash}`);
        return hash;
    }

    /**
     * returns a random character from the desired dataset
     * @param {String} previousLetter 
     * @returns char
     */
    const randomCharacterReturn = function (previousLetter) {
        let stateHash = hashCheckboxState(state);
        let selection = Math.floor(Math.random() * stateHash.length);
        // console.log(`selection=>${selection}`);
        // console.log(`hashed selection=>${stateHash[selection]}`);
        let chosen = randomCharacter(HUNTED_LETTERS[stateHash[selection]], previousLetter);
        // let chosen = randomCharacter[hash[selection]]();
        // console.log(`chosen=>${chosen}`);
        return chosen;
    }

    //starts with a random letter
    GAME_LETTER.placeholder = randomCharacter(HUNTED_LETTERS[0]);

    //CAPS LOCK CHECK
    window.addEventListener('keydown', function (e) {
        //if caps lock is true change the background to red, if its false change it to white and hide it
        if (e.getModifierState('CapsLock')) {
            CAPS_LOCK_INDICATOR.className = 'capsLockOn';
        } else {
            CAPS_LOCK_INDICATOR.className = 'capsLockOff';
        }
    });

    /**
     * adds an event listener for each checkbox to change the state of the game instead of calling it each time a button is pressed
     */
    CHECKBOXES.forEach(function (checkbox) {
        checkbox.addEventListener('input', function () {
            //this is where state should be updated;
            checkCheckboxState();
        });
    });



    //This is the game on pc and iphone
    document.addEventListener('keydown', function (event) {
        GAME_LETTER.value = '';


        // the charcater shown to the user
        let displayedLetter = GAME_LETTER.placeholder

        // stores to pressed key
        let pressedKey = event.key;
        console.log(pressedKey);

        // JANKY HACK TO PREVENT SCOLLING ACTION--------------------------------
        event.preventDefault();
        if (pressedKey === CHARACTER_CONTROL[' '].key) {
        }
        //----------------------------------------------------------------------

        //exits if the character is not part of the control
        if (CHARACTER_CONTROL[pressedKey] === undefined) {
            throw Error('somehow you pressed a key i don\'t know about');
        }
        //exits if the display does not match the control
        if (CHARACTER_CONTROL[pressedKey].display !== displayedLetter) {
            throw Error('no match on the press to the screen')
        }

        // score table updator
        // console.log(pressedKey)
        // console.log(CHARACTER_CONTROL[pressedKey])
        // console.log(CHARACTER_CONTROL[pressedKey].display)
        let scoreHolder = document.querySelector(`#count-${CHARACTER_CONTROL[pressedKey].selector}`);
        scoreHolder.dataset.value++;
        scoreHolder.innerHTML = scoreHolder.dataset.value;

        // finds a new letter
        let tempLetter = randomCharacterReturn(pressedKey);

        // console.log('passed', tempLetter)
        GAME_LETTER.placeholder = CHARACTER_CONTROL[tempLetter].display;

    });

    function DOMTELLER(yesss) {
        // console.log(1)
        let m = document.createElement('p');
        // console.log(2)
        m.innerHTML = yesss;
        // console.log(3)
        document.body.appendChild(m)
        // console.log(4)
    }

    //ANDROID TESTING
    document.addEventListener('compositionupdate', function (event) {
        DOMTELLER(`event.data->${event.data}, typeof->${typeof event.data}`)
        GAME_LETTER.value = '';

        // the charcater shown to the user
        let displayedLetter = GAME_LETTER.placeholder

        // stores to pressed key
        let pressedKey = event.data;

        let info = document.createElement('p');
        info.innerHTML = `data->${pressedKey}   placeholder->${displayedLetter}   test equal->${pressedKey === displayedLetter}  stall finding->${CHARACTER_CONTROL[pressedKey].display}`;
        document.body.appendChild(info)


        //exits if the character is not part of the control
        if (CHARACTER_CONTROL[pressedKey] === undefined) {
            throw Error('somehow you pressed a key i don\'t know about');
        }
        //exits if the display does not match the control
        if (CHARACTER_CONTROL[pressedKey].display !== displayedLetter) {
            throw Error('no match on the press to the screen')
        }

        let scoreHolder = document.querySelector(`#count-${CHARACTER_CONTROL[pressedKey].selector}`);
        scoreHolder.dataset.value++;
        scoreHolder.innerHTML = scoreHolder.dataset.value;

        // finds a new letter
        let tempLetter = randomCharacterReturn(pressedKey);

        // console.log('passed', tempLetter)
        GAME_LETTER.placeholder = CHARACTER_CONTROL[tempLetter].display;


        let p = document.createElement('p');
        if (pressedKey === displayedLetter) {
            p.innerHTML = `that worked data->${event.data} placeholder->${GAME_LETTER.placeholder}`;
            GAME_LETTER.value = '';
        } else {
            p.innerHTML = `negative ghost rider`;
        }
        document.body.appendChild(p)

    });
    GAME_LETTER.addEventListener('input', function (event) {
        GAME_LETTER.value = '';
    })


    //PREVENTS THE CHECKBOXES FROM BEING DELETED!
    const GAME_WATCHER = new MutationObserver(function (mutation) {
        if (mutation[0].removedNodes.length > 0) {
            let parent = mutation[0].target,
                child = mutation[0].removedNodes[0],
                sibling = mutation[0].nextSibling;

            // console.log(1000, mutation)
            // console.log(1111, child)
            // console.log(mutation[0]);
            // console.log(1234, `parent->${parent} child->${child} sibling->${sibling}`);
            // console.log(mutation[0].removedNodes[0]);
            parent.insertBefore(child, sibling);
            console.log('nice try big guy!')
        }
    })
    GAME_WATCHER.observe(document.querySelector('html'), {
        attributes: true,
        childList: true,
        characterData: true,
        subtree: true,
    });

}