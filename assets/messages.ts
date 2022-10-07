import { InteractionReplyOptions, MessagePayload } from "discord.js";

export default {
    initializeTournament: reply('Channel has been set as tournament channel.'),
    createTournamentResponse: reply('A tournament has officially been created.'),
    createTournamentSuccess: [
        '**An apex tournament has just been created.**',
        '**Join now or forever be blacklisted.**',
        '',
        ':regional_indicator_j::regional_indicator_o::regional_indicator_i::regional_indicator_n: :black_small_square: **/tournament opt-in**',
        ':regional_indicator_q::regional_indicator_u::regional_indicator_i::regional_indicator_t: :black_small_square: **/tournament opt-out**',
        ':regional_indicator_l::regional_indicator_i::regional_indicator_s::regional_indicator_t: :black_small_square: **/tournament list**',
        ':regional_indicator_i::regional_indicator_n::regional_indicator_f::regional_indicator_o: :black_small_square: **/tournament current**'
    ],
    createTournamentFailureNotInitialized: reply('**Error**: No tournament channel was found.'),
    createTournamentFailureAlreadyStarted: reply('**Error**: There is already a tournament ongoing.'),
    startTournamentSuccess: '**The tournament has officially begun!**',
    startTournamentForceStart: reply('The tournament has been forcefully started!'),
    startTournamentFailureNotEnoughPlayers: '**Error**: There needs to be at least 2 players to start a tournament.',
    startTournamentFailureNotAvailable: '**Error**: No tournaments are available to start.',
    startTournamentFailureAlreadyStarted: '**Error**: The tournament has already begun!',
    stopTournamentResponse: reply('Stopping the tournament...'),
    joinTournamentResponse: reply('Attempting to join the tournament. Please wait...'),
    joinTournamentFailureNotAvailable: reply('**Error**: There are no tournaments waiting for users to join.', false),
    joinTournamentFailureAlreadyJoined: reply('**Error**: It appears you are already opted in to the tournament.', false),
    joinTournamentFailureInvalidTrackers: reply('**Error**: Your current legend needs **3 Arena** __trackers__: **Wins**, **Kills**, **Damage**.', false),
    leaveTournamentResponse: reply('Attempting to leave the tournament. Please wait...'),
    leaveTournamentFailureNotAvailable: reply('**Error**: There are no tournaments active.'),
    leaveTournamentFailureNotJoined: reply('**Error**: It appears you have not yet joined the tournament.'),
    failureNotEligible: reply('**Error**: You are not eligible to participant in tournaments.'),
    failureDirectMessagesDisabled: '%username% has Direct Messages disabled!',
};

/**
 * Create a reply message.
 * @param message message to send
 * @param ephemeral whether the message should only be sent to the client
 * @param args any additional arguments
 * @returns formatted reply
 */
function reply(message: string, ephemeral: boolean = true, args: object = {}): object {
    const reply: string | InteractionReplyOptions | MessagePayload = {};
    reply.content = message;

    if (ephemeral) {
        reply.ephemeral = true;
    }

    for (const key in args) {
        reply[key] = args[key];
    }

    return reply;
}