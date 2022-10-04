# Apex Tournaments (through Discord!)

Host your very own Apex tournaments with your friends through Discord!  
Initialize a tournament channel, start a tournament, and have your Apex wins, kills, and damage tracked and ranked against each participant.

### Discord Commands
* /tournament init
    * Initializes the tournament channel and category.
    * Creates two Voice Channels for different teams.
    * Prevents people from talking in the tournament channel.
* /tournament create [time-to-start]
    * Allows players to opt-in (default=30sec).
    * Starts the tournament after time-to-start passes.
* /tournament start
    * Automatically starts the tournament if there is enough players <u>and</u> they are all in a VC.
    * Randomly splits the players in half until each team has 3 or less players.
    * Moves the players into the specified VC calls.
* /tournament stop
    * Stops the tournament and displays the rankings.
    * Top overall, wins, kills, and damage.
* /tournament current
    * Displays the current rankings based off the current games tracked.
* /tournament opt-in
    * Opts the player into a tournament.
    * Will only pass if they have Wins/Kills/Damage trackers on their current legend for <u>Arenas</u>.
* /tournament opt-out
    * Opts the player out of a tournament.
* /tournament list
    * Lists the players opted-in to the current tournament.
* /tournament pause
    * Pauses the tournament by ceasing tracking on players until it /tournament start is called again.