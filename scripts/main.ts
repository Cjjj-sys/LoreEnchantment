import { Block, BlockSignComponent, BlockType, MinecraftBlockTypes, Player, world } from "@minecraft/server";

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

// world.events.blockBreak.subscribe(async (e) => {
//   e.block.setType(MinecraftBlockTypes.chest);
// });

world.events.blockPlace.subscribe(async (e) => {
  let block = e.block;
  block.setType(
    MinecraftBlockTypes.getAllBlockTypes()[getRandom(0, MinecraftBlockTypes.getAllBlockTypes().length - 1)]
  );
});

world.events.blockBreak.subscribe(async (e) => {
  // let block = e.block;
  // block.setType(
  //   MinecraftBlockTypes.getAllBlockTypes()[getRandom(0, MinecraftBlockTypes.getAllBlockTypes().length - 1)]
  // );
  e.player.dimension.runCommandAsync(`scoreboard players add ${e.player.name} breakRank 1`);
});

world.events.blockExplode.subscribe(async (e) => {
  let block = e.block;
  block.setType(
    MinecraftBlockTypes.getAllBlockTypes()[getRandom(0, MinecraftBlockTypes.getAllBlockTypes().length - 1)]
  );
});
