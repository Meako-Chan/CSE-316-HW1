/**
 * Top5ListController.js
 * 
 * This file provides responses for all user interface interactions.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class Top5Controller {
    constructor() {

    }

    setModel(initModel) {
        this.model = initModel;
        this.initHandlers();
    }

    initHandlers() {
        // SETUP THE TOOLBAR BUTTON HANDLERS
        document.getElementById("add-list-button").onmousedown = (event) => {
            if (document.getElementById("add-list-button").disabled==false) { 
            let newList = this.model.addNewList("Untitled", ["?","?","?","?","?"]);            
            this.model.loadList(newList.id);
            this.model.saveLists();
        }
    }
        document.getElementById("undo-button").onmousedown = (event) => {
            this.model.undo();
        }
        document.getElementById("redo-button").onmousedown = (event) => {
            this.model.redo();
        }
        document.getElementById("close-button").onmousedown = (event) => {
            this.model.close();
            
        }

        // SETUP THE ITEM HANDLERS
        for (let i = 1; i <= 5; i++) {
            let item = document.getElementById("item-" + i);

            // AND FOR TEXT EDITING
            item.ondblclick = (ev) => {
                if (this.model.hasCurrentList()) {
                    // CLEAR THE TEXT
                    item.innerHTML = "";

                    // ADD A TEXT FIELD
                    let textInput = document.createElement("input");
                    textInput.setAttribute("type", "text");
                    textInput.setAttribute("id", "item-text-input-" + i);
                    textInput.setAttribute("value", this.model.currentList.getItemAt(i-1));

                    item.appendChild(textInput);

                    textInput.ondblclick = (event) => {
                        this.ignoreParentClick(event);
                    }
                    textInput.onkeydown = (event) => {
                        if (event.key === 'Enter') {
                            this.model.addChangeItemTransaction(i-1, event.target.value);
                          //  this.model.updateToolbarButtons();
                        }
                    }
                    textInput.onblur = (event) => {
                        this.model.restoreList();
                    }

                }
            }
                item.ondragstart = (event) =>{
                    event.dataTransfer.setData("id", event.target.id);
                  
                }
                item.ondrop = (event) =>{
                    event.preventDefault();
                    this.model.addDragItemTransaction(event.dataTransfer.getData("id").slice(5)-1, item.id.slice(5)-1);
                   
                }
                item.ondragover = (event) =>{
                    event.preventDefault();
                    
                }
            }
    }

    registerListSelectHandlers(id) {
        
        // FOR SELECTING THE LIST
        document.getElementById("top5-list-" + id).onmousedown = (event) => {
            this.model.unselectAll();
            // GET THE SELECTED LIST
            this.model.loadList(id);
         
        }
        let listCard = document.getElementById("top5-list-" + id); 
        listCard.ondblclick = (event) => {
            let listSpan = document.getElementById("list-card-text-" + id);
            let textInput = document.createElement("input");
            listSpan.innerHTML = "";
            textInput.setAttribute("type", "text");
            textInput.setAttribute("id", "list-card-text-textInput-" + id);
            textInput.setAttribute("value", this.model.getList(id).getName());
            listSpan.appendChild(textInput);
            textInput.ondblclick = (event) => {
                this.ignoreParentClick(event);
            }
             textInput.onblur = (event) => { 
                 this.model.top5Lists[id].setName(event.target.value);
                 this.model.sortLists();
                 this.model.saveLists();
                 this.model.updateStatusBar();
                 this.model.loadList( this.model.currentList.id);
               }
             textInput.onkeydown = (event) => {
                if (event.key === 'Enter') {
                    this.model.sortLists();
                    this.model.saveLists();
                    this.model.updateStatusBar();
                    this.model.loadList(this.model.currentList.id);
                 }
             } 
           
            
        }
        // FOR HOVERING THE LIST
        document.getElementById("top5-list-" + id).onmouseover = (event) => {
            // HIGHLIGHT THE HOVERED LIST
            this.model.hoverList(id);
        }
        // FOR UNHOVERING THE LIST
        document.getElementById("top5-list-" + id).onmouseout = (event) => {
            // UNHIGHLIGHT THE UNHOVERED LIST
            this.model.unhoverList(id);
        }


      
        // FOR DELETING THE LIST
        document.getElementById("delete-list-" + id).onmousedown = (event) => {
            this.ignoreParentClick(event);
            // VERIFY THAT THE USER REALLY WANTS TO DELETE THE LIST
            let modal = document.getElementById("delete-modal");
            this.listToDeleteIndex = id;
            let listName = this.model.getList(id).getName();
            let deleteSpan = document.getElementById("delete-list-span");
            deleteSpan.innerHTML = "";
            deleteSpan.appendChild(document.createTextNode(listName));
            modal.classList.add("is-visible");

            let confirm = document.getElementById("dialog-confirm-button");
            confirm.onclick = (event) => {
                this.model.deleteList(this.listToDeleteIndex);
                this.model.saveLists();
                modal.classList.remove("is-visible");
            }
            let cancel = document.getElementById("dialog-cancel-button");
            cancel.onclick = (event) => {
                modal.classList.remove("is-visible");
            }
        }
    }

    ignoreParentClick(event) {
        event.cancelBubble = true;
        if (event.stopPropagation) event.stopPropagation();
    }
}