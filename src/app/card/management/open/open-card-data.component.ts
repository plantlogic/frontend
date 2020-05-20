import {Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import {AlertService} from '../../../_interact/alert/alert.service';
import {Card, WorkType} from '../../../_dto/card/card';
import {TitleService} from '../../../_interact/title.service';
import {NavService} from '../../../_interact/nav.service';
import {ActivatedRoute} from '@angular/router';
import {CardViewService} from '../../../_api/card-view.service';
import {CardEditService} from '../../../_api/card-edit.service';
import {AuthService} from '../../../_auth/auth.service';
import {PlRole} from '../../../_dto/user/pl-role.enum';
import {Alert} from '../../../_interact/alert/alert';
import {NgModel} from '@angular/forms';
import {TractorEntry} from '../../../_dto/card/tractor-entry';
import {IrrigationEntry} from '../../../_dto/card/irrigation-entry';
import {Chemical} from '../../../_dto/card/chemical';
import {Chemicals} from '../../../_dto/card/chemicals';
import {Commodities} from '../../../_dto/card/commodities';
import {CommonFormDataService} from 'src/app/_api/common-form-data.service';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { Comment } from 'src/app/_dto/card/comment';

@Component({
  selector: 'app-open-card',
  templateUrl: './open-card-data.component.html',
  styleUrls: ['./open-card-data.component.scss']
})
export class OpenCardDataComponent implements OnInit {

  constructor(private titleService: TitleService, private cardView: CardViewService, private cardEdit: CardEditService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService, private common: CommonFormDataService) { }

  card: Card;
  // Additional values will be attached to comments, so use a separate variable
  comments = [];
  editable: boolean;
  editing = false;
  editingComment = false;
  commentsCollapsed = true;
  commentsFilter = 'all';
  cardShippers = [];
  multiSelectSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'value',
    selectAllText: 'Select All',
    unSelectAllText: 'Unselect All',
    itemsShowLimit: 5,
    allowSearchFilter: true
  };

  // create array of common keys, whose data is needed for card entry. Omit restricted options.
  commonKeys = (this.isShipper()) ? ['bedTypes', 'commodities', 'shippers'] :
                ['bedTypes', 'chemicals', 'chemicalRateUnits', 'commodities',
                'fertilizers', 'irrigationMethod', 'irrigators', 'shippers', 'tractorOperators',
                'tractorWork'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('View Card');
    this.initCommon(c => {
      this.commonKeys.forEach(key => {
        tempThis[key] = c[key];
      });
      this[`ranches`] = c[`ranches`];
      this.loadCardData();
    });
    this.editable = this.auth.hasPermission(PlRole.DATA_EDIT)
                 || this.auth.hasPermission(PlRole.CONTRACTOR_EDIT);
  }

  public addComment(): void {
    const c: Comment = new Comment();
    c.author = this.auth.getName();
    if (this.isShipper()) {
      c.author = '{' + this.getShipper(this.auth.getShipperID()) + '} ' + c.author;
    }
    c.userName = this.auth.getUsername();
    c.body = '';
    c.dateCreated = new Date().valueOf();
    c.dateModified = c.dateCreated;
    c.role = this.getCommentRole();
    this.comments.push(c);
  }

  public addCommodities(): void {
    this.card.commodityArray.push(new Commodities());
  }

  public addTractorData(): void {
    this.card.tractorArray.push(new TractorEntry());
  }

  public addIrrigationData(): void {
    this.card.irrigationArray.push(new IrrigationEntry());
  }

  public addPreChemicals(): void {
    this.card.preChemicalArray.push(new Chemicals());
  }

  public addTractorChemical(index: number): void {
    if (this.card.tractorArray.length > 0 && !this.card.tractorArray[index].chemicalsFull()) {
      this.card.tractorArray[index].chemicalArray.push(new Chemical());
    }
  }

  public addTractorFertilizer(index: number): void {
    if (this.card.tractorArray.length > 0 && !this.card.tractorArray[index].fertilizersFull()) {
      this.card.tractorArray[index].fertilizerArray.push(new Chemical());
    }
  }

  public addIrrigationChemical(index: number): void {
    if (this.card.irrigationArray.length > 0 && !this.card.irrigationArray[index].chemicalsFull()) {
      this.card.irrigationArray[index].chemicalArray.push(new Chemical());
    }
  }

  public addIrrigationFertilizer(index: number): void {
    if (this.card.irrigationArray.length > 0 && !this.card.irrigationArray[index].fertilizersFull()) {
      this.card.irrigationArray[index].fertilizerArray.push(new Chemical());
    }
  }

  public canDeleteComment(comment: Comment): boolean {
    if (!this.editing && !this.editingComment) {
      return false;
    }
    if (this.auth.getUsername() === comment.userName) {
      return true;
    } else if (this.auth.hasPermission(PlRole.DATA_EDIT) || this.auth.hasPermission(PlRole.CONTRACTOR_EDIT)) {
      return true;
    }
    return false;
  }

  public canEditComment(comment: Comment): boolean {
    if (!this.editing && !this.editingComment) {
      return false;
    }
    if (this.auth.getUsername() === comment.userName) {
      return true;
    }
    return false;
  }

  public clearChanges(): void {
    const newAlert = new Alert();
    newAlert.color = 'warning';
    newAlert.title = 'Clear Changes';
    newAlert.message = 'This will clear all changes made to the card, and cannot be undone. Continue?';
    newAlert.actionName = 'Clear';
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.loadCardData();
      if (this.editing) { this.toggleEditing(); }
      if (this.editingComment) { this.toggleEditingComment(); }
    });
    AlertService.newAlert(newAlert);
  }

  public collapseToggle(htmlId: string): void {
    const element = document.getElementById(htmlId);
    if (element) {element.classList.toggle('collapse'); }
  }

  private dataListOptionValueToID(optionValue: string, dataListID: string): string {
    const option = document.querySelector('#' + dataListID + ' [value="' + optionValue + '"]') as HTMLElement;
    return (option) ? option.id : null;
  }

  private deleteCard(): void {
    const newAlert = new Alert();
    newAlert.color = 'danger';
    newAlert.title = 'WARNING: Deleting Card Permanently';
    newAlert.message = 'Are you sure you want to delete this card? This action cannot be reversed.';
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.actionName = 'Permanently Delete';
    newAlert.actionClosesAlert = true;
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.cardEdit.deleteCard(this.card.id).subscribe(data => {
          if (data.success) {
            AlertService.newBasicAlert('Card deleted successfully!', false);
            this.nav.goBack();
          } else {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        });
    });

    AlertService.newAlert(newAlert);
  }

  public deleteComment(index: number): boolean {
    if (this.commentsFilter !== 'all') {
      let fixedIndex = -1;
      let current = 0;
      // Index references the order number relative to the filter (shipper / grower / etc...)
      // Find index relative to all comments
      for (let i = 0; i < this.comments.length; i++) {
        if (fixedIndex === -1) {
          if (this.comments[i].role === this.commentsFilter) {
            if (current === index) { fixedIndex = i; }
            current += 1;
          }
        }
      }
      if (fixedIndex === -1) {
        AlertService.newBasicAlert('Error when deleting comment', true);
        return false;
      }
      index = fixedIndex;
    }
    const comment = this.comments[index];
    if (comment.userName !== this.auth.getUsername()) {
      if (!this.auth.hasPermission(PlRole.DATA_EDIT) && !this.auth.hasPermission(PlRole.CONTRACTOR_EDIT)) {
        AlertService.newBasicAlert('Edit permission is needed to delete comments which aren\'t your own', true);
        return false;
      } else {
        const newAlert = new Alert();
        newAlert.color = 'danger';
        newAlert.title = 'WARNING: Deleting Other Users Comment';
        newAlert.message = 'Are you sure you want to delete another user\'s comment?';
        newAlert.timeLeft = undefined;
        newAlert.blockPageInteraction = true;
        newAlert.actionName = 'Delete';
        newAlert.actionClosesAlert = true;
        newAlert.action$ = new EventEmitter<null>();
        newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
          this.comments[index].deleted = true;
          return true;
        });
        AlertService.newAlert(newAlert);
      }
    } else {
      this.comments[index].deleted = true;
      return true;
    }
  }

  public fixDate(d: string): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = Number(parts[2]);
    const month = Number(parts[1]) - 1; // 0 based
    const year = Number(parts[0]);
    return new Date(year, month, day);
  }

  public getActiveComments(filter?: string): number {
    if (filter) {
      return this.comments.filter(c => !c.deleted && (c.role === filter)).length;
    }
    return this.comments.filter(c => !c.deleted).length;
  }

  private getCommentRole(): string {
    if (this.auth.hasPermission(PlRole.DATA_ENTRY)) {
      return 'grower';
    } else if (this.auth.hasPermission(PlRole.SHIPPER)) {
      return 'shipper';
    } else {
      return 'none';
    }
  }

  public getComments(): Array<Comment> {
    const filter = this.commentsFilter;
    if (filter === 'grower') {
      return this.comments.filter(comment => comment.role === 'grower');
    } else if (filter === 'shipper') {
      return this.comments.filter(comment => comment.role === 'shipper');
    } else if (filter === 'all') {
      return this.comments;
    } else {
      console.log('Invalid comment filter');
      return this.comments;
    }
  }

  public getCommon(key): Array<any> {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[key]) ? this[key] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public getRanchName(id: string): string {
    return this[`ranches`].find(r => r.id === id).value;
  }

  private getSelectedShippers(): Array<string> {
    try {
      return (this.cardShippers) ? this.cardShippers.map(e => e.id) : [];
    } catch (e) {
      AlertService.newBasicAlert('Error When Reading Shippers', true);
      return [];
    }
  }

  private getShipper(id: string): string {
    if (this.isShipper()) {
      try {
        const shipper = this[`shippers`].find(e => e.id === id). value;
        return shipper;
      } catch (e) {
        return null;
      }
    } else {
      return null;
    }
  }

  public getVarieties(commodityID: string): Array<string> {
    try {
      const searchResult = this[`commodities`].find(e => e.id === commodityID).value.value;
      return searchResult;
    } catch (e) {
      return [];
    }
  }

  private iDToDataListOption(commonID: string, commonKey: string): string {
    const values = this.getCommon(commonKey);
    for (let i = 0; i < values.length; i++) {
      if (values[i].id === commonID) {
        return (i + 1) + ' - ' + values[i].value;
      }
    }
  }

  private initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues(data => {
      this.commonKeys.forEach(key => {
        if (CommonLookup[key].type === 'hashTable') {
          const temp = [];
          data[key].forEach(entry => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[key] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[key] = tempThis.common.sortCommonArray(data[key], key);
        }
      });
      if (this.isShipper()) {
        sortedCommon[`ranches`] = data[`ranches`];
      } else {
        sortedCommon[`ranches`] = data[`ranches`].filter(e => userRanchAccess.includes(e.id));
        sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      }
      f(sortedCommon);
    });
  }

  private initWorkTypes(): Array<string> {
    const keys = Object.keys(WorkType);
    return keys.slice(keys.length / 2);
  }

  public isCollapsed(htmlId: string): boolean {
    const element = document.getElementById(htmlId);
    if (element) {
      return element.classList.contains('collapse');
    } else {
      return true;
    }
  }

  public isShipper(): boolean {
    return this.auth.hasPermission(PlRole.SHIPPER);
  }

  private loadCardData(): void {
    const tempThis = this;
    this.route.params.subscribe(cr => {
      this.cardView.getCardById(cr.id).subscribe(
        data => {
          if (data.success) {
            tempThis.card = (new Card()).copyConstructor(data.data);
            tempThis.comments = (new Card()).copyConstructor(data.data).comments;
            tempThis.card.initTotalAcres();
            // Set up shippers multiselect
            tempThis.common.getValues('shippers', shippers => {
              tempThis.cardShippers = shippers.filter(e => {
                return (tempThis.card.shippers) ? tempThis.card.shippers.includes(e.id) : false;
              });
            });
            if (tempThis.isShipper()) {
              tempThis.card.preChemicalArray = [];
              tempThis.card.postChemicalArray = [];
              tempThis.card.tractorArray = [];
              tempThis.card.irrigationArray = [];
            } else {
              // Fix Datalist Display
              tempThis.card.tractorArray.forEach(e => {
                e.operator = tempThis.iDToDataListOption(e.operator, 'tractorOperators');
              });
              tempThis.card.irrigationArray.forEach(e => {
                e.irrigator = tempThis.iDToDataListOption(e.irrigator, 'irrigators');
              });
            }
          } else if (!data.success) {
            AlertService.newBasicAlert('Error: ' + data.error, true);
            tempThis.nav.goBack();
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
          tempThis.nav.goBack();
        }
      );
    });
  }

  public newChemical(): Chemical {
    return new Chemical();
  }

  public saveChanges(): void {
    // Validate
    if (!this.setCardCommentsForUpdate()) { return; }
    const card = this.validateAndFix((new Card()).copyConstructor(this.card));
    if (!card) { return; }

    // If Valid, continue
    const newAlert = new Alert();
    newAlert.color = 'warning';
    newAlert.title = 'Save Card';
    newAlert.message = 'This will save the card, overwriting what is in the database. This cannot be undone. Continue?';
    newAlert.actionName = 'Save';
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();

    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.cardEdit.updateCard(card).subscribe(data => {
          if (data.success) {
            AlertService.newBasicAlert('Change saved successfully!', false);
            this.loadCardData();
            if (this.editing) { this.toggleEditing(); }
            if (this.editingComment) { this.toggleEditingComment(); }
          } else {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        });
    });
    AlertService.newAlert(newAlert);
  }

  public saveComments(): void {
    if (!this.setCardCommentsForUpdate()) { return; }

    this.cardEdit.setCardComments(this.card.id, this.card.comments).subscribe(data => {
      if (data.success) {
        AlertService.newBasicAlert('Change saved successfully!', false);
        this.loadCardData();
        if (this.editing) { this.toggleEditing(); }
        if (this.editingComment) { this.toggleEditingComment(); }
      } else {
        console.log(data);
        AlertService.newBasicAlert('Error: ' + data.error, true);
      }
    },
    failure => {
      AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
    });
  }

  private setCardCommentsForUpdate(): boolean {
    let invalid = 0;
    const elevatedPerms = this.auth.hasPermission(PlRole.DATA_EDIT) || this.auth.hasPermission(PlRole.CONTRACTOR_EDIT);
    for (let i = 0; i < this.card.comments.length; i++) {
      const oldComment = this.card.comments[i];
      const newComment = this.comments[i];
      if (newComment.userName !== oldComment.userName) {
        AlertService.newBasicAlert('Error: The username of a comment was modified.', true);
        return false;
      }
      // If the comment was marked for deletion and the user doesn't have edit permissions
      if (newComment.deleted && !elevatedPerms) {
        // Only delete if it was their own comment
        if (newComment.userName !== this.auth.getUsername()) {
          this.comments[i] = oldComment;
          invalid++;
        } else {
          this.comments[i].lastModified = new Date().valueOf();
        }
      } else {
        // check if same data
        let same = oldComment.author === newComment.author;
        same = same && (oldComment.dateCreated === newComment.dateCreated);
        same = same && (oldComment.dateModified === newComment.dateModified);
        same = same && (oldComment.body === newComment.body);
        same = same && (oldComment.userName === newComment.userName);
        same = same && (oldComment.role === newComment.role);
        // if it has been modified, only accept if it is this user's comment
        if (!same) {
          if (newComment.userName !== this.auth.getUsername()) {
            this.comments[i] = oldComment;
            invalid++;
          } else {
            this.comments[i].lastModified = new Date().valueOf();
          }
        }
      }
    }
    if (invalid > 0) {
      AlertService.newBasicAlert(`${invalid} comments will not be changed due to invalid modifications`, true);
    }
    this.card.comments = this.comments.filter(c => !c.deleted);
    return true;
  }

  public showCommentTab(linkID: string, commentFilter: string): void {
    // Remove active class from tab links
    document.getElementById('all-comments-tab').classList.remove('active');
    document.getElementById('grower-comments-tab').classList.remove('active');
    document.getElementById('shipper-comments-tab').classList.remove('active');
    // Add active class to current tab link
    document.getElementById(linkID).classList.add('active');
    // Update comment filter
    this.commentsFilter = commentFilter;
  }

  public showCommentTabMobile(linkID: string, commentFilter: string): void {
    // Remove active class from tab links
    document.getElementById('all-comments-tab-m').classList.remove('active');
    document.getElementById('grower-comments-tab-m').classList.remove('active');
    document.getElementById('shipper-comments-tab-m').classList.remove('active');
    // Add active class to current tab link
    document.getElementById(linkID).classList.add('active');
    // Update comment filter
    this.commentsFilter = commentFilter;
  }

  public toggleCard(): void {
    const newAlert = new Alert();
    newAlert.color = 'primary';
    if (this.card.closed) {
      newAlert.title = 'Reopen Card';
      newAlert.message = 'This will reopen a closed card, allowing it to be edited again. Continue?';
      newAlert.actionName = 'Reopen';
    } else {
      newAlert.title = 'Set Card as Harvested';
      newAlert.message = 'This will mark the card as "Harvested", removing it from the "entry" tab. Continue?';
      newAlert.actionName = 'Close Card';
    }
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();
    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      this.cardEdit.setCardState(this.card.id, !this.card.closed).subscribe(data => {
          if (data.success) {
            this.card.closed = !this.card.closed;
            AlertService.newBasicAlert('Change saved successfully!', false);
          } else {
            AlertService.newBasicAlert('Error: ' + data.error, true);
          }
        },
        failure => {
          AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        });
    });

    AlertService.newAlert(newAlert);
  }

  public toggleEditing(): void {
    this.editing = !this.editing;
  }

  public toggleEditingComment(): void {
    this.editingComment = !this.editingComment;
  }

  private validateAndFix(cardRaw: Card): Card {
    try {
      const card = (new Card()).copyConstructor(cardRaw);
      // Check Ranch Info
      if (!card.ranchName || !(this[`ranches`].find(r => r.id === card.ranchName))) {
        AlertService.newBasicAlert('Invalid Ranch - please fix and try again.', true);
        return;
      }
      // Check Commodity Info
      for (const c of card.commodityArray) {
        if (!c.commodity || !this[`commodities`].find(c2 => {
          return c2.id === c.commodity && (c.variety) ? c2.value.value.includes(c.variety) : true;
        })) {
          AlertService.newBasicAlert('Invalid Commodity Information - please fix and try again.', true);
          return;
        }
        if (!c.bedType || !this[`bedTypes`].find(c2 => c2.id === c.bedType)) {
          AlertService.newBasicAlert('Invalid Commodity Bed Type - please fix and try again.', true);
          return;
        }
      }
      // Check Chemical / Fertilizer Info
      for (const c of card.preChemicalArray) {
        c.date = (new Date(c.date)).valueOf();
        if (c.chemical) {
          if (!c.chemical.name || !this[`chemicals`].find(c2 => c2.id === c.chemical.name)) {
            AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
            return;
          }
          if (!c.chemical.rate) {
            AlertService.newBasicAlert('Invalid Chemical Rate Entered - please fix and try again.', true);
            return;
          }
          if (!c.chemical.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.chemical.unit)) {
            AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
            return;
          }
        }
        if (c.fertilizer) {
          if (!c.fertilizer.name || !this[`fertilizers`].find(c2 => c2.id === c.fertilizer.name)) {
            AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
            return;
          }
          if (!c.fertilizer.rate) {
            AlertService.newBasicAlert('Invalid Chemical Rate Entered - please fix and try again.', true);
            return;
          }
          if (!c.fertilizer.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.fertilizer.unit)) {
            AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
            return;
          }
        }
        if (!c.chemical && !c.fertilizer) {
          AlertService.newBasicAlert('No Chemical or Fertilizer Entered - please fix and try again.', true);
          return;
        }
      }

      // Check Tractor Info
      for (const t of card.tractorArray) {
        t.workDate = (new Date(t.workDate)).valueOf();
        const operatorID = this.dataListOptionValueToID(t.operator, 'tractorOperators');
        if (!operatorID) {
          AlertService.newBasicAlert('Invalid Tractor Operator - please fix and try again.', true);
          return;
        }
        t.operator = operatorID;
        // Check Tractor Work
        if (!t.workDone || !this[`tractorWork`].find(tw => tw.id === t.workDone)) {
          AlertService.newBasicAlert('Invalid Tractor Work Entered - please fix and try again.', true);
          return;
        }
        // Check Chemical
        if (t.chemicalArray) {
          for (const c of t.chemicalArray) {
            if (!c.name || !this[`chemicals`].find(c2 => c2.id === c.name)) {
              AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
              return;
            }
            if (!c.rate) {
              AlertService.newBasicAlert('Invalid Chemical Rate Entered - please fix and try again.', true);
              return;
            }
            if (!c.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.unit)) {
              AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
              return;
            }
          }
        }
        // Check Fertilizer Info
        if (t.fertilizerArray) {
          for (const f of t.fertilizerArray) {
            if (!f.name || !this[`fertilizers`].find(c2 => c2.id === f.name)) {
              AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
              return;
            }
            if (!f.rate) {
              AlertService.newBasicAlert('Invalid Fertilizer Rate Entered - please fix and try again.', true);
              return;
            }
            if (!f.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === f.unit)) {
              AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
              return;
            }
          }
        }
      }
      // Check Irrigation Info
      for (const e of card.irrigationArray) {
        e.workDate = (new Date(e.workDate)).valueOf();
        // Check Chemical
        if (e.chemicalArray) {
          for (const c of e.chemicalArray) {
            if (!c.name || !this[`chemicals`].find(c2 => c2.id === c.name)) {
              AlertService.newBasicAlert('Invalid Chemical Entered - please fix and try again.', true);
              return;
            }
            if (!c.rate) {
              AlertService.newBasicAlert('Invalid Chemical Rate Entered - please fix and try again.', true);
              return;
            }
            if (!c.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === c.unit)) {
              AlertService.newBasicAlert('Invalid Chemical Rate Unit Entered - please fix and try again.', true);
              return;
            }
          }
        }
        // Check Fertilizer Info
        if (e.fertilizerArray) {
          for (const f of e.fertilizerArray) {
            if (!f.name || !this[`fertilizers`].find(c2 => c2.id === f.name)) {
              AlertService.newBasicAlert('Invalid Fertilizer Entered - please fix and try again.', true);
              return;
            }
            if (!f.rate) {
              AlertService.newBasicAlert('Invalid Fertilizer Rate Entered - please fix and try again.', true);
              return;
            }
            if (!f.unit || !this[`chemicalRateUnits`].find(c2 => c2.id === f.unit)) {
              AlertService.newBasicAlert('Invalid Fertilizer Rate Unit Entered - please fix and try again.', true);
              return;
            }
          }
        }
        if (e.irrigator) {
          const irrigatorID = this.dataListOptionValueToID(e.irrigator, 'irrigators');
          if (irrigatorID && !this[`irrigators`].find(e2 => e2.id === irrigatorID)) {
            AlertService.newBasicAlert('Invalid Irrigator - please fix and try again.', true);
            return;
          }
          e.irrigator = irrigatorID;
        }
        if (!e.method || !this[`irrigationMethod`].find(e2 => e2.id === e.method)) {
          AlertService.newBasicAlert('Invalid Irrigation Method Entered - please fix and try again.', true);
          return;
        }
      }

      // Replace Lot Number Whitespace
      card.lotNumber = card.lotNumber.replace(/\s/g, '');
      card.hoeDate = (this.card.hoeDate) ? (new Date(this.card.hoeDate)).valueOf() : null;
      card.harvestDate = (this.card.harvestDate) ? (new Date(this.card.harvestDate)).valueOf() : null;
      card.thinDate = (this.card.thinDate) ? (new Date(this.card.thinDate)).valueOf() : null;
      card.wetDate = (this.card.wetDate) ? (new Date(this.card.wetDate)).valueOf() : null;
      card.shippers = this.getSelectedShippers();
      return card;
    } catch (e) {
      console.log(e);
      AlertService.newBasicAlert('Error When Validating Card Data', true);
      return;
    }
  }
}
