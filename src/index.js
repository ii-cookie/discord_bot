import dotenv from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';

// Load environment variables from .env file
dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

//function to find the target unix timestamp
function timestamp(offset){
    return Date.now() + offset
}
//function to find time keywords(seconds/minutes/hours) from a message content
function detect_time_keywords(message_content){
    const keywords = [
        ["second", "seconds", "sec"],
        ["minute", "minutes", "min", "mins"],
        ["hour", "hours", "hr"],
        ["day", "days"],
        ["week", "weeks"],
        ["month", "months"],
        ["year", "years"]
    ];
    // message_content.indexOf(subarray) //-1 for false

    for(let i = 0; i < keywords.length; i++){
        for(let j = 0; j < keywords[i].length; j++){
            if (message_content.indexOf(keywords[i][j]) !== -1){    //detected the keyword
                return keywords[i][0];
            }
        }
    }
    return -1;  //unable to find any keyword
}


// Event listener for when the bot is ready
client.on('ready', (c) => {
    console.log(`${c.user.tag} is online`);
});

// Event listener for new messages
client.on('messageCreate', (message) => {
    console.log(`${message.author.tag}: ${message.content}`);
    // Ignore bot messages
    if (message.author.bot) {
        return; 
    }
    //simple testing
    if (message.content === 'ping') {
        message.reply('pong');
    }

    if (detect_time_keywords(message.content)){

    }
});

// Log in to Discord with your bot token
client.login(process.env.TOKEN);