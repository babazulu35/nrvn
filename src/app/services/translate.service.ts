import { Injectable, Inject} from '@angular/core';
import { I18NHtmlParser, HtmlParser } from '@angular/compiler';
import { TRANSLATION_TR } from "../../i18n/messages.tr";

@Injectable()
export class TranslateService {
  	private source: string;
    private translations: Object = {};

    constructor(
    ) {
        this.source = TRANSLATION_TR;
        let parser = new I18NHtmlParser(new HtmlParser(), this.source),
        	tree = parser.parse(this.source,''),
        	trans = tree.rootNodes[1]["children"][1]["children"][1]["children"],
        	elements = trans.filter(node =>{
        		return node.constructor.name === 'Element';
        	});
        for (let i in elements) {
        	let el = elements[i],
        		original = el["children"][2]["value"],
        		translated = el["children"][4]["children"][0]["value"],
        		key = el["children"][6]["children"][0]["value"];
        	this.translations[key] = {'original':original,'translated':translated};
        }
    }

    get(key: string) {
    	return (this.translations[key]["translated"]) ? this.translations[key]["translated"] : 'Translation error for:' + key;
    }
}
