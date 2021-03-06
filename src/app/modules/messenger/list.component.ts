import { Component, OnInit, OnDestroy, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';

import { ChannelComponent } from '../channel/channel.component';
import { Client } from '../../common/services/api/client';
import { Storage } from '../../common/services/storage';

import { MessengerSetup } from './setup.component';
import { MessengerView } from './view.component';

import { CONFIG } from '../../config';
import { SocketsService } from "../../common/services/api/sockets.service";

@Component({
  moduleId: 'module.id',
  selector: 'messenger-list',
  templateUrl: 'list.component.html',
  //styleUrls: ['list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class MessengerList implements OnInit, OnDestroy {

  conversations : Array<any> = [];
  offset : string = "";
  inProgress : boolean = true;

  components = {
    view: MessengerView,
    channel: ChannelComponent
  }

  minds = {
    cdn_url: CONFIG.cdnUrl
  }

  constructor(private client : Client, private cd : ChangeDetectorRef, private nav : NavController,
    private storage : Storage, private actionSheetCtrl : ActionSheetController, private sockets: SocketsService){

  }

  ngOnInit(){
    if(!this.storage.get('private-key')){
      return this.nav.setRoot(MessengerSetup);
    }
    this.loadList()
      .then(() => {
        this.listen();
      });
  }

  ngOnDestroy() {
    this.unListen();
  }

  loadList(refresh : boolean = false){
    if(refresh){
      this.offset = "";
    }
    return new Promise((res, err) => {
      this.inProgress = true;
      this.client.get('api/v2/conversations', { limit: 12, offset: this.offset})
        .then((response : any) => {
          if(refresh){
            this.conversations = [];
          }
          //console.log(response);
          for(let convo of response.conversations){
            this.conversations.push(convo);
          }
          this.inProgress = false;
          this.offset = response['load-next'];
          res();
          this.detectChanges();
        });
    });
  }

  refresh(puller){
    puller.complete();

    this.loadList(true)
      .then(() => {
        puller.complete();
      });
  }

  loadMore(e){
    this.loadList()
      .then(() => {
        e.complete();
      });
  }

  search(q : string){
    if(!q){
      return this.loadList(true);
    }
    this.client.get('api/v2/conversations/search', {
        q: q,
        //type: this.type,
        limit: 12,
        offset: ""
      })
      .then((response : any) => {
        this.conversations = response.conversations;
        this.offset = response['load-next'];
        this.inProgress = false;
      });
  }

  openOptions(i, e){
    e.preventDefault();

    let buttons = [{
        text: 'Delete',
        icon: 'md-trash',
        role: 'destructive',
        handler: () => {
          this.client.delete('api/v2/conversations/' + this.conversations[i].guid);
          this.conversations.splice(i,1);
          this.detectChanges();
        }
      },
      {
        text: 'Cancel',
        icons: 'md-cancel',
        role: 'cancel'
      }];

    let actionSheet = this.actionSheetCtrl.create({
      buttons: buttons
    });
    actionSheet.present();
  }

  socketSubscriptions = {
    touchConversation: null
  };

  listen() {
    this.socketSubscriptions.touchConversation = this.sockets.subscribe('touchConversation', (guid) => {
      for (var i in this.conversations) {
        if (this.conversations[i].guid == guid) {
          this.conversations[i].unread = true;
          this.detectChanges();
          return;
        }
      }
    });
  }

  unListen() {
    for (let sub in this.socketSubscriptions) {
      if (this.socketSubscriptions[sub]) {
        this.socketSubscriptions[sub].unsubscribe();
      }
    }
  }

  openMessengerOptions() {
    let actionSheet = this.actionSheetCtrl.create({
      title: '',
      buttons: [
        {
          text: 'Change password',
          handler: () => {
            this.changePassword();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
          }
        }
      ]
    });

    actionSheet.present();
  }

  private changePassword(){
    this.nav.push(MessengerSetup, { changePassword : true });
  }

  private detectChanges() {
    this.cd.markForCheck();
    this.cd.detectChanges();
  }

}
