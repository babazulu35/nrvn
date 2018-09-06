import { URLSearchParams } from "@angular/http";
export class QueryManager {
	private filterQuery : string;
	private orderQuery : string;
	private fromQuery : string;
	private rawQuery : string;
	private orStatements : Array<string> = [];
	private andStatements : Array<string> = [];
	private expandStatements : Array<any> = [];
	private selectStatements : Array<any> = [];
	private filterOnExpandStatements : Array<any> = [];
	private searchOnExpandStatements : Array<any> = [];
	private selectOnExpandStatements : Array<any> = [];
	private currentPage : number = 0;
	private pageSize : number = 20;
	private entityName : string;
	private searchTerm : {on:string, value:any};
	private enumCastPrefix : string =  'Nirvana.Shared.Enums';
	constructor() {

    }
    public fromEntity(entity : string){
    	this.flushQueryManagerParams();
    	this.entityName = entity;
    	return this;
    }
	public where(propertyName : string, operator : string, value : any, cast ?: string) : any{
		if(cast){
			value = "cast('" + value + "', " + this.enumCastPrefix + "." + cast + ")";
		}
		this.filterQuery = this.createQueryBit(propertyName, operator, value);
		return this;
	}
	public whereRaw(query : string) : any{
		this.filterQuery = query;
		return this;
	}
	public or(propertyName : any, operator : string, value : string, cast ?: string) : any{
		if(this.filterQuery){
			let queryBit = '';
			if(typeof propertyName === 'object'){
				queryBit = '(';
				propertyName.forEach(statement => {
					if(typeof statement == 'string'){
						queryBit += ' '+ statement + ' ';
					}else{
						queryBit += this.createQueryBit(statement[0], statement[1], statement[2]);
					}
				});
				queryBit += ')';
			}else{
				if(cast){
					value = "cast('" + value + "', " + this.enumCastPrefix + "." + cast + ")";
				}
				queryBit = this.createQueryBit(propertyName, operator, value);
			}
			this.orStatements.push(queryBit);
		}else{
			throw "QUERY MANAGER ERROR: Where statement has to be set to use OR method";
		}
		return this;
	}
	public orRaw(query : string) : any{
		if(this.filterQuery){
			this.orStatements.push(query);
			return this;
		}else{
			throw "QUERY MANAGER ERROR: Where statement has to be set to use OR method";
		}
	}
	public and(propertyName : any, operator : string, value : any, cast ?: string) : any{
		if(this.filterQuery){
			let queryBit = '';
			if(typeof propertyName === 'object'){
				queryBit = '(';
				propertyName.forEach(statement => {
					if(typeof statement == 'string'){
						queryBit += ' '+ statement + ' ';
					}else{
						queryBit += this.createQueryBit(statement[0], statement[1], statement[2]);
					}
				});
				queryBit += ')';
			}else{
				if(cast){
					value = "cast('" + value + "', " + this.enumCastPrefix + "." + cast + ")";
				}
				queryBit = this.createQueryBit(propertyName, operator, value);
			}
			this.andStatements.push(queryBit);
		}else{
			throw "QUERY MANAGER ERROR: Where statement has to be set to use AND method";
		}
		return this;
	}
	public andRaw(query : string) : any{
		if(this.filterQuery){
			let queryBit = '';
			this.andStatements.push(query);
		}else{
			throw "QUERY MANAGER ERROR: Where statement has to be set to use AND method";
		}
		return this;
	}
	public expand(properties : Array<any>){
		this.expandStatements.push(properties);
		return this;
	}
	public filterOnExpand(propertyName : string, operator : string, value : any, index : number = 0){
		this.filterOnExpandStatements[index] = '($filter=' + propertyName + ' ' + this.convertOperator(operator) + ' ' + value + ')';
		return this;
	}
	public searchOnExpand(on : string, value : any, index : number = 0){
		this.searchOnExpandStatements[index] = "contains(" + on + ",'" + value + "')";
		return this;
	}
	public selectOnExpand(value : Array<any>, index : number = 0){
		this.selectOnExpandStatements[index] =  value ;
		return this;
	}
	public search(on : string, value: any){
		this.searchTerm = {on: on, value: value};
		return this;
	}
	public orderBy(propertyName : string, type :string){
		this.orderQuery = propertyName + ' ' + type;
		return this;
	}
	public take( size : number){
		this.pageSize = size;
		return this;
	}
	public page( page : number){
		this.currentPage = page;
		return this;
	}
	public select(propertyName : any) : any{
		if(typeof propertyName == 'string'){
			this.selectStatements.push(propertyName);
		}else{
			this.selectStatements = propertyName;
		}
		return this;
	}
	public getCount(){

	}
	public inlineCount(){

	}
	public raw(rawQuery : string){
		this.rawQuery = rawQuery;
	}
	public getQuery(){
		if(this.entityName){
			let queryParams = new URLSearchParams();
			queryParams.append('entityName', this.entityName);
	        queryParams.append('PageSize', String(this.pageSize));
	        let page = this.currentPage <= 0 ? 0 : this.currentPage - 1;
			queryParams.append('Page', String(page));
	        let query =  null;
	        if(this.filterQuery){
	        	query = this.filterQuery;
	        }
			if(this.orStatements && this.orStatements.length > 0){
				this.orStatements.forEach(or => {
					query += ' or ' + or;
				})
			}
			if(this.andStatements && this.andStatements.length > 0){
				this.andStatements.forEach(and => {
					query += ' and ' + and;
				})
			}
			if (query || this.searchTerm) {
				if (this.searchTerm && this.searchTerm.value) {
					if (!query) {
						query = '';
					} else {
						query += ' and ';
					}

					if ((!this.searchTerm.on || this.searchTerm.on === '') && this.searchTerm.value) {
						query += this.searchTerm.value;
					} else {
						query += "contains(" + this.searchTerm.on + ",'" + this.searchTerm.value + "')";
					}

				}
				queryParams.append('$filter', query);
			}
			if(this.orderQuery){
				queryParams.append('$orderby',this.orderQuery);
			}
			if(this.searchTerm){
				//queryParams.append('$search',"'" + this.searchTerm.value + "'");
			}
			let expandStatement = '';
			let filterOnExpandStatements = '';

			if(this.expandStatements && this.expandStatements.length > 0){
				let expandStatementIndex = 0;
				this.expandStatements.forEach(expands => {
					let numberOfExpandedProperty = expands.length;
					for(let i in expands){
						let expandIndex = Number(i);
						if(expandIndex == 0){
							expandStatement += expands[i];
							if(this.selectOnExpandStatements[expandStatementIndex]){
								expandStatement += '($select=' + this.selectOnExpandStatements[expandStatementIndex].join(",");
							}
						}else{
							if(expandIndex == 1 && this.selectOnExpandStatements[expandStatementIndex]){
								expandStatement += ';$expand='+ expands[i];
							}else{
								expandStatement += '($expand='+ expands[i];
							}
						}
						if(numberOfExpandedProperty - 1 == expandIndex && this.filterOnExpandStatements[expandStatementIndex]){
							expandStatement += this.filterOnExpandStatements[expandStatementIndex];
						}
						if(numberOfExpandedProperty - 1 == expandIndex && this.searchOnExpandStatements[expandStatementIndex]){
							expandStatement += '($filter=' + this.searchOnExpandStatements[expandStatementIndex] + ')';
						}
					}
					if(numberOfExpandedProperty > 1){
						expandStatement += Array(numberOfExpandedProperty).join(")");
					}
					expandStatement += ',';
					expandStatementIndex++;
				})
				queryParams.append('$expand',expandStatement.slice(0,-1));
			}
			if(this.selectStatements && this.selectStatements.length > 0){
				queryParams.append('$select',this.selectStatements.join(","));
	        }

	       	return queryParams;
       	}else{
       		throw "QUERY MANAGER ERROR: Entity name has to be set";
       	}
	}
	private createQueryBit(propertyName : string, operator : string, value : string) : string{
		let odataOperator = this.convertOperator(operator);
		return propertyName + ' ' + odataOperator + ' ' + value;
	}
	private convertOperator(operator : string) : string{
		let operators = {'=':'eq', '!=' : 'ne', '>' : 'gt', '<':'lt'};
		if(operators[operator]){
			return operators[operator];
		}else{
			throw "QUERY MANAGER ERROR: Selected operator do not match with defined operators.";
		}
	}
	private flushQueryManagerParams(){
		this.filterQuery = '';
		this.orderQuery = '';
		this.fromQuery = '';
		this.selectStatements = [];
		this.orStatements = [];
		this.andStatements = [];
		this.expandStatements = [];
		this.filterOnExpandStatements  = [];
		this.searchOnExpandStatements = [];
		this.currentPage = 0;
		this.pageSize  = 20;
		this.entityName = '';
		this.searchTerm  = null;
	}
}
