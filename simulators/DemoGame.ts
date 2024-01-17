import { RCA, Environment } from "../Classes"

//extend RCA
export class DemoGame extends RCA {
    public onAction(source_temp_id: string, action_info: any): void {
      console.log('ACTION', source_temp_id, action_info)
    }
    public generateTempId(): string {
      return 'generic_ctrlr'
    }
    public checkStartCondition(gamePackContext: Environment): Boolean {
      return false
    }
    public acceptNewController(): Boolean {
     return true
    }

  }
