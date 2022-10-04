import { Guild, ChannelType, GuildChannel } from 'discord.js';

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
    return await channel.setParent(categoryID);
}