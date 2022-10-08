# Apex Tournaments (through Discord!)
**Note: This project is not for public use yet due to API restraints.**

Host your very own Apex tournaments with your friends through Discord!  
Start a tournament and have your Apex stats tracked and ranked against each participant.

## Features
- Once a tournament has started, rankings will auto-update as games are finished.
- Ability to easily split teams if you have more than 3 players in a tournament.
- Rankings are based off a point system specified below.

## Rankings
Apex tournaments are ranked based off points:
- 3 points for each win.
- 1 point for each kill.
- 1 point for every 225 damage.

## Discord Commands
* /tournament init
    * Initializes the tournament channel.
    * Creates **2** Voice Channels for different teams.
    * Prevents people from talking in the tournament channel.
* /tournament create [time]
    * Allows players to opt-in (default=30sec).
    * Starts the tournament after time (seconds) passes.
* /tournament start
    * Automatically starts the tournament if there is enough players.
    * Starting a tournament begins tracking on all participants.
* /tournament stop
    * Stops the tournament and displays the rankings.
    * Rankings are based off total points (see above).
* /tournament current
    * Displays the current rankings based off the current games tracked.
* /tournament opt-in
    * Opts the player into a tournament.
    * Will only pass if they have Wins/Kills/Damage trackers on their current legend for **Arenas**.
* /tournament opt-out
    * Opts the player out of a tournament.
* /tournament list
    * Lists the players opted-in to the current tournament.
* /tournament split
    * Randomly splits the players in half until each team has 3 or less players.
    * Moves the players into the specified VC calls.

## Photos
![Main Announcement](/assets/Main.png)
![Final Rankings](/assets/Rankings.png)
