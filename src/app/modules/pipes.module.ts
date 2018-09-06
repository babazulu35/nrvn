import { LocalizationPipe } from './../pipes/localization.pipe';
import { ObjectPipe } from './../pipes/object.pipe';
import { PhoneFormatPipe } from './../pipes/phone-format.pipe';
import { VenueObjectMatcherPipe } from './../pipes/venue-object-matcher.pipe';
import { RelativeDatePipe } from './../pipes/relative-date.pipe';
import { GetIconPipe } from './../pipes/get-icon.pipe';
import { EnumTranslatorPipe } from './../pipes/enum-translator.pipe';
import { SanitizeHtmlPipe } from './../pipes/sanitize-html.pipe';
import { KeysPipe } from './../pipes/keys.pipe';
import { LogPipe } from './../pipes/log.pipe';
import { VenuesByPerformancesPipe } from './../pipes/venues-by-performances.pipe';
import { MdParserPipe } from './../pipes/md-parser.pipe';
import { EventDatesByPerformancesPipe } from './../pipes/event-dates-by-performances.pipe';
import { ConcatPipe } from './../pipes/concat.pipe';
import { MaskStringPipe } from './../pipes/mask-string.pipe';
import { ImagePipe } from './../pipes/image.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalculateAgePipe } from "../pipes/calculate-age.pipe";
import { LinkyPipe } from '../pipes/linky.pipe';
import { EllipsisPipe } from '../pipes/ellipsis.pipe';


@NgModule({
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, RouterModule,
    
  ],
  declarations: [
    ImagePipe,
    PhoneFormatPipe,
    VenueObjectMatcherPipe,
    RelativeDatePipe,
    GetIconPipe,
    EnumTranslatorPipe,
    SanitizeHtmlPipe,
    KeysPipe,
    LogPipe,
    ObjectPipe,
    VenuesByPerformancesPipe,
    MdParserPipe,
    EventDatesByPerformancesPipe,
    ConcatPipe,
    MaskStringPipe,
    CalculateAgePipe,
    LocalizationPipe,
    LinkyPipe,
    EllipsisPipe
  ],
  exports: [
    ImagePipe,
    PhoneFormatPipe,
    VenueObjectMatcherPipe,
    VenueObjectMatcherPipe,
    RelativeDatePipe,
    GetIconPipe,
    EnumTranslatorPipe,
    SanitizeHtmlPipe,
    KeysPipe,
    LogPipe,
    ObjectPipe,
    VenuesByPerformancesPipe,
    MdParserPipe,
    EventDatesByPerformancesPipe,
    ConcatPipe,
    MaskStringPipe,
    CalculateAgePipe,
    LocalizationPipe,
    EllipsisPipe
  ]
})
export class PipesModule { }
