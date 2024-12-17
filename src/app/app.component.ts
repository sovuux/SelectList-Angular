import { Component } from '@angular/core';
import { SelectListComponent } from "./components/select-list/select-list.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [SelectListComponent]
})
export class AppComponent {
  title = 'angular-select-list';
}
