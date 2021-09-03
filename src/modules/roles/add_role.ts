import { Command } from "../../models/Command";

const COMMAND = "add-role"

export const addRole: Command = {
    name: COMMAND,
    format: `${COMMAND} <@user> <role-name>`,
    description: "Voegt de betreffende rol toe aan de aangegeven gebruiker.",
    execute(message, args) {
        const specifiedMember = message.mentions.members?.first();
        const specifiedRole = args.slice(1);
        const rol_str = specifiedRole.join(" ");
        const role = message.guild?.roles.cache.find((r) => r.name === rol_str);
 
        if (!specifiedMember) {
            message.channel.send("Er zijn geen members getagged.");
            return;
        }

        if (!role) {
            message.channel.send(
                `De role ${rol_str} die je wilt toewijzen bestaat niet`
            );
            return;
        } else {
            if (
                rol_str === "Admin" ||
                rol_str === "Mod" ||
                rol_str == "Battie"
            ) {
                message.channel.send(`Dat gaan we dus niet doen...`);
            } else {
                if (specifiedMember.roles.cache.some((r) => r.name === role.name)) {
                    message.channel.send(`Je hebt de role ${rol_str} al`);
                } else {
                    message.channel.send(
                        `Als het goed is heb je de role ${rol_str} nu`
                    );
                    specifiedMember.roles.add(role);
                }
            }
        }
    },
};
