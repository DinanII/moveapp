import { Component } from '@angular/core';
import { TextBox } from '../../components/userinput/text-box/text-box';

@Component({
  imports: [TextBox],
  selector: 'app-activity-detail',
  styleUrl: './activity-detail.css',
  templateUrl: './activity-detail.html',
})
export class ActivityDetail {

  onNameChange(newText: string) {
    console.log(`Text changed! ${newText}`)
  }
}
