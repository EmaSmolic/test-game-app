import { Controller, Environment } from "../Classes"

//extend Controller
export class DemoController extends Controller {
    public onMessageReceived(message: any): void {
        console.log('MESSAGE', message)
    }
}