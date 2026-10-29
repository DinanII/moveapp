import { Component } from '@angular/core';
import { DatabaseManager } from '../../services/DatabaseManager';

@Component({
  imports: [],
  selector: 'app-settings',
  styleUrl: './settings.css',
  templateUrl: './settings.html',
})
export class Settings {
  protected resetDatabase() {
    DatabaseManager.resetDatabase()
  }
}
