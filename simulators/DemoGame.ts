import { Game, GamePack } from "../Classes"

//extend Game
export class DemoGame extends Game {
    public checkStartCondition(gamePackContext: GamePack): Boolean {
      if (gamePackContext.getControllers.length == 2) return true
      return false
    }
    public acceptNewController(gamePackContext: GamePack): Boolean {
      if (gamePackContext.getControllers.length >= 2) return false
      return true
    }
    public generateTid(gamePackContext: GamePack): string {
      var ctrlrTid = ''
      do { ctrlrTid = String(Math.floor(Math.random() * 1000)); } while (!gamePackContext.getControllers().find(ctrlr => ctrlr.tid == ctrlrTid))
      return String(ctrlrTid)
    }
  
  }
