import './polyfills.ts';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import {enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT, LOCALE_ID} from "@angular/core";
import { environment } from './environments/environment';
import { AppModule } from './app/';
import { TRANSLATION_TR } from "./i18n/messages.tr";
if (environment.production) {
  enableProdMode();
  window.console.log = function () { };
}

platformBrowserDynamic().bootstrapModule(
    AppModule,
    {
        providers: [
            {provide: TRANSLATIONS, useValue: TRANSLATION_TR},
            {provide: TRANSLATIONS_FORMAT, useValue: "xlf"},
            {provide: LOCALE_ID, useValue: "tr"}
        ]
    });