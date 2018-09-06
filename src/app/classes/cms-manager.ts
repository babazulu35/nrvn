import { AppSettingsService } from './../services/app-settings.service';
import { EntityService } from './../services/entity.service';
import { environment } from '../../environments/environment';
import { Http, Response, Headers, RequestOptions, RequestMethod, URLSearchParams } from "@angular/http";
import { StoreService } from './../services/store.service';
import { AuthenticationService } from './../services/authentication.service';
import { Observer } from 'rxjs/Observer';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from "rxjs/Observable";
import 'rxjs/Rx';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as moment from 'moment';

export class CMSManager {
    private apiUrl: string;
    private token: string;
    private http: Http;
    private headers : Headers = new Headers();
    private storeService: StoreService;
	private appSettingService: AppSettingsService;
    data;
    authenticationService;
    private endpoint : string;
    private content;

	constructor(http: Http, authenticationService: AuthenticationService, storeService: StoreService, appSettingService?: AppSettingsService) {
		this.http = http;
		this.apiUrl = environment.api.cms + '/' + environment.api.cmspath;
		this.token = authenticationService.getToken();
		this.storeService = storeService;
		this.authenticationService = authenticationService;
		this.appSettingService = appSettingService;
		
		this.authenticationService.isLoggedIn$.subscribe( isLogin => {
            if(isLogin) {
                this.token = this.authenticationService.getToken();
                this.setHeader('Content-Type', 'application/json');
                this.setHeader('Accept-Language', 'tr-tr');
                if (this.token) {
                    this.setHeader('Authorization', 'bearer ' + this.token);
                } else {
                    Observable.throw('Token Error');
                }
            }else{
                Observable.throw('Login Error');
            }
		});
    }
	public getAllContentTypes() : Observable<any>{
		let executionUrl = this.apiUrl + '/ContentTypes' ;
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((res) => this.map(res))
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getAllComponentContainerTypes() : Observable<any>{
		let executionUrl = this.apiUrl + '/ComponentContainerTypes' ;
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((res) => this.map(res))
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getContentType(contentTypeName : string, expanded : boolean = true) : any{
		let executionPath = (expanded) ? 'ContentTypeExpanded' : 'ContentType';
		let executionUrl = this.apiUrl  + '/' + executionPath + '/' + contentTypeName;
		let self = this;
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((response) =>{
            	let payload = response.json();
            	payload.getComponentContainerTypes = function(){return null};
            	if(!expanded){
	            	let forkJoinStream;
	        		if (payload) {
		            	let observables = [];
		            	payload['ComponentContainerTypes'].forEach(item => {
		            		observables.push(this.getComponentContainerType(item))
		            	});
		            	let forkedJoin = Observable.forkJoin(observables);
		            	payload.getComponentContainerTypes = function(){
		            		let componentContainers = [];
		            		forkedJoin.subscribe(result => {
		            			componentContainers.push(result);
		            		});
		            		return componentContainers;
		            	}
	        		}
        		}else{
        			payload.ComponentContainerTypes.forEach(item => {
	            		payload[item]['Components'].forEach(component => {
	            				component['componentId'] = self.generateRandomUniqueID();
	            				component['Fields'].forEach(field=>{
			        				field['componentFieldId'] = self.generateRandomUniqueID();
								})
	            		});
	            	});
        			payload.getComponentContainerTypes = function() {
        				if(payload.ComponentContainerTypes && payload.ComponentContainerTypes.length > 0){
        					let componentContainers = [];
        					payload.ComponentContainerTypes.forEach(item => {
        						let componentContainer = {
	        						getComponents : function(){ return null},
	        						saveComponent : function(fields){ return null},
	        						deleteInstance : function(component){ return null},
	        						getComponentInstances : function(){ return null},
        						};
        						componentContainer['_id'] = payload[item]['_id'];
        						componentContainer['Name'] = payload[item]['Name'];
        						payload[item]['Components'].forEach(component => {
		        						component.getFields = function(){
		        							return component['Fields'];
		        						}
		        						component.createComponent = function(){
		        							let newComponent ={...component};
		        							newComponent['instanceId'] = self.generateRandomUniqueID();
		        							newComponent['Fields'].forEach(field=>{
		        								field['instanceFieldId'] = self.generateRandomUniqueID();
		        							})
		        							newComponent.getFields = function(){
		        								return newComponent['Fields'];
		        							}
		        							newComponent.setFields = function(fields){
		        								newComponent['Fields'] = fields;
		        							}
		        							return newComponent
		        						}
		        				})
        						componentContainer.getComponents = function(){
									return payload[item]['Components'];
		        				}
		        				componentContainer.saveComponent = function(cp){
        							if(payload[item]['Instances']){
        								/*
        								let instance = this['Instances'].find(instance => {
        									return instance['tempId'] == cp['tempId'];
        								});
        								*/
        								let index = payload[item]['Instances'].indexOf(cp);
        								if(index > -1){
											if(!cp["sortIndex"]) cp["sortIndex"] = index;
											payload[item]['Instances'][index] = cp;
        								}else{
											if(!cp["sortIndex"]) cp["sortIndex"] = payload[item]['Instances'].length;
											payload[item]['Instances'].push(cp);
        								}
        							}else{
										payload[item]['Instances'] = [];
										if(!cp["sortIndex"]) cp["sortIndex"] = payload[item]['Instances'].length;
										payload[item]['Instances'].push(cp);
        							}
        						}
        						componentContainer.deleteInstance = function(cp){
									if(payload[item]['Instances']){
        								let index = payload[item]['Instances'].indexOf(cp);
        								if(index > -1){
        									payload[item]['Instances'].splice(index,1);
        								}
        							}
        						}
		        				componentContainer.getComponentInstances = function(){
		        					return payload[item]['Instances'];
		        				}

        						componentContainers.push(componentContainer);
        					});
        					return componentContainers;
        				}
        			}
					payload.getPublishingPointList = function() {
						let publishingPoints = [];
						let publishingPointList = payload["LOVList"] ? payload["LOVList"].find( item => item._id == "PublishingPointList") : null;
						if(publishingPointList) {
							if(publishingPointList["KeyValueItems"]) {
								publishingPointList["KeyValueItems"].forEach( keyValueItem => publishingPoints.push({label: keyValueItem.label, name: keyValueItem.key, value: false}));
							}else if(publishingPointList["KeyValuePairs"]) {
								for(let key in publishingPointList["KeyValuePairs"]) {
									publishingPoints.push({label: publishingPointList["KeyValuePairs"][key], name: publishingPointList["KeyValuePairs"][key], value: false});
								}
							}
						}
						return publishingPoints;
					}
					payload.getRelatedEntityList = function() {
						let entityTypes = self.appSettingService.getLocalSettings("entityTypes");
						let entityType: {name: string, label: string, endpoint: string};
						let relatedEntityTypes: {name: string, label: string, endpoint: string}[] = [];
						if(payload["RelatedEntities"]) {
							payload["RelatedEntities"].forEach( item => {
								entityType = entityTypes.find( e => e.name == item );
								if(entityType) relatedEntityTypes.push(entityType);
							});
						}
						return relatedEntityTypes;
					}
					payload.getDatasourceList = function() {
						let datasources = [];
						let dataSourcesList = payload["RelatedDatasources"] ? JSON.parse(JSON.stringify(payload["RelatedDatasources"])) : null;
						if(dataSourcesList) {
							dataSourcesList.forEach( item => {
								let urlParts:string[] = item.Url ? item.Url.split('?') : item.url.split('?');
								let url = urlParts.shift();
								urlParts = urlParts.join('?').split('&');
								let params: {key: string, type: string, label?: string, relatedEntityType?: string, allowMultiple?: boolean}[] = [];
								let itemParameters = item.Parameters || item.parameters;
								if(itemParameters && itemParameters.length) {
									itemParameters.forEach( queryParamItem => {
										params.push({
											key: queryParamItem.key,
											type: queryParamItem.type || 'queryParam',
											label: queryParamItem.label || queryParamItem.key,
											relatedEntityType: queryParamItem.relatedEntityType,
											allowMultiple: queryParamItem.allowMultiple
										});
									});
								}else{
									urlParts.forEach( queryParamItem => {
										if(queryParamItem) {
											params.push({
												key: queryParamItem.split("=?")[0],
												type: 'queryParam',
												label: queryParamItem.split("=?")[0]
											});
										}
									});
								}
								// let itemHeaders = item.Headers || item.headers;
								// if(itemHeaders && Object.keys(itemHeaders)) {
								// 	Object.keys(itemHeaders).forEach( headerItemKey => {
								// 		params.push({
								// 			label: itemHeaders[headerItemKey].replace("?", ""),
								// 			key: itemHeaders[headerItemKey].replace("?", ""),
								// 			type: 'header'
								// 		})
								// 	})
								// }
								// let itemBody = item.Body || item.body;
								// if(itemBody && Object.keys(itemBody)) {
								// 	Object.keys(itemBody).forEach( bodyItemKey => {
								// 		params.push({
								// 			label: itemBody[bodyItemKey].replace("?", ""),
								// 			key: itemBody[bodyItemKey].replace("?", ""),
								// 			type: 'body'
								// 		})
								// 	})
								// }
								
								datasources.push({
									id: item["_id"],
									type: item.Name || item.name,
									url: url,
									required: item.Required,
									method: item.Method,
									entityType: item.EntityType || item.entityType,
									params: params
								});
							});
						}
						return datasources;
					}

					payload.createDatasource = function(datasourceType, datasource) {
						return {
							id: datasourceType.id,
							Name: datasourceType.type,
							EntityType: datasourceType.entityType,
							Required: datasourceType.required,
							Id: datasource.Id || self.generateRandomUniqueID(),
							Title: datasource.Title,
							Parameters: datasource.Parameters
						}
					}
        		}
        		return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getRawContentType(contentTypeName: string):Observable<any> {
		let executionUrl = this.apiUrl + '/' + 'ContentTypeExpanded' + '/' + contentTypeName;
		let self = this;
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
				let payload = self.createContentType(response.json());
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public createContentType(data: any = {}) {
		let self = this;
		let payload = data;
		let isNew = data == {};
		payload.cache = {...payload};
		payload.set = function(key : string, value : any){ this[key] = value },
		payload.save = function() {return null}

		payload.Version = 1;

		payload.init = function() {
			this.ComponentContainers = [];
			if(this.cache.ComponentContainerTypes && this.cache.ComponentContainerTypes.length) {
				this.cache.ComponentContainerTypes.forEach( componentContainer => {
					this.addComponentContainer(self.createComponentContainerType(this[componentContainer]));
					delete this[componentContainer];
				});
			}
			this.RelatedEntityTypes = [];
			let entityTypes = self.appSettingService.getLocalSettings('entityTypes');
			entityTypes.forEach(item => {
				this.RelatedEntityTypes.push({...item});
			})
			if(this.cache.RelatedEntities && this.cache.RelatedEntities.length) {
				this.RelatedEntityTypes.map( item => {
					item.selected = this.cache.RelatedEntities.some( relatedItem => relatedItem == item.name);
				});
			}

			this.RelatedDatasources = [];
			self.getDataSources().subscribe( datasources => {
				if(datasources && datasources.length) {
					datasources.forEach( datasource => {
						this.RelatedDatasources.push({
							id: datasource._id,
							label: datasource.Name || datasource.name || datasource._id,
							selected: this.cache.RelatedDatasources ? this.cache.RelatedDatasources.some( relatedDatasource => relatedDatasource._id == datasource._id) : false,
							datasource: datasource
						})
					});
				}
			});

			this.LOVList = [];
			if(this.cache.LOVList && this.cache.LOVList.length) {
				this.cache.LOVList.forEach( lov => this.LOVList.push(lov));
			}
			if(!this.LOVList.some( lov => lov._id == "PublishingPointList")) {
				self.getLov("PublishingPointList").subscribe( lovResult => {
					if(lovResult) this.LOVList.push(lovResult);
				})
			}
		}
		payload.getComponentContainers = function() {
			return this.ComponentContainers;
		}
		payload.saveComponentContainerTypes = function(data: any[] = null) {
			if(!data) data = this.getComponentContainers();
			let componentContainerTypes: string[] = [];
			data.forEach( item => {
				componentContainerTypes.push(item["_id"]);
			})
			this.ComponentContainerTypes = componentContainerTypes;
			delete this.ComponentContainers;
		}
		payload.getComponentContainerById = function(id) {
			let payloadComponentContainers = this.getComponentContainers();
			if(!payloadComponentContainers) return null;
			let existComponentContainer = payloadComponentContainers.find( item => item.UniqueName == id);
			return existComponentContainer;
		}
		payload.addComponentContainer = function(newComponentContainer) {
			let payloadComponentContainers = this.getComponentContainers();
			let payloadComponentContainer;
			let existComponentContainer = this.getComponentContainerById(newComponentContainer._id);
			if(!existComponentContainer) {
				let payloadComponentContainer = Object.assign({}, newComponentContainer);
				payloadComponentContainers.push(payloadComponentContainer);
			}
			// return existComponentContainer ? null : payloadComponentContainer;
		}
		payload.getRelatedEntities = function() {
			return this.RelatedEntityTypes;
		}
		payload.saveRelatedEntities = function(data: any[] = null) {
			if(!data) data = this.getRelatedEntities();
			let relatedEntities: string[] = [];
			data.forEach( item => {
				if(item.selected) relatedEntities.push(item["name"]);
			})
			this.RelatedEntities = relatedEntities;
			delete this.RelatedEntityTypes;
		}
		payload.getRelatedDatasources = function() {
			return this.RelatedDatasources;
		}
		payload.saveRelatedDatasources = function(data: any[] = null) {
			if(!data) data = this.getRelatedDatasources();
			let relatedDatasources: any[] = [];
			data.forEach( item => {
				if(item.selected) relatedDatasources.push(item["datasource"]);
			})
			this.RelatedDatasources = relatedDatasources;
		}
		payload.create = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});
			if(savePayload['RelatedDatasources'] && savePayload['RelatedDatasources'].length > 0){
				savePayload['RelatedDatasourceIds'] = [];
				savePayload['RelatedDatasources'].forEach(element => {
					savePayload['RelatedDatasourceIds'].push(element._id);
				});
			}
			
			savePayload['_id'] = self.generateSlug(savePayload['Name']);
			savePayload['Created'] = moment().toISOString();
			savePayload['CreatedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			savePayload['Description'] = null;
			return self.http.post(self.apiUrl + '/' + 'ContentType', savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}
		payload.save = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});			
			if(savePayload['RelatedDatasources'] && savePayload['RelatedDatasources'].length > 0){
				savePayload['RelatedDatasourceIds'] = [];
				savePayload['RelatedDatasources'].forEach(element => {
					savePayload['RelatedDatasourceIds'].push(element._id);
				});
			}			
			savePayload['Modified'] = moment().toISOString();
			savePayload['ModifiedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			return self.http.put(self.apiUrl + '/' + 'ContentType/' + savePayload['_id'], savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}
		payload.delete = function() {
			return self.http.delete(self.apiUrl + '/' + 'ContentType/' + this['_id'], { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}
		payload.init();
		return payload;
	}
	public deleteContentType(contentTypeId : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'ContentType' + '/' + contentTypeId;
		let self = this;
       	return this.http.delete(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
            	let payload = response.json();
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getComponentContainerType(containerName : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'ComponentContainerType' + '/' + containerName;
		let self = this;
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
				let payload = self.createComponentContainerType(response.json());
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public createComponentContainerType(data:any = {}) {
		let self = this;
		let payload = data;
		let isNew = data == {};
		payload.cache = {...payload};
		payload.set = function(key : string, value : any){ this[key] = value },
		payload.save = function() {return null}

		payload.Version = 1;

		payload.init = function() {
			this.Components = [];
			if(this.cache.Components && this.cache.Components.length) {
				this.cache.Components.forEach(component => {
					this.addComponent(component);
				});
			}
		}
	
		payload.getComponents = function() {
			return this.Components;
		}

		payload.getComponentById = function(id) {
			let payloadComponents = this.getComponents();
			if(!payloadComponents) return null;
			let existComponent = payloadComponents.find( item => item.UniqueName == id);
			return existComponent;
		}

		payload.addComponent = function(newComponent) {
			let payloadComponents = this.getComponents();
			let payloadComponent;
			let existComponent = this.getComponentById(newComponent.UniqueName);
			if(!existComponent) {
				let payloadComponent = Object.assign({}, newComponent);
				if(!payloadComponent.Fields) payloadComponent.Fields = [];
				payloadComponent.getFields = function() {
					return this.Fields;
				}
				payloadComponent.getFieldById = function(id) {
					let payloadFields = this.getFields();
					if(!payloadFields) return null;
					let existField = payloadFields.find( item => item.UniqueName == id);
					return existField;
				}
				payloadComponent.addField = function(newField) {
					let payloadFields = this.getFields();
					let existField = this.getFieldById(newField.UniqueName);
					if(!existField) payloadFields.push(newField);
					return existField ? null : newField;
				}
				payloadComponent.removeField = function(oldField) {
					let payloadFields = this.getFields();
					let existField = this.getFieldById(oldField.UniqueName);
					if(existField) payloadFields.splice(payloadFields.indexOf(oldField), 1);
					return existField ? oldField : null;
				}
				payloadComponents.push(payloadComponent);
			}
			return existComponent ? null : payloadComponent;
		}

		payload.removeComponent = function(newComponent) {
			if(!this.Components) return null;
			let payloadComponents = this.getComponents();
			let existComponent = this.getComponentById(newComponent.UniqueName);
			if(existComponent) payloadComponents.splice(payloadComponents.indexOf(newComponent),1);
			return existComponent ? newComponent : null;
		}
		
		payload.create = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});
			savePayload['Created'] = moment().toISOString();
			savePayload['CreatedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			return self.http.post(self.apiUrl + '/' + 'ComponentContainerType', savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.save = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});
			savePayload['Modified'] = moment().toISOString();
			savePayload['ModifiedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			return self.http.put(self.apiUrl + '/' + 'ComponentContainerType/' + savePayload['_id'], savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.delete = function() {
			return self.http.delete(self.apiUrl + '/' + 'ComponentContainerType/' + this['_id'], { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.init();
		return payload;
	}
	public getDataSources() : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Datasources';
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
				let payload = response.json();
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getDatasource(dataSourceID : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Datasource' + '/' + dataSourceID;
		let self = this;
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
            	let payload = self.createDatasource(response.json());
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public createDatasource(data:any = {}) {
		let self = this;
		let payload = data;
		let isNew = data == {};
		payload.cache = {...payload};
		payload.set = function(key : string, value : any){ this[key] = value },
		payload.save = function() {return null}

		if(!payload.EntityType) payload.EntityType = null;

		payload.init = function() {
			this.Parameters = [];
			if(this.cache.Parameters && this.cache.Parameters.length) {
				this.cache.Parameters.forEach(parameter => {
					this.addParameter(parameter);
				});
			}
		}
	
		payload.getParameters = function() {
			return this.Parameters;
		}

		payload.getParameterById = function(id) {
			let payloadParameters = this.getParameters();
			if(!payloadParameters) return null;
			let existParameter = payloadParameters.find( item => item.key == id);
			return existParameter;
		}

		payload.addParameter = function(newParameter) {
			let payloadParameters = this.getParameters();
			let payloadParameter;
			let existParameter = this.getParameterById(newParameter.key);
			if(!existParameter) {
				let payloadParameter = Object.assign({}, newParameter);
				payloadParameters.push(payloadParameter);
			}
			return existParameter ? null : payloadParameter;
		}

		payload.removeParameter = function(newParameter) {
			if(!this.Parameters) return null;
			let payloadParameters = this.getParameters();
			let existParameter = this.getParameterById(newParameter.key);
			if(existParameter) payloadParameters.splice(payloadParameters.indexOf(newParameter),1);
			return existParameter ? newParameter : null;
		}
		
		payload.create = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});
			savePayload['Created'] = moment().toISOString();
			savePayload['CreatedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			savePayload['__type'] = "Beeswax.Core.Data.WebApiDatasource, Beeswax.Core";
			return self.http.post(self.apiUrl + '/' + 'Datasource', savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.save = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});
			savePayload['Modified'] = moment().toISOString();
			savePayload['ModifiedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['__type'] = "Beeswax.Core.Data.WebApiDatasource, Beeswax.Core";
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			return self.http.put(self.apiUrl + '/' + 'Datasource/' + savePayload['_id'], savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.delete = function() {
			return self.http.delete(self.apiUrl + '/' + 'Datasource/' + this['_id'], { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.init();
		return payload;
	}
	public deleteDatasource(dataSourceID : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Datasource' + '/' + dataSourceID;
		let self = this;
       	return this.http.delete(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
            	let payload = response.json();
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getLovs() : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Lovs';
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
				let payload = response.json();
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getLov(lovID : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Lov' + '/' + lovID;
		let self = this;
       	return this.http.get(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
            	let payload = self.createLov(response.json());
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public createLov(data:any = {}) {
		let self = this;
		let payload = data;
		let isNew = data == {};
		payload.cache = {...payload};
		payload.set = function(key : string, value : any){ this[key] = value },
		payload.save = function() {return null}

		if(!payload.Name) payload.Name = payload._id;

		payload.init = function() {
			this.KeyValueItems = [];
			if(this.cache.KeyValueItems && this.cache.KeyValueItems.length) {
				this.cache.KeyValueItems.forEach(item => {
					this.addKeyValueItem({
						label: item.label,
						key: item.key || item,
						value: item.value || item
					});
				});
			}else{
				if(this.cache.KeyValuePairs) {
					let keys = Object.keys(this.cache.KeyValuePairs);
					if(keys && keys.length) keys.forEach( keyItem => {
						this.addKeyValueItem({
							label: keyItem,
							key: keyItem,
							value: this.cache.KeyValuePairs[keyItem]
						});
					});
				}
			}
		}
	
		payload.getKeyValueItems = function() {
			return this.KeyValueItems;
		}

		payload.getKeyValueItemById = function(id) {
			let payloadKeyValueItems = this.getKeyValueItems();
			if(!payloadKeyValueItems) return null;
			let existKeyValueItem = payloadKeyValueItems.find( item => item.key == id);
			return existKeyValueItem;
		}

		payload.addKeyValueItem = function(newKeyValueItem) {
			let payloadKeyValueItems = this.getKeyValueItems();
			let payloadKeyValueItem;
			let existKeyValueItem = this.getKeyValueItemById(newKeyValueItem.key);
			if(!existKeyValueItem) {
				payloadKeyValueItem = Object.assign({}, newKeyValueItem);
				payloadKeyValueItems.push(payloadKeyValueItem);
			}
			return existKeyValueItem ? null : payloadKeyValueItem;
		}

		payload.removeKeyValueItem = function(newKeyValueItem) {
			if(!this.KeyValueItems) return null;
			let payloadKeyValueItems = this.getKeyValueItems();
			let existKeyValueItem = this.getKeyValueItemById(newKeyValueItem.key);
			if(existKeyValueItem) payloadKeyValueItems.splice(payloadKeyValueItems.indexOf(newKeyValueItem),1);
			return existKeyValueItem ? newKeyValueItem : null;
		}
		
		payload.create = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});
			savePayload['Created'] = moment().toISOString();
			savePayload['CreatedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			return self.http.post(self.apiUrl + '/' + 'Lov', savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.save = function() {
			let savePayload : Object = {};
			Object.keys(payload).forEach(key=>{
				if(typeof payload[key] != 'function'){
					if(key != 'cache') savePayload[key] = payload[key]
				}
			});
			savePayload['Modified'] = moment().toISOString();
			savePayload['ModifiedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
			savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
			return self.http.put(self.apiUrl + '/' + 'Lov/' + savePayload['_id'], savePayload, { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.delete = function() {
			return self.http.delete(self.apiUrl + '/' + 'Lov/' + this['_id'], { headers: self.getHeaders() })
				.map((response) => {
					return (response && response["_body"]) ? response.json() : '';
				})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();;
		}

		payload.init();
		return payload;
	}
	public deleteLov(lovID : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Datasource' + '/' + lovID;
		let self = this;
       	return this.http.delete(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
            	let payload = response.json();
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getRelatedEntity(entityType: string, entityId : string) : Observable<any>{
		let entityService:EntityService = new EntityService(this.http, this.storeService, this.authenticationService);
		entityService.setCustomEndpoint('GetAll');

		switch(entityType) {
			case "EPerformer":
				entityService
					.fromEntity(entityType)
					.where("Id", "=", entityId)
					.take(1).page(0).executeQuery();
			break;
			default:
				entityService
					.fromEntity(entityType)
					.where("Id", "=", entityId)
					.expand(['Localization'])
					.take(1).page(0).executeQuery();
			break;
		}
		return entityService.data;
	}
	public createContent(contentTypeName : string) : any{
		let content = {
			getContentType : function(){return null},
			set : function(key : string, value : any){ this[key] = value },
			savePublishingPoints: function(list: {name: string, value: boolean}[]) {
				if(!list || !list.length) return;
				content["PublishingPoints"] = {};
				list.forEach(item => content["PublishingPoints"][item.name] = item.value );
			},
			saveRelatedEntities: function(list: {EntityType: string, EntityId: string}[]) {
				if(!list || !list.length) return;
				content["RelatedEntities"] = [];
				list.forEach(item => content["RelatedEntities"].push(item));
			},
			saveDatasources: function(list:{id: any, Id: string, Name: string, EntityType: string, Method: string, Title: string, Parameters: {}[] }[]) {
				if(!list || !list.length) return;
				content["Datasources"] = [];
				let params: {} = {};
				let datasource: {
					id: string,
					Id: string,
					Name: string,
					EntityType: string,
					Title: string,
					Parameters: {}
				};
				list.forEach(item => {
					datasource = {
						id: item.id,
						Id: item.Id || self.generateRandomUniqueID(),
						Name: item.Name,
						EntityType: item.EntityType,
						Title: item.Title,
						Parameters: params
					}
					content["Datasources"].push(item)
				});
			},
		 	save: function() {return null}
		};
		let self = this;
		return this.getContentType(contentTypeName, true).flatMap((response) => {
			content.getContentType = function(){return response};
			content['Active'] = false;
			content.save = function(){
				let payload : Object = {};
				Object.keys(content).forEach(key=>{
					if(typeof content[key] != 'function'){
						payload[key] = content[key]
					}
				})
				payload['_id'] = self.generateSlug(content['Title']);
				payload['Created'] = moment().toISOString();
				payload['CreatedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
    			payload['ContentType'] = contentTypeName;
				payload['PlatformCode'] = self.authenticationService.getUserFirmCode();
				//payload['PromoterCode'] = self.authenticationService.getPromoterCode();
				let containers = this.getContentType().getComponentContainerTypes();
				if(containers && containers.length > 0){
					containers.forEach(container => {
						let instances = container.getComponentInstances();
						if(instances && instances.length > 0){
							let componentsPayload = [];
							instances.forEach(instance => {
								delete instance['componentId'];
								let componentPayload = {};
								componentPayload['ComponentType'] = instance['UniqueName'];
								componentPayload['sortIndex'] = !isNaN(instance['sortIndex']) ? instance['sortIndex'] : componentsPayload.length;
								let fields = instance.getFields();
								if(fields && fields.length > 0){
									fields.forEach(field => {
										delete field['instanceFieldId'];
										let id = (field['UniqueName']) ? field['UniqueName'] : field['id'];
										componentPayload[id] = field['Value'] || null;
									});
								}
								componentsPayload.push(componentPayload);
							});
							componentsPayload.sort( (a,b) => { return a.sortIndex - b.sortIndex; } );
							payload[container['_id']] = container['_id'] == "ShareComponentContainerType" ? componentsPayload[0] : componentsPayload;;
						}else {
							payload[container['_id']] = container['_id'] == "ShareComponentContainerType" ? {} : [];
						}
					})
				}
				return self.http.post(self.apiUrl + '/' + 'Content', payload, { headers: self.getHeaders() })
            	.map((response) => {
            		let payload = (response && response["_body"]) ? response.json() : '';
        			return payload;
        		})
				.catch((response) => self.handleError(response))
				.publishReplay(1).refCount();
			}
			return Observable.of(content);
		});
	}
	public getContent(contentSlug : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Content' + '/' + contentSlug;
		let self = this;
       	return this.http.get(executionUrl, { headers: this.getHeaders(), search: {isForUpdate: true} })
            .flatMap((response) => {
            	let payload = response.json();
            	payload.getContentTypeMeta = function(){ return null}
            	payload.getDatasources = function(){ return payload.Datasources}
            	payload.getComponentContainerTypes = function(){ return null}
            	payload.set = function(key : string, value : any){ this[key] = value },
		 		payload.save = function() {return null}
		 		payload.deletedComponentInstances = [];
				let executionUrl = this.apiUrl + '/ContentTypeExpanded' + '/' + payload.ContentType;
	       		return this.http.get(executionUrl, { headers: this.getHeaders() })
	            .map((response) =>{
	            	let componentPayload = response.json();
	            	componentPayload.ComponentContainerTypes.forEach(item => {
	            		if(componentPayload[item]){
		            		componentPayload[item]['Instances'] = [];
		            		componentPayload[item]['Components'].forEach(component => {
	            				component['componentId'] = self.generateRandomUniqueID();
	            				component['Fields'].forEach(field=>{
			        				field['componentFieldId'] = self.generateRandomUniqueID();
								});
								if(payload[item] && !payload[item].length) payload[item] = [payload[item]];
	            				if(payload[item] && payload[item].length){
									let componentInstances = payload[item].filter(c => {
										return c['ComponentType'] == component['UniqueName'];
									});
									componentInstances.forEach(componentInstance => {
										let newComponent = {...component};
										newComponent['instanceId'] = self.generateRandomUniqueID();
										newComponent['componentId'] = component['componentId'];
										newComponent['sortIndex'] = componentInstance['sortIndex'];
										let fields = [];
										for(let i in newComponent['Fields']){
											let field =  {...newComponent['Fields'][i]};
											field['Value'] = componentInstance[newComponent['Fields'][i]['UniqueName']];
											field['instanceFieldId'] = self.generateRandomUniqueID();
											fields.push(field);
										}
 										let newComponentInstance = {...newComponent};
 										newComponentInstance['Fields'] = fields;
 										newComponentInstance.getFields = function(){
 											return newComponentInstance['Fields'];
 										}
 										newComponentInstance.setField = function(id, value){
											let fields = this.getFields();
											let selectedField = fields.find(field =>{
												return field['instanceFieldId'] == id;
											});
											if(selectedField){
												selectedField['NewValue'] = value;
											}
										}
										newComponentInstance.setFields = function(fields){
											newComponentInstance['Fields'] = fields;
										}
										componentPayload[item]['Instances'].push(newComponentInstance);
									});
								}
		            		});
	            		}
	            	});
	        		componentPayload.getComponentContainerTypes = function() {
	        				let componentContainers = [];
	        				if(componentPayload.ComponentContainerTypes && componentPayload.ComponentContainerTypes.length > 0){
	        					let componentContainer = {
	        						getComponents : function(){ return null},
        							saveComponent : function(fields){ return null},
        							deleteInstance : function(instance){ return null},
        							getComponentInstances : function(){ return null},
        						};
	        					componentPayload.ComponentContainerTypes.forEach(item => {
	        						componentContainer['Name'] = componentPayload[item]['Name'];
	        						componentContainer['_id'] = componentPayload[item]['_id'];
	        						componentPayload[item]['Components'].forEach(component => {
			        						component.getFields = function(){
			        							return component['Fields'];
			        						}
			        						component.createComponent = function(){
			        							let newComponent = Object.assign({}, component);
			        							newComponent['instanceId'] = self.generateRandomUniqueID();
			        							newComponent['Fields'].forEach(field=>{
			        								field['instanceFieldId'] = self.generateRandomUniqueID();
			        							})
			        							newComponent.getFields = function(){
			        								return newComponent['Fields'];
			        							}
			        							newComponent.setFields = function(fields){
			        								newComponent['Fields'] = fields;
			        							}
			        							return newComponent
		        							}
		        							component.getInstances = function(){
												let instances = [];
			        							if(componentPayload[item]['Instances']){
		        									let newComponentInstances = componentPayload[item]['Instances'].filter(c => {
		        										return c['componentId'] == component['componentId'];
		        									});
		        									instances = instances.concat(newComponentInstances);
			        							}
		        								return instances
		        							}
			        				});
			        				componentContainer.saveComponent = function(cp){
	        							if(componentPayload[item]['Instances']){
	        								let index = componentPayload[item]['Instances'].indexOf(cp);
	        								if(index > -1){
												if(!cp["sortIndex"]) cp["sortIndex"] = index;
												componentPayload[item]['Instances'][index] = cp;
	        								}else{
												if(!cp["sortIndex"]) cp["sortIndex"] = componentPayload[item]['Instances'].length;
												componentPayload[item]['Instances'].push(cp);
	        								}
	        							}else{
											componentPayload[item]['Instances'] = [];
											if(!cp["sortIndex"]) cp["sortIndex"] = componentPayload[item]['Instances'].length;
											componentPayload[item]['Instances'].push(cp);
										}
        							}
		        					componentContainer.deleteInstance = function(cp){
										if(componentPayload[item]['Instances']){
	        								let hasInstance = componentPayload[item]['Instances'].find(ins => {
	        									return (ins['instanceId'] == cp['instanceId']);
	        								});
	        								let index = componentPayload[item]['Instances'].indexOf(hasInstance);
	        								if(index > -1){
	        									componentPayload[item]['Instances'].splice(index,1);
	        								}
	        							}
        							}
        							componentContainer.getComponentInstances = function(){
		        						return componentPayload[item]['Instances'];
		        					}
	        						componentContainer.getComponents = function(){
	        							return componentPayload[item]['Components'];
			        				}
	        						componentContainers.push(Object.assign({}, componentContainer));
	        					});
	        					return componentContainers;
	        				}
	        		}
					payload.getComponentContainerTypes = function(){
						let containerTypes = componentPayload.getComponentContainerTypes();
						let containers = [];
						if(containerTypes && containerTypes.length > 0){
							containerTypes.forEach(container => {
								containers.push(payload[container['_id']]);
							});

							return containers;
						}
					}
					payload.getContentTypeMeta = function(){
						return componentPayload;
					}
					componentPayload.getPublishingPointList = function() {
						let publishingPoints = [];
						let contentTypeMeta = payload.getContentTypeMeta();
						let publishingPointList = contentTypeMeta["LOVList"] ? contentTypeMeta["LOVList"].find( item => item._id == "PublishingPointList") : null;
						if(publishingPointList) {
							if(publishingPointList["KeyValueItems"]) {
								publishingPointList["KeyValueItems"].forEach( keyValueItem => publishingPoints.push({label: keyValueItem.label, name: keyValueItem.key, value: false}));
							}else if(publishingPointList["KeyValuePairs"]) {
								for(let key in publishingPointList["KeyValuePairs"]) {
									publishingPoints.push({label: publishingPointList["KeyValuePairs"][key], name: publishingPointList["KeyValuePairs"][key], value: false});
								}
							}
						}
						return publishingPoints;
					}
					payload.getPublishingPoints = function() {
						let publishingPointsList = componentPayload.getPublishingPointList();
						let publishingPoints = [];
						publishingPointsList.forEach(item => {
							publishingPoints.push({label: item.label, name: item.name, value: payload["PublishingPoints"] ? payload["PublishingPoints"][item.name] == true : false});
						})
						return publishingPoints;
					}
					payload.savePublishingPoints = function(list: {name: string, value: boolean}[]) {
						payload["PublishingPoints"] = {};
						list.forEach(item => payload["PublishingPoints"][item.name] = item.value );
					}
					componentPayload.getRelatedEntityList = function() {
						let contentTypeMeta = payload.getContentTypeMeta();
						let entityTypes = self.appSettingService.getLocalSettings("entityTypes");
						let entityType: {name: string, label: string, endpoint: string};
						let relatedEntityTypes: {name: string, label: string, endpoint: string}[] = [];
						if(contentTypeMeta["RelatedEntities"]) {
							contentTypeMeta["RelatedEntities"].forEach( item => {
								entityType = entityTypes.find( e => e.name == item );
								if(entityType) relatedEntityTypes.push(entityType);
							});
						}
						return relatedEntityTypes;
					}
					payload.getRelatedEntities = function() {
						let entityTypes = self.appSettingService.getLocalSettings("entityTypes");
						let entityType: {name: string, label: string, endpoint: string};
						if(payload['RelatedEntities']) {
							payload['RelatedEntities'].forEach(item => {
								if(item.EntityType) entityType = entityTypes.find( e => e.name == item.EntityType.name );
								if(entityType && entityType.endpoint) item.entityData = self.getRelatedEntity(entityType.endpoint, item.EntityId);
							});
						}
						return payload['RelatedEntities'];
					}
					payload.saveRelatedEntities = function(list: {EntityType: string, EntityId: string}[]) {
						payload["RelatedEntities"] = [];
						list.forEach(item => payload["RelatedEntities"].push(item));
					}
					componentPayload.getDatasourceList = function() {
						let datasources = [];
						let contentTypeMeta = payload.getContentTypeMeta();
						let dataSourcesList = contentTypeMeta["RelatedDatasources"] ? JSON.parse(JSON.stringify(contentTypeMeta["RelatedDatasources"])) : null;
						if(dataSourcesList) {
							dataSourcesList.forEach( item => {
								let urlParts:string[] = item.Url ? item.Url.split('?') : item.url.split('?');
								let url = urlParts.shift();
								urlParts = urlParts.join('?').split('&');
								let params: {key: string, type: string, label?: string, relatedEntityType?: string, allowMultiple?: boolean}[] = [];
								let itemParameters = item.Parameters || item.parameters;
								if(itemParameters && itemParameters.length) {
									itemParameters.forEach( queryParamItem => {
										params.push({
											key: queryParamItem.key,
											type: queryParamItem.type || 'queryParam',
											label: queryParamItem.label || queryParamItem.key,
											relatedEntityType: queryParamItem.relatedEntityType,
											allowMultiple: queryParamItem.allowMultiple
										});
									});
								}else{
									urlParts.forEach( queryParamItem => {
										if(queryParamItem) {
											params.push({
												key: queryParamItem.split("=?")[0],
												type: 'queryParam',
												label: queryParamItem.split("=?")[0]
											});
										}
									});
								}
								datasources.push({
									id: item["_id"],
									type: item.Name || item.name,
									url: url,
									required: item.Required,
									method: item.Method,
									entityType: item.EntityType || item.entityType,
									params: params
								});
							});
						}
						return datasources;
					}
					payload.getDatasources = function() {
						return payload['Datasources'] || [];
					}
					componentPayload.createDatasource = function(datasourceType, datasource) {
						return {
							id: datasourceType.id,
							Name: datasourceType.type,
							EntityType: datasourceType.entityType,
							Required: datasourceType.required,
							Id: datasource.Id || self.generateRandomUniqueID(),
							Title: datasource.Title,
							Parameters: datasource.Parameters
						}
					}
					payload.saveDatasources = function(list:{id: any, Id: string, type: string, entityType: string, title: string, params: {}[] }[]) {
						payload["Datasources"] = [];
						let datasource: {
							id: string,
							Id: string,
							Name: string,
							EntityType: string,
							Title: string,
							Parameters: {}
						};
						list.forEach(item => {
							datasource = {
								id: item.id,
								Id: item.Id || self.generateRandomUniqueID(),
								Name: item.type,
								EntityType: item.entityType,
								Title: item.title,
								Parameters: item.params
							}
							payload["Datasources"].push(item)
						});
					};
					payload.save = function(){
						let savePayload : Object = {};
						Object.keys(payload).forEach(key=>{
							if(typeof payload[key] != 'function'){
								savePayload[key] = payload[key]
							}
						});
						payload['_id'] = self.generateSlug(payload['Title']);
						savePayload['Modified'] = moment().toISOString();
						savePayload['ModifiedBy'] = self.authenticationService.getAuthenticatedUser().UserName;
						savePayload['PlatformCode'] = self.authenticationService.getUserFirmCode();
						//savePayload['PromoterCode'] = self.authenticationService.getPromoterCode();
						let containers = this.getContentTypeMeta().getComponentContainerTypes();
						if(containers && containers.length > 0){
							containers.forEach(container => {
								let components = container.getComponents();
								if(components && components.length > 0){
									let componentsPayload = [];
									components.forEach(component => {
										let instances = component.getInstances();
										if(instances.length > 0){
											instances.forEach(instance => {
												let componentPayload = {};
												componentPayload['ComponentType'] = instance['UniqueName'];
												componentPayload['sortIndex'] = !isNaN(instance['sortIndex']) ? instance['sortIndex'] : componentsPayload.length;
												let fields = instance.getFields();
												if(fields && fields.length > 0){
													fields.forEach(field => {
														delete field['instanceFieldId'];
														let id = (field['UniqueName']) ? field['UniqueName'] : field['id'];
														componentPayload[id] = (field['NewValue']) ? field['NewValue'] : field['Value'] || null;
													})
												}
												componentsPayload.push(componentPayload);
											});
											componentsPayload.sort( (a,b) => { return a.sortIndex - b.sortIndex; } );
										}
									});
									savePayload[container['_id']] = container['_id'] == "ShareComponentContainerType" ? componentsPayload[0] : componentsPayload;
								}else{
									savePayload[container['_id']] = container['_id'] == "ShareComponentContainerType" ? {} : [];
								}
							});
						}
						delete savePayload['deletedComponentInstances'];
						return self.http.put(self.apiUrl + '/' + 'Content/' + savePayload['_id'], savePayload, { headers: self.getHeaders() })
		            	.map((response) => {
		            		return (response && response["_body"]) ? response.json() : '';
		        		})
						.catch((response) => self.handleError(response))
						.publishReplay(1).refCount();;
					}
	        		return payload;
	            })
	            .catch((res) => this.handleError(res))
	            .publishReplay(1).refCount();
	    })
	}
	public deleteContent(contentId : string) : Observable<any>{
		let executionUrl = this.apiUrl + '/' + 'Content' + '/' + contentId;
		let self = this;
       	return this.http.delete(executionUrl, { headers: this.getHeaders() })
            .map((response) => {
            	let payload = response.json();
            	return payload;
            })
            .catch((res) => this.handleError(res))
            .publishReplay(1).refCount();
	}
	public getContentsByContentType(contentTypeName: string, queryParams={}) : Observable<any>{
		let executionUrl = `${this.apiUrl}/Contents` + (contentTypeName ? `/${contentTypeName}` : '');
		return this.executeGet(executionUrl, {'search': queryParams})
	}
	public search(endpoint: string, targetField: string, searchValue: string, queryParams?: {}) {
		if(!queryParams) queryParams = {};
		queryParams["Query.Field"] = targetField;
		queryParams["Query.Search"] = searchValue;
		let executionUrl = `${this.apiUrl}/${endpoint}`;
		return this.executeGet(executionUrl, {'search': queryParams})
	}
	public getRelatedDataSourcesByContentType(contentTypeName : string) : string{
		return '';
	}
	public getComponentContainerTypesByContentType(contentTypeName : string) : string{
		return '';
	}
	private executeGet(executionUrl, options={}, map?) {

		options['headers'] = this.getHeaders();

		return this.http.get(executionUrl, options)
			.map(map ? map : this.mapJson)
			.catch((res) => this.handleError(res))
			.publishReplay(1).refCount();
	}
	private mapJson(response: Response): any[] {
		let payload = response.json();
		return payload;
	}
    private map(response: Response): any[] {
        let payload = response.json();
        if (payload) {
            let data: any[] = [];
            for (let p in payload) {
                data.push(payload[p]);
            }
            this.data.next(data);
            return data;
        }
    }
	private handleError(error: Response | any) {
        if(error.ErrorCode == 401){
			this.authenticationService.retryLoginOrLogout();
			return Observable.throw(error.json());
        }else{
			return Observable.throw(error.json());
        }
    }
    setHeader(type : string, value : any){
        let existType = this.headers.get(type);
        if(existType) {
            this.headers.set(type, value);
        }else{
            this.headers.append(type, value);
        }
    }
    private getHeaders(): any {
  		return this.headers;
    }
    public generateRandomUniqueID(length : number = 6){
    	return 'x'.repeat(length).replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		});
    }
    public generateSlug(title : string){
		return this.slugify(title) + '-' + this.generateRandomUniqueID(4);
		// return title.toString().toLowerCase().trim()
	    // 	.replace(/\s+/g, '-')
		//     .replace(/&/g, '-and-')
		//     .replace(/[^\w\-]+/g, '')
		//     .replace(/\-\-+/g, '-') + '-'+ this.generateRandomUniqueID(4);
    }
	private slugify (text) {
		const a = 'àáäâèéëêıìíïîòóöôùúüûñçüßÿœæŕśşńṕẃǵğǹḿǘẍźḧ·/_,:;'
		const b = 'aaaaeeeeiiiiioooouuuuncusyoarssnpwggnmuxzh------'
		const p = new RegExp(a.split('').join('|'), 'g')

		return text.toString().toLowerCase()
			.replace(/\s+/g, '-')
			.replace(p, c => b.charAt(a.indexOf(c)))
			.replace(/&/g, '-and-')
			.replace(/[^\w\-]+/g, '')
			.replace(/\-\-+/g, '-')
			.replace(/^-+/, '')
			.replace(/-+$/, '');
	}
}
