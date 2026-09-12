import { Component, Input } from '@angular/core';

/**
 * A Switch component for user input
 * @example
 * <app-switch labelText="Location permission" initialValue="hasConsent"></app-switch>
 */
@Component({
  imports: [],
  selector: 'app-switch',
  styleUrl: './switch.css',
  templateUrl: './switch.html',
})
export class Switch {

  /**
   * The text to show next to the input element
   */
  @Input({required: true}) labelText: string = "Switch label"

  /**
   * Optional. The initial value can be set with this Input parameter.
   * Pass true to set the switch on. If the switch shouls be turned off, 
   * do not pass this param or set to false
   */
  @Input({required: false}) intialValue: boolean = false
}
