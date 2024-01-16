import { RCA, Environment } from "../Classes"

//extend Game
export class DemoGame extends RCA {
    public checkStartCondition(gamePackContext: Environment): Boolean {
      if (gamePackContext.getControllers.length == 2) return true
      return false
    }
    public acceptNewController(gamePackContext: Environment): Boolean {
      if (gamePackContext.getControllers.length >= 2) return false
      return true
    }
   
  
  }
