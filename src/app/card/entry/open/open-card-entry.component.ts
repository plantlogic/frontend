import {Component, OnInit, ViewChildren, EventEmitter} from '@angular/core';
import {TitleService} from '../../../_interact/title.service';
import {Card} from '../../../_dto/card/card';
import {AlertService} from '../../../_interact/alert/alert.service';
import {CardEntryService} from '../../../_api/card-entry.service';
import {CollapseComponent} from 'angular-bootstrap-md';
import {NavService} from '../../../_interact/nav.service';
import {ActivatedRoute} from '@angular/router';
import { CommonFormDataService } from 'src/app/_api/common-form-data.service';
import { CommonLookup } from 'src/app/_api/common-data.service';
import { AuthService } from 'src/app/_auth/auth.service';
import { Alert } from 'src/app/_interact/alert/alert';
import { Comment } from 'src/app/_dto/card/comment';
import { PlRole } from 'src/app/_dto/user/pl-role.enum';

@Component({
  selector: 'app-open-card-entry',
  templateUrl: './open-card-entry.component.html',
  styleUrls: ['./open-card-entry.component.scss']
})
export class OpenCardEntryComponent implements OnInit {
  @ViewChildren(CollapseComponent) collapses: CollapseComponent[];

  constructor(private titleService: TitleService, private cardService: CardEntryService,
              private nav: NavService, private route: ActivatedRoute, private auth: AuthService,
              public common: CommonFormDataService) { }

  card: Card;
  // Additional values will be attached to comments, so use a separate variable
  comments = [];
  commentsFilter = 'all';
  datesSet: boolean;

  // create array of common keys, whose data is needed. Omit restricted options.
  commonKeys = ['bedTypes', 'chemicals', 'chemicalRateUnits', 'commodities',
  'fertilizers', 'irrigators', 'irrigationMethod', 'shippers', 'tractorOperators', 'tractorWork'];

  ngOnInit() {
    const tempThis = this;
    this.titleService.setTitle('View Card');
    this.initCommon((c) => {
      this.commonKeys.forEach((key) => {
        tempThis[`${key}`] = c[`${key}`];
      });
      this[`ranches`] = c[`ranches`];
      tempThis.route.params.subscribe((data) => tempThis.loadCardData(data.id));
    });
  }

  private addComment(): void {
    // DO SOMETHING DIFFERENT IF SHIPPER
    const c: Comment = new Comment();
    c.author = this.auth.getName();
    c.userName = this.auth.getUsername();
    c.body = '';
    c.dateCreated = new Date().valueOf();
    c.dateModified = c.dateCreated;
    if (this.auth.hasPermission(PlRole.DATA_ENTRY)) {
      c.role = 'grower';
    } else if (this.auth.hasPermission(PlRole.SHIPPER)) {
      c.role = 'shipper';
    } else {
      c.role = 'none';
    }
    this.comments.push(c);
  }

  public canEditComment(comment): boolean {
    return this.auth.getUsername() === comment.userName;
  }

  private cardIDsToValues(card: Card): Card {
    card.ranchName = this.findCommonValue('ranches', ['value'], card.ranchName);
    const shippers = [];
    if (card.shippers) {
      try {
        card.shippers.forEach((e) => {
          shippers.push(this.findCommonValue('shippers', ['value'], e));
        });
        card.shippers = shippers;
      } catch (e) {
        console.log(e);
      }
    }
    card.commodityArray.forEach((e) => {
      e.commodity = this.findCommonValue('commodities', ['value', 'key'], e.commodity);
      e.bedType = this.findCommonValue('bedTypes', ['value'], e.bedType);
    });
    card.preChemicalArray.forEach((e) => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.postChemicalArray.forEach((e) => {
      if (e.chemical) {
        e.chemical.name = this.findCommonValue('chemicals', ['value'], e.chemical.name);
        e.chemical.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.chemical.unit);
      }
      if (e.fertilizer) {
        e.fertilizer.name = this.findCommonValue('fertilizers', ['value'], e.fertilizer.name);
        e.fertilizer.unit = this.findCommonValue('chemicalRateUnits', ['value'], e.fertilizer.unit);
      }
    });
    card.tractorArray.forEach((e) => {
      e.workDone = this.findCommonValue('tractorWork', ['value'], e.workDone);
      e.operator = this.findCommonValue('tractorOperators', ['value'], e.operator);
      if (e.chemicalArray) {
        for (const c of e.chemicalArray) {
          c.name = this.findCommonValue('chemicals', ['value'], c.name);
          c.unit = this.findCommonValue('chemicalRateUnits', ['value'], c.unit);
        }
      }
      if (e.fertilizerArray) {
        for (const f of e.fertilizerArray) {
          f.name = this.findCommonValue('fertilizers', ['value'], f.name);
          f.unit = this.findCommonValue('chemicalRateUnits', ['value'], f.unit);
        }
      }
    });
    card.irrigationArray.forEach((e) => {
      e.method = this.findCommonValue('irrigationMethod', ['value'], e.method);
      e.irrigator = this.findCommonValue('irrigators', ['value'], e.irrigator);
      if (e.chemicalArray) {
        for (const c of e.chemicalArray) {
          c.name = this.findCommonValue('chemicals', ['value'], c.name);
          c.unit = this.findCommonValue('chemicalRateUnits', ['value'], c.unit);
        }
      }
      if (e.fertilizerArray) {
        for (const f of e.fertilizerArray) {
          f.name = this.findCommonValue('fertilizers', ['value'], f.name);
          f.unit = this.findCommonValue('chemicalRateUnits', ['value'], f.unit);
        }
      }
    });
    return card;
  }

  public collapseToggle(htmlId: string): void {
    const element = document.getElementById(htmlId);
    if (element) {element.classList.toggle('collapse'); }
  }

  public compareDates(a, b): number {
    let comparison = 0;
    const valA = a.date;
    const valB = b.date;
    if (valA > valB) {
      comparison = 1;
    } else if (valA < valB) {
      comparison = -1;
    }
    return comparison;
  }

  public deleteComment(index) {
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
        return;
      }
      index = fixedIndex;
    }
    const comment = this.comments[index];
    if (comment.userName !== this.auth.getUsername()) {
      AlertService.newBasicAlert('Cannot delete comments which aren\'t your own on the entry side', true);
      return false;
    } else {
      this.comments[index].deleted = true;
      return true;
    }
  }

  /*
    Searches common values in [`${key}`] list where value.id === targetID
    returns value.valuePropertyArr where valuePropertyArr = array of nesting properties
    returns null in no targetID supplied
    returns targetID if key is not in commonKeys Array (don't need value)
    returns generic message of targetID not found
  */
  findCommonValue(key, valuePropertyArr, targetID?) {
    if (!targetID) { return null; }
    if (!this.commonKeys.includes(key) && key !== 'ranches') { return targetID; }
    let commonValue = this.getCommon(key).find((e) => {
      return e.id === targetID;
    });
    try {
      valuePropertyArr.forEach(p => {
        commonValue = commonValue[p];
      });
    } catch (e) {
      console.log(e);
    }
    return (commonValue) ? commonValue : 'Unknown ' + key + ' ID';
  }

  public fixDate(d): Date {
    if (!d) { return; }
    const parts = d.split('-');
    const day = parts[2];
    const month = parts[1] - 1; // 0 based
    const year = parts[0];
    return new Date(year, month, day);
  }

  public getActiveComments(filter?: string) {
    if (filter) {
      return this.comments.filter((c) => !c.deleted && (c.role === filter)).length;
    }
    return this.comments.filter((c) => !c.deleted).length;
  }

  public getAllApplied() {
    /*
      Format of objects
      {
        date: number
        type: string
        chemicals: Array<Chemical>(),
        fertilizers: Array<Chemical>(),
      }
    */
    const allApplied = [];
    // Add pre plant dates and chems/ferts
    this.card.preChemicalArray.forEach((c) => {
      if (c.chemical || c.fertilizer) {
        allApplied.push({
          date: c.date,
          type: 'Pre-Plant',
          chemicals: (c.chemical) ? [c.chemical] : [],
          fertilizers: (c.fertilizer) ? [c.fertilizer] : []
        });
      }
    });
    // Add Tractor dates and chems/ferts
    this.card.tractorArray.forEach(t => {
      if (t.chemicalArray.length > 0 || t.fertilizerArray.length > 0) {
        allApplied.push({
          date: t.workDate,
          type: 'Tractor',
          chemicals: t.chemicalArray,
          fertilizers: t.fertilizerArray
        });
      }
    });
    // Add Irrigation dates and chems/ferts
    this.card.irrigationArray.forEach(i => {
      if (i.chemicalArray.length > 0 || i.fertilizerArray.length > 0) {
        allApplied.push({
          date: i.workDate,
          type: 'Irrigation',
          chemicals: i.chemicalArray,
          fertilizers: i.fertilizerArray
        });
      }
    });
    return allApplied.sort(this.compareDates);
  }

  public getComments() {
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

  public getCommon(key) {
    if (this.commonKeys.includes(key) || key === 'ranches') {
      return (this[`${key}`]) ? this[`${key}`] : [];
    } else {
      console.log('Key ' + key + ' is not in the commonKeys array.');
      return [];
    }
  }

  public getVarieties(commodityID) {
    try {
      const searchResult = this[`commodities`].find((e) => e.id === commodityID).value.value;
      return searchResult;
    } catch (e) {
      return [];
    }
  }

  public hasDateEntry() {
    return this.auth.hasPermission(PlRole.DATA_ENTRY);
  }

  public initCommon(f): void {
    const tempThis = this;
    const sortedCommon = {};
    const userRanchAccess = this.auth.getRanchAccess();
    this.common.getAllValues((data) => {
      this.commonKeys.forEach((key) => {
        if (CommonLookup[`${key}`].type === 'hashTable') {
          const temp = [];
          data[`${key}`].forEach((entry) => {
            temp.push({
              id: entry.id,
              value : {
                key : Object.keys(entry.value)[0],
                value: entry.value[Object.keys(entry.value)[0]]
              }
            });
          });
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(temp, key);
        } else {
          sortedCommon[`${key}`] = tempThis.common.sortCommonArray(data[`${key}`], key);
        }
      });
      sortedCommon[`ranches`] = data[`ranches`].filter((e) => userRanchAccess.includes(e.id));
      sortedCommon[`ranches`] = tempThis.common.sortCommonArray(sortedCommon[`ranches`], 'ranches');
      f(sortedCommon);
    });
  }

  public isCollapsed(htmlId: string): boolean {
    const element = document.getElementById(htmlId);
    if (element) {
      return element.classList.contains('collapse');
    } else {
      return true;
    }
  }

  private loadCardData(id: string) {
    this.cardService.getCardById(id).subscribe(
      data => {
        if (data.success) {
          this.card = (new Card()).copyConstructor(data.data);
          this.comments = (new Card()).copyConstructor(data.data).comments;
          // For display purposes, change any common IDs to their values
          this.card = this.cardIDsToValues(this.card);
          this.card.initShippersString();
          this.card.initCommodityString();
          this.card.initTotalAcres();
          this.datesSet = (this.card.wetDate || this.card.thinDate || this.card.hoeDate) ? true : false;
        } else if (!data.success) {
          AlertService.newBasicAlert('Error: ' + data.error, true);
          this.nav.goBack();
        }
      },
      failure => {
        AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
        this.nav.goBack();
      }
    );
  }

  private saveDates(): void {
    const newAlert = new Alert();
    newAlert.color = 'warning';
    newAlert.title = 'Confirm Dates';
    newAlert.message = 'This will save the hoe, thin, and wet dates. This can only be done once on the entry side. Continue?';
    newAlert.actionName = 'Confirm';
    newAlert.actionClosesAlert = true;
    newAlert.timeLeft = undefined;
    newAlert.blockPageInteraction = true;
    newAlert.closeName = 'Cancel';
    newAlert.action$ = new EventEmitter<null>();

    newAlert.subscribedAction$ = newAlert.action$.subscribe(() => {
      let changed = 0;
      if (this.card.wetDate) {
        this.card.wetDate = (new Date(this.card.wetDate)).valueOf();
        changed++;
      }
      if (this.card.thinDate) {
        this.card.thinDate = (new Date(this.card.thinDate)).valueOf();
        changed++;
      }
      if (this.card.hoeDate) {
        this.card.hoeDate = (new Date(this.card.hoeDate)).valueOf();
        changed++;
      }
      this.datesSet = true;
      if (changed > 0) {
        this.cardService.addWetThinHoeData(this.card.id, this.card).subscribe();
      }
    });
    AlertService.newAlert(newAlert);
  }

  public saveComments() {
    if (!this.setCardCommentsForUpdate()) { return; }

    this.cardService.setCardComments(this.card.id, this.card.comments).subscribe((data) => {
      if (data.success) {
        AlertService.newBasicAlert('Change saved successfully!', false);
        this.loadCardData(this.card.id);
      } else {
        console.log(data);
        AlertService.newBasicAlert('Error: ' + data.error, true);
      }
    },
    failure => {
      AlertService.newBasicAlert('Connection Error: ' + failure.message + ' (Try Again)', true);
    });
  }

  public setCardCommentsForUpdate() {
    let invalid = 0;
    for (let i = 0; i < this.card.comments.length; i++) {
      const oldComment = this.card.comments[i];
      const newComment = this.comments[i];
      if (newComment.userName !== oldComment.userName) {
        AlertService.newBasicAlert('Error: The username of a comment was modified.', true);
        return false;
      }
      // If the comment was marked for deletion and the user doesn't have edit permissions
      if (newComment.deleted) {
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
    this.card.comments = this.comments.filter((c) => !c.deleted);
    return true;
  }

  public showCommentTab(linkID, commentFilter) {
    // Remove active class from tab links
    document.getElementById('all-comments-tab').classList.remove('active');
    document.getElementById('grower-comments-tab').classList.remove('active');
    document.getElementById('shipper-comments-tab').classList.remove('active');
    // Add active class to current tab link
    document.getElementById(linkID).classList.add('active');
    // Update comment filter
    this.commentsFilter = commentFilter;
  }
}
