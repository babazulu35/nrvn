import { MulitplePerformanceService } from './../mulitple-performance.service';
export class BaseFactory {
    multiplePerformanceService: MulitplePerformanceService;

    constructor(multiplePerformanceService: MulitplePerformanceService, edata?:any){
        this.multiplePerformanceService = multiplePerformanceService;
    }

    set(key: string, value: any, hasLocalization?:boolean) {
        if(!this["model"]) return;
        this["model"].set(key, value, hasLocalization, false);
    }

    get(key: string, hasLocalization?:boolean) {
        if(!this["model"]) return;
        return this["model"].get(key, hasLocalization);
    }
}