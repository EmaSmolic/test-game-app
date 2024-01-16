import { RCA, Environment } from "../Classes"

//extend Game
export class DemoGame extends RCA {
    public checkStartCondition(gamePackContext: Environment): Boolean {
      return false
    }
    public acceptNewController(gamePackContext: Environment): Boolean {
     return false
    }
   
  
  }
