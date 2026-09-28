import { Component, Input, output } from '@angular/core';

/**
 * A Switch component for user input
 * 
 * @example
 * 
 * In the component template / HTML:
 * <app-switch labelText="Location" (onSwitchToggle)="handleToggle($event)" />
 * 
 * In the code behind of the parent component
 * import { Switch } from '../../path/to/component';
 * 
 * // The event handler
 * handleToggle(isToggled: boolean) {
 *  console.log(isToggled);
 * }
 */
@Component({
  imports: [],
  selector: 'app-switch',
  styleUrl: './switch.css',
  templateUrl: './switch.html',
})
export class Switch {

  /**
   * The text to show next to the input element.
   */
  @Input({ required: true }) labelText: string = "Switch label"

  /**
   * Optional. The initial value can be set with this Input parameter.
   * Pass true to set the switch on. If the switch shouls be turned off, 
   * do not pass this param or set to false
   */
  @Input({required: false}) intialValue: boolean = false

  /**
   * Optional. Initially disable the switch input control. Leave empty or pass true
   * to enable the element
   */
  @Input({required: false}) initialEnabled: boolean = true


  protected isEnabled = true;

  /**
   * An output that emits a boolean when the switch is toggled.
   * true = switch is turned on, false = switch is turned off.
   */
  onSwitchToggle = output<boolean>();

  /**
   * Fires whenever the switch input gets changed and attempts to emit {@link onSwitchToggle} if event.target.checked has a boolean value 
   * Error gets logged otherwise and {@link onSwitchToggle} doesn't emit.
   * @param event The event object from the input element when the user changes the input.
   * @returns void
   */
  protected onSwitchToggled(event: Event): void {
    // Extract the input value from the element to make sure it's checked
    const isChecked = (event.target as HTMLInputElement).checked;

    // Ensure it's a bool
    if(typeof isChecked == 'boolean') {
      this.onSwitchToggle.emit(isChecked);
      return;
    }
    console.error(`isChecked is not of the expected type boolean. Actual type: ${typeof isChecked}, value: ${isChecked}`);
  }

  ngOnInit() {
    this.isEnabled = this.initialEnabled;
  }

  public setIsEnabled(isEnabled: boolean) {
    this.isEnabled = isEnabled
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }
}

// Is this an older way to create an output? When working on this one, don't forget to import EventEmitter and Output (Output with an capital 'O')
// @Output({switchState?: boolean}) switchToggle: boolean = new EventEmitter<boolean>();