const fs = require('fs');

const args = process.argv.slice(2);

function getArg(name) {
    let i = args.indexOf(name);
    if (args[i]) {
        if (args[i + 1]) {
            if ((args[i + 1].startsWith('-')) && (args[i + 1] !== '-')) {
                return true
            }
            return args[i + 1];
        }
        return true;
    }
    return undefined;
}

const commands = {};

module.exports.register = (command) => {
    commands[command.name] = {};
    commands[command.name].syntax = command.syntax;
    if (command.handler)
        commands[command.name].handler = command.handler;
    for (let syntax of command.syntax) {
        let calledValue = getArg(syntax);
        if (calledValue)
            commands[command.name].calledValue = calledValue;
    }
};

module.exports.getCalledValue = (command) => {
    return commands[command].calledValue;
};


module.exports.process = () => {
    for (let commandName of Object.keys(commands)) {
        if (commands[commandName].calledValue && commands[commandName].handler)
            commands[commandName].handler();
    }
};

let commandFiles = fs.readdirSync(`${__dirname}/../commands`);

for (const commandFile of commandFiles) {
    require(`${__dirname}/../commands/${commandFile}`);
}
