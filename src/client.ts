import { Client, WebhookClient } from "discord.js-selfbot-v13";
import {
  getChannelConfig,
  parseEmbedsToCustom,
  replaceRoles,
} from "./utils/parse.js";

const client = new Client();

client.on("ready", async (client) => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", async (message) => {
  try {
    const channelConfig = getChannelConfig(message);

    if (!channelConfig) return;

    const customEmbeds = parseEmbedsToCustom(message.client, message.embeds);
    const parsedContent = replaceRoles(message);

    const webhook = new WebhookClient({ url: channelConfig.webhookURL });

    await webhook.send({
      embeds: customEmbeds,
      content: parsedContent || null,
    });
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.TOKEN);
