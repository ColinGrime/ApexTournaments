export const commandName = 'create'
export const description = 'Creates a tournament for players to opt-in.'

export function register(subcommand) {
   return subcommand
        .setName(commandName)
        .setDescription(description)
        .addUserOption(option => option.setName('start-time').setDescription('Time to start (seconds)'));
}

export function execute(interaction) {
    interaction.reply({ content: 'It has been created!' });
}