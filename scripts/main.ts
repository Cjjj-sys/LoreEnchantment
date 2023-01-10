import {
  Block,
  BlockSignComponent,
  BlockType,
  EffectType,
  EntityInventoryComponent,
  MinecraftBlockTypes,
  MinecraftEffectTypes,
  Player,
  world,
} from "@minecraft/server";

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

world.events.beforeItemUse.subscribe(async (e) => {
  e.item.setLore(["§r§l§6攻击力 +7", "§r§l§2毒液附加"]);
});

world.events.entityHurt.subscribe(async (e) => {
  let player = e.damagingEntity as Player;
  if (player.name != undefined) {
    let container = (player.getComponent("inventory") as EntityInventoryComponent).container;
    let lores = container.getItem(player.selectedSlot).getLore();
    for (const lore of lores) {
      let name = lore.split(" ")[0];
      let value = parseInt(lore.split(" ")[1]);
      switch (name) {
        case "§r§l§6攻击力":
          e.hurtEntity.addTag("beAttacked_TempTag");
          let result = await player.runCommandAsync(
            `damage @e[tag=beAttacked_TempTag] ${value} entity_attack entity ${player.name}`
          );
        case "§r§l§2毒液附加":
          e.hurtEntity.addEffect(MinecraftEffectTypes.poison, secToTick(10), 1);
          break;

        default:
          break;
      }
    }
  }
});
