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
const commandNames = new Set();

function isCommand(s) {
    return commandNames.has(s);
}

function register(command) {
    commands[command.name] = {};
    commands[command.name].syntax = command.syntax;
    if (command.handler)
        commands[command.name].handler = command.handler;
    if (command.helpText)
        commands[command.name].helpText = command.helpText;
    for (let syntax of command.syntax) {
        commandNames.add(syntax);
        let argValue = parseArg(syntax);
        if (argValue)
            commands[command.name].argValue = argValue;
    }
};

function getArgValue(command) {
    return commands[command].argValue;
};

function processCommands(config) { // Run the handlers for all commands that were passed on the command line
    let commandProcessed = false;
    for (let commandName of Object.keys(commands)) {
        if (commands[commandName].argValue && commands[commandName].handler) {
            commands[commandName].handler();
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
}

module.exports = {
    isCommand: isCommand,
    register: register,
    getArgValue: getArgValue,
    processCommands: processCommands,
    loadCommands: loadCommands,
    commands: commands
};
