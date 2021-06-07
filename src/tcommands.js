'use strict';

const fs = require('fs');

const args = process.argv.slice(2);

function parseArg(name) {
    let i = args.indexOf(name);
    if (args[i]) {
        if (!args[i + 1] || isCommand(args[i + 1]))
            return true; // Return true if the argument is called with no value (end of line or followed by another command)
        return args[i + 1]; // Return the next argument in the command line as the "value"
    }
    return undefined; // Argument not found at all
}

const commands = {};
const lastCommands = [];
const commandNames = new Set();

function isCommand(s) {
    return commandNames.has(s);
}

function register(command) {
    commands[command.name] = command;

    for (let syntax of command.syntax) {
        commandNames.add(syntax);
    }
};

function parseArgs() {
    for (const command of Object.values(commands)) {
        for (let syntax of command.syntax) {
            let argValue = parseArg(syntax);
            if (argValue)
                commands[command.name].argValue = argValue;
        }
    }
}

function getArgValue(command) {
    return commands[command].argValue;
};

function processCommands(config) { // Run the handlers for all commands that were passed on the command line
    // Determine the order to process them based on any "after" statements
    const commandsOriginal = {...commands};
    const commandsInOrder = [];

    while (Object.keys(commandsOriginal).length > 0) {
        for (let commandName of Object.keys(commandsOriginal)) {
            const command = commandsOriginal[commandName];
            const afterReferences = Object.keys(commandsOriginal).filter(originalCommand => {
                const after = commandsOriginal[originalCommand].after;
                if (after) {
                    return after.includes(commandName);
                }
                return false;
            });
            if (afterReferences.length === 0) {
                commandsInOrder.unshift(commandsOriginal[commandName])
                delete commandsOriginal[commandName];
            }
        }
    }

    let commandProcessed = false;
    for (const command of commandsInOrder) {
        if (command.argValue && command.handler) {
            command.handler();
            commandProcessed = true;
        }
    }

    if (!commandProcessed) // If no commands were processed / issued, process the default command
        commands[config.defaultCommand].handler();
};

let commandFiles;

function loadCommands(path) {
    commandFiles = fs.readdirSync(path);
    for (const commandFile of commandFiles) {
        require(`${path}/${commandFile}`);
    }
    parseArgs();
}

module.exports = {
    isCommand,
    register,
    getArgValue,
    processCommands,
    loadCommands,
    commands,
    parseArgs
};
