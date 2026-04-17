import { Component, inject } from '@angular/core'; //OnInit
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Location } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [MatSidenavModule, MatToolbarModule, MatListModule, RouterLink, RouterLinkActive, MatIconModule, MatButtonModule, RouterOutlet]
})
export class AppComponent {//implements OnInit
  title = 'Ready4Learning';
  route: string;

  // /** Inserted by Angular inject() migration for backwards compatibility */
  // constructor(...args: unknown[]);

  constructor() {
    const location = inject(Location);
    const router = inject(Router);

    router.events.subscribe(() => {
      if(location.path() != '') {
        this.route = location.path();
      } else {
        this.route = 'Home'
      }
    });
  }

  // ngOnInit() {
  // }
}