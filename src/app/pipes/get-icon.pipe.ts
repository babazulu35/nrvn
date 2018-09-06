import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'getIcon'
})
export class GetIconPipe implements PipeTransform {

    private icons = {
        context: [
            {action: 'copy', icon: 'layers'},
            {action: 'visibility_off', icon: 'visibility_off'},
            {action: 'archive', icon: 'archive'},
            {action: 'edit', icon: 'edit'},
            {action: 'remove', icon: 'delete'},
            {action: 'delete', icon: 'delete'}
        ],
        event: [
            {action: 'copyEvent', icon: 'layers'},
            {action: 'editEvent', icon: 'edit'},
            {action: 'startSale', icon: 'play'},
            {action: 'stopSale', icon: 'stop'},
            {action: 'startPublish', icon: 'publish'},
            {action: 'stopPublish', icon: 'stop'}
        ] 
    }
    transform(action:string, iconSet:string): string {
        if(!this.icons[iconSet]) return null;
        let icon:string = null;

        this.icons[iconSet].forEach(f => {
            if(f["action"] == action) {
                icon = f["icon"];
            }
        });
        return icon;
    }

}
