module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "jest": true,
        "mocha": true
    },
    "extends": "eslint:recommended",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "indent":[
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes":[
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};