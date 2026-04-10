(function () {
    const e = React.createElement;

    const ANSWER = "moody";
    const GUESSES = ["might", "flood", "stray"];
    const ROWS = 6;
    const COLS = 5;

    const KEYBOARD_ROWS = [
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
        ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
        ["z", "x", "c", "v", "b", "n", "m"]
    ];

    /**
     * Score a guess against the answer using Wordle-style rules.
     * We do this in 2 passes so duplicate letters are handled correctly.
     */
    function scoreGuess(guess, target) {
        const result = Array(guess.length).fill("absent");
        const remainingTargetLetters = target.split("");

        // Pass 1: exact matches
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === target[i]) {
                result[i] = "correct";
                remainingTargetLetters[i] = null;
            }
        }

        // Pass 2: wrong position but present
        for (let i = 0; i < guess.length; i++) {
            if (result[i] === "correct") {
                continue;
            }

            const guessedLetter = guess[i];
            const matchIndex = remainingTargetLetters.indexOf(guessedLetter);

            if (matchIndex !== -1) {
                result[i] = "present";
                remainingTargetLetters[matchIndex] = null;
            }
        }

        return result;
    }

    /**
     * Keyboard letter priority:
     * correct > present > absent
     */
    function isBetterStatus(oldStatus, newStatus) {
        const rank = {
            absent: 1,
            present: 2,
            correct: 3
        };

        return (rank[newStatus] || 0) > (rank[oldStatus] || 0);
    }

    /**
     * Build keyboard status map from all guesses.
     * Example:
     * {
     *   m: "correct",
     *   i: "absent",
     *   o: "present"
     * }
     */
    function buildLetterStatuses(guesses, target) {
        const statuses = {};

        for (let i = 0; i < guesses.length; i++) {
            const guess = guesses[i];
            const score = scoreGuess(guess, target);

            for (let j = 0; j < guess.length; j++) {
                const letter = guess[j];
                const newStatus = score[j];
                const oldStatus = statuses[letter];

                if (!oldStatus || isBetterStatus(oldStatus, newStatus)) {
                    statuses[letter] = newStatus;
                }
            }
        }

        return statuses;
    }

    function Tile(props) {
        const className = props.status
            ? "tile " + props.status
            : "tile";

        return e(
            "div",
            { className: className },
            props.letter || ""
        );
    }

    function Row(props) {
        const tiles = [];

        for (let i = 0; i < COLS; i++) {
            tiles.push(
                e(Tile, {
                    key: i,
                    letter: props.letters ? props.letters[i] : "",
                    status: props.statuses ? props.statuses[i] : ""
                })
            );
        }

        return e("div", { className: "row" }, tiles);
    }

    function Board(props) {
        const rows = [];

        for (let i = 0; i < ROWS; i++) {
            const guess = props.guesses[i] || "";
            const statuses = guess ? scoreGuess(guess, props.answer) : null;

            rows.push(
                e(Row, {
                    key: i,
                    letters: guess,
                    statuses: statuses
                })
            );
        }

        return e("section", { className: "board" }, rows);
    }

    function Keyboard(props) {
        const keyboardRows = KEYBOARD_ROWS.map(function (row, rowIndex) {
            const keys = row.map(function (letter) {
                const status = props.letterStatuses[letter];
                const className = status ? "key " + status : "key";

                return e(
                    "div",
                    {
                        key: letter,
                        className: className
                    },
                    letter
                );
            });

            return e(
                "div",
                {
                    key: rowIndex,
                    className: "keyboard-row"
                },
                keys
            );
        });

        return e("section", { className: "keyboard" }, keyboardRows);
    }

    function App() {
        const letterStatuses = buildLetterStatuses(GUESSES, ANSWER);

        return e(
            "main",
            { className: "app" },
            e("h1", null, "React Word Demo"),
            e(
                "p",
                { className: "subtitle" },
                'Static phase: guesses "might", "flood", "stray" scored against "moody"'
            ),
            e(Board, {
                guesses: GUESSES,
                answer: ANSWER
            }),
            e(Keyboard, {
                letterStatuses: letterStatuses
            }),
            e(
                "div",
                { className: "legend" },
                e("div", null, "Answer: " + ANSWER.toUpperCase()),
                e("div", null, "Guesses: " + GUESSES.join(", ").toUpperCase())
            )
        );
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(e(App));
})();