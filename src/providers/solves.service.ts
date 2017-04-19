import {Injectable} from "@angular/core";
import * as PouchDB from "pouchdb";
import cordovaSqlitePlugin from "pouchdb-adapter-cordova-sqlite";
import {Observable} from "rxjs/Rx";
import {Platform} from "ionic-angular";

@Injectable()
export class SolvesService {

  private db;
  private solves: Array<Solve>;

  constructor(private platform: Platform) {
  }

  initDB() {
    PouchDB.plugin(cordovaSqlitePlugin);
    if (this.platform.is('cordova')) {
      this.db = new PouchDB('solves.db', {adapter: 'cordova-sqlite'});
    } else {
      this.db = new PouchDB('solves.db');
    }
  }

  add(solve: Solve) {
    return this.db.post(solve);
  }

  getAll(): Observable<Array<Solve>> {
    if (!this.solves) {
      return this.db.allDocs({include_docs: true})
        .then(docs => {

          this.solves = docs.rows.map(row => {
            return row.doc;
          });

          // Listen for changes on the database.
          this.db.changes({live: true, since: 'now', include_docs: true})
            .on('change', this.onDatabaseChange);

          return Observable.of(this.db);
        });
    } else {
      // Return cached data
      return Observable.of(this.db);
    }
  }

  private onDatabaseChange = (change) => {
    let index = this.findIndex(this.solves, change.id);
    let solve = this.solves[index];

    if (change.deleted) {
      if (solve) {
        this.solves.splice(index, 1); // delete
      }
    } else {
      if (solve && solve._id === change.id) {
        this.solves[index] = change.doc; // update
      } else {
        this.solves.splice(index, 0, change.doc) // insert
      }
    }
  };

// Binary search, the array is by default sorted by _id.
  private findIndex(array, id) {
    let low = 0, high = array.length, mid;
    while (low < high) {
      mid = (low + high) >>> 1;
      array[mid]._id < id ? low = mid + 1 : high = mid
    }
    return low;
  }


}

export class Solve {
  _id: string;
  time: number;
  timestamp: number;
  scramble: string;

  constructor(time: number, timestamp: number, scramble: string) {
    this._id = "";
    this.time = time;
    this.timestamp = timestamp;
    this.scramble = scramble;
  }
}
