"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const packetids_1 = require("bdsx/bds/packetids");
const packets_1 = require("bdsx/bds/packets");
const common_1 = require("bdsx/common");
const event_1 = require("bdsx/event");
const launcher_1 = require("bdsx/launcher");
const utils_1 = require("./utils");
const command_1 = require("bdsx/command");
const command_2 = require("bdsx/bds/command");
const form_1 = require("bdsx/bds/form");
var TypeSleep;
(function (TypeSleep) {
    TypeSleep[TypeSleep["all"] = 0] = "all";
    TypeSleep[TypeSleep["half"] = 1] = "half";
    TypeSleep[TypeSleep["one"] = 2] = "one";
})(TypeSleep || (TypeSleep = {}));
const sleeping = (0, utils_1.Json)((0, utils_1.LoadFile)(utils_1.FolderType.plugin, "", "sleeping", "json", `{
    "enabled": true,
    "type": ${TypeSleep.half}
}`));
const isSleeping = {
    run: false,
    time: 0
};
const players = new Map();
var SendType;
(function (SendType) {
    SendType[SendType["Actionbar"] = 0] = "Actionbar";
    SendType[SendType["ArmorSlot"] = 1] = "ArmorSlot";
    SendType[SendType["Chat"] = 2] = "Chat";
    SendType[SendType["Inventory"] = 3] = "Inventory";
    SendType[SendType["JukeboxPopup"] = 4] = "JukeboxPopup";
    SendType[SendType["Message"] = 5] = "Message";
    SendType[SendType["NetworkPacket"] = 6] = "NetworkPacket";
    SendType[SendType["Packet"] = 7] = "Packet";
    SendType[SendType["Popup"] = 8] = "Popup";
    SendType[SendType["TextObject"] = 9] = "TextObject";
    SendType[SendType["Tip"] = 10] = "Tip";
    SendType[SendType["ToastRequest"] = 11] = "ToastRequest";
    SendType[SendType["TranslatedMessage"] = 12] = "TranslatedMessage";
    SendType[SendType["Whisper"] = 13] = "Whisper";
    SendType[SendType["Title"] = 14] = "Title";
})(SendType || (SendType = {}));
function sendAll(type, data) {
    for (const player of launcher_1.bedrockServer.level.getPlayers()) {
        switch (type) {
            case SendType.Actionbar: {
                player.sendActionbar(data.message);
                break;
            }
            case SendType.ArmorSlot: {
                player.sendArmorSlot(data.armorSlot);
                break;
            }
            case SendType.Chat: {
                player.sendChat(data.message, data.author);
                break;
            }
            case SendType.Inventory: {
                player.sendInventory(data.should);
                break;
            }
            case SendType.JukeboxPopup: {
                player.sendJukeboxPopup(data.message, data.params);
                break;
            }
            case SendType.Message: {
                player.sendMessage(data.message);
                break;
            }
            case SendType.NetworkPacket: {
                player.sendNetworkPacket(data.packet);
                break;
            }
            case SendType.Packet: {
                player.sendPacket(data.packet);
                break;
            }
            case SendType.Popup: {
                player.sendPopup(data.message, data.params);
                break;
            }
            case SendType.TextObject: {
                player.sendTextObject(data.object);
                break;
            }
            case SendType.Tip: {
                player.sendTip(data.message, data.params);
                break;
            }
            case SendType.ToastRequest: {
                player.sendToastRequest(data.title, data.body);
                break;
            }
            case SendType.TranslatedMessage: {
                player.sendTranslatedMessage(data.message, data.params);
                break;
            }
            case SendType.Whisper: {
                player.sendWhisper(data.message, data.author);
                break;
            }
            case SendType.Title: {
                player.sendTitle(data.title, data.subtitle);
                break;
            }
        }
    }
}
event_1.events.packetSend(packetids_1.MinecraftPacketIds.Text).on((pkt, net) => {
    if (sleeping.enabled) {
        if (sleeping.type != TypeSleep.all) {
            switch (pkt.type) {
                case packets_1.TextPacket.Types.Translate: {
                    if (pkt.message == "chat.type.sleeping") {
                        return common_1.CANCEL;
                    }
                    break;
                }
            }
        }
    }
});
const thred = setInterval(() => {
    for (const xuid of players.keys()) {
        const player = launcher_1.bedrockServer.level.getPlayerByXuid(xuid);
        if (player) {
            if (!player.isSleeping()) {
                sendAll(SendType.Message, { message: `${player.getName()} woke up` });
                players.delete(xuid);
            }
        }
        else
            players.delete(xuid);
    }
    switch (sleeping.type) {
        case TypeSleep.half: {
            if (players.size > 0) {
                sendAll(SendType.Actionbar, { message: `To spend the night ${players.size}/${Math.floor(launcher_1.bedrockServer.level.getActivePlayerCount() / 2)} players` });
                if (players.size >= Math.floor(launcher_1.bedrockServer.level.getActivePlayerCount() / 2)) {
                    isSleeping.time++;
                }
                else
                    isSleeping.time = 0;
            }
            else
                isSleeping.time = 0;
            break;
        }
        case TypeSleep.one: {
            if (players.size > 0) {
                isSleeping.time++;
            }
            else
                isSleeping.time = 0;
            break;
        }
        case TypeSleep.all:
        default: {
            break;
        }
    }
    if (isSleeping.time >= 8) {
        players.clear();
        isSleeping.time = 0;
        launcher_1.bedrockServer.executeCommand(`time set day`, true);
        launcher_1.bedrockServer.executeCommand(`weather clear ${(0, utils_1.Random)(10000, 500000)}`, true);
        if ((0, utils_1.Random)(100) == (0 || 24 || 49 || 74 || 99))
            launcher_1.bedrockServer.executeCommand(`weather clear 0`, true);
    }
}, 1000);
event_1.events.playerSleepInBed.on(ev => {
    if (sleeping.enabled) {
        sendAll(SendType.Message, { message: `${ev.player.getName()} went to sleep` });
        players.set(ev.player.getXuid(), ev.player.getXuid());
    }
});
event_1.events.serverLeave.on(() => {
    clearInterval(thred);
});
function ReloadSettings() {
    const temp = (0, utils_1.Json)((0, utils_1.LoadFile)(utils_1.FolderType.plugin, "", "sleeping"));
    sleeping.enabled = temp.enabled;
    sleeping.type = temp.type;
}
command_1.command.register('sleeping', "Change sleep settings", command_2.CommandPermissionLevel.Operator).overload((param, origin, output) => {
    if (!origin.isServerCommandOrigin()) {
        const form = new form_1.CustomForm();
        form.setTitle(`Sleep settings`);
        form.addComponent(new form_1.FormToggle(`Enabled`, sleeping.enabled), `enabled`);
        form.addComponent(new form_1.FormDropdown(`Type`, ["All", "Half", "One"], sleeping.type), `type`);
        form.sendTo(origin.getEntity().getNetworkIdentifier(), (data, net) => {
            if (data.response) {
                sleeping.enabled = data.response.enabled;
                sleeping.type = data.response.type;
                (0, utils_1.SaveFile)(utils_1.FolderType.plugin, "", "sleeping", (0, utils_1.Json)(sleeping));
            }
        });
    }
    else {
        ReloadSettings();
        output.success(`Sleep settings loaded`);
    }
}, {});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2xlZXBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzbGVlcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLGtEQUF3RDtBQUN4RCw4Q0FBOEM7QUFDOUMsd0NBQXFDO0FBQ3JDLHNDQUFvQztBQUNwQyw0Q0FBOEM7QUFDOUMsbUNBQXVFO0FBQ3ZFLDBDQUF1QztBQUN2Qyw4Q0FBMEQ7QUFDMUQsd0NBQXFFO0FBRXJFLElBQUssU0FJSjtBQUpELFdBQUssU0FBUztJQUNWLHVDQUFHLENBQUE7SUFDSCx5Q0FBSSxDQUFBO0lBQ0osdUNBQUcsQ0FBQTtBQUNQLENBQUMsRUFKSSxTQUFTLEtBQVQsU0FBUyxRQUliO0FBRUQsTUFBTSxRQUFRLEdBQUcsSUFBQSxZQUFJLEVBQUMsSUFBQSxnQkFBUSxFQUFDLGtCQUFVLENBQUMsTUFBTSxFQUFDLEVBQUUsRUFBQyxVQUFVLEVBQUMsTUFBTSxFQUFDOztjQUV4RCxTQUFTLENBQUMsSUFBSTtFQUMxQixDQUFDLENBQUMsQ0FBQztBQUVMLE1BQU0sVUFBVSxHQUFHO0lBQ2YsR0FBRyxFQUFFLEtBQUs7SUFDVixJQUFJLEVBQUUsQ0FBQztDQUNWLENBQUE7QUFFRCxNQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsRUFBYyxDQUFDO0FBRXRDLElBQUssUUFnQko7QUFoQkQsV0FBSyxRQUFRO0lBQ1QsaURBQVMsQ0FBQTtJQUNULGlEQUFTLENBQUE7SUFDVCx1Q0FBSSxDQUFBO0lBQ0osaURBQVMsQ0FBQTtJQUNULHVEQUFZLENBQUE7SUFDWiw2Q0FBTyxDQUFBO0lBQ1AseURBQWEsQ0FBQTtJQUNiLDJDQUFNLENBQUE7SUFDTix5Q0FBSyxDQUFBO0lBQ0wsbURBQVUsQ0FBQTtJQUNWLHNDQUFHLENBQUE7SUFDSCx3REFBWSxDQUFBO0lBQ1osa0VBQWlCLENBQUE7SUFDakIsOENBQU8sQ0FBQTtJQUNQLDBDQUFLLENBQUE7QUFDVCxDQUFDLEVBaEJJLFFBQVEsS0FBUixRQUFRLFFBZ0JaO0FB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