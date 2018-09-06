import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-slider-input',
  templateUrl: './slider-input.component.html',
  styleUrls: ['./slider-input.component.scss']
})
export class SliderInputComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  	/*
  		var slider = document.getElementById('slider');

		noUiSlider.create(slider, {
			start: [20],
			connect: true,
			range: {
				'min': -100,
				'max': 100
			}
		});

		var directionField = document.getElementById('value');
		slider.noUiSlider.on('update', function( values, handle ){
			directionField.innerHTML = values[handle];
		});
  	*/
  }

}
