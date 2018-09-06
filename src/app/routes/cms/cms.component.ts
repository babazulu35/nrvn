import { Component, OnInit } from '@angular/core';
import { CmsDataService } from '../../services/cms-data.service';

@Component({
	selector: 'app-cms',
	templateUrl: './cms.component.html',
	styleUrls: ['./cms.component.scss'],
	providers: [CmsDataService]
})
export class CmsComponent implements OnInit {

	constructor(private cmsDataService: CmsDataService) { }

	ngOnInit() {
		// this.cmsDataService.getLovs().subscribe( result => {
		// 	console.log("lovs : ", result);
		// })
		// this.cmsDataService.getPublishingPointsByContentType('getPublishingPointsByContentType').subscribe( result => {
		// 	console.log("resutl : ", result);
		// })
		// this.cmsDataService.getContentType('DenemeContentType', true).subscribe( result => {
		// 	console.log(result);
		// 	console.log(result.getPublishingPoints());
		// })
/*
		let sub2 = this.cmsDataService.getContent('deneme-168');
		sub2.subscribe(result => {
			console.log('result', result)
			console.log('getContentTypeMeta() => meta: ', result.getContentTypeMeta())
			console.log('getContentTypeMeta().getComponentContainers() => values: ', result.getContentTypeMeta().getComponentContainerTypes())
			console.log('getDatasources()', result.getDatasources())
			console.log('getComponentContainerTypes() => values: ', result.getComponentContainerTypes())
			let x = result.getContentTypeMeta().getComponentContainerTypes();
			x.forEach(i => {
				//console.log('getComponents', i.getComponents())
				//console.log('getComponentInstances',i.getComponentInstances())
				let xc = i.getComponents();
				xc.forEach(c => {
					let instances = c.getInstances();
					let first = instances[0];
					c.deleteInstance(first);
					let fiedls = first.getFields();
					first.setField(fiedls[0]['tempId'], 'test test test!!!');
				})
			})
			result.save().subscribe(save => {
				console.log(save);
			})

		})

/*
		let sub3 = this.cmsDataService.getContentType('eventdetailContentType2');
		sub3.subscribe(result => {
			let containers = result.getComponentContainerTypes();
			console.log('result',result)
			console.log('getComponentContainers',containers)
			containers.forEach(cont => {
				let components = cont.getComponents();
				console.log('components',components)
				components.forEach(comp => {
					let fields = comp.getFields();
					console.log('fields',fields);
				})
			})
		});
*/
/*
		let content = this.cmsDataService.createContent('DenemeContentType');
		content.subscribe(result => {
				let container = result.getContentType().getComponentContainerTypes()[0];
				let component = container.getComponents()[0];
				let fields = component.getFields();
				let newComponent1 = component.createComponent();
				let newComponent2 = component.createComponent();
				newComponent1.setFields([{UniqueName:'EventVideo', Value:'1' }]);
				newComponent2.setFields([{UniqueName:'EventVideo', Value:'2' }]);
				container.saveComponent(newComponent1);
				container.saveComponent(newComponent2);
				newComponent1.setFields([{UniqueName:'EventVideo', Value:'3' }]);
				container.saveComponent(newComponent1);
				//container.deleteInstance(newComponent2);
				result.set('Title','test');
				result.set('EventInfo',[{at:'test'}]);
				result.set('NirvanaId','44');
				result.set('Id','nirvana-cms-test-te');
				result.save()
				// console.log(container.getComponents(), result.getContentType().getComponentContainerTypes()[0].getComponents());
		})
		*/

/*
		if(content.contentType){
			content.contentType.getComponentContainerTypes()[0]
				let component = content.getComponentContainerTypes()[0][0]
				console.log('component',component)
				let fields = component.getFields();
				console.log('fields',fields);
		}
*/
/*
		let sub2 = this.cmsDataService.getContent('deneme-168');
		sub2.subscribe(result => {
			let x = result.getContentTypeMeta().getComponentContainerTypes();
			let container = x[0];
			let components = container.getComponents();
			let comp = components[0];
			// let newComponent1 = comp.createComponent();
			// newComponent1.setFields([{UniqueName:'EventType', Value:'test 1' }]);
			// container.saveComponent(newComponent1);
			// let newComponent2 = comp.createComponent();
			// newComponent2.setFields([{UniqueName:'EventType', Value:'test 2' }]);
			// container.saveComponent(newComponent2);
			let instances = comp.getInstances();
			container.deleteInstance(instances[0]);
			result.save().subscribe(save => {
				console.log("saved : ", save);
				this.cmsDataService.getContent('instaces-test-abcb').subscribe(
					result2 => {
						let x = result2.getContentTypeMeta().getComponentContainerTypes();
						let container = x[0];
						let components = container.getComponents();
						components.forEach( item => {
							console.log(item.getInstances());
							let compInstances = item.getInstances();
							compInstances.forEach( componentInstance => {
								console.log(componentInstance, componentInstance.getFields());
							})
						})
					}
				);
			})
		})
		*/
		/*
			let sub2 = this.cmsDataService.getContent('set-field-test-8383');
        sub2.subscribe(result => {
            let x = result.getContentTypeMeta().getComponentContainerTypes();
            let container = x[0];
            let components = container.getComponents();
            let comp = components[0];
            // let newComponent1 = comp.createComponent();
            // newComponent1.setFields([{UniqueName:'EventType', Value:'test 1' }]);
            // container.saveComponent(newComponent1);
            // let newComponent2 = comp.createComponent();
            // newComponent2.setFields([{UniqueName:'EventType', Value:'test 2' }]);
            // container.saveComponent(newComponent2);
            let instances = comp.getInstances();
			console.log(instances[0].Fields[5]);
			instances[0].setFields([{UniqueName:'EventDescriptiom', Value:'new value' }]);
            result.save().subscribe(save => {
                console.log("saved : ", save);
                this.cmsDataService.getContent('set-field-test-8383').subscribe(
                    result2 => {
                        let x = result2.getContentTypeMeta().getComponentContainerTypes();
                        let container = x[0];
                        let components = container.getComponents();
                        let comp = components[0];
                        let instances = comp.getInstances();
						console.log(instances[0].Fields[5]);
            			console.log('instances after save', instances)
                    }
                );
            })
        })
        */
	}

}
