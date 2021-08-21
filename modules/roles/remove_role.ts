import { Command } from "../../models/Command";

const COMMAND = "remove-role"

export const removeRole: Command = {
    name: COMMAND,
    format: `${COMMAND} <@user> <role-name>`,
    description: "Verwijderd de betreffende rol van de aangegeven gebruiker.",
    execute(message, args) {
        const specifiedMember = message.mentions.members?.first();
        const specifiedRole = args.slice(1);
        const rol_str = specifiedRole.join(" ");
        const role = message.guild?.roles.cache.find((r) => r.name === rol_str);

        if (!specifiedMember) {
            message.channel.send("Er zijn geen members getagged");
            return;
        }

        if (!role) {
            message.channel.send(
                `De rol ${rol_str} die je wilt verwijderen bestaat niet`
            );
            return;
        } else {
            if (
                rol_str === "Admin" ||
                rol_str === "Mod" ||
                rol_str === "Battie"
            ) {
                message.channel.send(`Dat gaan we dus niet doen...`);
            } else {
                if (specifiedMember.roles.cache.get(role.id)) {
                    message.channel.send(
                        `Als het goed is heb je de role ${rol_str} niet meer`
                    );
                    specifiedMember.roles.remove(role);
                } else {
                    message.channel.send(
                        `Als het goed is heb je de role ${specifiedRole} niet`
                    );
                }
            }
        }
    },
};
