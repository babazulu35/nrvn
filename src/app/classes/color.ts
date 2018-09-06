import {colors} from '../dicts/colors';

export class Color {

    hexRegExp = /^((0x){0,1}|#{0,1})([0-9A-F]{8}|[0-9A-F]{6})$/;

    private name: string;
    private hex: string;
    private rgb: {r: number, g: number, b: number};
    private isLight: boolean;

    get Hex(): string {
        return this.hex;
    }

    get Rgb(): {r: number, g: number, b: number} {
        return this.rgb;
    }

    get Name(): string {
        return this.name;
    }

    get IsLight(): boolean {
        return this.isLight;
    }

    // constructor(private name) {
    //     this.hex = colors[this.name] || '';
    //     this.rgb = this.getRgb(this.hex);
    //     this.isLight = this.isColorLight(this.rgb);
    // }

    constructor(value: any) {
        if (typeof value === 'string') {
            if (this.hexRegExp.test(value)) {
                this.name = this.getNameFromHex(value);
                this.hex = value;
            } else {
                this.name = value;
                this.hex = colors[this.name] || '';
            }
        }
        this.rgb = this.getRgb(this.hex);
        this.isLight = this.isColorLight(this.rgb);
    }



    private getRgb(hexStr: string): {r: number, g: number, b: number} {
        if (!hexStr || hexStr.length === 0) return null;
        let hexNum = hexStr.slice(1);
        let bigint = parseInt(hexNum, 16);
        let r = (bigint >> 16) & 255;
        let g = (bigint >> 8) & 255;
        let b = bigint & 255;
        return {r: r, g: g, b: b};
    }

    private isColorLight(rgb: {r: number, g: number, b: number}): boolean  {
        if (!rgb) return false;
        let a = 1 - (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        return (a < 0.5);
    }

    getNameFromHex(hex: string) {
        for (let h in colors) {
            if (colors.hasOwnProperty(h) ) {
                if (colors[ h ] === hex) return h;
            }
        }
    }


}
