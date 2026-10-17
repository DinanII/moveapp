import { Component, Input, output } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-text-box',
  styleUrl: './text-box.css',
  templateUrl: './text-box.html',
})
export class TextBox {

  @Input({ required: false }) textBoxName: string = Date.now().toString()

  @Input({ required: false }) textBoxId: string = (Date.now() * 1.005).toString()

  @Input({ required: false }) labelText: string = "Textbox label"

  @Input({ required: false }) placeholderText: string = ""

  @Input({ required: false }) maxLength: number = 25;

  @Input({ required: false }) fieldComment: string = ""

  @Input({ required: false }) containerStyles: string = ""

  @Input({required: false}) prefillText: string = ""

  // private inputText: string = ""

  // private isInitialized: boolean = false;

  public onTextChange = output<string>()

  // ngOnInit() {
  //   this
  // }

  protected onTextChanged(event: Event): void {
    event.preventDefault();
    const inputValue = (event.target as HTMLInputElement).value;
    this.onTextChange.emit(inputValue);
  }
}

