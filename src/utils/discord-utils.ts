import { Guild, ChannelType, GuildChannel, TextChannel, EmbedBuilder, VoiceChannel } from 'discord.js';

/**
 * Quick way to create a basic channel.
 * @param guild guild to create the channel in
 * @param channelName name of the channel
 * @param channelType channel type
 * @param categoryID category channel will be created in
 * @returns Promise containing the channel
 */
export async function createChannel(guild: Guild, channelName: string, channelType: ChannelType, categoryID: string): Promise<GuildChannel> {
    // Check if the channel is already made.
    for (const channel of guild.channels.cache.values()) {
        if (channel.name === channelName && channel.parentId === categoryID) {
            return channel as GuildChannel;
        }
    }
    
    // Create the new channel.
    const channel: GuildChannel = await guild.channels.create({
        name: channelName,
        type: channelType as any
    });

    // Set the parent and return.
    return channel.setParent(categoryID);
}

/**
 * Quick way to rename channels.
 * @param guild guild to rename the channel in
 * @param channelID channel to rename
 * @param channelName new channel name
 * @param channelTopic new channel topic if applicable
 * @returns Promise containing channel
 */
export async function renameChannel(guild: Guild, channelID: string, channelName: string, channelTopic?: string): Promise<GuildChannel> {
    const channel: GuildChannel = guild.channels.cache.get(channelID) as GuildChannel;
    await channel.setName(channelName);
    
    if (channelTopic) {
        return (channel as TextChannel).setTopic(channelTopic);
    }

    return channel;
}

/**
 * Quick way to make embeds.
 * @param description description of the embed
 * @returns EmbedBuilder
 */
export function createEmbed(...description: string[]): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(0xCB251B)
        .setThumbnail('https://content.uiowa.edu/sites/content.uiowa.edu/files/apex-legends-logo-ftr_175s2k8gp3yw7106ov4jxxiadi.png')
        .setTitle(':fire: :fire: :fire:     **__Apex Tournament__**     :fire: :fire: :fire:')
        .setDescription('???\n' + description.join('???\n'))
}

/**
 * Send an embed to a text channel.
 * @param channel text channel to send to
 * @param args string arguments to send
 */
export function sendToChannel(channel: TextChannel, ...args: string[]) {
    channel.send({
        embeds: [createEmbed(...args)]
    }).catch(err => {
        console.log(err);
    })
}

/**
 * Send an embed to a text channel.
 * @param channel text channel to send to
 * @param embed embed to send to the text channel
 */
export function sendEmbedToChannel(channel: TextChannel, embed: EmbedBuilder) {
    channel.send({
        embeds: [embed]
    }).catch(err => {
        console.log(err);
    })
}

/**
 * Moves users to a channel.
 * Won't do anything if the user is not in a voice channel.
 * 
 * @param channel voice channel to send the users to
 * @param discordIDs discord IDs to send to the channel
 */
 export function moveUsersToChannel(channel: VoiceChannel, ...discordIDs: string[]) {
    const cache = channel.guild.members.cache;
    for (const discordID of discordIDs) {
        cache.get(discordID).voice.setChannel(channel).catch(err => {
            console.log(err);
        })
    }
}