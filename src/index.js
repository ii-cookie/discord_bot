import dotenv from 'dotenv';
import { Client, GatewayIntentBits, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';

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

    for(let i = 0; i < keywords.length; i++){
        for(let j = 0; j < keywords[i].length; j++){
            if (message_content.indexOf(keywords[i][j]) !== -1){    //detected the keyword
                return keywords[i][0];
            }
        }
    }
    return -1;  //unable to find any keyword
}
//function to determine whether it is refering to the past or future
function detect_timeframe_keywords(message_content){
    const keywords = [
        ["future", "later"],
        ["past", "ago"]
    ];

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

    // Ignore bot messages from this point onwards
    if (message.author.bot) {
        return; 
    }

    //simple testing
    if (message.content === 'ping') {
        message.reply('pong');
    }


    //unix timestamp code
    //since -1 and false is different thing, need to do the !== -1
    if ((detect_time_keywords(message.content) !== -1)&&(detect_timeframe_keywords(message.content) !== -1)){
        const number_match = message.content.match(/\d+/); //trying to find a number in the content
        if (number_match){
            var number = parseInt(number_match[0], 10);   //extract the number (the first sequence only, but ig it works)

            //convert the time to milliseconds based on the time keywords
            const time_keyword = detect_time_keywords(message.content);
            const timeframe_keyword = detect_timeframe_keywords(message.content);
            var offset = 0;
            if (time_keyword === "second"){
                offset = number;
            }
            if (time_keyword === "minute"){
                offset = number*60;
            }
            if (time_keyword === "hour"){
                offset = number*60*60;
            }
            if (time_keyword === "day"){
                offset = number*60*60*24;
            }
            if (time_keyword === "week"){
                offset = number*60*60*24*7;
            }
            if (time_keyword === "month"){
                offset = number*60*60*24*365.25/12;
            }
            if (time_keyword === "year"){
                offset = number*60*60*24*365.25;
            }

            //calculate the target unix timestamp
            var target_unix_timestamp = 0;
            if(timeframe_keyword === "past"){
                target_unix_timestamp = Math.round(Date.now()/1000) - offset;
            }
            if(timeframe_keyword === "future"){
                target_unix_timestamp = Math.round(Date.now()/1000) + offset;
            }

            //send the timestamp to the channel
            message.channel.send(`<t:${target_unix_timestamp}>`);
        }
    }

    //osu timestamp code


    
});


//instagram link convert
client.on('messageCreate', async (message) => {
    try {
        // Instagram link regex pattern
        const instagramUrlPattern = /(https?:\/\/(?:www\.)?instagram\.com\/[^\s]+)/g;
        const instagram_url = message.content.match(instagramUrlPattern);

        if (instagram_url) {  // Check if there is an Instagram URL
            const originalUrl = instagram_url[0];
            console.log(`Original URL: ${originalUrl}`);

            // Convert to ddinstagram
            let converted_instagram_link = "https://www.ddinstagram.com/";
            const urlPart = originalUrl.split('instagram.com/')[1];
            converted_instagram_link += urlPart;

            // // Send the converted link
            // await message.channel.send(converted_instagram_link);

            // Check if webhook already exists
            let instagram_sender_webhook = await message.channel.fetchWebhooks();
            const existingWebhook = instagram_sender_webhook.find(wh => wh.name === 'ddinstagram webhook');

            //check if webhook alr exist
            if (!existingWebhook) {
                // Create a new webhook if it doesn't exist
                instagram_sender_webhook = await message.channel.createWebhook({
                    name: 'ddinstagram webhook', // Ensure name is set correctly
                    avatar: message.author.displayAvatarURL(), // Optionally add an avatar
                });
            } else {
                instagram_sender_webhook = existingWebhook;
            }

            // Create buttons for clicking the original link and deleting the message
            const instagram_url_button = new ButtonBuilder()
                .setLabel('Original Link')
                .setStyle(ButtonStyle.Link)
                .setURL(originalUrl); // Link button shouldn't have a customId

            const delete_instagram_url_button = new ButtonBuilder()
                .setCustomId('delete_instagram_url_button') // This button can have a customId
                .setLabel('Delete Message')
                .setStyle(ButtonStyle.Danger);

            // Create the action row to hold the buttons 
            const row = new ActionRowBuilder().addComponents(instagram_url_button, delete_instagram_url_button);

            //send the link using webhook
            await instagram_sender_webhook.send({
                username: message.author.username,
                avatarURL: message.author.displayAvatarURL(),
                content: converted_instagram_link,
                components: [row]
            });
        }
    } catch (error) {
        console.error('Error occurred:', error);
        await message.channel.send('An error occurred while processing your request: ' + error.message);
    }
});

//handle button interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) {
        return;
    }
    if (interaction.customId === 'delete_instagram_url_button') {
        await interaction.reply('deleting is wip');
    }
});

// Log in to Discord with your bot token
client.login(process.env.TOKEN);
