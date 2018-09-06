import { Installments } from './../models/installments';
import { RoleGroup } from './../modules/role-module/models/role-group';
import { UserGroup } from './../modules/role-module/models/user-group';
import { Role } from './../models/role';
import { VenueSeat } from './../models/venue-seat';
import { Event } from "../models/event";
import { Performer } from "../models/performer";
import { Performance } from "../models/performance";
import { Venue } from "../models/venue";
import { Product } from "../models/product";
import { Price } from "../models/price";
import { Template } from '../models/template';
import { PerformancePerformer } from '../models/performance-performer';
import { Sponsor } from '../models/sponsor';
import { Town } from '../models/town';
import { EntityFirm } from '../models/entity-firm';
import { City } from '../models/city';
import { Firm } from '../models/firm';
import { Attribute } from "../models/attribute";
import { AttributeType } from "../models/attribute-type";
import { EntityAttribute } from "../models/entity-attribute";
import { EntityType } from "../models/entity-type";
import { Entity } from "../models/entity";
import { MenuItem } from "../models/menu-item";
import { CrmAnonymousUser } from "../models/crm-anonymous-user";
import { Generic } from "../models/generic";
import { Group } from '../models/group';
import { Hall } from '../models/hall';


export class ModelFactory {
	private modelObject : any;
	constructor(endpoint : string, object : Object){
    	switch(endpoint){
    		case 'EEvent':
    			this.modelObject = new Event(object);
    		break;
    		case 'EPerformer':
    			this.modelObject = new Performer(object);
    		break;
			case 'EPerformance':
    			this.modelObject = new Performance(object);
    		break;
    		case 'VVenue':
    			this.modelObject = new Venue(object);
    		case 'PProduct':
    			this.modelObject = new Product(object);
    		break;
    		case 'PPrice':
    			this.modelObject = new Price(object);
    		break;
    		case 'VTemplate':
    			this.modelObject = new Template(object);
    		break;
			case 'EPerformancePerformer':
    			this.modelObject = new PerformancePerformer(object);
    		break;
    		case 'ESponsor':
    			this.modelObject = new Sponsor(object);
    		break;
    		case 'LTown':
    			this.modelObject = new Town(object);
    		break;
    		case 'FEntityFirm':
    			this.modelObject = new EntityFirm(object);
    		break;
    		case 'LCity':
    			this.modelObject = new City(object);
    		break;
    		case 'FFirm':
    			this.modelObject = new Firm(object);
    		break;
    		case 'AAttribute':
    			this.modelObject = new Attribute(object);
    		break;
    		case 'AAttributeType':
    			this.modelObject = new AttributeType(object);
    		break;
    		case 'AEntityAttribute':
    			this.modelObject = new EntityAttribute(object);
    		break;
    		case 'AEntityType':
    			this.modelObject = new EntityType(object);
    		break;
    		case 'Entity':
    			this.modelObject = new Entity(object);
    		break;
    		case 'SMenuItem':
    			this.modelObject = new MenuItem(object);
    		break;
			case 'CrmAnonymousUser':
				this.modelObject = new CrmAnonymousUser(object);
			break;
			case 'ReportEvent':
				this.modelObject = new Generic(object);
			break;
			case 'ReportParentEvent':
				this.modelObject = new Generic(object);
			break;
			case 'ReportPerformance':
				this.modelObject = new Generic(object);
			break;
			case 'EVenueSeat':
				this.modelObject = new VenueSeat(object);
			break;
			case 'Role':
				this.modelObject = new Role(object);
			break;
			case 'VHall':
				this.modelObject = new Hall(object);
			case 'Group':
				this.modelObject = new Group(object);
			break;
			case 'UserGroup':
				this.modelObject = new UserGroup(object);
			break;
			case 'RoleGroup':
				this.modelObject = new RoleGroup(object);
			break;
			case 'Transaction':
				this.modelObject = new Installments(object);
			break;
		}
	}
	getInstance() {
		return this.modelObject;
	}
}
