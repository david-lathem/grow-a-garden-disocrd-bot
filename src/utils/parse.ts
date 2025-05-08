import {
  Client,
  EmbedField,
  Message,
  MessageEmbed,
} from "discord.js-selfbot-v13";
import config from "./../../config.json" with { type: "json" };

export const getChannelConfig = (message: Message) => {
  const channelConfig = config.channels.find(
    (c) => c.sourceChannelId === message.channelId
  );

  if (!channelConfig) return;

  if (
    channelConfig.allowedUserIds &&
    !channelConfig.allowedUserIds.includes(message.author.id)
  )
    return;

  if (channelConfig.rolePingOnly) {
    if (!message.mentions.roles.size) return;

    message.content = [...message.mentions.roles.keys()]
      .map((rId) => `<@&${rId}>`)
      .join(" ");
  }
  if (channelConfig.noEmbed) message.embeds = [];

  return channelConfig;
};

export const parseEmbedsToCustom = (
  client: Client,
  embeds: MessageEmbed[]
): MessageEmbed[] => {
  const customEmbeds: MessageEmbed[] = [];

  const guild = client.guilds.cache.get(process.env.GUILD_ID);

  const iconURL = guild?.iconURL();

  for (const e of embeds) {
    const customEmbed = new MessageEmbed()
      .setFooter({
        text: `${guild?.name}`,
        iconURL: iconURL ?? undefined,
      })
      .setColor("YELLOW");

    e.title && customEmbed.setTitle(e.title);

    e.description && customEmbed.setDescription(e.description);

    const filteredFields: EmbedField[] = [];

    // first field has all data

    const targetField = e.fields[0];

    if (targetField) {
      
      targetField.value.split("\n").forEach((itemData) => {
        const [amount, name] = itemData.split("-");
        
        filteredFields.push({ name, value: `\`${amount.trim()}\``, inline: true });
      });
      
      customEmbed.setFields(filteredFields);
    }

    customEmbeds.push(customEmbed);
  }

  return customEmbeds;
};

export const replaceRoles = (message: Message): string => {
  let content = message.content;

  for (const roleMentionId of message.mentions.roles.keys()) {
    if (!Object.keys(config.roles).includes(roleMentionId))
      content = content.replaceAll(`<@&${roleMentionId}>`, "");
  }

  for (const [roleId, metaData] of Object.entries(config.roles)) {
    content = content.replaceAll(roleId, metaData.destinationRoleId);
  }
  return content;
};
