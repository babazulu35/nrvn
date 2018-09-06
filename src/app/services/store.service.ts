import { Installments } from './../models/installments';
import { Group } from './../models/group';
import { Role } from './../models/role';
import {Injectable} from "@angular/core";
import {Event} from "../models/event";
import {Performer} from "../models/performer";
import {Performance} from "../models/performance";
import {Venue} from "../models/venue";
import {Product} from "../models/product";
import {Price} from "../models/price";
import {Template} from "../models/template";
import {PerformancePerformer} from '../models/performance-performer';
import {Town} from "../models/town";
import {City} from "../models/city";
import {Firm} from "../models/firm";
import {Print} from "../models/print";
import {EntityFirm} from "../models/entity-firm";
import { Attribute } from "../models/attribute";
import { AttributeType } from "../models/attribute-type";
import { EntityAttribute } from "../models/entity-attribute";
import { EntityType } from "../models/entity-type";
import { MenuItem } from "../models/menu-item";
@Injectable()
export class StoreService {
	private EEvent : Array<Event> = [];
	private EPerformer : Array<Performer> = [];
	private EPerformance : Array<Performance> = [];
	private VVenue : Array<Venue> = [];
	private PProduct : Array<Product> = [];
	private PPrice : Array<Price> = [];
	private VTemplate : Array<Template> = [];
	private EPerformancePerformer: Array<PerformancePerformer>=[];
	private LTown: Array<Town>=[];
	private LCity: Array<City>=[];
	private FFirm: Array<Firm>=[];
	private FEntityFirm: Array<EntityFirm>=[];
	private AAttribute:Array<Attribute>=[];
	private AAttributeType:Array<AttributeType>=[];
	private AEntityAttribute:Array<EntityAttribute>=[];
	private AEntityType:Array<EntityType>=[];
	private SMenuItem:Array<MenuItem>=[];
	private CmsContentType : Array<any> = [];
	private Print: Array<any> = [];
	private EVenueSeat: Array<any> = [];
	private Role: Array<any> = [];
	private VHall: Array<any> = [];
	private Group: Array<any> = [];
	private UserGroup: Array<any> = [];
	private RoleGroup: Array<any> = [];
	private Transaction: Array<any> = [];

  	constructor () {
  	}
  	/* If has object, update. Otherwise, push */
  	push( model : string, object : any){
		if(this[model]) {
			let hasObject = this[model].find( item => {
				return object == item;
			});
  
			if(hasObject){
				hasObject = object;
			}else{
				this[model].push(object);
			}
		}
  	}
  	private hasRecord(model : string, object : any){

  	}
  	getData(model : string){
  		return this[model];
  	}
  	getRecord(model : string, record){

  	}


}
