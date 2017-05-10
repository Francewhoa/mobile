import { Component, ChangeDetectionStrategy } from "@angular/core";
import { ModalController, MenuController, Platform } from 'ionic-angular';

import { CaptureComponent } from '../capture/capture.component';
import { MessengerList } from "../messenger/list.component";
import { NewsfeedList } from "../newsfeed/list.component";
import { NotificationsList } from "../notifications/list.component";
import { DiscoveryList } from "../discovery/list.component";


@Component({
  moduleId: 'module.id',
  selector: "minds-tabs",
  templateUrl: "tabs.component.html",
  //styleUrls: [ 'tabs.component.css' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TabsComponent {

  selectedIndex = 0;

  tabs = {
    newsfeed: NewsfeedList,
    discovery: DiscoveryList,
    notifications: NotificationsList,
    messenger: MessengerList
  }


  constructor(private modalCtrl : ModalController, private menuCtrl : MenuController, private platform : Platform){
  }

  ngOnInit(){
    this.platform.ready().then(() => {
      (<any>window).plugins.intent.setNewIntentHandler(intent => {
        if(intent.action == 'android.intent.action.SEND'){
          let text = intent.clipItems[0].text;
          this.modalCtrl.create(CaptureComponent, { message: text })
            .present();
        }
      });
    });
  }

  openCapture(){
    this.modalCtrl.create(CaptureComponent)
      .present();
  }

  openMenu(){
    this.menuCtrl.open();
  }

}
