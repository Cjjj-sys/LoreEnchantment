import {
  Block,
  BlockSignComponent,
  BlockType,
  EffectType,
  EntityHealthComponent,
  EntityInventoryComponent,
  ItemCompleteChargeEvent,
  ItemStack,
  MinecraftBlockTypes,
  MinecraftEffectTypes,
  MinecraftItemTypes,
  Player,
  world,
} from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";

function getPlayerByName(playerName: string): Player | undefined {
  let players = Array.from(world.getPlayers());
  for (const player of players) {
    if (player.name == playerName) {
      return player;
    }
  }
  return undefined;
}

function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

function secToTick(sec: number): number {
  return sec / 0.05;
}

function isUndeadMob(typeId: string): boolean {
  let undeadMobs = [
    "minecraft:skeleton",
    "minecraft:stray",
    "minecraft:zombie",
    "minecraft:husk",
    "minecraft:zombified_piglin",
    "minecraft:zombie_villager",
    "minecraft:drowned",
    "minecraft:zoglin",
    "minecraft:skeleton_horse",
    "minecraft:phantom",
  ];
  for (const undeadMob of undeadMobs) {
    if (typeId == undeadMob) {
      return true;
    }
  }
  return false;
}

// world.events.blockBreak.subscribe(async (e) => {
//   let location = e.block.location;
//   let item = new ItemStack(MinecraftItemTypes.enchantedBook);
//   item.setLore(["§r§l§6力量附加 3"]);
//   e.player.dimension.spawnItem(item, location);
//   item.setLore(["§r§l§6力量附加 2"]);
//   e.player.dimension.spawnItem(item, location);
//   item.setLore(["§r§l§6力量附加 1"]);
//   e.player.dimension.spawnItem(item, location);
//   item.setLore(["§r§l§8凋零附加"]);
//   e.player.dimension.spawnItem(item, location);
// });

world.events.entityHurt.subscribe(async (e) => {
  let hp = (e.hurtEntity.getComponent("health") as EntityHealthComponent).current;
  if (hp - e.damage <= 0) {
    if (e.hurtEntity.typeId == "minecraft:wither_skeleton") {
      let randomNum = getRandom(1, 100);
      if (randomNum <= 5) {
        let item = new ItemStack(MinecraftItemTypes.enchantedBook);
        item.setLore(["§r§l§8凋零附加"]);
        item.nameTag = "魔咒书(§r§l§8凋零附加)";
        e.hurtEntity.dimension.spawnItem(item, e.hurtEntity.headLocation);
      }
    } else if (isUndeadMob(e.hurtEntity.typeId)) {
      let randomNum = getRandom(1, 100);
      if (randomNum <= 5) {
        let damage = 0;
        let randomDamageNum = getRandom(1, 100);
        if (randomDamageNum <= 50) {
          damage = 1;
        } else if (randomDamageNum <= 90) {
          damage = 2;
        } else if (randomDamageNum <= 100) {
          damage = 3;
        }
        let item = new ItemStack(MinecraftItemTypes.enchantedBook);
        item.setLore([`§r§l§6力量附加 ${damage}`]);
        item.nameTag = `魔咒书(§r§l§6力量附加 ${damage})`;
        e.hurtEntity.dimension.spawnItem(item, e.hurtEntity.headLocation);
      }
    }
  }
});

world.events.beforeItemUse.subscribe(async (e) => {
  try {
    if (e.item != undefined) {
      if (e.item.typeId == "minecraft:enchanted_book") {
        if (e.item.getLore().length != 0) {
          let lore = e.item.getLore()[e.item.getLore().length - 1];
          let loreName = lore.split(" ")[0];
          let loreValue = parseInt(lore.split(" ")[1]);
          let form = new ActionFormData();
          form.title("请选择物品").body(`魔咒效果为: ${lore}\n目前只能附加在剑上`);
          let player = e.source as Player;
          let container = (player.getComponent("inventory") as EntityInventoryComponent).container;
          let btnDict: Map<number, number> = new Map<number, number>();
          let j = 0;
          for (let i = 0; i < container.size; i++) {
            let item = container.getItem(i);
            if (item != undefined) {
              if (item.typeId.endsWith("sword")) {
                btnDict.set(j, i);
                j++;
                form.button(
                  `${i}: ${item.nameTag == undefined ? "" : item.nameTag}[${item.typeId}](${item.getLore()})`
                );
              }
            }
          }
          let result = (await form.show(player as any)).selection;
          if (result != undefined) {
            let soltId = btnDict.get(result);
            if (soltId != undefined) {
              let toApplyitem = container.getItem(soltId);
              if (toApplyitem.getLore().length != 0) {
                let toCheckLores = toApplyitem.getLore();
                for (let i = 0; i < toCheckLores.length; i++) {
                  let toCheckLore = toCheckLores[i];
                  let toCheckLoreName = toCheckLore.split(" ")[0];
                  let toCheckLoreValue = parseInt(toCheckLore.split(" ")[1]);
                  if (toCheckLoreName == loreName) {
                    if (loreName == "§r§l§6力量附加") {
                      if (loreValue <= toCheckLoreValue) {
                        let messageBox = new MessageFormData();
                        messageBox
                          .button1("好的")
                          .button2("没其他选择了")
                          .title("附加失败")
                          .body("你已经附加了等级相同或更高的咒语，无法重复附加！")
                          .show(player as any);
                        return;
                      } else {
                        let updateLores = toApplyitem.getLore();
                        world.say(updateLores.toString());
                        if (updateLores.length == 1) {
                          updateLores = [""];
                          world.say(updateLores.toString());
                        } else {
                          updateLores.splice(i, 1);
                        }

                        toApplyitem.setLore(updateLores);
                        world.say(toApplyitem.getLore().toString());
                      }
                    } else {
                      let messageBox = new MessageFormData();
                      messageBox
                        .button1("好的")
                        .button2("没其他选择了")
                        .title("附加失败")
                        .body("你已经附加了相同的咒语，无法重复附加！")
                        .show(player as any);
                      return;
                    }
                  }
                }
              }
              //world.say(lore);
              let messageBox = new MessageFormData();
              world.say(toApplyitem.getLore().toString());
              if (toApplyitem.getLore()[0] == "") {
                toApplyitem.setLore([lore]);
              } else {
                toApplyitem.setLore(toApplyitem.getLore().concat([lore]));
              }
              world.say(toApplyitem.getLore().toString());
              container.setItem(soltId, toApplyitem);
              container.setItem(player.selectedSlot, new ItemStack(MinecraftItemTypes.book));
              messageBox
                .button1("好的")
                .button2("没其他选择了")
                .title("附加成功")
                .body("恭喜你，成功附加魔咒！")
                .show(player as any);
            }
          }
        }
      }
    }
  } catch (error) {
    //world.say(`${error}`);
  }
});

world.events.entityHit.subscribe(async (e) => {
  try {
    if (e.hitEntity != undefined) {
      let player = e.entity as Player;
      if (player.name != undefined) {
        let tempTag = `beAttacked_${player.name}`;
        let container = (player.getComponent("inventory") as EntityInventoryComponent).container;
        let lores = container.getItem(player.selectedSlot).getLore();
        e.hitEntity.addTag(tempTag);
        for (const lore of lores) {
          let name = lore.split(" ")[0];
          let value = parseInt(lore.split(" ")[1]);
          switch (name) {
            case "§r§l§6力量附加":
              await player.runCommandAsync(`effect ${player.name} strength 5 ${value}`);
              break;
            case "§r§l§8凋零附加":
              await player.runCommandAsync(`effect @e[tag=${tempTag}] wither 7 1`);
              break;

            default:
              break;
          }
        }
        await player.runCommandAsync(`tag @e[tag=${tempTag}] remove ${tempTag}`);
      }
    }
  } catch (error) {
    //world.say(`${error}`);
  }
});
