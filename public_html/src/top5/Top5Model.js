import jsTPS from "../common/jsTPS.js"
import Top5List from "./Top5List.js";
import ChangeItem_Transaction from "./transactions/ChangeItem_Transaction.js"
import MoveItem_Transaction from "./transactions/MoveItem_Transaction.js"

/**
 * Top5Model.js
 * 
 * This class provides access to all the data, meaning all of the lists. 
 * 
 * This class provides methods for changing data as well as access
 * to all the lists data.
 * 
 * Note that we are employing a Model-View-Controller (MVC) design strategy
 * here so that when data in this class changes it is immediately reflected
 * inside the view of the page.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Model {
    constructor() {
        // THIS WILL STORE ALL OF OUR LISTS
        this.top5Lists = [];

        // THIS IS THE LIST CURRENTLY BEING EDITED
        this.currentList = null;

        // THIS WILL MANAGE OUR TRANSACTIONS
        this.tps = new jsTPS();

        // WE'LL USE THIS TO ASSIGN ID NUMBERS TO EVERY LIST
        this.nextListId = 0;
    }

    getList(index) {
        return this.top5Lists[index];
    }

    getListIndex(id) {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            if (list.id === id) {
                return i;
            }
        }
        return -1;
    }

    setView(initView) {
        this.view = initView;
    }

    addNewList(initName, initItems) {
        let newList = new Top5List(this.nextListId++);
        if (initName)
            newList.setName(initName);
        if (initItems)
            newList.setItems(initItems);
        this.top5Lists.push(newList);
        this.sortLists();
        this.view.refreshLists(this.top5Lists);
        return newList;
    }
      deleteList(id) {
        let list = this.getList(id);
        if ( this.currentList &&(this.currentList.id == id)){
            this.view.clearWorkspace(); 
            this.updateStatusBar();
            this.view.enableButton("add-list-button");
            document.getElementById("add-list-button").disabled = false;
        } 
        console.log(list);
        this.top5Lists.splice(id,1);
        console.log(this.top5Lists);
        this.sortLists();   
        this.view.refreshLists(this.top5Lists);
        this.view.clearWorkspace();
        
    }
    sortLists() {
        this.top5Lists.sort((listA, listB) => {
            if (listA.getName() < listB.getName()) {
                return -1;
            }
            else if (listA.getName === listB.getName()) {
                return 0;
            }
            else {
                return 1;
            }
        });
        for(let i=0; i < this.top5Lists.length;i++){
            this.top5Lists[i].id = i;   
        }
        this.view.refreshLists(this.top5Lists);
    }

    hasCurrentList() {
        return this.currentList !== null;
    }

    unselectAll() {
        for (let i = 0; i < this.top5Lists.length; i++) {
            let list = this.top5Lists[i];
            this.view.unhighlightList(i);
        }
        this.view.enableButton("add-list-button");
        document.getElementById("add-list-button").disabled = false;
    }
    hoverList(id) {
        let list = null; 
        let found = false;
        let i = 0;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id && list.id != this.currentList.id) {
                this.view.highlightHoveredList(i);
                found = true;
            }
            i++;
        }
        
    }

    unhoverList(id) {
        let list = null; 
        let found = false;
        let i = 0;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                this.view.unhighlightHoveredList(i);                
                found = true;
            }
            i++;
        }
    }

    loadList(id) {
        let list = null;
        let found = false;
        let i = 0;
        while ((i < this.top5Lists.length) && !found) {
            list = this.top5Lists[i];
            if (list.id === id) {
                // THIS IS THE LIST TO LOAD
                this.currentList = list;
                this.view.update(this.currentList);
                this.view.highlightList(i);
                found = true;
            }
            i++;
        }
        this.updateStatusBar();
        this.tps.clearAllTransactions();
        this.view.updateToolbarButtons(this);

        console.log("disable add button");
        this.view.disableButton("add-list-button");
        document.getElementById("add-list-button").disabled = true;
        this.view.enableButton("close-button");
    }

    loadLists() {
        // CHECK TO SEE IF THERE IS DATA IN LOCAL STORAGE FOR THIS APP
        this.view.updateToolbarButtons(this);
        let recentLists = localStorage.getItem("recent_work");
        if (!recentLists) {
            return false;
        }
        else {
            let listsJSON = JSON.parse(recentLists);
            this.top5Lists = [];
            for (let i = 0; i < listsJSON.length; i++) {
                let listData = listsJSON[i];
                let items = [];
                for (let j = 0; j < listData.items.length; j++) {
                    items[j] = listData.items[j];
                }
                this.addNewList(listData.name, items);
            }
            this.sortLists();   
            this.view.refreshLists(this.top5Lists);
            this.view.updateToolbarButtons(this);
              if(this.currentList == null){
                 this.view.disableButton("close-button");
             }
            return true;
        }        
    }

    saveLists() {
        let top5ListsString = JSON.stringify(this.top5Lists);
        localStorage.setItem("recent_work", top5ListsString);
    }

    restoreList() {
        this.view.update(this.currentList);
    }

    addChangeItemTransaction = (id, newText) => {
        // GET THE CURRENT TEXT
        let oldText = this.currentList.items[id];
        let transaction = new ChangeItem_Transaction(this, id, oldText, newText);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
    }
    addDragItemTransaction = (oldIndex,newIndex) => {
        // Get text
        let transaction = new MoveItem_Transaction(this, oldIndex, newIndex);
        this.tps.addTransaction(transaction);
        this.view.updateToolbarButtons(this);
        
    }
    changeItem(id, text) {
        this.currentList.items[id] = text;
        this.view.update(this.currentList);
        this.saveLists();
    }
    updateStatusBar(){
        let statusBar = document.getElementById("top5-statusbar");
        if (this.currentList){
            statusBar.style.backgroundColor = "#faa07a"; // change color when selected list
            statusBar.textContent = "Top 5 "+this.currentList.getName(); // get name of selected list
        }
        else {
            statusBar.style.backgroundColor = "#faa07a"; // "#e6e6e6" default color
            statusBar.textContent = "";
        }
    }
    close(){
        // let id = this.currentList.id
        this.unselectAll(); // unselected current list
        this.currentList = null; // closing current list
        this.view.clearWorkspace(); // clear items
        this.updateStatusBar(); // make status bar empty again
        this.saveLists(); //implement later
        this.view.disableButton("close-button");
        this.view.disableButton("undo-button");
        this.view.disableButton("redo-button");

    }
    moveItem(oldIndex, newIndex){
        this.currentList.moveItem(oldIndex, newIndex);
        this.view.update(this.currentList);
        this.saveLists();
    }

    // SIMPLE f/REDO FUNCTIONS
    undo() {
        if (this.tps.hasTransactionToUndo()) {
            this.tps.undoTransaction();
            this.view.updateToolbarButtons(this);
        }
    
    }
    redo() {
        if (this.tps.hasTransactionToRedo()) {
            this.tps.redoTransaction();
            this.view.updateToolbarButtons(this);
        }
    
    }
    
}